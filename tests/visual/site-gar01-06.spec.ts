import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// GAR-01 e GAR-06 (07/10/2026) · o cabeçalho e o rodapé de SITE, medidos no navegador, nos três
// motores. O cabeçalho é o `Header` (o antigo `Topbar`) com `items`; o rodapé, a `Section` com
// `variant="footer"`. O que se cobra:
//   • a barra tem a altura do `--topbar-height` (64, a da referência principal);
//   • o atual tem a cor de destaque (`--primary-emphasis`) e os outros, a apagada;
//   • abaixo de 768 os links saem da barra, o botão aparece, e o painel desce COLADO embaixo dela,
//     com a largura dela, abrível e percorrível pelo TECLADO (um POPOVER nativo — sem JavaScript);
//   • o Esc e o toque fora fecham o painel, e o Esc devolve o foco ao botão (opção "B" do Victor,
//     07/10/2026: com o `<details>` da primeira versão, nenhum dos dois fechava);
//   • entre 768 e 1023, sem `maxWidth`, os links ficam na linha da marca (a regra da barra do
//     `AppShell` os mandava para uma segunda linha, e a barra ia de 64 para 80);
//   • o rodapé empilha no celular e reparte as colunas no computador.
// Provado contra o defeito: na 0.22.0 não há `Header` com `items` nem `Section` com rodapé — os
// seletores abaixo não acham nada e tudo reprova. E contra a primeira versão do K2 (`<details>`):
// sem o `popovertarget` o Esc e o toque fora não fecham, e o teste do Esc reprova.
const ITENS = [
  {id: "inicio", label: "Início", href: "#inicio"},
  {id: "motos", label: "Motos", href: "#motos"},
  {id: "carros", label: "Carros", href: "#carros"},
];
const COLUNAS = [
  {title: "Produto", items: [{id: "precos", label: "Preços", href: "#precos"}, {id: "novidades", label: "Novidades", href: "#novidades"}]},
  {title: "Empresa", items: [{id: "sobre", label: "Sobre", href: "#sobre"}]},
  {title: "Ajuda", items: [{id: "contato", label: "Contato", href: "#contato"}]},
];
const PAGINA = renderToStaticMarkup(h("div", null,
  h(A.Header, {variant: "flush", divider: true, maxWidth: "xl", brand: h("strong", null, "Aurea"), items: ITENS,
    current: "motos", actions: h("button", {type: "button", className: "btn btn-primary"}, "Entrar")}),
  h(A.Container, {id: "conteudo"}, h("p", null, "Conteúdo da página")),
  h(A.Section, {variant: "footer", brand: h("strong", null, "Aurea"), links: COLUNAS, legal: "© 2026 Aurea"}),
  h("span", {id: "sonda-destaque", style: {color: "var(--primary-emphasis)"}}, "x"),
  h("span", {id: "sonda-apagada", style: {color: "var(--muted-foreground)"}}, "x")));

// A barra SOLTA (`floating`, sem `maxWidth`): uma caixa com margem, e o `nav` como filho direto do
// `<header>` — o caso que a regra da barra do `AppShell` pegava entre 768 e 1023.
const PAGINA_SOLTA = renderToStaticMarkup(h("div", null,
  h(A.Header, {variant: "floating", brand: h("strong", null, "Aurea"), items: ITENS, current: "motos",
    actions: h("button", {type: "button", className: "btn btn-primary"}, "Entrar")}),
  h("main", {style: {height: "1600px"}}, h("button", {type: "button", id: "fora"}, "Fora"))));

async function abrir(p: Page, baseURL: string | undefined, largura: number, corpo = PAGINA) {
  await p.setViewportSize({width: largura, height: 800});
  const url = `${baseURL}/__site-gar01-06`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body style="margin:0">${corpo}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
const caixa = (p: Page, sel: string) => p.locator(sel).first().evaluate((e) => {
  const r = e.getBoundingClientRect();
  return {x: r.left, y: r.top, w: r.width, h: r.height, fim: r.bottom, dir: r.right};
});
const estilo = (p: Page, sel: string, prop: string) =>
  p.locator(sel).first().evaluate((e, k) => getComputedStyle(e).getPropertyValue(k), prop);

test("GAR-01 · no computador: 64 de altura, links na barra, o atual em destaque", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 1280);
  // A faixa SEM o fio de baixo (`clientHeight`): o fio fica por fora, como na referência.
  const faixa = await p.locator("header.topbar").evaluate((e) => e.clientHeight);
  const alvo = await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-height")) * 16);
  expect(faixa, "a faixa tem a altura do --topbar-height").toBe(alvo);
  await expect(p.locator(".topbar-nav")).toBeVisible();
  await expect(p.locator("button.topbar-menu-toggle")).toBeHidden();
  const atual = await estilo(p, '.topbar-nav [aria-current="page"]', "color");
  const outro = await estilo(p, '.topbar-nav a:not([aria-current])', "color");
  expect(atual).toBe(await estilo(p, "#sonda-destaque", "color"));
  expect(outro).toBe(await estilo(p, "#sonda-apagada", "color"));
  expect(atual).not.toBe(outro);
  // O miolo da barra se alinha com o Container da página logo abaixo.
  const miolo = await caixa(p, ".topbar-inner");
  const pagina = await caixa(p, "#conteudo");
  expect(miolo.x).toBe(pagina.x);
  expect(miolo.w).toBe(pagina.w);
});

const painelAberto = (p: Page) => p.locator(".topbar-menu-panel").evaluate((e) => e.matches(":popover-open"));
const fimDaFaixa = (p: Page) => p.locator("header.topbar").evaluate((e) => e.getBoundingClientRect().top + e.clientTop + e.clientHeight);

test("GAR-01 · no celular: o botão abre o painel colado embaixo da barra, pelo teclado", async ({page: p, baseURL, browserName}) => {
  await abrir(p, baseURL, 360);
  await expect(p.locator(".topbar-nav")).toBeHidden();
  const botao = p.locator("button.topbar-menu-toggle");
  await expect(botao).toBeVisible();
  await expect(p.locator(".topbar-menu-panel")).toBeHidden();
  await expect(p.locator(".topbar-actions")).toBeVisible();
  // Teclado: foco no botão, Enter abre, Tab entra no painel pelo primeiro link.
  await botao.focus();
  await p.keyboard.press("Enter");
  await expect(p.locator(".topbar-menu-panel")).toBeVisible();
  expect(await painelAberto(p)).toBe(true);
  // O próximo foco depois do botão é o primeiro link do painel. No WebKit isso NÃO se cobra pelo
  // Tab, e a ausência é medida (07/10/2026): ali nem Tab nem Option+Tab chegam a link NENHUM da
  // página — nem a um link fora do cabeçalho —, só a botão. É a preferência do Safari de não tabular
  // por links, e não o painel: com um BOTÃO dentro do popover, o Tab do WebKit 26.5 entra nele
  // (medido na mesma data). No WebKit se cobra o que é verdade: o link está visível e recebe foco.
  if (browserName === "webkit") {
    const primeiro = p.locator(".topbar-menu-panel a").first();
    await primeiro.focus();
    expect(await p.evaluate(() => document.activeElement?.textContent)).toBe("Início");
  } else {
    await p.keyboard.press("Tab");
    expect(await p.evaluate(() => document.activeElement?.textContent)).toBe("Início");
  }
  const barra = await caixa(p, "header.topbar");
  const painel = await caixa(p, ".topbar-menu-panel");
  expect(Math.round(painel.y), "o painel começa onde a faixa termina, em cima do fio").toBe(Math.round(await fimDaFaixa(p)));
  expect(painel.x).toBe(barra.x);
  expect(painel.w).toBe(barra.w);
  const links = await p.locator(".topbar-menu-panel a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().top));
  expect(links[1]).toBeGreaterThan(links[0]);
  // E fecha pelo mesmo botão.
  await botao.focus();
  await p.keyboard.press("Enter");
  await expect(p.locator(".topbar-menu-panel")).toBeHidden();
});

test("GAR-01 · no celular: o Esc e o toque fora fecham o painel, e o Esc devolve o foco ao botão", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360, PAGINA_SOLTA);
  // `.topbar-menu-toggle` e não `button.`: o seletor acha o botão também na primeira versão (`<summary>`),
  // e é assim que este teste chega ao Esc e reprova nela pelo COMPORTAMENTO, não por falta de elemento.
  const botao = p.locator(".topbar-menu-toggle");
  // Esc com o foco DENTRO do painel: fecha, e o foco volta ao botão (não fica órfão no <body>).
  // O painel abre pelo TECLADO, que é quando há foco para devolver. Pelo toque, o WebKit não põe o
  // foco no botão (a convenção do Safari para botões), o navegador não tem para onde devolvê-lo e
  // ele vai para o <body> — medido em 07/10/2026; o Chromium e o Firefox devolvem ao botão. A
  // gaveta do `AppShell` corrige isso com JavaScript (ADR-0019); o `Header` é de servidor e não tem.
  await botao.focus();
  await p.keyboard.press("Enter");
  await expect(p.locator(".topbar-menu-panel")).toBeVisible();
  await p.locator(".topbar-menu-panel a").first().focus();
  await p.keyboard.press("Escape");
  await expect(p.locator(".topbar-menu-panel")).toBeHidden();
  await expect(botao).toBeFocused();
  // Toque fora: fecha.
  await botao.click();
  await expect(p.locator(".topbar-menu-panel")).toBeVisible();
  await p.mouse.click(180, 600);
  await expect(p.locator(".topbar-menu-panel")).toBeHidden();
  expect(await painelAberto(p)).toBe(false);
});

test("GAR-01 · na barra solta, o painel cola na caixa e toma a largura dela", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360, PAGINA_SOLTA);
  await p.locator(".topbar-menu-toggle").click();
  const barra = await caixa(p, "header.topbar");
  const painel = await caixa(p, ".topbar-menu-panel");
  // A `floating` é uma caixa com margem: o painel não vai de ponta a ponta da tela, e sim da caixa.
  expect(barra.x, "a caixa tem margem").toBeGreaterThan(0);
  expect(Math.round(painel.y)).toBe(Math.round(await fimDaFaixa(p)));
  expect(painel.x).toBe(barra.x);
  expect(painel.w).toBe(barra.w);
});

test("GAR-01 · no computador o botão e o painel não aparecem, nem com o painel aberto", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 1280);
  await p.locator(".topbar-menu-panel").evaluate((e) => (e as HTMLElement).showPopover());
  await expect(p.locator("button.topbar-menu-toggle")).toBeHidden();
  await expect(p.locator(".topbar-menu-panel")).toBeHidden();
  await expect(p.locator(".topbar-nav")).toBeVisible();
});

test("GAR-01 · entre 768 e 1023, sem maxWidth, os links ficam na linha da marca", async ({page: p, baseURL}) => {
  // A barra de 900 tem de ter a MESMA altura da de 1280: nada desceu para uma segunda linha. (A
  // `floating` tem borda, e os 64 dela a incluem; por isso se compara com ela mesma, não com o token.)
  await abrir(p, baseURL, 1280, PAGINA_SOLTA);
  const larga = (await caixa(p, "header.topbar")).h;
  await abrir(p, baseURL, 900, PAGINA_SOLTA);
  expect((await caixa(p, "header.topbar")).h, "em 900, a barra com a altura de 1280").toBe(larga);
  const marca = await caixa(p, ".brand");
  const nav = await caixa(p, ".topbar-nav");
  expect(nav.x, "os links à direita da marca, não embaixo dela").toBeGreaterThan(marca.dir);
  expect(Math.round(nav.y + nav.h / 2)).toBe(Math.round(marca.y + marca.h / 2));
});

test("GAR-01 · o botão do menu anuncia aberto e fechado, e quem preenche é o navegador", async ({page: p, baseURL, browserName}) => {
  // CHROMIUM SÓ, pelo mesmo motivo do `shell-nav.spec` (ADR-0019): o estado `expanded` do botão
  // de popover é IMPLÍCITO — não há `aria-expanded` no DOM — e só a árvore de acessibilidade o
  // mostra, por CDP, que é do Chromium. Nos outros dois, os testes acima medem o comportamento.
  test.skip(browserName !== "chromium", "a árvore de acessibilidade só se lê por CDP, que é do Chromium");
  await abrir(p, baseURL, 360);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Accessibility.enable");
  const estado = async () => {
    const {nodes} = await cdp.send("Accessibility.getFullAXTree") as any;
    const n = nodes.find((x: any) => x.role?.value === "button" && x.name?.value === "Menu");
    return n?.properties?.find((q: any) => q.name === "expanded")?.value?.value;
  };
  expect(await estado(), "fechado, o botão anuncia expanded=false").toBe(false);
  await p.locator("button.topbar-menu-toggle").click();
  await expect(p.locator(".topbar-menu-panel")).toBeVisible();
  expect(await estado(), "aberto, o botão anuncia expanded=true").toBe(true);
});

test("GAR-06 · o rodapé empilha no celular e reparte as colunas no computador", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360);
  expect(await p.locator("footer.section-footer").count()).toBe(1);
  const g360 = await p.locator(".section-footer-group").evaluateAll((gs) => gs.map((g) => {
    const r = g.getBoundingClientRect(); return {x: r.left, y: r.top};
  }));
  expect(new Set(g360.map((g) => g.x)).size, "no celular, uma coluna só").toBe(1);
  expect(g360[1].y).toBeGreaterThan(g360[0].y);
  const marca360 = await caixa(p, ".section-footer-brand");
  expect(marca360.fim).toBeLessThanOrEqual(g360[0].y);

  await abrir(p, baseURL, 1280);
  const g1280 = await p.locator(".section-footer-group").evaluateAll((gs) => gs.map((g) => {
    const r = g.getBoundingClientRect(); return {x: r.left, y: r.top};
  }));
  expect(new Set(g1280.map((g) => g.y)).size, "no computador, as colunas lado a lado").toBe(1);
  const marca = await caixa(p, ".section-footer-brand");
  const nav = await caixa(p, ".section-footer-nav");
  expect(marca.dir).toBeLessThanOrEqual(nav.x);
  const legal = await caixa(p, ".section-footer-legal");
  expect(legal.y).toBeGreaterThan(nav.fim);
  expect(await estilo(p, ".section-footer-legal", "border-top-style")).toBe("solid");
});
