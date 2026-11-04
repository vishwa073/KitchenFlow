
import type { KitchenOrder } from "../types/kitchenOrder";

const now = Date.now();

const minutesAgo = (minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

const minutesFromNow = (minutes: number) =>
  new Date(now + minutes * 60_000).toISOString();

export const mockKitchenOrders: KitchenOrder[] = [
  {
    id: "WEB-778120",
    outletId: "kondapur",
    outletName: "Kondapur",
    items: [
      {
        id: "item-778120-1",
        name: "Chicken Dum Biryani Family Pack",
        quantity: 1,
        price: 850,
      },
      {
        id: "item-778120-2",
        name: "Double Ka Meetha",
        quantity: 2,
        price: 165,
      },
    ],
    subtotal: 1180,
    deliveryFee: 0,
    taxes: 0,
    total: 1180,
    status: "PREPARING",
    createdAt: minutesAgo(18),
    estimatedPreparationMinutes: 45,
    promisedAt: minutesFromNow(27),
    deliveryAddress: "Kondapur delivery area",
    paymentMethod: "UPI",
    specialInstructions: "Pack desserts separately.",
  },
  {
    id: "WEB-778131",
    outletId: "gachibowli-cloud",
    outletName: "Gachibowli Cloud Kitchen",
    items: [
      {
        id: "item-778131-1",
        name: "Veg Biryani",
        quantity: 2,
        price: 250,
      },
      {
        id: "item-778131-2",
        name: "Mirchi Ka Salan",
        quantity: 1,
        price: 140,
      },
    ],
    subtotal: 640,
    deliveryFee: 0,
    taxes: 0,
    total: 640,
    status: "READY",
    createdAt: minutesAgo(40),
    estimatedPreparationMinutes: 40,
    promisedAt: minutesAgo(1),
    deliveryAddress: "Gachibowli delivery area",
    paymentMethod: "CARD",
  },
  {
    id: "WEB-778146",
    outletId: "kukatpally",
    outletName: "Kukatpally",
    items: [
      {
        id: "item-778146-1",
        name: "Mutton Haleem",
        quantity: 3,
        price: 350,
      },
    ],
    subtotal: 1050,
    deliveryFee: 0,
    taxes: 0,
    total: 1050,
    status: "PREPARING",
    createdAt: minutesAgo(54),
    estimatedPreparationMinutes: 50,
    promisedAt: minutesAgo(4),
    deliveryAddress: "Kukatpally delivery area",
    paymentMethod: "UPI",
    specialInstructions: "Extra lemon and ginger.",
  },
];
