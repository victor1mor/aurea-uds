// 0.68.0, a regra dos dois alvos (CLAUDE.md §8): na web, o `Field` passou a dar o nome e a frase de erro ao campo do
// `NumberField`, do `OTPField`, do `InputGroup` e do `FileInput`. No NATIVO as quatro já recebiam os dois do `Field`, pelo
// contexto (`useCampo`): o rótulo vira o `accessibilityLabel` e a frase de erro o `accessibilityHint`. Este teste prende
// isso, para o nativo não perder o que a web acabou de ganhar. Ele passa no código de antes: é guarda, não conserto.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {__instancias} from "./native-stubs/react-native";
import {AureaProvider, Field, Input, InputGroup, NumberField, criarRegistroDeIcones} from "../../packages/native/src/index.js";
import {OTPField} from "../../packages/native/src/escolha.js";
import {FileInput} from "../../packages/native/src/arquivo.js";

const ICONES = criarRegistroDeIcones({});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider icons={ICONES}>{children}</AureaProvider>;
/** Os nomes e as dicas de acessibilidade de TODAS as instâncias montadas daqui em diante. */
function leituras(montar: () => void) {
  const prims = ["TextInput", "Pressable", "View", "TouchableOpacity"];
  const ini = Object.fromEntries(prims.map((p) => [p, __instancias(p).length]));
  montar();
  return prims.flatMap((p) => __instancias(p).slice(ini[p])).filter((i) => i.accessibilityLabel != null)
    .map((i) => ({nome: String(i.accessibilityLabel), dica: i.accessibilityHint as string | undefined}));
}

const PECAS: Array<[string, React.ReactElement]> = [
  ["NumberField", <NumberField defaultValue={0} />],
  ["OTPField", <OTPField length={3} />],
  ["InputGroup", <InputGroup><Input defaultValue="example" /></InputGroup>],
  ["FileInput", <FileInput />],
];

describe("no nativo, o Field já dá o nome e a frase de erro às quatro peças", () => {
  for (const [nome, peca] of PECAS) {
    it(`${nome}: o campo leva o rótulo no nome e a frase de erro na dica`, () => {
      const lidas = leituras(() => render(<Envolve><Field label="Rótulo do campo" error="Frase do erro">{peca}</Field></Envolve>));
      const campo = lidas.find((l) => l.nome.includes("Rótulo do campo"));
      expect(campo, JSON.stringify(lidas)).toBeDefined();
      expect(campo!.dica).toBe("Frase do erro");
    });
  }
});
