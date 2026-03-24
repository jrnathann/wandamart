/**
 * app/api/payment/webhook/route.ts
 *
 * POST /api/payment/webhook
 * ──────────────────────────
 * Fapshi calls this URL after every payment event.
 *
 * Status handling:
 *   CREATED     — session opened, no action needed
 *   PENDING     — customer confirming on phone, notify admin
 *   SUCCESSFUL  — verify with Fapshi, mark paid, notify admin + FB CAPI
 *   FAILED      — flag order (isSeriousCustomer: false), notify admin
 *   EXPIRED     — flag order (isSeriousCustomer: false), notify admin
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { paymentStatus, isFapshiError } from "@/lib/fapshi";
import { sendPurchaseEvent } from "@/lib/facebook-capi";
import { sendEmail } from "@/helper/sendEmail";
import { sendWhatsAppMessage } from "@/lib/sendWhatsAppMessage";

interface FapshiWebhookBody {
    transId: string;
    status: "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
    amount: number;
    externalId?: string;
    medium?: string;
    name?: string;
}

function formatDate(date: Date) {
    return date.toLocaleString("fr-CM", { timeZone: "Africa/Douala" });
}

function orderRows(order: any, body: FapshiWebhookBody) {
    return `
        <tr><td><strong>Order ID</strong></td><td>${order.id}</td></tr>
        <tr><td><strong>Transaction ID</strong></td><td>${body.transId}</td></tr>
        <tr><td><strong>Customer</strong></td><td>${order.customer?.name ?? "N/A"}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${order.customer?.phone ?? "N/A"}</td></tr>
        <tr><td><strong>Amount</strong></td><td>${order.total} XAF</td></tr>
        <tr><td><strong>Time</strong></td><td>${formatDate(new Date())}</td></tr>
        <tr><td><strong>Medium</strong></td><td>${body.medium ?? "N/A"}</td></tr>
    `;
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

    console.log(`Webhook received — status: "${body.status}" | transId: ${body.transId}`);

    try {
        await connectDB();

        // ── 2. Find the order ─────────────────────────────────────────────────
        const order = await Order.findOne({ fapshiTransId: body.transId });

        if (!order) {
            console.warn(`Webhook: no order found for transId ${body.transId}`);
            return NextResponse.json({ received: true });
        }

        // ── 3. Route by status ────────────────────────────────────────────────
        switch (body.status) {

            // ── CREATED ───────────────────────────────────────────────────────
            // Payment session just opened. Customer hasn't interacted yet.
            // Nothing to update on the order — isSeriousCustomer stays null.
            case "CREATED": {
                console.log(`Webhook: order ${order.id} — payment session opened`);
                return NextResponse.json({ received: true });
            }

            // ── PENDING ───────────────────────────────────────────────────────
            // Customer entered their number and is confirming their PIN.
            // Don't touch isSeriousCustomer yet — they're still in the flow.
            case "PENDING": {
                console.log(`Webhook: order ${order.id} — payment pending customer confirmation`);

                try {
                    await sendEmail({
                        to: process.env.ADMIN_EMAIL!,
                        subject: `⏳ Payment Pending — Order ${order.id}`,
                        html: `
                            <h2>Payment In Progress</h2>
                            <p>A customer has initiated payment and is confirming on their phone.</p>
                            <table cellpadding="8" style="border-collapse:collapse;">
                                ${orderRows(order, body)}
                            </table>
                            <p>No action needed yet — waiting for the customer to confirm.</p>
                        `,
                    });
                } catch (e) {
                    console.error("Admin PENDING email failed (non-blocking):", e);
                }

                return NextResponse.json({ received: true });
            }

            // ── SUCCESSFUL ────────────────────────────────────────────────────
            // Payment confirmed by Fapshi. Re-verify independently, then mark paid.
            case "SUCCESSFUL": {

                // Idempotency — safe to receive the same webhook twice
                if (order.paid) {
                    console.log(`Webhook: order ${order.id} already marked paid — skipping`);
                    return NextResponse.json({ received: true });
                }

                // Re-verify with Fapshi API — never trust the webhook body alone
                const verified = await paymentStatus(body.transId);

                if (isFapshiError(verified)) {
                    console.error(`Webhook: Fapshi re-verification failed for ${body.transId}:`, verified);
                    return NextResponse.json({ received: true, warning: "verification_failed" });
                }

                if (verified.status !== "SUCCESSFUL") {
                    console.warn(`Webhook: re-check returned "${verified.status}" — ignoring`);
                    return NextResponse.json({ received: true });
                }

                // Amount cross-check — guard against tampered webhooks
                if (verified.amount !== order.total) {
                    console.error(
                        `Webhook: amount mismatch on order ${order.id} — ` +
                        `Fapshi: ${verified.amount} XAF | Order: ${order.total} XAF`
                    );
                    await Order.updateOne(
                        { id: order.id },
                        { isSeriousCustomer: false }
                    );
                    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
                }

                // Mark paid — the only fields your schema actually has
                await Order.updateOne(
                    { id: order.id },
                    {
                        paid: true,
                        paidAt: new Date(),
                        isSeriousCustomer: true,
                    }
                );

                console.log(`✅ Order ${order.id} paid — transId: ${body.transId}`);

                // Notify admin
                try {
                    await sendEmail({
                        to: process.env.ADMIN_EMAIL!,
                        subject: `✅ Payment Confirmed — Order ${order.id}`,
                        html: `
                            <h2>Payment Received</h2>
                            <p>A customer has successfully completed their payment.</p>
                            <table cellpadding="8" style="border-collapse:collapse;">
                                ${orderRows(order, body)}
                            </table>
                            <p>Please process and ship this order as soon as possible.</p>
                        `,
                    });
                } catch (e) {
                    console.error("Admin SUCCESSFUL email failed (non-blocking):", e);
                }
                // try {
                //     await sendWhatsAppMessage(
                //         order.customer.phone,
                //         order.customer.name ?? "Customer",
                //         order.id
                //     );

                //     console.log(`📲 WhatsApp sent to ${order.customer.phone}`);
                // } catch (err) {
                //     console.error("WhatsApp send failed (non-blocking):", err);
                // }
                // FB CAPI Purchase event
                try {
                    const nameParts = (order.customer.name ?? "").trim().split(/\s+/);
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(" ") || undefined;

                    await sendPurchaseEvent({
                        orderId: order.id,
                        value: order.total,
                        currency: "XAF",
                        userData: {
                            phone: order.customer.phone,
                            firstName,
                            lastName,
                            ipAddress: order._ip ?? undefined,
                            userAgent: order._ua ?? undefined,
                            fbc: order._fbc ?? undefined,
                            fbp: order._fbp ?? undefined,
                        },
                    });
                } catch (capiErr) {
                    console.error("FB CAPI Purchase failed (non-blocking):", capiErr);
                }

                return NextResponse.json({ received: true });
            }

            // ── FAILED ────────────────────────────────────────────────────────
            // Wrong PIN, insufficient funds, customer cancelled, etc.
            // Mark isSeriousCustomer: false — they didn't complete payment.
            case "FAILED": {
                await Order.updateOne(
                    { id: order.id },
                    { isSeriousCustomer: false }
                );

                console.log(`Webhook: order ${order.id} — payment failed`);

                try {
                    await sendEmail({
                        to: process.env.ADMIN_EMAIL!,
                        subject: `❌ Payment Failed — Order ${order.id}`,
                        html: `
                            <h2>Payment Failed</h2>
                            <p>The customer's payment attempt was unsuccessful.</p>
                            <table cellpadding="8" style="border-collapse:collapse;">
                                ${orderRows(order, body)}
                            </table>
                            <p>You may want to follow up with the customer to retry payment.</p>
                        `,
                    });
                } catch (e) {
                    console.error("Admin FAILED email failed (non-blocking):", e);
                }

                return NextResponse.json({ received: true });
            }

            // ── EXPIRED ───────────────────────────────────────────────────────
            // Payment link/session timed out before customer completed payment.
            // Mark isSeriousCustomer: false — they didn't follow through.
            case "EXPIRED": {
                await Order.updateOne(
                    { id: order.id },
                    { isSeriousCustomer: false }
                );

                console.log(`Webhook: order ${order.id} — payment session expired`);

                try {
                    await sendEmail({
                        to: process.env.ADMIN_EMAIL!,
                        subject: `⌛ Payment Expired — Order ${order.id}`,
                        html: `
                            <h2>Payment Session Expired</h2>
                            <p>The customer did not complete payment before the session timed out.</p>
                            <table cellpadding="8" style="border-collapse:collapse;">
                                ${orderRows(order, body)}
                            </table>
                            <p>Consider sending a reminder or generating a new payment link.</p>
                        `,
                    });
                } catch (e) {
                    console.error("Admin EXPIRED email failed (non-blocking):", e);
                }

                return NextResponse.json({ received: true });
            }

            // ── Unknown fallback ──────────────────────────────────────────────
            default: {
                console.warn(`Webhook: unknown status "${(body as any).status}" for transId ${body.transId}`);
                return NextResponse.json({ received: true });
            }
        }

    } catch (err: any) {
        console.error("Webhook unexpected error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}