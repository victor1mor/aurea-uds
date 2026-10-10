// Rodada 1 da rede (0.30.0, ADR-0064) · o que se prova sem navegador:
//   MNT-02(a): o `Icon` da web aceita o DESENHO do app, como o nativo;
//   MNT-01: os 7 nomes do Carbon na tabela de troca, cada um apontando para um glifo que existe;
//   MNT-03: o aviso "reinicie o servidor" no README;
//   e do mapa: as dependências novas são OPCIONAIS e presas ao módulo do mapa; o nó desenha ícone,
//   selos e as alças escondidas; o grupo de enlaces é um botão com nome; a pele vai pela variável do
//   motor; as frases existem nos dois idiomas.
// A arrumação, as medidas, o teclado e a exportação se provam no navegador (`tests/visual/rede.spec.ts`).
// Provado contra o defeito: na 0.29.0 o `Icon` não aceita desenho, a tabela não tem os 7 nomes, o
// README não avisa, e o mapa não tem `count`, `status`, `icon`, `groupParallel` nem as regras novas.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {AureaProvider, Icon, ptBR, defaultStrings} from "../../packages/react/src/index";
import {DependencyGraph} from "../../packages/react/src/graph";
import {NOMES_PHOSPHOR} from "../../packages/react/src/icon-names";

const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("MNT-02(a) · o Icon da web aceita o desenho do app", () => {
  test("o desenho recebe a classe e o tamanho da Aurea, e fica escondido do leitor de tela", () => {
    const Roteador = (p: React.SVGAttributes<SVGSVGElement>) => <svg data-desenho="roteador" viewBox="0 0 256 256" {...p}><path d="M0 0"/></svg>;
    const {container} = render(<Icon name={Roteador} size="lg"/>);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-desenho")).toBe("roteador");
    expect(svg.classList.contains("icon")).toBe(true);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelector("use")).toBeNull();
  });
  test("o nome continua indo ao sprite", () => {
    const {container} = render(<Icon name="globe"/>);
    expect(container.querySelector("use")!.getAttribute("href")).toMatch(/#i-globe$/);
  });
});

describe("MNT-01 e MNT-03", () => {
  const tabela = JSON.parse(readFileSync("packages/icons/carbon-para-phosphor.json", "utf8")) as Record<string, string>;
  for (const nome of ["add--alt", "edge-node", "flow--connection", "ibm-cloud-pak--network-automation", "location", "network-interface", "router"]) {
    test(`a tabela traduz \`${nome}\` para um glifo que existe`, () => {
      expect(tabela[nome]).toBeDefined();
      expect(NOMES_PHOSPHOR.has(tabela[nome])).toBe(true);
    });
  }
  test("o README manda reiniciar o servidor de desenvolvimento depois de atualizar", () => {
    expect(readFileSync("README.md", "utf8")).toMatch(/reinicie o servidor de desenvolvimento/i);
  });
});

describe("as dependências novas do mapa são opcionais", () => {
  const pkg = JSON.parse(readFileSync("packages/react/package.json", "utf8"));
  for (const dep of ["elkjs", "modern-screenshot"]) {
    test(`${dep}: par opcional, nunca dependência direta`, () => {
      expect(pkg.peerDependencies[dep]).toBeDefined();
      expect(pkg.peerDependenciesMeta[dep]).toEqual({optional: true});
      expect(pkg.dependencies?.[dep]).toBeUndefined();
    });
  }
  test("e só o módulo do mapa os carrega, por import() (não por import no topo)", () => {
    const grafo = readFileSync("packages/react/src/graph.tsx", "utf8");
    expect(grafo).toMatch(/await import\("elkjs\/lib\/elk\.bundled\.js"\)/);
    expect(grafo).toMatch(/await import\("modern-screenshot"\)/);
    expect(grafo).not.toMatch(/^import[^\n]*from "(elkjs|modern-screenshot)/m);
  });
});

describe("o nó e a linha (montados no servidor, como a prévia do catálogo)", () => {
  const html = renderToStaticMarkup(<AureaProvider strings={ptBR}>
    <DependencyGraph orientation="vertical" groupParallel label="Rede"
      nodes={[{id: "a", label: "Firewall", kind: "Firewall", icon: "shield"},
              {id: "b", label: "Acesso", kind: "Switch", count: 20, countLabel: "20 estações", status: {label: "Sem credencial", tone: "warning"}}]}
      edges={[{from: "a", to: "b"}, {from: "b", to: "a"}, {from: "a", to: "b"}]}/>
  </AureaProvider>);
  test("o ícone vai junto do tipo, e não no lugar dele", () => {
    expect(html).toMatch(/graph-node-has-icon/);
    expect(html).toMatch(/#i-shield/);
    expect(html).toMatch(/graph-node-kind">Firewall</);
  });
  test("o selo de quantidade diz o número, e o leitor de tela ouve o nome dele", () => {
    expect(html).toMatch(/graph-node-count/);
    expect(html).toMatch(/>20</);
    expect(html).toMatch(/class="sr-only">20 estações</);
  });
  test("o selo de estado é a palavra", () => {
    expect(html).toMatch(/graph-node-status/);
    expect(html).toMatch(/Sem credencial/);
  });
  test("no grafo de leitura as alças existem, escondidas e sem ligar", () => {
    expect(html).toMatch(/graph-handle-oculta/);
    expect(html).not.toMatch(/connectable[^"]*"[^>]*graph-handle(?! graph-handle-oculta)/);
  });
});

describe("a pele vai pelas variáveis do motor, e as frases existem", () => {
  test("a espessura da linha é a variável do motor (a regra dele, sem camada, ganharia da nossa)", () => {
    expect(css).toMatch(/\.dependency-graph \.graph-edge \{[^}]*--xy-edge-stroke-width:var\(--graph-edge-w\)/);
    expect(css).toMatch(/\.dependency-graph \.graph-edge-double \{[^}]*--xy-edge-stroke-width:calc\(var\(--graph-edge-w\) \* 3\)/);
    expect(css).toMatch(/\.dependency-graph \{[^}]*--graph-edge-base:var\(--border-width\)/);
  });
  test("a alça escondida não promete clique", () => {
    expect(css).toMatch(/\.graph-handle-oculta \{[^}]*visibility:hidden;[^}]*pointer-events:none/);
  });
  test("o minimapa se veste pelas variáveis dele", () => {
    expect(css).toMatch(/--xy-minimap-background-color:var\(--card\)/);
    expect(css).not.toMatch(/\.react-flow__minimap/);
  });
  for (const [nome, tabela] of [["inglês", defaultStrings], ["português", ptBR]] as const) {
    test(`as frases do mapa em ${nome}`, () => {
      for (const k of ["graphZoomIn", "graphZoomOut", "graphFit", "graphLegend", "graphOverview", "graphConnections", "graphShow", "graphJoin"] as const)
        expect(typeof tabela[k], k).toBe("string");
    });
  }
});
