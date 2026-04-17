

## Stato attuale

- **Stripe go-live**: claim account ✅ completato. Mancano: `setup_live_account` (form attivazione su Stripe) + `install_app` (installare app Lovable sull'account live). Readiness check bloccato finché i due sopra non sono completi.
- **Secrets live**: `STRIPE_LIVE_API_KEY` e `PAYMENTS_LIVE_WEBHOOK_SECRET` **non ancora presenti** → arriveranno automaticamente quando completi i 2 step su Stripe.
- **Email domain**: `notify.deskindustries.com` ✅ verificato e pronto.
- **Pubblicazione sito**: ❌ non ancora pubblicato.
- **Codice backend**: già pronto a switchare automaticamente da sandbox a live (legge `pk_test_` vs `pk_live_` dal token e passa l'environment alle edge functions).

## Cosa devi fare (in ordine)

### 1. Completa l'attivazione live su Stripe (2 step rimasti)
Vai sul tab Pagamenti e:
- **Setup live account**: compila il form Stripe con dati azienda (P.IVA, indirizzo, conto bancario per i payout, descrizione prodotto, 2FA).
- **Install app**: clicca il link per installare l'app Lovable sul tuo account live (oppure, durante l'attivazione, scegli "Copia dalla sandbox" includendo l'app Lovable — fa la stessa cosa).

Quando entrambi gli step sono `completed`, Stripe consegna automaticamente a Lovable `STRIPE_LIVE_API_KEY` e `PAYMENTS_LIVE_WEBHOOK_SECRET`. Il file `.env.production` viene aggiornato con `pk_live_...`.

### 2. Esegui il readiness check
Sempre nel tab Pagamenti, parte il check automatico che verifica prodotti, prezzi e webhook in modalità live. Se ci sono prodotti/prezzi solo in sandbox, te lo segnala e potrai chiedermi di copiarli con un click ("Ask Lovable to fix").

### 3. Collega il dominio principale
Project Settings → Domains → aggiungi `deskindustries.com` (e/o `www.deskindustries.com`). Va configurato un record A/CNAME al provider DNS. Il dominio si può collegare solo **dopo** aver pubblicato.

### 4. Pubblica il sito
Bottone **Publish** (in alto a destra). Crea il subdomain `*.lovable.app` e attiva i cron job di produzione (per la coda email). Da quel momento `.env.production` viene usato → token live.

### 5. Test end-to-end in produzione
Dopo il publish, sul dominio live:
1. Acquista COCO Lite con una **carta vera** (puoi rimborsarti subito da Stripe Dashboard).
2. Verifica l'arrivo della welcome email da `notify.deskindustries.com`.
3. Crea l'account dal link, accedi a `/account`, apri il Customer Portal, prova a cancellare/riattivare.
4. Controlla in Lovable Cloud → Database che `subscriptions` e `purchases` abbiano `environment = 'live'`.

## Cosa NON serve toccare
- Codice edge functions (già environment-aware).
- Schema DB, RLS, trigger `handle_new_user`.
- Configurazione email (dominio già verificato).
- `supabase/config.toml` (`verify_jwt = false` già impostato per tutte le funzioni payment).

## Opzionali consigliati prima del go-live pubblico
- **Pagine legali**: `/privacy` e `/termini` linkate nel footer e nel checkout (richieste da Stripe per attivazione e GDPR).
- **Notifica admin nuovo cliente**: email/Slack a te quando arriva una nuova subscription, così sai chi onboardare.
- **Login Google** su `/auth` per ridurre l'attrito post-acquisto.

Posso implementare ognuno di questi mentre completi gli step 1-2 su Stripe.

