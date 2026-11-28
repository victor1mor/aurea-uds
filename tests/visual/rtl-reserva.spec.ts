import {test, expect} from "@playwright/test";
import {createRequire} from "node:module";
import {mkdtempSync, writeFileSync, readFileSync, readdirSync, copyFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {pathToFileURL, fileURLToPath} from "node:url";

// D-01 (o lote 117, 27/11/2026 — o Victor: "Antes da 1.0"). O empacotador mais comum (o Vite 8, o mesmo do site) reescreve
// `:dir(rtl)` como uma lista de idiomas (`:is(:lang(ar),:lang(he),…)`). Numa página da direita para a esquerda marcada
// com outro idioma, ou sem idioma, as regras deixavam de pegar: o selo preso entrava na caixa, a seta do campo sumia
// atrás do texto e a bolinha da chave ligada saía para fora. O conserto é a reserva `[dir="rtl"]` ao lado de cada regra,
// como a tabela já fazia.
//
// A prova passa a folha publicada pelo Vite DE VERDADE (`vite build`, no padrão dele) e mede no navegador, com a página
// `dir="rtl"` em inglês e sem idioma, contra a mesma página em árabe (que sempre deu certo).
// Provado contra o defeito: com a folha da 0.83.0, em inglês a seta fica à direita, a bolinha anda para o lado errado e
// o selo vai para dentro — este arquivo reprova.
const raiz = resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");

let cssDoVite = "";
test.beforeAll(async () => {
  const exigir = createRequire(join(raiz, "apps/catalog/package.json"));
  const vite = await import(pathToFileURL(exigir.resolve("vite")).href);
  const dir = mkdtempSync(join(tmpdir(), "aurea-d01-"));
  try {
    copyFileSync(join(raiz, "packages/core/dist/aurea.css"), join(dir, "aurea.css"));
    writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><link rel="stylesheet" href="./aurea.css"></head><body></body></html>`);
    await vite.build({root: dir, configFile: false, logLevel: "silent", base: "./", build: {outDir: "out", emptyOutDir: true}});
    const pasta = join(dir, "out/assets");
    cssDoVite = readFileSync(join(pasta, readdirSync(pasta).find((f) => f.endsWith(".css"))!), "utf8");
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

const CORPO = `<body style="padding:40px">
  <label class="switch"><input type="checkbox" role="switch" checked aria-label="Notifications"><span class="switch-track"></span></label>
  <div style="width:280px;margin-top:24px"><button class="select" type="button">Kilometers</button></div>
  <span class="badge-anchor" style="display:inline-block;margin-top:40px"><span class="caixa" style="display:block;width:44px;height:44px"></span>
    <span class="badge badge-danger badge-solid badge-overlay badge-at-top-end">3</span></span>
</body>`;

async function medir(page: import("@playwright/test").Page, baseURL: string | undefined, lang: string | null) {
  const url = `${baseURL}/__rtl-reserva-${lang ?? "sem"}`;
  await page.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html dir="rtl"${lang ? ` lang="${lang}"` : ""} data-theme="light"><head><style>${cssDoVite}</style></head>${CORPO}</html>`}));
  await page.goto(url);
  return page.evaluate(() => {
    const trilho = document.querySelector(".switch-track")!;
    const bolinha = new DOMMatrixReadOnly(getComputedStyle(trilho, "::after").transform);
    const caixa = document.querySelector(".caixa")!.getBoundingClientRect();
    const selo = document.querySelector(".badge-overlay")!.getBoundingClientRect();
    return {
      bolinhaX: Math.round(bolinha.m41),
      seta: getComputedStyle(document.querySelector(".select")!).backgroundPositionX,
      // O centro do selo, da borda ESQUERDA da caixa (o início, na direita para a esquerda).
      seloDaBorda: Math.round(selo.left + selo.width / 2 - caixa.left),
    };
  });
}

test("o CSS passado pelo Vite: a direita para a esquerda vale com qualquer idioma", async ({page, baseURL}) => {
  // O empacotador reescreveu o `:dir(rtl)` (a razão deste teste existir); a reserva continua.
  expect(cssDoVite).toMatch(/:lang\(/);
  expect(cssDoVite).toMatch(/\[dir=["]?rtl["]?\]/);
  const arabe = await medir(page, baseURL, "ar");
  // A referência: a página em árabe sempre saiu certa.
  expect(arabe.bolinhaX).toBeLessThan(0);
  expect(arabe.seta).toBe("12px");
  expect(Math.abs(arabe.seloDaBorda)).toBeLessThanOrEqual(8);
  for (const lang of ["en", null]) {
    const m = await medir(page, baseURL, lang);
    expect(m, `idioma ${lang ?? "nenhum"}`).toEqual(arabe);
  }
});
