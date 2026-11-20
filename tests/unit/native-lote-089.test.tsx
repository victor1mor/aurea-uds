// O lote 089 (0.75.0) no nativo — o achado 2 do 2-D (o Victor, 19/11/2026: *"Aprovo as três"*): o fio do escolhido
// tinha 15 de recuo escrito à mão. Hoje só a aba `secondary` o usa, e a aba dela é quadrada: o fio vai de ponta a ponta,
// como na web. Provado contra o defeito: com o `estilos.ts` da 0.74.0 (left/right 15), reprova.
import {describe, expect, it} from "vitest";
import "./native-stubs/react-native";
import {resolverTokens} from "../../packages/native/src/index.js";
import {fioDoEscolhido} from "../../packages/native/src/estilos.js";

describe("o fio do escolhido no nativo (achado 2)", () => {
  it("vai de ponta a ponta da aba, na base, com 2 de altura", () => {
    const f = fioDoEscolhido(resolverTokens("light", "comfortable")) as Record<string, unknown>;
    expect([f.position, f.left, f.right, f.bottom, f.height]).toEqual(["absolute", 0, 0, 0, 2]);
  });
});
