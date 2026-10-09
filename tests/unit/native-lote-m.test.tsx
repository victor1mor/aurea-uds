// Lote M (0.28.0) · o NATIVO, com os mesmos nomes da web:
//   GAR-14: `Button share` e `IconButton share` — no aparelho, o compartilhar do sistema (no Android o
//           link vai DENTRO da mensagem, porque ele descarta o `url`); no navegador, a regra da web:
//           sem o recurso, copiar, avisar pelo `ToastHost` e dizer ao leitor de tela;
//   GAR-15: `Image frame="phone"` e a captura do escuro (`sourceDark`);
//   GAR-16: `Text numeric`, o peso 800 e o papel de título (`heading`); o número do `KPI` e as
//           células da `Table` com algarismos da mesma largura.
// O dublê só registra; o desenho se vê na bancada do `react-native-web`.
// Provado contra o defeito: na 0.27.0 o `share` cai no `Pressable` sem efeito, o `Image` não tem
// moldura, o `Text` não tem `numeric` nem 800 nem `heading` — os testes abaixo reprovam.
import {act, render} from "@testing-library/react";
import * as React from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {StyleSheet, __anuncios, __compartilhados, __definirPlataforma, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Button, IconButton, Image, KPI, Table, Text, ToastHost, resolverTokens, type AureaFontFamilies} from "../../packages/native/src/index.js";

type Estilo = Record<string, unknown>;
const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Estilo;
// A ÚLTIMA instância com o texto: o dublê guarda as de antes de um `unmount` no mesmo teste.
const textoDe = (c: string) => __instancias("Text").map((p) => ({...p, s: plano(p.style)})).findLast((p) => p.children === c);
const LINK = "https://exemplo.com.br/noticias/moto-do-ano";

afterEach(() => {
  __definirPlataforma("android");
  __compartilhados.length = 0;
  __anuncios.length = 0;
});

describe("GAR-14 · o Button compartilha", () => {
  const tocar = async () => { await act(async () => { (__instancias("Pressable")[0].onPress as (e: unknown) => void)({}); }); };

  it("no Android, o link vai dentro da mensagem (o sistema descarta o `url`)", async () => {
    render(<AureaProvider><Button share={{url: LINK, title: "Moto do ano", text: "Veja"}}>Compartilhar</Button></AureaProvider>);
    await tocar();
    expect(__compartilhados).toEqual([{message: `Veja ${LINK}`, title: "Moto do ano"}]);
  });

  it("no iPhone, o link vai como link e o texto como mensagem", async () => {
    __definirPlataforma("ios");
    render(<AureaProvider><Button share={{url: LINK, text: "Veja"}}>Compartilhar</Button></AureaProvider>);
    await tocar();
    expect(__compartilhados).toEqual([{url: LINK, message: "Veja", title: undefined}]);
  });

  it("o toque do app roda primeiro, e o compartilhar depois", async () => {
    const ordem: string[] = [];
    render(<AureaProvider><Button share={{url: LINK}} onPress={() => ordem.push("app")}>Compartilhar</Button></AureaProvider>);
    await tocar();
    expect(ordem).toEqual(["app"]);
    expect(__compartilhados).toHaveLength(1);
  });

  it("o IconButton também compartilha", async () => {
    render(<AureaProvider><IconButton name="share-network" label="Compartilhar link" share={{url: LINK}}/></AureaProvider>);
    await tocar();
    expect(__compartilhados).toEqual([{message: LINK, title: undefined}]);
  });

  it("no navegador sem o recurso: copia, avisa pelo ToastHost e diz ao leitor de tela", async () => {
    __definirPlataforma("web");
    const escrever = vi.fn(() => Promise.resolve());
    const nav = globalThis.navigator as unknown as Record<string, unknown>;
    const antes = nav.clipboard;
    Object.defineProperty(globalThis.navigator, "clipboard", {value: {writeText: escrever}, configurable: true});
    try {
      render(<AureaProvider><ToastHost><Button share={{url: LINK}}>Compartilhar</Button></ToastHost></AureaProvider>);
      await tocar();
      expect(escrever).toHaveBeenCalledWith(LINK);
      expect(__compartilhados).toEqual([]);
      expect(__anuncios).toEqual(["Link copied"]);
      expect(textoDe("Link copied"), "o aviso no ToastHost").toBeDefined();
    } finally {
      Object.defineProperty(globalThis.navigator, "clipboard", {value: antes, configurable: true});
    }
  });
});

describe("GAR-15 · a moldura de celular", () => {
  const t = resolverTokens("light", "comfortable");
  it("frame=\"phone\": a moldura leva o estilo do app; a captura, a proporção e o canto de dentro", () => {
    render(<AureaProvider theme="light"><Image source={{uri: "a.png"}} alt="Tela do app" frame="phone" style={{width: 200}} testID="moldura"/></AureaProvider>);
    const moldura = __instancias("View").find((p) => p.testID === "moldura")!;
    const m = plano(moldura.style);
    expect(m.width).toBe(200);
    expect(m.padding).toBe(t.size.space2);
    expect(m.borderRadius).toBe(t.size.radiusSheet);
    expect(m.backgroundColor).toBe(t.color.card);
    const img = plano(__instancias("Image")[0].style);
    expect(img.aspectRatio).toBeCloseTo(9 / 19.5);
    expect(img.borderRadius).toBe(t.size.radiusSheet - t.size.space2);
    expect(img.width).not.toBe(200);
  });
  it("sourceDark: o tema escuro mostra a captura escura; o claro, a clara", () => {
    const {unmount} = render(<AureaProvider theme="dark"><Image source={{uri: "claro.png"}} sourceDark={{uri: "escuro.png"}} alt="Tela"/></AureaProvider>);
    expect(__instancias("Image").at(-1)!.source).toEqual({uri: "escuro.png"});
    unmount();
    render(<AureaProvider theme="light"><Image source={{uri: "claro.png"}} sourceDark={{uri: "escuro.png"}} alt="Tela"/></AureaProvider>);
    expect(__instancias("Image").at(-1)!.source).toEqual({uri: "claro.png"});
  });
});

describe("GAR-16 · títulos e números no nativo", () => {
  const FONTES: AureaFontFamilies = {
    ui: {"400": "Ui-Regular", "600": "Ui-SemiBold", "700": "Ui-Bold", "800": "Ui-ExtraBold"},
    editorial: {"400": "Ui-Regular"}, code: {"400": "Mono-Regular"},
    heading: {"600": "Titulo-SemiBold", "800": "Titulo-ExtraBold"},
  };
  it("numeric liga os algarismos da mesma largura, e só quando pedido", () => {
    render(<AureaProvider><Text numeric>11,90</Text><Text>21,10</Text></AureaProvider>);
    expect(textoDe("11,90")!.s.fontVariant).toEqual(["tabular-nums"]);
    expect(textoDe("21,10")!.s.fontVariant).toBeUndefined();
  });
  it("o peso 800 é a fonte ExtraBold; sem ela no mapa, cai na mais perto (o 700)", () => {
    const {unmount} = render(<AureaProvider fontFamilies={FONTES}><Text weight={800}>Capa</Text></AureaProvider>);
    expect(textoDe("Capa")!.s.fontFamily).toBe("Ui-ExtraBold");
    unmount();
    render(<AureaProvider fontFamilies={{...FONTES, ui: {"400": "Ui-Regular", "700": "Ui-Bold"}}}><Text weight={800}>Capa</Text></AureaProvider>);
    expect(textoDe("Capa")!.s.fontFamily).toBe("Ui-Bold");
  });
  it("o título usa o papel `heading`; sem ele no mapa, o do texto (o mapa de antes da 0.28.0)", () => {
    const {unmount} = render(<AureaProvider fontFamilies={FONTES}><Text type="h2">Preços de outubro</Text></AureaProvider>);
    expect(textoDe("Preços de outubro")!.s.fontFamily).toBe("Titulo-SemiBold");
    unmount();
    const {heading: _semTitulo, ...antigo} = FONTES;
    render(<AureaProvider fontFamilies={antigo}><Text type="h2">Preços de outubro</Text></AureaProvider>);
    expect(textoDe("Preços de outubro")!.s.fontFamily).toBe("Ui-SemiBold");
  });
  it("o número do KPI e as células da Table têm algarismos da mesma largura", () => {
    render(<AureaProvider>
      <KPI label="Gasto em outubro" value="R$ 1.284,50"/>
      <Table columns={[{key: "modelo", header: "Modelo", primary: true}, {key: "preco", header: "Preço"}]}
             rows={[{modelo: "Trail 300", preco: "R$ 31.711,00"}]}/>
    </AureaProvider>);
    expect(textoDe("R$ 1.284,50")!.s.fontVariant).toEqual(["tabular-nums"]);
    expect(textoDe("R$ 31.711,00")!.s.fontVariant).toEqual(["tabular-nums"]);
    expect(textoDe("Trail 300")!.s.fontVariant).toEqual(["tabular-nums"]);
  });
});
