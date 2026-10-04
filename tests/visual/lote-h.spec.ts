import {test, expect, type Page} from "@playwright/test";

// LOTE H · AN-02, AN-05 e AN-06 medidos montados — 04/10/2026.
//
// O que o jsdom não prova, porque não tem leiaute: a conversa abre no fim, NÃO PULA quando entram
// antigas em cima ou saem recentes embaixo, acompanha a que chega; a galeria carrega ao chegar no
// fim; a árvore carrega ao abrir; e a seta da árvore vira na escrita da direita para a esquerda.
//
// O banco é `apps/keyboard-probe/lote-h.html`, construído pelo `pnpm build`, contra um "servidor"
// de mentira (5.000 mensagens). `?rapido` tira as esperas de rede. O contêiner da conversa tem a
// âncora do navegador DESLIGADA (`overflow-anchor: none`): com ela, o Chromium seguraria a posição
// sozinho e este teste passaria mesmo sem a conta da Aurea.
//
// O código de antes reprova tudo menos a árvore sem carga: a lista não avisava nas pontas, a
// galeria não tinha linha de fim, e a árvore não abria nó sem filhos.
const APP = process.env.AUREA_LOTE_H ?? "/apps/keyboard-probe/out/lote-h.html";

async function abrir(p: Page, extra = "") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.setViewportSize({width: 900, height: 900});
  await p.goto(`${APP}?rapido${extra}`, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
  return erros;
}
const janela = (p: Page) => p.evaluate(() => JSON.parse(document.getElementById("janela")!.textContent!) as {naTela: number; primeira: number; ultima: number; servidor: number});
// A primeira mensagem que começa dentro do contêiner, com a posição dela — o que tem de ficar parado.
const doAlto = (p: Page) => p.evaluate(() => {
  const sc = document.getElementById("rolador")!, topo = sc.getBoundingClientRect().top;
  for (const m of Array.from(sc.querySelectorAll<HTMLElement>("[data-message-id]"))) {
    const r = m.getBoundingClientRect();
    if (r.top >= topo) return {id: m.dataset.messageId!, top: r.top};
  }
  return null;
});
const topoDe = (p: Page, id: string) => p.evaluate((i) => document.querySelector(`[data-message-id="${i}"]`)!.getBoundingClientRect().top, id);
const noFim = (p: Page) => p.evaluate(() => { const sc = document.getElementById("rolador")!; return sc.scrollHeight - sc.scrollTop - sc.clientHeight; });

test("AN-02 · a conversa abre no fim e carrega as antigas sem pular", async ({page: p}) => {
  const erros = await abrir(p);
  expect(await noFim(p), "abre na última mensagem").toBeLessThanOrEqual(1);
  expect((await janela(p)).naTela).toBe(60);

  // Rola até o alto: a linha de cima entra na tela e pede as antigas.
  await p.evaluate(() => { document.getElementById("rolador")!.scrollTop = 0; });
  const alvo = (await doAlto(p))!;
  await expect.poll(async () => (await janela(p)).primeira).toBeLessThan(4940);
  await p.waitForTimeout(100);
  expect(Math.abs((await topoDe(p, alvo.id)) - alvo.top), `a ${alvo.id} ficou onde estava`).toBeLessThanOrEqual(1);
  expect(erros).toEqual([]);
});

test("AN-02 · a janela não passa de 200, e trazer as recentes de volta também não pula", async ({page: p}) => {
  await abrir(p);
  // Sobe até a janela encher e começar a soltar as recentes.
  for (let k = 0; k < 8; k++) {
    await p.evaluate(() => { document.getElementById("rolador")!.scrollTop = 0; });
    await p.waitForTimeout(120);
  }
  const j = await janela(p);
  expect(j.naTela).toBe(200);
  expect(j.ultima, "as recentes saíram da página").toBeLessThan(4999);
  await expect(p.locator("#rolador .message-more")).toHaveCount(2);

  // Desce até o fim: entram as recentes embaixo e saem as antigas EM CIMA — a do alto não pode pular.
  await p.evaluate(() => { const sc = document.getElementById("rolador")!; sc.scrollTop = sc.scrollHeight; });
  const alvo = (await doAlto(p))!;
  await expect.poll(async () => (await janela(p)).ultima).toBeGreaterThan(j.ultima);
  await p.waitForTimeout(100);
  expect((await janela(p)).naTela).toBe(200);
  expect(Math.abs((await topoDe(p, alvo.id)) - alvo.top), `a ${alvo.id} ficou onde estava`).toBeLessThanOrEqual(1);
});

test("AN-02 · quem está no fim acompanha a que chega; quem subiu, não", async ({page: p}) => {
  await abrir(p);
  await p.getByRole("button", {name: "Receber mensagem"}).click();
  await expect(p.locator('[data-message-id="m5000"]')).toBeVisible();
  expect(await noFim(p)).toBeLessThanOrEqual(1);
  await expect(p.getByRole("status").filter({hasText: "Chegou agora."})).toHaveCount(1);

  // Sobe um pouco (sem chegar ao alto) e recebe outra: a tela não se mexe.
  await p.evaluate(() => { document.getElementById("rolador")!.scrollTop -= 600; });
  await p.waitForTimeout(50);
  const alvo = (await doAlto(p))!;
  await p.getByRole("button", {name: "Receber mensagem"}).click();
  await expect(p.locator('[data-message-id="m5001"]')).toHaveCount(1);
  expect(Math.abs((await topoDe(p, alvo.id)) - alvo.top)).toBeLessThanOrEqual(1);
  expect(await noFim(p)).toBeGreaterThan(100);
});

test("AN-03 · responder e editar pela faixa acima do campo, e Esc cancela", async ({page: p}) => {
  await abrir(p);
  await p.getByRole("button", {name: "Responder à última"}).click();
  const campo = p.getByRole("textbox", {name: "Mensagem"});
  await expect(campo).toBeFocused();
  await expect(p.locator(".message-composer-context .message-quote")).toContainText("Respondendo a");
  await campo.press("Escape");
  await expect(p.locator(".message-composer-context")).toHaveCount(0);
  await p.getByRole("button", {name: "Editar a minha última"}).click();
  await expect(campo).toHaveValue("#4999 · Sim, está na pasta de sempre.");
  await campo.fill("Corrigido");
  await campo.press("Enter");
  await expect(p.locator('[data-message-id="m4999"]')).toContainText("Corrigido");
  await expect(p.locator('[data-message-id="m4999"] .label')).toContainText("editada");
});

test("AN-05 · a galeria carrega ao chegar no fim, escolhe em lote e diz 'Vídeo' no nome do ladrilho", async ({page: p}) => {
  await abrir(p, "&aba=galeria");
  await expect(p.locator("#carregados")).toHaveText("60 de 2000 carregados");
  await p.locator(".gallery-more").scrollIntoViewIfNeeded();
  await expect(p.locator("#carregados")).toHaveText("120 de 2000 carregados");
  // O nome que o Chromium calcula, com os espaços do texto escondido.
  await expect(p.getByRole("button", {name: "Item 2 Vídeo, 0:32", exact: true})).toHaveCount(1);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.getByRole("button", {name: "Escolher várias"}).click();
  await p.getByRole("button", {name: "Selecionar visíveis"}).click();
  await expect(p.locator("#escolhidas")).toHaveText("120 escolhida(s)");
  await expect(p.locator('.gallery-tile[aria-pressed="true"]')).toHaveCount(120);
});

test("AN-06 · a árvore carrega ao abrir, volta a fechar se falhar, e o escolhido vem de fora", async ({page: p}) => {
  await abrir(p, "&aba=arvore");
  const projetos = p.getByRole("treeitem", {name: "Projetos", exact: true});
  await p.getByText("Projetos", {exact: true}).click();
  await expect(p.getByRole("treeitem", {name: "Projetos · 1"})).toBeVisible();
  await expect(projetos).toHaveAttribute("aria-expanded", "true");
  await expect(projetos).not.toHaveAttribute("aria-busy");
  await expect(p.locator("#destino")).toHaveText("Destino escolhido: projetos");
  await expect(projetos).toHaveAttribute("aria-selected", "true");
  // O escolhido é CÁPSULA, a regra da casa (o Victor, olhando a bancada em 04/10/2026): o raio é
  // pelo menos a metade da altura. Antes era 8.
  const linha = await projetos.locator(":scope > .tree-node").evaluate((e) => ({raio: parseFloat(getComputedStyle(e).borderTopLeftRadius), alto: e.getBoundingClientRect().height}));
  expect(linha.raio, `raio ${linha.raio} para ${linha.alto} de altura`).toBeGreaterThanOrEqual(linha.alto / 2);

  const instavel = p.getByRole("treeitem", {name: /Pasta instável/});
  await p.getByText(/Pasta instável/).click();
  await expect(instavel).toHaveAttribute("aria-expanded", "false");
  await p.getByText(/Pasta instável/).click();
  await expect(p.getByRole("treeitem", {name: /Pasta instável.* · 1/})).toBeVisible();
});

test("AN-06 · a seta fechada vira na escrita da direita para a esquerda, e aberta aponta para baixo", async ({page: p}) => {
  await abrir(p, "&aba=arvore&dir=rtl");
  const giro = (nome: string) => p.getByRole("treeitem", {name: nome, exact: true}).locator(":scope > .tree-node > .tree-twist").evaluate((e) => getComputedStyle(e).rotate);
  expect(await giro("Recebidos")).toBe("180deg");
  await p.getByText("Projetos", {exact: true}).click();
  await expect(p.getByRole("treeitem", {name: "Projetos · 1"})).toBeVisible();
  expect(await giro("Projetos")).toBe("90deg");
});
