---
name: landing-builder
description: Progetta e costruisce landing Desk Industries di lead generation in A/B test — variante A long-form indicizzata, variante B short-form noindex — con splitter 50/50, modulo a 3 step, recensioni Google, FAQ, thank-you page e Pixel Meta condizionato al consenso. Usare per landing, funnel, split test e moduli lead dei servizi Desk.
metadata:
  lovable-added-by: "Valerio Cattedra"
  lovable-added-at: "2026-11-17"
---

# Landing builder Desk Industries

## 1. Prima di costruire
Chiedi solo ciò che non trovi nel progetto, una domanda per volta:
- output concreto del servizio, dati necessari e promessa verificabile;
- posizionamento della linea e paura/obiezione principale del target;
- se mostrare prezzi (default no; solo cifre approvate dal cliente);
- eventuali dati mancanti per recensioni, sedi o contatti.
Per Desk Industries riusa: Pixel Meta `1520411269668854`, notifiche a `master@deskindustries.com`, footer e dati legali già presenti. Segnala copy, durate, FAQ e risultati inventati; mai presentare stime come fatti.

## 2. Route e menu Servizi
Ogni linea usa `/servizi/<linea>` come splitter 50/50 sticky in localStorage, conserva gli UTM e reindirizza a:
- `/servizi/<linea>/a`: long-form, indicizzata, canonical assoluto e unica linea mostrata nel menu Servizi;
- `/servizi/<linea>/b`: short-form, `noindex, nofollow`, fuori dal menu, per retargeting.
Lo splitter è l'unico URL da usare nelle campagne. `/grazie` resta noindex. Attiva la linea in `src/lib/landing-lines.ts` solo quando le route esistono e aggiungi la sola variante A alla sitemap.
Mantieni l'header floating globale; dentro la landing i CTA portano al form, senza navigazione secondaria che faccia uscire dal funnel.

## 3. Componenti condivisi
Riutilizza prima di creare nuovi pattern:
- `LandingForm` con `line`, `lineLabel`, `variant`, `questions`;
- `Reveal`, `Aurora`, `ThreadLine`, `ThreadNode`, `WordsIn`, `PhilosophyMarquee`;
- `ReviewsMarquee`, `GoogleBadge` e contenuti separati per linea;
- `useLandingUtm`, `landing-splitter.ts`, `/api/public/landing-submit`.
Non duplicare endpoint, tabelle, Pixel o consenso cookie. Le nuove linee si aggiungono al tipo `LandingLineId` e al contratto già esistente.

## 4. Variante A — long-form
Costruisci una narrazione a capitoli numerati, collegati dal filo rosso del brand:
1. **Hook**: promessa specifica, sottotitolo concreto, CTA `#form`, ancora al metodo e prova di fiducia. Usa una foto solo se aiuta; per analisi/servizi tecnici preferisci infografiche 2D coordinate.
2. **Il blocco**: 3 card grandi con icone, una frustrazione per card, spiegazione e sintesi finale. Smonta con empatia la convinzione limitante, mai colpevolizzare il visitatore.
3. **La soluzione**: cosa riceve, cosa analizziamo e cosa può decidere dopo; niente promesse di fatturato non dimostrate.
4. **Il metodo**: massimo 3 step con nome e verbi chiari. Per un freebie spiega raccolta dati, analisi e restituzione.
5. **Prove**: tutte le recensioni reali in `ReviewsMarquee`, autore e link Google; case study solo se pertinenti e verificati.
6. **Modulo**, poi **FAQ** 5–8 obiezioni reali e CTA finale.
Non usare scarsità, contatori, nomi recenti, tempi o sconti inventati. Per un freebie il valore è il deliverable gratuito, non una falsa urgenza.

## 5. Variante B — short-form
Hero split con modulo subito above the fold, promessa, 3 punti chiave, prova Google e deliverable gratuito; poi recensioni in scorrimento. Nient'altro. Riutilizza il filo visivo e le superfici della variante A, senza ricopiare tutta la pagina lunga.

## 6. Modulo a 3 step
1. Anagrafica: nome, cognome, telefono, email e consenso privacy. Salva/aggiorna il contatto server-only e invia "ANAGRAFICA CLIENTE [LINEA]".
2. Qualificazione dinamica: solo domande pertinenti alla linea. Per ECOM – Breakdown raccogli canali di vendita e principale difficoltà, non dati sensibili o credenziali.
3. Fascia di contatto e note; salva la richiesta server-only, invia "HOT LEAD [LINEA]", poi redirect a `/grazie` con linea e nome.
`method="post"` sul form. Mai chiedere password, accessi a gestionali, dati carta o export contenenti dati dei clienti. Mantieni sempre il pulsante Indietro e la possibilità di correggere i contatti.

## 7. Tracciamento e consenso
Il Pixel si carica solo dopo consenso advertising tramite `canTrack("advertising")` e `src/lib/meta-pixel.ts`. Eventi: PageView, InitiateCheckout, AbandonCheckout con step e Lead al completamento. Mai PII a Meta. Il rifiuto dei cookie non deve bloccare il modulo.

## 8. Recensioni
Usa i dati reali già disponibili nel progetto, senza chiamare Places a ogni visita. Mostra autore e link Google. Tutte le recensioni scorrono nella stessa striscia della home; pausa hover e fallback statico con reduced-motion. Un errore recensioni non deve rompere la pagina.

## 9. Performance e movimento
- Animazioni CSS transform/opacity + IntersectionObserver condiviso; rispetta prefers-reduced-motion.
- Filo rosso, aurora e marquee non devono bloccare lettura o click; livelli decorativi con `pointer-events-none`.
- Immagine hero, se presente: `fetchPriority="high"`, preload e dimensioni; altre immagini lazy.
- Colori solo token semantici; nessun `{"\n"}` in JSX, usa `<br />`.

## 10. Checklist
- [ ] A indicizzata e nel menu; B noindex e fuori menu; splitter conserva variante e UTM.
- [ ] head() unico per ogni route, title <60, description <160, canonical/OG corretti.
- [ ] Solo recensioni e case study reali; nessun dato commerciale inventato.
- [ ] Mail step 1 e step 3 verificate, poi dati di prova eliminati.
- [ ] Lead e contatto collegati; nessuna policy RLS pubblica aggiunta.
- [ ] Verifica 375px e 1280px, CTA raggiungibile, errori console assenti e build OK.
