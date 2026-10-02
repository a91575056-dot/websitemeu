# Invitații review și hartă detaliată

Admin → Review-uri creează invitații pentru clienți, valabile 1–30 zile și utilizabile o singură dată. Tokenurile aleatorii de 256 biți sunt stocate numai ca hash SHA-256; linkul secret se afișează numai la creare. Tokenul rămâne în fragmentul URL și este verificat prin header. Adminul trimite personal linkul. Identitatea nu se verifică automat. Revocarea este disponibilă în admin. API-ul refuză orice trimitere fără invitație validă. Consimțământul, validarea, rate limit și aprobarea înainte de publicare sunt păstrate.

O eroare de stocare după consumarea invitației necesită crearea alteia: reutilizarea este blocată. Preview-urile păstrează izolarea per deploy. Nu modificăm datele existente, contul admin sau configurarea PayPal.

Două texte demonstrative cu perioada ilustrativă septembrie 2026 apar separat în admin, marcate ca inventate; nu sunt review-uri de clienți și nu intră în ratingul public.

Harta detaliată OpenStreetMap are zoom 2–18, denumiri de localități, deplasare prin pointer/tastatură și revenire la Moldova. Coordonatele IP rămân aproximative, rotunjite la 0,1°. Nu colectăm GPS. Tiles externe primesc cererile administratorului, fără IP-urile vizitatorilor sau datele review-urilor. Harta globală și lista privată existente rămân disponibile.

Verificare: testele server, lint, build și `tests/reviews-browser.mjs` cu URL preview și fișier privat de cont. Testul curăță numai review-ul și invitația pe care le creează, apoi închide sesiunea. Nicio plată reală. Publicarea necesită verificarea preview-ului.
