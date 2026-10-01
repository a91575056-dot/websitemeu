# Plăți și portofele digitale

PayPal Live este procesatorul existent. Custom permite minimum 1 USD, cu preț verificat pe server; pachetele fixe sunt 40 și 100 USD. Niciun secret de comerciant nu este trimis în browser.

Apple Pay și Google Pay folosesc separat SDK-ul oficial PayPal v6 (`paypalWallets`), păstrând checkout-ul PayPal existent. `/api/paypal/wallets` verifică metodele oferite contului pentru USD. SDK-ul verifică suplimentar eligibilitatea cumpărătorului/dispozitivului. Butoanele nu apar pentru metode neeligibile. Dacă verificarea serverului este indisponibilă, SDK-ul trebuie în continuare să confirme eligibilitatea înainte de a afișa Google Pay.

La verificarea Live din 1 octombrie 2026, PayPal a raportat `applePayEligible=false`, `googlePayEligible=false`. Implementarea poate fi publicată fără a afișa metode neaprobate; aceste valori nu dovedesc motivul neeligibilității. Proprietarul trebuie să verifice funcțiile disponibile pentru aplicație, țara contului și aprobarea comerciantului în PayPal Developer → Apps & Credentials → Live → aplicație → Features / Accept payments.

## Activare Apple Pay

1. Activați Apple Pay pentru aplicația Live dacă PayPal îl oferă contului.
2. În Apple Pay → Manage, descărcați fișierul oficial `apple-developer-merchantid-domain-association`.
3. Publicați fișierul original ca `public/.well-known/apple-developer-merchantid-domain-association`, fără extensie adăugată și fără a inventa conținutul.
4. Verificați că HTTPS `https://dionisweb.com/.well-known/apple-developer-merchantid-domain-association` returnează exact fișierul, fără redirectări; înregistrați domeniul în PayPal Live.
5. Numai după confirmarea domeniului în PayPal, setați `PAYPAL_APPLE_PAY_DOMAIN_VERIFIED=true` în contextul production și redeploy. Preview-urile au alte domenii și necesită propria înregistrare; nu activați același flag global fără verificare.
6. Verificați pe dispozitiv compatibil cu Apple Wallet. Confirmarea comerciantului și tokenizarea sunt gestionate de SDK, apoi serverul verifică suma capturată înainte de a declara plata reușită.

## Activare Google Pay

Activați Google Pay pentru aplicația Live dacă funcția este disponibilă. Configurația de comerciant este furnizată de SDK-ul PayPal. Dacă PayPal sau Google solicită aprobarea comerciantului/domeniului, finalizați acel proces înainte de a declara metoda funcțională. SDK-ul Google este în PRODUCTION pentru PayPal Live. Clientul trebuie să fie eligibil, iar cardul compatibil.

Google Pay închide foaia de plată înainte de 3D Secure. Serverul capturează numai după aprobarea portofelului și autentificare, atunci când este necesară. Anularea/eroarea 3DS sau o capturare neconfirmată nu redirecționează către succes.

## Validare

`node --test tests/paypal.test.mjs`, `npm run lint`, `npm run build`, `SITE_TEST_URL=<preview> node tests/wallet-browser.mjs`, `SITE_TEST_URL=<preview> node tests/public-smoke.mjs`.

Testele browser pentru portofele simulează SDK-urile și răspunsurile create/capture pentru a verifica eligibilitatea, blocarea domeniului neînregistrat, snapshot-ul sumei Custom 1 USD, autorizarea Apple, Google, 3DS, anularea și capturarea eșuată. Ele nu dovedesc aprobarea contului sau o tranzacție reală Apple Pay/Google Pay. Verificarea Live a eligibilității este un apel real separat la PayPal; nu transferă bani. Tranzacțiile complete necesită un cumpărător cu portofel compatibil care aprobă plata.

Referințe oficiale: https://github.com/paypal-examples/v6-web-sdk-sample-integration și https://www.npmjs.com/package/@paypal/paypal-js (11.2.0).
