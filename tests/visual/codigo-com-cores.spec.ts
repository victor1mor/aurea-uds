import {test, expect} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";
import {highlightCode} from "../../packages/react/dist/code-highlight.js";

// AS CAIXAS DE CÓDIGO COM CORES E NÚMERO DE LINHA (lote V, 20/10/2026), só com o CSS da Aurea, nos dois temas:
//   - cada cor do código passa de 4,5:1 sobre o fundo da caixa (texto de 12: o mínimo de texto comum), e é DIFERENTE
//     da cor do texto — pintou, e pintou legível;
//   - o número da linha também passa de 4,5:1, não entra no texto selecionado, e a coluna dele não pula: o código da
//     linha 9 e o da linha 10 começam no mesmo x (a coluna tem a largura dos algarismos da última linha);
//   - a coluna tem os 16 da referência (--space-4) e fica a 24 do código (--space-6).
// E no site: o código dos exemplos tem cor e número; o `import` do Usage, só cor.
// Provado contra o defeito (20/10/2026): com as cores puras (sem os 20% do texto), o azul cai a 4,08:1 no claro e o
// teste do contraste reprova; sem a regra do número no core, o da coluna reprova.
const CODIGO = [
  'import {Button} from "@aurea-uds/react";',
  "// o primeiro botão",
  "export function Barra() {",
  "  const total = 12;",
  "  return (",
  "    <>",
  '      <Button variant="primary">Salvar</Button>',
  '      <Button variant="ghost" size="sm">Voltar</Button>',
  "      <span>{total}</span>",
  "    </>",
  "  );",
  "}",
].join("\n");
const CAIXA = renderToStaticMarkup(h(A.CodeBlock, {language: "tsx", lineNumbers: true, highlight: highlightCode}, CODIGO));

for (const theme of ["dark", "light"] as const) {
  test(`o código tem cor e número legíveis, fora do texto selecionado · ${theme}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__codigo-${theme}`;
    await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">
        <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
        <body style="margin:0;padding:24px;background:var(--background)">${CAIXA}</body></html>`}));
    await p.setViewportSize({width: 900, height: 700});
    await p.goto(url, {waitUntil: "networkidle"});
    const m = await p.evaluate(() => {
      const rgb = (c: string) => { const x = document.createElement("canvas").getContext("2d")!; x.fillStyle = c; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; };
      const lum = ([r, g, b]: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const ct = (a: number[], b: number[]) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
      const pre = document.querySelector("pre.code-block")!;
      // O fundo da caixa, composto sobre o da página (o `--fill-2` é translúcido).
      const camadas: number[][] = [];
      for (let e: Element | null = pre; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c !== "rgba(0, 0, 0, 0)") { camadas.push(rgb(c)); if (rgb(c)[3] === 255) break; } }
      let fundo = camadas.pop()!;
      while (camadas.length) { const c = camadas.pop()!, a = c[3] / 255; fundo = [0, 1, 2].map((i) => Math.round(c[i] * a + fundo[i] * (1 - a))).concat(255); }
      const texto = rgb(getComputedStyle(pre).color);
      const cores = Object.fromEntries(["tok-keyword", "tok-string", "tok-number", "tok-comment", "tok-property", "tok-function"].map((c) => {
        const el = pre.querySelector(`.${c}`)!; const cor = rgb(getComputedStyle(el).color);
        return [c, {contraste: ct(cor, fundo), diferente: cor.join() !== texto.join()}];
      }));
      const linhas = [...pre.querySelectorAll(".code-line")];
      const antes = getComputedStyle(linhas[0], "::before");
      // Onde o código de cada linha começa: o primeiro pedaço de texto dela.
      const inicio = (l: Element) => { const r = document.createRange(); r.setStart(l, 0); r.setEnd(l, 1); return r.getBoundingClientRect().left; };
      const sel = getSelection()!; const r = document.createRange(); r.selectNodeContents(pre); sel.removeAllRanges(); sel.addRange(r);
      const space = (v: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) * 16;
      return {cores, numero: ct(rgb(antes.color), fundo), coluna: parseFloat(antes.minWidth || antes.width), largura: parseFloat(antes.width),
        vao: parseFloat(antes.marginInlineEnd), s4: space("--space-4"), s6: space("--space-6"), alinhado: Math.abs(inicio(linhas[8]) - inicio(linhas[9])),
        // O Firefox no Windows devolve o fim de linha do sistema (CR LF); o que se compara é o texto.
        selecionado: sel.toString().replace(/\r\n/g, "\n"), linhas: linhas.length};
    });
    for (const [c, v] of Object.entries(m.cores)) {
      expect(v.contraste, `${c}: contraste`).toBeGreaterThanOrEqual(4.5);
      if (!["tok-property", "tok-function"].includes(c)) expect(v.diferente, `${c}: tem cor própria`).toBe(true);
    }
    expect(m.numero, "o número da linha se lê").toBeGreaterThanOrEqual(4.5);
    expect(m.linhas).toBe(12);
    expect(m.largura, "a coluna do número: 16, como a da referência").toBeGreaterThanOrEqual(m.s4);
    expect(m.vao, "24 até o código").toBe(m.s6);
    expect(m.alinhado, "o código da linha 9 e o da 10 começam juntos").toBeLessThan(0.5);
    expect(m.selecionado, "o número não entra no texto selecionado").toBe(CODIGO);
  });
}

test("no site: o código dos exemplos tem cor e número; o import do Usage, só cor", async ({page: p}) => {
  await p.goto("/apps/catalog/button.html");
  await expect(p.locator(".demo-code pre.code-block-numbered.code-block-highlighted").first()).toBeAttached();
  const usage = p.locator(".usage-import pre, pre.usage-import").first();
  await expect(usage).toHaveClass(/code-block-highlighted/);
  await expect(usage).not.toHaveClass(/code-block-numbered/);
});
