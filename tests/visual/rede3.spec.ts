import {test, expect, type Page} from "@playwright/test";

// PASSO 10 (0.32.0) · os pedidos do app de rede, medidos montados — 12/10/2026.
//
// MNT-23: o `TreeView` alargava a página. Medido no banco `apps/keyboard-probe/rede3.html`: num bloco
// comum o rótulo cortava, mas numa coluna `1fr` de grade ou num filho `flex: 1` (e dentro de um div
// nessa coluna, como num cartão) a árvore pedia o rótulo INTEIRO como largura mínima — o rótulo não
// quebra linha — e empurrava a caixa de 360 para 743 e 820. "Quem mais": a `NavList` empurrava igual
// (729); o `Select` e o `Text truncate` não; o `Badge` não corta por desenho e fica fora.
//
// O conserto é o mesmo nas duas: a trilha do texto vira `minmax(0, 1fr)` numa grade, que pede ZERO de
// largura mínima e, quando há espaço, mostra o texto inteiro. Por isso este teste cobra os DOIS lados:
// nada empurra a caixa de 360, e no painel que se ajusta ao conteúdo o rótulo continua inteiro (a
// saída fácil, largura 0 no rótulo, apagaria o rótulo ali).
const APP = process.env.AUREA_REDE3 ?? "/apps/keyboard-probe/out/rede3.html";

async function abrir(p: Page) {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 1100, height: 900});
  await p.goto(APP, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  return erros;
}

const medir = (p: Page) => p.evaluate(() => Object.fromEntries(
  Array.from(document.querySelectorAll<HTMLElement>("[data-caso]")).map((sec) => {
    const m = sec.querySelector<HTMLElement>("[data-moldura]")!;
    const rotulo = Array.from(sec.querySelectorAll<HTMLElement>(".tree-label, .nav-list-label")).pop();
    return [sec.dataset.caso!, {
      empurra: m.scrollWidth > m.clientWidth + 1,
      ajusta: sec.hasAttribute("data-ajusta"),
      rotuloCortado: rotulo ? rotulo.scrollWidth > rotulo.clientWidth + 1 : null,
    }];
  })));

test("MNT-23 · a árvore e a NavList não alargam a página, e mostram o texto inteiro quando cabe", async ({page: p}) => {
  const erros = await abrir(p);
  const m = await medir(p);
  for (const caso of ["bloco", "grade", "embrulhada", "flex", "navlist"]) {
    expect(m[caso], caso).toMatchObject({empurra: false, rotuloCortado: true});
  }
  for (const caso of ["ajustada", "navlist-ajustada"]) {
    expect(m[caso], caso).toMatchObject({ajusta: true, rotuloCortado: false});
  }
  // A página inteira não rola de lado.
  expect(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(erros).toEqual([]);
});

test("MNT-23 · a linha da árvore não muda de lugar: o rótulo começa onde começava, com e sem ícone", async ({page: p}) => {
  await abrir(p);
  const linha = await p.evaluate(() => {
    const n = document.querySelector<HTMLElement>('[data-caso="bloco"] .tree-node')!;
    const l = n.querySelector<HTMLElement>(".tree-label")!;
    const tw = n.querySelector<HTMLElement>(".tree-twist")!;
    return {altura: n.getBoundingClientRect().height, vao: Math.round(l.getBoundingClientRect().left - tw.getBoundingClientRect().right)};
  });
  // O vão é o token `--space-2`, medido no próprio documento (não um número escrito aqui).
  const vao = await p.evaluate(() => {
    const d = document.createElement("div");
    d.style.inlineSize = "var(--space-2)";
    document.body.append(d);
    const w = d.getBoundingClientRect().width;
    d.remove();
    return w;
  });
  expect(linha.altura).toBe(36);
  expect(linha.vao).toBe(Math.round(vao));
});
