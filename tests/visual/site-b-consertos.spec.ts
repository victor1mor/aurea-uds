import {test, expect} from "@playwright/test";

// OS CONSERTOS DO SITE B NO AR (03/11/2026). O Victor achou no aureauds.dev, e aprovou cada conserto pela imagem:
//   1. a setinha do "Copy Markdown" tinha 32 ao lado do botão de 36;
//   2. no fim da página, a lateral subia atrás da barra de cima (ela grudava no topo, mas o `AppShell` acaba antes do
//      rodapé) — agora o topo dela fica parado, e ela encolhe por baixo;
//   3. o "All" vazio da busca listava as 520 páginas — agora 11 sugestões, e o campo de 52 (era 64).
// Provado contra o defeito (03/11/2026): contra o site publicado (`SITE=https://aureauds.dev`), os três reprovam.
const SITE = process.env.SITE ?? "/apps/catalog";

test("a setinha do Copy Markdown tem a altura do botão ao lado", async ({page}) => {
  await page.goto(`${SITE}/buttongroup.html`);
  const grupo = page.locator('[aria-label="Page as Markdown"]').first();
  await expect(grupo.getByRole("button", {name: "More page actions"})).toBeVisible();
  const alturas = await grupo.evaluate((g) => [...g.children].map((c) => Math.round(c.getBoundingClientRect().height)));
  expect(alturas).toHaveLength(2);
  expect(alturas[1]).toBe(alturas[0]);
});

// O botão dividido com o menu ABERTO (04/11/2026, o Victor: "quando clico botão fica quadrado"). O motor do menu põe marcadores
// de foco de 1 pixel ao lado da setinha, dentro do grupo; o `ButtonGroup` arredondava o último FILHO, e a setinha perdia a
// ponta e a linha do meio. E o menu da referência: alinhado à ponta do botão, com a explicação em cada item.
// Provado contra o defeito: contra o site publicado (0.54.1), o raio da ponta é 0 e a ponta do menu não bate.
test("com o menu aberto, a setinha do Copy Markdown continua redonda e o menu encosta na ponta", async ({page}) => {
  await page.goto(`${SITE}/button.html`);
  const grupo = page.locator('[aria-label="Page as Markdown"]').first();
  await grupo.getByRole("button", {name: "More page actions"}).click();
  const menu = page.getByRole("menu", {name: "Page actions"});
  await expect(menu).toBeVisible();
  const m = await page.evaluate(() => {
    const g = document.querySelector('[aria-label="Page as Markdown"]')!;
    const botoes = [...g.children].filter((c) => c.tagName === "BUTTON") as HTMLElement[];
    const ultimo = getComputedStyle(botoes[botoes.length - 1]);
    const menu = document.querySelector('[role="menu"]')!.getBoundingClientRect();
    return {ponta: parseFloat(ultimo.borderEndEndRadius), linha: getComputedStyle(botoes[botoes.length - 1], "::before").content,
      grupo: Math.round(g.getBoundingClientRect().right), menu: Math.round(menu.right)};
  });
  expect(m.ponta).toBeGreaterThan(0);
  expect(m.linha).not.toBe("none");
  expect(Math.abs(m.menu - m.grupo)).toBeLessThanOrEqual(1);
  await expect(menu.locator(".menu-item-description").first()).toHaveText("View page as Markdown format");
});

test("no fim da página a lateral não sobe: o topo fica parado", async ({page}) => {
  // A janela alta do Victor: a lateral é mais alta que o que sobra no fim da página.
  await page.setViewportSize({width: 1303, height: 960});
  await page.goto(`${SITE}/buttongroup.html`);
  const lateral = page.locator(".app-shell > .sidebar:not(.app-shell-aside)").first();
  const topo = await lateral.evaluate((l) => parseFloat(getComputedStyle(l).top));
  await page.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: "instant"}));
  await expect.poll(() => lateral.evaluate((l) => Math.round(l.getBoundingClientRect().top))).toBe(Math.round(topo));
  // E ela não passa do fim do conteúdo: encolheu por baixo.
  const [base, fim] = await lateral.evaluate((l) => [l.getBoundingClientRect().bottom, l.parentElement!.getBoundingClientRect().bottom]);
  expect(base).toBeLessThanOrEqual(fim + 1);
});

test("a busca: o All vazio mostra as sugestões, e o texto digitado entra inteiro e volta às sugestões ao apagar", async ({page}) => {
  await page.goto(`${SITE}/button.html`);
  await page.locator("[data-site-search]").first().click();
  const busca = page.getByRole("dialog", {name: "Search the site"});
  const opcoes = busca.getByRole("option");
  await expect(opcoes).toHaveCount(11);
  expect(await busca.locator(".command-field").evaluate((c) => Math.round(c.getBoundingClientRect().height))).toBe(52);
  // A primeira letra troca a lista; ela não pode se perder (medido no conserto: "time" virava "ime").
  const campo = busca.getByRole("combobox");
  await campo.pressSequentially("time");
  await expect(campo).toHaveValue("time");
  await expect(opcoes.first()).toContainText("Timeline");
  for (let i = 0; i < 4; i++) await page.keyboard.press("Backspace");
  await expect(campo).toHaveValue("");
  await expect(opcoes).toHaveCount(11);
  // Escolhida uma aba, ela mostra tudo da aba, mesmo vazia.
  await busca.getByRole("button", {name: /^Components/}).click();
  expect(await opcoes.count()).toBeGreaterThan(100);
});
