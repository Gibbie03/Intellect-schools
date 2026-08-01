-- Run this once in the Supabase SQL Editor to support auto-issuing a
-- Student ID (and creating the student profile) when an admission is
-- marked Accepted.

alter table admissions add column if not exists student_id text;
