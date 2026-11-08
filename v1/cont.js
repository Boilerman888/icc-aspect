// icc-aspect v1 – cele două piese comune din antet (Ion, 08.11.2026), ca elemente HTML proprii (web components):
//   <icc-aplicatie>  cardul de lângă siglă: numele aplicației (→ pagina de start) + săgeata care deschide lista aplicațiilor tale;
//   <icc-utilizator> cercul cu inițiale: meniul utilizatorului (ajutor, setări, versiune, ieșire).
// Merg la fel în Preact, în JavaScript simplu și în React, fără nimic în plus: se importă fișierul o dată și se scrie elementul.
// Nu folosesc „shadow DOM”, deci primesc clasele temei (tema.css scanează și acest fișier).
//
// <icc-aplicatie nume="Oferte" acasa="#/registru" cod="oferte">
//   proprietăți: .sb = clientul Supabase (lista vine din portal.eu(), la prima deschidere) sau .aplicatii = [{ cod, nume, url, acces, stare }]
// <icc-utilizator nume="Ion Zaifu" detaliu="ion@… · Admin" versiune="Oferte 2.4">
//   proprietăți: .elemente = [{ label, href, onClick, nou }] (null-urile se sar), .onIesi = () => …   (sau evenimentul „iesire”)
import { cx, popover, menuItem } from './ui.js';

const PORTAL = 'https://apps.instalcorp.ro/';
const SVG = (d, cls = 'size-4') => `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const SUS_JOS = '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>';
const BIFA = '<path d="M20 6 9 17l-5-5"/>';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// partea comună: lista se închide la clic în afară, la Esc și după alegere
class Derulant extends HTMLElement {
  constructor() { super(); this._deschis = false; this._afara = (e) => { if (!this.contains(e.target)) this.inchide(); }; this._esc = (e) => { if (e.key === 'Escape') this.inchide(); }; }
  connectedCallback() { this.classList.add('relative', 'inline-flex', 'shrink-0'); this.deseneaza(); }
  disconnectedCallback() { this.inchide(); }
  attributeChangedCallback() { if (this.isConnected) this.deseneaza(); }
  comuta() { this._deschis ? this.inchide() : this.deschide(); }
  deschide() {
    this._deschis = true; this.deseneaza();
    document.addEventListener('pointerdown', this._afara); document.addEventListener('keydown', this._esc);
  }
  inchide() {
    if (!this._deschis) return;
    this._deschis = false; this.deseneaza();
    document.removeEventListener('pointerdown', this._afara); document.removeEventListener('keydown', this._esc);
  }
  lista(latime) {
    // pe telefon lista nu iese din ecran: lățimea e cel mult ecranul minus marginile
    return el('div', cx(popover, 'top-full max-h-[min(75vh,30rem)] overflow-y-auto', latime));
  }
}

class IccAplicatie extends Derulant {
  static get observedAttributes() { return ['nume', 'acasa', 'cod']; }
  set aplicatii(v) { this._apl = Array.isArray(v) ? v : null; if (this.isConnected) this.deseneaza(); }
  get aplicatii() { return this._apl; }
  set sb(v) { this._sb = v; }
  get sb() { return this._sb; }
  async incarca() {
    if (this._apl || !this._sb || this._incarc) return;
    this._incarc = true;
    try {
      const { data } = await this._sb.schema('portal').rpc('eu');
      this._apl = (data && data.aplicatii) || [];
    } catch { this._apl = []; }
    this._incarc = false; this.deseneaza();
  }
  deschide() { super.deschide(); this.incarca(); }
  deseneaza() {
    const nume = this.getAttribute('nume') || '';
    const cod = this.getAttribute('cod') || '';
    this.replaceChildren();
    const card = el('div', 'flex h-8 items-stretch overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-xs');
    const a = el('a', 'flex items-center px-2.5 text-[15px] leading-none font-semibold tracking-tight whitespace-nowrap text-foreground no-underline hover:bg-accent', nume);
    a.href = this.getAttribute('acasa') || '#/'; a.title = 'Pagina de start ' + nume;
    const b = el('button', 'flex w-7 cursor-pointer items-center justify-center border-0 border-l border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground');
    b.type = 'button'; b.title = 'Alte aplicații'; b.setAttribute('aria-label', 'Alte aplicații'); b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', String(this._deschis));
    b.innerHTML = SVG(SUS_JOS, 'size-3.5'); b.onclick = () => this.comuta();
    card.append(a, b); this.append(card);
    if (!this._deschis) return;
    const m = this.lista('left-0 w-[min(16rem,calc(100vw-2rem))]'); m.setAttribute('role', 'menu');
    m.append(el('div', 'px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground', 'Aplicațiile tale'));
    const apl = (this._apl || []).filter((x) => x.acces !== false && x.url && x.stare !== 'in_pregatire');
    if (!this._apl) m.append(el('div', 'px-2 py-1.5 text-sm text-muted-foreground', this._sb ? 'Se încarcă…' : '—'));
    for (const x of apl) {
      const l = el('a', cx(menuItem, 'no-underline text-popover-foreground', x.cod === cod && 'font-semibold'));
      l.href = x.url; l.setAttribute('role', 'menuitem');
      if (x.cod === 'site') { l.target = '_blank'; l.rel = 'noopener'; }   // site-ul public nu are drum înapoi spre portal
      l.append(el('span', 'flex-1', x.nume));
      if (x.cod === cod) { const s = el('span', 'text-muted-foreground'); s.innerHTML = SVG(BIFA); l.append(s); }
      l.onclick = () => this.inchide();
      m.append(l);
    }
    m.append(el('div', '-mx-1 my-1 h-px bg-border'));
    const p = el('a', cx(menuItem, 'no-underline text-popover-foreground'), 'Toate aplicațiile');
    p.href = PORTAL; p.setAttribute('role', 'menuitem'); m.append(p);
    this.append(m);
  }
}

class IccUtilizator extends Derulant {
  static get observedAttributes() { return ['nume', 'detaliu', 'versiune']; }
  set elemente(v) { this._el = Array.isArray(v) ? v : []; if (this.isConnected) this.deseneaza(); }
  get elemente() { return this._el || []; }
  set onIesi(f) { this._iesi = f; }
  get onIesi() { return this._iesi; }
  deseneaza() {
    const nume = this.getAttribute('nume') || '';
    const init = nume.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
    const nou = this.elemente.some((x) => x && x.nou);
    this.replaceChildren();
    const b = el('button', 'relative flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold text-secondary-foreground hover:bg-accent', init);
    b.type = 'button'; b.title = nume; b.setAttribute('aria-label', 'Contul tău: ' + nume); b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', String(this._deschis));
    if (nou) b.append(el('span', 'absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary'));
    b.onclick = () => this.comuta();
    this.append(b);
    if (!this._deschis) return;
    const m = this.lista('right-0 w-[min(16rem,calc(100vw-2rem))]'); m.setAttribute('role', 'menu');
    const cap = el('div', 'px-2 py-1.5');
    cap.append(el('div', 'truncate text-sm font-semibold text-popover-foreground', nume));
    if (this.getAttribute('detaliu')) cap.append(el('div', 'truncate text-xs text-muted-foreground', this.getAttribute('detaliu')));
    m.append(cap, el('div', '-mx-1 my-1 h-px bg-border'));
    const lista = this.elemente.filter(Boolean);
    for (const x of lista) {
      const cls = cx(menuItem, 'no-underline text-popover-foreground border-0 bg-transparent text-left');
      const i = x.href ? el('a', cls) : el('button', cls);
      if (x.href) i.href = x.href; else i.type = 'button';
      i.setAttribute('role', 'menuitem');
      i.append(el('span', 'flex-1', x.label));
      if (x.nou) i.append(el('span', 'size-2 rounded-full bg-primary'));
      i.onclick = () => { this.inchide(); x.onClick && x.onClick(); };
      m.append(i);
    }
    if (lista.length) m.append(el('div', '-mx-1 my-1 h-px bg-border'));
    if (this.getAttribute('versiune')) m.append(el('div', 'px-2 py-1 text-xs text-muted-foreground', this.getAttribute('versiune')));
    const ies = el('button', cx(menuItem, 'border-0 bg-transparent text-left text-destructive-foreground hover:bg-destructive/10!'), 'Ieșire');
    ies.type = 'button'; ies.setAttribute('role', 'menuitem');
    ies.onclick = () => { this.inchide(); if (this._iesi) this._iesi(); this.dispatchEvent(new CustomEvent('iesire', { bubbles: true })); };
    m.append(ies);
    this.append(m);
  }
}

if (!customElements.get('icc-aplicatie')) customElements.define('icc-aplicatie', IccAplicatie);
if (!customElements.get('icc-utilizator')) customElements.define('icc-utilizator', IccUtilizator);
