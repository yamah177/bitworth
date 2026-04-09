# Bitworth — Setup & Deployment Guide

Your net worth, priced in Bitcoin.

---

## Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [CoinGecko](https://www.coingecko.com/en/api) API key (free demo tier)
- Your domain (e.g. `bitworth.app`) purchased and ready

---

## Step 1 — Supabase Project Setup

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New project**
2. Name it `bitworth`, choose a strong database password, pick the region closest to your users
3. Wait ~2 minutes for provisioning

### Run the schema

1. In your Supabase project, go to **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the entire contents of `supabase/schema.sql` from this project
4. Click **Run** — you should see "Success. No rows returned"

This creates:
- `accounts` table (user assets)
- `liabilities` table (user debts)
- `net_worth_snapshots` table (historical chart data)
- `btc_price_cache` table (shared BTC price cache)
- Row Level Security policies on all tables
- Auto-update triggers for `updated_at`

### Configure email auth

1. In Supabase, go to **Authentication → Providers**
2. Email is enabled by default — leave it on
3. Go to **Authentication → Email Templates**
4. Customize the confirmation email to match the Bitworth brand (optional but professional)

### Get your API keys

In Supabase, go to **Project Settings → API**:
- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role** key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Step 2 — CoinGecko API Key

1. Go to [coingecko.com/en/api](https://www.coingecko.com/en/api)
2. Click **Get Demo API Key** — it's free, no credit card required
3. Copy the key → this is `COINGECKO_API_KEY`

The free Demo plan gives you:
- 30 calls/minute
- 10,000 calls/month

Since Bitworth caches the BTC price server-side and only calls CoinGecko once every 90 seconds, you'll use roughly **960 calls/day** — well within the free tier.

---

## Step 3 — Local Development

```bash
# Clone or unzip the project
cd bitworth

# Install dependencies
npm install

# Copy the env template
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
COINGECKO_API_KEY=CG-xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Bitworth landing page.

**Test the flow:**
1. Click "Get started" → sign up with your email
2. Check your email for the confirmation link and click it
3. You'll land on the dashboard — add a few accounts and liabilities
4. Watch your net worth calculate in real-time BTC

---

## Step 4 — Deploy to Vercel

### Connect your repo

1. Push the project to GitHub (create a private repo)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Vercel auto-detects Next.js — leave all settings as default

### Add environment variables

In Vercel project settings → **Environment Variables**, add:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | your supabase url | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key | Production only |
| `COINGECKO_API_KEY` | your coingecko key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | https://yourdomain.com | Production |

Click **Deploy**.

### Connect your domain

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `bitworth.app`)
3. Follow Vercel's instructions to update your DNS records
4. SSL is automatic — Vercel provisions a certificate within minutes

### Update Supabase redirect URLs

1. In Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to `https://yourdomain.com`
3. Add to **Redirect URLs**: `https://yourdomain.com/auth/callback`

---

## Step 5 — Verify Production

1. Visit your live domain
2. Sign up with a real email
3. Confirm via email
4. Add accounts/liabilities
5. Verify BTC price updates (check the navbar pill every 60s)
6. Verify the chart populates after adding holdings

---

## Architecture Overview

```
bitworth/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout + fonts
│   ├── globals.css                 # Design tokens + base styles
│   ├── auth/
│   │   ├── layout.tsx              # Shared auth layout
│   │   ├── login/page.tsx          # Login form
│   │   ├── signup/page.tsx         # Signup form
│   │   └── callback/route.ts       # Email confirmation handler
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard metadata
│   │   └── page.tsx                # Server component → auth check
│   └── api/
│       ├── btc-price/route.ts      # BTC price with caching
│       ├── accounts/
│       │   ├── route.ts            # GET all, POST new
│       │   └── [id]/route.ts       # PUT update, DELETE
│       ├── liabilities/
│       │   ├── route.ts            # GET all, POST new
│       │   └── [id]/route.ts       # PUT update, DELETE
│       └── snapshots/route.ts      # GET history, POST new snapshot
│
├── components/
│   ├── ui/
│   │   ├── Modal.tsx               # Base modal with Escape key support
│   │   └── FormModals.tsx          # Account + Liability forms
│   └── dashboard/
│       ├── DashboardClient.tsx     # Main orchestrator (data fetching)
│       ├── DashboardNav.tsx        # Sticky nav with BTC price ticker
│       ├── NetWorthHero.tsx        # Big BTC number card
│       ├── NetWorthChart.tsx       # Historical area chart
│       ├── AssetsList.tsx          # Asset rows with edit/delete
│       ├── LiabilitiesList.tsx     # Liability rows with edit/delete
│       ├── AllocationBreakdown.tsx # Donut + legend
│       └── BtcInsightCard.tsx      # BTC scenario analysis
│
├── lib/
│   ├── utils.ts                    # Formatting, BTC math helpers
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── middleware.ts           # Auth session refresh + route guard
│
├── types/index.ts                  # All TypeScript interfaces + enums
├── middleware.ts                   # Next.js middleware (route protection)
└── supabase/schema.sql             # Complete DB schema + RLS policies
```

---

## Security Notes

- **Row Level Security** is enabled on all tables — users can only access their own data, enforced at the database level
- **Service role key** is never exposed to the browser — only used server-side
- **No financial credentials** are stored — this is manual entry only for the MVP
- **HTTPS only** — Vercel enforces this in production
- **Email verification** is required before dashboard access
- **Password minimum** is 8 characters, enforced client and server side

---

## Phase 2 Roadmap (after launch)

### Plaid integration (automatic account sync)
- Add Plaid Link SDK for bank/brokerage connection
- Store encrypted Plaid `access_token` per account
- Nightly cron job to refresh balances via Plaid `/accounts/balance/get`
- Cost: $0 to start with Pay-As-You-Go, ~$300-1000/mo at scale

### Property value API (Estated)
- Add address field to `real_estate` account type
- Call Estated API to fetch automated valuation
- Refresh property values weekly
- Cost: ~$50/mo starter plan

### Precious metals live pricing
- Metals-API for gold, silver, platinum spot prices
- Add "quantity in oz" field to precious metals accounts
- Auto-calculate USD value from spot price × quantity
- Cost: free tier (250 req/month) → $15/mo paid

### Stripe subscription
- Free tier: up to 5 accounts, manual only
- Bitworth Pro ($9/mo): unlimited accounts + Plaid sync + property values
- Implement with Stripe Checkout + webhook for subscription status

### Push/email alerts
- "Your BTC net worth crossed X sats" milestone alerts
- Weekly net worth digest email
- Use Resend or Postmark for transactional email

---

## Support

For questions about this codebase, refer to:
- [Next.js docs](https://nextjs.org/docs)
- [Supabase docs](https://supabase.com/docs)
- [Vercel docs](https://vercel.com/docs)
- [CoinGecko API docs](https://docs.coingecko.com)
