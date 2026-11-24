// O LOTE 102 (0.81.0) — o que o Victor decidiu em 24/11/2026 (`STATUS-1.0.md`) e não muda a tela:
//   1. as Actions da CI nas versões novas, presas por SHA, e o robô de atualização SÓ para elas ("Atualizar e ligar o robô");
//   2. o `useValorResponsivo` com nome em inglês, `useResponsiveValue`, e o antigo como apelido ("Sim, com o antigo");
//   3. o `Switch` avisa o app com verdadeiro/falso, como o nativo, e o evento continua ("Sim, os dois jeitos");
//   4. o `Combobox` e o `MultiCombobox` vão junto com o formulário: `name`, `required`, `defaultValue` (defeito de 24/11);
//   5. a rodinha e o círculo sem fim giram mais devagar com "menos movimento", em vez de parar (defeito de 24/11).
// Provado contra o defeito: com o código da 0.80.0, cada `it` abaixo reprova.
import {fireEvent, render} from "@testing-library/react";
import {readFileSync, existsSync, readdirSync} from "node:fs";
import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import * as Web from "../../packages/react/src/index.js";
import {Switch} from "../../packages/react/src/markup.js";
import {Combobox, MultiCombobox, Field} from "../../packages/react/src/inputs-client.js";
import {__instancias, __limpar} from "./native-stubs/react-native";
import {AureaProvider, Switch as SwitchNativo, criarRegistroDeIcones} from "../../packages/native/src/index.js";

describe("1 · as Actions da CI e o robô", () => {
  const fluxos = readdirSync(".github/workflows").filter((f) => f.endsWith(".yml"))
    .map((f) => readFileSync(`.github/workflows/${f}`, "utf8")).join("\n");
  const usos = [...fluxos.matchAll(/uses:\s*(\S+)(.*)$/gm)].map((m) => ({acao: m[1], resto: m[2]}));
  it("toda Action é presa por SHA (40 letras), com a versão no comentário", () => {
    expect(usos.length).toBeGreaterThan(0);
    for (const u of usos) {
      expect(u.acao, u.acao).toMatch(/@[0-9a-f]{40}$/);
      expect(u.resto, u.acao).toMatch(/#\s*v\d+/);
    }
  });
  it("as quatro do GitHub na versão nova (nenhuma ainda no Node 20)", () => {
    const versao = (nome: string) => usos.filter((u) => u.acao.startsWith(`${nome}@`)).map((u) => u.resto.match(/#\s*v(\d+)/)?.[1]);
    for (const [nome, minimo] of [["actions/checkout", 7], ["actions/setup-node", 7], ["actions/setup-python", 7],
      ["actions/upload-artifact", 7]] as const) {
      const vs = versao(nome);
      expect(vs.length, nome).toBeGreaterThan(0);
      for (const v of vs) expect(Number(v), nome).toBeGreaterThanOrEqual(minimo);
    }
    // a de baixar arquivo da rodada, se um dia entrar, já na 8 (a que falha em hash diferente)
    for (const v of versao("actions/download-artifact")) expect(Number(v)).toBeGreaterThanOrEqual(8);
  });
  it("o robô existe e cuida SÓ das Actions (os pacotes ficam com a auditoria da CI)", () => {
    expect(existsSync(".github/dependabot.yml")).toBe(true);
    const robo = readFileSync(".github/dependabot.yml", "utf8").replace(/#.*$/gm, "");
    const ecossistemas = [...robo.matchAll(/package-ecosystem:\s*"?([\w-]+)"?/g)].map((m) => m[1]);
    expect(ecossistemas).toEqual(["github-actions"]);
  });
});

describe("2 · o nome em inglês do resolvedor responsivo", () => {
  it("`useResponsiveValue` sai pela porta da frente, e o `useValorResponsivo` é o mesmo hook", () => {
    const w = Web as Record<string, unknown>;
    expect(typeof w.useResponsiveValue).toBe("function");
    expect(w.useValorResponsivo).toBe(w.useResponsiveValue);
  });
  it("as duas fichas: a nova é a de verdade, a antiga diz que é o nome antigo", () => {
    const nova = JSON.parse(readFileSync("packages/contracts/registry/useResponsiveValue.json", "utf8"));
    const antiga = JSON.parse(readFileSync("packages/contracts/registry/useValorResponsivo.json", "utf8"));
    expect(nova.maturity).toBe("Ready");
    expect(nova.source.react).toMatch(/#useResponsiveValue$/);
    expect(antiga.maturity).toBe("Deprecated");
  });
});

describe("3 · o Switch avisa com verdadeiro/falso, e o evento continua", () => {
  it("web: `onCheckedChange` recebe true e depois false", () => {
    const aviso = vi.fn();
    const {getByRole} = render(<Switch label="Avisos" onCheckedChange={aviso} />);
    fireEvent.click(getByRole("switch"));
    fireEvent.click(getByRole("switch"));
    expect(aviso.mock.calls).toEqual([[true], [false]]);
  });
  it("web: o `onChange` de sempre continua recebendo o evento do campo — e os dois juntos rodam", () => {
    const ordem: string[] = [];
    const evento = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => ordem.push(`evento:${e.target.checked}`));
    const {getByRole} = render(<Switch label="Avisos" onChange={evento}
      onCheckedChange={(v) => ordem.push(`valor:${v}`)} />);
    fireEvent.click(getByRole("switch"));
    expect(evento).toHaveBeenCalledTimes(1);
    expect(ordem).toEqual(["valor:true", "evento:true"]);
  });
  it("web: controlado só com `onCheckedChange`, sem o aviso do React de campo sem `onChange`", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    function Controlado() {
      const [on, setOn] = React.useState(false);
      return <Switch label="Avisos" checked={on} onCheckedChange={setOn} />;
    }
    const {getByRole} = render(<Controlado />);
    fireEvent.click(getByRole("switch"));
    expect((getByRole("switch") as HTMLInputElement).checked).toBe(true);
    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });
  it("nativo: o mesmo nome, `onCheckedChange`, com o novo valor", () => {
    __limpar();
    const Glifo = () => null;
    const aviso = vi.fn();
    render(<AureaProvider theme="light" icons={criarRegistroDeIcones({"x": Glifo})}>
      <SwitchNativo testID="s" label="Avisos" checked={false} onCheckedChange={aviso} />
    </AureaProvider>);
    const toque = __instancias("Pressable").filter((p) => p.testID === "s").at(-1);
    (toque?.onPress as () => void)();
    expect(aviso).toHaveBeenCalledWith(true);
  });
});

describe("4 · o campo com busca vai junto com o formulário", () => {
  const pessoas = [{value: "messenger", label: "Messenger"}, {value: "analyst", label: "Analyst"}];
  const enviado = (form: HTMLFormElement) => [...new FormData(form).entries()];
  it("`Combobox` com `name` e `defaultValue`: o formulário leva o valor da opção", () => {
    const {container} = render(<form><Combobox label="Quem" name="assignee" items={pessoas} defaultValue={pessoas[1]} /></form>);
    expect(enviado(container.querySelector("form")!)).toEqual([["assignee", "analyst"]]);
  });
  it("`Combobox` com `required`: o campo escondido é obrigatório e o de digitar diz ao leitor de tela", () => {
    const {container, getByRole} = render(<form><Combobox label="Quem" name="assignee" items={pessoas} required /></form>);
    const escondido = container.querySelector<HTMLInputElement>('input[name="assignee"]')!;
    expect(escondido.required).toBe(true);
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    expect(getByRole("combobox").getAttribute("aria-required")).toBe("true");
  });
  it("o `required` do `Field` chega ao `Combobox` (o `Field` já mandava; a peça jogava fora)", () => {
    const {container} = render(<form><Field label="Quem" required><Combobox name="assignee" items={pessoas} /></Field></form>);
    expect(container.querySelector<HTMLInputElement>('input[name="assignee"]')!.required).toBe(true);
  });
  it("`MultiCombobox` com `name` e `defaultValue`: um valor por opção escolhida", () => {
    const {container} = render(<form><MultiCombobox label="Quem" name="people" items={pessoas} defaultValue={pessoas} /></form>);
    expect(enviado(container.querySelector("form")!)).toEqual([["people", "messenger"], ["people", "analyst"]]);
  });
});

describe("5 · com menos movimento, a rodinha e o círculo sem fim giram devagar", () => {
  const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const blocos = [...css.matchAll(/@media \(prefers-reduced-motion:reduce\) \{([\s\S]*?)\}\s*\}/g)].map((m) => m[1]);
  const regraReduzida = (seletor: string) => {
    const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const b of blocos) {
      const m = b.match(new RegExp(`(?:^|[}\\s])${esc}\\s*\\{([^}]*)`));
      if (m) return m[1];
    }
    return "";
  };
  it("a regra global continua parando o resto", () => {
    expect(css).toMatch(/\*,\*:before,\*:after \{[^}]*animation-iteration-count:1!important/);
  });
  for (const [seletor, tempo] of [[".spinner", "2.1s"], [".progress-circle-indeterminate > svg", "3s"]] as const) {
    it(`${seletor}: ${tempo}, sem fim, e vence a global (!important com classe)`, () => {
      const r = regraReduzida(seletor);
      expect(r).toContain(`animation-duration:${tempo}!important`);
      expect(r).toContain("animation-iteration-count:infinite!important");
    });
  }
});
