import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, contactSubmissions, arrangements, arrangementItems,
  type User, type InsertUser,
  type Contact, type InsertContact,
  type Arrangement, type InsertArrangement,
  type ArrangementItem, type InsertArrangementItem,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
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
}

export const storage = new DatabaseStorage();
