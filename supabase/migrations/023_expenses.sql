-- A simple, single-entry expense ledger -- not a full double-entry
-- accounting system. Paired with existing fee records (income) to give a
-- session/term Income & Expense summary; see app/admin's Accounting tab.
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  session text not null,
  term text not null,
  category text not null default 'General',
  description text,
  amount numeric not null check (amount >= 0),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists expenses_school_session_term_idx on expenses (school_id, session, term);

alter table expenses enable row level security;
