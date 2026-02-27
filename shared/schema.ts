import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("staff"),
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

export const arrangementItems = pgTable("arrangement_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull(),
  section: text("section").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactSubmissions.$inferSelect;
export type InsertArrangement = z.infer<typeof insertArrangementSchema>;
export type Arrangement = typeof arrangements.$inferSelect;
export type InsertArrangementItem = z.infer<typeof insertArrangementItemSchema>;
export type ArrangementItem = typeof arrangementItems.$inferSelect;
