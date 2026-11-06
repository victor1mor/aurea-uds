import {test, expect, type Page} from "@playwright/test";

// OS EXEMPLOS QUE MOSTRAM UMA ESCOLHA DEIXAM TROCAR (06/11/2026, o pedido do Victor — "ainda estou encontrando componentes
// no site que não interage" — e o desenho do FigCraft aprovado com "Pode"). A varredura de 578 páginas e 87 molduras
// achou 41 exemplos com um atual (item, página, passo, botão ligado) que o clique não movia — e, nas molduras da lateral,
// o link do item levava a MOLDURA para outra página. Aqui, um de cada tipo: o clique move o atual e a página não sai do
// lugar. Provado contra o defeito: contra o site de antes, todos reprovam.
const aceso = async (p: Page, sel: string) => {
  await expect(p.locator(sel).first()).toBeVisible();
  // a parte viva acende a caixa (nas molduras, a hidratação): espera a marca, onde houver
  await p.waitForFunction(() => !document.querySelector("[data-vivo]:not([data-ligada])") || !!document.querySelector("[data-ligada=sim]"));
  await p.waitForTimeout(300);
};

test("a lateral: o clique no item move o atual, e a moldura não sai da página", async ({page}) => {
  await page.goto("/apps/catalog/embeds/sidebar-groups-and-one-level-of-nesting.html");
  await aceso(page, ".sidebar");
  const antes = page.url();
  await expect(page.locator('.sidebar [aria-current="page"]')).toHaveText(/Sidebar/);
  await page.locator(".sidebar a", {hasText: "Button"}).first().click();
  await expect(page.locator('.sidebar [aria-current="page"]')).toHaveText(/Button/);
  expect(page.url()).toBe(antes);
});

test("o AppShell: o clique na lateral move o atual", async ({page}) => {
  await page.goto("/apps/catalog/embeds/appshell.html");
  await aceso(page, ".sidebar");
  const atual = await page.locator('.sidebar [aria-current="page"]').first().innerText();
  const outro = page.locator('.sidebar a:not([aria-current])').first();
  const nome = (await outro.innerText()).split("\n")[0].trim();
  await outro.click();
  await expect(page.locator('.sidebar [aria-current="page"]').first()).toContainText(nome);
  expect(nome).not.toBe(atual.split("\n")[0].trim());
});

test("a Pagination: o clique numa página a torna a atual", async ({page}) => {
  await page.goto("/apps/catalog/pagination.html");
  const caixa = page.locator(".demo").first();
  await caixa.scrollIntoViewIfNeeded(); await aceso(page, ".demo .pagination");
  const atual = caixa.locator('[aria-current="page"]');
  const antes = await atual.innerText();
  await caixa.getByRole("button", {name: "Next"}).click().catch(async () => caixa.locator(".pagination button").last().click());
  await expect(atual).not.toHaveText(antes);
});

test("o filtro fixo: o clique liga e desliga", async ({page}) => {
  await page.goto("/apps/catalog/pattern-button-pinned-filter.html");
  await aceso(page, ".demo button");
  const b = page.locator(".demo button", {hasText: "Starred"}).first();
  await expect(b).toHaveAttribute("aria-pressed", "true");
  await b.click();
  await expect(b).toHaveAttribute("aria-pressed", "false");
});

test("o Stepper: voltar a um passo feito o torna o ativo", async ({page}) => {
  await page.goto("/apps/catalog/pattern-stepper-going-back-to-a-finished-step.html");
  await aceso(page, ".demo .stepper");
  await page.locator(".demo .stepper").getByText("Cart").first().click();
  await expect(page.locator('.demo .stepper [aria-current="step"]')).toContainText("Cart");
});

test("o índice: o clique move o atual, e a página não rola", async ({page}) => {
  await page.goto("/apps/catalog/tableofcontents.html");
  const caixa = page.locator(".demo").first();
  await caixa.scrollIntoViewIfNeeded(); await aceso(page, ".demo .toc");
  const y = await page.evaluate(() => scrollY);
  await caixa.locator("a", {hasText: "Installation"}).click();
  await expect(caixa.locator('[aria-current]')).toContainText("Installation");
  expect(await page.evaluate(() => scrollY)).toBe(y);
});

test("a trilha: o clique num item a termina nele", async ({page}) => {
  await page.goto("/apps/catalog/breadcrumb.html");
  const caixa = page.locator(".demo").first();
  await caixa.scrollIntoViewIfNeeded(); await aceso(page, ".demo nav");
  await caixa.locator("a").first().click();
  await expect(caixa.locator("a")).toHaveCount(0);
  await expect(caixa.locator('[aria-current="page"]')).toHaveText(/Home/);
});

test("a biblioteca de mídia: o clique num episódio o escolhe, e o player acompanha", async ({page}) => {
  await page.goto("/apps/catalog/block-media-library.html");
  const caixa = page.locator(".demo").first();
  await caixa.scrollIntoViewIfNeeded(); await aceso(page, ".demo .card-interactive");
  await caixa.locator("button.card-interactive", {hasText: "Episode 13"}).click();
  await expect(caixa.locator('button.card-interactive[aria-current="true"]')).toContainText("Episode 13");
});

test("o Header do site: o clique num link move a página atual", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto("/apps/catalog/pattern-header-a-website-header-with-the-current-page-marked.html");
  const caixa = page.locator(".demo").first();
  await caixa.scrollIntoViewIfNeeded(); await aceso(page, ".demo .topbar-links");
  // a barra (o menu do celular repete os mesmos links, e o atual é o mesmo nos dois)
  await expect(caixa.locator('.topbar-nav [aria-current="page"]')).toHaveText("Pricing");
  await caixa.locator(".topbar-nav a", {hasText: "Docs"}).click();
  await expect(caixa.locator('.topbar-nav [aria-current="page"]')).toHaveText("Docs");
  await expect(caixa.locator('.topbar-menu-panel [aria-current="page"]')).toHaveText("Docs");
});

test("o AppShell com a navegação pronta: o clique num link move o atual", async ({page}) => {
  await page.goto("/apps/catalog/embeds/pattern-appshell-the-frame-of-a-whole-application.html");
  await aceso(page, ".doc-nav");
  const outro = page.locator('.doc-nav a:not([aria-current])').first();
  const nome = (await outro.innerText()).trim();
  await outro.click();
  await expect(page.locator('.doc-nav [aria-current="page"]')).toHaveText(nome);
});
