// Tira as fotos da vitrine que o `tests/unit/native-vitrine.test.tsx` gerou.
//
//   npx vitest run tests/unit/native-vitrine.test.tsx   <- gera o HTML
//   node scripts/tirar-vitrine.mjs                      <- gera os PNG
//
// ⚠ O caminho e' derivado da raiz do repositorio, e nao escrito a mao: caminho absoluto num
// script e' a armadilha que a ADR-0013 ja' pagou tres vezes (o `publicar.mjs` documenta).
import {chromium} from "@playwright/test";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagina = `file://${join(raiz, "tmp-vitrine", "index.html")}`;
const saida = (n) => join(raiz, "tmp-vitrine", n);
const nav = await chromium.launch();
const pg = await nav.newPage({viewport: {width: 900, height: 900}, deviceScaleFactor: 3});
await pg.goto(`file://${process.cwd()}/tmp-vitrine/index.html`);
await pg.waitForTimeout(700);
// MEDIR ANTES DE FOTOGRAFAR — o vao entre irmaos dentro do Card, no pixel.
const diag = await pg.evaluate(() => {
  const campo = document.querySelector('[data-testid="nf-a-campo"]');
  const c = getComputedStyle(campo);
  const card = campo.closest('[data-rn="View"][style*="border-radius: 22px"]');
  const filhos = card ? [...card.children] : [];
  const vaos = [];
  for (let i = 1; i < filhos.length; i++) {
    vaos.push(Math.round(filhos[i].getBoundingClientRect().top -
                         filhos[i-1].getBoundingClientRect().bottom));
  }
  return {borda: c.borderColor, estilo: c.borderStyle, largura: c.borderWidth,
          raio: c.borderRadius, altura: c.height, vaosNoCard: vaos};
});
console.log(JSON.stringify(diag, null, 2));
const pr = await pg.$$(".prancha");
for (let i = 0; i < pr.length; i++)
  await pr[i].screenshot({path: saida(`prancha-${i+1}.png`)});
await pg.screenshot({path: saida("vitrine.png"), fullPage: true});
await nav.close();
