// 0.32.0, passo 9b — o `Popover` e o `DropdownMenu` do NATIVO, com os nomes e a API da web
// (`trigger`, `title`, `side`, `arrow`, `items: MenuEntry[]`, `label`) e a anatomia, as medidas e o
// comportamento do pacote nativo da referência, na pele da Aurea.
//
// O dublê não mede nem desenha: a medida do gatilho entra pela REF que o componente pôs no
// `Pressable` (um nó falso com `measureInWindow`), e a do painel pelo `onLayout` dele — os dois
// números que o aparelho daria. A posição de verdade, contra a barra de status, é do
// `apps/native-smoke`.
//
// Provado contra o defeito, um de cada vez, no `menu.tsx`: pintar o painel com `useAureaTokens` (e
// não `useTokensDoApp`) reprova o bloco do `contrast`; tirar a virada de lado reprova "vira para
// cima"; animar sem perguntar `useReduceMotion` reprova "menos movimento"; fechar no item que
// alterna reprova "fica aberto"; e escrever o `trigger` sem o `onPress` do app reprova "o toque do
// app continua".
import {act, render} from "@testing-library/react";
import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {
  StyleSheet, __chamadasDeSistema, __configsDeAnimacao, __definirReduceMotion, __instancias,
} from "./native-stubs/react-native";
import {SafeAreaInsetsContext} from "./native-stubs/react-native-safe-area-context";
import {AureaProvider, Button, Card, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {DropdownMenu, Popover, type MenuEntry} from "../../packages/native/src/menu.js";

type Estilo = Record<string, unknown>;
type Props = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as Estilo;
const ESCURO = resolverTokens("dark", "comfortable");
const CLARO = resolverTokens("light", "comfortable");
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, editorial: {}, code: {}};

// O glifo registra o que pediram a ele: o nome, o tamanho e a cor.
let desenhados: Array<{nome: string; size?: number; color?: string}> = [];
const glifo = (nome: string) => (p: {size?: number; color?: string}) => { desenhados.push({nome, ...p}); return null; };
const ICONES = criarRegistroDeIcones({
  "check": glifo("check") as never, "caret-right": glifo("caret-right") as never, "trash": glifo("trash") as never,
});
beforeEach(() => { desenhados = []; });

const montar = (no: React.ReactNode, tema: "dark" | "light" = "dark") =>
  render(<AureaProvider theme={tema} icons={ICONES} fontFamilies={FONTES}>{no}</AureaProvider>);
const ultimo = (tipo: string, id: string) => __instancias(tipo).findLast((p) => p.testID === id);
const modal = () => ultimo("Modal", "m")!;
const painel = () => ultimo("Animated.View", "m-painel")!;
const estiloDoPainel = () => plano(painel().style);
const gatilho = () => ultimo("Pressable", "gatilho")!;

// A linha do menu que tem este rótulo, no último desenho.
const contem = (n: unknown, alvo: string): boolean => {
  if (n == null || typeof n === "boolean") return false;
  if (typeof n === "string") return n === alvo;
  if (Array.isArray(n)) return n.some((x) => contem(x, alvo));
  if (typeof n === "object" && "props" in (n as object)) return contem((n as {props: {children?: unknown}}).props.children, alvo);
  return false;
};
const linha = (rotulo: string) => __instancias("Pressable").findLast((p) => p.accessibilityRole && contem(p.children, rotulo));
const texto = (conteudo: string) => {
  const p = __instancias("Text").findLast((x) => x.children === conteudo);
  if (!p) throw new Error(`texto "${conteudo}" não desenhado`);
  return {...p, e: plano(p.style)};
};
const tocar = async (p: Props | undefined) => { await act(async () => { (p!.onPress as () => void)(); }); };

type Ret = {x: number; y: number; width: number; height: number};
/** Abre como o aparelho: mede o gatilho, toca, e o painel se mede. */
async function abrir({rect = {x: 120, y: 200, width: 120, height: 48} as Ret | null, tamanho = {width: 200, height: 160}} = {}) {
  await act(async () => {});              // a resposta do "menos movimento" chega
  await act(async () => {
    const g = gatilho();
    if (rect) (g.ref as (n: unknown) => void)({
      measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(rect.x, rect.y, rect.width, rect.height),
    });
    (g.onPress as (e: unknown) => void)({nativeEvent: {pageX: 33, pageY: 44}});
  });
  await act(async () => {
    (painel().onLayout as (e: unknown) => void)({nativeEvent: {layout: {x: 0, y: 0, ...tamanho}}});
  });
}

const umPopover = (extra: Partial<React.ComponentProps<typeof Popover>> = {}) =>
  <Popover testID="m" trigger={<Button testID="gatilho">Abrir</Button>} title="Ajuda" {...extra}>
    Texto do corpo
  </Popover>;

const umMenu = (items: MenuEntry[], extra: Partial<React.ComponentProps<typeof DropdownMenu>> = {}) =>
  <DropdownMenu testID="m" label="Ações" trigger={<Button testID="gatilho">Abrir</Button>} items={items} {...extra} />;

// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("Popover · a anatomia da referência na pele da Aurea", () => {
  it("o painel: fundo `popover`, sem linha, canto 22 contínuo, sombra LG, 12 × 16 de recheio", async () => {
    montar(umPopover());
    await abrir();
    const e = estiloDoPainel();
    expect(e.backgroundColor).toBe(ESCURO.color.popover);
    expect([e.borderWidth, e.borderColor]).toEqual([ESCURO.size.borderWidth, "transparent"]);
    expect([e.borderRadius, e.borderCurve]).toEqual([ESCURO.size.radiusCard, "continuous"]);
    expect(e.boxShadow).toEqual([...ESCURO.shadowLayers.shadowLg]);
    expect([e.paddingVertical, e.paddingHorizontal]).toEqual([ESCURO.size.space3, ESCURO.size.space4]);
  });

  it("título 18 em peso médio, cabeçalho; o texto solto é a descrição — 16, esmaecido", async () => {
    montar(umPopover());
    await abrir();
    const titulo = texto("Ajuda");
    expect([titulo.e.fontSize, titulo.e.fontFamily, titulo.accessibilityRole]).toEqual([18, "Ui500", "header"]);
    expect(titulo.e.marginBottom).toBe(ESCURO.size.space1);
    const corpo = texto("Texto do corpo");
    expect([corpo.e.fontSize, corpo.e.color]).toEqual([16, ESCURO.color.mutedForeground]);
  });

  it("o `Modal` é a janela de cima, transparente, sem a animação dele, de ponta a ponta", async () => {
    montar(umPopover());
    expect(modal().visible).toBe(false);
    await abrir();
    const m = modal();
    expect([m.visible, m.transparent, m.animationType]).toEqual([true, true, "none"]);
    expect([m.statusBarTranslucent, m.navigationBarTranslucent]).toEqual([true, true]);
    // O fundo é tocável e não é anunciado: é saída, não conteúdo.
    expect(ultimo("Pressable", "m-fundo")?.accessible).toBe(false);
  });
});

describe("abrir e fechar", () => {
  it("o toque fora fecha", async () => {
    montar(umPopover());
    await abrir();
    await tocar(ultimo("Pressable", "m-fundo"));
    expect(modal().visible).toBe(false);
  });

  it("o VOLTAR do Android fecha (`onRequestClose`)", async () => {
    montar(umPopover());
    await abrir();
    await act(async () => { (modal().onRequestClose as () => void)(); });
    expect(modal().visible).toBe(false);
  });

  it("o gesto de saída do VoiceOver fecha (`onAccessibilityEscape` no painel)", async () => {
    montar(umPopover());
    await abrir();
    await act(async () => { (painel().onAccessibilityEscape as () => void)(); });
    expect(modal().visible).toBe(false);
  });

  it("o gatilho anuncia `expanded`, e o toque do app continua", async () => {
    const doApp = vi.fn();
    montar(<Popover testID="m" trigger={<Button testID="gatilho" onPress={doApp}>Abrir</Button>}>Corpo</Popover>);
    expect(gatilho().accessibilityState).toMatchObject({expanded: false});
    await abrir();
    expect(doApp).toHaveBeenCalledTimes(1);
    expect(gatilho().accessibilityState).toMatchObject({expanded: true});
    expect(gatilho()["aria-expanded"]).toBe(true);
    await tocar(ultimo("Pressable", "m-fundo"));
    expect(gatilho().accessibilityState).toMatchObject({expanded: false});
  });

  it("o `disabled` do botão não se perde no estado que o gatilho reescreve", () => {
    montar(<Popover testID="m" trigger={<Button testID="gatilho" disabled>Abrir</Button>}>Corpo</Popover>);
    expect(gatilho().accessibilityState).toEqual({disabled: true, expanded: false});
  });

  it("a ref do app também recebe o nó", async () => {
    const ref = React.createRef<unknown>();
    montar(<Popover testID="m" trigger={<Button testID="gatilho" ref={ref as never}>Abrir</Button>}>Corpo</Popover>);
    await abrir();
    expect(typeof (ref.current as {measureInWindow?: unknown})?.measureInWindow).toBe("function");
  });
});

describe("a posição: presa ao gatilho, dentro da janela", () => {
  // A janela do dublê é 360 × 800; o recuo é 12 (`space3`), a distância 8 (`space2`).
  it("embaixo, centrada no gatilho, a 8 dele", async () => {
    montar(umPopover());
    await abrir({rect: {x: 120, y: 200, width: 120, height: 48}, tamanho: {width: 200, height: 160}});
    const e = estiloDoPainel();
    expect([e.left, e.top]).toEqual([180 - 100, 200 + 48 + ESCURO.size.space2]);
  });

  it("vira para cima quando embaixo não cabe e em cima cabe", async () => {
    montar(umPopover());
    await abrir({rect: {x: 120, y: 700, width: 120, height: 48}, tamanho: {width: 200, height: 160}});
    // Sem a virada, o painel seria empurrado para 628 — por cima do gatilho.
    expect(estiloDoPainel().top).toBe(700 - ESCURO.size.space2 - 160);
  });

  it("e vira para baixo quando o pedido é em cima e não cabe", async () => {
    montar(umPopover({side: "top"}));
    await abrir({rect: {x: 120, y: 40, width: 120, height: 48}, tamanho: {width: 200, height: 160}});
    expect(estiloDoPainel().top).toBe(40 + 48 + ESCURO.size.space2);
  });

  it("à direita e à esquerda, centrado na altura; vira de lado também", async () => {
    montar(umPopover({side: "right"}));
    await abrir({rect: {x: 20, y: 300, width: 48, height: 48}, tamanho: {width: 160, height: 100}});
    expect([estiloDoPainel().left, estiloDoPainel().top]).toEqual([20 + 48 + 8, 324 - 50]);
  });

  it("vira da direita para a esquerda no canto da tela", async () => {
    montar(umPopover({side: "right"}));
    await abrir({rect: {x: 280, y: 300, width: 48, height: 48}, tamanho: {width: 160, height: 100}});
    expect(estiloDoPainel().left).toBe(280 - 8 - 160);
  });

  it("presa à janela com o recuo de 12, e a largura máxima é a da janela menos os recuos", async () => {
    montar(umPopover());
    await abrir({rect: {x: 300, y: 200, width: 48, height: 48}, tamanho: {width: 200, height: 160}});
    const e = estiloDoPainel();
    expect(e.left).toBe(360 - 12 - 200);
    expect([e.maxWidth, e.maxHeight]).toEqual([360 - 24, 800 - 24]);
  });

  it("a área do sistema entra no recuo (do contexto, que atravessa o `Modal`)", async () => {
    render(
      <SafeAreaInsetsContext.Provider value={{top: 30, right: 0, bottom: 0, left: 10}}>
        <AureaProvider theme="dark" icons={ICONES} fontFamilies={FONTES}>{umPopover()}</AureaProvider>
      </SafeAreaInsetsContext.Provider>);
    await abrir({rect: {x: 0, y: 200, width: 40, height: 48}, tamanho: {width: 200, height: 160}});
    expect(estiloDoPainel().left).toBe(12 + 10);
  });

  it("um gatilho que não passa a ref ainda abre — no ponto do toque", async () => {
    montar(umPopover());
    await abrir({rect: null, tamanho: {width: 200, height: 160}});
    expect([estiloDoPainel().left, estiloDoPainel().top]).toEqual([12, 44 + 8]);
  });

  it("antes de medido, invisível e sem toque", async () => {
    montar(umPopover());
    await act(async () => {});
    await act(async () => { (gatilho().onPress as (e: unknown) => void)({nativeEvent: {pageX: 0, pageY: 0}}); });
    expect(estiloDoPainel().opacity).toBe(0);
    expect(painel().pointerEvents).toBe("none");
  });
});

describe("a seta (`arrow`)", () => {
  const seta = () => __instancias("View").map((p) => ({p, e: plano(p.style)}))
    .findLast(({e}) => e.position === "absolute" && (e.top === -12 || e.bottom === -12 || e.left === -12 || e.right === -12));

  it("20 × 12, no meio do gatilho, e o painel se afasta a altura dela", async () => {
    montar(umPopover({arrow: true}));
    await abrir({rect: {x: 120, y: 200, width: 120, height: 48}, tamanho: {width: 200, height: 160}});
    expect(estiloDoPainel().top).toBe(200 + 48 + ESCURO.size.space3);
    const svg = __instancias("Svg").at(-1)!;
    expect([svg.width, svg.height]).toEqual([ESCURO.size.space5, ESCURO.size.space3]);
    // O meio do gatilho (180) menos a borda de fora do painel (80), a borda (1) e meia seta (10).
    expect(seta()?.e).toMatchObject({top: -12, left: 180 - 80 - 1 - 10});
    const [fundo, traco] = __instancias("Path").slice(-2);
    expect(fundo.fill).toBe(ESCURO.color.popover);
    expect([traco.stroke, traco.strokeWidth, traco.fill]).toEqual([ESCURO.color.border, 1, "none"]);
  });

  it("vira junto com o painel: em cima do gatilho, a seta vai para baixo", async () => {
    montar(umPopover({arrow: true}));
    await abrir({rect: {x: 120, y: 700, width: 120, height: 48}, tamanho: {width: 200, height: 160}});
    expect(seta()?.e.bottom).toBe(-12);
  });

  it("presa a 12 das pontas do painel", async () => {
    montar(umPopover({arrow: true}));
    await abrir({rect: {x: 330, y: 200, width: 24, height: 48}, tamanho: {width: 200, height: 160}});
    expect(seta()?.e.left).toBe(200 - 2 - 20 - 12);
  });
});

describe("a entrada e o \"menos movimento\"", () => {
  it("entra como a da referência: opacidade, 0,97 → 1 e 8 vindo do gatilho, no `durationBase`", async () => {
    montar(umPopover());
    await abrir();
    const e = estiloDoPainel();
    const [desloca, escala] = e.transform as Array<Record<string, {__interpolado: number[]}>>;
    expect(desloca.translateY.__interpolado).toEqual([-ESCURO.size.space2, 0]);
    expect(escala.scale.__interpolado).toEqual([0.97, 1]);
    const cfg = __configsDeAnimacao().at(-1)!;
    expect([cfg.toValue, cfg.duration, cfg.useNativeDriver]).toEqual([1, ESCURO.size.durationBase, true]);
  });

  it("com \"menos movimento\" o painel aparece no lugar: nenhuma animação, opacidade cheia", async () => {
    __definirReduceMotion(true);
    montar(umPopover());
    await abrir();
    expect(__configsDeAnimacao()).toHaveLength(0);
    expect((estiloDoPainel().opacity as {valor: number}).valor).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("DropdownMenu · o painel e o item da referência", () => {
  const ITENS: MenuEntry[] = [{label: "Editar"}, {label: "Duplicar", leadingIcon: "trash"}];

  it("o painel é um `menu` com nome; recheio 12 em cima e embaixo e 4 dos lados", async () => {
    montar(umMenu(ITENS));
    await abrir();
    expect([painel().accessibilityRole, painel().accessibilityLabel]).toEqual(["menu", "Ações"]);
    const e = estiloDoPainel();
    expect([e.paddingVertical, e.paddingHorizontal]).toEqual([ESCURO.size.space3, ESCURO.size.space1]);
    expect([e.backgroundColor, e.borderRadius, e.borderCurve]).toEqual([ESCURO.color.popover, ESCURO.size.radiusCard, "continuous"]);
  });

  it("o item: 44 de alvo, 8 × 12 de recheio, 8 de vão, canto 16 contínuo, `menuitem`", async () => {
    montar(umMenu(ITENS));
    await abrir();
    const p = linha("Editar")!;
    expect(p.accessibilityRole).toBe("menuitem");
    const e = plano(p.style);
    expect([e.minHeight, e.paddingVertical, e.paddingHorizontal, e.gap])
      .toEqual([ESCURO.size.targetMin, ESCURO.size.space2, ESCURO.size.space3, ESCURO.size.space2]);
    expect([e.borderRadius, e.borderCurve]).toEqual([ESCURO.size.radiusLg, "continuous"]);
    const t = texto("Editar");
    expect([t.e.fontSize, t.e.fontFamily, t.e.color]).toEqual([16, "Ui500", ESCURO.color.foreground]);
  });

  it("o toque: o fundo de destaque e 0,98", async () => {
    montar(umMenu(ITENS));
    await abrir();
    const e = plano(linha("Editar")!.__estiloTocando);
    expect(e.backgroundColor).toBe(ESCURO.color.surface3);
    expect(e.transform).toEqual([{scale: 0.98}]);
  });

  it("o `leadingIcon` vem antes do rótulo, 20, na cor do texto", async () => {
    montar(umMenu(ITENS));
    await abrir();
    expect(desenhados.findLast((d) => d.nome === "trash")).toMatchObject({size: ESCURO.size.iconMd, color: ESCURO.color.foreground});
  });

  it("tocar no item chama o `onClick` e fecha", async () => {
    const onClick = vi.fn();
    montar(umMenu([{label: "Editar", onClick}]));
    await abrir();
    await tocar(linha("Editar"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(modal().visible).toBe(false);
  });

  it("o item desabilitado não responde, é anunciado e esmaece a 0,5", async () => {
    const onClick = vi.fn();
    montar(umMenu([{label: "Arquivar", disabled: true, onClick}]));
    await abrir();
    const p = linha("Arquivar")!;
    expect([p.disabled, p.onPress, p.accessibilityState]).toEqual([true, undefined, {disabled: true}]);
    expect(plano(p.style).opacity).toBe(ESCURO.size.opacityDisabled);
  });

  it("`destructive`: o texto e o ícone no tom de perigo de LETRA, e o toque no fundo suave do perigo", async () => {
    montar(umMenu([{label: "Excluir", destructive: true, leadingIcon: "trash"}]));
    await abrir();
    expect(texto("Excluir").e.color).toBe(ESCURO.color.danger400);
    expect(desenhados.findLast((d) => d.nome === "trash")?.color).toBe(ESCURO.color.danger400);
    expect(plano(linha("Excluir")!.__estiloTocando).backgroundColor).toBe(ESCURO.color.dangerBg);
  });

  it("o separador é uma linha de 1 na cor da borda, fora da leitura", async () => {
    montar(umMenu([{label: "A"}, "separator", {label: "B"}]));
    await abrir();
    const sep = __instancias("View").findLast((p) => plano(p.style).height === ESCURO.size.borderWidth)!;
    expect(plano(sep.style).backgroundColor).toBe(ESCURO.color.border);
    expect(sep.importantForAccessibility).toBe("no-hide-descendants");
  });

  it("o grupo: o rótulo é cabeçalho, 14 em peso médio, esmaecido", async () => {
    montar(umMenu([{kind: "group", label: "Arquivo", items: [{label: "Abrir arquivo"}]}]));
    await abrir();
    const r = texto("Arquivo");
    expect([r.accessibilityRole, r.e.fontSize, r.e.fontFamily, r.e.color])
      .toEqual(["header", ESCURO.size.textSm, "Ui500", ESCURO.color.mutedForeground]);
    expect(linha("Abrir arquivo")).toBeDefined();
  });

  it("o link abre o endereço pelo sistema e fecha", async () => {
    montar(umMenu([{kind: "link", label: "Ajuda", href: "https://exemplo.dev/ajuda"}]));
    await abrir();
    expect(linha("Ajuda")?.accessibilityRole).toBe("link");
    await tocar(linha("Ajuda"));
    expect(__chamadasDeSistema).toContain("openURL:https://exemplo.dev/ajuda");
    expect(modal().visible).toBe(false);
  });
});

describe("DropdownMenu · o que alterna e a escolha única", () => {
  it("`checkbox`: papel e estado; tocar alterna, avisa e o menu FICA aberto", async () => {
    const onCheckedChange = vi.fn();
    montar(umMenu([{kind: "checkbox", label: "Barra lateral", onCheckedChange}]));
    await abrir();
    let p = linha("Barra lateral")!;
    expect([p.accessibilityRole, p.accessibilityState, p["aria-checked"]]).toEqual(["checkbox", {checked: false, disabled: false}, false]);
    expect(desenhados.some((d) => d.nome === "check")).toBe(false);
    await tocar(p);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    p = linha("Barra lateral")!;
    expect(p.accessibilityState).toMatchObject({checked: true});
    expect(modal().visible).toBe(true);
    // A marca: o `check` de 16 na cor de destaque, numa casa de 20 que existe marcada ou não.
    expect(desenhados.findLast((d) => d.nome === "check")).toMatchObject({size: 16, color: ESCURO.color.primaryEmphasis});
    const casa = __instancias("View").findLast((v) => plano(v.style).width === ESCURO.size.iconMd);
    expect(plano(casa?.style).height).toBe(ESCURO.size.iconMd);
  });

  it("`checkbox` controlado: não muda sozinho, só avisa", async () => {
    const onCheckedChange = vi.fn();
    montar(umMenu([{kind: "checkbox", label: "Grade", checked: true, onCheckedChange}]));
    await abrir();
    await tocar(linha("Grade"));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(linha("Grade")?.accessibilityState).toMatchObject({checked: true});
  });

  it("`radiogroup`: grupo com nome, `radio` com estado, o ponto de 8 no escolhido; escolher avisa e fecha", async () => {
    const onValueChange = vi.fn();
    montar(umMenu([{kind: "radiogroup", label: "Ordenar por", defaultValue: "nome", onValueChange,
      items: [{value: "nome", label: "Nome"}, {value: "data", label: "Data"}]}]));
    await abrir();
    const grupo = __instancias("View").findLast((p) => p.accessibilityRole === "radiogroup");
    expect(grupo?.accessibilityLabel).toBe("Ordenar por");
    expect([linha("Nome")?.accessibilityRole, linha("Nome")?.accessibilityState]).toEqual(["radio", {checked: true, disabled: false}]);
    expect(linha("Data")?.accessibilityState).toMatchObject({checked: false});
    const ponto = __instancias("View").map((p) => plano(p.style)).findLast((e) => e.width === ESCURO.size.space2);
    expect([ponto?.height, ponto?.backgroundColor, ponto?.borderRadius, ponto?.borderCurve])
      .toEqual([ESCURO.size.space2, ESCURO.color.primaryEmphasis, ESCURO.size.radiusFull, "continuous"]);
    await tocar(linha("Data"));
    expect(onValueChange).toHaveBeenCalledWith("data");
    expect(modal().visible).toBe(false);
    // Sem controle, a escolha fica para a próxima vez que o menu abrir.
    await abrir();
    expect(linha("Data")?.accessibilityState).toMatchObject({checked: true});
  });
});

describe("DropdownMenu · o submenu abre no lugar", () => {
  const ITENS: MenuEntry[] = [
    {label: "Editar"},
    {kind: "submenu", label: "Compartilhar", items: [
      {label: "Copiar link", onClick: vi.fn()},
      {kind: "submenu", label: "Enviar para", items: [{label: "E-mail"}]},
    ]},
    {label: "Arquivar"},
  ];

  it("o gatilho: `menuitem` com `expanded`, e a seta de 16 esmaecida", async () => {
    montar(umMenu(ITENS));
    await abrir();
    expect(linha("Compartilhar")?.accessibilityState).toMatchObject({expanded: false});
    expect(desenhados.findLast((d) => d.nome === "caret-right")).toMatchObject({size: 16, color: ESCURO.color.mutedForeground});
    expect(linha("Copiar link")).toBeUndefined();
  });

  it("abrir mostra os itens embaixo, gira a seta 90° e esmaece o resto, que não responde", async () => {
    montar(umMenu(ITENS));
    await abrir();
    await tocar(linha("Compartilhar"));
    expect(linha("Compartilhar")?.accessibilityState).toMatchObject({expanded: true, disabled: false});
    expect(linha("Copiar link")).toBeDefined();
    for (const fora of ["Editar", "Arquivar"]) {
      expect(linha(fora)?.disabled).toBe(true);
      expect(plano(linha(fora)?.style).opacity).toBe(ESCURO.size.opacityDisabled);
    }
    const giro = __instancias("Animated.View").map((p) => plano(p.style))
      .findLast((e) => Array.isArray(e.transform) && "rotate" in (e.transform as object[])[0]);
    expect(((giro?.transform as Array<{rotate: {__interpolado: string[]}}>)[0]).rotate.__interpolado).toEqual(["0deg", "90deg"]);
    expect(__configsDeAnimacao().at(-1)).toMatchObject({toValue: 1, duration: ESCURO.size.durationFast});
    // A superfície do submenu aberto: fundo, linha e canto 16, numa camada atrás das linhas.
    const fundo = __instancias("View").map((p) => plano(p.style))
      .findLast((e) => e.position === "absolute" && e.borderRadius === ESCURO.size.radiusLg);
    expect([fundo?.backgroundColor, fundo?.borderColor, fundo?.borderCurve]).toEqual([ESCURO.color.popover, "transparent", "continuous"]);
  });

  it("o item de dentro chama o `onClick` e fecha o menu inteiro", async () => {
    const onClick = vi.fn();
    montar(umMenu([{kind: "submenu", label: "Compartilhar", items: [{label: "Copiar link", onClick}]}]));
    await abrir();
    await tocar(linha("Compartilhar"));
    await tocar(linha("Copiar link"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(modal().visible).toBe(false);
    // Reabre do começo: o submenu fechou junto.
    await abrir();
    expect(linha("Compartilhar")?.accessibilityState).toMatchObject({expanded: false});
  });

  it("submenu dentro de submenu: o de fora fica aberto, e fechar o de dentro volta a ele", async () => {
    montar(umMenu(ITENS));
    await abrir();
    await tocar(linha("Compartilhar"));
    await tocar(linha("Enviar para"));
    expect(linha("E-mail")).toBeDefined();
    expect(linha("Copiar link")?.disabled).toBe(true);
    expect(linha("Compartilhar")?.disabled).toBe(false);
    await tocar(linha("Enviar para"));
    expect(linha("Copiar link")?.disabled).toBe(false);
    expect(linha("Compartilhar")?.accessibilityState).toMatchObject({expanded: true});
  });

  it("tocar de novo no gatilho fecha o submenu", async () => {
    montar(umMenu(ITENS));
    await abrir();
    await tocar(linha("Compartilhar"));
    await tocar(linha("Compartilhar"));
    expect(linha("Compartilhar")?.accessibilityState).toMatchObject({expanded: false});
    expect(linha("Editar")?.disabled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("dentro de um `Card variant=\"contrast\"` — a janela sai no tema do APP", () => {
  // No claro, o cartão `contrast` dá os tokens do escuro aos filhos. O que sai do fluxo volta ao app.
  it("Popover: o fundo, a seta e o texto no claro, e não no escuro do cartão", async () => {
    montar(<Card variant="contrast">{umPopover({arrow: true})}</Card>, "light");
    await abrir();
    expect(estiloDoPainel().backgroundColor).toBe(CLARO.color.popover);
    expect(estiloDoPainel().backgroundColor).not.toBe(ESCURO.color.popover);
    expect(estiloDoPainel().borderColor).toBe("transparent");
    expect(__instancias("Path").at(-2)?.fill).toBe(CLARO.color.popover);
    expect(texto("Ajuda").e.color).toBe(CLARO.color.foreground);
    expect(texto("Texto do corpo").e.color).toBe(CLARO.color.mutedForeground);
  });

  it("DropdownMenu: o fundo, o item, o toque e a marca no claro", async () => {
    montar(<Card variant="contrast">{umMenu([{label: "Editar"}, {kind: "checkbox", label: "Fixar", defaultChecked: true}])}</Card>, "light");
    await abrir();
    expect(estiloDoPainel().backgroundColor).toBe(CLARO.color.popover);
    expect(texto("Editar").e.color).toBe(CLARO.color.foreground);
    expect(plano(linha("Editar")!.__estiloTocando).backgroundColor).toBe(CLARO.color.surface3);
    expect(desenhados.findLast((d) => d.nome === "check")?.color).toBe(CLARO.color.primaryEmphasis);
  });
});
