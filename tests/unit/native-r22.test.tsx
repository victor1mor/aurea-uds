// R-22 (02/10/2026) · o `PhotoInput` não deixava OLHAR a foto escolhida. A miniatura era um `Avatar`
// redondo de 42 sem toque, e o X (sem fundo, só 8 para fora) cobria metade dela. Na "B" da prancha,
// escolhida pelo Victor (*"B pode seguir"*):
//   · miniatura QUADRADA de 64 (`space16`, o `Avatar` `lg` do HeroUI Native), a `Image` da `Gallery`;
//   · tocar abre a foto grande, no MESMO zoom da `Gallery`;
//   · o X com fundo, TODO fora da foto;
//   · leitor de tela: "Foto 2 de 3" e "Abre a foto"; o X, "Remover foto 2".
// Provado contra o defeito: com o código de antes, não havia miniatura tocável, nem janela, o X era
// `ghost` a 8 para fora, e o botão de pôr foto tinha 72 e nenhum nome fora de um `Field`.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, criarRegistroDeIcones, defaultStrings, ptBR, resolverTokens} from "../../packages/native/src/index.js";
import {PhotoInput} from "../../packages/native/src/sistema.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({camera: Glifo, x: Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES} strings={ptBR}>{children}</AureaProvider>;
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style) ?? {};
const FOTOS = [{uri: "a.jpg"}, {uri: "b.jpg", width: 400, height: 300}, {uri: "c.jpg"}];
const miniaturas = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "imagebutton");
const xs = () => __instancias("Pressable").filter((p) => String(p.accessibilityLabel).startsWith(ptBR.photoRemove));
const janela = () => __instancias("Modal").at(-1);

describe("R-22 · tocar na foto abre a foto", () => {
  it("cada miniatura é tocável e diz \"Foto n de total\" e que abre", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    expect(miniaturas().map((p) => p.accessibilityLabel)).toEqual(["Foto 1 de 3", "Foto 2 de 3", "Foto 3 de 3"]);
    expect(miniaturas().every((p) => p.accessibilityHint === "Abre a foto")).toBe(true);
  });
  it("com uma foto só, a miniatura diz só \"Foto\"", () => {
    render(<Envolve><PhotoInput value={[FOTOS[0]]} /></Envolve>);
    expect(miniaturas()[0].accessibilityLabel).toBe("Foto");
  });
  it("tocar abre a foto grande, inteira (`contain`), com o nome dela no título", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    expect(janela()?.visible).toBe(false);
    act(() => { (miniaturas()[1].onPress as () => void)(); });
    expect(janela()?.visible).toBe(true);
    expect(__instancias("Text").some((p) => p.children === "Foto 2 de 3")).toBe(true);
    const grande = __instancias("Image").at(-1)!;
    expect(grande.resizeMode).toBe("contain");
    expect((grande.source as {uri: string}).uri).toBe("b.jpg");
    // A proporção é a da foto, quando a câmera a deu (400 × 300).
    expect(estilo(grande).aspectRatio).toBeCloseTo(400 / 300);
  });
  it("fechar a janela volta para a lista", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    act(() => { (miniaturas()[0].onPress as () => void)(); });
    act(() => { (janela()!.onRequestClose as () => void)(); });
    expect(janela()?.visible).toBe(false);
  });
});

describe("R-22 · a miniatura e o botão de pôr foto", () => {
  it("a miniatura é quadrada de 64, com o canto da `Gallery`, e não um `Avatar`", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    const caixas = __instancias("View").map(estilo).filter((e) => e.width === t.size.space16 && e.position === "relative");
    expect(caixas).toHaveLength(3);
    const fotos = __instancias("Image").map(estilo);
    expect(fotos.every((e) => e.aspectRatio === 1 && e.borderRadius === t.size.radiusLg)).toBe(true);
  });
  it("o botão de pôr foto tem a mesma medida (64) e o mesmo canto", () => {
    render(<Envolve><PhotoInput /></Envolve>);
    const e = estilo(__instancias("Pressable").find((p) => p.accessibilityLabel === ptBR.photoAdd)!);
    expect([e.width, e.height, e.borderRadius]).toEqual([t.size.space16, t.size.space16, t.size.radiusLg]);
  });
  it("fora de um `Field`, o botão de pôr foto tem nome (antes ficava mudo)", () => {
    render(<AureaProvider icons={ICONES}><PhotoInput /></AureaProvider>);
    // O texto escrito, e não `defaultStrings.photoAdd`: no código de antes a chave não existe, e
    // `undefined === undefined` passaria com o botão mudo.
    expect(__instancias("Pressable").map((p) => p.accessibilityLabel)).toContain("Add photo");
  });
});

describe("R-22 · o X fora da foto", () => {
  it("o X diz \"Remover foto n\" e tira aquela foto", () => {
    const mudar = vi.fn();
    render(<Envolve><PhotoInput max={5} value={FOTOS} onChange={mudar} /></Envolve>);
    expect(xs().map((p) => p.accessibilityLabel)).toEqual(["Remover foto 1", "Remover foto 2", "Remover foto 3"]);
    act(() => { (xs()[1].onPress as () => void)(); });
    expect(mudar).toHaveBeenCalledWith([FOTOS[0], FOTOS[2]]);
  });
  it("o X tem fundo próprio", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    const circulos = __instancias("View").map(estilo)
      .filter((e) => e.width === t.size.controlHSm && e.height === t.size.controlHSm && e.borderRadius === t.size.radiusControl);
    // O quarto círculo do tamanho é o X de fechar da janela da foto grande, que fica montada.
    const comFundo = circulos.filter((e) => e.backgroundColor && e.backgroundColor !== "transparent");
    expect(comFundo).toHaveLength(3);
  });
  // MEDIDO, não olhado: o retângulo do DESENHO do X não toca o retângulo da foto. O alvo do X é
  // `targetMin` (44) com o desenho (30) no centro; o canto de baixo à esquerda do desenho fica no
  // canto de cima à direita da foto.
  it("o desenho do X fica TODO fora da foto", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    const lado = t.size.space16, x = t.size.controlHSm, alvo = Math.max(x, t.size.targetMin);
    const pos = __instancias("View").map(estilo).find((e) => e.position === "absolute" && typeof e.top === "number")!;
    const alvoEsq = lado + (pos.right as number) * -1 - alvo;  // `right` negativo: sai pela direita
    const desenho = {esq: alvoEsq + (alvo - x) / 2, topo: (pos.top as number) + (alvo - x) / 2};
    expect(desenho.esq).toBeGreaterThanOrEqual(lado);              // começa onde a foto acaba
    expect(desenho.topo + x).toBeLessThanOrEqual(0);              // termina onde a foto começa
  });
  it("a grade deixa espaço para o X em cima e à direita (no Android, toque fora do pai não chega)", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} /></Envolve>);
    const fora = (t.size.controlHSm + Math.max(t.size.controlHSm, t.size.targetMin)) / 2;
    const grade = __instancias("View").map(estilo).find((e) => e.flexWrap === "wrap")!;
    expect([grade.paddingTop, grade.paddingRight]).toEqual([fora, fora]);
  });
  it("inativo: a foto ainda abre, o X não remove", () => {
    render(<Envolve><PhotoInput max={5} value={FOTOS} disabled /></Envolve>);
    expect(xs().every((p) => p.disabled === true)).toBe(true);
    expect(typeof miniaturas()[0].onPress).toBe("function");
  });
});

describe("R-22 · as frases", () => {
  it("as quatro novas estão nos dois idiomas, e `positionOf` é a da web", () => {
    for (const chave of ["photo", "positionOf", "photoOpen", "photoAdd"] as const) {
      expect(defaultStrings[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).not.toBe(defaultStrings[chave]);
    }
    expect([defaultStrings.positionOf, ptBR.positionOf]).toEqual(["of", "de"]);
  });
});
