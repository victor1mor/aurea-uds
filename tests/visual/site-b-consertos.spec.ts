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
