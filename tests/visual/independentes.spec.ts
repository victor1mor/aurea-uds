import {test, expect} from "@playwright/test";

// PV-14 (16/11/2026). O Victor (20/10/2026): "preciso de uma solução robusta que componentes sejam independentes em
// conjuntos de toda forma". Nenhuma peça de leiaute pode depender, escondido, de outra (o `AppShell`) para ter tamanho,
// altura ou posição certos. No banco (`apps/keyboard-probe/independentes.html`), cada peça aparece sozinha e dentro de
// `Stack`, `Cluster` e `Grid`, e aqui se mede a caixa de cada uma, em três larguras:
//   1. ela existe: largura e altura acima de zero;
//   2. ela fica dentro da caixa onde foi posta (não vaza pela direita nem pela esquerda);
//   3. o conteúdo dela não é cortado por dentro (com `overflow` escondido, o que passa da borda some);
//   4. ela não cobre o vizinho (na grade estreita, uma largura fixa passava por cima da outra coluna);
//   5. no `Stack`, ela tem a mesma largura que sozinha — empilhar não pode mudar o tamanho de uma peça.
const APP = "/apps/keyboard-probe/out/independentes.html";

for (const largura of [900, 600, 320]) {
  test(`as peças de leiaute ficam inteiras sozinhas e dentro de Stack, Cluster e Grid (${largura})`, async ({page: p}) => {
    await p.setViewportSize({width: Math.max(largura + 64, 400), height: 900});
    await p.goto(`${APP}?largura=${largura}`, {waitUntil: "networkidle"});
    await p.evaluate(() => document.fonts.ready);
    const medidas = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-peca]")].map((sec) => ({
      peca: sec.dataset.peca!,
      contextos: [...sec.querySelectorAll<HTMLElement>("[data-contexto]")].map((ctx) => {
        const caixa = ctx.querySelector<HTMLElement>("[data-caixa]")!.getBoundingClientRect();
        const el = ctx.querySelector<HTMLElement>("[data-caixa] > * > *")!;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const esconde = /hidden|clip/.test(cs.overflowX);
        return {
          contexto: ctx.dataset.contexto!, w: Math.round(r.width), h: Math.round(r.height),
          vazaDireita: Math.round(r.right - caixa.right), vazaEsquerda: Math.round(caixa.left - r.left),
          cortado: esconde ? el.scrollWidth - el.clientWidth : 0,
          cobre: (() => { const v = ctx.querySelector<HTMLElement>(".vizinho")?.getBoundingClientRect();
            return v ? Math.max(0, Math.min(r.right, v.right) - Math.max(r.left, v.left)) * (Math.min(r.bottom, v.bottom) > Math.max(r.top, v.top) ? 1 : 0) : 0; })(),
        };
      }),
    })));
    expect(medidas.length, "o banco tem peças").toBeGreaterThan(10);
    const falhas: string[] = [];
    for (const {peca, contextos} of medidas) {
      const sozinha = contextos.find((c) => c.contexto === "sozinha")!;
      for (const c of contextos) {
        const onde = `${peca} · ${c.contexto}`;
        if (c.w <= 0 || c.h <= 0) falhas.push(`${onde}: some (${c.w} × ${c.h})`);
        if (c.vazaDireita > 1) falhas.push(`${onde}: sai ${c.vazaDireita} pela direita`);
        if (c.vazaEsquerda > 1) falhas.push(`${onde}: sai ${c.vazaEsquerda} pela esquerda`);
        if (c.cortado > 1) falhas.push(`${onde}: o conteúdo é cortado em ${c.cortado}`);
        if (c.cobre > 1) falhas.push(`${onde}: cobre ${Math.round(c.cobre)} do vizinho`);
        if (c.contexto === "Stack" && Math.abs(c.w - sozinha.w) > 1) falhas.push(`${onde}: ${c.w} de largura, sozinha ${sozinha.w}`);
      }
    }
    expect(falhas).toEqual([]);
  });
}
