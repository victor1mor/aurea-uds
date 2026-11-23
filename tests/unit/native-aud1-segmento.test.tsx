// O AUD-1, parte 4 (aprovado em 22/11/2026, "Pode, com o nativo"): o `SegmentedControl` do nativo só desativava o controle
// INTEIRO; agora um segmento sozinho pode ficar indisponível (`disabled` no item), como a aba do `Tabs` do nativo e o segmento
// da web. Provado contra o defeito: no código da 0.76.0 o segmento com `disabled` escolhe e o leitor de tela o ouve disponível.
import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, SegmentedControl} from "../../packages/native/src/index.js";

const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const segmentos = () => __instancias("Pressable").filter((p) => p.accessibilityRole === "radio");
const estilo = (p: Record<string, unknown>) =>
  (StyleSheet.flatten(typeof p.style === "function" ? (p.style as (e: unknown) => unknown)({pressed: false}) : p.style) ?? {}) as Record<string, unknown>;

describe("AUD-1 parte 4 · o segmento indisponível no nativo", () => {
  it("o segmento com disabled não escolhe, fica apagado e é anunciado indisponível; os outros, não", () => {
    const muda = vi.fn();
    render(<Envolve><SegmentedControl value="lista" onChange={muda} items={[
      {value: "lista", label: "Lista"},
      {value: "mapa", label: "Mapa", disabled: true},
    ]}/></Envolve>);
    const [lista, mapa] = segmentos();
    expect(mapa.disabled).toBe(true);
    expect((mapa.accessibilityState as {disabled?: boolean} | undefined)?.disabled).toBe(true);
    expect(mapa.onPress).toBeUndefined();
    expect(estilo(mapa).opacity).toBeLessThan(1);
    expect(lista.disabled).toBeFalsy();
    expect(typeof lista.onPress).toBe("function");
    (lista.onPress as () => void)();
    expect(muda).toHaveBeenCalledWith("lista");
  });
});
