import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "./db";
import {
  users, auditLogs, contactSubmissions, arrangements, arrangementItems, activityLogs,
  formTemplates, formInstances, commEvents, serviceCatalog, announcements, condolenceMessages,
  cremationOrders, cremationEvents, cremationDocuments, waitlistSignups, sessionDocChecklist,
  type User, type InsertUser,
  type AuditLog,
  type Contact, type InsertContact,
  type Arrangement, type InsertArrangement,
  type ArrangementItem, type InsertArrangementItem,
  type ActivityLog, type InsertActivityLog,
  type FormTemplate, type InsertFormTemplate,
  type FormInstance, type InsertFormInstance,
  type CommEvent, type InsertCommEvent,
  type ServiceCatalogItem, type InsertServiceCatalogItem,
  type Announcement, type InsertAnnouncement,
  type CondolenceMessage, type InsertCondolenceMessage,
  type CremationOrder, type InsertCremationOrder,
  type CremationEvent, type InsertCremationEvent,
  type CremationDocument, type InsertCremationDocument,
  type WaitlistSignup, type InsertWaitlistSignup,
  type SessionDocChecklist, type InsertSessionDocChecklist,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<Pick<User, "name" | "email" | "role" | "isActive">>): Promise<User | undefined>;
  updateLastLogin(id: string): Promise<void>;

  createAuditLog(actorId: string, action: string, targetId?: string): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;

  createContact(data: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  updateContactStatus(id: string, status: string): Promise<Contact | undefined>;

  getArrangements(): Promise<Arrangement[]>;
  getArrangement(id: string): Promise<Arrangement | undefined>;
  createArrangement(data: InsertArrangement): Promise<Arrangement>;
  updateArrangement(id: string, data: Partial<InsertArrangement>): Promise<Arrangement | undefined>;
  deleteArrangement(id: string): Promise<void>;

  getArrangementItems(arrangementId: string): Promise<ArrangementItem[]>;
  createArrangementItem(data: InsertArrangementItem): Promise<ArrangementItem>;
  deleteArrangementItems(arrangementId: string): Promise<void>;

  createActivityLog(data: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(arrangementId?: string, since?: Date): Promise<ActivityLog[]>;

  getFormTemplates(): Promise<FormTemplate[]>;
  getFormTemplate(id: string): Promise<FormTemplate | undefined>;
  createFormTemplate(data: InsertFormTemplate): Promise<FormTemplate>;

  getFormInstances(arrangementId: string): Promise<FormInstance[]>;
  getFormInstance(id: string): Promise<FormInstance | undefined>;
  createFormInstance(data: InsertFormInstance): Promise<FormInstance>;
  updateFormInstance(id: string, data: Partial<Pick<FormInstance, "status" | "sentVia" | "sentTo" | "sentAt" | "completedAt" | "formUrl" | "pandadocDocumentId" | "externalLink" | "recipientName" | "recipientEmail">>): Promise<FormInstance | undefined>;

  getCommEvents(arrangementId: string): Promise<CommEvent[]>;
  createCommEvent(data: InsertCommEvent): Promise<CommEvent>;

  getServiceCatalogItems(itemType?: string, category?: string): Promise<ServiceCatalogItem[]>;
  getServiceCatalogItem(id: string): Promise<ServiceCatalogItem | undefined>;
  createServiceCatalogItem(data: InsertServiceCatalogItem): Promise<ServiceCatalogItem>;
  updateServiceCatalogItem(id: string, data: Partial<InsertServiceCatalogItem>): Promise<ServiceCatalogItem | undefined>;

  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  getAnnouncementBySlug(slug: string): Promise<Announcement | undefined>;
  getAnnouncementByArrangementId(arrangementId: string): Promise<Announcement | undefined>;
  createAnnouncement(data: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;

  getCondolenceMessages(announcementId: string): Promise<CondolenceMessage[]>;
  createCondolenceMessage(data: InsertCondolenceMessage): Promise<CondolenceMessage>;
  deleteCondolenceMessage(id: string): Promise<void>;

  createCremationOrder(data: InsertCremationOrder): Promise<CremationOrder>;
  getCremationOrder(id: string): Promise<CremationOrder | undefined>;
  getCremationOrderByToken(token: string): Promise<CremationOrder | undefined>;
  updateCremationOrder(id: string, data: Partial<InsertCremationOrder>): Promise<CremationOrder | undefined>;
  listCremationOrders(): Promise<CremationOrder[]>;

  createCremationEvent(data: InsertCremationEvent): Promise<CremationEvent>;
  listCremationEvents(orderId: string): Promise<CremationEvent[]>;
  getCremationEventBySquareEventId(squareEventId: string): Promise<CremationEvent | undefined>;

  createCremationDocument(data: InsertCremationDocument): Promise<CremationDocument>;
  listCremationDocuments(orderId: string): Promise<CremationDocument[]>;

  createWaitlistSignup(data: InsertWaitlistSignup): Promise<WaitlistSignup>;
  listWaitlistSignups(): Promise<WaitlistSignup[]>;

  getSessionDocChecklist(arrangementId: string): Promise<SessionDocChecklist | undefined>;
  upsertSessionDocChecklist(arrangementId: string, data: Partial<Omit<InsertSessionDocChecklist, "arrangementId">>): Promise<SessionDocChecklist>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<Pick<User, "name" | "email" | "role" | "isActive">>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  }

  async createAuditLog(actorId: string, action: string, targetId?: string): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values({ actorId, action, targetId }).returning();
    return log;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contactSubmissions).values(data).returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | undefined> {
    const [contact] = await db.update(contactSubmissions).set({ status }).where(eq(contactSubmissions.id, id)).returning();
    return contact;
  }

  async getArrangements(): Promise<Arrangement[]> {
    return db.select().from(arrangements).orderBy(desc(arrangements.createdAt));
  }

  async getArrangement(id: string): Promise<Arrangement | undefined> {
    const [arr] = await db.select().from(arrangements).where(eq(arrangements.id, id));
    return arr;
  }

  async createArrangement(data: InsertArrangement): Promise<Arrangement> {
    const [arr] = await db.insert(arrangements).values(data).returning();
    return arr;
  }

  async updateArrangement(id: string, data: Partial<InsertArrangement>): Promise<Arrangement | undefined> {
    const [arr] = await db.update(arrangements).set(data).where(eq(arrangements.id, id)).returning();
    return arr;
  }

  async deleteArrangement(id: string): Promise<void> {
    await db.delete(arrangementItems).where(eq(arrangementItems.arrangementId, id));
    await db.delete(arrangements).where(eq(arrangements.id, id));
  }

  async getArrangementItems(arrangementId: string): Promise<ArrangementItem[]> {
    return db.select().from(arrangementItems).where(eq(arrangementItems.arrangementId, arrangementId));
  }

  async createArrangementItem(data: InsertArrangementItem): Promise<ArrangementItem> {
    const [item] = await db.insert(arrangementItems).values(data).returning();
    return item;
  }

  async deleteArrangementItems(arrangementId: string): Promise<void> {
    await db.delete(arrangementItems).where(eq(arrangementItems.arrangementId, arrangementId));
  }

  async createActivityLog(data: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(data).returning();
    return log;
  }

  async getActivityLogs(arrangementId?: string, since?: Date): Promise<ActivityLog[]> {
    const conditions = [];
    if (arrangementId) conditions.push(eq(activityLogs.arrangementId, arrangementId));
    if (since) conditions.push(gte(activityLogs.createdAt, since));

    if (conditions.length > 0) {
      return db.select().from(activityLogs).where(and(...conditions)).orderBy(desc(activityLogs.createdAt));
    }
    return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  async getFormTemplates(): Promise<FormTemplate[]> {
    return db.select().from(formTemplates).orderBy(formTemplates.sortOrder);
  }

  async getFormTemplate(id: string): Promise<FormTemplate | undefined> {
    const [t] = await db.select().from(formTemplates).where(eq(formTemplates.id, id));
    return t;
  }

  async createFormTemplate(data: InsertFormTemplate): Promise<FormTemplate> {
    const [t] = await db.insert(formTemplates).values(data).returning();
    return t;
  }

  async getFormInstances(arrangementId: string): Promise<FormInstance[]> {
    return db.select().from(formInstances).where(eq(formInstances.arrangementId, arrangementId));
  }

  async getFormInstance(id: string): Promise<FormInstance | undefined> {
    const [fi] = await db.select().from(formInstances).where(eq(formInstances.id, id));
    return fi;
  }

  async createFormInstance(data: InsertFormInstance): Promise<FormInstance> {
    const [fi] = await db.insert(formInstances).values(data).returning();
    return fi;
  }

  async updateFormInstance(id: string, data: Partial<Pick<FormInstance, "status" | "sentVia" | "sentTo" | "sentAt" | "completedAt" | "formUrl" | "pandadocDocumentId" | "externalLink" | "recipientName" | "recipientEmail">>): Promise<FormInstance | undefined> {
    const [fi] = await db.update(formInstances).set(data).where(eq(formInstances.id, id)).returning();
    return fi;
  }

  async getCommEvents(arrangementId: string): Promise<CommEvent[]> {
    return db.select().from(commEvents).where(eq(commEvents.arrangementId, arrangementId)).orderBy(desc(commEvents.createdAt));
  }

  async createCommEvent(data: InsertCommEvent): Promise<CommEvent> {
    const [ce] = await db.insert(commEvents).values(data).returning();
    return ce;
  }

  async getServiceCatalogItems(itemType?: string, category?: string): Promise<ServiceCatalogItem[]> {
    const conditions = [];
    if (itemType) conditions.push(eq(serviceCatalog.itemType, itemType));
    if (category) conditions.push(eq(serviceCatalog.category, category));
    if (conditions.length > 0) {
      return db.select().from(serviceCatalog).where(and(...conditions)).orderBy(serviceCatalog.displayOrder);
    }
    return db.select().from(serviceCatalog).orderBy(serviceCatalog.displayOrder);
  }

  async getServiceCatalogItem(id: string): Promise<ServiceCatalogItem | undefined> {
    const [item] = await db.select().from(serviceCatalog).where(eq(serviceCatalog.id, id));
    return item;
  }

  async createServiceCatalogItem(data: InsertServiceCatalogItem): Promise<ServiceCatalogItem> {
    const [item] = await db.insert(serviceCatalog).values(data).returning();
    return item;
  }

  async updateServiceCatalogItem(id: string, data: Partial<InsertServiceCatalogItem>): Promise<ServiceCatalogItem | undefined> {
    const [item] = await db.update(serviceCatalog).set(data).where(eq(serviceCatalog.id, id)).returning();
    return item;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [a] = await db.select().from(announcements).where(eq(announcements.id, id));
    return a;
  }

  async getAnnouncementBySlug(slug: string): Promise<Announcement | undefined> {
    const [a] = await db.select().from(announcements).where(eq(announcements.slug, slug));
    return a;
  }

  async getAnnouncementByArrangementId(arrangementId: string): Promise<Announcement | undefined> {
    const [a] = await db.select().from(announcements).where(eq(announcements.arrangementId, arrangementId));
    return a;
  }

  async createAnnouncement(data: InsertAnnouncement): Promise<Announcement> {
    const [a] = await db.insert(announcements).values(data).returning();
    return a;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [a] = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
    return a;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(condolenceMessages).where(eq(condolenceMessages.announcementId, id));
      await tx.delete(announcements).where(eq(announcements.id, id));
    });
  }

  async getCondolenceMessages(announcementId: string): Promise<CondolenceMessage[]> {
    return db.select().from(condolenceMessages).where(eq(condolenceMessages.announcementId, announcementId)).orderBy(desc(condolenceMessages.createdAt));
  }

  async createCondolenceMessage(data: InsertCondolenceMessage): Promise<CondolenceMessage> {
    const [m] = await db.insert(condolenceMessages).values(data).returning();
    return m;
  }

  async deleteCondolenceMessage(id: string): Promise<void> {
    await db.delete(condolenceMessages).where(eq(condolenceMessages.id, id));
  }

  async createCremationOrder(data: InsertCremationOrder): Promise<CremationOrder> {
    const [order] = await db.insert(cremationOrders).values(data).returning();
    return order;
  }

  async getCremationOrder(id: string): Promise<CremationOrder | undefined> {
    const [order] = await db.select().from(cremationOrders).where(eq(cremationOrders.id, id));
    return order;
  }

  async getCremationOrderByToken(token: string): Promise<CremationOrder | undefined> {
    const [order] = await db.select().from(cremationOrders).where(eq(cremationOrders.orderToken, token));
    return order;
  }

  async updateCremationOrder(id: string, data: Partial<InsertCremationOrder>): Promise<CremationOrder | undefined> {
    const [order] = await db.update(cremationOrders).set({ ...data, updatedAt: new Date() }).where(eq(cremationOrders.id, id)).returning();
    return order;
  }

  async listCremationOrders(): Promise<CremationOrder[]> {
    return db.select().from(cremationOrders).orderBy(desc(cremationOrders.createdAt));
  }

  async createCremationEvent(data: InsertCremationEvent): Promise<CremationEvent> {
    const [event] = await db.insert(cremationEvents).values(data).returning();
    return event;
  }

  async listCremationEvents(orderId: string): Promise<CremationEvent[]> {
    return db.select().from(cremationEvents).where(eq(cremationEvents.orderId, orderId)).orderBy(desc(cremationEvents.createdAt));
  }

  async getCremationEventBySquareEventId(squareEventId: string): Promise<CremationEvent | undefined> {
    const all = await db.select().from(cremationEvents);
    return all.find(e => (e.details as Record<string, unknown>)?.squareEventId === squareEventId);
  }

  async createCremationDocument(data: InsertCremationDocument): Promise<CremationDocument> {
    const [doc] = await db.insert(cremationDocuments).values(data).returning();
    return doc;
  }

  async listCremationDocuments(orderId: string): Promise<CremationDocument[]> {
    return db.select().from(cremationDocuments).where(eq(cremationDocuments.orderId, orderId)).orderBy(desc(cremationDocuments.createdAt));
  }

  async createWaitlistSignup(data: InsertWaitlistSignup): Promise<WaitlistSignup> {
    const [signup] = await db.insert(waitlistSignups).values(data).returning();
    return signup;
  }

  async listWaitlistSignups(): Promise<WaitlistSignup[]> {
    return db.select().from(waitlistSignups).orderBy(desc(waitlistSignups.createdAt));
  }

  async getSessionDocChecklist(arrangementId: string): Promise<SessionDocChecklist | undefined> {
    const [row] = await db.select().from(sessionDocChecklist).where(eq(sessionDocChecklist.arrangementId, arrangementId));
    return row;
  }

  async upsertSessionDocChecklist(arrangementId: string, data: Partial<Omit<InsertSessionDocChecklist, "arrangementId">>): Promise<SessionDocChecklist> {
    const existing = await this.getSessionDocChecklist(arrangementId);
    if (existing) {
      const [row] = await db.update(sessionDocChecklist)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sessionDocChecklist.arrangementId, arrangementId))
        .returning();
      return row;
    }
    const [row] = await db.insert(sessionDocChecklist).values({ arrangementId, ...data }).returning();
    return row;
  }
}

export const storage = new DatabaseStorage();
