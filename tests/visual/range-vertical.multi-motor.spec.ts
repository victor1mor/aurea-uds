import {test, expect} from "@playwright/test";

// G-AXIS-03 · `Range` vertical — nos TRÊS motores.
//
// A premissa que este arquivo corrige era minha: eu havia registrado no `03-GAPS.md` que a
// vertical do `Range` "exige trocar o motor", porque ele é um `<input type=range>` nativo. Era
// errado. O range nativo aceita orientação vertical por `writing-mode`, e a regra que o Victor
// escreveu — **não trocar primitive para obter uma prop antes de provar que o motor atual é
// incapaz** — é o que fez medir em vez de trocar.
//
// Por que três motores e não um: `writing-mode` em controle de formulário é exatamente onde
// implementações divergem, e o Safari é o alvo mais recente a suportá-lo. Afirmar a partir do
// Chromium seria afirmar sobre Safari sem olhar.
//
// A bateria é a que o Victor especificou, nesta ordem:
//   geometria -> teclado -> direção -> RTL -> touch -> acessibilidade.
//
// Duas coisas que a medição corrigiu e que estão travadas aqui:
//   • a altura se dá com `inline-size`, NÃO com `block-size` — em writing-mode vertical o eixo
//     INLINE é o vertical, e `block-size` produz uma caixa deitada. Foi o primeiro erro.
//   • `direction:rtl` é obrigatório para o TOPO ser o MAIOR. Sem ele, medido: ArrowUp diminui e
//     clicar no topo dá 0. E ela vai no próprio elemento, para o eixo não mudar com o documento.

// `page.goto` numa página REAL do catálogo, e não `setContent`: o `setContent` dá origem
// `about:blank`, então um `<link>` relativo não resolve e o CSS nunca chega. A primeira versão
// deste arquivo fazia isso e media um `<input>` SEM ESTILO — `writing-mode: horizontal-tb`,
// medido. Reprovava em nove casos e a culpa era do teste. É o mesmo caminho que o
// `tone-contrast.spec.ts` já usava, pela mesma razão.
const PAGINA = "/apps/catalog/button.html";
async function montar(page: import("@playwright/test").Page, dir: string) {
  await page.goto(PAGINA);
  await page.evaluate((d) => {
    document.documentElement.dir = d;
    const caixa = document.createElement("div");
    caixa.id = "prova";
    // fixa e por cima: injetada no fluxo da página do catálogo, a caixa cai sob o layout do
    // AppShell e o clique acerta outro elemento. Medido — teclado e geometria passavam, ponteiro
    // e arraste ficavam em 50, que é o valor não tocado. Não era o slider, era a mira.
    caixa.style.cssText = "position:fixed;inset-block-start:0;inset-inline-start:0;z-index:9999;" +
      "padding:24px;background:var(--background)";
    caixa.innerHTML =
      '<input id="h" class="range" type="range" min="0" max="100" value="50" aria-label="horizontal">' +
      '<input id="v" class="range range-vertical" type="range" min="0" max="100" value="50" aria-label="vertical">';
    document.body.append(caixa);
  }, dir);
  // controle: se a folha não tiver chegado, o teste mede um input sem estilo e acusa o
  // componente por um defeito do próprio teste — foi o que aconteceu na primeira versão.
  const wm = await page.$eval("#v", el => getComputedStyle(el).writingMode);
  expect(wm, "o CSS do core não chegou à página — o teste mediria um input sem estilo")
    .toContain("vertical");
}

const valor = (page: import("@playwright/test").Page, sel = "#v") =>
  page.$eval(sel, (el) => (el as HTMLInputElement).value);
const zerar = (page: import("@playwright/test").Page, sel = "#v") =>
  page.$eval(sel, (el) => { (el as HTMLInputElement).value = "50"; (el as HTMLElement).focus(); });

test("geometria: a caixa vertical é mais alta que larga", async ({page}) => {
  await montar(page, "ltr");
  const v = (await page.locator("#v").boundingBox())!;
  const h = (await page.locator("#h").boundingBox())!;
  expect(v.height, `vertical mede ${Math.round(v.width)}x${Math.round(v.height)} — ` +
    `se a altura não passar da largura, provavelmente é block-size no lugar de inline-size`)
    .toBeGreaterThan(v.width);
  expect(h.width).toBeGreaterThan(h.height);
});

test("teclado: as oito teclas do slider continuam movendo o valor", async ({page}) => {
  await montar(page, "ltr");
  const inertes: string[] = [];
  for (const k of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Home", "End", "PageUp", "PageDown"]) {
    await zerar(page);
    await page.keyboard.press(k);
    if (await valor(page) === "50") inertes.push(k);
  }
  expect(inertes, `o writing-mode não pode custar teclado: ${inertes.join(", ")} pararam de mover`)
    .toEqual([]);
});

test("direção: o TOPO é o valor máximo, por teclado e por ponteiro", async ({page}) => {
  await montar(page, "ltr");
  await zerar(page);
  await page.keyboard.press("ArrowUp");
  expect(Number(await valor(page)), "ArrowUp tem de AUMENTAR num slider vertical")
    .toBeGreaterThan(50);

  const b = (await page.locator("#v").boundingBox())!;
  await page.$eval("#v", el => { (el as HTMLInputElement).value = "50"; });
  await page.mouse.click(b.x + b.width / 2, b.y + 6);
  expect(Number(await valor(page)), "clicar perto do topo tem de dar valor alto")
    .toBeGreaterThan(60);
});

test("RTL: o eixo do slider NÃO muda com a direção do documento", async ({page}) => {
  // "para cima é mais" é convenção de instrumento, não de idioma. `direction:rtl` no próprio
  // elemento sobrescreve a herança, e é isso que se cobra aqui.
  await montar(page, "rtl");
  await zerar(page);
  await page.keyboard.press("ArrowUp");
  expect(Number(await valor(page)), "em documento RTL o slider vertical inverteu")
    .toBeGreaterThan(50);
});

test("touch: arrastar em direção ao topo aumenta o valor", async ({page}) => {
  await montar(page, "ltr");
  const b = (await page.locator("#v").boundingBox())!;
  await page.$eval("#v", el => { (el as HTMLInputElement).value = "50"; });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + 8, {steps: 10});
  await page.mouse.up();
  expect(Number(await valor(page)), "arrastar ao topo tem de aumentar").toBeGreaterThan(60);
});

test("a11y: continua sendo um slider nativo, com o intervalo declarado", async ({page}) => {
  await montar(page, "ltr");
  const info = await page.$eval("#v", el => {
    const i = el as HTMLInputElement;
    return {tag: i.tagName.toLowerCase(), type: i.type, min: i.min, max: i.max,
      // role explícito seria uma SEGUNDA fonte de verdade sobre o que o elemento é
      roleExplicito: i.getAttribute("role")};
  });
  expect(info).toEqual({tag: "input", type: "range", min: "0", max: "100", roleExplicito: null});
});
