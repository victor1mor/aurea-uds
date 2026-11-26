import {test, expect} from "@playwright/test";

// O CANTO CONTÍNUO NA WEB (HER-01, lote 106, 26/11/2026 — a forma "do tamanho do iPhone", aprovada na bancada viva). Com a
// folha publicada, no navegador: onde o `corner-shape` é desenhado, o cartão, a janela e a folha de baixo ganham o canto
// contínuo (`superellipse(1.65)`) com o raio 1,5 × o token; a cápsula e o círculo ficam redondos, com o raio de sempre.
// Onde o navegador não desenha, nada muda — o canto redondo e o raio do token.
// Provado contra o defeito: com a folha de antes (sem as cópias de `scripts/canto-continuo.mjs`), o cartão sai `round`
// com 22 e o teste reprova.
const ALVOS: Array<[string, string, string]> = [
  ["cartão", `<div class="card">Cartão</div>`, ".card"],
  ["botão (cápsula)", `<button class="btn btn-primary">Salvar</button>`, ".btn"],
  ["campo (cápsula)", `<input class="input" aria-label="Nome">`, ".input"],
];

test("o cartão ganha o canto contínuo, e a cápsula fica redonda", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__canto-continuo`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body>${ALVOS.map(([nome, html]) => `<div data-nome="${nome}">${html}</div>`).join("")}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const desenha = await p.evaluate(() => CSS.supports("corner-shape", "superellipse(2)"));
  const medidas = await p.$$eval("[data-nome]", (caixas) => caixas.map((c) => {
    const el = c.firstElementChild as HTMLElement;
    const cs = getComputedStyle(el) as CSSStyleDeclaration & {cornerShape?: string};
    return {nome: (c as HTMLElement).dataset.nome!, forma: cs.cornerShape ?? "", raio: cs.borderTopLeftRadius};
  }));
  const card = medidas.find((m) => m.nome === "cartão")!;
  if (desenha) {
    expect(card.forma).toBe("superellipse(1.65)");
    expect(card.raio).toBe("33px");
    for (const m of medidas.filter((m) => m.nome !== "cartão")) {
      expect(m.forma, m.nome).toMatch(/^(round|superellipse\(1\))$/);
      expect(m.raio, m.nome).toBe("999px");
    }
  } else {
    // Sem o desenho, nada muda: o raio do token.
    expect(card.raio).toBe("22px");
  }
});
