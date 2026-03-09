// lib/facebook-capi.ts
// Facebook Conversions API service
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api


import crypto from "crypto";
import { storeConfig } from "@/data/configData";

const PIXEL_ID = storeConfig.tracking.facebookPixelId;
const ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN!;
const API_VERSION = "v19.0";
const CAPI_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CAPIUserData {
  email?: string;       // will be hashed automatically
  phone?: string;       // will be hashed automatically
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;     // ISO 2-letter, e.g. "CM" for Cameroon
  ipAddress?: string;
  userAgent?: string;
  fbc?: string;         // Facebook click ID cookie (_fbc)
  fbp?: string;         // Facebook browser ID cookie (_fbp)
}

export interface PurchaseEventData {
  orderId: string;
  value: number;        // order total in XAF (or your currency)
  currency?: string;    // default "XAF"
  userData: CAPIUserData;
  eventSourceUrl?: string;
  testEventCode?: string; // Use during testing: "TEST12345"
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

function hash(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function hashPhone(phone: string): string {
  // Normalize: remove spaces, dashes, and ensure + prefix
  const normalized = phone.replace(/[\s\-().]/g, "");
  return hash(normalized);
}

// ─── Build user_data ──────────────────────────────────────────────────────────

function buildUserData(userData: CAPIUserData): Record<string, string> {
  const data: Record<string, string> = {};

  if (userData.email) data.em = hash(userData.email);
  if (userData.phone) data.ph = hashPhone(userData.phone);
  if (userData.firstName) data.fn = hash(userData.firstName);
  if (userData.lastName) data.ln = hash(userData.lastName);
  if (userData.city) data.ct = hash(userData.city);
  if (userData.country) data.country = hash(userData.country.toLowerCase());

  // These are NOT hashed
  if (userData.ipAddress) data.client_ip_address = userData.ipAddress;
  if (userData.userAgent) data.client_user_agent = userData.userAgent;
  if (userData.fbc) data.fbc = userData.fbc;
  if (userData.fbp) data.fbp = userData.fbp;

  return data;
}

// ─── Main: Send Purchase Event ────────────────────────────────────────────────

export async function sendPurchaseEvent(eventData: PurchaseEventData): Promise<{
  success: boolean;
  events_received?: number;
  error?: string;
}> {
  const eventTime = Math.floor(Date.now() / 1000); // Unix timestamp

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        action_source: "website",
        event_id: `purchase_${eventData.orderId}`, // deduplication key
        event_source_url: eventData.eventSourceUrl ?? "https://yourstore.cm/orders",
        user_data: buildUserData(eventData.userData),
        custom_data: {
          currency: eventData.currency ?? "XAF",
          value: eventData.value,
          order_id: eventData.orderId,
          // COD-specific: tells Facebook this is a confirmed delivered order
          content_type: "product",
          delivery_category: "home_delivery",
        },
      },
    ],
    // Only include test_event_code when testing
    ...(eventData.testEventCode
      ? { test_event_code: eventData.testEventCode }
      : {}),
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(CAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[Facebook CAPI] Error:", result);
      return { success: false, error: result?.error?.message ?? "Unknown error" };
    }

    console.log(
      `[Facebook CAPI] Purchase event sent for order ${eventData.orderId}. Events received: ${result.events_received}`
    );

    return { success: true, events_received: result.events_received };
  } catch (err) {
    console.error("[Facebook CAPI] Network error:", err);
    return { success: false, error: String(err) };
  }
}