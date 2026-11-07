# icc-aspect

Aspectul comun al aplicațiilor Instalcorp (Oferte, Cash Flow, RSVTI, Subcontractori, OPS, Clienți, Personal, portal, Service, Instalații…).
Conține doar aspect: culori, fonturi, colțuri, piese de ecran ca liste de clase Tailwind. **Nu conține date, sigle, chei sau logică de aplicație.**

Tema vine din [dashboardcn](https://github.com/NoahGdev/dashboardcn) (MIT), adaptată pentru Tailwind CSS v4.

## Ce e în fiecare versiune

| Fișier | Ce face | Cine îl folosește |
|---|---|---|
| `v1/tema.css` | Jetoanele temei (zi și noapte), fonturile, colțurile, ca `@theme` Tailwind v4 | toate aplicațiile |
| `v1/ui.js` | Piesele de ecran (buton, card, câmp, listă, tabel, comutator, fereastră, meniu) ca șiruri de clase | Preact și React |
| `v1/piese.js` | Meniul derulant „Mai multe” | aplicațiile Preact |
| `v1/antet.js` | Antetul aplicației (bandă → pastilă la derulare, meniu pe telefon, comutator zi/noapte) | aplicațiile Preact |

Noaptea se aprinde cu `data-theme="dark"` pe `<html>` (pus de `tema-icc.js` al fiecărei aplicații) sau cu clasa `.dark`.

## Cum o folosește o aplicație

1. În `package.json` al aplicației, versiunea e fixată pe o etichetă:
   ```json
   "devDependencies": { "icc-aspect": "https://codeload.github.com/Boilerman888/icc-aspect/tar.gz/refs/tags/v1.1.3" }
   ```
   (arhiva etichetei, cu amprentă în package-lock.json: nu cere git sau chei la publicare).
2. În CSS-ul de intrare al aplicației (Tailwind v4):
   ```css
   @import "tailwindcss/theme.css" layer(theme);
   @import "tailwindcss/utilities.css" layer(utilities);
   @import "icc-aspect/v1/tema.css";
   ```
   `tema.css` aduce singur în build clasele folosite de `ui.js` și `antet.js`.
3. Aplicațiile Preact fără build de JS copiază dosarul `node_modules/icc-aspect/v1` în `aspect/v1` (pasul `postinstall`: `rm -rf aspect/v1 && mkdir -p aspect && cp -r node_modules/icc-aspect/v1 aspect/v1`), îl publică și îl importă (exemplu complet: `aspect.js` din Oferte):
   ```js
   import { btn, card } from './aspect/v1/ui.js';
   import { creeazaAntet } from './aspect/v1/antet.js';
   import { creeazaPiese } from './aspect/v1/piese.js';
   const { Antet, ThemeToggle } = creeazaAntet({ html, useState, useEffect });
   const { Meniu } = creeazaPiese({ html, useState, useEffect, useRef });
   ```
4. Aplicațiile React (Vite) importă direct: `import { btn } from 'icc-aspect/v1/ui.js'`.

## Reguli de versiuni

- **Eticheta** (`v1.0.0`, `v1.0.1`, `v1.1.0`) e fixă: o aplicație nu se schimbă singură când se schimbă repo-ul.
- **Dosarul** (`v1/`, `v2/`) se schimbă doar când se schimbă aspectul vizibil (culori, mărimi, antet). Reparațiile mici rămân în același dosar, cu etichetă nouă.
- Trecerea unei aplicații pe o versiune nouă = un PR mic în repo-ul aplicației (schimbă eticheta din `package.json`), testat pe telefon, tabletă și calculator, zi și noapte. Toate PR-urile de trecere intră cu un singur „aprob”.
- `npm run verifica` (și robotul din `.github/workflows`) verifică la fiecare schimbare că JS-ul e corect și că tema se compilează.
- Eticheta o creează robotul, din versiunea scrisă în `package.json`, imediat după ce schimbarea intră pe `main`.

Istoricul versiunilor: [CHANGELOG.md](CHANGELOG.md).
