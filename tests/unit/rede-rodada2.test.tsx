// Rodada 2 da rede (0.31.0, ADR-0065) · o que se prova sem navegador, montado no servidor como a
// prévia do catálogo: o mapa de leitura com UMA parada por nó e a linha com nome nosso; o modo de
// arrumar com a barra; o contêiner, o fechado e a nuvem; as frases nos dois idiomas; e a pele.
// O ponteiro, a medida, as rotas e o teclado se provam no navegador (`tests/visual/rede2.spec.ts`).
// Provado contra o defeito: na 0.30.0 o nó de leitura sai com `tabindex="0"` na caixa do motor (além
// do botão), a linha sai com "Edge from a to b", e não existem `editable`, `parentId`, `shape` nem as frases.
import {readFileSync} from "node:fs";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {AureaProvider, ptBR, defaultStrings} from "../../packages/react/src/index";
import {DependencyGraph, type GraphNodeItem, type GraphEdgeItem} from "../../packages/react/src/graph";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const montar = (el: React.ReactElement) => renderToStaticMarkup(<AureaProvider strings={ptBR}>{el}</AureaProvider>);
const NOS: GraphNodeItem[] = [
  {id: "net", label: "Internet", kind: "Nuvem", icon: "globe", shape: "cloud", x: 0, y: 0},
  {id: "fw", label: "Firewall", kind: "Firewall", x: 0, y: 120},
  {id: "site", label: "Matriz", kind: "Site"},
  {id: "sw", label: "Acesso", kind: "Switch", parentId: "site", x: 0, y: 260},
  {id: "pc", label: "Recepção", kind: "Desktop", parentId: "site", x: 0, y: 380, pinned: true},
];
const ARESTAS: GraphEdgeItem[] = [{id: "a", from: "net", to: "fw"}, {id: "b", from: "fw", to: "sw"}, {id: "c", from: "sw", to: "pc"}];
const tags = (html: string, classe: string) => html.match(new RegExp(`<div[^>]*class="react-flow__node[^"]*"[^>]*>`, "g"))!.filter((t) => t.includes(classe));

describe("o mapa de LEITURA: uma parada de Tab por nó, e a linha com nome nosso", () => {
  const html = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} label="Rede" onSelect={() => {}}/>);
  test("a caixa do motor não recebe o Tab — quem recebe é o botão do nó", () => {
    const caixas = html.match(/<div[^>]*class="react-flow__node [^"]*"[^>]*>/g)!;
    expect(caixas.length).toBeGreaterThan(0);
    for (const c of caixas) expect(c).not.toMatch(/tabindex="0"/);
    expect(html.match(/<button[^>]*class="graph-node-body/g)!.length).toBe(4);
  });
  test("a linha tem o nome da Aurea, e não o do motor em inglês", () => {
    expect(html).toContain('aria-label="Ligação: Internet – Firewall"');
    expect(html).not.toMatch(/Edge from/);
  });
  test("sem `onEdgeSelect`, a linha não é parada de Tab", () => {
    expect(html).not.toMatch(/<g[^>]*class="react-flow__edge[^"]*"[^>]*tabindex="0"/);
  });
});

describe("o modo de ARRUMAR (`editable`)", () => {
  const html = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} label="Rede" editable/>);
  test("a caixa do motor é a parada do nó, com nome, e o corpo não é botão", () => {
    const fw = html.match(/<div[^>]*data-id="fw"[^>]*>/)![0];
    expect(fw).toMatch(/tabindex="0"/);
    expect(fw).toMatch(/aria-label="Firewall, Firewall"/);
    expect(html).not.toMatch(/<button[^>]*class="graph-node-body/);
  });
  test("a barra: desfazer, refazer, seis de alinhar, dois de distribuir, fixar e reorganizar", () => {
    expect(html).toContain('aria-label="Arrumar o mapa"');
    for (const nome of ["Desfazer", "Refazer", "Alinhar à esquerda", "Alinhar pelo centro", "Alinhar à direita", "Alinhar em cima",
      "Alinhar pelo meio", "Alinhar embaixo", "Distribuir na horizontal", "Distribuir na vertical", "Fixar no lugar", "Reorganizar"])
      expect(html, nome).toContain(`aria-label="${nome}"`);
  });
  test("o nó fixo leva o alfinete, com o nome para o leitor de tela", () => {
    expect(html).toMatch(/graph-node-pin[\s\S]*?class="sr-only">fixo</);
  });
});

describe("o contêiner, o fechado e a nuvem", () => {
  const aberto = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} label="Rede"/>);
  test("aberto, o contêiner é a caixa em volta dos filhos, com o botão de fechar", () => {
    expect(tags(aberto, "react-flow__node-aureaGrupo").length).toBe(1);
    expect(aberto).toContain('aria-label="Fechar Matriz"');
    expect(aberto).toMatch(/data-id="sw"/);
  });
  const fechado = montar(<DependencyGraph nodes={NOS.map((n) => n.id === "site" ? {...n, collapsed: true} : n)} edges={ARESTAS} label="Rede"/>);
  test("fechado, ele guarda os filhos e diz quantos; a linha passa a chegar nele", () => {
    expect(fechado).not.toMatch(/data-id="sw"/);
    expect(fechado).toContain('aria-label="Abrir Matriz (2 ocultos)"');
    expect(fechado).toContain('aria-label="Ligação: Firewall – Matriz"');
  });
  test("a nuvem é desenho de fundo — e não recorte da caixa, que cortaria o foco", () => {
    expect(aberto).toMatch(/<svg class="graph-node-cloud"[^>]*aria-hidden="true"><path d="M[^"]+Z"/);
    expect(aberto).toMatch(/data-shape="cloud"/);
  });
  test("a subárvore só tem botão com `collapsible`", () => {
    expect(aberto).not.toContain('aria-label="Fechar Firewall"');
    const comBotao = montar(<DependencyGraph nodes={NOS} edges={ARESTAS} label="Rede" collapsible/>);
    expect(comBotao).toContain('aria-label="Fechar Firewall"');
  });
});

describe("as frases e a pele", () => {
  const CHAVES = ["graphArrange", "graphUndo", "graphRedo", "graphAlignLeft", "graphAlignCenter", "graphAlignRight", "graphAlignTop",
    "graphAlignMiddle", "graphAlignBottom", "graphDistributeH", "graphDistributeV", "graphPin", "graphPinned", "graphRelayout",
    "graphExpand", "graphCollapse", "graphHidden", "graphEdge", "graphEdgeHelp", "graphHandle", "graphNodeHelp", "graphMoved"] as const;
  for (const [nome, tabela] of [["inglês", defaultStrings], ["português", ptBR]] as const)
    test(`as ${CHAVES.length} frases novas em ${nome}`, () => { for (const k of CHAVES) expect(tabela[k], k).toMatch(/\S/); });
  test("o texto que o motor mostra não sai em inglês no português", () => {
    expect(ptBR.graphNodeHelp).not.toMatch(/Press|delete/i);
  });
  test("o rótulo de HTML fica acima das linhas elevadas e do contêiner", () => {
    expect(css).toMatch(/--graph-label-z:1000/);
    expect(css).toMatch(/\.graph-edge-chip \{[^}]*z-index:var\(--graph-label-z\)/);
    expect(css).toMatch(/\.graph-edge-end \{[^}]*z-index:var\(--graph-label-z\)/);
  });
  test("o laço e a escolha se vestem pelas variáveis do motor, sem classe dele no core", () => {
    expect(css).toMatch(/--xy-selection-border:var\(--border-width\) dashed var\(--primary\)/);
    expect(css).not.toMatch(/\.react-flow__/);
  });
});
