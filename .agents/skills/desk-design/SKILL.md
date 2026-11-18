---
name: desk-design
description: Regole di design, copy e struttura per pagine e sezioni Desk Industries (palette viola/ambra, filo rosso narrativo, Space Grotesk + Inter, Card3D, header floating e landing animate). Usare per ogni pagina, sezione o componente visivo del progetto.
---

# Design Desk Industries

Istruzioni vincolanti per qualsiasi pagina, sezione o componente visivo di questo progetto.

## 1. Identità visiva
Colori: **solo token** definiti in `src/styles.css`. Mai `text-white`, `bg-black`, `bg-[#...]` o colori Tailwind grezzi.

| Uso | Token / classe |
| --- | --- |
| Fondo pagina | `bg-background` |
| Testo | `text-foreground`, secondario `text-muted-foreground` |
| Superficie card | `bg-surface-elevated/50` + `backdrop-blur-xl` |
| Bordi | `border-border` |
| Accento principale | `text-amber`, `bg-amber`, `bg-amber-soft`, `ring-amber` |
| Filo narrativo landing | `lp-thread-text`, `lp-draw` e componenti `ThreadLine`/`ThreadNode` |
| Ombre | `shadow-elevated`, `shadow-amber` |

L'ambra guida CTA, icone, eyebrow e stati attivi. Il gradiente ambra-rosso è riservato al filo narrativo e agli aloni decorativi già definiti; non introdurre nuovi colori di brand.

Font: `font-display` (Space Grotesk) per titoli, numeri e label; body Inter. Titoli `tracking-tight` + `font-medium`/`font-semibold`, mai bold pesante. Card grandi `rounded-3xl`, piccole `rounded-2xl`, CTA `rounded-full`.

## 2. Struttura e filo rosso
- Header pill flottante in basso, già montato nel layout root; niente navbar tradizionale in alto.
- Sfondo 3D obbligatorio in home, opzionale nelle pagine interne con fallback statico.
- Sezioni `relative py-24 lg:py-32`, contenitore `mx-auto max-w-7xl px-5 lg:px-8`.
- Intestazione: eyebrow ambra, titolo a sinistra e supporto a destra dove serve.
- Nelle landing ogni sezione è un capitolo `ThreadNode` numerato. `ThreadLine` collega il percorso; `Aurora` crea profondità senza ridurre il contrasto.
- `PhilosophyMarquee` collega il servizio ai principi Desk: zero vincoli, paghi a consumo, su misura day by day. Usa solo affermazioni pertinenti alla linea.
- Spazio finale sufficiente per l'header floating.

## 3. Movimento
- Card e CTA interattive con `Card3D`: intensity 5–6 per card, 8–12 per CTA.
- Landing: solo CSS transform/opacity e observer condiviso tramite `Reveal`; titoli con `WordsIn`, foto eventuali con kenburns lieve, linea metodo con `lp-draw`.
- `ReviewsMarquee` e `PhilosophyMarquee`: scorrimento continuo leggibile, pausa hover, niente movimento con reduced-motion.
- Evita animazioni continue vistose oltre ai pattern approvati. Decorazioni sempre `pointer-events-none` e dietro al contenuto.
- Le pagine esistenti possono mantenere Framer Motion; non aggiungerlo alle nuove landing.

## 4. Immagini e infografiche
Per analisi, audit, software e servizi tecnici preferisci diagrammi 2D, mappe di flusso e pannelli dati chiari, con gli stessi token del sito. Non usare foto stock o immagini AI generiche quando un'infografica spiega meglio il servizio. Ogni visual deve avere testo alternativo utile e non contenere metriche inventate presentate come risultati reali.

## 5. Tono dei contenuti
- Sempre italiano, concreto, orientato alla decisione che il cliente potrà prendere.
- Titoli brevi con una o due parole in `italic text-amber font-normal`; un solo h1.
- Spiega output, input necessari e passaggi. Niente AI-speak, gergo o promesse non dimostrate.
- Nei freebie evidenzia cosa riceve gratuitamente e perché è utile, senza sminuire il servizio o creare falsa urgenza.
- Chiusura con CTA al form della pagina.

## 6. Checklist
- [ ] Route con head() dedicato: title <60, description <160, OG/Twitter, canonical dove indicizzabile.
- [ ] Un solo h1, gerarchia coerente, alt e dimensioni immagini.
- [ ] Nessun colore hardcoded: cercare `text-white|bg-black|bg-\[#`.
- [ ] Link interni con TanStack Router; esterni con `target="_blank" rel="noopener noreferrer"`.
- [ ] Verifica 375px e 1280px: testo leggibile, card non compresse, CTA raggiungibile, decorazioni non interattive.
- [ ] Reduced-motion verificato e nessun errore console.

## 7. Snippet di riferimento
Vedi `references/patterns.md` per i pattern base; per le landing usa come riferimento anche i componenti condivisi in `src/components/landing/` e la variante ProductOS già approvata.
