// Lote 6 do alvo nativo — `Timeline`, `DataList` e `Table`. **O último lote do plano.**
//
// ⚠ **A decisão que este arquivo mais cobra não se vê na tela: é a `Table` NÃO ser uma tabela.**
// O papel `table` não mapeia em plataforma nenhuma (medido no fonte do RN — ver o cabeçalho de
// `data.tsx`), então uma grade de verdade não se anunciaria como tabela; e o `min-width: 720px`
// do CSS num telefone é rolagem horizontal de 2×, que a ficha da web já considera insuficiente
// sem teclado. **Manter a grade perderia a leitura sem ganhar a semântica.**
import {render} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import * as React from "react";
import {
  StyleSheet, __definirLargura, __instancias, __limpar,
} from "./native-stubs/react-native";
import {
  AureaProvider, DataList, Table, Timeline, criarRegistroDeIcones, defaultStrings, ptBR,
  resolverTokens,
} from "../../packages/native/src/index.js";

const tokens = resolverTokens("dark", "comfortable");
const ICONES = criarRegistroDeIcones({});
const Envolve = ({children}: {children: React.ReactNode}) =>
  <AureaProvider icons={ICONES}>{children}</AureaProvider>;

const todos = (primitivo: string) => __instancias(primitivo);
const estilos = (primitivo: string) => todos(primitivo).map((p) => StyleSheet.flatten(p.style));
const textos = () => todos("Text").map((p) => p.children);

const EVENTOS = [
  {title: "Criado", description: "pelo app", time: "08/09 14:20"},
  {title: "Enviado", time: "08/09 15:02"},
];

describe("Timeline — o trilho DERIVA do ponto, e não some no virtualizado por acaso", () => {
  it("é uma `list`, que é o único papel desta família que o RN mapeia", () => {
    render(<Envolve><Timeline items={EVENTOS} /></Envolve>);
    expect(todos("View").map((p) => p.accessibilityRole)).toContain("list");
  });

  // DEFEITO DE NÚMERO COPIADO: o CSS faz `calc(var(--space-3) / 2)`. Escrever `6` aqui alinha
  // hoje e desalinha no dia em que o ponto mudar de tamanho — e ninguém liga as duas coisas.
  //
  // ⚠ **E o que este teste prova é ALINHAMENTO, não derivação — a diferença importa.** Provado
  // contra o defeito: com `left: 6` LITERAL e o ponto no tamanho de hoje, ele passa verde, porque
  // `space3 / 2` também é 6 e nada no render distingue os dois. O que ele pega é a divergência
  // que de fato quebra a tela: o ponto crescer e o trilho ficar onde estava. Foi preciso mudar o
  // tamanho do ponto para o teste acusar — e é por isso que ele procura o ponto pela FORMA
  // (redondo, na cor da marca), e não por um token escrito aqui, que era o defeito da primeira
  // versão deste teste.
  it("o trilho fica a MEIO DIÂMETRO do ponto", () => {
    render(<Envolve><Timeline items={EVENTOS} /></Envolve>);
    const trilho = estilos("View").find((e) => e.position === "absolute" && e.width === tokens.size.borderWidth);
    const ponto = estilos("View").find((e) =>
      e.borderRadius === tokens.size.radiusFull && e.backgroundColor === tokens.color.primary);
    expect(ponto).toBeDefined();
    expect(trilho?.left).toBe((ponto!.width as number) / 2);
  });

  // DEFEITO VISTO EM TELA e registrado no CSS (aurea.css:1240): sem a pilha, título e horário
  // colavam na mesma linha — "Shipped14:20". Geometria de componente não muda com o conteúdo.
  it("a coluna de conteúdo é uma PILHA — com e sem descrição", () => {
    render(<Envolve><Timeline items={EVENTOS} /></Envolve>);
    const colunas = estilos("View").filter((e) => e.flex === 1 && e.gap === tokens.size.space05);
    // Os dois eventos: um COM descrição, outro SEM. Os dois têm de ter a mesma coluna.
    expect(colunas.length).toBe(2);
  });

  it("sem itens, não desenha trilho — uma régua sozinha na tela não diz nada", () => {
    render(<Envolve><Timeline items={[]} /></Envolve>);
    const trilho = estilos("View").find((e) => e.position === "absolute");
    expect(trilho).toBeUndefined();
  });

  // A pendência que a ADR-0038 deixou aberta em 31/08 — "volta a importar quando existir tela de
  // lista" — é ESTA tela. `virtualized` é a resposta.
  it("`virtualized` troca o `map` pelo `FlatList`, e sem ele NÃO usa", () => {
    render(<Envolve><Timeline items={EVENTOS} /></Envolve>);
    expect(todos("FlatList")).toHaveLength(0);

    __limpar();
    render(<Envolve><Timeline items={EVENTOS} virtualized /></Envolve>);
    expect(todos("FlatList")).toHaveLength(1);
    expect(todos("FlatList")[0].accessibilityRole).toBe("list");
  });

  // HONESTIDADE, não defeito: o trilho é uma linha absoluta do topo ao pé da lista INTEIRA, e no
  // `FlatList` a lista inteira não existe — só a janela. Desenhá-lo daria um trilho que começa e
  // termina no lugar errado conforme se rola.
  it("no virtualizado o trilho NÃO é desenhado — de propósito", () => {
    render(<Envolve><Timeline items={EVENTOS} virtualized /></Envolve>);
    const trilho = estilos("View").find((e) => e.position === "absolute");
    expect(trilho).toBeUndefined();
  });
});

describe("DataList — o par é UM nó, e o ponto de quebra é o mesmo da web", () => {
  const PARES = [
    {term: "Quilometragem", value: "12,4 km/l"},
    {term: "Combustível", value: "Gasolina"},
  ];

  // O DEFEITO QUE ISTO IMPEDE: ler cada metade separada. Quem varre com o dedo ouviria
  // "Quilometragem", daria um passo, ouviria "12,4 km/l" — e num painel de oito pares perderia
  // qual valor era de qual termo. Na web o `<dl>` garante o par de graça; aqui, não.
  it("cada par é um nó acessível com «termo: valor»", () => {
    render(<Envolve><DataList items={PARES} /></Envolve>);
    const nomes = todos("View").map((p) => p.accessibilityLabel).filter(Boolean);
    expect(nomes).toContain("Quilometragem: 12,4 km/l");
    expect(nomes).toContain("Combustível: Gasolina");
  });

  // DEFEITO MEDIDO NA WEB e registrado no CSS (aurea.css:1224): a 320px a coluna do valor
  // resolvia em 0px e jogava o texto para FORA da página. O ponto de quebra é o mesmo — 640 —
  // para a peça se comportar igual nos dois alvos.
  // ⚠ `__limpar()` entre as duas metades, e NÃO é detalhe: o registro do dublê ACUMULA entre
  // `render`s do mesmo teste. Sem limpar, a segunda metade enxerga as instâncias da primeira e o
  // teste vira "alguma vez alguém desenhou uma linha" — que passa verde com o defeito dentro. Foi
  // o que aconteceu ao escrever este arquivo, e é a mesma classe de erro do teste do respiro da
  // pilha no Lote 5.
  const larguraDesenhaLadoALado = (largura: number, props: Partial<React.ComponentProps<typeof DataList>> = {}) => {
    __limpar();
    __definirLargura(largura);
    render(<Envolve><DataList items={PARES} {...props} /></Envolve>);
    return estilos("View").some((e) => e.flexDirection === "row" && e.gap === tokens.size.space6);
  };

  it("empilha no telefone e fica lado a lado no largo, no MESMO 640 da web", () => {
    expect(larguraDesenhaLadoALado(360)).toBe(false);
    expect(larguraDesenhaLadoALado(639)).toBe(false);
    expect(larguraDesenhaLadoALado(640)).toBe(true);
    expect(larguraDesenhaLadoALado(800)).toBe(true);
    __definirLargura(360);
  });

  it("`layout` força, contra a largura", () => {
    expect(larguraDesenhaLadoALado(360, {layout: "inline"})).toBe(true);
    expect(larguraDesenhaLadoALado(800, {layout: "stacked"})).toBe(false);
    __definirLargura(360);
  });
});

describe("Table — ela NÃO é uma tabela, e é isso que a torna legível E anunciável", () => {
  type Linha = {data: string; km: string; custo: string};
  const COLUNAS = [
    {key: "data", header: "Data", primary: true},
    {key: "km", header: "Quilometragem"},
    {key: "custo", header: "Custo"},
  ];
  const LINHAS: Linha[] = [
    {data: "08/09", km: "12,4", custo: "R$ 210"},
    {data: "07/09", km: "11,8", custo: "R$ 198"},
  ];

  // A DECISÃO DO LOTE, cobrada. `table` não está no `accessibilityRole` do RN, e no `role` ele
  // cai em `else -> null` no Android e não tem trait no iOS. Escrevê-lo passaria no `tsc` e seria
  // inútil no aparelho — a mesma armadilha que o Lote 5 mediu no `dialog`.
  it("NÃO usa o papel `table`, que o RN aceita e não mapeia", () => {
    render(<Envolve><Table caption="Lançamentos" columns={COLUNAS} rows={LINHAS} /></Envolve>);
    const papeis = [...todos("View"), ...todos("Text"), ...todos("Pressable"), ...todos("FlatList")]
      .flatMap((p) => [p.accessibilityRole, p.role]);
    expect(papeis).not.toContain("table");
    expect(papeis).not.toContain("grid");
    // E usa o que MAPEIA.
    expect(papeis).toContain("list");
  });

  // O DEFEITO DA TABELA VIRADA EM LISTA: quatro números soltos, um embaixo do outro, sem dizer o
  // que cada um é. O cabeçalho não some — ele se muda para dentro do cartão.
  it("cada célula leva o NOME da coluna junto", () => {
    render(<Envolve><Table caption="Lançamentos" columns={COLUNAS} rows={LINHAS} /></Envolve>);
    const nomes = todos("View").map((p) => p.accessibilityLabel).filter(Boolean);
    expect(nomes).toContain("Quilometragem: 12,4");
    expect(nomes).toContain("Custo: R$ 210");
    // E o `header` aparece na tela também, não só para o leitor.
    expect(textos()).toContain("Quilometragem");
  });

  // A coluna `primary` identifica a linha e NÃO repete o próprio nome — seria "Data: 08/09"
  // como título de um cartão cuja única razão de existir é a data.
  it("a coluna `primary` vira título e não repete o nome dela", () => {
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} /></Envolve>);
    expect(textos()).toContain("08/09");
    expect(textos()).not.toContain("Data");
    const nomes = todos("View").map((p) => p.accessibilityLabel).filter(Boolean);
    expect(nomes).not.toContain("Data: 08/09");
  });

  // DEFEITO QUE MENTE PARA O LEITOR DE TELA: uma linha `Pressable` sem ação é anunciada como
  // botão, e não faz nada quando tocada.
  it("a linha só vira alvo se houver `onRowPress`", () => {
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} /></Envolve>);
    expect(todos("Pressable")).toHaveLength(0);

    __limpar();
    const tocar = vi.fn();
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} onRowPress={tocar} /></Envolve>);
    expect(todos("Pressable")).toHaveLength(2);
    expect(todos("Pressable")[0].accessibilityRole).toBe("button");
    (todos("Pressable")[0].onPress as () => void)();
    expect(tocar).toHaveBeenCalledWith(LINHAS[0]);
  });

  it("a linha tocável respeita o alvo mínimo do token", () => {
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} onRowPress={() => {}} /></Envolve>);
    const alturas = estilos("Pressable").map((e) => e.minHeight);
    expect(alturas).toContain(tokens.size.targetMin);
    expect(tokens.size.targetMin).toBe(44);
  });

  it("sem `caption`, cai na frase da tabela — e a tabela traduz", () => {
    render(<Envolve><Table columns={COLUNAS} rows={LINHAS} /></Envolve>);
    const lista = todos("View").find((p) => p.accessibilityRole === "list");
    expect(lista?.accessibilityLabel).toBe(defaultStrings.tableLabel);
    expect(ptBR.tableLabel).toBe("Tabela");
  });

  it("sem linhas, mostra o vazio — e não uma lista vazia", () => {
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={[]} /></Envolve>);
    expect(textos()).toContain(defaultStrings.dataEmpty);
    expect(todos("View").some((p) => p.accessibilityRole === "list")).toBe(false);
  });

  it("`cell` desenha a célula; sem ele, o valor cru", () => {
    render(
      <Envolve>
        <Table caption="L" rows={LINHAS}
               columns={[{key: "custo", header: "Custo", cell: (l: Linha) => `≈ ${l.custo}`}]} />
      </Envolve>,
    );
    expect(textos()).toContain("≈ R$ 210");
  });

  it("`virtualized` troca o `map` pelo `FlatList`, e sem ele NÃO usa", () => {
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} /></Envolve>);
    expect(todos("FlatList")).toHaveLength(0);

    __limpar();
    render(<Envolve><Table caption="L" columns={COLUNAS} rows={LINHAS} virtualized /></Envolve>);
    expect(todos("FlatList")).toHaveLength(1);
    expect(todos("FlatList")[0].accessibilityLabel).toBe("L");
  });

  it("`keyExtractor` manda na identidade da linha", () => {
    const chave = vi.fn((l: Linha) => l.data);
    render(
      <Envolve>
        <Table caption="L" columns={COLUNAS} rows={LINHAS} keyExtractor={chave} />
      </Envolve>,
    );
    expect(chave).toHaveBeenCalled();
  });
});
