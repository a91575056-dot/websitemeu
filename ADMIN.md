# Administrare Dionis Web

`/admin` este interfața în română. Datele și operațiile sunt disponibile numai prin funcția Netlify `admin`, cu verificarea sesiunii și rolului pe server. HTML-ul static al paginii de login nu conține date private.

## Funcționalități

- Clienți: contact, companie, status activ/inactiv, notițe.
- Proiecte: client, status, termen, valoare și monedă.
- Plăți manuale: avans, tranșe și rest, scadență, încasare, dată și referință. Nu inițiază tranzacții. Integrarea PayPal publică existentă rămâne separată.
- Dashboard: venituri încasate, rest contractual, tranșe restante, proiecte active și termene. Monedele nu sunt adunate între ele; proiectele anulate nu contribuie la valoarea contractată/rest.
- Site-uri: verificări HTTPS la cerere, istoric de maximum 100 verificări per site. Funcția programată `admin-monitor` verifică la fiecare 15 minute un lot de maximum 10 site-uri active, prioritizând cele mai vechi verificări. Pentru mai mult de 10 site-uri, frecvența individuală este mai mică. Nu trimite alerte externe.
- Mentenanță: lucrări asociate site-ului, termene, status, cost și finalizare.
- Export JSON pentru backup manual și jurnal al ultimelor 200 modificări.

## Securitate și persistență

Netlify Blobs, store site-scoped `dionis-admin-v1`, consistency strong. Actualizările sunt condiționate de ETag și revizie; conflictele nu suprascriu alte modificări. Nu este folosit localStorage și nu sunt prepopulate date demonstrative. Preview-urile aceluiași proiect pot utiliza același store; testele creează înregistrări cu identificatori proprii și le șterg, fără înlocuirea workspace-ului.

Un singur administrator, cu `ADMIN_USERNAME` și `ADMIN_PASSWORD_HASH` în mediul funcțiilor Netlify. Parola este verificată cu scrypt (N=32768, r=8, p=1); parola în clar nu ajunge în repository. Sesiunile sunt opace, persistente, expiră după 8 ore și sunt revocate la logout sau rotația hashului. Cookie production: `__Host-`, Secure, HttpOnly, SameSite=Strict. Toate modificările necesită aceeași origine și token CSRF. Login-ul are contoare persistente per IP și global pe intervale de 15 minute. Limita globală poate bloca temporar login-ul în timpul unui atac. O sesiune locală folosește un cookie separat, fără Secure, exclusiv pe HTTP local.

Monitorul blochează adrese private/rezervate, folosește numai HTTPS cu verificarea TLS activă și fixează adresa IPv4 validată la conexiune pentru a preveni DNS rebinding. Nu urmărește redirectări; un răspuns 3xx nu dovedește că destinația funcționează. Verificarea este HEAD, nu un test al funcționalității aplicației. Site-urile exclusiv IPv6 nu sunt monitorizate. Funcțiile programate sunt accesibile numai schedulerului în Netlify production; verificați această proprietate în preview înainte de publicare. Schedulerul nu rulează automat în Netlify Dev.

## Cont și dezvoltare locală

Node 24 și `npm ci`. Instalare Netlify CLI separat: `npm install --prefix /workspace/.cloud-tools/netlify netlify-cli@27.10.2`.

Generați un cont nou într-un fișier privat în afara checkout-ului:

```sh
node scripts/create-admin-account.mjs /workspace/.cloud-tools/admin-account.json
```

Fișierul are permisiuni 0600 și conține parola generată aleator și hashul. Nu îl adăugați în Git, nu îl transformați în artifact public și nu afișați valorile în loguri. Încărcați doar username și hash în variabilele serverului; parola este destinată proprietarului. Scriptul nu suprascrie un cont existent.

Pentru dezvoltarea locală, helperul transmite username/hash procesului Netlify Dev fără afișarea lor:

```sh
ADMIN_TEST_ACCOUNT_FILE=/workspace/.cloud-tools/admin-account.json node scripts/start-admin-local.mjs
```

Comanda echivalentă pentru Netlify Dev, din checkout-ul existent:

```sh
XDG_CONFIG_HOME=/workspace/.cloud-tools/config NETLIFY_TELEMETRY_DISABLED=1 npm_config_cache=/workspace/.npm-cache /workspace/.cloud-tools/netlify/node_modules/.bin/netlify dev --offline --no-open --skip-gitignore --internal-disable-edge-functions --framework next --command 'npm run dev -- --hostname 127.0.0.1' --target-port 3000 --port 8888 --functions-port 9999
```

Flagul intern evită componenta Edge/Deno nefolosită. Folosiți checkout-ul izolat existent; nu creați un worktree decât dacă este cerut. Datele locale sunt în `.netlify/blobs-serve`, separat de cele online.

## Verificări și publicare

```sh
npm run test:admin
npm run lint
npm run build
ADMIN_TEST_ACCOUNT_FILE=/workspace/.cloud-tools/admin-account.json npm run test:admin:e2e
node tests/public-smoke.mjs
```

Testul browser folosește Chromium instalat (`CHROMIUM_PATH` pentru altă locație), creează și șterge propriile înregistrări, verifică login, toate modulele, editare, reload persistent, dashboard, mobil, CSRF și logout. Acceptă doar localhost sau URL-ul explicit al unui deploy draft pe proiectul existent. Nu face plăți și nu trimite emailuri.

`NETLIFY_AUTH_TOKEN` trebuie configurat securizat cu acces la proiectul `enchanting-cajeta-137e06` (`c42e886a-dd3a-4dcb-9958-286d5417efb7`). Accesul la metadatele publice ale site-ului nu demonstrează drept de deploy. Inspectați conectarea GitHub și deploy-ul activ înainte de a publica; sursa activă anterioară nu are `commit_ref`. Repository-ul main inițial avea commitul `8f17e92a7c1aa16034054e6184ef1754b58565fa`. Conținutul public observat avea testimoniale/linkuri sociale mai noi; acestea au fost reconciliate în sursă pentru a evita regresia.

După build și commit, scriptul de release configurează username/hash numai în scope-ul functions, creează un draft pe proiectul existent, verifică browserul și site-ul public, apoi promovează exact deploy-ul verificat:

```sh
export ADMIN_TEST_ACCOUNT_FILE=/workspace/.cloud-tools/admin-account.json
node scripts/netlify-admin-release.mjs preview
node scripts/netlify-admin-release.mjs verify
node scripts/netlify-admin-release.mjs publish
SITE_TEST_URL=https://dionisweb.com node tests/public-smoke.mjs
```

Nu publicați dacă un test de preview eșuează. Verificați după promovare login/logout în production, persistența și schedulerul, fără a lăsa date de test. Păstrați ID-ul deploy-ului anterior pentru rollback. Nu modificați variabilele PayPal existente. Contul local nu constituie un cont configurat în production. Nu împingeți modificările în main înainte de verificarea preview-ului dacă o conexiune GitHub poate declanșa publicarea automată.

Limitări: un singur utilizator admin, fără reset prin email, MFA, import automat din PayPal sau alerte externe de monitorizare. Rotația parolei se face securizat prin regenerarea contului și actualizarea hashului în Netlify; sesiunile vechi se invalidează.
