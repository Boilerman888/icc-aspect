# Istoric versiuni

## v1.3.0 – 08.11.2026
- `cont.js` (nou): două elemente HTML proprii, aceleași în Preact, JavaScript simplu și React (cerute de Ion pe 08.11):
  `<icc-aplicatie>` = cardul de lângă siglă, cu numele aplicației (→ pagina de start) și săgeata care deschide lista aplicațiilor
  la care omul are acces (din portal, `portal.eu()`), plus „Toate aplicațiile”; `<icc-utilizator>` = cercul cu inițiale și meniul
  utilizatorului (ajutor, setări, versiunea, ieșire).
- `Antet`: proprietăți noi, opționale: `cod` + `sb` (sau `aplicatii`) pun cardul în locul numelui; `cont` = sarcinile, zi/noapte și cercul,
  mereu la vedere (și pe telefon, lângă ☰). Aplicațiile care nu le dau arată ca înainte.
- REGULI.md 4d: bara compactă.

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
