# Manual test checklist — audit fixes (Aug 2026)

This covers the fixes from the security/reliability audit in this PR. The
sandbox this was built in can't reach the live Supabase project, so none of
this has been run against real data yet — run it against the deployed
preview before merging to `main`.

You'll need at least: one `admin` account, one `primary_admin`
(Headmaster) or `secondary_admin` (Principal) account, and one `teacher`
account assigned as class teacher for a specific class. Two students in
different classes helps for the scoping checks.

## Critical — teacher can only see their own class

- [ ] Log in as `teacher` (assigned class teacher of e.g. JSS1).
- [ ] Students tab → confirm the roster shows only JSS1 students, not the
      whole school.
- [ ] Results tab → confirm only JSS1 students' results are listed.
- [ ] Fees tab (if visible to teachers) → confirm only JSS1 fee records show.
- [ ] Try downloading academic history for a student in a *different* class
      (e.g. by guessing/editing a URL) → should 404, not return the record.
- [ ] Log in as `admin` (or `primary_admin`/`secondary_admin`) and confirm
      they still see all classes / their whole section as before.

## High — 2FA works for Headmaster/Principal accounts

- [ ] Log in as `primary_admin` or `secondary_admin`.
- [ ] Security tab → Set Up 2FA → scan the QR code, enter the 6-digit code
      → confirm it activates (previously this 404'd/401'd).
- [ ] Log out, log back in → confirm the 2FA code prompt appears.
- [ ] Enter the correct code → confirm login succeeds.
- [ ] Security tab → Disable 2FA → enter password → confirm it disables.

## High — no script execution in printed report cards

- [ ] As a teacher/admin, set a report card's teacher comment to:
      `<script>alert(1)</script>` and the conduct rating field (if free
      text) or a subject name to `<img src=x onerror=alert(2)>`.
- [ ] Save, then print the report card (admin side) → confirm the text
      shows literally on the printed page (e.g. `<script>alert(1)...`) and
      no alert box pops up.
- [ ] Repeat via the student portal's "Print Report Card" and "Download
      Full Academic History" buttons → same check, no alert box.
- [ ] Admin → Students → Download Full Academic History for that student →
      same check.
- [ ] Result-checker cards (Result PINs tab) → generate a batch with a
      batch label containing `<script>` → print → confirm no alert box.

## Medium — image uploads reject non-raster files

- [ ] Try uploading a `.svg` file as a staff photo, gallery image, school
      logo, or hero image → should be rejected with "Only JPEG, PNG, WEBP,
      or GIF images are allowed."
- [ ] Try a normal `.jpg`/`.png`/`.webp`/`.gif` in each of those same spots
      → should upload successfully as before.

## Low — misc

- [ ] Fees tab → click a fee's status toggle (Paid/Unpaid) twice in quick
      succession → confirm it doesn't double-fire (button should disable
      briefly while updating).
- [ ] Fees tab → click "WhatsApp" reminder twice in quick succession on the
      same row → same check.

## Reliability — stale dropdown switches don't show wrong data

Best tested with the browser's network tab set to "Slow 3G" throttling so
the race window is wide enough to hit reliably.

- [ ] Subjects, Fees, Accounting, Messages, Calendar, Attendance, and
      Timetable tabs (admin) → rapidly switch the class/session/term/date
      selector back and forth several times → confirm the data shown
      settles on whatever the *currently selected* value is, never a
      leftover from a value you switched away from.
- [ ] Audit Log tab → rapidly click through pages / switch the entity-type
      filter → same check.
- [ ] Teacher dashboard → Upload Results (batch) and Upload from Photo
      panels → rapidly switch the class dropdown → confirm the subject
      list shown matches the currently selected class.

## Spot check — no raw error details leak to the browser

- [ ] Deliberately trigger a server error (e.g. submit a form, then kill
      your network connection right as the request is in flight, or watch
      for any 500 during normal use) → confirm the UI shows a generic
      "Something went wrong. Please try again." message, not a raw
      Postgres/Supabase error string.
- [ ] If you have access to the Vercel function logs, confirm the *real*
      error still appears there (it should — only the client-facing
      message changed).
