import {test, expect} from "@playwright/test";

// O AUD-1, parte 5 (o Victor na bancada viva, 23/11/2026: "1 invertida"). 9 de 11 referências invertem a dica: a cor do
// texto vira o fundo e a cor da página vira a letra. Aqui se mede no navegador o que o CSS faz, nos dois temas e na Ember:
//   · o fundo da dica é o `--foreground` e a letra é o `--background`;
//   · a seta vai inteira na cor do balão;
//   · o balão do gráfico (`.chart-tooltip`, a mesma classe) NÃO muda: continua na cor da superfície (`--popover`).
// Provado contra o defeito: com o `aurea.css` da 0.77.0, o fundo da dica é o `--popover`.
const MARCACAO = `
<div role="tooltip" class="tooltip" id="dica">Salva o rascunho
  <div class="overlay-arrow" data-side="top"><svg viewBox="0 0 12 12"><path class="overlay-arrow-fill" id="seta" d="M0 0Q6 12 12 0Z"/><path class="overlay-arrow-line" id="linha" d="M0 0Q6 12 12 0" fill="none"/></svg></div>
</div>
<div class="tooltip chart-tooltip" id="grafico"><strong>Março</strong></div>`;

for (const [tema, marca] of [["light", ""], ["dark", ""], ["light", "ember"], ["dark", "ember"]] as const) {
  test(`AUD-1 parte 5 · a dica invertida (${tema}${marca ? ` ${marca}` : ""})`, async ({page: p}) => {
    await p.goto("/apps/catalog/tooltip.html", {waitUntil: "domcontentloaded"});
    await p.evaluate(({html, tema, marca}) => new Promise<void>((pronto) => {
      document.documentElement.innerHTML = `<head><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${html}</body>`;
      document.documentElement.setAttribute("data-theme", tema);
      if (marca) document.documentElement.setAttribute("data-brand", marca); else document.documentElement.removeAttribute("data-brand");
      document.querySelector("link")!.addEventListener("load", () => pronto(), {once: true});
    }), {html: MARCACAO, tema, marca});
    await p.addStyleTag({content: "*,*::before,*::after{transition:none!important;animation:none!important}"});
    const m = await p.evaluate(() => {
      const cor = (v: string, prop: "color" | "backgroundColor" = "color") => {
        const s = document.createElement("span"); s.style[prop] = `var(${v})`; document.body.append(s);
        const c = getComputedStyle(s)[prop]; s.remove(); return c;
      };
      const dica = getComputedStyle(document.getElementById("dica")!);
      const grafico = getComputedStyle(document.getElementById("grafico")!);
      return {
        fundo: dica.backgroundColor, letra: dica.color,
        seta: getComputedStyle(document.getElementById("seta")!).fill,
        linha: getComputedStyle(document.getElementById("linha")!).stroke,
        grafico: grafico.backgroundColor,
        texto: cor("--foreground"), pagina: cor("--background"), superficie: cor("--popover", "backgroundColor"),
      };
    });
    expect(m.texto, "o texto e a superfície são diferentes — senão o teste não mede nada").not.toBe(m.superficie);
    expect(m.fundo, "o fundo da dica é a cor do texto").toBe(m.texto);
    expect(m.letra, "a letra da dica é a cor da página").toBe(m.pagina);
    expect(m.seta, "a seta na cor do balão").toBe(m.texto);
    expect(m.linha, "a linha da seta na cor do balão").toBe(m.texto);
    expect(m.grafico, "o balão do gráfico continua na cor da superfície").toBe(m.superficie);
  });
}
