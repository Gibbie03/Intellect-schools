-- Which class a staff member is the class teacher for (e.g. "JSS 2"). Null
-- for subject teachers, non-teaching staff, and anyone not assigned as a
-- class teacher. Used to restrict report-card editing (attendance, conduct,
-- comments) to the one teacher responsible for that class, matching how
-- Nigerian schools split "class teacher" from "subject teacher" duties.
alter table teachers add column if not exists class_teacher_of text;
