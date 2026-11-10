# KitchenFlow

**Live application:** https://kitchen-flow-lemon.vercel.app/  
**Backend API:** https://kitchenflow-mept.onrender.com  
**Repository:** https://github.com/vishwa073/KitchenFlow

KitchenFlow is a full-stack food ordering and kitchen operations platform built around multiple outlets. Customers can discover outlets, browse menus, place and track orders, manage delivery details, and submit party-order requests. Outlet teams use dedicated kitchen and manager workflows, while central administrators manage the wider platform.

> **Evaluation note:** This repository includes evaluation-only demo account details in [`docs/TESTING-GUIDE.md`](docs/TESTING-GUIDE.md). These accounts are intended only for testing this demo deployment. Do not reuse their passwords elsewhere or store real customer data in the demo environment. Rotate or disable the accounts after the evaluation period.

## Product capabilities

### Customer experience
- Browse Hyderabad outlets and outlet-specific menus.
- View menu categories, item details, variants, add-ons, dietary attributes, spice information, and preparation estimates.
- Add items to a cart and complete the checkout flow.
- Save delivery details and check outlet serviceability using a selected map location.
- View order history and order status updates.
- Access loyalty-related functionality.
- Submit and review party/catering requests.

### Kitchen and outlet operations
- Kitchen Display System (KDS) for monitoring and progressing incoming orders.
- Real-time order updates using Socket.IO.
- Late-order alert support.
- Outlet-scoped manager workflows for menu and order management.

### Central administration
- Central admin interface for platform-level management.
- Management features for outlets, menus, orders, and coupons, subject to the role permissions implemented by the API.

## Technology stack

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 8 | Component-based customer and operations interfaces |
| Styling and UI | Tailwind CSS 4, Lucide React | Responsive styling and icons |
| Routing and identity | React Router 7, Clerk React | Client-side navigation and sign-in/session integration |
| Maps | Leaflet 1.9, React Leaflet 5, OpenStreetMap tiles | Interactive map, pin selection, and location coordinates |
| Real-time | Socket.IO Client 4 | Live order and kitchen updates |
| Backend | Node.js, TypeScript, Express 5 | REST API and application logic |
| Authentication | Clerk Express / Clerk Backend SDK | Verify identity and protect API/socket connections |
| Database | PostgreSQL, Neon, Prisma 7, `pg` | Persistent application data and ORM/data access |
| Messaging | WAHA (WhatsApp HTTP API) | Send WhatsApp OTP messages through a linked WhatsApp session |
| AI-assisted estimates | Groq API (optional) | Optional preparation-time estimation where configured |
| Testing and quality | Vitest, ESLint, TypeScript | Frontend tests, linting, and type/build checks |
| Deployment | Vercel, Render | Frontend hosting and backend API hosting |

## Architecture overview

The repository is an npm-workspaces monorepo with two applications:

```text
KitchenFlow/
├── apps/
│   ├── web/                 # React + TypeScript + Vite frontend
│   └── api/                 # Express + TypeScript + Socket.IO backend
├── docs/
│   ├── TESTING-GUIDE.md     # Demo accounts and suggested evaluation flow
│   └── OUTLET-LOCATION-NOTES.md
├── package.json             # npm workspaces
└── README.md
```

- **Web application (`apps/web`)** renders the customer, KDS, manager, and central-admin experiences. It calls the backend using the configured `VITE_API_URL`.
- **API (`apps/api`)** exposes REST endpoints, applies authentication/authorization middleware, executes business logic, and accesses PostgreSQL through Prisma.
- **Database** stores users, role/outlet assignments, outlets, menu data, carts, orders, party requests, loyalty data, OTP records, and other operational entities represented in the Prisma schema.
- **Real-time channel** is provided by Socket.IO. The frontend sends a Clerk token in the socket handshake. The backend verifies it and derives authorized customer/outlet rooms from database assignments; clients do not get to choose arbitrary authorized rooms.

## Authentication and authorization

Clerk handles external identity and session management. KitchenFlow maps the authenticated Clerk identity to its own database user and role/outlet assignments.

Roles represented in the application include:
- `CUSTOMER`
- `CENTRAL_ADMIN`
- `OUTLET_MANAGER`
- `KITCHEN_STAFF`
- `CATERING_MANAGER`

Protected API requests use a Clerk bearer token. Socket.IO connections are authenticated separately using the Clerk token in the Socket.IO handshake. The API resolves the user's internal identity and active outlet assignments before joining authorized rooms.

## WhatsApp OTP with WAHA

KitchenFlow uses **WAHA (WhatsApp HTTP API)** as the messaging bridge for WhatsApp OTP delivery.

The backend's WhatsApp service sends a `POST` request to:

```text
{WAHA_BASE_URL}/api/sendText
```

It supplies the configured `X-Api-Key` header and sends a message payload containing:
- `session: "default"`
- the recipient's WhatsApp chat ID (normalized phone number with `@c.us`)
- the OTP message text

### How the demo setup works

1. WAHA runs as a Docker container on the machine hosting the WhatsApp session.
2. The WhatsApp account is linked to WAHA's `default` session by scanning the QR code shown by WAHA.
3. The API calls WAHA's `/api/sendText` endpoint to send OTP messages.
4. For the deployed Render API, `localhost` on Render cannot reach a WAHA container running on a developer's laptop. During this demo, a **Cloudflare Quick Tunnel** was used to expose the local WAHA HTTP endpoint to Render.
5. Render's `WAHA_BASE_URL` points to that tunnel URL, while `WAHA_API_KEY` remains configured as a secret.

**Important availability limitation:** A Cloudflare Quick Tunnel URL is temporary and the tunnel depends on the host computer, Docker, WAHA, and the `cloudflared` process remaining online. If the tunnel stops or its URL changes, WhatsApp OTP delivery from the deployed app will stop until the tunnel is restarted and Render's `WAHA_BASE_URL` is updated. This is a demo/testing arrangement, not a production-grade always-on messaging deployment.

Never commit the WAHA API key, dashboard credentials, OTP hash secret, or any tunnel credentials. For a long-lived production deployment, host WAHA or an equivalent WhatsApp provider on reliable infrastructure with appropriate security and operational controls.

### If a tester does not receive a WhatsApp OTP

The testing guide includes a dedicated demo customer account so evaluators can explore the customer experience without depending on delivery of a WhatsApp message. This is a fallback for evaluation, not a claim that WhatsApp delivery is unnecessary for the phone-verification flow.

## Map and delivery-location behaviour

KitchenFlow uses **Leaflet** and **React Leaflet** to render the interactive map, with map tiles attributed to **© OpenStreetMap contributors**.

The map supports:
- clicking/tapping the map to place or move a delivery pin;
- using the browser's current-location permission, when granted;
- reading the selected latitude and longitude;
- sending those coordinates to the backend serviceability endpoint.

The backend calculates the distance between the selected coordinates and seeded outlet coordinates and compares that distance with each outlet's configured delivery radius.

**Address-entry limitation:** The map picker is coordinate-based. The current implementation does not perform reverse geocoding to turn a pin into a verified street address, and it does not validate every free-text address field against a geocoding/address database. A tester should therefore enter a clear delivery description manually (for example, building/apartment, street or landmark, area, and PIN code) and use the map pin for the actual serviceability check. Do not interpret a typed address alone as proof that the location is serviceable.

See [`docs/OUTLET-LOCATION-NOTES.md`](docs/OUTLET-LOCATION-NOTES.md) for seeded outlet coordinates and a Madhapur testing location.

## Local development

### Prerequisites
- Node.js 20+ (use a current LTS release where possible)
- npm 10+
- PostgreSQL database (Neon is supported)
- Clerk application keys
- WAHA only if testing WhatsApp OTP delivery
- Groq API key only if enabling the optional AI-assisted estimate feature

### Install dependencies

Run from the repository root:

```bash
npm install
```

### Configure environment variables

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=4000
WEB_URL=http://localhost:5173
CLERK_SECRET_KEY=<clerk-secret-key>

# WAHA / WhatsApp OTP
WAHA_BASE_URL=http://localhost:3001
WAHA_API_KEY=<waha-api-key>
OTP_HASH_SECRET=<long-random-secret>

# Optional AI-assisted preparation-time estimates
GROQ_API_KEY=<groq-api-key>
GROQ_MODEL=<configured-groq-model>
```

Create `apps/web/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
VITE_API_URL=http://localhost:4000
```

Do not commit `.env` files or secrets. In production, set the corresponding variables in the Vercel and Render project settings.

### Database setup

Run from the repository root:

```bash
npm --workspace @kitchenflow/api exec prisma generate
npm --workspace @kitchenflow/api exec prisma migrate deploy
npm --workspace @kitchenflow/api exec prisma db seed
```

The seed script creates/updates the Hyderabad outlets and shared demo menu. It is intended for the configured database; do not run it against a production database unless you intend to apply the seed data there.

### Start the applications

Terminal 1 — API:

```bash
npm run dev --workspace @kitchenflow/api
```

Terminal 2 — frontend:

```bash
npm run dev --workspace web
```

Local URLs:
- Frontend: http://localhost:5173
- API: http://localhost:4000
- API health: http://localhost:4000/api/health
- Database health: http://localhost:4000/api/health/db

## Useful scripts

```bash
# Frontend
npm run dev --workspace web
npm run build --workspace web
npm run lint --workspace web
npm run test --workspace web -- --run
npm run preview --workspace web

# Backend
npm run dev --workspace @kitchenflow/api
npm run build --workspace @kitchenflow/api
npm run start --workspace @kitchenflow/api
```

## API route groups

| Area | Base path |
|---|---|
| Serviceability | `/api/serviceability` |
| Menu | `/api/menu` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Loyalty | `/api/loyalty` |
| Party requests | `/api/party` |
| Kitchen | `/api/kitchen` |
| Management | `/api/management` |
| Manager orders | `/api/management/manager/orders` |
| Manager menu items | `/api/management/manager/menu-items` |
| Outlets | `/api/outlets` |
| Authentication | `/api/auth` |
| Addresses | `/api/addresses` |

## Main frontend routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/outlets` | Outlet discovery and delivery-location selection |
| `/outlets/:outletId/menu` | Outlet menu |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/orders` and `/orders/:orderId` | Order history and order details |
| `/customer/:outletId` | Customer outlet experience |
| `/customer/:outletId/party` | Party/catering request flow |
| `/kitchen` | Kitchen Display System |
| `/manager` | Outlet manager dashboard |
| `/admin` | Central administration |

## Deployment

The current demo deployment uses:
- **Vercel** for the frontend: https://kitchen-flow-lemon.vercel.app/
- **Render** for the API: https://kitchenflow-mept.onrender.com
- **Neon/PostgreSQL** for persistent database storage.
- **Clerk** for authentication.
- **WAHA + Cloudflare Quick Tunnel** for the current demo WhatsApp OTP bridge (see the limitations above).

The frontend's `VITE_API_URL` must point to the Render API URL. The backend's `WEB_URL` must match the deployed frontend origin exactly for HTTP and Socket.IO CORS. If using a Vercel preview deployment, its origin must be explicitly supported by the backend CORS configuration; the permanent production domain is the intended evaluation URL.

## Evaluation / testing

Start with the live app: **https://kitchen-flow-lemon.vercel.app/**

Use [`docs/TESTING-GUIDE.md`](docs/TESTING-GUIDE.md) for:
- demo customer, Madhapur kitchen staff, Madhapur manager, and central admin accounts;
- suggested end-to-end testing order;
- WhatsApp OTP fallback guidance;
- known map/address behaviour and default outlet test location.
-if the yasked for otp in the demo account use 424242

Use [`docs/OUTLET-LOCATION-NOTES.md`](docs/OUTLET-LOCATION-NOTES.md) for seeded outlet coordinates, service radii, and map-pin guidance.

## Known demo constraints

- WhatsApp delivery depends on the developer-hosted WAHA session and temporary Cloudflare Quick Tunnel described above.
- The map pin captures coordinates; free-text address values are not automatically reverse-geocoded or independently verified.
- Vercel preview URLs are not necessarily included in the backend's exact-origin CORS allow-list; use the permanent production URL for evaluation.
- Demo accounts are shared evaluation identities. Avoid entering real personal, payment, or sensitive information.

## License

No open-source license has been specified in this repository. Unless a license is added, the source remains subject to the default copyright rules.
