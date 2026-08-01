-- Intellect Schools database schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  subject text not null,
  score int not null check (score >= 0 and score <= 100),
  grade text not null,
  term text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index if not exists results_student_id_idx on results (student_id);
create index if not exists results_status_idx on results (status);

create table if not exists admissions (
  id uuid primary key default gen_random_uuid(),
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
  created_at timestamptz not null default now()
);

create table if not exists news_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  event_date date,
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  staff_id text not null unique,
  full_name text not null,
  role text not null default 'Teacher' check (role in ('Teacher', 'Head Teacher', 'Admin', 'Bursar', 'Non-Teaching Staff')),
  subject text,
  email text,
  phone text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  full_name text not null,
  class text not null,
  gender text,
  date_of_birth date,
  parent_name text,
  parent_email text,
  parent_phone text,
  address text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now()
);

create index if not exists students_student_id_idx on students (student_id);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Read')),
  created_at timestamptz not null default now()
);

-- Row Level Security: all access from this app goes through Next.js API
-- routes using the service role key (which bypasses RLS), so no client-side
-- policies are required. RLS is enabled anyway as defense-in-depth in case
-- the anon key is ever used directly.
alter table results enable row level security;
alter table admissions enable row level security;
alter table news_events enable row level security;
alter table gallery_images enable row level security;
alter table contact_messages enable row level security;
alter table teachers enable row level security;
alter table students enable row level security;
