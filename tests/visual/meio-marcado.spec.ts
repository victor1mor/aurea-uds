import {test, expect, type Locator} from "@playwright/test";

// D-00 (0.64.0): o meio-marcado medido no NAVEGADOR, no exemplo vivo "Indeterminate" da página do Checkbox. O jsdom não
// calcula CSS — aqui se prova (1) o fundo é o do marcado, (2) o tracinho existe, (3) a linha não pula ao trocar de
// estado (o desenho "A" da bancada de 10/11/2026 crescia 2: o tracinho em caixa própria mudava a linha de base) e (4)
// o "selecionar todos" funciona. Provado contra o defeito: sem a regra do CSS, (1) e (2) reprovam.
const marca = (campo: Locator) => campo.evaluate((i) => {
  const m = i.nextElementSibling as HTMLElement;
  const depois = getComputedStyle(m, "::after");
  return {fundo: getComputedStyle(m).backgroundColor, mascara: depois.maskImage || depois.webkitMaskImage, conteudo: depois.content,
    altura: (i.closest("label") as HTMLElement).getBoundingClientRect().height, meio: (i as HTMLInputElement).indeterminate};
});

test("o meio-marcado tem o fundo do marcado, o tracinho, e a linha não pula", async ({page}) => {
  await page.goto("/apps/catalog/checkbox.html", {waitUntil: "networkidle"});
  // O exemplo mora num <details> fechado, e a caixa só acende perto da tela: abre o exemplo, rola até o desenho pronto,
  // e só então espera a parte viva.
  await page.locator("details", {has: page.locator("summary", {hasText: "Indeterminate"})}).evaluate((d) => { (d as HTMLDetailsElement).open = true; });
  await page.getByRole("checkbox", {name: "Select all"}).first().scrollIntoViewIfNeeded();
  const caixa = page.locator('[data-ligada="sim"]', {has: page.getByRole("checkbox", {name: "Select all"})});
  await expect(caixa).toBeAttached({timeout: 15000});
  const todos = caixa.getByRole("checkbox", {name: "Select all"});
  const linha = caixa.getByRole("checkbox", {name: "Ingest"});

  const meio = await marca(todos), marcada = await marca(linha);
  expect(meio.meio).toBe(true);
  expect(meio.fundo).toBe(marcada.fundo);
  expect(meio.conteudo).not.toBe("none");
  expect(meio.mascara).toContain("M4 8h8");
  expect(meio.altura).toBe(marcada.altura);

  // o "selecionar todos": marca as três, e deixa de ser meio-marcado
  // como a pessoa faz: o clique no rótulo (o campo é invisível, e a marca desenhada fica por cima dele)
  await caixa.locator("label", {hasText: "Select all"}).click();
  await expect(caixa.getByRole("checkbox", {checked: true})).toHaveCount(4);
  const cheio = await marca(todos);
  expect(cheio.meio).toBe(false);
  expect(cheio.mascara).not.toContain("M4 8h8");
  expect(cheio.altura).toBe(meio.altura);
});
