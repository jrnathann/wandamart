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

export type OrderStatus = "En préparation" | "En route" | "Livré" | "Annulé"; // ✅ added Annulé

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
  isSeriousCustomer: boolean | null; // ✅ null = not reviewed | true = serious | false = unserious
  createdAt: string;
  updatedAt: string;
}