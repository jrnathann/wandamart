import mongoose, { Schema, model, models } from "mongoose";
import { OrderStatus } from "@/types/OrderTracking";

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const CustomerInfoSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    hasWhatsApp: { type: Boolean, required: true },
    deliveryZone: { type: String, required: true },
    callTime: { type: String, enum: ["now","morning", "afternoon", "evening"], required: true },
});

const TrackingCheckpointSchema = new Schema({
    location: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["En préparation", "En route", "Livré", "Annulé"], required: true },
});

const OrderSchema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        items: { type: [OrderItemSchema], required: true },
        total: { type: Number, required: true },
        customer: { type: CustomerInfoSchema, required: true },
        status: {
            type: String,
            enum: ["En préparation", "En route", "Livré", "Annulé"],
            default: "En préparation",
        },
        estimatedDelivery: { type: String },
        checkpoints: { type: [TrackingCheckpointSchema], default: [] },

        // ✅ null = not reviewed | true = serious | false = unserious (dead)
        isSeriousCustomer: { type: Boolean, default: null },
        // ── Payment ───────────────────────────────────────────────────────────
        // Which payment method the customer chose at checkout
        paymentMethod: {
            type:    String,
            enum:    ["cash_on_delivery", "online"],
            default: "cash_on_delivery",
        },
        // true once Fapshi webhook confirms successful payment
        paid:          { type: Boolean,  default: false },
        // Fapshi transId from initiatePay — used to match the webhook
        fapshiTransId: { type: String,   default: null  },
        // Timestamp of confirmed payment
        paidAt:        { type: Date,     default: null  },
        // ✅ Facebook CAPI: saved at order creation time from the customer's browser
        _fbp: { type: String },   // Meta browser ID cookie
        _fbc: { type: String },   // Meta click ID cookie (present if they came from an ad)
        _ip: { type: String },    // Customer's IP at order time
        _ua: { type: String },    // Customer's User-Agent at order time
    },
    { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);