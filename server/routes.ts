import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PaymentHistory, Invoice, Refund, PaymentReminder, VideoProgress, LiveSession } from "./models";
import { hashPassword, comparePassword, validateEmail, validatePassword } from "./utils/auth";
import { generateAccessToken, generateRefreshToken } from "./utils/jwt";
import { authenticateToken, requireAdmin, requireRole, optionalAuth, requireOwnershipOrAdmin } from "./middleware/auth";
import { exportUserData } from "./utils/data-export";
import { emailService } from "./utils/email";
import crypto from "crypto";

const resetTokens = new Map<string, { email: string; expiry: Date }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create client in Client collection
      const packages = await storage.getAllPackages();
      const basicPackage = packages.find(p => p.name === 'Basic');
      
      const client = await storage.createClient({
        name,
        phone: phone || '',
        email: email.toLowerCase(),
        packageId: basicPackage?._id?.toString(),
      });
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'client',
        name,
        phone,
        clientId: client._id?.toString(),
      });
      
      // Send welcome email (async, don't wait for it)
      emailService.sendWelcomeEmail(email.toLowerCase(), name, user._id?.toString()).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        message: "User created successfully",
        user: userWithoutPassword,
        clientId: client._id?.toString(),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Get client data if user is a client
      let client = null;
      if (user.role === 'client' && user.clientId) {
        client = await storage.getClient(user.clientId.toString());
      }
      
      // Generate JWT tokens
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        clientId: user.clientId?.toString(),
      };
      
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      
      // Set HTTP-only cookies for security
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        client: client,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: "Logged out successfully" });
  });
  
  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const normalizedEmail = email.toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.json({ 
          message: "If an account exists with this email, a password reset link has been sent" 
        });
      }
      
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      resetTokens.set(resetToken, { email: user.email, expiry });
      
      setTimeout(() => resetTokens.delete(resetToken), 60 * 60 * 1000);
      
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.name || 'User');
      
      res.json({ 
        message: "If an account exists with this email, a password reset link has been sent" 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      const tokenData = resetTokens.get(token);
      if (!tokenData || tokenData.expiry < new Date()) {
        if (tokenData) resetTokens.delete(token);
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      const user = await storage.getUserByEmail(tokenData.email);
      if (!user) {
        resetTokens.delete(token);
        return res.status(404).json({ message: "User not found" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user._id.toString(), { password: hashedPassword });
      
      resetTokens.delete(token);
      
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Direct password reset (NO EMAIL/TOKEN REQUIRED)
  app.post("/api/auth/reset-password-direct", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      const normalizedEmail = email.toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user._id.toString(), { password: hashedPassword });
      
      res.json({ 
        message: "Password reset successfully. You can now login with your new password." 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get current authenticated user
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get client data if user is a client
      let client = null;
      if (user.role === 'client' && user.clientId) {
        client = await storage.getClient(user.clientId.toString());
      }
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        user: userWithoutPassword,
        client: client,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin route to create user account for existing client
  app.post("/api/admin/create-client-user", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { clientId, email, password } = req.body;
      
      // Validate input
      if (!clientId || !email || !password) {
        return res.status(400).json({ message: "Client ID, email, and password are required" });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user already exists for this email
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password and create user account
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'client',
        name: client.name,
        phone: client.phone || '',
        clientId: clientId,
      });
      
      // Update client with email if not set
      if (!client.email || client.email !== email.toLowerCase()) {
        await storage.updateClient(clientId, { email: email.toLowerCase() });
      }
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json({
        message: "User account created successfully for client",
        user: userWithoutPassword,
        client: client,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin route to create trainer credentials (protected)
  app.post("/api/admin/trainers", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      
      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }
      
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password and create trainer user
      const hashedPassword = await hashPassword(password);
      const trainer = await storage.createUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'trainer',
        name,
        phone: phone || '',
      });
      
      // Return trainer data without password
      const { password: _, ...trainerWithoutPassword } = trainer.toObject();
      res.json({
        message: "Trainer created successfully",
        trainer: trainerWithoutPassword,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all trainers (admin only - protected)
  app.get("/api/admin/trainers", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
      // Remove passwords from response
      const trainersWithoutPasswords = trainers.map(trainer => {
        const { password: _, ...trainerWithoutPassword } = trainer.toObject();
        return trainerWithoutPassword;
      });
      res.json(trainersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete trainer (admin only - protected)
  app.delete("/api/admin/trainers/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json({ message: "Trainer deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Initialize default packages if none exist
  app.post("/api/init", async (_req, res) => {
    try {
      const existingPackages = await storage.getAllPackages();
      if (existingPackages.length === 0) {
        const defaultPackages = [
          {
            name: "Basic",
            description: "Perfect for beginners",
            price: 29.99,
            features: ["Access to gym equipment", "Basic workout plans"],
            videoAccess: false,
            liveSessionsPerMonth: 0,
            dietPlanAccess: false,
            workoutPlanAccess: true,
          },
          {
            name: "Premium",
            description: "Most popular choice",
            price: 59.99,
            features: ["All Basic features", "Video library access", "Diet plans", "2 live sessions/month"],
            videoAccess: true,
            liveSessionsPerMonth: 2,
            dietPlanAccess: true,
            workoutPlanAccess: true,
          },
          {
            name: "Elite",
            description: "Complete fitness solution",
            price: 99.99,
            features: ["All Premium features", "Unlimited live sessions", "Personal trainer support", "Priority support"],
            videoAccess: true,
            liveSessionsPerMonth: 999,
            dietPlanAccess: true,
            workoutPlanAccess: true,
          },
        ];
        
        for (const pkg of defaultPackages) {
          await storage.createPackage(pkg);
        }
        
        // Initialize default users (admin and client)
        await storage.initializeDefaultUsers();
        
        res.json({ message: "Default packages and users created successfully", count: defaultPackages.length });
      } else {
        res.json({ message: "Packages already exist", count: existingPackages.length });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Package routes
  app.get("/api/packages", async (_req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create package (admin only - protected)
  app.post("/api/packages", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.createPackage(req.body);
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update package (admin only - protected)
  app.patch("/api/packages/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pkg = await storage.updatePackage(req.params.id, req.body);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Client routes (admin only - protected)
  app.get("/api/clients", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get client by phone (admin only - protected)
  app.get("/api/clients/phone/:phone", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const client = await storage.getClientByPhone(req.params.phone);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get client by ID (owner or admin - protected)
  app.get("/api/clients/:id", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create client (admin only - protected)
  app.post("/api/clients", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update client (owner or admin - protected)
  app.patch("/api/clients/:id", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete client (admin only - protected)
  app.delete("/api/clients/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Client Management routes (all protected)
  app.get("/api/admin/clients/search", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { query, status, packageId, sortBy } = req.query;
      const clients = await storage.getAllClients();
      
      let filtered = clients;
      
      if (query) {
        const searchQuery = query.toString().toLowerCase();
        filtered = filtered.filter(client => 
          client.name.toLowerCase().includes(searchQuery) ||
          client.phone.includes(searchQuery) ||
          (client.email && client.email.toLowerCase().includes(searchQuery))
        );
      }
      
      if (status) {
        filtered = filtered.filter(client => client.status === status);
      }
      
      if (packageId) {
        filtered = filtered.filter(client => client.packageId?.toString() === packageId);
      }
      
      if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'joinDate') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'lastActivity') {
        filtered.sort((a, b) => {
          const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
          const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
          return dateB - dateA;
        });
      }
      
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/clients/:id/activity", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const clientId = req.params.id;
      
      const workoutSessions = await storage.getClientWorkoutSessions(clientId);
      const liveSessions = await storage.getClientSessions(clientId);
      const workoutPlans = await storage.getClientWorkoutPlans(clientId);
      const dietPlans = await storage.getClientDietPlans(clientId);
      
      const activity = {
        totalWorkouts: workoutSessions.length,
        totalLiveSessions: liveSessions.length,
        assignedWorkoutPlans: workoutPlans.length,
        assignedDietPlans: dietPlans.length,
        recentWorkouts: workoutSessions.slice(0, 10),
        recentSessions: liveSessions.slice(0, 5),
      };
      
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/clients/bulk-update", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { clientIds, updates } = req.body;
      
      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return res.status(400).json({ message: "Client IDs are required" });
      }
      
      const updatedClients = [];
      for (const clientId of clientIds) {
        const client = await storage.updateClient(clientId, updates);
        if (client) {
          updatedClients.push(client);
        }
      }
      
      res.json({ 
        success: true, 
        updated: updatedClients.length,
        clients: updatedClients 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/clients/bulk-assign-plan", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { clientIds, planType, planId } = req.body;
      
      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return res.status(400).json({ message: "Client IDs are required" });
      }
      
      if (planType === 'workout') {
        const plan = await storage.getWorkoutPlan(planId);
        if (!plan) {
          return res.status(404).json({ message: "Workout plan not found" });
        }
        
        const assignments = [];
        for (const clientId of clientIds) {
          const newPlan = await storage.createWorkoutPlan({
            clientId,
            name: plan.name,
            description: plan.description,
            goal: plan.goal,
            durationWeeks: plan.durationWeeks,
            exercises: plan.exercises,
          });
          assignments.push(newPlan);
        }
        
        res.json({ success: true, assignments: assignments.length });
      } else if (planType === 'diet') {
        const plan = await storage.getDietPlan(planId);
        if (!plan) {
          return res.status(404).json({ message: "Diet plan not found" });
        }
        
        const assignments = [];
        for (const clientId of clientIds) {
          const newPlan = await storage.createDietPlan({
            clientId,
            name: plan.name,
            targetCalories: plan.targetCalories,
            protein: plan.protein,
            carbs: plan.carbs,
            fats: plan.fats,
            meals: plan.meals,
          });
          assignments.push(newPlan);
        }
        
        res.json({ success: true, assignments: assignments.length });
      } else {
        res.status(400).json({ message: "Invalid plan type" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/clients/export", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      const packages = await storage.getAllPackages();
      
      const packageMap = packages.reduce((map, pkg) => {
        map[String(pkg._id)] = pkg.name;
        return map;
      }, {} as Record<string, string>);
      
      const csvHeader = 'ID,Name,Phone,Email,Package,Status,Join Date,Last Activity\n';
      const csvRows = clients.map(client => {
        let packageId: string | null = null;
        if (client.packageId) {
          if (typeof client.packageId === 'object' && '_id' in client.packageId) {
            packageId = String((client.packageId as any)._id);
          } else {
            packageId = String(client.packageId);
          }
        }
        const packageName = packageId ? packageMap[packageId] || '' : '';
        
        return [
          client._id,
          client.name,
          client.phone,
          client.email || '',
          packageName,
          client.status || 'active',
          new Date(client.createdAt).toLocaleDateString(),
          client.lastActivityDate ? new Date(client.lastActivityDate).toLocaleDateString() : 'Never',
        ].map(field => `"${field}"`).join(',');
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment History routes (owner or admin - protected)
  app.get("/api/payment-history/:clientId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const payments = await storage.getClientPaymentHistory(req.params.clientId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create payment record (admin only - protected)
  app.post("/api/payment-history", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const payment = await storage.createPaymentRecord(req.body);
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all payments with filtering (admin only - protected)
  app.get("/api/payments", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, startDate, endDate, packageId } = req.query;
      const query: any = {};
      
      if (status) query.status = status;
      if (packageId) query.packageId = packageId;
      if (startDate || endDate) {
        query.billingDate = {};
        if (startDate) query.billingDate.$gte = new Date(startDate as string);
        if (endDate) query.billingDate.$lte = new Date(endDate as string);
      }

      const payments = await PaymentHistory.find(query)
        .populate('clientId', 'name phone email')
        .populate('packageId', 'name price')
        .sort({ billingDate: -1 });
      
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get payment statistics (admin only - protected)
  app.get("/api/payments/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const dateFilter: any = {};
      
      if (startDate || endDate) {
        if (startDate) dateFilter.$gte = new Date(startDate as string);
        if (endDate) dateFilter.$lte = new Date(endDate as string);
      } else {
        const now = new Date();
        dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter.$lte = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      const payments = await PaymentHistory.find({ billingDate: dateFilter });
      
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const pendingPayments = payments.filter(p => p.status === 'pending');
      const overduePayments = payments.filter(p => p.status === 'overdue');
      const completedPayments = payments.filter(p => p.status === 'completed');
      
      const paymentsDue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentsOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

      const lastMonthStart = new Date(new Date().setMonth(new Date().getMonth() - 1));
      const lastMonthPayments = await PaymentHistory.find({
        billingDate: { $gte: lastMonthStart, $lt: dateFilter.$gte },
        status: 'completed'
      });
      
      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const growthRate = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      res.json({
        totalRevenue,
        paymentsDue,
        paymentsOverdue,
        pendingCount: pendingPayments.length,
        overdueCount: overduePayments.length,
        completedCount: completedPayments.length,
        growthRate: Math.round(growthRate * 10) / 10,
        lastMonthRevenue
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get monthly revenue trends (admin only - protected)
  app.get("/api/payments/monthly-trends", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { months = 6 } = req.query;
      const trends = [];
      
      for (let i = parseInt(months as string) - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const payments = await PaymentHistory.find({
          billingDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'completed'
        });
        
        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const clientIds = new Set(payments.map(p => String(p.clientId)));
        
        trends.push({
          month: startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          clientCount: clientIds.size,
          paymentCount: payments.length
        });
      }
      
      res.json(trends);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invoice routes (admin only - protected)
  app.get("/api/invoices", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, clientId } = req.query;
      const query: any = {};
      
      if (status) query.status = status;
      if (clientId) query.clientId = clientId;

      const invoices = await Invoice.find(query)
        .populate('clientId', 'name phone email')
        .populate('packageId', 'name price')
        .sort({ issueDate: -1 });
      
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create invoice (admin only - protected)
  app.post("/api/invoices", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const invoiceCount = await Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
      
      const invoiceData = {
        ...req.body,
        invoiceNumber,
        status: 'draft',
        issueDate: req.body.issueDate || new Date(),
      };
      
      const invoice = new Invoice(invoiceData);
      await invoice.save();
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update invoice (admin only - protected)
  app.patch("/api/invoices/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const invoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send invoice (admin only - protected)
  app.post("/api/invoices/:id/send", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate('clientId', 'name email')
        .populate('packageId', 'name');
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const client = invoice.clientId as any;
      if (!client || !client.email) {
        return res.status(400).json({ message: "Client email not found" });
      }
      
      const emailSent = await emailService.sendInvoiceEmail(
        client.email,
        client.name,
        invoice.invoiceNumber,
        invoice.total,
        invoice.dueDate,
        client._id?.toString()
      );
      
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        { 
          status: emailSent ? 'sent' : 'failed',
          sentAt: emailSent ? new Date() : undefined,
          sentToEmail: client.email,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      res.json({
        ...updatedInvoice?.toObject(),
        emailSent,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Refund routes (admin only - protected)
  app.get("/api/refunds", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, clientId } = req.query;
      const query: any = {};
      
      if (status) query.status = status;
      if (clientId) query.clientId = clientId;

      const refunds = await Refund.find(query)
        .populate('clientId', 'name phone email')
        .populate('paymentId')
        .sort({ requestedAt: -1 });
      
      res.json(refunds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create refund (admin only - protected)
  app.post("/api/refunds", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const refund = new Refund(req.body);
      await refund.save();
      
      if (req.body.processImmediately) {
        await PaymentHistory.findByIdAndUpdate(
          req.body.paymentId,
          { 
            status: 'refunded',
            refundId: refund._id,
            updatedAt: new Date()
          }
        );
      }
      
      res.json(refund);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update refund (admin only - protected)
  app.patch("/api/refunds/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const refund = await Refund.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      
      if (req.body.status === 'processed' && refund) {
        await PaymentHistory.findByIdAndUpdate(
          refund.paymentId,
          { 
            status: 'refunded',
            refundId: refund._id,
            updatedAt: new Date()
          }
        );
      }
      
      res.json(refund);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment reminder routes (admin only - protected)
  app.post("/api/payment-reminders", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const reminder = new PaymentReminder(req.body);
      await reminder.save();
      res.json(reminder);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get pending payment reminders (admin only - protected)
  app.get("/api/payment-reminders/pending", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const reminders = await PaymentReminder.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      })
        .populate('clientId', 'name phone email')
        .populate('invoiceId');
      
      res.json(reminders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Body Metrics routes (owner or admin only - sensitive health data)
  app.get("/api/body-metrics/:clientId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const metrics = await storage.getClientBodyMetrics(req.params.clientId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get latest body metrics (owner or admin only)
  app.get("/api/body-metrics/:clientId/latest", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const metrics = await storage.getLatestBodyMetrics(req.params.clientId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create body metrics (owner or admin only - validates ownership via clientId in body)
  app.post("/api/body-metrics", authenticateToken, async (req, res) => {
    // Check ownership before creating
    if (req.user?.role !== 'admin' && req.user?.clientId?.toString() !== req.body.clientId) {
      return res.status(403).json({ message: 'Access denied. You can only create your own data.' });
    }
    try {
      const metrics = await storage.createBodyMetrics(req.body);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calculate body metrics (BMI, BMR, TDEE, etc.)
  app.post("/api/calculate-metrics", async (req, res) => {
    try {
      const { weight, height, age, gender, activityLevel, goal } = req.body;
      
      const heightInM = height / 100;
      const bmi = weight / (heightInM * heightInM);
      
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
      };
      
      const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
      
      let idealWeight;
      if (gender === 'male') {
        idealWeight = 50 + 0.91 * (height - 152.4);
      } else {
        idealWeight = 45.5 + 0.91 * (height - 152.4);
      }
      
      let targetCalories = tdee;
      if (goal === 'lose') {
        targetCalories = tdee - 500;
      } else if (goal === 'gain') {
        targetCalories = tdee + 300;
      }
      
      res.json({
        bmi: parseFloat(bmi.toFixed(2)),
        bmr: parseFloat(bmr.toFixed(2)),
        tdee: parseFloat(tdee.toFixed(2)),
        idealWeight: parseFloat(idealWeight.toFixed(2)),
        targetCalories: parseFloat(targetCalories.toFixed(2))
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video routes
  app.get("/api/videos", async (_req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const video = await storage.createVideo(req.body);
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.updateVideo(req.params.id, req.body);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const success = await storage.deleteVideo(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Client Video routes (owner or admin only)
  app.get("/api/clients/:clientId/videos", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const videos = await storage.getClientVideos(req.params.clientId);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assign video to client (admin only - protected)
  app.post("/api/clients/:clientId/videos/:videoId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const assignment = await storage.assignVideoToClient(req.params.clientId, req.params.videoId);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Remove video from client (admin only - protected)
  app.delete("/api/clients/:clientId/videos/:videoId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.removeVideoFromClient(req.params.clientId, req.params.videoId);
      if (!success) {
        return res.status(404).json({ message: "Video assignment not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video Search and Filtering
  app.post("/api/videos/search", async (req, res) => {
    try {
      const { category, duration, intensity, difficulty, trainer, search, isDraft } = req.body;
      const videos = await storage.searchVideos({
        category,
        duration,
        intensity,
        difficulty,
        trainer,
        search,
        isDraft,
      });
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video Analytics routes
  app.post("/api/videos/:id/increment-views", async (req, res) => {
    try {
      await storage.incrementVideoViews(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/videos/:id/increment-completions", async (req, res) => {
    try {
      await storage.incrementVideoCompletions(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video Progress routes (Continue Watching) - owner or admin only
  app.get("/api/clients/:clientId/video-progress/:videoId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const progress = await storage.getVideoProgress(req.params.clientId, req.params.videoId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update video progress (owner or admin only)
  app.post("/api/clients/:clientId/video-progress/:videoId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const { watchedDuration, totalDuration } = req.body;
      
      // Check if this is the first time watching (increment views)
      const existingProgress = await storage.getVideoProgress(req.params.clientId, req.params.videoId);
      if (!existingProgress || existingProgress.watchedDuration === 0) {
        await storage.incrementVideoViews(req.params.videoId);
      }
      
      const progress = await storage.updateVideoProgress(
        req.params.clientId,
        req.params.videoId,
        watchedDuration,
        totalDuration
      );
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get continue watching videos (owner or admin only)
  app.get("/api/clients/:clientId/continue-watching", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const videos = await storage.getContinueWatching(req.params.clientId);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video Bookmark routes (owner or admin only)
  app.get("/api/clients/:clientId/bookmarks", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const bookmarks = await storage.getVideoBookmarks(req.params.clientId);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create bookmark (owner or admin only)
  app.post("/api/clients/:clientId/bookmarks/:videoId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const bookmark = await storage.createVideoBookmark(req.params.clientId, req.params.videoId);
      res.json(bookmark);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete bookmark (owner or admin only)
  app.delete("/api/clients/:clientId/bookmarks/:videoId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const success = await storage.deleteVideoBookmark(req.params.clientId, req.params.videoId);
      if (!success) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Check if video is bookmarked (owner or admin only)
  app.get("/api/clients/:clientId/bookmarks/:videoId/check", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const isBookmarked = await storage.isVideoBookmarked(req.params.clientId, req.params.videoId);
      res.json({ isBookmarked });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Photo routes (owner or admin only)
  app.get("/api/clients/:clientId/progress-photos", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const photos = await storage.getProgressPhotos(req.params.clientId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create progress photo (owner or admin only)
  app.post("/api/clients/:clientId/progress-photos", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const { photoUrl, description, weight } = req.body;
      const photo = await storage.createProgressPhoto({
        clientId: req.params.clientId,
        photoUrl,
        description,
        weight,
      });
      res.json(photo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete progress photo (owner or admin only)
  app.delete("/api/clients/:clientId/progress-photos/:photoId", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProgressPhoto(req.params.clientId, req.params.photoId);
      if (!success) {
        return res.status(404).json({ message: "Progress photo not found or access denied" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Workout Plan routes
  app.get("/api/workout-plans/:clientId", async (req, res) => {
    try {
      const plans = await storage.getClientWorkoutPlans(req.params.clientId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/workout-plans/plan/:id", async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/workout-plans", async (req, res) => {
    try {
      const plan = await storage.createWorkoutPlan(req.body);
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/workout-plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateWorkoutPlan(req.params.id, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/workout-plans/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkoutPlan(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Diet Plan routes
  app.get("/api/diet-plans/:clientId", async (req, res) => {
    try {
      const plans = await storage.getClientDietPlans(req.params.clientId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/diet-plans/plan/:id", async (req, res) => {
    try {
      const plan = await storage.getDietPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/diet-plans", async (req, res) => {
    try {
      const plan = await storage.createDietPlan(req.body);
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/diet-plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateDietPlan(req.params.id, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/diet-plans/:id", async (req, res) => {
    try {
      const success = await storage.deleteDietPlan(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Diet plan not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Diet Plan Template routes
  app.get("/api/diet-plan-templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await storage.getDietPlanTemplates(category);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/diet-plans/:id/clone", async (req, res) => {
    try {
      const { clientId } = req.body;
      const clonedPlan = await storage.cloneDietPlan(req.params.id, clientId);
      res.json(clonedPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/diet-plans-with-assignments", async (_req, res) => {
    try {
      const plans = await storage.getAllDietPlansWithAssignments();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Meal routes
  app.get("/api/meals", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        mealType: req.query.mealType as string | undefined,
        search: req.query.search as string | undefined,
      };
      const meals = await storage.getAllMeals(filters);
      res.json(meals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/meals/:id", async (req, res) => {
    try {
      const meal = await storage.getMeal(req.params.id);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const meal = await storage.createMeal(req.body);
      res.json(meal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/meals/:id", async (req, res) => {
    try {
      const meal = await storage.updateMeal(req.params.id, req.body);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      const success = await storage.deleteMeal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Live Session routes
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sessions/client/:clientId", async (req, res) => {
    try {
      const sessions = await storage.getClientSessions(req.params.clientId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const session = await storage.createSession(req.body);
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const success = await storage.deleteSession(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Session Client routes
  app.post("/api/sessions/:sessionId/clients/:clientId", async (req, res) => {
    try {
      const assignment = await storage.assignClientToSession(req.params.sessionId, req.params.clientId);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/sessions/:sessionId/clients/:clientId", async (req, res) => {
    try {
      const success = await storage.removeClientFromSession(req.params.sessionId, req.params.clientId);
      if (!success) {
        return res.status(404).json({ message: "Session client assignment not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sessions/:sessionId/clients", async (req, res) => {
    try {
      const clients = await storage.getSessionClients(req.params.sessionId);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Advanced Session Management routes
  app.get("/api/sessions/calendar/:start/:end", async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      const sessions = await storage.getSessionsByDateRange(startDate, endDate);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions/:id/cancel", async (req, res) => {
    try {
      const session = await storage.cancelSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions/recurring", async (req, res) => {
    try {
      const { baseData, pattern, days, endDate } = req.body;
      const sessions = await storage.createRecurringSessions(
        baseData,
        pattern,
        days,
        new Date(endDate)
      );
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sessions/:id/book", async (req, res) => {
    try {
      const { clientId } = req.body;
      const result = await storage.bookSessionSpot(req.params.id, clientId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Session Waitlist routes
  app.post("/api/sessions/:id/waitlist", async (req, res) => {
    try {
      const { clientId } = req.body;
      const result = await storage.addToWaitlist(req.params.id, clientId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/sessions/:id/waitlist/:clientId", async (req, res) => {
    try {
      const success = await storage.removeFromWaitlist(req.params.id, req.params.clientId);
      if (!success) {
        return res.status(404).json({ message: "Waitlist entry not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sessions/:id/waitlist", async (req, res) => {
    try {
      const waitlist = await storage.getSessionWaitlist(req.params.id);
      res.json(waitlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get client waitlist (owner or admin only)
  app.get("/api/clients/:id/waitlist", authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
    try {
      const waitlist = await storage.getClientWaitlist(req.params.id);
      res.json(waitlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Comprehensive seed endpoint for demo data
  app.post("/api/seed-demo-data", async (_req, res) => {
    try {
      const demoClient = await storage.getClientByPhone("8600126395");
      if (!demoClient) {
        return res.status(404).json({ message: "Demo client not found. Run /api/init first." });
      }

      const packages = await storage.getAllPackages();
      const premiumPackage = packages.find(p => p.name === "Premium");
      
      // Check if videos exist
      const existingVideos = await storage.getAllVideos();
      if (existingVideos.length === 0) {
        // Create sample videos
        const videos = [
          { title: "Full Body Strength Training", category: "Strength", duration: 45, url: "https://example.com/video1", description: "Complete full body workout", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Morning Yoga Flow", category: "Yoga", duration: 30, url: "https://example.com/video2", description: "Energizing morning yoga", packageRequirement: premiumPackage?._id?.toString() },
          { title: "HIIT Cardio Blast", category: "Cardio", duration: 25, url: "https://example.com/video3", description: "High intensity cardio", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Upper Body Power", category: "Strength", duration: 40, url: "https://example.com/video4", description: "Focus on upper body", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Flexibility & Stretching", category: "Yoga", duration: 20, url: "https://example.com/video5", description: "Improve flexibility", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Advanced HIIT Circuit", category: "HIIT", duration: 35, url: "https://example.com/video6", description: "Advanced HIIT training", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Core Strength Builder", category: "Strength", duration: 30, url: "https://example.com/video7", description: "Build core strength", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Evening Relaxation Yoga", category: "Yoga", duration: 25, url: "https://example.com/video8", description: "Wind down yoga session", packageRequirement: premiumPackage?._id?.toString() },
          { title: "Beginner Cardio Workout", category: "Cardio", duration: 20, url: "https://example.com/video9", description: "Cardio for beginners", packageRequirement: premiumPackage?._id?.toString() },
        ];
        
        for (const video of videos) {
          await storage.createVideo(video);
        }
      }

      // Check if sessions exist
      const existingSessions = await storage.getAllSessions();
      if (existingSessions.length === 0) {
        // Create sample live sessions
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(now);
        dayAfter.setDate(dayAfter.getDate() + 2);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const sessions = [
          { 
            title: "Power Yoga Session", 
            description: "Energizing yoga flow for all levels", 
            sessionType: "Power Yoga",
            scheduledAt: tomorrow, 
            duration: 60, 
            trainerName: "Sarah Johnson",
            maxCapacity: 15,
            currentCapacity: 0,
            status: "upcoming", 
            isRecurring: false,
            meetingLink: "https://meet.example.com/yoga1" 
          },
          { 
            title: "HIIT Training", 
            description: "High intensity interval training", 
            sessionType: "HIIT",
            scheduledAt: dayAfter, 
            duration: 45, 
            trainerName: "Mike Chen",
            maxCapacity: 12,
            currentCapacity: 0,
            status: "upcoming", 
            isRecurring: false,
            meetingLink: "https://meet.example.com/hiit1" 
          },
          { 
            title: "Strength Building", 
            description: "Full body strength workout", 
            sessionType: "Strength Building",
            scheduledAt: yesterday, 
            duration: 50, 
            trainerName: "Alex Rivera",
            maxCapacity: 15,
            currentCapacity: 0,
            status: "completed", 
            isRecurring: false,
            meetingLink: "https://meet.example.com/strength1" 
          },
          { 
            title: "Cardio Bootcamp", 
            description: "Morning cardio session", 
            sessionType: "Cardio Bootcamp",
            scheduledAt: tomorrow, 
            duration: 40, 
            trainerName: "Sarah Johnson",
            maxCapacity: 20,
            currentCapacity: 0,
            status: "upcoming", 
            isRecurring: false,
            meetingLink: "https://meet.example.com/cardio1" 
          },
        ];
        
        for (const session of sessions) {
          await storage.createSession(session);
        }
      }

      // Check if demo client has diet plan
      const clientId = (demoClient as any)._id.toString();
      const existingDietPlans = await storage.getClientDietPlans(clientId);
      if (existingDietPlans.length === 0) {
        await storage.createDietPlan({
          clientId,
          name: "Balanced Nutrition Plan",
          targetCalories: 2200,
          protein: 150,
          carbs: 220,
          fats: 70,
          meals: {
            breakfast: { name: "Oatmeal with Berries", calories: 450, protein: 15, carbs: 65, fats: 12 },
            lunch: { name: "Grilled Chicken Salad", calories: 550, protein: 45, carbs: 40, fats: 18 },
            snack: { name: "Greek Yogurt & Almonds", calories: 300, protein: 20, carbs: 25, fats: 15 },
            dinner: { name: "Salmon with Quinoa", calories: 650, protein: 50, carbs: 55, fats: 20 }
          }
        });
      }

      // Check if demo client has workout plan
      const existingWorkoutPlans = await storage.getClientWorkoutPlans(clientId);
      if (existingWorkoutPlans.length === 0) {
        await storage.createWorkoutPlan({
          clientId,
          name: "4-Week Strength & Conditioning",
          description: "Build strength and improve conditioning",
          goal: "Build Muscle",
          durationWeeks: 4,
          exercises: {
            monday: [
              { name: "Barbell Squat", sets: 4, reps: 8, rest: "2min" },
              { name: "Bench Press", sets: 4, reps: 8, rest: "2min" },
              { name: "Bent-Over Rows", sets: 3, reps: 10, rest: "90s" }
            ],
            wednesday: [
              { name: "Deadlift", sets: 4, reps: 6, rest: "3min" },
              { name: "Overhead Press", sets: 3, reps: 8, rest: "2min" },
              { name: "Pull-ups", sets: 3, reps: "max", rest: "90s" }
            ],
            friday: [
              { name: "Leg Press", sets: 4, reps: 12, rest: "90s" },
              { name: "Dumbbell Bench", sets: 3, reps: 10, rest: "90s" },
              { name: "Cable Rows", sets: 3, reps: 12, rest: "90s" }
            ]
          }
        });
      }

      // Seed workout sessions for the demo client
      const existingWorkoutSessions = await storage.getClientWorkoutSessions(clientId);
      if (existingWorkoutSessions.length === 0) {
        const workoutSessionsData = [
          {
            clientId,
            workoutName: "Morning Strength Training",
            duration: 45,
            caloriesBurned: 350,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            exercises: { squats: "4x8", benchPress: "4x8", rows: "3x10" }
          },
          {
            clientId,
            workoutName: "Evening Cardio",
            duration: 30,
            caloriesBurned: 280,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            exercises: { running: "20min", cycling: "10min" }
          },
          {
            clientId,
            workoutName: "Full Body Workout",
            duration: 60,
            caloriesBurned: 450,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            exercises: { deadlifts: "4x6", overhead: "3x8", pullups: "3xMax" }
          },
          {
            clientId,
            workoutName: "HIIT Session",
            duration: 25,
            caloriesBurned: 320,
            completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            exercises: { burpees: "4x10", jumpSquats: "4x12", mountainClimbers: "4x20" }
          },
          {
            clientId,
            workoutName: "Upper Body Focus",
            duration: 50,
            caloriesBurned: 380,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            exercises: { benchPress: "5x5", rows: "4x8", curls: "3x12" }
          },
          {
            clientId,
            workoutName: "Leg Day",
            duration: 55,
            caloriesBurned: 420,
            completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            exercises: { squats: "5x5", legPress: "4x12", lunges: "3x10" }
          },
          {
            clientId,
            workoutName: "Core & Conditioning",
            duration: 35,
            caloriesBurned: 250,
            completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            exercises: { planks: "3x60s", crunches: "3x20", russian: "3x15" }
          },
        ];

        for (const sessionData of workoutSessionsData) {
          await storage.createWorkoutSession(sessionData);
        }

        await storage.createAchievement({
          clientId,
          type: 'first_workout',
          title: 'First Workout Complete',
          description: 'Completed your very first workout session',
        });

        await storage.createAchievement({
          clientId,
          type: 'streak_week',
          title: 'Week Streak Champion',
          description: 'Maintained a 7-day workout streak',
        });
      }

      res.json({ message: "Demo data seeded successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const [client, stats, achievements, sessions, metrics, workoutPlans, dietPlans] = await Promise.all([
        storage.getClient(clientId),
        storage.getWorkoutSessionStats(clientId),
        storage.getClientAchievements(clientId),
        storage.getClientSessions(clientId),
        storage.getLatestBodyMetrics(clientId),
        storage.getClientWorkoutPlans(clientId),
        storage.getClientDietPlans(clientId),
      ]);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const upcomingSessions = sessions
        .filter(s => new Date(s.scheduledAt) > new Date() && s.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 3);
      
      const nextSession = upcomingSessions[0] || null;
      
      const initialWeight = metrics?.weight || client.weight || 0;
      const targetWeight = metrics?.idealWeight || 0;
      const currentWeight = metrics?.weight || client.weight || 0;
      const weightProgress = targetWeight ? Math.round(((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100) : 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const workoutDays = new Set<string>();
      
      for (const session of stats.allSessions) {
        const sessionDate = new Date(session.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        const dayKey = sessionDate.toISOString().split('T')[0];
        workoutDays.add(dayKey);
      }
      
      const last28Days = [];
      for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        last28Days.push({
          date: dayKey,
          hasWorkout: workoutDays.has(dayKey),
          isToday: i === 0,
        });
      }
      
      res.json({
        client: {
          name: client.name,
          packageName: (client.packageId as any)?.name || 'No Package',
          goal: client.goal || 'General Fitness',
        },
        stats: {
          currentStreak: stats.currentStreak,
          maxStreak: stats.maxStreak,
          totalSessions: stats.totalSessions,
          weekSessions: stats.weekSessions,
          monthSessions: stats.monthSessions,
          totalCalories: stats.totalCalories,
          weekCalories: stats.weekCalories,
        },
        progress: {
          initialWeight,
          currentWeight,
          targetWeight,
          weightProgress: Math.max(0, Math.min(100, weightProgress)),
          weeklyWorkoutCompletion: Math.round((stats.weekSessions / 5) * 100),
        },
        nextSession,
        upcomingSessions,
        recentSessions: stats.recentSessions,
        achievements: achievements.slice(0, 5),
        hasWorkoutPlan: workoutPlans.length > 0,
        hasDietPlan: dietPlans.length > 0,
        calendarData: last28Days,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/workout-sessions/:clientId", async (req, res) => {
    try {
      const sessions = await storage.getClientWorkoutSessions(req.params.clientId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const session = await storage.createWorkoutSession(req.body);
      
      const stats = await storage.getWorkoutSessionStats(req.body.clientId);
      
      if (stats.totalSessions === 1) {
        await storage.createAchievement({
          clientId: req.body.clientId,
          type: 'first_workout',
          title: 'First Workout',
          description: 'Completed your first workout session',
          metadata: { sessionId: session._id },
        });
      }
      
      if (stats.totalSessions === 10) {
        await storage.createAchievement({
          clientId: req.body.clientId,
          type: 'workout_milestone',
          title: '10 Workouts Complete',
          description: 'Completed 10 workout sessions',
          metadata: { sessionId: session._id },
        });
      }
      
      if (stats.currentStreak === 7) {
        await storage.createAchievement({
          clientId: req.body.clientId,
          type: 'streak_week',
          title: 'Week Streak',
          description: '7 day workout streak achieved',
          metadata: { streak: 7 },
        });
      }
      
      if (stats.totalCalories >= 10000) {
        const existingAchievements = await storage.getClientAchievements(req.body.clientId);
        const has10kAchievement = existingAchievements.some(a => a.type === 'calories_10k');
        
        if (!has10kAchievement) {
          await storage.createAchievement({
            clientId: req.body.clientId,
            type: 'calories_10k',
            title: 'Calorie Crusher',
            description: 'Burned 10,000 total calories',
            metadata: { calories: stats.totalCalories },
          });
        }
      }
      
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/achievements/:clientId", async (req, res) => {
    try {
      const achievements = await storage.getClientAchievements(req.params.clientId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Weight
  app.get("/api/progress/weight", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const history = await storage.getClientWeightHistory(clientId);
      const goal = await storage.getClientWeightGoal(clientId);
      
      res.json({
        current: history[0] || null,
        start: history[history.length - 1]?.weight || history[0]?.weight || 0,
        goal,
        history,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress/weight", async (req, res) => {
    try {
      const clientId = req.body.clientId || 'default-client';
      const { weight, date } = req.body;
      const entry = await storage.createWeightEntry(clientId, weight, date);
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress/goal", async (req, res) => {
    try {
      const clientId = req.body.clientId || 'default-client';
      const { goalWeight } = req.body;
      const result = await storage.setClientWeightGoal(clientId, goalWeight);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Body Measurements
  app.get("/api/progress/measurements", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const history = await storage.getClientBodyMeasurementsHistory(clientId);
      
      res.json({
        current: history[0] || {},
        previous: history[1] || {},
        history,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress/measurements", async (req, res) => {
    try {
      const clientId = req.body.clientId || 'default-client';
      const { date, ...measurements } = req.body;
      const entry = await storage.createBodyMeasurement(clientId, measurements, date);
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Personal Records
  app.get("/api/progress/records", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const records = await storage.getClientPersonalRecords(clientId);
      res.json({ records });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress/records", async (req, res) => {
    try {
      const clientId = req.body.clientId || 'default-client';
      const { category, value, date } = req.body;
      const record = await storage.createPersonalRecord(clientId, category, value, date);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Weekly Completion
  app.get("/api/progress/weekly-completion", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const current = await storage.getClientWeeklyCompletion(clientId);
      const history = await storage.getWeeklyCompletionHistory(clientId);
      res.json({ ...current, history });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Achievements (Stats for UI)
  app.get("/api/progress/achievements", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const sessions = await storage.getClientWorkoutSessions(clientId);
      const achievements = await storage.getClientAchievements(clientId);
      const weightHistory = await storage.getClientWeightHistory(clientId);
      const goal = await storage.getClientWeightGoal(clientId);
      
      const currentWeight = weightHistory[0]?.weight || 0;
      const goalReached = goal && currentWeight <= goal;
      
      res.json({
        stats: {
          totalWorkouts: sessions.length,
          currentStreak: 0,
          goalReached: goalReached || false,
        },
        unlocked: achievements.map((a: any) => a.type),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Tracking - Monthly Reports
  app.get("/api/progress/monthly-reports", async (req, res) => {
    try {
      const clientId = req.query.clientId as string || 'default-client';
      const sessions = await storage.getClientWorkoutSessions(clientId);
      const achievements = await storage.getClientAchievements(clientId);
      const weightHistory = await storage.getClientWeightHistory(clientId);
      const weeklyCompletion = await storage.getClientWeeklyCompletion(clientId);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthSessions = sessions.filter((s: any) => new Date(s.date) >= monthStart);
      
      const weightChange = weightHistory.length >= 2 
        ? (weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight).toFixed(1)
        : null;
      
      res.json({
        current: {
          monthYear: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalWorkouts: monthSessions.length,
          weightChange,
          achievements: achievements.filter((a: any) => 
            new Date(a.unlockedAt || a.createdAt) >= monthStart
          ).length,
          weeklyCompletion: weeklyCompletion.plannedWorkouts > 0
            ? Math.round((weeklyCompletion.completedWorkouts / weeklyCompletion.plannedWorkouts) * 100)
            : 0,
          highlights: [
            `Completed ${monthSessions.length} workout sessions`,
            weightChange ? `Weight ${parseFloat(weightChange) < 0 ? 'lost' : 'gained'} ${Math.abs(parseFloat(weightChange))} kg` : 'No weight change tracked',
          ],
        },
        history: [],
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const clientId = req.query.clientId as string;
      if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
      }
      const goals = await storage.getClientGoals(clientId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goal = await storage.createGoal(req.body);
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const success = await storage.deleteGoal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/goals/:id/progress", async (req, res) => {
    try {
      const { currentValue } = req.body;
      if (currentValue === undefined) {
        return res.status(400).json({ message: "Current value is required" });
      }
      const goal = await storage.updateGoalProgress(req.params.id, currentValue);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Communication - Messages Routes
  app.get("/api/messages/conversations/:clientId", async (req, res) => {
    try {
      const conversations = await storage.getClientConversations(req.params.clientId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.sendMessage(req.body);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/unread/:userId", async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.params.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Communication - Tickets Routes
  app.get("/api/tickets/client/:clientId", async (req, res) => {
    try {
      const tickets = await storage.getClientTickets(req.params.clientId);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tickets/:ticketNumber", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.ticketNumber);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tickets/:ticketNumber/responses", async (req, res) => {
    try {
      const ticket = await storage.addTicketResponse(req.params.ticketNumber, req.body);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/tickets/:ticketNumber/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const ticket = await storage.updateTicketStatus(req.params.ticketNumber, status);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Communication - Announcements Routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const targetAudience = req.query.targetAudience as string | undefined;
      const announcements = await storage.getAllAnnouncements(targetAudience);
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/announcements/:id", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Communication - Forum Routes
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const topics = await storage.getAllForumTopics(category);
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getForumTopic(req.params.id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forum/topics", async (req, res) => {
    try {
      const topic = await storage.createForumTopic(req.body);
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forum/topics/:id/replies", async (req, res) => {
    try {
      const topic = await storage.addForumReply(req.params.id, req.body);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forum/topics/:id/views", async (req, res) => {
    try {
      await storage.incrementTopicViews(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forum/topics/:id/like", async (req, res) => {
    try {
      const { increment } = req.body;
      const topic = await storage.toggleTopicLike(req.params.id, increment);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      res.json(topic);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Analytics routes
  app.get("/api/analytics/monthly-trends", async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      const packages = await storage.getAllPackages();

      // Create package lookup map
      const packageById = packages.reduce((map: Record<string, any>, pkg: any) => {
        map[pkg._id.toString()] = pkg;
        return map;
      }, {});

      // Get last 6 months
      const now = new Date();
      const monthsData = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Count clients created up to this month
        const clientsUpToMonth = clients.filter(c => 
          new Date(c.createdAt) < nextMonthDate
        );

        // Calculate revenue for clients active this month
        const monthRevenue = clientsUpToMonth.reduce((sum, client: any) => {
          const packageId = typeof client.packageId === 'object' ? client.packageId._id : client.packageId;
          const pkg = packageById[packageId?.toString()];
          return sum + (pkg?.price || 0);
        }, 0);

        // Count new clients in this specific month
        const newClients = clients.filter(c => {
          const createdDate = new Date(c.createdAt);
          return createdDate >= monthDate && createdDate < nextMonthDate;
        }).length;

        monthsData.push({
          month: monthName,
          revenue: monthRevenue,
          clients: clientsUpToMonth.length,
          newClients: newClients
        });
      }

      res.json(monthsData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/growth-metrics", async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      const packages = await storage.getAllPackages();

      // Calculate this month vs last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      const thisMonthClients = clients.filter(c => 
        new Date(c.createdAt) >= thisMonthStart
      ).length;

      const lastMonthClients = clients.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= lastMonthStart && createdDate < thisMonthStart;
      }).length;

      const twoMonthsAgoClients = clients.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= twoMonthsAgo && createdDate < lastMonthStart;
      }).length;

      // Calculate growth rate
      const growthRate = lastMonthClients > 0 
        ? Math.round(((thisMonthClients - lastMonthClients) / lastMonthClients) * 100)
        : 100;

      const lastMonthGrowthRate = twoMonthsAgoClients > 0
        ? Math.round(((lastMonthClients - twoMonthsAgoClients) / twoMonthsAgoClients) * 100)
        : 100;

      // Package breakdown
      const packageById = packages.reduce((map: Record<string, any>, pkg: any) => {
        map[pkg._id.toString()] = pkg;
        return map;
      }, {});

      const packageStats = packages.map((pkg: any) => {
        const count = clients.filter((c: any) => {
          const packageId = typeof c.packageId === 'object' ? c.packageId._id : c.packageId;
          return packageId?.toString() === pkg._id.toString();
        }).length;
        return {
          name: pkg.name,
          count,
          percentage: clients.length > 0 ? Math.round((count / clients.length) * 100) : 0
        };
      });

      res.json({
        thisMonth: thisMonthClients,
        lastMonth: lastMonthClients,
        growthRate,
        lastMonthGrowthRate,
        totalClients: clients.length,
        packageStats
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/client-timeline", async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      
      // Group clients by month for the last 6 months
      const now = new Date();
      const timeline = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

        const newClients = clients.filter(c => {
          const createdDate = new Date(c.createdAt);
          return createdDate >= monthDate && createdDate < nextMonthDate;
        }).length;

        const totalClients = clients.filter(c => 
          new Date(c.createdAt) < nextMonthDate
        ).length;

        timeline.push({
          month: monthName,
          newClients,
          totalClients
        });
      }

      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/client-stats', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const clients = await storage.getAllClients();
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const totalClients = clients.length;
      const activeClients = clients.filter((c: any) => c.status === 'active').length;
      const inactiveClients = clients.filter((c: any) => c.status === 'inactive').length;
      const pendingClients = clients.filter((c: any) => c.status === 'pending').length;

      const filteredClients = clients.filter((c: any) => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= start && createdDate <= end;
      });

      const growthData = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const newClients = clients.filter((c: any) => {
          const created = new Date(c.createdAt);
          return created >= monthStart && created <= monthEnd;
        }).length;

        growthData.push({
          month: monthStart.toISOString().slice(0, 7),
          newClients,
          totalClients: clients.filter((c: any) => new Date(c.createdAt) <= monthEnd).length
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      res.json({
        totalClients,
        activeClients,
        inactiveClients,
        pendingClients,
        newClientsInPeriod: filteredClients.length,
        growthData
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/video-performance', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const videos = await storage.getAllVideos();
      const videoProgress = await VideoProgress.find();

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const videoStats = videos.map((video: any) => {
        const progressRecords = videoProgress.filter((vp: any) => {
          const vpDate = new Date(vp.lastWatchedAt || vp.createdAt);
          return vp.videoId?.toString() === video._id.toString() && vpDate >= start && vpDate <= end;
        });

        const views = progressRecords.length;
        const completions = progressRecords.filter((vp: any) => vp.completed).length;
        const completionRate = views > 0 ? Math.round((completions / views) * 100) : 0;
        const totalWatchTime = progressRecords.reduce((sum: number, vp: any) => sum + (vp.watchDuration || 0), 0);
        const avgWatchTime = views > 0 ? Math.round(totalWatchTime / views) : 0;

        return {
          id: video._id,
          title: video.title,
          category: video.category,
          duration: video.duration,
          views,
          completions,
          completionRate,
          avgWatchTime
        };
      });

      videoStats.sort((a, b) => b.views - a.views);

      res.json({
        totalVideos: videos.length,
        totalViews: videoStats.reduce((sum, v) => sum + v.views, 0),
        totalCompletions: videoStats.reduce((sum, v) => sum + v.completions, 0),
        avgCompletionRate: videoStats.length > 0 
          ? Math.round(videoStats.reduce((sum, v) => sum + v.completionRate, 0) / videoStats.length) 
          : 0,
        topVideos: videoStats.slice(0, 10)
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/session-attendance', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const sessions = await storage.getAllSessions();
      const filteredSessions = sessions.filter((s: any) => {
        const scheduledDate = new Date(s.scheduledAt);
        return scheduledDate >= start && scheduledDate <= end;
      });

      const sessionStats = await Promise.all(filteredSessions.map(async (session: any) => {
        const sessionClients = await storage.getSessionClients(session._id);
        const bookedCount = sessionClients.length;
        const attendedCount = sessionClients.filter((sc: any) => sc.attended).length;
        const attendanceRate = bookedCount > 0 ? Math.round((attendedCount / bookedCount) * 100) : 0;

        return {
          id: session._id,
          title: session.title,
          sessionType: session.sessionType,
          scheduledAt: session.scheduledAt,
          trainerName: session.trainerName,
          maxCapacity: session.maxCapacity,
          bookedCount,
          attendedCount,
          attendanceRate,
          status: session.status
        };
      }));

      const totalSessions = filteredSessions.length;
      const completedSessions = filteredSessions.filter((s: any) => s.status === 'completed').length;
      const totalBooked = sessionStats.reduce((sum: number, s: any) => sum + s.bookedCount, 0);
      const totalAttended = sessionStats.reduce((sum: number, s: any) => sum + s.attendedCount, 0);
      const avgAttendanceRate = totalBooked > 0 ? Math.round((totalAttended / totalBooked) * 100) : 0;

      res.json({
        totalSessions,
        completedSessions,
        totalBooked,
        totalAttended,
        avgAttendanceRate,
        sessionDetails: sessionStats.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/revenue', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const payments = await PaymentHistory.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('clientId packageId');

      const totalRevenue = payments.reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0);
      const paidRevenue = payments.filter((p: any) => p.status === 'paid').reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0);
      const pendingRevenue = payments.filter((p: any) => p.status === 'pending').reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0);
      const overdueRevenue = payments.filter((p: any) => p.status === 'overdue').reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0);

      const monthlyRevenue = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const monthPayments = payments.filter((p: any) => {
          const pDate = new Date(p.createdAt);
          return pDate >= monthStart && pDate <= monthEnd && p.status === 'paid';
        });

        monthlyRevenue.push({
          month: monthStart.toISOString().slice(0, 7),
          revenue: monthPayments.reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0),
          count: monthPayments.length
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      const packages = await storage.getAllPackages();
      const revenueByPackage = packages.map((pkg: any) => {
        const pkgPayments = payments.filter((p: any) => 
          p.packageId?._id?.toString() === pkg._id.toString() && p.status === 'paid'
        );
        return {
          packageName: pkg.name,
          revenue: pkgPayments.reduce((sum, p: any) => sum + parseFloat(p.amount || 0), 0),
          count: pkgPayments.length
        };
      });

      res.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        paidRevenue: Math.round(paidRevenue * 100) / 100,
        pendingRevenue: Math.round(pendingRevenue * 100) / 100,
        overdueRevenue: Math.round(overdueRevenue * 100) / 100,
        totalPayments: payments.length,
        monthlyRevenue,
        revenueByPackage
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/retention', async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const now = new Date();
      
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const activeClients = clients.filter((c: any) => c.status === 'active').length;
      const inactiveClients = clients.filter((c: any) => c.status === 'inactive').length;

      const clientsCreated30DaysAgo = clients.filter((c: any) => 
        new Date(c.createdAt) >= sixtyDaysAgo && new Date(c.createdAt) < thirtyDaysAgo
      );
      
      const stillActive30Days = clientsCreated30DaysAgo.filter((c: any) => c.status === 'active').length;
      const retention30Days = clientsCreated30DaysAgo.length > 0 
        ? Math.round((stillActive30Days / clientsCreated30DaysAgo.length) * 100) 
        : 0;

      const clientsCreated90DaysAgo = clients.filter((c: any) => 
        new Date(c.createdAt) < ninetyDaysAgo
      );
      
      const stillActive90Days = clientsCreated90DaysAgo.filter((c: any) => c.status === 'active').length;
      const retention90Days = clientsCreated90DaysAgo.length > 0 
        ? Math.round((stillActive90Days / clientsCreated90DaysAgo.length) * 100) 
        : 0;

      const churnRate = clients.length > 0 
        ? Math.round((inactiveClients / clients.length) * 100) 
        : 0;

      const packages = await storage.getAllPackages();
      const retentionByPackage = packages.map((pkg: any) => {
        const pkgClients = clients.filter((c: any) => c.packageId?.toString() === pkg._id.toString());
        const pkgActive = pkgClients.filter((c: any) => c.status === 'active').length;
        return {
          packageName: pkg.name,
          totalClients: pkgClients.length,
          activeClients: pkgActive,
          retentionRate: pkgClients.length > 0 ? Math.round((pkgActive / pkgClients.length) * 100) : 0
        };
      });

      res.json({
        totalClients: clients.length,
        activeClients,
        inactiveClients,
        retention30Days,
        retention90Days,
        churnRate,
        retentionByPackage
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/peak-usage', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const sessions = await storage.getAllSessions();
      const videoProgress = await VideoProgress.find();

      const activity = [
        ...sessions.map((s: any) => ({ timestamp: new Date(s.scheduledAt), type: 'session' })),
        ...videoProgress.map((vp: any) => ({ timestamp: new Date(vp.lastWatchedAt || vp.createdAt), type: 'video' }))
      ].filter((a: any) => a.timestamp >= start && a.timestamp <= end);

      const hourlyActivity = Array(24).fill(0);
      const dailyActivity = Array(7).fill(0);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      activity.forEach((a: any) => {
        const date = new Date(a.timestamp);
        hourlyActivity[date.getHours()]++;
        dailyActivity[date.getDay()]++;
      });

      const hourlyData = hourlyActivity.map((count, hour) => ({
        hour: `${hour}:00`,
        activity: count
      }));

      const dailyData = dailyActivity.map((count, day) => ({
        day: dayNames[day],
        activity: count
      }));

      const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
      const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity));

      res.json({
        hourlyData,
        dailyData,
        peakHour: `${peakHour}:00`,
        peakDay: dayNames[peakDay],
        totalActivity: activity.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/popular-trainers', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const sessions = await storage.getAllSessions();
      const filteredSessions = sessions.filter((s: any) => {
        const scheduledDate = new Date(s.scheduledAt);
        return scheduledDate >= start && scheduledDate <= end;
      });

      const trainerStats: Record<string, any> = {};

      for (const session of filteredSessions) {
        const trainer = (session as any).trainerName || 'Unknown';
        if (!trainerStats[trainer]) {
          trainerStats[trainer] = {
            trainerName: trainer,
            totalSessions: 0,
            completedSessions: 0,
            totalBookings: 0,
            totalAttendance: 0,
            avgAttendanceRate: 0
          };
        }

        trainerStats[trainer].totalSessions++;
        if ((session as any).status === 'completed') {
          trainerStats[trainer].completedSessions++;
        }

        const sessionClients = await storage.getSessionClients((session as any)._id);
        trainerStats[trainer].totalBookings += sessionClients.length;
        trainerStats[trainer].totalAttendance += sessionClients.filter((sc: any) => sc.attended).length;
      }

      const trainerList = Object.values(trainerStats).map((trainer: any) => ({
        ...trainer,
        avgAttendanceRate: trainer.totalBookings > 0 
          ? Math.round((trainer.totalAttendance / trainer.totalBookings) * 100) 
          : 0
      }));

      trainerList.sort((a, b) => b.totalSessions - a.totalSessions);

      res.json({
        trainers: trainerList,
        totalTrainers: trainerList.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Advanced Analytics - Engagement Scoring & Predictive Indicators
  app.get('/api/admin/analytics/engagement-report', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('[API] Generating engagement report...');
      const { analyticsEngine } = await import('./analytics-engine');
      const report = await analyticsEngine.generateReport();
      res.json(report);
    } catch (error: any) {
      console.error('[API] Error generating engagement report:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/engagement-scores', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { analyticsEngine } = await import('./analytics-engine');
      const scores = analyticsEngine.getScoresFromCache();
      
      if (scores.length === 0) {
        await analyticsEngine.calculateEngagementScores();
        const newScores = analyticsEngine.getScoresFromCache();
        return res.json(newScores);
      }
      
      res.json(scores);
    } catch (error: any) {
      console.error('[API] Error getting engagement scores:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/analytics/refresh-engagement', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('[API] Refreshing engagement scores...');
      const { analyticsEngine } = await import('./analytics-engine');
      const scores = await analyticsEngine.calculateEngagementScores();
      res.json({
        message: 'Engagement scores refreshed successfully',
        processedClients: scores.length,
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error('[API] Error refreshing engagement scores:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/admin/analytics/cache-info', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { analyticsEngine } = await import('./analytics-engine');
      const cacheInfo = analyticsEngine.getCacheInfo();
      res.json(cacheInfo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // System Settings routes
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/settings/initialize", async (_req, res) => {
    try {
      const settings = await storage.initializeSystemSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/settings/backup", async (_req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      const timestamp = new Date().toISOString().split('T')[0];
      const backupData = {
        backupDate: new Date(),
        settings,
        clients: await storage.getAllClients(),
        packages: await storage.getAllPackages(),
      };
      
      await storage.updateSystemSettings({
        backup: {
          ...settings.backup,
          lastBackupDate: new Date(),
        }
      });
      
      res.json({ 
        message: "Backup created successfully", 
        filename: `fitpro-backup-${timestamp}.json`,
        data: backupData
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GDPR Compliance: User Data Export (authenticated users only)
  app.get("/api/user/export-data", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userData = await exportUserData(req.user.userId, req.user.clientId);
      
      // Return as downloadable JSON file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `user-data-export-${timestamp}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(userData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const notifications = await storage.getUserNotifications(req.user.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const count = await storage.markAllNotificationsAsRead(req.user.userId);
      res.json({ message: `${count} notifications marked as read`, count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const count = await storage.getUnreadNotificationCount(req.user.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.deleteNotification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
