# Ottimizzatore SEO/AIO articoli blog

Nuovo tool in area membri (`/tools/ottimizzatore-seo`) che ottimizza articoli incollati dall'utente, restituisce versione ottimizzata + guida con spiegazioni + meta description, slug, permalink e idee ALT. Output scaricabile in PDF.

## Modello commerciale

| Piano | Prezzo | Articoli/mese | Extra |
|---|---|---|---|
| Free | 0€ | 3 | bloccato a quota esaurita |
| Starter | 4,99€/mese | 10 | 1€/articolo extra |
| Pro | 9,99€/mese | 25 | 1€/articolo extra |
| Unlimited (ruolo) | — | illimitato | — |

- Reset contatori il **1° del mese** (UTC).
- Extra: checkout one-shot da 1€ per ogni articolo extra (non metered).
- Ruolo `unlimited` assegnato dal DB (Supabase) tramite tabella `user_roles`.

## UI

Layout split-screen su `/tools/ottimizzatore-seo`:
- **Sinistra**: textarea grande "Incolla qui il tuo articolo (Markdown supportato)" + selettore tono/keyword target opzionale + bottone "Ottimizza".
- **Destra (dopo elaborazione)**: tab "Articolo ottimizzato" / "Guida modifiche" / "SEO meta" (meta description, slug, permalink, lista idee ALT con didascalia per ogni immagine identificata).
- Header con badge piano corrente e contatore `X/Y articoli usati questo mese`.
- 3 bottoni: **Copia**, **Scarica articolo (PDF)**, **Scarica guida (PDF)**.
- Storico ultime 10 ottimizzazioni (collassabile).
- Stati: loading con skeleton, errore con retry, quota esaurita con CTA upgrade/acquista extra.

Aggiungere card "Ottimizzatore SEO" in `/account` accanto al Piano Contenuti.

## Pagamenti

- 2 nuovi prodotti Stripe (price_id stabili):
  - `seo_optimizer_starter` — 4,99€/mese ricorrente
  - `seo_optimizer_pro` — 9,99€/mese ricorrente
  - `seo_optimizer_extra_article` — 1€ one-time (per articolo extra)
- Sezione pricing dedicata in cima al tool quando l'utente è Free o ha esaurito quota.
- Checkout via componente esistente `StripeEmbeddedCheckout`.
- Cancellazione/gestione: già coperta dal Customer Portal esistente.
- Webhook esistente `payments-webhook` aggiornerà la nuova tabella `seo_optimizer_usage` quando arrivano gli acquisti extra (basato su `price_id`).

## Database (migrazione)

Nuove tabelle/elementi:

1. **`app_role`** (enum): `admin`, `unlimited`.
2. **`user_roles`** (user_id, role, unique(user_id, role)) + funzione `has_role(uuid, app_role)` security definer.
3. **`seo_optimizer_usage`** — log delle ottimizzazioni:
   - `id`, `user_id`, `created_at`, `period_month` (date troncata al 1° del mese), `is_extra` (bool), `extra_purchase_id` (nullable, FK logica a `purchases.id`), `input_chars`, `output_chars`.
4. **`seo_optimizer_extra_credits`** — credito extra acquistato e non ancora consumato:
   - `id`, `user_id`, `created_at`, `consumed_at` (nullable), `stripe_session_id` (unique).
5. **Funzione `get_seo_quota(user_id)`** → ritorna `{ plan, limit, used_this_month, extra_credits, unlimited }`.
6. RLS: utenti vedono solo le proprie righe; service_role gestisce inserimenti dal webhook.

## Backend

- **`createServerFn` `optimizeArticle`** (`src/lib/seo-optimizer.functions.ts`), protetta da `requireSupabaseAuth`:
  1. Check quota: se `unlimited` → procede; altrimenti calcola `used_this_month` vs limit del piano attivo; se sopra, consuma 1 credito extra; se nessuno → 402 con messaggio "Acquista articolo extra o passa al piano superiore".
  2. Chiama Lovable AI Gateway (`google/gemini-2.5-flash`) con structured output Zod:
     ```
     { optimized_markdown, meta_description, slug, permalink_suggestion, alt_ideas[], changes[] { type, before, after, reason } }
     ```
  3. Inserisce riga in `seo_optimizer_usage` (con `is_extra=true` se credito extra consumato).
  4. Ritorna il risultato.
- **`createServerFn` `getSeoQuota`** — legge stato quota per la UI.
- **`createServerFn` `buyExtraArticle`** — crea checkout one-shot per `seo_optimizer_extra_article` (riusa il pattern di `create-checkout`).
- **Webhook esistente `payments-webhook`**: aggiungere branch per `price_id === "seo_optimizer_extra_article"` che inserisce riga in `seo_optimizer_extra_credits`.

## Generazione PDF

Lato client con `jspdf` + `jspdf-autotable` (già consigliato per zero dipendenze Node-only). Due funzioni:
- `generateArticlePdf(optimized)` → PDF pulito con titolo, meta, articolo.
- `generateGuidePdf(optimized, changes)` → PDF con sezioni: articolo finale + tabella modifiche (tipo, prima, dopo, motivo) + sezione SEO (meta/slug/permalink/ALT).

## File modificati / creati

```text
src/routes/tools.ottimizzatore-seo.tsx        (nuova route)
src/components/seo-optimizer/                  (Editor, ResultPanel, QuotaBadge, PricingGate)
src/lib/seo-optimizer.functions.ts             (server fns: optimize, getQuota, buyExtra)
src/lib/seo-optimizer-pdf.ts                   (jsPDF generators)
src/routes/account.tsx                         (link al nuovo tool)
supabase/functions/payments-webhook/index.ts   (gestire extra credits)
```

Migrazione DB con `user_roles`, `has_role`, `seo_optimizer_usage`, `seo_optimizer_extra_credits`, RLS, `get_seo_quota`.

## Note tecniche

- AI: Lovable AI Gateway, modello `google/gemini-2.5-flash`, structured output via `Output.object()` con schema Zod.
- Limite input: max 30.000 caratteri per articolo (validazione Zod lato server).
- I prodotti Stripe vanno creati via tool `payments--batch_create_product` con `tax_code: txcd_10103001` (SaaS).
- Il ruolo `unlimited` si assegna manualmente con un INSERT in `user_roles` (te lo creo già pronto da eseguire post-migrazione, oppure ti faccio una piccola UI admin in seguito se vuoi).

## Fuori scopo (per ora)

- Pannello admin grafico per gestire ruoli (assegnazione `unlimited` via SQL/insert tool).
- Fatturazione metered (extra fatturati a fine mese).
- Storico più lungo di 10 ottimizzazioni (solo le ultime 10 visibili in UI; tutto resta in DB).
