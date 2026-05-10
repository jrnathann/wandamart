/**
 * lib/metaCapi.ts
 *
 * Server-side Meta Conversions API utility.
 * Sends events directly from your server to Meta — bypassing ad blockers,
 * iOS privacy restrictions, and browser limitations.
 *
 * Required env vars:
 *   META_PIXEL_ID       — your pixel ID (numbers only)
 *   META_ACCESS_TOKEN   — your CAPI access token (from Events Manager)
 *   META_TEST_CODE      — (optional) test event code, remove in production
 */

const PIXEL_ID = process.env.FACEBOOK_PIXEL!;
const ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN!;
const TEST_CODE = process.env.META_TEST_CODE; // e.g. "TEST12345" — remove in prod

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CapiUserData {
  ph?: string;       // hashed phone (E.164 → SHA-256)
  fn?: string;       // hashed first name
  ln?: string;       // hashed last name
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;      // _fbp cookie — NOT hashed
  fbc?: string;      // _fbc cookie — NOT hashed
  country?: string;  // ISO 2-letter, NOT hashed
}
 
export interface CapiCustomData {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  order_id?: string;
  content_category?: string;
}
 
export interface CapiEvent {
  event_name: string;
  event_time: number;           // Unix timestamp (seconds)
  event_source_url?: string;
  action_source: "website";
  user_data: CapiUserData;
  custom_data?: CapiCustomData;
}
 
// ─── Hashing helpers ──────────────────────────────────────────────────────────
 
import { createHash } from "crypto";
 
function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
 
function normalizePhone(phone: string): string {
  let normalized = phone.trim().replace(/\s+/g, "").replace(/-/g, "");
  if (!normalized.startsWith("+")) {
    normalized = normalized.startsWith("237")
      ? "+" + normalized
      : "+237" + normalized;
  }
  return normalized;
}
 
export function hashPhone(phone: string): string {
  return sha256(normalizePhone(phone));
}
 
export function buildHashedUserData(
  name: string,
  phone: string
): { ph: string; fn: string; ln: string; country: string } {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
 
  return {
    ph: hashPhone(phone),
    fn: sha256(firstName),
    // ln must be empty string if no last name — don't send empty hashes
    ln: lastName ? sha256(lastName) : "",
    // country MUST be hashed as SHA-256 of the ISO 2-letter code (lowercase)
    country: sha256("cm"),
  };
}
 
// ─── Core sender ─────────────────────────────────────────────────────────────
 
export async function sendCapiEvents(events: CapiEvent[]): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("⚠️  META_PIXEL_ID or META_ACCESS_TOKEN not set — skipping CAPI");
    return;
  }
 
  const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
 
  const payload: Record<string, any> = { data: events };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;
 
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
 
    const json = await res.json();
 
    if (!res.ok) {
      console.error("❌ Meta CAPI error:", JSON.stringify(json));
    } else {
      console.log(
        `✅ Meta CAPI: sent ${events.map((e) => e.event_name).join(", ")} — `,
        json
      );
    }
  } catch (err) {
    // Never let CAPI failures crash your order flow
    console.error("❌ Meta CAPI fetch failed:", err);
  }
}
 
// ─── Convenience event builders ───────────────────────────────────────────────
 
/**
 * Lead — fire server-side when a COD order is successfully created.
 * Deduplication: pass the same event_id you used in the browser fbq() call.
 */
export async function sendLeadEvent({
  orderId,
  productName,
  productCategory,
  value,
  currency = "XAF",
  name,
  phone,
  ip,
  ua,
  fbp,
  fbc,
  eventSourceUrl,
}: {
  orderId: string;
  productName: string;
  productCategory?: string;
  value: number;
  currency?: string;
  name: string;
  phone: string;
  ip?: string;
  ua?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}): Promise<void> {
  const { ln, ...hashed } = buildHashedUserData(name, phone);
 
  const event: CapiEvent = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: {
      ...hashed,
      // Only include ln if the customer actually has a last name
      ...(ln ? { ln } : {}),
      client_ip_address: ip,
      client_user_agent: ua,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    },
    custom_data: {
      content_name: productName,
      content_category: productCategory,
      value,
      currency,
      order_id: orderId,
    },
  };
 
  await sendCapiEvents([event]);
}
 
/**
 * Purchase — fire server-side when online payment is confirmed.
 */
export async function sendPurchaseEvent({
  orderId,
  productName,
  productIds,
  value,
  currency = "XAF",
  numItems,
  name,
  phone,
  ip,
  ua,
  fbp,
  fbc,
  eventSourceUrl,
}: {
  orderId: string;
  productName: string;
  productIds: string[];
  value: number;
  currency?: string;
  numItems: number;
  name: string;
  phone: string;
  ip?: string;
  ua?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}): Promise<void> {
  const { ln, ...hashed } = buildHashedUserData(name, phone);
 
  const event: CapiEvent = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: {
      ...hashed,
      ...(ln ? { ln } : {}),
      client_ip_address: ip,
      client_user_agent: ua,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
    },
    custom_data: {
      content_name: productName,
      content_ids: productIds,
      content_type: "product",
      value,
      currency,
      num_items: numItems,
      order_id: orderId,
    },
  };
 
  await sendCapiEvents([event]);
}