-- result_pins (006) and report_cards (007) were created without ever
-- enabling Row Level Security, unlike every other table in this schema --
-- an oversight caught by Supabase's linter. Same reasoning as the rest of
-- the schema: all access goes through the service-role key in the Next.js
-- API routes, so this is defense-in-depth, not a behavior change.
alter table result_pins enable row level security;
alter table report_cards enable row level security;
