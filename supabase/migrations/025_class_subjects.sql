-- Each class studies a different set of subjects (a Primary 1 pupil
-- doesn't sit Economics; SSS students in different departments study
-- different combinations) -- this replaces the single fixed global subject
-- list with a per-school, per-class configurable one. Classes with no rows
-- here yet fall back to the app's built-in default subject list, so this is
-- invisible until a school (or its headmaster/principal) actually sets it up.
create table if not exists class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  class text not null,
  subject text not null,
  created_at timestamptz not null default now(),
  unique (school_id, class, subject)
);

create index if not exists class_subjects_school_class_idx on class_subjects (school_id, class);

alter table class_subjects enable row level security;
