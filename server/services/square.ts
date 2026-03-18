import crypto from "crypto";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";
const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || "sandbox";

const BASE_URL =
  SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

export function isSquareConfigured(): boolean {
  return !!(SQUARE_ACCESS_TOKEN && SQUARE_LOCATION_ID);
}

export async function createCheckoutLink(
  orderId: string,
  amount: number,
  description: string,
  orderToken: string
): Promise<{ checkoutUrl: string; checkoutId: string }> {
  if (!isSquareConfigured()) {
    throw new Error("Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.");
  }

  const amountInCents = Math.round(amount * 100);
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch(`${BASE_URL}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey,
      quick_pay: {
        name: description,
        price_money: {
          amount: amountInCents,
          currency: "USD",
        },
        location_id: SQUARE_LOCATION_ID,
      },
      payment_note: `Order: ${orderId}`,
      pre_populated_data: {
        buyer_email: "",
      },
      checkout_options: {
        allow_tipping: false,
        redirect_url: undefined,
        ask_for_shipping_address: false,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Square API error:", response.status, errorBody);
    throw new Error(`Square API error: ${response.status}`);
  }

  const data = await response.json();
  const paymentLink = data.payment_link;

  if (!paymentLink?.url) {
    throw new Error("Square did not return a checkout URL");
  }

  return {
    checkoutUrl: paymentLink.url,
    checkoutId: paymentLink.id,
  };
}

export function isWebhookSignatureKeyConfigured(): boolean {
  return !!SQUARE_WEBHOOK_SIGNATURE_KEY;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  webhookUrl: string
): boolean {
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return false;
  }

  const combined = webhookUrl + rawBody;
  const expectedSignature = crypto
    .createHmac("sha256", SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(combined)
    .digest("base64");

  const sigBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

export interface SquareWebhookEvent {
  merchant_id: string;
  type: string;
  event_id: string;
  created_at: string;
  data: {
    type: string;
    id: string;
    object: Record<string, unknown>;
  };
}
