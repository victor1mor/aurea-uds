import {test, expect, type Page} from "@playwright/test";
import {createElement as el} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// Lote 102 (0.81.0) · com "menos movimento" ligado, a rodinha (`Spinner`) e o círculo sem fim (`ProgressCircle` sem
// `value`) continuam girando, a um terço da velocidade. Até a 0.80.0 a regra global de `prefers-reduced-motion` os
// parava: uma volta de 0,01 ms e fim — parados, liam como "nada está carregando" (o defeito da separação de 24/11/2026).
//
// Mede a ANIMAÇÃO de verdade, no navegador, com a folha publicada: a duração calculada, as voltas e se ela está andando.
// A folha de antes reprova os dois: 0,01 ms e uma volta só.

async function abrir(p: Page, baseURL: string | undefined, nome: string, corpo: string) {
  const url = `${baseURL}/__giro-${nome}`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head>
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="padding:40px">${corpo}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
const html = (no: ReturnType<typeof el>) => renderToStaticMarkup(el(A.AureaProvider, {spriteUrl: ""}, no));
const medir = (p: Page, seletor: string) => p.$eval(seletor, (no) => {
  const s = getComputedStyle(no);
  return {duracao: s.animationDuration, voltas: s.animationIterationCount,
    andando: no.getAnimations().some((a) => a.playState === "running")};
});

const CASOS = [
  {nome: "spinner", seletor: ".spinner", corpo: () => html(el(A.Spinner, {label: "Loading"})), normal: "0.7s", devagar: "2.1s"},
  {nome: "circulo", seletor: ".progress-circle-indeterminate > svg", corpo: () => html(el(A.ProgressCircle, {label: "Loading"})),
    normal: "1s", devagar: "3s"},
];

for (const c of CASOS) {
  test(`${c.nome}: com menos movimento, gira a um terço da velocidade, sem parar`, async ({page: p, baseURL}) => {
    await p.emulateMedia({reducedMotion: "reduce"});
    await abrir(p, baseURL, `${c.nome}-reduz`, c.corpo());
    const m = await medir(p, c.seletor);
    expect(m).toEqual({duracao: c.devagar, voltas: "infinite", andando: true});
  });
  test(`${c.nome}: sem a preferência, o tempo de sempre`, async ({page: p, baseURL}) => {
    await p.emulateMedia({reducedMotion: "no-preference"});
    await abrir(p, baseURL, `${c.nome}-normal`, c.corpo());
    const m = await medir(p, c.seletor);
    expect(m).toEqual({duracao: c.normal, voltas: "infinite", andando: true});
  });
}

test("com menos movimento, o resto continua parado: a barra sem fim vira a trilha apagada", async ({page: p, baseURL}) => {
  await p.emulateMedia({reducedMotion: "reduce"});
  await abrir(p, baseURL, "barra", html(el(A.Progress, {label: "Counting files"})));
  const animacoes = await p.$eval(".progress-indeterminate > span", (no) => no.getAnimations().length);
  expect(animacoes).toBe(0);
});
