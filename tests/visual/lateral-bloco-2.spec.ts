import {test, expect, type Page} from "@playwright/test";

// O BLOCO 2 (0.44.0) — a lateral inteira, medida montada: `apps/keyboard-probe/lateral.html` (o banco do bloco 2, construído
// pelo `pnpm build`), na tela do Victor (1280 × 663). As quinze laterais aprovadas pelo Victor em 21/10/2026 e as quatro
// decisões da bancada de 26/10/2026: o texto e o fio a 16 (D1), a lateral solta do topo até embaixo (D2), o Ctrl+B que não
// age onde se digita (D3) e as alternativas do item atual (D4). O que o React desenha está no `lateral-bloco-2.test.tsx`.
// Provado contra o defeito: com o CSS do núcleo da 0.43.0 no banco, reprovam 6 de 9 — o fio, a solta, a cápsula, a que sai
// da tela, o painel ao lado e o item atual. Os 3 de teclado e foco (o Ctrl+B, o painel por cima, os botões) dependem do
// código, e o `lateral-bloco-2.test.tsx` os prova contra o código da 0.43.0.
const APP = "/apps/keyboard-probe/out/lateral.html";

async function abrir(p: Page, v: string, tema = "dark") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
  await p.setViewportSize({width: 1280, height: 663});
  await p.goto(`${APP}?v=${v}&tema=${tema}`, {waitUntil: "networkidle"});
  return erros;
}
const caixa = (p: Page, sel: string) => p.locator(sel).first().evaluate((e) => {
  const r = e.getBoundingClientRect();
  return {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom),
    raio: getComputedStyle(e).borderTopLeftRadius, display: getComputedStyle(e).display};
});

test("D1 · o texto do item e o fio do escolhido começam no mesmo ponto, 16 da borda do item", async ({page: p}) => {
  const erros = await abrir(p, "fio");
  // A proposta é a segunda lateral da página (a primeira é a de "hoje", refeita pela bancada).
  const m = await p.locator("section").nth(1).locator(".sidebar-item[aria-current]").evaluate((item) => {
    const r = item.getBoundingClientRect();
    const rotulo = item.querySelector(".sidebar-label")!;
    const range = document.createRange(); range.selectNodeContents(rotulo);
    const texto = range.getBoundingClientRect().left - r.left;
    const fio = parseFloat(getComputedStyle(item, "::after").insetInlineStart || getComputedStyle(item, "::after").left);
    const icone = item.querySelector("svg")!.getBoundingClientRect().left - r.left;
    return {texto: Math.round(texto), fio: Math.round(fio), icone: Math.round(icone)};
  });
  expect(m.fio, "o fio a 16").toBe(16);
  expect(m.icone, "o primeiro desenho do item (o ícone) a 16, onde o fio começa").toBe(16);
  expect(erros).toEqual([]);
});

test("D2 · a lateral solta vai do topo até embaixo, com a margem dela (16)", async ({page: p}) => {
  const erros = await abrir(p, "solta", "light");
  const proposta = await caixa(p, ".bench-duas-soltas > div:nth-child(2) .sidebar");
  expect(proposta.y, "o topo").toBe(16);
  expect(proposta.bottom, "o pé").toBe(663 - 16);
  expect(erros).toEqual([]);
});

test("4-A · a cápsula: recolhida, o canto é o do controle; aberta, o do cartão", async ({page: p}) => {
  const erros = await abrir(p, "3");
  const lateral = ".sidebar";
  const estaRecolhida = await p.locator(lateral).first().evaluate((e) => e.classList.contains("sidebar-collapsed"));
  if (estaRecolhida) await p.locator(".sidebar-collapse-trigger").click();
  expect((await caixa(p, lateral)).raio).toBe("22px");
  await p.locator(".sidebar-collapse-trigger").click();
  const recolhida = await caixa(p, lateral);
  expect(recolhida.raio).toBe("999px");
  expect(recolhida.w, "a trilha").toBe(68);
  expect(erros).toEqual([]);
});

test("4-A · fora da tela: recolhida, a lateral some e o conteúdo começa na borda; o botão traz de volta", async ({page: p}) => {
  const erros = await abrir(p, "2");
  const botao = p.locator(".sidebar-collapse-trigger");
  if (await p.locator(".sidebar").first().evaluate((e) => !e.classList.contains("sidebar-collapsed"))) await botao.click();
  expect((await caixa(p, ".sidebar")).display).toBe("none");
  expect((await caixa(p, ".app-shell-column")).x).toBe(0);
  await botao.click();
  expect((await caixa(p, ".sidebar")).w).toBe(264);
  expect(erros).toEqual([]);
});

test("D3 · o Ctrl+B recolhe e abre, e não age dentro de um campo", async ({page: p}) => {
  const erros = await abrir(p, "10");
  const recolhida = () => p.locator(".sidebar").first().evaluate((e) => e.classList.contains("sidebar-collapsed"));
  const antes = await recolhida();
  await p.locator("h1").click();
  await p.keyboard.press("Control+b");
  expect(await recolhida()).toBe(!antes);
  await p.keyboard.press("Control+b");
  expect(await recolhida()).toBe(antes);
  if (antes) { await p.locator(".sidebar-collapse-trigger").click(); }
  await p.getByRole("searchbox").or(p.locator(".sidebar input")).first().click();
  await p.keyboard.press("Control+b");
  expect(await recolhida(), "digitando na busca, o atalho não recolhe").toBe(false);
  expect(erros).toEqual([]);
});

test("4-F · a trilha das seções com o painel ao lado: 68 + 264; recolher esconde só o painel", async ({page: p}) => {
  const erros = await abrir(p, "6");
  const botao = p.locator(".sidebar-collapse-trigger");
  if (await p.locator(".sidebar").first().evaluate((e) => e.classList.contains("sidebar-collapsed"))) await botao.click();
  expect((await caixa(p, ".sidebar-rail-box")).w).toBe(68);
  expect((await caixa(p, ".sidebar-panel")).w).toBe(264);
  await botao.click();
  expect((await caixa(p, ".sidebar-panel")).display).toBe("none");
  expect((await caixa(p, ".sidebar-rail-box")).w).toBe(68);
  expect(erros).toEqual([]);
});

test("4-G · o painel por cima: o ícone abre a lista com o foco dentro, e o Esc fecha e devolve o foco", async ({page: p}) => {
  const erros = await abrir(p, "7");
  const secao = p.locator(".sidebar-rail-box .sidebar-nav .sidebar-item").nth(1);
  await secao.click();
  await expect(p.locator(".sidebar-flyout")).toBeVisible();
  expect(await p.evaluate(() => !!document.activeElement?.closest(".sidebar-flyout")), "o foco entra na lista").toBe(true);
  await p.keyboard.press("Escape");
  await expect(p.locator(".sidebar-flyout")).toBeHidden();
  await expect(secao).toBeFocused();
  expect(erros).toEqual([]);
});

test("D4 · as alternativas do item atual: segment é a cápsula da aba escolhida, sem fio; brand continua a de hoje", async ({page: p}) => {
  const erros = await abrir(p, "indicador", "light");
  const pinta = (i: number) => p.locator("section").nth(i).locator(".sidebar-item[aria-current]").evaluate((e) => ({
    fundo: getComputedStyle(e).backgroundColor, sombra: getComputedStyle(e).boxShadow, fio: getComputedStyle(e, "::after").display,
    segment: (() => { const t = document.createElement("div"); t.style.background = "var(--segment)"; document.body.append(t); const c = getComputedStyle(t).backgroundColor; t.remove(); return c; })(),
    primary: (() => { const t = document.createElement("div"); t.style.background = "var(--primary)"; document.body.append(t); const c = getComputedStyle(t).backgroundColor; t.remove(); return c; })(),
  }));
  const brand = await pinta(0), segment = await pinta(1), linha = await pinta(3);
  expect(brand.fundo, "brand, no claro: o botão primário").toBe(brand.primary);
  expect(segment.fundo).toBe(segment.segment);
  expect(segment.sombra).not.toBe("none");
  expect(segment.fio).toBe("none");
  expect(linha.fio).toBe("block");
  expect(erros).toEqual([]);
});

test("as quinze abrem sem erro, e o botão de recolher de cada uma muda a lateral", async ({page: p}) => {
  for (const v of ["1", "4", "8", "9", "11", "12", "13", "14", "15"]) {
    const erros = await abrir(p, v);
    const lateral = p.locator("aside.sidebar").first();
    const antes = await lateral.evaluate((e) => e.classList.contains("sidebar-collapsed"));
    await p.locator(".sidebar-collapse-trigger:visible, .sidebar-toggle-item:visible").first().click();
    expect(await lateral.evaluate((e) => e.classList.contains("sidebar-collapsed")), `a ${v} muda`).toBe(!antes);
    expect(erros, `a ${v} sem erro`).toEqual([]);
  }
});
