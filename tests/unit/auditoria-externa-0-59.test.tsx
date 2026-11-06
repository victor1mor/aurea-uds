// A auditoria externa de 05/11/2026, conferida no código no mesmo dia: os defeitos de código consertados na 0.59.0.
// Cada teste foi rodado contra o código de antes e reprovou.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it, vi} from "vitest";
import {KPI} from "../../packages/react/src/markup.js";
import {CodeBlock} from "../../packages/react/src/code-client.js";
import {Banner} from "../../packages/react/src/feedback-client.js";

// O aviso do React quando a ORDEM dos hooks muda entre renderizações (a regra dos hooks). Medido: ele não derruba nada
// aqui, mas perde o estado (o "copiado") e é a mesma classe de defeito que derruba quando o hook pulado é um estado.
const avisaOrdemDosHooks = (fn: () => void) => {
  const erro = vi.spyOn(console, "error").mockImplementation(() => {});
  try { fn(); return erro.mock.calls.some((c) => /order of Hooks|more hooks|fewer hooks/i.test(String(c[0]))); }
  finally { erro.mockRestore(); }
};

describe("os hooks vêm antes de todo `return` (A-006)", () => {
  it("CodeBlock: trocar `copyable` de false para true não muda a ordem dos hooks", () => {
    expect(avisaOrdemDosHooks(() => {
      const {rerender} = render(<CodeBlock language="ts" copyable={false}>{"const x = 1;"}</CodeBlock>);
      rerender(<CodeBlock language="ts" copyable>{"const x = 1;"}</CodeBlock>);
    })).toBe(false);
  });
  // LIMITE DECLARADO: o `Banner` também chamava hook depois do `return` do `consent` e foi consertado junto, mas o hook
  // pulado ali só lê contexto, e o React NÃO avisa — um teste daqui passaria com o defeito dentro (medido). A trava que
  // pegaria a classe inteira (ler o código e reprovar hook depois de `return`) precisa de um leitor de código próprio do
  // projeto, e fica como pendência registrada.
  it("Banner: as duas variantes ainda desenham depois de trocar", () => {
    const {rerender, container} = render(<Banner variant="info" title="Oi"/>);
    rerender(<Banner variant="consent" title="Cookies"/>);
    rerender(<Banner variant="info" title="Oi"/>);
    expect(container.querySelector(".banner-info")).not.toBeNull();
  });
});

describe("os três menus passam o portal do app aos itens (A-016)", () => {
  // O `Menubar` passava `undefined` aos submenus; hoje o motor os põe dentro do portal do menu-pai e nada aparece, mas os
  // outros dois menus passam o portal, e a diferença quebraria no dia em que o motor mudar essa regra.
  it("toda chamada de `renderMenuItems` leva o `portal`", () => {
    const src = readFileSync(join(__dirname, "../../packages/react/src/overlays.tsx"), "utf8");
    const chamadas = [...src.matchAll(/renderMenuItems\(([^,]+),([^,]+),/g)].filter((m) => !/readonly|MenuEntry/.test(m[1]));
    expect(chamadas.length).toBeGreaterThanOrEqual(3);
    expect(chamadas.map((m) => m[2].trim())).toEqual(chamadas.map(() => "portal"));
  });
});

const barras = (n: number) => [{label: "Jan", value: `${n}`, amount: n}, {label: "Feb", value: `${n + 1}`, amount: n + 1}];
// O nome do grupo de rádios de cada KPI. O jsdom NÃO desmarca o rádio de mesmo nome como o navegador faz (medido: a
// primeira versão deste teste, que contava os marcados, passava com o defeito dentro) — então a prova é a causa: dois
// KPI na página têm de ter grupos com nomes DIFERENTES. No navegador, nome igual faz o primeiro perder a escolhida.
const marcadosPorKpi = (c: HTMLElement) => {
  const nomes = [...c.querySelectorAll(".kpi")].map((k) => (k.querySelector(".kpi-bar-input") as HTMLInputElement).name);
  return nomes.map((n, i) => nomes.indexOf(n) === i ? 1 : 0);
};

describe("KPI com barras: dois na mesma página não dividem o grupo de rádios (A-017)", () => {
  it("o mesmo título, barras diferentes: cada um com a sua escolhida", () => {
    const {container} = render(<><KPI label="Total" value="1" bars={barras(1)}/><KPI label="Total" value="2" bars={barras(5)}/></>);
    expect(marcadosPorKpi(container)).toEqual([1, 1]);
  });
  it("o título em JSX (que virava \"x\"): cada um com a sua escolhida", () => {
    const {container} = render(<><KPI label={<span>A</span>} value="1" bars={barras(1)}/><KPI label={<span>B</span>} value="2" bars={barras(5)}/></>);
    expect(marcadosPorKpi(container)).toEqual([1, 1]);
  });
  it("dois idênticos se separam pelo `id`", () => {
    const {container} = render(<><KPI id="a" label="Total" value="1" bars={barras(1)}/><KPI id="b" label="Total" value="1" bars={barras(1)}/></>);
    expect(marcadosPorKpi(container)).toEqual([1, 1]);
  });
  it("o nome é o mesmo no servidor e no navegador (determinístico)", () => {
    const um = render(<KPI label="Total" value="1" bars={barras(1)}/>).container.querySelector("input")!.name;
    const dois = render(<KPI label="Total" value="1" bars={barras(1)}/>).container.querySelector("input")!.name;
    expect(um).toBe(dois);
    expect(um).toMatch(/^kpi-bars-total-[0-9a-z]+$/);
  });
});
