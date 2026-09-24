import {test, expect} from "@playwright/test";

// G-AXIS-03 — a família da ORIENTAÇÃO, medida no navegador.
//
// A matriz do §13 achou ONZE capacidades sem eixo de orientação, e foi o padrão mais forte que
// ela produziu. Duas delas eram a MESMA coisa que o `G-CAP-24` e o `G-CAP-25` já tinham
// ensinado — **o motor entrega e o React não expõe**: o `@base-ui/react` 1.6.0 declara
// `orientation` em `tabs` e `menubar`, e a Aurea não passava adiante.
//
// Por que aqui e não no vitest: o teste unitário cobra a ESTRUTURA (a classe sai, o core tem a
// regra). Vertical é LAYOUT, e layout é caixa — jsdom não faz grade nem flex, então lá "está
// certo" quer dizer só "a regra existe". As três coisas abaixo só existem medindo:
//   • a lista fica AO LADO do painel e não em cima dele;
//   • a lista NÃO estica até a altura do painel (era a razão de a raiz ser grade e não linha);
//   • os itens medem IGUAL entre si e não a viewport inteira.
//
// A última custou uma volta: `align-items:stretch` no `.menubar-vertical` fazia cada gatilho
// medir **1216px**, porque `.menubar` é flex de nível de bloco e ocupa o pai inteiro. Invisível
// na horizontal, gritante na vertical. `inline-size:max-content` é o que faz `stretch` querer
// dizer "todos do tamanho do MAIOR rótulo".
//
// O banco é `apps/keyboard-probe`: é o único lugar do repositório onde os componentes montam de
// verdade num navegador. O catálogo é estático.
const APP = "/apps/keyboard-probe/out/index.html";

// O SELETOR TEM DE FALHAR ALTO, e esta função existe por causa de um caso concreto: até
// 28/08/2026 os dois testes de `Tabs` procuravam `.tabs-vertical`, uma classe que o
// `G-AXIS-06` APAGOU em 22/08 quando a orientação passou a vir do `data-orientation` que o
// motor publica. `boundingBox()` num locator que não casa não devolve `null` — ele ESPERA, e o
// teste morre 30 segundos depois com "Test timeout of 30000ms exceeded", que não diz nada sobre
// o que aconteceu de verdade. Um gate quebrado que parece lento é pior que um gate vermelho.
//
// É a mesma lição do probe de teclado medindo a aba do banco anterior: instrumento que erra em
// silêncio mede o vizinho. Aqui ele não mede nada, e demora meio minuto para não dizer isso.
async function caixa(page: import("@playwright/test").Page, sel: string) {
  const n = await page.locator(sel).count();
  expect(n, `o seletor \`${sel}\` não casou com NADA na página. Isto não é o componente ` +
    `errado — é o gate medindo um HTML que não existe mais. Confira a classe no core e no ` +
    `React antes de mexer no componente.`).toBeGreaterThan(0);
  return (await page.locator(sel).first().boundingBox())!;
}

test("Tabs vertical: a lista fica ao lado do painel, e não estica com ele", async ({page}) => {
  await page.goto(APP);
  const raiz = '[data-probe="TabsVertical"]';
  const lista = await caixa(page, `${raiz} .tabs[data-orientation="vertical"]`);
  const painel = await caixa(page, `${raiz} [role="tabpanel"]`);
  expect(painel.x, "o painel tem de começar DEPOIS da lista — é o eixo, não é decoração")
    .toBeGreaterThanOrEqual(lista.x + lista.width);
  // as abas empilham e medem igual: coluna de larguras diferentes sai serrilhada
  const abas = await page.$$eval(`${raiz} .tab`, els => els.map(e => {
    const r = e.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width)};
  }));
  expect(abas.length).toBeGreaterThan(1);
  expect(new Set(abas.map(a => a.w)).size, `abas de larguras diferentes: ${abas.map(a => a.w)}`).toBe(1);
  expect(new Set(abas.map(a => a.x)).size, "abas em colunas diferentes: não empilharam").toBe(1);
  for (let i = 1; i < abas.length; i++) expect(abas[i].y).toBeGreaterThan(abas[i - 1].y);
});

test("Tabs vertical: a lista NÃO herda a altura do painel", async ({page}) => {
  await page.goto(APP);
  const raiz = '[data-probe="TabsVertical"]';
  const lista = await caixa(page, `${raiz} .tabs[data-orientation="vertical"]`);
  const abas = await page.$$eval(`${raiz} .tab`, els =>
    els.reduce((s, e) => s + e.getBoundingClientRect().height, 0));
  // a lista mede as abas mais o próprio respiro, não a altura do conteúdo ao lado. A folga é
  // o padding do `.tabs`; o que se cobra é que ela não esticou para acompanhar o painel.
  expect(lista.height, `a lista mede ${lista.height} para ${abas} de abas — esticou`)
    .toBeLessThan(abas + 40);
});

test("Menubar vertical: os gatilhos medem o maior rótulo, não a viewport", async ({page}) => {
  await page.goto(APP);
  const raiz = '[data-probe="MenubarVertical"]';
  const gs = await page.$$eval(`${raiz} .menubar-trigger`, els => els.map(e => {
    const r = e.getBoundingClientRect(); return {y: Math.round(r.y), w: Math.round(r.width)};
  }));
  const largura = await page.evaluate(() => document.documentElement.clientWidth);
  expect(gs.length).toBeGreaterThan(1);
  expect(new Set(gs.map(g => g.w)).size, `gatilhos de larguras diferentes: ${gs.map(g => g.w)}`).toBe(1);
  expect(gs[0].w, `os gatilhos medem ${gs[0].w} numa página de ${largura} — esticaram até a ` +
    `viewport, que é o defeito que o max-content resolve`).toBeLessThan(largura / 2);
  for (let i = 1; i < gs.length; i++) expect(gs[i].y).toBeGreaterThan(gs[i - 1].y);
});

// A parte da orientação do menubar que NÃO é layout: numa barra vertical o menu não pode abrir
// para baixo, porque abriria em cima do item seguinte da própria barra.
test("Menubar vertical: o menu abre AO LADO, não por baixo", async ({page}) => {
  await page.goto(APP);
  const g = page.locator('[data-probe="MenubarVertical"] .menubar-trigger').first();
  const cg = (await g.boundingBox())!;
  await g.click();
  const popup = page.locator('[role="menu"]').first();
  await expect(popup).toBeVisible();
  const cp = (await popup.boundingBox())!;
  expect(cp.x, `o menu abriu em x=${Math.round(cp.x)} e o gatilho termina em ` +
    `${Math.round(cg.x + cg.width)} — está por cima da própria barra`)
    .toBeGreaterThanOrEqual(cg.x + cg.width);
});
