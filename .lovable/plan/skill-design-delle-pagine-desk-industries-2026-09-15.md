# Skill: design delle pagine Desk Industries

Creo una "skill" — un set di istruzioni che si attiva automaticamente ogni volta che si lavora al design di una pagina o di una nuova sezione di Desk Industries. Serve a garantire che qualunque pagina nuova nasca già con lo stile del sito: sfondo animato, colori brand, font, schede con effetto 3D, testi in italiano.

## Cosa contiene la skill

1. **Identità visiva**
  - Palette: viola scuro di fondo, off-white per i testi, ambra come unico colore accento, superfici elevate semitrasparenti.
  - Regola ferrea: si usano solo i colori del sistema (mai colori scritti a mano tipo bianco o nero puro).
  - Font: Space Grotesk per i titoli, Inter per i testi.
2. **Struttura di una pagina tipo**
  - Menu flottante in basso, a forma di pillola.
  - Sezioni con etichetta in alto in ambra maiuscolo spaziato, titolo grande, testo di supporto a destra.
  - Griglie di schede arrotondate, semitrasparenti, con bordo sottile.
3. **Movimento e interazione**
  - Schede e bottoni con inclinazione e luce che segue il mouse.
  - Comparsa progressiva degli elementi allo scorrimento.
  - Rispetto delle preferenze di chi disattiva le animazioni.
4. **Tono dei contenuti**
  - Sempre italiano, concreto e orientato al risultato.
  - Titoli brevi con una o due parole in corsivo ambra per enfasi.
  - Ogni sezione chiude con un invito all'azione verso il modulo contatti.
5. **Checklist tecnica per ogni nuova pagina**
  - Titolo e descrizione per i motori di ricerca, unici per pagina.
  - Un solo titolo principale, testi alternativi sulle immagini.
  - Controllo su mobile e leggibilità sopra lo sfondo animato.

## Note tecniche

- La skill vive in `.agents/skills/desk-design/SKILL.md` e viene attivata con lo strumento di applicazione delle skill.
- Contiene riferimenti concreti al codice esistente: token in `src/styles.css`, `SceneBackground`, `Card3D`, `Header`, il pattern di sezione di `HomePage.tsx`, le animazioni `fadeUp` con Framer Motion.
- Include frammenti di codice riutilizzabili (intestazione sezione, scheda, bottone hero) e le regole vincolanti dello stack: rotte TanStack, `head()` per i metadati, nessun colore fuori dai token.
- Se cresce, le parti di dettaglio (esempi di copy, pattern di animazione) finiscono in file separati sotto `references/`.

## Cosa serve da te

Nulla di obbligatorio. Se vuoi, indicami eventuali regole non scritte che vuoi rendere obbligatorie (es. sfondo 3D anche sulle pagine interne o solo in home).