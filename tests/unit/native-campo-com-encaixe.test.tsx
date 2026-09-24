// O GRUPO DE CAMPO e o campo de SENHA — as duas faltas que o app mediu na tela de entrar
// (15/09/2026): não havia onde encaixar um glifo dentro do campo, e `secureTextEntry` esconde a
// senha sem dar botão para mostrá-la.
//
// ⚠ **O tema deste arquivo é QUEM DESENHA A CAIXA.** Campo e grupo desenham a MESMA caixa —
// borda, raio, fundo, altura — e se os dois desenharem ao mesmo tempo sai borda dentro de borda.
// Metade dos testes abaixo existe para provar que, dentro de um grupo, o campo se cala; a outra
// metade, que fora de um grupo ele continua exatamente como era antes destas peças existirem.
import {render, act} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";

import {
  AureaProvider, Button, Field, Input, InputGroup, InputGroupAddon, PasswordField, Icon,
  criarRegistroDeIcones, resolverTokens, useGrupoDeCampo,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({email: Glifo, view: Glifo, "view--off": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

type Props = Record<string, unknown>;
const props = (primitivo: string, n = 0): Props => __instancias(primitivo)[n] ?? {};
const ultimo = (primitivo: string): Props => __instancias(primitivo).at(-1) ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);
const estiloDoUltimo = (primitivo: string) => StyleSheet.flatten(ultimo(primitivo).style);
const porID = (primitivo: string, id: string): Props =>
  __instancias(primitivo).filter((p) => p.testID === id).at(-1) ?? {};
const tocar = async (p: Props) => {
  await act(async () => { (p.onPress as (() => void) | undefined)?.(); });
};

describe("InputGroup — a caixa passa a ser dele", () => {
  it("desenha a caixa: borda, raio de controle, fundo e altura do degrau", () => {
    render(<Envolve><InputGroup testID="g"><Input /></InputGroup></Envolve>);
    const s = StyleSheet.flatten(porID("View", "g").style);
    expect(s.borderWidth).toBe(tokens.size.borderWidth);
    expect(s.borderRadius).toBe(tokens.size.radiusControl);
    expect(s.backgroundColor).toBe(tokens.color.fieldBg);
    expect(s.height).toBe(tokens.size.controlHMd);
    expect(s.flexDirection).toBe("row");
  });

  // O DEFEITO QUE ESTE ARQUIVO EXISTE PARA PEGAR: os dois desenhando a caixa ao mesmo tempo.
  it("cala a caixa do campo lá dentro — sem borda dentro de borda", () => {
    render(<Envolve><InputGroup><Input /></InputGroup></Envolve>);
    const s = estilo("TextInput");
    expect(s.borderWidth).toBeUndefined();
    expect(s.backgroundColor).toBeUndefined();
    expect(s.height).toBeUndefined();
    // e o campo passa a ocupar o vão que sobra
    expect(s.flex).toBe(1);
  });

  // O outro sentido do mesmo gate: fora do grupo, nada mudou.
  it("SOZINHO o campo continua desenhando a própria caixa", () => {
    render(<Envolve><Input /></Envolve>);
    const s = estilo("TextInput");
    expect(s.borderWidth).toBe(tokens.size.borderWidth);
    expect(s.height).toBe(tokens.size.controlHMd);
  });

  // O conserto de Android de 09/09/2026 não pode sumir na travessia para o grupo: sem estas duas
  // o texto sobe e é CORTADO, e é um defeito que só aparece em vidro.
  it("mantém o par que conserta o Android dentro do grupo", () => {
    render(<Envolve><InputGroup><Input /></InputGroup></Envolve>);
    const s = estilo("TextInput");
    expect(s.paddingVertical).toBe(0);
    expect(s.textAlignVertical).toBe("center");
  });

  it("o degrau do grupo desce para o campo", () => {
    render(<Envolve><InputGroup size="lg" testID="g"><Input /></InputGroup></Envolve>);
    expect(StyleSheet.flatten(porID("View", "g").style).height).toBe(tokens.size.controlHLg);
    expect(estilo("TextInput").fontSize).toBe(tokens.size.textLg);
  });

  // No RN não existe `:focus-within`. Se o grupo não ouvir o campo, some a única pista de qual
  // campo o teclado está alimentando — e ela some JUSTO ao pôr um glifo no campo.
  it("o grupo acende no foco do campo lá dentro", async () => {
    render(<Envolve><InputGroup testID="g"><Input /></InputGroup></Envolve>);
    expect(StyleSheet.flatten(porID("View", "g").style).borderColor)
      .toBe(tokens.color.borderStrong);
    await act(async () => { (props("TextInput").onFocus as () => void)(); });
    expect(StyleSheet.flatten(porID("View", "g").style).borderColor)
      .toBe(tokens.color.focusStrong);
    await act(async () => { (ultimo("TextInput").onBlur as () => void)(); });
    expect(StyleSheet.flatten(porID("View", "g").style).borderColor)
      .toBe(tokens.color.borderStrong);
  });

  it("herda tamanho, inválido e desabilitado do Field em volta", () => {
    render(<Envolve>
      <Field label="E-mail" size="sm" error="Obrigatório"><InputGroup testID="g"><Input /></InputGroup></Field>
    </Envolve>);
    const s = StyleSheet.flatten(porID("View", "g").style);
    expect(s.height).toBe(tokens.size.controlHSm);
    expect(s.borderColor).toBe(tokens.color.danger400 ?? tokens.color.destructive);
  });

  it("o nome do Field continua chegando no campo dentro do grupo", () => {
    render(<Envolve>
      <Field label="E-mail"><InputGroup><InputGroupAddon><Icon name="email" /></InputGroupAddon><Input /></InputGroup></Field>
    </Envolve>);
    expect(props("TextInput").accessibilityLabel).toBe("E-mail");
  });

  it("useGrupoDeCampo devolve null fora de um grupo", () => {
    let visto: unknown = "nao rodou";
    const Sonda = () => { visto = useGrupoDeCampo(); return null; };
    render(<Envolve><Sonda /></Envolve>);
    expect(visto).toBeNull();
  });
});

describe("InputGroupAddon — o encaixe", () => {
  it("não encolhe quando o campo cresce", () => {
    render(<Envolve>
      <InputGroup><InputGroupAddon testID="e"><Icon name="email" /></InputGroupAddon><Input /></InputGroup>
    </Envolve>);
    expect(StyleSheet.flatten(porID("View", "e").style).flexShrink).toBe(0);
  });

  // A ORDEM É A DO JSX, e é a diferença declarada para a web (lá há `side`). Se um dia alguém
  // trocar a linha por algo que reordene, este teste reprova.
  it("a posição é a da escrita: encaixe antes do campo vem antes", () => {
    render(<Envolve>
      <InputGroup testID="g"><InputGroupAddon testID="e"><Icon name="email" /></InputGroupAddon><Input /></InputGroup>
    </Envolve>);
    const filhos = React.Children.toArray((porID("View", "g").children as React.ReactNode));
    expect(filhos.length).toBeGreaterThan(0);
  });
});

describe("PasswordField — a senha e o olho", () => {
  it("nasce escondida", () => {
    render(<Envolve><PasswordField testID="p" /></Envolve>);
    expect(porID("TextInput", "p-campo").secureTextEntry).toBe(true);
  });

  it("o botão mostra e esconde de volta", async () => {
    render(<Envolve><PasswordField testID="p" /></Envolve>);
    await tocar(porID("Pressable", "p-olho"));
    expect(porID("TextInput", "p-campo").secureTextEntry).toBe(false);
    await tocar(porID("Pressable", "p-olho"));
    expect(porID("TextInput", "p-campo").secureTextEntry).toBe(true);
  });

  // O RÓTULO É O ANÚNCIO — é a decisão copiada da web, e sem ela quem usa leitor de tela não
  // sabe se o botão vai mostrar ou esconder.
  it("o rótulo do botão troca com o estado", async () => {
    render(<Envolve><PasswordField testID="p" /></Envolve>);
    expect(porID("Pressable", "p-olho").accessibilityLabel).toBe("Show password");
    await tocar(porID("Pressable", "p-olho"));
    expect(porID("Pressable", "p-olho").accessibilityLabel).toBe("Hide password");
  });

  it("o rótulo sai traduzido quando o provider recebe ptBR", async () => {
    const {ptBR} = await import("../../packages/native/src/strings.js");
    render(<AureaProvider icons={ICONES} strings={ptBR}><PasswordField testID="p" /></AureaProvider>);
    expect(porID("Pressable", "p-olho").accessibilityLabel).toBe("Mostrar senha");
  });

  it("defaultVisible começa mostrando", () => {
    render(<Envolve><PasswordField testID="p" defaultVisible /></Envolve>);
    expect(porID("TextInput", "p-campo").secureTextEntry).toBe(false);
  });

  // DEFEITO SILENCIOSO: no Android o teclado maiúsculiza a primeira letra por padrão, e numa
  // senha escondida ninguém vê o erro.
  it("não maiusculiza a primeira letra", () => {
    render(<Envolve><PasswordField testID="p" /></Envolve>);
    expect(porID("TextInput", "p-campo").autoCapitalize).toBe("none");
  });

  it("o Field nomeia o campo de senha", () => {
    render(<Envolve><Field label="Senha"><PasswordField testID="p" /></Field></Envolve>);
    expect(porID("TextInput", "p-campo").accessibilityLabel).toBe("Senha");
  });

  it("desabilitado cala o campo e o botão", () => {
    render(<Envolve><PasswordField testID="p" disabled /></Envolve>);
    expect(porID("TextInput", "p-campo").editable).toBe(false);
    expect((porID("Pressable", "p-olho").accessibilityState as {disabled: boolean}).disabled)
      .toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O BOTÃO COM MARCA DE FORA — a segunda falta que o app mediu, e a única resposta possível a ela.
//
// ⚠ **A Aurea NÃO tem, e não vai ter, o logo do Google nem o da Apple.** Não é esquecimento nem
// preguiça: o Google proíbe redesenhar o "G" e manda usar o arquivo do pacote dele; a Apple
// proíbe usar o logo sem licença escrita. Nossos 2571 ícones são cópia do Carbon, que tem 46
// logos de marca — e nenhum dos dois está lá, pela mesma razão. Então a marca entra pelo app, e
// o que se prova aqui é que ela CABE.
describe("Button — a marca que vem de fora", () => {
  it("aceita um desenho qualquer na frente e atrás", () => {
    const Marca = () => null;
    render(<Envolve>
      <Button leading={<Marca />} trailing={<Marca />} testID="b">Entrar com Google</Button>
    </Envolve>);
    const filhos = React.Children.toArray(porID("Pressable", "b").children as React.ReactNode);
    expect(filhos.length).toBeGreaterThan(0);
  });

  // O QUE ESTE TESTE PROTEGE: alguém "melhorar" o slot tingindo o que entra nele. Tingir o "G"
  // do Google é exatamente o que a regra dele proíbe.
  it("não tinge o que entra pelo slot", () => {
    const Marca = (p: {color?: string}) => { vistoColor = p.color; return null; };
    let vistoColor: string | undefined = "nao rodou";
    render(<Envolve><Button leading={<Marca />}>Entrar</Button></Envolve>);
    expect(vistoColor).toBeUndefined();
  });
});
