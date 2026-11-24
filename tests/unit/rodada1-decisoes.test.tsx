// A Rodada 1 das decisões em bloco (23/11/2026) — o Victor escolheu cada forma olhando a bancada viva, ao lado da
// referência nº 1, em Gold e Ember, claro e escuro:
//   1. o canto do `Tooltip` em 12 (o 12 da referência nº 2), por um token só da dica ("Um token só da dica");
//   2. a descrição do `Toast` do nativo em 14 ("Igual à web (14)");
//   3. o dígito do `OTPField` da web na letra do texto ("A letra do texto");
//   4. a capa em pé do `MediaEmbed` inteira, com a capa desfocada atrás ("Inteira, capa desfocada atrás");
//   5. no alto contraste, o contorno dos campos da Ember no laranja dela ("No laranja da Ember"), na web e no nativo;
//   6. a regra órfã do painel de saúde sai ("Apagar as cores velhas").
// Provado contra o defeito: com o código da 0.78.0, cada `it` abaixo reprova.
import {act, fireEvent, render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {MediaEmbed} from "../../packages/react/src/media-client.js";
import {StyleSheet, __instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, ToastHost, criarRegistroDeIcones, resolverTokens, useToast} from "../../packages/native/src/index.js";
import {fundoDeCampo} from "../../packages/native/src/estilos.js";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const tokens = readFileSync("packages/tokens/dist/aurea.tokens.css", "utf8");
/** O corpo da regra cujo seletor é EXATAMENTE este. */
const regra = (seletor: string) => {
  const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[}\\n])\\s*${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : "";
};

describe("1 · o canto da dica é 12, por um token só dela", () => {
  it("o token existe e vale 12", () => {
    expect(tokens).toMatch(/--tooltip-radius:12px;/);
  });
  it("a dica usa o token; o balão do gráfico fica com o canto de antes", () => {
    expect(regra(".tooltip:not(.chart-tooltip)")).toMatch(/border-radius:var\(--tooltip-radius\)/);
    expect(regra(".tooltip")).toMatch(/border-radius:var\(--radius-md\)/);
  });
});

describe("2 · a descrição do aviso do nativo é 14", () => {
  const t = resolverTokens("light", "comfortable");
  const Glifo = () => null;
  const ICONES = criarRegistroDeIcones({"x": Glifo as never, "x-bold": Glifo as never, "check-circle-fill": Glifo as never,
    "info-fill": Glifo as never, "warning-fill": Glifo as never, "x-circle-fill": Glifo as never});
  const FONTES = {ui: {"400": "Ui400", "500": "Ui500", "600": "Ui600", "700": "Ui700"}, code: {}};
  function Gatilho() {
    const toast = useToast();
    React.useEffect(() => { toast.add({title: "Arquivo enviado", description: "O relatório já está na pasta."}); }, []);
    return null;
  }
  it("a segunda linha em 14 (era 16); o título continua 16", () => {
    __limpar();
    act(() => { render(<AureaProvider icons={ICONES} fontFamilies={FONTES}><ToastHost><Gatilho /></ToastHost></AureaProvider>); });
    const de = (conteudo: string) => {
      const p = __instancias("Text").find((x) => x.children === conteudo);
      if (!p) throw new Error(`texto "${conteudo}" não desenhado`);
      return (StyleSheet.flatten(p.style as never) ?? {}) as Record<string, unknown>;
    };
    expect(de("O relatório já está na pasta.").fontSize).toBe(t.size.textSm);
    expect(t.size.textSm).toBe(14);
    expect(de("Arquivo enviado").fontSize).toBe(16);
  });
});

describe("3 · o dígito do campo de código na letra do texto", () => {
  it("a casa usa a fonte do texto, não a de código", () => {
    const casa = regra(".otp-slot");
    expect(casa).toMatch(/font-family:var\(--font-ui\)/);
    expect(casa).not.toMatch(/--font-code/);
  });
});

describe("4 · a capa em pé do vídeo aparece inteira, com a cópia desfocada atrás", () => {
  const carregar = (img: HTMLImageElement, largura: number, altura: number) => {
    Object.defineProperty(img, "naturalWidth", {configurable: true, value: largura});
    Object.defineProperty(img, "naturalHeight", {configurable: true, value: altura});
    act(() => { fireEvent.load(img); });
  };
  it("capa em pé: marca a fachada e põe a cópia de trás", () => {
    const {container} = render(<MediaEmbed src="https://www.youtube.com/embed/x" poster="capa.jpg" title="Vídeo"/>);
    carregar(container.querySelector(".media-embed-facade img") as HTMLImageElement, 180, 320);
    const fachada = container.querySelector(".media-embed-facade")!;
    expect(fachada.hasAttribute("data-portrait")).toBe(true);
    expect(fachada.querySelector(".media-embed-backdrop")?.getAttribute("src")).toBe("capa.jpg");
  });
  it("capa deitada: nada muda", () => {
    const {container} = render(<MediaEmbed src="https://www.youtube.com/embed/x" poster="capa.jpg" title="Vídeo"/>);
    carregar(container.querySelector(".media-embed-facade img") as HTMLImageElement, 320, 180);
    const fachada = container.querySelector(".media-embed-facade")!;
    expect(fachada.hasAttribute("data-portrait")).toBe(false);
    expect(fachada.querySelector(".media-embed-backdrop")).toBeNull();
  });
  it("o CSS: a capa da frente inteira e a de trás desfocada pelo token", () => {
    expect(regra(".media-embed-facade[data-portrait]>img:not(.media-embed-backdrop)")).toMatch(/object-fit:contain/);
    expect(regra(".media-embed-facade>.media-embed-backdrop")).toMatch(/filter:blur\(var\(--space-4\)\)/);
  });
});

describe("5 · no alto contraste, o contorno dos campos da Ember é o laranja dela", () => {
  it("web: a regra da Ember pinta a borda com o --primary, depois da cinza e antes do inválido", () => {
    const cinza = css.indexOf('[data-contrast="high"] :is(.input,.textarea,.select,.input-group,.combobox-multi,.input-secondary,.textarea-secondary) { border-color:var(--input-strong); }');
    const ember = css.indexOf(':is([data-brand="ember"][data-contrast="high"],[data-brand="ember"] [data-contrast="high"],[data-contrast="high"] [data-brand="ember"]) :is(.input,.textarea,.select,.input-group,.combobox-multi,.input-secondary,.textarea-secondary) { border-color:var(--primary); }');
    const invalido = css.indexOf('[data-contrast="high"] .combobox-multi:has([aria-invalid="true"],:user-invalid) { border-color:var(--danger-400); }');
    expect(cinza).toBeGreaterThan(-1);
    expect(ember).toBeGreaterThan(cinza);
    expect(invalido).toBeGreaterThan(ember);
  });
  it("nativo: na Ember, o laranja; nas outras marcas, o cinza de sempre", () => {
    for (const tema of ["light", "dark"] as const) {
      const ember = resolverTokens(tema, "comfortable", undefined, "ember");
      const gold = resolverTokens(tema, "comfortable");
      expect(fundoDeCampo(ember, false, true).borderColor, tema).toBe(ember.color.primary);
      expect(fundoDeCampo(gold, false, true).borderColor, tema).toBe(gold.color.inputStrong);
      expect(fundoDeCampo(ember, false, false).borderColor, tema).toBeUndefined();
    }
  });
});

describe("6 · a regra órfã do painel de saúde saiu", () => {
  it("nenhuma regra de .health-cell.warn, .bad ou .off", () => {
    expect(css).not.toMatch(/\.health-cell\.(warn|bad|off)\b/);
  });
});
