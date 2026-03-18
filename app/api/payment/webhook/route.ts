/**
 * app/api/payment/webhook/route.ts
 *
 * POST /api/payment/webhook
 * ──────────────────────────
 * Fapshi calls this URL after every payment event.
 * Register this URL in your Fapshi dashboard.
 *
 * Security model — never trust the webhook body alone:
 *   1. Extract transId from body
 *   2. Re-fetch the transaction from Fapshi API to confirm status independently
 *   3. Cross-check that Fapshi's reported amount matches what we saved on the order
 *   4. Only then mark paid: true and fire FB CAPI
 *
 * HTTP response rules:
 *   - Always 200 for skips (unknown transId, already paid, non-successful status)
 *   - Always 200 even on errors — Fapshi sends only ONE webhook, no retries
 *   - Log errors but never return 5xx (it won't help — Fapshi won't retry)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { paymentStatus, isFapshiError } from "@/lib/fapshi";
import { sendPurchaseEvent } from "@/lib/facebook-capi";

interface FapshiWebhookBody {
    transId:     string;
    status:      "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
    amount:      number;
    externalId?: string;
    medium?:     string;
    name?:       string;
}

export async function POST(req: NextRequest) {

    // ── 1. Parse ──────────────────────────────────────────────────────────────
    let body: FapshiWebhookBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body?.transId || !body?.status) {
        return NextResponse.json({ error: "Missing transId or status" }, { status: 400 });
    }

    // ── 2. Skip non-successful events immediately ─────────────────────────────
    if (body.status !== "SUCCESSFUL") {
        console.log(`Webhook: skipping status "${body.status}" for transId ${body.transId}`);
        return NextResponse.json({ received: true });
    }

    try {
        await connectDB();

        // ── 3. Find the order by its saved fapshiTransId ──────────────────────
        const order = await Order.findOne({ fapshiTransId: body.transId });

        if (!order) {
            console.warn(`Webhook: no order found for transId ${body.transId}`);
            return NextResponse.json({ received: true });
        }

        // ── 4. Idempotency — safe to receive the same webhook twice ───────────
        if (order.paid) {
            console.log(`Webhook: order ${order.id} already marked paid — skipping`);
            return NextResponse.json({ received: true });
        }

        // ── 5. Re-verify with Fapshi API ──────────────────────────────────────
        const verified = await paymentStatus(body.transId);

        if (isFapshiError(verified)) {
            console.error(`Webhook: Fapshi verification failed for ${body.transId}:`, verified);
            // Still 200 — Fapshi sends only ONE webhook, returning 5xx won't trigger a retry
            return NextResponse.json({ received: true, warning: "verification_failed" });
        }

        if (verified.status !== "SUCCESSFUL") {
            console.warn(`Webhook: re-check returned "${verified.status}" — ignoring`);
            return NextResponse.json({ received: true });
        }

        // ── 6. Amount cross-check ─────────────────────────────────────────────
        if (verified.amount !== order.total) {
            console.error(
                `Webhook: amount mismatch on order ${order.id} — ` +
                `Fapshi: ${verified.amount} XAF | Order: ${order.total} XAF`
            );
            await Order.updateOne({ id: order.id }, { isSeriousCustomer: false });
            return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
        }

        // ── 7. Mark paid ──────────────────────────────────────────────────────
        await Order.updateOne(
            { id: order.id },
            {
                paid:              true,
                paidAt:            new Date(),
                isSeriousCustomer: true,
            }
        );

        console.log(`✅ Order ${order.id} paid — transId: ${body.transId}`);

        // ── 8. FB CAPI Purchase ───────────────────────────────────────────────
        // Fires immediately on payment confirmation.
        // For online orders we fire here — NOT on "Livré" status change.
        try {
            // Split name into first/last for CAPI
            const nameParts = (order.customer.name ?? "").trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName  = nameParts.slice(1).join(" ") || undefined;

            await sendPurchaseEvent({
                orderId:  order.id,
                value:    order.total,
                currency: "XAF",
                userData: {
                    phone:     order.customer.phone,
                    firstName,
                    lastName,
                    ipAddress: order._ip  ?? undefined,
                    userAgent: order._ua  ?? undefined,
                    fbc:       order._fbc ?? undefined,
                    fbp:       order._fbp ?? undefined,
                },
            });
        } catch (capiErr) {
            // Never block the webhook response on CAPI failure
            console.error("FB CAPI Purchase failed (non-blocking):", capiErr);
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error("Webhook unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}