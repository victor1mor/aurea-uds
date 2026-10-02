// R-21 (02/10/2026) · o `FileInput` do nativo: escolher um arquivo do aparelho, no molde do
// `PhotoInput`, por `@aurea-uds/native/system/file`. Proposta aprovada pelo Victor (*"3 sim"*).
//
// O seletor é do sistema; o que se prova aqui é o CONTRATO — o que a peça pede ao seletor, e o
// que ela faz com cada resposta: cancelado, aceito, grande demais, tipo errado, tamanho ausente.
// E a decisão de arquitetura: a peça NÃO mora no `/system`, para quem usa o `DatePicker` não ter
// de instalar o `expo-document-picker`.
import {render, act} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {__definirDocumentos, __limparDocumentos, __pedidos} from "./native-stubs/expo-document-picker";
import {
  AureaProvider, Field, criarRegistroDeIcones, defaultStrings, ptBR, resolverTokens,
} from "../../packages/native/src/index.js";
import {FileInput, aceitaTipo, formatarTamanho} from "../../packages/native/src/arquivo.js";
import * as barril from "../../packages/native/src/index.js";
import * as sistema from "../../packages/native/src/sistema.js";

const t = resolverTokens("dark", "comfortable");
const Glifo = () => null;
const ICONES = criarRegistroDeIcones({"paperclip": Glifo, "file-text": Glifo, "x": Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;
const estilo = (p: Record<string, unknown>) => StyleSheet.flatten(p.style) ?? {};
const gatilho = () => __instancias("Pressable").filter((p) =>
  typeof p.accessibilityLabel === "string" && p.accessibilityLabel.endsWith(defaultStrings.fileChoose)).at(-1);
const tocar = async () => {
  await act(async () => { await (gatilho()!.onPress as () => Promise<void>)(); });
};
const textos = () => __instancias("Text").map((p) => p.children).flat().filter((c) => typeof c === "string");
const ativo = (nome: string, size?: number, mimeType = "application/pdf") =>
  ({uri: `file:///cache/${nome}`, name: nome, size, mimeType, lastModified: 0});

beforeEach(() => { __limparDocumentos(); });

describe("R-21 · o que a peça pede ao seletor", () => {
  it("escolhe e devolve uri, nome, tamanho e tipo — e nada do conteúdo", async () => {
    const mudar = vi.fn();
    render(<Envolve><FileInput onChange={mudar} /></Envolve>);
    await tocar();
    expect(mudar).toHaveBeenCalledWith([
      {uri: "file:///cache/doc.pdf", name: "doc.pdf", size: 2048, mimeType: "application/pdf"},
    ]);
  });
  it("o `accept` vira o `type` do seletor; sem `accept`, o seletor fica no padrão dele", async () => {
    render(<Envolve><FileInput accept="application/pdf" /></Envolve>);
    await tocar();
    expect(__pedidos.at(-1)).toMatchObject({type: "application/pdf"});
    render(<Envolve><FileInput /></Envolve>);
    await tocar();
    expect(__pedidos.at(-1)).not.toHaveProperty("type");
  });
  it("pede vários só quando cabe mais de um", async () => {
    render(<Envolve><FileInput /></Envolve>);
    await tocar();
    expect(__pedidos.at(-1)).toMatchObject({multiple: false});
    render(<Envolve><FileInput max={3} /></Envolve>);
    await tocar();
    expect(__pedidos.at(-1)).toMatchObject({multiple: true});
  });
});

describe("R-21 · o que a peça faz com a resposta", () => {
  it("cancelar não muda nada: nem a lista, nem o aviso", async () => {
    __definirDocumentos({canceled: true, assets: null});
    const mudar = vi.fn();
    render(<Envolve><FileInput onChange={mudar} /></Envolve>);
    await tocar();
    expect(mudar).not.toHaveBeenCalled();
    expect(textos().some((x) => x.includes(defaultStrings.fileTooLarge))).toBe(false);
  });
  it("maior que o `maxSize`: recusa, avisa em vermelho e anuncia", async () => {
    __definirDocumentos({canceled: false, assets: [ativo("grande.pdf", 5 * 1024 * 1024)]});
    const mudar = vi.fn();
    render(<Envolve><FileInput maxSize={1024 * 1024} onChange={mudar} /></Envolve>);
    await tocar();
    expect(mudar).not.toHaveBeenCalled();
    // A borda do gatilho fica vermelha, como a do campo inválido.
    expect(estilo(gatilho()!).borderColor).toBe(t.color.danger400 ?? t.color.destructive);
    expect(textos()).toContain(`${defaultStrings.fileTooLarge}: grande.pdf`);
    const aviso = __instancias("Text").find((p) => p.children === `${defaultStrings.fileTooLarge}: grande.pdf`)!;
    // O mesmo vermelho e o mesmo tamanho do erro do `Field`, que é onde o olho procura erro.
    render(<Envolve><Field label="x" error="erro do campo"><FileInput /></Field></Envolve>);
    const doCampo = __instancias("Text").find((p) => p.children === "erro do campo")!;
    expect(estilo(aviso).color).toBe(estilo(doCampo).color);
    expect(estilo(aviso).fontSize).toBe(estilo(doCampo).fontSize);
    expect(__instancias("View").some((p) => p.accessibilityLiveRegion === "polite")).toBe(true);
  });
  it("do tipo errado: recusa, mesmo que o seletor do sistema tenha deixado passar", async () => {
    __definirDocumentos({canceled: false, assets: [ativo("foto.png", 10, "image/png")]});
    const mudar = vi.fn();
    render(<Envolve><FileInput accept="application/pdf" onChange={mudar} /></Envolve>);
    await tocar();
    expect(mudar).not.toHaveBeenCalled();
    expect(textos()).toContain(`${defaultStrings.fileWrongType}: foto.png`);
  });
  it("sem tamanho informado, aceita: não há o que medir, e o servidor confere", async () => {
    __definirDocumentos({canceled: false, assets: [ativo("sem-tamanho.pdf")]});
    const mudar = vi.fn();
    render(<Envolve><FileInput maxSize={10} onChange={mudar} /></Envolve>);
    await tocar();
    expect(mudar).toHaveBeenCalledTimes(1);
  });
  it("no meio de vários, recusa só o grande e guarda os outros, até o limite", async () => {
    __definirDocumentos({canceled: false, assets: [
      ativo("a.pdf", 10), ativo("grande.pdf", 9999), ativo("b.pdf", 10), ativo("c.pdf", 10),
    ]});
    const mudar = vi.fn();
    render(<Envolve><FileInput max={2} maxSize={100} onChange={mudar} /></Envolve>);
    await tocar();
    expect((mudar.mock.calls[0][0] as Array<{name: string}>).map((a) => a.name)).toEqual(["a.pdf", "b.pdf"]);
  });
});

describe("R-21 · o que aparece", () => {
  const DOC = {uri: "file:///cache/relatorio-anual-de-atividades-2026.pdf",
               name: "relatorio-anual-de-atividades-2026.pdf", size: 1536, mimeType: "application/pdf"};

  it("com o limite atingido, o gatilho SOME", () => {
    render(<Envolve><FileInput value={[DOC]} /></Envolve>);
    expect(gatilho()).toBeUndefined();
  });
  it("o gatilho tem a medida do campo: altura `controlHMd` e cápsula", () => {
    render(<Envolve><FileInput /></Envolve>);
    const e = estilo(gatilho()!);
    expect(e.height).toBe(t.size.controlHMd);
    expect(e.borderRadius).toBe(t.size.radiusControl);
    expect(e.borderColor).toBe(t.color.borderStrong);
  });
  it("nome comprido corta no MEIO, para a extensão continuar à vista", () => {
    render(<Envolve><FileInput value={[DOC]} /></Envolve>);
    const nome = __instancias("Text").find((p) => p.children === DOC.name)!;
    expect(nome.numberOfLines).toBe(1);
    expect(nome.ellipsizeMode).toBe("middle");
  });
  it("o tamanho aparece com a conta da web", () => {
    render(<Envolve><FileInput value={[DOC]} /></Envolve>);
    expect(textos()).toContain("1.5 KB");
  });
  it("o X remove aquele arquivo", () => {
    const mudar = vi.fn();
    render(<Envolve><FileInput max={3} value={[DOC, {...DOC, uri: "file:///b", name: "b.pdf"}]} onChange={mudar} /></Envolve>);
    const x = __instancias("Pressable").find((p) => p.accessibilityLabel === `${defaultStrings.fileRemove} b.pdf`)!;
    act(() => { (x.onPress as () => void)(); });
    expect(mudar).toHaveBeenCalledWith([DOC]);
  });
  it("inativo, o gatilho não abre nada", () => {
    render(<Envolve><FileInput disabled /></Envolve>);
    expect(gatilho()!.onPress).toBeUndefined();
    expect(estilo(gatilho()!).opacity).toBe(t.size.opacityDisabled);
  });
});

describe("R-21 · o leitor de tela", () => {
  it("o gatilho é um botão com o nome do `Field` e o texto dele", () => {
    render(<Envolve><Field label="Documento"><FileInput /></Field></Envolve>);
    expect(gatilho()!.accessibilityRole).toBe("button");
    expect(gatilho()!.accessibilityLabel).toBe(`Documento, ${defaultStrings.fileChoose}`);
  });
  it("cada arquivo lê nome e tamanho, num elemento só, sem o X dentro", () => {
    render(<Envolve><FileInput value={[{uri: "u", name: "doc.pdf", size: 2048}]} /></Envolve>);
    const linha = __instancias("View").find((p) => p.accessible === true && p.accessibilityLabel === "doc.pdf, 2.0 KB");
    expect(linha).toBeDefined();
  });
  it("o X lê \"Remover <nome>\" em português", () => {
    render(<AureaProvider icons={ICONES} strings={ptBR}><FileInput value={[{uri: "u", name: "doc.pdf"}]} /></AureaProvider>);
    expect(__instancias("Pressable").some((p) => p.accessibilityLabel === "Remover doc.pdf")).toBe(true);
  });
  it("as quatro frases novas estão nos dois idiomas, e as três da web são as de lá", () => {
    for (const chave of ["fileChoose", "fileRemove", "fileTooLarge", "fileWrongType"] as const) {
      expect(defaultStrings[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).toBeTruthy();
      expect(ptBR[chave], chave).not.toBe(defaultStrings[chave]);
    }
    expect(ptBR.fileTooLarge).toBe("Arquivo maior que o limite");
    expect(ptBR.fileWrongType).toBe("Tipo de arquivo não aceito");
    expect(ptBR.fileRemove).toBe("Remover");
  });
});

describe("R-21 · as contas, sozinhas", () => {
  it("formatarTamanho: a mesma do `formatSize` da web", () => {
    expect(formatarTamanho(500)).toBe("500 B");
    expect(formatarTamanho(2048)).toBe("2.0 KB");
    expect(formatarTamanho(15 * 1024 * 1024)).toBe("15 MB");
    expect(formatarTamanho(3 * 1024 ** 3)).toBe("3.0 GB");
  });
  it("aceitaTipo: exato, curinga, lista, e sem tipo informado", () => {
    expect(aceitaTipo("application/pdf", "application/pdf")).toBe(true);
    expect(aceitaTipo("image/png", "image/*")).toBe(true);
    expect(aceitaTipo("image/png", ["application/pdf", "image/*"])).toBe(true);
    expect(aceitaTipo("image/png", "application/pdf")).toBe(false);
    expect(aceitaTipo(undefined, "application/pdf")).toBe(true);
    expect(aceitaTipo("Application/PDF", "application/pdf")).toBe(true);
  });
});

describe("R-21 · a porta própria", () => {
  // DEFEITO QUE QUEBRA OUTRO APP: se o `FileInput` morasse no `/system`, quem só usa o
  // `DatePicker` teria de instalar o `expo-document-picker`, ou a montagem do app falharia.
  it("não sai pelo barril principal nem pelo `/system`", () => {
    expect("FileInput" in barril).toBe(false);
    expect("FileInput" in sistema).toBe(false);
    const fonte = readFileSync(resolve(__dirname, "../../packages/native/src/sistema.tsx"), "utf-8");
    expect(fonte).not.toContain("expo-document-picker");
  });
  it("sai por `./system/file`, e o `expo-document-picker` é peer OPCIONAL", () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, "../../packages/native/package.json"), "utf-8"));
    expect(pkg.exports["./system/file"]).toEqual({types: "./dist/arquivo.d.ts", import: "./dist/arquivo.js"});
    expect(pkg.peerDependencies["expo-document-picker"]).toBeDefined();
    expect(pkg.peerDependenciesMeta["expo-document-picker"]).toEqual({optional: true});
  });
});
