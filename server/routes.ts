import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { requireAuth, requireDirector, hashPassword } from "./auth";
import { insertContactSchema, insertArrangementSchema, insertArrangementItemSchema, createUserSchema, staffEmailSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  app.get("/api/contacts", requireAuth, async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/contacts/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const contact = await storage.updateContactStatus(req.params.id, status);
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      res.json(contact);
    } catch {
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.get("/api/admin/users", requireDirector, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const sanitized = allUsers.map(({ password, ...u }) => u);
      res.json(sanitized);
    } catch {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireDirector, async (req, res) => {
    try {
      const data = createUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email.toLowerCase().trim());
      if (existing) return res.status(400).json({ message: "A user with that email already exists" });
      const hashed = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashed,
        role: data.role,
      });
      await storage.createAuditLog(req.user!.id, "user_created", user.id);
      const { password, ...safe } = user;
      res.status(201).json(safe);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireDirector, async (req, res) => {
    try {
      const { role } = req.body;
      if (!["director", "staff"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'director' or 'staff'" });
      }
      const target = await storage.getUser(req.params.id);
      if (!target) return res.status(404).json({ message: "User not found" });
      const updated = await storage.updateUser(req.params.id, { role });
      await storage.createAuditLog(req.user!.id, `role_changed_to_${role}`, req.params.id);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.patch("/api/admin/users/:id/deactivate", requireDirector, async (req, res) => {
    try {
      if (req.params.id === req.user!.id) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
      }
      const updated = await storage.updateUser(req.params.id, { isActive: false });
      if (!updated) return res.status(404).json({ message: "User not found" });
      await storage.createAuditLog(req.user!.id, "user_deactivated", req.params.id);
      const { password, ...safe } = updated;
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  app.patch("/api/admin/users/:id/activate", requireDirector, async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, { isActive: true });
      if (!updated) return res.status(404).json({ message: "User not found" });
      await storage.createAuditLog(req.user!.id, "user_activated", req.params.id);
      const { password, ...safe } = updated;
      res.json(safe);
    } catch {
      res.status(500).json({ message: "Failed to activate user" });
    }
  });

  app.patch("/api/staff/profile", requireAuth, async (req, res) => {
    try {
      const { name, email } = req.body;
      const updates: Record<string, string> = {};
      if (name && typeof name === "string") updates.name = name;
      if (email && typeof email === "string") {
        const parsed = staffEmailSchema.parse(email);
        const existing = await storage.getUserByEmail(parsed.toLowerCase().trim());
        if (existing && existing.id !== req.user!.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
        updates.email = parsed.toLowerCase().trim();
      }
      const updated = await storage.updateUser(req.user!.id, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/admin/audit-logs", requireDirector, async (_req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/arrangements", requireAuth, async (_req, res) => {
    try {
      const arr = await storage.getArrangements();
      res.json(arr);
    } catch {
      res.status(500).json({ message: "Failed to fetch arrangements" });
    }
  });

  app.get("/api/arrangements/:id", requireAuth, async (req, res) => {
    try {
      const arr = await storage.getArrangement(req.params.id);
      if (!arr) return res.status(404).json({ message: "Arrangement not found" });
      res.json(arr);
    } catch {
      res.status(500).json({ message: "Failed to fetch arrangement" });
    }
  });

  app.post("/api/arrangements", requireAuth, async (req, res) => {
    try {
      const data = insertArrangementSchema.parse(req.body);
      const arr = await storage.createArrangement(data);
      res.status(201).json(arr);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create arrangement" });
    }
  });

  app.patch("/api/arrangements/:id", requireAuth, async (req, res) => {
    try {
      const allowedFields = ["familyName", "email", "phone", "status", "nextStep", "scheduledTime", "selections", "notes"];
      const filtered: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          filtered[key] = req.body[key];
        }
      }
      const arr = await storage.updateArrangement(req.params.id, filtered);
      if (!arr) return res.status(404).json({ message: "Arrangement not found" });
      res.json(arr);
    } catch {
      res.status(500).json({ message: "Failed to update arrangement" });
    }
  });

  app.delete("/api/arrangements/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteArrangement(req.params.id);
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete arrangement" });
    }
  });

  app.get("/api/arrangements/:id/items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getArrangementItems(req.params.id);
      res.json(items);
    } catch {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/arrangements/:id/items", requireAuth, async (req, res) => {
    try {
      const data = insertArrangementItemSchema.parse({
        ...req.body,
        arrangementId: req.params.id,
      });
      const item = await storage.createArrangementItem(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.delete("/api/arrangements/:id/items", requireAuth, async (req, res) => {
    try {
      await storage.deleteArrangementItems(req.params.id);
      res.json({ message: "Items deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete items" });
    }
  });

  return httpServer;
}
