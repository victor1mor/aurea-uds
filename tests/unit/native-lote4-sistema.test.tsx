// Lote 4, a parte que chama o SISTEMA — `DatePicker` e `PhotoInput`.
//
// ⚠ **Este arquivo existe por causa de uma discordância registrada.** Eu recomendei ADIAR a
// câmera: ela não é componente, é fluxo — permissão, intenção, prévia, e o que acontece quando a
// pessoa nega. O Victor mandou fazer. Então cada pergunta de fluxo virou uma decisão declarada no
// JSDoc do `PhotoInput`, **e cada decisão virou um teste aqui**. É o que separa "entregue com
// suposições" de "entregue com suposições escondidas".
//
// Os dois módulos são NATIVOS: o diálogo de data e a câmera são código Kotlin/ObjC, e não existem
// no Node. O que se prova aqui é o CONTRATO — que caminho o componente toma, e o que ele faz com
// cada resposta do sistema.
import {render, act} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __chamadasDeSistema, __definirPlataforma, __instancias,
} from "./native-stubs/react-native";
import {__aberturas, __limparSeletor} from "./native-stubs/datetimepicker";
import {
  __chamadas, __definirPermissao, __definirResultado, __limparPicker,
} from "./native-stubs/expo-image-picker";

import {
  AureaProvider, Field, defaultStrings, resolverTokens, criarRegistroDeIcones,
} from "../../packages/native/src/index.js";
// ⚠ Caminho PRÓPRIO, e o teste importa dele de propósito: é assim que o consumidor importa, e é
// a prova de que os dois módulos nativos NÃO saem pelo barril principal (ADR-0038, mesma razão
// dos ícones). Se um dia alguém os exportar de `index.ts`, este import continua funcionando e
// não acusaria nada — por isso há um teste explícito para o barril, no fim do arquivo.
import {DatePicker, PhotoInput} from "../../packages/native/src/sistema.js";
import * as barril from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({
  "calendar": Glifo, "camera": Glifo, "close": Glifo, "warning--alt--filled": Glifo,
});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const props = (primitivo: string, n = 0) => __instancias(primitivo)[n] ?? {};
const ultimo = (primitivo: string) => __instancias(primitivo).at(-1) ?? {};
const estilo = (primitivo: string, n = 0) => StyleSheet.flatten(props(primitivo, n).style);

beforeEach(() => { __limparSeletor(); __limparPicker(); });

describe("DatePicker — a nossa pele, o calendário DELES", () => {
  // DEFEITO QUE QUEBRA METADE DOS APARELHOS: escrever só o caminho do Android. As duas APIs são
  // diferentes — imperativa lá, declarativa aqui —, e quem não souber vê "nada acontecer" no
  // iPhone sem nenhum erro no console.
  it("no Android abre o diálogo do sistema; no iOS monta o seletor", () => {
    __definirPlataforma("android");
    render(<Envolve><DatePicker /></Envolve>);
    act(() => { (props("Pressable").onPress as () => void)(); });
    expect(__aberturas).toHaveLength(1);
    expect(__aberturas[0].mode).toBe("date");

    __limparSeletor();
    __definirPlataforma("ios");
    render(<Envolve><DatePicker /></Envolve>);
    // No iOS o toque NÃO chama a API imperativa: ele monta o componente.
    act(() => { (ultimo("Pressable").onPress as () => void)(); });
    expect(__aberturas.some((a) => typeof a.onChange === "function" && a.value)).toBe(true);
  });

  // DEFEITO REAL DO ANDROID, e silencioso: no cancelamento o `value` volta preenchido. Gravar aí
  // salva uma data que ninguém escolheu — e a pessoa só descobre depois, no registro errado.
  it("cancelar NÃO grava data", () => {
    __definirPlataforma("android");
    const mudar = vi.fn();
    render(<Envolve><DatePicker onChange={mudar} /></Envolve>);
    act(() => { (props("Pressable").onPress as () => void)(); });
    const receber = __aberturas[0].onChange as (e: {type: string}, d?: Date) => void;

    act(() => { receber({type: "dismissed"}, new Date(2026, 8, 8)); });
    expect(mudar).not.toHaveBeenCalled();

    act(() => { receber({type: "set"}, new Date(2026, 8, 8)); });
    expect(mudar).toHaveBeenCalledTimes(1);
  });

  // DEFEITO: o gatilho sem valor anunciado. O leitor de tela diria "botão" e não que data está lá.
  it("o valor escolhido é anunciado; sem valor, o lugar fica vazio", () => {
    render(<Envolve><DatePicker /></Envolve>);
    expect(props("Pressable").accessibilityValue).toEqual({text: undefined});
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(defaultStrings.datePlaceholder);

    render(<Envolve><DatePicker value={new Date(2026, 8, 8)} format={() => "08/09/2026"} /></Envolve>);
    expect(ultimo("Pressable").accessibilityValue).toEqual({text: "08/09/2026"});
  });

  it("o gatilho tem a geometria do Input, e o Field o nomeia", () => {
    render(<Envolve><Field label="Data"><DatePicker /></Field></Envolve>);
    const e = estilo("Pressable");
    expect(e.height).toBe(tokens.size.controlHMd);
    expect(e.borderRadius).toBe(tokens.size.radiusControl);
    expect(props("Pressable").accessibilityLabel).toBe("Data");
  });
});

describe("PhotoInput — o fluxo que eu recomendei adiar", () => {
  // DECISÃO 1: com permissão, tira a foto e devolve. O caminho feliz, e o único que a maioria
  // dos apps testa.
  it("com permissão, tira a foto e devolve a lista", async () => {
    const mudar = vi.fn();
    render(<Envolve><PhotoInput onChange={mudar} /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    expect(__chamadas).toContain("camera");
    expect(mudar).toHaveBeenCalledWith([{uri: "file:///foto.jpg", width: undefined, height: undefined}]);
  });

  // DECISÃO 2, e é a que separa um app educado de um app quebrado: `canAskAgain: false` quer dizer
  // que o SISTEMA não vai mais mostrar o diálogo. Pedir de novo é uma chamada que não faz nada — a
  // pessoa toca, nada acontece, e o app parece travado.
  it("negado DE VEZ: não pede de novo, e mostra o caminho das configurações", async () => {
    __definirPermissao({granted: false, canAskAgain: false});
    const negou = vi.fn();
    render(<Envolve><PhotoInput onPermissionDenied={negou} /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });

    expect(__chamadas).not.toContain("request");
    expect(__chamadas).not.toContain("camera");
    expect(negou).toHaveBeenCalled();

    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(defaultStrings.cameraDenied);
    expect(textos).toContain(defaultStrings.openSettings);
  });

  // DECISÃO 3: negado mas o sistema ainda deixa perguntar — aí pergunta.
  it("negado com chance de perguntar: pergunta", async () => {
    __definirPermissao({granted: false, canAskAgain: true});
    render(<Envolve><PhotoInput /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    expect(__chamadas).toContain("request");
  });

  it("o botão de configurações abre as configurações do app", async () => {
    __definirPermissao({granted: false, canAskAgain: false});
    render(<Envolve><PhotoInput /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    const botao = __instancias("Pressable").find((p) => p.accessibilityLabel === defaultStrings.openSettings);
    act(() => { (botao!.onPress as () => void)(); });
    expect(__chamadasDeSistema).toContain("openSettings");
  });

  it("offerSettings={false} tira o caminho, e mantém o aviso", async () => {
    __definirPermissao({granted: false, canAskAgain: false});
    render(<Envolve><PhotoInput offerSettings={false} /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    const textos = __instancias("Text").map((p) => p.children);
    expect(textos).toContain(defaultStrings.cameraDenied);
    expect(textos).not.toContain(defaultStrings.openSettings);
  });

  // DECISÃO 4: cancelar a câmera não muda nada. Sem isto, fechar a câmera limparia a lista.
  it("cancelar a câmera não mexe na lista", async () => {
    __definirResultado({canceled: true});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput onChange={mudar} /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    expect(mudar).not.toHaveBeenCalled();
  });

  // DECISÃO 5: no limite o gatilho SOME, em vez de ficar aceso e não fazer nada — que é a pior
  // das duas, porque parece defeito.
  it("no limite, o gatilho some", () => {
    render(<Envolve><PhotoInput value={[{uri: "a"}]} max={1} /></Envolve>);
    const gatilhos = __instancias("Pressable")
      .filter((p) => p.accessibilityLabel !== defaultStrings.photoRemove);
    expect(gatilhos).toHaveLength(0);

    render(<Envolve><PhotoInput value={[{uri: "a"}]} max={2} /></Envolve>);
    const depois = __instancias("Pressable")
      .filter((p) => p.accessibilityLabel !== defaultStrings.photoRemove);
    expect(depois.length).toBeGreaterThan(0);
  });

  // DECISÃO 6: dá para tirar a foto de novo. Um anexo que não se remove é um anexo errado para
  // sempre.
  it("cada miniatura tem como remover, e remover devolve a lista sem ela", () => {
    const mudar = vi.fn();
    render(<Envolve><PhotoInput value={[{uri: "a"}, {uri: "b"}]} max={3} onChange={mudar} /></Envolve>);
    const remover = __instancias("Pressable")
      .filter((p) => p.accessibilityLabel === defaultStrings.photoRemove);
    expect(remover).toHaveLength(2);
    act(() => { (remover[0].onPress as () => void)(); });
    expect(mudar).toHaveBeenCalledWith([{uri: "b"}]);
  });

  // DECISÃO 7: `library` não pede permissão de câmera — pedir seria assustar a pessoa por nada.
  it("source=library abre a galeria e NÃO pede a câmera", async () => {
    render(<Envolve><PhotoInput source="library" /></Envolve>);
    await act(async () => { await (props("Pressable").onPress as () => Promise<void>)(); });
    expect(__chamadas).toContain("library");
    expect(__chamadas).not.toContain("get");
  });
});

describe("A fronteira do caminho profundo", () => {
  // DEFEITO: exportar os dois pelo barril principal por conveniência. Aí todo app que importasse
  // um `Button` traria os dois MÓDULOS NATIVOS ao grafo do Metro — o problema que a ADR-0038
  // resolveu para os 2571 ícones, com a mesma saída.
  it("DatePicker e PhotoInput NÃO saem pelo barril principal", () => {
    expect("DatePicker" in barril).toBe(false);
    expect("PhotoInput" in barril).toBe(false);
  });
});
