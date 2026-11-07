// icc-aspect v1 – antetul aplicațiilor Preact în stilul dashboardcn (site-header-shell): bandă sus, „pastilă” de sticlă după 24 px de derulare.
// Doar aspect; legăturile și butoanele le dă aplicația. Telefon culcat (înălțime < 500 px): antetul nu mai stă fix,
// ca să nu ocupe ecranul; meniul deschis se derulează.
// Folosire (Preact + htm, fără build de JS):
//   import { html, useState, useEffect } from './vendor/htm-preact-3.1.1.js';
//   import { creeazaAntet } from './aspect/v1/antet.js';
//   const { Antet, ThemeToggle, navLink } = creeazaAntet({ html, useState, useEffect });
// Aplicațiile React (Service, Instalații) își fac antetul în React, cu aceleași clase.
import { cx, btn } from './ui.js';

export function creeazaAntet({ html, useState, useEffect }) {

function useScrolled(px = 24) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const f = () => setS((window.scrollY || 0) > px);
    f(); addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, [px]);
  return s;
}

// clasele unei legături din meniu (exportate ca aplicația să le dea și pieselor proprii, ex. widgetul de sarcini)
const navLink = (on) => cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium no-underline transition-colors',
  'max-lg:min-h-11 max-lg:border-b max-lg:border-border max-lg:px-1 max-lg:text-base',
  on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground');

/**
 * links: [{ href, label, on }] sau elemente gata făcute (vnode)
 * right: conținutul din dreapta (utilizator, temă, ieșire)
 */
function Antet({ brand, home = '#/', links = [], right }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  useEffect(() => {
    const f = () => setOpen(false);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  const pill = scrolled && !open;
  // Ca în dashboardcn (site-header-shell): antetul are ÎNĂLȚIME FIXĂ, iar pastila se micșorează ÎNĂUNTRUL lui.
  // Așa pagina de sub el nu se mai mișcă la trecerea bandă ↔ pastilă (în v1.1.0 se mișca și antetul „pâlpâia”).
  // „flow-root” ține marginea de sus a pastilei (mt-3) înăuntrul antetului; fără el ar împinge pagina în jos.
  return html`
    <header data-ro data-scrolled=${pill ? 'true' : 'false'} class=${cx('group z-40 flow-root w-full px-4 sm:px-6 lg:px-0 print:hidden',
      'sticky top-0 [@media(max-height:500px)]:static',
      open ? 'h-auto bg-background' : 'h-14 lg:h-16')}>
      <div class=${cx('relative mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-0 rounded-full border border-transparent px-0 lg:flex-nowrap lg:px-9',
        'transition-[max-width,height,margin,padding,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'h-auto min-h-14' : 'h-14 lg:h-16',
        'group-data-[scrolled=true]:mt-3 group-data-[scrolled=true]:h-11 group-data-[scrolled=true]:px-3 lg:group-data-[scrolled=true]:h-12',
        'lg:group-data-[scrolled=true]:max-w-[calc(min(1240px,100%)-4.5rem)] lg:group-data-[scrolled=true]:pr-2.5 lg:group-data-[scrolled=true]:pl-5',
        'group-data-[scrolled=true]:border-[#8f8f8f]/30 group-data-[scrolled=true]:bg-[#d9d9d9]/50 group-data-[scrolled=true]:backdrop-blur-xl group-data-[scrolled=true]:backdrop-saturate-125',
        'group-data-[scrolled=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(255,255,255,0.12),0_1px_1px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]',
        'dark:group-data-[scrolled=true]:border-white/10 dark:group-data-[scrolled=true]:bg-[#2a2a2a]/60')}>
        <span aria-hidden="true" class="glass-noise pointer-events-none absolute inset-0 rounded-full opacity-0 mix-blend-overlay transition-opacity duration-700 group-data-[scrolled=true]:opacity-100"></span>
        <a href=${home} class="relative z-10 flex shrink-0 items-center gap-2 text-base font-medium tracking-tight whitespace-nowrap text-foreground no-underline">
          <img class="sigla-dark h-7 w-auto" src="/logo-dark.png" alt="" /><img class="sigla-light h-7 w-auto" src="/logo-light.png" alt="" />
          <span class="lg:max-xl:sr-only">${brand}</span></a>
        <button type="button" class=${btn('ghost', 'icon', 'relative z-10 ml-auto text-lg lg:hidden')} aria-label="Meniu" aria-expanded=${open}
          onClick=${() => setOpen(!open)}>${open ? '✕' : '☰'}</button>
        <nav class=${cx('relative z-10 flex-col max-lg:w-full max-lg:overflow-y-auto max-lg:pb-2 lg:flex lg:flex-row lg:items-center lg:gap-5 xl:gap-7',
          '[@media(max-height:500px)]:max-h-[60vh]', open ? 'flex' : 'hidden')}
          onClick=${(e) => { if (e.target.closest('a')) setOpen(false); }}>
          ${links.map((l) => (l && l.href ? html`<a href=${l.href} class=${navLink(l.on)} aria-current=${l.on ? 'page' : undefined}>${l.label}</a>` : l))}
        </nav>
        <div class=${cx('relative z-10 items-center gap-2 text-xs font-medium text-muted-foreground lg:ml-auto lg:flex',
          'max-lg:w-full max-lg:flex-wrap max-lg:py-3', open ? 'flex' : 'hidden')}>${right}</div>
      </div>
    </header>`;
}

// comutatorul zi / noapte (tema comună ICC, tema-icc.js)
function ThemeToggle() {
  const [t, setT] = useState(() => (window.iccTema ? window.iccTema.get() : 'dark'));
  useEffect(() => {
    const f = (e) => setT(e.detail);
    addEventListener('icc-tema', f);
    return () => removeEventListener('icc-tema', f);
  }, []);
  const lbl = t === 'dark' ? 'Temă luminoasă' : 'Temă întunecată';
  return html`<button type="button" data-ro class=${btn('ghost', 'icon-sm')} aria-label=${lbl} title=${lbl}
    onClick=${() => setT(window.iccTema ? window.iccTema.comuta() : t)}>
    <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${t === 'dark'
        ? html`<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />`
        : html`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />`}</svg></button>`;
}

  return { Antet, ThemeToggle, navLink, useScrolled };
}
