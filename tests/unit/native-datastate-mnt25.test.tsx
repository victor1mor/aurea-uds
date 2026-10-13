// MNT-25 (passo 10, 0.32.0) — a barreira de erro no NATIVO, a mesma da web: `DataState catchErrors`.
// O que quebra dentro vira a cara de erro (a frase e "Tentar de novo"), o app recebe o erro em `onCatch`,
// e "Tentar de novo" desenha de novo o conteúdo. Lido pelo dublê de `react-native`, como os outros.
import {render, act} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {__instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, DataState, Text, criarRegistroDeIcones, ptBR, ICONE_DA_VARIANTE} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones(Object.fromEntries([...Object.values(ICONE_DA_VARIANTE), "file", "close", "x", "x-bold"].map((n) => [n, Glifo])));
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider icons={ICONES} strings={ptBR}>{children}</AureaProvider>;
const textos = () => __instancias("Text").map((p) => p.children).flat();

let quebrar = true;
function Painel(): React.ReactElement {
  if (quebrar) throw new Error("o painel leu uma lista nula");
  return <Text>Painel de evidência</Text>;
}

describe("DataState catchErrors · a barreira de erro do nativo", () => {
  it("o que quebra vira a cara de erro, o app recebe o erro, e Tentar de novo desenha de novo", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    const onCatch = vi.fn();
    quebrar = true;
    render(<Envolve><DataState catchErrors onCatch={onCatch}><Painel /></DataState></Envolve>);
    expect(textos()).toContain(ptBR.dataCrashed);
    expect(textos()).toContain(ptBR.dataRetry);
    expect(onCatch).toHaveBeenCalledTimes(1);
    quebrar = false;
    // Na cara de erro o único tocável é o "Tentar de novo" (o aviso não tem X: não há `onDismiss`). O dublê
    // guarda CADA desenho, e o React desenha a cara de erro duas vezes ao se recuperar: vale o último.
    const tocaveis = __instancias("Pressable");
    expect(tocaveis.every((t) => t.accessibilityRole === "button")).toBe(true);
    const botao = tocaveis.at(-1)!;
    __limpar(); // daqui para a frente, só o que o "Tentar de novo" desenha
    act(() => { (botao.onPress as () => void)(); });
    expect(textos()).toContain("Painel de evidência");
    expect(textos()).not.toContain(ptBR.dataCrashed);
    silencio.mockRestore();
  });

  it("sem catchErrors, o erro sobe como antes", () => {
    const silencio = vi.spyOn(console, "error").mockImplementation(() => {});
    quebrar = true;
    expect(() => render(<Envolve><DataState><Painel /></DataState></Envolve>)).toThrow("o painel leu uma lista nula");
    silencio.mockRestore();
  });
});
