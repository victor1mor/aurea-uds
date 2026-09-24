import {defineConfig, devices} from "@playwright/test";

// Visual regression sobre o CATÁLOGO GERADO. Era sobre `apps/docs`, que saiu na Parte D
// do PLANO-1.0 (08/08/2026): 682 KB de HTML escrito à mão, e o catálogo prova o mesmo
// com 183 páginas geradas. O render é determinístico (sem Math.random/Date/timers —
// check 25), então o gate pode ser estrito (maxDiffPixels: 0). Porta 8123 — a 8090
// está ocupada nesta máquina.
const PORT = 8123;
// Os dois specs de CAPTURA. Ficam só no Chromium — o porquê está ao lado de `projects`.
const PIXEL = ["**/catalog.spec.ts", "**/matrix.spec.ts"];

export default defineConfig({
  testDir: "tests/visual",
  testMatch: "**/*.spec.@(ts|tsx)",
  fullyParallel: true,
  // O servidor é um python -m http.server: uma thread só. Com muitos workers as fontes
  // (300KB de woff2 por worker) chegam tarde, a seção reflui no meio da captura e o
  // Playwright falha com "two consecutive stable screenshots" — flake do SERVIDOR, não
  // regressão. Com 2 ainda flakou; 1 worker é o preço de um gate em que se pode confiar.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  expect: {toHaveScreenshot: {maxDiffPixels: 0}},
  // Serve a raiz do repo (não só apps/catalog) para os testes alcançarem
  // packages/core/dist e packages/fonts/dist. O catálogo fica em /apps/catalog/.
  use: {baseURL: `http://127.0.0.1:${PORT}`},
  webServer: {
    command: `python -m http.server ${PORT}`,
    url: `http://127.0.0.1:${PORT}/apps/catalog/`,
    reuseExistingServer: !process.env.CI,
  },
  // ── K1 (PLANO-1.0 Parte K): Firefox e WebKit ────────────────────────────────
  // A pergunta que o item faz é "uma biblioteca publicada que nunca abriu no Safari não sabe
  // se funciona no Safari". A pergunta é sobre FUNCIONAR, não sobre rasterizar igual.
  //
  // Por isso os dois specs de PIXEL ficam só no Chromium, e isso é decisão medida, não
  // economia. Três razões, na ordem em que pesam:
  //
  // 1. `maxDiffPixels: 0` mais motor diferente é reprovação garantida em 100% das capturas.
  //    Rasterização, hinting de fonte e sub-pixel são de cada motor — a Parte D já mediu isso
  //    dentro de UM motor: a Debian pura reprovava 45 capturas que o contêiner passava.
  // 2. Baseline por motor multiplicaria as 44 por três, e por SO por seis. Cada mudança de UI
  //    passaria a exigir seis regravações, e as `-linux` já dependem de um contêiner noutra
  //    máquina. É custo recorrente para responder a uma pergunta que ninguém fez.
  // 3. Não acrescenta informação. Se o WebKit desenhar diferente E isso importar, quem pega é
  //    a medição — `geometry`, `skin` e `catalog-sweep` leem caixa, estilo computado e rolagem
  //    lateral, que é onde uma diferença de motor vira DEFEITO em vez de virar outro pixel.
  //
  // Então: os sete specs de medição rodam nos três motores; os dois de captura, num só.
  // Se um dia a Aurea quiser pixel por motor, isso é decisão nova e cara — não é este item.
  projects: [
    {name: "chromium", use: {...devices["Desktop Chrome"]}},
    {name: "firefox", testIgnore: PIXEL, use: {...devices["Desktop Firefox"]}},
    {name: "webkit", testIgnore: PIXEL, use: {...devices["Desktop Safari"]}},
  ],
});
