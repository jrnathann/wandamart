// src/types/OrderTracking.ts

export interface TrackingCheckpoint {
  location: string;
  time: string;
  status: OrderStatus;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  hasWhatsApp: boolean;
  deliveryZone: string;
  callTime: "morning" | "afternoon" | "evening";
}

export type OrderStatus = "En préparation" | "En route" | "Livré";

// NEW: Order item interface
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of order
}

export interface OrderTracking {
  id: string;
  items: OrderItem[]; // CHANGED: Now an array of items
  total: number;
  customer: CustomerInfo;
  status: OrderStatus;
  estimatedDelivery?: string;
  checkpoints: TrackingCheckpoint[];
  createdAt: string;
  updatedAt: string;
}