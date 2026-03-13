import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { cremationOrders, cremationEvents, cremationPhases, cremationEventTypes } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { checkServiceArea } from "./service-area";
import { emitCremationEvent } from "./cremation-events";
import * as googleDrive from "./services/google-drive";
import { createCheckoutLink, verifyWebhookSignature, isSquareConfigured, isWebhookSignatureKeyConfigured, type SquareWebhookEvent } from "./services/square";
import { z } from "zod";
import crypto from "crypto";

function generateOrderToken(): string {
  return crypto.randomBytes(16).toString("base64url");
}

const checkServiceAreaSchema = z.object({
  zip: z.string().min(3).max(10),
});

const createOrderSchema = z.object({
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  decedentName: z.string().min(1),
  stateOfDeath: z.string().optional(),
});

const updateOrderSchema = z.object({
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  decedentName: z.string().min(1).optional(),
  stateOfDeath: z.string().optional(),
  currentPhase: z.enum(cremationPhases).optional(),
  paymentStatus: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentTimestamp: z.coerce.date().optional(),
  packetLocked: z.boolean().optional(),
  driveRootFolderId: z.string().optional(),
  driveRootFolderUrl: z.string().optional(),
  driveSubfolders: z.record(z.string()).optional(),
});

const logEventSchema = z.object({
  eventType: z.enum(cremationEventTypes),
  details: z.record(z.unknown()).optional(),
});

const waitlistSchema = z.object({
  email: z.string().email(),
  zip: z.string().optional(),
});

export function registerCremationRoutes(app: Express): void {
  app.post("/api/cremation/check-service-area", async (req, res) => {
    try {
      const { zip } = checkServiceAreaSchema.parse(req.body);
      const result = checkServiceArea(zip);
      if (!result) {
        return res.status(400).json({ message: "Could not determine location for the provided zip code" });
      }
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to check service area" });
    }
  });

  app.post("/api/cremation/orders", async (req, res) => {
    try {
      const data = createOrderSchema.parse(req.body);
      const orderToken = generateOrderToken();

      const order = await storage.createCremationOrder({
        orderToken,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        decedentName: data.decedentName,
        stateOfDeath: data.stateOfDeath || null,
        currentPhase: "intake",
        packetLocked: false,
        paymentStatus: null,
        paymentReference: null,
        paymentTimestamp: null,
        driveRootFolderId: null,
        driveRootFolderUrl: null,
        driveSubfolders: {},
      });

      await emitCremationEvent(order.id, "ORDER_CREATED", { type: "system" }, {
        contactEmail: data.contactEmail,
        decedentName: data.decedentName,
      });

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create cremation order" });
    }
  });

  app.get("/api/cremation/orders/:token", async (req, res) => {
    try {
      const order = await storage.getCremationOrderByToken(req.params.token);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch {
      res.status(500).json({ message: "Failed to fetch cremation order" });
    }
  });

  app.get("/api/cremation/orders", requireAuth, async (_req, res) => {
    try {
      const orders = await storage.listCremationOrders();
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Failed to fetch cremation orders" });
    }
  });

  app.patch("/api/cremation/orders/:id", requireAuth, async (req, res) => {
    try {
      const data = updateOrderSchema.parse(req.body);
      const existing = await storage.getCremationOrder(req.params.id);
      if (!existing) return res.status(404).json({ message: "Order not found" });
      const updated = await storage.updateCremationOrder(req.params.id, data);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update cremation order" });
    }
  });

  app.post("/api/cremation/orders/:id/events", requireAuth, async (req, res) => {
    try {
      const data = logEventSchema.parse(req.body);
      const order = await storage.getCremationOrder(req.params.id as string);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const event = await emitCremationEvent(
        req.params.id as string,
        data.eventType,
        { type: "staff", id: req.user!.id },
        data.details
      );
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to log cremation event" });
    }
  });

  app.get("/api/cremation/orders/:id/events", requireAuth, async (req, res) => {
    try {
      const order = await storage.getCremationOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const events = await storage.listCremationEvents(req.params.id);
      res.json(events);
    } catch {
      res.status(500).json({ message: "Failed to fetch cremation events" });
    }
  });

  app.post("/api/cremation/waitlist", async (req, res) => {
    try {
      const data = waitlistSchema.parse(req.body);
      const signup = await storage.createWaitlistSignup(data);
      res.status(201).json(signup);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to join waitlist" });
    }
  });

  app.get("/api/cremation/orders/:id/documents", requireAuth, async (req, res) => {
    try {
      const order = await storage.getCremationOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const documents = await storage.listCremationDocuments(req.params.id);
      const subfolders = (order.driveSubfolders || {}) as Record<string, string>;
      const files: Record<string, Array<{ id: string; name: string; mimeType: string; url: string }>> = {};

      if (googleDrive.isConfigured()) {
        for (const [folderName, folderId] of Object.entries(subfolders)) {
          try {
            files[folderName] = await googleDrive.listFiles(folderId);
          } catch {
            files[folderName] = [];
          }
        }
      }

      res.json({
        orderId: order.id,
        orderToken: order.orderToken,
        rootFolderId: order.driveRootFolderId,
        rootFolderUrl: order.driveRootFolderUrl,
        subfolders,
        files,
        documents,
      });
    } catch (err) {
      console.error("Failed to fetch cremation documents:", err);
      res.status(500).json({ message: "Failed to fetch cremation documents" });
    }
  });

  app.get("/api/cremation/orders/:id/drive-link", requireAuth, async (req, res) => {
    try {
      const order = await storage.getCremationOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (!order.driveRootFolderId) return res.status(404).json({ message: "No Drive folder found for this case" });
      res.json({
        rootFolderId: order.driveRootFolderId,
        rootFolderUrl: order.driveRootFolderUrl,
        orderToken: order.orderToken,
      });
    } catch {
      res.status(500).json({ message: "Failed to fetch Drive link" });
    }
  });

  app.post("/api/cremation/orders/:id/create-drive-folder", requireAuth, async (req, res) => {
    try {
      if (!googleDrive.isConfigured()) {
        return res.status(503).json({ message: "Google Drive integration is not configured" });
      }

      const order = await storage.getCremationOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.driveRootFolderId) {
        return res.json({
          message: "Drive folder already exists",
          rootFolderUrl: order.driveRootFolderUrl,
          rootFolderId: order.driveRootFolderId,
        });
      }

      const folderName = `${order.decedentName.replace(/[^a-zA-Z0-9]/g, "-")}-${order.orderToken.slice(0, 8)}`;
      const driveResult = await googleDrive.createCaseStructure(folderName);

      const updated = await storage.updateCremationOrder(order.id, {
        driveRootFolderId: driveResult.rootFolderId,
        driveRootFolderUrl: driveResult.rootFolderUrl,
        driveSubfolders: driveResult.subfolders,
      });

      await emitCremationEvent(order.id, "ORDER_CREATED", { type: "staff", id: req.user!.id }, {
        action: "drive_folder_created",
        folderName,
      });

      res.status(201).json(updated);
    } catch (err) {
      console.error("Failed to create Drive folder:", err);
      res.status(500).json({ message: "Failed to create Google Drive folder structure" });
    }
  });

  app.post("/api/cremation/orders/:id/payment-link", requireAuth, async (req, res) => {
    try {
      if (!isSquareConfigured()) {
        return res.status(503).json({ message: "Square payment is not configured" });
      }

      const order = await storage.getCremationOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);

      const description = `Cremation services for ${order.decedentName}`;

      const { checkoutUrl, checkoutId } = await createCheckoutLink(
        order.id,
        amount,
        description,
        order.orderToken
      );

      await storage.updateCremationOrder(order.id, {
        paymentStatus: "pending",
      });

      await emitCremationEvent(order.id, "PAYMENT_LINK_CREATED", { type: "staff", id: req.user!.id }, {
        checkoutId,
        checkoutUrl,
        amount,
      });

      res.json({ checkoutUrl, checkoutId, amount });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      console.error("Failed to create payment link:", err);
      res.status(500).json({ message: "Failed to create payment link" });
    }
  });

  app.post("/api/cremation/webhooks/square", async (req, res) => {
    try {
      const signature = req.headers["x-square-hmacsha256-signature"] as string;

      if (!isWebhookSignatureKeyConfigured()) {
        console.error("Square webhook signature key not configured, rejecting webhook");
        return res.status(503).json({ message: "Webhook not configured" });
      }

      if (!signature) {
        console.warn("Square webhook: missing signature header");
        return res.status(403).json({ message: "Missing signature" });
      }

      const rawBody = JSON.stringify(req.body);
      const webhookUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      const isValid = verifyWebhookSignature(rawBody, signature, webhookUrl);
      if (!isValid) {
        console.warn("Invalid Square webhook signature");
        return res.status(403).json({ message: "Invalid signature" });
      }

      const event = req.body as SquareWebhookEvent;

      if (event.type === "payment.completed" || event.type === "payment.updated") {
        const existingEvent = await storage.getCremationEventBySquareEventId(event.event_id);
        if (existingEvent) {
          return res.status(200).json({ message: "Event already processed" });
        }

        const paymentData = event.data?.object as Record<string, unknown>;
        const payment = (paymentData?.payment || paymentData) as Record<string, unknown>;
        const paymentStatus = payment?.status as string;
        const paymentId = payment?.id as string || event.data?.id;
        const note = payment?.note as string || "";

        const orderIdMatch = note.match(/Order:\s*([a-f0-9-]+)/i);
        const orderId = orderIdMatch?.[1];

        if (!orderId) {
          console.warn("Square webhook: could not extract order ID from payment note:", note);
          return res.status(200).json({ message: "No matching order" });
        }

        const order = await storage.getCremationOrder(orderId);
        if (!order) {
          console.warn("Square webhook: cremation order not found:", orderId);
          return res.status(200).json({ message: "Order not found" });
        }

        if (paymentStatus === "COMPLETED") {
          await db.transaction(async (tx) => {
            await tx.update(cremationOrders).set({
              paymentStatus: "confirmed",
              paymentReference: paymentId,
              paymentTimestamp: new Date(),
              updatedAt: new Date(),
            }).where(eq(cremationOrders.id, orderId));

            await tx.insert(cremationEvents).values({
              orderId,
              eventType: "PAYMENT_CONFIRMED",
              actorType: "system",
              details: {
                transactionId: paymentId,
                squareEventId: event.event_id,
                amount: payment?.amount_money,
              },
            });
          });
        } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELED") {
          await db.transaction(async (tx) => {
            await tx.update(cremationOrders).set({
              paymentStatus: "failed",
              updatedAt: new Date(),
            }).where(eq(cremationOrders.id, orderId));

            await tx.insert(cremationEvents).values({
              orderId,
              eventType: "PAYMENT_FAILED",
              actorType: "system",
              details: {
                transactionId: paymentId,
                squareEventId: event.event_id,
                status: paymentStatus,
              },
            });
          });
        }
      }

      res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
      console.error("Square webhook error:", err);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.get("/api/cremation/orders/:id/payment-status", requireAuth, async (req, res) => {
    try {
      const order = await storage.getCremationOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({
        paymentStatus: order.paymentStatus || "pending",
        paymentReference: order.paymentReference,
        paymentTimestamp: order.paymentTimestamp,
      });
    } catch {
      res.status(500).json({ message: "Failed to fetch payment status" });
    }
  });
}
