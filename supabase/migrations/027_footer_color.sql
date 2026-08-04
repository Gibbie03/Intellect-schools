-- Lets a school override the footer bar's color (it defaults to the
-- platform's standard dark green, same as before this migration, when left
-- unset).
alter table schools add column if not exists footer_color text;
