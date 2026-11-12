// icc-aspect v1 – <icc-vasile>: asistentul AI Vasile în aplicațiile Instalcorp (Ion, 12.11.2026).
// Închis: fața lui Vasile într-un cerc albastru, în colțul din dreapta-jos (Ctrl+J îl deschide).
// Deschis: un panou plutitor în dreapta (sus: conversația; jos, 27% din înălțime: portretul, caseta de scris, Fișier, ✦ Opus, Trimite).
// Cât e deschis, pagina se strânge spre stânga (nu acoperă datele); sub 1024 px panoul ia tot ecranul.
// Minimizat (butonul –, Esc, Ctrl+J), conversația rămâne; un răspuns nou aprinde un punct albastru pe buton.
// Închis (butonul ×, v1.7.1): conversația se încheie (rămâne salvată) și la următoarea deschidere Vasile pornește de la zero,
// ca la „Discuție nouă”, dar fără întrebare. Ion 12.11: „butonul de închide face același lucru ca butonul minimizează”.
//
// Panoul doar desenează și trimite: nu are reguli, chei sau date. Tot ce face Vasile (drepturile, uneltele, aprobările)
// se hotărăște în funcția Supabase „vasile” (ruta ?web), după logarea omului și bifele lui din Portal.
//
// Folosire (Preact, React sau JavaScript simplu; fără shadow DOM, cu stilurile lui, deci merge și fără tema.css):
//   import 'icc-aspect/v1/vasile.js';                       // sau <script type="module" src="…/v1/vasile.js">
//   <icc-vasile aplicatie="ops"></icc-vasile>               // codul aplicației din Portal
//   el.sb = supabase;                                        // clientul Supabase al aplicației (logarea comună)
//   el.context = () => ({ pagina: 'Clienți', selectat: 'Ionescu Andrei' });   // opțional: ce vede omul pe ecran
// Atribute opționale: sus="68" (unde începe panoul, în px, sub antet), fata="…jpg", portret="…jpg", url="https://….supabase.co".
// Evenimente: pe window, „icc-vasile” cu detail { deschis } (ex. Service ascunde harta cât e deschis);
// pe <html> clasa „icc-vasile-deschis” cât e deschis.

const POZE = 'https://apps.instalcorp.ro/vasile/';
const NUME_APL = { oferte: 'Oferte', clienti: 'Clienți', calendar: 'Calendar', instalatii: 'Instalații', service: 'Service', ops: 'OPS',
  rsvti: 'RSVTI', gaze: 'Centralizator gaze', sarcini: 'Sarcini', personal: 'Personal', cashflow: 'Cash Flow', subcontractori: 'Subcontractori',
  auto: 'Auto', scule: 'Scule', documente: 'Documente firmă', portal: 'Portal' };
const MAX_FIS = 3, MAX_BYTES = 10 * 1024 * 1024;
const SVG = (d, w = 16) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  min: '<path d="M5 12h14"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', nou: '<path d="M12 5v14M5 12h14"/>',
  clip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  sag: '<path d="M5 12h14M13 6l6 6-6 6"/>', fis: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
};

const CSS = `
.icv{--v-pri:var(--icc-primary,#2f5bff);--v-pri-fg:var(--icc-primary-foreground,#fff);--v-bg:var(--icc-background,#fff);--v-fg:var(--icc-foreground,#292929);
  --v-card:var(--icc-card,#fff);--v-surf:var(--icc-surface,#f6f6f6);--v-mut:var(--icc-muted-foreground,#6d6d6d);
  --v-bd:var(--icc-border,rgba(41,41,41,.12));--v-acc:var(--icc-accent,rgba(41,41,41,.06));
  font-family:var(--font-sans,"Inter Tight",Inter,system-ui,sans-serif);font-size:14px;line-height:1.45;color:var(--v-fg);font-weight:400;letter-spacing:normal}
:root[data-theme=dark] .icv,.dark .icv{--v-bg:var(--icc-background,#191919);--v-fg:var(--icc-foreground,#ededed);--v-card:var(--icc-card,#212121);
  --v-surf:var(--icc-surface,#212121);--v-mut:var(--icc-muted-foreground,#969696);--v-bd:var(--icc-border,rgba(237,237,237,.14));--v-acc:var(--icc-accent,rgba(237,237,237,.06))}
.icv *{box-sizing:border-box}
.icv button{font:inherit;color:inherit;cursor:pointer}
/* v1.7.0: când e și Tasker pe pagină, el stă în colț și Vasile în stânga lui (tasker.js pune --icc-tasker-lat pe <html>) */
.icv-fab{position:fixed;right:calc(24px + var(--icc-tasker-lat,0px));bottom:24px;z-index:2147483000;width:64px;height:64px;border-radius:50%;padding:4px;border:0;background:var(--v-pri);
  box-shadow:0 10px 26px color-mix(in srgb,var(--v-pri) 45%,transparent);transition:transform .15s}
.icv-fab:hover{transform:scale(1.05)}
.icv-fab{touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.icv-fab.icv-muta{transform:scale(1.15);cursor:grabbing;box-shadow:0 0 0 4px color-mix(in srgb,var(--v-pri) 35%,transparent),0 16px 34px rgba(0,0,0,.3);transition:transform .12s}
@media (max-width:640px){.icv-fab{right:calc(16px + var(--icc-tasker-lat,0px));bottom:16px;width:54px;height:54px;padding:3px}.icv-tip{right:calc(82px + var(--icc-tasker-lat,0px));bottom:30px}}
@media (hover:none){.icv-tip{display:none}}
.icv-fab i{display:block;width:100%;height:100%;border-radius:50%;background:#ddd center/cover;border:2px solid #fff}
.icv-fab .icv-dot{position:absolute;right:0;top:0;width:16px;height:16px;border-radius:50%;background:var(--v-pri);border:3px solid var(--v-bg)}
.icv-tip{position:fixed;right:calc(100px + var(--icc-tasker-lat,0px));bottom:42px;z-index:2147483000;background:var(--v-pri);color:var(--v-pri-fg);padding:6px 10px;border-radius:6px;
  font-size:12.5px;font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateX(6px);transition:opacity .15s,transform .15s}
.icv-fab:hover+.icv-tip,.icv-fab:focus-visible+.icv-tip{opacity:1;transform:none}
.icv-p{position:fixed;top:var(--icv-sus,68px);right:12px;bottom:12px;width:470px;z-index:2147483000;background:var(--v-bg);border:1px solid var(--v-bd);
  border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.16);display:flex;flex-direction:column;overflow:hidden}
@media (max-width:1023px){.icv-p{top:0;right:0;bottom:0;left:0;width:auto;border-radius:0;border:0}}
.icv-top{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--v-bd);flex-shrink:0}
.icv-top b{font-weight:600;font-size:15px}.icv-top small{color:var(--v-mut);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.icv-sp{flex:1}
.icv-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 9px;border-radius:6px;border:1px solid var(--v-bd);
  background:var(--v-bg);font-size:12.5px;font-weight:500;white-space:nowrap}
.icv-b:hover{background:var(--v-acc)}.icv-b:disabled{opacity:.5;cursor:default}
.icv-b.pri{background:var(--v-pri);color:var(--v-pri-fg);border-color:transparent}.icv-b.pri:hover{filter:brightness(1.07)}
.icv-b.on{border-color:var(--v-pri);color:var(--v-pri);background:color-mix(in srgb,var(--v-pri) 8%,transparent)}
.icv-ctx{margin:10px 14px 0;padding:7px 10px;border-radius:6px;background:var(--v-acc);font-size:12.5px;color:var(--v-mut);flex-shrink:0}
.icv-ctx b{color:var(--v-fg);font-weight:500}
.icv-msgs{flex:1;min-height:0;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.icv-who{font-size:11.5px;color:var(--v-mut);margin:2px 2px -6px}.icv-who.eu{align-self:flex-end}
.icv-m{max-width:88%;padding:9px 12px;border-radius:10px;font-size:13.5px;white-space:pre-wrap;overflow-wrap:anywhere}
.icv-m a{color:inherit;text-decoration:underline}
.icv-m.eu{align-self:flex-end;background:var(--v-pri);color:var(--v-pri-fg);border-bottom-right-radius:3px}
.icv-m.eu.asteapta{opacity:.65}
.icv-m.v{align-self:flex-start;background:var(--v-surf);border:1px solid var(--v-bd);border-bottom-left-radius:3px}
.icv-m.v.prop{align-self:stretch;max-width:none;background:var(--v-card);border-left:3px solid var(--v-pri);border-radius:8px}
.icv-m.sis{align-self:center;max-width:94%;background:transparent;color:var(--v-mut);font-size:12.5px;text-align:center;padding:2px 8px}
.icv-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;white-space:normal}
.icv-fisl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;white-space:normal}
.icv-fisl .icv-b{height:26px;font-size:12px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.icv-m.eu .icv-fisl .icv-b{background:transparent;color:inherit;border-color:rgba(255,255,255,.5)}
.icv-op{display:inline-block;margin-left:6px;font-size:11px;color:var(--v-pri);font-weight:600}
.icv-scrie{align-self:flex-start;color:var(--v-mut);font-size:12.5px;padding:2px 2px}
.icv-scrie i{display:inline-block;width:5px;height:5px;margin-left:3px;border-radius:50%;background:currentColor;animation:icv-p 1.2s infinite}
.icv-scrie i:nth-child(2){animation-delay:.2s}.icv-scrie i:nth-child(3){animation-delay:.4s}
@keyframes icv-p{0%,80%,100%{opacity:.2}40%{opacity:1}}
.icv-gol{margin:auto;text-align:center;color:var(--v-mut);font-size:13px;max-width:320px}
.icv-gol b{display:block;color:var(--v-fg);font-size:14px;margin-bottom:4px;font-weight:600}
.icv-bot{height:27%;min-height:150px;display:flex;gap:10px;padding:10px;border-top:1px solid var(--v-bd);flex-shrink:0}
.icv-por{height:100%;aspect-ratio:1/1;min-width:0;border-radius:8px;background:#ddd center/cover;flex-shrink:1}
@media (max-width:520px){.icv-por,.icv-top small{display:none}}
.icv-col{flex:1 0 248px;min-width:0;display:flex;flex-direction:column;gap:8px}
.icv-ta{flex:1;min-height:0;width:100%;resize:none;border:1px solid var(--v-bd);border-radius:8px;padding:10px;background:var(--v-bg);color:var(--v-fg);
  font:inherit;font-size:13.5px;outline:none}
.icv-ta:focus{border-color:var(--v-pri);box-shadow:0 0 0 3px color-mix(in srgb,var(--v-pri) 18%,transparent)}
.icv-ta::placeholder{color:var(--v-mut)}
.icv-tools{display:flex;gap:6px;align-items:center;flex-wrap:nowrap}
.icv-tools .icv-b:not(.pri){height:26px;font-size:11.5px;color:var(--v-mut)}
.icv-tools .icv-b.on{color:var(--v-pri)}
.icv-tools .icv-b.pri{height:32px;padding:0 14px;font-size:13px;font-weight:600}
.icv-atas{display:flex;flex-wrap:wrap;gap:4px}
.icv-atas span{display:inline-flex;align-items:center;gap:4px;max-width:150px;font-size:11.5px;border:1px solid var(--v-bd);border-radius:6px;padding:1px 4px 1px 7px;color:var(--v-mut)}
.icv-atas span em{font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.icv-atas button{border:0;background:transparent;padding:0 2px;line-height:1}
.icv-err{color:var(--icc-destructive-foreground,#b91c1c);font-size:12px}
@media (min-width:1024px){html.icc-vasile-deschis body{padding-right:494px!important}}
`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// text simplu (ca în Telegram): se păstrează rândurile, linkurile devin clicabile
const textHtml = (t) => esc(t).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]»”]/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
const ora = (d) => { try { return new Date(d).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const intre = (v, a, b) => Math.max(a, Math.min(b, v));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* fără */ } } };

class IccVasile extends HTMLElement {
  static get observedAttributes() { return ['aplicatie', 'sus']; }
  constructor() {
    super();
    this._sb = null; this._vizibil = false; this._deschis = false; this._incarcat = false;
    this._mesaje = []; this._asteapta = []; this._fis = []; this._opus = false; this._areOpus = false;
    this._scrie = false; this._punct = false; this._uid = null; this._sesiune = null; this._eroare = '';
    // v1.6.0: locul butonului mutat de om (ținut apăsat 1,5 s, apoi tras); distanța față de dreapta-jos, pe dispozitiv
    try { const l = JSON.parse(ls.get('icc-vasile-loc') || 'null'); this._loc = l && Number.isFinite(l.r) && Number.isFinite(l.b) ? l : null; } catch { this._loc = null; }
    this._redim = () => { const b = this.querySelector('.icv-fab'); if (b) this._aplicaLoc(b, this.querySelector('.icv-tip')); };
    this._tasta = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'j' || e.key === 'J')) { if (!this._vizibil) return; e.preventDefault(); this._deschis ? this.inchide() : this.deschide(); }
      else if (e.key === 'Escape' && this._deschis && this.contains(e.target)) this.inchide(); // Esc = minimizează
    };
  }
  set sb(v) { this._sb = v; if (this.isConnected) this._porneste(); }
  get sb() { return this._sb; }
  set context(v) { this._ctx = v; if (this._deschis) this._deseneazaCtx(); }
  get context() { return this._ctx; }

  connectedCallback() {
    if (!document.getElementById('icc-vasile-stil')) { const s = document.createElement('style'); s.id = 'icc-vasile-stil'; s.textContent = CSS; document.head.append(s); }
    this.classList.add('icv');
    document.addEventListener('keydown', this._tasta);
    window.addEventListener('resize', this._redim);
    this._hash = () => { if (this._deschis) this._deseneazaCtx(); };
    window.addEventListener('hashchange', this._hash);
    // v1.7.0: Tasker (widgetul de sarcini) se deschide → Vasile se închide; nu stau deschiși împreună (Ion, 12.11.2026)
    this._laTasker = (e) => { if (e.detail?.deschis && this._deschis) this.inchide(); };
    window.addEventListener('icc-tasker', this._laTasker);
    if (this._sb) this._porneste();
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this._tasta);
    window.removeEventListener('resize', this._redim);
    window.removeEventListener('hashchange', this._hash);
    window.removeEventListener('icc-tasker', this._laTasker);
    this._opresteCanal(); this._pagina(false);
  }
  attributeChangedCallback(n) { if (n === 'sus') this.style.setProperty('--icv-sus', (Number(this.getAttribute('sus')) || 68) + 'px'); }

  get _apl() { return (this.getAttribute('aplicatie') || 'portal').toLowerCase(); }
  get _url() {
    const u = this.getAttribute('url') || this._sb?.supabaseUrl || this._sb?.rest?.url?.replace(/\/rest\/v1\/?$/, '') || '';
    return u.replace(/\/$/, '') + '/functions/v1/vasile?web';
  }
  _poza(fel) { return this.getAttribute(fel) || POZE + (fel === 'fata' ? 'fata.jpg' : 'portret.jpg'); }

  // butonul apare doar celor logați care au acces în Portal (aceeași listă ca la sigla aplicației) și pe care serverul nu-i oprește
  async _porneste() {
    if (this._pornit === this._sb) return;
    this._pornit = this._sb;
    try {
      const { data } = await this._sb.auth.getSession();
      const s = data?.session;
      if (!s) { this._vizibil = false; this.deseneaza(); this._sb.auth.onAuthStateChange?.((_e, ses) => { if (ses && !this._vizibil) { this._pornit = null; this._porneste(); } }); return; }
      this._uid = s.user.id;
      const { data: eu } = await this._sb.schema('portal').rpc('eu');
      this._vizibil = !!eu && (eu.admin || (eu.stare === 'aprobat' && (eu.aplicatii || []).some((a) => a.acces)));
      // v1.6.1: regula de pe server (azi: instalatorii nu au Vasile în aplicații); la eroare decide tot serverul, la prima cerere
      if (this._vizibil && !eu.admin) {
        const { data: ok, error } = await this._sb.schema('portal').rpc('vasile_web_permis');
        if (!error && ok === false) this._vizibil = false;
      }
    } catch { this._vizibil = false; }
    this.deseneaza();
    if (this._vizibil && ls.get('icc-vasile-deschis') === '1') this.deschide();
  }

  async _cere(corp) {
    const { data } = await this._sb.auth.getSession();
    const tok = data?.session?.access_token;
    if (!tok) throw new Error('Nu ești logat.');
    const h = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok };
    if (this._sb.supabaseKey) h.apikey = this._sb.supabaseKey;
    const r = await fetch(this._url, { method: 'POST', headers: h, body: JSON.stringify({ aplicatie: this._apl, context: this._contextAcum(), ...corp }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.eroare || `Eroare ${r.status}`);
    return j;
  }
  _contextAcum() {
    let c = {};
    try { c = (typeof this._ctx === 'function' ? this._ctx() : this._ctx) || {}; } catch { c = {}; }
    // implicit: legătura activă din bara antetului (aria-current="page", pusă de Antet)
    const pagina = c.pagina || document.querySelector('[aria-current="page"]')?.textContent?.trim() || '';
    return { pagina: String(pagina || '').slice(0, 80), selectat: c.selectat ? String(c.selectat).slice(0, 200) : undefined, detalii: c.detalii ? String(c.detalii).slice(0, 600) : undefined };
  }

  async deschide() {
    if (!this._vizibil) return;
    this._deschis = true; this._punct = false; ls.set('icc-vasile-deschis', '1');
    this._pagina(true); this.deseneaza();
    this.querySelector('.icv-ta')?.focus();
    if (!this._incarcat) await this._incarca();
    this._canal();
  }
  // ×: închide panoul și încheie conversația; următoarea deschidere începe una curată (cea veche rămâne salvată pe server)
  async termina() {
    const aveaMesaje = this._mesaje.length > 0 || (this._asteapta || []).length > 0;
    this.inchide();
    if (!aveaMesaje || !this._incarcat) return;
    try { const j = await this._cere({ op: 'discutie_noua' }); this._sesiune = j.sesiune; this._mesaje = []; this._asteapta = []; this._scrie = false; this._eroare = ''; }
    catch (e) { this._incarcat = false; } // dacă serverul nu răspunde, la deschidere se reîncarcă de la zero
    if (this._deschis) this.deseneaza();
  }
  inchide() {
    this._deschis = false; ls.set('icc-vasile-deschis', '0');
    this._pagina(false); this.deseneaza();
  }
  _pagina(d) {
    document.documentElement.classList.toggle('icc-vasile-deschis', d);
    window.dispatchEvent(new CustomEvent('icc-vasile', { detail: { deschis: d } }));
  }

  async _incarca() {
    this._eroare = ''; this._seIncarca = true; this.deseneaza();
    try {
      const j = await this._cere({ op: 'eu' });
      this._sesiune = j.sesiune; this._mesaje = j.mesaje || []; this._areOpus = !!j.opus; this._scrie = !!j.scrie; this._incarcat = true;
    } catch (e) { this._eroare = e.message || 'Vasile nu răspunde acum.'; }
    this._seIncarca = false;
    // butonul ✦ Opus apare doar după ce funcția spune că omul îl are (Palade, Andreea, Ion, în Oferte): panoul se redesenează, textul scris rămâne
    if (this._deschis && this._areOpus && !this.querySelector('.icv-opus')) {
      const t = this.querySelector('.icv-ta')?.value || '';
      this.deseneaza();
      const ta = this.querySelector('.icv-ta'); if (ta) { ta.value = t; ta.focus(); }
    } else this.deseneaza(true);
  }

  // răspunsurile vin „în direct” (Realtime); dacă legătura lipsește, panoul întreabă din 5 în 5 secunde cât timp așteaptă un răspuns
  _canal() {
    if (this._ch || !this._sb?.channel || !this._uid) return;
    const f = `profile_id=eq.${this._uid}`;
    this._ch = this._sb.channel('icc-vasile-' + this._uid + '-' + Math.random().toString(36).slice(2, 7))
      .on('postgres_changes', { event: '*', schema: 'vasile', table: 'web_mesaje', filter: f }, (p) => this._laMesaj(p.new))
      .on('postgres_changes', { event: 'UPDATE', schema: 'vasile', table: 'web_sesiuni', filter: f }, (p) => {
        if (Number(p.new?.id) !== Number(this._sesiune)) return;
        const s = !!p.new.scrie_la && Date.now() - Date.parse(p.new.scrie_la) < 180000;
        if (s !== this._scrie) { this._scrie = s; this.deseneaza(true); }
      })
      .subscribe();
  }
  _opresteCanal() { try { if (this._ch) this._sb.removeChannel(this._ch); } catch { /* deja închis */ } this._ch = null; clearTimeout(this._poll); }

  _laMesaj(r) {
    if (!r || Number(r.sesiune_id) !== Number(this._sesiune)) return;
    const m = { id: Number(r.message_id), rol: r.rol, text: r.text, butoane: r.butoane, fisiere: r.fisiere, model: r.model, la: r.creat_la, sters: !!r.sters_la };
    const i = this._mesaje.findIndex((x) => x.id === m.id);
    if (m.sters) { if (i >= 0) this._mesaje.splice(i, 1); }
    else if (i >= 0) this._mesaje[i] = m;
    else {
      this._mesaje.push(m);
      if (m.rol === 'om') this._asteapta.shift();
      if (m.rol !== 'om') { this._scrie = false; if (!this._deschis) this._punct = true; }
    }
    this.deseneaza(true);
  }
  _urmareste() {
    clearTimeout(this._poll);
    const pana = Date.now() + 180000, n = this._mesaje.length;
    const pas = async () => {
      if (!this._scrie && !this._asteapta.length) return;
      try {
        const j = await this._cere({ op: 'eu' });
        if ((j.mesaje || []).length !== this._mesaje.length || n !== this._mesaje.length || !j.scrie) {
          this._mesaje = j.mesaje || []; this._scrie = !!j.scrie;
          if (this._mesaje.some((m) => m.rol === 'om')) this._asteapta = this._asteapta.filter((t) => !this._mesaje.some((m) => m.rol === 'om' && m.text === t.text));
          this.deseneaza(true);
        }
      } catch { /* încearcă din nou */ }
      if (Date.now() < pana && (this._scrie || this._asteapta.length)) this._poll = setTimeout(pas, 5000);
    };
    this._poll = setTimeout(pas, 6000);
  }

  async trimite() {
    const ta = this.querySelector('.icv-ta');
    const text = (ta?.value || '').trim();
    if (!text && !this._fis.length) return;
    const fis = this._fis; const opus = this._opus;
    this._asteapta.push({ text, fisiere: fis.map((f) => ({ nume: f.nume })) });
    this._scrie = true; this._fis = []; this._opus = false; this._eroare = '';
    if (ta) ta.value = '';
    this.deseneaza(true);
    try {
      await this._cere({ op: 'trimite', text, opus, fisiere: fis.map((f) => ({ nume: f.nume, mime: f.mime, b64: f.b64 })) });
      this._urmareste();
    } catch (e) {
      this._asteapta.pop(); this._scrie = false; this._eroare = e.message || 'Mesajul nu a plecat.';
      if (ta && !ta.value) ta.value = text;
      this.deseneaza(true);
    }
  }
  async buton(m, b) {
    if (b.url) { window.open(b.url, '_blank', 'noopener'); return; }
    this._eroare = '';
    m.apasat = true; this.deseneaza(true);
    try { await this._cere({ op: 'buton', message_id: m.id, data: b.callback_data }); this._scrie = true; this._urmareste(); }
    catch (e) { m.apasat = false; this._eroare = e.message; }
    this.deseneaza(true);
  }
  async discutieNoua() {
    if (this._mesaje.length && !confirm('Începi o discuție nouă? Conversația de acum se închide (rămâne salvată), iar Vasile pornește de la zero. Lecțiile aprobate rămân.')) return;
    try { const j = await this._cere({ op: 'discutie_noua' }); this._sesiune = j.sesiune; this._mesaje = []; this._asteapta = []; this._scrie = false; this._eroare = ''; }
    catch (e) { this._eroare = e.message; }
    this.deseneaza(true);
    this.querySelector('.icv-ta')?.focus();
  }
  async deschideFisier(f) {
    if (!f.cale) return;
    const w = window.open('', '_blank');
    try { const j = await this._cere({ op: 'fisier', cale: f.cale }); if (w) w.location = j.url; else window.open(j.url, '_blank', 'noopener'); }
    catch (e) { if (w) w.close(); this._eroare = e.message; this.deseneaza(true); }
  }
  async adaugaFisiere(lista) {
    this._eroare = '';
    for (const f of [...lista]) {
      if (this._fis.length >= MAX_FIS) { this._eroare = `Cel mult ${MAX_FIS} fișiere pe mesaj.`; break; }
      if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type) && f.type !== 'application/pdf') { this._eroare = `„${f.name}”: doar poze și PDF.`; continue; }
      const total = this._fis.reduce((s, x) => s + x.marime, 0) + f.size;
      if (total > MAX_BYTES) { this._eroare = 'Fișierele trec de 10 MB. Pentru fișiere mari cere-i lui Vasile un link de urcare.'; continue; }
      const b64 = await new Promise((ok, nu) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = nu; r.readAsDataURL(f); });
      this._fis.push({ nume: f.name || 'poza.png', mime: f.type, marime: f.size, b64 });
    }
    this._deseneazaJos();
  }

  _deseneazaCtx() {
    const c = this.querySelector('.icv-ctx'); if (!c) return;
    const x = this._contextAcum();
    c.innerHTML = `Ești în <b>${esc(NUME_APL[this._apl] || this._apl)}${x.pagina ? ' › ' + esc(x.pagina) : ''}</b>${x.selectat ? ' · selectat: <b>' + esc(x.selectat) + '</b>' : ''}`;
  }
  _deseneazaJos() {
    const a = this.querySelector('.icv-atas'); const e = this.querySelector('.icv-errjos');
    if (a) {
      a.replaceChildren(...this._fis.map((f, i) => {
        const s = document.createElement('span'); s.innerHTML = `<em>${esc(f.nume)}</em>`;
        const x = document.createElement('button'); x.type = 'button'; x.title = 'Scoate'; x.textContent = '×'; x.onclick = () => { this._fis.splice(i, 1); this._deseneazaJos(); };
        s.append(x); return s;
      }));
      a.style.display = this._fis.length ? '' : 'none';
    }
    if (e) { e.textContent = this._eroare; e.style.display = this._eroare ? '' : 'none'; }
    const o = this.querySelector('.icv-opus'); if (o) o.classList.toggle('on', this._opus);
  }

  _deseneazaMesaje() {
    const box = this.querySelector('.icv-msgs'); if (!box) return;
    const jos = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    const f = document.createDocumentFragment();
    if (this._seIncarca && !this._mesaje.length) { const g = document.createElement('div'); g.className = 'icv-gol'; g.textContent = 'Se încarcă…'; f.append(g); }
    else if (!this._mesaje.length && !this._asteapta.length) {
      const g = document.createElement('div'); g.className = 'icv-gol';
      g.innerHTML = '<b>Întreabă-l pe Vasile</b>Vede doar ce vezi tu în aplicații. Poate căuta clienți, oferte, programări, prețuri din catalog, manuale; ce scrie în aplicații face doar după „Aprob”.';
      f.append(g);
    }
    let rolAnt = null;
    for (const m of this._mesaje) {
      if (m.rol !== 'sistem' && m.rol !== rolAnt) {
        const w = document.createElement('div'); w.className = 'icv-who' + (m.rol === 'om' ? ' eu' : '');
        w.textContent = (m.rol === 'om' ? 'Tu' : 'Vasile') + (m.la ? ' · ' + ora(m.la) : ''); f.append(w);
      }
      rolAnt = m.rol;
      const d = document.createElement('div');
      const butoane = (m.butoane || []).flat().filter(Boolean);
      d.className = 'icv-m ' + (m.rol === 'om' ? 'eu' : m.rol === 'sistem' ? 'sis' : 'v' + (butoane.length ? ' prop' : ''));
      d.innerHTML = textHtml(m.text) + (m.model === 'opus' ? '<span class="icv-op">✦ Opus</span>' : '');
      if (m.fisiere?.length) {
        const l = document.createElement('div'); l.className = 'icv-fisl';
        for (const x of m.fisiere) { const b = document.createElement('button'); b.type = 'button'; b.className = 'icv-b'; b.innerHTML = SVG(I.fis, 13) + esc(x.nume); b.title = 'Deschide ' + (x.nume || ''); b.onclick = () => this.deschideFisier(x); l.append(b); }
        d.append(l);
      }
      if (butoane.length) {
        const r = document.createElement('div'); r.className = 'icv-row';
        for (const x of butoane) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'icv-b' + (/aprob|confirm|da\b/i.test(x.text) ? ' pri' : '');
          b.textContent = x.text; b.disabled = !!m.apasat; b.onclick = () => this.buton(m, x); r.append(b);
        }
        d.append(r);
      }
      f.append(d);
    }
    for (const t of this._asteapta) {
      if (rolAnt !== 'om') { const w = document.createElement('div'); w.className = 'icv-who eu'; w.textContent = 'Tu · se trimite'; f.append(w); rolAnt = 'om'; }
      const d = document.createElement('div'); d.className = 'icv-m eu asteapta';
      d.innerHTML = textHtml(t.text) + (t.fisiere.length ? `<div class="icv-fisl">${t.fisiere.map((x) => `<span class="icv-b">${SVG(I.fis, 13)}${esc(x.nume)}</span>`).join('')}</div>` : '');
      f.append(d);
    }
    if (this._scrie) { const s = document.createElement('div'); s.className = 'icv-scrie'; s.innerHTML = 'Vasile scrie<i></i><i></i><i></i>'; f.append(s); }
    if (this._eroare && !this.querySelector('.icv-errjos')) { const e = document.createElement('div'); e.className = 'icv-err'; e.textContent = this._eroare; f.append(e); }
    box.replaceChildren(f);
    if (jos || this._asteapta.length) box.scrollTop = box.scrollHeight;
  }

  // Butonul închis: apăsare scurtă = deschide; ținut apăsat 1,5 s = se ridică și se mută cu degetul (sau cu mausul),
  // ca să nu acopere butoanele aplicației; locul rămâne ținut minte pe dispozitiv. Tastatura (Enter / Spațiu) deschide.
  _apasare(b, t) {
    const LUNG = 1500, PRAG = 10;
    let st = null;
    b.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || st) return;
      const r = b.getBoundingClientRect();
      st = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, mod: 'apasat' };
      try { b.setPointerCapture(e.pointerId); } catch { /* fără captură */ }
      st.timer = setTimeout(() => {
        if (!st || st.mod !== 'apasat') return;
        st.mod = 'muta'; b.classList.add('icv-muta'); if (t) t.style.opacity = '0';
        try { if (navigator.vibrate) navigator.vibrate(30); } catch { /* fără vibrație */ }
      }, LUNG);
    });
    b.addEventListener('pointermove', (e) => {
      if (!st || e.pointerId !== st.id) return;
      if (st.mod === 'apasat') { if (Math.hypot(e.clientX - st.x, e.clientY - st.y) > PRAG) { st.mod = 'anulat'; clearTimeout(st.timer); } return; }
      if (st.mod !== 'muta') return;
      e.preventDefault();
      const w = b.offsetWidth, h = b.offsetHeight, W = document.documentElement.clientWidth || innerWidth;
      const st0 = intre(e.clientX - st.dx, 4, W - w - 4), sus = intre(e.clientY - st.dy, 4, innerHeight - h - 4);
      this._loc = { r: Math.round(W - st0 - w), b: Math.round(innerHeight - sus - h) };
      this._aplicaLoc(b, t);
    });
    const gata = (e, anulat) => {
      if (!st || e.pointerId !== st.id) return;
      clearTimeout(st.timer);
      const mod = st.mod; st = null;
      b.classList.remove('icv-muta'); if (t) t.style.opacity = '';
      if (mod === 'muta') { if (this._loc) ls.set('icc-vasile-loc', JSON.stringify(this._loc)); return; }
      if (mod === 'apasat' && !anulat) this.deschide();
    };
    b.addEventListener('pointerup', (e) => gata(e, false));
    b.addEventListener('pointercancel', (e) => gata(e, true));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    b.addEventListener('click', (e) => { if (e.detail === 0) this.deschide(); });
  }

  _aplicaLoc(b, t) {
    const L = this._loc;
    if (!L) return;
    const W = document.documentElement.clientWidth || innerWidth, w = b.offsetWidth || 64, h = b.offsetHeight || 64;
    const r = intre(L.r, 4, Math.max(4, W - w - 4)), jos = intre(L.b, 4, Math.max(4, innerHeight - h - 4));
    b.style.right = r + 'px'; b.style.bottom = jos + 'px';
    if (!t) return;
    t.style.bottom = Math.round(jos + h / 2 - 14) + 'px';
    if (W - r - w / 2 < W / 2) { t.style.left = Math.round(W - r + 12) + 'px'; t.style.right = 'auto'; }
    else { t.style.right = Math.round(r + w + 12) + 'px'; t.style.left = 'auto'; }
  }

  deseneaza(doarMesaje) {
    if (doarMesaje && this._deschis && this.querySelector('.icv-p')) { this._deseneazaMesaje(); this._deseneazaJos(); return; }
    this.replaceChildren();
    if (!this._vizibil) return;
    if (!this._deschis) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'icv-fab';
      b.setAttribute('aria-label', 'Deschide asistentul Vasile (Ctrl+J)');
      b.innerHTML = `<i style="background-image:url('${esc(this._poza('fata'))}')"></i>${this._punct ? '<span class="icv-dot" title="Răspuns nou"></span>' : ''}`;
      const t = document.createElement('div'); t.className = 'icv-tip'; t.textContent = 'Vasile · Ctrl J';
      this.append(b, t);
      this._aplicaLoc(b, t);
      this._apasare(b, t);
      return;
    }
    const p = document.createElement('section'); p.className = 'icv-p'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Vasile, asistentul AI');
    p.innerHTML = `
      <div class="icv-top"><b>Vasile</b><small>vede doar ce vezi tu</small><span class="icv-sp"></span>
        <button type="button" class="icv-b icv-nou" title="Închide conversația de acum și începe una nouă">${SVG(I.nou, 14)}Discuție nouă</button>
        <button type="button" class="icv-b icv-min" title="Minimizează (Esc): conversația rămâne" aria-label="Minimizează">${SVG(I.min, 14)}</button>
        <button type="button" class="icv-b icv-x" title="Închide conversația: data viitoare Vasile pornește de la zero (conversația rămâne salvată)" aria-label="Închide conversația">${SVG(I.x, 14)}</button></div>
      <div class="icv-ctx"></div>
      <div class="icv-msgs" aria-live="polite"></div>
      <div class="icv-bot">
        <div class="icv-por" style="background-image:url('${esc(this._poza('portret'))}')" role="img" aria-label="Vasile"></div>
        <div class="icv-col">
          <textarea class="icv-ta" placeholder="Scrie-i lui Vasile… (Enter trimite, Shift+Enter rând nou)" aria-label="Mesaj pentru Vasile"></textarea>
          <div class="icv-atas" style="display:none"></div>
          <div class="icv-err icv-errjos" style="display:none"></div>
          <div class="icv-tools">
            <button type="button" class="icv-b icv-fisb" title="Poze sau PDF, până la 10 MB">${SVG(I.clip, 13)}Fișier</button>
            ${this._areOpus ? '<button type="button" class="icv-b icv-opus" title="Model mai puternic, doar pentru mesajul acesta (ofertare)">✦ Opus</button>' : ''}
            <span class="icv-sp"></span>
            <button type="button" class="icv-b pri icv-trimite">Trimite ${SVG(I.sag, 15)}</button>
          </div>
          <input type="file" class="icv-in" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" multiple hidden>
        </div>
      </div>`;
    this.append(p);
    const ta = p.querySelector('.icv-ta'), inp = p.querySelector('.icv-in');
    p.querySelector('.icv-min').onclick = () => this.inchide();
    p.querySelector('.icv-x').onclick = () => this.termina();
    p.querySelector('.icv-nou').onclick = () => this.discutieNoua();
    p.querySelector('.icv-trimite').onclick = () => this.trimite();
    p.querySelector('.icv-fisb').onclick = () => inp.click();
    inp.onchange = () => { this.adaugaFisiere(inp.files || []); inp.value = ''; };
    const o = p.querySelector('.icv-opus'); if (o) o.onclick = () => { this._opus = !this._opus; this._deseneazaJos(); };
    ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); this.trimite(); } };
    ta.onpaste = (e) => { const f = [...(e.clipboardData?.files || [])]; if (f.length) { e.preventDefault(); this.adaugaFisiere(f); } };
    p.ondragover = (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); };
    p.ondrop = (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); this.adaugaFisiere(e.dataTransfer.files); } };
    this._deseneazaCtx(); this._deseneazaMesaje(); this._deseneazaJos();
  }
}

if (!customElements.get('icc-vasile')) customElements.define('icc-vasile', IccVasile);
export { IccVasile };
