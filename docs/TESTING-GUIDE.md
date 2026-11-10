# KitchenFlow — Evaluation Testing Guide

**Live application:** https://kitchen-flow-lemon.vercel.app/

This guide gives evaluators a practical sequence for exploring the customer, kitchen, manager, and central-admin experiences. These are demo identities for the evaluation deployment only.

> **Credential safety:** The credentials below are intentionally shared for this demo. Anyone who can read this repository may be able to use them. Do not use these passwords on any other service, do not enter real customer data, and disable/rotate these accounts after evaluation. If the repository is public, treat every listed credential as public.

## Demo accounts

### Customer demo account — WhatsApp fallback

| Field | Value |
|---|---|
| Email | `test+clerk_test@example.com` |
| Password | `KitchenFlowtest` |
| Role | Customer / demo tester |

Use this account if a tester cannot receive the WhatsApp OTP or simply needs to explore the customer experience without waiting for a WhatsApp message. This is a pre-created demo sign-in account; it does not demonstrate live OTP delivery.

### Madhapur kitchen staff

| Field | Value |
|---|---|
| Email | `demo.kitchen-staff.hyd-mad-004+clerk_test@example.com` |
| Password | `MadhapurKitchenFlowDemo` |
| Outlet | KitchenFlow Madhapur (`HYD-MAD-004`) |
| Role | Kitchen staff |

Open the KDS at `/kitchen` after signing in.

### Madhapur outlet manager

| Field | Value |
|---|---|
| Email | `demo.manager.hyd-mad-004+clerk_test@example.com` |
| Password | `MadhapurKitchenFlowDemo` |
| Outlet | KitchenFlow Madhapur (`HYD-MAD-004`) |
| Role | Outlet manager |

Open the manager dashboard at `/manager` after signing in.

### Central administrator

| Field | Value |
|---|---|
| Email | `vishwa+clerk_test@example.com` |
| Password | `KitchenFlow@123` |
| Clerk user ID | `user_3LrKoTbOCOckV07D4843VfvOnyA` |
| Role | `KitchenFlowAdmin` / central admin |

Use this account to explore platform-level administration at `/admin`.

## Suggested evaluation sequence

1. **Customer:** Sign in with the customer demo account, browse outlets and menus, add menu items to the cart, and explore checkout/order flows.
2. **Location/serviceability:** Open `/outlets`, select a point on the map near Madhapur, and run the delivery availability check. See `OUTLET-LOCATION-NOTES.md` for coordinates.
3. **Kitchen staff:** Sign out, sign in with the Madhapur kitchen staff account, and inspect the KDS. If a customer order is available for the same outlet, observe its kitchen workflow and status updates.
4. **Outlet manager:** Sign out, sign in with the Madhapur manager account, and inspect outlet-level order and menu management.
5. **Central admin:** Sign out, sign in with the central admin account, and inspect platform-level management features, including the coupon area after its API route is deployed.
6. **Party requests:** From the customer experience, inspect the party/catering request entry point and submit a demo request if the form is available.

The availability of existing orders depends on the current demo database. If there are no orders, create one through the customer flow before checking the KDS and manager order views.

## WhatsApp OTP: what to expect

The application can send OTP messages through WAHA. The deployed demo's WAHA instance is reached through a Cloudflare Quick Tunnel to a WAHA service running on the developer's machine. Consequently:
- the developer's machine, Docker WAHA container, and `cloudflared` process must be running;
- the tunnel URL must still match Render's `WAHA_BASE_URL`;
- delivery may be unavailable when the machine/tunnel is offline or the temporary tunnel URL changes.

If the OTP does not arrive, use the customer demo account above to evaluate the customer UI. Do not repeatedly request OTPs; use the fallback account instead.

## Delivery address and map pin

The map is an interactive coordinate picker, not an address autocomplete/verification service. A tester can click the map or use browser location permission to select a point. The selected latitude/longitude is what the serviceability check uses.

Enter the delivery address details manually and accurately (for example, apartment/building, street or landmark, locality, and PIN code). A typed address is not automatically converted into coordinates or independently validated by a geocoding provider.

For a Madhapur test point, use the outlet coordinates and suggested nearby pin in `OUTLET-LOCATION-NOTES.md`.

## Sign-out

Use the application's sign-out control between role tests so that the next role is authenticated with the correct account. The expected KDS sign-out destination is the public landing page (`/`) once the corresponding redirect fix is included in the deployed build.

## Reporting an issue

When reporting a problem, include:
- the role/account type (do not send passwords or session tokens);
- the page/route;
- the action taken;
- the visible error message and approximate time;
- a screenshot with personal data and tokens hidden.

Never share Clerk session bearer tokens, OTPs, API keys, or WAHA dashboard credentials in screenshots or issue reports.
