import {test, expect, type Page, type Locator} from "@playwright/test";

// O desenho por MÁSCARA no alto contraste do Windows — 12/10/2026, passo 10 (0.32.0).
//
// Cinco glifos da Aurea são desenho do CSS por máscara (`background: currentColor` recortado por um
// SVG): o menu do `Header`, a seta do link externo, a seta do `KPI`, o visto do aviso preso ao botão
// e, desde hoje, a seta do `Accordion`. No alto contraste o navegador troca o FUNDO de toda peça pela
// cor da tela — e o glifo, que é feito de fundo, sumia. Medido: 34 pontos de tinta na seta do
// `Accordion` no modo normal, ZERO no alto contraste. O ícone de arquivo (`<svg>`) não sofre disso,
// porque o traço dele é `fill`, e não fundo.
//
// O conserto mora no bloco do alto contraste: o glifo sai da troca e pinta com a cor do sistema que
// o texto AO LADO recebe (o `inherit` não serve: devolve a cor de antes da troca). Este teste cobra
// três coisas — o glifo aparece no modo normal e no alto contraste; no alto contraste, tem a cor do
// texto ao lado; e a LISTA: glifo novo por máscara que não estiver aqui reprova, para não nascer
// invisível.
// Para cada glifo: a marcação do componente e o texto ao lado, cuja cor ele acompanha.
const GLIFOS: Record<string, string> = {
  ".topbar-menu-icon": `<button type="button" class="btn btn-ghost btn-icon"><span class="topbar-menu-icon" data-glifo></span></button>`,
  ".link-external": `<a class="link" href="#x">Documentação<span class="link-external" data-glifo></span></a>`,
  ".kpi-trend-icon": `<div class="kpi"><small class="kpi-trend kpi-trend-up kpi-tone-success"><span class="kpi-trend-icon" data-glifo></span>+12%</small></div>`,
  ".accordion-chevron": `<details class="accordion-item"><summary><span class="accordion-title">Pergunta</span><span class="accordion-chevron" data-glifo></span></summary></details>`,
  ".toast-anchored-icon": `<div class="toast-anchored"><span class="toast-anchored-icon" data-glifo></span><span>Link copiado</span></div>`,
  // O ícone de linhas do "On this page" (ADR-0067, 13/10/2026).
  ".toc-label-icon": `<nav class="toc"><p class="toc-label"><span class="toc-label-icon" data-glifo></span>On this page</p></nav>`,
  // O "visto" da amostra escolhida (0.32.0, ADR-0069). Ele NÃO tem texto ao lado — fica em cima da cor, na tinta
  // que mais contrasta com ela (a conta da WCAG) —, por isso não entra em `TEXTO_AO_LADO`: no alto contraste a
  // amostra inteira sai da troca (`forced-color-adjust:none`, como a área e a trilha), senão a COR, que é o
  // conteúdo dela, vira a cor da tela. Medido em 14/10/2026: sem isso, a amostra sumia.
  // A rodinha do `Spinner` e o visto do `Checkbox` (sem linha, ADR-0072, 16/10/2026): eram linha (borda), que o alto
  // contraste pinta; viraram máscara, que ele apagava.
  ".spinner": `<p style="display:flex;align-items:center;gap:8px"><span class="spinner" data-glifo></span><span class="spinner-texto">Carregando</span></p>`,
  ".control-mark::after": `<label class="checkbox"><input type="checkbox" checked aria-label="Aceito"><span class="control-mark" data-glifo></span><span class="checkbox-texto">Aceito</span></label>`,
  ".color-swatch-option::after": `<div class="color-swatch-picker" role="radiogroup" aria-label="Cor"><label class="color-swatch-option color-swatch-option-dark" data-glifo style="--color-swatch-current:#0485f7"><input type="radio" class="color-swatch-input" name="g" value="#0485f7" aria-label="Oceano" checked><span class="color-swatch" aria-hidden="true"></span></label></div>`,
};

async function tinta(p: Page, l: Locator) {
  // A rodinha do `Spinner` gira sem parar, e a foto espera a peça parar: com as animações desligadas, ela sai parada.
  const b64 = (await l.screenshot({animations: "disabled"})).toString("base64");
  return p.evaluate(async (s) => {
    const img = new Image();
    img.src = "data:image/png;base64," + s;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    // O canto de cima é fundo (o glifo é recortado no centro): conta o que difere dele.
    for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) > 60) n++;
    return n;
  }, b64);
}

async function montar(p: Page) {
  await p.setViewportSize({width: 900, height: 700});
  await p.goto("/apps/catalog/accordion.html", {waitUntil: "networkidle"});
  await p.evaluate((html) => {
    document.body.innerHTML = `<main style="display:grid;gap:24px;padding:24px;justify-items:start">${html}</main>`;
  }, Object.values(GLIFOS).join(""));
}

test("os glifos por máscara são todos conhecidos: máscara nova entra nesta lista", async ({page: p}) => {
  await montar(p);
  const comMascara = await p.evaluate(() => {
    const achados = new Set<string>();
    const varrer = (regras: CSSRuleList) => {
      for (const r of Array.from(regras)) {
        if (r instanceof CSSStyleRule) {
          const m = r.style.getPropertyValue("mask-image") || r.style.getPropertyValue("-webkit-mask-image") || r.style.getPropertyValue("mask") || r.style.getPropertyValue("-webkit-mask");
          if (m && m !== "none") for (const s of r.selectorText.split(",")) achados.add(s.trim());
        }
        if ("cssRules" in r && (r as CSSGroupingRule).cssRules) varrer((r as CSSGroupingRule).cssRules);
      }
    };
    for (const f of Array.from(document.styleSheets)) varrer(f.cssRules);
    return [...achados];
  });
  // Cada seletor com máscara termina num dos glifos conhecidos (o do menu tem uma segunda regra, a do X).
  const desconhecidos = comMascara.filter((s) => !Object.keys(GLIFOS).some((g) => s.endsWith(g)));
  expect(desconhecidos).toEqual([]);
  for (const g of Object.keys(GLIFOS)) expect(comMascara.some((s) => s.endsWith(g)), g).toBe(true);
});

// O WebKit não tem alto contraste (o macOS não tem esse modo). A emulação liga a CONSULTA, mas o
// navegador não troca cor nenhuma — medido: o texto continuou branco. Então o teste confere a troca
// de verdade (uma cor qualquer de autor tem de virar a do sistema) e, sem ela, se declara pulado, em
// vez de passar sem olhar.
async function altoContraste(p: Page) {
  await p.emulateMedia({forcedColors: "active"});
  const troca = await p.evaluate(() => {
    const i = document.createElement("i");
    i.style.color = "rgb(1, 2, 3)";
    document.body.append(i);
    const cor = getComputedStyle(i).color;
    i.remove();
    return cor !== "rgb(1, 2, 3)";
  });
  test.skip(!troca, "este navegador não tem alto contraste");
}

const TEXTO_AO_LADO: Record<string, string> = {
  ".topbar-menu-icon": ".btn",
  ".link-external": ".link",
  ".kpi-trend-icon": ".kpi-trend",
  ".accordion-chevron": ".accordion-title",
  ".toast-anchored-icon": ".toast-anchored > span:last-child",
  ".toc-label-icon": ".toc-label",
  ".spinner": ".spinner-texto",
};

test("no alto contraste, cada glifo tem a cor do texto ao lado", async ({page: p}) => {
  await montar(p);
  await altoContraste(p);
  const cores = await p.evaluate((pares) => pares.map(([glifo, texto]) => ({
    glifo,
    tinta: getComputedStyle(document.querySelector(glifo)!).backgroundColor,
    texto: getComputedStyle(document.querySelector(texto)!).color,
  })), Object.entries(TEXTO_AO_LADO));
  for (const c of cores) expect(c.tinta, c.glifo).toBe(c.texto);
});

// O VISTO DO CHECKBOX não é seletor que o `querySelector` alcança (é o `::after`): ele se mede aqui. Fica sobre a marca, e
// tem a cor do texto do rótulo ao lado. Provado contra o defeito (16/10/2026): sem a regra do alto contraste, sumia.
test("no alto contraste, o visto do Checkbox tem a cor do texto ao lado", async ({page: p}) => {
  await montar(p);
  await altoContraste(p);
  const m = await p.evaluate(() => ({
    visto: getComputedStyle(document.querySelector(".checkbox .control-mark")!, "::after").backgroundColor,
    texto: getComputedStyle(document.querySelector(".checkbox-texto")!).color,
  }));
  expect(m.visto).toBe(m.texto);
});

// A AMOSTRA DE COR NÃO É GLIFO SOBRE TEXTO: a cor É o conteúdo dela. Medido em 14/10/2026 com o alto contraste
// ligado: as amostras viravam círculos brancos de contorno preto, e o "visto" sumia (branco sobre branco) — e o teste
// de "tinta" de baixo PASSAVA, porque o contorno preto conta como tinta. Aqui se mede o que importa: a cor e a tinta
// do visto continuam as delas (`forced-color-adjust:none`, como a área e a trilha de cor).
test("no alto contraste, a amostra de cor continua com a cor, e o visto com a tinta dele", async ({page: p}) => {
  await montar(p);
  await altoContraste(p);
  const m = await p.evaluate(() => {
    const o = document.querySelector(".color-swatch-option")!;
    return {cor: getComputedStyle(o.querySelector(".color-swatch")!).backgroundColor,
      visto: getComputedStyle(o, "::after").backgroundColor};
  });
  expect(m.cor, "a amostra mantém a cor dela").toBe("rgb(4, 133, 247)");
  expect(m.visto, "o visto mantém a tinta que contrasta com a cor").toBe("rgb(0, 0, 0)");
});

for (const modo of ["normal", "alto contraste"] as const) {
  test(`cada glifo por máscara aparece no modo ${modo}`, async ({page: p}) => {
    await montar(p);
    if (modo === "alto contraste") await altoContraste(p);
    const glifos = p.locator("[data-glifo]");
    expect(await glifos.count()).toBe(Object.keys(GLIFOS).length);
    const medido: Record<string, number> = {};
    for (let i = 0; i < Object.keys(GLIFOS).length; i++) {
      const g = glifos.nth(i);
      medido[(await g.getAttribute("class"))!.split(" ")[0]] = await tinta(p, g);
    }
    for (const [glifo, pontos] of Object.entries(medido)) expect(pontos, `${glifo}: ${JSON.stringify(medido)}`).toBeGreaterThan(10);
  });
}
