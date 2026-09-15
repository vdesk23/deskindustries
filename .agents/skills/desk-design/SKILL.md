---
name: desk-design
description: Regole di design, copy e struttura per pagine e sezioni del sito Desk Industries (palette viola/ambra, Space Grotesk + Inter, schede Card3D, header pill flottante, testi in italiano). Usare ogni volta che si crea o si modifica una pagina, una sezione o un componente visivo di questo progetto.
---

# Design Desk Industries

Istruzioni vincolanti per qualsiasi pagina, sezione o componente visivo di questo progetto.

## 1. Identità visiva

Colori: **solo token** definiti in `src/styles.css`. Mai `text-white`, `bg-black`, `bg-[#...]`, colori Tailwind grezzi (`text-purple-500`).

| Uso | Token / classe |
| --- | --- |
| Fondo pagina | `bg-background` (viola scuro) |
| Testo | `text-foreground`, secondario `text-muted-foreground` |
| Superficie card | `bg-surface-elevated/50` + `backdrop-blur-xl` |
| Bordi | `border-border` |
| Accento unico | `text-amber`, `bg-amber`, `bg-amber-soft`, `ring-amber` |
| Ombre | `shadow-elevated`, `shadow-amber` |

L'ambra è **l'unico** colore accento: eyebrow, parole in corsivo nei titoli, icone, bordi attivi, CTA. Non introdurre altri colori di brand (i gradienti multi-tinta sono ammessi solo come alone sfocato decorativo dietro le card, come in `HomePage.tsx`).

Font: `font-display` (Space Grotesk) per titoli, numeri e label; body Inter di default. Titoli sempre `tracking-tight` + `font-medium`/`font-semibold`, mai bold pesante.

Raggi: card grandi `rounded-3xl`, card piccole `rounded-2xl`, pill e bottoni `rounded-full`.

## 2. Struttura di una pagina

- Header: pill flottante in basso (`src/components/Header.tsx`), già montato nel layout root. Non aggiungere navbar in alto.
- Sfondo 3D (`<SceneBackground />`): obbligatorio in home; sulle pagine interne è opzionale — se usato, le sezioni devono restare semitrasparenti (`/50`–`/60` + `backdrop-blur-xl`) per lasciarlo intravedere.
- Contenitore sezione: `<section className="relative py-24 lg:py-32">` con `<div className="mx-auto max-w-7xl px-5 lg:px-8">`.
- Intestazione sezione: eyebrow ambra maiuscolo spaziato, titolo grande a sinistra (7 colonne), testo di supporto a destra (5 colonne).
- Griglie: `grid gap-6 lg:grid-cols-3` per le card grandi, `gap-4 sm:grid-cols-2 lg:grid-cols-3` per le card feature.
- Lasciare spazio in fondo alla pagina per l'header flottante.

## 3. Movimento

- Card e bottoni interattivi avvolti in `<Card3D>` (`@/components/ui/Card3D`): inclinazione + luce che segue il mouse. `intensity` 5–6 per card piccole, 8–12 per CTA.
- Comparsa allo scorrimento con Framer Motion: `initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}` con `ease: [0.22, 1, 0.36, 1]` e delay a cascata `i * 0.06`–`0.1`.
- Nessuna animazione infinita vistosa oltre al pulse dell'eyebrow e ai caroselli.
- Rispettare `prefers-reduced-motion` (Card3D lo fa già).

## 4. Tono dei contenuti

- Sempre **italiano**, concreto, orientato al risultato. Niente gergo tecnico o AI-speak.
- Titolo di sezione breve, con una o due parole chiave in `italic text-amber font-normal`.
- Frasi corte, verbi all'indicativo, benefici misurabili (tempo risparmiato, costi, flussi).
- Ogni pagina/sezione chiude con un invito all'azione verso il modulo contatti (`#lead` in home, `/contatti` altrove).

## 5. Checklist prima di consegnare una pagina

- [ ] Route in `src/routes/` con `head()` dedicato: title < 60 char, description < 160, `og:title`, `og:description`, `og:type`, `twitter:card`. Mai riusare i metadati di un'altra pagina.
- [ ] Un solo `<h1>`, gerarchia h2/h3 coerente, HTML semantico (`section`, `nav`, `footer`).
- [ ] `alt` su tutte le immagini, lazy loading dove sensato.
- [ ] Nessun colore hardcoded: cercare `text-white|bg-black|bg-\[#` prima di chiudere.
- [ ] Verifica a 375px e 1280px: testo leggibile sopra lo sfondo, card non compresse, CTA raggiungibile.
- [ ] Link interni con `<Link>` di `@tanstack/react-router`; link esterni con `target="_blank" rel="noopener noreferrer"`.

## 6. Snippet di riferimento

Vedi `references/patterns.md` per intestazione sezione, card, CTA hero e blocco statistiche pronti da copiare.
