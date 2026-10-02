// O `flex` NUMÉRICO que não é positivo quebra no navegador (02/10/2026, foto do Victor do app
// rodando no navegador): o círculo amarelo do `BottomNav` `circle-bold` virava um RISCO de 8 de
// largura, com o ícone espremido no meio.
//
// A causa, lida no fonte do `react-native-web` 0.21.3 (`createReactDOMStyle.js`): ele traduz
// `flex: -1`, mas passa `flex: 0` CRU para o CSS, e no CSS `flex: 0` é `0 1 0%` — base zero,
// encolhe. No Yoga (o aparelho) o mesmo `flex: 0` é "inflexível, use a `width`". Medido no
// navegador com o `react-native-web` de verdade: o item escolhido tinha `flex: 0 1 0%` e 8 de
// largura; com as três propriedades por extenso, 56.
//
// Por isso a prova é por ESTILO, e não pela vitrine: o dublê segue o Yoga e escondeu o defeito.
// As travas reprovam o código de antes:
//   1. o círculo escolhido diz `flexGrow: 0, flexShrink: 0, flexBasis: "auto"`, e não `flex: 0`;
//   2. no `content`, o recheio dos lados do círculo é `space1` (era `space3`: o rótulo cortava);
//   3. nenhum fonte do nativo escreve `flex: 0` nem `flex` negativo (quem mais tem o problema).
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, BottomNav, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({house: Glifo as never, bell: Glifo as never, user: Glifo as never});
const ITENS = [{id: "a", label: "Início", icon: "house"}, {id: "b", label: "Avisos", icon: "bell"},
  {id: "c", label: "Perfil", icon: "user"}] as never;
const escolhida = () => {
  const p = __instancias("Pressable").find((x) => x.accessibilityState?.selected === true || x["aria-selected"] === true);
  return StyleSheet.flatten(typeof p?.style === "function" ? p.style({pressed: false}) : p?.style) ?? {};
};

describe("BottomNav circle-bold · o círculo não encolhe no navegador", () => {
  it.each(["full", "content"] as const)("largura %s: inflexível por extenso, 56 de largura", (width) => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="b" indicator="circle-bold" width={width} /></AureaProvider>);
    const e = escolhida();
    expect(e.width).toBe(56);
    expect([e.flexGrow, e.flexShrink, e.flexBasis]).toEqual([0, 0, "auto"]);
    // O `flex: 1` da aba comum não pode sobrar por baixo: no navegador ele viraria `1 1 0%`.
    expect(e.flex === undefined || e.flex > 0 ? "ok" : `flex: ${e.flex}`).toBe("ok");
    expect(e.flex).not.toBe(0);
  });
  // O segundo defeito, achado pela mesma bancada: no `content` a aba ganha `space3` dos lados, e
  // dentro dos 56 sobravam 32 para o rótulo — "Avisos" (35) saía "Avi…", no nativo e na web.
  it.each(["full", "content"] as const)("largura %s: o recheio dos lados é space1, e o rótulo cabe", (width) => {
    render(<AureaProvider icons={ICONES}><BottomNav items={ITENS} current="b" indicator="circle-bold" width={width} /></AureaProvider>);
    expect(escolhida().paddingHorizontal ?? escolhida().padding).toBe(t.size.space1);
  });
});

describe("nenhum fonte do nativo escreve `flex` zero ou negativo", () => {
  const dir = join(__dirname, "../../packages/native/src");
  const fontes = readdirSync(dir).filter((f) => /\.tsx?$/.test(f));
  // Comentário não conta: o próprio aviso no `navigation.tsx` cita `flex: 0` entre crases.
  const semComentario = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  it("a lista de fontes não está vazia (a trava olha alguma coisa)", () => {
    expect(fontes.length).toBeGreaterThan(10);
    expect(fontes).toContain("navigation.tsx");
  });
  it.each(fontes)("%s", (f) => {
    const achados = semComentario(readFileSync(join(dir, f), "utf8")).match(/\bflex:\s*(0|-\d+)\b/g) ?? [];
    expect(achados).toEqual([]);
  });
});
