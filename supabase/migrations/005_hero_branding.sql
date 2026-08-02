-- Run this once in the Supabase SQL Editor to add hero-section branding
-- fields (tagline, hero image) to existing schools.

alter table schools add column if not exists hero_image_url text;
alter table schools add column if not exists tagline text;
