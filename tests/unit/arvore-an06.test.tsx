// AN-06 · o `TreeView` carrega os filhos ao abrir e aceita o escolhido de fora — Lote H, 04/10/2026.
// Um consumidor tem nós cujos filhos só se sabem ao abrir (os tópicos de um grupo, as pastas do
// servidor). Antes, nó sem `children` era folha: não abria, não avisava ninguém, e o escolhido só
// existia por dentro.
//
// Cada teste reprova o código de antes, menos o último bloco ("nada muda"), que é a trava de quem
// não usa as props novas.
import {describe, expect, test, vi} from "vitest";
import * as React from "react";
import {act, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {axe} from "jest-axe";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {AureaProvider, TreeView, type TreeNode} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

// O consumidor guarda os filhos que chegaram e devolve a árvore nova pelo próprio `items`.
function ArvoreQueCarrega({carregar, selectedId, onSelect}: {carregar: (n: TreeNode) => Promise<TreeNode[]>; selectedId?: string | null; onSelect?: (n: TreeNode) => void}) {
  const [filhos, setFilhos] = React.useState<Record<string, TreeNode[]>>({});
  const items: TreeNode[] = [
    {id: "grupo", label: "Grupo", hasChildren: true, children: filhos.grupo},
    {id: "solto", label: "Solto"},
  ];
  return <TreeView label="Destino" items={items} selectedId={selectedId} onSelect={onSelect}
    onExpand={(n) => carregar(n).then((lista) => setFilhos((f) => ({...f, [n.id]: lista})))} />;
}

function promessa<T>() {
  let resolver!: (v: T) => void, recusar!: (e: unknown) => void;
  const p = new Promise<T>((res, rej) => { resolver = res; recusar = rej; });
  return {p, resolver, recusar};
}

describe("TreeView · hasChildren + onExpand (carga ao abrir)", () => {
  test("nó com hasChildren e sem filhos ainda abre: aria-expanded=false, e não folha", () => {
    wrap(<TreeView items={[{id: "g", label: "Grupo", hasChildren: true}]} />);
    expect(screen.getByRole("treeitem", {name: "Grupo"})).toHaveAttribute("aria-expanded", "false");
  });

  test("abrir chama onExpand com o nó, mostra 'carregando' até a promessa, e os filhos chegam por items", async () => {
    const user = userEvent.setup();
    const {p, resolver} = promessa<TreeNode[]>();
    const carregar = vi.fn(() => p);
    wrap(<ArvoreQueCarrega carregar={carregar} />);
    await user.tab();
    const grupo = screen.getByRole("treeitem", {name: "Grupo"});
    expect(grupo).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(carregar).toHaveBeenCalledTimes(1);
    expect(carregar.mock.calls[0][0]).toMatchObject({id: "grupo"});
    expect(grupo).toHaveAttribute("aria-expanded", "true");
    expect(grupo).toHaveAttribute("aria-busy", "true");
    expect(grupo.querySelector(".tree-node > .spinner")).not.toBeNull();
    expect(grupo.querySelector(".tree-node > .icon")).toBeNull();

    await act(async () => { resolver([{id: "t1", label: "Tópico 1"}, {id: "t2", label: "Tópico 2"}]); });
    expect(grupo).not.toHaveAttribute("aria-busy");
    expect(grupo.querySelector(".spinner")).toBeNull();
    const grupoFilhos = within(grupo).getByRole("group");
    expect(within(grupoFilhos).getAllByRole("treeitem").map((n) => n.textContent)).toEqual(["Tópico 1", "Tópico 2"]);

    // E o teclado segue: a seta entra no primeiro filho que acabou de chegar.
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("treeitem", {name: "Tópico 1"})).toHaveFocus();
  });

  test("promessa recusada fecha o nó; abrir de novo tenta de novo", async () => {
    const user = userEvent.setup();
    const primeira = promessa<TreeNode[]>();
    const carregar = vi.fn().mockReturnValueOnce(primeira.p).mockReturnValueOnce(new Promise(() => {}));
    wrap(<ArvoreQueCarrega carregar={carregar} />);
    await user.tab();
    const grupo = screen.getByRole("treeitem", {name: "Grupo"});
    await user.keyboard("{ArrowRight}");
    await act(async () => { primeira.recusar(new Error("rede")); });
    expect(grupo).toHaveAttribute("aria-expanded", "false");
    expect(grupo).not.toHaveAttribute("aria-busy");
    await user.keyboard("{ArrowRight}");
    expect(carregar).toHaveBeenCalledTimes(2);
    expect(grupo).toHaveAttribute("aria-busy", "true");
  });

  test("onExpand sem promessa avisa e não mostra 'carregando'; nó já carregado também não", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn(() => Promise.resolve());
    wrap(<TreeView items={[{id: "p", label: "Pai", children: [{id: "f", label: "Filho"}]}, {id: "q", label: "Outro", hasChildren: true}]} onExpand={(n) => { onExpand(n); return n.id === "q" ? undefined : onExpand.mock.results.at(-1)!.value; }} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    const pai = screen.getByRole("treeitem", {name: "Pai"});
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(pai).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("treeitem", {name: "Filho"})).toBeInTheDocument();
    await user.click(screen.getByText("Outro"));
    expect(onExpand).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("treeitem", {name: "Outro"})).not.toHaveAttribute("aria-busy");
  });

  test("abrir chama onExpand uma vez; fechar não chama", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    wrap(<TreeView items={[{id: "p", label: "Pai", children: [{id: "f", label: "Filho"}]}]} onExpand={onExpand} />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onExpand).toHaveBeenCalledTimes(1);
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("treeitem", {name: "Pai"})).toHaveAttribute("aria-expanded", "false");
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  test("axe limpo com um nó carregando", async () => {
    const {container} = wrap(<ArvoreQueCarrega carregar={() => new Promise(() => {})} />);
    await userEvent.setup().click(screen.getByText("Grupo"));
    expect(screen.getByRole("treeitem", {name: "Grupo"})).toHaveAttribute("aria-busy", "true");
    const {violations} = await axe(container);
    expect(violations.map((v) => v.id)).toEqual([]);
  });
});

describe("TreeView · selectedId (escolhido controlado)", () => {
  test("o escolhido vem de fora, e clicar só avisa: muda quando o pai muda", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const {rerender} = wrap(<TreeView items={[{id: "a", label: "A"}, {id: "b", label: "B"}]} selectedId="a" onSelect={onSelect} />);
    const a = screen.getByRole("treeitem", {name: "A"}), b = screen.getByRole("treeitem", {name: "B"});
    expect(a).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByText("B"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({id: "b"}));
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(b).toHaveAttribute("aria-selected", "false");
    rerender(<AureaProvider><TreeView items={[{id: "a", label: "A"}, {id: "b", label: "B"}]} selectedId="b" onSelect={onSelect} /></AureaProvider>);
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(a).toHaveAttribute("aria-selected", "false");
  });

  test("selectedId={null} é 'nenhum escolhido', e não volta ao estado interno", async () => {
    const user = userEvent.setup();
    wrap(<TreeView items={[{id: "a", label: "A"}]} selectedId={null} />);
    await user.click(screen.getByText("A"));
    expect(screen.getByRole("treeitem", {name: "A"})).toHaveAttribute("aria-selected", "false");
  });
});

describe("TreeView · nada muda sem as props novas", () => {
  test("nó sem children nem hasChildren continua folha; o escolhido continua interno", async () => {
    const user = userEvent.setup();
    wrap(<TreeView items={[{id: "a", label: "A"}, {id: "b", label: "B", children: []}]} />);
    const a = screen.getByRole("treeitem", {name: "A"}), b = screen.getByRole("treeitem", {name: "B"});
    expect(a).not.toHaveAttribute("aria-expanded");
    expect(b).not.toHaveAttribute("aria-expanded");
    expect(a).not.toHaveAttribute("aria-busy");
    await user.click(screen.getByText("A"));
    expect(a).toHaveAttribute("aria-selected", "true");
  });
});

// A seta na escrita da direita para a esquerda (04/10/2026, decisão do Victor: só a do `TreeView`
// neste lote). Ela virava por `:dir(rtl)` na folha do core, e o empacotador do app reescreve `:dir()`
// como lista de idiomas — a regra deixava de pegar. Agora quem diz a direção é o provedor.
describe("TreeView · a seta na escrita da direita para a esquerda", () => {
  test("com o provedor em rtl, a seta fechada leva a classe que a vira; em ltr, não", () => {
    const itens: TreeNode[] = [{id: "p", label: "Pai", children: [{id: "f", label: "Filho"}]}];
    const {container, unmount} = render(<AureaProvider direction="rtl"><TreeView items={itens} /></AureaProvider>);
    expect(container.querySelector(".tree-twist")).toHaveClass("tree-twist-rtl");
    unmount();
    const ltr = render(<AureaProvider><TreeView items={itens} /></AureaProvider>);
    expect(ltr.container.querySelector(".tree-twist")).not.toHaveClass("tree-twist-rtl");
  });

  test("a folha do core não vira a seta da árvore por :dir()", () => {
    const css = readFileSync(join(__dirname, "../../packages/core/src/aurea.css"), "utf8");
    // Sem os comentários: a prosa que explica a troca cita `:dir(rtl)` de propósito.
    const regrasDaArvore = css.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter((l) => l.includes(".tree-twist"));
    expect(regrasDaArvore.length).toBeGreaterThan(0);
    expect(regrasDaArvore.filter((l) => l.includes(":dir("))).toEqual([]);
  });
});
