import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    const allUsers = await db.select().from(users);
    if (allUsers.length > 0) return;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Director";

    if (!adminEmail || !adminPassword) {
      console.log("No ADMIN_EMAIL/ADMIN_PASSWORD set. Skipping bootstrap. Set these env vars for first-run admin creation.");
      return;
    }

    const hashed = await hashPassword(adminPassword);
    await db.insert(users).values({
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      password: hashed,
      role: "director",
      isActive: true,
    });
    console.log(`Bootstrap director created: ${adminEmail}`);
  } catch (err) {
    console.error("Seed error:", err);
  }
}
