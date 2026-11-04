
import { BrowserRouter, Route, Routes } from "react-router-dom";

import CheckoutPage from "./features/checkout/CheckoutPage";
import LandingPage from "./features/landing/LandingPage";
import OutletPage from "./features/outlets/OutletPage";
import { CartProvider } from "./features/cart/context/CartContext";
import OrderConfirmationPage from "./features/checkout/OrderConfirmationPage";
import MenuPage from "./features/menu/MenuPage";
import CartPage from "./features/cart/CartPage";
import OrdersPage from "./features/orders/OrdersPage";
import OrderTrackingPage from "./features/orders/OrderTrackingPage";
import KitchenDisplayPage from "./features/kitchen/KitchenDisplayPage";
import RequireAuth from "./features/auth/components/RequireAuth";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/outlets" element={<OutletPage />} />
          <Route path="/outlets/:outletId/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected customer routes */}
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />

          <Route
            path="/order-confirmation"
            element={
              <RequireAuth>
                <OrderConfirmationPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <RequireAuth>
                <OrderTrackingPage />
              </RequireAuth>
            }
          />

          {/* Kitchen route — staff authorization will be added separately */}
          <Route path="/kitchen" element={<KitchenDisplayPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
