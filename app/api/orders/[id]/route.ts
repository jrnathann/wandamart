import { NextResponse } from "next/server";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import type { OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendPurchaseEvent } from "@/lib/metaCapi"; // ← updated import

interface PatchOrderBody {
    status?: OrderStatus;
    newCheckpoint?: TrackingCheckpoint;
    isSeriousCustomer?: boolean | null;
    fbc?: string;
    fbp?: string;
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { id } = await params;

    try {
        const body: PatchOrderBody = await req.json();
        const { status, newCheckpoint, isSeriousCustomer } = body;

        const order = await Order.findOne({ id });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const previousStatus = order.status;

        if (status) order.status = status;

        if (newCheckpoint) {
            order.checkpoints.push(newCheckpoint);
            order.checkpoints.sort((a: TrackingCheckpoint, b: TrackingCheckpoint) =>
                new Date(b.time).getTime() - new Date(a.time).getTime()
            );
        }

        if (isSeriousCustomer !== undefined) {
            order.isSeriousCustomer = isSeriousCustomer;
        }

        // ── Deduct stock + fire Purchase when status → "Livré" ───────────────
        if (status === "Livré" && previousStatus !== "Livré") {

            // 1. Deduct stock
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock = Math.max((product.stock || 0) - item.quantity, 0);
                    await product.save();
                }
            }

            const wasPaid = order.paid;

            // 2. Fire server-side Purchase only for COD orders (online orders
            //    already fired Purchase in /api/payment/create-order).
            if (!wasPaid) {
                const nameParts = order.customer.name.trim().split(/\s+/);
                const firstName = nameParts[0] ?? "";
                const lastName  = nameParts.slice(1).join(" ");

                // Fire and forget — don't block the admin response
                sendPurchaseEvent({
                    orderId:      order.id,
                    productName:  "Produit Shopici", // no product name stored on order
                    productIds:   order.items.map((i: any) => String(i.productId)),
                    value:        order.total,
                    currency:     "XAF",
                    numItems:     order.items.reduce((s: number, i: any) => s + i.quantity, 0),
                    name:         `${firstName} ${lastName}`.trim(),
                    phone:        order.customer.phone,
                    ip:           order._ip,
                    ua:           order._ua,
                    fbp:          order._fbp,
                    fbc:          order._fbc,
                    eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL
                        ? `${process.env.NEXT_PUBLIC_APP_URL}/products`
                        : undefined,
                }).then(() => {
                    console.log(`✅ Meta CAPI Purchase sent for COD order ${order.id}`);
                }).catch((err: any) => {
                    console.error(`❌ Meta CAPI Purchase failed for order ${order.id}:`, err);
                });

                // Mark as paid after firing event
                order.paid  = true;
                order.paidAt = new Date();
            } else {
                console.log(`[Meta CAPI] Skipped Purchase for ${order.id} — already fired on online payment`);
            }
        }

        await order.save();
        return NextResponse.json(order, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Impossible to update order" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const { id } = await params;

    try {
        const order = await Order.findOne({ id });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        order.checkpoints.sort((a: TrackingCheckpoint, b: TrackingCheckpoint) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        return NextResponse.json(order, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Impossible to fetch order" }, { status: 500 });
    }
}