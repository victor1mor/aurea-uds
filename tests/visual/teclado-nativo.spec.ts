import {test, expect} from "@playwright/test";
import {readFileSync} from "node:fs";

// G-A11Y-04 — a ficha declarava MENOS teclado do que o componente entrega.
//
// Achado ao montar a matriz do §13 (22/08/2026): a linha do `slider` acusou que três referências
// têm `ArrowUp`/`ArrowDown`/`PageUp`/`PageDown` e a Aurea não. Fui conferir e o `Range` da Aurea
// É um `<input type="range">` nativo — o browser entrega as oito teclas há vinte anos. Quem
// estava errado era a FICHA, que declarava quatro.
//
// Isso não é detalhe de documentação. A ficha é o contrato publicado: quem audita acessibilidade
// lê o contrato, e um contrato que promete menos do que entrega produz gap falso — e, pior,
// autoriza uma reescrita que TROQUE o elemento nativo por outra coisa sem ninguém perceber que
// oito teclas foram embora.
//
// A régua deste arquivo é o NAVEGADOR, nunca o texto do APG. A medição corrigiu a leitura nos
// dois sentidos: no `Radio` ela ACRESCENTOU `ArrowLeft`/`ArrowRight` (que o APG não destaca) e
// IMPEDIU acrescentar `Home`/`End`, que o padrão do grupo de rádio menciona e o browser não faz.
//
// Escopo declarado: só os componentes que SÃO elemento nativo, onde o teclado é do browser e a
// medição é possível sem montar React. Os que vêm do motor (Base UI) têm o teclado conferido
// contra o inventário do §9 da base-ui, que é outra fonte e outro gate.

const ficha = (n: string) =>
  JSON.parse(readFileSync(`packages/contracts/registry/${n}.json`, "utf8"));

/** As teclas que MOVEM o valor deste controle, medidas uma a uma no navegador. */
const CASOS: Array<{ficha: string; html: string; alvo: string; reset: string;
  ler: string; teclas: string[]}> = [
  {
    ficha: "Range",
    html: `<input id=alvo type=range min=0 max=100 value=50 step=1>`,
    alvo: "#alvo", reset: `el.value = "50"`, ler: `el.value`,
    teclas: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"],
  },
  // O Select saiu daqui em 24/09/2026: deixou de ser o <select> nativo e passou a ser o do Base UI
  // com a pele da casa. O teclado dele é medido no `teclado-motor.spec.ts`, com os outros motores.
  {
    ficha: "Radio",
    html: `<fieldset id=g><input type=radio name=r id=alvo checked>` +
          `<input type=radio name=r><input type=radio name=r></fieldset>`,
    alvo: "#alvo", reset: `el.checked = true`,
    ler: `[...document.querySelectorAll("input[name=r]")].findIndex(e => e.checked)`,
    teclas: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  },
];

for (const caso of CASOS) {
  test(`${caso.ficha}: a ficha declara todo o teclado que o elemento nativo entrega`, async ({page}) => {
    await page.setContent(`<!doctype html><meta charset=utf-8>${caso.html}`);
    const movem: string[] = [];
    // Toda tecla plausível, não só as declaradas: uma que a ficha esqueceu não estaria na lista.
    const CANDIDATAS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End", "PageUp", "PageDown"];
    for (const k of CANDIDATAS) {
      const antes = await page.$eval(caso.alvo, new Function("el", `${caso.reset}; el.focus(); return ${caso.ler}`) as never);
      await page.keyboard.press(k);
      const depois = await page.$eval(caso.alvo, new Function("el", `return ${caso.ler}`) as never);
      if (String(antes) !== String(depois)) movem.push(k);
    }
    const declaradas = new Set<string>(ficha(caso.ficha).a11y.keyboard);
    const esquecidas = movem.filter(k => !declaradas.has(k));
    expect(esquecidas,
      `${caso.ficha}: o navegador move o valor com ${esquecidas.join(", ")} e a ficha não declara. ` +
      `Contrato que promete menos do que entrega produz gap falso na auditoria de acessibilidade.`)
      .toEqual([]);
    // e o inverso: prometer tecla que não faz nada é pior, porque não se descobre testando
    const inventadas = [...declaradas].filter(k => CANDIDATAS.includes(k) && !movem.includes(k));
    expect(inventadas,
      `${caso.ficha}: a ficha declara ${inventadas.join(", ")} e o navegador não faz nada com ` +
      `essas teclas — foi o que a medição impediu de escrever no Radio (Home/End).`)
      .toEqual([]);
  });
}
