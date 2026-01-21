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
    callTime: { type: String, enum: ["morning", "afternoon", "evening"], required: true },
});

const TrackingCheckpointSchema = new Schema({
    location: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["En préparation", "En route", "Livré"], required: true },
});

const OrderSchema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        items: { type: [OrderItemSchema], required: true },
        total: { type: Number, required: true },
        customer: { type: CustomerInfoSchema, required: true },
        status: {
            type: String,
            enum: ["En préparation", "En route", "Livré"],
            default: "En préparation",
        },
        estimatedDelivery: { type: String },
        checkpoints: { type: [TrackingCheckpointSchema], default: [] },
    },
    { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);
