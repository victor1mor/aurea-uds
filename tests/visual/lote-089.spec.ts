import {test, expect, type Page} from "@playwright/test";

// O lote 089 (0.75.0) — o Victor, 19/11/2026: *"Aprovo as três"*.
//   • O achado 2 do 2-D: o traço do escolhido começava a 15 (escrito à mão) e o texto a 16. Na cápsula, ele começa a 16,
//     junto com o texto; na aba QUADRADA (`Tabs secondary` deitada), vai de ponta a ponta (9 de 12 referências).
//   • A ADR-0072, as seis divisões de dentro que faltavam: o `hr`, as fileiras e a barra da citação do `Prose`, embaixo do
//     cabeçalho da central de avisos, acima da parte legal do rodapé e acima das ações do menu do celular — a linha
//     clara (o texto a 10%), no Gold e na Ember.
// Provado contra o defeito: com o core da 0.74.0 reprova (o traço a 15 nos dois; as seis linhas transparentes).

async function abrir(p: Page, baseURL: string | undefined, nome: string, corpo: string, marca = "") {
  const url = `${baseURL}/__lote089-${nome}`;
  await p.setViewportSize({width: 1280, height: 800});
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:24px"><div style="inline-size:480px">${corpo}</div></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
/** O alfa da cor (0 a 255), pelo canvas: `color-mix` sai em formatos diferentes em cada navegador. */
const alfa = (p: Page, js: string) => p.evaluate((codigo) => {
  const cor = new Function(codigo)() as string;
  const cv = document.createElement("canvas").getContext("2d")!; cv.fillStyle = "#000"; cv.fillStyle = cor; cv.fillRect(0, 0, 1, 1);
  return cv.getImageData(0, 0, 1, 1).data[3];
}, js);

const SEGMENTO = `<div role="radiogroup" class="segmented"><button type="button" role="radio">Lista</button>
  <button type="button" role="radio" aria-checked="true" class="active">Quadro</button></div>`;
const ABAS = `<div class="tabs tabs-secondary" role="tablist" data-orientation="horizontal">
  <button class="tab" role="tab">Visão geral</button><button class="tab" role="tab" data-active>Detalhes</button></div>`;

/** Onde o traço do escolhido começa e onde o texto começa, a partir da borda do item. */
const traco = (p: Page, sel: string) => p.evaluate((s) => {
  const el = document.querySelector<HTMLElement>(s)!;
  const r = el.getBoundingClientRect(); const g = getComputedStyle(el, "::after");
  const rg = document.createRange(); rg.selectNodeContents(el);
  return {inicio: Math.round(parseFloat(g.left)), fim: Math.round(parseFloat(g.right)), texto: Math.round(rg.getClientRects()[0].left - r.left)};
}, sel);

for (const marca of ["", "ember"]) {
  const em = marca ? " (Ember)" : "";

  test(`achado 2${em} · na cápsula o traço começa com o texto (16); na aba quadrada, de ponta a ponta`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `traco${marca}`, `${SEGMENTO}<div style="height:24px"></div>${ABAS}`, marca);
    const seg = await traco(p, ".segmented .active");
    expect(seg.inicio, JSON.stringify(seg)).toBe(16);
    expect(seg.inicio, "junto com o texto").toBe(seg.texto);
    const aba = await traco(p, ".tabs-secondary .tab[data-active]");
    expect([aba.inicio, aba.fim], JSON.stringify(aba)).toEqual([0, 0]);
  });

  test(`ADR-0072${em} · as seis divisões de dentro têm a linha clara`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `linhas${marca}`, `
      <div class="prose"><p>Um</p><hr><p>Dois</p><table><tbody><tr><td id="td">A</td></tr></tbody></table>
        <blockquote><p>Citação</p></blockquote></div>
      <div class="notification-head">Avisos</div>
      <div class="section-footer-legal">© 2026</div>
      <div class="topbar-menu-actions"><button class="btn">Entrar</button></div>`, marca);
    const casos: [string, string][] = [
      [".prose hr", "borderTopColor"], ["#td", "borderBottomColor"], [".prose blockquote", "borderLeftColor"],
      [".notification-head", "borderBottomColor"], [".section-footer-legal", "borderTopColor"], [".topbar-menu-actions", "borderTopColor"],
    ];
    for (const [sel, prop] of casos) {
      expect(await alfa(p, `return getComputedStyle(document.querySelector(${JSON.stringify(sel)})).${prop}`), `${sel} desenha a linha`).toBeGreaterThan(0);
      // a linha CLARA: o texto a 10% (no canvas, por volta de 26 de 255), nunca uma linha forte
      expect(await alfa(p, `return getComputedStyle(document.querySelector(${JSON.stringify(sel)})).${prop}`), `${sel} é a linha clara`).toBeLessThan(60);
    }
  });
}

// O SITE (o Victor, 19/11/2026): o achado 3 do 2-D (*"Fundo cresce p/ esquerda"*) — o texto do item atual da lateral fica
// alinhado com os vizinhos; e o seletor de densidade da página de tokens (*"Vira um Select"*) — numa tela de 320 ele vira
// um `Select`, e nada sai cortado. Provado contra o defeito: com o site da 0.74.0, o texto do atual fica 14 à direita e o
// seletor em 320 pede 308 numa seção de 272.
test("site · o texto do item atual da lateral fica alinhado com os vizinhos", async ({page: p, baseURL}) => {
  await p.setViewportSize({width: 1280, height: 800});
  await p.goto(`${baseURL}/apps/catalog/listbox.html`, {waitUntil: "networkidle"});
  const m = await p.evaluate(() => {
    const cur = document.querySelector<HTMLElement>(".site-shell > .sidebar .sidebar-item[aria-current]")!;
    cur.scrollIntoView({block: "center"});
    const texto = (el: Element) => { const lab = el.querySelector(".sidebar-label")!; const tw = document.createTreeWalker(lab, NodeFilter.SHOW_TEXT);
      let n: Node | null; while ((n = tw.nextNode())) { if (n.textContent?.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); return Math.round(rg.getClientRects()[0].left); } } return -1; };
    const viz = cur.closest("li")!.nextElementSibling?.querySelector(".sidebar-item") ?? cur.closest("li")!.previousElementSibling!.querySelector(".sidebar-item")!;
    const ponto = getComputedStyle(cur.querySelector(".sidebar-label")!, "::before");
    return {atual: texto(cur), vizinho: texto(viz), fundo: Math.round(cur.getBoundingClientRect().left), fundoViz: Math.round(viz.getBoundingClientRect().left), ponto: ponto.content};
  });
  expect(m.atual, JSON.stringify(m)).toBe(m.vizinho);
  // "Tudo alinhado" (o Victor, 27/11/2026, o lote 118): o fundo do atual começa onde o dos vizinhos começa — era 14 antes.
  expect(m.fundo, "o fundo do atual começa onde o dos vizinhos começa").toBe(m.fundoViz);
  expect(m.ponto, "o ponto continua").not.toBe("none");
});

// LOTE 118 (o Victor, 27/11/2026, no site no ar: "a caixa do All Components está desalinhada"; na bancada, *"Tudo
// alinhado"*): a cápsula do item atual do alto da lateral passava 14 à esquerda da chave Web | Native (14 contra 28, a
// 1280) e 2 para fora do painel. Agora começa onde a chave e os outros itens começam, e o começo de todos fica numa coluna
// só (em Patterns, o texto do "All patterns" na linha da bolinha de ícone dos componentes). Provado contra o defeito: com o
// site do `main` em 42594763, a cápsula fica em 14.
test("site · a cápsula do item atual começa na chave e nos outros itens, e o começo fica numa coluna", async ({page: p, baseURL}) => {
  await p.setViewportSize({width: 1280, height: 800});
  for (const pagina of ["components.html", "patterns.html"]) {
    await p.goto(`${baseURL}/apps/catalog/${pagina}`, {waitUntil: "networkidle"});
    await expect(p.locator(".site-shell > .sidebar .sidebar-item[aria-current]").first()).toBeVisible();
    const m = await p.evaluate(() => {
      const sb = document.querySelector(".site-shell > .sidebar")!;
      const L = (e: Element) => Math.round(e.getBoundingClientRect().left);
      // O começo do conteúdo de um item: a bolinha de ícone, se houver; senão, o texto.
      const comeco = (el: Element) => { const lab = el.querySelector(".sidebar-label")!; const tile = lab.querySelector(".site-item-tile"); if (tile) return L(tile);
        const tw = document.createTreeWalker(lab, NodeFilter.SHOW_TEXT); let n: Node | null;
        while ((n = tw.nextNode())) { if (n.textContent?.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); return Math.round(rg.getClientRects()[0].left); } } return -1; };
      const cur = sb.querySelector(".sidebar-item[aria-current]")!;
      const chave = sb.querySelector(".site-plataforma");
      const comum = [...sb.querySelectorAll(".sidebar-item:not([aria-current])")].find((e) => !e.closest(".sidebar-group-list, .sidebar-sub"));
      return {cur: L(cur), chave: chave ? L(chave) : null, painel: L(sb), comecoCur: comeco(cur),
        comum: comum ? L(comum) : null, comecoComum: comum ? comeco(comum) : null};
    });
    expect(m.cur, `${pagina}: dentro do painel ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(m.painel);
    if (m.chave != null) expect(m.cur, `${pagina}: na chave`).toBe(m.chave);
    if (m.comum != null) {
      expect(m.comum, `${pagina}: a cápsula do atual na dos outros`).toBe(m.cur);
      expect(m.comecoComum, `${pagina}: o começo do atual na coluna dos outros`).toBe(m.comecoCur);
    }
  }
});

// LOTE 118, "a Lateral que acompanha" (o Victor, 27/11/2026, "ok" à proposta e "Pode, aprovado" olhando): em Patterns, um
// "All" só no alto; nenhum campo de filtro na lateral (a busca é a do meio da lista); cada componente com o ícone da ficha
// na bolinha da cor da família; na página de um padrão, o componente dele marcado e aberto, com os padrões dele embaixo e o
// atual marcado; e a trilha que leva de volta. Provado contra o defeito: com o site do commit fed2d91d, reprova.
test("site · a lateral de Patterns acompanha a página do padrão", async ({page: p, baseURL}) => {
  await p.setViewportSize({width: 1280, height: 800});
  await p.goto(`${baseURL}/apps/catalog/pattern-alert-failure-with-retry.html`, {waitUntil: "networkidle"});
  const sb = p.locator(".site-shell > .sidebar");
  await expect(sb.locator("[data-site-filtro-busca]")).toHaveCount(0);
  const todos = sb.locator(".sidebar-item");
  await expect(todos.first()).toHaveText(/All patterns/);
  await expect(sb.locator('.sidebar-item:has-text("All components")')).toHaveCount(0);
  // Cada componente com a bolinha de ícone.
  const semIcone = await sb.locator('a[href*="#filtro/"]:not([href$="#filtro/all"])').evaluateAll((els) => els.filter((e) => !e.querySelector(".site-item-tile svg")).length);
  expect(semIcone).toBe(0);
  // O Alert aberto, com os seus seis padrões, e o atual marcado.
  const alert = sb.locator('li:has(> a[href$="#filtro/alert"])');
  await expect(alert.locator(".sidebar-sub .sidebar-item")).toHaveCount(6);
  await expect(alert.locator('.sidebar-sub .sidebar-item[aria-current="page"]')).toHaveText("Failure with retry");
  await expect(sb.locator(".sidebar-sub")).toHaveCount(1);
  // A trilha leva à lista filtrada no Alert.
  await p.locator(".intro-trilha a", {hasText: "Alert"}).click();
  await expect(p).toHaveURL(/\/patterns\.html#filtro\/alert$/);
  await expect(p.locator('.sidebar a[href="#filtro/alert"]')).toHaveAttribute("aria-current", "true");
  // A busca do meio acha pelo nome do componente: o grupo do Alert inteiro.
  await p.locator('.pat-b input').first().fill("alert");
  await expect.poll(() => p.locator("#pat-alert [data-g1-item]").evaluateAll((els) => els.filter((e) => e.getClientRects().length).length)).toBe(6);
});

test("site · em 320 o seletor de densidade vira um Select e nada sai cortado; em 1280 continuam os três botões", async ({page: p, baseURL}) => {
  await p.setViewportSize({width: 320, height: 720});
  await p.goto(`${baseURL}/apps/catalog/tokens.html`, {waitUntil: "networkidle"});
  // O `Select` da Aurea acende no lugar do `<select>` comum (o do sistema, que o Victor reprovou: a lista aberta era a do
  // Windows, quadrada).
  await p.waitForSelector(".tk-densidade-select[data-ligada='sim'] .tk-densidade-gatilho");
  const estreito = await p.evaluate(() => {
    const seg = document.querySelector<HTMLElement>(".tk-densidade-seg")!; const sel = document.querySelector<HTMLElement>(".tk-densidade-select")!;
    const gat = sel.querySelector<HTMLElement>(".tk-densidade-gatilho")!;
    return {seg: getComputedStyle(seg).display, sel: getComputedStyle(sel).display, cabe: gat.scrollWidth <= gat.clientWidth + 1,
      doSistema: sel.querySelectorAll("select").length};
  });
  expect(estreito, JSON.stringify(estreito)).toEqual({seg: "none", sel: "block", cabe: true, doSistema: 0});
  // o Select muda a densidade como os botões — pela lista da Aurea
  await p.click(".tk-densidade-gatilho");
  await p.getByRole("option", {name: "Spacious"}).click();
  await expect.poll(() => p.evaluate(() => document.querySelector("[data-tk-densidade-escopo]")!.getAttribute("data-density"))).toBe("spacious");
  await p.setViewportSize({width: 1280, height: 800});
  const largo = await p.evaluate(() => ({seg: getComputedStyle(document.querySelector(".tk-densidade-seg")!).display,
    sel: getComputedStyle(document.querySelector(".tk-densidade-select")!).display,
    ativo: document.querySelector(".tk-densidade-seg .active")?.textContent}));
  expect(largo.seg, "os três botões aparecem").not.toBe("none");
  expect({sel: largo.sel, ativo: largo.ativo}).toEqual({sel: "none", ativo: "Spacious"});
});
