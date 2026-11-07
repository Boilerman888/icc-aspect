// icc-aspect v1 – piesele de ecran ICC în stilul dashboardcn / shadcn (new-york), ca liste de clase Tailwind.
// Doar clase, nicio logică: merge la fel în Preact (class=) și în React (className=).
// Regula: o pagină trecută pe aspectul nou folosește DOAR aceste clase (nu .btn, .card, .tag vechi),
// ca stilurile vechi ale aplicației să nu se mai amestece.

export const cx = (...a) => a.filter(Boolean).join(' ');

const BTN_BASE = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium leading-none no-underline transition-[color,box-shadow,background-color] outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50';
const BTN_VAR = {
  default: 'border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
  outline: 'border-border bg-background text-foreground shadow-xs hover:bg-accent dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent',
  destructive: 'border-transparent bg-destructive text-white shadow-xs hover:bg-destructive/90',
  link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:underline',
};
const BTN_SIZE = {
  default: 'h-9 px-4',
  sm: 'h-8 gap-1.5 px-3',
  xs: 'h-6 gap-1 rounded-md px-2 text-xs',
  lg: 'h-10 px-6',
  icon: 'size-9 p-0',
  'icon-sm': 'size-8 p-0',
};
export const btn = (variant = 'default', size = 'default', extra = '') => cx(BTN_BASE, BTN_VAR[variant], BTN_SIZE[size], extra);

export const card = 'flex flex-col gap-6 rounded-xl border border-border bg-card py-6 text-card-foreground shadow-sm';
export const cardPad = 'px-6';
export const cardTitle = 'm-0 text-base leading-none font-semibold tracking-tight';
export const cardDesc = 'm-0 text-sm text-muted-foreground';

export const input = 'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm dark:bg-input/30';
export const select = input.replace('w-full ', 'w-full sm:w-auto ') + ' cursor-pointer appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9 [background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23888%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")]';
// săgeata de listă, pentru butoanele care deschid un meniu (ex. filtrul de status)
export const chevron = 'ml-auto size-4 shrink-0 opacity-50';
export const checkbox = 'size-4 shrink-0 cursor-pointer rounded-[4px] accent-primary';
export const label = 'flex items-center gap-2 text-sm leading-none font-medium select-none';

export const badge = 'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium';
export const badgeOutline = badge + ' border-border text-foreground';
export const badgeSecondary = badge + ' border-transparent bg-secondary text-secondary-foreground';

// tabel (ui/table.tsx)
export const tableWrap = 'relative w-full overflow-x-auto';
export const table = 'w-full caption-bottom border-collapse text-sm';
export const thead = '[&_tr]:border-b [&_tr]:border-border';
export const tr = 'border-b border-border transition-colors hover:bg-muted/50';
export const th = 'h-10 px-3 text-left align-middle text-sm font-medium whitespace-nowrap normal-case tracking-normal text-muted-foreground bg-transparent';
export const td = 'p-3 align-middle';

// comutator (ui/tabs.tsx, TabsList + TabsTrigger)
export const tabsList = 'inline-flex h-9 w-fit max-w-full max-sm:w-full items-center justify-center overflow-x-auto rounded-lg bg-muted p-[3px] text-muted-foreground [scrollbar-width:none]';
export const tabsTrigger = (on) => cx('inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent bg-transparent px-2.5 py-1 text-sm font-medium max-sm:px-1.5 max-sm:text-xs transition-[color,box-shadow]',
  on ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30' : 'text-foreground/60 hover:text-foreground dark:text-muted-foreground');

// fereastră (ui/dialog.tsx)
export const overlay = 'fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]';
export const dialog = 'relative grid w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 text-foreground shadow-lg';

// meniul derulant (ui/dropdown-menu.tsx)
export const popover = 'absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md';
export const menuItem = 'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent';

// Regula pentru lățimi: piesele de mai sus au deja o lățime (w-full); o lățime proprie se dă cu „!” la final (ex. w-20!),
// ca să câștige sigur (fără build de JS nu avem tailwind-merge).

// pagina: lățimea coloanei de conținut (container-page din dashboardcn)
export const page = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-9';
export const h1 = 'm-0 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]';
export const muted = 'text-muted-foreground';

// câmp cu etichetă deasupra (ui/field.tsx): <label class=${field}>Etichetă<input class=${input} /></label>
export const field = 'grid min-w-0 content-start gap-2 text-sm leading-none font-medium text-foreground';
export const fieldHint = 'text-xs leading-snug font-normal text-muted-foreground';
// câmp mic, pentru tabele cu multe coloane (cantități, prețuri)
export const inputSm = 'h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-60 dark:bg-input/30';
export const textarea = 'min-h-16 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 md:text-sm dark:bg-input/30';

// mesaj în pagină (ui/alert.tsx): info, atenție, eroare, reușită
const ALERT = {
  info: 'border-border bg-card text-card-foreground',
  warn: 'border-amber-500/40 bg-amber-500/8 text-foreground',
  err: 'border-destructive/40 bg-destructive/8 text-foreground',
  ok: 'border-emerald-500/40 bg-emerald-500/8 text-foreground',
};
export const alert = (tone = 'info') => cx('relative grid w-full gap-1 rounded-lg border px-4 py-3 text-sm leading-relaxed', ALERT[tone] || ALERT.info);

// grupul de acțiuni de pe un rând (butoane care se rup frumos pe telefon)
export const actions = 'flex flex-wrap items-center gap-2';
// cutie simplă (aspectul de card, fără așezare): pentru grile și rânduri proprii
export const panel = 'rounded-xl border border-border bg-card text-card-foreground shadow-sm';
