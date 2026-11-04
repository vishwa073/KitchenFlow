import type { Order, OrderStatusUpdate } from "../types/order";

const mockOrders: Order[] = [
  {
    id: "KF-1001",
    outletName: "KitchenFlow Hyderabad Biryani",
    items: [
      {
        id: "item-1",
        name: "Hyderabad Chicken Dum Biryani",
        quantity: 2,
        price: 249,
      },
      {
        id: "item-2",
        name: "Chicken 65",
        quantity: 1,
        price: 149,
      },
    ],
    subtotal: 647,
    deliveryFee: 0,
    taxes: 32.35,
    total: 679.35,
    status: "PENDING_ACCEPTANCE",
    createdAt: new Date().toISOString(),
    estimatedPreparationMinutes: 30,
    deliveryAddress: "Customer delivery address",
  },
];

const statusMessages: Record<OrderStatusUpdate["status"], string> = {
  PENDING_ACCEPTANCE: "Waiting for the outlet to accept your order.",
  ACCEPTED: "The outlet has accepted your order.",
  PREPARING: "Your food is being prepared.",
  READY: "Your order is ready.",
  OUT_FOR_DELIVERY: "Your order is on the way.",
  DELIVERED: "Your order has been delivered.",
  CANCELLED: "This order has been cancelled.",
};

export async function getOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockOrders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockOrders.find((order) => order.id === id) ?? null;
}

export async function getOrderStatusHistory(
  order: Order
): Promise<OrderStatusUpdate[]> {
  return [
    {
      status: order.status,
      message: statusMessages[order.status],
      updatedAt: order.createdAt,
    },
  ];
}