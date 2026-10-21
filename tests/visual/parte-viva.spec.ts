import {expect, test, type Page} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

// A PARTE VIVA EM TODA CAIXA (21/10/2026). O Victor: "adicione o javascript ao site da aurea assim todos os componente
// funciona como deveria funcionar e assim eu tambem posso ficar indo la e validar." Até aqui só as molduras acendiam:
// o CodeEditor saía vazio, o Combobox com "Interactive — see the code.", o CommandPaletteShell vazio.
const REG = join(process.cwd(), "packages/contracts/registry");
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const PAGINAS = readdirSync(REG).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(REG, f), "utf8")).name as string).sort().map((n) => `${slug(n)}.html`);

// Rola por cada caixa (ela acende quando chega perto da tela) e espera todas terem resposta.
async function acenderTudo(page: Page) {
  const caixas = page.locator("[data-vivo]");
  const n = await caixas.count();
  for (let i = 0; i < n; i++) await caixas.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLElement>("[data-vivo]")].every((c) => c.dataset.ligada),
    null, {timeout: 15000}).catch(() => {});
}

test("toda caixa de prévia de toda página de componente acende, sem erro", async ({page}) => {
  test.setTimeout(20 * 60_000);
  const erros: string[] = [];
  let atual = "";
  page.on("console", (m) => { if (m.type() === "error") erros.push(`${atual}: ${m.text().slice(0, 160)}`); });
  page.on("pageerror", (e) => erros.push(`${atual}: ${String(e).slice(0, 160)}`));
  const falhas: string[] = [];
  for (const arquivo of PAGINAS) {
    atual = arquivo;
    await page.goto(`/apps/catalog/${arquivo}`);
    await acenderTudo(page);
    const r = await page.evaluate(() => {
      const caixas = [...document.querySelectorAll<HTMLElement>(".demo-panel[data-panel='preview']")]
        .filter((c) => !c.querySelector("iframe.demo-frame"));
      return {
        semMarca: caixas.filter((c) => !c.dataset.vivo).length,
        apagadas: caixas.filter((c) => c.dataset.vivo && c.dataset.ligada !== "sim").map((c) => `${c.dataset.vivo}=${c.dataset.ligada ?? "nada"}`),
        aviso: caixas.filter((c) => /Interactive — see the code/.test(c.textContent ?? "")).length,
      };
    });
    if (r.semMarca) falhas.push(`${arquivo}: ${r.semMarca} caixa(s) sem a marca da parte viva`);
    if (r.apagadas.length) falhas.push(`${arquivo}: não acendeu ${r.apagadas.join(", ")}`);
    if (r.aviso) falhas.push(`${arquivo}: ainda diz "Interactive — see the code."`);
  }
  expect([...falhas, ...erros]).toEqual([]);
});

test("as três que o Victor achou vazias aparecem, e a caixa responde ao clique", async ({page}) => {
  await page.goto("/apps/catalog/codeeditor.html");
  await acenderTudo(page);
  await expect(page.locator("[data-vivo='CodeEditor:0'] .cm-editor"), "o editor monta").toBeVisible();

  await page.goto("/apps/catalog/commandpaletteshell.html");
  await acenderTudo(page);
  await expect(page.locator("[data-vivo='CommandPaletteShell:0']"), "a paleta mostra o conteúdo").not.toHaveText(/^\s*$/);

  await page.goto("/apps/catalog/combobox.html");
  await acenderTudo(page);
  const caixa = page.locator("[data-vivo='Combobox:0']");
  await expect(caixa).not.toContainText("Interactive — see the code.");
  await expect(caixa.locator("input").first(), "o campo do Combobox existe").toBeVisible();

  // A caixa é VIVA: o Checkbox da primeira caixa marca ao clicar (antes, o HTML pronto não mudava).
  await page.goto("/apps/catalog/checkbox.html");
  await acenderTudo(page);
  // Clica onde a pessoa clica: a marca desenhada (o `input` fica por baixo dela).
  const campo = page.locator("[data-vivo='Checkbox:0'] input[type=checkbox]").first();
  const antes = await campo.isChecked();
  await page.locator("[data-vivo='Checkbox:0'] .control-mark").first().click();
  await expect(campo).toBeChecked({checked: !antes});

  // O exemplo CONTROLADO guarda o valor (content/_estado.mjs): com o aviso vazio, a aba clicada não trocava.
  await page.goto("/apps/catalog/tabs.html");
  await acenderTudo(page);
  const historico = page.locator("[data-vivo='Tabs:1'] [role=tab]", {hasText: "History"});
  await historico.click();
  await expect(historico).toHaveAttribute("aria-selected", "true");

  // A janela abre pelo botão do exemplo (antes, o botão era só a forma, com uma nota dizendo isso).
  await page.goto("/apps/catalog/dialog.html");
  await acenderTudo(page);
  await page.locator("[data-vivo='Dialog:0'] button", {hasText: "Delete project"}).click();
  await expect(page.getByRole("dialog", {name: "Delete project"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
