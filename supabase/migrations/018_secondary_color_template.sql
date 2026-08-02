-- A second per-school brand color (many Nigerian school crests pair two
-- colors, e.g. green+gold, navy+red) -- nullable, templates fall back to a
-- neutral gold trim when unset so nothing looks broken for existing schools.
alter table schools add column if not exists secondary_color text;

-- Provision for future per-school custom templates. Only one template
-- ("classical") exists today and every school uses it; this column just
-- gives the data model a place to select a different one later without a
-- migration, once a second template is actually built.
alter table schools add column if not exists template text not null default 'classical';
