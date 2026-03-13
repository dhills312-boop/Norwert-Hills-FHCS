import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { arrangements, activityLogs, formInstances } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireDirector, hashPassword } from "./auth";
import { insertContactSchema, insertArrangementSchema, insertArrangementItemSchema, createUserSchema, staffEmailSchema, insertCommEventSchema, insertServiceCatalogSchema, insertAnnouncementSchema, insertCondolenceMessageSchema, type FormInstance } from "@shared/schema";
import { z } from "zod";
import path from "path";
import { registerCremationRoutes } from "./cremation-routes";

function maskDestination(dest: string, channel: string): string {
  if (channel === "email") {
    const [local, domain] = dest.split("@");
    if (!local || !domain) return "***@***.***";
    const maskedLocal = local.charAt(0) + "***";
    const domainParts = domain.split(".");
    const maskedDomain = domainParts[0].charAt(0) + "***." + (domainParts.slice(1).join(".") || "***");
    return `${maskedLocal}@${maskedDomain}`;
  }
  const digits = dest.replace(/\D/g, "");
  if (digits.length >= 4) {
    return "***-***-" + digits.slice(-4);
  }
  return "***";
}

const updateArrangementSchema = insertArrangementSchema.partial();

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
      const isDemo = req.query.demo === "true";
      if (isDemo) {
        const arr = await storage.createArrangement({ ...data, nextStep: "Forms" });
        const templates = await storage.getFormTemplates();
        const serviceType = data.selections?.["service-type"] || "";
        for (const tmpl of templates) {
          const required = tmpl.requiredForServiceTypes;
          const serviceUnknown = !serviceType;
          const isRequired = required.includes("all") || required.length === 0 || serviceUnknown || required.includes(serviceType);
          if (!isRequired) continue;
          const formUrl = tmpl.jotformId && !tmpl.jotformId.startsWith("PLACEHOLDER")
            ? `https://form.jotform.com/${tmpl.jotformId}?sessionId=${arr.id}&familyName=${encodeURIComponent(arr.familyName)}&serviceType=${encodeURIComponent(serviceType)}&staffName=${encodeURIComponent(req.user?.name || "")}`
            : `/staff/sessions/${arr.id}/forms/${tmpl.id}/fill`;
          await storage.createFormInstance({ arrangementId: arr.id, templateId: tmpl.id, status: "not_sent", formUrl });
        }
        return res.status(201).json(arr);
      }
      const result = await db.transaction(async (tx) => {
        const [arr] = await tx.insert(arrangements).values({
          ...data,
          nextStep: "Forms",
        }).returning();
        await tx.insert(activityLogs).values({
          arrangementId: arr.id,
          actorId: req.user!.id,
          action: "created",
          details: `Created arrangement for ${arr.familyName}`,
        });

        const templates = await storage.getFormTemplates();
        const serviceType = data.selections?.["service-type"] || "";
        for (const tmpl of templates) {
          const required = tmpl.requiredForServiceTypes;
          const serviceUnknown = !serviceType;
          const isRequired = required.includes("all") || required.length === 0 || serviceUnknown || required.includes(serviceType);
          if (!isRequired) continue;

          const formUrl = tmpl.jotformId && !tmpl.jotformId.startsWith("PLACEHOLDER")
            ? `https://form.jotform.com/${tmpl.jotformId}?sessionId=${arr.id}&familyName=${encodeURIComponent(arr.familyName)}&serviceType=${encodeURIComponent(serviceType)}&staffName=${encodeURIComponent(req.user!.name || "")}`
            : `/staff/sessions/${arr.id}/forms/${tmpl.id}/fill`;
          await tx.insert(formInstances).values({
            arrangementId: arr.id,
            templateId: tmpl.id,
            status: "not_sent",
            formUrl,
          });
        }

        return arr;
      });
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create arrangement" });
    }
  });

  app.patch("/api/arrangements/:id", requireAuth, async (req, res) => {
    try {
      const validated = updateArrangementSchema.parse(req.body);
      const before = await storage.getArrangement(req.params.id);
      if (!before) return res.status(404).json({ message: "Arrangement not found" });
      const isDemo = req.query.demo === "true";

      if (isDemo) {
        const arr = await storage.updateArrangement(req.params.id, validated);
        return res.json(arr);
      }

      const result = await db.transaction(async (tx) => {
        const [arr] = await tx.update(arrangements).set(validated).where(eq(arrangements.id, req.params.id)).returning();

        const changes: string[] = [];
        if (validated.status && validated.status !== before.status) changes.push(`Status → ${validated.status}`);
        if (validated.nextStep && validated.nextStep !== before.nextStep) changes.push(`Next step → ${validated.nextStep}`);
        if (validated.selections) changes.push("Updated selections");
        if (validated.notes !== undefined && validated.notes !== before.notes) changes.push("Updated notes");
        if (validated.familyName && validated.familyName !== before.familyName) changes.push(`Renamed to ${validated.familyName}`);

        await tx.insert(activityLogs).values({
          arrangementId: arr.id,
          actorId: req.user!.id,
          action: "updated",
          details: changes.length > 0 ? changes.join("; ") : "Updated arrangement details",
        });
        return arr;
      });
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update arrangement" });
    }
  });

  app.delete("/api/arrangements/:id", requireAuth, async (req, res) => {
    try {
      const arr = await storage.getArrangement(req.params.id);
      const isDemo = req.query.demo === "true";

      if (isDemo) {
        await storage.deleteArrangement(req.params.id);
        return res.json({ message: "Deleted" });
      }

      await db.transaction(async (tx) => {
        await tx.delete(arrangements).where(eq(arrangements.id, req.params.id));
        await tx.insert(activityLogs).values({
          arrangementId: req.params.id,
          actorId: req.user!.id,
          action: "deleted",
          details: arr ? `Deleted arrangement for ${arr.familyName}` : "Deleted arrangement",
        });
      });
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete arrangement" });
    }
  });

  app.get("/api/activity-logs", requireAuth, async (req, res) => {
    try {
      const arrangementId = req.query.arrangementId as string | undefined;
      const since = req.query.since as string | undefined;
      let sinceDate: Date | undefined;
      if (since) {
        const hours = parseInt(since);
        if (!isNaN(hours) && hours > 0) {
          sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        }
      }
      const logs = await storage.getActivityLogs(arrangementId, sinceDate);
      const userIds = [...new Set(logs.map((l) => l.actorId))];
      const userMap: Record<string, string> = {};
      for (const uid of userIds) {
        const u = await storage.getUser(uid);
        if (u) userMap[uid] = u.name;
      }
      const enriched = logs.map((l) => ({
        ...l,
        actorName: userMap[l.actorId] || "Unknown",
      }));
      res.json(enriched);
    } catch {
      res.status(500).json({ message: "Failed to fetch activity logs" });
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

  app.get("/api/form-templates", requireAuth, async (_req, res) => {
    try {
      const templates = await storage.getFormTemplates();
      res.json(templates);
    } catch {
      res.status(500).json({ message: "Failed to fetch form templates" });
    }
  });

  app.get("/api/arrangements/:id/forms", requireAuth, async (req, res) => {
    try {
      const instances = await storage.getFormInstances(req.params.id);
      const templates = await storage.getFormTemplates();
      const templateMap = Object.fromEntries(templates.map(t => [t.id, t]));
      const enriched = instances.map(fi => ({
        ...fi,
        sentTo: fi.sentTo ? maskDestination(fi.sentTo, fi.sentVia || "email") : null,
        template: templateMap[fi.templateId] || null,
      }));
      res.json(enriched);
    } catch {
      res.status(500).json({ message: "Failed to fetch form instances" });
    }
  });

  const formStatusEnum = z.enum(["not_sent", "sent", "completed", "error"]);
  const formChannelEnum = z.enum(["email", "sms"]);
  const updateFormInstanceSchema = z.object({
    status: formStatusEnum.optional(),
    sentVia: formChannelEnum.optional(),
    sentTo: z.string().optional(),
  });

  app.patch("/api/form-instances/:id", requireAuth, async (req, res) => {
    try {
      const parsed = updateFormInstanceSchema.parse(req.body);
      const existing = await storage.getFormInstance(req.params.id);
      if (!existing) return res.status(404).json({ message: "Form instance not found" });

      const updates: Partial<Pick<FormInstance, "status" | "sentVia" | "sentTo" | "sentAt" | "completedAt">> = {};
      if (parsed.status) updates.status = parsed.status;
      if (parsed.sentVia) updates.sentVia = parsed.sentVia;
      if (parsed.sentTo) updates.sentTo = parsed.sentTo;
      if (parsed.status === "sent") updates.sentAt = new Date();
      if (parsed.status === "completed") updates.completedAt = new Date();
      const fi = await storage.updateFormInstance(req.params.id, updates);
      if (!fi) return res.status(404).json({ message: "Form instance not found" });
      res.json(fi);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update form instance" });
    }
  });

  const commEventChannelSchema = z.object({
    channel: z.enum(["email", "sms"]),
    destination: z.string().min(1),
    templateId: z.string().optional(),
    details: z.string().optional(),
  });

  app.post("/api/arrangements/:id/comm-events", requireAuth, async (req, res) => {
    try {
      const validated = commEventChannelSchema.parse(req.body);
      const masked = maskDestination(validated.destination, validated.channel);
      const data = insertCommEventSchema.parse({
        ...validated,
        arrangementId: req.params.id,
        actorId: req.user!.id,
        destination: masked,
      });

      if (data.templateId) {
        const arr = await storage.getArrangement(req.params.id);
        const tmpl = await storage.getFormTemplate(data.templateId);
        if (arr && tmpl) {
          const serviceType = (arr.selections as Record<string, string> | null)?.["service-type"] || "";
          const formUrl = tmpl.jotformId && !tmpl.jotformId.startsWith("PLACEHOLDER")
            ? `https://form.jotform.com/${tmpl.jotformId}?sessionId=${arr.id}&familyName=${encodeURIComponent(arr.familyName)}&serviceType=${encodeURIComponent(serviceType)}&staffName=${encodeURIComponent(req.user!.name || "")}`
            : `/staff/sessions/${arr.id}/forms/${tmpl.id}/fill`;

          const instances = await storage.getFormInstances(req.params.id);
          const fi = instances.find(i => i.templateId === data.templateId);
          if (fi) {
            await storage.updateFormInstance(fi.id, { formUrl });
          }
        }
      }

      const ce = await storage.createCommEvent(data);

      await storage.createActivityLog({
        arrangementId: req.params.id,
        actorId: req.user!.id,
        action: "send_form_link",
        details: `Sent form link via ${data.channel} to ${masked}`,
      });

      res.status(201).json(ce);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create comm event" });
    }
  });

  app.get("/api/arrangements/:id/comm-events", requireAuth, async (req, res) => {
    try {
      const events = await storage.getCommEvents(req.params.id);
      res.json(events);
    } catch {
      res.status(500).json({ message: "Failed to fetch comm events" });
    }
  });

  app.get("/api/service-catalog", requireAuth, async (req, res) => {
    try {
      const itemType = req.query.type as string | undefined;
      const category = req.query.category as string | undefined;
      const items = await storage.getServiceCatalogItems(itemType, category);
      res.json(items);
    } catch {
      res.status(500).json({ message: "Failed to fetch service catalog" });
    }
  });

  app.get("/api/service-catalog/packages", requireAuth, async (_req, res) => {
    try {
      const allItems = await storage.getServiceCatalogItems();
      const packages = allItems.filter(i => i.itemType === "package");
      const result = packages.map(pkg => ({
        ...pkg,
        includedItems: allItems.filter(i => i.itemType !== "package" && (i.includedIn as string[] || []).includes(pkg.id)),
      }));
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/service-catalog/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getServiceCatalogItem(req.params.id);
      if (!item) return res.status(404).json({ message: "Catalog item not found" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Failed to fetch catalog item" });
    }
  });

  app.post("/api/service-catalog", requireDirector, async (req, res) => {
    try {
      const data = insertServiceCatalogSchema.parse(req.body);
      const item = await storage.createServiceCatalogItem(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create catalog item" });
    }
  });

  const updateServiceCatalogSchema = insertServiceCatalogSchema.partial();

  app.patch("/api/service-catalog/:id", requireDirector, async (req, res) => {
    try {
      const data = updateServiceCatalogSchema.parse(req.body);
      const item = await storage.updateServiceCatalogItem(req.params.id, data);
      if (!item) return res.status(404).json({ message: "Catalog item not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update catalog item" });
    }
  });

  app.get("/api/announcements", requireAuth, async (_req, res) => {
    try {
      const items = await storage.getAnnouncements();
      res.json(items);
    } catch {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.get("/api/announcements/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getAnnouncement(req.params.id);
      if (!item) return res.status(404).json({ message: "Announcement not found" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.get("/api/announcements/by-arrangement/:arrangementId", requireAuth, async (req, res) => {
    try {
      const item = await storage.getAnnouncementByArrangementId(req.params.arrangementId);
      res.json(item || null);
    } catch {
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      const data = insertAnnouncementSchema.parse(req.body);
      const existing = await storage.getAnnouncementBySlug(data.slug);
      if (existing) return res.status(400).json({ message: "An announcement with that slug already exists" });
      const item = await storage.createAnnouncement(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  const updateAnnouncementSchema = insertAnnouncementSchema.partial();

  app.patch("/api/announcements/:id", requireAuth, async (req, res) => {
    try {
      const data = updateAnnouncementSchema.parse(req.body);
      if (data.slug) {
        const existing = await storage.getAnnouncementBySlug(data.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ message: "An announcement with that slug already exists" });
        }
      }
      const item = await storage.updateAnnouncement(req.params.id, data);
      if (!item) return res.status(404).json({ message: "Announcement not found" });
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/announcements/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/public/announcements/:slug", async (req, res) => {
    try {
      const item = await storage.getAnnouncementBySlug(req.params.slug);
      if (!item || !item.isPublished) return res.status(404).json({ message: "Announcement not found" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Failed to fetch announcement" });
    }
  });

  app.get("/api/public/obituaries/:slug", async (req, res) => {
    try {
      const item = await storage.getAnnouncementBySlug(req.params.slug);
      if (!item || !item.isPublished) return res.status(404).json({ message: "Obituary not found" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Failed to fetch obituary" });
    }
  });

  app.get("/api/public/announcements/:slug/condolences", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncementBySlug(req.params.slug);
      if (!announcement || !announcement.isPublished) return res.status(404).json({ message: "Announcement not found" });
      const messages = await storage.getCondolenceMessages(announcement.id);
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Failed to fetch condolence messages" });
    }
  });

  app.post("/api/public/announcements/:slug/condolences", async (req, res) => {
    try {
      const announcement = await storage.getAnnouncementBySlug(req.params.slug);
      if (!announcement || !announcement.isPublished) return res.status(404).json({ message: "Announcement not found" });
      const { visitorName, message: msg } = req.body;
      if (!visitorName || typeof visitorName !== 'string' || visitorName.trim().length < 1 || visitorName.trim().length > 200) {
        return res.status(400).json({ message: "Name must be between 1 and 200 characters" });
      }
      if (!msg || typeof msg !== 'string' || msg.trim().length < 1 || msg.trim().length > 2000) {
        return res.status(400).json({ message: "Message must be between 1 and 2000 characters" });
      }
      const data = insertCondolenceMessageSchema.parse({
        visitorName: visitorName.trim(),
        message: msg.trim(),
        announcementId: announcement.id,
      });
      const message = await storage.createCondolenceMessage(data);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to submit condolence message" });
    }
  });

  app.get("/api/announcements/:id/condolences", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getCondolenceMessages(req.params.id);
      res.json(messages);
    } catch {
      res.status(500).json({ message: "Failed to fetch condolence messages" });
    }
  });

  app.delete("/api/condolences/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteCondolenceMessage(req.params.id);
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete condolence message" });
    }
  });

  registerCremationRoutes(app);

  const ASSETS_BASE = path.resolve("attached_assets");

  app.get("/api/form-templates/:id/download", requireAuth, async (req, res) => {
    try {
      const template = await storage.getFormTemplate(req.params.id);
      if (!template || !template.pdfPath) {
        return res.status(404).json({ message: "PDF not available for this form" });
      }
      const filePath = path.resolve(template.pdfPath);
      if (!filePath.startsWith(ASSETS_BASE)) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.download(filePath);
    } catch {
      res.status(500).json({ message: "Failed to download form" });
    }
  });

  return httpServer;
}
