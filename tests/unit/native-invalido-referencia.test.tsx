// ADR-0094 (0.66.0, 11/11/2026): o campo inválido do NATIVO é o da referência, como o da web — o Victor viu as 21 formas
// lado a lado e escolheu "B como a referencia e Ember entra". O fundo não muda; a borda fica na cor da frase de erro; o
// rótulo do `Field` fica vermelho; a caixa de marcar vazia ganha o contorno e a marcada fica vermelha cheia; a chave não
// muda (a referência não tem inválido nela).
// Provado contra o defeito: no código de antes, a caixa de marcar não recebia o erro do `Field` (a borda continuava
// transparente) e o rótulo continuava na cor do texto — os três primeiros testes reprovam.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Checkbox, Field, Input, RadioGroup, Switch, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";

const t = resolverTokens("dark", "comfortable");
const ICONES = criarRegistroDeIcones({});
const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider icons={ICONES}>{children}</AureaProvider>;
const perigo = t.color.danger400 ?? t.color.destructive;
const estilos = (primitivo: string) => __instancias(primitivo).map((p) => StyleSheet.flatten(p.style) ?? {});
/** A marca da caixa: a única caixa quadrada pequena (metade da altura do controle). */
const marca = () => estilos("View").filter((s) => typeof s.width === "number" && s.width === s.height && s.width < 40).at(-1)!;
const corDoTexto = (texto: string) => {
  const p = __instancias("Text").filter((i) => i.children === texto).at(-1);
  return p ? StyleSheet.flatten(p.style)?.color : undefined;
};

describe("ADR-0094 — o inválido do nativo é o da referência", () => {
  it("a caixa vazia, dentro de um Field com erro, ganha o contorno vermelho e guarda o fundo", () => {
    render(<Envolve><Field label="Termos" error="Obrigatório"><Checkbox label="Aceito" /></Field></Envolve>);
    const comErro = marca();
    expect(comErro.borderColor).toBe(perigo);
    expect(comErro.backgroundColor).not.toBe(t.color.dangerBg);
  });

  it("a caixa MARCADA com erro fica vermelha cheia, com o visto branco", () => {
    render(<Envolve><Field label="Termos" error="Obrigatório"><Checkbox label="Aceito" checked /></Field></Envolve>);
    expect(marca().backgroundColor).toBe(t.color.destructive);
    const visto = __instancias("Path").at(-1);
    expect(visto?.stroke).toBe(t.color.destructiveForeground);
  });

  it("o rótulo do Field com erro fica na cor da frase de erro; sem erro, na cor do texto", () => {
    render(<Envolve><Field label="E-mail" error="Obrigatório"><Input /></Field></Envolve>);
    const vermelho = corDoTexto("Obrigatório");
    expect(vermelho).toBeDefined();
    expect(corDoTexto("E-mail")).toBe(vermelho);
    render(<Envolve><Field label="Nome"><Input /></Field></Envolve>);
    expect(corDoTexto("Nome")).not.toBe(vermelho);
  });

  it("a chave não muda com erro (a referência não tem inválido nela)", () => {
    const desenho = (erro?: string) => {
      // O dublê guarda as instâncias de todas as montagens: lê só as desta.
      const ini = __instancias("View").length;
      const {unmount} = render(<Envolve><Field label="Avisos" error={erro}><Switch label="Ligado" /></Field></Envolve>);
      const s = JSON.stringify(estilos("View").slice(ini));
      unmount();
      return s;
    };
    expect(desenho("Obrigatório")).toBe(desenho(undefined));
    // E o rótulo do campo com a chave também não fica vermelho (o desenho B aprovado).
    render(<Envolve><Field label="Avisos" error="Obrigatório"><Switch label="Ligado" /></Field></Envolve>);
    expect(corDoTexto("Avisos")).not.toBe(corDoTexto("Obrigatório"));
  });

  it("o item do RadioGroup com erro leva a marca do navegador (data-aurea-invalid); sem erro, não", () => {
    const marcas = (invalid: boolean) => {
      const ini = __instancias("Pressable").length;
      const {unmount} = render(<Envolve><RadioGroup label="Entrega" value="a" invalid={invalid}>
        <RadioGroup.Item value="a" label="Normal" /><RadioGroup.Item value="b" label="Expressa" />
      </RadioGroup></Envolve>);
      const n = __instancias("Pressable").slice(ini)
        .filter((p) => (p.dataSet as {aureaInvalid?: string} | undefined)?.aureaInvalid === "true").length;
      unmount();
      return n;
    };
    expect(marcas(true)).toBe(2);
    expect(marcas(false)).toBe(0);
  });
});
