import type { Order, OrderStatusUpdate } from "../types/order";
import {
  getOrders as getMockOrders,
  getOrderById as getMockOrderById,
  getOrderStatusHistory as getMockOrderStatusHistory,
} from "./mockOrderService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export async function getOrders(): Promise<Order[]> {
  if (USE_MOCK_API) {
    return getMockOrders();
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders.");
  }

  return response.json();
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (USE_MOCK_API) {
    return getMockOrderById(id);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders/${id}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch order.");
  }

  return response.json();
}

export async function getOrderStatusHistory(
  order: Order
): Promise<OrderStatusUpdate[]> {
  if (USE_MOCK_API) {
    return getMockOrderStatusHistory(order);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders/${order.id}/status-history`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch order status history.");
  }

  return response.json();
}