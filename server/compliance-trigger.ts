import { onCremationEvent } from "./cremation-events";
import { storage } from "./storage";
import { checkComplianceReadiness, handleComplianceTrigger } from "./services/compliance-engine";

export function registerComplianceTrigger(): void {
  onCremationEvent(async (event) => {
    if (
      event.eventType !== "CREMATION_COMPLETED" &&
      event.eventType !== "RELEASE_RECORDED" &&
      event.eventType !== "SHIPMENT_RECORDED"
    ) {
      return;
    }

    const order = await storage.getCremationOrder(event.orderId);
    if (!order || order.packetLocked) {
      return;
    }

    const events = await storage.listCremationEvents(event.orderId);
    const { ready } = checkComplianceReadiness(events);

    if (ready) {
      console.log(`Auto-triggering compliance packet for order ${event.orderId}`);
      await handleComplianceTrigger(event.orderId);
    }
  });

  console.log("Compliance trigger registered");
}
