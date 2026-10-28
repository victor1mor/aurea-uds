import {test, expect} from "@playwright/test";

// A BARRA DE FERRAMENTAS NAS MEDIDAS DA REFERÊNCIA (o Victor, 28/10/2026, olhando a de hoje ao lado da com as medidas da
// referência: "Medidas da referência"). A barra "colada" da referência tem 4 por dentro (`p-1`) e 8 entre os botões
// (`gap-2`), lido no pacote dela (3.2.6). Medido no banco dos estilos, nos três estilos do botão ligado, nos dois temas.
// Provado contra o defeito (28/10/2026): com o CSS de antes, mede 7 por dentro e 6 entre os botões, e reprova.
for (const tema of ["light", "dark"] as const) {
  test(`a Toolbar tem 4 por dentro e 8 entre os botões (${tema === "light" ? "claro" : "escuro"})`, async ({page: p}) => {
    await p.setViewportSize({width: 1280, height: 900});
    await p.goto(`/apps/keyboard-probe/out/estilos.html?tema=${tema}`, {waitUntil: "networkidle"});
    await p.evaluate(() => document.fonts.ready);
    const medidas = await p.evaluate(() => ["brand", "neutral", "contrast"].map((v) => {
      const tb = document.querySelector(`[data-prova="ligado-${v}"] [role="toolbar"]`)!;
      const [a, b] = tb.querySelectorAll("button");
      const g = tb.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const r = (n: number) => Math.round(n * 100) / 100;
      return {estilo: v, cima: r(ra.top - g.top), baixo: r(g.bottom - ra.bottom), esquerda: r(ra.left - g.left),
        direita: r(g.right - rb.right), entre: r(rb.left - ra.right)};
    }));
    for (const m of medidas) {
      expect(m, m.estilo).toEqual({estilo: m.estilo, cima: 4, baixo: 4, esquerda: 4, direita: 4, entre: 8});
    }
  });
}
