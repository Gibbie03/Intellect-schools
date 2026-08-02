-- Academic calendar: term dates, resumption/closing days, breaks, and
-- holidays. Distinct from exam_timetables, which only covers exam sittings.
create table if not exists academic_calendar (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  session text not null,
  term text,
  title text not null,
  event_type text not null check (event_type in ('Resumption', 'Midterm Break', 'Closing', 'Holiday', 'Other')),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists academic_calendar_school_session_idx on academic_calendar (school_id, session);

alter table academic_calendar enable row level security;
