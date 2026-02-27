import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { insertContactSchema, insertArrangementSchema, insertArrangementItemSchema } from "@shared/schema";
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
