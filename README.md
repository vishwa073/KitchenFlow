# KitchenFlow

KitchenFlow is a full-stack food ordering and kitchen operations platform. It supports customer ordering, outlet-based menus, checkout, order tracking, loyalty, party orders, kitchen workflows, and role-based management tools.

## Features

- Browse active outlets and outlet-specific menus
- Menu variants, add-ons, dietary information, spice levels, and preparation times
- Cart and authenticated checkout flow
- Address management and delivery serviceability checks
- Order history, order tracking, and live order updates
- Customer loyalty accounts and loyalty transactions
- Party/catering order requests
- Kitchen display workflows and late-order alerts
- Central administration and outlet manager menu/order management
- Clerk authentication with role and outlet-based authorization
- WhatsApp OTP support through WAHA
- AI-assisted preparation-time estimates through Groq, when configured

## Technology stack

### Frontend

- React 19
- TypeScript 5.9
- Vite 8
- React Router 7
- Clerk React for authentication
- Tailwind CSS 4
- Leaflet and React Leaflet for location and map features
- Lucide React for icons
- Socket.IO Client for real-time updates
- Vitest for frontend tests

### Backend

- Node.js with TypeScript
- Express 5
- Clerk Express and Clerk Backend SDK for authentication
- Socket.IO for authenticated real-time communication
- Prisma 7 ORM
- PostgreSQL, using the `pg`, Prisma PostgreSQL, and Neon adapters
- CORS and dotenv

### Development and data

- npm workspaces
- Prisma migrations and seed data
- ESLint 10 with TypeScript and React plugins
- PostgreSQL-compatible Neon database support
- WAHA integration for WhatsApp OTP delivery
- Groq integration for optional preparation-time estimation

## Repository structure

```text
KitchenFlow/
├── apps/
│   ├── web/                  # React/Vite customer, kitchen, and management UI
│   │   └── src/
│   │       ├── features/     # Feature pages, services, types, and components
│   │       ├── hooks/        # Shared React hooks
│   │       └── lib/          # API and Socket.IO clients/providers
│   └── api/                  # Express API and Socket.IO server
│       ├── prisma/           # Schema, migrations, and seed data
│       └── src/
│           ├── middleware/   # Authentication, authorization, and errors
│           ├── modules/      # Domain routes and services
│           └── routes/       # Cross-domain API routes
├── package.json              # Workspace configuration
└── package-lock.json
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A PostgreSQL database (Neon is supported)
- A Clerk application
- WAHA only if WhatsApp OTP is enabled
- A Groq API key only if AI preparation-time estimates are enabled

## Installation

Clone the repository and install all workspace dependencies from the root:

```bash
npm install
```

Create the API environment file at `apps/api/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=4000
WEB_URL=http://localhost:5173
CLERK_SECRET_KEY=<clerk-secret-key>
WAHA_BASE_URL=http://localhost:3001
WAHA_API_KEY=<waha-api-key>
OTP_HASH_SECRET=<long-random-secret>

# Optional AI preparation-time estimation
GROQ_API_KEY=<groq-api-key>
GROQ_MODEL=openai/gpt-oss-20b
```

Create the frontend environment file at `apps/web/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
VITE_API_URL=http://localhost:4000
```

Do not commit `.env`, `.env.*`, or any API keys. The repository ignores local environment files by default.

## Database setup

Run Prisma commands from the API workspace:

```bash
# Generate the Prisma client
npm --workspace @kitchenflow/api exec prisma generate

# Apply existing migrations to the configured database
npm --workspace @kitchenflow/api exec prisma migrate deploy

# Seed Hyderabad outlets and the shared demo menu
npm --workspace @kitchenflow/api exec prisma db seed
```

For local schema development, use a migration instead of editing the database manually:

```bash
npm --workspace @kitchenflow/api exec prisma migrate dev --name describe-your-change
```

The Prisma schema is in `apps/api/prisma/schema.prisma`. Migrations are stored in `apps/api/prisma/migrations`.

## Running locally

Start the API in one terminal:

```bash
npm run dev --workspace @kitchenflow/api
```

Start the web application in another terminal:

```bash
npm run dev --workspace web
```

The default local URLs are:

- Web app: `http://localhost:5173`
- API: `http://localhost:4000`
- API health check: `http://localhost:4000/api/health`
- Database health check: `http://localhost:4000/api/health/db`

## Available scripts

### Root

```bash
npm install
```

### Web app (`apps/web`)

```bash
npm run dev --workspace web       # Start Vite development server
npm run build --workspace web     # Type-check and create production build
npm run lint --workspace web      # Run ESLint
npm run test --workspace web      # Run Vitest
npm run preview --workspace web   # Preview the production build
```

### API (`apps/api`)

```bash
npm run dev --workspace @kitchenflow/api    # Start API with tsx watch
npm run build --workspace @kitchenflow/api  # Compile TypeScript
npm run start --workspace @kitchenflow/api  # Run compiled API
```

## API areas

The API is organized around these route groups:

| Area | Base path |
| --- | --- |
| Serviceability | `/api/serviceability` |
| Menu | `/api/menu` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Loyalty | `/api/loyalty` |
| Party orders | `/api/party` |
| Kitchen | `/api/kitchen` |
| Management | `/api/management` |
| Outlet manager orders | `/api/management/manager/orders` |
| Outlet manager menu | `/api/management/manager/menu-items` |
| Outlets | `/api/outlets` |
| Authentication | `/api/auth` |
| Addresses | `/api/addresses` |

Protected HTTP routes use Clerk bearer tokens. Socket.IO connections are also authenticated with a Clerk token and are assigned to server-authorized customer and outlet rooms.

## Frontend routes

The main UI routes include:

- `/` - Landing page
- `/outlets` - Outlet selection
- `/outlets/:outletId/menu` - Outlet menu
- `/cart` - Cart
- `/checkout` - Authenticated checkout
- `/orders` and `/orders/:orderId` - Orders and tracking
- `/customer/:outletId` - Customer dashboard
- `/customer/:outletId/party` - Party order request
- `/kitchen` - Kitchen display
- `/manager` - Outlet manager tools
- `/admin` - Central administration

## Testing and verification

Before opening a pull request, run the checks relevant to your change:

```bash
npm run lint --workspace web
npm run test --workspace web -- --run
npm run build --workspace web
npm run build --workspace @kitchenflow/api
```

The API build requires a valid API environment because Prisma and the server configuration load environment variables during development.

## Authentication and roles

Clerk provides the external identity. KitchenFlow stores the internal user and role assignments in PostgreSQL. The data model supports:

- `CUSTOMER`
- `CENTRAL_ADMIN`
- `OUTLET_MANAGER`
- `KITCHEN_STAFF`
- `CATERING_MANAGER`

Outlet staff assignments are scoped to active outlets, which is also used when authorizing Socket.IO outlet rooms.

## Contributing

1. Create a focused branch.
2. Keep frontend and API changes in their respective workspace.
3. Add or update Prisma migrations for schema changes.
4. Update seed data when local development data needs to change.
5. Run the relevant lint, test, and build commands.
6. Never commit credentials, production URLs, or generated secrets.

## License

No project license has been declared yet.
