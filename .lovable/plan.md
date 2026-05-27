## Obiettivo

Portare il configuratore Foll.IA dentro Desk Industries con:

1. Landing pubblica con form di generazione gratuita (lead magnet)
2. Area membri con preview, richiesta modifiche, checkout, pubblicazione
3. Sito cliente servito su sottodominio (`nomecliente.tuodominio.it`)
4. Dashboard cliente con edit limitati per tipo attività + ticket assistenza

## Consiglio sull'integrazione codice

**Copia e integra qui** (opzione 1). Motivi:

- Stesso stack (TanStack Start, Supabase, Stripe gateway)
- Un solo login, un solo backend, una sola fatturazione, una sola dashboard
- L'altro progetto Foll.IA resta come "archivio" / staging
- Evita di mantenere SSO + due deploy

Tieni separato (iframe/SSO) ha senso solo se vuoi continuare a sviluppare Foll.IA come prodotto a sé — non sembra il caso.

## Architettura (alto livello)

```text
[Landing pubblica /follia] ── form ──► generazione AI ──► record "site" status=draft
                                                              │
                          (registrazione obbligatoria per vedere preview)
                                                              │
                              [/account/sites/:id] preview + 2 CTA
                              ├─ Paga 19€/mese        → status=live, pubblica subito
                              └─ Paga 297€ + 19€/mese → status=in_review, può aprire ticket modifiche
                                                              │
                                          [render sito] su nomecliente.tuodominio.it
                                                              │
                                  [/account/sites/:id/dashboard] edit limitati per tipo
```

## Database (nuove tabelle)

- `follia_sites`: `user_id`, `subdomain` (unique), `custom_domain`, `business_type` (enum: restaurant, retail_shop, barbershop_salon, professional, other), `business_data` (jsonb: nome, descrizione, hero, colors, fonts, immagini), `config` (jsonb: show_map, opening_hours, address, phone), `status` (draft/awaiting_payment/in_review/live/suspended), `plan` (basic_19/with_setup_297), `lead_email`, `claimed_at`
- `follia_menu_items` (solo restaurant): `site_id`, `category`, `name`, `description`, `price`, `position`, `available`
- `follia_table_bookings` (solo restaurant): `site_id`, `customer_name`, `email`, `phone`, `party_size`, `slot_at`, `status`
- `follia_products` (retail vetrina): `site_id`, `name`, `description`, `price_display`, `image_url`, `in_stock`, `position`
- `follia_tickets`: `site_id`, `user_id`, `subject`, `body`, `status` (open/in_progress/resolved), `priority`
- `follia_ticket_messages`: `ticket_id`, `author_id`, `body`, `is_staff`
- `follia_custom_domain_requests`: `site_id`, `requested_domain`, `status`, `stripe_session_id`

Tutte con RLS scoped a `user_id` + `service_role` per gli admin. Pubblico legge solo `follia_sites` con `status='live'` filtrato per subdomain.

## Logica sottodomini

- Comprato 1 dominio root (es. `siti.deskindustries.com`)
- Wildcard DNS `*.siti.deskindustries.com` → app
- Route catch-all che legge `host`, estrae il subdomain, carica `follia_sites` corrispondente e renderizza il sito pubblico
- Validazione subdomain in fase di form: regex `^[a-z0-9-]{3,40}$`, unique, blacklist parole riservate (www, api, account, admin, …)
- Custom domain: form di richiesta → checkout Stripe (one-time setup + canone) → istruzioni CNAME via email + tabella `follia_custom_domain_requests` gestita a mano

## Flusso prezzi (Stripe)

- `follia_monthly_19` – ricorrente 19€/mese (incluso nei due path)
- `follia_setup_fee_297` – one-time 297€ (solo path "con modifiche")
- Path A (subito live): checkout con solo `follia_monthly_19`
- Path B (con modifiche): checkout con `follia_setup_fee_297` + subscription `follia_monthly_19` nella stessa sessione → al pagamento status=in_review e si abilita il pannello ticket "richiesta modifiche"
- Tutto via il gateway Stripe già attivo nel progetto

## Form di generazione (landing pubblica)

- Stesso flusso dell'attuale Foll.IA + 1 step nuovo all'inizio: **"Che tipo di attività hai?"** (restaurant / retail_shop / barbershop_salon / professional / other)
- Step finali: scelta subdomain + email
- Submit → server fn `createDraftSite` (anonimo) → AI Gateway genera contenuti/struttura → record `follia_sites` status=draft con `lead_email`
- Email automatica con magic link "Vedi la tua preview" che porta a `/auth?redirect=/account/sites/:id` (richiede registrazione)
- Al primo login: se `lead_email` combacia, lega il sito a `user_id` (claim)

## Dashboard cliente (`/account/sites/:id/dashboard`)

Sezioni sempre presenti:

- **Generale**: orari di apertura (lun-dom, multi-fasce), toggle "Mostra Google Maps", indirizzo, telefono
- **Ticket assistenza**: lista + nuovo ticket (rate-limit 5/mese)
- **Modifiche manuali**: visibile solo se `plan=with_setup_297` e `status=in_review` — apre ticket categoria "edit"

Sezioni condizionali per `business_type`:

- `restaurant`: Gestore menù (CRUD piatti/prezzi/categorie) + Prenotazioni tavoli (lista + conferma/rifiuto)
- `retail_shop`: Gestore prodotti vetrina (CRUD nome/descrizione/prezzo/foto/disponibilità, senza carrello)
- `barbershop_salon`: listino servizi + (opz.) prenotazione appuntamenti (stessa logica tavoli)
- `professional`: solo Generale + ticket
- `other`: solo Generale + ticket

Tutto via `createServerFn` + `requireSupabaseAuth` con RLS.

## Render del sito pubblico

- Route catch-all (es. `src/routes/_subdomain.tsx` + middleware su host)
- Template React parametrico che legge `business_data` + `config` + dataset specifico (menu/prodotti) e applica un design system unico ("base di design peculiare di tutti i siti")
- Google Maps via il connettore Google Maps Platform già documentato (sì/no in base a `config.show_map`)
- SEO per ogni sito: title/description da `business_data`, JSON-LD LocalBusiness, og:image generata

## Email transazionali (riusa infra esistente)

- `follia-preview-ready` → al lead dopo generazione
- `follia-payment-confirmed` (path A e B, varianti)
- `follia-edits-completed` → quando ticket "edit" passa a resolved
- `follia-new-ticket-admin` → a `master@deskindustries.com`

## Step di consegna

1. Migration DB (tutte le tabelle + RLS + grants + storage bucket `follia-assets`)
2. Copia/adatta dal progetto Foll.IA: `ConfiguratorForm`, `steps/`, `lib/stripe-server.ts`, `routes/api/create-checkout.ts`, `StripeEmbeddedCheckout` (gran parte già allineata con Desk)
3. Nuova landing `/follia` con form + step "tipo attività"
4. Server fn AI per generazione contenuti (`google/gemini-2.5-flash`) → record draft
5. Magic-link claim + pagina `/account/sites` (lista) e `/account/sites/:id` (preview + CTA)
6. Prodotti/prezzi Stripe (`follia_monthly_19`, `follia_setup_fee_297`) + due flow di checkout + webhook aggiorna `status` e `plan`
7. Route catch-all per subdomain hosting + template di rendering parametrico
8. Dashboard cliente con sezioni condizionali per tipo attività
9. Sistema ticket + email transazionali
10. Flusso "richiesta dominio personalizzato" con checkout dedicato

## Domande aperte prima di partire

- Quale dominio root userai per i sottodomini? (serve per configurare il wildcard DNS appena lo compri) deskinc.app
- Prezzo del custom domain (setup + ricorrente)? 497€ + IVA di setup e 19€/mese + IVA di recurring. Se vogliono possono sottoscrive un'assistenza sito con noi di 249€/mese + IVA dove ci occupiamo di coprire tutti i costi del sito e di fornire assistenza, update, SEO e ampliamenti di nuove pagine (max 5 nuove al mese e 10 nuovi prodotti al mese)
- Le **prenotazioni** (tavoli/appuntamenti) sono nello scope di questa prima release o le rimandiamo a v2? La mettiamo nella prima release
- Vuoi un piano "free trial" o si paga sempre per pubblicare? Per pubblicare bisogna pagare, il cliente non deve mai avere accesso al backend

Confermami il piano (o dimmi cosa togliere/spostare) e passo alla build partendo da migration + landing.