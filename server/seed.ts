import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Director";

    if (!adminEmail || !adminPassword) {
      console.log("No ADMIN_EMAIL/ADMIN_PASSWORD set. Skipping bootstrap.");
      return;
    }

    const normalizedEmail = adminEmail.toLowerCase().trim();
    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      const hashed = await hashPassword(adminPassword);
      await db.insert(users).values({
        name: adminName,
        email: normalizedEmail,
        password: hashed,
        role: "director",
        isActive: true,
      });
      console.log(`Bootstrap director created: ${normalizedEmail}`);
      return;
    }

    const existingAdmin = allUsers.find((u) => u.email === normalizedEmail);
    if (!existingAdmin) {
      const directors = allUsers.filter((u) => u.role === "director");
      if (directors.length > 0) {
        const oldDirector = directors[0];
        const hashed = await hashPassword(adminPassword);
        await db
          .update(users)
          .set({
            email: normalizedEmail,
            name: adminName,
            password: hashed,
          })
          .where(eq(users.id, oldDirector.id));
        console.log(`Director updated: ${oldDirector.email} → ${normalizedEmail}`);
      } else {
        const hashed = await hashPassword(adminPassword);
        await db.insert(users).values({
          name: adminName,
          email: normalizedEmail,
          password: hashed,
          role: "director",
          isActive: true,
        });
        console.log(`New director created: ${normalizedEmail}`);
      }
    } else {
      const hashed = await hashPassword(adminPassword);
      await db
        .update(users)
        .set({
          name: adminName,
          password: hashed,
        })
        .where(eq(users.id, existingAdmin.id));
      console.log(`Director password/name synced: ${normalizedEmail}`);
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}
