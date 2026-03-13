import PDFDocument from "pdfkit";
import { PDFDocument as PDFLib } from "pdf-lib";
import type { CremationOrder, CremationEvent } from "@shared/schema";

const COMPANY_NAME = "New Haven Funeral & Cremation Services";
const COMPANY_ADDRESS = "2421 Whitney Ave, New Orleans, LA 70114";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createPdfBuffer(buildFn: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    buildFn(doc);
    doc.end();
  });
}

function addHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc.fontSize(10).text(COMPANY_NAME, { align: "center" });
  doc.fontSize(8).text(COMPANY_ADDRESS, { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown(1);
}

function addField(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(10).font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
  doc.moveDown(0.3);
}

function addFooter(doc: PDFKit.PDFDocument): void {
  const y = doc.page.height - 50;
  doc.fontSize(7).text(
    `Generated on ${formatDate(new Date())} | ${COMPANY_NAME} | CONFIDENTIAL`,
    50,
    y,
    { align: "center", width: 512 }
  );
}

export async function generateCaseSummary(
  order: CremationOrder,
  events: CremationEvent[]
): Promise<Buffer> {
  return createPdfBuffer((doc) => {
    addHeader(doc, "Case Summary");

    doc.fontSize(12).font("Helvetica-Bold").text("Order Information");
    doc.moveDown(0.5);
    addField(doc, "Case ID", order.id);
    addField(doc, "Order Token", order.orderToken);
    addField(doc, "Current Phase", order.currentPhase);
    addField(doc, "Created", formatDate(order.createdAt));
    addField(doc, "Last Updated", formatDate(order.updatedAt));
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Contact Information");
    doc.moveDown(0.5);
    addField(doc, "Contact Name", order.contactName);
    addField(doc, "Contact Email", order.contactEmail);
    addField(doc, "Contact Phone", order.contactPhone || "N/A");
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Decedent Information");
    doc.moveDown(0.5);
    addField(doc, "Decedent Name", order.decedentName);
    addField(doc, "State of Death", order.stateOfDeath || "N/A");
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Key Dates");
    doc.moveDown(0.5);
    const orderCreated = events.find(e => e.eventType === "ORDER_CREATED");
    const cremCompleted = events.find(e => e.eventType === "CREMATION_COMPLETED");
    const caseCompleted = events.find(e => e.eventType === "CASE_COMPLETED");
    addField(doc, "Order Created", formatDate(orderCreated?.createdAt));
    addField(doc, "Cremation Completed", formatDate(cremCompleted?.createdAt));
    addField(doc, "Case Completed", formatDate(caseCompleted?.createdAt));

    addFooter(doc);
  });
}

export async function generateChainOfCustody(
  order: CremationOrder,
  events: CremationEvent[]
): Promise<Buffer> {
  return createPdfBuffer((doc) => {
    addHeader(doc, "Chain of Custody Log");

    addField(doc, "Case ID", order.id);
    addField(doc, "Decedent", order.decedentName);
    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold").text("Chronological Event Timeline");
    doc.moveDown(0.5);

    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );

    const tableTop = doc.y;
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("#", 50, tableTop, { width: 25 });
    doc.text("Timestamp", 75, tableTop, { width: 150 });
    doc.text("Event Type", 225, tableTop, { width: 150 });
    doc.text("Actor", 375, tableTop, { width: 80 });
    doc.text("Details", 455, tableTop, { width: 107 });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica").fontSize(8);
    sortedEvents.forEach((event, i) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
      }
      const y = doc.y;
      doc.text(String(i + 1), 50, y, { width: 25 });
      doc.text(formatDate(event.createdAt), 75, y, { width: 150 });
      doc.text(event.eventType, 225, y, { width: 150 });
      doc.text(event.actorType + (event.actorId ? ` (${event.actorId.slice(0, 8)})` : ""), 375, y, { width: 80 });
      const details = event.details as Record<string, unknown>;
      const detailStr = details && Object.keys(details).length > 0
        ? Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(", ").slice(0, 50)
        : "-";
      doc.text(detailStr, 455, y, { width: 107 });
      doc.moveDown(0.5);
    });

    addFooter(doc);
  });
}

export async function generatePaymentRecord(order: CremationOrder): Promise<Buffer> {
  return createPdfBuffer((doc) => {
    addHeader(doc, "Payment Record");

    addField(doc, "Case ID", order.id);
    addField(doc, "Decedent", order.decedentName);
    addField(doc, "Contact", order.contactName);
    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold").text("Payment Details");
    doc.moveDown(0.5);
    addField(doc, "Payment Status", order.paymentStatus || "Not Recorded");
    addField(doc, "Transaction Reference", order.paymentReference || "N/A");
    addField(doc, "Payment Timestamp", formatDate(order.paymentTimestamp));

    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").text(
      "This document serves as an official record of payment for cremation services provided by " +
      COMPANY_NAME + ". Retain this record for your files.",
      { align: "center" }
    );

    addFooter(doc);
  });
}

export async function generateReleaseRecord(
  order: CremationOrder,
  events: CremationEvent[]
): Promise<Buffer> {
  return createPdfBuffer((doc) => {
    addHeader(doc, "Release / Shipping Record");

    addField(doc, "Case ID", order.id);
    addField(doc, "Decedent", order.decedentName);
    addField(doc, "Contact", order.contactName);
    doc.moveDown(1);

    const releaseEvent = events.find(e => e.eventType === "RELEASE_RECORDED");
    const shipmentEvent = events.find(e => e.eventType === "SHIPMENT_RECORDED");

    if (releaseEvent) {
      doc.fontSize(12).font("Helvetica-Bold").text("Release Details");
      doc.moveDown(0.5);
      addField(doc, "Release Date", formatDate(releaseEvent.createdAt));
      addField(doc, "Recorded By", releaseEvent.actorType + (releaseEvent.actorId ? ` (${releaseEvent.actorId.slice(0, 8)})` : ""));
      const details = releaseEvent.details as Record<string, unknown>;
      if (details) {
        Object.entries(details).forEach(([key, value]) => {
          addField(doc, key, String(value));
        });
      }
      doc.moveDown(0.5);
    }

    if (shipmentEvent) {
      doc.fontSize(12).font("Helvetica-Bold").text("Shipping Details");
      doc.moveDown(0.5);
      addField(doc, "Shipment Date", formatDate(shipmentEvent.createdAt));
      addField(doc, "Recorded By", shipmentEvent.actorType + (shipmentEvent.actorId ? ` (${shipmentEvent.actorId.slice(0, 8)})` : ""));
      const details = shipmentEvent.details as Record<string, unknown>;
      if (details) {
        Object.entries(details).forEach(([key, value]) => {
          addField(doc, key, String(value));
        });
      }
      doc.moveDown(0.5);
    }

    if (!releaseEvent && !shipmentEvent) {
      doc.fontSize(10).text("No release or shipment records found for this case.");
    }

    addFooter(doc);
  });
}

export async function mergeDocuments(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFLib.create();

  for (const buffer of pdfBuffers) {
    const sourcePdf = await PDFLib.load(buffer);
    const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const bytes = await mergedPdf.save();
  return Buffer.from(bytes);
}
