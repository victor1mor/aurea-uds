// R-20 (01/10/2026) · o estado para o leitor de tela também na WEB. O `react-native-web` 0.21.3
// não lê `accessibilityState` (só `aria-*`), então o `RadioGroup` aberto no navegador saía sem
// `aria-checked`. Este arquivo cobra duas coisas: (1) cada peça que diz um estado o diz nas duas
// formas, com o mesmo valor; (2) nenhum fonte do nativo escreve `accessibilityState={` cru — a
// peça nova que esquecer a forma da web reprova aqui, antes de chegar ao navegador.
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import * as React from "react";
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {__instancias} from "./native-stubs/react-native";
import {
  AureaProvider, Button, Checkbox, Radio, RadioGroup, SegmentedControl, Select, Switch, Tabs,
} from "../../packages/native/src/index.js";

const Envolve = ({children}: {children: React.ReactNode}) => <AureaProvider>{children}</AureaProvider>;
const comEstado = () => [...__instancias("Pressable"), ...__instancias("View")]
  .filter((p) => p.accessibilityState != null);

/** Cada chave do `accessibilityState` tem a `aria-*` gêmea, com o mesmo valor. */
function conferirGemeas() {
  const vistas = comEstado();
  expect(vistas.length).toBeGreaterThan(0);
  for (const p of vistas) {
    const e = p.accessibilityState as Record<string, unknown>;
    for (const k of ["checked", "selected", "disabled", "expanded", "busy"] as const) {
      if (e[k] === undefined) continue;
      if (k === "checked" && p["aria-pressed"] !== undefined) {
        expect(p["aria-pressed"], `${String(p.accessibilityRole)} aria-pressed`).toBe(e.checked);
        continue;
      }
      expect(p[`aria-${k}`], `${String(p.accessibilityRole)} aria-${k}`).toBe(e[k]);
    }
  }
}

describe("R-20 · o estado chega à web em aria-*", () => {
  it("RadioGroup: a opção marcada tem aria-checked=true e as outras false", () => {
    render(<Envolve>
      <RadioGroup label="Entrega" value="b" onValueChange={() => {}}>
        <RadioGroup.Item value="a" label="A" />
        <RadioGroup.Item value="b" label="B" />
        <RadioGroup.Item value="c" label="C" disabled />
      </RadioGroup>
    </Envolve>);
    const itens = __instancias("Pressable").filter((p) => p.accessibilityRole === "radio").slice(-3);
    expect(itens.map((p) => p["aria-checked"])).toEqual([false, true, false]);
    expect(itens.map((p) => p["aria-disabled"])).toEqual([false, false, true]);
    conferirGemeas();
  });
  it("Radio, Checkbox e Switch dizem marcado na web", () => {
    render(<Envolve>
      <Radio label="R" checked onChange={() => {}} />
      <Checkbox label="C" checked={false} onChange={() => {}} />
      <Switch label="S" checked onChange={() => {}} />
    </Envolve>);
    const papel = (r: string) => __instancias("Pressable").filter((p) => p.accessibilityRole === r).at(-1)!;
    expect(papel("radio")["aria-checked"]).toBe(true);
    expect(papel("checkbox")["aria-checked"]).toBe(false);
    expect(papel("switch")["aria-checked"]).toBe(true);
    conferirGemeas();
  });
  it("SegmentedControl, Tabs e Select dizem o escolhido e o aberto", () => {
    render(<Envolve>
      <SegmentedControl label="Período" value="m" onChange={() => {}}
        items={[{value: "d", label: "Dia"}, {value: "m", label: "Mês"}]} />
      <Tabs label="Seções" value="x" onChange={() => {}}
        tabs={[{id: "x", label: "X", content: null}, {id: "y", label: "Y", content: null}]} />
      <Select value="1" onChange={() => {}} items={[{value: "1", label: "Um"}]} />
    </Envolve>);
    conferirGemeas();
    const abas = __instancias("Pressable").filter((p) => p.accessibilityRole === "tab").slice(-2);
    expect(abas.map((p) => p["aria-selected"])).toEqual([true, false]);
    const select = __instancias("Pressable").filter((p) => p["aria-expanded"] !== undefined).at(-1)!;
    expect(select["aria-expanded"]).toBe(false);
  });
  it("o botão de ligar e desligar vira aria-pressed na web, e continua checked no aparelho", () => {
    render(<Envolve><Button pressed onPress={() => {}}>Negrito</Button></Envolve>);
    const b = __instancias("Pressable").filter((p) => p.accessibilityRole === "button").at(-1)!;
    expect(b["aria-pressed"]).toBe(true);
    expect(b["aria-checked"]).toBeUndefined();
    expect((b.accessibilityState as {checked?: boolean}).checked).toBe(true);
  });
  it("nenhum fonte do nativo escreve accessibilityState cru — passa pelo estadoAcessivel", () => {
    const dir = join(__dirname, "../../packages/native/src");
    const crus: string[] = [];
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".tsx"))) {
      readFileSync(join(dir, f), "utf8").split("\n").forEach((linha, i) => {
        const codigo = linha.replace(/\/\/.*$/, "");
        if (/^\s*\*/.test(codigo) || codigo.includes("`")) return;
        if (/accessibilityState=\{/.test(codigo)) crus.push(`${f}:${i + 1}`);
      });
    }
    expect(crus).toEqual([]);
  });
});
