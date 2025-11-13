import mongoose from 'mongoose';
import {
  Package,
  Client,
  BodyMetrics,
  Video,
  ClientVideo,
  WorkoutPlan,
  DietPlan,
  LiveSession,
  SessionClient,
  type IPackage,
  type IClient,
  type IBodyMetrics,
  type IVideo,
  type IClientVideo,
  type IWorkoutPlan,
  type IDietPlan,
  type ILiveSession,
  type ISessionClient,
} from './models';

export interface IStorage {
  // Package methods
  getAllPackages(): Promise<IPackage[]>;
  getPackage(id: string): Promise<IPackage | null>;
  createPackage(data: Partial<IPackage>): Promise<IPackage>;
  updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage | null>;
  
  // Client methods
  getAllClients(): Promise<IClient[]>;
  getClient(id: string): Promise<IClient | null>;
  getClientByPhone(phone: string): Promise<IClient | null>;
  createClient(data: Partial<IClient>): Promise<IClient>;
  updateClient(id: string, data: Partial<IClient>): Promise<IClient | null>;
  deleteClient(id: string): Promise<boolean>;
  
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
  
  // Client Video methods
  getClientVideos(clientId: string): Promise<IVideo[]>;
  assignVideoToClient(clientId: string, videoId: string): Promise<IClientVideo>;
  removeVideoFromClient(clientId: string, videoId: string): Promise<boolean>;
  
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
  
  // Live Session methods
  getAllSessions(): Promise<ILiveSession[]>;
  getSession(id: string): Promise<ILiveSession | null>;
  createSession(data: Partial<ILiveSession>): Promise<ILiveSession>;
  updateSession(id: string, data: Partial<ILiveSession>): Promise<ILiveSession | null>;
  deleteSession(id: string): Promise<boolean>;
  getClientSessions(clientId: string): Promise<ILiveSession[]>;
  
  // Session Client methods
  assignClientToSession(sessionId: string, clientId: string): Promise<ISessionClient>;
  removeClientFromSession(sessionId: string, clientId: string): Promise<boolean>;
  getSessionClients(sessionId: string): Promise<IClient[]>;
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
  async getAllClients(): Promise<IClient[]> {
    return await Client.find().populate('packageId');
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
    const result = await Client.findByIdAndDelete(id);
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
}

export const storage = new MongoStorage();
