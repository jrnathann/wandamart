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
  callTime: "now" | "morning" | "afternoon" | "evening";
}

export type OrderStatus = "En préparation" | "En route" | "Livré" | "Annulé";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderTracking {
  id: string;
  items: OrderItem[];
  total: number;
  customer: CustomerInfo;
  status: OrderStatus;
  estimatedDelivery?: string;
  checkpoints: TrackingCheckpoint[];
  isSeriousCustomer: boolean | null;
  createdAt: string;
  updatedAt: string;

  // ── Payment (online flow only) ──────────────────────────────────────────────
  paymentMethod?: "cash_on_delivery" | "online";
  paid?:          boolean;      // true once Fapshi webhook confirms
  paidAt?:        string | null; // ISO timestamp of confirmed payment
  fapshiTransId?: string | null;
}