-- Senior Secondary students are streamed into a department (Science, Arts,
-- Social Science, Commercial) -- Nigerian secondary schools don't have
-- "faculties", that's university terminology, but SSS classes do split into
-- these subject streams starting at SSS 1.
alter table students add column if not exists department text;
