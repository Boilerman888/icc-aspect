// Verificarea fiecărei versiuni: JS fără erori de sintaxă și tema se compilează cu Tailwind v4.
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
const versiuni = readdirSync('.').filter((d) => /^v\d+$/.test(d) && statSync(d).isDirectory());
for (const v of versiuni) {
  for (const f of readdirSync(v).filter((f) => f.endsWith('.js'))) execSync(`node --check ${v}/${f}`, { stdio: 'inherit' });
  mkdirSync('.proba', { recursive: true });
  writeFileSync(`.proba/${v}.css`, `@import "tailwindcss";\n@import "../${v}/tema.css";\n${existsSync(`${v}/punte.css`) ? `@import "../${v}/punte.css";\n` : ""}`);
  execSync(`npx tailwindcss -i .proba/${v}.css -o .proba/${v}.out.css`, { stdio: 'inherit' });
  const n = statSync(`.proba/${v}.out.css`).size;
  if (n < 10000) throw new Error(`${v}: CSS prea mic (${n} B)`);
  console.log(`${v}: ok (${n} B)`);
}
