# Review-uri și statistici

Formular: `/feedback`. Review-uri publice: `/feedbacks`. Administrare: `/admin` → Review-uri; statistici în Dashboard.

## Surse și migrare

În sursa inițială, homepage-ul afișa patru testimoniale fixe (`src/data/site.ts`). Pagina `/feedbacks` citea funcția `feedback` și folosea aceleași texte fixe ca fallback. Formularul salva separat în store-ul site-scoped `dionis-feedback`, prefix `entries/`, și toate intrările erau publice imediat.

Noua funcție importă o singură dată testimonialele existente în același store, cu identificatori stabili, fără suprascriere. Sunt marcate aprobate/publicate deoarece erau deja afișate public; proveniența lor apare în admin. Ratingul 5 și datele sunt cele afișate anterior, nu verificări noi ale identității sau colaborării. Recordurile vechi din formular sunt păstrate la aceleași chei, fără rescriere în timpul citirii. În absența unui status de moderare, sunt considerate în așteptare și ascunse până la verificarea administratorului.

Homepage-ul și `/feedbacks` consumă numai proiecția publică a aceluiași API: aprobate + publicate. Nu există fallback fix care să readucă un review ascuns/șters. Admin: vizualizare, filtre, export JSON, editare, aprobare/respingere, publicare/ascundere, ștergere. Editările folosesc ETag condiționat; conflictele nu suprascriu modificări. Ștergerea lasă un tombstone fără conținutul review-ului, pentru a împiedica reimportarea unui testimonial șters.

Review-urile noi necesită consimțământ explicit, text valid, rating 1–5, URL HTTP(S) fără credențiale, aceeași origine și JSON limitat la 8 KB. Honeypot, timp minim 2,5 secunde și limită persistentă de cinci trimiteri/IP/oră. IP-ul nu se salvează: limita folosește HMAC cu cheie server și oră. Cheile de limitare sunt curățate zilnic după 24 ore. Aceste măsuri reduc spamul, fără a garanta eliminarea lui; nu se verifică automat identitatea clientului.

## Statistici

Store production `dionis-analytics-v1`, consistency strong. Evenimente agregate în 16 shard-uri zilnice cu actualizări condiționate și retry. Fără cookie-uri, localStorage, URL-uri cu query/hash, emailuri sau user agents brute salvate. La solicitarea proprietarului, adresele IP și țara/orașul/regiunea aproximativă oferite de contextul server Netlify sunt salvate în agregatele zilnice private, cu aceeași retenție de maximum 90 zile. Locația nu este furnizată de browser și nu se deduce adresa locuinței. Un identificator HMAC zilnic derivat din IP/browser estimează vizitatorii zilnici; cheia server este derivată din hashul admin existent, care nu este trimis în browser. Rotația credențialei poate schimba estimarea din ziua respectivă.

Perioade 7/30/90 zile, UTC. Vizualizări, pagini, categorii referrer, dispozitive, țări/orașe (număr de vizualizări), ultimele 500 de adrese IP agregate pe perioadă cu vizualizări și clicuri repetate, evoluție zilnică, WhatsApp/contact și încercări de inițiere checkout. Totalul vizitatorilor este suma unicărilor pe zile (vizitatori-zile), nu persoane distincte în toată perioada. Rețele comune, schimbări IP/browser, blocatoare și referrer ascuns produc erori de estimare. DNT/GPC și roboții cunoscuți sunt excluși. Adminul nu este măsurat. Protecție de volum 60 evenimente/identificator/minut, capacitate 160.000 identificatori/zi; reîncercările simultane folosesc deduplicare limitată la ultimele 2.000 ID-uri/shard/zi. Nu este un sistem antifraudă.

Statisticile încep cu primul eveniment acceptat. Nicio completare istorică. `checkout_start` reprezintă o încercare client de creare comandă, inclusiv încercări eșuate, nu încasări sau conversii. PayPal rămâne procesatorul existent, fără modificări la credențiale, sume sau capturare. Apple/Google Pay nu sunt declarate eligibile.

Funcția programată `analytics-cleanup` curăță zilnic datele de trafic mai vechi de 90 zile și limitele formularului. Protecția publică a funcțiilor programate trebuie verificată în preview și production.

## Izolare și securitate

Review-uri/statistici în preview folosesc store-uri separate per deploy (`reviews-preview-<id>`, `analytics-preview-<id>`), selectate din contextul Netlify, nu dintr-un parametru client. După promovare, contextul publicat folosește store-urile production. Store-ul admin și autentificarea existente sunt păstrate. Citirile private cer sesiune/rol admin; scrierile cer aceeași origine și CSRF. API-ul public de statistici acceptă numai evenimente, nu expune rapoarte sau identificatori.

## Verificare

- `node --test tests/admin.test.mjs tests/paypal.test.mjs tests/reviews-analytics.test.mjs`
- `npm run lint` și `npm run build`
- `ADMIN_TEST_ACCOUNT_FILE=<fișier privat> node tests/admin-browser.mjs`
- `ADMIN_TEST_ACCOUNT_FILE=<fișier privat> node tests/reviews-browser.mjs`
- `node tests/public-smoke.mjs` și `node tests/wallet-browser.mjs`

Testele browser acceptă localhost sau un draft explicit al site-ului existent. Creează/șterg numai propriile înregistrări. Un cont generat pentru test local nu trebuie configurat în production. Pentru un cont production existent fără parola disponibilă mediului, `tests/reviews-browser.mjs` acceptă o sesiune privată temporară; aceasta verifică autorizarea/session binding, nu o autentificare reușită prin parola proprietarului. Nu schimba hashul contului existent pentru testare. Șterge sesiunea după verificare.

Nu promova deploy-ul și nu împinge în `main` (deploy automat) până când preview-ul nu este verificat. Păstrează deploy-ul anterior `6abec4000c7109000853a9f8` pentru rollback. Promovează exact draft-ul verificat prin `restoreSiteDeploy`, apoi verifică production și integritatea datelor existente.

Locațiile/IP-urile încep cu prima accesare după activarea modificării; datele istorice fără locație rămân valide și nu sunt completate artificial. O adresă IP poate reprezenta mai multe persoane sau se poate schimba pentru aceeași persoană. VPN-urile și rețelele mobile pot produce locații diferite; datele lipsă apar ca necunoscute. API-ul public de colectare răspunde numai cu confirmarea, fără IP sau locație; detaliile sunt expuse numai în raportul admin protejat.
