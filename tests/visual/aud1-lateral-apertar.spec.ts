import {test, expect} from "@playwright/test";

// O empate da parte 4 da AUD-1 (apertar o item da lateral: 4 referências mudam, 4 não), decidido pelo Victor na bancada
// viva em 23/11/2026: "Escurece ao apertar". Aqui se mede no navegador, apertando o botão do mouse de verdade, nos dois
// temas e na Ember:
//   · apertado, o fundo do item é o da lateral misturado com 10% do texto dela — diferente do fundo com o mouse em cima;
//   · o item atual e o indisponível não mudam ao apertar.
// Provado contra o defeito: com o `aurea.css` da 0.77.0, o fundo apertado é igual ao do mouse em cima.
const MARCACAO = `
<nav class="sidebar" style="position:static"><ul style="list-style:none;margin:0;padding:8px">
  <li><a href="#" class="sidebar-item" id="item" onclick="return false"><span class="sidebar-label">Equipe</span></a></li>
  <li><a href="#" class="sidebar-item" id="atual" aria-current="page" onclick="return false"><span class="sidebar-label">Relatórios</span></a></li>
  <li><button type="button" class="sidebar-item" id="fora" aria-disabled="true"><span class="sidebar-label">Cobrança</span></button></li>
</ul></nav>`;

for (const [tema, marca] of [["light", ""], ["dark", ""], ["light", "ember"], ["dark", "ember"]] as const) {
  test(`AUD-1 parte 4 · a lateral escurece ao apertar (${tema}${marca ? ` ${marca}` : ""})`, async ({page: p}) => {
    await p.goto("/apps/catalog/sidebar.html", {waitUntil: "domcontentloaded"});
    await p.evaluate(({html, tema, marca}) => new Promise<void>((pronto) => {
      document.documentElement.innerHTML = `<head><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${html}</body>`;
      document.documentElement.setAttribute("data-theme", tema);
      if (marca) document.documentElement.setAttribute("data-brand", marca); else document.documentElement.removeAttribute("data-brand");
      document.querySelector("link")!.addEventListener("load", () => pronto(), {once: true});
    }), {html: MARCACAO, tema, marca});
    await p.addStyleTag({content: "*,*::before,*::after{transition:none!important;animation:none!important}"});
    const fundo = (sel: string) => p.evaluate((sel) => getComputedStyle(document.querySelector(sel)!).backgroundColor, sel);
    const esperado = await p.evaluate(() => {
      const s = document.createElement("span");
      s.className = "sidebar-item";
      s.style.background = "color-mix(in oklab, var(--sidebar-accent), var(--sidebar-foreground) 10%)";
      document.querySelector(".sidebar")!.append(s);
      const c = getComputedStyle(s).backgroundColor; s.remove(); return c;
    });

    for (const sel of ["#item", "#atual", "#fora"]) {
      await p.hover(sel, {force: true});
      const emCima = await fundo(sel);
      await p.mouse.down();
      const apertado = await fundo(sel);
      await p.mouse.up();
      if (sel === "#item") {
        expect(apertado, "apertado, o item escurece").not.toBe(emCima);
        expect(apertado, "o fundo da lateral com 10% do texto dela").toBe(esperado);
      } else {
        expect(apertado, `${sel} não muda ao apertar`).toBe(emCima);
      }
      await p.mouse.move(0, 0);
    }
  });
}
