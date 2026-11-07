import {test, expect} from "@playwright/test";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

// O "FULL WIDTH" FAZ A PEÇA CRESCER (06/11/2026, o desenho do FigCraft aprovado pelo Victor). O botão alargava a CAIXA e a
// peça ficava presa no limite que o exemplo dá a ela (30rem, 480): "só aumenta a caixa e nada acontece". Agora o limite
// (`--demo-limite`) vira 100% no modo largo, e a peça ocupa a caixa menos o recheio; na largura normal, nada muda. E a
// busca do topo, abaixo de 1335 de largura, é o círculo de 44 dos vizinhos, com a lupa no centro.
// Provado contra o defeito: contra o site de antes, os dois reprovam (o Alert fica em 480; a busca, 38 × 44).
test("Full width: o Alert ocupa a caixa no modo largo e volta aos 480 na largura normal", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto("/apps/catalog/alert.html");
  const medir = () => page.evaluate(() => {
    const pn = document.querySelector('.demo .demo-panel[data-panel="preview"]') as HTMLElement;
    const cs = getComputedStyle(pn);
    return {peca: pn.querySelector(".alert")!.getBoundingClientRect().width,
      miolo: pn.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)};
  });
  const antes = await medir();
  expect(antes.peca, "na largura normal, os 30rem de sempre").toBeCloseTo(480, 0);
  await page.locator(".tela-cheia-abrir").first().click();
  await expect.poll(async () => (await medir()).peca).toBeGreaterThan(800);
  const largo = await medir();
  expect(largo.peca, "no modo largo, a caixa inteira menos o recheio").toBeCloseTo(largo.miolo, 0);
  await page.locator(".tela-cheia-abrir").first().click();
  await expect.poll(async () => Math.round((await medir()).peca)).toBe(480);
});

test("a busca do topo, só com a lupa, é um círculo de 44 com a lupa no centro", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto("/apps/catalog/button.html");
  const m = await page.locator(".site-search").first().evaluate((e) => {
    const q = e.getBoundingClientRect(), i = e.querySelector(".icon")!.getBoundingClientRect();
    const alvo = document.createElement("div"); alvo.style.cssText = "position:absolute;inline-size:var(--target-min)"; document.body.append(alvo);
    const t = alvo.getBoundingClientRect().width; alvo.remove();
    return {w: q.width, h: q.height, esq: i.left - q.left, dir: q.right - i.right, alvo: t};
  });
  expect([m.w, m.h]).toEqual([m.alvo, m.alvo]);
  expect(m.esq, "a lupa no centro").toBeCloseTo(m.dir, 0);
});

// AS MOLDURAS (06/11/2026, ADR-0093) — o Victor achou na Sidebar exemplos sem o "Full width", e a varredura do site achou 87
// em 25 páginas: o botão pulava toda caixa com moldura. E a moldura tinha a altura da caixa: o AppShell (366 numa de 270),
// o BottomNav (405), a abertura de página (668) e a lista da Sidebar eram cortados. Agora toda caixa com moldura tem o botão,
// e toda moldura cresce até o conteúdo caber — menos a `data-altura="fixa"`, a que mostra a rolagem.
// Provado contra o defeito: contra o site de antes, as 87 caixas reprovam no botão, e 24 molduras no corte.
const PAGINAS_COM_MOLDURA = readdirSync(join(process.cwd(), "apps/catalog"))
  .filter((f) => f.endsWith(".html") && readFileSync(join(process.cwd(), "apps/catalog", f), "utf8").includes('class="demo-frame"'))
  .sort();

// O corte que NÃO é da moldura, com a medida. Cada um é pergunta ao Victor, com imagem; sai daqui quando for consertado.
const CORTE_DO_EXEMPLO: Record<string, string> = {
  "Sidebar — The current item, five ways preview": "cada lateral corta o terceiro item (124 em 94): o exemplo tira a margem "
    + "(margin 0) e a lateral flutuante continua descontando os 32 dela da altura (max-height calc(100% - 32px))",
};

test("toda caixa com moldura tem o Full width, e a moldura mostra o conteúdo inteiro", async ({page}) => {
  test.setTimeout(10 * 60_000);
  expect(PAGINAS_COM_MOLDURA.length, "as páginas com moldura").toBeGreaterThanOrEqual(25);
  await page.setViewportSize({width: 1280, height: 663});
  const falhas: string[] = [];
  for (const pag of PAGINAS_COM_MOLDURA) {
    await page.goto(`/apps/catalog/${pag}`);
    // os exemplos dobrados (a página da Sidebar põe cada um num Accordion) abrem: fechada, a moldura não tem tamanho, e
    // cresce quando a pessoa abre — é ali que ela se mede
    await page.evaluate(() => {
      document.querySelectorAll("details").forEach((d) => { d.open = true; });
      document.querySelectorAll("iframe[loading=lazy]").forEach((f) => f.setAttribute("loading", "eager"));
    });
    // espera cada moldura carregar o documento dela (e não o about:blank de antes) e a parte viva acender
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLIFrameElement>("iframe.demo-frame")]
      .filter((f) => !f.contentWindow?.location.pathname.includes("/embeds/") || f.contentDocument?.readyState !== "complete"
        || !f.contentDocument.getElementById("root")?.dataset.ligada).length), {timeout: 30_000}).toBe(0);
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => [...document.querySelectorAll<HTMLIFrameElement>("iframe.demo-frame")].map((f, i) => {
      const caixa = f.closest(".demo")!;
      const doc = f.contentDocument!, de = doc.documentElement;
      let sobra = 0;
      for (const e of doc.body.querySelectorAll("*")) {
        const o = doc.defaultView!.getComputedStyle(e).overflowY;
        if ((o === "auto" || o === "scroll") && e.clientHeight > 0) sobra = Math.max(sobra, e.scrollHeight - e.clientHeight);
      }
      const fr = f.getBoundingClientRect(), cx = caixa.getBoundingClientRect();
      return {i, titulo: f.title, fixa: f.dataset.altura === "fixa", botao: !!caixa.querySelector(":scope > .tela-cheia-abrir"),
        corta: Math.max(de.scrollHeight - de.clientHeight, sobra), foraDaCaixa: Math.round(fr.bottom - cx.bottom)};
    }));
    for (const m of r) {
      if (!m.botao) falhas.push(`${pag} #${m.i} (${m.titulo}): sem o Full width`);
      if (m.foraDaCaixa > 1) falhas.push(`${pag} #${m.i} (${m.titulo}): a moldura passa ${m.foraDaCaixa} da caixa`);
      if (m.fixa) continue;
      if (m.corta > 1 && !CORTE_DO_EXEMPLO[m.titulo]) falhas.push(`${pag} #${m.i} (${m.titulo}): corta ${m.corta}`);
    }
  }
  expect(falhas).toEqual([]);
});

test("a moldura que mostra a rolagem fica na altura de sempre", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 663});
  await page.goto("/apps/catalog/sidebar.html");
  const f = page.locator('iframe.demo-frame[data-altura="fixa"]');
  await expect(f).toHaveCount(1);
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
  await f.scrollIntoViewIfNeeded();
  await expect.poll(() => f.evaluate((e: HTMLIFrameElement) => e.contentDocument?.getElementById("root")?.dataset.ligada ?? ""))
    .toBe("sim");
  await page.waitForTimeout(1000);
  const m = await f.evaluate((e: HTMLIFrameElement) => {
    const lista = [...e.contentDocument!.querySelectorAll("*")].find((x) => {
      const o = getComputedStyle(x).overflowY; return (o === "auto" || o === "scroll") && x.scrollHeight > x.clientHeight + 1;
    });
    return {estilo: e.style.blockSize, rola: !!lista};
  });
  expect(m.estilo, "a altura não foi trocada").toBe("");
  expect(m.rola, "a lista continua rolando, com a barra").toBe(true);
});
