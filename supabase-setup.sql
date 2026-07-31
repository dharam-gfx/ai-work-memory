-- Run this in Supabase Dashboard → SQL Editor

create table if not exists vault_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  data jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique(user_id, key)
);

-- Enable Row Level Security (users can only access their own data)
alter table vault_data enable row level security;

create policy "Users can manage their own vault data"
  on vault_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
