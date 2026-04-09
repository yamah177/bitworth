-- ============================================================
-- BITWORTH DATABASE SCHEMA
-- Run this entire file in your Supabase SQL editor
-- Project: https://supabase.com/dashboard
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ACCOUNTS TABLE
-- Stores user asset accounts (retirement, brokerage, real estate, etc.)
-- ============================================================
create table if not exists public.accounts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          text not null,
  institution   text,
  usd_value     numeric(20, 2) not null default 0,
  notes         text,
  is_manual     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- LIABILITIES TABLE
-- Stores user debts (mortgage, student loans, credit cards, etc.)
-- ============================================================
create table if not exists public.liabilities (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  type          text not null,
  institution   text,
  usd_balance   numeric(20, 2) not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- NET WORTH SNAPSHOTS TABLE
-- Daily snapshots of net worth in both USD and BTC
-- This is what powers the historical chart over time
-- ============================================================
create table if not exists public.net_worth_snapshots (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  total_assets_usd      numeric(20, 2) not null default 0,
  total_liabilities_usd numeric(20, 2) not null default 0,
  net_worth_usd         numeric(20, 2) not null default 0,
  net_worth_btc         numeric(20, 8) not null default 0,
  btc_price_usd         numeric(20, 2) not null default 0,
  created_at            timestamptz not null default now()
);

-- ============================================================
-- BTC PRICE CACHE TABLE
-- Single row updated server-side periodically
-- Avoids hitting CoinGecko on every user request
-- ============================================================
create table if not exists public.btc_price_cache (
  id          integer primary key default 1,
  price_usd   numeric(20, 2) not null,
  updated_at  timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed with a placeholder price (will be updated by API)
insert into public.btc_price_cache (id, price_usd) 
values (1, 98000)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Critical: ensures users can ONLY see their own data
-- Even if there's a bug in app code, the DB enforces this
-- ============================================================
alter table public.accounts enable row level security;
alter table public.liabilities enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.btc_price_cache enable row level security;

-- Accounts policies
create policy "Users can view own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Liabilities policies
create policy "Users can view own liabilities"
  on public.liabilities for select
  using (auth.uid() = user_id);

create policy "Users can insert own liabilities"
  on public.liabilities for insert
  with check (auth.uid() = user_id);

create policy "Users can update own liabilities"
  on public.liabilities for update
  using (auth.uid() = user_id);

create policy "Users can delete own liabilities"
  on public.liabilities for delete
  using (auth.uid() = user_id);

-- Net worth snapshots policies
create policy "Users can view own snapshots"
  on public.net_worth_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on public.net_worth_snapshots for insert
  with check (auth.uid() = user_id);

-- BTC price cache: everyone can read, only service role can write
create policy "Anyone can read btc price"
  on public.btc_price_cache for select
  using (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- Automatically keeps updated_at current on row changes
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_accounts_updated
  before update on public.accounts
  for each row execute procedure public.handle_updated_at();

create trigger on_liabilities_updated
  before update on public.liabilities
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- HELPFUL INDEXES
-- ============================================================
create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists liabilities_user_id_idx on public.liabilities(user_id);
create index if not exists snapshots_user_id_created_idx on public.net_worth_snapshots(user_id, created_at desc);
