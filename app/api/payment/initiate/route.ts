/**
 * app/api/payment/create-order/route.ts
 *
 * POST /api/payment/create-order
 * ────────────────────────────────
 * Online payment flow ONLY. Has nothing to do with cash on delivery.
 *
 * What it does:
 *   1. Receives items + customer + FB cookies (same shape as the COD route)
 *   2. Saves the order with paymentMethod: "online", paid: false
 *   3. Sends admin notification email (same as COD route)
 *   4. Calls Fapshi initiatePay to generate a hosted payment link
 *   5. Saves fapshiTransId on the order
 *   6. Returns { orderId, paymentUrl } → frontend redirects to paymentUrl
 *
 * The order starts as status: "En préparation" + paid: false.
 * The webhook (POST /api/payment/webhook) flips paid → true once Fapshi confirms.
 */

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { sendEmail } from "@/helper/sendEmail";
import { initiatePay, isFapshiError } from "@/lib/fapshi";
import { Types } from "mongoose";

type LeanProduct = { _id: Types.ObjectId; name: string };

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { items, customer, _fbp, _fbc, _ua } = body;

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

        // ── 4. Build initial checkpoint ───────────────────────────────────────
        const checkpoints = [
            {
                location: "Shopici Warehouse",
                time:     new Date().toISOString(),
                status:   "En préparation",
            },
        ];

        // ── 5. Save order — paid: false until webhook confirms ────────────────
        const orderId = nanoid(10);

        const newOrder = new Order({
            id:            orderId,
            items,
            total,
            customer,
            checkpoints,
            paymentMethod: "online",
            paid:          false,
            _fbp,
            _fbc,
            _ua,
            _ip,
        });

        await newOrder.save();

        // ── 6. Admin email (same as COD route) ────────────────────────────────
        try {
            const productIds = items.map((i: any) => i.productId);
            const products   = await Product.find({ _id: { $in: productIds } }).lean<LeanProduct[]>();

            const itemsHtml = items
                .map((item: any) => {
                    const product = products.find(p => p._id.toString() === item.productId);
                    const name    = product?.name ?? "Produit inconnu";
                    return `<li>${item.quantity} × ${name} — ${(item.price * item.quantity).toLocaleString()} XAF</li>`;
                })
                .join("");

            await sendEmail({
                to:      process.env.ADMIN_EMAIL!,
                subject: `Nouvelle commande en ligne (${orderId})`,
                html: `
                    <h2>Nouvelle commande en ligne reçue !</h2>
                    <p><strong>${customer.name}</strong> (${customer.phone}) vient de passer une commande.</p>
                    <p>⏳ <strong>En attente de paiement mobile money</strong></p>
                    <ul>${itemsHtml}</ul>
                    <p><strong>Total :</strong> ${total.toLocaleString()} XAF</p>
                    <p>Numéro de commande : <strong>${orderId}</strong></p>
                    <p>– Shopici</p>
                `,
            });
        } catch (emailErr) {
            // Email failure must never block the order or payment
            console.error("Admin email failed (non-blocking):", emailErr);
        }

        // ── 7. Create Fapshi payment link ─────────────────────────────────────
        const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const fapshiRes = await initiatePay({
            amount:      total,
            externalId:  orderId,
            redirectUrl: `${appUrl}/order/${orderId}?payment=success`,
            message:     `Commande Shopici #${orderId}`,
            userId:      customer.phone,
        });

        if (isFapshiError(fapshiRes)) {
            // Order is saved but payment link failed.
            // Return the orderId so the frontend can offer a retry.
            console.error(`Fapshi initiatePay failed for order ${orderId}:`, fapshiRes);
            return NextResponse.json(
                { error: "payment_link_failed", orderId, detail: fapshiRes.message },
                { status: 502 }
            );
        }

        // ── 8. Save Fapshi transId — webhook needs this to find the order ─────
        await Order.updateOne({ id: orderId }, { fapshiTransId: fapshiRes.transId });

        console.log(`💳 Online order ${orderId} created — transId: ${fapshiRes.transId}`);

        // ── 9. Return to frontend ─────────────────────────────────────────────
        return NextResponse.json(
            { orderId, paymentUrl: fapshiRes.link },
            { status: 201 }
        );

    } catch (err: any) {
        console.error("POST /api/payment/create-order error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}