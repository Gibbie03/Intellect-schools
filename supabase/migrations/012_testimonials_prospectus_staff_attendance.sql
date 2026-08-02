-- Homepage testimonials from parents/alumni.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  author_name text not null,
  author_role text,
  quote text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_school_id_idx on testimonials (school_id);

-- Downloadable admissions prospectus, set as a plain URL like hero_image_url.
alter table schools add column if not exists prospectus_url text;

-- Public "Meet the Teachers" staff directory fields.
alter table teachers add column if not exists photo_url text;
alter table teachers add column if not exists bio text;
alter table teachers add column if not exists show_on_site boolean not null default true;

-- Daily attendance register, one row per student per day.
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  student_id text not null,
  class text not null,
  session text not null,
  term text not null,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late')),
  created_at timestamptz not null default now(),
  unique (school_id, student_id, date)
);

create index if not exists attendance_school_class_date_idx on attendance (school_id, class, date);
create index if not exists attendance_school_student_term_idx on attendance (school_id, student_id, session, term);

alter table testimonials enable row level security;
alter table attendance enable row level security;
