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
  phone?: string;
  email: string;
  packageId?: string;
  trainerId?: string;
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
  subscription?: {
    startDate?: Date;
    endDate?: Date;
    renewalType?: 'monthly' | 'yearly';
    autoRenewal?: boolean;
    paymentMethodId?: string;
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
  clientId?: string;
  name: string;
  description?: string;
  goal?: string;
  category?: string;
  durationWeeks: number;
  exercises: any;
  isTemplate?: boolean;
  createdBy?: string;
  assignedCount?: number;
  clonedFrom?: string;
  timesCloned?: number;
  difficulty?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDietPlan extends Document {
  clientId?: string;
  trainerId?: string;
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
  meetingPassword?: string;
  trainerName?: string;
  trainerId?: string;
  maxCapacity: number;
  currentCapacity: number;
  status: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringDays?: string[];
  recurringEndDate?: Date;
  parentSessionId?: string;
  recordingUrl?: string;
  recordingPassword?: string;
  recordingAvailableUntil?: Date;
  zoomMeetingId?: string;
  joinUrl?: string;
  startUrl?: string;
  hostId?: string;
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
  isEncrypted?: boolean;
  encryptionIV?: string;
  encryptionSalt?: string;
  encryptionTag?: string;
  originalName?: string;
  mimetype?: string;
}

export interface IAchievement extends Document {
  clientId: string;
  type: string;
  title: string;
  description: string;
  unlockedAt: Date;
  metadata?: any;
}

export interface ITrainer extends Document {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  profilePhoto?: string;
  certifications?: string[];
  experience?: number;
  assignedClients?: string[];
  availability?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  status?: 'active' | 'inactive';
  createdAt: Date;
}

const TrainerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  specialty: String,
  bio: String,
  profilePhoto: String,
  certifications: [String],
  experience: Number,
  assignedClients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  availability: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String },
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

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
  phone: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
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
  subscription: {
    startDate: Date,
    endDate: Date,
    renewalType: { type: String, enum: ['monthly', 'yearly'] },
    autoRenewal: { type: Boolean, default: false },
    paymentMethodId: String,
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
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: { type: String, required: true },
  description: String,
  goal: String,
  category: { type: String, enum: ['weight_loss', 'weight_gain', 'maintenance', 'general'] },
  durationWeeks: { type: Number, required: true },
  exercises: { type: Schema.Types.Mixed, required: true },
  isTemplate: { type: Boolean, default: false },
  createdBy: String,
  assignedCount: { type: Number, default: 0 },
  clonedFrom: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan' },
  timesCloned: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DietPlanSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
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
  meetingPassword: String,
  trainerName: String,
  trainerId: String,
  maxCapacity: { type: Number, default: 15, required: true },
  currentCapacity: { type: Number, default: 0, required: true },
  status: { type: String, default: 'upcoming', required: true },
  isRecurring: { type: Boolean, default: false, required: true },
  recurringPattern: String,
  recurringDays: [String],
  recurringEndDate: Date,
  parentSessionId: { type: Schema.Types.ObjectId, ref: 'LiveSession' },
  recordingUrl: String,
  recordingPassword: String,
  recordingAvailableUntil: Date,
  zoomMeetingId: String,
  joinUrl: String,
  startUrl: String,
  hostId: String,
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
  isEncrypted: { type: Boolean, default: false },
  encryptionIV: String,
  encryptionSalt: String,
  encryptionTag: String,
  originalName: String,
  mimetype: String,
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
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  transactionId?: string;
  invoiceNumber: string;
  paymentMethod: string;
  packageId?: string;
  packageName?: string;
  billingDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  nextBillingDate?: Date;
  receiptUrl?: string;
  notes?: string;
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentHistorySchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'overdue'], default: 'pending' },
  transactionId: String,
  invoiceNumber: { type: String, required: true, unique: true },
  paymentMethod: { type: String, required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
  packageName: String,
  billingDate: { type: Date, required: true },
  dueDate: Date,
  paidDate: Date,
  nextBillingDate: Date,
  receiptUrl: String,
  notes: String,
  refundId: { type: Schema.Types.ObjectId, ref: 'Refund' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientId: string;
  packageId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  sentAt?: Date;
  sentToEmail?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paidDate: Date,
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  tax: Number,
  taxRate: Number,
  discount: Number,
  total: { type: Number, required: true },
  notes: String,
  paymentTerms: String,
  paymentInstructions: String,
  sentAt: Date,
  sentToEmail: String,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface IRefund extends Document {
  paymentId: string;
  clientId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: string;
  requestedAt: Date;
  processedBy?: string;
  processedAt?: Date;
  refundMethod: string;
  transactionId?: string;
  notes?: string;
  approvalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema({
  paymentId: { type: Schema.Types.ObjectId, ref: 'PaymentHistory', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
  requestedBy: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  processedBy: String,
  processedAt: Date,
  refundMethod: { type: String, required: true },
  transactionId: String,
  notes: String,
  approvalNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface IPaymentReminder extends Document {
  clientId: string;
  invoiceId: string;
  type: 'due' | 'overdue' | 'reminder';
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  channel: 'email' | 'sms' | 'both';
  message: string;
  createdAt: Date;
}

const PaymentReminderSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  type: { type: String, enum: ['due', 'overdue', 'reminder'], required: true },
  scheduledFor: { type: Date, required: true },
  sentAt: Date,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  channel: { type: String, enum: ['email', 'sms', 'both'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface IClientActivity extends Document {
  clientId: string;
  activityType: string;
  timestamp: Date;
  metadata?: any;
}

const ClientActivitySchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  activityType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: Schema.Types.Mixed,
});

ClientActivitySchema.index({ clientId: 1, timestamp: -1 });
ClientActivitySchema.index({ timestamp: -1 });

export interface ISystemSettings extends Document {
  branding?: {
    gymName: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    tagline?: string;
  };
  emailTemplates?: {
    welcome?: {
      subject: string;
      body: string;
      enabled: boolean;
    };
    paymentReminder?: {
      subject: string;
      body: string;
      enabled: boolean;
    };
    sessionReminder?: {
      subject: string;
      body: string;
      enabled: boolean;
    };
    packageExpiry?: {
      subject: string;
      body: string;
      enabled: boolean;
    };
  };
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    sessionReminders: boolean;
    paymentReminders: boolean;
    achievementNotifications: boolean;
    reminderHoursBefore: number;
  };
  userRoles?: Array<{
    roleName: string;
    permissions: string[];
    description?: string;
  }>;
  integrations?: {
    payment?: {
      provider: string;
      stripe?: {
        publicKey?: string;
        secretKey?: string;
        webhookSecret?: string;
        enabled: boolean;
      };
      paypal?: {
        clientId?: string;
        clientSecret?: string;
        webhookId?: string;
        enabled: boolean;
      };
      razorpay?: {
        keyId?: string;
        keySecret?: string;
        webhookSecret?: string;
        enabled: boolean;
      };
      autoRetryFailed: boolean;
      maxRetryAttempts: number;
    };
    email?: {
      provider: string;
      apiKey?: string;
      fromEmail: string;
      enabled: boolean;
    };
    sms?: {
      provider: string;
      apiKey?: string;
      enabled: boolean;
    };
    calendar?: {
      provider: string;
      enabled: boolean;
    };
    videoHosting?: {
      provider: string;
      cdnUrl?: string;
      apiKey?: string;
      enabled: boolean;
    };
    videoConferencing?: {
      provider: string;
      zoom?: {
        apiKey?: string;
        apiSecret?: string;
        webhookSecret?: string;
        enabled: boolean;
      };
      googleMeet?: {
        clientId?: string;
        clientSecret?: string;
        enabled: boolean;
      };
      autoCreateMeetings: boolean;
      recordingSaveEnabled: boolean;
    };
  };
  backup?: {
    autoBackup: boolean;
    backupFrequency: string;
    lastBackupDate?: Date;
    backupLocation?: string;
  };
  subscription?: {
    basic?: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
    };
    premium?: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
    };
    elite?: {
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
    };
  };
  updatedAt: Date;
  createdAt: Date;
}

const SystemSettingsSchema = new Schema({
  branding: {
    gymName: { type: String, default: 'FitPro' },
    logo: String,
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    tagline: String,
  },
  emailTemplates: {
    welcome: {
      subject: { type: String, default: 'Welcome to {{gymName}}!' },
      body: { type: String, default: 'Hi {{clientName}}, Welcome to our gym family!' },
      enabled: { type: Boolean, default: true },
    },
    paymentReminder: {
      subject: { type: String, default: 'Payment Reminder - {{gymName}}' },
      body: { type: String, default: 'Hi {{clientName}}, Your payment of {{amount}} is due on {{dueDate}}.' },
      enabled: { type: Boolean, default: true },
    },
    sessionReminder: {
      subject: { type: String, default: 'Upcoming Session Reminder' },
      body: { type: String, default: 'Hi {{clientName}}, Your session "{{sessionName}}" is scheduled for {{sessionDate}}.' },
      enabled: { type: Boolean, default: true },
    },
    packageExpiry: {
      subject: { type: String, default: 'Package Expiring Soon' },
      body: { type: String, default: 'Hi {{clientName}}, Your {{packageName}} package expires on {{expiryDate}}.' },
      enabled: { type: Boolean, default: true },
    },
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true },
    achievementNotifications: { type: Boolean, default: true },
    reminderHoursBefore: { type: Number, default: 24 },
  },
  userRoles: [{
    roleName: String,
    permissions: [String],
    description: String,
  }],
  integrations: {
    payment: {
      provider: { type: String, default: 'stripe' },
      stripe: {
        publicKey: String,
        secretKey: String,
        webhookSecret: String,
        enabled: { type: Boolean, default: false },
      },
      paypal: {
        clientId: String,
        clientSecret: String,
        webhookId: String,
        enabled: { type: Boolean, default: false },
      },
      razorpay: {
        keyId: String,
        keySecret: String,
        webhookSecret: String,
        enabled: { type: Boolean, default: false },
      },
      autoRetryFailed: { type: Boolean, default: true },
      maxRetryAttempts: { type: Number, default: 3 },
    },
    email: {
      provider: { type: String, default: 'sendgrid' },
      apiKey: String,
      fromEmail: String,
      enabled: { type: Boolean, default: false },
    },
    sms: {
      provider: { type: String, default: 'twilio' },
      apiKey: String,
      enabled: { type: Boolean, default: false },
    },
    calendar: {
      provider: { type: String, default: 'google' },
      enabled: { type: Boolean, default: false },
    },
    videoHosting: {
      provider: { type: String, default: 'youtube' },
      cdnUrl: String,
      apiKey: String,
      enabled: { type: Boolean, default: false },
    },
    videoConferencing: {
      provider: { type: String, default: 'zoom' },
      zoom: {
        apiKey: String,
        apiSecret: String,
        webhookSecret: String,
        enabled: { type: Boolean, default: false },
      },
      googleMeet: {
        clientId: String,
        clientSecret: String,
        enabled: { type: Boolean, default: false },
      },
      autoCreateMeetings: { type: Boolean, default: false },
      recordingSaveEnabled: { type: Boolean, default: true },
    },
  },
  backup: {
    autoBackup: { type: Boolean, default: false },
    backupFrequency: { type: String, default: 'weekly' },
    lastBackupDate: Date,
    backupLocation: String,
  },
  subscription: {
    basic: {
      monthlyPrice: { type: Number, default: 999 },
      yearlyPrice: { type: Number, default: 9999 },
      features: { type: [String], default: ['Basic workout plans', '2 live sessions/month', 'Video library access'] },
    },
    premium: {
      monthlyPrice: { type: Number, default: 1999 },
      yearlyPrice: { type: Number, default: 19999 },
      features: { type: [String], default: ['Custom workout plans', '8 live sessions/month', 'Diet plans', 'Priority support'] },
    },
    elite: {
      monthlyPrice: { type: Number, default: 3999 },
      yearlyPrice: { type: Number, default: 39999 },
      features: { type: [String], default: ['Personalized training', 'Unlimited sessions', 'Custom diet plans', '24/7 support'] },
    },
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const Package = mongoose.model<IPackage>('Package', PackageSchema);
export const Trainer = mongoose.model<ITrainer>('Trainer', TrainerSchema);
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
export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const Refund = mongoose.model<IRefund>('Refund', RefundSchema);
export const PaymentReminder = mongoose.model<IPaymentReminder>('PaymentReminder', PaymentReminderSchema);
export const ClientActivity = mongoose.model<IClientActivity>('ClientActivity', ClientActivitySchema);
export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
