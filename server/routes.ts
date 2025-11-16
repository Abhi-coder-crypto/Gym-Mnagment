import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
        
        // Create demo client
        const demoClientPhone = "8600126395";
        const existingDemoClient = await storage.getClientByPhone(demoClientPhone);
        
        if (!existingDemoClient) {
          const packages = await storage.getAllPackages();
          const premiumPackage = packages.find(p => p.name === "Premium");
          
          await storage.createClient({
            name: "Abhijeet Singh",
            phone: demoClientPhone,
            packageId: premiumPackage?._id?.toString() || "",
          });
        }
        
        res.json({ message: "Default packages and demo client created successfully", count: defaultPackages.length });
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

  app.post("/api/packages", async (req, res) => {
    try {
      const pkg = await storage.createPackage(req.body);
      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/packages/:id", async (req, res) => {
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

  // Client routes
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/clients/phone/:phone", async (req, res) => {
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

  app.get("/api/clients/:id", async (req, res) => {
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

  app.post("/api/clients", async (req, res) => {
    try {
      const client = await storage.createClient(req.body);
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
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

  app.delete("/api/clients/:id", async (req, res) => {
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

  // Admin Client Management routes
  app.get("/api/admin/clients/search", async (req, res) => {
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

  app.get("/api/admin/clients/:id/activity", async (req, res) => {
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

  app.post("/api/admin/clients/bulk-update", async (req, res) => {
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

  app.post("/api/admin/clients/bulk-assign-plan", async (req, res) => {
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

  app.get("/api/admin/clients/export", async (_req, res) => {
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

  // Payment History routes
  app.get("/api/payment-history/:clientId", async (req, res) => {
    try {
      const payments = await storage.getClientPaymentHistory(req.params.clientId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payment-history", async (req, res) => {
    try {
      const payment = await storage.createPaymentRecord(req.body);
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Body Metrics routes
  app.get("/api/body-metrics/:clientId", async (req, res) => {
    try {
      const metrics = await storage.getClientBodyMetrics(req.params.clientId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/body-metrics/:clientId/latest", async (req, res) => {
    try {
      const metrics = await storage.getLatestBodyMetrics(req.params.clientId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/body-metrics", async (req, res) => {
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

  // Client Video routes
  app.get("/api/clients/:clientId/videos", async (req, res) => {
    try {
      const videos = await storage.getClientVideos(req.params.clientId);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients/:clientId/videos/:videoId", async (req, res) => {
    try {
      const assignment = await storage.assignVideoToClient(req.params.clientId, req.params.videoId);
      res.json(assignment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:clientId/videos/:videoId", async (req, res) => {
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

  // Video Progress routes (Continue Watching)
  app.get("/api/clients/:clientId/video-progress/:videoId", async (req, res) => {
    try {
      const progress = await storage.getVideoProgress(req.params.clientId, req.params.videoId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients/:clientId/video-progress/:videoId", async (req, res) => {
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

  app.get("/api/clients/:clientId/continue-watching", async (req, res) => {
    try {
      const videos = await storage.getContinueWatching(req.params.clientId);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video Bookmark routes
  app.get("/api/clients/:clientId/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getVideoBookmarks(req.params.clientId);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients/:clientId/bookmarks/:videoId", async (req, res) => {
    try {
      const bookmark = await storage.createVideoBookmark(req.params.clientId, req.params.videoId);
      res.json(bookmark);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:clientId/bookmarks/:videoId", async (req, res) => {
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

  app.get("/api/clients/:clientId/bookmarks/:videoId/check", async (req, res) => {
    try {
      const isBookmarked = await storage.isVideoBookmarked(req.params.clientId, req.params.videoId);
      res.json({ isBookmarked });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress Photo routes
  app.get("/api/clients/:clientId/progress-photos", async (req, res) => {
    try {
      const photos = await storage.getProgressPhotos(req.params.clientId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/clients/:clientId/progress-photos", async (req, res) => {
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

  app.delete("/api/clients/:clientId/progress-photos/:photoId", async (req, res) => {
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
          { title: "Power Yoga Session", description: "Energizing yoga flow", scheduledAt: tomorrow, duration: 60, status: "upcoming", meetingLink: "https://meet.example.com/yoga1" },
          { title: "HIIT Training", description: "High intensity interval training", scheduledAt: dayAfter, duration: 45, status: "upcoming", meetingLink: "https://meet.example.com/hiit1" },
          { title: "Strength Building", description: "Full body strength", scheduledAt: yesterday, duration: 50, status: "completed", meetingLink: "https://meet.example.com/strength1" },
          { title: "Cardio Bootcamp", description: "Morning cardio session", scheduledAt: tomorrow, duration: 40, status: "upcoming", meetingLink: "https://meet.example.com/cardio1" },
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

  const httpServer = createServer(app);

  return httpServer;
}
