-- Scratch-card style result checker PINs. Each row is one card: a
-- school-visible serial number paired with a bcrypt-hashed PIN (never
-- stored in plaintext -- the plaintext is only ever returned once, in the
-- API response at generation time, for the admin to print/export).
--
-- A PIN can be used up to max_uses times (uses_count increments on every
-- successful result check) before it stops working, matching the
-- WAEC/NECO/JAMB scratch-card convention parents already expect.

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

create index if not exists result_pins_school_id_idx on result_pins(school_id);
create index if not exists result_pins_batch_label_idx on result_pins(school_id, batch_label);
