import {test, expect, type Page} from "@playwright/test";

// O clique com Shift na caixinha, no rádio e na chave (26/11/2026, aprovado pelo Victor na bancada: "Pode"). O campo
// de verdade é invisível; até aqui ele era surdo ao clique (`pointer-events:none`) e o clique chegava pelo `<label>`.
// Com Shift, o Chromium e o Firefox estendem a seleção de texto em vez de ativar o rótulo, e nada marcava. Agora o
// campo cobre o rótulo e recebe o clique. É só CSS do core, então a prova usa a marcação de HTML puro que o site
// documenta — a mesma que o `Checkbox`, o `Radio`, o `Switch` e a coluna de seleção da `DataGrid` desenham.
// Provado contra o defeito (26/11/2026): com o CSS de antes, no Chromium, as cinco peças ficam sem marcar.
const MARCACAO = `
<main style="padding:24px;display:grid;gap:24px">
  <p id="texto">Some text to start a selection.</p>
  <label class="checkbox" data-caso="checkbox"><input type="checkbox"><span class="control-mark"></span><span><strong>Email</strong></span></label>
  <label class="checkbox checkbox-pill" data-caso="pill"><input type="checkbox"><span class="control-mark"></span><span>Mark as done</span></label>
  <label class="checkbox checkbox-bare" data-caso="grade"><input type="checkbox" tabindex="-1"><span class="control-mark"></span><span class="sr-only">Select row</span></label>
  <label class="radio" data-caso="radio"><input type="radio" name="plano"><span class="control-mark"></span>Monthly</label>
  <label class="switch" data-caso="switch"><input type="checkbox" role="switch"><span class="switch-track"></span>Allow notifications</label>
  <label class="checkbox" data-caso="link"><input type="checkbox"><span class="control-mark"></span><span><strong>I accept the <a href="#terms">terms</a></strong></span></label>
</main>`;

async function abrir(page: Page) {
  await page.goto("/apps/catalog/index.html");
  await page.setContent(`<!doctype html><html data-theme="light"><head><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${MARCACAO}</body></html>`, {waitUntil: "load"});
  // um clique comum no texto antes: é ele que dá ao navegador o ponto de partida da seleção que o Shift estende
  await page.locator("#texto").click();
}

async function cliqueComShift(page: Page, caso: string, alvo: string) {
  const caixa = await page.locator(`[data-caso="${caso}"] ${alvo}`).boundingBox();
  await page.keyboard.down("Shift");
  await page.mouse.click(caixa!.x + caixa!.width / 2, caixa!.y + caixa!.height / 2);
  await page.keyboard.up("Shift");
}

test("Shift+clique na marca desenhada marca, como o clique comum", async ({page}) => {
  await abrir(page);
  for (const [caso, alvo] of [["checkbox", ".control-mark"], ["pill", ".control-mark"], ["grade", ".control-mark"], ["radio", ".control-mark"], ["switch", ".switch-track"]]) {
    const campo = page.locator(`[data-caso="${caso}"] input`);
    await expect(campo, `${caso} começa desmarcado`).not.toBeChecked();
    await cliqueComShift(page, caso, alvo);
    await expect(campo, `${caso} marca com Shift`).toBeChecked();
  }
});

test("o clique comum, no desenho e no nome, continua trocando", async ({page}) => {
  await abrir(page);
  const campo = page.locator('[data-caso="checkbox"] input');
  await page.locator('[data-caso="checkbox"] .control-mark').click({force: true});
  await expect(campo).toBeChecked();
  await page.locator('[data-caso="checkbox"] strong').click({force: true});
  await expect(campo).not.toBeChecked();
});

test("o link dentro do nome continua sendo link, e não marca a caixa", async ({page}) => {
  await abrir(page);
  await page.locator('[data-caso="link"] a').click();
  await expect(page).toHaveURL(/#terms$/);
  await expect(page.locator('[data-caso="link"] input')).not.toBeChecked();
});

test("o campo invisível ocupa o rótulo inteiro, e o foco do teclado aparece", async ({page}) => {
  await abrir(page);
  for (const caso of ["checkbox", "pill", "radio"]) {
    const rotulo = await page.locator(`[data-caso="${caso}"]`).boundingBox();
    const campo = await page.locator(`[data-caso="${caso}"] input`).boundingBox();
    // o campo invisível ocupa exatamente o rótulo
    expect(campo, caso).toEqual(rotulo);
  }
  // como a pessoa faz: do texto de cima, o Tab chega à primeira caixinha
  await page.locator("#texto").click();
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-caso="checkbox"] input')).toBeFocused();
  const anel = await page.locator('[data-caso="checkbox"] .control-mark').evaluate((m) => getComputedStyle(m).outlineStyle);
  expect(anel).toBe("solid");
});
