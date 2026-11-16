// O D16 no nativo (0.72.0; aprovado pelo Victor em 19/10/2026, e a bancada em 16/11/2026: "Pode"): o `AureaProvider` sem
// `theme` segue o aparelho, e quando o aparelho NÃO DIZ o tema (`useColorScheme` devolve `null`), o claro — como a web.
// Provado contra o defeito: com o `TEMA_PADRAO` da 0.71.0 ("dark"), o aparelho que não diz dá o escuro e reprova.
import {render, screen} from "@testing-library/react";
import * as React from "react";
import {afterEach, describe, expect, it} from "vitest";
import {__esquemaDoAparelho} from "./native-stubs/react-native";
import {AureaProvider, useAureaTheme} from "../../packages/native/src/index.js";

function Sonda() {
  const {theme} = useAureaTheme();
  return <span data-testid="tema">{theme}</span>;
}

afterEach(() => { __esquemaDoAparelho("dark"); });

describe("D16 · o tema do nativo quando ninguém escolheu", () => {
  it("o aparelho não diz o tema: o claro", () => {
    __esquemaDoAparelho(null);
    render(<AureaProvider><Sonda /></AureaProvider>);
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
  });
  it("o aparelho diz: o dele, nos dois casos", () => {
    __esquemaDoAparelho("dark");
    const {unmount} = render(<AureaProvider><Sonda /></AureaProvider>);
    expect(screen.getByTestId("tema")).toHaveTextContent("dark");
    unmount();
    __esquemaDoAparelho("light");
    render(<AureaProvider><Sonda /></AureaProvider>);
    expect(screen.getByTestId("tema")).toHaveTextContent("light");
  });
  it("o `theme` pedido manda sobre o aparelho", () => {
    __esquemaDoAparelho(null);
    render(<AureaProvider theme="dark"><Sonda /></AureaProvider>);
    expect(screen.getByTestId("tema")).toHaveTextContent("dark");
  });
});
