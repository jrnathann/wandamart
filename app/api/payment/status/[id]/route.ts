// app/api/payment/status/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { paymentStatus, isFapshiError } from "@/lib/fapshi";

export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ← Promise in Next.js 15
) {
    const { id } = await params;  // ← must await

    await connectDB();

    const order = await Order.findOne({ id });  // your schema uses custom `id: String`
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (order.paid) {
        return NextResponse.json({ paid: true, fapshiStatus: "SUCCESSFUL" });
    }

    if (!order.fapshiTransId) {
        return NextResponse.json({ paid: false, fapshiStatus: null });
    }

    const result = await paymentStatus(order.fapshiTransId);

    if (isFapshiError(result)) {
        return NextResponse.json({ paid: false, fapshiStatus: null });
    }

    return NextResponse.json({
        paid:         order.paid,
        fapshiStatus: result.status,
    });
}