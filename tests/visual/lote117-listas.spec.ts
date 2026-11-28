import {test, expect} from "@playwright/test";

// O LOTE 117 (27/11/2026), as listas da web — dois itens que o Victor aprovou olhando a bancada da AUD-1:
//
// 1. "Aprovo a cápsula": o item de UMA linha do menu (e da busca de comandos e do `Combobox`), da `ListBox`, da `Sidebar` e
//    da `NavList` volta à cápsula redonda, como era até a 0.81.1. Desde a 0.82.0 o canto contínuo tratava a conta
//    `--radius-card − --space-1` como canto de superfície: 27, na forma do iPhone. A linha ALTA, com a explicação
//    embaixo, fica como está; e a lateral do SITE, que já pedia cápsula, deixa de herdar a forma do iPhone.
//    Provado contra o defeito: com a folha da 0.83.0, o item de uma linha sai `superellipse(1.65)` com 27 e reprova.
// 2. "Aprovo o desativado": o item desativado da busca de comandos fica apagado, e nem o Enter nem o clique o executam.
//    Provado contra o defeito: sem o `disabled` repassado ao motor, o item sai sem a marca e o Enter nele fecha a janela.
const UMA_LINHA: Array<[string, string]> = [
  ["menu", `<div class="menu" style="position:static"><div class="menu-item" data-alvo>Duplicate</div></div>`],
  ["list-box", `<div class="list-box"><div class="list-box-item" data-alvo>Kilometers</div></div>`],
  ["sidebar", `<aside class="sidebar"><a class="sidebar-item" href="#" data-alvo><span class="sidebar-label">Home</span></a></aside>`],
  ["nav-list", `<ul class="nav-list"><li><button class="nav-list-row" type="button" data-alvo>Profile</button></li></ul>`],
  // O segmento que quebra a linha, numa linha só: o 22 redondo de até a 0.81.1 é a cápsula exata (era 33, ponta de iPhone).
  ["segmento que quebra a linha", `<div class="segmented segmented-lg segmented-wrap" role="radiogroup" aria-label="Size" data-alvo><button type="button" role="radio" aria-checked="true" class="active">md</button><button type="button" role="radio" aria-checked="false">lg</button></div>`],
  ["lateral do site",`<div class="site-shell"><aside class="sidebar"><a class="sidebar-item" href="#" aria-current="page" data-alvo><span class="sidebar-label">Button</span></a></aside></div>`],
];
const ALTAS: Array<[string, string]> = [
  ["menu com explicação", `<div class="menu" style="position:static"><div class="menu-item" data-alvo><span class="menu-item-text"><span>Share</span><span class="menu-item-description">Send a link</span></span></div></div>`],
  ["list-box com explicação", `<div class="list-box"><div class="list-box-item" data-alvo><span class="list-box-item-text"><span class="list-box-item-label">Draft</span><span class="list-box-item-description">Only you can see it</span></span></div></div>`],
  ["nav-list com explicação", `<ul class="nav-list"><li><button class="nav-list-row" type="button" data-alvo><span class="nav-list-text"><span>Billing</span><span class="nav-list-description">Cards and invoices</span></span></button></li></ul>`],
];

test("o item de uma linha é cápsula; a linha alta fica com o canto de superfície", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__lote117-listas`;
  const casos = [...UMA_LINHA.map(([n, h]) => ["uma", n, h]), ...ALTAS.map(([n, h]) => ["alta", n, h])];
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head><link rel="stylesheet" href="/apps/catalog/assets/catalog.css"></head>
      <body style="width:360px">${casos.map(([tipo, nome, html]) => `<div data-tipo="${tipo}" data-nome="${nome}">${html}</div>`).join("")}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const desenha = await p.evaluate(() => CSS.supports("corner-shape", "superellipse(2)"));
  const medidas = await p.$$eval("[data-nome]", (caixas) => caixas.map((c) => {
    const el = c.querySelector("[data-alvo]") as HTMLElement;
    const cs = getComputedStyle(el) as CSSStyleDeclaration & {cornerShape?: string};
    return {tipo: (c as HTMLElement).dataset.tipo!, nome: (c as HTMLElement).dataset.nome!, forma: cs.cornerShape ?? "",
      raio: parseFloat(cs.borderTopLeftRadius), altura: el.getBoundingClientRect().height};
  }));
  expect(medidas).toHaveLength(UMA_LINHA.length + ALTAS.length);
  for (const m of medidas) {
    if (m.tipo === "uma") {
      // A cápsula: o raio passa da metade da altura, e o canto é redondo.
      expect(m.raio, m.nome).toBeGreaterThanOrEqual(m.altura / 2);
      if (desenha) expect(m.forma, m.nome).toMatch(/^(round|superellipse\(1\))$/);
    } else {
      // A linha alta não muda: a conta de 18, com o canto contínuo onde o navegador o desenha.
      expect(m.altura, m.nome).toBeGreaterThan(40);
      expect(m.raio, m.nome).toBe(desenha ? 27 : 18);
      if (desenha) expect(m.forma, m.nome).toBe("superellipse(1.65)");
    }
  }
});

test("a busca de comandos: o item desativado fica apagado e não executa", async ({page}) => {
  await page.goto("/apps/catalog/commandpalette.html", {waitUntil: "networkidle"});
  // O exemplo mora num <details> fechado, e a caixa só acende perto da tela.
  await page.locator("details", {has: page.locator("summary", {hasText: "Disabled item"})}).evaluate((d) => { (d as HTMLDetailsElement).open = true; });
  const botao = page.getByRole("button", {name: "Search, with a disabled item"});
  await botao.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-ligada="sim"]', {has: botao})).toBeAttached({timeout: 15000});
  await botao.click();
  const dialogo = page.getByRole("dialog");
  const apagar = dialogo.getByRole("option", {name: /Delete/});
  await expect(apagar).toHaveAttribute("aria-disabled", "true");
  expect(Number(await apagar.evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(1);
  // O primeiro acende sozinho. A seta PARA no desativado, como no item indisponível da `NavList` (a regra da Aurea: fica
  // no caminho e não age) — é o motor que decide, igual no `Combobox`. O Enter nele não executa o comando: a janela fica.
  await expect(dialogo.getByRole("option", {name: /New document/})).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("ArrowDown");
  await expect(apagar).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("Enter");
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(dialogo.getByRole("option", {name: /Duplicate/})).toHaveAttribute("data-highlighted", "");
  // O mouse em cima do desativado não o acende ("não reage ao mouse"): o acendido continua onde o teclado deixou.
  await apagar.hover();
  await page.mouse.move(0, 0, {steps: 1});
  await apagar.hover();
  await expect(apagar).not.toHaveAttribute("data-highlighted", "");
  await expect(dialogo.getByRole("option", {name: /Duplicate/})).toHaveAttribute("data-highlighted", "");
  // O clique no desativado não executa.
  await apagar.click({force: true});
  await expect(dialogo).toBeVisible();
});
