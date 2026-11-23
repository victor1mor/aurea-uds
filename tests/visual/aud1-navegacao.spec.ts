import {test, expect} from "@playwright/test";

// O AUD-1, parte 4 (aprovado na bancada em 22/11/2026, "Aprovo as duas"). Na navegação, a Aurea ficava com a minoria das
// referências: (1) com o mouse em cima, a aba e o segmento não mudavam (9 de 11 e 8 de 10 mudam); (2) o item indisponível não
// existia nas abas, no segmento nem na lateral. Aqui se mede no navegador o que o CSS faz, nos dois temas e na Ember:
//   · com o mouse em cima, a letra da aba e do segmento que não estão escolhidos vai à cor do texto (`--foreground`);
//   · o indisponível fica com a opacidade de desativado (`--opacity-disabled`) e, com o mouse em cima, NÃO muda.
// Provado contra o defeito: com o `aurea.css` da 0.76.0, a letra continua apagada e a opacidade é 1.
const MARCACAO = `
<div role="tablist" class="tabs">
  <button type="button" role="tab" data-active class="tab">Visão geral</button>
  <button type="button" role="tab" aria-disabled="false" class="tab" id="aba">Detalhes</button>
  <button type="button" role="tab" aria-disabled="true" data-disabled class="tab" id="aba-fora">Arquivo</button>
</div>
<div role="radiogroup" class="segmented">
  <button type="button" role="radio" class="active">Quadro</button>
  <button type="button" role="radio" id="seg">Lista</button>
  <button type="button" role="radio" disabled data-disabled id="seg-fora">Mapa</button>
</div>
<nav class="sidebar" style="position:static"><ul><li><button type="button" class="sidebar-item" aria-disabled="true" id="lat-fora"><span class="sidebar-label">Cobrança</span></button></li></ul></nav>`;

for (const [tema, marca] of [["light", ""], ["dark", ""], ["light", "ember"], ["dark", "ember"]] as const) {
  test(`AUD-1 parte 4 · o passar o mouse e o indisponível (${tema}${marca ? ` ${marca}` : ""})`, async ({page: p}) => {
    await p.goto("/apps/catalog/tabs.html", {waitUntil: "domcontentloaded"});
    await p.evaluate(({html, tema, marca}) => new Promise<void>((pronto) => {
      document.documentElement.innerHTML = `<head><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${html}</body>`;
      document.documentElement.setAttribute("data-theme", tema);
      if (marca) document.documentElement.setAttribute("data-brand", marca); else document.documentElement.removeAttribute("data-brand");
      const link = document.querySelector("link")!;
      link.addEventListener("load", () => pronto(), {once: true});
    }), {html: MARCACAO, tema, marca});
    // Sem transição: a cor é lida já no estado final.
    await p.addStyleTag({content: "*,*::before,*::after{transition:none!important;animation:none!important}"});
    const ler = (sel: string) => p.evaluate((sel) => {
      const e = document.querySelector<HTMLElement>(sel)!;
      const raiz = getComputedStyle(document.body);
      const cor = getComputedStyle(e).color;
      const sonda = document.createElement("span"); sonda.style.color = "var(--foreground)"; document.body.append(sonda);
      const texto = getComputedStyle(sonda).color; sonda.remove();
      return {cor, texto, opacidade: getComputedStyle(e).opacity, op: raiz.getPropertyValue("--opacity-disabled").trim()};
    }, sel);

    for (const sel of ["#aba", "#seg"]) {
      const antes = await ler(sel);
      expect(antes.cor, `${sel} parado já está na cor do texto — o teste não mede nada`).not.toBe(antes.texto);
      await p.hover(sel);
      const depois = await ler(sel);
      expect(depois.cor, `${sel} com o mouse em cima`).toBe(depois.texto);
    }
    for (const sel of ["#aba-fora", "#seg-fora", "#lat-fora"]) {
      await p.mouse.move(0, 0);
      const parado = await ler(sel);
      expect(Number(parado.opacidade), `${sel} indisponível`).toBeCloseTo(Number(parado.op), 2);
      expect(Number(parado.opacidade)).toBeLessThan(1);
      await p.hover(sel, {force: true});
      const emCima = await ler(sel);
      expect(emCima.cor, `${sel} com o mouse em cima não muda`).toBe(parado.cor);
    }
  });
}
