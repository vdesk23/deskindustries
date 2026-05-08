## Obiettivo

Mostrare in homepage le 10 recensioni Google reali di Desk Industries, con look brandizzato e marchio "Recensioni Google", **senza** dipendere dall'API di Google Places (che richiederebbe Place ID + API key configurata).

Le recensioni vengono inserite **una sola volta** come dati statici nel codice — fedeli alle 10 fornite negli screenshot. Più avanti, quando vorrai gestire l'API Google Places, basterà un piccolo intervento per passare alla versione live.

## Cosa vede l'utente sulla homepage

- Nuova sezione "Recensioni Google" tra Settori e Pacchetti (stessa posizione già pianificata).
- Header con:
  - Eyebrow "Recensioni Google" (color amber, design system esistente)
  - Titolo "Le voci di chi ci ha già scelto"
  - Logo Google ufficiale + media stelle "5.0" + "10 recensioni verificate" + link a "Vedi tutte su Google" (link diretto al profilo Maps)
- Carosello a scorrimento orizzontale automatico (marquee) con pausa all'hover, già presente nel componente `GoogleReviews.tsx`.
- Ogni card mostra: avatar (iniziale colorata, dato che gli avatar Google non sono ridistribuibili), nome, "su Google", 5 stelle dorate, testo della recensione, badge "Recensione verificata".
- Totalmente responsive (mobile/tablet/desktop) e in linea con palette amber/dark del sito.

## Le 10 recensioni che includerò

Tutte 5 stelle, testi presi fedelmente dagli screenshot:

1. **Federica Cecere** — "Ho avuto modo di conoscere l'agenzia di Valerio Cattedra e mi sono trovata molto bene. L'approccio è pratico e concreto..."
2. **Paola Piccirilli** — "Agenzia affidabile e competente. Consigliatissima"
3. **Alessandra Cascioli** — "Desk industries, agenzia di Valerio Cattedra, è stata il mio punto di riferimento fondamentale per il completamento del..."
4. **Caterina Barretta** — "Ho avuto una consulenza con Valerio Cattedra e sono rimasta impressionata dalla sua preparazione e dalla sua capacità di..."
5. **Lory Casella** — "I consigli di Valerio sono molto utili per far crescere il mio progetto sui Social"
6. **elena de mare** — "Una sessione molto interessante con Valerio.. Chiaro e coinvolgente sui temi trattati"
7. **Chiara Lorenzi** — "Grazie Valerio Cattedra per gli utilissimi consigli che mi hai dato, continuerò senz'altro a seguirti."
8. **Monica Irene Oddone** — "Ho appena avuto una consulenza con Valerio. Quello che più mi ha colpita, oltre alla..."
9. **Simone Fanelli** — "Professionista preparato, giusto nei costi. Un aiuto vero per le aziende che cercano maggiore visibilità online. Consiglio vivamente"
10. **Antonio Sciacca** — "È veramente difficile trovare professionisti preparati e competenti come Valerio. Se sei una persona che pensa in grande, devi rivolgerti a professionisti che pensano altrettanto in grande. Valerio è quella persona."

I testi tagliati con "..." negli screenshot li lascio così (con ellipsis chiaro), oppure se mi mandi i testi completi li metto integrali — fammi sapere.

## Dettagli tecnici

- Creo `src/lib/google-reviews-data.ts` con l'array tipizzato delle 10 recensioni (autore, testo, rating=5, tempo relativo, opzionale link).
- Refactor di `src/components/GoogleReviews.tsx`: rimuovo il `fetch("/api/public/google-reviews")` e leggo direttamente dai dati statici. Mantengo tutto lo stile, l'animazione marquee e il responsive.
- Aggiungo logo Google SVG inline (versione ufficiale colorata, sicura per uso editoriale dato che mostriamo recensioni Google reali).
- Avatar: cerchio con iniziale + colore deterministico generato dal nome (no foto, perché gli avatar Google non sono ridistribuibili senza API).
- Re-importo `<GoogleReviews />` in `src/components/HomePage.tsx` tra `<SettoriSection />` e `<PacchettiSection />`.
- Rimuovo l'endpoint `src/routes/api/public/google-reviews.ts` (non più usato) e i secret `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACES_PLACE_ID` non sono richiesti.
- Aggiorno `.lovable/plan.md` per riflettere il nuovo stato (statico anziché live).
- Link "Vedi tutte su Google": lo metto puntato al profilo Maps di Desk Industries — mi servirà l'URL esatto (puoi andare su Google Maps, cercare "Desk Industries SRLS" e copiarmi l'URL della scheda).

## In futuro, se vuoi passare alla versione live (automatica)

Quando ti servirà davvero (es. quando le recensioni saranno 30+ e vorrai aggiornarle automaticamente):
1. Mi mandi Place ID + API Google Places attiva
2. Riattivo l'endpoint `/api/public/google-reviews`
3. Sostituisco la sorgente dati nel componente: 1 riga di codice
4. La sezione torna automaticamente live

## Quello che NON faccio (per non sovra-ingegnerizzare)

- Nessun pannello admin per gestirle (sono recensioni Google, non testimonianze libere — vanno fedeli all'originale).
- Nessuna tabella database (10 record statici non valgono il costo di un CRUD).
- Nessuna integrazione API ora (non sblocca valore finché non hai più di 5 recensioni e vuoi automazione).
