

## Rimozione temporanea sezione Recensioni Google

L'integrazione resta pronta a livello di codice ma viene scollegata dal sito pubblico, così la homepage non mostra spazi vuoti né fa chiamate inutili al backend. Quando vorrai attivarla basterà reinserire una riga e fornire i due secret.

### Cosa cambia sul sito

- La sezione "Recensioni Google" sparisce dalla homepage.
- Nessuna chiamata di rete verso `/api/public/google-reviews` dal browser.
- Tutto il resto della homepage (hero, metodo COCO, settori, servizi, progetti, CTA finale) resta identico.

### Modifiche tecniche

1. **`src/components/HomePage.tsx`**
   - Rimuovere l'import `import { GoogleReviews } from "@/components/GoogleReviews";`
   - Rimuovere il blocco `{/* RECENSIONI GOOGLE */} <GoogleReviews />` posizionato tra la sezione Settori e la sezione Pacchetti.

2. **File mantenuti (non eliminati)**
   - `src/components/GoogleReviews.tsx` resta nel progetto ma non più importato.
   - `src/routes/api/public/google-reviews.ts` resta come endpoint pronto all'uso.
   - L'animazione `reviews-marquee` in `src/styles.css` resta (è inerte se non usata, la lasciamo per la riattivazione).
   - Nessun secret viene richiesto.

### Come riattivare in futuro

Quando vorrai mostrare le recensioni:
1. Mi fornisci `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACES_PLACE_ID`.
2. Reinserisco l'import e il tag `<GoogleReviews />` nella homepage.
3. La sezione torna visibile automaticamente appena l'endpoint risponde con dati validi (il componente è già auto-nascondente se mancano dati).

