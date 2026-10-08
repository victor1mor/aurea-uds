// R-24 (08/10/2026) · o selo PRESO do nativo, achado do app: no sino (`Badge anchor="top-end"` em
// volta de um `IconButton`), o "1" saía esticado (14,9 × 22) e 4,5 para FORA do círculo. Medido no
// `react-native-web` com o código real; as três causas:
//   1. ele se prendia ao canto da ÁREA DE TOQUE do `IconButton` (44), e não ao círculo (36);
//   2. o recuo era um `-8` fixo, sem token, e não o jeito da referência principal (encostar no
//      canto e sair 25% do próprio tamanho);
//   3. sobrava o recheio vertical do tamanho, e o selo de um dígito ficava mais alto que largo.
// O conserto segue a referência principal (o nativo dela não tem selo; vale a web dela, decisão do
// Victor: *"A, pode fazer"*). O dublê só registra o estilo; o efeito no desenho é medido na
// bancada do `react-native-web` e no `apps/native-smoke`.
// Provado contra o defeito: na 0.24.0 o selo tem `top`/`right` = -8, recheio vertical de 2 e
// nenhum `transform` — os testes abaixo reprovam.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Badge, IconButton, Text, resolverTokens} from "../../packages/native/src/index.js";
import {folgaDoToque} from "../../packages/native/src/actions.js";

const t = resolverTokens("light", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider theme="light">{children}</AureaProvider>;
type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
const selo = () => __instancias("View").map((p) => plano(p.style)).filter((e) => e.position === "absolute").at(-1)!;

describe("R-24 · a folga da área de toque do IconButton", () => {
  it("no md, o alvo de 44 passa 4 do círculo de 36 de cada lado", () => {
    const lado = t.size.controlHMd;
    expect(folgaDoToque(t, "md")).toBe((Math.max(lado, t.size.targetMin) - lado) / 2);
    expect(folgaDoToque(t, "md")).toBeGreaterThan(0);
  });
  it("quando o desenho já é maior que o alvo, não há folga", () => {
    expect(folgaDoToque(t, "xl")).toBe(Math.max(0, (Math.max(t.size.controlHXl, t.size.targetMin) - t.size.controlHXl) / 2));
  });
});

describe("R-24 · o selo preso, do jeito da referência principal", () => {
  it("no sino: preso ao CÍRCULO (a folga) e saindo 25% do mínimo de 16", () => {
    render(<Envolve><Badge anchor="top-end" count={1} tone="danger" emphasis="solid" size="sm">
      <IconButton name="bell" label="Avisos: 1" onPress={() => {}} />
    </Badge></Envolve>);
    const e = selo();
    const folga = folgaDoToque(t, "md");
    expect(e.top).toBe(folga);
    expect(e.right).toBe(folga);
    // Antes da primeira medida vale o mínimo: 25% de 16 = 4 para fora, nas duas direções.
    expect(e.transform).toEqual([{translateX: t.size.space4 * 0.25}, {translateY: -t.size.space4 * 0.25}]);
  });

  it("um dígito é um círculo de 16: mínimo nos dois lados, sem recheio vertical, com o fio do fundo", () => {
    render(<Envolve><Badge anchor="top-end" count={3} tone="danger" emphasis="solid" size="sm"><Text>x</Text></Badge></Envolve>);
    const e = selo();
    expect(e.minWidth).toBe(t.size.space4);
    expect(e.minHeight).toBe(t.size.space4);
    expect(e.paddingVertical).toBe(0);
    expect(e.borderWidth).toBe(t.size.borderWidth);
    expect(e.borderColor).toBe(t.color.background);
  });

  it("fora do IconButton não há folga: o selo encosta no canto do alvo", () => {
    render(<Envolve><Badge anchor="bottom-start" count={2}><Text>x</Text></Badge></Envolve>);
    const e = selo();
    expect(e.bottom).toBe(0);
    expect(e.left).toBe(0);
    // `md` preso: mínimo de 28; embaixo e no começo, o deslocamento troca de sinal.
    expect(e.transform).toEqual([{translateX: -t.size.space7 * 0.25}, {translateY: t.size.space7 * 0.25}]);
  });

  it("os mínimos por tamanho são os da referência: 16, 16, 28 e 32", () => {
    const minimo = (size: "xs" | "sm" | "md" | "lg") => {
      render(<Envolve><Badge anchor="top-end" count={5} size={size}><Text>x</Text></Badge></Envolve>);
      return selo().minHeight;
    };
    expect([minimo("xs"), minimo("sm"), minimo("md"), minimo("lg")])
      .toEqual([t.size.space4, t.size.space4, t.size.space7, t.size.space8]);
  });

  it("o selo SOLTO não muda: sem mínimo, sem transform, o recheio do tamanho", () => {
    render(<Envolve><Badge testID="solto" size="sm">Em dia</Badge></Envolve>);
    const e = plano(__instancias("View").filter((p) => p.testID === "solto").at(-1)?.style);
    expect(e.position).toBeUndefined();
    expect(e.minWidth).toBeUndefined();
    expect(e.transform).toBeUndefined();
    expect(e.paddingVertical).toBe(t.size.space05);
  });
});
