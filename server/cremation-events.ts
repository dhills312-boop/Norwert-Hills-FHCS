import { storage } from "./storage";
import type { CremationEventType, CremationActorType, CremationEvent } from "@shared/schema";

type CremationEventHandler = (event: CremationEvent) => void | Promise<void>;

const handlers: CremationEventHandler[] = [];

export function onCremationEvent(handler: CremationEventHandler): void {
  handlers.push(handler);
}

export async function emitCremationEvent(
  orderId: string,
  eventType: CremationEventType,
  actor: { type: CremationActorType; id?: string },
  details?: Record<string, unknown>
): Promise<CremationEvent> {
  const event = await storage.createCremationEvent({
    orderId,
    eventType,
    actorType: actor.type,
    actorId: actor.id || null,
    details: details || {},
  });

  for (const handler of handlers) {
    try {
      await handler(event);
    } catch (err) {
      console.error(`Cremation event handler error for ${eventType}:`, err);
    }
  }

  return event;
}
