import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  description?: string;
  price: number;
  features: string[];
  videoAccess: boolean;
  liveSessionsPerMonth: number;
  dietPlanAccess: boolean;
  workoutPlanAccess: boolean;
}

export interface IClient extends Document {
  name: string;
  phone: string;
  email?: string;
  packageId?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string;
  createdAt: Date;
}

export interface IBodyMetrics extends Document {
  clientId: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  idealWeight?: number;
  targetCalories?: number;
  activityLevel: string;
  goal: string;
  recordedAt: Date;
}

export interface IVideo extends Document {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  category: string;
  duration?: number;
  packageRequirement?: string;
  createdAt: Date;
}

export interface IClientVideo extends Document {
  clientId: string;
  videoId: string;
  assignedAt: Date;
}

export interface IWorkoutPlan extends Document {
  clientId: string;
  name: string;
  description?: string;
  goal?: string;
  durationWeeks: number;
  exercises: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDietPlan extends Document {
  clientId: string;
  name: string;
  targetCalories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  meals: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILiveSession extends Document {
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
  status: string;
  createdAt: Date;
}

export interface ISessionClient extends Document {
  sessionId: string;
  clientId: string;
  attended: boolean;
}

const PackageSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  features: [String],
  videoAccess: { type: Boolean, default: false },
  liveSessionsPerMonth: { type: Number, default: 0 },
  dietPlanAccess: { type: Boolean, default: false },
  workoutPlanAccess: { type: Boolean, default: false },
});

const ClientSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: String,
  packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  goal: String,
  createdAt: { type: Date, default: Date.now },
});

const BodyMetricsSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bmi: Number,
  bmr: Number,
  tdee: Number,
  idealWeight: Number,
  targetCalories: Number,
  activityLevel: { type: String, required: true },
  goal: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now },
});

const VideoSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true },
  thumbnail: String,
  category: { type: String, required: true },
  duration: Number,
  packageRequirement: { type: Schema.Types.ObjectId, ref: 'Package' },
  createdAt: { type: Date, default: Date.now },
});

const ClientVideoSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  assignedAt: { type: Date, default: Date.now },
});

const WorkoutPlanSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  description: String,
  goal: String,
  durationWeeks: { type: Number, required: true },
  exercises: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DietPlanSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  targetCalories: { type: Number, required: true },
  protein: Number,
  carbs: Number,
  fats: Number,
  meals: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LiveSessionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  meetingLink: String,
  status: { type: String, default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
});

const SessionClientSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  attended: { type: Boolean, default: false },
});

export const Package = mongoose.model<IPackage>('Package', PackageSchema);
export const Client = mongoose.model<IClient>('Client', ClientSchema);
export const BodyMetrics = mongoose.model<IBodyMetrics>('BodyMetrics', BodyMetricsSchema);
export const Video = mongoose.model<IVideo>('Video', VideoSchema);
export const ClientVideo = mongoose.model<IClientVideo>('ClientVideo', ClientVideoSchema);
export const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
export const DietPlan = mongoose.model<IDietPlan>('DietPlan', DietPlanSchema);
export const LiveSession = mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema);
export const SessionClient = mongoose.model<ISessionClient>('SessionClient', SessionClientSchema);
