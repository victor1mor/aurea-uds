import {test, expect, type Page} from "@playwright/test";

// O CÓDIGO EM ABAS (bloco 1, o 3-A — 23/10/2026): as quatro abas de instalar, com as medidas da documentação da
// referência, tiradas da PÁGINA dela na largura da tela do Victor (1280 × 663) e repetidas aqui como número: a fileira de
// 37, as abas a 14 uma da outra e a 16 da borda, o texto 14 de peso médio. E o achado do caminho: o botão de copiar
// cobria o fim da linha de uma linha só (no Quick Start, o `pnpm add` terminava a 915 e o botão começava a 901).
// Provado contra o defeito (23/10/2026): contra a pasta da 0.42.0 com o site nativo, sem as abas (servida da raiz, no
// `BASE_SITE`), reprova nos dois — o segundo de 960 para baixo, com os dois `pnpm add` terminando embaixo do botão.
const base = process.env.BASE_SITE ?? "";
const abrir = async (page: Page, pagina: string) => {
  await page.setViewportSize({width: 1280, height: 663});
  await page.goto(`${base}/apps/catalog/${pagina}`);
};
const perto = (a: number, b: number, nome: string) => expect(Math.abs(a - b), `${nome}: ${a} (esperado ${b})`).toBeLessThanOrEqual(1);

test("o Quick Start instala em quatro abas, npm primeiro, nas medidas da referência", async ({page}) => {
  await abrir(page, "docs-quick-start.html");
  const caixa = page.locator(".code-tabs").first();
  await expect(caixa.getByRole("tab")).toHaveText(["npm", "pnpm", "yarn", "bun"]);
  await expect(caixa.getByRole("tab", {name: "npm", exact: true})).toHaveAttribute("aria-selected", "true");
  const m = await caixa.evaluate((c) => {
    const r = (e: Element) => e.getBoundingClientRect();
    const abas = [...c.querySelectorAll("[role=tab]")].map(r);
    const s = getComputedStyle(c.querySelector("[role=tab]")!);
    return {fileira: r(c.querySelector(".code-tabs-list")!).height, vao: abas[1].left - abas[0].right,
      borda: abas[0].left - r(c).left, fs: s.fontSize, fw: s.fontWeight};
  });
  perto(m.fileira, 37, "a fileira de abas tem 37");
  perto(m.vao, 14, "as abas ficam a 14 uma da outra");
  perto(m.borda, 16, "a primeira fica a 16 da borda");
  expect([m.fs, m.fw]).toEqual(["14px", "500"]);
  // A troca: o clique mostra o código do pnpm, e a seta leva ao yarn.
  await caixa.getByRole("tab", {name: "pnpm", exact: true}).click();
  await expect(caixa.locator("[role=tabpanel]:not([hidden])")).toContainText("pnpm add @aurea-uds/react");
  await page.keyboard.press("ArrowRight");
  await expect(caixa.getByRole("tab", {name: "yarn", exact: true})).toBeFocused();
  await expect(caixa.locator("[role=tabpanel]:not([hidden])")).toContainText("yarn add @aurea-uds/react");
});

test("o fim de toda linha aparece fora do botão de copiar, em todo bloco do Quick Start e em toda aba", async ({page}) => {
  await abrir(page, "docs-quick-start.html");
  // A regra: a linha que cabe termina antes do botão; a que não cabe rola, e rolada até o fim termina antes dele. O pior
  // caso é o da 0.42.0 — a linha cabe (não rola) e termina embaixo do botão: o fim do comando nunca aparece.
  // Mede a página como abriu e, depois, com cada aba de cada caixa mostrada: o código escondido não tem tamanho. A
  // primeira medida é a que vale no site sem abas — sem ela, o laço vazio passaria com o defeito dentro.
  const medir = () => page.evaluate(() => [...document.querySelectorAll(".code-block-wrap")]
      .filter((w) => (w as HTMLElement).offsetParent !== null)
      .flatMap((w) => {
        const pre = w.querySelector("pre")!;
        pre.scrollLeft = pre.scrollWidth;
        const botao = w.querySelector(".copy-code")!.getBoundingClientRect();
        const achados = [...pre.querySelectorAll(".code-line")].flatMap((linha) => {
          const faixa = document.createRange();
          faixa.selectNodeContents(linha);
          const t = faixa.getBoundingClientRect();
          return t.width > 0 && t.right > botao.left && t.top < botao.bottom && t.bottom > botao.top
            ? [`${linha.textContent!.slice(0, 40)} (termina a ${Math.round(t.right)}, o botão começa a ${Math.round(botao.left)})`] : [];
        });
        pre.scrollLeft = 0;
        return achados;
      }));
  // O defeito depende da largura: a linha cobre o botão só na faixa em que ela ainda cabe e já chegou nele (os 36 do
  // botão mais a distância da borda). Uma largura só é sorte — em 1280 o site da 0.42.0 passa no navegador de teste e
  // cobre no do painel (a linha termina a 915, o botão começa a 901). A varredura vai de 1280 a 360, de 8 em 8 (o botão
  // tem 36), e não pula a faixa.
  const varrer = async (quando: string) => {
    const achados: string[] = [];
    for (let w = 1280; w >= 360; w -= 8) {
      await page.setViewportSize({width: w, height: 663});
      for (const a of await medir()) achados.push(`${w}: ${a}`);
    }
    expect(achados, quando).toEqual([]);
  };
  await varrer("como a página abre");
  const caixas = await page.locator(".code-tabs").all();
  for (let i = 0; i < 4 && caixas.length > 0; i++) {
    for (const c of caixas) await c.getByRole("tab").nth(i).click();
    await varrer(`com a aba ${i + 1} escolhida em toda caixa`);
  }
});
