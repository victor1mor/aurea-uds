// O `Topbar` do nativo passa a se chamar `Header` (07/10/2026), o mesmo nome da web — decisão do
// Victor (*"pode alterar nome não tem problema"*) e regra dele de não excluir componente: o
// `Topbar` continua, igual. Provado contra o defeito: na 0.22.0 o `Header` não existe no barril.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Header, Topbar, resolverTokens} from "../../packages/native/src/index.js";

const claro = resolverTokens("light", "comfortable");
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider theme="light">{children}</AureaProvider>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Record<string, unknown>;
const ultima = (id: string) => __instancias("View").filter((p) => p.testID === id).at(-1);

describe("Header (o antigo Topbar), no nativo", () => {
  it("o Header desenha a barra, com o recuo e o inset de sempre", () => {
    render(<Envolve><Header testID="h" variant="flush" inset="page" /></Envolve>);
    expect(plano(ultima("h")?.style).paddingHorizontal).toBe(claro.size.space4);
  });
  it.each(["floating", "flush", "pill"] as const)("o Topbar sai igual ao Header na variante %s", (variant) => {
    render(<Envolve><Header testID={`h-${variant}`} variant={variant} /></Envolve>);
    render(<Envolve><Topbar testID={`t-${variant}`} variant={variant} /></Envolve>);
    expect(plano(ultima(`t-${variant}`)?.style)).toEqual(plano(ultima(`h-${variant}`)?.style));
  });
});
