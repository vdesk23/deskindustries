
# Sistema di ticketing per la dashboard cliente Foll.IA

## 1. Esperienza utente

Nella pagina `/account/sites/$siteId` un **pulsante flottante "Richiedi assistenza"** in basso a destra. Click → dropdown con 4 categorie:

- **Dominio**
- **Colori e logo**
- **Scritte e titoli**
- **Altro**

Dopo la scelta si apre una modale con:
- **Oggetto** precompilato e disabilitato: `"<Categoria> — <Nome sito>"`
- **Descrizione** (textarea, 10–4000 caratteri)
- **Allegati opzionali**: fino a **5 file**, max **10MB**, tipi: `image/*`, `pdf`, `doc/docx`. Upload in nuovo bucket privato `follia-ticket-attachments`.
- Riquadro informativo:
  - `has_full_assistance = true` → "Incluso nel tuo piano. Nessun costo."
  - altrimenti → "Apertura ticket €50 + IVA. Riceverai un link di pagamento; il ticket verrà preso in carico al pagamento."
- Pulsante **Invia richiesta**.

## 2. Flusso server

Nuova server fn `createFolliaTicketV2` in `src/lib/follia-account.functions.ts`:

1. Valida con Zod (categoria enum, descrizione, lista allegati già caricati).
2. Verifica ownership del sito.
3. Calcola `requires_payment` da `follia_sites.has_full_assistance`.
4. Inserisce `follia_tickets` con:
   - subject costruito server-side,
   - `status = 'open'` se assistenza inclusa, `'awaiting_payment'` altrimenti,
   - `amount_cents = 5000` (IVA gestita da Stripe Tax),
   - `attachments` jsonb.
5. Inserisce primo messaggio in `follia_ticket_messages`.
6. **Assistenza inclusa** → invia subito email staff + conferma cliente.
7. **A pagamento** → crea Stripe Checkout embedded one-time (lookup `follia_ticket_50`, `metadata.ticket_id`), ritorna `clientSecret`. Le email staff partono solo dopo `checkout.session.completed` via webhook esistente.

**Rate limit**: 10 ticket/24h **solo per chi ha l'assistenza inclusa**. Chi paga ogni volta non ha limiti (il pagamento stesso è il freno naturale).

## 3. Email

Due nuovi template in `src/lib/email-templates/`:

- **`follia-ticket-staff.tsx`** → destinatari `master@deskindustries.com` e `web@deskindustries.com`. **Reply-To = email del cliente** (le risposte da Gmail/Outlook vanno dirette al cliente). Contiene: categoria, sito (nome + subdomain + link admin diretto), cliente, descrizione, link allegati (signed URL 7gg), badge "Pagato"/"Incluso nel piano".
- **`follia-ticket-customer-confirmation.tsx`** → due varianti via `templateData`: conferma semplice oppure "completa il pagamento" con bottone al checkout.

Invio via infrastruttura email Lovable già attiva (queue `transactional_emails`). Due send separati per i due indirizzi staff con `idempotencyKey` distinto.

## 4. Pagamento

- Nuovo prodotto Stripe via tool `payments--create_product`: `follia_ticket_assistance`, prezzo lookup **`follia_ticket_50`**, one-time **€50.00 EUR**, `tax_code: txcd_20030000` (servizio).
- `automatic_tax: { enabled: true }` in checkout session → cliente vede €61,00.
- Estensione di `supabase/functions/payments-webhook/index.ts`: gestione `checkout.session.completed` con `metadata.ticket_id` → aggiorna `follia_tickets.status='open'`, `paid_at=now()`, e accoda le email staff.
- Pagina `/account/tickets/$ticketId/pay` con `StripeEmbeddedCheckout`.

## 5. Schema DB (migration)

```text
ALTER TYPE follia_ticket_status ADD VALUE 'awaiting_payment';
ALTER TYPE follia_ticket_category
  ADD VALUE 'domain', 'branding', 'copy';
  (manteniamo 'general' come fallback per 'other')

ALTER TABLE follia_tickets ADD:
  + requires_payment boolean default false
  + amount_cents int
  + paid_at timestamptz
  + stripe_session_id text
  + attachments jsonb default '[]'
  + customer_email text  (snapshot, per Reply-To anche se il profilo cambia)

CREATE bucket follia-ticket-attachments (private)
  + policy: insert/select solo owner sul path {user_id}/...
  + service_role full
```

## 6. File toccati

- `supabase/migrations/...` — schema + bucket + policies
- `src/lib/follia-account.functions.ts` — `createFolliaTicketV2`, helper signed URL
- `src/lib/email-templates/follia-ticket-staff.tsx` (nuovo)
- `src/lib/email-templates/follia-ticket-customer-confirmation.tsx` (nuovo)
- `src/lib/email-templates/registry.ts` — registrazione
- `src/components/follia/AssistanceFab.tsx` (nuovo)
- `src/routes/account.sites.$siteId.tsx` — montaggio FAB
- `src/routes/account.tickets.$ticketId.pay.tsx` (nuovo)
- `supabase/functions/payments-webhook/index.ts` — gestione `metadata.ticket_id`

## 7. Ordine di esecuzione

1. Migration DB + bucket
2. Creazione prodotto Stripe `follia_ticket_assistance`
3. Template email + registry
4. Server function `createFolliaTicketV2` + helper allegati
5. Componente `AssistanceFab` + modale + integrazione su pagina sito
6. Pagina checkout pagamento ticket
7. Estensione webhook payments per `ticket_id` → invio email staff post-pagamento

## Modifiche accolte

Tutte le proposte tranne il rate limit per chi paga (rimosso come da tua indicazione). Reply-To cliente, stato `awaiting_payment` esplicito, link admin nelle mail staff, allegati con signed URL 7gg, idempotency anti-doppio-click, categoria "dominio" sempre soggetta a pagamento se il piano non include assistenza.
