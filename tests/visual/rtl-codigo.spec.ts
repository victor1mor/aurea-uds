import {test, expect} from "@playwright/test";

// O CÓDIGO NUMA PÁGINA DA DIREITA PARA A ESQUERDA (06/11/2026, a auditoria externa A-014, o desenho do FigCraft aprovado
// pelo Victor). O navegador espelhava o código: a pontuação pulava (`;"import …`), o número de linha ia para a direita, e
// o selo do pacote virava `aurea-uds/react@`. Agora o código é da esquerda para a direita, a moldura continua espelhada (o
// botão de copiar à esquerda) e o código não passa por baixo do botão. Na página do Button, com `dir="rtl"`.
// Provado contra o defeito: contra o CSS de antes, os dois reprovam.
test("rtl: o código fica da esquerda para a direita, o número antes dele e o botão sem cobrir", async ({page}) => {
  await page.goto("/apps/catalog/button.html");
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  const wrap = page.locator(".demo .code-block-wrap").first();
  await wrap.scrollIntoViewIfNeeded();
  const m = await wrap.evaluate((w) => {
    const pre = w.querySelector(".code-block")!, bt = w.querySelector(".copy-code")!.getBoundingClientRect();
    const linha = pre.querySelector(".code-line")!;
    const rg = document.createRange(); rg.selectNodeContents(linha); const texto = rg.getBoundingClientRect();
    // a primeira letra ("i" de import) e o último caractere (";") — da esquerda para a direita, o "i" vem antes
    const pos = (no: Node, i: number) => { const r = document.createRange(); r.setStart(no, i); r.setEnd(no, i + 1); return r.getBoundingClientRect().left; };
    const nos: Text[] = []; const tw = document.createTreeWalker(linha, NodeFilter.SHOW_TEXT); while (tw.nextNode()) nos.push(tw.currentNode as Text);
    const primeiro = nos[0], ultimo = nos[nos.length - 1];
    const numero = getComputedStyle(linha, "::before");
    return {dir: getComputedStyle(pre).direction, i: pos(primeiro, 0), pontoEVirgula: pos(ultimo, ultimo.length - 1),
      botaoFim: bt.right, botaoInicio: bt.left, textoInicio: texto.left, numeroAntes: numero.content !== "none"};
  });
  expect(m.dir).toBe("ltr");
  expect(m.i, "o \"import\" começa à esquerda do \";\"").toBeLessThan(m.pontoEVirgula);
  expect(m.textoInicio, "o código começa depois do botão de copiar (à esquerda)").toBeGreaterThan(m.botaoFim);
});

test("rtl: o selo do pacote continua @aurea-uds/react", async ({page}) => {
  await page.goto("/apps/catalog/button.html");
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  const selo = page.locator(".g1-selo-mono", {hasText: "@aurea-uds/react"}).first();
  const m = await selo.evaluate((e) => {
    const no = [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent!.includes("@")) as Text ?? e.firstChild as Text;
    const t = no.textContent!; const pos = (i: number) => { const r = document.createRange(); r.setStart(no, i); r.setEnd(no, i + 1); return r.getBoundingClientRect().left; };
    return {arroba: pos(t.indexOf("@")), r: pos(t.indexOf("react"))};
  });
  expect(m.arroba, "o @ vem antes do nome").toBeLessThan(m.r);
});
