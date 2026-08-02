-- Intellect Schools platform database schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,
  custom_domain text unique,
  id_prefix text not null,
  logo_url text,
  hero_image_url text,
  tagline text,
  primary_color text,
  contact_email text,
  contact_phone text,
  address text,
  status text not null default 'Active' check (status in ('Active', 'Suspended')),
  plan text not null default 'Standard',
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists school_users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  email text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'teacher')),
  full_name text not null,
  teacher_id uuid references teachers(id) on delete set null,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  unique (school_id, email)
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id text not null,
  subject text not null,
  score int not null check (score >= 0 and score <= 100),
  ca_score numeric,
  exam_score numeric,
  grade text not null,
  session text not null,
  term text not null check (term in ('First Term', 'Second Term', 'Third Term')),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index if not exists results_school_id_idx on results (school_id);
create index if not exists results_student_id_idx on results (student_id);
create index if not exists results_status_idx on results (status);

-- One row per student per session/term: the whole-term parts of a report
-- card (attendance, conduct, teacher's/principal's comments) that don't
-- belong to any single subject. Joined with `results` to render a full
-- report card.
create table if not exists report_cards (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id text not null,
  session text not null,
  term text not null,
  days_school_opened int,
  days_present int,
  times_punctual int,
  conduct_rating text check (conduct_rating in ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor')),
  teacher_comment text,
  principal_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, student_id, session, term)
);

create index if not exists report_cards_school_id_idx on report_cards (school_id);
create index if not exists report_cards_lookup_idx on report_cards (school_id, student_id, session, term);

create table if not exists admissions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_name text not null,
  date_of_birth date,
  gender text,
  class_applying_for text not null,
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,
  address text,
  notes text,
  status text not null default 'Pending' check (status in ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
  student_id text,
  created_at timestamptz not null default now()
);

create index if not exists admissions_school_id_idx on admissions (school_id);

create table if not exists news_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  title text not null,
  content text not null,
  event_date date,
  created_at timestamptz not null default now()
);

create index if not exists news_events_school_id_idx on news_events (school_id);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_school_id_idx on gallery_images (school_id);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  staff_id text not null,
  full_name text not null,
  role text not null default 'Teacher' check (role in ('Teacher', 'Head Teacher', 'Admin', 'Bursar', 'Non-Teaching Staff')),
  subject text,
  email text,
  phone text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  class_teacher_of text,
  created_at timestamptz not null default now(),
  unique (school_id, staff_id)
);

create index if not exists teachers_school_id_idx on teachers (school_id);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id text not null,
  full_name text not null,
  class text not null,
  gender text,
  date_of_birth date,
  parent_name text,
  parent_email text,
  parent_phone text,
  address text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  unique (school_id, student_id)
);

create index if not exists students_school_id_idx on students (school_id);
create index if not exists students_student_id_idx on students (student_id);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Read')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_school_id_idx on contact_messages (school_id);

-- Scratch-card style result checker PINs (see migrations/006_result_pins.sql
-- for the full explanation). Each row is one card: a school-visible serial
-- paired with a bcrypt-hashed PIN, usable up to max_uses times.
create table if not exists result_pins (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  batch_label text not null,
  serial text not null,
  pin_hash text not null,
  session text not null,
  term text,
  delivery_method text not null default 'print' check (delivery_method in ('print', 'digital')),
  max_uses int not null default 3,
  uses_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (school_id, serial)
);

create index if not exists result_pins_school_id_idx on result_pins (school_id);
create index if not exists result_pins_batch_label_idx on result_pins (school_id, batch_label);

-- Row Level Security: all access from this app goes through Next.js API
-- routes using the service role key (which bypasses RLS), so no client-side
-- policies are required. RLS is enabled anyway as defense-in-depth in case
-- the anon key is ever used directly.
alter table schools enable row level security;
alter table school_users enable row level security;
alter table results enable row level security;
alter table admissions enable row level security;
alter table news_events enable row level security;
alter table gallery_images enable row level security;
alter table contact_messages enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
alter table result_pins enable row level security;
alter table report_cards enable row level security;
