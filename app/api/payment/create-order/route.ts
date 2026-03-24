/**
 * app/api/payment/create-order/route.ts
 *
 * POST /api/payment/create-order
 * ────────────────────────────────
 * Online payment flow using Fapshi directPay (USSD push — no redirect).
 *
 * Retry-safe: if an unpaid order already exists for the same customer phone
 * + items, it reuses it instead of creating a duplicate. A new USSD push is
 * sent each time so the customer can re-approve.
 */

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { sendEmail } from "@/helper/sendEmail";
import { directPay, isFapshiError } from "@/lib/fapshi";
import { Types } from "mongoose";

type LeanProduct = { _id: Types.ObjectId; name: string };

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { items, customer, _fbp, _fbc, _ua, existingOrderId } = body;

        // ── 1. Validate ───────────────────────────────────────────────────────
        if (!items?.length) {
            return NextResponse.json({ error: "items required" }, { status: 400 });
        }
        if (!customer?.name || !customer?.phone || !customer?.deliveryZone) {
            return NextResponse.json({ error: "incomplete customer info" }, { status: 400 });
        }

        // ── 2. Compute total ──────────────────────────────────────────────────
        const total: number = items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
        );

        if (total < 100) {
            return NextResponse.json(
                { error: "Order total must be at least 100 XAF" },
                { status: 400 }
            );
        }

        // ── 3. Capture IP ─────────────────────────────────────────────────────
        const _ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            req.headers.get("x-real-ip") ??
            undefined;

        // ── 4. Reuse or create order ──────────────────────────────────────────
        // On retry the frontend passes back the orderId from the failed attempt.
        // We look it up and confirm it's still unpaid before reusing it.
        // This prevents a new order document from being created on each retry.
        let orderId: string;
        let isNewOrder = false;

        const existingOrder = existingOrderId
            ? await Order.findOne({ id: existingOrderId, paid: false }).lean()
            : null;

        if (existingOrder) {
            // Reuse the existing unpaid order — just re-push the USSD prompt
            orderId = existingOrderId;
            console.log(`♻️  Reusing existing unpaid order ${orderId} for retry`);
        } else {
            // Fresh order
            orderId = nanoid(10);
            isNewOrder = true;

            const newOrder = new Order({
                id: orderId,
                items,
                total,
                customer,
                checkpoints: [{
                    location: "Shopici Warehouse",
                    time:     new Date().toISOString(),
                    status:   "En préparation",
                }],
                paymentMethod: "online",
                paid:          false,
                _fbp,
                _fbc,
                _ua,
                _ip,
            });

            await newOrder.save();
        }

        // ── 5. Admin email — only on first attempt, not retries ───────────────
        if (isNewOrder) {
            try {
                const productIds = items.map((i: any) => i.productId);
                const products   = await Product.find({ _id: { $in: productIds } }).lean<LeanProduct[]>();

                const itemsHtml = items.map((item: any) => {
                    const product = products.find(p => p._id.toString() === item.productId);
                    const name    = product?.name ?? "Produit inconnu";
                    return `<li>${item.quantity} × ${name} — ${(item.price * item.quantity).toLocaleString()} XAF</li>`;
                }).join("");

                await sendEmail({
                    to:      process.env.ADMIN_EMAIL!,
                    subject: `Nouvelle commande en ligne (${orderId})`,
                    html: `
                        <h2>Nouvelle commande en ligne reçue !</h2>
                        <p><strong>${customer.name}</strong> (${customer.phone}) vient de passer une commande.</p>
                        <p>⏳ <strong>En attente de confirmation paiement mobile money</strong></p>
                        <ul>${itemsHtml}</ul>
                        <p><strong>Total :</strong> ${total.toLocaleString()} XAF</p>
                        <p>Numéro de commande : <strong>${orderId}</strong></p>
                        <p>– Shopici</p>
                    `,
                });
            } catch (emailErr) {
                console.error("Admin email failed (non-blocking):", emailErr);
            }
        }

        // ── 6. Push USSD payment request to customer's phone ─────────────────
        const fapshiRes = await directPay({
            amount:      total,
            phone:       customer.phone,
            name:        customer.name,
            externalId:  orderId,
            message:     `Commande Shopici #${orderId}`,
        });

        if (isFapshiError(fapshiRes)) {
            console.error(`Fapshi directPay failed for order ${orderId}:`, fapshiRes);
            return NextResponse.json(
                { error: "payment_push_failed", orderId, detail: fapshiRes.message },
                { status: 502 }
            );
        }

        // ── 7. Save latest transId on the order ───────────────────────────────
        // On retry this overwrites the previous failed transId — intentional.
        await Order.updateOne({ id: orderId }, { fapshiTransId: fapshiRes.transId });

        console.log(`📲 directPay pushed for order ${orderId} — transId: ${fapshiRes.transId}`);

        // ── 8. Return orderId ─────────────────────────────────────────────────
        return NextResponse.json({ orderId }, { status: isNewOrder ? 201 : 200 });

    } catch (err: any) {
        console.error("POST /api/payment/create-order error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}