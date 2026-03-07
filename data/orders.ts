// src/data/orders.ts
import { Product } from "@/types/Product";
import { products } from "@/data/products";
import {
  OrderTracking,
  OrderStatus,
  TrackingCheckpoint,
  OrderItem,
} from "@/types/OrderTracking";

// Helper to generate checkpoints
const generateCheckpoints = (
  deliveryZone: string,
  status: OrderStatus
): TrackingCheckpoint[] => {
  const now = new Date();
  const prepTime = new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString();
  const departTime = new Date(now.getTime() - 1000 * 60 * 60).toISOString();
  const deliveredTime = now.toISOString();

  const checkpoints: TrackingCheckpoint[] = [
    {
      location: "Shopici Warehouse",
      time: prepTime,
      status: "En préparation",
    },
  ];

  if (status === "En route" || status === "Livré") {
    checkpoints.push({
      location: `Hub ${deliveryZone}`,
      time: departTime,
      status: "En route",
    });
  }

  if (status === "Livré") {
    checkpoints.push({
      location: deliveryZone,
      time: deliveredTime,
      status: "Livré",
    });
  }

  return checkpoints;
};

// Mock orders with multiple products
export const orders: OrderTracking[] = [
  {
    id: "order_001",
    items: [
      {
        productId: products[0]._id,
        quantity: 2,
        price: products[0].price,
      },
      {
        productId: products[1]?._id || products[0]._id,
        quantity: 1,
        price: products[1]?.price || products[0].price,
      },
    ],
    total: products[0].price * 2 + (products[1]?.price || products[0].price),
    customer: {
      name: "Saha",
      phone: "465465454",
      hasWhatsApp: true,
      deliveryZone: "Yaoundé",
      callTime: "morning",
    },
    status: "En préparation",
    isSeriousCustomer: true,
    estimatedDelivery: "2026-01-20",
    checkpoints: generateCheckpoints("Yaoundé", "En préparation"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "order_002",
    items: [
      {
        productId: products[2]?._id || products[0]._id,
        quantity: 3,
        price: products[2]?.price || products[0].price,
      },
    ],
    total: (products[2]?.price || products[0].price) * 3,
    customer: {
      name: "Mbappe",
      phone: "677889900",
      hasWhatsApp: true,
      deliveryZone: "Douala",
      callTime: "afternoon",
    },
    status: "Livré",
    isSeriousCustomer: true,
    estimatedDelivery: "2026-01-19",
    checkpoints: generateCheckpoints("Douala", "Livré"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "order_003",
    items: [
      {
        productId: products[1]?._id || products[0]._id,
        quantity: 1,
        price: products[1]?.price || products[0].price,
      },
    ],
    total: products[1]?.price || products[0].price,
    customer: {
      name: "Nadine",
      phone: "699112233",
      hasWhatsApp: false,
      deliveryZone: "Bafoussam",
      callTime: "evening",
    },
    status: "Livré",
    isSeriousCustomer: false,
    estimatedDelivery: "2026-01-18",
    checkpoints: generateCheckpoints("Bafoussam", "Livré"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions
export const getOrderById = (
  orderId: string
): OrderTracking | undefined => orders.find((o) => o.id === orderId);

export const getOrdersByCustomerPhone = (
  phone: string
): OrderTracking[] => orders.filter((o) => o.customer.phone === phone);

// Add new order
export const addOrder = (
  items: { product: Product; quantity: number }[],
  customer: OrderTracking["customer"]
): OrderTracking => {
  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const generateOrderId = (): string => {
    let id: string;

    do {
      id = `order_${Math.floor(10000 + Math.random() * 90000)}`;
    } while (orders.find((o) => o.id === id));

    return id;
  };

  const newOrder: OrderTracking = {
    id: generateOrderId(),
    items: orderItems,
    total,
    customer,
    status: "En préparation",
    isSeriousCustomer: true,
    estimatedDelivery: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
    checkpoints: generateCheckpoints(customer.deliveryZone, "En préparation"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);

  return newOrder;
};