# Istoric versiuni

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
