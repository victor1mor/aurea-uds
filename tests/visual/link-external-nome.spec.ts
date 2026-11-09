import {test, expect} from "@playwright/test";

// S-13 (0.63.0): o `Link external` diz ao leitor de tela que abre noutra aba, por um texto escondido (`.sr-only`) depois
// da seta. O nome se mede no NAVEGADOR, nos três: o jsdom não carrega o CSS e cola "Documentation(opens…" — aqui a caixa
// escondida é bloco (`position:absolute`) e o nome tem de sair com o espaço. E a caixa escondida não pode mudar a tela:
// o link mede o mesmo que mediria sem ela.
test("o link externo da página do Link tem o aviso no nome, sem mudar a medida", async ({page}) => {
  await page.goto("/apps/catalog/link.html", {waitUntil: "networkidle"});
  const link = page.locator('a.link[target="_blank"]').first();
  await expect(link).toHaveAccessibleName("Documentation (opens in a new tab)");
  const medida = await link.evaluate((a) => {
    const antes = a.getBoundingClientRect();
    const aviso = a.querySelector(".sr-only") as HTMLElement;
    aviso.remove();
    const depois = a.getBoundingClientRect();
    a.append(aviso);
    return {antes: [antes.width, antes.height], depois: [depois.width, depois.height]};
  });
  expect(medida.antes).toEqual(medida.depois);
});
