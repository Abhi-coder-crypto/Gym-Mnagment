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
      const { category, duration, intensity, trainer, search } = req.body;
      const videos = await storage.searchVideos({
        category,
        duration,
        intensity,
        trainer,
        search,
      });
      res.json(videos);
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

  app.delete("/api/progress-photos/:id", async (req, res) => {
    try {
      const success = await storage.deleteProgressPhoto(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Progress photo not found" });
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

  const httpServer = createServer(app);

  return httpServer;
}
