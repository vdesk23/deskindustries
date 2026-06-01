## Problemi rilevati

### 1. "Crea il mio sito" non porta al form

Cliccando il CTA dell'hero, lo stato passa a `prefill` ma la nuova sezione viene renderizzata sotto l'hero senza scroll automatico → l'utente resta a vedere lo stesso hero e pensa che non sia successo nulla.

### 2. Link Google Maps shortlink non compila niente

`https://share.google/...` è uno shortlink Google che redirige a una pagina Maps caricata via JS. `fetchTextFromUrl` ottiene HTML praticamente vuoto, l'AI non estrae nulla, e l'utente passa al form senza alcun messaggio: sembra che il bottone non abbia fatto nulla.

### 3. Sito non visibile dopo signup

Il trigger `handle_new_user` rivendica i siti via `lead_email = NEW.email`. Se l'utente in fase di signup digita un'email diversa da quella usata nel form Foll.IA (anche solo case/typo, o usa Google login con altra mail), il sito resta orfano: `user_id IS NULL`, RLS lo nasconde, lista vuota in `/account/sites`.

Inoltre nell'`/account` principale manca un riferimento esplicito ai siti Foll.IA appena creati (c'è solo il link in pagina ma non un highlight post-signup).

## Fix proposti

### Fix 1 — Auto-scroll alla sezione attiva

In `src/routes/follia.tsx`, quando `step` cambia da `intro` a `prefill` (o `form`/`success`), fare uno `scrollIntoView` smooth sulla nuova sezione. Aggiungere un `ref` sul container `prefill`/`form`/`success` e un `useEffect` che scrolla quando `step !== "intro"`.

### Fix 2 — Feedback prefill quando l'estrazione fallisce

In `runPrefill`:

- Se `prefillSources` ha tutte le fonti `ok: false` (o l'AI restituisce 0 campi), mostrare un toast/banner sullo step `form` tipo: "Non sono riuscito a leggere i tuoi link (Google Maps shortlink, sito JS-only o pagina protetta). Compila a mano qui sotto."
- Modificare il banner verde di "Ho compilato N campi" per gestire anche il caso 0 con un tono diverso (avviso ambra invece di successo).
- Bonus: per gli URL `share.google` / `goo.gl/maps` / `maps.app.goo.gl`, mostrare un hint inline sotto il campo GMB tipo: "Per i link condivisi di Google Maps copia invece l'URL completo della scheda dal browser desktop" — gli shortlink non sono indicizzabili lato server.

### Fix 3 — Claim del sito post-signup anche con email diversa

Due interventi complementari per rendere il sito visibile al cliente o con un messaggio di caricamento tipo "In costruzione":

**a) Passare `siteId` come hint nel redirect post-auth**
Su `/follia` step success, il link `/auth?...&redirect=/account/sites/${siteId}` già esiste. Aggiungere su `auth.tsx`, dopo signup riuscito, una server function `claimFolliaSite({ siteId })` che:

- verifica che il chiamante sia autenticato (`requireSupabaseAuth`)
- usa service role per `UPDATE follia_sites SET user_id = auth.uid(), claimed_at = now() WHERE id = $1 AND user_id IS NULL`
- ritorna ok/already_claimed/not_found

Se l'utente arriva su `/auth` con `redirect=/account/sites/<uuid>`, dopo signup/login chiamiamo `claimFolliaSite` con quell'id prima del redirect finale. Così anche se l'email del signup è diversa dalla `lead_email`, il sito viene assegnato al nuovo utente (siamo sicuri che è "suo" perché ha cliccato il link arrivato sulla sua casella).

**b) Mostrare i siti Foll.IA nell'`/account` dashboard**
Nel dashboard principale `/account`, aggiungere una card "I tuoi siti Foll.IA" che chiama `listMyFolliaSites` e mostra i primi 2-3 con link a `/account/sites/$siteId`. Così appena fatto login l'utente vede subito il sito, non deve sapere che esiste `/account/sites`.

## File toccati

- `src/routes/follia.tsx` — ref + scroll, banner prefill fallito, hint shortlink GMB
- `src/lib/follia-account.functions.ts` — nuova `claimFolliaSite` server function
- `src/routes/auth.tsx` — chiamata claim post-signup quando redirect contiene `/account/sites/<id>`
- `src/routes/account.tsx` — card "I tuoi siti Foll.IA" con preview lista

Nessuna migrazione DB necessaria.

## Non in scope

- Riscrivere il parsing di Google Maps shortlink lato server (richiederebbe headless browser, fuori scope su Worker runtime — si limita a fornire hint UX all'utente).
- Cambiare il flusso email/conferma signup.