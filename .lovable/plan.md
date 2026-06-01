# Pannello Admin Follia

## Obiettivo
Permettere all'utenza `master@deskindustries.com` (e altre future utenze staff) di vedere e gestire **tutti** i siti Follia generati dai clienti, anche quelli non ancora reclamati (`user_id IS NULL`).

## 1. Ruolo admin nel database

Aggiungere `'admin'` all'enum `app_role` (se non già presente) e inserire la riga in `user_roles` per il `user_id` di `master@deskindustries.com`.

La funzione `public.has_role(_user_id, _role)` esiste già ed è `SECURITY DEFINER`: la riutilizziamo per i controlli server-side, senza toccare le RLS esistenti dei clienti.

## 2. Server functions admin (`src/lib/follia-admin.functions.ts`)

Tutte protette da `requireSupabaseAuth` + check `has_role(userId, 'admin')`. Usano `supabaseAdmin` (bypassa RLS) per operare su tutti i siti:

- `listAllFolliaSites({ search?, status?, plan?, claimed? })` — elenco completo con `lead_email`, `subdomain`, `status`, `plan`, `user_id`, `created_at`, `has_full_assistance`.
- `getFolliaSiteAdmin({ siteId })` — dettaglio sito + business_data + config + conteggio prenotazioni/ticket.
- `updateFolliaSiteAdmin({ siteId, patch })` — modifica `status` (draft/preview/live), `plan`, `has_full_assistance`, `custom_domain`, `subdomain`, `config`, `business_data`.
- `assignFolliaSiteToUser({ siteId, email })` — collega manualmente un sito a un account (utile per i casi come "Farmacia Leone").
- `deleteFolliaSiteAdmin({ siteId })` — elimina sito + record collegati.
- `listFolliaTicketsAdmin()` / `replyTicketAdmin({ ticketId, body })` — gestione ticket di assistenza da staff (`is_staff: true`).

## 3. UI admin

Nuove route protette da middleware "admin only" (redirect se non admin):

- `/admin` — dashboard con contatori (siti totali, live, in preview, non reclamati, ticket aperti).
- `/admin/sites` — tabella con ricerca/filtri (stato, piano, reclamato/non reclamato), azioni rapide: apri anteprima `/s/:subdomain`, pubblica/depubblica, assegna a utente, elimina.
- `/admin/sites/$siteId` — editor completo del sito (status, plan, config, business_data JSON, subdomain, custom_domain).
- `/admin/tickets` — lista ticket con risposta inline come staff.

Voce "Admin" visibile in header/account solo se l'utente ha ruolo `admin`.

## 4. RLS
**Nessuna modifica alle RLS** delle tabelle Follia: tutto passa per server functions con `supabaseAdmin`, così i clienti continuano a vedere solo i propri siti. Le GRANT esistenti restano invariate.

## Dettagli tecnici

- Check ruolo lato server: `await admin.rpc('has_role', { _user_id: userId, _role: 'admin' })` oppure SELECT diretto su `user_roles`.
- Middleware di route: nel `beforeLoad` di `/admin/*` chiamare una serverFn `requireAdmin()` che lancia redirect a `/account` se non admin.
- Migration: `INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'master@deskindustries.com' ON CONFLICT DO NOTHING;` (eseguita con l'insert tool, non come migration, perché è data).
- Se `'admin'` manca dall'enum `app_role`, migration `ALTER TYPE app_role ADD VALUE 'admin'`.
