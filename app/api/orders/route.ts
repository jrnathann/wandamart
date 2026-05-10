import { NextResponse } from "next/server";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { sendEmail } from "@/helper/sendEmail";
import { Product } from "@/models/Product";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendLeadEvent } from "@/lib/metaCapi";

type LeanProduct = {
    _id: Types.ObjectId;
    name: string;
    category?: string;
};
export async function POST(req: Request) {
    await connectDB();

    try {
        const body = await req.json();
        const { items, customer, id, checkpoints, _fbp, _fbc, _ua } = body; // expect checkpoints from frontend

        if (!items || !customer || !id) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }
        // ✅ Get customer's real IP from request headers
        const _ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            req.headers.get("x-real-ip") ??
            undefined;

        const total = items.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
        );

        // If frontend did not send checkpoints, create default at Shopici warehouse
        const initialCheckpoints = checkpoints && checkpoints.length > 0
            ? checkpoints
            : [
                {
                    location: "Shopici Warehouse",
                    time: new Date().toISOString(),
                    status: "En préparation",
                },
            ];

        const newOrder = new Order({
            id,
            items,
            total,
            customer,
            checkpoints: initialCheckpoints,
            _fbp,
            _fbc,
            _ua,
            _ip,
        });

        await newOrder.save();
        // ✅ Send email notification to admin
        // ✅ Fetch product names
        const productIds = items.map((i: any) => i.productId);
        const products = await Product.find({ _id: { $in: productIds } }).lean<LeanProduct[]>();

        const itemsHtml = items
            .map((item: any) => {
                const product = products.find(p => p._id.toString() === item.productId);
                const name = product?.name || "Produit inconnu";
                return `<li>${item.quantity} × ${name} - ${(item.price * item.quantity).toLocaleString()} XAF</li>`;
            })
            .join("");

        const html = `
            <h2>Nouvelle commande reçue !</h2>
            <p>Une nouvelle commande vient d'être passée par ${customer.name} (${customer.phone})</p>
            <p>Détails de la commande :</p>
            <ul>${itemsHtml}</ul>
            <p><strong>Total:</strong> ${total.toLocaleString()} XAF</p>
            <p>Numéro de commande: <strong>${id}</strong></p>
            <p>Statut actuel: ${initialCheckpoints[0].status}</p>
            <p>– Shopici</p>
            `;

        // Fire email + CAPI in parallel — neither blocks the 201 response
        const firstProduct = products[0];
 
        await Promise.allSettled([
            sendEmail({
                to: process.env.ADMIN_EMAIL!,
                subject: `Nouvelle commande reçue (${id})`,
                html,
            }),
 
            // ✅ Server-side Lead — deduplicates with the browser fbq("Lead") call
            // Meta matches them by order_id and drops the duplicate automatically.
            sendLeadEvent({
                orderId: id,
                productName: firstProduct?.name ?? "Produit Shopici",
                productCategory: (firstProduct as any)?.category,
                value: total,
                currency: "XAF",
                name: customer.name,
                phone: customer.phone,
                ip: _ip,
                ua: _ua,
                fbp: _fbp,
                fbc: _fbc,
                // Reconstruct the product page URL so Meta knows the event source
                eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/products`
                    : undefined,
            }),
        ]);
        return NextResponse.json(newOrder, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Impossible de créer la commande" },
            { status: 500 }
        );
    }
}



// GET all orders
export async function GET(req: Request) {
    await connectDB();

    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) return adminCheck;

    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // latest first
        return NextResponse.json(orders);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Impossible de récupérer les commandes" }, { status: 500 });
    }
}