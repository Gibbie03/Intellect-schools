-- Nigerian schools spanning Nursery/Primary through Secondary often have a
-- separate head for each section (a "Primary Coordinator" and a
-- "Principal"), each with authority over only their own section's students,
-- staff, and results -- distinct from the single school-wide 'admin' role.
alter table school_users drop constraint if exists school_users_role_check;
alter table school_users add constraint school_users_role_check
  check (role in ('admin', 'primary_admin', 'secondary_admin', 'teacher'));
