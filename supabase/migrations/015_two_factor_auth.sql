-- TOTP-based two-factor auth (Google Authenticator/Authy-style) for
-- school_users. Opt-in per account: totp_secret is written when a user
-- starts setup, but totp_enabled only flips to true once they've proven
-- they can generate a valid code with it (see /api/auth/2fa/confirm),
-- so a broken setup never locks someone out.
alter table school_users add column if not exists totp_secret text;
alter table school_users add column if not exists totp_enabled boolean not null default false;
