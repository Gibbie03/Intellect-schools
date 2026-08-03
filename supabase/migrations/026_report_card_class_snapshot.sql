-- report_cards previously had no record of what class a student was in for
-- that specific term -- only their current class was ever known, which
-- mislabels the Headmaster's/Principal's comment on older terms once a
-- student has since moved from Primary into Secondary. Snapshotting the
-- class at save time (see app/api/report-cards POST) fixes this going
-- forward; existing rows stay null and fall back to the student's current
-- class, same as before this migration.
alter table report_cards add column if not exists class text;
