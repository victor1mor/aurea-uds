import {test, expect, type Page} from "@playwright/test";

// AS CORES, PASSO A (ADR-0083, 26/10/2026) — a paleta da 1.0, medida montada no banco da paleta
// (`apps/keyboard-probe/paleta.html`, construído pelo `pnpm build`). Cada peça leva `data-prova`; cada cor é comparada com a
// cor CALCULADA do token, no mesmo tema (uma caixa de prova pinta o token e o navegador diz a cor), e não com um número.
// Provado contra o defeito (27/10/2026): com o CSS do núcleo da 0.44.0 no banco, reprovam todos menos o primeiro — o
// escolhido marrom, o botão ligado com a letra marrom e o fio, o link sem sublinhado, o campo cinza no cartão, o foco
// grafite no campo, a linha do tempo por cima do ponto, a célula clara, as marcas marrons, e nada no "aumentar contraste".
const APP = "/apps/keyboard-probe/out/paleta.html";

async function abrir(p: Page, tema: "light" | "dark") {
  const erros: string[] = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
  await p.setViewportSize({width: 1280, height: 900});
  await p.goto(`${APP}?tema=${tema}`, {waitUntil: "networkidle"});
  return erros;
}

/** A cor calculada de um token (ou de qualquer cor), no tema do documento e NORMALIZADA: o mesmo branco sai
 *  `oklch(1 0 0)` de um token e `rgb(255, 255, 255)` de uma peça — os dois passam por `color-mix` em sRGB. */
const token = (p: Page, valor: string) => p.evaluate((v) => {
  const caixa = document.createElement("span");
  caixa.style.color = `color-mix(in srgb, ${v} 100%, transparent)`;
  document.querySelector("main")!.append(caixa);
  // Três casas: o branco do `oklch(1 0 0)` volta 0,999871 da conversão, e o da peça, 1.
  const cor = getComputedStyle(caixa).color.replace(/-?\d+(\.\d+)?(e-?\d+)?/g, (n) => (Math.round(Number(n) * 1000) / 1000).toFixed(3));
  caixa.remove();
  return cor;
}, valor);

/** Uma propriedade calculada de uma peça (ou do pseudoelemento dela); as de cor saem normalizadas, como o `token`. */
const DE_COR = /color$/;
const estilo = async (p: Page, prova: string, prop: string, pseudo?: string) => {
  const v = await p.locator(`[data-prova="${prova}"]`).first().evaluate((el, [prop, pseudo]) =>
    getComputedStyle(el, pseudo || undefined).getPropertyValue(prop), [prop, pseudo ?? ""] as const);
  return DE_COR.test(prop) ? token(p, v) : v;
};
/** A cor de um seletor qualquer (ou do pseudoelemento dele), normalizada. */
const corDe = async (p: Page, seletor: string, prop: string, pseudo?: string) =>
  token(p, await p.locator(seletor).first().evaluate((el, [prop, pseudo]) =>
    getComputedStyle(el, pseudo || undefined).getPropertyValue(prop), [prop, pseudo ?? ""] as const));

test("o banco abre sem erro, nos dois temas", async ({page: p}) => {
  for (const tema of ["light", "dark"] as const) expect(await abrir(p, tema), tema).toEqual([]);
});

test("no claro, o escolhido tem a letra grafite, e o fio amarelo continua", async ({page: p}) => {
  await abrir(p, "light");
  expect(await corDe(p, ".segmented .active", "color")).toBe(await token(p, "var(--foreground)"));
  expect(await p.locator(".segmented .active").first().evaluate((el) => getComputedStyle(el, "::after").content)).not.toBe("none");
  expect(await estilo(p, "eyebrow", "color")).toBe(await token(p, "var(--foreground)"));
});

test("o botão ligado é amarelo, com a letra do botão primário e sem o fio — nos dois temas", async ({page: p}) => {
  for (const tema of ["light", "dark"] as const) {
    await abrir(p, tema);
    // O `Toggle` e o `ToolbarButton` não repassam `data-*`: o ligado se acha pelo estado.
    const LIGADOS = [["toggle", ".bench-familia .btn.toggle[data-pressed]"], ["toolbar", '.toolbar .btn[aria-pressed="true"]']];
    for (const [nome, sel] of LIGADOS) {
      expect(await corDe(p, sel, "background-color"), `${tema} ${nome}: fundo`).toBe(await token(p, "var(--primary)"));
      expect(await corDe(p, sel, "color"), `${tema} ${nome}: letra`).toBe(await token(p, "var(--primary-foreground)"));
      expect(await p.locator(sel).first().evaluate((el) => getComputedStyle(el, "::after").content), `${tema} ${nome}: sem fio`).toBe("none");
    }
    expect(await corDe(p, ".bench-familia .btn.toggle:not([data-pressed])", "background-color"), `${tema}: o desligado não é amarelo`)
      .not.toBe(await token(p, "var(--primary)"));
  }
});

test("o link: no claro, o marca-texto; a variação e o escuro, o sublinhado amarelo; a navegação, nada", async ({page: p}) => {
  await abrir(p, "light");
  for (const prova of ["link-prosa", "link-componente", "texto-link"]) {
    expect(await estilo(p, prova, "color"), `${prova}: a letra é o texto`).toBe(await token(p, "var(--foreground)"));
    expect(await estilo(p, prova, "text-decoration-line"), prova).toBe("underline");
    expect(await estilo(p, prova, "text-decoration-color"), `${prova}: a faixa`).toBe(await token(p, "var(--link-mark)"));
    expect(parseFloat(await estilo(p, prova, "text-underline-offset")), `${prova}: a faixa sobe para trás das letras`).toBeLessThan(0);
  }
  expect(await estilo(p, "link-variacao", "text-decoration-color")).toBe(await token(p, "var(--primary)"));
  expect(await estilo(p, "link-variacao", "text-decoration-thickness")).toBe("2px");
  // O link de navegação não ganha o marca-texto (fica com o sublinhado de fábrica do navegador, fino e na cor da letra).
  expect(await estilo(p, "link-nav", "text-decoration-color"), "o link de navegação não ganha marca-texto").not.toBe(await token(p, "var(--link-mark)"));
  expect(await estilo(p, "link-nav", "text-decoration-thickness"), "nem a espessura dele").toBe("auto");
  await abrir(p, "dark");
  expect(await estilo(p, "link-prosa", "color")).toBe(await token(p, "var(--primary)"));
  expect(await estilo(p, "link-prosa", "text-decoration-color")).toBe(await token(p, "var(--primary)"));
  expect(await estilo(p, "link-prosa", "text-decoration-thickness")).toBe("2px");
});

test("no claro, o campo é branco com a sombra também dentro do cartão; no escuro, o cinza", async ({page: p}) => {
  await abrir(p, "light");
  for (const onde of ["pagina", "cartao"]) {
    expect(await estilo(p, `input-${onde}`, "background-color"), onde).toBe(await token(p, "var(--card)"));
    expect(await estilo(p, `input-${onde}`, "box-shadow"), `${onde}: a sombra fina`).not.toBe("none");
  }
  await abrir(p, "dark");
  expect(await estilo(p, "input-cartao", "background-color")).not.toBe(await token(p, "var(--card)"));
});

test("no claro, o foco do campo é o amarelo; o do botão continua o grafite", async ({page: p}) => {
  await abrir(p, "light");
  await p.locator('[data-prova="input-pagina"]').focus();
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Tab");
  expect(await estilo(p, "input-pagina", "outline-color")).toBe(await token(p, "var(--primary)"));
  await p.locator('[data-prova="botao-primario"]').focus();
  await p.keyboard.press("Tab");
  await p.keyboard.press("Shift+Tab");
  expect(await estilo(p, "botao-primario", "outline-color")).toBe(await token(p, "var(--focus-strong)"));
});

test("as marcas dentro dos controles são brancas; a marca sobre o amarelo da barra é a tinta", async ({page: p}) => {
  for (const tema of ["light", "dark"] as const) {
    await abrir(p, tema);
    const branco = await token(p, "var(--white)");
    expect(await corDe(p, ".switch input:checked + .switch-track", "background-color", "::after"), `${tema}: a bolinha`).toBe(branco);
    expect(await corDe(p, ".slider-thumb", "background-color", "::after"), `${tema}: a alça`).toBe(branco);
    expect(await corDe(p, ".checkbox input:checked + .control-mark", "color"), `${tema}: o visto`).toBe(branco);
    expect(await corDe(p, ".bottom-nav-ind-capsule .bottom-nav-item[aria-current] .bottom-nav-mark", "color"), `${tema}: o ícone na cápsula`).toBe(await token(p, "var(--brand-yellow-ink)"));
  }
});

test("a linha do tempo: o trilho por baixo dos pontos, em trechos, e nada depois do último", async ({page: p}) => {
  await abrir(p, "light");
  const m = await p.locator(".timeline").first().evaluate((lista) => {
    const itens = Array.from(lista.children) as HTMLElement[];
    return {
      unico: getComputedStyle(lista, "::before").content,
      trechos: itens.map((li) => getComputedStyle(li, "::before").content),
      ponto: getComputedStyle(itens[0].querySelector(".timeline-dot")!).zIndex,
    };
  });
  const cor = await corDe(p, ".timeline > li", "background-color", "::before");
  expect(m.unico).toBe("none");
  expect(m.trechos.slice(0, -1).every((c) => c !== "none")).toBe(true);
  expect(m.trechos.at(-1)).toBe("none");
  expect(m.ponto).toBe("1");
  expect(cor).toBe(await token(p, "var(--input)"));
});

test("a linha do tempo da ember também passa por baixo dos pontos, com a cor de linha dela", async ({page: p}) => {
  // O conserto é de todas as marcas (o Victor, 27/10/2026: o defeito "não tinha só na ember, no tema padrão da Aurea
  // também"); a cor da linha dela continua a de antes, `--border`.
  for (const tema of ["light", "dark"] as const) {
    await p.setViewportSize({width: 1280, height: 900});
    await p.goto(`${APP}?tema=${tema}&marca=ember`, {waitUntil: "networkidle"});
    const m = await p.locator(".timeline").first().evaluate((lista) => {
      const itens = Array.from(lista.children) as HTMLElement[];
      return {unico: getComputedStyle(lista, "::before").content, ultimo: getComputedStyle(itens.at(-1)!, "::before").content,
        primeiro: getComputedStyle(itens[0], "::before").content, ponto: getComputedStyle(itens[0].querySelector(".timeline-dot")!).zIndex};
    });
    expect([m.unico, m.ultimo, m.ponto], tema).toEqual(["none", "none", "1"]);
    expect(m.primeiro, tema).not.toBe("none");
    expect(await corDe(p, ".timeline > li", "background-color", "::before"), tema).toBe(await token(p, "var(--border)"));
  }
});

test("a cor que já reprovava: a célula de atenção do painel, no claro, mede 3:1 na página", async ({page: p}) => {
  await abrir(p, "light");
  expect(await estilo(p, "saude-atencao", "background-color")).toBe(await token(p, "#d07612"));
});

test("aumentar contraste: o contorno de 3:1 nos campos, as marcas na tinta e o foco do campo no grafite", async ({browser}) => {
  const ctx = await browser.newContext({contrast: "more"});
  const p = await ctx.newPage();
  for (const tema of ["light", "dark"] as const) {
    await abrir(p, tema);
    expect(await estilo(p, "input-cartao", "border-top-color"), `${tema}: o contorno`).toBe(await token(p, "var(--input-strong)"));
    const tinta = await token(p, "var(--brand-yellow-ink)");
    expect(await corDe(p, ".switch input:checked + .switch-track", "background-color", "::after"), `${tema}: a bolinha`).toBe(tinta);
    expect(await corDe(p, ".checkbox input:checked + .control-mark", "color"), `${tema}: o visto`).toBe(tinta);
  }
  await abrir(p, "light");
  await p.locator('[data-prova="input-pagina"]').focus();
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Tab");
  expect(await estilo(p, "input-pagina", "outline-color")).toBe(await token(p, "var(--focus-strong)"));
  await ctx.close();
});
