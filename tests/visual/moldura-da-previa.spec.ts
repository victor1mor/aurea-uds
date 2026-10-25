import {expect, test} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

// AS MOLDURAS DO SITE (21/10/2026) — o Victor achou três defeitos nas prévias que moram em documento próprio
// (`apps/catalog/embeds/`): o fundo cinza da PÁGINA em vez do preto da caixa, a peça no canto de cima à esquerda (o
// rótulo do ColorField e do DatePicker cortado pelo canto de 22) e o BottomNav que perdia o ícone ao trocar de item.
const DIR = join(process.cwd(), "apps/catalog/embeds");
const MOLDURAS = readdirSync(DIR).filter((f) => f.endsWith(".html")).sort();
// A moldura cuja tinta fica fora do centro de propósito, com a medida (a mesma regra do `FORA_DO_CENTRO`, mais abaixo).
const MOLDURA_FORA_DO_CENTRO: Record<string, string> = {
  "bottomnav-the-four-older-names.html": "a coluna das quatro barras está no centro (43 em cima, 42 embaixo); a tinta sobe 8 "
    + "porque cada barra antiga pinta uma parte diferente do próprio retângulo",
};

// Todo <use> do documento aponta para um desenho que existe nele.
const semDesenho = () => [...document.querySelectorAll("use")]
  .map((u) => u.getAttribute("href") || u.getAttribute("xlink:href") || "")
  .filter((h) => h.startsWith("#") && !document.getElementById(h.slice(1)));

// TODA MOLDURA ACENDE (bloco 1, 25/10/2026). 10 das 67 saíam paradas — as 9 de padrão de moldura própria e a primeira do
// AppShell —, e o botão de recolher a lateral delas não respondia. A trava das caixas (`parte-viva.spec.ts`) deixa as
// molduras de fora; esta abre cada uma na largura de computador (abaixo de 1024 a lateral vira gaveta e o botão some), lê o
// `data-ligada` que a parte viva põe na raiz e, onde há lateral com botão de recolher, aperta e mede.
test("toda moldura acende sem erro, e o botão de recolher a lateral responde", async ({page}) => {
  test.setTimeout(10 * 60_000);
  await page.setViewportSize({width: 1280, height: 663});
  const erros: string[] = [];
  let atual = "";
  page.on("console", (m) => { if (m.type() === "error") erros.push(`${atual}: ${m.text().slice(0, 160)}`); });
  page.on("pageerror", (e) => erros.push(`${atual}: ${String(e).slice(0, 160)}`));
  let comBotao = 0;
  for (const f of MOLDURAS) {
    atual = f;
    await page.goto(`/apps/catalog/embeds/${f}`);
    const ligada = await page.waitForFunction(() => document.getElementById("root")?.dataset.ligada, null, {timeout: 5_000})
      .then((h) => h.jsonValue()).catch(() => "nada");
    if (ligada !== "sim") { erros.push(`${f}: a moldura não acendeu (${ligada})`); continue; }
    const botao = page.locator(".sidebar-collapse-trigger:visible, .sidebar-toggle:visible").first();
    if (!(await botao.count())) continue;
    comBotao++;
    const largura = () => page.locator(".sidebar").first().evaluate((e) => Math.round(e.getBoundingClientRect().width));
    const aberta = await largura();
    await botao.click();
    await expect.poll(largura, {message: `${f}: recolher`}).toBeLessThan(aberta);
    await botao.click();
    await expect.poll(largura, {message: `${f}: abrir de novo`}).toBe(aberta);
  }
  expect(erros).toEqual([]);
  expect(comBotao, "as molduras com o botão de recolher (os dois padrões da lateral que recolhe)").toBeGreaterThanOrEqual(2);
});

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

// A TINTA de uma caixa: o retângulo do que se vê — o texto (por Range) e o que pinta (o desenho, o campo, o fundo). A
// caixa da peça não serve: um invólucro de 460 com o texto curto à esquerda tem o centro certo e a peça fora dele.
// O que uma área de rolagem corta não conta: a tabela mais larga que a faixa dela só se vê até a borda da faixa.
const TINTA = `window.tintaDe = (raiz) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const corte = (el, r) => {
    let a = r.left, b = r.top, c = r.right, d = r.bottom;
    for (let e = el; e && e !== raiz; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
      const q = e.getBoundingClientRect();
      a = Math.max(a, q.left); b = Math.max(b, q.top); c = Math.min(c, q.right); d = Math.min(d, q.bottom);
    }
    return {left: a, top: b, right: c, bottom: d, width: c - a, height: d - b};
  };
  const soma = (r) => { if (r.width < 2 || r.height < 2) return;
    x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
  const tw = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let t = tw.nextNode(); t; t = tw.nextNode()) {
    if (!t.textContent.trim() || t.parentElement.closest(".sr-only")) continue;
    const cs = getComputedStyle(t.parentElement);
    if (cs.visibility === "hidden") continue;
    const r = document.createRange(); r.selectNodeContents(t);
    for (const q of r.getClientRects()) soma(corte(t.parentElement, q));
  }
  for (const el of raiz.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || el.closest(".sr-only")) continue;
    if (el instanceof SVGSVGElement || /^(INPUT|IMG|CANVAS|VIDEO)$/.test(el.tagName)
      || !/rgba\\(.*,\\s*0\\)$|transparent/.test(cs.backgroundColor) || cs.backgroundImage !== "none") soma(corte(el, el.getBoundingClientRect()));
  }
  return {x0, y0, x1, y1};
};`;

test("toda moldura tem o fundo da caixa de prévia, e a peça no centro, com folga da borda", async ({page}) => {
  await page.addInitScript(TINTA);
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
      const {x0, y0, x1, y1} = (window as unknown as {tintaDe: (r: Element) => Record<string, number>}).tintaDe(raiz);
      const W = innerWidth, H = innerHeight;
      return {corpo, esperado, visto, pagina, centro: {dx: Math.round((x0 + x1) / 2 - W / 2), dy: Math.round((y0 + y1) / 2 - H / 2),
        folga: Math.round(Math.min(x0, y0, W - x1, H - y1))}};
    });
    if (m.corpo !== m.esperado) erros.push(`${f}: fundo ${m.corpo}, a caixa é ${m.esperado}`);
    if (!m.pagina && m.visto !== m.esperado) erros.push(`${f}: no canto se vê ${m.visto}, a caixa é ${m.esperado}`);
    if (m.centro && !(f in MOLDURA_FORA_DO_CENTRO) && (Math.abs(m.centro.dx) > 4 || Math.abs(m.centro.dy) > 4)) erros.push(`${f}: fora do centro (${m.centro.dx}, ${m.centro.dy})`);
    if (m.centro && m.centro.folga < 16) erros.push(`${f}: a peça a ${m.centro.folga} da borda`);
  }
  for (const f of Object.keys(MOLDURA_FORA_DO_CENTRO)) if (!MOLDURAS.includes(f)) erros.push(`${f}: está em MOLDURA_FORA_DO_CENTRO e a moldura não existe mais — tire a linha`);
  expect(erros).toEqual([]);
});

// AS CAIXAS DO MEIO DA PÁGINA (21/10/2026). O Victor: "alguns componentes não esta sendo apresentados de forma
// centralizada". A medida achou 26; 17 eram o exemplo numa caixa de largura FIXA, com a peça curta encostada à esquerda
// (o Checkbox, o Radio, o Switch…) — consertados com `maxWidth`, como a referência mostra: a peça no centro, na largura
// dela. As que ficam, cada uma com o motivo medido:
const FORA_DO_CENTRO: Record<string, string> = {
  "Accordion:0": "o bloco está no centro; a medida conta o espaço que o item fechado reserva embaixo",
  "Accordion:1": "o bloco está no centro; a medida conta o espaço que o item fechado reserva embaixo",
  "Prose:0": "texto corrido ocupa a largura; a última linha curta puxa a tinta para a esquerda",
  "Skeleton:0": "linhas de larguras diferentes, de propósito (70% e 90%)",
  "Skeleton:1": "as linhas de 70% do texto que carrega, alinhadas como texto — o mesmo motivo da de cima",
  "Tabs:1": "na referência as abas esticam até encher a fila; as nossas (secondary) não — é da peça, lote 2",
};
const REG = join(process.cwd(), "packages/contracts/registry");
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// A ficha que só existe no nativo (`platforms.web: "n-a"`, bloco 1) não tem página da web.
const PAGINAS = readdirSync(REG).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(REG, f), "utf8")))
  .filter((d) => d.platforms?.web !== "n-a").map((d) => d.name as string).sort().map((n) => `${slug(n)}.html`);

test("toda caixa do meio da página de componente tem a peça no centro, já viva", async ({page}) => {
  test.setTimeout(20 * 60_000);
  await page.addInitScript(TINTA);
  // A TELA DO VICTOR (CLAUDE.md, lote T): 1920 com zoom de 150% = 1280 × 663. Na altura padrão do Playwright (720) a
  // caixa é mais alta, e o que só quebra na tela dele passava.
  await page.setViewportSize({width: 1280, height: 663});
  const erros: string[] = [];
  const usadas = new Set<string>();
  for (const arquivo of PAGINAS) {
    await page.goto(`/apps/catalog/${arquivo}`);
    const caixas = page.locator("[data-vivo]");
    const n = await caixas.count();
    for (let i = 0; i < n; i++) await caixas.nth(i).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll<HTMLElement>("[data-vivo]")].every((c) => c.dataset.ligada),
      null, {timeout: 15000}).catch(() => {});
    const medidas = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-vivo]")].map((c) => {
      const t = (window as unknown as {tintaDe: (r: Element) => Record<string, number>}).tintaDe(c);
      const p = c.getBoundingClientRect();
      return {nome: c.dataset.vivo!, vazia: t.x0 === Infinity, cabe: t.y1 - t.y0 <= p.height - 2 * 16,
        dx: Math.round((t.x0 + t.x1) / 2 - (p.left + p.width / 2)), dy: Math.round((t.y0 + t.y1) / 2 - (p.top + p.height / 2))};
    }));
    for (const m of medidas) {
      if (m.vazia) { erros.push(`${arquivo} ${m.nome}: a caixa está vazia`); continue; }
      // A altura só conta quando a peça CABE na caixa: a mais alta começa no topo e rola, e isso é outro defeito (na tela
      // do Victor, onze rolam — levado a ele em 21/10/2026), não o centro.
      if (Math.abs(m.dx) <= 8 && (!m.cabe || Math.abs(m.dy) <= 8)) continue;
      if (FORA_DO_CENTRO[m.nome]) { usadas.add(m.nome); continue; }
      erros.push(`${arquivo} ${m.nome}: fora do centro (${m.dx}, ${m.dy})`);
    }
  }
  // A lista não guarda exceção que já não precisa: a que voltou ao centro sai dela.
  for (const nome of Object.keys(FORA_DO_CENTRO)) if (!usadas.has(nome)) erros.push(`${nome}: está no centro — tire da lista`);
  expect(erros).toEqual([]);
});
