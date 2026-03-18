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

export interface ArrangementSelections {
  packageId?: string;
  addOnIds?: string[];
  merchandiseIds?: string[];
  cashAdvanceIds?: string[];
  floralIds?: string[];
  customItems?: { description: string; section: string; amount: number }[];
  overrides?: Record<string, number>;
  quantities?: Record<string, number>;
  [key: string]: unknown;
}

export const arrangements = pgTable("arrangements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyName: text("family_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("In Progress"),
  nextStep: text("next_step").notNull().default("Service Selection"),
  scheduledTime: text("scheduled_time"),
  staffId: varchar("staff_id"),
  selections: jsonb("selections").$type<ArrangementSelections>().default({}),
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

export const formTemplates = pgTable("form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("jotform"),
  category: text("category").notNull().default("intake"),
  jotformId: text("jotform_id"),
  jotformUrl: text("jotform_url"),
  pdfPath: text("pdf_path"),
  pandadocTemplateId: text("pandadoc_template_id"),
  pandadocRecipientRole: text("pandadoc_recipient_role").default("Authorizing Agent"),
  authWorkflowGroup: text("auth_workflow_group"),
  requiredForServiceTypes: text("required_for_service_types").array().notNull().default(sql`'{}'::text[]`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const formInstances = pgTable("form_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull(),
  templateId: varchar("template_id").notNull(),
  status: text("status").notNull().default("not_sent"),
  formUrl: text("form_url"),
  sentVia: text("sent_via"),
  sentTo: text("sent_to"),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
  pandadocDocumentId: text("pandadoc_document_id"),
  externalLink: text("external_link"),
  recipientName: text("recipient_name"),
  recipientEmail: text("recipient_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionDocChecklist = pgTable("session_doc_checklist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull().unique(),
  documentReceived: boolean("document_received").notNull().default(false),
  filedToCase: boolean("filed_to_case").notNull().default(false),
  certificateSubmitted: boolean("certificate_submitted").notNull().default(false),
  certificateApproved: boolean("certificate_approved").notNull().default(false),
  ssnPurged: boolean("ssn_purged").notNull().default(false),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commEvents = pgTable("comm_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id").notNull(),
  actorId: varchar("actor_id").notNull(),
  channel: text("channel").notNull(),
  destination: text("destination").notNull(),
  templateId: varchar("template_id"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFormTemplateSchema = createInsertSchema(formTemplates).omit({ id: true, createdAt: true });
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;
export type FormTemplate = typeof formTemplates.$inferSelect;

export const insertFormInstanceSchema = createInsertSchema(formInstances).omit({ id: true, createdAt: true });
export type InsertFormInstance = z.infer<typeof insertFormInstanceSchema>;
export type FormInstance = typeof formInstances.$inferSelect;

export const insertCommEventSchema = createInsertSchema(commEvents).omit({ id: true, createdAt: true });
export type InsertCommEvent = z.infer<typeof insertCommEventSchema>;
export type CommEvent = typeof commEvents.$inferSelect;

export const insertSessionDocChecklistSchema = createInsertSchema(sessionDocChecklist).omit({ id: true, updatedAt: true });
export type InsertSessionDocChecklist = z.infer<typeof insertSessionDocChecklistSchema>;
export type SessionDocChecklist = typeof sessionDocChecklist.$inferSelect;

export interface ServiceDetails {
  viewingDate?: string;
  viewingTime?: string;
  funeralDate?: string;
  funeralTime?: string;
  location?: string;
  locationAddress?: string;
  interment?: string;
  intermentDetails?: string;
  [key: string]: unknown;
}

export interface MediaGallery {
  photos?: string[];
  tributeVideoUrls?: string[];
  livestreamUrl?: string;
  [key: string]: unknown;
}

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  arrangementId: varchar("arrangement_id"),
  slug: text("slug").notNull().unique(),
  deceasedFirstName: text("deceased_first_name").notNull(),
  deceasedLastName: text("deceased_last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  dateOfPassing: text("date_of_passing"),
  briefObituary: text("brief_obituary"),
  fullObituary: text("full_obituary"),
  epitaph: text("epitaph"),
  serviceDetails: jsonb("service_details").$type<ServiceDetails>().default({}),
  portraitImagePath: text("portrait_image_path"),
  memorialSongUrl: text("memorial_song_url"),
  mediaGallery: jsonb("media_gallery").$type<MediaGallery>().default({}),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const condolenceMessages = pgTable("condolence_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  announcementId: varchar("announcement_id").notNull(),
  visitorName: text("visitor_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertCondolenceMessageSchema = createInsertSchema(condolenceMessages).omit({ id: true, createdAt: true });
export type InsertCondolenceMessage = z.infer<typeof insertCondolenceMessageSchema>;
export type CondolenceMessage = typeof condolenceMessages.$inferSelect;

export const serviceCatalog = pgTable("service_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: text("item_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  defaultPrice: numeric("default_price", { precision: 10, scale: 2 }).notNull().default("0"),
  displayOrder: integer("display_order").notNull().default(0),
  includedIn: jsonb("included_in").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  pricingUnit: text("pricing_unit").notNull().default("flat"),
});

export const insertServiceCatalogSchema = createInsertSchema(serviceCatalog).omit({ id: true });
export type InsertServiceCatalogItem = z.infer<typeof insertServiceCatalogSchema>;
export type ServiceCatalogItem = typeof serviceCatalog.$inferSelect;

export const cremationPhases = ["intake", "forms", "payment", "fulfillment", "completed"] as const;
export type CremationPhase = (typeof cremationPhases)[number];

export const cremationEventTypes = [
  "ORDER_CREATED",
  "FORM_SUBMITTED",
  "PAYMENT_LINK_CREATED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_FAILED",
  "REMAINS_RECEIVED",
  "CREMATION_SCHEDULED",
  "CREMATION_COMPLETED",
  "RELEASE_RECORDED",
  "SHIPMENT_RECORDED",
  "CASE_COMPLETED",
] as const;
export type CremationEventType = (typeof cremationEventTypes)[number];

export const cremationActorTypes = ["system", "staff", "family"] as const;
export type CremationActorType = (typeof cremationActorTypes)[number];

export const cremationOrders = pgTable("cremation_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderToken: text("order_token").notNull().unique(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  decedentName: text("decedent_name").notNull(),
  stateOfDeath: text("state_of_death"),
  currentPhase: text("current_phase").notNull().default("intake"),
  paymentStatus: text("payment_status"),
  paymentReference: text("payment_reference"),
  paymentTimestamp: timestamp("payment_timestamp"),
  packetLocked: boolean("packet_locked").notNull().default(false),
  driveRootFolderId: text("drive_root_folder_id"),
  driveRootFolderUrl: text("drive_root_folder_url"),
  driveSubfolders: jsonb("drive_subfolders").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cremationEvents = pgTable("cremation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => cremationOrders.id),
  eventType: text("event_type").notNull(),
  actorType: text("actor_type").notNull().default("system"),
  actorId: text("actor_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cremationDocuments = pgTable("cremation_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => cremationOrders.id),
  driveFileId: text("drive_file_id").notNull(),
  driveUrl: text("drive_url").notNull(),
  documentType: text("document_type").notNull(),
  folderPath: text("folder_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const waitlistSignups = pgTable("waitlist_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  zip: text("zip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCremationOrderSchema = createInsertSchema(cremationOrders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCremationOrder = z.infer<typeof insertCremationOrderSchema>;
export type CremationOrder = typeof cremationOrders.$inferSelect;

export const insertCremationEventSchema = createInsertSchema(cremationEvents).omit({ id: true, createdAt: true });
export type InsertCremationEvent = z.infer<typeof insertCremationEventSchema>;
export type CremationEvent = typeof cremationEvents.$inferSelect;

export const insertCremationDocumentSchema = createInsertSchema(cremationDocuments).omit({ id: true, createdAt: true });
export type InsertCremationDocument = z.infer<typeof insertCremationDocumentSchema>;
export type CremationDocument = typeof cremationDocuments.$inferSelect;

export const insertWaitlistSignupSchema = createInsertSchema(waitlistSignups).omit({ id: true, createdAt: true });
export type InsertWaitlistSignup = z.infer<typeof insertWaitlistSignupSchema>;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
