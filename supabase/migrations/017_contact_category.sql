-- Lets the public Contact form classify a message as a suggestion,
-- complaint, or general enquiry (not just an open subject line), so admins
-- can see at a glance what kind of message they're dealing with.
alter table contact_messages add column if not exists category text not null default 'General Enquiry'
  check (category in ('General Enquiry', 'Suggestion', 'Complaint', 'Other'));
