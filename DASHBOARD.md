# Dashboard și cereri de ofertă

Dashboard-ul include inbox pentru cereri noi și review-uri în așteptare, acces rapid, grafice zilnice, comparație cu perioada calendaristică anterioară, campanii UTM și evenimente per pagină.

Comparațiile procentuale sunt ascunse dacă perioada anterioară precedă instalarea sau depășește retenția de 90 de zile. Ziua curentă este parțială. Vizitatorii reprezintă suma estimărilor zilnice; raporturile clicuri/cereri la 100 de vizualizări nu sunt conversii de persoane unice. Noile evenimente per pagină și campanii nu au backfill. Etichetele UTM acceptă numai litere, cifre, spații, punct, underscore și cratimă, maximum 64 caractere; maximum 100 combinații per shard zilnic. Nu utiliza date personale în UTM.

Formularul de ofertă salvează numele, emailul, telefonul opțional, afacerea, tipul proiectului, termenul și detaliile numai cu acord explicit. WhatsApp rămâne disponibil separat după confirmarea salvării și prin linkurile publice existente. Endpoint-ul public acceptă doar POST cu JSON de aceeași origine, maximum 8 KB; honeypot, timp minim și limită persistentă de 5 cereri/oră/IP. Răspunsul public nu conține cereri sau date de contact.

Store-ul production este `dionis-leads-v1`; preview-urile au store separat pe deploy. Cererile sunt private, cu status, notițe, asociere la un client existent, căutare, filtre, export al listei filtrate și ștergere. Modificările necesită sesiune admin, CSRF și revizie curentă. Nu modificăm workspace-ul existent, contul admin sau configurarea PayPal.

Testele `tests/dashboard-leads.test.mjs` verifică validarea, izolarea accesului, CSRF, rate limit, idempotency, conflicte, ștergere, campanii și comparații. Testele de browser trebuie să utilizeze date fictive și să curețe numai cererile create de test. Nu inițiați plăți reale.
