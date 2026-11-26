// icc-aspect v1 – întrebările lui Ion și ale firelor către colegi, în orice aplicație Instalcorp (Ion, 25.11.2026).
//
// Ce vede colegul care are întrebări NERĂSPUNSE (altfel nu vede nimic):
//   • în antet, lângă cercul cu inițiale, eticheta „N seturi de întrebări”; un clic deschide formularul oricând;
//   • pe calculator (ecran lat și maus) formularul apare singur, o dată la orele 10:00, 13:00 și 15:00 (ora României),
//     doar în tabul la care se uită omul; „Mai târziu” îl amână până la ora fixă următoare;
//   • „Trimite” trimite tot ce e completat, chiar dacă nu e tot (Ion, 26.11.2026): răspunsurile trimise ies din formular,
//     întrebările rămase revin ca listă restrânsă la orele fixe; „Istoricul meu” arată răspunsurile deja trimise;
//   • pe telefon și tabletă nu apare nimic singur: o bară sub antet cu „Răspunde”, care deschide formularul ca foaie de jos.
// Ce vede Ion (administratorul): eticheta verde „N răspunsuri noi” (sau gri „N deschise”) și panoul cu toate seturile,
//   răspunsurile primite, cine a văzut, cine a amânat; „Am văzut” și „Redeschide”.
//
// Mai multe taburi și aplicații: totul stă în bază (schema intrebari). Ciorna se salvează la fiecare răspuns; când ceva se
// schimbă, baza atinge rândul omului din intrebari.semnal, iar toate taburile lui (în orice aplicație) se reîncarcă prin timp real.
// Așa, un set trimis într-un tab se închide și în celelalte, iar fereastra de la ora fixă apare într-un singur tab.
//
// Folosire: nimic de făcut în aplicații. Pornește singură când <icc-aplicatie>, <icc-vasile> sau <icc-tasker> primesc clientul
// Supabase (ca pazaMfa). Manual: import { intrebari } from 'icc-aspect/v1/intrebari.js'; intrebari(supabase, { aplicatie: 'OPS' }).

const TAB = Math.random().toString(36).slice(2, 8);
const SVG = (d, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = { q: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  st: '<path d="m15 18-6-6 6-6"/>', dr: '<path d="m9 18 6-6-6-6"/>', ceas: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', ok: '<path d="M20 6 9 17l-5-5"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hm = (iso) => new Date(iso).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' });
const zi = (iso) => new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Bucharest' });
const ziRo = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
const cand = (iso) => { const z = Math.round((Date.parse(ziRo(iso)) - Date.parse(ziRo(Date.now()))) / 864e5); return (z === 0 ? 'azi ' : z === 1 ? 'mâine ' : zi(iso) + ' ') + hm(iso); };
function termenText(iso) {
  if (!iso) return null;
  if (Date.parse(iso) < Date.now()) return ['depășit', 'rosu'];
  const z = Math.round((Date.parse(ziRo(iso)) - Date.parse(ziRo(Date.now()))) / 864e5);
  return [cand(iso), z === 0 ? 'rosu' : z === 1 ? 'gal' : ''];
}
const DESEN = typeof matchMedia === 'function' ? matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)') : { matches: true, addEventListener() {} };
const intrebariReale = (s) => (s.intrebari || []).filter((q) => q.tip !== 'sectiune');
const trimisa = (s, q) => !!s.raspunsuri && Object.prototype.hasOwnProperty.call(s.raspunsuri, q.cheie);
const ramase = (s) => intrebariReale(s).filter((q) => !trimisa(s, q));
// întrebările rămase, cu secțiunile care mai au cel puțin o întrebare rămasă sub ele
function deAfisat(s) {
  const l = s.intrebari || []; const out = [];
  l.forEach((q, i) => {
    if (q.tip !== 'sectiune') { if (!trimisa(s, q)) out.push(q); return; }
    for (let j = i + 1; j < l.length && l[j].tip !== 'sectiune'; j++) if (!trimisa(s, l[j])) { out.push(q); return; }
  });
  return out;
}
const linkSigur = (u) => (/^https:\/\//i.test(u || '') ? u : null);

const STIL = `
.icq{--q-pri:var(--icc-primary,#2f5bff);--q-bg:var(--icc-background,#fff);--q-fg:var(--icc-foreground,#292929);--q-card:var(--icc-card,#fff);
  --q-surf:var(--icc-surface,#f6f6f6);--q-mut:var(--icc-muted-foreground,#6d6d6d);--q-bd:var(--icc-border,rgba(41,41,41,.12));
  --q-acc:var(--icc-accent,rgba(41,41,41,.06));--q-rosu:#dc2626;--q-gal:#b45309;--q-galbg:#fff7e6;--q-galbd:#f3d189;--q-verde:#15803d;--q-verdebg:#ecfdf3;--q-verdebd:#a7e3bd;
  font-family:var(--font-sans,"Inter Tight",Inter,system-ui,sans-serif);font-size:14px;line-height:1.45;color:var(--q-fg);font-weight:400;letter-spacing:normal;text-align:left}
:root[data-theme=dark] .icq,.dark .icq{--q-bg:var(--icc-background,#191919);--q-fg:var(--icc-foreground,#ededed);--q-card:var(--icc-card,#212121);
  --q-surf:var(--icc-surface,#212121);--q-mut:var(--icc-muted-foreground,#969696);--q-bd:var(--icc-border,rgba(237,237,237,.14));
  --q-acc:var(--icc-accent,rgba(237,237,237,.06));--q-rosu:#f87171;--q-gal:#fbbf24;--q-galbg:#2a2210;--q-galbd:#6b5214;--q-verde:#4ade80;--q-verdebg:#0f2a1a;--q-verdebd:#22643b}
.icq *{box-sizing:border-box}.icq button{font:inherit;color:inherit;cursor:pointer}
.icq-loc{display:inline-flex;align-items:center;align-self:center}.icq-loc:empty{display:none}
.icq-chip{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px 0 8px;border-radius:999px;border:1px solid var(--q-galbd);
  background:var(--q-galbg);color:var(--q-gal);font-weight:600;font-size:12.5px;white-space:nowrap;margin-right:8px}
.icq-chip.urgent{border-color:color-mix(in srgb,var(--q-rosu) 45%,transparent);background:color-mix(in srgb,var(--q-rosu) 10%,var(--q-bg));color:var(--q-rosu)}
.icq-chip.verde{border-color:var(--q-verdebd);background:var(--q-verdebg);color:var(--q-verde)}
.icq-chip.gri{border-color:var(--q-bd);background:var(--q-acc);color:var(--q-mut)}
.icq-chip:focus-visible{outline:2px solid var(--q-pri);outline-offset:2px}
.icq-chip b{font-variant-numeric:tabular-nums}
@media (max-width:640px){.icq-chip{height:26px;padding:0 8px 0 6px;font-size:12px;margin-right:6px}.icq-chip .lung{display:none}}
.icq-voal{position:fixed;inset:0;z-index:2147483100;background:rgba(15,20,30,.38);display:flex;align-items:flex-start;justify-content:center;padding:clamp(16px,7vh,80px) 16px 16px;animation:icq-in .16s ease-out}
@keyframes icq-in{from{opacity:0}to{opacity:1}}
@keyframes icq-sus{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.icq-voal,.icq-fer,.icq-foaie{animation:none!important}}
.icq-fer{width:min(640px,100%);max-height:calc(100vh - clamp(32px,10vh,100px));background:var(--q-bg);border:1px solid var(--q-bd);border-radius:14px;
  box-shadow:0 24px 70px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;animation:icq-sus .2s ease-out}
.icq-fer.lat{width:min(860px,100%)}
.icq-hd{display:flex;align-items:flex-start;gap:10px;padding:14px 16px 10px;border-bottom:1px solid var(--q-bd);flex-shrink:0}
.icq-hd .ic{width:32px;height:32px;border-radius:8px;background:color-mix(in srgb,var(--q-pri) 12%,transparent);color:var(--q-pri);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.icq-hd .tt{flex:1;min-width:0}
.icq-hd h3{margin:0;font-size:15.5px;font-weight:650;line-height:1.3;text-wrap:balance;color:var(--q-fg)}
.icq-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;font-size:12px;color:var(--q-mut);align-items:center}
.icq-tag{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 7px;border-radius:5px;font-size:11.5px;font-weight:600;background:var(--q-acc);color:var(--q-fg)}
.icq-tag.rosu{background:color-mix(in srgb,var(--q-rosu) 13%,transparent);color:var(--q-rosu)}
.icq-tag.gal{background:var(--q-galbg);color:var(--q-gal)}.icq-tag.verde{background:var(--q-verdebg);color:var(--q-verde)}
.icq-ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:7px;border:0;background:transparent;color:var(--q-mut);flex-shrink:0}
.icq-ib:hover{background:var(--q-acc);color:var(--q-fg)}.icq-ib:disabled{opacity:.35;cursor:default;background:none}
.icq-nav{display:flex;align-items:center;gap:2px;font-size:12px;color:var(--q-mut);font-variant-numeric:tabular-nums;flex-shrink:0}
.icq-bd{flex:1;min-height:0;overflow-y:auto;padding:12px 16px 14px;display:flex;flex-direction:column;gap:14px;overscroll-behavior:contain}
.icq-desc{font-size:13px;color:var(--q-mut);background:var(--q-surf);border-radius:8px;padding:8px 10px;white-space:pre-line}
.icq-desc a{color:var(--q-pri)}
.icq-alt{font-size:13px;border:1px solid var(--q-galbd);background:var(--q-galbg);border-radius:8px;padding:8px 10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.icq-sec{font-weight:650;font-size:13.5px;padding-top:4px;border-top:1px solid var(--q-bd);margin-top:2px}
.icq-sec small{display:block;font-weight:400;font-size:12px;color:var(--q-mut);white-space:pre-line}
.icq-q label.t{display:block;font-weight:600;font-size:13.5px;margin-bottom:4px;overflow-wrap:anywhere;white-space:pre-line}
.icq-q label.t span{color:var(--q-mut);font-weight:500;margin-right:4px;font-variant-numeric:tabular-nums}
.icq-q .aj{font-size:12px;color:var(--q-mut);margin:-2px 0 5px;white-space:pre-line}
.icq-q textarea,.icq-q input[type=date],.icq-q input[type=number]{width:100%;font:inherit;font-size:14px;color:var(--q-fg);background:var(--q-bg);
  border:1px solid var(--q-bd);border-radius:7px;padding:7px 9px;outline:none}
.icq-q textarea{min-height:58px;resize:vertical}
.icq-q textarea:focus,.icq-q input:focus{border-color:var(--q-pri);box-shadow:0 0 0 3px color-mix(in srgb,var(--q-pri) 18%,transparent)}
.icq-q.lipsa textarea,.icq-q.lipsa input,.icq-q.lipsa .icq-ops{box-shadow:0 0 0 2px color-mix(in srgb,var(--q-rosu) 55%,transparent);border-radius:7px}
.icq-ops{display:flex;flex-wrap:wrap;gap:6px}
.icq-op{height:32px;padding:0 12px;border-radius:7px;border:1px solid var(--q-bd);background:var(--q-bg);font-size:13px;font-weight:500}
.icq-op:hover{background:var(--q-acc)}.icq-op.on{background:var(--q-pri);border-color:var(--q-pri);color:#fff}
.icq-num{display:flex;align-items:center;gap:8px;max-width:240px}.icq-num span{color:var(--q-mut);font-size:13px}
.icq-ns{border:0;background:none;padding:0;margin-top:4px;font-size:12px;color:var(--q-mut);text-decoration:underline;text-underline-offset:2px}
.icq-ft{display:flex;align-items:center;gap:8px;padding:10px 16px;border-top:1px solid var(--q-bd);background:var(--q-surf);flex-shrink:0;flex-wrap:wrap}
.icq-ft .sp{flex:1}.icq-ft .stare{font-size:12px;color:var(--q-mut)}
.icq-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 13px;border-radius:7px;border:1px solid var(--q-bd);
  background:var(--q-bg);font-size:13px;font-weight:600;white-space:nowrap;text-decoration:none;color:var(--q-fg)}
.icq-b:hover{background:var(--q-acc)}.icq-b.pri{background:var(--q-pri);border-color:var(--q-pri);color:#fff}.icq-b.pri:hover{filter:brightness(1.08)}
.icq-b.rosu{background:var(--q-rosu);border-color:var(--q-rosu);color:#fff}.icq-b:disabled{opacity:.55;cursor:default}
.icq-b.mic{height:28px;padding:0 10px;font-size:12px}
.icq-conf{border:1px solid color-mix(in srgb,var(--q-rosu) 35%,transparent);background:color-mix(in srgb,var(--q-rosu) 7%,var(--q-bg));border-radius:8px;padding:9px 10px;font-size:13px}
/* telefon și tabletă */
.icq-bara{position:sticky;z-index:40;display:flex;align-items:center;gap:8px;padding:7px max(12px,env(safe-area-inset-right,0px)) 7px max(12px,env(safe-area-inset-left,0px));
  background:var(--q-galbg);border-bottom:1px solid var(--q-galbd);color:var(--q-fg);font-size:13px}
.icq-bara.urgent{background:color-mix(in srgb,var(--q-rosu) 11%,var(--q-bg));border-color:color-mix(in srgb,var(--q-rosu) 35%,transparent)}
.icq-bara .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.icq-bara .icq-b{height:30px;padding:0 10px;font-size:12.5px}
.icq-voal.jos{align-items:flex-end;padding:0}
.icq-foaie{width:100%;max-width:720px;height:min(88dvh,100%);background:var(--q-bg);border-radius:16px 16px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.25);
  display:flex;flex-direction:column;overflow:hidden;animation:icq-urca .22s ease-out;padding-bottom:env(safe-area-inset-bottom,0px)}
@keyframes icq-urca{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
.icq-foaie .maner{width:40px;height:4px;border-radius:2px;background:var(--q-bd);margin:7px auto 0;flex-shrink:0}
.icq-foaie .icq-hd{padding:8px 14px 9px}.icq-foaie .icq-bd{padding:10px 14px 14px}.icq-foaie .icq-ft{padding:9px 14px}
.icq-foaie .icq-ft .icq-b{flex:1}.icq-foaie .icq-ft .stare,.icq-foaie .icq-ft .sp{display:none}
.icq-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483200;background:var(--q-fg);color:var(--q-bg);padding:9px 14px;border-radius:9px;
  font-size:13px;font-weight:500;box-shadow:0 10px 30px rgba(0,0,0,.25);display:flex;gap:8px;align-items:center;max-width:calc(100% - 32px)}
/* panoul lui Ion */
.icq-adm h4{margin:2px 0 0;font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.04em;color:var(--q-mut)}
.icq-set{border:1px solid var(--q-bd);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:var(--q-card)}
.icq-set.nou{border-color:var(--q-verdebd);box-shadow:0 0 0 1px var(--q-verdebd)}
.icq-set .r1{display:flex;gap:8px;align-items:flex-start}.icq-set .r1 b{flex:1;font-size:13.5px}
.icq-set .mt{font-size:12px;color:var(--q-mut)}
.icq-qa{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12.5px;margin:2px 0}
.icq-qa .n{color:var(--q-mut);font-variant-numeric:tabular-nums}.icq-qa .qq{color:var(--q-mut)}.icq-qa .rr{font-weight:600;white-space:pre-line;margin-bottom:5px}
.icq-qa .sec{grid-column:1/-1;font-weight:650;margin-top:4px}
.icq-set details summary{cursor:pointer;font-size:12.5px;color:var(--q-pri)}
.icq-gol{color:var(--q-mut);font-size:13px}
`;

class IccIntrebari extends HTMLElement {
  connectedCallback() {
    if (this._pornit) return; this._pornit = true;
    if (!document.getElementById('icq-stil')) { const s = document.createElement('style'); s.id = 'icq-stil'; s.textContent = STIL; document.head.append(s); }
    this.style.display = 'none';
    this._date = null; this._deschis = null; this._idx = 0; this._admin = false;
    addEventListener('focus', () => this.incarca());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.incarca(); });
    DESEN.addEventListener?.('change', () => this.deseneaza());
    addEventListener('pagehide', () => this._elibereaza());
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape' || !this._deschis) return; this._deschis.tip === 'set' ? this.amana() : this.inchide(); });
    setInterval(() => this.incarca(), 60000);
    // antetul aplicației se poate redesena (cont.js păstrează locașul; altele nu): punem eticheta la loc
    this._obs = new MutationObserver(() => {
      if (this._rafObs || !this._date || document.querySelector('.icq-chip')) return;
      this._rafObs = requestAnimationFrame(() => { this._rafObs = 0; this.deseneaza(); });
    });
    this._obs.observe(document.body, { childList: true, subtree: true });
  }
  // ---- legătura cu baza ----
  async porneste(sb, aplicatie) {
    this._sb = sb; this._app = aplicatie || this._app;
    const { data } = await sb.auth.getSession();
    const uid = data?.session?.user?.id || null;
    if (uid !== this._uid) { this._uid = uid; this._ch?.unsubscribe?.(); this._ch = null; }
    if (!uid) { this._date = null; this.inchide(); this.deseneaza(); return; }
    if (!this._ch && sb.channel) {
      this._ch = sb.channel('icc-intrebari-' + uid + '-' + TAB)
        .on('postgres_changes', { event: '*', schema: 'intrebari', table: 'semnal', filter: 'user_id=eq.' + uid }, () => {
          clearTimeout(this._tRt); this._tRt = setTimeout(() => this.incarca(), 300);
        })
        .subscribe();
    }
    await this.incarca();
  }
  rpc(f, args) { return this._sb.schema('intrebari').rpc(f, args); }
  async incarca() {
    if (!this._sb || !this._uid || this._incarc) return;
    this._incarc = true;
    try {
      const { data, error } = await this.rpc('mele');
      if (error) throw error;
      this._date = data || { seturi: [] };
    } catch (x) { console.warn('icc-intrebari:', x?.message || x); this._incarc = false; return; }
    this._incarc = false;
    // ora fixă următoare: verificăm exact atunci, nu doar la 60 s
    clearTimeout(this._tOra);
    const urm = Date.parse(this._date.urmatoarea_ora || '') - Date.now();
    if (urm > 0 && urm < 864e5) this._tOra = setTimeout(() => this.incarca(), urm + 1500);
    this._laSchimbare();
  }
  seturi() { return this._date?.seturi || []; }
  _laSchimbare() {
    if (this._deschis?.tip === 'set') {
      const lista = this.seturi();
      const s = lista.find((x) => x.id === this._deschis.id);
      if (!s) {
        this._lista = (this._lista || []).filter((id) => lista.some((x) => x.id === id));
        if (this._lista.length) { this._idx = Math.min(this._idx, this._lista.length - 1); this._arata(); this._toast('Un set a fost trimis din alt tab.'); }
        else { this.inchide(); this._toast('Răspunsurile au fost trimise din alt tab.'); }
      } else this._umple(s);
    } else if (this._deschis?.tip === 'admin') this._admin && this._arataAdmin(true);
    this.deseneaza();
    this._poateArata();
  }
  // Regula lui Ion (25.11.2026): fereastra apare singură la 10, 13 și 15, doar dacă omul are întrebări nerăspunse,
  // doar pe calculator, doar în tabul văzut și cu focus. Baza spune „de_aratat” și ține minte că s-a arătat (afisat).
  _poateArata() {
    if (this._deschis || !DESEN.matches || !this._date?.de_aratat || !this.seturi().length) return;
    if (document.visibilityState !== 'visible' || !document.hasFocus() || !this._loc()) return;
    this.deschide(true);
  }
  // ---- eticheta (antet) și bara (telefon) ----
  _loc() {
    const u = [...document.querySelectorAll('icc-utilizator')].find((x) => x.getClientRects().length);
    if (!u) return null;
    let d = u.querySelector(':scope > .icq-loc');
    if (!d) { d = document.createElement('span'); d.className = 'icq-loc'; u.prepend(d); }
    return d;
  }
  deseneaza() {
    const lista = this.seturi(); const n = lista.length; const urgent = lista.some((s) => s.urgent);
    const adm = this._date?.admin; const noi = this._date?.raspunsuri_noi || 0; const desch = this._date?.deschise_total || 0;
    let chip = document.querySelector('.icq-chip');
    const arata = n || (adm && (noi || desch));
    // fără cercul cu inițiale pe ecran (ecranul de intrare, omul a ieșit) nu arătăm nimic
    const loc = this._loc();
    if (!arata || !loc) { chip?.remove(); document.querySelector('.icq-bara')?.remove(); return; }
    if (!chip) { chip = document.createElement('button'); chip.type = 'button'; chip.className = 'icq icq-chip'; }
    if (chip.parentNode !== loc) loc.append(chip);
    chip.classList.remove('urgent', 'verde', 'gri');
    if (n) {
      chip.classList.toggle('urgent', urgent);
      chip.innerHTML = `${SVG(I.q, 15)}<b>${n}</b> <span class="lung">${n === 1 ? 'set de întrebări' : 'seturi de întrebări'}</span>`;
      chip.title = 'Întrebări de la Ion și de la fire'; chip.onclick = () => this.deschide(false);
    } else {
      chip.classList.add(noi ? 'verde' : 'gri');
      chip.innerHTML = noi ? `${SVG(I.ok, 15)}<b>${noi}</b> <span class="lung">${noi === 1 ? 'răspuns nou' : 'răspunsuri noi'}</span>`
        : `${SVG(I.q, 15)}<b>${desch}</b> <span class="lung">${desch === 1 ? 'set deschis' : 'seturi deschise'}</span>`;
      chip.title = 'Întrebările trimise colegilor și răspunsurile lor'; chip.onclick = () => this.deschideAdmin();
    }
    let bara = document.querySelector('.icq-bara');
    if (DESEN.matches || !n) { bara?.remove(); return; }
    const ant = document.querySelector('header');
    if (!bara) { bara = document.createElement('div'); bara.className = 'icq icq-bara'; ant ? ant.after(bara) : document.body.prepend(bara); }
    bara.style.top = ant && /sticky|fixed/.test(getComputedStyle(ant).position) ? ant.offsetHeight + 'px' : '0px';
    bara.classList.toggle('urgent', urgent);
    const q = lista.reduce((t, s) => t + ramase(s).length, 0);
    bara.innerHTML = `${SVG(I.q, 16)}<span class="tx"><b>${q} ${q === 1 ? 'întrebare' : 'întrebări'}</b> de la Ion${urgent ? ' · <b>urgent</b>' : ''}</span>
      <button type="button" class="icq-b pri" data-r>Răspunde</button>`;
    bara.querySelector('[data-r]').onclick = () => this.deschide(false);
  }
  // ---- formularul ----
  deschide(automat) {
    const lista = this.seturi(); if (!lista.length) return;
    this._lista = lista.map((s) => s.id); this._idx = 0;
    if (automat) this.rpc('afisat', { p_seturi: this._lista, p_amana: false }).then(({ error }) => error && console.warn(error.message));
    this._arata();
  }
  _set() { return this.seturi().find((s) => s.id === this._lista?.[this._idx]); }
  _altTab(s) {
    const d = s.deschis_in;
    return d && d.tab !== TAB && Date.now() - Date.parse(d.la) < 10 * 60000 ? d : null;
  }
  _arata() {
    const s = this._set(); if (!s) return this.inchide();
    const alt = this._altTab(s);
    if (!alt && s.deschis_in?.tab !== TAB) this.rpc('deschis_in', { p_set: s.id, p_tab: TAB, p_app: this._app }).then(() => {});
    this._deschis = { tip: 'set', id: s.id };
    this._ciorna = { ...(s.ciorna || {}) };
    const calc = DESEN.matches; const tt = termenText(s.termen); const total = this._lista.length;
    const nq = ramase(s).length; const nt = intrebariReale(s).length - nq; const leg = linkSigur(s.legatura);
    let nr = 0;
    const corp = deAfisat(s).map((q) => q.tip === 'sectiune'
      ? `<div class="icq-sec">${esc(q.text)}${q.ajutor ? `<small>${esc(q.ajutor)}</small>` : ''}</div>`
      : this._q(q, ++nr, this._ciorna[q.cheie], !!alt)).join('');
    document.querySelector('.icq-voal')?.remove();
    const v = document.createElement('div'); v.className = 'icq icq-voal' + (calc ? '' : ' jos');
    v.innerHTML = `<div class="${calc ? 'icq-fer' : 'icq-foaie'}" role="dialog" aria-modal="true" aria-labelledby="icq-t">
      ${calc ? '' : '<div class="maner"></div>'}
      <div class="icq-hd"><span class="ic">${SVG(I.q, 17)}</span>
        <div class="tt"><h3 id="icq-t">${esc(s.titlu)}</h3>
          <div class="icq-meta"><span class="icq-tag">de la ${esc(s.de_la)}</span>${s.subiect ? `<span class="icq-tag">${esc(s.subiect)}</span>` : ''}
          ${tt ? `<span class="icq-tag ${tt[1]}">${SVG(I.ceas, 12)} termen ${esc(tt[0])}</span>` : ''}${s.urgent ? '<span class="icq-tag rosu">urgent</span>' : ''}
          <span>${nq} ${nq === 1 ? 'întrebare' : 'întrebări'}${nt ? (nq === 1 ? ' rămasă' : ' rămase') : ''}</span>${nt ? `<span class="icq-tag verde">${SVG(I.ok, 12)} ${nt} ${nt === 1 ? 'trimisă' : 'trimise'}</span>` : ''}</div></div>
        ${total > 1 ? `<div class="icq-nav"><button type="button" class="icq-ib" data-st ${this._idx ? '' : 'disabled'} aria-label="Setul anterior">${SVG(I.st)}</button>${this._idx + 1}/${total}<button type="button" class="icq-ib" data-dr ${this._idx < total - 1 ? '' : 'disabled'} aria-label="Setul următor">${SVG(I.dr)}</button></div>` : ''}
        <button type="button" class="icq-ib" data-x aria-label="Închide (răspund mai târziu)">${SVG(I.x)}</button></div>
      <div class="icq-bd">
        ${alt ? `<div class="icq-alt">Completezi deja acest set în <b>${esc(alt.app || 'altă aplicație')}</b> (alt tab). <button type="button" class="icq-b" data-preia>Continuă aici</button></div>` : ''}
        ${s.descriere || leg ? `<div class="icq-desc">${esc(s.descriere || '')}${leg ? `${s.descriere ? '\n' : ''}<a href="${esc(leg)}" target="_blank" rel="noopener">Deschide lucrarea</a>` : ''}</div>` : ''}
        ${corp}
      </div>
      <div class="icq-ft">
        <button type="button" class="icq-b" data-amana>${SVG(I.ceas, 14)} Mai târziu</button>
        ${this._date?.are_istoric ? '<button type="button" class="icq-b" data-istoric>Istoricul meu</button>' : ''}
        <span class="stare" data-stare>${s.ciorna_la ? 'Ciorna e salvată ' + cand(s.ciorna_la) : 'Fiecare răspuns se salvează singur'}</span><span class="sp"></span>
        <button type="button" class="icq-b pri" data-trimite ${alt ? 'disabled' : ''} title="Trimite tot ce ai completat; întrebările fără răspuns rămân pentru mai târziu">${SVG(I.ok, 14)} Trimite</button>
      </div></div>`;
    document.body.append(v);
    const f = v.firstElementChild;
    v.addEventListener('mousedown', (e) => { if (e.target === v && calc) this.amana(); });
    f.querySelector('[data-x]').onclick = () => this.amana();
    f.querySelector('[data-st]')?.addEventListener('click', () => { this._elibereaza(); this._idx--; this._arata(); });
    f.querySelector('[data-dr]')?.addEventListener('click', () => { this._elibereaza(); this._idx++; this._arata(); });
    f.querySelector('[data-preia]')?.addEventListener('click', async () => { await this.rpc('deschis_in', { p_set: s.id, p_tab: TAB, p_app: this._app }); s.deschis_in = { tab: TAB }; this._arata(); });
    f.querySelector('[data-amana]').onclick = () => this.amana();
    f.querySelector('[data-istoric]')?.addEventListener('click', async () => { await this._golesteCiorna(); this._elibereaza(); this.deschideIstoric(); });
    f.querySelector('[data-trimite]').onclick = () => this._trimite(f, s);
    f.querySelectorAll('[data-op]').forEach((btn) => btn.onclick = () => {
      btn.closest('.icq-ops').querySelectorAll('.icq-op').forEach((o) => o.classList.toggle('on', o === btn));
      this._salveaza(btn.closest('.icq-q').dataset.q, btn.dataset.op, true);
    });
    f.querySelectorAll('[data-ns]').forEach((btn) => btn.onclick = () => { const q = btn.closest('.icq-q'); const inp = q.querySelector('textarea,input'); if (inp) inp.value = 'nu știu'; this._salveaza(q.dataset.q, 'nu știu', true); });
    f.querySelectorAll('textarea,input').forEach((inp) => inp.oninput = () => this._salveaza(inp.closest('.icq-q').dataset.q, inp.value, false));
    if (calc) setTimeout(() => f.querySelector(alt ? '[data-preia]' : 'textarea,input,.icq-op')?.focus({ preventScroll: true }), 60);
    this.deseneaza();
  }
  _q(q, nr, val, ro) {
    const d = ro ? 'disabled' : ''; const id = 'icq-' + esc(q.cheie);
    const lab = `<label class="t" for="${id}"><span>${nr}.</span>${esc(q.text)}</label>${q.ajutor ? `<div class="aj">${esc(q.ajutor)}</div>` : ''}`;
    const ops = (l) => `<div class="icq-ops" role="group">${l.map((o) => `<button type="button" class="icq-op${val === o ? ' on' : ''}" data-op="${esc(o)}" ${d}>${esc(o)}</button>`).join('')}</div>`;
    const ns = `<button type="button" class="icq-ns" data-ns ${d}>Nu știu</button>`;
    let corp;
    if (q.tip === 'danu') corp = ops(['Da', 'Nu', 'nu știu']);
    else if (q.tip === 'alegere') corp = ops([...(Array.isArray(q.optiuni) ? q.optiuni : []), 'nu știu']);
    else if (q.tip === 'numar') corp = `<div class="icq-num"><input id="${id}" type="text" inputmode="decimal" value="${esc(val)}" ${d}><span>${esc(q.unitate || '')}</span></div>${ns}`;
    else if (q.tip === 'data') corp = `<input id="${id}" type="date" value="${esc(/^\d{4}-\d{2}-\d{2}$/.test(val || '') ? val : '')}" style="max-width:200px" ${d}><br>${ns}`;
    else corp = `<textarea id="${id}" rows="2" placeholder="Răspunsul tău" ${d}>${esc(val)}</textarea>${ns}`;
    return `<div class="icq-q" data-q="${esc(q.cheie)}">${lab}${corp}</div>`;
  }
  // răspunsurile venite din alt tab apar și aici (fără să atingem câmpul în care scrie omul)
  _umple(s) {
    const f = document.querySelector('.icq-voal'); if (!f) return;
    if (!!this._altTab(s) !== !!f.querySelector('.icq-alt')) return this._arata();
    if (f.querySelectorAll('.icq-q').length !== ramase(s).length) return this._arata();
    for (const q of s.intrebari || []) {
      if (q.tip === 'sectiune' || trimisa(s, q) || q.cheie in (this._asteapta || {})) continue;
      const el = f.querySelector(`.icq-q[data-q="${CSS.escape(q.cheie)}"]`); if (!el) continue;
      const v = (s.ciorna || {})[q.cheie] ?? ''; this._ciorna[q.cheie] = v;
      const inp = el.querySelector('textarea,input'); if (inp && document.activeElement !== inp && inp.value !== v) inp.value = v;
      el.querySelectorAll('.icq-op').forEach((o) => o.classList.toggle('on', o.dataset.op === v));
    }
  }
  _salveaza(cheie, v, imediat) {
    this._ciorna[cheie] = v; (this._asteapta ??= {})[cheie] = v;
    document.querySelector(`.icq-q[data-q="${CSS.escape(cheie)}"]`)?.classList.remove('lipsa');
    const st = document.querySelector('[data-stare]'); if (st) st.textContent = 'Se salvează…';
    clearTimeout(this._tSal); this._tSal = setTimeout(() => this._golesteCiorna(), imediat ? 0 : 700);
  }
  async _golesteCiorna() {
    const r = this._asteapta; this._asteapta = null; const id = this._deschis?.id;
    if (!r || !id) return;
    const { error } = await this.rpc('salveaza', { p_set: id, p_raspunsuri: r, p_tab: TAB, p_app: this._app });
    const st = document.querySelector('[data-stare]');
    if (st) st.textContent = error ? 'Nu s-a salvat: ' + error.message : 'Ciorna e salvată ' + hm(new Date().toISOString());
  }
  async amana() {
    await this._golesteCiorna();
    const ids = this._lista || [];
    this._elibereaza(); this.inchide();
    if (ids.length) await this.rpc('afisat', { p_seturi: ids, p_amana: true });
    const urm = this._date?.urmatoarea_ora;
    this._toast(DESEN.matches && urm ? `Te întreb din nou ${cand(urm)}. Eticheta din antet rămâne.` : 'Răspunsurile tale sunt salvate. Le găsești la eticheta din antet.');
  }
  // Un singur buton „Trimite” (Ion, 26.11.2026): pleacă tot ce e completat; restul rămâne și revine la orele fixe.
  async _trimite(f, s) {
    await this._golesteCiorna();
    const qs = ramase(s);
    const gata = qs.filter((q) => String(this._ciorna[q.cheie] ?? '').trim());
    const rest = qs.length - gata.length;
    f.querySelector('.icq-conf')?.remove();
    const bd = f.querySelector('.icq-bd');
    if (!gata.length) { bd.insertAdjacentHTML('beforeend', '<div class="icq-conf">Nu ai completat niciun răspuns. Scrie cel puțin un răspuns (sau apasă „Nu știu”), apoi „Trimite”.</div>'); bd.lastElementChild.scrollIntoView({ block: 'nearest' }); return; }
    const urm = this._date?.urmatoarea_ora;
    const txtRest = rest ? ` Rămân ${rest === 1 ? 'o întrebare fără răspuns' : rest + ' întrebări fără răspuns'}; ${rest === 1 ? 'o primești' : 'le primești'} din nou${urm ? ' ' + cand(urm) : ' la ora fixă următoare'}.` : '';
    bd.insertAdjacentHTML('beforeend', `<div class="icq-conf"><b>Trimiți ${gata.length === 1 ? 'răspunsul' : gata.length + ' răspunsuri'}?</b> După trimitere nu le mai poți schimba; doar Ion le poate redeschide.${esc(txtRest)}
      <div style="display:flex;gap:8px;margin-top:8px"><button type="button" class="icq-b" data-nu>Mai verific</button><button type="button" class="icq-b rosu" data-da>Da, trimite</button></div></div>`);
    bd.lastElementChild.scrollIntoView({ block: 'nearest' });
    bd.querySelector('[data-nu]').onclick = () => bd.querySelector('.icq-conf').remove();
    bd.querySelector('[data-da]').onclick = async (e) => {
      e.currentTarget.disabled = true;
      const { data, error } = await this.rpc('trimite', { p_set: s.id, p_raspunsuri: this._ciorna });
      if (error) { bd.querySelector('.icq-conf').textContent = error.message; return; }
      if (this._date) this._date.are_istoric = true;
      if (data?.complet || !data?.raman) {
        this._toast('Răspunsurile au plecat la Ion. Mulțumim!');
        this._lista = this._lista.filter((id) => id !== s.id); this._idx = Math.min(this._idx, this._lista.length - 1);
        this._date.seturi = this.seturi().filter((x) => x.id !== s.id);
        if (this._lista.length) this._arata(); else this.inchide();
      } else {
        this._toast(`Am trimis ${data.trimise === 1 ? 'un răspuns' : data.trimise + ' răspunsuri'}. Rămân ${data.raman === 1 ? 'o întrebare' : data.raman + ' întrebări'} pentru mai târziu.`);
        const r = { ...(s.raspunsuri || {}) }; const c = { ...(s.ciorna || {}) };
        for (const q of gata) { r[q.cheie] = String(this._ciorna[q.cheie]).trim(); delete c[q.cheie]; }
        s.raspunsuri = r; s.ciorna = c; this._arata();
      }
      this.incarca();
    };
  }
  // ---- istoricul colegului: răspunsurile deja trimise (doar citire) ----
  async deschideIstoric() {
    this._deschis = { tip: 'istoric' };
    const { data, error } = await this.rpc('istoric', { p_zile: 90 });
    if (this._deschis?.tip !== 'istoric') return;
    const l = error ? [] : data || []; const calc = DESEN.matches;
    const card = (s) => { let n = 0; const tr = s.trimise || {};
      const rows = (s.intrebari || []).filter((q) => q.tip !== 'sectiune' && trimisa(s, q)).map((q) =>
        `<span class="n">${++n}.</span><span class="qq">${esc(q.text)}</span><span></span><span class="rr">${esc(s.raspunsuri[q.cheie])}${tr[q.cheie]?.la ? ` <small style="font-weight:400;color:var(--q-mut)">· trimis ${cand(tr[q.cheie].la)}</small>` : ''}</span>`).join('');
      const rest = ramase(s).length;
      return `<div class="icq-set"><div class="r1"><b>${esc(s.titlu)}</b></div>
        <div class="mt">${esc(s.de_la)}${s.subiect ? ' · ' + esc(s.subiect) : ''}${s.trimis_la ? ' · complet' : rest ? ` · mai ${rest === 1 ? 'ai o întrebare' : 'ai ' + rest + ' întrebări'} de răspuns` : ''}</div>
        <div class="icq-qa">${rows}</div></div>`; };
    document.querySelector('.icq-voal')?.remove();
    const v = document.createElement('div'); v.className = 'icq icq-voal' + (calc ? '' : ' jos'); document.body.append(v);
    v.innerHTML = `<div class="${calc ? 'icq-fer lat' : 'icq-foaie'} icq-adm" role="dialog" aria-modal="true" aria-labelledby="icq-ti">
      ${calc ? '' : '<div class="maner"></div>'}
      <div class="icq-hd"><span class="ic">${SVG(I.q, 17)}</span><div class="tt"><h3 id="icq-ti">Istoricul meu</h3>
        <div class="icq-meta">Răspunsurile pe care le-ai trimis în ultimele 90 de zile. Nu se mai pot schimba; dacă e o greșeală, spune-i lui Ion.</div></div>
        <button type="button" class="icq-ib" data-x aria-label="Închide">${SVG(I.x)}</button></div>
      <div class="icq-bd">${error ? `<div class="icq-conf">${esc(error.message)}</div>` : ''}
        ${l.length ? l.map(card).join('') : '<div class="icq-gol">Nu ai trimis încă răspunsuri.</div>'}</div>
      ${this.seturi().length ? `<div class="icq-ft"><span class="sp"></span><button type="button" class="icq-b pri" data-inapoi>Înapoi la întrebări</button></div>` : ''}</div>`;
    v.onmousedown = (e) => { if (e.target === v) this.inchide(); };
    v.querySelector('[data-x]').onclick = () => this.inchide();
    v.querySelector('[data-inapoi]')?.addEventListener('click', () => this.deschide(false));
    this.deseneaza();
  }
  _elibereaza() {
    const id = this._deschis?.tip === 'set' && this._deschis.id;
    if (id && this._sb) this.rpc('deschis_in', { p_set: id, p_tab: TAB, p_app: this._app, p_elibereaza: true }).then(() => {});
  }
  inchide() {
    this._golesteCiorna();
    this._deschis = null; document.querySelector('.icq-voal')?.remove(); this.deseneaza();
  }
  // ---- panoul lui Ion ----
  async deschideAdmin() { this._deschis = { tip: 'admin' }; this._admin = true; await this._arataAdmin(false); }
  async _arataAdmin(reincarcare) {
    const { data, error } = await this.rpc('admin_lista', { p_zile: 30 });
    if (this._deschis?.tip !== 'admin') return;
    const l = error ? [] : data || [];
    const noi = l.filter((s) => s.partial_la && !s.vazut_admin_la);
    const desch = l.filter((s) => !s.trimis_la && !noi.includes(s));
    const vechi = l.filter((s) => s.trimis_la && s.vazut_admin_la);
    const calc = DESEN.matches;
    const qa = (s, cuCiorna) => { const r = cuCiorna ? { ...(s.ciorna || {}), ...(s.raspunsuri || {}) } : s.raspunsuri || {}; let n = 0;
      return `<div class="icq-qa">${(s.intrebari || []).map((q) => q.tip === 'sectiune' ? `<div class="sec">${esc(q.text)}</div>`
        : `<span class="n">${++n}.</span><span class="qq">${esc(q.text)}</span><span></span><span class="rr">${esc(r[q.cheie] || '—')}</span>`).join('')}</div>`; };
    const cine = (s) => (s.destinatari || []).map((d) => esc(d.nume) + (d.primul_vazut_la ? '' : ' (nu l-a deschis încă)') + (d.amanari ? (d.amanari === 1 ? ' · amânat o dată' : ` · amânat de ${d.amanari} ori`) : '')).join(', ');
    const card = (s, fel) => `<div class="icq-set${fel === 'nou' ? ' nou' : ''}" data-id="${s.id}">
      <div class="r1"><b>${esc(s.titlu)}</b>${fel === 'nou' ? `<button type="button" class="icq-b mic pri" data-vazut>${SVG(I.ok, 13)} Am văzut</button>` : ''}
        ${fel === 'vechi' || (fel === 'nou' && s.trimis_la) ? `<button type="button" class="icq-b mic" data-redeschide title="Colegul poate schimba răspunsurile și le trimite din nou">Redeschide</button>` : ''}</div>
      <div class="mt">${esc(s.de_la)}${s.subiect ? ' · ' + esc(s.subiect) : ''} · pentru ${cine(s)}</div>
      ${fel === 'deschis' ? `<div class="mt">Completat ${esc(s.progres)}${s.ciorna_la ? ' · ultima ciornă ' + cand(s.ciorna_la) : ''}${s.termen ? ' · termen ' + cand(s.termen) : ''}${s.deschis_in && Date.now() - Date.parse(s.deschis_in.la) < 600000 ? ' · <b>completează acum în ' + esc(s.deschis_in.app || '?') + '</b>' : ''}</div>
          ${s.trimise_n ? `<div class="mt">Trimise ${s.trimise_n}/${s.total_n}${s.partial_la ? ' · ultima trimitere ' + cand(s.partial_la) : ''}</div>` : ''}
          <details><summary>${s.trimise_n ? 'Vezi răspunsurile și ciorna' : 'Vezi ciorna'}</summary>${qa(s, true)}</details>`
        : `<div class="mt">${s.trimis_la ? 'Trimis complet' : `Trimis parțial (${s.trimise_n}/${s.total_n}; restul îi revine colegului la orele fixe)`} de ${esc(s.trimis_de_nume || '?')} ${cand(s.partial_la || s.trimis_la)}</div>${fel === 'nou' ? qa(s) : `<details><summary>Vezi răspunsurile</summary>${qa(s)}</details>`}`}
    </div>`;
    const sectiune = (t, arr, fel, gol) => `<h4>${t} (${arr.length})</h4>${arr.length ? arr.map((s) => card(s, fel)).join('') : `<div class="icq-gol">${gol}</div>`}`;
    if (!reincarcare) document.querySelector('.icq-voal')?.remove();
    let v = document.querySelector('.icq-voal');
    const scroll = v?.querySelector('.icq-bd')?.scrollTop || 0;
    if (!v) { v = document.createElement('div'); document.body.append(v); }
    v.className = 'icq icq-voal' + (calc ? '' : ' jos');
    v.innerHTML = `<div class="${calc ? 'icq-fer lat' : 'icq-foaie'} icq-adm" role="dialog" aria-modal="true" aria-labelledby="icq-ta">
      ${calc ? '' : '<div class="maner"></div>'}
      <div class="icq-hd"><span class="ic">${SVG(I.q, 17)}</span><div class="tt"><h3 id="icq-ta">Întrebări către colegi</h3>
        <div class="icq-meta">Răspunsurile apar aici imediat ce colegul apasă „Trimite”, și cele parțiale. Firul care a pus întrebarea le primește și el.</div></div>
        <button type="button" class="icq-ib" data-x aria-label="Închide">${SVG(I.x)}</button></div>
      <div class="icq-bd">${error ? `<div class="icq-conf">${esc(error.message)}</div>` : ''}
        ${sectiune('Răspunsuri noi', noi, 'nou', 'Niciun răspuns nou.')}
        ${sectiune('Așteaptă răspuns', desch, 'deschis', 'Nicio întrebare deschisă.')}
        ${vechi.length ? sectiune('Văzute, ultimele 30 de zile', vechi, 'vechi', '') : ''}</div></div>`;
    v.querySelector('.icq-bd').scrollTop = scroll;
    v.onmousedown = (e) => { if (e.target === v) this.inchide(); };
    v.querySelector('[data-x]').onclick = () => this.inchide();
    v.querySelectorAll('[data-vazut]').forEach((b) => b.onclick = async () => { b.disabled = true; await this.rpc('admin_vazut', { p_set: +b.closest('[data-id]').dataset.id }); this.incarca(); this._arataAdmin(true); });
    v.querySelectorAll('[data-redeschide]').forEach((b) => b.onclick = async () => {
      if (!confirm('Redeschizi setul? Colegul îl va vedea din nou în fereastră, cu răspunsurile lui, și îl trimite din nou. Până atunci, firul nu mai vede răspunsurile.')) return;
      b.disabled = true; await this.rpc('admin_redeschide', { p_set: +b.closest('[data-id]').dataset.id }); this.incarca(); this._arataAdmin(true);
    });
  }
  _toast(t) {
    document.querySelector('.icq-toast')?.remove();
    const d = document.createElement('div'); d.className = 'icq icq-toast'; d.innerHTML = SVG(I.ok, 15) + esc(t); document.body.append(d);
    setTimeout(() => d.remove(), 4500);
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('icc-intrebari')) customElements.define('icc-intrebari', IccIntrebari);

// Pornirea: o singură piesă pe pagină, oricâte componente o cer. Ascultă intrarea și ieșirea din cont.
const pornite = new WeakSet();
export function intrebari(sb, opt = {}) {
  if (typeof document === 'undefined' || !sb?.auth || !sb.schema || pornite.has(sb)) return;
  pornite.add(sb);
  const numeApp = opt.aplicatie || document.querySelector('icc-aplicatie')?.getAttribute('nume') || location.hostname.split('.')[0];
  const gata = () => {
    let el = document.querySelector('icc-intrebari');
    if (!el) { el = document.createElement('icc-intrebari'); document.body.append(el); }
    el.porneste(sb, numeApp).catch((x) => console.warn('icc-intrebari:', x?.message || x));
  };
  if (document.body) setTimeout(gata, 0); else addEventListener('DOMContentLoaded', gata);
  sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'USER_UPDATED') setTimeout(gata, 0); });
}
