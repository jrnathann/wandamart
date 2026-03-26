import { NextResponse } from "next/server";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import type { OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";
import { Product } from "@/models/Product"; // Import your Product model
import { requireAdmin } from "@/lib/requireAdmin";
import { sendPurchaseEvent } from "@/lib/facebook-capi";

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
        // Type the request body
        const body: PatchOrderBody = await req.json();
        const { status, newCheckpoint, isSeriousCustomer, fbc, fbp } = body;

        const order = await Order.findOne({ id });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const previousStatus = order.status;

        if (status) {
            order.status = status;
        }

        if (newCheckpoint) {
            order.checkpoints.push(newCheckpoint);
            order.checkpoints.sort((a: TrackingCheckpoint, b: TrackingCheckpoint) =>
                new Date(b.time).getTime() - new Date(a.time).getTime()
            );
        }
        if (isSeriousCustomer !== undefined) {
            order.isSeriousCustomer = isSeriousCustomer;
        }
        // ✅ Deduct stock if status changed to "Livré" and was not "Livré" before
        if (status === "Livré" && previousStatus !== "Livré") {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock = Math.max((product.stock || 0) - item.quantity, 0);
                    await product.save();
                }
            }
            // ✅ Save original state
            const wasPaid = order.paid;

            // Send FB CAPI Purchase — but only if NOT already paid online.
            // Online orders fire the Purchase event in the Fapshi webhook the
            // moment payment is confirmed, so we must not fire it a second time.
            if (!wasPaid) {
                sendPurchaseEvent({
                    orderId: order.id,
                    value: order.total,
                    currency: "XAF",
                    userData: {
                        firstName: order.customer.name.split(" ")[0],
                        lastName: order.customer.name.split(" ").slice(1).join(" ") || undefined,
                        phone: order.customer.phone,
                        city: order.customer.deliveryZone.split(",").pop()?.trim(),
                        country: "CM",
                        fbp: order._fbp,
                        fbc: order._fbc,
                        ipAddress: order._ip,
                        userAgent: order._ua,
                    },
                    // testEventCode: "TEST57609",
                }).then((result) => {
                    if (result.success) {
                        console.log(`[Facebook CAPI] ✅ Purchase event sent for order ${order.id}`);
                    } else {
                        console.error(`[Facebook CAPI] ❌ Failed for order ${order.id}:`, result.error);
                    }
                });
            } else {
                console.log(
                    `[Facebook CAPI] Skipped for order ${order.id} — already fired on payment`
                );
            }
            // ✅ THEN mark as paid
            if (!wasPaid) {
                order.paid = true;
                order.paidAt = new Date();
            }
        }

        await order.save();

        return NextResponse.json(order, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Impossible to update order" },
            { status: 500 }
        );
    }
}
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // note: params is a Promise
) {
    await connectDB();

    const { id } = await params; // <-- unwrap the promise here

    try {
        const order = await Order.findOne({ id });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Optional: sort checkpoints by time descending (latest first)
        order.checkpoints.sort((a: TrackingCheckpoint, b: TrackingCheckpoint) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        return NextResponse.json(order, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Impossible to fetch order" },
            { status: 500 }
        );
    }
}