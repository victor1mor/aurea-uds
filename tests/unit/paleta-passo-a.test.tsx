// AS CORES, PASSO A (ADR-0083, 26/10/2026) — o que se prova lendo o código: a fonte dos tokens (os valores da proposta do
// Victor e a `ember` congelada), a trava de que nenhuma regra nova do core alcança a `ember`, e o nativo (o escolhido, o
// campo, o foco, as marcas dos controles, o link e o "aumentar contraste"). O efeito no navegador está em
// `tests/visual/paleta-passo-a.spec.ts` e `tests/visual/ember-congelada.spec.ts`.
// Provado contra o defeito (27/10/2026): com a fonte, o core e o nativo da 0.44.0, reprovam todos.
import {readFileSync} from "node:fs";
import {act, render} from "@testing-library/react";
import * as React from "react";
import {afterEach, describe, expect, it} from "vitest";
import {StyleSheet, __definirMaisContraste, __definirPlataforma, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Checkbox, Input, Switch, Text, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {focoDoCampo, fundoDeCampo, marcaDoControle} from "../../packages/native/src/estilos.js";

type Token = {$value: unknown};
const fonte = JSON.parse(readFileSync("packages/tokens/src/aurea.tokens.json", "utf8"));
const hexDe = (t: Token) => typeof t.$value === "string" ? t.$value : (t.$value as {hex: string; alpha?: number}).hex;
const alfaDe = (t: Token) => (t.$value as {alpha?: number}).alpha;
const claro = resolverTokens("light", "comfortable");
const escuro = resolverTokens("dark", "comfortable");

describe("a fonte dos tokens: a proposta, e a ember congelada", () => {
  it("a tinta sobre o amarelo é #18181b, e o amarelo da marca não muda", () => {
    expect(hexDe(fonte.base["brand-yellow-ink"])).toBe("#18181b");
    expect(fonte.base["brand-yellow"].$value).toEqual({colorSpace: "oklch", components: [0.795, 0.184, 86.047]});
  });
  it("no claro, o destaque e o link são o texto; a faixa é o amarelo a 45%; o foco da marca é o bronze", () => {
    const L = fonte.theme.light;
    expect(L["primary-emphasis"].$value).toBe("{foreground}");
    expect(L.link.$value).toBe("{foreground}");
    expect(L["link-hover"].$value).toBe("{foreground}");
    expect([hexDe(L["link-mark"]), alfaDe(L["link-mark"])]).toEqual(["#f0b100", 0.45]);
    expect(L["link-underline"].$value).toBe("{primary}");
    expect(hexDe(L.focus)).toBe("#bd7000");
    expect(L["primary-mark"].$value).toBe("{brand-yellow-ink}");
    expect(hexDe(L["control-thumb"])).toBe("#ffffff");
    expect(hexDe(L["input-strong"])).toBe("#8d8d91");
    expect(hexDe(L["warning-500"])).toBe("#d07612");
  });
  it("no escuro, sem faixa; o contorno do aumentar contraste é #646467", () => {
    const D = fonte.theme.dark;
    expect(alfaDe(D["link-mark"])).toBe(0);
    expect(hexDe(D["input-strong"])).toBe("#646467");
    expect(D["primary-mark"].$value).toBe("{brand-yellow-ink}");
  });
  it("a Ember guarda a tinta, a letra do aviso, a bolinha e a célula de hoje", () => {
    for (const tema of ["light", "dark"] as const) {
      const L = fonte.brand.ember[tema];
      expect(hexDe(L["brand-yellow-ink"]), tema).toBe("#242424");
      expect(hexDe(L["warning-foreground"]), tema).toBe("#242424");
      // A bolinha: a Ember do claro continua a marca dela (branca); a do escuro passou ao branco (o Victor, 28/10/2026:
      // "Brancos, como as outras") — era o quase preto do fundo dela.
      if (tema === "light") expect(L["control-thumb"].$value, tema).toBe("{primary-mark}");
      else expect(L["control-thumb"].$value, tema).toEqual({colorSpace: "oklch", components: [1, 0, 0]});
    }
    expect(fonte.brand.ember.light["warning-500"].$value).toEqual(fonte.base["warning-500"].$value);
  });
});

describe("o core: nenhuma regra nova alcança a ember", () => {
  const css = readFileSync("packages/core/src/aurea.css", "utf8");
  const ini = css.lastIndexOf("/*", css.indexOf("═══ A PALETA DA 1.0"));
  // A seção do passo A vai até o começo da do passo B: desde 28/10/2026 os estilos do passo B alcançam a Ember ("Sim,
  // como as outras"), e só o passo A continua sem alcançá-la.
  const fim = css.indexOf("/* ═══ AS CORES, passo B");
  const secao = css.slice(ini, fim).replace(/\/\*[\s\S]*?\*\//g, "");
  const separar = (lista: string) => {
    const partes: string[] = []; let nivel = 0, atual = "";
    for (const c of lista) {
      if (c === "(") nivel++;
      if (c === ")") nivel--;
      if (c === "," && nivel === 0) { partes.push(atual.trim()); atual = ""; } else atual += c;
    }
    if (atual.trim()) partes.push(atual.trim());
    return partes;
  };
  const seletores = [...secao.matchAll(/([^{};]+)\{/g)].map((m) => m[1].trim()).filter((s) => !s.startsWith("@")).flatMap(separar);

  it("a seção existe e tem as regras do passo A (o teste não passa por vacuidade)", () => {
    expect(ini).toBeGreaterThan(0);
    expect(fim).toBeGreaterThan(ini);
    expect(seletores.length).toBeGreaterThanOrEqual(20);
  });
  it("todo seletor da seção leva a exclusão da ember", () => {
    const sem = seletores.filter((s) => !s.includes(':where(:not([data-brand="ember"],[data-brand="ember"] *))')
      && !s.startsWith(':root:where(:not([data-brand="ember"]))'));
    expect(sem).toEqual([]);
  });
  it("as regras de antes do botão ligado e do escolhido ficaram SÓ na ember", () => {
    const soNaEmber = css.split(':where([data-brand="ember"],[data-brand="ember"] *)').length - 1;
    expect(soNaEmber).toBeGreaterThanOrEqual(9);
    // e o botão ligado de antes não aparece mais sem a marca: nem o fio, nem a mistura
    expect(css).not.toMatch(/\.btn\[aria-pressed="true"\]:not\(\.btn-icon\)::after/);
    expect(css).not.toMatch(/\[data-theme="light"\] \.btn\[aria-pressed="true"\]:where\(:not\(\[data-theme="dark"\]/);
  });
});

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"eye": Glifo, "eye-slash": Glifo, "x": Glifo, "check": Glifo});
const Envolve = ({tema = "light", children}: {tema?: "light" | "dark"; children: React.ReactNode}) =>
  <AureaProvider theme={tema} icons={ICONES}>{children}</AureaProvider>;
const plano = (p: Record<string, unknown> | undefined) => StyleSheet.flatten(p?.style as never) as Record<string, unknown>;

describe("o nativo", () => {
  afterEach(() => { __definirMaisContraste(false); });

  it("o campo é branco com a sombra no claro, dentro ou fora da superfície; no escuro, o cinza", () => {
    for (const naSuperficie of [false, true]) {
      expect(fundoDeCampo(claro, naSuperficie)).toMatchObject({backgroundColor: claro.color.card, boxShadow: [...claro.shadowLayers.shadowSm]});
    }
    expect(fundoDeCampo(escuro, false).backgroundColor).not.toBe(escuro.color.card);
    expect(fundoDeCampo(claro, false).borderColor).toBeUndefined();
    expect(fundoDeCampo(claro, true, true).borderColor).toBe(claro.color.inputStrong);
  });
  it("o foco do campo é o amarelo; com mais contraste, o grafite", () => {
    expect(focoDoCampo(claro)).toBe(claro.color.primary);
    expect(focoDoCampo(claro, true)).toBe(claro.color.focusStrong);
    expect(focoDoCampo(escuro)).toBe(escuro.color.primary);
  });
  it("as marcas dos controles são brancas; com mais contraste, a tinta", () => {
    expect(marcaDoControle(claro, claro.color.controlThumb)).toBe("#ffffff");
    expect(marcaDoControle(claro, claro.color.controlThumb, true)).toBe(claro.color.brandYellowInk);
  });

  it("o link: no claro, a faixa num trecho de dentro; no escuro, o sublinhado amarelo", () => {
    render(<Envolve><Text tone="link">Forgot password</Text></Envolve>);
    const textos = __instancias("Text").map(plano);
    expect(textos.some((s) => s.backgroundColor === claro.color.linkMark), "a faixa").toBe(true);
    expect(textos.some((s) => s.color === claro.color.foreground), "a letra é o texto").toBe(true);
    expect(claro.color.linkMark).toBe("#f0b10073");
    render(<Envolve tema="dark"><Text tone="link">Esqueci</Text></Envolve>);
    const doEscuro = __instancias("Text").map(plano).filter((s) => s.textDecorationLine === "underline");
    expect(doEscuro.length, "o sublinhado no escuro").toBeGreaterThan(0);
    expect(doEscuro[0].textDecorationColor).toBe(escuro.color.linkUnderline);
  });

  it("com mais contraste no sistema: o contorno no campo e as marcas na tinta (iOS e Android)", async () => {
    for (const so of ["ios", "android"] as const) {
      __definirPlataforma(so);
      __definirMaisContraste(true);
      render(<Envolve><Input testID="e" /><Switch checked label="Wi-Fi" /><Checkbox checked label="Lembrar" /></Envolve>);
      await act(async () => { await Promise.resolve(); });
      const campo = plano(__instancias("TextInput").filter((p) => p.testID === "e").at(-1));
      expect(campo.borderColor, `${so}: o contorno`).toBe(claro.color.inputStrong);
      const cores = __instancias("Animated.View").map(plano).map((s) => s.backgroundColor);
      expect(cores, `${so}: a bolinha na tinta`).toContain(claro.color.brandYellowInk);
    }
  });
  it("sem a preferência, nada de contorno — e a bolinha é branca", async () => {
    render(<Envolve><Input testID="f" /><Switch checked label="Wi-Fi" /></Envolve>);
    await act(async () => { await Promise.resolve(); });
    expect(plano(__instancias("TextInput").filter((p) => p.testID === "f").at(-1)).borderColor).not.toBe(claro.color.inputStrong);
    expect(__instancias("Animated.View").map(plano).map((s) => s.backgroundColor)).toContain("#ffffff");
  });
  it("no navegador (react-native-web), a preferência vem da media query da web", async () => {
    __definirPlataforma("web");
    const antes = (globalThis as {matchMedia?: unknown}).matchMedia;
    (globalThis as {matchMedia?: unknown}).matchMedia = (q: string) => ({matches: q === "(prefers-contrast: more)"});
    try {
      render(<Envolve><Input testID="w" /></Envolve>);
      await act(async () => { await Promise.resolve(); });
      expect(plano(__instancias("TextInput").filter((p) => p.testID === "w").at(-1)).borderColor).toBe(claro.color.inputStrong);
    } finally {
      (globalThis as {matchMedia?: unknown}).matchMedia = antes;
    }
  });
});
