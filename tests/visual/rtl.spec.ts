import {test, expect} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O core-css.spec prova que LTR não mudou. Este prova o outro lado: que em RTL
// as coisas realmente espelham — e que o que NÃO deve espelhar continua no lugar.
//
// A PÁGINA É GERADA AQUI, e deixou de ser `apps/docs/index.html` — que saiu na Parte D do
// PLANO-1.0 (08/08/2026). O padrão é o do `skin.spec`: renderiza só o que se mede, com SÓ o
// core, e serve por `route`. É melhor do que era: antes o teste abria uma página de 682 KB
// escrita à mão e TROCAVA o `<style>` dela pelo do core em tempo de execução, para medir cinco
// componentes. Agora os cinco são os componentes de verdade, e não há mais nada na página para
// interferir — nem o `docs.css`, que era `@layer` por cima do core.
const CORPO = renderToStaticMarkup(
  h(A.AureaProvider, {spriteUrl: "/packages/icons/dist/aurea-icons.svg"},
    h("div", null,
      h(A.Timeline, {items: [
        {title: "Criado", description: "Rascunho aberto", time: "10:02"},
        {title: "Revisado", time: "11:40"}]}),
      h(A.Switch, {label: "Ativo", defaultChecked: true}),
      h(A.Select, {label: "Nível", items: [{value: "a", label: "A"}], defaultValue: "a"}),
      h(A.Checkbox, {label: "Aceito", defaultChecked: true}),
      h(A.Spinner, {label: "Carregando"}))));

const pagina = (dir: "ltr" | "rtl") => `<!doctype html><html dir="${dir}" data-theme="dark"><head>
  <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
  <link rel="stylesheet" href="/packages/core/dist/aurea.css">
</head><body>${CORPO}</body></html>`;

async function load(page: import("@playwright/test").Page, dir: "ltr" | "rtl") {
  const url = `/__rtl-${dir}`;
  await page.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8", body: pagina(dir)}));
  await page.goto(url, {waitUntil: "networkidle"});
  await page.evaluate(() => document.fonts.ready);
}

const px = (page: import("@playwright/test").Page, sel: string, prop: string) =>
  page.evaluate(
    ([s, p]) => {
      const el = document.querySelector(s);
      if (!el) throw new Error(`sem elemento: ${s}`);
      return getComputedStyle(el).getPropertyValue(p);
    },
    [sel, prop] as const,
  );

// Reancorado na Fase 11. Media `.timeline { padding-left }`, que era o recuo do conteúdo — e
// esse recuo deixou de existir quando a regra foi reescrita para casar com o `.timeline-dot`
// que o React emite (achado A13: o ponto media 0×0). O que a timeline mirra agora é o TRILHO,
// e é nele que o gate encosta: `inset-inline-start` no pseudo-elemento.
// A guarda contra teste vazio é a mesma dos outros três daqui: exige valor real antes de
// comparar, senão a regra pode sumir e os dois lados vêm "auto" empatados.
test("espelha o eixo inline em RTL", async ({page}) => {
  const trilho = () => page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector(".timeline")!, "::before");
    return {left: cs.left, right: cs.right};
  });
  await load(page, "ltr");
  const ltr = await trilho();
  await load(page, "rtl");
  const rtl = await trilho();

  // `right` de elemento posicionado vem resolvido em px, nunca "auto" — então a prova é o
  // PAR: o que era a distância da esquerda em LTR vira a distância da direita em RTL.
  expect(ltr.left, ".timeline::before sem left — a regra do trilho existe?").toMatch(/^\d/);
  expect(rtl.right, "em RTL o trilho troca de lado").toBe(ltr.left);
  expect(rtl.left, "em RTL o trilho não pode ficar também na esquerda").not.toBe(ltr.left);
});

// Ancorado no Switch, não mais no `.agent-card`: aquele era MOCKUP da página de docs, não
// componente do sistema, e saiu do core na Fase 4 (achado A6). Um gate do core que mede uma
// classe de fora do core não prova nada sobre o core — e, quando a classe sumiu, este teste
// quebrou de imediato enquanto o irmão dele (o do mapa) passou a passar VAZIO. Por isso as
// duas metades agora exigem valor real antes de comparar.
test("pseudo-elemento ancorado no eixo inline troca de lado em RTL", async ({page}) => {
  await load(page, "ltr");
  const ltr = await page.evaluate(() =>
    getComputedStyle(document.querySelector(".switch-track")!, "::after").left);
  await load(page, "rtl");
  const rtl = await page.evaluate(() =>
    getComputedStyle(document.querySelector(".switch-track")!, "::after").right);
  // guarda contra teste vazio: se a regra desaparecer, isto vem "auto" e falha aqui
  expect(ltr, ".switch-track::after sem left — a regra existe?").toMatch(/^\d/);
  expect(rtl, ".switch-track::after sem right em RTL").toBe(ltr);
});

test("o chevron do select troca de lado em RTL", async ({page}) => {
  await load(page, "ltr");
  const ltr = await px(page, ".select", "background-position");
  await load(page, "rtl");
  const rtl = await px(page, ".select", "background-position");
  expect(rtl).not.toBe(ltr);
  expect(rtl).toContain("12px");
});

// O par do mapa saiu com o `.map-marker-a` (mockup de docs, Fase 4). O conceito que
// importava — "glifo desenhado com borda não espelha" — continua, agora medido nos DOIS
// glifos que o README declara como deliberadamente não espelhados: o check e o spinner.
test("NÃO espelha glifo desenhado com borda", async ({page}) => {
  const medir = () => page.evaluate(() => ({
    check: getComputedStyle(document.querySelector(".checkbox .control-mark")!, "::after").borderLeftWidth,
    spinner: getComputedStyle(document.querySelector(".spinner")!).borderRightColor,
  }));
  await load(page, "ltr");
  const ltr = await medir();
  await load(page, "rtl");
  const rtl = await medir();

  // guarda contra teste vazio: sem regra, borderLeftWidth vem "0px" nos dois e a
  // comparação passaria sem medir nada.
  expect(ltr.check, "check do checkbox sem borda — a regra existe?").not.toBe("0px");
  expect(ltr.spinner, "spinner sem border-right-color").toBeTruthy();
  expect(rtl.check).toBe(ltr.check);      // espelhar quebraria o glifo
  expect(rtl.spinner).toBe(ltr.spinner);  // idem: o vazado do spinner é físico
});
