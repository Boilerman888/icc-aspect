// icc-aspect v1 – codul de pe telefon (MFA) la intrarea în aplicațiile Instalcorp (Ion, 14.11.2026).
//
// Cine și-a activat codul (din Portal) și intră doar cu parola vede peste aplicație fereastra „Codul de pe telefon”:
// scrie codul de 6 cifre din aplicația de autentificare (Microsoft / Google Authenticator, Yubico Authenticator) și intră.
// Sesiunea e comună pe tot instalcorp.ro (sesiune-icc.js), deci codul se cere o singură dată pentru toate aplicațiile,
// până la „Ieși” sau până expiră sesiunea. Conturile fără cod activat nu văd nimic nou.
// Lacătul adevărat e în bază (portal.cere_mfa): fără cod, contul nu citește și nu scrie nimic. Fereastra doar cere codul.
//
// Folosire:
//   import { pazaMfa, activareMfa } from 'icc-aspect/v1/mfa.js';
//   pazaMfa(supabase);                  // o dată per aplicație (tasker.js și vasile.js o pornesc singure)
//   activareMfa(supabase, element);     // pagina de activare (în Portal, doar pentru administrator)

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const doarCifre = (s) => String(s || '').replace(/\D/g, '').slice(0, 6);

const CSS = `
.icm{--m-pri:var(--icc-primary,#2f5bff);--m-pri-fg:var(--icc-primary-foreground,#fff);--m-bg:var(--icc-background,#fff);--m-fg:var(--icc-foreground,#292929);
  --m-card:var(--icc-card,#fff);--m-mut:var(--icc-muted-foreground,#6d6d6d);--m-bd:var(--icc-border,rgba(41,41,41,.12));--m-rosu:#dc2626;--m-verde:#15803d;
  font-family:var(--font-sans,"Inter Tight",Inter,system-ui,sans-serif);font-size:15px;line-height:1.5;color:var(--m-fg);font-weight:400}
:root[data-theme=dark] .icm,.dark .icm{--m-bg:var(--icc-background,#191919);--m-fg:var(--icc-foreground,#ededed);--m-card:var(--icc-card,#212121);
  --m-mut:var(--icc-muted-foreground,#969696);--m-bd:var(--icc-border,rgba(237,237,237,.14));--m-rosu:#f87171;--m-verde:#4ade80}
.icm *{box-sizing:border-box}
.icm button,.icm input{font:inherit;color:inherit}
.icm-fundal{position:fixed;inset:0;z-index:2147483600;background:var(--m-bg);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}
.icm-card{width:100%;max-width:380px;background:var(--m-card);border:1px solid var(--m-bd);border-radius:14px;padding:24px;box-shadow:0 18px 50px rgba(0,0,0,.12)}
.icm h2{margin:0 0 6px;font-size:20px;font-weight:600}
.icm p{margin:0 0 14px;color:var(--m-mut)}
.icm label{display:block;font-weight:600;font-size:13px;margin:0 0 6px}
.icm-cod{width:100%;height:52px;border:1px solid var(--m-bd);border-radius:8px;background:var(--m-bg);text-align:center;
  font-size:26px!important;letter-spacing:.35em;font-variant-numeric:tabular-nums;padding:0 8px}
.icm-cod:focus{outline:2px solid var(--m-pri);outline-offset:1px}
.icm-text{width:100%;height:40px;border:1px solid var(--m-bd);border-radius:8px;background:var(--m-bg);padding:0 10px}
.icm-btn{display:inline-flex;align-items:center;justify-content:center;height:42px;padding:0 16px;border-radius:6px;border:1px solid var(--m-bd);
  background:var(--m-card);cursor:pointer;font-weight:600}
.icm-btn.pri{background:var(--m-pri);color:var(--m-pri-fg);border-color:var(--m-pri)}
.icm-btn[disabled]{opacity:.6;cursor:default}
.icm-rand{display:flex;gap:8px;margin-top:14px}
.icm-rand .icm-btn{flex:1}
.icm-err{color:var(--m-rosu);font-size:13.5px;margin:8px 0 0;min-height:1em}
.icm-ok{color:var(--m-verde);font-weight:600}
.icm-link{background:none;border:0;padding:0;color:var(--m-mut);text-decoration:underline;cursor:pointer;font-size:13.5px;margin-top:16px}
.icm-qr{display:block;width:200px;height:200px;margin:4px auto 10px;background:#fff;border-radius:8px;padding:8px}
.icm-cheie{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;word-break:break-all;background:var(--m-bg);border:1px solid var(--m-bd);
  border-radius:6px;padding:8px;margin:0 0 12px;color:var(--m-fg)}
.icm-lista{list-style:none;margin:0 0 12px;padding:0}
.icm-lista li{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--m-bd)}
.icm-lista li span{color:var(--m-mut);font-size:13.5px}
.icm-pasi{margin:0 0 12px;padding-left:20px;color:var(--m-mut)}
.icm-pasi li{margin:0 0 4px}
`;

function stil() {
  if (document.getElementById('icc-mfa-css')) return;
  const s = document.createElement('style');
  s.id = 'icc-mfa-css';
  s.textContent = CSS;
  document.head.append(s);
}

// factorii verificați de tip cod (TOTP) ai contului
async function factoriCod(sb) {
  const { data, error } = await sb.auth.mfa.listFactors();
  if (error) throw error;
  return (data?.totp || []).filter((f) => f.status === 'verified');
}

// încearcă codul pe fiecare aparat activat (telefon, YubiKey); true la primul care îl acceptă
async function verificaCod(sb, cod) {
  const factori = await factoriCod(sb);
  for (const f of factori) {
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: f.id, code: cod });
    if (!error) return true;
  }
  return false;
}

// ---------- fereastra „Codul de pe telefon” ----------
let fereastra = null;

function arataFereastra(sb) {
  if (fereastra) return;
  stil();
  fereastra = document.createElement('div');
  fereastra.className = 'icm';
  fereastra.innerHTML = `<div class="icm-fundal" role="dialog" aria-modal="true" aria-labelledby="icm-t">
    <form class="icm-card" novalidate>
      <h2 id="icm-t">Codul de pe telefon</h2>
      <p>Deschide aplicația de autentificare (Microsoft Authenticator, Google Authenticator sau Yubico Authenticator) și scrie codul de 6 cifre de la Instalcorp.</p>
      <label for="icm-cod">Cod</label>
      <input id="icm-cod" class="icm-cod" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" placeholder="······" />
      <div class="icm-err" role="alert"></div>
      <div class="icm-rand"><button type="submit" class="icm-btn pri">Intră</button></div>
      <button type="button" class="icm-link" data-iesi>Ieși din cont</button>
    </form></div>`;
  document.body.append(fereastra);
  document.documentElement.style.overflow = 'hidden';
  const form = fereastra.querySelector('form');
  const inp = fereastra.querySelector('#icm-cod');
  const err = fereastra.querySelector('.icm-err');
  const btn = fereastra.querySelector('button[type=submit]');
  inp.addEventListener('input', () => { inp.value = doarCifre(inp.value); err.textContent = ''; if (inp.value.length === 6) form.requestSubmit(); });
  fereastra.querySelector('[data-iesi]').onclick = async () => { await sb.auth.signOut().catch(() => {}); location.reload(); };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const cod = doarCifre(inp.value);
    if (cod.length !== 6) { err.textContent = 'Codul are 6 cifre.'; return; }
    btn.disabled = true; btn.textContent = 'Verific…';
    try {
      if (await verificaCod(sb, cod)) { btn.textContent = 'Gata'; location.reload(); return; }
      err.textContent = 'Cod greșit sau expirat. Așteaptă codul următor și încearcă din nou.';
    } catch (x) {
      err.textContent = 'Nu am putut verifica acum. Verifică internetul și încearcă din nou.';
      console.error(x);
    }
    btn.disabled = false; btn.textContent = 'Intră'; inp.value = ''; inp.focus();
  };
  setTimeout(() => inp.focus(), 50);
}

function ascundeFereastra() {
  if (!fereastra) return;
  fereastra.remove();
  fereastra = null;
  document.documentElement.style.overflow = '';
}

// Verifică sesiunea: fereastra apare doar dacă contul are cod activat și sesiunea e fără cod.
async function verifica(sb) {
  try {
    const { data, error } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return;
    if (data.currentLevel === 'aal1' && data.nextLevel === 'aal2') arataFereastra(sb);
    else ascundeFereastra();
  } catch (x) { console.error(x); }
}

const pazite = new WeakSet();

export function pazaMfa(sb) {
  if (!sb?.auth?.mfa || pazite.has(sb) || typeof document === 'undefined') return;
  pazite.add(sb);
  sb.auth.onAuthStateChange((ev, ses) => {
    if (!ses || ev === 'SIGNED_OUT') { ascundeFereastra(); return; }
    setTimeout(() => verifica(sb), 0);
  });
  // codul introdus în altă aplicație (alt tab) ajunge prin cookie-ul comun: la revenire, fereastra dispare singură
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verifica(sb); });
  verifica(sb);
}

// ---------- activarea (Portal) ----------
const dataRo = (s) => { try { return new Date(s).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return ''; } };

export async function activareMfa(sb, el) {
  stil();
  el.classList.add('icm');
  let factori = [];
  try { factori = await factoriCod(sb); } catch (x) { console.error(x); }
  const lista = factori.length
    ? `<ul class="icm-lista">${factori.map((f) => `<li><b>${esc(f.friendly_name || 'Aparat')}</b><span>activat ${esc(dataRo(f.created_at))}</span></li>`).join('')}</ul>`
    : '<p>Codul de pe telefon nu e activat pe contul tău.</p>';
  el.innerHTML = `<div class="icm-card" style="max-width:520px;box-shadow:none">
    <h2>Codul de pe telefon</h2>
    <p>După activare, la intrare ți se cere și codul de 6 cifre din aplicația de autentificare, o dată pentru toate aplicațiile, până apeși Ieși. Fără cod, contul tău nu vede nimic, chiar dacă cineva îți află parola.</p>
    ${lista}
    <div data-pas></div>
    <div class="icm-rand"><button type="button" class="icm-btn ${factori.length ? '' : 'pri'}" data-adauga>${factori.length ? 'Adaugă încă un aparat (ex. YubiKey)' : 'Activează'}</button></div>
  </div>`;
  el.querySelector('[data-adauga]').onclick = () => pasInrolare(sb, el, factori.length ? 'YubiKey' : 'Telefon');
}

async function pasInrolare(sb, el, numeImplicit) {
  const pas = el.querySelector('[data-pas]');
  el.querySelector('[data-adauga]').parentElement.style.display = 'none';
  pas.innerHTML = `<label for="icm-nume">Numele aparatului</label>
    <input id="icm-nume" class="icm-text" value="${esc(numeImplicit)}" maxlength="40" />
    <div class="icm-rand"><button type="button" class="icm-btn pri" data-cont>Continuă</button></div>
    <div class="icm-err" role="alert"></div>`;
  const err = pas.querySelector('.icm-err');
  pas.querySelector('[data-cont]').onclick = async () => {
    const nume = (pas.querySelector('#icm-nume').value || '').trim() || numeImplicit;
    err.textContent = '';
    try {
      // încercările neterminate (fără cod confirmat) se curăță, ca să nu blocheze numele
      const { data: toti } = await sb.auth.mfa.listFactors();
      for (const f of (toti?.all || []).filter((x) => x.status !== 'verified')) await sb.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
      let r = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: nume, issuer: 'Instalcorp' });
      if (r.error) r = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `${nume} ${new Date().toLocaleString('ro-RO')}`, issuer: 'Instalcorp' });
      if (r.error) throw r.error;
      pasCod(sb, el, r.data);
    } catch (x) {
      console.error(x);
      err.textContent = 'Activarea nu a pornit: ' + (x?.message || 'eroare necunoscută') + '. Reîncearcă.';
    }
  };
}

function pasCod(sb, el, f) {
  const pas = el.querySelector('[data-pas]');
  pas.innerHTML = `<ol class="icm-pasi">
      <li>Pe telefon, deschide aplicația de autentificare și alege „Adaugă cont” → „Scanează cod QR”.</li>
      <li>Scanează codul de mai jos. Pentru YubiKey: în Yubico Authenticator, „Add account” → „Scan QR code”.</li>
      <li>Scrie aici codul de 6 cifre care apare la „Instalcorp”.</li>
    </ol>
    <img class="icm-qr" alt="Cod QR pentru aplicația de autentificare" src="${esc(f.totp.qr_code)}" />
    <p style="margin-bottom:4px">Dacă nu poți scana, scrie de mână cheia:</p>
    <div class="icm-cheie">${esc(f.totp.secret)}</div>
    <label for="icm-cod2">Codul de 6 cifre</label>
    <input id="icm-cod2" class="icm-cod" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······" />
    <div class="icm-err" role="alert"></div>
    <div class="icm-rand"><button type="button" class="icm-btn pri" data-confirma>Confirmă</button></div>`;
  const inp = pas.querySelector('#icm-cod2');
  const err = pas.querySelector('.icm-err');
  const btn = pas.querySelector('[data-confirma]');
  inp.addEventListener('input', () => { inp.value = doarCifre(inp.value); err.textContent = ''; });
  btn.onclick = async () => {
    const cod = doarCifre(inp.value);
    if (cod.length !== 6) { err.textContent = 'Codul are 6 cifre.'; return; }
    btn.disabled = true;
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: f.id, code: cod });
    if (error) { btn.disabled = false; err.textContent = 'Cod greșit sau expirat. Așteaptă codul următor și încearcă din nou.'; return; }
    pas.innerHTML = '<p class="icm-ok">Gata, codul de pe telefon e activat. De acum îl introduci la intrare.</p>';
    setTimeout(() => activareMfa(sb, el), 2500);
  };
}
