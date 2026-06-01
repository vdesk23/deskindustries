# Pivot Foll.IA → Richieste progetto + email staff

## Obiettivo
Foll.IA non genera/mostra più siti dentro l'app. Il form raccoglie i dati, invia un'email a `master@deskindustries.com` e `web@deskindustries.com` con un prompt pronto da incollare in un nuovo progetto Lovable, e crea una "richiesta" nel database. Il pagamento avviene in un secondo momento dall'area cliente, su un link generato dall'admin. Il cliente vede lo stato della richiesta, il sito online (quando pubblicato) e può aprire ticket.

## Cosa cambia per l'utente

**Cliente (form pubblico Foll.IA → form attuale ma senza preview):**
- Compila il form e riceve email di conferma.
- Vede nella sua dashboard: stato richiesta (`In lavorazione` / `Pronto per pagamento` / `Online`), link al sito pubblicato (quando disponibile), ticket di assistenza, fatture/abbonamento.
- **Niente più** anteprima `/s/...`, niente più editor menu/prodotti/servizi/orari.

**Staff (admin):**
- Riceve email immediata con tutti i dati + prompt pronto.
- In `/admin` vede ogni cliente con: stato richiesta, link sito pubblicato (campo editabile), stato fatturazione (abbonamento Stripe attivo/scaduto), ticket aperti.
- Può: cambiare stato, incollare URL del sito pubblicato, generare link di pagamento per il cliente, rispondere ai ticket.

## Cosa viene rimosso
- Route pubblica `/s/$subdomain` (file `src/routes/s.$subdomain.tsx`) e relativa server function `getPublicFolliaSite`.
- Editor sito lato cliente `src/routes/account.sites.$siteId.tsx` (sostituito da pagina sola-lettura "dettaglio richiesta").
- Editor sito lato admin `src/routes/admin.sites.$siteId.tsx` ridotto a: stato + URL pubblicato + note interne (niente più business_data/config JSON).
- Le tabelle `follia_menu_items`, `follia_products`, `follia_services`, `follia_appointments`, `follia_table_bookings` NON vengono cancellate ora (dati irreversibili) ma non vengono più scritte né lette. Le togliamo in un secondo step quando confermi.

## Cosa viene aggiunto

### Database (migrazione)
Su `follia_sites` aggiungiamo:
- `published_url` (text, nullable) — URL del nuovo progetto Lovable creato dallo staff.
- `internal_notes` (text, nullable) — note interne admin.
- `request_status` enum: `new` | `in_progress` | `awaiting_payment` | `live` | `archived` (sostituisce l'uso confuso di `status` per i 3 stati che servono adesso).
- Indici su `request_status`, `lead_email`.

RLS: invariate (cliente vede solo le sue, admin via `supabaseAdmin`).

### Email allo staff (transactional)
Nuovo template `follia-new-request-staff.tsx` inviato a `master@deskindustries.com` e `web@deskindustries.com` al submit del form, contenente:
- Tutti i campi del form (nome attività, settore, contatti, descrizione, ecc.).
- Un **prompt pronto** generato dal backend tipo:
  > "Crea un sito web per [nome] nel settore [settore]. Identità: [descrizione]. Servizi: [...]. Palette suggerita: [...]. CTA principale: [...]"
- Link diretto alla scheda richiesta in `/admin/sites/$siteId`.

Email di conferma al cliente (template già esistente `follia-preview-ready` viene riadattato in `follia-request-received`).

### Pagamento (flusso "dopo")
- Lo staff dalla scheda admin clicca "Genera link pagamento" → la richiesta passa a `awaiting_payment`.
- Il cliente vede nella sua dashboard un bottone "Procedi al pagamento" che apre Stripe Embedded Checkout (priceId del piano scelto dall'admin: `basic` o `with_setup`).
- Il webhook `payments-webhook` esistente aggiorna `follia_sites.stripe_subscription_id` e porta lo stato a `live` quando lo staff incolla `published_url`.

### Tasti dashboard (fix bug attuale)
- Cliente: un solo bottone contestuale → "Visita sito online" (se `published_url` presente) **oppure** "Procedi al pagamento" (se `awaiting_payment`) **oppure** "In lavorazione" disabilitato.
- Admin: "Apri scheda" + (contestuale) "Genera link pagamento" / "Pubblica URL" / "Archivia".
- "Anteprima" e "Pubblica" come pulsanti separati spariscono.

## Dettaglio tecnico (per l'agent in build mode)

**File modificati**
- `src/routes/follia.tsx` (form): al submit chiama nuova server fn `submitFolliaRequest` che (1) inserisce in `follia_sites` con `request_status='new'`, (2) invia email staff + email conferma cliente, (3) ritorna conferma.
- `src/lib/follia.functions.ts`: nuova `submitFolliaRequest` (sostituisce flusso preview-generation), rimuove generazione `business_data.generated`.
- `src/lib/follia-account.functions.ts`: ritorna solo i campi necessari (status, published_url, plan, subscription).
- `src/lib/follia-admin.functions.ts`: nuove fn `adminUpdateRequest(siteId, {request_status, published_url, internal_notes, plan})`, `adminGeneratePaymentLink(siteId, plan)`.
- `src/routes/account.tsx` + `account.sites.tsx`: lista sola-lettura con bottoni contestuali.
- `src/routes/account.sites.$siteId.tsx`: pagina sola-lettura "Dettaglio richiesta" + checkout Stripe se `awaiting_payment`.
- `src/routes/admin.sites.tsx` + `admin.sites.$siteId.tsx`: form con `request_status`, `published_url`, `internal_notes`, `plan`, bottone "Genera link pagamento".
- Rimossi: `src/routes/s.$subdomain.tsx`, `src/lib/follia-public.functions.ts`.
- Email: nuovo template `follia-new-request-staff.tsx` + `follia-request-received.tsx` registrati in `email-templates/registry.ts`. Invio via `sendTransactionalEmail` (auth con service role da server fn).

**Email infra**: già presente (`email_send_log`, queue pgmq, cron). Aggiungo solo i 2 template.

**Sicurezza/RLS**: nessuna RLS nuova; lo staff scrive sempre via `supabaseAdmin` dentro server fn protette da `has_role(auth.uid(),'admin')`.

## Cosa NON facciamo in questo step
- Non cancelliamo i dati nelle tabelle menu/prodotti/servizi (lo facciamo dopo conferma).
- Non automatizziamo la creazione di un progetto Lovable (Lovable non espone API per crearlo da terzi); lo staff lo crea a mano col prompt ricevuto via email.
- Non tocchiamo il piano Stripe / prezzi esistenti.

Confermi? Una volta approvato passo in build mode e procedo.