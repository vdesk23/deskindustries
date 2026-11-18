# Landing 1: ProductOS (Servizi Desk Industries)

ProductOS: troviamo il prodotto digitale giusto per il negozio fisico, costruiamo la strategia e lo lanciamo. Setup high-ticket + royalties.

## Pacchetti Lite ed Executive

- **Lite**: consulenza di 5 ore (2 di ricerca, 2 di strategia, 1 di lancio) con gruppo WhatsApp di supporto.
- **Executive**: servizio fatto per te, con landing, setup di Meta Ads, 10 creatività AI e gestione dell'account pubblicitario. In più, 10% del budget pubblicitario e 5% del fatturato generato dal prodotto.
- Primo passo della build: leggo dal catalogo CONSUS/Sibill le tariffe di consulenza oraria, landing, setup ads, creatività AI e gestione account. Poi ti propongo le cifre di Lite ed Executive, calcolate su quei listini, da approvare. Nulla viene pubblicato sulla landing finché non le confermi.

## Struttura e menu
- Nuovo menu "Servizi" nell'header flottante: si apre verso l'alto con le 7 linee. Per ora è attiva solo ProductOS; le altre sono indicate come "In arrivo" e non hanno link.
- `/servizi`: elenco dei servizi, pagina indicizzabile.
- `/servizi/productos`: splitter 50/50 che resta lo stesso per ogni visitatore e conserva gli UTM. Questo è l'URL da usare nelle campagne.
- `/servizi/productos/a` (versione lunga): visibile nel menu "Servizi" e indicizzata.
- `/servizi/productos/b` (versione corta): non indicizzata e assente dal menu "Servizi".
- `/grazie`: pagina di ringraziamento con il nome del visitatore, non indicizzata.
- Banner cookie e Cookie Policy aggiornata.

## Variante A (versione lunga)
1. Hook: "Il tuo negozio ha già un *prodotto digitale*. Noi lo troviamo."
2. Problemi: la paura di fondo è non conoscere il digitale, che porta a pensare "la mia attività non può avere un prodotto digitale". Il copy smonta questa convinzione con empatia, poi tocca margini compressi, clienti solo locali e fatturato legato agli orari del negozio.
3. Soluzione: analisi del know-how, scelta del prodotto (corso, app, abbonamento, kit digitale), lancio e crescita.
4. Metodo in 3 step (Ricerca, Strategia, Lancio), nome da scegliere tra:
   - "ProductOS Loop";
   - "Metodo R.S.L.";
   - "Shop-to-Product";
   - "Metodo Saracinesca";
   - "Digital Twin Method";
   - "3 Mosse ProductOS";
   - "Metodo Retail Code".
   Poi il modello di condivisione dei ricavi: setup + royalties.
5. Prove: CONSUS, risultati del portfolio già pubblicati e testimonianze dei clienti (recensioni reali con autore).
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
I testi delle FAQ, il nome del metodo, le cifre di Lite ed Executive e i tipi di prodotto proposti sono una mia bozza: vanno confermati.
