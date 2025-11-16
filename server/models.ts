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
  bio?: string;
  address?: string;
  profilePhoto?: string;
  medicalConditions?: string[];
  injuries?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  limitations?: string;
  language?: 'en' | 'hi';
  status?: 'active' | 'inactive' | 'pending';
  adminNotes?: string;
  lastActivityDate?: Date;
  notificationPreferences?: {
    email: boolean;
    sessionReminders: boolean;
    achievements: boolean;
  };
  privacySettings?: {
    showEmail: boolean;
    showPhone: boolean;
    showProgress: boolean;
  };
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
  intensity?: string;
  difficulty?: string;
  trainer?: string;
  packageRequirement?: string;
  equipment?: string[];
  views?: number;
  completions?: number;
  isDraft?: boolean;
  createdAt: Date;
  updatedAt?: Date;
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
  clientId?: string;
  name: string;
  description?: string;
  category?: string;
  targetCalories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  meals: any;
  allergens?: string[];
  waterIntakeGoal?: number;
  supplements?: Array<{
    name: string;
    dosage: string;
    timing: string;
  }>;
  isTemplate?: boolean;
  createdBy?: string;
  assignedCount?: number;
  clonedFrom?: string;
  timesCloned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMeal extends Document {
  name: string;
  category: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  imageUrl?: string;
  createdBy?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILiveSession extends Document {
  title: string;
  description?: string;
  sessionType: string;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
  trainerName?: string;
  maxCapacity: number;
  currentCapacity: number;
  status: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringDays?: string[];
  recurringEndDate?: Date;
  parentSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionClient extends Document {
  sessionId: string;
  clientId: string;
  attended: boolean;
  bookedAt: Date;
}

export interface ISessionWaitlist extends Document {
  sessionId: string;
  clientId: string;
  position: number;
  addedAt: Date;
}

export interface IWorkoutSession extends Document {
  clientId: string;
  workoutPlanId?: string;
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  exercises: any;
  completedAt: Date;
  notes?: string;
}

export interface IVideoProgress extends Document {
  clientId: string;
  videoId: string;
  watchedDuration: number;
  totalDuration: number;
  lastWatchedAt: Date;
  completed: boolean;
}

export interface IVideoBookmark extends Document {
  clientId: string;
  videoId: string;
  bookmarkedAt: Date;
}

export interface IProgressPhoto extends Document {
  clientId: string;
  photoUrl: string;
  description?: string;
  weight?: number;
  uploadedAt: Date;
}

export interface IAchievement extends Document {
  clientId: string;
  type: string;
  title: string;
  description: string;
  unlockedAt: Date;
  metadata?: any;
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
  bio: String,
  address: String,
  profilePhoto: String,
  medicalConditions: [String],
  injuries: [String],
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  limitations: String,
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  adminNotes: String,
  lastActivityDate: Date,
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
  },
  privacySettings: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showProgress: { type: Boolean, default: true },
  },
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
  intensity: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  trainer: String,
  packageRequirement: { type: Schema.Types.ObjectId, ref: 'Package' },
  equipment: [String],
  views: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
  isDraft: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: { type: String, required: true },
  description: String,
  category: String,
  targetCalories: { type: Number, required: true },
  protein: Number,
  carbs: Number,
  fats: Number,
  meals: { type: Schema.Types.Mixed, required: true },
  allergens: [String],
  waterIntakeGoal: Number,
  supplements: [{
    name: String,
    dosage: String,
    timing: String
  }],
  isTemplate: { type: Boolean, default: false },
  createdBy: String,
  assignedCount: { type: Number, default: 0 },
  clonedFrom: { type: Schema.Types.ObjectId, ref: 'DietPlan' },
  timesCloned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MealSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  mealType: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  ingredients: [String],
  instructions: String,
  prepTime: Number,
  cookTime: Number,
  servings: { type: Number, default: 1 },
  tags: [String],
  imageUrl: String,
  createdBy: String,
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LiveSessionSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  sessionType: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  meetingLink: String,
  trainerName: String,
  maxCapacity: { type: Number, default: 15, required: true },
  currentCapacity: { type: Number, default: 0, required: true },
  status: { type: String, default: 'upcoming', required: true },
  isRecurring: { type: Boolean, default: false, required: true },
  recurringPattern: String,
  recurringDays: [String],
  recurringEndDate: Date,
  parentSessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SessionClientSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  attended: { type: Boolean, default: false },
  bookedAt: { type: Date, default: Date.now },
});

const SessionWaitlistSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  position: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
});

const WorkoutSessionSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  workoutName: { type: String, required: true },
  duration: { type: Number, required: true },
  caloriesBurned: { type: Number, required: true },
  exercises: { type: Schema.Types.Mixed },
  completedAt: { type: Date, default: Date.now },
  notes: String,
});

const VideoProgressSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  watchedDuration: { type: Number, required: true, default: 0 },
  totalDuration: { type: Number, required: true },
  lastWatchedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});

const VideoBookmarkSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  bookmarkedAt: { type: Date, default: Date.now },
});

const ProgressPhotoSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  photoUrl: { type: String, required: true },
  description: String,
  weight: Number,
  uploadedAt: { type: Date, default: Date.now },
});

const AchievementSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  metadata: Schema.Types.Mixed,
});

export interface IGoal extends Document {
  clientId: string;
  goalType: 'weight' | 'fitness' | 'nutrition';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: Date;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  milestones: Array<{
    value: number;
    label: string;
    achieved: boolean;
    achievedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  goalType: { type: String, enum: ['weight', 'fitness', 'nutrition'], required: true },
  title: { type: String, required: true },
  description: String,
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  targetDate: Date,
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  progress: { type: Number, default: 0 },
  milestones: [{
    value: { type: Number, required: true },
    label: { type: String, required: true },
    achieved: { type: Boolean, default: false },
    achievedAt: Date,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface IPaymentHistory extends Document {
  clientId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  invoiceNumber: string;
  paymentMethod: string;
  packageId?: string;
  packageName?: string;
  billingDate: Date;
  nextBillingDate?: Date;
  receiptUrl?: string;
  createdAt: Date;
}

const PaymentHistorySchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  transactionId: String,
  invoiceNumber: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
  packageName: String,
  billingDate: { type: Date, required: true },
  nextBillingDate: Date,
  receiptUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export const Package = mongoose.model<IPackage>('Package', PackageSchema);
export const Client = mongoose.model<IClient>('Client', ClientSchema);
export const BodyMetrics = mongoose.model<IBodyMetrics>('BodyMetrics', BodyMetricsSchema);
export const Video = mongoose.model<IVideo>('Video', VideoSchema);
export const ClientVideo = mongoose.model<IClientVideo>('ClientVideo', ClientVideoSchema);
export const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
export const DietPlan = mongoose.model<IDietPlan>('DietPlan', DietPlanSchema);
export const Meal = mongoose.model<IMeal>('Meal', MealSchema);
export const LiveSession = mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema);
export const SessionClient = mongoose.model<ISessionClient>('SessionClient', SessionClientSchema);
export const SessionWaitlist = mongoose.model<ISessionWaitlist>('SessionWaitlist', SessionWaitlistSchema);
export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
export const VideoProgress = mongoose.model<IVideoProgress>('VideoProgress', VideoProgressSchema);
export const VideoBookmark = mongoose.model<IVideoBookmark>('VideoBookmark', VideoBookmarkSchema);
export const ProgressPhoto = mongoose.model<IProgressPhoto>('ProgressPhoto', ProgressPhotoSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
export const PaymentHistory = mongoose.model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
