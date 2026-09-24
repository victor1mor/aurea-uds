import {readFileSync} from "node:fs";
import {act, fireEvent, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AppShell, AureaProvider, Combobox, MultiCombobox, Sidebar} from "../../packages/react/src/index";
import {ESCALA} from "../../packages/react/src/escala";
import {DependencyGraph} from "../../packages/react/src/graph";
import {DataGrid} from "../../packages/react/src/data-grid";

// Lote 1 dos achados dos três consumidores (23/09/2026). Cada bloco aqui nasce de uma ficha do
// levantamento que os apps fizeram instalando a 0.8.7 do npm, e cada `expect` REPROVAVA antes do
// conserto — é o que faz dele controle, e não só descrição do estado de hoje.

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const css = readFileSync("packages/core/src/aurea.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const ITENS = [
  {value: "mega", label: "MEGA.NZ (Prioritário)"},
  {value: "1080", label: "1080p / Blu-ray"},
  {value: "2026", label: "2026"},
];

// A-01 · o texto do item não escolhido caía na coluna de 16px do check.
// O `ItemIndicator` do Base UI não monta nada quando o item não está escolhido; com um filho só,
// o rótulo ia para a primeira trilha da grade `16px minmax(0,1fr)` e quebrava em duas ou três
// linhas. O controle cobra a ARIDADE: todo item, escolhido ou não, tem os dois filhos.
describe("A-01 · item do Combobox tem sempre as duas colunas", () => {
  for (const [nome, Comp] of [["Combobox", Combobox], ["MultiCombobox", MultiCombobox]] as const) {
    test(`${nome}: item não escolhido mantém a coluna do check`, async () => {
      const user = userEvent.setup();
      wrap(<Comp items={ITENS} label="Servidor" />);
      await user.click(screen.getByRole("combobox", {name: "Servidor"}));
      const opcoes = within(await screen.findByRole("listbox")).getAllByRole("option");
      expect(opcoes).toHaveLength(3);
      for (const o of opcoes) {
        expect(o.children).toHaveLength(2);
        expect(o.children[0]).toHaveClass("combobox-check");
        expect(o.children[1]).toHaveTextContent(/\S/);
      }
    });
  }

  // Para quem escreve o HTML à mão, sem o React: o texto vai para a segunda coluna pelo CSS.
  test("o core manda o último filho para a segunda coluna", () => {
    expect(css).toMatch(/\.combobox-item\s*>\s*:last-child\s*\{\s*grid-column:\s*2;?\s*\}/);
  });
});

// O jsdom não tem popover: `:popover-open` responde falso e `hidePopover` não existe. O dublê
// liga as duas coisas NO ELEMENTO, e só nele — o resto do documento continua sem popover, que é
// exatamente o caso do desktop, onde nada pode fechar.
function comoGavetaAberta(el: HTMLElement) {
  const original = el.matches.bind(el);
  el.matches = (sel: string) => sel === ":popover-open" ? true : original(sel);
  const hidePopover = vi.fn();
  (el as HTMLElement & {hidePopover: () => void}).hidePopover = hidePopover;
  return hidePopover;
}

// A-06 · a gaveta mobile ficava aberta depois de escolher um item: a página trocava por baixo e a
// lateral continuava na frente dela. Medido na 0.8.7: `hidePopover` com zero ocorrências.
describe("A-06 · a gaveta fecha ao escolher um item", () => {
  const ITENS_NAV = [{id: "todos", label: "Todos"}, {id: "relatorios", label: "Relatórios", onClick: vi.fn()}];

  test("item da lista declarativa fecha a gaveta aberta, e o onClick dele roda", () => {
    const {container} = wrap(<Sidebar popover="auto" items={ITENS_NAV} current="todos" />);
    const aside = container.querySelector("aside")!;
    const fechar = comoGavetaAberta(aside);
    // `hidden: true`: a gaveta FECHADA não está na árvore de acessibilidade, e o jsdom não sabe abrir
    fireEvent.click(screen.getByRole("button", {name: "Relatórios", hidden: true}));
    expect(ITENS_NAV[1].onClick).toHaveBeenCalledTimes(1);
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  test("navegação escrita pelo consumidor (children) também fecha", () => {
    const {container} = wrap(<Sidebar popover="auto"><nav><a href="#relatorios">Relatórios</a></nav></Sidebar>);
    const fechar = comoGavetaAberta(container.querySelector("aside")!);
    fireEvent.click(screen.getByRole("link", {name: "Relatórios", hidden: true}));
    expect(fechar).toHaveBeenCalledTimes(1);
  });

  test("clique fora de um item não fecha, e o onClick do consumidor na lateral continua valendo", () => {
    const aoClicar = vi.fn();
    const {container} = wrap(<Sidebar popover="auto" onClick={aoClicar}><p>Só texto</p></Sidebar>);
    const fechar = comoGavetaAberta(container.querySelector("aside")!);
    fireEvent.click(screen.getByText("Só texto"));
    expect(aoClicar).toHaveBeenCalledTimes(1);
    expect(fechar).not.toHaveBeenCalled();
  });

  test("lateral que não é gaveta aberta (desktop) não tenta fechar nada", () => {
    wrap(<Sidebar items={ITENS_NAV} current="todos" />);
    // sem dublê: `:popover-open` é falso, e chamar `hidePopover` lançaria no jsdom
    expect(() => fireEvent.click(screen.getByRole("button", {name: "Relatórios"}))).not.toThrow();
  });
});

// A-07 · alargar a janela com a gaveta aberta deixava a lateral presa no top layer, sem véu e sem
// o botão que a fecharia (o CSS o esconde acima de lg).
describe("A-07 · a gaveta fecha ao subir para o desktop", () => {
  let ouvintes: Array<(e: {matches: boolean}) => void> = [];
  let consultas: string[] = [];
  beforeEach(() => {
    ouvintes = []; consultas = [];
    window.matchMedia = ((q: string) => {
      consultas.push(q);
      return {matches: false, media: q, addEventListener: (_: string, f: (e: {matches: boolean}) => void) => ouvintes.push(f),
        removeEventListener: (_: string, f: (e: {matches: boolean}) => void) => { ouvintes = ouvintes.filter(o => o !== f); }};
    }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => { delete (window as {matchMedia?: unknown}).matchMedia; });

  test("cruzar lg para cima fecha a gaveta; descer não mexe nela", () => {
    const {unmount} = wrap(<AppShell brand="A" navigation={<a href="#x">X</a>}>conteúdo</AppShell>);
    expect(consultas).toContain(`(min-width: ${ESCALA.lg}px)`);
    const fechar = comoGavetaAberta(document.getElementById("aurea-shell-nav")!);
    act(() => ouvintes.forEach(f => f({matches: false})));
    expect(fechar).not.toHaveBeenCalled();
    act(() => ouvintes.forEach(f => f({matches: true})));
    expect(fechar).toHaveBeenCalledTimes(1);
    unmount();
    expect(ouvintes).toHaveLength(0);   // sem vazamento de ouvinte
  });

  // O runtime sem React tem o mesmo número escrito à mão. Se o token mudar e ele não, a gaveta
  // volta a ficar presa numa faixa de largura — e só esta linha avisa.
  test("o 1024 do aurea.js é o lg da escala, e o 1023 do CSS é lg − 1", () => {
    const js = readFileSync("packages/core/src/aurea.js", "utf8");
    expect(js).toContain(`matchMedia("(min-width: ${ESCALA.lg}px)")`);
    expect(css).toContain(`@media (max-width:${ESCALA.lg - 1}px)`);
  });

  test("runtime sem React: escolher item e subir para o desktop fecham a gaveta", () => {
    document.body.innerHTML = '<aside class="sidebar" popover="auto" id="g"><a href="#f" class="sidebar-item">Relatórios</a><button type="button">Recolher grupo</button></aside>';
    new Function(readFileSync("packages/core/src/aurea.js", "utf8"))();
    const gaveta = document.getElementById("g")!;
    const fechar = comoGavetaAberta(gaveta);
    fireEvent.click(document.querySelector("button")!);
    expect(fechar).not.toHaveBeenCalled();          // botão que não navega não fecha
    fireEvent.click(document.querySelector("a")!);
    expect(fechar).toHaveBeenCalledTimes(1);
    ouvintes.forEach(f => f({matches: true}));
    expect(fechar).toHaveBeenCalledTimes(2);
    document.body.innerHTML = "";
  });
});

// O jsdom não mede SVG, e o rótulo da aresta pede `getBBox` para desenhar o fundo. O dublê devolve
// uma caixa qualquer: o que se afirma aqui é a COR e a IDENTIDADE, não a geometria do fundo.
function comSvgMedivel() {
  const proto = SVGElement.prototype as SVGElement & {getBBox?: () => DOMRect};
  const antes = proto.getBBox;
  proto.getBBox = () => ({x: 0, y: 0, width: 40, height: 12}) as DOMRect;
  return () => { proto.getBBox = antes; };
}
const NOS = [{id: "core", label: "Core"}, {id: "dist", label: "Dist"}];

// A-09 · o rótulo da aresta saía preto sobre preto no tema escuro. As variáveis do core existiam e
// ninguém as lia: quem as lê é a folha de identidade do motor, que a Aurea não carrega.
describe("A-09 · o rótulo da aresta lê a cor do tema", () => {
  test("texto e fundo do rótulo apontam para as variáveis que o core define", () => {
    const soltar = comSvgMedivel();
    const {container} = wrap(<DependencyGraph nodes={NOS} edges={[{from: "core", to: "dist", label: "Te1/1/1"}]} />);
    const texto = container.querySelector(".react-flow__edge text")!;
    const fundo = container.querySelector(".react-flow__edge rect")!;
    expect(texto.getAttribute("style")).toContain("var(--xy-edge-label-color)");
    expect(fundo.getAttribute("style")).toContain("var(--xy-edge-label-background-color)");
    // e as duas variáveis continuam declaradas com token no core — sem isso o `var()` cai em nada
    expect(css).toMatch(/--xy-edge-label-color:var\(--[\w-]+\)/);
    expect(css).toMatch(/--xy-edge-label-background-color:var\(--[\w-]+\)/);
    soltar();
  });
});

// A primeira imagem do conserto mostrou o que o preto escondia: o rótulo era mais largo que o vão
// de 90px entre colunas e entrava por baixo dos nós. O vão agora cresce com o rótulo mais longo.
describe("A-09 · o vão entre colunas cabe o rótulo", () => {
  const xs = (edges: {from: string; to: string; label?: string}[]) => {
    const soltar = comSvgMedivel();
    const {container, unmount} = wrap(<DependencyGraph nodes={NOS} edges={edges} />);
    const r = [...container.querySelectorAll<HTMLElement>(".react-flow__node")]
      .map(n => Number(/translate\((-?[\d.]+)px/.exec(n.style.transform)?.[1] ?? 0));
    unmount(); soltar();
    return r;
  };
  test("sem rótulo, o vão é o de antes (180 do nó + 90)", () => {
    const [a, b] = xs([{from: "core", to: "dist"}]);
    expect(b - a).toBe(270);
  });
  test("rótulo longo abre o vão: 17 caracteres a 13px × 0,6 + fundo + folga", () => {
    const [a, b] = xs([{from: "core", to: "dist", label: "Te1/1/1 ↔ Te1/0/1"}]);
    expect(b - a).toBe(180 + Math.ceil(17 * 13 * 0.6) + 8 + 32);
  });
});

// A-10 · duas arestas entre o mesmo par tinham o mesmo id (`core->dist`) e viravam uma: o rótulo
// da primeira sumia. Em produção, sem aviso nenhum.
describe("A-10 · arestas paralelas existem as duas, separadas", () => {
  const trechoY = (d: string) => Number(/^M\s*[-\d.]+[, ]\s*([-\d.]+)/.exec(d)?.[1]);

  test("sem id: as duas nascem, com ids distintos e rótulos distintos, cada uma numa altura", () => {
    const soltar = comSvgMedivel();
    const {container} = wrap(<DependencyGraph nodes={NOS} edges={[
      {from: "core", to: "dist", label: "Te1/1/1"}, {from: "core", to: "dist", label: "Te1/1/2"}]} />);
    const arestas = [...container.querySelectorAll(".react-flow__edge")];
    expect(arestas).toHaveLength(2);
    const ids = arestas.map(a => a.getAttribute("data-id"));
    expect(new Set(ids).size).toBe(2);
    expect(ids).toContain("core->dist");                     // a primeira mantém o id de sempre
    expect(arestas.map(a => a.querySelector("text")?.textContent).sort()).toEqual(["Te1/1/1", "Te1/1/2"]);
    const [y1, y2] = arestas.map(a => trechoY(a.querySelector("path")!.getAttribute("d")!));
    expect(y1).not.toBe(y2);
    soltar();
  });

  test("com id: o id de quem chama vale", () => {
    const soltar = comSvgMedivel();
    const {container} = wrap(<DependencyGraph nodes={NOS} edges={[
      {id: "lag-1", from: "core", to: "dist"}, {id: "lag-2", from: "core", to: "dist"}]} />);
    expect([...container.querySelectorAll(".react-flow__edge")].map(a => a.getAttribute("data-id")).sort())
      .toEqual(["lag-1", "lag-2"]);
    soltar();
  });

  // A aresta única sai de onde sempre saiu, e as paralelas se abrem SIMÉTRICAS em volta dela.
  test("aresta única continua no meio; as paralelas se abrem em volta dela", () => {
    const soltar = comSvgMedivel();
    const inicioY = (edges: {from: string; to: string}[]) => {
      const {container, unmount} = wrap(<DependencyGraph nodes={NOS} edges={edges} />);
      const ys = [...container.querySelectorAll(".react-flow__edge-path")].map(p => trechoY(p.getAttribute("d")!));
      unmount();
      return ys;
    };
    const [meio] = inicioY([{from: "core", to: "dist"}]);
    const [a, b] = inicioY([{from: "core", to: "dist"}, {from: "core", to: "dist"}]);
    expect((a + b) / 2).toBeCloseTo(meio, 5);
    expect(Math.abs(a - b)).toBeGreaterThan(0);
    soltar();
  });
});

// A-11 · a busca do DataGrid ignorava a coluna cujo valor na PRIMEIRA linha era vazio. É a regra do
// motor (TanStack v8): ela só olha `flatRows[0]`. Medido num app: "Hikvision" dava zero onde havia 17.
describe("A-11 · a busca não depende de quem vem primeiro", () => {
  type Host = {ip: string; fabricante: string | null; nota?: {x: number}};
  const HOSTS: Host[] = [
    {ip: "172.17.80.1", fabricante: null},           // o primeiro não tem fabricante
    {ip: "172.17.80.2", fabricante: "Hikvision"},
    {ip: "172.17.80.3", fabricante: "Cisco"},
    {ip: "172.17.80.4", fabricante: "Hikvision"},
  ];
  const COLS = [
    {accessorKey: "ip", header: "IP"},
    {accessorKey: "fabricante", header: "Fabricante"},
  ];
  const linhasVisiveis = () => screen.getAllByRole("row").length - 1;   // menos o cabeçalho

  test("acha pelo fabricante mesmo com a primeira linha vazia nessa coluna", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={HOSTS} columns={COLS} filterable />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "hikvision");
    expect(linhasVisiveis()).toBe(2);
  });

  test("a coluna marcada com enableGlobalFilter:false continua fora da busca", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={HOSTS} columns={[COLS[0], {...COLS[1], enableGlobalFilter: false}]} filterable />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "hikvision");
    expect(screen.queryAllByRole("row").filter(r => r.textContent?.includes("Hikvision"))).toHaveLength(0);
  });

  test("coluna de objeto não entra na busca — procurar 'object' não acha nada", async () => {
    const user = userEvent.setup();
    const dados = HOSTS.map((h, i) => ({...h, nota: {x: i}}));
    wrap(<DataGrid data={dados} columns={[...COLS, {accessorKey: "nota", header: "Nota", cell: () => "—"}]} filterable />);
    await user.type(screen.getByRole("searchbox", {name: "Filter"}), "object");
    expect(screen.queryAllByRole("row").filter(r => r.textContent?.includes("172.17"))).toHaveLength(0);
  });
});

// C-09 · o raio do item de menu era número cravado (8px), fora da conta da casa
// "raio do filho = raio do pai − respiro do pai". Decidido pelo Victor em 22/09/2026: 18px, que é o
// que a conta dá com as medidas da lateral. O controle cobra a CONTA, não o número: se alguém mudar
// o painel e esquecer o item, a igualdade quebra.
describe("C-09 · a linha do menu segue a conta do painel", () => {
  const regra = (sel: string) => {
    const m = new RegExp(`(?:^|\\})\\s*${sel.replace(".", "\\.")}\\s*\\{([^}]*)\\}`).exec(css);
    return m?.[1] ?? "";
  };
  const prop = (bloco: string, p: string) => new RegExp(`(?:^|;)\\s*${p}:([^;]+)`).exec(bloco)?.[1].trim();

  test("raio do item = raio do painel − respiro do painel, no menu e na lateral", () => {
    for (const [pai, filho] of [[".menu", ".menu-item"], [".sidebar", ".sidebar-item"]] as const) {
      const p = regra(pai), f = regra(filho);
      expect(prop(f, "border-radius")).toBe(`calc(${prop(p, "border-radius")} - ${prop(p, "padding")})`);
    }
  });
});
