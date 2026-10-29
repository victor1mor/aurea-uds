import {test, expect} from "@playwright/test";

// E17 e E18 (achados do app, 10 e 14/10/2026) MEDIDOS no navegador, com o código do nativo montado (`packages/native/dist`)
// rodando pelo `react-native-web` nas páginas do nativo do site. O dublê dos testes de unidade não calcula layout; aqui
// quem calcula é o navegador. Com o código de antes (medido em 29/10/2026), três dos quatro reprovam: os botões de largura
// inteira saíam com 44, 44 e 44 (e não 40, 48 e 56), a ação da direita do `Header` passava 60 da borda da barra, e o
// título não cortava. O da largura passa nos dois: é a trava para o conserto não encolher o botão.

// A caixa desenhada do botão é o primeiro filho do alvo de toque (o elemento com o papel de botão).
const caixas = (sel: string) => `Array.from(document.querySelectorAll('${sel} [role="button"]')).map((b) => {
  const c = b.firstElementChild.getBoundingClientRect(), a = b.getBoundingClientRect();
  return {altura: Math.round(c.height), largura: Math.round(c.width), alvo: Math.round(a.width)};
})`;

test("E18 · o Button de largura inteira tem a altura do tamanho: 40, 48 e 56", async ({page: p}) => {
  await p.goto("/apps/catalog/native-button.html", {waitUntil: "networkidle"});
  await expect(p.locator("#full-width [role='button']")).toHaveCount(3);
  const largos = await p.evaluate(caixas("#full-width"));
  expect(largos.map((b) => b.altura)).toEqual([40, 48, 56]);
  // Os mesmos três tamanhos sem `fullWidth` (o exemplo "Sizes": xs, sm, md, lg, xl): só a largura muda.
  const comuns = await p.evaluate(caixas("#sizes"));
  expect(largos.map((b) => b.altura)).toEqual(comuns.slice(1, 4).map((b) => b.altura));
});

test("E18 · o de largura inteira continua ocupando a largura toda", async ({page: p}) => {
  await p.goto("/apps/catalog/native-button.html", {waitUntil: "networkidle"});
  const largos = await p.evaluate(caixas("#full-width"));
  const caixa = await p.evaluate(() => Math.round(
    document.querySelector("#full-width [role='button']")!.parentElement!.getBoundingClientRect().width));
  for (const b of largos) {
    expect(b.largura).toBe(caixa);
    expect(b.alvo).toBe(caixa);
  }
});

test("E17 · com um título comprido, a ação da direita fica dentro da barra", async ({page: p}) => {
  await p.goto("/apps/catalog/native-header.html", {waitUntil: "networkidle"});
  const acao = p.locator("#a-long-title [role='button'][aria-label='More options']");
  await expect(acao).toBeVisible();
  const r = await p.evaluate(() => {
    const botao = document.querySelector("#a-long-title [role='button'][aria-label='More options']")!;
    const barra = botao.parentElement!;
    const b = botao.getBoundingClientRect(), f = barra.getBoundingClientRect();
    return {fimDoBotao: Math.round(b.right), fimDaBarra: Math.round(f.right), larguraDoBotao: Math.round(b.width)};
  });
  expect(r.fimDoBotao).toBeLessThanOrEqual(r.fimDaBarra);
  // A ação fica do tamanho dela (o círculo de 48 do `md`, com o alvo de 44 dentro): não encolhe.
  expect(r.larguraDoBotao).toBe(48);
});

test("E17 · o título encolhe e termina em reticências, sem passar da barra", async ({page: p}) => {
  await p.goto("/apps/catalog/native-header.html", {waitUntil: "networkidle"});
  const r = await p.evaluate(() => {
    const exemplo = document.querySelector("#a-long-title")!;
    const titulo = Array.from(exemplo.querySelectorAll("div, span"))
      .find((e) => e.childElementCount === 0 && e.textContent === "Quarterly report for the north region") as HTMLElement;
    const botao = exemplo.querySelector("[role='button'][aria-label='More options']")!;
    const t = titulo.getBoundingClientRect(), b = botao.getBoundingClientRect();
    return {cortado: titulo.scrollWidth > titulo.clientWidth, reticencias: getComputedStyle(titulo).textOverflow,
      fimDoTitulo: Math.round(t.right), comecoDoBotao: Math.round(b.left)};
  });
  expect(r.cortado).toBe(true);
  expect(r.reticencias).toBe("ellipsis");
  expect(r.fimDoTitulo).toBeLessThanOrEqual(r.comecoDoBotao);
});
