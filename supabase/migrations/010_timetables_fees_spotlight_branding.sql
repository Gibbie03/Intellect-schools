-- Weekly class timetable: one row per period, e.g. Monday period 3 = Mathematics.
create table if not exists class_timetables (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class text not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  period_number int not null,
  start_time text,
  end_time text,
  subject text not null,
  teacher_name text,
  created_at timestamptz not null default now(),
  unique (school_id, class, day_of_week, period_number)
);

create index if not exists class_timetables_school_class_idx on class_timetables (school_id, class);

-- Exam timetable: one row per subject's exam sitting for a class/session/term.
create table if not exists exam_timetables (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class text not null,
  session text not null,
  term text not null,
  subject text not null,
  exam_date date not null,
  start_time text,
  end_time text,
  venue text,
  created_at timestamptz not null default now()
);

create index if not exists exam_timetables_school_lookup_idx on exam_timetables (school_id, class, session, term);

-- Fee records: tracked and reminded about manually (a WhatsApp deep link, not
-- an automated send) -- no online payment collection here, matching the
-- earlier decision to leave real payments out of scope for now.
create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id text not null,
  session text not null,
  term text not null,
  description text not null default 'School Fees',
  amount numeric not null check (amount >= 0),
  due_date date,
  status text not null default 'Unpaid' check (status in ('Unpaid', 'Paid')),
  last_reminded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fees_school_student_idx on fees (school_id, student_id);

-- Student/Staff of the Month style homepage spotlight.
create table if not exists spotlights (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  subtitle text,
  photo_url text,
  blurb text,
  period_label text,
  created_at timestamptz not null default now()
);

create index if not exists spotlights_school_id_idx on spotlights (school_id);

-- Homepage "Welcome" message from the proprietor/principal, and a WhatsApp
-- number for the site-wide floating chat button.
alter table schools add column if not exists whatsapp_number text;
alter table schools add column if not exists principal_welcome_message text;
alter table schools add column if not exists principal_photo_url text;

alter table class_timetables enable row level security;
alter table exam_timetables enable row level security;
alter table fees enable row level security;
alter table spotlights enable row level security;
