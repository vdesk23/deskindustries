# Architecture
- Keep the two-step commercial intake contract in `src/lib/lead-intake.ts` and its server-only bridge in `src/lib/consus.server.ts`; separate Lead registration from draft quote creation so partial submissions never create a premature quote.
- Public service catalog responses expose only code, name and category; pricing remains exclusively in CONSUS.
- Keep portfolio recipient-change detection in the shared intake module and enqueue a new recipient-specific message on email correction; never rewrite previously sent messages.
- The header "Accedi" button (signed-out state) links to https://project.deskinc.app (Desk PM app); the on-site /auth route stays for signup and email links only.- Service landings live under `/servizi/<line>` (splitter index) with `/a` long-form (indexed, in the Services menu) and `/b` short-form (noindex, off-menu); line list in `src/lib/landing-lines.ts`, shared `LandingForm` posts to `/api/public/landing-submit` (server-only tables, no public RLS).
- Third-party trackers (Meta Pixel) load only via `src/lib/meta-pixel.ts` after `canTrack("advertising")` from `src/lib/consent.ts`; never send PII to Meta.
