// icc-aspect v1 – antetul aplicațiilor Preact în stilul dashboardcn (site-header-shell): bandă sus, „pastilă” după 24 px de derulare.
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
  return html`
    <header data-ro class=${cx('z-40 w-full transition-[padding] duration-200 print:hidden',
      'sticky top-0 [@media(max-height:500px)]:static',
      pill ? 'lg:px-4 lg:pt-3 max-lg:border-b max-lg:border-border max-lg:bg-background/90 max-lg:backdrop-blur-md' : open ? 'bg-background' : 'bg-background/90 backdrop-blur-md')}>
      <div class=${cx('mx-auto flex w-full flex-wrap items-center gap-x-6 gap-y-0 transition-all duration-200',
        'h-auto min-h-14 px-4 sm:px-6 lg:h-16 lg:flex-nowrap lg:px-9 [@media(max-height:500px)]:min-h-12',
        'max-w-[1240px]', pill ? 'border-border lg:h-14 lg:rounded-full lg:border lg:bg-background/85 lg:pr-2.5 lg:pl-5 lg:shadow-sm lg:backdrop-blur-md' : '')}>
        <a href=${home} class="flex shrink-0 items-center gap-2 text-base font-medium tracking-tight whitespace-nowrap text-foreground no-underline">
          <img class="sigla-dark h-7 w-auto" src="/logo-dark.png" alt="" /><img class="sigla-light h-7 w-auto" src="/logo-light.png" alt="" />
          <span class="lg:max-xl:sr-only">${brand}</span></a>
        <button type="button" class=${btn('ghost', 'icon', 'ml-auto rounded-full text-lg lg:hidden')} aria-label="Meniu" aria-expanded=${open}
          onClick=${() => setOpen(!open)}>${open ? '✕' : '☰'}</button>
        <nav class=${cx('flex-col max-lg:w-full max-lg:overflow-y-auto max-lg:pb-2 lg:flex lg:flex-row lg:items-center lg:gap-5 xl:gap-7',
          '[@media(max-height:500px)]:max-h-[60vh]', open ? 'flex' : 'hidden')}
          onClick=${(e) => { if (e.target.closest('a')) setOpen(false); }}>
          ${links.map((l) => (l && l.href ? html`<a href=${l.href} class=${navLink(l.on)} aria-current=${l.on ? 'page' : undefined}>${l.label}</a>` : l))}
        </nav>
        <div class=${cx('items-center gap-2 text-xs font-medium text-muted-foreground lg:ml-auto lg:flex',
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
  return html`<button type="button" data-ro class=${btn('ghost', 'icon-sm', 'rounded-full')} aria-label=${lbl} title=${lbl}
    onClick=${() => setT(window.iccTema ? window.iccTema.comuta() : t)}>
    <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${t === 'dark'
        ? html`<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />`
        : html`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />`}</svg></button>`;
}

  return { Antet, ThemeToggle, navLink, useScrolled };
}
