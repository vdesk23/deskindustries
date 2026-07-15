
# Desk Industries — Riprogettazione totale

Trasformo il sito da "agenzia locale con metodo COCO" a **vetrina del gruppo Desk Industries**: holding di digitalizzazione con team di agenti AI + specialisti, progetti interni (Arkeo, Magnus, Foll.IA) e servizi su misura per PMI.

## 1. Fix build bloccante

`src/styles.css` importa Google Fonts via URL — Lightning CSS non lo supporta e la build fallisce. Sposto i `<link>` font in `src/routes/__root.tsx` (`head.links`) e rimuovo l'`@import` remoto dal CSS. Sistemo anche il type error residuo su `/auth` (params `email` mancante).

## 2. Nuova homepage / landing lead-gen

Palette **dark + amber** mantenuta. Struttura:

- **Hero 3D interattivo** (React Three Fiber): scena con particelle/mesh mouse-reactive che rappresenta la "rete di agenti AI". Headline: *"Digitalizziamo le PMI con team umani e agenti AI"*. CTA primaria → form lead inline; secondaria → progetti.
- **Manifesto gruppo**: 3 blocchi (Servizi PMI · Magnus Agency · Arkeo) con hover 3D leggero.
- **Vetrina progetti/case study** (grid animata con parallax): Foll.IA, altri progetti Arkeo, lavori Magnus.
- **Expertise**: griglia di competenze (No-code, AI agents, Marketing, Automazioni, SEO, Web).
- **Sezione team AI + umano**: card con orb 3D che pulsa per ogni "agente".
- **Form lead-gen inline** (nome, email, azienda, esigenza, budget range) → salvato in tabella `lead_requests` esistente + mail admin.
- **CTA finale** verso blog / contatti.

Animazioni: R3F per hero e orb agenti; Framer Motion per scroll reveal, parallax, magnetic buttons.

## 3. Sezione Blog (CMS su Lovable Cloud)

**Rotte pubbliche**:
- `/blog` — lista articoli con filtri per categoria (Case study / News / Insight)
- `/blog/$slug` — articolo singolo, hero image, contenuto MDX/markdown, meta SEO per-articolo, og:image dall'hero

**Rotte admin** (sotto `_authenticated` + check `has_role admin`):
- `/admin/blog` — lista + nuovo articolo
- `/admin/blog/$id` — editor markdown con preview, upload cover, gestione slug/categoria/tags/published

**Schema DB nuovo** (`blog_posts`):
- id, slug (unique), title, excerpt, cover_url, content_md, category, tags[], author_name, published, published_at, created_at, updated_at
- RLS: SELECT pubblico solo where `published = true`; admin full access via `has_role`
- GRANT anon SELECT (solo pubblicati), authenticated + service_role
- Bucket storage `blog-covers` pubblico per le immagini

Server functions: `listPublishedPosts`, `getPostBySlug` (pubblico, publishable client); `listAllPosts`, `upsertPost`, `deletePost`, `uploadCover` (admin, `requireSupabaseAuth` + role check).

## 4. Navigazione & pagine da archiviare

Nuova nav: **Gruppo · Progetti · Servizi · Blog · Contatti**.

- Rimuovo dalla nav: Metodo COCO, Pacchetti, Settori.
- I file rotta restano nel repo ma non linkati (evito rotture di link condivisi); posso eliminarli se preferisci.
- `/progetti` riscritto come showcase gruppo (Arkeo, Magnus, Foll.IA).
- `/chi-siamo` aggiornato al nuovo posizionamento (gruppo, team AI+umano).
- Mantengo intatti: area account/admin Foll.IA, tools, checkout, privacy/termini, sistema email.

## 5. Design directions

Prima di scrivere il codice della home, catturo l'attuale hero via Playwright e genero **3 direzioni renderizzate** con R3F/motion (locked su palette amber + typography attuale). Tu scegli, io implemento la scelta 1:1.

---

## Sezione tecnica

- **Fix CSS**: rimuovere `@import url("https://fonts.googleapis.com/...")` da `src/styles.css`. Aggiungere in `__root.tsx` `links`: preconnect googleapis/gstatic + stylesheet Space Grotesk + Inter.
- **Three.js**: `bun add three @react-three/fiber @react-three/drei`. Hero scene lazy-loaded via `<ClientOnly>` + `React.lazy` per non appesantire il bundle SSR e non rompere `window`-less runtime.
- **Blog**: MDX inline non necessario — uso `react-markdown` + `remark-gfm` + `rehype-highlight` per rendering. `bun add react-markdown remark-gfm rehype-highlight`.
- **Editor admin**: textarea markdown con preview live split (nessun editor pesante — evito problemi SSR).
- **Migrazione**: nuova migration per `blog_posts` + policies + GRANT + bucket `blog-covers` (public) + policy storage per admin upload.
- **Server fns blog** in `src/lib/blog.functions.ts`; publishable client per read pubblici (SSR-safe nei loader di `/blog` e `/blog/$slug`), `requireSupabaseAuth` + `has_role('admin')` per write.
- **Route architecture**: `/blog/$slug` head() con title/description/og:image dinamici dal post.
- **Type fix `/auth`**: allineare `search` schema oppure aggiornare i call sites che passano solo `redirect + mode` a includere `email: ""`.

## Cosa NON tocco in questo giro

Sistema email, Foll.IA (account/admin/ticket/billing), Stripe/checkout, tools SEO & content plan, autenticazione, cookie banner. Vengono solo delinkati dalla nav se non parte del nuovo posizionamento.

## Ordine di esecuzione

1. Fix build (fonts + type error `/auth`)
2. Migration `blog_posts` + storage bucket
3. Server functions blog + rotte pubbliche `/blog` e `/blog/$slug`
4. Rotte admin `/admin/blog` + editor
5. Cattura hero attuale + `design--create_directions` → scelta utente
6. Implementazione nuova homepage (hero R3F, sezioni, form lead)
7. Nav aggiornata + `/chi-siamo` e `/progetti` riscritti
8. QA visivo con Playwright su home + blog

Confermi e procedo?
