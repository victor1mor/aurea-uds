import {test, expect, type Page} from "@playwright/test";

// OS CINCO DEFEITOS DO SITE NO AR (o Victor, 05/11/2026 — S-01, S-03, S-07, S-08 e S-09 do ESTADO). Cada conserto foi
// aprovado pela imagem (o de hoje e a proposta), e o S-09 já tinha o "pode" ("use o que já foi feito e aprovado").
// Provado contra o defeito (05/11/2026): com o gerador, os scripts do site e a parte viva de antes (o `main` em b4f60bc5),
// os sete reprovam.
const SITE = process.env.SITE ?? "/apps/catalog";
const visiveis = (p: Page, sel: string) => p.locator(sel).evaluateAll((els) =>
  els.filter((e) => !e.closest("[hidden]") && e.getClientRects().length > 0).map((e) => e.id || e.getAttribute("data-tk") || ""));

// S-01: o filtro da lateral marcava o item e mudava o endereço, e a lista não filtrava (só Blocks escutava o aviso).
test("S-01: o filtro da lateral filtra a lista em Patterns, Releases e Tokens", async ({page}) => {
  await page.goto(`${SITE}/patterns.html#filtro/appshell`);
  await expect.poll(() => visiveis(page, "[data-g1-grupo]")).toEqual(["pat-appshell"]);
  // O grupo escolhido abre inteiro: todos os padrões dele, sem o "Show all".
  const conta = Number(await page.locator('.sidebar a[href="#filtro/appshell"] .site-conta').textContent());
  await expect(page.locator("#pat-appshell [data-g1-item]:visible")).toHaveCount(conta);
  await expect(page.locator("#pat-appshell .g1-mais")).toBeHidden();
  // Outro filtro pelo clique, e "All components" volta à lista de antes (os dez primeiros grupos).
  await page.locator('.sidebar a[href="#filtro/alert"]').click();
  await expect.poll(() => visiveis(page, "[data-g1-grupo]")).toEqual(["pat-alert"]);
  await page.locator('.sidebar a[href="#filtro/all"]').click();
  await expect.poll(async () => (await visiveis(page, "[data-g1-grupo]")).length).toBe(10);

  await page.goto(`${SITE}/releases.html`);
  await page.locator('.sidebar a[href="#filtro/2026-10"]').click();
  await expect.poll(() => visiveis(page, "[data-g1-grupo]")).toEqual(["m-2026-10"]);

  await page.goto(`${SITE}/tokens.html#filtro/shadow`);
  await expect.poll(() => visiveis(page, "[data-tk-sec]")).toEqual(["shadow"]);
  const tipos = await page.locator("[data-tk-tipo]").evaluateAll((els) =>
    [...new Set(els.filter((e) => !e.closest("[hidden]")).map((e) => (e as HTMLElement).dataset.tkTipo))]);
  expect(tipos).toEqual(["shadow"]);
});

// S-03: no site publicado o endereço é `/chart`, sem `.html`; o menu trocava só o `.html` e o "View as Markdown" abria a
// própria página. O endereço sem `.html` se reproduz aqui servindo a página por ele.
test("S-03: o View as Markdown leva ao .md da página, com e sem o .html no endereço", async ({page}) => {
  const html = await (await page.request.get(`${SITE}/chart.html`)).text();
  await page.route(/\/apps\/catalog\/chart$/, (r) => r.fulfill({body: html, contentType: "text/html"}));
  for (const endereco of [`${SITE}/chart.html`, `${SITE}/chart`]) {
    await page.goto(endereco);
    await page.getByRole("button", {name: "More page actions"}).click();
    const href = await page.getByRole("menuitem", {name: /View as Markdown/}).getAttribute("href");
    expect(new URL(href!).pathname, endereco).toMatch(/\/apps\/catalog\/chart\.md$/);
    await page.keyboard.press("Escape");
  }
  const texto = await (await page.request.get(`${SITE}/chart.md`)).text();
  expect(texto.startsWith("# Chart")).toBe(true);
});

test("S-03: toda página com o menu do Copy Markdown tem o .md ao lado, e a Health copia o texto dela", async ({page}) => {
  for (const p of ["native-button", "releases", "tokens", "saude"]) {
    const r = await page.request.get(`${SITE}/${p}.md`);
    expect(r.status(), p).toBe(200);
    expect((await r.text()).startsWith("# "), p).toBe(true);
  }
  await page.goto(`${SITE}/saude.html`);
  expect(JSON.parse(await page.locator("#page-markdown").textContent() ?? "null")).toMatch(/^# Health\n/);
});

// S-07: a lateral nascia rolada no topo, e o item atual (Chart, lá embaixo) ficava fora da vista.
test("S-07: a lateral abre com o item atual à vista, e guarda a rolagem ao ir para a página seguinte", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 663});
  await page.goto(`${SITE}/chart.html`);
  const lateral = page.locator(".app-shell-docs > .sidebar:not(.app-shell-aside)");
  const dentro = (nome: string) => lateral.evaluate((l, n) => {
    const a = [...l.querySelectorAll<HTMLElement>(".sidebar-nav a")].find((x) => x.textContent!.trim() === n)!;
    const c = l.getBoundingClientRect(), r = a.getBoundingClientRect();
    return r.top >= c.top && r.bottom <= c.bottom;
  }, nome);
  await expect.poll(() => dentro("Chart")).toBe(true);
  const antes = await lateral.evaluate((l) => l.scrollTop);
  expect(antes).toBeGreaterThan(0);
  await lateral.getByRole("link", {name: "ChartLegend", exact: true}).click();
  await page.waitForURL(/chartlegend\.html$/);
  await expect.poll(() => dentro("ChartLegend")).toBe(true);
  // Na página seguinte a lateral está onde estava: não pulou.
  expect(Math.abs(await lateral.evaluate((l) => l.scrollTop) - antes)).toBeLessThanOrEqual(1);
});

// S-08: o GitHub do topo, o do Início e os do rodapé abriam na mesma página.
test("S-08: os links para fora do site abrem em página nova, e o leitor de tela ouve isso", async ({page}) => {
  for (const p of ["index", "chart", "getting-started"]) {
    await page.goto(`${SITE}/${p}.html`);
    // Os links do SITE: os de dentro de um exemplo de componente (`.demo`) são da peça, não do site.
    const n = await page.evaluate(() => {
      const fora = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')]
        .filter((a) => !a.href.startsWith("https://aureauds.dev") && !a.closest(".demo"));
      fora.forEach((a) => a.setAttribute("data-teste-fora", ""));
      return fora.length;
    });
    const links = page.locator("[data-teste-fora]");
    expect(n, p).toBeGreaterThan(0);
    for (const a of await links.all()) {
      const nome = `${p}: ${await a.getAttribute("href")}`;
      await expect(a, nome).toHaveAttribute("target", "_blank");
      await expect(a, nome).toHaveAttribute("rel", /noreferrer/);
      await expect(a, nome).toHaveAccessibleDescription("Opens in a new tab");
    }
  }
  await page.goto(`${SITE}/index.html`);
  await expect(page.getByRole("link", {name: "Open source on GitHub"})).toHaveAttribute("target", "_blank");
  await expect(page.locator("header").getByRole("link", {name: "GitHub", exact: true})).toHaveAttribute("target", "_blank");
});

// S-09: o Início tinha o topo próprio (os links soltos, "Docs", a lupa, o "Theme" com a palavra); agora o das outras páginas.
test("S-09: o topo do Início é o das outras páginas, peça por peça e no mesmo lugar", async ({page}) => {
  const medir = async (p: string) => {
    await page.goto(`${SITE}/${p}.html`);
    return page.evaluate(() => {
      const topo = document.querySelector("header.topbar")!;
      const onde = (s: string) => { const e = [...topo.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0);
        if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
      return {marca: onde(".site-brand"), areas: [...topo.querySelectorAll(".site-areas a")].map((a) => a.textContent),
        busca: onde(".site-search"), atalho: [...topo.querySelectorAll(".site-search .kbd")].map((k) => k.textContent),
        tema: onde(".site-theme"), chave: onde(".site-theme-switch"), github: onde('a[aria-label="GitHub"]')};
    });
  };
  await page.setViewportSize({width: 1440, height: 900});
  const inicio = await medir("index"), interna = await medir("chart");
  expect(inicio.areas).toHaveLength(8);
  expect(inicio.atalho).toEqual(["Ctrl", "K"]);
  expect(inicio).toEqual(interna);
  // Abaixo de 1121 as áreas saem da pílula; sem a gaveta do `AppShell`, o menu do Início as leva.
  await page.setViewportSize({width: 900, height: 800});
  await page.goto(`${SITE}/index.html`);
  await page.getByRole("button", {name: "Menu"}).click();
  const menu = page.getByRole("dialog", {name: "Menu"});
  await expect(menu).toBeVisible();
  expect((await menu.getByRole("link").allTextContents()).slice(0, 8))
    .toEqual(["Getting Started", "Components", "Releases", "Patterns", "Blocks", "Recipes", "Hooks", "Tokens"]);
});
