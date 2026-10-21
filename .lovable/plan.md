# Sezione Expertise: esplorazione 3D delle 7 aree

## Cosa vedrà il visitatore
- Titolo aggiornato: "Sette aree di competenza, un unico partner".
- Una scena 3D interattiva: 7 "pianeti" (sfere luminose viola/ambra, ognuna con un'icona/forma simbolica) disposti in orbita attorno a un nucleo centrale "Desk Industries".
- L'orbita ruota lentamente; il visitatore può trascinarla, oppure cliccare un'area (o usare le frecce / i pulsanti sotto) per farla avanzare in primo piano con una transizione morbida della camera.
- Accanto alla scena (sotto su mobile) un pannello vetro con nome dell'area, descrizione e servizi in elenco, più bottone "Parlane con noi" che porta al form contatti.
- Una barra di 7 pillole cliccabili sotto la scena per saltare direttamente a un'area (utile anche da tastiera e lettori di schermo).

## Contenuti delle 7 aree
1. Sviluppo Web/Mobile — app, siti web, landing page, ottimizzazione SEO/GEO, audit.
2. Automazioni — automazioni e software cloud-based, agentic-based e on-premises su tecnologia Google (Firebase, Vertex) e/o Anthropic.
3. Branding — brand book, studio dell'archetipo, casi studio (biglietti da visita, flyer, shop bag), naming e pricing.
4. Content Creation — contenuti social con shooting nostri o materiale del cliente, montaggio con animazioni 2D/3D, video generati con AI.
5. Advertising — campagne Meta e Google in formula performance marketing.
6. E-commerce — sviluppo, ottimizzazione e scaling del negozio online.
7. Consulenze — programmi di coaching personalizzati.

Nota: correggo "Vortex" in "Vertex" (Google Vertex AI) e "Antrophic" in "Anthropic" — dimmi se intendevi altro.

## Comportamento e accessibilità
- Tutti i testi sono HTML reale sopra/accanto alla scena (leggibili da Google e lettori di schermo).
- Con "riduci movimento" attivo o su dispositivi senza 3D: niente rotazione automatica, si vede la versione a schede con lo stesso pannello.
- La scena si carica solo quando la sezione entra in vista, per non appesantire la home.

## Dettagli tecnici
- Nuovo `src/lib/expertise-data.ts` (7 aree: id, titolo, descrizione, servizi, colore token).
- Nuovo `src/components/three/ExpertiseOrbitScene.tsx` (R3F + drei: sfere in orbita, nucleo, `Html` evitato per i testi, raycast click, camera lerp con `Math.exp(-k*dt)`, Environment con Lightformer, colori letti da token CSS).
- Nuovo `src/components/ExpertiseExplorer.tsx`: `React.lazy` + IntersectionObserver + fallback poster/schede, pannello con framer-motion (easing da `src/lib/motion.ts`, creato se manca), pillole di navigazione, frecce tastiera.
- `HomePage.tsx`: sostituire il blocco a 6 card con `<ExpertiseExplorer />`.
- Verifica con Playwright a 1280px e 375px: scena visibile, click su area cambia pannello, nessun errore console.
