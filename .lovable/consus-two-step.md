# Contratto richiesto su CONSUS: acquisizione in due step

Desk Industries implementa già questi due endpoint separati. Il vecchio `/api/public/desk-intake/lead` non è adatto al primo step: crea il preventivo immediatamente.

## Sicurezza comune
POST con `x-intake-secret`, verificato contro il segreto già condiviso `DESK_INTAKE_SECRET`. Validazione Zod rigorosa, rate limit, nessun prezzo accettato dal chiamante, nessuna PII nella risposta. Idempotenza su ID esterno + email normalizzata; non collegare account staff a contatti non verificati e non assegnare privilegi. Non inviare automaticamente il preventivo al cliente.

## 1. `/api/public/desk-intake/register`
Input: `{ leadId, name, email, phone, business, sector }`. `leadId` è l'UUID della richiesta Desk Industries.
Creare/aggiornare il record nella sezione Lead di CONSUS, non direttamente un Cliente e non un preventivo. Tenere il riferimento esterno per idempotenza. Un reinvio dello stesso contatto non deve duplicare il Lead. Rispondere 2xx solo dopo persistenza, con `{ leadId: "UUID-del-lead-CONSUS" }`.

## 2. `/api/public/desk-intake/quote`
Input: `{ leadId, name, email, phone, business, sector, serviceCodes, serviceNames, lookingFor }`, con lo stesso ID Desk del primo step.
Richiedere che il Lead esista già. Risolvere i codici nel catalogo ufficiale Sibill e respingere codici ignoti; usare esclusivamente prezzi, aliquote e descrizioni ufficiali. Creare una sola opportunità/preventivo in bozza, collegata al Lead, con obiettivo e righe di costo. Il commerciale deve poterla esaminare, modificare e successivamente inviare. Notificare il commerciale, idempotentemente. Non convertire automaticamente il Lead in cliente acquisito. Rispondere `{ quoteId: "UUID-del-preventivo" }` solo dopo persistenza.

## Catalogo
Mantenere GET `/api/public/desk-intake/catalog`, protetto dal segreto: `{ services: [{ code, name, category }] }`. Mai includere prezzi o IVA. `category` deve riportare la classificazione reale per settore/area servizi se disponibile; Desk raggruppa temporaneamente le voci generiche per descrizione.

## Test richiesti
1. Solo register crea un Lead e zero preventivi.
2. Quote sul Lead registrato crea una bozza con prezzi Sibill corretti.
3. Reinvii non duplicano Lead/opportunità.
4. Segreto assente/errato → 401; codici ignoti → 400; quote senza register → errore.
5. Nessun prezzo nel catalogo e nessun invio automatico al cliente.