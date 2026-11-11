import {test, expect} from "@playwright/test";

// 0.65.0: o calendário do `DatePicker` da web prende o foco — o Tab dá a volta DENTRO da janela aberta, e ela não fecha
// sozinha (aprovado pelo Victor em 14/10/2026, *"ok pode seguir"*; é o que a janela de cor e a referência fazem).
// Medido em 14/10/2026 no código de antes: 6 Tabs fechavam a janela e levavam o foco a um link da página.
// Provado contra o defeito (11/11/2026): sem o `modal="trap-focus"`, este teste reprova.
// O exemplo mora numa MOLDURA (a prévia viva, `embed`) dentro de um item que abre e fecha — o mesmo caminho do teste do
// `DatePicker` no `catalog-sweep.spec.ts`: abre o item, rola de uma vez e espera a parte viva acender.
test("com o calendário aberto, o Tab e o Shift+Tab ficam dentro da janela", async ({page}) => {
  await page.goto("/apps/catalog/datepicker.html");
  await page.locator(".demo-panel > iframe.demo-frame").first().evaluate((e) => {
    const d = e.closest("details"); if (d) d.open = true; e.scrollIntoView({behavior: "instant"});
  });
  const moldura = page.frameLocator(".demo-panel > iframe.demo-frame").first();
  await expect(moldura.locator('#root[data-ligada="sim"]')).toBeAttached({timeout: 15000});
  const gatilho = moldura.locator(".date-picker-trigger").first();
  await gatilho.focus();
  await page.keyboard.press("Enter");
  const janela = moldura.getByRole("dialog");
  await expect(janela).toBeVisible();

  for (const tecla of ["Tab", "Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
    await page.keyboard.press(tecla);
    await expect(janela, `depois de ${tecla}, a janela continua aberta`).toBeVisible();
    // `poll`, e não uma leitura só: o motor passa o foco por uma GUARDA na borda da janela e o devolve para dentro no
    // passo seguinte — no WebKit, a leitura imediata do Shift+Tab pegava a guarda (11/11/2026).
    await expect.poll(() => janela.evaluate((j) => j.contains(j.ownerDocument.activeElement)), {message: `depois de ${tecla}, o foco está dentro`}).toBe(true);
  }

  // O Esc continua fechando, e o foco volta ao gatilho.
  await page.keyboard.press("Escape");
  await expect(janela).toBeHidden();
  await expect(gatilho).toBeFocused();
});
