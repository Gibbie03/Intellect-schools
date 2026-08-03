-- Some school groups (e.g. one proprietor running two branches under the
-- same brand) split students and staff across physical campuses. `campuses`
-- on `schools` is a comma-separated list of campus names the admin/staff
-- forms offer as a dropdown; schools that leave it empty (the common case)
-- see no campus field at all, so this is invisible for single-site schools.
alter table schools add column if not exists campuses text;
alter table students add column if not exists campus text;
alter table teachers add column if not exists campus text;
