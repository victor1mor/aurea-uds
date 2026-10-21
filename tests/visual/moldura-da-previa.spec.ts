import {expect, test} from "@playwright/test";
import {readdirSync} from "node:fs";
import {join} from "node:path";

// AS MOLDURAS DO SITE (21/10/2026) — o Victor achou três defeitos nas prévias que moram em documento próprio
// (`apps/catalog/embeds/`): o fundo cinza da PÁGINA em vez do preto da caixa, a peça no canto de cima à esquerda (o
// rótulo do ColorField e do DatePicker cortado pelo canto de 22) e o BottomNav que perdia o ícone ao trocar de item.
const DIR = join(process.cwd(), "apps/catalog/embeds");
const MOLDURAS = readdirSync(DIR).filter((f) => f.endsWith(".html")).sort();

// Todo <use> do documento aponta para um desenho que existe nele.
const semDesenho = () => [...document.querySelectorAll("use")]
  .map((u) => u.getAttribute("href") || u.getAttribute("xlink:href") || "")
  .filter((h) => h.startsWith("#") && !document.getElementById(h.slice(1)));

test("o BottomNav vivo troca de item sem perder o ícone — a forma cheia está no desenho embutido", async ({page}) => {
  const comBotao = MOLDURAS.filter((f) => f.startsWith("bottomnav"));
  expect(comBotao.length, "as molduras do BottomNav").toBeGreaterThan(5);
  for (const f of comBotao) {
    await page.goto(`/apps/catalog/embeds/${f}`);
    await page.waitForLoadState("load");
    const itens = page.locator("button.bottom-nav-item");
    const n = await itens.count();
    expect(n, `${f}: itens`).toBeGreaterThan(1);
    for (let i = 0; i < n; i++) {
      await itens.nth(i).click();
      await expect(itens.nth(i), `${f}: o item ${i + 1} vira o escolhido`).toHaveAttribute("aria-current", "page");
      expect(await page.evaluate(semDesenho), `${f}, item ${i + 1}: ícone sem desenho`).toEqual([]);
    }
  }
});

test("toda moldura tem o fundo da caixa de prévia, e a peça no centro, com folga da borda", async ({page}) => {
  await page.setViewportSize({width: 800, height: 460});
  const erros: string[] = [];
  for (const f of MOLDURAS) {
    await page.goto(`/apps/catalog/embeds/${f}`);
    await page.waitForLoadState("load");
    const m = await page.evaluate(() => {
      const raiz = document.getElementById("root")!;
      const corpo = getComputedStyle(document.body).backgroundColor;
      const caixa = document.createElement("div");
      caixa.style.background = "var(--surface-inset)";
      document.body.append(caixa);
      const esperado = getComputedStyle(caixa).backgroundColor;
      caixa.remove();
      // A cor que se VÊ no canto de baixo, à direita (o vão ao lado da peça): o fundo do primeiro que pinta, de dentro
      // para fora. O corpo certo não basta — o exemplo da lateral pintava o cinza do app por cima dele.
      let visto = "";
      for (let e = document.elementFromPoint(innerWidth - 6, innerHeight - 6); e; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor;
        if (!/rgba\(.*,\s*0\)$|transparent/.test(c)) { visto = c; break; }
      }
      // A moldura que traz o h1 do documento é a PÁGINA (o AppShell, a abertura de página): o fundo é dela.
      const pagina = !document.querySelector("header > h1.sr-only");
      // A moldura que é PÁGINA não é centralizada: ocupa a moldura e rola dentro dela. É a que monta o próprio arranjo
      // (a lateral, o AppShell: o gerador dá a ela um <div> no lugar do <main>) e a que traz o h1 do documento (a
      // abertura de página: sem o <h1 class="sr-only"> do gerador). Lê-se a estrutura, e não a classe do conserto.
      if (raiz.tagName !== "MAIN" || pagina) return {corpo, esperado, visto, pagina, centro: null};
      // A tinta: o texto (por Range) e o que pinta — o desenho, o campo, o fundo.
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const soma = (r: DOMRect) => { if (r.width < 2 || r.height < 2) return;
        x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
      const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      for (let t = tw.nextNode(); t; t = tw.nextNode()) {
        if (!t.textContent!.trim() || t.parentElement!.closest(".sr-only")) continue;
        const r = document.createRange(); r.selectNodeContents(t);
        for (const q of r.getClientRects()) soma(q);
      }
      for (const el of raiz.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || el.closest(".sr-only")) continue;
        if (el instanceof SVGSVGElement || /^(INPUT|IMG|CANVAS|VIDEO)$/.test(el.tagName)
          || !/rgba\(.*,\s*0\)$|transparent/.test(cs.backgroundColor) || cs.backgroundImage !== "none") soma(el.getBoundingClientRect());
      }
      const W = innerWidth, H = innerHeight;
      return {corpo, esperado, visto, pagina, centro: {dx: Math.round((x0 + x1) / 2 - W / 2), dy: Math.round((y0 + y1) / 2 - H / 2),
        folga: Math.round(Math.min(x0, y0, W - x1, H - y1))}};
    });
    if (m.corpo !== m.esperado) erros.push(`${f}: fundo ${m.corpo}, a caixa é ${m.esperado}`);
    if (!m.pagina && m.visto !== m.esperado) erros.push(`${f}: no canto se vê ${m.visto}, a caixa é ${m.esperado}`);
    if (m.centro && (Math.abs(m.centro.dx) > 4 || Math.abs(m.centro.dy) > 4)) erros.push(`${f}: fora do centro (${m.centro.dx}, ${m.centro.dy})`);
    if (m.centro && m.centro.folga < 16) erros.push(`${f}: a peça a ${m.centro.folga} da borda`);
  }
  expect(erros).toEqual([]);
});
