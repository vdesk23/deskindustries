# Architecture
- Keep the two-step commercial intake contract in `src/lib/lead-intake.ts` and its server-only bridge in `src/lib/consus.server.ts`; separate Lead registration from draft quote creation so partial submissions never create a premature quote.
- Public service catalog responses expose only code, name and category; pricing remains exclusively in CONSUS.