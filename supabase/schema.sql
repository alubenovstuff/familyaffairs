-- FamilyAffairs schema
-- Run this in your Supabase SQL editor (supabase.com → SQL Editor → New query)

-- ── NextAuth required tables ──────────────────────────────────────────────

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  email_verified timestamptz,
  image text
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, provider_account_id)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  session_token text unique not null,
  expires timestamptz not null
);

create table if not exists verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- ── App tables ────────────────────────────────────────────────────────────

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  daily_base_pts int default 10,
  auto_approve text default 'Off',
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  init text not null,
  color text not null,
  role text not null check (role in ('parent', 'teen', 'child', 'young_child', 'extended')),
  points_balance int default 0,
  points_total_earned int default 0,
  current_streak int default 0,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null check (type in ('household', 'must_do', 'ongoing', 'challenge', 'baseline')),
  status text not null default 'active' check (status in ('active', 'pending_approval', 'approved', 'rejected', 'expired')),
  pts int default 10,
  due date,
  streak int default 0,
  duration int,
  reward text default 'none' check (reward in ('none', 'fixed', 'choice', 'mystery')),
  reward_label text,
  created_by uuid references members(id),
  created_at timestamptz default now()
);

create table if not exists task_assignees (
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  primary key (task_id, member_id)
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  emoji text not null,
  description text,
  category text,
  tier text check (tier in ('bronze', 'silver', 'gold', 'legendary')),
  pts_reward int default 0,
  requirement_value int,
  created_at timestamptz default now()
);

create table if not exists member_badges (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  earned_at timestamptz default now(),
  unique(member_id, badge_id)
);

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  family_id uuid references families(id) on delete cascade not null,
  title text not null,
  emoji text,
  price int not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'redeemed')),
  created_at timestamptz default now()
);

create table if not exists ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  family_id uuid references families(id) on delete cascade not null,
  amount int not null,
  description text,
  type text check (type in ('earned', 'spent', 'bonus', 'penalty')),
  task_id uuid references tasks(id),
  badge_id uuid references badges(id),
  created_at timestamptz default now()
);

-- ── Helper RPCs ───────────────────────────────────────────────────────────

create or replace function increment_points(p_member_id uuid, p_amount int)
returns void language sql as $$
  update members
  set points_balance = points_balance + p_amount,
      points_total_earned = points_total_earned + p_amount
  where id = p_member_id;
$$;

create or replace function decrement_points(p_member_id uuid, p_amount int)
returns void language sql as $$
  update members
  set points_balance = greatest(0, points_balance - p_amount)
  where id = p_member_id;
$$;

-- ── RLS policies ──────────────────────────────────────────────────────────
-- Disable RLS for now (service role bypasses it anyway)
-- Enable and configure once multi-tenant auth is fully wired up

alter table families disable row level security;
alter table members disable row level security;
alter table tasks disable row level security;
alter table task_assignees disable row level security;
alter table badges disable row level security;
alter table member_badges disable row level security;
alter table wishes disable row level security;
alter table ledger disable row level security;
