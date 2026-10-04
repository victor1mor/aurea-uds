import {test, expect, type Page} from "@playwright/test";

// AN-01 · o botão de recolher a lateral, e a trilha sozinha em tela média — 03/10/2026.
//
// Um consumidor viu numa janela de 1508 × 757: a lateral sempre aberta, sem botão, e diminuir a
// janela não a recolhia (só virava gaveta abaixo de 1024). O Victor marcou o lugar do botão: no
// alto, na junção do menu com o conteúdo. A referência de comportamento é a `Sidebar` do shadcn que
// o ReUI usa no `c-sidebar-2` (o HeroUI não tem moldura de app).
//
// O shell tem estado e efeito, então se mede montado de verdade: `apps/keyboard-probe/shell.html`,
// construído pelo `pnpm build`. O código de antes reprova tudo: não havia botão.
const APP = "/apps/keyboard-probe/out/shell.html";

async function abrir(p: Page, largura: number, extra = "") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: largura, height: 757});
  await p.goto(APP + extra, {waitUntil: "networkidle"});
  return erros;
}
const estado = (p: Page) => p.evaluate(() => {
  const b = (s: string) => document.querySelector(s)!.getBoundingClientRect();
  const botao = document.querySelector(".sidebar-toggle")!, lateral = document.querySelector(".sidebar")!;
  const t = b(".sidebar-toggle"), l = b(".sidebar"), c = b(".content"), item = b(".sidebar-item");
  return {
    recolhida: lateral.classList.contains("sidebar-collapsed"), lateral: Math.round(l.width),
    expandido: botao.getAttribute("aria-expanded"), rotulo: botao.getAttribute("aria-label"),
    controla: botao.getAttribute("aria-controls") === lateral.id,
    // A junção: o meio do vão entre o fim da lateral e o começo do conteúdo.
    centroX: t.left + t.width / 2, juncao: (Math.min(l.right, c.left) + c.left) / 2,
    centroY: t.top + t.height / 2, primeiroItem: item.top + item.height / 2,
    juncaoRtl: (Math.max(l.left, c.right) + c.right) / 2,
    avisos: JSON.parse(document.getElementById("avisos")!.textContent!),
  };
});

for (const [nome, extra] of [["flutuante", ""], ["lateral rente", "?lateral=flush"], ["topo rente", "?topo=flush"]] as const) {
  test(`AN-01 · ${nome}: o botão fica no alto da junção, aberta e recolhida, e gruda quando a página rola`, async ({page: p}) => {
    const erros = await abrir(p, 1508, extra);
    for (const passo of ["aberta", "recolhida", "rolada"]) {
      if (passo === "recolhida") await p.click(".sidebar-toggle");
      if (passo === "rolada") { await p.mouse.wheel(0, 600); await p.waitForFunction(() => scrollY > 0); }
      const e = await estado(p);
      expect(Math.abs(e.centroX - e.juncao), `${passo}: ${JSON.stringify(e)}`).toBeLessThanOrEqual(1);
      expect(Math.abs(e.centroY - e.primeiroItem), `${passo}: ${JSON.stringify(e)}`).toBeLessThanOrEqual(0.5);
    }
    expect(erros).toEqual([]);
  });
}

test("AN-01 · o botão recolhe e abre, diz o que faz, e avisa o app", async ({page: p}) => {
  await abrir(p, 1508);
  let e = await estado(p);
  expect([e.recolhida, e.expandido, e.rotulo, e.controla]).toEqual([false, "true", "Collapse sidebar", true]);
  const aberta = e.lateral;
  // Pelo teclado: o botão vem antes da lista na ordem do Tab, e o foco fica nele depois.
  await p.focus(".sidebar-toggle");
  await p.keyboard.press("Enter");
  e = await estado(p);
  expect([e.recolhida, e.expandido, e.rotulo, e.avisos]).toEqual([true, "false", "Expand sidebar", [true]]);
  expect(e.lateral).toBeLessThan(aberta);
  expect(await p.evaluate(() => document.activeElement?.classList.contains("sidebar-toggle"))).toBe(true);
  await p.keyboard.press("Enter");
  e = await estado(p);
  expect([e.recolhida, e.avisos, e.lateral]).toEqual([false, [true, false], aberta]);
  // A dica: quem usa o mouse lê o que o botão faz.
  await p.hover(".sidebar-toggle");
  await expect(p.getByRole("tooltip")).toHaveText("Collapse sidebar");
});

test("AN-01 · entre 1024 e 1279 a lateral é trilha sozinha; a escolha vale até a janela cruzar 1280", async ({page: p}) => {
  await abrir(p, 1100);
  expect((await estado(p)).recolhida, "em tela média ela já abre como trilha").toBe(true);
  await p.click(".sidebar-toggle");
  expect((await estado(p)).recolhida, "a pessoa abriu").toBe(false);
  await p.setViewportSize({width: 1508, height: 757});
  // Espera o AVISO, e não só o estado: aberta ela já estava, e encolher de novo antes de o navegador
  // contar o cruzamento faria as duas trocas caberem num quadro só, sem cruzamento nenhum.
  await expect.poll(async () => (await estado(p)).avisos).toEqual([false, false]);
  await p.setViewportSize({width: 1100, height: 757});
  // Cruzou 1280 duas vezes: a escolha saiu, e a largura voltou a mandar.
  await expect.poll(async () => (await estado(p)).recolhida).toBe(true);
  expect((await estado(p)).avisos).toEqual([false, false, true]);
});

test("AN-01 · na gaveta a lateral nunca é trilha, e o botão sai", async ({page: p}) => {
  await abrir(p, 1508);
  await p.click(".sidebar-toggle");
  await p.setViewportSize({width: 800, height: 757});
  await expect.poll(() => p.evaluate(() => document.querySelector(".sidebar")!.classList.contains("sidebar-collapsed"))).toBe(false);
  await expect(p.locator(".sidebar-toggle")).toBeHidden();
  await p.click(".nav-toggle");
  // A gaveta aberta mostra o nome do item, e não um ícone mudo.
  await expect(p.locator(".sidebar-item .sidebar-label").first()).toBeVisible();
});

test("AN-01 · controlado: o botão pede, o app decide", async ({page: p}) => {
  await abrir(p, 1508, "?controlado");
  await p.click(".sidebar-toggle");
  const e = await estado(p);
  expect([e.recolhida, e.avisos]).toEqual([true, [true]]);
});

test("AN-01 · começa recolhida sem controlar (`defaultSidebarCollapsed`)", async ({page: p}) => {
  await abrir(p, 1508, "?inicio=recolhida");
  expect((await estado(p)).recolhida).toBe(true);
});

test("AN-01 · da direita para a esquerda o botão fica na junção do outro lado", async ({page: p}) => {
  await abrir(p, 1508, "?dir=rtl");
  for (const passo of ["aberta", "recolhida"]) {
    if (passo === "recolhida") await p.click(".sidebar-toggle");
    const e = await estado(p);
    expect(Math.abs(e.centroX - e.juncaoRtl), `${passo}: ${JSON.stringify(e)}`).toBeLessThanOrEqual(1);
  }
});
