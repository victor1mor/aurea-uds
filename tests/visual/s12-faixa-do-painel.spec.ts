import {test, expect, type Page} from "@playwright/test";

// S-12 (o Victor, 14/11/2026, *"D, pode"*): com a barra de cima rente (`topbar-flush`), o painel do `AppShell` passava por
// baixo dela ao rolar e era cortado numa linha reta — os cantos de 22 sumiam. Agora uma faixa presa ao topo do painel
// (`.content::before`) para logo abaixo da barra e pinta o vão e os dois cantos de fora, no fundo da página.
// Medido no banco `tabelas.html` (a lateral até o topo, a barra pequena de 56, o vão de 16), a 1280 × 663:
//   • a faixa existe, é presa (`sticky`) e para na altura da BARRA que está ao lado (56 na barra pequena — a primeira
//     versão parava no `--topbar-height` de 64 e deixava uma tira do painel à vista);
//   • ela tem o vão + o canto (16 + 22) e não ocupa espaço: o conteúdo do painel fica onde estava;
//   • parada, o painel começa onde começava (a 72 = 56 + 16).
// Provado contra o defeito: com o core da 0.69.0 o `::before` do painel não existe (`content: none`, posição estática).
const APP = process.env.AUREA_TABELAS ?? "/apps/keyboard-probe/out/tabelas.html";

const faixa = (p: Page) => p.evaluate(() => {
  const c = document.querySelector<HTMLElement>(".content")!;
  const g = getComputedStyle(c, "::before");
  const barra = document.querySelector(".topbar-flush")!.getBoundingClientRect();
  return {conteudo: g.content, posicao: g.position, topo: parseFloat(g.top), altura: parseFloat(g.height),
    barra: Math.round(barra.height), painel: Math.round(c.getBoundingClientRect().top),
    primeiro: Math.round(c.firstElementChild!.getBoundingClientRect().top - c.getBoundingClientRect().top)};
});

test("S-12 · a faixa presa ao painel para embaixo da barra e desenha o vão e os cantos", async ({page: p}) => {
  await p.setViewportSize({width: 1280, height: 663});
  await p.goto(`${APP}?caso=preso&forma=proposta`, {waitUntil: "networkidle"});
  const m = await faixa(p);
  expect(m.conteudo, JSON.stringify(m)).not.toBe("none");
  expect(m.posicao, JSON.stringify(m)).toBe("sticky");
  expect(m.topo, "para na altura da barra que está ao lado").toBe(m.barra);
  expect(m.altura, "o vão (16) e o canto (22)").toBe(16 + 22);
  expect(m.painel, "parado, o painel começa onde começava").toBe(m.barra + 16);
  // a faixa não ocupa espaço: o primeiro filho do painel fica a recheio (24) + borda (1) do topo dele
  expect(m.primeiro, JSON.stringify(m)).toBe(24 + 1);
});

test("S-12 · sem a barra rente, nada muda: o painel não ganha a faixa", async ({page: p}) => {
  await p.setViewportSize({width: 1280, height: 663});
  await p.goto(`${APP}?caso=preso&forma=proposta`, {waitUntil: "networkidle"});
  // a mesma página, com a barra trocada para a flutuante: a regra lê a barra rente ao lado do painel
  await p.evaluate(() => { const b = document.querySelector(".topbar-flush")!; b.classList.remove("topbar-flush"); b.classList.add("topbar-floating"); });
  const conteudo = await p.evaluate(() => getComputedStyle(document.querySelector(".content")!, "::before").content);
  expect(conteudo).toBe("none");
});
