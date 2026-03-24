// lib/facebook-capi.ts
// Facebook Conversions API service
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api

import crypto from "crypto";
import { getStoreConfig } from "./server-config";
import type { StoreConfigType } from "@/types/StoreConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CAPIUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;     // ISO 2-letter, e.g. "CM"
  ipAddress?: string;
  userAgent?: string;
  fbc?: string;         // _fbc cookie
  fbp?: string;         // _fbp cookie
}

export interface PurchaseEventData {
  orderId: string;
  value: number;
  currency?: string;    // default "XAF"
  userData: CAPIUserData;
  eventSourceUrl?: string;
  testEventCode?: string;
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

function hash(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function hashPhone(phone: string): string {
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

  // Not hashed
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
  const storeConfig: StoreConfigType = await getStoreConfig();
  const PIXEL_ID = storeConfig.tracking.facebookPixelId;
  const ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN;

  // Guard: bail early with a clear error if credentials are missing
  if (!PIXEL_ID) {
    console.error("[Facebook CAPI] Missing facebookPixelId in store config.");
    return { success: false, error: "Missing Facebook Pixel ID" };
  }
  if (!ACCESS_TOKEN) {
    console.error("[Facebook CAPI] Missing FACEBOOK_CAPI_TOKEN env variable.");
    return { success: false, error: "Missing CAPI access token" };
  }

  const API_VERSION = "v19.0";
  const CAPI_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        action_source: "website",
        event_id: `purchase_${eventData.orderId}`,
        event_source_url: eventData.eventSourceUrl ?? "https://yourstore.cm/orders",
        user_data: buildUserData(eventData.userData),
        custom_data: {
          currency: eventData.currency ?? "XAF",
          value: eventData.value,
          order_id: eventData.orderId,
          content_type: "product",
          delivery_category: "home_delivery",
        },
      },
    ],
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