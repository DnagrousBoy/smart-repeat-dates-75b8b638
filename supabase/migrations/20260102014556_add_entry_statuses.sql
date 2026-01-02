-- Create the entry_statuses table to track completion and remarks per date
create table if not exists public.entry_statuses (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid not null references public.calendar_entries(id) on delete cascade,
  date date not null,
  status text not null check (status in ('COMPLETED', 'INCOMPLETE')),
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(entry_id, date)
);

-- Enable Row Level Security
alter table public.entry_statuses enable row level security;

-- Policies to ensure users can only access statuses for their own entries
-- We check ownership via the parent calendar_entries table

create policy "Users can view their own entry statuses"
  on public.entry_statuses for select
  using (
    exists (
      select 1 from public.calendar_entries
      where calendar_entries.id = entry_statuses.entry_id
      and calendar_entries.user_id = auth.uid()
    )
  );

create policy "Users can insert their own entry statuses"
  on public.entry_statuses for insert
  with check (
    exists (
      select 1 from public.calendar_entries
      where calendar_entries.id = entry_statuses.entry_id
      and calendar_entries.user_id = auth.uid()
    )
  );

create policy "Users can update their own entry statuses"
  on public.entry_statuses for update
  using (
    exists (
      select 1 from public.calendar_entries
      where calendar_entries.id = entry_statuses.entry_id
      and calendar_entries.user_id = auth.uid()
    )
  );

create policy "Users can delete their own entry statuses"
  on public.entry_statuses for delete
  using (
    exists (
      select 1 from public.calendar_entries
      where calendar_entries.id = entry_statuses.entry_id
      and calendar_entries.user_id = auth.uid()
    )
  );
