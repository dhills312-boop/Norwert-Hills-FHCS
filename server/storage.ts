import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, auditLogs, contactSubmissions, arrangements, arrangementItems, activityLogs,
  type User, type InsertUser,
  type AuditLog,
  type Contact, type InsertContact,
  type Arrangement, type InsertArrangement,
  type ArrangementItem, type InsertArrangementItem,
  type ActivityLog, type InsertActivityLog,
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
  getActivityLogs(arrangementId?: string): Promise<ActivityLog[]>;
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

  async getActivityLogs(arrangementId?: string): Promise<ActivityLog[]> {
    if (arrangementId) {
      return db.select().from(activityLogs).where(eq(activityLogs.arrangementId, arrangementId)).orderBy(desc(activityLogs.createdAt));
    }
    return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();
