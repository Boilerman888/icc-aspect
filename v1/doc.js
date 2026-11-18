// icc-aspect v1 – locul lui Vasile și Tasker pe telefon (Ion, 18.11.2026, varianta A).
// Pe telefon (ecran sub 640 px, ținut în picioare, sau telefon culcat) butoanele lui Vasile și Tasker nu mai plutesc
// în colțul din dreapta-jos (acopereau „Salvează”, barele de jos și finalul fișelor): se așază în antet, mici,
// chiar în stânga cercului cu inițiale (<icc-utilizator>). Pe tabletă și pe calculator rămân ca până acum.
// Aplicațiile nu fac nimic în plus: toate au deja cercul cu inițiale. Dacă cercul nu se vede (ex. ecranul de intrare),
// butoanele rămân plutitoare, ca înainte.
//
// Cum: în <icc-utilizator> apare un „locaș” (span.icc-doc) înaintea cercului; vasile.js și tasker.js își mută butonul acolo.
// cont.js păstrează locașul când redesenează cercul (de ex. la deschiderea meniului).

export const TELEFON = typeof matchMedia === 'function'
  ? matchMedia('(max-width:640px), (max-height:500px) and (pointer:coarse)')
  : { matches: false, addEventListener() {}, removeEventListener() {} };

const CSS = `
.icc-doc{display:inline-flex;align-items:center;gap:6px;margin-right:6px;align-self:center}
.icc-doc:empty{display:none}
.icc-doc .icv-fab,.icc-doc .ict-fab{position:relative;right:auto!important;bottom:auto!important;width:30px;height:30px;padding:2px;
  box-shadow:none;z-index:auto;flex-shrink:0;animation:none}
.icc-doc .icv-fab:hover,.icc-doc .ict-fab:hover{transform:none}
.icc-doc .icv-fab i,.icc-doc .ict-fab i{border-width:1.5px}
.icc-doc .icv-fab{order:1}
.icc-doc .icv-fab .icv-dot{width:10px;height:10px;border-width:2px;right:-2px;top:-2px}
.icc-doc .ict-grp{order:2;position:relative;right:auto!important;bottom:auto!important;z-index:auto;gap:0}
.icc-doc .ict-nr{position:absolute;top:-6px;right:-7px;height:16px;min-width:16px;padding:0 4px;border-radius:4px;font-size:10.5px;
  box-shadow:0 0 0 2px var(--icc-background,#fff)}
.icc-doc .ict-nr:not(.noi){display:none}
/* antetul nu încape (telefoane înguste, ex. Android de 360 px): Tasker se așază peste marginea lui Vasile, apoi amândoi se micșorează */
.icc-doc.strans{gap:0;margin-right:4px}.icc-doc.minim{gap:0;margin-right:2px}
.icc-doc.strans .ict-grp{margin-left:-6px}.icc-doc.minim .ict-grp{margin-left:-9px}
.icc-doc.strans .icv-fab,.icc-doc.strans .ict-fab{width:28px;height:28px}
.icc-doc.minim .icv-fab,.icc-doc.minim .ict-fab{width:26px;height:26px;padding:1.5px}
.icc-doc.strans .ict-fab,.icc-doc.minim .ict-fab{box-shadow:0 0 0 2px var(--icc-background,#fff)}
`;

function stil() {
  if (document.getElementById('icc-doc-stil')) return;
  const s = document.createElement('style'); s.id = 'icc-doc-stil'; s.textContent = CSS; document.head.append(s);
}

// locașul din antet, dacă suntem pe telefon și cercul cu inițiale se vede; altfel null (butonul rămâne plutitor)
export function locas() {
  if (!TELEFON.matches) return null;
  const u = [...document.querySelectorAll('icc-utilizator')].find((x) => x.getClientRects().length);
  if (!u) return null;
  let d = u.querySelector(':scope > .icc-doc');
  if (!d) { d = document.createElement('span'); d.className = 'icc-doc'; u.prepend(d); urmareste(d); }
  stil();
  return d;
}

// pune nodul (butonul lui Vasile sau grupul Tasker) în antet; întoarce true dacă a reușit
export function aseaza(nod) {
  const d = locas();
  if (!d) return false;
  if (nod.parentNode !== d) d.append(nod);
  strange(d);
  return true;
}

// Antetul trebuie să încapă pe un rând, ca înainte: comparăm antetul fără butoane (locașul ascuns) cu antetul cu butoane.
// Dacă apare derulare pe orizontală sau ceva trece pe al doilea rând, strângem butoanele în doi pași (strans, apoi minim).
function strange(d) {
  d.classList.remove('strans', 'minim');
  if (!d.children.length) return;
  const hdr = d.closest('header') || d.parentElement?.parentElement?.parentElement;
  const vis = (e) => e.getClientRects().length > 0;
  const jos = () => { let m = 0; if (hdr) for (const e of hdr.querySelectorAll('button, a, input, icc-aplicatie')) if (vis(e) && !e.closest('[role=menu], nav, .icc-doc')) m = Math.max(m, e.getBoundingClientRect().bottom); return m; };
  // lățimea ecranului din media query (nu din pagină: pe telefon, o pagină prea lată „umflă” innerWidth și ar ascunde depășirea)
  const W = latimeEcran();
  const dreapta = () => { let m = 0; if (hdr) for (const e of hdr.querySelectorAll('button, a, icc-utilizator')) if (vis(e) && !e.closest('[role=menu]')) m = Math.max(m, e.getBoundingClientRect().right); return m; };
  // pe telefon, o pagină care depășește „umflă” lățimea paginii și antetul se lățește cu ea; ca să vedem dacă încape cu adevărat,
  // fixăm antetul, cât măsurăm, la lățimea ecranului
  const vechi = hdr ? [hdr.style.width, hdr.style.maxWidth, hdr.style.boxSizing] : null;
  if (hdr) { hdr.style.boxSizing = 'border-box'; hdr.style.width = hdr.style.maxWidth = W + 'px'; }
  const st = hdr ? hdr.getBoundingClientRect().left : 0;
  d.style.display = 'none';
  const j0 = jos(), r0 = dreapta();
  d.style.display = '';
  // dacă antetul depășea ecranul și fără butoane, nu e vina noastră: atunci doar nu-l facem mai lat decât era
  const lim = Math.max(st + W, r0);
  const nuIncape = () => jos() > j0 + 2 || dreapta() > lim + 0.5;
  try {
    if (!nuIncape()) return;
    d.classList.add('strans');
    if (!nuIncape()) return;
    d.classList.replace('strans', 'minim');
  } finally {
    if (hdr) [hdr.style.width, hdr.style.maxWidth, hdr.style.boxSizing] = vechi;
  }
}

function latimeEcran() {
  let lo = 200, hi = 4000;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (matchMedia(`(min-width:${m}px)`).matches) lo = m; else hi = m; }
  // pe unele telefoane și media query-ul urmează pagina umflată; ecranul fizic (latura potrivită orientării) e plafonul
  const sw = screen?.width, sh = screen?.height;
  const fizic = sw && sh ? (matchMedia('(orientation: landscape)').matches ? Math.max(sw, sh) : Math.min(sw, sh)) : Infinity;
  return Math.min(lo, fizic);
}

// la rotirea telefonului, la schimbarea lățimii, când aplicația își completează antetul (căutare, ceas, nume)
// sau când se încarcă fonturile, antetul se verifică din nou
let tRev = 0;
function reverifica() {
  clearTimeout(tRev);
  tRev = setTimeout(() => { for (const d of document.querySelectorAll('.icc-doc')) strange(d); }, 150);
}
if (typeof window !== 'undefined' && !window.__iccDocRedim) {
  window.__iccDocRedim = true;
  window.addEventListener('resize', reverifica);
  document.fonts?.ready?.then(reverifica);
}
function urmareste(d) {
  const hdr = d.closest('header') || d.parentElement?.parentElement?.parentElement;
  if (!hdr || typeof MutationObserver !== 'function') return;
  new MutationObserver((m) => { if (m.some((x) => !d.contains(x.target))) reverifica(); })
    .observe(hdr, { childList: true, subtree: true, characterData: true });
}

// e încă la locul lui? (antetul poate fi redesenat de aplicație, iar pe ecran lat butonul trebuie să revină în colț)
export function bineAsezat(nod) {
  const inAntet = !!nod && nod.isConnected && !!nod.parentNode?.classList?.contains('icc-doc') && !!nod.parentNode.getClientRects().length;
  return TELEFON.matches ? (inAntet || !locas()) : !nod?.parentNode?.classList?.contains('icc-doc');
}
