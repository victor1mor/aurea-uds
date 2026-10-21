import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {join} from "node:path";

// MNT-29 (21/10/2026, o app de rede, que usa a marca `lory`, medido na 0.36.0): o texto de exemplo do campo dava 3,17:1
// no escuro — o mínimo é 4,5. Medido aqui: era a marca, e não o campo. Na `lory`, a cor fraca (`--subtle-foreground`,
// a do `::placeholder` e de mais 15 textos do core) dava 2,51 a 2,62 no claro e 3,16 a 3,58 no escuro, e até a média
// (`--muted-foreground`) dava 4,27 no claro. Na Aurea sem marca, as duas são a mesma cor e passam (4,69 a 5,38). A
// referência: 4,83 no claro e 6,75 no escuro. Conserto nos tokens da `lory`: a fraca igual à média, e a média do claro
// em 0,49 de luminosidade.
// O CSS vai no <head>, ANTES do campo existir: o campo tem transição de fundo, e com a folha acrescentada depois o
// fundo partia do branco do navegador — a medida pegava o começo da transição (2,24 onde a página real dá 4,69).
const CSS = readFileSync(join(process.cwd(), "packages/core/dist/aurea.css"), "utf8");
const MINIMO = 4.5;

for (const marca of ["", "lory"]) for (const tema of ["light", "dark"]) {
  test(`o texto de exemplo do campo passa de ${MINIMO}:1 — ${marca || "aurea"}, ${tema}`, async ({page}) => {
    await page.setContent(`<!doctype html><html data-theme="${tema}"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8"><style>${CSS}</style></head><body style="margin:0">`
      + `<main style="padding:20px;background:var(--background)"><div class="card" style="padding:20px">`
      + `<input class="input" placeholder="Search devices"><textarea class="textarea" placeholder="Notes"></textarea></div>`
      + `<input class="input" placeholder="Search devices"><span class="x-texto" style="color:var(--subtle-foreground)">Last seen</span></main></body></html>`);
    const medidas = await page.evaluate(() => {
      const cv = document.createElement("canvas").getContext("2d")!;
      const rgba = (css: string) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = css; cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const sobre = (a: number[], b: number[]) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3]));
      // O fundo que se vê atrás do texto: as camadas, de fora para dentro (o campo é translúcido sobre o cartão).
      const fundo = (el: Element) => { const pilha: string[] = []; for (let e: Element | null = el; e; e = e.parentElement) pilha.push(getComputedStyle(e).backgroundColor);
        let c = [255, 255, 255]; for (const s of pilha.reverse()) { const x = rgba(s); if (x[3] > 0) c = sobre(x, c); } return c; };
      const lum = (v: number[]) => { const l = v.map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
      const razao = (a: number[], b: number[]) => { const [m, n] = [lum(a), lum(b)].sort((x, y) => y - x); return (m + 0.05) / (n + 0.05); };
      const alvos: [string, Element, string][] = [
        ["campo no cartão", document.querySelector(".card .input")!, "::placeholder"],
        ["caixa de texto no cartão", document.querySelector(".card .textarea")!, "::placeholder"],
        ["campo na página", document.querySelector("main > .input")!, "::placeholder"],
        ["texto fraco na página", document.querySelector(".x-texto")!, ""]];
      return alvos.map(([nome, el, pseudo]) => {
        const f = fundo(el);
        return {nome, razao: +razao(sobre(rgba(getComputedStyle(el, pseudo || null).color), f), f).toFixed(2)};
      });
    });
    for (const m of medidas) expect(m.razao, `${marca || "aurea"} ${tema}, ${m.nome}`).toBeGreaterThanOrEqual(MINIMO);
  });
}
