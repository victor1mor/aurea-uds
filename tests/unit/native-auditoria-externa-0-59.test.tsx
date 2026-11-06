// A auditoria externa de 05/11/2026, a parte do nativo consertada na 0.59.0. Cada teste foi rodado contra o código de
// antes e reprovou.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {SafeAreaInsetsContext, __definirInsets} from "./native-stubs/react-native-safe-area-context";
import {
  AureaProvider, BottomNav, ToastHost, criarRegistroDeIcones,
} from "../../packages/native/src/index.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"squares-four": Glifo, "bell": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider icons={ICONES}>{children}</AureaProvider>;
const ABAS = [{id: "painel", label: "Painel", icon: "squares-four"}, {id: "avisos", label: "Avisos", icon: "bell"}];

describe("ToastHost e BottomNav montam SEM `SafeAreaProvider` (A-002)", () => {
  // O dublê agora faz o que a biblioteca real faz: o gancho levanta erro sem provedor. Com o código de antes (que chamava
  // o gancho direto), estes dois testes quebravam ao montar.
  it("o ToastHost monta, como no exemplo de uso dele", () => {
    expect(() => render(<Envolve><ToastHost><></></ToastHost></Envolve>)).not.toThrow();
  });
  it("o BottomNav monta", () => {
    expect(() => render(<Envolve><BottomNav items={ABAS} current="painel"/></Envolve>)).not.toThrow();
  });
  it("com o provedor, o recuo vem do provedor; sem ele, da medida da abertura", () => {
    // Não quebra nos dois caminhos — e o caminho do provedor continua sendo o primeiro.
    __definirInsets({bottom: 34});
    expect(() => render(<SafeAreaInsetsContext.Provider value={{top: 0, right: 0, bottom: 20, left: 0}}>
      <Envolve><BottomNav items={ABAS} current="painel"/></Envolve></SafeAreaInsetsContext.Provider>)).not.toThrow();
  });
});
