-- Enriches results with an optional CA/Exam breakdown (score stays the
-- source of truth total; ca_score/exam_score are populated when a teacher
-- provides the breakdown, and are left null for older rows or entries that
-- only ever had a single combined score).
alter table results add column if not exists ca_score numeric;
alter table results add column if not exists exam_score numeric;

-- One row per student per session/term: the parts of a report card that
-- belong to the whole term rather than to a single subject -- attendance,
-- conduct, and the class teacher's / principal's comments. Joined with
-- `results` (filtered to that student/session/term) to render a full
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

create index if not exists report_cards_school_id_idx on report_cards(school_id);
create index if not exists report_cards_lookup_idx on report_cards(school_id, student_id, session, term);
