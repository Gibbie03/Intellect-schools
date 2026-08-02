-- Audit trail for sensitive/destructive actions -- who did what, to which
-- record, and what changed. actor fields are denormalized (not just a
-- school_users FK) so the log still reads correctly after the actor
-- account itself is later deleted or reassigned.
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  actor_user_id uuid,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_school_created_idx on audit_log (school_id, created_at desc);
create index if not exists audit_log_school_entity_idx on audit_log (school_id, entity_type, entity_id);

alter table audit_log enable row level security;
