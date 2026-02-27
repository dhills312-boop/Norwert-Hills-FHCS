import { pool, db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    const existing = await db.select().from(users).where(eq(users.username, "admin"));
    if (existing.length === 0) {
      const hashed = await hashPassword("BeverlyJean");
      await db.insert(users).values({
        username: "admin",
        password: hashed,
        displayName: "Sarah Jenkins",
        role: "admin",
      });
      console.log("Seeded default admin user (admin / BeverlyJean)");
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}
