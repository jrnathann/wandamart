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

            // ✅ Send Facebook Purchase event on confirmed delivery
            // Fire-and-forget: don't let Facebook failure block the order update
            sendPurchaseEvent({
                orderId: order.id,
                value: order.total,       // adjust to match your Order model field name
                currency: "XAF",
                userData: {
                    firstName: order.customer.name.split(" ")[0],
                    lastName: order.customer.name.split(" ").slice(1).join(" ") || undefined,
                    phone: order.customer.phone,         // ✅ from CustomerInfoSchema
                    city: order.customer.deliveryZone.split(",").pop()?.trim(),   // ✅ closest field to city
                    country: "CM",
                    // ✅ Customer's browser data saved when they placed the order
                    fbp: order._fbp,
                    fbc: order._fbc,
                    ipAddress: order._ip,
                    userAgent: order._ua,
                },
                // ⚠️ Uncomment to test in Meta Events Manager → Test Events tab
                // testEventCode: "TEST60335",
            }).then((result) => {
                if (result.success) {
                    console.log(`[Facebook CAPI] ✅ Purchase event sent for order ${order.id}`);
                } else {
                    console.error(`[Facebook CAPI] ❌ Failed for order ${order.id}:`, result.error);
                }
            });
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