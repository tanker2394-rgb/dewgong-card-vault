-- Dewgong Card Vault — Cards Table
-- Run this in your Supabase SQL editor or via supabase CLI

create extension if not exists "uuid-ossp";

create table if not exists public.cards (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  set_name        text not null,
  set_number      text,
  image_url       text,
  condition       text not null check (condition in ('NM', 'LP', 'MP', 'HP', 'DMG')),
  price_paid      numeric(10, 2) not null check (price_paid >= 0),
  market_price    numeric(10, 2) check (market_price >= 0),
  date_purchased  date not null,
  quantity        integer not null default 1 check (quantity >= 1),
  notes           text,
  created_at      timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.cards enable row level security;

-- Policy: allow all operations from anon key (adjust for auth later)
create policy "Allow all" on public.cards
  for all
  using (true)
  with check (true);

-- Indexes for common queries
create index if not exists cards_name_idx      on public.cards (name);
create index if not exists cards_set_name_idx  on public.cards (set_name);
create index if not exists cards_condition_idx on public.cards (condition);
create index if not exists cards_created_at_idx on public.cards (created_at desc);
