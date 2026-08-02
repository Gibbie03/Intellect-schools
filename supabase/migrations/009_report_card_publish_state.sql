-- Report cards start as a Draft the class teacher compiles (attendance,
-- conduct, comments); the student portal only shows a term's results once
-- the class teacher explicitly publishes it. Subject-level results stay
-- auto-approved and visible to staff as soon as a teacher uploads them --
-- this is a separate, later gate scoped to one class teacher's own class,
-- not a return to school-wide manual approval.
alter table report_cards add column if not exists status text not null default 'Draft' check (status in ('Draft', 'Published'));
alter table report_cards add column if not exists published_at timestamptz;
