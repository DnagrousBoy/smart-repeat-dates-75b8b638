-- Create the table for storing task statuses
create table if not exists public.entry_statuses (
  entry_id uuid not null,
  date date not null,
  status text not null check (status in ('COMPLETED', 'INCOMPLETE')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Composite primary key ensures one status per task per day
  primary key (entry_id, date)
);

-- Enable Row Level Security
alter table public.entry_statuses enable row level security;

-- Create policies to allow access (adjust based on your auth requirements)
-- Policy for reading statuses
create policy "Enable read access for all users"
on public.entry_statuses for select
using (true);

-- Policy for inserting/updating statuses
create policy "Enable insert/update for all users"
on public.entry_statuses for insert
with check (true);

create policy "Enable update for all users"
on public.entry_statuses for update
using (true);
