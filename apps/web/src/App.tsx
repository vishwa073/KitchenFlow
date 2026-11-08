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
import AuthMeTest from "./components/AuthMeTest";
import OnboardingPage from "./features/onboarding/OnboardingPage";
import PartyPage from "./features/customer/pages/PartyPage";
import CustomerPage from "./features/customer/CustomerPage";
import CustomerHome from "./features/customer/pages/CustomerHome";
import CustomerOrders from "./features/customer/pages/CustomerOrders";
import CustomerProfile from "./features/customer/pages/CustomerProfile";
import PostAuthRedirect from "./features/auth/components/PostAuthRedirect";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/post-auth"
            element={
              <RequireAuth>
                <PostAuthRedirect />
              </RequireAuth>
            }
          />
          <Route path="/" element={<LandingPage />} />
          <Route path="/outlets" element={<OutletPage />} />
          <Route path="/outlets/:outletId/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Temporary onboarding test route */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Temporary authentication test route */}
          <Route path="/auth-test" element={<AuthMeTest />} />

          {/* Protected checkout routes */}
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

          {/* Protected customer area with shared layout */}
          <Route
            path="/customer/:outletId"
            element={
              <RequireAuth>
                <CustomerPage />
              </RequireAuth>
            }
          >
           <Route index element={<CustomerHome />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="profile" element={<CustomerProfile />} />

            <Route path="/customer/:outletId/party" element={<PartyPage />} />
          </Route>

          {/* Existing order routes */}
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
