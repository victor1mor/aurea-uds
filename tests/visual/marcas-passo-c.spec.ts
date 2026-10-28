import {test, expect} from "@playwright/test";
import {join} from "node:path";
import {esperarTransicoes} from "./esperar-transicoes";

// AS 13 MARCAS (passo C das cores, 28/10/2026). As 11 da paleta da 1.0 viraram oficiais com o sim do Victor, e a proposta
// dele diz que, conferido na bancada, "todos passam, menos o F (ícone branco) nas marcas de cor clara". Este teste mede isso
// no navegador, com o código de verdade: nos dois bancos das cores (`paleta.html`, as peças que a paleta toca; `estilos.html`,
// os estilos do passo B), em cada marca e nos dois temas, o axe procura texto e ícone abaixo do contraste da WCAG.
//
// A Aurea Gold (sem `data-brand`) entra também: ela é a régua. A Aurea Ember (a antiga `lory`) entra desde que recebe os
// estilos novos (28/10/2026), com o único par que ela já reprovava (abaixo); o padrão dela é provado no `lory-congelada.spec.ts`.
//
// A ÚNICA exceção: o estilo `brand-white` da barra de baixo (o F) nas marcas de letra escura — o branco sobre um primário
// claro. O Victor o aprovou sabendo (ADR-0084). Nas marcas de letra branca o F é igual ao `brand`, e passa.
//
// Provado contra o defeito (28/10/2026): com as 11 marcas nos tokens e o core como estava, reprovou em três bancos — o
// segmento aceso e o `.eyebrow` do escuro no primário puro (1,56:1 na Cobalt a 4,3:1 na Cyan) e o selo cheio da marca no
// acento (1,12:1 na Sun do claro, 2,25:1 na Cobalt do escuro). Com a regra do escuro e o selo cheio no primário, passa.
const AXE = join(process.cwd(), "node_modules/.pnpm/axe-core@4.10.2/node_modules/axe-core/axe.min.js");
const BANCOS = ["paleta", "estilos"] as const;
export const MARCAS_NOVAS = ["sun", "honey", "orange", "magenta", "violet", "indigo", "cobalt", "cyan", "turquoise", "emerald", "lime"];
const LETRA_ESCURA = new Set(["", "sun", "honey", "orange", "cyan", "turquoise", "emerald", "lime"]);

for (const banco of BANCOS) {
  for (const tema of ["light", "dark"] as const) {
    test(`as 13 marcas no banco ${banco}, ${tema === "light" ? "claro" : "escuro"}: nenhum texto abaixo da WCAG`, async ({page: p}, info) => {
      test.skip(info.project.name !== "chromium", "a medida de cor é a mesma nos três; o axe roda no Chromium");
      test.setTimeout(240_000);
      await p.setViewportSize({width: 1280, height: 900});
      const falhas: string[] = [];
      for (const marca of ["", ...MARCAS_NOVAS, "ember"]) {
        await p.goto(`/apps/keyboard-probe/out/${banco}.html?tema=${tema}${marca ? `&marca=${marca}` : ""}`, {waitUntil: "networkidle"});
        await p.evaluate(() => document.fonts.ready);
        await esperarTransicoes(p);
        await p.addScriptTag({path: AXE});
        const achados = await p.evaluate(async () => {
          const r = await (window as any).axe.run(document, {runOnly: ["color-contrast"]});
          return r.violations.flatMap((v: any) => v.nodes.map((n: any) => {
            const el = document.querySelector(n.target[0]);
            const prova = el?.closest("[data-prova]")?.getAttribute("data-prova") ?? "";
            const razao = n.any?.[0]?.data?.contrastRatio ?? "?";
            return {prova, razao, html: String(n.html).slice(0, 80)};
          }));
        });
        for (const a of achados) {
          if (a.prova === "bn-brand-white" && LETRA_ESCURA.has(marca)) continue;
          // CONHECIDO, DE ANTES DO PASSO C, E NÃO É DE MARCA: no escuro, o nome dentro da célula "atenção" do painel de saúde
          // (a letra clara do cartão sobre o laranja do `--warning-500`) mede 2,41:1 — na Aurea Gold da 0.46.0 publicada, e
          // igual em todas as marcas. Achado por este teste em 28/10/2026; mudar a peça é pergunta ao Victor (anotada no ESTADO).
          if (a.prova === "saude-atencao" && tema === "dark") continue;
          // A EMBER JÁ REPROVAVA ASSIM, e está congelada (ADR-0083, a decisão do Victor de 26/10/2026): no claro, a letra
          // branca sobre o laranja dela mede 3,08:1 — o botão primário dela de sempre. Desde que ela recebe os estilos novos
          // (28/10/2026, "Sim, como as outras"), os estilos que pintam o laranja cheio (o `brand` do botão ligado e do
          // segmento, a barra inteira da marca) herdam o mesmo par. Só esse par, só nela, só no claro.
          if (marca === "ember" && tema === "light" && a.razao === 3.08) continue;
          falhas.push(`${marca || "gold"} · ${a.prova || "(sem prova)"} · ${a.razao}:1 · ${a.html}`);
        }
      }
      expect(falhas, `contraste abaixo da WCAG (${banco}, ${tema}):\n${falhas.join("\n")}`).toEqual([]);
    });
  }
}
