# Brand Book Desk Industries — PDF

Documento PDF scaricabile, in italiano, pensato per il team interno: regole chiare su come usare logo, colori, font, tono di voce e materiali.

## Contenuto del documento

1. **Copertina** — logo Desk Industries su fondo viola scuro del brand, titolo "Brand Book", data e versione.
2. **Chi siamo** — il gruppo, i brand collegati (BancoPlus, Magnus Agency, Arkeo), il posizionamento "Soluzioni Digitali, Impatto Reale".
3. **Logo** — versione principale, dimensione minima, area di rispetto, uso su fondo chiaro e scuro, esempi di usi vietati (deformare, ruotare, cambiare colore, aggiungere ombre, mettere su sfondi poco leggibili).
4. **Colori** — palette ufficiale presa dal sito: viola scuro di fondo, off-white del testo, ambra come colore accento, più i toni di supporto. Per ogni colore: nome, campione, codice HEX e indicazione d'uso.
5. **Tipografia** — Space Grotesk per titoli, Inter per i testi; gerarchia (titolo, sottotitolo, corpo, didascalia) con dimensioni consigliate e regole di leggibilità.
6. **Tono di voce** — come parliamo: concreto, diretto, orientato al risultato. Cosa dire e cosa evitare, con esempi affiancati (sì / no), claim e frasi chiave ricorrenti.
7. **Applicazioni** — indicazioni e mock semplici per: biglietto da visita, firma email, post social, copertina presentazione, intestazione documento.
8. **Checklist finale** — controllo rapido prima di pubblicare qualsiasi materiale.

## Note tecniche

- Generazione con uno script Python (ReportLab) eseguito una volta; il PDF finale viene salvato nei File come `brand-book-desk-industries.pdf`.
- Colori e font ripresi dai token reali del sito (`src/styles.css`) per coerenza totale.
- Logo inserito da `src/assets/desk-logo.png`.
- Font Space Grotesk e Inter registrati come font Unicode nel PDF per rendere correttamente gli accenti italiani; se non disponibili nel sistema, vengono scaricati da Google Fonts in fase di generazione.
- Le pagine dei mock (biglietto, firma email, social) sono disegnate come blocchi grafici vettoriali, non immagini generate.
- Controllo qualità: ogni pagina viene convertita in immagine e verificata (testo tagliato, sovrapposizioni, contrasto, margini) prima della consegna.

## Cosa serve da te

Nel documento userò i contenuti già presenti sul sito. Se vuoi indirizzo sede, P.IVA, email di contatto e profili social nella pagina applicazioni, mandameli: altrimenti li lascio come segnaposto da completare.
