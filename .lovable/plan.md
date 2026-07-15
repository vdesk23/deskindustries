## Obiettivo
Trasformare la home in un'esperienza immersiva: scena 3D come sfondo full-page con blur leggero, header floating in basso stile app, card/bottoni con effetto 3D e luce che segue il cursore.

## 1. Scena 3D come sfondo full-home
- Estraggo `AgentsScene` dall'hero e la monto come layer `fixed inset-0 -z-10` in `HomePage.tsx`, con `pointer-events-none`, `blur-sm` (~4-6px) e un overlay gradient scuro per garantire leggibilità del testo.
- La scena resta montata durante lo scroll ("infinity scroll" = sempre visibile dietro ogni sezione, non smontata mai). Aggiungo un lieve `parallax` legato allo scroll (rotazione/offset camera tramite `useFrame` + scroll listener) per dare senso di profondità infinita.
- Rimuovo il container 3D confinato accanto all'header nell'hero: il contenuto hero diventa full-width sopra la scena.

## 2. Header floating in basso (app-like)
- `Header.tsx`: sposto in `fixed bottom-4 left-1/2 -translate-x-1/2`, larghezza contenuta (max-w ~5xl), `rounded-full` con `backdrop-blur-xl`, bordo sottile e ombra soft.
- Layout compatto: logo a sinistra, nav centrale (Progetti · Gruppo · Servizi · Blog · Contatti), CTA a destra.
- Su mobile: pill compatta con menu hamburger che apre un drawer dal basso.
- Aggiungo `padding-bottom` alle sezioni per non far coprire il contenuto.

## 3. Card e bottoni 3D con luce interattiva
- Creo un componente riutilizzabile `Card3D` (e variante `Button3D`) che:
  - Traccia posizione mouse con `useRef` + `onMouseMove` per calcolare `rotateX/rotateY` (tilt max ~8°) tramite `transform: perspective(1000px)`.
  - Applica un radial-gradient dinamico (`--mx`, `--my` CSS vars) come "spotlight" che segue il cursore.
  - Bordo con gradient luminoso reattivo e leggera scala all'hover.
  - Reset smooth all'uscita del mouse (transizione ~400ms).
- Applico il pattern alle card dei 3 blocchi (PMI/Magnus/Arkeo), alle card servizi/progetti e ai CTA principali.

## 4. Design tokens
- Aggiungo in `src/styles.css` token per la nuova estetica glass:
  - `--glass-bg`, `--glass-border`, `--spotlight-color` (ambra tenue).
  - Utility class `.glass-pill` per header floating.
- Palette ambra invariata.

## Dettagli tecnici
- File toccati: `src/components/HomePage.tsx`, `src/components/Header.tsx`, `src/components/hero/AgentsScene.tsx` (nuove props per parallax + blur), `src/styles.css`.
- Nuovi file: `src/components/ui/Card3D.tsx`, `src/components/ui/Button3D.tsx`, `src/components/layout/SceneBackground.tsx` (wrapper client-only con lazy `Suspense`).
- Performance: la scena 3D già lazy-loaded resta unica per tutta la home (nessun re-mount tra sezioni). `dpr={[1,1.5]}` e `frameloop="demand"` fuori viewport se necessario.
- Accessibilità: `prefers-reduced-motion` → disabilita tilt e parallax, scena statica.

## Esclusioni
- Non tocco blog, admin, auth, altre route (solo `/`).
- Nessuna modifica alla logica lead form, solo restyling del contenitore.
