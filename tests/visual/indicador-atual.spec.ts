import {test, expect} from "@playwright/test";

// O MARCADOR DO ITEM ATUAL (lote S, 16/10/2026). Sem linha (ADR-0072), toda borda ficou transparente — e dois marcadores
// de "você está aqui" eram borda de um lado: o traço amarelo sob a área atual do topo do site e a barra do item atual do
// "On this page" (`TableOfContents`). Saíram junto, e o item atual ficou só com a cor do texto. Eles não são contorno: são
// o indicador, como o das abas (ADR-0072, item 5), e voltaram como desenho cheio. As fotos do catálogo mostraram a falta;
// este teste a cobra sem foto.
// Provado contra o defeito (16/10/2026): com o CSS de antes do conserto, os dois reprovam.
const marca = (sel: string, ps: "::before" | "::after") => ({sel, ps});

for (const tema of ["dark", "light"] as const) {
  test(`o item atual tem marcador desenhado — área do topo e "On this page" · ${tema}`, async ({page}) => {
    await page.goto("/apps/catalog/button.html");
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      // O item atual do "On this page" muda com a rolagem; aqui se mede a regra, no primeiro.
      const toc = document.querySelector(".toc a");
      if (toc && !document.querySelector(".toc a[aria-current]")) toc.setAttribute("aria-current", "true");
    }, tema);
    for (const {sel, ps} of [marca('.site-area[aria-current="page"]', "::after"), marca(".toc a[aria-current]", "::before")]) {
      const m = await page.evaluate(([s, p]) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const c = getComputedStyle(e, p);
        const cv = document.createElement("canvas").getContext("2d")!;
        cv.fillStyle = c.backgroundColor; cv.fillRect(0, 0, 1, 1);
        return {conteudo: c.content, alfa: cv.getImageData(0, 0, 1, 1).data[3], borda: getComputedStyle(e).borderTopColor};
      }, [sel, ps] as const);
      expect(m, `${sel} existe na página`).not.toBeNull();
      expect(m!.conteudo, `${sel}${ps}: o marcador é desenhado`).not.toBe("none");
      expect(m!.alfa, `${sel}${ps}: e tem cor`).toBeGreaterThan(0);
    }
    // E quem não é o atual não tem marcador.
    const outro = await page.evaluate(() => getComputedStyle(document.querySelector(".site-area:not([aria-current])")!, "::after").content);
    expect(outro, "a área que não é a atual não tem marcador").toBe("none");
  });
}
