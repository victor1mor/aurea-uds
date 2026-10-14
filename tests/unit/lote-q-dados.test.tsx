// 0.32.0, passo 6 (dados) · as peças novas da referência (Link, ColorSwatch, ProgressCircle, TagGroup) e o
// `tone` do Badge na web. O que o React emite e o comportamento; a medida (a moldura da tabela, o selo de
// 24, o avatar de 40, o anel de 28) é do `skin.spec.ts`.
// Provado contra o defeito: na 0.31.0 nenhuma das quatro existia, e o `Badge` da web não aceitava `tone`
// (o nome do nativo) — passava o atributo adiante e pintava o neutro.
import {useState} from "react";
import {render, screen, fireEvent, act} from "@testing-library/react";
import {vi} from "vitest";
import {AureaProvider, Badge, ColorSwatch, Link, ProgressCircle, TagGroup, ptBR} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("Link", () => {
  test("um <a> de verdade, com a classe da pele", () => {
    wrap(<Link href="/termos">termos</Link>);
    const a = screen.getByRole("link", {name: "termos"});
    expect(a).toHaveClass("link");
    expect(a).toHaveAttribute("href", "/termos");
    expect(a).not.toHaveAttribute("target");
  });
  test("`external` abre noutra aba, com o `rel` seguro e a seta decorativa", () => {
    wrap(<Link href="https://exemplo.com" external>Docs</Link>);
    const a = screen.getByRole("link", {name: "Docs"});
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
    expect(a.querySelector(".link-external")).toHaveAttribute("aria-hidden", "true");
  });
  test("`disabled` sai sem `href` e com `aria-disabled`", () => {
    const {container} = wrap(<Link href="/exportar" disabled>Exportar</Link>);
    const a = container.querySelector("a.link")!;
    expect(a).not.toHaveAttribute("href");
    expect(a).toHaveAttribute("aria-disabled", "true");
  });
});

describe("ColorSwatch", () => {
  test("uma imagem com o nome; sem nome, o valor da cor", () => {
    wrap(<><ColorSwatch color="#f0c200" label="Amarelo Aurea" /><ColorSwatch color="#123456" size="xl" /></>);
    const [a, b] = screen.getAllByRole("img");
    expect(a).toHaveAccessibleName("Amarelo Aurea");
    expect(a.style.getPropertyValue("--color-swatch-current")).toBe("#f0c200");
    expect(a.className).toBe("color-swatch");
    expect(b).toHaveAccessibleName("#123456");
    expect(b).toHaveClass("color-swatch-xl");
  });
});

describe("ProgressCircle", () => {
  test("com valor: os três `aria-value*` e o anel preenchido na conta certa", () => {
    wrap(<ProgressCircle label="Enviando" value={30} min={0} max={60} />);
    const p = screen.getByRole("progressbar", {name: "Enviando"});
    expect(p).toHaveAttribute("aria-valuenow", "30");
    expect(p).toHaveAttribute("aria-valuemin", "0");
    expect(p).toHaveAttribute("aria-valuemax", "60");
    // metade: 100 - 50
    expect(p.querySelector(".progress-circle-fill")).toHaveAttribute("stroke-dashoffset", "50");
    expect(p).not.toHaveClass("progress-circle-indeterminate");
  });
  test("sem valor, gira e não diz número", () => {
    wrap(<ProgressCircle label="Carregando" tone="success" size="lg" />);
    const p = screen.getByRole("progressbar", {name: "Carregando"});
    expect(p).not.toHaveAttribute("aria-valuenow");
    expect(p).toHaveClass("progress-circle-indeterminate", "progress-circle-success", "progress-circle-lg");
  });
});

describe("Badge tone (DOC-11)", () => {
  test("`tone` pinta como o `variant`, e vence quando os dois vêm", () => {
    const {container} = wrap(<><Badge tone="success">ok</Badge><Badge variant="danger" tone="info">info</Badge></>);
    const [a, b] = [...container.querySelectorAll(".badge")];
    expect(a).toHaveClass("badge-success");
    expect(b).toHaveClass("badge-info");
    expect(b).not.toHaveClass("badge-danger");
    expect(a).not.toHaveAttribute("tone");
  });
});

const ITENS = [{id: "a", label: "Notícias"}, {id: "b", label: "Viagem"}, {id: "c", label: "Jogos", disabled: true}, {id: "d", label: "Compras"}];

describe("TagGroup", () => {
  test("com escolha: um grupo nomeado, botões que ligam e desligam, um ponto de Tab só", () => {
    const mudou = vi.fn();
    wrap(<TagGroup label="Assuntos" selectionMode="multiple" items={ITENS} onSelectionChange={mudou} />);
    const grupo = screen.getByRole("group", {name: "Assuntos"});
    const botoes = [...grupo.querySelectorAll<HTMLButtonElement>(".tag-main")];
    expect(botoes.map(b => b.tabIndex)).toEqual([0, -1, -1, -1]);
    fireEvent.click(botoes[1]);
    expect(mudou).toHaveBeenLastCalledWith(["b"]);
    expect(botoes[1]).toHaveAttribute("aria-pressed", "true");
    expect(botoes[1].closest(".tag")).toHaveAttribute("data-selected");
  });
  test("as setas andam e pulam a desligada; Home e End vão às pontas", () => {
    wrap(<TagGroup label="Assuntos" selectionMode="single" items={ITENS} />);
    const [a, b, , d] = [...document.querySelectorAll<HTMLButtonElement>(".tag-main")];
    act(() => a.focus());
    fireEvent.keyDown(a, {key: "ArrowRight"});
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, {key: "ArrowRight"});
    expect(document.activeElement).toBe(d);
    fireEvent.keyDown(d, {key: "Home"});
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, {key: "End"});
    expect(document.activeElement).toBe(d);
  });
  test("`single`: escolher outra troca, e clicar de novo desliga", () => {
    const mudou = vi.fn();
    wrap(<TagGroup label="Um só" selectionMode="single" items={ITENS} defaultSelectedKeys={["a"]} onSelectionChange={mudou} />);
    const [a, b] = [...document.querySelectorAll<HTMLButtonElement>(".tag-main")];
    fireEvent.click(b);
    expect(mudou).toHaveBeenLastCalledWith(["b"]);
    expect(a).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(b);
    expect(mudou).toHaveBeenLastCalledWith([]);
  });
  test("Delete tira a ativa, e o foco vai para a vizinha", async () => {
    function Palco() {
      const [itens, setItens] = useState(ITENS);
      return <TagGroup label="Filtros" selectionMode="single" items={itens} onRemove={ids => setItens(xs => xs.filter(x => !ids.includes(x.id)))} />;
    }
    wrap(<Palco />);
    const b = screen.getByRole("button", {name: "Viagem"});
    act(() => b.focus());
    fireEvent.keyDown(b, {key: "Delete"});
    await act(async () => { await new Promise(r => requestAnimationFrame(() => r(null))); });
    expect(screen.queryByText("Viagem")).toBeNull();
    expect(document.activeElement).toHaveTextContent("Compras");
  });
  test("sem escolha é uma lista, e o X (com nome) é o ponto de Tab", () => {
    wrap(<TagGroup label="Filtros" items={ITENS.slice(0, 2)} onRemove={() => {}} />);
    const lista = screen.getByRole("list", {name: "Filtros"});
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const xs = [...lista.querySelectorAll<HTMLButtonElement>(".tag-remove")];
    expect(xs.map(x => x.tabIndex)).toEqual([0, -1]);
    expect(xs[0]).toHaveAccessibleName("Remove Notícias");
    expect(lista.querySelector("button.tag-main")).toBeNull();
  });
  test("em português, o X diz \"Remover\"", () => {
    render(<AureaProvider strings={ptBR}><TagGroup label="Filtros" items={ITENS.slice(0, 1)} onRemove={() => {}} /></AureaProvider>);
    expect(screen.getByRole("button", {name: "Remover Notícias"})).toBeTruthy();
  });
});
