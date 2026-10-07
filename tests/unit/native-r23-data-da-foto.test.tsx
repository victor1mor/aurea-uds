// R-23 (06/10/2026) · o `PhotoInput` não devolvia a data em que a foto foi TIRADA. O app quer
// "abastecer por foto": a pessoa fotografa a bomba e o painel e completa depois, e a data do
// abastecimento vem da própria foto — quem sobe a foto dias depois não bagunça a ordem.
//
// Lido no fonte do `expo-image-picker` 57.0.15: `exif: true` devolve o EXIF nos dois sistemas, com
// `DateTimeOriginal` no topo (o iPhone junta o dicionário `{Exif}`), no formato
// "AAAA:MM:DD HH:MM:SS", sem fuso. Só o iPhone pode mandar `OffsetTimeOriginal`.
//
// O que este arquivo trava:
//   · sem a prop `exif`, nada muda: o sistema não é pedido a ler o EXIF, e nada chega em `takenAt`;
//   · com ela, a data sai certa, com fuso e sem fuso, e fica vazia quando a foto não tem;
//   · o EXIF NÃO sai do componente — ele traz a localização das fotos da galeria;
//   · da galeria, escolhe várias de uma vez quando cabe mais de uma; a câmera, nunca.
// Provado contra o defeito: com o `PhotoInput` de antes (só `{quality: 0.7}` e a foto só com
// `uri`, `width` e `height`), os testes de `exif`, de `takenAt` e de várias de uma vez reprovam.
import {render, act} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {__instancias} from "./native-stubs/react-native";
import {__definirResultado, __limparPicker, __opcoes} from "./native-stubs/expo-image-picker";
import {AureaProvider, criarRegistroDeIcones, ptBR} from "../../packages/native/src/index.js";
import {PhotoInput, type AureaPhoto} from "../../packages/native/src/sistema.js";

const Glifo = () => null;
const ICONES = criarRegistroDeIcones({camera: Glifo, x: Glifo});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES} strings={ptBR}>{children}</AureaProvider>;
const tocarEmPor = async () => {
  const gatilho = __instancias("Pressable").find((p) => p.accessibilityLabel === ptBR.photoAdd)!;
  await act(async () => { await (gatilho.onPress as () => Promise<void>)(); });
};
const EXIF_COMPLETO = {
  DateTimeOriginal: "2026:10:05 14:32:10",
  GPSLatitude: -23.55, GPSLongitude: -46.63, Make: "Apple", Model: "iPhone",
};

beforeEach(() => { __limparPicker(); });

describe("R-23 · sem a prop `exif`, nada muda", () => {
  it("o sistema não é pedido a ler o EXIF", async () => {
    render(<Envolve><PhotoInput onChange={() => {}} /></Envolve>);
    await tocarEmPor();
    expect(__opcoes.at(-1)?.exif).toBe(false);
  });

  it("e mesmo que a foto traga a data, ela não chega", async () => {
    __definirResultado({canceled: false, assets: [{uri: "f.jpg", exif: EXIF_COMPLETO}]});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput onChange={mudar} /></Envolve>);
    await tocarEmPor();
    expect(mudar.mock.calls[0][0][0]).not.toHaveProperty("takenAt");
  });
});

describe("R-23 · com `exif`, a data em que a foto foi tirada", () => {
  it.each(["camera", "library"] as const)("pede o EXIF ao sistema (%s)", async (source) => {
    render(<Envolve><PhotoInput source={source} exif onChange={() => {}} /></Envolve>);
    await tocarEmPor();
    expect(__opcoes.at(-1)?.exif).toBe(true);
  });

  it("sem fuso, vale a hora local do aparelho", async () => {
    __definirResultado({canceled: false, assets: [{uri: "f.jpg", exif: {DateTimeOriginal: "2026:10:05 14:32:10"}}]});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput exif onChange={mudar} /></Envolve>);
    await tocarEmPor();
    const foto = mudar.mock.calls[0][0][0] as AureaPhoto;
    expect(foto.takenAt?.getTime()).toBe(new Date(2026, 9, 5, 14, 32, 10).getTime());
  });

  it("com o fuso do iPhone (`OffsetTimeOriginal`), o instante é o certo em qualquer aparelho", async () => {
    __definirResultado({canceled: false, assets: [{uri: "f.jpg",
      exif: {DateTimeOriginal: "2026:10:05 14:32:10", OffsetTimeOriginal: "-03:00"}}]});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput exif onChange={mudar} /></Envolve>);
    await tocarEmPor();
    // 14:32:10 em Brasília (−3) é 17:32:10 UTC.
    expect((mudar.mock.calls[0][0][0] as AureaPhoto).takenAt?.toISOString()).toBe("2026-10-05T17:32:10.000Z");
  });

  it.each([
    ["sem EXIF (a foto que passou por um aplicativo de mensagens)", null],
    ["sem a etiqueta da data", {Make: "Apple"}],
    ["a câmera sem relógio, que escreve zeros", {DateTimeOriginal: "0000:00:00 00:00:00"}],
    ["texto que não é data", {DateTimeOriginal: "ontem"}],
  ])("%s: `takenAt` fica vazio", async (_nome, exif) => {
    __definirResultado({canceled: false, assets: [{uri: "f.jpg", exif}]});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput exif onChange={mudar} /></Envolve>);
    await tocarEmPor();
    expect(mudar.mock.calls[0][0][0]).not.toHaveProperty("takenAt");
  });

  // ⚠ A foto da galeria traz a LOCALIZAÇÃO no EXIF. O app recebe a data e nada mais.
  it("o EXIF não sai do componente: a foto leva só endereço, medida e data", async () => {
    __definirResultado({canceled: false, assets: [{uri: "f.jpg", width: 4, height: 3, exif: EXIF_COMPLETO}]});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput exif onChange={mudar} /></Envolve>);
    await tocarEmPor();
    expect(Object.keys(mudar.mock.calls[0][0][0]).sort()).toEqual(["height", "takenAt", "uri", "width"]);
  });
});

describe("R-23 · várias fotos de uma vez, da galeria", () => {
  it("cabendo mais de uma, a galeria deixa escolher até o que falta para o `max`", async () => {
    render(<Envolve><PhotoInput source="library" max={5} value={[{uri: "a.jpg"}]} onChange={() => {}} /></Envolve>);
    await tocarEmPor();
    expect(__opcoes.at(-1)).toMatchObject({allowsMultipleSelection: true, selectionLimit: 4});
  });

  it("cabendo uma só, escolhe uma, como sempre", async () => {
    render(<Envolve><PhotoInput source="library" max={2} value={[{uri: "a.jpg"}]} onChange={() => {}} /></Envolve>);
    await tocarEmPor();
    expect(__opcoes.at(-1)?.allowsMultipleSelection).toBeUndefined();
  });

  it("a câmera nunca: ela tira uma por vez", async () => {
    render(<Envolve><PhotoInput source="camera" max={5} onChange={() => {}} /></Envolve>);
    await tocarEmPor();
    expect(__opcoes.at(-1)?.allowsMultipleSelection).toBeUndefined();
  });

  it("e o que passar do `max` não entra", async () => {
    __definirResultado({canceled: false, assets: ["1", "2", "3", "4", "5", "6"].map((n) => ({uri: `${n}.jpg`}))});
    const mudar = vi.fn();
    render(<Envolve><PhotoInput source="library" max={5} value={[{uri: "a.jpg"}]} onChange={mudar} /></Envolve>);
    await tocarEmPor();
    expect((mudar.mock.calls[0][0] as AureaPhoto[]).map((f) => f.uri)).toEqual(["a.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg"]);
  });
});
