// Lote 101 (0.80.0) — o que o Victor decidiu olhando as bancadas de 24/11/2026:
//   o menu — o item de perigo na web ("Ganha o vermelho"), o menu do celular que se apaga ao fechar ("Se apaga rápido"),
//   a opção de uma só que fecha na web ("Fecha, nos dois") e a seta de ponta fina nos dois alvos ("Ponta fina");
//   o `Button` do nativo com `loading` ("Igual à web"); e o `FileInput` da web com `disabled` ("Ganha o desativado").
//
// Provado contra o código da 0.79.0 (cada bloco reprova lá): sem a classe do perigo, sem o `closeOnClick` no rádio, com
// a curva `Q` na seta, com o `Modal` que sumia na hora, sem o `loading` no botão e sem o `disabled` na área de soltar.
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {act, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {AureaProvider as ProvedorWeb, Button as BotaoWeb, DropdownMenu as MenuWeb, FileInput} from "../../packages/react/src/index";
import {StyleSheet, __configsDeAnimacao, __definirReduceMotion, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Button, criarRegistroDeIcones, resolverTokens} from "../../packages/native/src/index.js";
import {DropdownMenu, Popover} from "../../packages/native/src/menu.js";

const RAIZ = join(__dirname, "..", "..");
const ler = (p: string) => readFileSync(join(RAIZ, p), "utf8");
const CSS = ler("packages/core/src/aurea.css");
const ESCURO = resolverTokens("dark", "comfortable");
type Props = Record<string, unknown>;
const plano = (s: unknown) => (StyleSheet.flatten(s as never) ?? {}) as Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A WEB
// ─────────────────────────────────────────────────────────────────────────────────────────────

const naWeb = (ui: React.ReactNode) => render(<ProvedorWeb><main>{ui}</main></ProvedorWeb>);
const abreMenu = async (u: ReturnType<typeof userEvent.setup>) => {
  await u.click(screen.getByRole("button", {name: "Abrir"}));
  return screen.findByRole("menu");
};

describe("web · o item de perigo do menu", () => {
  it("`destructive` marca só o item dele, e a regra pinta o texto e os ícones no vermelho da frase de erro", async () => {
    const u = userEvent.setup();
    naWeb(<MenuWeb trigger={<BotaoWeb>Abrir</BotaoWeb>} items={[
      {label: "Editar"}, {label: "Excluir", leadingIcon: "trash", destructive: true},
    ]} />);
    const menu = await abreMenu(u);
    expect(within(menu).getByRole("menuitem", {name: "Excluir"})).toHaveClass("menu-item-destructive");
    expect(within(menu).getByRole("menuitem", {name: "Editar"})).not.toHaveClass("menu-item-destructive");
    expect(CSS).toMatch(/\.menu-item-destructive,\.menu-item-destructive > \.menu-item-trailing \{ color:var\(--danger-400\); \}/);
    // Em destaque, o fundo suave do perigo — o mesmo do toque no nativo (`itemTocandoPerigo` = `dangerBg`).
    expect(CSS).toMatch(/\.menu-item-destructive\[data-highlighted\][^{]*\{ background:var\(--danger-bg\); \}/);
    expect(ler("packages/native/src/menu.tsx")).toMatch(/itemTocandoPerigo: \{backgroundColor: t\.color\.dangerBg/);
  });
});

describe("web · escolher a opção de uma só fecha o menu; a caixa de marcar não", () => {
  it("o rádio avisa a escolha e fecha", async () => {
    const u = userEvent.setup();
    const onValueChange = vi.fn();
    naWeb(<MenuWeb trigger={<BotaoWeb>Abrir</BotaoWeb>} items={[{
      kind: "radiogroup", label: "Ordenar por", defaultValue: "nome", onValueChange,
      items: [{value: "nome", label: "Nome"}, {value: "data", label: "Data"}],
    }]} />);
    const menu = await abreMenu(u);
    await u.click(within(menu).getByRole("menuitemradio", {name: "Data"}));
    expect(onValueChange).toHaveBeenLastCalledWith("data");
    await waitFor(() => expect(screen.getByRole("button", {name: "Abrir"})).toHaveAttribute("aria-expanded", "false"));
  });

  it("a caixa de marcar continua deixando aberto", async () => {
    const u = userEvent.setup();
    naWeb(<MenuWeb trigger={<BotaoWeb>Abrir</BotaoWeb>} items={[{kind: "checkbox", label: "Régua"}]} />);
    const menu = await abreMenu(u);
    await u.click(within(menu).getByRole("menuitemcheckbox", {name: "Régua"}));
    expect(screen.getByRole("button", {name: "Abrir"})).toHaveAttribute("aria-expanded", "true");
  });
});

describe("a seta de ponta fina, nos dois alvos", () => {
  it("web: dois lados retos que se encontram num bico, 12 × 6 — sem a curva", () => {
    const fonte = ler("packages/react/src/overlays.tsx");
    expect(fonte).toContain(`className="overlay-arrow-fill" d="M0 0L6 6L12 0Z"`);
    expect(fonte).toContain(`className="overlay-arrow-line" d="M0 0L6 6L12 0" fill="none"`);
    expect(fonte).not.toMatch(/d="M0 0Q/);
  });

  it("nativo: o `Popover` com seta desenha dois lados retos, com a junção em bico", async () => {
    montarNativo(<Popover testID="m" arrow trigger={<Button testID="gatilho">Abrir</Button>}>Corpo</Popover>);
    await abrirNativo();
    const linhas = __instancias("Path").map((p) => String(p.d));
    const seta = linhas.filter((d) => d.startsWith("M0 ") && !d.endsWith("Z"));
    expect(seta.length).toBeGreaterThan(0);
    for (const d of seta) { expect(d).toMatch(/ L/); expect(d).not.toMatch(/Q/); }
    expect(__instancias("Path").some((p) => p.strokeLinejoin === "miter")).toBe(true);
  });
});

describe("web · o `FileInput` desativado", () => {
  it("o campo leva o `disabled`, a área fica marcada e o soltar não aceita arquivo", () => {
    const onFilesChange = vi.fn();
    const {container} = naWeb(<FileInput label="Comprovante" disabled onFilesChange={onFilesChange} />);
    const campo = container.querySelector('input[type="file"]')!;
    expect(campo).toBeDisabled();
    const zona = container.querySelector(".dropzone")!;
    expect(zona).toHaveAttribute("data-disabled");
    const arquivo = new File(["x"], "a.txt", {type: "text/plain"});
    fireEvent.dragOver(zona, {dataTransfer: {files: [arquivo]}});
    expect(zona).not.toHaveAttribute("data-dragging");
    fireEvent.drop(zona, {dataTransfer: {files: [arquivo]}});
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(CSS).toMatch(/\.dropzone\[data-disabled\] \{ opacity:var\(--opacity-disabled\); cursor:not-allowed; \}/);
  });

  it("sem `disabled`, nada muda: o soltar continua aceitando", () => {
    const onFilesChange = vi.fn();
    const {container} = naWeb(<FileInput label="Comprovante" onFilesChange={onFilesChange} />);
    const zona = container.querySelector(".dropzone")!;
    expect(zona).not.toHaveAttribute("data-disabled");
    fireEvent.drop(zona, {dataTransfer: {files: [new File(["x"], "a.txt", {type: "text/plain"})]}});
    expect(onFilesChange).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// O NATIVO
// ─────────────────────────────────────────────────────────────────────────────────────────────

let disquetes = 0;
const ICONES = criarRegistroDeIcones({"check": (() => null) as never, "trash": (() => null) as never,
  "floppy-disk": (() => { disquetes++; return null; }) as never});
const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, code: {}};
function montarNativo(no: React.ReactNode) {
  return render(<AureaProvider theme="dark" icons={ICONES} fontFamilies={FONTES}>{no}</AureaProvider>);
}
const ultimo = (tipo: string, id: string) => __instancias(tipo).findLast((p) => p.testID === id);
const modal = () => ultimo("Modal", "m")!;
const painel = () => ultimo("Animated.View", "m-painel")!;
async function abrirNativo() {
  await act(async () => {});
  await act(async () => {
    const g = ultimo("Pressable", "gatilho")!;
    (g.ref as (n: unknown) => void)({
      measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(120, 200, 120, 48),
    });
    (g.onPress as (e: unknown) => void)({nativeEvent: {pageX: 0, pageY: 0}});
  });
  await act(async () => {
    (painel().onLayout as (e: unknown) => void)({nativeEvent: {layout: {x: 0, y: 0, width: 200, height: 160}}});
  });
}
const fecharPeloFundo = () => act(async () => { (ultimo("Pressable", "m-fundo")!.onPress as () => void)(); });
const esperar = (ms: number) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

describe("nativo · o menu se apaga ao fechar, sem prender o toque", () => {
  const umMenu = () => <DropdownMenu testID="m" label="Ações" trigger={<Button testID="gatilho">Abrir</Button>}
    items={[{label: "Editar"}, {label: "Excluir", destructive: true}]} />;

  it("fechar apaga no `durationFast`: o `Modal` fica durante a saída, e nada nele recebe toque", async () => {
    montarNativo(umMenu());
    await abrirNativo();
    await fecharPeloFundo();
    // O gatilho já diz "fechado"; a camada ainda está na tela, apagando.
    expect(ultimo("Pressable", "gatilho")!.accessibilityState).toMatchObject({expanded: false});
    expect(modal().visible).toBe(true);
    const saida = __configsDeAnimacao().at(-1)!;
    expect([saida.toValue, saida.duration]).toEqual([0, ESCURO.size.durationFast]);
    const camada = __instancias("View").findLast((p) => p.pointerEvents === "none" || p.pointerEvents === "auto")!;
    expect(camada.pointerEvents).toBe("none");
    expect(painel().pointerEvents).toBe("none");
    expect(ultimo("Pressable", "m-fundo")!.onPress).toBeUndefined();
  });

  it("nenhum desenho com o `Modal` invisível entre o fechar e o apagar (a janela não pisca)", async () => {
    montarNativo(umMenu());
    await abrirNativo();
    const antes = __instancias("Modal").length;
    await fecharPeloFundo();
    const depois = __instancias("Modal").slice(antes).filter((p) => p.testID === "m");
    expect(depois.length).toBeGreaterThan(0);
    // A primeira versão deste lote começava a saída num efeito: um desenho com `visible: false` vinha antes — no navegador
    // o painel sumia de vez, medido na página do nativo do site.
    expect(depois.map((p) => p.visible)).not.toContain(false);
  });

  it("o relógio de garantia tira o `Modal` mesmo que o fim da animação não chegue", async () => {
    montarNativo(umMenu());
    await abrirNativo();
    await fecharPeloFundo();
    expect(modal().visible).toBe(true);
    // O dublê nunca termina a animação: quem fecha é o relógio, no `durationBase`.
    await esperar(ESCURO.size.durationBase + 1);
    expect(modal().visible).toBe(false);
  });

  it("o fim da animação também tira o `Modal`, antes do relógio", async () => {
    montarNativo(umMenu());
    await abrirNativo();
    // Captura o fim que o componente entrega ao `start` da saída e o chama, como o aparelho faria.
    const {Animated} = await import("./native-stubs/react-native");
    const original = Animated.timing;
    let fim: ((r: {finished: boolean}) => void) | undefined;
    Animated.timing = ((v: unknown, cfg: Record<string, unknown>) => {
      const laco = original(v, cfg);
      return {...laco, start: (cb?: (r: {finished: boolean}) => void) => { laco.start(); if (cfg.toValue === 0) fim = cb; }};
    }) as typeof Animated.timing;
    try {
      await fecharPeloFundo();
      expect(modal().visible).toBe(true);
      await act(async () => { fim?.({finished: true}); });
      expect(modal().visible).toBe(false);
    } finally { Animated.timing = original; }
  });

  it("com \"reduzir movimento\" some na hora, como antes", async () => {
    __definirReduceMotion(true);
    montarNativo(umMenu());
    await abrirNativo();
    await fecharPeloFundo();
    expect(modal().visible).toBe(false);
  });

  it("reabrir no meio da saída cancela a saída: o painel volta a receber toque", async () => {
    montarNativo(umMenu());
    await abrirNativo();
    await fecharPeloFundo();
    await abrirNativo();
    expect(modal().visible).toBe(true);
    expect(painel().pointerEvents).toBe("auto");
    await esperar(ESCURO.size.durationBase + 1);
    // O relógio da saída cancelada não fecha o menu reaberto.
    expect(modal().visible).toBe(true);
  });
});

describe("nativo · o `Button` com `loading`", () => {
  it("a rodinha toma o lugar do ícone, na cor do texto; o texto fica; o toque trava; o leitor ouve \"ocupado\"", async () => {
    const onPress = vi.fn();
    disquetes = 0;
    montarNativo(<Button testID="b" leadingIcon="floppy-disk" loading onPress={onPress}>Salvar</Button>);
    const alvo = ultimo("Pressable", "b")!;
    expect(alvo.disabled).toBe(true);
    expect(alvo.accessibilityState).toMatchObject({busy: true, disabled: true});
    expect(alvo["aria-busy"]).toBe(true);
    // O texto continua.
    expect(__instancias("Text").some((t) => t.children === "Salvar")).toBe(true);
    // A rodinha: o anel do `Spinner`, decorativo, no tamanho do ícone do `md` e na cor do texto do botão.
    const anel = __instancias("Circle").at(-1)!;
    const svg = __instancias("Svg").at(-1)!;
    expect(svg.width).toBe(ESCURO.size.iconMd);
    const texto = __instancias("Text").findLast((t) => t.children === "Salvar")!;
    expect(anel.stroke).toBe(plano(texto.style).color);
    const caixaDoAnel = __instancias("Animated.View").at(-1)!;
    expect(caixaDoAnel.accessibilityElementsHidden).toBe(true);
    // O ícone da frente não é desenhado junto (troca, não acrescenta).
    expect(disquetes).toBe(0);
  });

  it("sem `loading`, o botão é o de antes: nada de rodinha, nada de ocupado", () => {
    disquetes = 0;
    montarNativo(<Button testID="b" leadingIcon="floppy-disk">Salvar</Button>);
    const alvo = ultimo("Pressable", "b")!;
    expect(alvo.disabled).toBeFalsy();
    expect((alvo.accessibilityState as Props | undefined)?.busy).toBeUndefined();
    expect(__instancias("Circle")).toHaveLength(0);
    expect(disquetes).toBeGreaterThan(0);
  });
});
