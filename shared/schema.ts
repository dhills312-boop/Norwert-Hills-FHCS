import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull(),
  action: text("action").notNull(),
  targetId: varchar("target_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const arrangements = pgTable("arrangements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyName: text("family_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("In Progress"),
  nextStep: text("next_step").notNull().default("Service Selection"),
  scheduledTime: text("scheduled_time"),
  staffId: varchar("staff_id"),
  selections: jsonb("selections").$type<Record<string, string>>().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull(),
  actorId: varchar("actor_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const arrangementItems = pgTable("arrangement_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull(),
  section: text("section").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const staffEmailSchema = z.string()
  .email("Invalid email format")
  .refine(
    (email) => email.endsWith("@thenhfcs.com"),
    "Email must use @thenhfcs.com domain"
  );

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  role: true,
});

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: staffEmailSchema,
  password: passwordSchema,
  role: z.enum(["director", "staff"]),
});

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertArrangementSchema = createInsertSchema(arrangements).pick({
  familyName: true,
  email: true,
  phone: true,
  status: true,
  nextStep: true,
  scheduledTime: true,
  selections: true,
  notes: true,
});

export const insertArrangementItemSchema = createInsertSchema(arrangementItems).pick({
  arrangementId: true,
  section: true,
  description: true,
  amount: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  arrangementId: true,
  actorId: true,
  action: true,
  details: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactSubmissions.$inferSelect;
export type InsertArrangement = z.infer<typeof insertArrangementSchema>;
export type Arrangement = typeof arrangements.$inferSelect;
export type InsertArrangementItem = z.infer<typeof insertArrangementItemSchema>;
export type ArrangementItem = typeof arrangementItems.$inferSelect;
