import mongoose from 'mongoose';
import {
  Package,
  Client,
  BodyMetrics,
  Video,
  ClientVideo,
  WorkoutPlan,
  DietPlan,
  Meal,
  LiveSession,
  SessionClient,
  SessionWaitlist,
  WorkoutSession,
  VideoProgress,
  VideoBookmark,
  ProgressPhoto,
  Achievement,
  Goal,
  PaymentHistory,
  SystemSettings,
  Trainer,
  type IPackage,
  type IClient,
  type IBodyMetrics,
  type IVideo,
  type IClientVideo,
  type IWorkoutPlan,
  type IDietPlan,
  type IMeal,
  type ILiveSession,
  type ISessionClient,
  type ISessionWaitlist,
  type IWorkoutSession,
  type IVideoProgress,
  type IVideoBookmark,
  type IProgressPhoto,
  type IAchievement,
  type IGoal,
  type IPaymentHistory,
  type ISystemSettings,
  type ITrainer,
} from './models';
import { Message, type IMessage } from './models/message';
import { Ticket, type ITicket } from './models/ticket';
import { Announcement, type IAnnouncement } from './models/announcement';
import { ForumTopic, type IForumTopic } from './models/forum';
import { User, type IUser } from './models/user';
import { Notification, type INotification } from './models/notification';

export interface IStorage {
  // User/Authentication methods
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  createUser(data: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
  getAllUsers(role?: string): Promise<IUser[]>;
  getAllTrainers(): Promise<IUser[]>;
  getTrainer(id: string): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  initializeDefaultUsers(): Promise<void>;
  
  // Notification methods
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getUserNotifications(userId: string): Promise<INotification[]>;
  markNotificationAsRead(id: string): Promise<INotification | null>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
  deleteNotification(id: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  

  // Package methods
  getAllPackages(): Promise<IPackage[]>;
  getPackage(id: string): Promise<IPackage | null>;
  createPackage(data: Partial<IPackage>): Promise<IPackage>;
  updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage | null>;
  
  // Client methods
  getAllClients(includeInactive?: boolean): Promise<IClient[]>;
  getClient(id: string): Promise<IClient | null>;
  getClientByPhone(phone: string): Promise<IClient | null>;
  createClient(data: Partial<IClient>): Promise<IClient>;
  updateClient(id: string, data: Partial<IClient>): Promise<IClient | null>;
  deleteClient(id: string): Promise<boolean>;
  permanentlyDeleteClient(id: string): Promise<boolean>;
  
  // Body Metrics methods
  getClientBodyMetrics(clientId: string): Promise<IBodyMetrics[]>;
  createBodyMetrics(data: Partial<IBodyMetrics>): Promise<IBodyMetrics>;
  getLatestBodyMetrics(clientId: string): Promise<IBodyMetrics | null>;
  
  // Video methods
  getAllVideos(): Promise<IVideo[]>;
  getVideo(id: string): Promise<IVideo | null>;
  createVideo(data: Partial<IVideo>): Promise<IVideo>;
  updateVideo(id: string, data: Partial<IVideo>): Promise<IVideo | null>;
  deleteVideo(id: string): Promise<boolean>;
  getVideosByPackage(packageId: string): Promise<IVideo[]>;
  searchVideos(filters: {
    category?: string;
    duration?: { min?: number; max?: number };
    intensity?: string;
    difficulty?: string;
    trainer?: string;
    search?: string;
    isDraft?: boolean;
  }): Promise<IVideo[]>;
  incrementVideoViews(id: string): Promise<void>;
  incrementVideoCompletions(id: string): Promise<void>;
  
  // Client Video methods
  getClientVideos(clientId: string): Promise<IVideo[]>;
  assignVideoToClient(clientId: string, videoId: string): Promise<IClientVideo>;
  removeVideoFromClient(clientId: string, videoId: string): Promise<boolean>;
  
  // Video Progress methods
  getVideoProgress(clientId: string, videoId: string): Promise<IVideoProgress | null>;
  updateVideoProgress(clientId: string, videoId: string, watchedDuration: number, totalDuration: number): Promise<IVideoProgress>;
  getContinueWatching(clientId: string): Promise<any[]>;
  
  // Video Bookmark methods
  getVideoBookmarks(clientId: string): Promise<any[]>;
  createVideoBookmark(clientId: string, videoId: string): Promise<IVideoBookmark>;
  deleteVideoBookmark(clientId: string, videoId: string): Promise<boolean>;
  isVideoBookmarked(clientId: string, videoId: string): Promise<boolean>;
  
  // Progress Photo methods
  getProgressPhotos(clientId: string): Promise<IProgressPhoto[]>;
  createProgressPhoto(data: Partial<IProgressPhoto>): Promise<IProgressPhoto>;
  deleteProgressPhoto(clientId: string, photoId: string): Promise<boolean>;
  
  // Workout Plan methods
  getClientWorkoutPlans(clientId: string): Promise<IWorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<IWorkoutPlan | null>;
  createWorkoutPlan(data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan>;
  updateWorkoutPlan(id: string, data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null>;
  deleteWorkoutPlan(id: string): Promise<boolean>;
  
  // Diet Plan methods
  getClientDietPlans(clientId: string): Promise<IDietPlan[]>;
  getDietPlan(id: string): Promise<IDietPlan | null>;
  createDietPlan(data: Partial<IDietPlan>): Promise<IDietPlan>;
  updateDietPlan(id: string, data: Partial<IDietPlan>): Promise<IDietPlan | null>;
  deleteDietPlan(id: string): Promise<boolean>;
  getDietPlanTemplates(category?: string): Promise<IDietPlan[]>;
  cloneDietPlan(planId: string, clientId?: string): Promise<IDietPlan>;
  getAllDietPlansWithAssignments(): Promise<any[]>;
  getTrainerClients(trainerId: string): Promise<IClient[]>;
  getTrainerDietPlans(trainerId: string): Promise<IDietPlan[]>;
  getTrainerSessions(trainerId: string): Promise<ILiveSession[]>;
  
  // Meal methods
  getAllMeals(filters?: { category?: string; mealType?: string; search?: string }): Promise<IMeal[]>;
  getMeal(id: string): Promise<IMeal | null>;
  createMeal(data: Partial<IMeal>): Promise<IMeal>;
  updateMeal(id: string, data: Partial<IMeal>): Promise<IMeal | null>;
  deleteMeal(id: string): Promise<boolean>;
  
  // Live Session methods
  getAllSessions(): Promise<ILiveSession[]>;
  getSession(id: string): Promise<ILiveSession | null>;
  createSession(data: Partial<ILiveSession>): Promise<ILiveSession>;
  updateSession(id: string, data: Partial<ILiveSession>): Promise<ILiveSession | null>;
  deleteSession(id: string): Promise<boolean>;
  getClientSessions(clientId: string): Promise<ILiveSession[]>;
  getSessionsByDateRange(startDate: Date, endDate: Date): Promise<ILiveSession[]>;
  cancelSession(id: string): Promise<ILiveSession | null>;
  createRecurringSessions(baseData: Partial<ILiveSession>, pattern: string, days: string[], endDate: Date): Promise<ILiveSession[]>;
  
  // Session Client methods (Booking)
  assignClientToSession(sessionId: string, clientId: string): Promise<ISessionClient>;
  removeClientFromSession(sessionId: string, clientId: string): Promise<boolean>;
  getSessionClients(sessionId: string): Promise<IClient[]>;
  bookSessionSpot(sessionId: string, clientId: string): Promise<{ success: boolean; message: string; booking?: ISessionClient }>;
  
  // Session Waitlist methods
  addToWaitlist(sessionId: string, clientId: string): Promise<{ success: boolean; message: string; position?: number }>;
  removeFromWaitlist(sessionId: string, clientId: string): Promise<boolean>;
  getSessionWaitlist(sessionId: string): Promise<any[]>;
  getClientWaitlist(clientId: string): Promise<any[]>;
  
  // Workout Session methods
  getClientWorkoutSessions(clientId: string): Promise<IWorkoutSession[]>;
  createWorkoutSession(data: Partial<IWorkoutSession>): Promise<IWorkoutSession>;
  getWorkoutSessionStats(clientId: string): Promise<any>;
  
  // Achievement methods
  getClientAchievements(clientId: string): Promise<IAchievement[]>;
  createAchievement(data: Partial<IAchievement>): Promise<IAchievement>;
  
  // Progress Tracking - Weight methods
  getClientWeightHistory(clientId: string): Promise<any[]>;
  createWeightEntry(clientId: string, weight: number, date: string): Promise<any>;
  getClientWeightGoal(clientId: string): Promise<number | null>;
  setClientWeightGoal(clientId: string, goalWeight: number): Promise<any>;
  
  // Progress Tracking - Body Measurements methods
  getClientBodyMeasurementsHistory(clientId: string): Promise<any[]>;
  createBodyMeasurement(clientId: string, measurements: any, date: string): Promise<any>;
  
  // Progress Tracking - Personal Records methods
  getClientPersonalRecords(clientId: string): Promise<any[]>;
  createPersonalRecord(clientId: string, category: string, value: number, date: string): Promise<any>;
  
  // Progress Tracking - Weekly Completion methods
  getClientWeeklyCompletion(clientId: string): Promise<any>;
  getWeeklyCompletionHistory(clientId: string): Promise<any[]>;
  
  // Goal methods
  getClientGoals(clientId: string): Promise<IGoal[]>;
  getGoal(id: string): Promise<IGoal | null>;
  createGoal(data: Partial<IGoal>): Promise<IGoal>;
  updateGoal(id: string, data: Partial<IGoal>): Promise<IGoal | null>;
  deleteGoal(id: string): Promise<boolean>;
  updateGoalProgress(goalId: string, currentValue: number): Promise<IGoal | null>;
  
  // Payment History methods
  getClientPaymentHistory(clientId: string): Promise<IPaymentHistory[]>;
  createPaymentRecord(data: Partial<IPaymentHistory>): Promise<IPaymentHistory>;
  
  // Communication - Message methods
  getConversationMessages(conversationId: string): Promise<IMessage[]>;
  getClientConversations(clientId: string): Promise<any[]>;
  sendMessage(data: Partial<IMessage>): Promise<IMessage>;
  markMessageAsRead(messageId: string): Promise<IMessage | null>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Communication - Ticket methods
  getClientTickets(clientId: string): Promise<ITicket[]>;
  getTicket(ticketNumber: string): Promise<ITicket | null>;
  createTicket(data: Partial<ITicket>): Promise<ITicket>;
  addTicketResponse(ticketNumber: string, response: any): Promise<ITicket | null>;
  updateTicketStatus(ticketNumber: string, status: string): Promise<ITicket | null>;
  
  // Communication - Announcement methods
  getAllAnnouncements(targetAudience?: string): Promise<IAnnouncement[]>;
  getAnnouncement(id: string): Promise<IAnnouncement | null>;
  createAnnouncement(data: Partial<IAnnouncement>): Promise<IAnnouncement>;
  
  // Communication - Forum methods
  getAllForumTopics(category?: string): Promise<IForumTopic[]>;
  getForumTopic(id: string): Promise<IForumTopic | null>;
  createForumTopic(data: Partial<IForumTopic>): Promise<IForumTopic>;
  addForumReply(topicId: string, reply: any): Promise<IForumTopic | null>;
  incrementTopicViews(topicId: string): Promise<void>;
  toggleTopicLike(topicId: string, increment: boolean): Promise<IForumTopic | null>;
  
  // System Settings methods
  getSystemSettings(): Promise<ISystemSettings>;
  updateSystemSettings(data: Partial<ISystemSettings>): Promise<ISystemSettings>;
  initializeSystemSettings(): Promise<ISystemSettings>;
}

export class MongoStorage implements IStorage {
  async connect() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  }

  // Package methods
  async getAllPackages(): Promise<IPackage[]> {
    return await Package.find();
  }

  async getPackage(id: string): Promise<IPackage | null> {
    return await Package.findById(id);
  }

  async createPackage(data: Partial<IPackage>): Promise<IPackage> {
    const pkg = new Package(data);
    return await pkg.save();
  }

  async updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage | null> {
    return await Package.findByIdAndUpdate(id, data, { new: true });
  }

  // Client methods
  async getAllClients(includeInactive: boolean = false): Promise<IClient[]> {
    const filter = includeInactive ? {} : { status: { $ne: 'inactive' } };
    return await Client.find(filter).populate('packageId');
  }

  async getClient(id: string): Promise<IClient | null> {
    return await Client.findById(id).populate('packageId');
  }

  async getClientByPhone(phone: string): Promise<IClient | null> {
    return await Client.findOne({ phone }).populate('packageId');
  }

  async createClient(data: Partial<IClient>): Promise<IClient> {
    const client = new Client(data);
    return await client.save();
  }

  async updateClient(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return await Client.findByIdAndUpdate(id, data, { new: true }).populate('packageId');
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await Client.findByIdAndUpdate(
      id, 
      { status: 'inactive', lastActivityDate: new Date() }, 
      { new: true }
    );
    
    if (result) {
      await User.updateOne({ clientId: id }, { status: 'inactive' });
    }
    
    return !!result;
  }
  
  async permanentlyDeleteClient(id: string): Promise<boolean> {
    const result = await Client.findByIdAndDelete(id);
    if (result) {
      await User.deleteOne({ clientId: id });
      
      await BodyMetrics.deleteMany({ clientId: id });
      await ClientVideo.deleteMany({ clientId: id });
      await VideoProgress.deleteMany({ clientId: id });
      await VideoBookmark.deleteMany({ clientId: id });
      await WorkoutSession.deleteMany({ clientId: id });
      await SessionClient.deleteMany({ clientId: id });
      await SessionWaitlist.deleteMany({ clientId: id });
      await ProgressPhoto.deleteMany({ clientId: id });
      await Achievement.deleteMany({ clientId: id });
      await Goal.deleteMany({ clientId: id });
      await PaymentHistory.deleteMany({ clientId: id });
      await Message.deleteMany({ $or: [{ senderId: id }, { recipientId: id }] });
      await Ticket.deleteMany({ clientId: id });
      await Notification.deleteMany({ userId: id });
      
      await WorkoutPlan.deleteMany({ clientId: id, clonedFrom: { $exists: true } });
      await DietPlan.deleteMany({ clientId: id, clonedFrom: { $exists: true } });
    }
    return !!result;
  }

  // Body Metrics methods
  async getClientBodyMetrics(clientId: string): Promise<IBodyMetrics[]> {
    return await BodyMetrics.find({ clientId }).sort({ recordedAt: -1 });
  }

  async createBodyMetrics(data: Partial<IBodyMetrics>): Promise<IBodyMetrics> {
    const metrics = new BodyMetrics(data);
    return await metrics.save();
  }

  async getLatestBodyMetrics(clientId: string): Promise<IBodyMetrics | null> {
    return await BodyMetrics.findOne({ clientId }).sort({ recordedAt: -1 });
  }

  // Video methods
  async getAllVideos(): Promise<IVideo[]> {
    return await Video.find().populate('packageRequirement');
  }

  async getVideo(id: string): Promise<IVideo | null> {
    return await Video.findById(id).populate('packageRequirement');
  }

  async createVideo(data: Partial<IVideo>): Promise<IVideo> {
    const video = new Video(data);
    return await video.save();
  }

  async updateVideo(id: string, data: Partial<IVideo>): Promise<IVideo | null> {
    return await Video.findByIdAndUpdate(id, data, { new: true }).populate('packageRequirement');
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await Video.findByIdAndDelete(id);
    return !!result;
  }

  async getVideosByPackage(packageId: string): Promise<IVideo[]> {
    return await Video.find({ packageRequirement: packageId });
  }

  // Client Video methods
  async getClientVideos(clientId: string): Promise<IVideo[]> {
    const clientVideos = await ClientVideo.find({ clientId }).populate('videoId');
    return clientVideos.map(cv => cv.videoId as any);
  }

  async assignVideoToClient(clientId: string, videoId: string): Promise<IClientVideo> {
    const clientVideo = new ClientVideo({ clientId, videoId });
    return await clientVideo.save();
  }

  async removeVideoFromClient(clientId: string, videoId: string): Promise<boolean> {
    const result = await ClientVideo.findOneAndDelete({ clientId, videoId });
    return !!result;
  }

  async searchVideos(filters: {
    category?: string;
    duration?: { min?: number; max?: number };
    intensity?: string;
    difficulty?: string;
    trainer?: string;
    search?: string;
    isDraft?: boolean;
  }): Promise<IVideo[]> {
    const query: any = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.intensity) {
      query.intensity = filters.intensity;
    }
    
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    if (filters.trainer) {
      query.trainer = filters.trainer;
    }
    
    if (filters.isDraft !== undefined) {
      query.isDraft = filters.isDraft;
    }
    
    if (filters.duration) {
      query.duration = {};
      if (filters.duration.min !== undefined) {
        query.duration.$gte = filters.duration.min;
      }
      if (filters.duration.max !== undefined) {
        query.duration.$lte = filters.duration.max;
      }
    }
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    return await Video.find(query).populate('packageRequirement').sort({ createdAt: -1 });
  }

  async incrementVideoViews(id: string): Promise<void> {
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  async incrementVideoCompletions(id: string): Promise<void> {
    await Video.findByIdAndUpdate(id, { $inc: { completions: 1 } });
  }

  // Video Progress methods
  async getVideoProgress(clientId: string, videoId: string): Promise<IVideoProgress | null> {
    return await VideoProgress.findOne({ clientId, videoId });
  }

  async updateVideoProgress(
    clientId: string,
    videoId: string,
    watchedDuration: number,
    totalDuration: number
  ): Promise<IVideoProgress> {
    const completed = watchedDuration >= totalDuration * 0.9;
    
    // Check if this is newly completed
    const existing = await VideoProgress.findOne({ clientId, videoId });
    const wasNotCompleted = !existing || !existing.completed;
    const isNowCompleted = completed;
    
    const progress = await VideoProgress.findOneAndUpdate(
      { clientId, videoId },
      {
        watchedDuration,
        totalDuration,
        lastWatchedAt: new Date(),
        completed,
      },
      { upsert: true, new: true }
    );
    
    // Increment completions if newly completed
    if (wasNotCompleted && isNowCompleted) {
      await this.incrementVideoCompletions(videoId);
    }
    
    return progress;
  }

  async getContinueWatching(clientId: string): Promise<any[]> {
    const progressList = await VideoProgress.find({
      clientId,
      completed: false,
      watchedDuration: { $gt: 0 },
    })
      .populate('videoId')
      .sort({ lastWatchedAt: -1 })
      .limit(10);
    
    return progressList.map(p => ({
      video: p.videoId,
      watchedDuration: p.watchedDuration,
      totalDuration: p.totalDuration,
      lastWatchedAt: p.lastWatchedAt,
      progressPercent: Math.round((p.watchedDuration / p.totalDuration) * 100),
    }));
  }

  // Video Bookmark methods
  async getVideoBookmarks(clientId: string): Promise<any[]> {
    const bookmarks = await VideoBookmark.find({ clientId })
      .populate('videoId')
      .sort({ bookmarkedAt: -1 });
    
    return bookmarks.map(b => ({
      ...b.toObject(),
      video: b.videoId,
    }));
  }

  async createVideoBookmark(clientId: string, videoId: string): Promise<IVideoBookmark> {
    const existing = await VideoBookmark.findOne({ clientId, videoId });
    if (existing) {
      return existing;
    }
    
    const bookmark = new VideoBookmark({ clientId, videoId });
    return await bookmark.save();
  }

  async deleteVideoBookmark(clientId: string, videoId: string): Promise<boolean> {
    const result = await VideoBookmark.findOneAndDelete({ clientId, videoId });
    return !!result;
  }

  async isVideoBookmarked(clientId: string, videoId: string): Promise<boolean> {
    const bookmark = await VideoBookmark.findOne({ clientId, videoId });
    return !!bookmark;
  }

  // Progress Photo methods
  async getProgressPhotos(clientId: string): Promise<IProgressPhoto[]> {
    return await ProgressPhoto.find({ clientId }).sort({ uploadedAt: -1 });
  }

  async createProgressPhoto(data: Partial<IProgressPhoto>): Promise<IProgressPhoto> {
    const photo = new ProgressPhoto(data);
    return await photo.save();
  }

  async deleteProgressPhoto(clientId: string, photoId: string): Promise<boolean> {
    const photo = await ProgressPhoto.findById(photoId);
    if (!photo || photo.clientId.toString() !== clientId) {
      return false;
    }
    const result = await ProgressPhoto.findByIdAndDelete(photoId);
    return !!result;
  }

  // Workout Plan methods
  async getClientWorkoutPlans(clientId: string): Promise<IWorkoutPlan[]> {
    return await WorkoutPlan.find({ clientId }).sort({ createdAt: -1 });
  }

  async getWorkoutPlan(id: string): Promise<IWorkoutPlan | null> {
    return await WorkoutPlan.findById(id);
  }

  async createWorkoutPlan(data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    const plan = new WorkoutPlan(data);
    return await plan.save();
  }

  async updateWorkoutPlan(id: string, data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null> {
    data.updatedAt = new Date();
    return await WorkoutPlan.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteWorkoutPlan(id: string): Promise<boolean> {
    const result = await WorkoutPlan.findByIdAndDelete(id);
    return !!result;
  }

  // Diet Plan methods
  async getClientDietPlans(clientId: string): Promise<IDietPlan[]> {
    return await DietPlan.find({ clientId }).sort({ createdAt: -1 });
  }

  async getDietPlan(id: string): Promise<IDietPlan | null> {
    return await DietPlan.findById(id);
  }

  async createDietPlan(data: Partial<IDietPlan>): Promise<IDietPlan> {
    const plan = new DietPlan(data);
    return await plan.save();
  }

  async updateDietPlan(id: string, data: Partial<IDietPlan>): Promise<IDietPlan | null> {
    data.updatedAt = new Date();
    return await DietPlan.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteDietPlan(id: string): Promise<boolean> {
    const result = await DietPlan.findByIdAndDelete(id);
    return !!result;
  }

  async getDietPlanTemplates(category?: string): Promise<IDietPlan[]> {
    const query: any = { isTemplate: true };
    if (category) {
      query.category = category;
    }
    return await DietPlan.find(query).sort({ createdAt: -1 });
  }

  async cloneDietPlan(planId: string, clientId?: string): Promise<IDietPlan> {
    const originalPlan = await DietPlan.findById(planId);
    if (!originalPlan) {
      throw new Error('Diet plan not found');
    }
    
    const clonedPlan = new DietPlan({
      clientId: clientId || undefined,
      name: clientId ? originalPlan.name : `${originalPlan.name} (Copy)`,
      description: originalPlan.description,
      category: originalPlan.category,
      targetCalories: originalPlan.targetCalories,
      protein: originalPlan.protein,
      carbs: originalPlan.carbs,
      fats: originalPlan.fats,
      meals: originalPlan.meals,
      allergens: originalPlan.allergens,
      waterIntakeGoal: originalPlan.waterIntakeGoal,
      supplements: originalPlan.supplements,
      isTemplate: clientId ? false : originalPlan.isTemplate,
      createdBy: originalPlan.createdBy,
      clonedFrom: planId,
    });
    
    if (originalPlan.isTemplate) {
      await DietPlan.findByIdAndUpdate(planId, { 
        $inc: { assignedCount: 1, timesCloned: 1 } 
      });
    }
    
    return await clonedPlan.save();
  }

  async getAllDietPlansWithAssignments(): Promise<any[]> {
    const plans = await DietPlan.find().populate('clientId');
    return plans;
  }

  async getTrainerClients(trainerId: string): Promise<IClient[]> {
    // Get the user to find their trainer profile
    const user = await User.findById(trainerId);
    if (!user || !user.trainerId) {
      return [];
    }
    
    // Get the trainer profile which has the assignedClients
    const trainerProfile = await Trainer.findById(user.trainerId);
    if (!trainerProfile || !trainerProfile.assignedClients) {
      return [];
    }
    
    const assignedClientIds = trainerProfile.assignedClients.map((c: any) => 
      typeof c === 'object' ? c._id : c
    );
    
    return await Client.find({ 
      _id: { $in: assignedClientIds },
      status: { $ne: 'inactive' }
    })
      .populate('packageId')
      .sort({ createdAt: -1 });
  }

  async getTrainerDietPlans(trainerId: string): Promise<IDietPlan[]> {
    return await DietPlan.find({ assignedTrainerId: trainerId })
      .populate('clientId')
      .populate('assignedTrainerId')
      .sort({ createdAt: -1 });
  }

  async getTrainerSessions(trainerId: string): Promise<ILiveSession[]> {
    return await LiveSession.find({ trainerId: trainerId })
      .populate('trainerId')
      .sort({ date: -1 });
  }

  // Meal methods
  async getAllMeals(filters?: { category?: string; mealType?: string; search?: string }): Promise<IMeal[]> {
    const query: any = {};
    
    if (filters?.category) {
      query.category = filters.category;
    }
    
    if (filters?.mealType) {
      query.mealType = filters.mealType;
    }
    
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }
    
    return await Meal.find(query).sort({ createdAt: -1 });
  }

  async getMeal(id: string): Promise<IMeal | null> {
    return await Meal.findById(id);
  }

  async createMeal(data: Partial<IMeal>): Promise<IMeal> {
    const meal = new Meal(data);
    return await meal.save();
  }

  async updateMeal(id: string, data: Partial<IMeal>): Promise<IMeal | null> {
    data.updatedAt = new Date();
    return await Meal.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteMeal(id: string): Promise<boolean> {
    const result = await Meal.findByIdAndDelete(id);
    return !!result;
  }

  // Live Session methods
  async getAllSessions(): Promise<ILiveSession[]> {
    return await LiveSession.find().sort({ scheduledAt: 1 });
  }

  async getSession(id: string): Promise<ILiveSession | null> {
    return await LiveSession.findById(id);
  }

  async createSession(data: Partial<ILiveSession>): Promise<ILiveSession> {
    const session = new LiveSession(data);
    return await session.save();
  }

  async updateSession(id: string, data: Partial<ILiveSession>): Promise<ILiveSession | null> {
    return await LiveSession.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await LiveSession.findByIdAndDelete(id);
    return !!result;
  }

  async getClientSessions(clientId: string): Promise<ILiveSession[]> {
    const sessionClients = await SessionClient.find({ clientId }).populate('sessionId');
    return sessionClients.map(sc => sc.sessionId as any);
  }

  // Session Client methods
  async assignClientToSession(sessionId: string, clientId: string): Promise<ISessionClient> {
    const sessionClient = new SessionClient({ sessionId, clientId });
    return await sessionClient.save();
  }

  async removeClientFromSession(sessionId: string, clientId: string): Promise<boolean> {
    const result = await SessionClient.findOneAndDelete({ sessionId, clientId });
    return !!result;
  }

  async getSessionClients(sessionId: string): Promise<IClient[]> {
    const sessionClients = await SessionClient.find({ sessionId }).populate('clientId');
    return sessionClients.map(sc => sc.clientId as any);
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<ILiveSession[]> {
    return await LiveSession.find({
      scheduledAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ scheduledAt: 1 });
  }

  async cancelSession(id: string): Promise<ILiveSession | null> {
    return await LiveSession.findByIdAndUpdate(
      id,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );
  }

  async createRecurringSessions(
    baseData: Partial<ILiveSession>,
    pattern: string,
    days: string[],
    endDate: Date
  ): Promise<ILiveSession[]> {
    const sessions: ILiveSession[] = [];
    
    // Create parent session
    const parentSession = await this.createSession({
      ...baseData,
      isRecurring: true,
      recurringPattern: pattern,
      recurringDays: days,
      recurringEndDate: endDate,
    });
    
    sessions.push(parentSession);
    
    // Generate child sessions based on pattern
    const startDate = new Date(baseData.scheduledAt!);
    const currentDate = new Date(startDate);
    
    // Weekly pattern
    if (pattern === 'weekly') {
      while (currentDate <= endDate) {
        currentDate.setDate(currentDate.getDate() + 7);
        
        if (currentDate <= endDate) {
          const childSession = await this.createSession({
            ...baseData,
            scheduledAt: new Date(currentDate),
            isRecurring: false,
            parentSessionId: String(parentSession._id),
          });
          sessions.push(childSession);
        }
      }
    }
    
    return sessions;
  }

  async bookSessionSpot(sessionId: string, clientId: string): Promise<{ success: boolean; message: string; booking?: ISessionClient }> {
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return { success: false, message: 'Session not found' };
    }
    
    // Check if already booked
    const existingBooking = await SessionClient.findOne({ sessionId, clientId });
    if (existingBooking) {
      return { success: false, message: 'Already booked for this session' };
    }
    
    // Check capacity
    if (session.currentCapacity >= session.maxCapacity) {
      return { success: false, message: 'Session is full' };
    }
    
    // Create booking
    const booking = new SessionClient({ sessionId, clientId });
    await booking.save();
    
    // Update capacity
    await LiveSession.findByIdAndUpdate(sessionId, {
      currentCapacity: session.currentCapacity + 1,
      updatedAt: new Date()
    });
    
    return { success: true, message: 'Booking successful', booking };
  }

  // Session Waitlist methods
  async addToWaitlist(sessionId: string, clientId: string): Promise<{ success: boolean; message: string; position?: number }> {
    // Check if already in waitlist
    const existing = await SessionWaitlist.findOne({ sessionId, clientId });
    if (existing) {
      return { success: false, message: 'Already in waitlist' };
    }
    
    // Get current waitlist count for position
    const waitlistCount = await SessionWaitlist.countDocuments({ sessionId });
    const position = waitlistCount + 1;
    
    const waitlistEntry = new SessionWaitlist({
      sessionId,
      clientId,
      position
    });
    await waitlistEntry.save();
    
    return { success: true, message: 'Added to waitlist', position };
  }

  async removeFromWaitlist(sessionId: string, clientId: string): Promise<boolean> {
    const result = await SessionWaitlist.findOneAndDelete({ sessionId, clientId });
    
    if (result) {
      // Reorder remaining waitlist entries
      const remainingEntries = await SessionWaitlist.find({ sessionId }).sort({ position: 1 });
      for (let i = 0; i < remainingEntries.length; i++) {
        await SessionWaitlist.findByIdAndUpdate(remainingEntries[i]._id, { position: i + 1 });
      }
    }
    
    return !!result;
  }

  async getSessionWaitlist(sessionId: string): Promise<any[]> {
    const waitlistEntries = await SessionWaitlist.find({ sessionId })
      .populate('clientId')
      .sort({ position: 1 });
    
    return waitlistEntries.map(entry => ({
      id: entry._id,
      position: entry.position,
      client: entry.clientId,
      addedAt: entry.addedAt
    }));
  }

  async getClientWaitlist(clientId: string): Promise<any[]> {
    const waitlistEntries = await SessionWaitlist.find({ clientId })
      .populate('sessionId')
      .sort({ addedAt: -1 });
    
    return waitlistEntries.map(entry => ({
      id: entry._id,
      position: entry.position,
      session: entry.sessionId,
      addedAt: entry.addedAt
    }));
  }

  // Workout Session methods
  async getClientWorkoutSessions(clientId: string): Promise<IWorkoutSession[]> {
    return await WorkoutSession.find({ clientId }).sort({ completedAt: -1 });
  }

  async createWorkoutSession(data: Partial<IWorkoutSession>): Promise<IWorkoutSession> {
    const session = new WorkoutSession(data);
    return await session.save();
  }

  async getWorkoutSessionStats(clientId: string): Promise<any> {
    const allSessions = await WorkoutSession.find({ clientId }).sort({ completedAt: -1 });
    const sessions = allSessions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalSessions = sessions.length;
    const weekSessions = sessions.filter(s => s.completedAt >= weekAgo).length;
    const monthSessions = sessions.filter(s => s.completedAt >= monthAgo).length;
    
    const totalCalories = sessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
    const weekCalories = sessions.filter(s => s.completedAt >= weekAgo).reduce((sum, s) => sum + s.caloriesBurned, 0);
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    const sortedSessions = [...sessions].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt.getFullYear(), session.completedAt.getMonth(), session.completedAt.getDate());
      
      if (lastDate) {
        const dayDiff = Math.floor((sessionDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (dayDiff === 0) {
          continue;
        } else if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = sessionDate;
    }
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    if (lastDate) {
      const daysSinceLastWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      currentStreak = daysSinceLastWorkout <= 1 ? tempStreak : 0;
    }
    
    return {
      totalSessions,
      weekSessions,
      monthSessions,
      totalCalories,
      weekCalories,
      currentStreak,
      maxStreak,
      recentSessions: sessions.slice(0, 10),
      allSessions: sessions,
    };
  }

  // Achievement methods
  async getClientAchievements(clientId: string): Promise<IAchievement[]> {
    return await Achievement.find({ clientId }).sort({ unlockedAt: -1 });
  }

  async createAchievement(data: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = new Achievement(data);
    return await achievement.save();
  }
  
  // Progress Tracking - Weight methods (in-memory storage for demo)
  private weightData = new Map<string, { entries: any[]; goal: number | null }>();
  
  async getClientWeightHistory(clientId: string): Promise<any[]> {
    const data = this.weightData.get(clientId);
    return data?.entries || [];
  }
  
  async createWeightEntry(clientId: string, weight: number, date: string): Promise<any> {
    const data = this.weightData.get(clientId) || { entries: [], goal: null };
    const entry = { weight, date };
    data.entries.unshift(entry);
    this.weightData.set(clientId, data);
    return entry;
  }
  
  async getClientWeightGoal(clientId: string): Promise<number | null> {
    const data = this.weightData.get(clientId);
    return data?.goal || null;
  }
  
  async setClientWeightGoal(clientId: string, goalWeight: number): Promise<any> {
    const data = this.weightData.get(clientId) || { entries: [], goal: null };
    data.goal = goalWeight;
    this.weightData.set(clientId, data);
    return { goal: goalWeight };
  }
  
  // Progress Tracking - Body Measurements methods (in-memory)
  private measurementsData = new Map<string, any[]>();
  
  async getClientBodyMeasurementsHistory(clientId: string): Promise<any[]> {
    return this.measurementsData.get(clientId) || [];
  }
  
  async createBodyMeasurement(clientId: string, measurements: any, date: string): Promise<any> {
    const history = this.measurementsData.get(clientId) || [];
    const entry = { ...measurements, date };
    history.unshift(entry);
    this.measurementsData.set(clientId, history);
    return entry;
  }
  
  // Progress Tracking - Personal Records methods (in-memory)
  private personalRecordsData = new Map<string, any[]>();
  
  async getClientPersonalRecords(clientId: string): Promise<any[]> {
    return this.personalRecordsData.get(clientId) || [];
  }
  
  async createPersonalRecord(clientId: string, category: string, value: number, date: string): Promise<any> {
    const records = this.personalRecordsData.get(clientId) || [];
    const record = { category, value, date };
    records.unshift(record);
    this.personalRecordsData.set(clientId, records);
    return record;
  }
  
  // Progress Tracking - Weekly Completion methods (in-memory)
  async getClientWeeklyCompletion(clientId: string): Promise<any> {
    const sessions = await this.getClientWorkoutSessions(clientId);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const completedThisWeek = sessions.filter((s: any) => new Date(s.date) >= startOfWeek);
    
    return {
      completedWorkouts: completedThisWeek.length,
      plannedWorkouts: 5,
      completedDays: completedThisWeek.map((s: any) => s.date),
      average: Math.round(sessions.length / 4),
    };
  }
  
  async getWeeklyCompletionHistory(clientId: string): Promise<any[]> {
    const sessions = await this.getClientWorkoutSessions(clientId);
    const weeks: any[] = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekSessions = sessions.filter((s: any) => {
        const date = new Date(s.date);
        return date >= weekStart && date <= weekEnd;
      });
      
      weeks.push({
        startDate: weekStart.toISOString(),
        completed: weekSessions.length,
        planned: 5,
      });
    }
    
    return weeks;
  }
  
  // Goal methods
  async getClientGoals(clientId: string): Promise<IGoal[]> {
    return await Goal.find({ clientId, status: { $ne: 'abandoned' } }).sort({ createdAt: -1 });
  }
  
  async getGoal(id: string): Promise<IGoal | null> {
    return await Goal.findById(id);
  }
  
  async createGoal(data: Partial<IGoal>): Promise<IGoal> {
    const goal = new Goal(data);
    return await goal.save();
  }
  
  async updateGoal(id: string, data: Partial<IGoal>): Promise<IGoal | null> {
    data.updatedAt = new Date();
    return await Goal.findByIdAndUpdate(id, data, { new: true });
  }
  
  async deleteGoal(id: string): Promise<boolean> {
    const result = await Goal.findByIdAndDelete(id);
    return !!result;
  }
  
  async updateGoalProgress(goalId: string, currentValue: number): Promise<IGoal | null> {
    const goal = await Goal.findById(goalId);
    if (!goal) return null;
    
    const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
    const updatedMilestones = goal.milestones.map(milestone => {
      if (!milestone.achieved && currentValue >= milestone.value) {
        return {
          value: milestone.value,
          label: milestone.label,
          achieved: true,
          achievedAt: new Date(),
        };
      }
      return milestone;
    });
    
    const status = progress >= 100 ? 'completed' : 'active';
    
    return await Goal.findByIdAndUpdate(
      goalId,
      {
        currentValue,
        progress,
        status,
        milestones: updatedMilestones,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }
  
  // Payment History methods
  async getClientPaymentHistory(clientId: string): Promise<IPaymentHistory[]> {
    return await PaymentHistory.find({ clientId })
      .populate('packageId')
      .sort({ billingDate: -1 });
  }
  
  async createPaymentRecord(data: Partial<IPaymentHistory>): Promise<IPaymentHistory> {
    const payment = new PaymentHistory(data);
    return await payment.save();
  }
  
  // Communication - Message methods
  async getConversationMessages(conversationId: string): Promise<IMessage[]> {
    return await Message.find({ conversationId }).sort({ createdAt: 1 });
  }
  
  async getClientConversations(clientId: string): Promise<any[]> {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: clientId }, { receiverId: clientId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', clientId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    return messages;
  }
  
  async sendMessage(data: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(data);
    return await message.save();
  }
  
  async markMessageAsRead(messageId: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }
  
  async getUnreadMessageCount(userId: string): Promise<number> {
    return await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });
  }
  
  // Communication - Ticket methods
  async getClientTickets(clientId: string): Promise<ITicket[]> {
    return await Ticket.find({ clientId }).sort({ createdAt: -1 });
  }
  
  async getTicket(ticketNumber: string): Promise<ITicket | null> {
    return await Ticket.findOne({ ticketNumber });
  }
  
  async createTicket(data: Partial<ITicket>): Promise<ITicket> {
    const ticketCount = await Ticket.countDocuments();
    data.ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;
    const ticket = new Ticket(data);
    return await ticket.save();
  }
  
  async addTicketResponse(ticketNumber: string, response: any): Promise<ITicket | null> {
    return await Ticket.findOneAndUpdate(
      { ticketNumber },
      { 
        $push: { responses: response },
        updatedAt: new Date()
      },
      { new: true }
    );
  }
  
  async updateTicketStatus(ticketNumber: string, status: string): Promise<ITicket | null> {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    } else if (status === 'closed') {
      updateData.closedAt = new Date();
    }
    
    return await Ticket.findOneAndUpdate(
      { ticketNumber },
      updateData,
      { new: true }
    );
  }
  
  // Communication - Announcement methods
  async getAllAnnouncements(targetAudience?: string): Promise<IAnnouncement[]> {
    const query: any = {};
    
    if (targetAudience) {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience }
      ];
    }
    
    const now = new Date();
    query.$or = query.$or || [];
    if (query.$or.length === 0) {
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: now } }
      ];
    }
    
    return await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 });
  }
  
  async getAnnouncement(id: string): Promise<IAnnouncement | null> {
    return await Announcement.findById(id);
  }
  
  async createAnnouncement(data: Partial<IAnnouncement>): Promise<IAnnouncement> {
    const announcement = new Announcement(data);
    return await announcement.save();
  }
  
  // Communication - Forum methods
  async getAllForumTopics(category?: string): Promise<IForumTopic[]> {
    const query: any = {};
    if (category) {
      query.category = category;
    }
    
    return await ForumTopic.find(query)
      .sort({ isPinned: -1, lastActivityAt: -1 });
  }
  
  async getForumTopic(id: string): Promise<IForumTopic | null> {
    return await ForumTopic.findById(id);
  }
  
  async createForumTopic(data: Partial<IForumTopic>): Promise<IForumTopic> {
    const topic = new ForumTopic(data);
    return await topic.save();
  }
  
  async addForumReply(topicId: string, reply: any): Promise<IForumTopic | null> {
    return await ForumTopic.findByIdAndUpdate(
      topicId,
      { 
        $push: { replies: reply },
        lastActivityAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
  }
  
  async incrementTopicViews(topicId: string): Promise<void> {
    await ForumTopic.findByIdAndUpdate(topicId, { $inc: { viewCount: 1 } });
  }
  
  async toggleTopicLike(topicId: string, increment: boolean): Promise<IForumTopic | null> {
    return await ForumTopic.findByIdAndUpdate(
      topicId,
      { $inc: { likeCount: increment ? 1 : -1 } },
      { new: true }
    );
  }
  
  // User/Authentication methods
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }
  
  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).populate('clientId');
  }
  
  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new User({
      ...data,
      email: data.email?.toLowerCase(),
    });
    return await user.save();
  }
  
  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }
    return await User.findByIdAndUpdate(id, updateData, { new: true }).populate('clientId');
  }
  
  async getAllUsers(role?: string): Promise<IUser[]> {
    const query = role ? { role } : {};
    return await User.find(query).populate('clientId').sort({ createdAt: -1 });
  }
  
  async getAllTrainers(): Promise<IUser[]> {
    return await this.getAllUsers('trainer');
  }
  
  async getTrainer(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }
  
  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
  
  async initializeDefaultUsers(): Promise<void> {
    const { hashPassword } = await import('./utils/auth');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      const adminPassword = await hashPassword('Admin@123');
      await this.createUser({
        email: 'admin@gmail.com',
        password: adminPassword,
        role: 'admin',
        name: 'Admin',
      });
    }
    
    // Check if client already exists
    const existingClient = await User.findOne({ email: 'abhijeet18012001@gmail.com' });
    if (!existingClient) {
      // Create client in Client collection
      const packages = await this.getAllPackages();
      const premiumPackage = packages.find(p => p.name === 'Premium');
      
      const client = await this.createClient({
        name: 'Abhijeet',
        phone: '8600126395',
        email: 'abhijeet18012001@gmail.com',
        packageId: premiumPackage?._id?.toString(),
      });
      
      // Create user account for client
      const clientPassword = await hashPassword('Abhi@123');
      await this.createUser({
        email: 'abhijeet18012001@gmail.com',
        password: clientPassword,
        role: 'client',
        name: 'Abhijeet',
        phone: '8600126395',
        clientId: client._id?.toString(),
      });
    }
  }
  
  // System Settings methods
  async getSystemSettings(): Promise<ISystemSettings> {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await this.initializeSystemSettings();
    }
    return settings as ISystemSettings;
  }
  
  async updateSystemSettings(data: Partial<ISystemSettings>): Promise<ISystemSettings> {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await this.initializeSystemSettings();
    }
    
    const updated = await SystemSettings.findByIdAndUpdate(
      settings._id,
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    
    return updated as ISystemSettings;
  }
  
  async initializeSystemSettings(): Promise<ISystemSettings> {
    const defaultSettings = new SystemSettings({
      branding: {
        gymName: 'FitPro',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        tagline: 'Transform Your Body, Transform Your Life'
      },
      userRoles: [
        {
          roleName: 'Admin',
          permissions: ['all'],
          description: 'Full system access and control'
        },
        {
          roleName: 'Trainer',
          permissions: ['view_clients', 'manage_workouts', 'manage_diet', 'manage_sessions'],
          description: 'Manage client training programs and sessions'
        },
        {
          roleName: 'Receptionist',
          permissions: ['view_clients', 'manage_clients', 'view_payments'],
          description: 'Client management and front desk operations'
        }
      ]
    });
    
    return await defaultSettings.save();
  }

  // Notification methods
  async createNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(data);
    return await notification.save();
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  async markNotificationAsRead(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount || 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(id);
    return !!result;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}

export const storage = new MongoStorage();
