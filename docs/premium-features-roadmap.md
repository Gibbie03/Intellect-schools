# Premium / Add-on Features Roadmap

SchoolOS ships a broad "Standard" feature set to every school. This is a
running list of larger features that are better suited to a paid add-on or a
higher plan tier than the default — either because they carry ongoing cost
(a payment gateway, SMS credits), require third-party integration work per
school, or are a large enough build to price separately.

None of these are built yet. This is a roadmap, not a changelog.

## Gating mechanism (already in the schema, unused so far)

The `schools` table already carries `plan` (text, e.g. `'Standard'`) and
`features` (a `jsonb` map of feature-flag booleans, e.g.
`{"online_payments": true}`) columns, added early on but never wired into
any actual gating logic. Whichever of the features below gets built first
should read its flag from `school.features['<flag_name>']` (or gate on
`school.plan`) rather than inventing a new mechanism — the platform owner
can then flip a feature on for a specific school from `/platform` once that
UI is added.

## Candidates

1. **Online fee payment** (Paystack or Flutterwave). Fee records already
   exist (`fees` table, admin CRUD, WhatsApp reminder links) — this would
   add a "Pay Now" link/button that opens a hosted checkout and marks the
   fee `Paid` on a successful webhook callback. Requires each school to
   have (or be walked through creating) their own payment gateway account,
   since funds should settle to the school, not to SchoolOS.

2. **Bulk SMS fallback**. WhatsApp deep links (fee reminders, parent
   messages) require the parent to have WhatsApp and the admin to click
   each link manually. A paid SMS provider (e.g. Termii, a Nigeria-focused
   aggregator) would allow one real bulk send instead of N manual clicks,
   for schools willing to pay per-SMS costs.

3. **Multi-child parent portal login**. Today a parent with two children
   looks each one up separately via student ID (+ scratch-card PIN or
   session login). A proper parent account (password-based, linked to
   multiple `students` rows) would show all their children in one place.

4. **Staff attendance / payroll**. The new `attendance` table only covers
   students. A parallel staff clock-in/out log and a basic payslip
   generator would be a separate, sizeable feature.

5. **Library / transport / inventory modules**. Book lending, bus-route
   tracking, and asset/inventory management are each their own domain —
   only worth building if a specific school asks and is willing to pay for
   the extra scope.

6. **Native mobile app / push notifications**. The current approach
   (WhatsApp links, a browser-based site) deliberately avoids the cost of
   an app store presence. A real push-notification channel (e.g. a PWA
   with web push, or a native app) would remove the "parent has to click a
   WhatsApp link" friction but is a meaningfully larger build.

## Explicitly out of scope for SchoolOS itself

- **Real @school.com email hosting** — schools set this up independently
  via Google Workspace or Zoho Mail on their SchoolOS-provided custom
  domain; not something to build or host here.
