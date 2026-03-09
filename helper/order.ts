import { CustomerInfo, OrderItem, OrderStatus, OrderTracking, TrackingCheckpoint } from "@/types/OrderTracking";
import { authFetch } from "@/lib/authFetch";
function generateOrderId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  return `ORD-${y}${m}${d}-${random}`;
}

export async function addOrder(
  items: { product: any; quantity: number }[],
  customer: CustomerInfo,
  facebookTracking?: { _fbp?: string; _fbc?: string; _ua?: string }
): Promise<OrderTracking> {
  // Convert products to OrderItem
  const orderItems: OrderItem[] = items.map(({ product, quantity }) => ({
    productId: product._id,
    quantity,
    price: product.price,
  }));

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const id = generateOrderId();

  // Create initial checkpoint at Shopici warehouse
  const initialCheckpoint: TrackingCheckpoint = {
    location: "Shopici Warehouse",
    time: new Date().toISOString(),
    status: "En préparation",
  };

  // Send to API
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      items: orderItems,
      customer,
      total,
      checkpoints: [initialCheckpoint],
      ...facebookTracking,
    }),
  });

  if (!res.ok) throw new Error("Erreur lors de la création de la commande");

  return res.json(); // Expect API to return OrderTracking including custom orderId and checkpoints
}

export async function fetchOrders(): Promise<OrderTracking[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Erreur lors de la récupération des commandes");
  return res.json();
}
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2];
}
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderTracking> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      fbc: getCookie("_fbc"), // Facebook click ID (set when user clicks your ad)
      fbp: getCookie("_fbp"), // Facebook browser ID (set by Meta Pixel)
    }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function addOrderCheckpoint(orderId: string, checkpoint: TrackingCheckpoint): Promise<OrderTracking> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newCheckpoint: checkpoint }),
  });
  if (!res.ok) throw new Error("Failed to add checkpoint");
  return res.json();
}

export async function getOrderById(orderId: string): Promise<OrderTracking> {
  const res = await fetch(`/api/orders/${orderId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Commande ${orderId} introuvable`);
    }
    throw new Error("Erreur lors de la récupération de la commande");
  }

  return res.json();
}