import { NextResponse } from "next/server";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import type { OrderStatus, TrackingCheckpoint } from "@/types/OrderTracking";
import { Product } from "@/models/Product"; // Import your Product model
import { requireAdmin } from "@/lib/requireAdmin";

interface PatchOrderBody {
    status?: OrderStatus;
    newCheckpoint?: TrackingCheckpoint;
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
        const { status, newCheckpoint } = body;

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
        // ✅ Deduct stock if status changed to "Livré" and was not "Livré" before
        if (status === "Livré" && previousStatus !== "Livré") {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock = Math.max((product.stock || 0) - item.quantity, 0);
                    await product.save();
                }
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