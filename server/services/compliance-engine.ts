import { storage } from "../storage";
import * as pdfGenerator from "./pdf-generator";
import * as googleDrive from "./google-drive";
import { emitCremationEvent } from "../cremation-events";
import type { CremationOrder, CremationEvent } from "@shared/schema";

const COMPLIANCE_FOLDER = "06 Compliance Packet";

export interface CompliancePacketResult {
  success: boolean;
  message: string;
  documents?: Array<{ name: string; driveUrl?: string }>;
}

export function checkComplianceReadiness(events: CremationEvent[]): {
  ready: boolean;
  missing: string[];
} {
  const eventTypes = new Set(events.map(e => e.eventType));
  const missing: string[] = [];

  if (!eventTypes.has("CREMATION_COMPLETED")) {
    missing.push("CREMATION_COMPLETED");
  }
  if (!eventTypes.has("RELEASE_RECORDED") && !eventTypes.has("SHIPMENT_RECORDED")) {
    missing.push("RELEASE_RECORDED or SHIPMENT_RECORDED");
  }

  return { ready: missing.length === 0, missing };
}

export function checkLouisianaWaitingPeriod(
  events: CremationEvent[],
  stateOfDeath?: string | null
): { compliant: boolean; message: string; hoursElapsed?: number } {
  if (stateOfDeath?.toUpperCase() !== "LA" && stateOfDeath?.toUpperCase() !== "LOUISIANA") {
    return { compliant: true, message: "Non-Louisiana case, no waiting period required" };
  }

  const orderCreated = events.find(e => e.eventType === "ORDER_CREATED");
  if (!orderCreated) {
    return { compliant: false, message: "No ORDER_CREATED event found to determine timeline" };
  }

  const details = orderCreated.details as Record<string, unknown>;
  const deathDateStr = details?.dateOfDeath as string | undefined;

  let referenceTime: Date;
  if (deathDateStr) {
    referenceTime = new Date(deathDateStr);
  } else {
    referenceTime = new Date(orderCreated.createdAt!);
  }

  const now = new Date();
  const hoursElapsed = (now.getTime() - referenceTime.getTime()) / (1000 * 60 * 60);

  if (hoursElapsed < 24) {
    return {
      compliant: false,
      message: `Louisiana law (LA R.S. 8:655) requires a minimum 24-hour waiting period from death to cremation. Only ${hoursElapsed.toFixed(1)} hours have elapsed.`,
      hoursElapsed,
    };
  }

  return { compliant: true, message: "24-hour waiting period satisfied", hoursElapsed };
}

export async function generateCompliancePacket(
  orderId: string
): Promise<CompliancePacketResult> {
  const order = await storage.getCremationOrder(orderId);
  if (!order) {
    return { success: false, message: "Order not found" };
  }

  if (order.packetLocked) {
    return { success: false, message: "Compliance packet is locked. Modifications will be recorded as addendum events." };
  }

  const events = await storage.listCremationEvents(orderId);
  const readiness = checkComplianceReadiness(events);
  if (!readiness.ready) {
    return {
      success: false,
      message: `Case not ready for compliance packet. Missing: ${readiness.missing.join(", ")}`,
    };
  }

  const [caseSummaryPdf, chainOfCustodyPdf, paymentRecordPdf, releaseRecordPdf] =
    await Promise.all([
      pdfGenerator.generateCaseSummary(order, events),
      pdfGenerator.generateChainOfCustody(order, events),
      pdfGenerator.generatePaymentRecord(order),
      pdfGenerator.generateReleaseRecord(order, events),
    ]);

  const generatedDocs = [
    { name: "Case-Summary.pdf", buffer: caseSummaryPdf },
    { name: "Chain-of-Custody.pdf", buffer: chainOfCustodyPdf },
    { name: "Payment-Record.pdf", buffer: paymentRecordPdf },
    { name: "Release-Shipping-Record.pdf", buffer: releaseRecordPdf },
  ];

  const mergedPdf = await pdfGenerator.mergeDocuments(
    generatedDocs.map(d => d.buffer)
  );
  generatedDocs.push({ name: "Final-Compliance-Packet.pdf", buffer: mergedPdf });

  const resultDocs: Array<{ name: string; driveUrl?: string }> = [];

  const subfolders = (order.driveSubfolders || {}) as Record<string, string>;
  const complianceFolderId = subfolders[COMPLIANCE_FOLDER];

  if (googleDrive.isConfigured() && complianceFolderId) {
    for (const doc of generatedDocs) {
      try {
        const uploaded = await googleDrive.uploadFile(
          complianceFolderId,
          doc.name,
          "application/pdf",
          doc.buffer
        );
        await storage.createCremationDocument({
          orderId,
          driveFileId: uploaded.id,
          driveUrl: uploaded.url,
          documentType: `compliance_${doc.name.replace(".pdf", "").toLowerCase().replace(/-/g, "_")}`,
          folderPath: COMPLIANCE_FOLDER,
        });
        resultDocs.push({ name: doc.name, driveUrl: uploaded.url });
      } catch (err) {
        console.error(`Failed to upload ${doc.name} to Drive:`, err);
        resultDocs.push({ name: doc.name });
      }
    }
  } else {
    generatedDocs.forEach(doc => resultDocs.push({ name: doc.name }));
    console.log("Google Drive not configured or compliance folder not found. PDFs generated but not uploaded.");
  }

  return {
    success: true,
    message: "Compliance packet generated successfully",
    documents: resultDocs,
  };
}

export async function handleComplianceTrigger(orderId: string): Promise<void> {
  const result = await generateCompliancePacket(orderId);

  if (result.success) {
    await storage.updateCremationOrder(orderId, {
      packetLocked: true,
      currentPhase: "completed",
    });

    await emitCremationEvent(orderId, "CASE_COMPLETED", { type: "system" }, {
      compliancePacket: result.documents,
      packetLocked: true,
    });

    console.log(`Compliance packet generated and locked for order ${orderId}`);
  } else {
    console.error(`Compliance packet generation failed for order ${orderId}: ${result.message}`);
  }
}
