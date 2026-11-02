import {test, expect} from "@playwright/test";

// O MARCADOR DO ITEM ATUAL (lote S, 16/10/2026). Sem linha (ADR-0072), toda borda ficou transparente — e dois marcadores
// de "você está aqui" eram borda de um lado: o traço amarelo sob a área atual do topo do site e a barra do item atual do
// "On this page" (`TableOfContents`). Saíram junto, e o item atual ficou só com a cor do texto. Eles não são contorno: são
// o indicador, como o das abas (ADR-0072, item 5), e voltaram como desenho cheio. As fotos do catálogo mostraram a falta;
// este teste a cobra sem foto.
// Provado contra o defeito (16/10/2026): com o CSS de antes do conserto, os dois reprovam.
// O SITE B (31/10/2026, ADR-0088): o marcador das duas passou a ser a CÁPSULA LEVANTADA — o fundo do segmento e a sombra —,
// na área atual da pílula (a `SegmentedControl` de links) e no item atual do índice (`indicator="segment"`). O que o teste
// cobra continua o mesmo: o atual tem marcador desenhado, com cor, e quem não é o atual não tem.
for (const tema of ["dark", "light"] as const) {
  test(`o item atual tem marcador desenhado — área do topo e "On this page" · ${tema}`, async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/apps/catalog/button.html");
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      // O item atual do "On this page" muda com a rolagem; aqui se mede a regra, no primeiro.
      const toc = document.querySelector(".toc a");
      if (toc && !document.querySelector(".toc a[aria-current]")) toc.setAttribute("aria-current", "true");
    }, tema);
    for (const [atual, outro] of [['.site-areas a[aria-current="page"]', ".site-areas a:not([aria-current])"],
      [".toc a[aria-current]", ".toc a:not([aria-current])"]]) {
      const m = await page.evaluate(([a, o]) => {
        const cv = document.createElement("canvas").getContext("2d")!;
        const medir = (s: string) => { const e = document.querySelector(s); if (!e) return null;
          const c = getComputedStyle(e);
          cv.clearRect(0, 0, 1, 1); cv.fillStyle = c.backgroundColor; cv.fillRect(0, 0, 1, 1);
          return {alfa: cv.getImageData(0, 0, 1, 1).data[3], sombra: c.boxShadow}; };
        return {atual: medir(a), outro: medir(o)};
      }, [atual, outro] as const);
      expect(m.atual, `${atual} existe na página`).not.toBeNull();
      expect(m.atual!.alfa, `${atual}: a cápsula tem cor`).toBeGreaterThan(0);
      expect(m.atual!.sombra, `${atual}: e é levantada`).not.toBe("none");
      expect(m.outro!.alfa, `${outro}: quem não é o atual não tem cápsula`).toBe(0);
    }
  });
}
