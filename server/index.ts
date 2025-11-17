// Load environment variables from .env file
// Note: Replit Secrets take priority over .env file
import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { hashPassword } from "./utils/auth";
import { User } from "./models/user";
import { Trainer } from "./models";
import { startSessionReminderScheduler } from "./utils/session-reminder-scheduler";
import { emailService } from "./utils/email";

const app = express();

// Extend IncomingMessage for rawBody
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware to log API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB using .env MONGODB_URI
    await storage.connect();
    log("✅ Database connected successfully");

    // Check for existing packages
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
          features: [
            "All Basic features",
            "Video library access",
            "Diet plans",
            "2 live sessions/month",
          ],
          videoAccess: true,
          liveSessionsPerMonth: 2,
          dietPlanAccess: true,
          workoutPlanAccess: true,
        },
        {
          name: "Elite",
          description: "Complete fitness solution",
          price: 99.99,
          features: [
            "All Premium features",
            "Unlimited live sessions",
            "Personal trainer support",
            "Priority support",
          ],
          videoAccess: true,
          liveSessionsPerMonth: 999,
          dietPlanAccess: true,
          workoutPlanAccess: true,
        },
      ];

      for (const pkg of defaultPackages) {
        await storage.createPackage(pkg);
      }
      log(`📦 Created ${defaultPackages.length} default packages`);
    } else {
      log(`📦 Found ${existingPackages.length} existing packages`);
    }
    
    // Create demo client if doesn't exist (regardless of packages)
      const demoClientPhone = "8600126395";
      let demoClient = await storage.getClientByPhone(demoClientPhone);
      
      if (!demoClient) {
        const packages = await storage.getAllPackages();
        const premiumPackage = packages.find(p => p.name === "Premium");
        
        demoClient = await storage.createClient({
          name: "Abhijeet Singh",
          phone: demoClientPhone,
          packageId: premiumPackage?._id?.toString() || "",
          age: 28,
          gender: "male",
          height: 175,
          weight: 75,
          goal: "Build Muscle"
        });
        log(`👤 Created demo client: Abhijeet Singh`);
      }
      
      // ALWAYS ensure default admin and trainer accounts exist
      // These accounts are REQUIRED for system operation
      const adminEmail = "admin@fitpro.com";
      const adminPassword = "Admin@123";
      const trainerEmail = "trainer@fitpro.com";
      const trainerPassword = "Trainer@123";
      
      // Admin Account - Create or Update
      let adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        const hashedAdminPassword = await hashPassword(adminPassword);
        adminUser = await User.create({
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'admin',
          name: 'FitPro Admin',
        });
        log(`🔐 Created default admin user (email: ${adminEmail})`);
      } else {
        // Ensure password is correct
        const hashedAdminPassword = await hashPassword(adminPassword);
        adminUser.password = hashedAdminPassword;
        adminUser.role = 'admin';
        await adminUser.save();
        log(`🔐 Verified admin user (email: ${adminEmail})`);
      }
      
      // Trainer Account - Create or Update
      let trainerUser = await User.findOne({ email: trainerEmail });
      let demoTrainer = await Trainer.findOne({ email: trainerEmail });
      
      // Create trainer profile if doesn't exist
      if (!demoTrainer) {
        demoTrainer = await Trainer.create({
          name: "FitPro Trainer",
          email: trainerEmail,
          phone: "9876543210",
          specialty: "Strength & Conditioning",
          bio: "Professional certified trainer",
          experience: 5,
          status: 'active',
        });
      }
      
      if (!trainerUser) {
        const hashedTrainerPassword = await hashPassword(trainerPassword);
        trainerUser = await User.create({
          email: trainerEmail,
          password: hashedTrainerPassword,
          role: 'trainer',
          name: 'FitPro Trainer',
          phone: '9876543210',
          trainerId: demoTrainer._id,
        });
        log(`🔐 Created default trainer user (email: ${trainerEmail})`);
      } else {
        // Ensure password is correct
        const hashedTrainerPassword = await hashPassword(trainerPassword);
        trainerUser.password = hashedTrainerPassword;
        trainerUser.role = 'trainer';
        trainerUser.trainerId = demoTrainer._id;
        await trainerUser.save();
        log(`🔐 Verified trainer user (email: ${trainerEmail})`);
      }
      
      // Seed videos if none exist
      const existingVideos = await storage.getAllVideos();
      if (existingVideos.length === 0) {
        const packages = await storage.getAllPackages();
        const premiumPackage = packages.find(p => p.name === "Premium");
        
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
        log(`🎥 Created ${videos.length} demo videos`);
      }
      
      // Seed live sessions if none exist
      const existingSessions = await storage.getAllSessions();
      if (existingSessions.length === 0) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0, 0, 0);
        
        const dayAfter = new Date(now);
        dayAfter.setDate(dayAfter.getDate() + 2);
        dayAfter.setHours(19, 0, 0, 0);
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(17, 30, 0, 0);
        
        const sessions = [
          { title: "Power Yoga Session", description: "Energizing yoga flow", scheduledAt: tomorrow, duration: 60, status: "upcoming", meetingLink: "https://meet.example.com/yoga1" },
          { title: "HIIT Training", description: "High intensity interval training", scheduledAt: dayAfter, duration: 45, status: "upcoming", meetingLink: "https://meet.example.com/hiit1" },
          { title: "Strength Building", description: "Full body strength", scheduledAt: yesterday, duration: 50, status: "completed", meetingLink: "https://meet.example.com/strength1" },
          { title: "Cardio Bootcamp", description: "Morning cardio session", scheduledAt: tomorrow, duration: 40, status: "upcoming", meetingLink: "https://meet.example.com/cardio1" },
        ];
        
        for (const session of sessions) {
          await storage.createSession(session);
        }
        log(`📅 Created ${sessions.length} demo live sessions`);
      }
      
      // Seed diet and workout plans for demo client if they don't exist
      if (demoClient) {
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
          log(`🥗 Created diet plan for demo client`);
        }
        
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
          log(`💪 Created workout plan for demo client`);
        }
      }
  } catch (error) {
    log("❌ Failed to connect to database:");
    console.error(error);
    process.exit(1);
  }

  // Register all routes
  const server = await registerRoutes(app);

  // Setup WebSocket for live chat
  setupWebSocket(server);
  log("🔌 WebSocket server initialized");

  startSessionReminderScheduler();

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup static/Vite
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);

  // Bind to 0.0.0.0 for Replit environment
  server.listen(port, "0.0.0.0", () => {
    log(`🚀 Server running on http://0.0.0.0:${port}`);
  });
})();
