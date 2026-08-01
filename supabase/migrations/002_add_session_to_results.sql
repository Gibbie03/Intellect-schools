-- Run this once in the Supabase SQL Editor to add Session/Term support
-- to an existing database that was created from the original schema.sql.

alter table results add column if not exists session text;

update results
set
  session = coalesce(nullif(trim(substring(term from '\d{4}/\d{4}')), ''), '2025/2026'),
  term = trim(regexp_replace(term, '\s*\d{4}/\d{4}\s*$', ''))
where session is null;

alter table results alter column session set not null;
alter table results alter column session set default '2025/2026';

alter table results drop constraint if exists results_term_check;
alter table results add constraint results_term_check check (term in ('First Term', 'Second Term', 'Third Term'));
