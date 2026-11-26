import {test, expect, type Page} from "@playwright/test";
import {abrir} from "./abrir-pagina";

// O VÃO ENTRE A FILA DE ABAS E O PAINEL, E A HORA QUE SÓ SE DIGITA (o lote 109, aprovado pelo Victor na bancada viva em
// 26/11/2026, *"Aprovo as quatro"*). O Victor achou, no site, a fila de abas encostada no cartão de baixo. As duas
// referências (a da web e a do celular) põem 8 entre as abas e o painel (`gap-2`); a Aurea tinha 0 no cartão (o padrão),
// 12 no painel sem caixa, 16 em pé e 12 no celular. Agora é 8 (`--space-2`) em todos. E o campo de hora não mostra o botão
// do relógio do navegador (como a referência): a hora se digita.
// Medido nas páginas DO SITE (o que o Victor vê), nos dois temas, na Gold e na Ember.
// Provado contra o defeito (26/11/2026): com o site montado antes do lote, o cartão mede 0, o sem caixa 12, o em pé 16, o
// celular 12, e o relógio aparece (`display:block`) — tudo reprova.
const VAO = 8;
const CASOS = [{tema: "light", marca: ""}, {tema: "dark", marca: "ember"}] as const;

async function preparar(p: Page, pagina: string, tema: string, marca: string) {
  await p.setViewportSize({width: 1280, height: 900});
  await abrir(p, `/apps/catalog/${pagina}`);
  await p.evaluate(({tema, marca}) => {
    document.documentElement.dataset.theme = tema;
    if (marca) document.documentElement.dataset.brand = marca;
    document.querySelectorAll("details").forEach((d) => { d.open = true; });
  }, {tema, marca});
  await p.evaluate(() => document.fonts.ready);
}

for (const {tema, marca} of CASOS) {
  const nome = `${tema === "light" ? "claro" : "escuro"}${marca ? `, ${marca}` : ""}`;

  test(`web: o cartão e o painel sem caixa ficam a ${VAO} das abas (${nome})`, async ({page: p}) => {
    await preparar(p, "tabs.html", tema, marca);
    const medidas = await p.evaluate(() => [...document.querySelectorAll(".tabs-root:not([data-orientation=\"vertical\"])")].map((r) => {
      const fila = r.querySelector(".tabs")!.getBoundingClientRect();
      const painel = [...r.querySelectorAll<HTMLElement>("[role=tabpanel]")].find((x) => !x.hidden)!;
      // No sem caixa o vão é o recheio de cima do painel: mede-se até o TEXTO, como o olho vê.
      const alvo = painel.classList.contains("tabs-panel") ? (() => {
        const rg = document.createRange(); rg.selectNodeContents(painel); return rg.getBoundingClientRect();
      })() : painel.getBoundingClientRect();
      const topo = painel.classList.contains("tabs-panel") ? painel.getBoundingClientRect().top + parseFloat(getComputedStyle(painel).paddingTop) : alvo.top;
      return {tipo: painel.classList.contains("tabs-panel") ? "sem caixa" : "cartão", vao: Math.round((topo - fila.bottom) * 100) / 100};
    }));
    expect(medidas.length).toBeGreaterThanOrEqual(3);
    expect(medidas.map((m) => m.tipo)).toEqual(expect.arrayContaining(["cartão", "sem caixa"]));
    for (const m of medidas) expect(m, m.tipo).toEqual({tipo: m.tipo, vao: VAO});
  });

  test(`web: em pé, o painel fica a ${VAO} da coluna de abas (${nome})`, async ({page: p}) => {
    await preparar(p, "pattern-tabs-a-column-of-sections-beside-the-content.html", tema, marca);
    const vaos = await p.evaluate(() => [...document.querySelectorAll(".tabs-root[data-orientation=\"vertical\"]")].map((r) => {
      const fila = r.querySelector(".tabs")!.getBoundingClientRect();
      const painel = [...r.querySelectorAll<HTMLElement>("[role=tabpanel]")].find((x) => !x.hidden)!.getBoundingClientRect();
      return Math.round((painel.left - fila.right) * 100) / 100;
    }));
    expect(vaos.length).toBeGreaterThan(0);
    for (const v of vaos) expect(v).toBe(VAO);
  });

  test(`celular: o painel fica a ${VAO} das abas (${nome})`, async ({page: p}) => {
    await preparar(p, "native-tabs.html", tema, marca);
    // A medida vale para a peça ACESA (o `react-native-web` depois de carregar), não para o HTML de antes dela.
    await p.waitForLoadState("networkidle");
    const vaos = await p.evaluate(() => [...document.querySelectorAll("[role=tablist]")].map((l) => {
      // O painel do nativo é o irmão do rolador que guarda a fila; o vão sai da borda de baixo do rolador (na secundária, o
      // fio de ponta a ponta mora nele, 1 abaixo da fila).
      let s: Element | null = l;
      while (s && !s.nextElementSibling) s = s.parentElement;
      const painel = s!.nextElementSibling!;
      return Math.round((painel.getBoundingClientRect().top - s!.getBoundingClientRect().bottom) * 100) / 100;
    }));
    expect(vaos.length).toBeGreaterThan(0);
    for (const v of vaos) expect(v).toBe(VAO);
  });
}

test("a hora só se digita: o campo de hora não mostra o relógio do navegador", async ({page: p, browserName}) => {
  // O botão do relógio é uma peça só do Chromium (o Firefox e o Safari não abrem lista de hora); é ele que se esconde.
  test.skip(browserName !== "chromium", "o relógio do campo de hora só existe no Chromium");
  // O `getComputedStyle` desse pedaço do navegador responde "inline-block" com ou sem a regra (medido em 26/11/2026), então
  // a prova é a IMAGEM: o campo do site tem de sair igual ao mesmo campo com o relógio escondido à força. Com o CSS de antes,
  // o relógio aparece e as duas imagens diferem.
  await preparar(p, "input.html", "light", "");
  await p.evaluate(() => {
    const campo = document.createElement("input");
    campo.type = "time"; campo.className = "input"; campo.value = "09:00"; campo.id = "prova-hora";
    campo.style.inlineSize = "12rem";
    const caixa = document.createElement("div");
    caixa.style.cssText = "position:fixed;inset:16px auto auto 16px;z-index:2147483000;padding:16px;background:var(--background)";
    caixa.append(campo); document.body.append(caixa);
  });
  const campo = p.locator("#prova-hora");
  const comoSai = await campo.screenshot({animations: "disabled"});
  await p.addStyleTag({content: "#prova-hora::-webkit-calendar-picker-indicator{display:none!important}"});
  const semRelogio = await campo.screenshot({animations: "disabled"});
  expect(comoSai.equals(semRelogio), "o campo de hora ainda desenha o relógio do navegador").toBe(true);
});
