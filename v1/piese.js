// icc-aspect v1 – piese Preact comune: meniul derulant („Mai multe”).
// Folosire: const { Meniu } = creeazaPiese({ html, useState, useEffect, useRef });
import { btn, popover, menuItem, cx } from './ui.js';

export function creeazaPiese({ html, useState, useEffect, useRef }) {

// items: [{ label, onClick, href, danger, disabled, title }] (null-urile se sar)
function Meniu({ label = 'Mai multe', items, align = 'right', variant = 'outline' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); };
  }, [open]);
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return html`<div class="relative" ref=${ref}>
    <button type="button" class=${btn(variant)} aria-haspopup="menu" aria-expanded=${open} onClick=${() => setOpen(!open)}>${label}
      <svg class="size-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>
    ${open && html`<div role="menu" class=${cx(popover, 'w-60 max-h-[min(70vh,24rem)] overflow-y-auto', align === 'right' ? 'right-0' : 'left-0')}>
      ${list.map((it) => {
        const cls = cx(menuItem, 'no-underline', it.danger ? 'text-destructive-foreground hover:bg-destructive/10!' : 'text-popover-foreground', it.disabled && 'pointer-events-none opacity-50');
        const go = () => { setOpen(false); it.onClick && it.onClick(); };
        return it.href
          ? html`<a role="menuitem" class=${cls} href=${it.href} title=${it.title || ''} onClick=${() => setOpen(false)}>${it.label}</a>`
          : html`<button type="button" role="menuitem" class=${cx(cls, 'border-0 bg-transparent text-left')} disabled=${it.disabled} title=${it.title || ''} onClick=${go}>${it.label}</button>`;
      })}</div>`}
  </div>`;
}

  return { Meniu };
}
