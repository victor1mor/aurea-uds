import {test, expect, type Page} from "@playwright/test";

// O LOTE 117 (27/11/2026), quatro peças da web que o Victor aprovou olhando a bancada da AUD-1:
//   · a barra de menus ("Aprovo a barra"): o gatilho ABERTO com o fundo do passar o mouse e a letra do texto (era o amarelo,
//     ou o laranja da Ember, como letra no claro); o DESATIVADO apagado, com o cursor de proibido e sem fundo no mouse;
//   · a área de soltar arquivo ("Aprovo a área"): o ícone apagado parado; arrastando, o fundo na cor da marca a 16% e o
//     ícone na cor do texto;
//   · o carrossel ("aprovo todos", a forma da direita): as setas nos lados da foto, no meio da altura dela, os pontos
//     embaixo;
//   · a conversa: o botão redondo "ir para a última", só quando a última mensagem saiu da caixa que rola.
// Provado contra o defeito: com a folha da 0.83.0 e o pacote de antes, cada um dos quatro testes reprova.

async function pagina(page: Page, baseURL: string | undefined, nome: string, corpo: string, marca = "") {
  const url = `${baseURL}/__lote117-${nome}-${marca || "gold"}`;
  await page.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head>
      <link rel="stylesheet" href="/apps/catalog/assets/catalog.css"></head><body style="padding:24px">${corpo}
      <i id="cor-texto" style="color:var(--foreground)"></i><i id="cor-apagada" style="color:var(--muted-foreground)"></i>
      <i id="fundo-mouse" style="background:var(--surface-hover)"></i>
      <i id="fundo-marca" style="background:color-mix(in oklab, var(--primary) 16%, transparent)"></i></body></html>`}));
  await page.goto(url, {waitUntil: "networkidle"});
  // Sem as transições, a cor lida é a final.
  await page.addStyleTag({content: "*,*::before,*::after{transition:none !important}"});
}
const cor = (page: Page, sel: string, prop: "color" | "backgroundColor" = "color") =>
  page.locator(sel).first().evaluate((e, p) => getComputedStyle(e)[p as "color"], prop);

for (const marca of ["", "ember"]) {
  test(`a barra de menus: o aberto e o desativado (${marca || "gold"})`, async ({page, baseURL}) => {
    await pagina(page, baseURL, "menubar", `<div class="menubar" role="menubar">
      <button class="menubar-trigger" data-popup-open type="button">File</button>
      <button class="menubar-trigger" type="button">Edit</button>
      <button class="menubar-trigger" data-disabled aria-disabled="true" type="button">View</button></div>`, marca);
    expect(await cor(page, ".menubar-trigger[data-popup-open]")).toBe(await cor(page, "#cor-texto"));
    expect(await cor(page, ".menubar-trigger[data-popup-open]", "backgroundColor")).toBe(await cor(page, "#fundo-mouse", "backgroundColor"));
    const desativado = page.locator(".menubar-trigger[data-disabled]");
    expect(await desativado.evaluate((e) => [getComputedStyle(e).opacity, getComputedStyle(e).cursor])).toEqual(
      [await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--opacity-disabled").trim()), "not-allowed"]);
    await desativado.hover();
    expect(await cor(page, ".menubar-trigger[data-disabled]", "backgroundColor")).toBe("rgba(0, 0, 0, 0)");
  });

  test(`a área de soltar: o ícone apagado, e arrastando a cor da marca (${marca || "gold"})`, async ({page, baseURL}) => {
    const area = (arrastando: boolean) => `<label class="dropzone"${arrastando ? ' data-dragging="true"' : ""}>
      <svg class="icon dropzone-icon" aria-hidden="true"></svg><strong>Drop files</strong></label>`;
    await pagina(page, baseURL, "dropzone", `<div id="parada">${area(false)}</div><div id="arrastando">${area(true)}</div>`, marca);
    expect(await cor(page, "#parada .dropzone-icon")).toBe(await cor(page, "#cor-apagada"));
    expect(await cor(page, "#arrastando .dropzone-icon")).toBe(await cor(page, "#cor-texto"));
    expect(await cor(page, "#arrastando .dropzone", "backgroundColor")).toBe(await cor(page, "#fundo-marca", "backgroundColor"));
  });
}

test("o carrossel: as setas nos lados da foto, no meio da altura dela", async ({page, baseURL}) => {
  const seta = (lado: string) => `<button type="button" class="btn btn-ghost btn-sm btn-icon" aria-label="${lado}"><svg class="icon"></svg></button>`;
  const carrossel = (pontos: boolean) => `<div class="carousel" style="width:480px"><div class="carousel-track" tabindex="0">
      <div class="carousel-slide"><div style="block-size:200px;background:var(--fill-2)">1</div></div>
      <div class="carousel-slide"><div style="block-size:200px">2</div></div></div>
    <div class="carousel-controls">${seta("Previous")}${pontos ? `<div class="carousel-dots"><button type="button" class="carousel-dot" aria-current="true"></button><button type="button" class="carousel-dot"></button></div>` : ""}${seta("Next")}</div></div>`;
  await pagina(page, baseURL, "carousel", `<div id="com">${carrossel(true)}</div><div id="sem" style="margin-top:24px">${carrossel(false)}</div>`);
  for (const id of ["#com", "#sem"]) {
    const m = await page.locator(id).evaluate((c) => {
      const r = (s: string) => c.querySelector(s)!.getBoundingClientRect();
      const [ant, prox] = [...c.querySelectorAll(".carousel-controls > .btn")].map((b) => b.getBoundingClientRect());
      return {trilho: r(".carousel-track"), ant, prox, pontos: c.querySelector(".carousel-dots")?.getBoundingClientRect() ?? null};
    });
    const meio = m.trilho.top + m.trilho.height / 2;
    // A anterior à esquerda da foto, a próxima à direita, as duas no meio da altura dela.
    expect(m.ant.right, id).toBeLessThanOrEqual(m.trilho.left);
    expect(m.prox.left, id).toBeGreaterThanOrEqual(m.trilho.right);
    for (const b of [m.ant, m.prox]) expect(Math.abs(b.top + b.height / 2 - meio), id).toBeLessThanOrEqual(1);
    // Os pontos continuam embaixo da foto.
    if (m.pontos) expect(m.pontos.top).toBeGreaterThanOrEqual(m.trilho.bottom);
  }
});

test("a conversa: o botão ir para a última aparece quando a última sai da caixa", async ({page}) => {
  await page.goto("/apps/catalog/messagelist.html", {waitUntil: "networkidle"});
  await page.locator("details", {has: page.locator("summary", {hasText: "In a scrolling box"})}).evaluate((d) => { (d as HTMLDetailsElement).open = true; });
  const caixa = page.locator('[data-exemplo="conversa-rola"]');
  await caixa.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-ligada="sim"]', {has: caixa})).toBeAttached({timeout: 15000});
  const botao = caixa.getByRole("button", {name: "Go to the latest message"});
  // No começo a caixa mostra o topo, e a última está fora dela, embaixo: o botão aparece.
  await caixa.evaluate((c) => { c.scrollTop = 0; });
  await expect(botao).toBeVisible();
  // Ele não ocupa lugar: a caixa dele tem altura zero.
  expect(await botao.evaluate((b) => b.parentElement!.getBoundingClientRect().height)).toBe(0);
  await botao.click();
  await expect.poll(() => caixa.evaluate((c) => c.scrollHeight - c.clientHeight - c.scrollTop), {timeout: 5000}).toBeLessThanOrEqual(1);
  await expect(botao).toHaveCount(0);
});
