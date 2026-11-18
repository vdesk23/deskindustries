# Contact correction review

Rule: visitors can correct their name, email and phone while completing a request; later saving and newly generated messages use the corrected contacts. Already sent messages and completed requests are not rewritten.

## Places inspected
- Homepage / `LeadForm`: sole use is `HomePage`. Step 2 previously lacked a back button. Fixed in the previous commit. Steps 2–5 now return through earlier steps; state is retained. Reload restores saved contacts and step 2, from which contacts are reachable. Browser-tested desktop and mobile with a simulated registration response.
- Registration validation / `lead-intake`: accepts corrections with a continuation; tested corrected name, email and phone.
- `/api/public/lead-submit`, register: verifies the continuation, updates the existing lead and passes its ID and corrected contacts to CONSUS. Existing portfolio branch skipped corrected recipients. Fixed to queue a new portfolio when the email changes, with a recipient-specific idempotency key. Unchanged email does not generate another portfolio. Route tested with simulated storage, email queue and CONSUS, including CONSUS failure.
- `/api/public/lead-submit`, quote: reads name/email/phone from the saved lead rather than stale browser contacts. Quote payload, staff email and customer confirmation use these values. Follows the rule by code inspection.
- `/api/public/lead-submit`, legacy contact submission: receives editable contacts only at final submission. Staff notification, customer confirmation and legacy CONSUS push use that payload. Follows the rule by code inspection.
- `consus.server`: registration transmits the supplied contacts and stable lead ID; quote transmits the current saved contacts. Remote update behavior cannot be verified from this repository.
- `/contatti` (draft): contacts are on the last step, remain editable until submission and after errors; back controls retain component state. Follows the rule by code inspection.
- `/follia` (draft) and `createFolliaDraft`: all contacts remain on the editable final form; failed submissions keep the form. Generated records and notifications use submitted values. Successful requests remain unchanged. Follows the rule by code inspection.
- `/tools/piano-contenuti` (draft) and `/api/public/content-plan-submit`: first accordion remains reopenable; local draft restores editable contacts; final payload and confirmation use entered contacts. Follows the rule by code inspection.
- `/auth`: signup and login email fields stay editable, including after failures. No multistep contact lock. Existing account/settings behavior was not changed.
- `/account/sites/$siteId` and `updateMyFolliaSite`: contact email and phone remain editable and save into site config. This is the site's contact data, not the account email or historical billing/ticket recipient. Follows the rule by code inspection; signed-in flow was not run.
- `/admin/sites` and `/admin/sites/$siteId`: display stored site lead/config contacts; no partial contact wizard. Historical data was not changed.
- Ticket creation in `follia-account.functions`: no separate contact entry step; reads authenticated profile contacts for new ticket notifications. Existing tickets/paid items remain untouched.
- `lead-portfolio`, `lead-request-admin`, `lead-request-confirmation` templates: render supplied current contact data; recipient is chosen by submission handler. Follows the rule by code inspection.
- Email background processor `/lovable/email/queue/process`: sends the queued recipient snapshot, skips sent duplicates, never silently retargets an already-created message. Existing messages remain unchanged.
- Database definitions: `lead_requests` stores editable contact fields; its only contact-update trigger updates the timestamp. Email RPCs `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq` pass queue payloads through without substituting contacts. Cron delegates to the queue processor. Inspected migration definitions, not live function definitions/settings.

## Verification and limits
- 15 Vitest tests passed across intake and correction route tests.
- Preview build reports OK.
- Browser verified back navigation, correction payload with existing continuation, selected category retention, corrected contacts after reload, desktop/mobile display, and no page errors.
- Browser submission response and route dependencies were simulated: real CONSUS registration/update, database persistence and actual email delivery remain unverified.
- No historical sent/paid/refunded/closed records, permissions, settings or sample data changed.
- Publication is still required.