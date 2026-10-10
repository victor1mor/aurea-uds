// ADR-0061 (09/10/2026) · as cores dos dois temas seguem a paleta de referência escolhida pelo
// Victor, e o amarelo da marca continua o nosso. Duas coisas que nenhum outro teste cobria:
//   1. os VALORES — a decisão é "igual à referência", então o número é o contrato. Quem mudar um
//      deles sem ADR nova reprova aqui;
//   2. o PAPEL — `--success`, `--info`, `--warning` e `--destructive` viraram FUNDO cheio (a mesma
//      cor funda nos dois temas). Como letra, no escuro, o verde dá 2,7 a 3,1:1, o azul 3,2 a 3,6:1
//      e o vermelho 2,4 a 2,7:1 (medido sobre o fundo e o cartão). O core não pode voltar a pintar
//      letra, ícone, borda ou barra com eles: para isso existe o par `-400`.
// Provado contra o defeito: com a folha da 0.26.1, (1) reprova em todos os valores e (2) acha os
// 24 usos de fundo como letra que esta versão trocou (20 de letra, ícone ou borda e 4 barras).
import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, test} from "vitest";
import {StyleSheet, __instancias} from "./native-stubs/react-native";
import {AureaProvider, Badge, Button, Progress, Status, Text, resolverTokens} from "../../packages/native/src/index.js";

const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
const core = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const bloco = (sel: string) => {
  const i = tokens.indexOf(`${sel}{`) >= 0 ? tokens.indexOf(`${sel}{`) : tokens.indexOf(`${sel} {`);
  expect(i, `o bloco ${sel} existe`).toBeGreaterThanOrEqual(0);
  return tokens.slice(i, tokens.indexOf("}", i));
};
const valor = (b: string, nome: string) => b.match(new RegExp(`--${nome}:([^;]+);`))?.[1].trim();

const CLARO: Record<string, string> = {
  background: "#f5f5f5", foreground: "#242424", card: "#ffffff", border: "#e0e0e0",
  "muted-foreground": "#616161", "border-strong": "#616161",
  success: "#107c10", "success-400": "#0e700e", "success-bg": "#f1faf1",
  warning: "#f7630c", "warning-400": "#8a3707", "warning-bg": "#fff9f5",
  destructive: "#c50f1f", "danger-400": "#b10e1c", "danger-bg": "#fdf3f4",
  info: "#0078d4", "info-400": "#006cbf", "info-bg": "#f3f9fd",
};
const ESCURO: Record<string, string> = {
  background: "#1f1f1f", foreground: "#ffffff", card: "#292929", border: "#525252",
  "muted-foreground": "#adadad", "border-strong": "#adadad", secondary: "#333333",
  success: "#107c10", "success-400": "#54b054", "success-bg": "#052505",
  warning: "#f7630c", "warning-400": "#faa06b", "warning-bg": "#4a1e04",
  destructive: "#c50f1f", "danger-400": "#eeacb2", "danger-bg": "#3b0509",
  info: "#0078d4", "info-400": "#5caae5", "info-bg": "#002440",
};

describe("ADR-0061 · os valores da paleta de referência", () => {
  test.each([["[data-theme=\"light\"]", CLARO], ["[data-theme=\"dark\"]", ESCURO]] as const)("%s", (sel, mapa) => {
    const b = bloco(sel);
    for (const [nome, esperado] of Object.entries(mapa)) expect(valor(b, nome), `--${nome}`).toBe(esperado);
  });
  test("o botão cheio é a MESMA cor nos dois temas (como na referência)", () => {
    for (const t of ["success", "warning", "destructive", "info"])
      expect(valor(bloco("[data-theme=\"dark\"]"), t), t).toBe(valor(bloco("[data-theme=\"light\"]"), t));
  });
  test("a marca não muda", () => {
    expect(tokens).toContain("--brand-yellow:oklch(0.795 0.184 86.047)");
    expect(tokens).toContain("--primary:var(--brand-yellow)");
  });
});

describe("ADR-0061 · a cor de fundo nunca vira letra no core", () => {
  test("nenhuma letra, ícone, borda ou barra pintada com --success, --info, --warning ou --destructive", () => {
    const proibido = /(?:^|[;{\s])(color|--btn-fg|--btn-border|border-color|--badge-accent):\s*var\(--(success|info|warning|destructive)\)/g;
    const achados = [...core.matchAll(proibido)].map((m) => `${m[1]}: var(--${m[2]})`);
    expect(achados).toEqual([]);
    // A barra do progresso é desenho sobre a trilha: também usa o par de letra.
    expect(core).not.toMatch(/\.progress-tone-\w+>span\s*\{\s*background:var\(--(success|info|warning|destructive)\)/);
  });
});

describe("ADR-0063 · a exceção: o traço do Card é enfeite e usa a cor CHEIA", () => {
  // O traço no topo (`Card accent`) é a ÚNICA borda pintada com a cor de fundo, por decisão do
  // Victor (10/10/2026): o nome da caixa diz o assunto, e o traço não carrega informação. A exceção
  // mora numa variável própria (`--card-accent`), para que a regra de cima continue valendo para
  // toda outra borda — quem quiser pintar outra borda com a cor cheia reprova lá.
  test("a cor cheia só entra pela variável do traço, e a variável só pinta o traço", () => {
    const usos = [...core.matchAll(/([^{}]+)\{[^}]*--card-accent:\s*var\(--(success|info|warning|destructive|primary)\)/g)]
      .map((m) => m[1].trim());
    expect(usos).toEqual([".card-accent-brand", ".card-accent-success", ".card-accent-info", ".card-accent-warning", ".card-accent-danger"]);
    const quemLe = [...core.matchAll(/([^{}]+)\{[^}]*var\(--card-accent\)/g)].map((m) => m[1].trim());
    expect(quemLe).toEqual([".card.card-accent"]);
  });
});

describe("ADR-0061 · no nativo, a mesma regra", () => {
  const t = resolverTokens("dark", "comfortable");
  const plano = (e: unknown) => (StyleSheet.flatten(e as never) ?? {}) as Record<string, unknown>;
  const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider theme="dark">{children}</AureaProvider>;
  const textoDe = (c: string) => __instancias("Text").map((p) => ({...p, s: plano(p.style)})).find((p) => p.children === c)!;

  test("o botão de contorno escreve com o par de letra; o cheio enche com a cor funda", () => {
    render(<Envolve><Button appearance="outline" tone="success" onPress={() => {}}>Contorno</Button>
      <Button appearance="solid" tone="success" onPress={() => {}}>Cheio</Button></Envolve>);
    expect(textoDe("Contorno").s.color).toBe(t.color.success400);
    expect(textoDe("Cheio").s.color).toBe(t.color.successForeground);
    expect([...__instancias("Pressable"), ...__instancias("View")].map((p) => plano(p.style))
      .some((e) => e.backgroundColor === t.color.success), "o botão cheio na cor funda").toBe(true);
  });
  test("o selo cheio de estado é o botão cheio (cor funda e a letra dele)", () => {
    render(<Envolve><Badge tone="warning" emphasis="solid">Aviso</Badge></Envolve>);
    expect(__instancias("View").map((p) => plano(p.style)).some((e) => e.backgroundColor === t.color.warning)).toBe(true);
    expect(textoDe("Aviso").s.color).toBe(t.color.warningForeground);
  });
  test("o ponto de situação usa o par de letra", () => {
    render(<Envolve><Status variant="info">Agendado</Status></Envolve>);
    expect(__instancias("View").map((p) => plano(p.style)).some((e) => e.backgroundColor === t.color.info400)).toBe(true);
  });
  // Achados na 0.28.0: os dois tinham ficado de fora da 0.27.0 e pintavam com a cor de FUNDO — o
  // texto de tom no escuro a ~2,5:1. Provado contra o defeito: com a 0.27.0, os dois reprovam.
  test("o texto de tom escreve com o par de letra, nos quatro estados", () => {
    render(<Envolve><Text tone="success">Pago</Text><Text tone="danger">Atrasado</Text>
      <Text tone="warning">Vence hoje</Text><Text tone="info">Agendado</Text></Envolve>);
    expect(textoDe("Pago").s.color).toBe(t.color.success400);
    expect(textoDe("Atrasado").s.color).toBe(t.color.danger400);
    expect(textoDe("Vence hoje").s.color).toBe(t.color.warning400);
    expect(textoDe("Agendado").s.color).toBe(t.color.info400);
  });
  test("o tom que não é de estado continua como era (a lista do par de letra é fechada)", () => {
    render(<Envolve><Text tone="muted">Apoio</Text><Text tone="link">Ver mais</Text></Envolve>);
    expect(textoDe("Apoio").s.color).toBe(t.color.mutedForeground);
    expect(textoDe("Ver mais").s.color).toBe(t.color.link);
  });
  test("a barra do progresso com tom é desenho sobre a trilha: usa o par de letra", () => {
    render(<Envolve><Progress value={40} tone="danger"/></Envolve>);
    const fundos = __instancias("View").map((p) => plano(p.style).backgroundColor);
    expect(fundos).toContain(t.color.danger400);
    expect(fundos).not.toContain(t.color.destructive);
  });
});
