// icc-aspect v1 – <icc-tasker>: widgetul de sarcini Tasker în aplicațiile Instalcorp (Ion, 12.11.2026).
// Închis: fața lui Tasker într-un cerc mov, în colțul din dreapta-jos (Vasile stă în stânga lui); în dreapta feței, contorul:
//   „noi/total” pe roșu când un coleg ți-a dat ceva nou de la ultima deschidere, altfel doar totalul (aceeași regulă ca în Oferte).
//   Cât ai sarcini noi nevăzute, fața pulsează, DOAR pe calculator (ecran de cel puțin 1024 px și maus); pe telefon nu.
// Deschis: panou plutitor în dreapta, ca la Vasile: sarcinile tale nerezolvate, bifa „rezolvată” și butonul care deschide
//   aplicația Sarcini într-un tab nou. Tasker și Vasile nu stau deschiși împreună: deschizi unul, celălalt se închide.
//
// Panoul doar desenează. Datele și regulile sunt în bază (schema sarcini): sarcini.widget_mele() dă DOAR sarcinile omului logat,
// sarcini.widget_vazut() le marchează văzute, sarcini.widget_bifeaza() bifează DOAR o sarcină a lui. Din widget nu se creează
// și nu se mută sarcini, deci porțile (cine poate da sarcini cui) rămân în aplicația Sarcini.
//
// Folosire (Preact, React sau JavaScript simplu; fără shadow DOM, cu stilurile lui):
//   import 'icc-aspect/v1/tasker.js';
//   <icc-tasker aplicatie="ops"></icc-tasker>          // lângă <icc-vasile>
//   el.sb = supabase;                                   // clientul Supabase al aplicației (logarea comună)
// Atribute opționale: sus="68" (unde începe panoul, sub antet), fata="…jpg", portret="…jpg".
// Evenimente: pe window „icc-tasker” cu detail { deschis }; pe <html> clasa „icc-tasker-deschis” cât e deschis.
// Ascultă „tasks-changed” (Oferte îl trimite când se schimbă o sarcină) și se reîncarcă.

const POZE = 'https://apps.instalcorp.ro/tasker/';
const OFERTE = 'https://oferte.instalcorp.ro/';
const SVG = (d, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  min: '<path d="M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  ref: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
};
const CAT = { ofertare: 'de ofertat', facturare: 'de facturat', intalnire: '📅 întâlnire' };

const CSS = `
.ict{--t-pri:var(--icc-primary,#2f5bff);--t-pri-fg:var(--icc-primary-foreground,#fff);--t-mov:#6d28d9;--t-bg:var(--icc-background,#fff);--t-fg:var(--icc-foreground,#292929);
  --t-card:var(--icc-card,#fff);--t-surf:var(--icc-surface,#f6f6f6);--t-mut:var(--icc-muted-foreground,#6d6d6d);
  --t-bd:var(--icc-border,rgba(41,41,41,.12));--t-acc:var(--icc-accent,rgba(41,41,41,.06));--t-rosu:#dc2626;--t-gal:#b45309;
  font-family:var(--font-sans,"Inter Tight",Inter,system-ui,sans-serif);font-size:14px;line-height:1.45;color:var(--t-fg);font-weight:400;letter-spacing:normal}
:root[data-theme=dark] .ict,.dark .ict{--t-bg:var(--icc-background,#191919);--t-fg:var(--icc-foreground,#ededed);--t-card:var(--icc-card,#212121);
  --t-surf:var(--icc-surface,#212121);--t-mut:var(--icc-muted-foreground,#969696);--t-bd:var(--icc-border,rgba(237,237,237,.14));--t-acc:var(--icc-accent,rgba(237,237,237,.06));
  --t-rosu:#f87171;--t-gal:#fbbf24}
.ict *{box-sizing:border-box}
.ict button{font:inherit;color:inherit;cursor:pointer}
.ict-grp{position:fixed;right:24px;bottom:24px;z-index:2147483000;display:flex;align-items:center;gap:6px}
.ict-fab{position:relative;width:64px;height:64px;border-radius:50%;padding:4px;border:0;background:var(--t-mov);
  box-shadow:0 10px 26px color-mix(in srgb,var(--t-mov) 45%,transparent);transition:transform .15s;
  touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.ict-fab:hover{transform:scale(1.05)}
.ict-fab.ict-muta{transform:scale(1.15);cursor:grabbing;box-shadow:0 0 0 4px color-mix(in srgb,var(--t-mov) 35%,transparent),0 16px 34px rgba(0,0,0,.3);transition:transform .12s}
.ict-fab i{display:block;width:100%;height:100%;border-radius:50%;background:#2a1240 center/cover;border:2px solid #fff}
.ict-nr{display:inline-flex;align-items:center;justify-content:center;height:24px;min-width:24px;padding:0 7px;border-radius:6px;border:0;
  font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;white-space:nowrap;
  background:var(--t-bg);color:var(--t-mov);box-shadow:0 0 0 1px var(--t-bd),0 4px 12px rgba(0,0,0,.12)}
.ict-nr.noi{background:var(--t-rosu);color:#fff;box-shadow:0 4px 12px rgba(220,38,38,.35)}
.ict-nr.zero{color:var(--t-mut)}
/* sarcină nouă: avatarul pulsează, DOAR pe calculator (ecran lat + maus); pe telefon și tabletă rămâne doar contorul roșu */
@keyframes ict-puls{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--t-mov) 65%,transparent),0 10px 26px color-mix(in srgb,var(--t-mov) 45%,transparent)}
  70%{box-shadow:0 0 0 16px color-mix(in srgb,var(--t-mov) 0%,transparent),0 10px 26px color-mix(in srgb,var(--t-mov) 45%,transparent)}
  100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--t-mov) 0%,transparent),0 10px 26px color-mix(in srgb,var(--t-mov) 45%,transparent)}}
@media (min-width:1024px) and (hover:hover) and (pointer:fine){.ict-fab.ict-puls{animation:ict-puls 1.6s ease-out infinite}}
@media (prefers-reduced-motion:reduce){.ict-fab.ict-puls{animation:none}}
@media (max-width:640px){.ict-grp{right:16px;bottom:16px}.ict-fab{width:54px;height:54px;padding:3px}}
.ict-p{position:fixed;top:var(--ict-sus,68px);right:12px;bottom:12px;width:470px;z-index:2147483000;background:var(--t-bg);border:1px solid var(--t-bd);
  border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden}
@media (max-width:1023px){.ict-p{top:0;right:0;bottom:0;left:0;width:auto;border-radius:0;border:0}}
.ict-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--t-bd);flex-shrink:0}
.ict-top b{font-weight:600;font-size:15px}.ict-top small{color:var(--t-mut);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ict-sp{flex:1}
.ict-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 9px;border-radius:6px;border:1px solid var(--t-bd);
  background:var(--t-bg);font-size:12.5px;font-weight:500;white-space:nowrap;text-decoration:none;color:inherit}
.ict-b:hover{background:var(--t-acc)}.ict-b:disabled{opacity:.5;cursor:default}
.ict-b.pri{background:var(--t-mov);color:#fff;border-color:transparent}.ict-b.pri:hover{filter:brightness(1.1)}
.ict-list{flex:1;min-height:0;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:8px}
.ict-t{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;border:1px solid var(--t-bd);border-radius:8px;background:var(--t-card)}
.ict-t.noua{border-left:3px solid var(--t-rosu)}
.ict-t.gata .ict-tt{text-decoration:line-through;color:var(--t-mut)}
.ict-t input{width:17px;height:17px;margin:2px 0 0;flex-shrink:0;accent-color:var(--t-mov);cursor:pointer}
.ict-c{flex:1;min-width:0}
.ict-tt{font-weight:500;font-size:13.5px;overflow-wrap:anywhere}
.ict-n{color:var(--t-mut);font-size:12.5px;margin-top:2px;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ict-m{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px;font-size:12px;color:var(--t-mut)}
.ict-m a{color:inherit;text-decoration:underline}
.ict-m .dep{color:var(--t-rosu);font-weight:600}.ict-m .azi{color:var(--t-gal);font-weight:600}
.ict-e{display:inline-flex;align-items:center;height:18px;padding:0 6px;margin-right:6px;border-radius:5px;font-size:11px;font-weight:600;vertical-align:1px;
  background:var(--t-acc);color:var(--t-mut)}
.ict-e.noua{background:var(--t-rosu);color:#fff}
.ict-gol{margin:auto;text-align:center;color:var(--t-mut);font-size:13px;max-width:320px}
.ict-gol b{display:block;color:var(--t-fg);font-size:14px;margin-bottom:4px;font-weight:600}
.ict-err{color:var(--t-rosu);font-size:12.5px}
.ict-bot{height:22%;min-height:150px;display:flex;gap:12px;padding:10px;border-top:1px solid var(--t-bd);flex-shrink:0}
.ict-por{height:100%;aspect-ratio:1/1;min-width:0;border-radius:8px;background:#2a1240 center/cover;flex-shrink:1}
@media (max-width:520px){.ict-por,.ict-top small{display:none}}
.ict-col{flex:1 0 220px;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:10px;font-size:12.5px;color:var(--t-mut)}
.ict-col{justify-content:center;gap:10px}
/* v1.7.2 (Ion 12.11): în dreapta portretului, cifrele ca plăci care filtrează lista + butoanele */
.ict-st{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.ict-k{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;min-width:0;padding:5px 8px;border-radius:8px;
  border:1px solid var(--t-bd);background:var(--t-card);text-align:left;color:var(--t-mut);font-size:11.5px;line-height:1.15}
.ict-k b{font-size:17px;font-weight:700;color:var(--t-fg);font-variant-numeric:tabular-nums}
.ict-k.r b{color:var(--t-rosu)}.ict-k.g b{color:var(--t-gal)}
.ict-k:hover:not(:disabled){background:var(--t-acc)}.ict-k:disabled{opacity:.45;cursor:default}
.ict-k[aria-pressed=true]{border-color:var(--t-mov);box-shadow:0 0 0 2px color-mix(in srgb,var(--t-mov) 30%,transparent)}
.ict-k span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.ict-btns{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ict-btns .ict-b{flex:1 1 auto}
.ict-col .ict-b.pri{height:34px;font-size:13px;font-weight:600;padding:0 12px}
.ict-col .ict-b.sec{height:34px;color:var(--t-fg)}
.ict-fil{display:flex;align-items:center;gap:8px;margin:8px 14px 0;font-size:12px;color:var(--t-mut);flex-shrink:0}
.ict-fil button{border:0;background:none;padding:0;color:var(--t-mov);text-decoration:underline;font-size:12px}
/* Vasile deschis → butonul Tasker se ascunde (și invers, în vasile.js) */
html.icc-vasile-deschis .ict-grp{display:none}
@media (min-width:1024px){html.icc-tasker-deschis body{padding-right:494px!important}}
`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const intre = (v, a, b) => Math.max(a, Math.min(b, v));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* fără */ } } };
const azi = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const dataRo = (s) => { try { return new Date(s + 'T00:00:00').toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return s; } };
const stareTermen = (t) => {
  if (!t.termen || t.gata) return '';
  const z = Math.round((new Date(t.termen + 'T00:00:00') - azi()) / 86400000);
  return z < 0 ? 'dep' : z === 0 ? 'azi' : '';
};

class IccTasker extends HTMLElement {
  static get observedAttributes() { return ['sus']; }
  constructor() {
    super();
    this._sb = null; this._vizibil = false; this._deschis = false;
    this._d = { total: 0, noi: 0, lista: [], url: null, oferte: false }; this._noiAfisate = new Set(); this._eroare = ''; this._filtru = 'toate';
    try { const l = JSON.parse(ls.get('icc-tasker-loc') || 'null'); this._loc = l && Number.isFinite(l.r) && Number.isFinite(l.b) ? l : null; } catch { this._loc = null; }
    this._redim = () => this._aplicaLoc();
    this._tasta = (e) => { if (e.key === 'Escape' && this._deschis && this.contains(e.target)) this.inchide(); };
    // Vasile se deschide → Tasker se închide (și invers: Tasker trimite „icc-tasker”, iar vasile.js ≥ 1.7.0 se închide)
    this._laVasile = (e) => { if (e.detail?.deschis && this._deschis) this.inchide(); this._aplicaLoc(); };
    this._reincarca = () => this._incarca();
  }
  set sb(v) { this._sb = v; if (this.isConnected) this._porneste(); }
  get sb() { return this._sb; }

  connectedCallback() {
    if (!document.getElementById('icc-tasker-stil')) { const s = document.createElement('style'); s.id = 'icc-tasker-stil'; s.textContent = CSS; document.head.append(s); }
    this.classList.add('ict');
    document.addEventListener('keydown', this._tasta);
    window.addEventListener('resize', this._redim);
    window.addEventListener('icc-vasile', this._laVasile);
    window.addEventListener('tasks-changed', this._reincarca);
    window.addEventListener('focus', this._reincarca);
    if (this._sb) this._porneste();
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this._tasta);
    window.removeEventListener('resize', this._redim);
    window.removeEventListener('icc-vasile', this._laVasile);
    window.removeEventListener('tasks-changed', this._reincarca);
    window.removeEventListener('focus', this._reincarca);
    clearInterval(this._ceas); this._pagina(false); this._anuntaLat(0);
  }
  attributeChangedCallback(n) { if (n === 'sus') this.style.setProperty('--ict-sus', (Number(this.getAttribute('sus')) || 68) + 'px'); }
  _poza(fel) { return this.getAttribute(fel) || POZE + (fel === 'fata' ? 'fata.jpg' : 'portret.jpg'); }

  async _porneste() {
    if (this._pornit === this._sb) return;
    this._pornit = this._sb;
    try {
      const { data } = await this._sb.auth.getSession();
      if (!data?.session) {
        this._vizibil = false; this.deseneaza();
        this._sb.auth.onAuthStateChange?.((_e, ses) => { if (ses && !this._vizibil) { this._pornit = null; this._porneste(); } });
        return;
      }
    } catch { this._vizibil = false; this.deseneaza(); return; }
    await this._incarca();
    clearInterval(this._ceas);
    this._ceas = setInterval(() => { if (document.visibilityState !== 'hidden') this._incarca(); }, 60000);
  }

  async _incarca() {
    if (!this._sb || this._seIncarca) return;
    this._seIncarca = true;
    try {
      const { data, error } = await this._sb.schema('sarcini').rpc('widget_mele');
      if (error) throw error;
      const vizibil = !!data?.vizibil;
      // ce era bifat acum în panou rămâne la vedere (tăiat) până la închidere, ca omul să poată reveni
      const bifate = this._deschis ? this._d.lista.filter((t) => t.gata && !(data.lista || []).some((x) => x.id === t.id)) : [];
      this._d = { total: data?.total || 0, noi: data?.noi || 0, lista: [...(data?.lista || []), ...bifate], url: data?.url || null, oferte: !!data?.oferte };
      this._eroare = '';
      if (vizibil !== this._vizibil) { this._vizibil = vizibil; this._seIncarca = false; this.deseneaza(); return; }
    } catch (e) {
      if (!this._vizibil) { this._seIncarca = false; return; }   // fără drept / fără schemă încă: widgetul nu apare
      this._eroare = 'Sarcinile nu s-au încărcat. Încearcă din nou.';
    }
    this._seIncarca = false;
    this.deseneaza(this._deschis);
  }

  deschide() {
    if (!this._vizibil) return;
    this._deschis = true;
    this._noiAfisate = new Set(this._d.lista.filter((t) => t.noua).map((t) => t.id));
    this._pagina(true); this.deseneaza();
    this._incarca();
    // le-ai văzut: contorul trece de pe „noi/total” pe total (ca la deschiderea paginii de sarcini din Oferte)
    if (this._d.noi) {
      clearTimeout(this._tVazut);
      this._tVazut = setTimeout(async () => {
        if (!this._deschis) return;
        try { await this._sb.schema('sarcini').rpc('widget_vazut'); this._d.noi = 0; this.deseneaza(true); window.dispatchEvent(new Event('tasks-changed')); } catch { /* la următoarea deschidere */ }
      }, 1200);
    }
  }
  inchide() {
    this._deschis = false; clearTimeout(this._tVazut);
    this._d.lista = this._d.lista.filter((t) => !t.gata);
    this._pagina(false); this.deseneaza();
  }
  _pagina(d) {
    document.documentElement.classList.toggle('icc-tasker-deschis', d);
    window.dispatchEvent(new CustomEvent('icc-tasker', { detail: { deschis: d } }));
  }

  async bifeaza(t, facut) {
    t.gata = facut; this.deseneaza(true);
    try {
      const { data, error } = await this._sb.schema('sarcini').rpc('widget_bifeaza', { p_id: t.id, p_facut: facut });
      if (error) throw error;
      if (data === false) throw new Error('Sarcina nu mai e a ta sau a fost deja schimbată.');
      this._d.total += facut ? -1 : 1;
      this._eroare = '';
      window.dispatchEvent(new Event('tasks-changed'));
    } catch (e) { t.gata = !facut; this._eroare = e.message || 'Nu s-a salvat.'; }
    this.deseneaza(true);
  }

  // ---- locul butonului (Ion 12.11): Tasker stă în colțul din dreapta-jos, iar Vasile în stânga lui. Tasker își anunță
  // lățimea în variabila --icc-tasker-lat de pe <html>, iar vasile.js ≥ 1.7.0 se dă la stânga cu atât. Mutat de om = locul lui
  // (atunci Vasile rămâne în colț). Cât e panoul Tasker deschis, Vasile rămâne pe loc, ca să poată fi apăsat.
  _anuntaLat(px) {
    const s = document.documentElement.style, v = px ? px + 'px' : '';
    if (s.getPropertyValue('--icc-tasker-lat') !== v) { if (v) s.setProperty('--icc-tasker-lat', v); else s.removeProperty('--icc-tasker-lat'); }
  }
  _aplicaLoc() {
    if (!this._vizibil || this._loc) this._anuntaLat(0);
    const g = this.querySelector('.ict-grp'); if (!g) return;
    const W = document.documentElement.clientWidth || innerWidth, w = g.offsetWidth || 120, h = g.offsetHeight || 64;
    const colt = W <= 640 ? 16 : 24;
    let r = colt, jos = colt;
    if (this._loc) { r = this._loc.r; jos = this._loc.b; }
    else if (g.getClientRects().length) { this._lat = Math.round(w + 12); this._anuntaLat(this._lat); }
    r = intre(r, 4, Math.max(4, W - w - 4)); jos = intre(jos, 4, Math.max(4, innerHeight - h - 4));
    if (g.style.right !== r + 'px') g.style.right = r + 'px';
    if (g.style.bottom !== jos + 'px') g.style.bottom = jos + 'px';
  }
  // apăsare scurtă = deschide; ținut apăsat 1,5 s = se ridică și se mută (ca Vasile); locul rămâne ținut minte pe dispozitiv
  _apasare(b, g) {
    const LUNG = 1500, PRAG = 10;
    let st = null;
    b.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || st) return;
      const r = g.getBoundingClientRect();
      st = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, mod: 'apasat' };
      try { b.setPointerCapture(e.pointerId); } catch { /* fără captură */ }
      st.timer = setTimeout(() => {
        if (!st || st.mod !== 'apasat') return;
        st.mod = 'muta'; b.classList.add('ict-muta');
        try { if (navigator.vibrate) navigator.vibrate(30); } catch { /* fără vibrație */ }
      }, LUNG);
    });
    b.addEventListener('pointermove', (e) => {
      if (!st || e.pointerId !== st.id) return;
      if (st.mod === 'apasat') { if (Math.hypot(e.clientX - st.x, e.clientY - st.y) > PRAG) { st.mod = 'anulat'; clearTimeout(st.timer); } return; }
      if (st.mod !== 'muta') return;
      e.preventDefault();
      const w = g.offsetWidth, h = g.offsetHeight, W = document.documentElement.clientWidth || innerWidth;
      const st0 = intre(e.clientX - st.dx, 4, W - w - 4), sus = intre(e.clientY - st.dy, 4, innerHeight - h - 4);
      this._loc = { r: Math.round(W - st0 - w), b: Math.round(innerHeight - sus - h) };
      this._aplicaLoc();
    });
    const gata = (e, anulat) => {
      if (!st || e.pointerId !== st.id) return;
      clearTimeout(st.timer);
      const mod = st.mod; st = null;
      b.classList.remove('ict-muta');
      if (mod === 'muta') { if (this._loc) ls.set('icc-tasker-loc', JSON.stringify(this._loc)); return; }
      if (mod === 'apasat' && !anulat) this.deschide();
    };
    b.addEventListener('pointerup', (e) => gata(e, false));
    b.addEventListener('pointercancel', (e) => gata(e, true));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    b.addEventListener('click', (e) => { if (e.detail === 0) this.deschide(); });
  }

  _textContor() {
    const { noi, total } = this._d;
    return {
      text: noi ? `${noi}/${total}` : String(total),
      cls: noi ? ' noi' : total ? '' : ' zero',
      titlu: noi ? `${noi} ${noi === 1 ? 'sarcină nouă' : 'sarcini noi'} de la colegi, ${total} nerezolvate în total` : `${total} ${total === 1 ? 'sarcină nerezolvată' : 'sarcini nerezolvate'}`,
    };
  }

  _deseneazaLista() {
    const box = this.querySelector('.ict-list'); if (!box) return;
    const l0 = this._d.lista;
    const deschise = l0.filter((t) => !t.gata);
    const nr = { toate: deschise.length, noi: deschise.filter((t) => this._noiAfisate.has(t.id)).length,
      dep: deschise.filter((t) => stareTermen(t) === 'dep').length, azi: deschise.filter((t) => stareTermen(t) === 'azi').length };
    if (this._filtru !== 'toate' && !nr[this._filtru]) this._filtru = 'toate';
    const ok = { toate: () => true, noi: (t) => this._noiAfisate.has(t.id), dep: (t) => stareTermen(t) === 'dep', azi: (t) => stareTermen(t) === 'azi' }[this._filtru];
    const l = l0.filter((t) => t.gata || ok(t));
    const st = this.querySelector('.ict-st');
    if (st) {
      const K = [['toate', 'toate', ''], ['noi', 'noi', 'r'], ['dep', 'depășite', 'r'], ['azi', 'azi', 'g']];
      st.innerHTML = K.map(([k, et, cl]) => `<button type="button" class="ict-k ${nr[k] ? cl : ''}" data-k="${k}" aria-pressed="${this._filtru === k}"`
        + `${k !== 'toate' && !nr[k] ? ' disabled' : ''} title="${k === 'toate' ? 'Arată toate sarcinile tale nerezolvate' : 'Arată doar sarcinile: ' + et}"><b>${nr[k]}</b><span>${et}</span></button>`).join('');
      st.querySelectorAll('.ict-k').forEach((b) => { b.onclick = () => { this._filtru = this._filtru === b.dataset.k ? 'toate' : b.dataset.k; this._deseneazaLista(); }; });
    }
    const fil = this.querySelector('.ict-fil');
    if (fil) {
      fil.hidden = this._filtru === 'toate';
      fil.innerHTML = this._filtru === 'toate' ? '' : `<span>Arăt doar: <b>${{ noi: 'noi', dep: 'cu termen depășit', azi: 'cu termen azi' }[this._filtru]}</b> (${nr[this._filtru]} din ${nr.toate})</span><button type="button">toate</button>`;
      const b = fil.querySelector('button'); if (b) b.onclick = () => { this._filtru = 'toate'; this._deseneazaLista(); };
    }
    const f = document.createDocumentFragment();
    if (!l.length) {
      const g = document.createElement('div'); g.className = 'ict-gol';
      g.innerHTML = this._eroare ? `<b>Nu s-au încărcat</b>${esc(this._eroare)}` : '<b>Nicio sarcină deschisă</b>Când un coleg sau aplicația îți dă o sarcină, apare aici și contorul se face roșu.';
      f.append(g);
    }
    for (const t of l) {
      const noua = this._noiAfisate.has(t.id) && !t.gata;
      const d = document.createElement('div'); d.className = 'ict-t' + (noua ? ' noua' : '') + (t.gata ? ' gata' : '');
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!t.gata;
      cb.title = t.gata ? 'Redeschide' : 'Marchează rezolvată'; cb.setAttribute('aria-label', cb.title + ': ' + (t.titlu || ''));
      cb.onchange = () => this.bifeaza(t, cb.checked);
      const c = document.createElement('div'); c.className = 'ict-c';
      const st = stareTermen(t);
      const leg = [];
      if (t.oferta) leg.push(this._d.oferte ? `<a href="${OFERTE}#/oferta/${esc(t.oferta_id)}" target="_blank" rel="noopener">${esc(t.oferta)}</a>` : esc(t.oferta));
      if (t.contract) leg.push(this._d.oferte ? `<a href="${OFERTE}#/contract/${esc(t.contract_id)}" target="_blank" rel="noopener">${esc(t.contract)}</a>` : esc(t.contract));
      if (t.client && !t.oferta && !t.contract) leg.push('👤 ' + esc(t.client));
      c.innerHTML = `<div class="ict-tt">${noua ? '<span class="ict-e noua">nouă</span>' : ''}${t.auto ? '<span class="ict-e" title="Creată automat de aplicație">Sistem</span>' : ''}`
        + `${CAT[t.categorie] ? `<span class="ict-e">${CAT[t.categorie]}</span>` : ''}${esc(t.titlu)}</div>`
        + (t.note ? `<div class="ict-n">${esc(t.note)}</div>` : '')
        + `<div class="ict-m">${t.de_la && !t.auto ? `<span>de la <b>${esc(t.de_la)}</b></span>` : ''}`
        + (t.termen ? `<span class="${st}">${st === 'dep' ? 'Depășit: ' : st === 'azi' ? 'Azi: ' : 'Termen: '}${dataRo(t.termen)}${t.ora ? ', ora ' + esc(t.ora) : ''}</span>` : '')
        + leg.map((x) => `<span>${x}</span>`).join('') + '</div>';
      d.append(cb, c); f.append(d);
    }
    if (this._eroare && l.length) { const e = document.createElement('div'); e.className = 'ict-err'; e.textContent = this._eroare; f.append(e); }
    box.replaceChildren(f);
  }

  deseneaza(doarLista) {
    if (doarLista && this._deschis && this.querySelector('.ict-p')) { this._deseneazaLista(); return; }
    this.replaceChildren();
    if (!this._vizibil) { this._anuntaLat(0); return; }
    if (!this._deschis) {
      const c = this._textContor();
      const g = document.createElement('div'); g.className = 'ict-grp';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ict-fab' + (this._d.noi > 0 ? ' ict-puls' : '');
      b.setAttribute('aria-label', 'Deschide sarcinile (Tasker): ' + c.titlu); b.title = 'Tasker · ' + c.titlu;
      b.innerHTML = `<i style="background-image:url('${esc(this._poza('fata'))}')"></i>`;
      const n = document.createElement('button'); n.type = 'button'; n.className = 'ict-nr' + c.cls; n.textContent = c.text; n.title = c.titlu;
      n.setAttribute('aria-label', 'Sarcini: ' + c.titlu); n.onclick = () => this.deschide();
      g.append(b, n); this.append(g);
      this._apasare(b, g); this._aplicaLoc();
      return;
    }
    const url = this._d.url;
    const p = document.createElement('section'); p.className = 'ict-p'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Tasker, sarcinile tale');
    p.innerHTML = `
      <div class="ict-top"><b>Tasker</b><small>sarcinile tale nerezolvate</small><span class="ict-sp"></span>
        <button type="button" class="ict-b ict-ref" title="Reîncarcă" aria-label="Reîncarcă">${SVG(I.ref, 14)}</button>
        <button type="button" class="ict-b ict-x" title="Închide (Esc)" aria-label="Închide">${SVG(I.x, 14)}</button></div>
      <div class="ict-fil" hidden></div>
      <div class="ict-list" aria-live="polite"></div>
      <div class="ict-bot">
        <div class="ict-por" style="background-image:url('${esc(this._poza('portret'))}')" role="img" aria-label="Tasker"></div>
        <div class="ict-col">
          <div class="ict-st" role="group" aria-label="Sarcinile tale, pe feluri (apasă ca să filtrezi lista)"></div>
          <div class="ict-btns">
            ${url ? `<a class="ict-b pri" href="${esc(url)}" target="_blank" rel="noopener" title="Deschide aplicația Sarcini (tab nou): sarcini noi, modificări, recurente și sarcinile echipei">Aplicația Sarcini ${SVG(I.ext, 15)}</a>`
              : '<span>Aplicația Sarcini se pregătește; până atunci sarcinile tale le vezi și le bifezi aici.</span>'}
            <button type="button" class="ict-b sec ict-vas" title="Închide Tasker și deschide Vasile, care poate da o sarcină unui coleg">Sarcină prin Vasile</button>
          </div>
        </div>
      </div>`;
    this.append(p);
    p.querySelector('.ict-x').onclick = () => this.inchide();
    p.querySelector('.ict-ref').onclick = () => this._incarca();
    // Vasile poate da sarcini (cu porțile din Sarcini): Tasker se închide, Vasile se deschide cu începutul cererii scris
    const v = document.querySelector('icc-vasile');
    const bv = p.querySelector('.ict-vas');
    if (!v || typeof v.deschide !== 'function' || !v.querySelector('.icv-fab')) bv.remove();
    else bv.onclick = async () => { this.inchide(); await v.deschide(); const ta = v.querySelector('.icv-ta'); if (ta && !ta.value) { ta.value = 'Dă o sarcină lui '; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } };
    this._deseneazaLista();
  }
}

if (!customElements.get('icc-tasker')) customElements.define('icc-tasker', IccTasker);
export { IccTasker };
