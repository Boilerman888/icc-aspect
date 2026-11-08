# Regulile aspectului ICC (cerute de Ion, 07.11.2026)

Valabile în toate aplicațiile Instalcorp. Le aplică `v1/tema.css` + `v1/ui.js` (pagini noi) și `v1/punte.css` (paginile vechi).

## Forme
1. Orice buton, filtru, insignă sau contor este dreptunghi cu colțuri rotunjite (ca butoanele temei). Nicio „pastilă”.
   Rotunde rămân doar: punctele de stare, barele de progres, comutatorul pornit/oprit și pastila antetului (care nu e buton).
2. Comutatoarele (ex. „Produse | Surse de preț”, „Luna aceasta | Luna trecută …”): fundal gri, butonul ales alb și încadrat.
   Când nu încap, butoanele trec pe rândul următor în același cadru; textul nu se rupe.
3. Tab-urile cu multe opțiuni (ex. Sarcini) sunt butoane: cel ales albastru, celelalte albe, contorul în dreapta;
   grupate pe teme, despărțite printr-o linie subțire.
4. Greutatea textului: maxim semibold (600). Fontul și mărimile sunt ale temei pe toate paginile.

## Antetul (Ion, 07.11.2026)
4a. Sigla firmei (ICC) stă în stânga sus și duce la portalul aplicațiilor (https://apps.instalcorp.ro).
4b. În dreapta siglei apare numele aplicației, vizibil și pe telefon; un clic pe el duce la pagina de start a aplicației.
    Preact: `Antet({ brand, home, portal })` din `v1/antet.js`; React: clasele `SIGLA_LINK` și `NUME_APP` din același fișier.
4d. Bara compactă (Ion, 08.11.2026): numele aplicației stă într-un card lângă siglă; săgeata din card deschide lista aplicațiilor tale
    (fără legături spre alte aplicații în bară). În bară stau doar paginile de lucru ale aplicației. În dreapta: sarcinile (iconiță cu contor),
    comutatorul zi/noapte și cercul cu inițiale; ajutorul, setările, versiunea și ieșirea sunt în meniul cercului, în aceeași ordine peste tot.
    Piese: `<icc-aplicatie>` și `<icc-utilizator>` din `v1/cont.js`; în Preact prin `Antet({ cod, sb, cont })`.

## Cardurile cu cifre
4c. Într-un rând de carduri, cifrele mari stau la aceeași înălțime, chiar dacă un card are titlul sau nota pe mai multe rânduri
    (titlul sus, cifra aliniată pe rând, nota dedesubt).

## Telefon ținut vertical (portret)
5. Butoanele din capul paginii: cele secundare câte două pe rând, lățimi egale; butonul principal (albastru) ultimul, pe toată lățimea.
6. Datele „De la / până la”: una sub alta, cu etichetele aliniate pe aceeași coloană.
7. Comutatoarele scurte (până la 4 opțiuni) pe un singur rând, cu bucăți egale.
8. Filtrele: căutarea pe tot rândul, listele câte două pe rând; una rămasă singură ia tot rândul.
9. Tabelele late devin compacte, fără derulare laterală: numărul + data + starea într-o coloană, clientul + etichetele în alta, totalul în a treia.
   Textele care nu încap (ex. „-REV1”) trec pe rândul de dedesubt, mai mici; nu intră peste coloana vecină.
10. Listele de foldere / tipuri se aleg dintr-o listă derulantă lungă; elementele (ex. șabloanele) apar ca fișe compacte cu butoanele dedesubt.
11. Linkurile și cuvintele foarte lungi se rup pe rânduri; nimic nu lățește pagina peste ecran.

## Telefon culcat
12. Se văd cât mai multe coloane, tot fără derulare laterală (varianta `culcat:` din tema.css); vederea de portret nu se schimbă.

## Probă înainte de a-i arăta lui Ion
13. Fiecare pagină: 4 ecrane (calculator, tabletă, telefon vertical, telefon culcat) × zi/noapte; nimic ieșit din ecran; 0 butoane-pastilă.
14. Câmpurile de dată au forma celorlalte câmpuri și pe iPhone (Safari).
