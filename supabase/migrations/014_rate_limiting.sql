-- Fixed-window rate limiting, backed by Postgres rather than a new service
-- (Redis/Upstash) -- one row per (key, window), incremented atomically by
-- increment_rate_limit() so concurrent requests can't race past the limit.
-- Keys look like "login:203.0.113.5" or "portal-check:203.0.113.5".
create table if not exists rate_limit_hits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 1,
  primary key (key, window_start)
);

create index if not exists rate_limit_hits_window_idx on rate_limit_hits (window_start);

create or replace function increment_rate_limit(p_key text, p_window_start timestamptz)
returns int
language sql
as $$
  insert into rate_limit_hits (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start)
  do update set count = rate_limit_hits.count + 1
  returning count;
$$;

alter table rate_limit_hits enable row level security;
