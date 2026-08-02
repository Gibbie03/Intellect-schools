-- A short school motto shown in the site header, alongside the school name --
-- distinct from `tagline` (the longer marketing headline on the homepage).
alter table schools add column if not exists motto text;
