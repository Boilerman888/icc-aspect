# Istoric versiuni

## v1.4.2 – 12.11.2026
- `<icc-utilizator>`: rândul fix „Bibliotecă tehnică” în meniul cercului, deasupra versiunii; deschide https://apps.instalcorp.ro/biblioteca/
  într-o filă nouă (biblioteca unică de normative și manuale, decizia lui Ion din 11.11.2026). Atributul `fara-biblioteca` îl ascunde
  (folosit chiar în pagina bibliotecii).

## v1.4.1 – 10.11.2026 (reparație)
- Antetul pe telefon, derulat (semnalat de Ion pe 10.11, Oferte în Telegram): butonul ☰ nu mai cade pe un rând al doilea, sub pastilă,
  peste conținutul paginii; rândul pastilei nu se mai rupe cât meniul e închis (spații mai mici pe telefon, sigla și cardul cedează loc).
- `<icc-aplicatie>`: pe ecranele foarte înguste cardul cu numele se scurtează („Cash F…”) în loc să intre peste butoanele din dreapta.
- Pagina nu se mai vede pe lângă și pe sub pastilă: banda antetului are fundalul paginii, care se stinge doar la marginea de jos;
  sticla pastilei e mai puțin transparentă (85% zi, 90% noapte), ca textul din spate să nu se mai citească prin ea.

## v1.4.0 – 08.11.2026
- `Antet`: o legătură din bară poate avea sub-pagini (`{ label, sub: [{ href, label, nota, on }] }`): pe calculator se deschide
  o listă la clic (cu explicația scurtă sub fiecare nume), pe telefon apar la vedere în meniul ☰, sub un titlu mic.
  Pentru OPS (ISCIR ▾, ANRE ▾), cerut de Ion pe 08.11: meniul trece sus, ca în celelalte aplicații.
- `<icc-utilizator>`: un element `{ titlu }` pune un titlu mic de grup în meniul cercului (ex. „Configurări”).

## v1.3.0 – 08.11.2026
- `cont.js` (nou): două elemente HTML proprii, aceleași în Preact, JavaScript simplu și React (cerute de Ion pe 08.11):
  `<icc-aplicatie>` = sigla firmei, care la clic deschide lista aplicațiilor la care omul are acces (din portal, `portal.eu()`),
  plus „Toate aplicațiile”, și cardul cu numele aplicației, care duce la pagina de start (fără listă, cerut de Ion); `<icc-utilizator>` = cercul cu inițiale și meniul
  utilizatorului (ajutor, setări, versiunea, ieșire).
- `Antet`: proprietăți noi, opționale: `cod` + `sb` (sau `aplicatii`) pun cardul în locul numelui; `cont` = sarcinile, zi/noapte și cercul,
  mereu la vedere (și pe telefon, lângă ☰). Aplicațiile care nu le dau arată ca înainte.
- REGULI.md 4d: bara compactă.
- `navLink` exportat direct din `antet.js` (clasele unei legături din bară), pentru aplicațiile React care nu folosesc `Antet`.

## v1.2.3 – 07.11.2026 (reparație)
- Antetul (regula lui Ion): sigla firmei duce la portal (`portal`, implicit https://apps.instalcorp.ro/), iar numele aplicației,
  scris în dreapta siglei și vizibil pe toate ecranele, duce la pagina de start (`home`). Clasele `SIGLA_LINK`, `NUME_APP` și adresa `PORTAL`
  sunt exportate pentru aplicațiile React.
- REGULI.md: regula antetului și cifrele cardurilor aliniate.

## v1.2.2 – 07.11.2026 (reparație)
- `punte.css`: tab-urile „linie” (`.tabs > .tab`) pe telefon stau într-un cadru gri, câte două pe rând; cel ales e alb și încadrat (ca un comutator). Pe calculator rămân la fel.

## v1.2.1 – 07.11.2026
- `clasic.css` (nou): tema ICC v2 („dashboardcn”) pentru clasele vechi (culori, fonturi, câmpuri, liste, carduri, tabele, ferestre),
  mutată din Oferte (tema/tema-icc-v2.css 2.0.0) ca s-o primească toate aplicațiile Preact. Se importă în stratul `legacy`.

## v1.2.0 – 07.11.2026
- `punte.css` (nou): aduce paginile vechi ale aplicațiilor Preact (clasele din style.css / tema-icc) la regulile aspectului:
  butoane și insigne fără „pastile”, comutatoare, greutăți, așezarea pe telefon (butoane egale, date una sub alta, filtre câte două),
  tab-urile Sarcinilor, linkuri lungi care se rup. Încercată pe Oferte (pilot B).
- `tema.css`: varianta `culcat:` (telefon ținut culcat); câmpurile de dată pe iPhone au forma celorlalte câmpuri.
- `REGULI.md` (nou): regulile aspectului, în cuvinte simple.

## v1.1.3 – 07.11.2026 (reparație)
- Butoanele din antet (meniul ☰ și comutatorul zi/noapte) au colțuri rotunjite (rounded-md), ca toate butoanele; nicio „pastilă” la butoane.

## v1.1.2 – 07.11.2026 (reparație)
- Antetul: marginea de sus a pastilei nu mai împinge pagina în jos (antetul e „flow-root”). Probă: la derulare pagina stă pe loc.

## v1.1.1 – 07.11.2026 (reparații)
- Listele native (`select`) noaptea: lista deschisă era albă; acum are culorile temei (`color-scheme` + culori pe `option`).
- Antetul: înălțime fixă, pastila se micșorează înăuntrul lui, ca în dashboardcn (sticlă, granulație, tranziție 0,7 s).
  Înainte pagina se mișca la trecerea bandă ↔ pastilă și antetul „pâlpâia” lângă pragul de 24 px.
  Pastila are lățimea conținutului de sub ea.

## v1.1.0 – 07.11.2026
- `ui.js`: piese noi `field`, `fieldHint`, `inputSm`, `textarea`, `alert(ton)`, `actions`, `panel`, `chevron`.
- `piese.js` (nou): meniul derulant „Mai multe” pentru Preact (`creeazaPiese`).
- Reparații: butoanele „outline” își arată conturul; listele (`select`) au lățime automată de la tabletă în sus; comutatorul (`tabsList`) ocupă tot rândul pe telefon.
- Regula lățimilor: o lățime proprie peste o piesă se dă cu „!” (ex. `w-20!`).

## v1.0.0 – 07.11.2026
- Prima versiune (decizia D77): tema dashboardcn ca jetoane Tailwind v4 (`--icc-*`), zi și noapte.
- `ui.js`: buton, card, câmp, listă, bifă, insignă, tabel, comutator, fereastră, meniu derulant, lățimea paginii.
- `antet.js`: antetul aplicațiilor Preact (bandă → pastilă, meniu pe telefon, antet nefixat pe telefon culcat).
- Pilot: aplicația Oferte.
