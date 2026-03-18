/**
 * lib/fapshi.ts
 *
 * Minimal typed wrapper around the Fapshi API.
 * Uses native fetch — no axios, safe in Next.js App Router edge/node runtime.
 * All methods resolve (never throw); check isFapshiError() on the result.
 */

const BASE_URL = process.env.FAPSHI_BASE_URL ?? "https://sandbox.fapshi.com";

function getHeaders(): HeadersInit {
    const apiuser = process.env.FAPSHI_API_USER;
    const apikey  = process.env.FAPSHI_API_KEY;
    if (!apiuser || !apikey) {
        throw new Error("Fapshi credentials missing — set FAPSHI_API_USER and FAPSHI_API_KEY");
    }
    return { apiuser, apikey, "Content-Type": "application/json" };
}

// ── Response types ────────────────────────────────────────────────────────────

export interface FapshiError {
    message:    string;
    statusCode: number;
}

export interface InitiatePayResponse {
    message:    string;
    link:       string;      // redirect the customer here
    transId:    string;      // save on the order — used to match the webhook
    statusCode: number;
}

export interface PaymentStatusResponse {
    transId:       string;
    status:        "created" | "successful" | "failed" | "expired";
    amount:        number;
    medium?:       string;
    externalId?:   string;
    dateInitiated: string;
    statusCode:    number;
}

// ── Internal fetch helpers ────────────────────────────────────────────────────

function makeError(message: string, statusCode: number): FapshiError {
    return { message, statusCode };
}

async function fapshiPost<T>(path: string, body: object): Promise<T | FapshiError> {
    try {
        const res  = await fetch(`${BASE_URL}${path}`, {
            method:  "POST",
            headers: getHeaders(),
            body:    JSON.stringify(body),
        });
        const data = await res.json();
        return { ...data, statusCode: res.status };
    } catch (e: any) {
        return makeError(e?.message ?? "Network error", 500);
    }
}

async function fapshiGet<T>(path: string): Promise<T | FapshiError> {
    try {
        const res  = await fetch(`${BASE_URL}${path}`, {
            method:  "GET",
            headers: getHeaders(),
        });
        const data = await res.json();
        return { ...data, statusCode: res.status };
    } catch (e: any) {
        return makeError(e?.message ?? "Network error", 500);
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a Fapshi hosted payment page.
 * Redirect the customer to the returned `link`.
 * Persist the returned `transId` on the order for webhook matching.
 */
export async function initiatePay(data: {
    amount:       number;
    externalId?:  string;   // your orderId — comes back in the webhook
    redirectUrl?: string;   // where Fapshi sends the user after payment
    message?:     string;
    email?:       string;
    userId?:      string;
}): Promise<InitiatePayResponse | FapshiError> {
    if (!data.amount)                   return makeError("amount required", 400);
    if (!Number.isInteger(data.amount)) return makeError("amount must be an integer", 400);
    if (data.amount < 100)              return makeError("amount cannot be less than 100 XAF", 400);

    return fapshiPost<InitiatePayResponse>("/initiate-pay", data);
}

/**
 * Fetches the live status of a transaction.
 * Always call this inside the webhook to verify the payment before trusting it.
 */
export async function paymentStatus(
    transId: string
): Promise<PaymentStatusResponse | FapshiError> {
    if (!transId) return makeError("transId required", 400);
    return fapshiGet<PaymentStatusResponse>(`/payment-status/${transId}`);
}

// ── Type guard ────────────────────────────────────────────────────────────────

export function isFapshiError(res: any): res is FapshiError {
    return res?.statusCode >= 400;
}