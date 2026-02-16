# Stripe Subscription Management

A full-stack subscription billing system with 3 tiers (Free / Pro / Team), instant upgrade/downgrade, and a self-service billing portal.

## Stack

- **Frontend:** Next.js 14 App Router, TypeScript (strict), Tailwind CSS
- **Backend:** Convex (real-time database + functions)
- **Auth:** Clerk
- **Payments:** Stripe (Checkout, Customer Portal, Webhooks)
- **Validation:** Zod

## Features

- Three subscription tiers with per-feature gating
- Stripe Checkout for new subscriptions
- Stripe Customer Portal for upgrades, downgrades, and cancellations
- Webhook-driven plan updates (< 5s latency)
- Real-time UI updates via Convex reactive queries
- `<FeatureGate>` component and `useSubscription()` hook for client-side gating
- `requirePlan()` helper for server-side authorization in Convex functions
- Error boundaries on billing routes

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your keys:

```
NEXT_PUBLIC_CONVEX_URL=           # from `npx convex dev`
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=            # from Stripe CLI or dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=  # create in Stripe dashboard
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID= # create in Stripe dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONVEX_WEBHOOK_SECRET=            # any random secret string
```

### 3. Set up Convex

```bash
npx convex dev
```

This deploys the schema and functions, and generates the `convex/_generated` types.

### 4. Set up Stripe products

1. Create two products in the [Stripe Dashboard](https://dashboard.stripe.com/products) (Pro and Team) with recurring prices
2. Copy the price IDs into `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` and `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`
3. Configure the [Customer Portal](https://dashboard.stripe.com/settings/billing/portal) to allow plan switching and cancellation

### 5. Run the app

```bash
npm run dev
```

### 6. Listen for webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Testing

1. Sign in and go to `/settings/billing`
2. Click **Upgrade** on the Pro plan
3. Use test card `4242 4242 4242 4242` (any future expiry, any CVC)
4. Verify the plan updates in the UI within 5 seconds
5. Click **Manage Billing** to open the Stripe Customer Portal

## Project Structure

```
├── convex/
│   ├── schema.ts              # Subscriptions table definition
│   ├── subscriptions.ts       # Queries and mutations
│   ├── http.ts                # HTTP action for webhook relay
│   ├── auth.config.ts         # Clerk JWT config
│   └── lib/requirePlan.ts     # Server-side plan gate
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Clerk + Convex providers)
│   │   ├── page.tsx           # Landing page
│   │   ├── api/stripe/        # Checkout + Portal API routes
│   │   ├── api/webhooks/      # Stripe webhook handler
│   │   └── settings/billing/  # Billing page + error boundary
│   ├── components/
│   │   ├── billing/           # Billing UI components
│   │   ├── feature-gate.tsx   # <FeatureGate minimum="pro">
│   │   └── providers/         # Convex client provider
│   ├── hooks/
│   │   └── use-subscription.ts
│   └── lib/
│       ├── plans.ts           # Plan config + helpers
│       └── stripe.ts          # Stripe client instance
└── .env.local                 # Environment variables (not committed)
```

## Data Flow

```
User clicks Upgrade
  → POST /api/stripe/checkout → Stripe Checkout page
  → User pays → redirect to /settings/billing?success=true
  → Stripe fires webhook → POST /api/webhooks/stripe
  → Verify signature → relay to Convex HTTP action
  → upsertSubscription() → reactive query updates UI
```

## License

MIT
