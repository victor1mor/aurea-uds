import {test, expect} from "@playwright/test";

// ADR-0076 (20/10/2026). Com a letra de destaque do claro virando o azul, o item atual da lateral saiu azul; o Victor,
// olhando a bancada: "não quero ele azul, não pode ser na cor do botão?". No claro da Aurea padrão, o item atual é o
// botão primário — o fundo amarelo e a letra cinza-escura (8,13:1) —, sem o fio de baixo. A `lory` e o escuro não mudam.
//
// Medido no navegador, com a folha publicada e a marcação que a `Sidebar` emite (o selo de contagem dentro do item atual,
// como no exemplo dela). Provado contra o defeito: sem a regra, o item atual do claro sai com a letra azul e o fundo
// cinza, e reprova; sem trocar o destaque de DENTRO do item, o selo "12" sai azul sobre amarelo (3,49:1), e reprova.
const ITEM = `<nav class="sidebar-nav" aria-label="Menu"><ul class="sidebar-list">
  <li><a class="sidebar-item" href="#x"><span class="sidebar-label">Visão geral</span></a></li>
  <li><a class="sidebar-item" href="#x" aria-current="page"><span class="sidebar-label">Relatórios</span><span class="badge badge-primary">12</span></a></li>
</ul></nav>`;

async function medir(page: import("@playwright/test").Page, baseURL: string | undefined, tema: string, marca: string) {
  const url = `${baseURL}/__item-atual-${tema}-${marca || "aurea"}`;
  await page.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="${tema}"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${ITEM}</body></html>`}));
  await page.goto(url, {waitUntil: "networkidle"});
  return page.evaluate(() => {
    const a = document.querySelector(".sidebar-item[aria-current]")!;
    const sonda = (v: string) => { const s = document.createElement("span"); s.style.color = `var(${v})`; document.body.append(s);
      const c = getComputedStyle(s).color; s.remove(); return c; };
    const fundo = (v: string) => { const s = document.createElement("span"); s.style.backgroundColor = `var(${v})`; document.body.append(s);
      const c = getComputedStyle(s).backgroundColor; s.remove(); return c; };
    const cs = getComputedStyle(a);
    // A cor em sRGB pelo canvas: o navegador devolve `oklch(...)` para os tokens, e a conta de contraste é em sRGB.
    const rgb = (css: string) => { const c = document.createElement("canvas").getContext("2d")!; c.fillStyle = css;
      c.fillRect(0, 0, 1, 1); return Array.from(c.getImageData(0, 0, 1, 1).data.slice(0, 3)); };
    const lum = (v: number[]) => { const l = v.map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
    const razao = (x: string, y: string) => { const [p, q] = [lum(rgb(x)), lum(rgb(y))].sort((m, n) => n - m); return (p + 0.05) / (q + 0.05); };
    const selo = a.querySelector(".badge")!;
    return {fundo: cs.backgroundColor, letra: cs.color, fio: getComputedStyle(a, "::after").backgroundColor,
      selo: razao(getComputedStyle(selo).color, cs.backgroundColor),
      primario: fundo("--primary"), tinta: sonda("--primary-foreground"), destaque: sonda("--sidebar-primary")};
  });
}

test("no claro da Aurea, o item atual da lateral é o botão primário: fundo amarelo, letra cinza, sem fio", async ({page, baseURL}) => {
  const m = await medir(page, baseURL, "light", "");
  expect(m.fundo, "o fundo é o primário (o amarelo)").toBe(m.primario);
  expect(m.letra, "a letra é a do botão primário, e não a azul").toBe(m.tinta);
  expect(m.letra).not.toBe(m.destaque);
  expect(m.fio, "o fundo já marca o estado: o fio de baixo some").toBe("rgba(0, 0, 0, 0)");
  // O selo de contagem DENTRO do item atual escrevia com o azul sobre o amarelo (3,49:1) — o axe da varredura achou.
  expect(m.selo, "o selo primário dentro do item atual se lê sobre o amarelo").toBeGreaterThanOrEqual(4.5);
});

test("no escuro, e na lory, o item atual continua como era", async ({page, baseURL}) => {
  const escuro = await medir(page, baseURL, "dark", "");
  expect(escuro.letra, "no escuro, a letra de destaque da lateral").toBe(escuro.destaque);
  expect(escuro.fundo).not.toBe(escuro.primario);
  const lory = await medir(page, baseURL, "light", "lory");
  expect(lory.letra, "na lory do claro, a letra de destaque dela").toBe(lory.destaque);
  expect(lory.fundo).not.toBe(lory.primario);
});
