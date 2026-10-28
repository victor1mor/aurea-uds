// AS CORES, PASSO B (ADR-0084, 27/10/2026) — os estilos novos, lidos no código da web: cada prop escreve o atributo na
// peça (e sem a prop, nada — o padrão não muda), o core tem uma regra para cada valor, nenhuma regra nova alcança a
// `lory`, as medidas saem de token, e o degradê mora só na regra do `brand-gradient`. As cores no navegador estão em
// `tests/visual/paleta-passo-b.spec.ts`; o nativo, em `native-passo-b.test.tsx`.
// Provado contra o defeito (27/10/2026): com o código da 0.45.0, reprovam todos (nenhuma prop escreve atributo, e a seção
// do passo B não existe no core).
import {readFileSync} from "node:fs";
import {render} from "@testing-library/react";
import * as React from "react";
import {describe, expect, it} from "vitest";
import {AureaProvider, BottomNav, SegmentedControl, Timeline, Toggle, ToggleGroup, Toolbar, ToolbarButton} from "../../packages/react/src/index";

const montar = (no: React.ReactNode) => render(<AureaProvider>{no}</AureaProvider>).container;

describe("a web: cada prop escreve o atributo na peça", () => {
  it("o botão ligado: `pressedStyle` no Toggle, no ToggleGroup, no Toolbar e no ToolbarButton", () => {
    const c = montar(<>
      <Toggle label="Bold" defaultPressed pressedStyle="neutral" />
      <ToggleGroup label="Align" defaultValue={["l"]} pressedStyle="contrast"><Toggle value="l" label="Left" /></ToggleGroup>
      <Toolbar label="Format" pressedStyle="brand"><ToolbarButton pressed pressedStyle="contrast">B</ToolbarButton></Toolbar>
    </>);
    expect(c.querySelector('button.toggle[data-pressed-style="neutral"]')).not.toBeNull();
    expect(c.querySelector('.toggle-group[data-pressed-style="contrast"]')).not.toBeNull();
    expect(c.querySelector('.toolbar[data-pressed-style="brand"]')).not.toBeNull();
    expect(c.querySelector('.toolbar button[data-pressed-style="contrast"]')).not.toBeNull();
  });
  it("o segmento: `selectedStyle`, na escolha e na navegação", () => {
    const c = montar(<>
      <SegmentedControl label="A" value="x" items={[{value: "x", label: "X"}, {value: "y", label: "Y"}]} selectedStyle="dot" />
      <SegmentedControl label="B" value="x" items={[{value: "x", label: "X", href: "#x"}]} selectedStyle="ring" />
    </>);
    expect(c.querySelector('.segmented[data-segment-style="dot"]')).not.toBeNull();
    expect(c.querySelector('nav.segmented[data-segment-style="ring"]')).not.toBeNull();
  });
  it("a linha do tempo: `variant`; a barra de baixo: `currentStyle`", () => {
    const c = montar(<>
      <Timeline variant="time" items={[{title: "A", time: "09:00"}]} />
      <BottomNav label="Menu" current="a" currentStyle="bar-ink" items={[{id: "a", label: "A", icon: "house"}]} />
    </>);
    expect(c.querySelector('ol.timeline[data-timeline-style="time"]')).not.toBeNull();
    expect(c.querySelector('nav.bottom-nav[data-current-style="bar-ink"]')).not.toBeNull();
  });
  it("sem a prop, nenhum atributo: o padrão de cada peça não muda", () => {
    const c = montar(<>
      <Toggle label="Bold" defaultPressed />
      <SegmentedControl label="A" value="x" items={[{value: "x", label: "X"}]} />
      <Timeline items={[{title: "A"}]} />
      <BottomNav label="Menu" current="a" items={[{id: "a", label: "A", icon: "house"}]} />
    </>);
    expect(c.querySelector("[data-pressed-style],[data-segment-style],[data-timeline-style],[data-current-style]")).toBeNull();
  });
});

describe("o core: a seção do passo B", () => {
  const css = readFileSync("packages/core/src/aurea.css", "utf8");
  const ini = css.indexOf("═══ AS CORES, passo B");
  const fim = css.indexOf(">>> camada responsiva");
  const secao = css.slice(css.lastIndexOf("/*", ini), fim).replace(/\/\*[\s\S]*?\*\//g, "");
  const regras = [...secao.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({sel: m[1].trim(), corpo: m[2]}))
    .filter((r) => !r.sel.startsWith("@media"));

  it("a seção existe, e cada valor de cada família tem a sua regra (o teste não passa por vacuidade)", () => {
    expect(ini).toBeGreaterThan(0);
    const valores: Record<string, string[]> = {
      "pressed-style": ["neutral", "contrast", "brand"],
      "segment-style": ["neutral", "contrast", "brand", "ring", "dot"],
      "timeline-style": ["ring", "latest", "time", "contrast"],
      "current-style": ["neutral", "contrast", "brand", "ring", "plain", "brand-white", "white-ring", "brand-gradient",
        "bar-ink", "bar-ring", "bar-plain", "bar-light"],
    };
    for (const [familia, lista] of Object.entries(valores)) for (const v of lista) {
      expect(secao, `data-${familia}="${v}"`).toContain(`[data-${familia}="${v}"]`);
    }
  });
  // ~~toda regra da seção leva a exclusão da lory~~ → a Ember (a antiga lory) RECEBE os estilos, como as outras marcas
  // (o Victor, 28/10/2026: "Sim, como as outras"). Provado contra o defeito: com a guarda de antes, reprova.
  it("nenhuma regra da seção exclui a Ember, e o ligado dela com estilo ganha a pintura", () => {
    expect(regras.length).toBeGreaterThan(40);
    for (const r of regras) expect(r.sel, r.sel.slice(0, 120)).not.toContain(':where(:not(:is([data-brand="ember"],[data-brand="lory"]),:is([data-brand="ember"],[data-brand="lory"]) *))');
    const pintura = regras.filter((r) => r.sel.includes('[data-pressed-style]') && r.sel.includes(':where(:is([data-brand="ember"],[data-brand="lory"])')
      && r.corpo.includes('background:var(--pressed-bg)'));
    expect(pintura.length).toBe(1);
  });
  it("a peça com o seu atributo ganha do contêiner: o caminho do contêiner pula quem tem o próprio", () => {
    const contem = (familia: string, classe: string) =>
      new RegExp(`\\[data-${familia}="[\\w-]+"\\] ${classe.replace(".", "\\.")}:not\\(\\[data-${familia}\\]\\)`).test(secao);
    expect(contem("segment-style", ".segmented")).toBe(true);
    expect(contem("timeline-style", ".timeline")).toBe(true);
    expect(contem("current-style", ".bottom-nav")).toBe(true);
  });
  it("as medidas saem de token: nenhum número cru em px ou rem na seção", () => {
    expect(secao.match(/(?<![\w.-])\d*\.?\d+(px|rem)\b/g) ?? []).toEqual([]);
  });
  it("o degradê só na regra do `brand-gradient` (a segunda exceção à ADR-0007)", () => {
    const comDegrade = regras.filter((r) => r.corpo.includes("gradient("));
    expect(comDegrade).toHaveLength(1);
    expect(comDegrade[0].sel).toContain('[data-current-style="brand-gradient"]');
  });
});
