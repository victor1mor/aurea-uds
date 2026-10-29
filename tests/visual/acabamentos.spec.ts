import {test, expect, type Page} from "@playwright/test";

// OS ACABAMENTOS (ADR-0086, 28/10/2026), medidos nas páginas do site: o brilho e o fio só onde o app pede (a prop, ou o
// atributo num contêiner, e a peça com o seu atributo ganha), na web e no nativo; e o `blurred` corrigido — a letra da
// barra translúcida lê sobre qualquer cor que passe por baixo.
// Provado contra o defeito (28/10/2026): com o CSS da 0.47.0, o brilho e o fio medem "none", e a barra transparente dá
// 1,83:1 sobre o amarelo no escuro (o pior caso, a letra direto sobre a cor cheia).

// O Windows com "Efeitos de transparência" desligado faz o Chromium dizer "reduzir transparência", e aí a barra sai cheia
// (de propósito). A prova da barra translúcida pede o caso de quem não pediu menos transparência.
async function semReduzirTransparencia(p: Page, browserName: string) {
  if (browserName !== "chromium") return;
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Emulation.setEmulatedMedia", {features: [{name: "prefers-reduced-transparency", value: "no-preference"}]});
}

test("o brilho: no principal que pede, no contêiner que pede, e fora quando a peça diz não", async ({page: p}) => {
  await p.goto("/apps/catalog/button.html", {waitUntil: "networkidle"});
  const r = await p.evaluate(() => {
    const s = (el: Element | null | undefined) => (el ? getComputedStyle(el).boxShadow : "faltou");
    const soltos = [...document.querySelectorAll(".btn-primary:not([data-glow])")].filter((b) => !b.closest("[data-glow]"));
    return {
      pedido: s(document.querySelector('.btn-primary[data-glow="true"]')),
      doConteiner: s(document.querySelector('[data-glow="true"] .btn-primary:not([data-glow])')),
      tirado: s(document.querySelector('[data-glow="true"] .btn-primary[data-glow="false"]')),
      padrao: soltos.length ? s(soltos[0]) : "faltou",
    };
  });
  expect(r.pedido).toMatch(/\/ 0\.4\) 0px 4px 14px 0px$/);
  expect(r.doConteiner).toMatch(/\/ 0\.4\) 0px 4px 14px 0px$/);
  expect(r.tirado).toBe("none");
  expect(r.padrao).toBe("none");

  // No foco pelo teclado, o anel continua a linha de foco, e o brilho fica (o `:focus-visible` geral zera a sombra; a
  // regra do brilho tem mais força). A caixa acende quando chega perto da tela e troca o botão pelo vivo — focar antes
  // perde o foco na troca; então rola, espera ela acender, e só depois foca.
  const pedido = p.locator('.btn-primary[data-glow="true"]').first();
  await pedido.scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector('.btn-primary[data-glow="true"]')?.closest<HTMLElement>("[data-vivo]")
    ?.dataset.ligada === "sim", null, {timeout: 15000});
  await pedido.focus();
  await p.keyboard.press("Shift+Tab");
  await p.keyboard.press("Tab");
  const foco = await pedido.evaluate((el) => ({
    eleTemFoco: document.activeElement === el && el.matches(":focus-visible"),
    sombra: getComputedStyle(el).boxShadow, linha: getComputedStyle(el).outlineStyle,
  }));
  expect(foco.eleTemFoco).toBe(true);
  expect(foco.linha).toBe("solid");
  expect(foco.sombra).toMatch(/\/ 0\.4\) 0px 4px 14px 0px$/);
});

test("o fio: o tom a 30%, por dentro, no selo e no botão de fundo suave que pedem", async ({page: p}) => {
  await p.goto("/apps/catalog/badge.html", {waitUntil: "networkidle"});
  const selo = await p.evaluate(() => {
    const s = (el: Element | null) => (el ? getComputedStyle(el).boxShadow : "faltou");
    return {
      pedido: s(document.querySelector('.badge-success[data-ring="true"]')),
      doConteiner: s(document.querySelector('[data-ring="true"] .badge:not([data-ring])')),
      tirado: s(document.querySelector('[data-ring="true"] .badge[data-ring="false"]')),
      padrao: s(document.querySelector(".badge-success:not([data-ring])")),
    };
  });
  expect(selo.pedido).toMatch(/\/ 0\.3\) 0px 0px 0px 1px inset$/);
  expect(selo.doConteiner).toMatch(/\/ 0\.3\) 0px 0px 0px 1px inset$/);
  expect(selo.tirado).toBe("none");
  expect(selo.padrao).toBe("none");

  await p.goto("/apps/catalog/button.html", {waitUntil: "networkidle"});
  const botao = await p.evaluate(() => {
    const s = (el: Element | null) => (el ? getComputedStyle(el).boxShadow : "faltou");
    return {soft: s(document.querySelector('.btn-soft[data-ring="true"]')),
      contorno: s(document.querySelector('.btn-danger-outline[data-ring="true"]')),
      tirado: s(document.querySelector('[data-ring="true"] .btn-soft[data-ring="false"]'))};
  });
  expect(botao.soft).toMatch(/\/ 0\.3\) 0px 0px 0px 1px inset$/);
  expect(botao.contorno).toMatch(/\/ 0\.3\) 0px 0px 0px 1px inset$/);
  expect(botao.tirado).toBe("none");
});

test("o nativo: o brilho e o fio chegam ao navegador, com a marca da web", async ({page: p}) => {
  await p.goto("/apps/catalog/native-button.html", {waitUntil: "networkidle"});
  await expect(p.locator('[data-glow="true"]').first()).toBeAttached();
  const r = await p.evaluate(() => ({
    brilho: getComputedStyle(document.querySelector('[data-glow="true"]')!).boxShadow,
    fio: getComputedStyle(document.querySelector('[data-ring="true"]')!).boxShadow,
  }));
  expect(r.brilho).toMatch(/0px 4px 14px 0px/);
  expect(r.fio).toMatch(/0px 0px 0px 1px inset/);
});

for (const tema of ["light", "dark"] as const) {
  test(`o blurred: a letra da barra lê sobre qualquer cor por baixo (${tema === "light" ? "claro" : "escuro"})`, async ({page: p, browserName}) => {
    await semReduzirTransparencia(p, browserName);
    await p.goto("/apps/catalog/index.html", {waitUntil: "networkidle"});
    await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
    const r = await p.evaluate(() => {
      const barra = document.querySelector(".topbar-blurred")!;
      const cv = document.createElement("canvas"); cv.width = cv.height = 1;
      const cx = cv.getContext("2d")!;
      const rgba = (cor: string) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = cor; cx.fillRect(0, 0, 1, 1); return [...cx.getImageData(0, 0, 1, 1).data]; };
      const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const contraste = (a: number[], b: number[]) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const fundo = rgba(getComputedStyle(barra).backgroundColor);
      const letra = rgba(getComputedStyle(barra).color);
      // O pior caso: a cor CHEIA embaixo da letra (o desfoque só a mistura com o que está em volta).
      const cores = ["--primary", "--info", "--success", "--destructive", "--warning"].map((v) => {
        const d = document.createElement("div"); d.style.background = `var(${v})`; barra.appendChild(d);
        const c = rgba(getComputedStyle(d).backgroundColor); d.remove(); return c;
      });
      const a = fundo[3] / 255;
      const sobre = cores.map((c) => c.slice(0, 3).map((v, i) => fundo[i] * a + v * (1 - a)));
      return {alfa: Math.round(a * 100) / 100, filtro: getComputedStyle(barra).backdropFilter,
        pior: Math.round(Math.min(...sobre.map((c) => contraste(letra, c))) * 100) / 100};
    });
    expect(r.alfa).toBe(0.72);
    expect(r.filtro).toBe("blur(16px) saturate(1.6)");
    expect(r.pior, "a letra sobre a pior cor").toBeGreaterThanOrEqual(4.5);
  });
}
