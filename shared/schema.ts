import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array().notNull(),
  videoAccess: boolean("video_access").notNull().default(false),
  liveSessionsPerMonth: integer("live_sessions_per_month").notNull().default(0),
  dietPlanAccess: boolean("diet_plan_access").notNull().default(false),
  workoutPlanAccess: boolean("workout_plan_access").notNull().default(false),
});

export const insertPackageSchema = createInsertSchema(packages).omit({ id: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  packageId: varchar("package_id").references(() => packages.id),
  age: integer("age"),
  gender: text("gender"),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  goal: text("goal"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const bodyMetrics = pgTable("body_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  height: decimal("height", { precision: 5, scale: 2 }).notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  bmi: decimal("bmi", { precision: 5, scale: 2 }),
  bmr: decimal("bmr", { precision: 7, scale: 2 }),
  tdee: decimal("tdee", { precision: 7, scale: 2 }),
  idealWeight: decimal("ideal_weight", { precision: 5, scale: 2 }),
  targetCalories: decimal("target_calories", { precision: 7, scale: 2 }),
  activityLevel: text("activity_level").notNull(),
  goal: text("goal").notNull(),
  recordedAt: timestamp("recorded_at").notNull().default(sql`now()`),
});

export const insertBodyMetricsSchema = createInsertSchema(bodyMetrics).omit({ id: true, recordedAt: true });
export type InsertBodyMetrics = z.infer<typeof insertBodyMetricsSchema>;
export type BodyMetrics = typeof bodyMetrics.$inferSelect;

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  category: text("category").notNull(),
  duration: integer("duration"),
  packageRequirement: varchar("package_requirement").references(() => packages.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export const clientVideos = pgTable("client_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  assignedAt: timestamp("assigned_at").notNull().default(sql`now()`),
});

export const insertClientVideoSchema = createInsertSchema(clientVideos).omit({ id: true, assignedAt: true });
export type InsertClientVideo = z.infer<typeof insertClientVideoSchema>;
export type ClientVideo = typeof clientVideos.$inferSelect;

export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  goal: text("goal"),
  durationWeeks: integer("duration_weeks").notNull(),
  exercises: jsonb("exercises").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;

export const dietPlans = pgTable("diet_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  targetCalories: decimal("target_calories", { precision: 7, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 5, scale: 2 }),
  carbs: decimal("carbs", { precision: 5, scale: 2 }),
  fats: decimal("fats", { precision: 5, scale: 2 }),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type DietPlan = typeof dietPlans.$inferSelect;

export const liveSessions = pgTable("live_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(),
  meetingLink: text("meeting_link"),
  status: text("status").notNull().default('scheduled'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({ id: true, createdAt: true });
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type LiveSession = typeof liveSessions.$inferSelect;

export const sessionClients = pgTable("session_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => liveSessions.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  attended: boolean("attended").default(false),
});

export const insertSessionClientSchema = createInsertSchema(sessionClients).omit({ id: true });
export type InsertSessionClient = z.infer<typeof insertSessionClientSchema>;
export type SessionClient = typeof sessionClients.$inferSelect;
