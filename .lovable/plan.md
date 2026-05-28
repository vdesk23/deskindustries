## Obiettivo di questo step

Migliorare la landing/form Foll.IA già presente su `/follia` aggiungendo uno **step zero di prefill**: il cliente incolla fino a 3 URL e l'IA compila il form per lui. Poi può rivedere/correggere tutto e generare il sito.

Niente backend nuovo (le tabelle/funzioni esistono già). Tutto si gioca su:
1. nuovo step UI "Partiamo dai tuoi link"
2. una nuova server function `prefillFolliaFromUrls` che chiama AI + (opz.) Google Places
3. mapping dei dati estratti dentro lo stato del form esistente

## Cosa vedrà il cliente

Nuovo flusso su `/follia`:

```text
[Hero "Crea il mio sito gratis"]
        │
        ▼
[Step 0 — Partiamo dai tuoi link (tutti opzionali)]
  ├─ URL del tuo sito attuale          (es. www.barmario.it)
  ├─ URL di un sito che ti piace       (per stile/tono/colori)
  └─ Link Google My Business           (Maps / g.co)
  [ Compila per me ]   [ Salta, compilo a mano ]
        │
        ▼ (loading "Sto leggendo i tuoi link…")
        │
[Form esistente, già pre-compilato]
  - tipo attività dedotto (se possibile)
  - nome, città, indirizzo, telefono
  - descrizione, servizi/menù, orari
  - colori primario/secondario suggeriti dal sito di ispirazione
  - badge "Riempito dall'IA · controlla e correggi"
        │
        ▼
[Sottodominio + email → Genera → Success]  (come oggi)
```

Lo step 0 è skippabile: chi non ha nulla online va dritto al form vuoto come adesso.

## Logica di prefill (server function)

Nuova fn `prefillFolliaFromUrls` in `src/lib/follia.functions.ts`:

- input: `{ oldSiteUrl?, inspirationUrl?, gmbUrl? }` validato con Zod (formato URL, max 500 caratteri, lista http/https)
- esegue in parallelo:
  - **Old site / Inspiration**: `fetch` dell'HTML con timeout 6s, taglio a ~30k caratteri, rimozione script/style → testo grezzo
  - **GMB URL**: prima prova a estrarre `place_id` / `cid` / nome+città dall'URL Google. Se il connettore **Google Maps Platform** è collegato, chiama Places Details per nome, indirizzo, telefono, orari, sito, rating. Se non c'è, fa solo parsing del titolo della pagina come fallback
- manda tutto a `google/gemini-2.5-flash` via Lovable AI Gateway con system prompt che chiede **JSON valido** con questa struttura:

```json
{
  "business_type_guess": "restaurant|retail_shop|barbershop_salon|professional|other|null",
  "business_name": "string|null",
  "city": "string|null",
  "address": "string|null",
  "phone": "string|null",
  "description": "string|null",
  "services": "string|null",
  "opening_hours": "string|null",
  "primary_color": "#rrggbb|null",
  "secondary_color": "#rrggbb|null",
  "tone_notes": "string|null",
  "subdomain_suggestion": "string|null"
}
```

- output: oggetto pulito + array `sources` (quali URL hanno risposto e quali no) per mostrare avvisi in UI
- error handling: se tutto fallisce restituisce `{ ok: true, data: {} }` (form resta vuoto), nessun throw cieco

## Modifiche UI

File toccati:

- `src/routes/follia.tsx`: aggiungere stato `step: "intro" | "prefill" | "form" | "success"`, render del nuovo step, chiamata a `prefillFolliaFromUrls` con loading, merge del risultato nello state del form, badge "IA" sui campi prefilled (semplice classe + tooltip)
- `src/lib/follia.functions.ts`: nuova `prefillFolliaFromUrls` (la `createFolliaDraft` esistente non cambia)

Stile invariato: stesso design system già usato nella landing (amber accent, surface-elevated, font-display).

## Google My Business

Due livelli, dal più ricco al più povero:

1. Se l'utente ha collegato il connettore **Google Maps Platform** → chiamata gateway a Places Details (nome, indirizzo formattato, telefono internazionale, weekday_text per orari, website, types per dedurre `business_type`)
2. Altrimenti → si fa solo `fetch` dell'URL e si lascia all'IA estrarre il poco che riesce dal markup (di solito titolo e indirizzo nel `<title>` di Google Maps)

Nel piano consiglio l'opzione 1: se non l'hai già collegato, dopo l'approvazione del piano te lo chiederò una volta sola in build mode.

## Sicurezza & limiti

- Zod su URL: solo `http(s)`, max 3 URL per chiamata, max 500 char ciascuno
- timeout 6s per fetch + AbortController, max body 30k char inviati all'IA
- nessun salvataggio su DB in questo step (è solo prefill volatile); il record `follia_sites` nasce solo al submit finale, come oggi
- rate limit base: 5 chiamate prefill / 10 min / IP (in memoria del worker, best effort)

## Cosa NON è in questo step (resta nei prossimi)

- sistema ticket assistenza dashboard cliente (è il prossimo blocco che hai chiesto, lo facciamo dopo questo)
- CRUD menù/prodotti/servizi
- wildcard DNS reale su `*.deskinc.app` (lato infrastruttura, fuori codice)

## File modificati / creati

- modifica `src/routes/follia.tsx` (nuovo step "prefill", merge risultati)
- modifica `src/lib/follia.functions.ts` (aggiunta `prefillFolliaFromUrls`)
- eventuale uso connettore Google Maps Platform (se confermi)

## Domande prima di partire

1. **Google Maps Platform**: vuoi che attivi/usi il connettore per ottenere dati ricchi dal link GMB? (Senza, il prefill da GMB è molto limitato.)
2. Sul **sito di ispirazione** vuoi che l'IA peschi solo **stile** (colori, tono) o anche **idee di copy/struttura**? Di default farei solo stile, per non scopiazzare.
