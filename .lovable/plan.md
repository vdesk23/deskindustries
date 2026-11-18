# Landing 1: ProductOS (Servizi Desk Industries)

ProductOS: troviamo il prodotto digitale giusto per il negozio fisico, costruiamo la strategia e lo lanciamo. Setup high-ticket + royalties. Prezzi non mostrati.

## Struttura e menu
- Nuovo menu "Servizi" nell'header flottante: si apre verso l'alto con le 7 linee. Per ora è attiva solo ProductOS; le altre sono indicate come "In arrivo" e non hanno link.
- `/servizi`: elenco dei servizi, pagina indicizzabile.
- `/servizi/productos`: splitter 50/50 che resta lo stesso per ogni visitatore e conserva gli UTM. Questo è l'URL da usare nelle campagne.
- `/servizi/productos/a` (versione lunga) e `/servizi/productos/b` (versione corta): non indicizzate.
- `/grazie`: pagina di ringraziamento con il nome del visitatore, non indicizzata.
- Banner cookie e Cookie Policy aggiornata.

## Variante A (versione lunga)
1. Hook: "Il tuo negozio ha già un *prodotto digitale*. Noi lo troviamo."
2. Problemi: margini compressi, clienti solo locali, fatturato legato agli orari del negozio.
3. Soluzione: analisi del know-how, scelta del prodotto (corso, app, abbonamento, kit digitale), lancio e crescita.
4. Metodo in 4 fasi e modello di condivisione dei ricavi: setup + royalties, senza cifre.
5. Prove: CONSUS e risultati del portfolio già pubblicati.
6. Modulo a 3 step.
7. FAQ (6 domande) e invito all'azione finale.

## Variante B (versione corta)
Prima schermata divisa a metà, con il modulo subito visibile. Poi voto Google 5,0 con 22 recensioni, 3 punti chiave e una recensione.

## Modulo a 3 step
1. Contatti e consenso privacy: viene creata l'anagrafica e parte l'email "ANAGRAFICA CLIENTE PRODUCTOS".
2. Qualificazione: categoria del negozio, fatturato indicativo, esistenza di un e-commerce.
3. Momento preferito per la call e note: parte l'email "HOT LEAD PRODUCTOS", poi si apre /grazie.

## Meta Pixel 1520411269668854
Si carica solo dopo "Accetta tutti". Eventi tracciati:
- PageView;
- InitiateCheckout, quando il visitatore inizia a compilare il modulo;
- AbandonCheckout, se esce prima di finirlo;
- Lead, quando completa il modulo.

Nessun dato personale viene inviato a Meta.

## Dettagli tecnici
- Route: `servizi.index.tsx`, `servizi.productos.tsx` (splitter), `servizi.productos.a.tsx`, `servizi.productos.b.tsx`, `grazie.tsx`, `cookie-policy.tsx`.
- Tabelle `landing_contacts` e `landing_requests`, accessibili solo dal server tramite server function e senza policy RLS pubbliche. Email con `enqueueTemplate`.
- Componenti riutilizzabili per le prossime 6 linee: `LandingForm` con prop `line`, `CookieBanner`, `lib/meta-pixel.ts`, `lib/landing-splitter.ts`.
- Animazioni solo CSS con IntersectionObserver e rispetto di reduced-motion; design con i token Desk; `head()` dedicato per ogni route; sitemap aggiornata.

## Da confermare
I testi delle FAQ, le fasi del metodo e i tipi di prodotto proposti sono una mia bozza: vanno confermati.
