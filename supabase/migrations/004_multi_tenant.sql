-- Run this once in the Supabase SQL Editor to convert the single-tenant
-- database into a multi-tenant one, migrating all existing data into a
-- single "Intellect Schools" tenant.

create extension if not exists "pgcrypto";

-- 1. Tenant registry and per-school user accounts
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,
  custom_domain text unique,
  id_prefix text not null,
  logo_url text,
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

-- 2. Seed the existing school as the first tenant
insert into schools (name, subdomain, id_prefix)
select 'Intellect Schools', 'intellect', 'ICS'
where not exists (select 1 from schools where subdomain = 'intellect');

-- 3. Add school_id to every existing tenant-scoped table, backfill it to the
--    Intellect Schools tenant, then lock it down as not null + FK.
do $$
declare
  intellect_id uuid;
begin
  select id into intellect_id from schools where subdomain = 'intellect';

  alter table results add column if not exists school_id uuid;
  update results set school_id = intellect_id where school_id is null;
  alter table results alter column school_id set not null;
  alter table results drop constraint if exists results_school_id_fkey;
  alter table results add constraint results_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table admissions add column if not exists school_id uuid;
  update admissions set school_id = intellect_id where school_id is null;
  alter table admissions alter column school_id set not null;
  alter table admissions drop constraint if exists admissions_school_id_fkey;
  alter table admissions add constraint admissions_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table news_events add column if not exists school_id uuid;
  update news_events set school_id = intellect_id where school_id is null;
  alter table news_events alter column school_id set not null;
  alter table news_events drop constraint if exists news_events_school_id_fkey;
  alter table news_events add constraint news_events_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table gallery_images add column if not exists school_id uuid;
  update gallery_images set school_id = intellect_id where school_id is null;
  alter table gallery_images alter column school_id set not null;
  alter table gallery_images drop constraint if exists gallery_images_school_id_fkey;
  alter table gallery_images add constraint gallery_images_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table contact_messages add column if not exists school_id uuid;
  update contact_messages set school_id = intellect_id where school_id is null;
  alter table contact_messages alter column school_id set not null;
  alter table contact_messages drop constraint if exists contact_messages_school_id_fkey;
  alter table contact_messages add constraint contact_messages_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table teachers add column if not exists school_id uuid;
  update teachers set school_id = intellect_id where school_id is null;
  alter table teachers alter column school_id set not null;
  alter table teachers drop constraint if exists teachers_school_id_fkey;
  alter table teachers add constraint teachers_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;

  alter table students add column if not exists school_id uuid;
  update students set school_id = intellect_id where school_id is null;
  alter table students alter column school_id set not null;
  alter table students drop constraint if exists students_school_id_fkey;
  alter table students add constraint students_school_id_fkey foreign key (school_id) references schools(id) on delete cascade;
end $$;

-- 4. Move student_id / staff_id uniqueness from global to per-school
alter table students drop constraint if exists students_student_id_key;
alter table students add constraint students_school_id_student_id_key unique (school_id, student_id);

alter table teachers drop constraint if exists teachers_staff_id_key;
alter table teachers add constraint teachers_school_id_staff_id_key unique (school_id, staff_id);

-- 5. Indexes
create index if not exists results_school_id_idx on results (school_id);
create index if not exists admissions_school_id_idx on admissions (school_id);
create index if not exists news_events_school_id_idx on news_events (school_id);
create index if not exists gallery_images_school_id_idx on gallery_images (school_id);
create index if not exists contact_messages_school_id_idx on contact_messages (school_id);
create index if not exists teachers_school_id_idx on teachers (school_id);
create index if not exists students_school_id_idx on students (school_id);

alter table schools enable row level security;
alter table school_users enable row level security;
