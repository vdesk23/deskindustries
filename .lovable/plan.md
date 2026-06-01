## Problema

Oggi se un cliente Foll.IA si logga e prova ad aprire il suo sito:

- **In `/account**` vede solo una card generica "I miei siti Foll.IA" che porta a una lista — non vede il sito creato né il suo stato.
- **Cliccando "Foll.IA"** dall'home (link a `/follia`) gli si riapre il form di lead come se fosse un nuovo utente, anche se ha già un sito in bozza.
- **Aprendo l'anteprima** (`/s/<subdomain>`) il sito è invisibile perché `getPublicFolliaSite` filtra `status = 'live'`, e finché non paga il sito resta `draft` → schermata "Sito non trovato o non ancora pubblicato".

Risultato: il cliente non vede mai la sua anteprima e non trova il bottone Publish/pagamento.

## Obiettivo

1. Il cliente può vedere gratis l'anteprima del proprio sito (anche in stato `draft`) dalla dashboard cliente, dopo il login su deskindustries.com
2. Dalla `/account` vede subito i suoi siti Foll.IA, con stato e CTA verso anteprima / pubblicazione.
3. Un singolo account non può creare più di un sito web.
4. Cliccando "Foll.IA" da home, se è loggato e ha almeno un sito, viene portato alla dashboard del sito, non al form.

## Modifiche

### 1. Anteprima gratuita per siti in bozza

`src/lib/follia-public.functions.ts`

- Aggiungere parametro opzionale `preview: boolean` allo schema di `getPublicFolliaSite`.
- Se `preview === true`: rimuovere il filtro `.eq("status", "live")` e includere anche `status` nel select, così il sito viene restituito anche in `draft` / `in_review`.
- Restituire anche `status` nel payload per permettere al frontend di mostrare il banner "Anteprima — sito non ancora pubblicato".

`src/routes/s.$subdomain.tsx`

- Leggere `?preview=1` dai search params.
- Passare `preview` a `fetchSite`.
- Se il sito ritorna con `status !== "live"`, mostrare un banner sticky in alto con la dicitura "Anteprima gratuita — questo sito non è ancora online" e (se l'utente è il proprietario o non c'è gating) un link "Pubblica ora" verso `/account/sites/<id>`. Per non-owner basta il banner informativo.
- Per `status === "live"` resta tutto invariato (nessun banner).

Questo permette al cliente di condividere un link `/s/<subdomain>?preview=1` come anteprima gratuita prima del pagamento.

### 2. Siti Foll.IA visibili in `/account`

`src/routes/account.tsx`

- Caricare in parallelo i siti del cliente con `listMyFolliaSites` (serverFn già esistente).
- Sopra il blocco "Tool gratuiti", inserire una nuova sezione "I tuoi siti Foll.IA" che:
  - Se non ha siti → CTA "Crea il tuo sito" → `/follia`.
  - Se ne ha → lista (max 3, con link "Vedi tutti" se >3) con: nome business, subdomain, badge di stato ("Bozza" amber / "Online" verde / "In revisione" grigio), due bottoni inline: **Anteprima gratis** (apre `/s/<subdomain>?preview=1` in nuova tab) e, se `status==='draft'`, **Pubblica** (link a `/account/sites/<id>` dove c'è già il blocco checkout).
- Mantenere la card link a `/account/sites` come "Gestisci tutti i siti" sotto la lista.

### 3. Routing intelligente dal CTA "Foll.IA" su home

`src/routes/follia.tsx`

- Se l'utente è loggato e `listMyFolliaSites` restituisce ≥1 sito, mostrare in cima alla pagina (sopra l'hero/form) un banner "Hai già un sito Foll.IA in lavorazione" con CTA primaria "Vai al mio sito →" verso `/account/sites/<id>` (primo sito). Mantenere comunque il form sotto, dentro un accordion/sezione "Crea un altro sito".
- Non eseguire redirect forzati: alcuni clienti possono volerne creare più di uno.

### 4. Bottone "Apri preview" in dettaglio sito

`src/routes/account.sites.$siteId.tsx`

- Cambiare il link del bottone "Apri preview" da `/s/${subdomain}` a `/s/${subdomain}?preview=1` così funziona anche per i draft.
- Lasciare la label "Apri preview"; in più, se `isLive`, mostrare anche un secondo bottone "Apri sito pubblico" senza `?preview=1`.

## File toccati

- `src/lib/follia-public.functions.ts` — supporto `preview` flag + ritorno status.
- `src/routes/s.$subdomain.tsx` — leggere `?preview`, banner anteprima.
- `src/routes/account.tsx` — sezione siti Foll.IA inline.
- `src/routes/account.sites.$siteId.tsx` — link preview con `?preview=1`.
- `src/routes/follia.tsx` — banner "hai già un sito" per utenti loggati con siti esistenti.

## Fuori scope

- Modifiche al flusso Stripe / pagamenti (è già funzionante in `account.sites.$siteId.tsx`).
- Modifica RLS DB: usiamo il service role nel serverFn `getPublicFolliaSite`, quindi nessuna migration.
- Rinominare/cambiare il subdomain di farmacialeone (è già claimato dall'utente e visibile in `/account/sites`).