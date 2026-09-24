// Aurea nativo — a categoria **Data Display**: `Timeline`, `DataList` e `Table`.
//
// Lote 6 do `NATIVE.md` §5.6, *o resto do cockpit*. É o ÚLTIMO lote do plano nativo, e ele fecha
// o alvo. Nenhum dos três tem motor headless na web (`dependencies.engine: null` nas três fichas,
// medido) — o trabalho aqui é de SEMÂNTICA e de LISTA LONGA, não de máquina de estado.
//
// ── O ACHADO DO LOTE 5 COBRA O PREÇO AQUI, e era previsível ──────────────────────────────────
//
// O Lote 5 mediu que o RN **aceita** papéis ARIA que não mapeia em plataforma nenhuma. A `Table`
// é a próxima vítima da mesma armadilha, e desta vez ela decide o desenho inteiro:
//
//     accessibilityRole  ->  NÃO tem 'table'.        (ViewAccessibility.d.ts:188-228)
//     role               ->  TEM 'table'…            (:60-…)
//     Android            ->  …e cai em `else -> null` (ReactAccessibilityDelegate.kt:544)
//     iOS                ->  …e não há trait de tabela (accessibilityPropsConversions.h:24-104)
//
// **Ou seja: no aparelho, uma tabela NÃO se anuncia como tabela — faça-se ela como for.** A
// semântica de grade está perdida nas duas plataformas, e nenhuma escrita nossa a traz de volta.
//
// ── E É ISSO QUE TORNA "A TABELA VIRA LISTA" UMA DECISÃO, NÃO UM REMENDO ─────────────────────
//
// Medido no CSS: `.table` tem **`min-width: 720px`** (aurea.css:1183) dentro de uma região
// rolável. Num telefone de 360dp isso é rolagem horizontal de 2×, que é a pior leitura que
// existe — e a ficha do `Table` diz que a região é focável *"so a table wider than the screen can
// be scrolled with the keyboard, not only by dragging"*. **No toque não há teclado**: sobra só o
// arrastar, que era a metade que a web considerava insuficiente.
//
// Então as duas contas fecham no mesmo lugar:
//
//   manter a grade  ->  perde a leitura   E  não ganha a semântica (o papel não mapeia)
//   virar lista     ->  ganha a leitura   E  ganha `accessibilityRole="list"`, que MAPEIA
//
// Virar lista não troca uma coisa por outra. **Só a lista tem as duas.**
//
// ⚠ **E o modo GRADE não foi construído**, de propósito: ele só faria sentido em tablet, e não há
// tablet medido. O `NATIVE.md` §5.6 é explícito de que no nativo vale **demanda antes de
// cobertura** (o inverso da ADR-0015, que vale para a web). Meia-grade entregue seria pior que
// grade nenhuma. Ele volta quando existir uma tela de tablet medida — e aí é uma prop, não uma
// reescrita.
//
// ── O QUE FOI MEDIDO NA WEB, COM A LINHA ─────────────────────────────────────────────────────
//   .data-list        aurea.css:1221  grade de 2 colunas, gap space-2 × space-6
//   .data-list dt     :1222           `muted-foreground`
//   @media 640        :1231           **EMPILHA no estreito** — e o comentário :1224 diz por quê:
//                                     a 320px a coluna do valor resolvia em 0px e jogava o texto
//                                     para fora da PÁGINA
//   .timeline         :1237           coluna, gap space-5, sem marcador de lista
//   .timeline:before  :1238           o trilho, a MEIO DIÂMETRO do ponto — derivado, não copiado
//   .timeline > li    :1239           linha, topo, gap space-3
//   .timeline > li>div :1243          PILHA, e o comentário :1240 diz por quê: sem ela o título e
//                                     o horário colavam — "Shipped14:20"
//   .timeline-dot     :1245           space-3 quadrado, redondo, `primary`, halo de space-05
//   .table            :1183           min-width 720, colapso de borda
//   .table th/td      :1184           altura `row-h`, padding-inline 14, divisória embaixo
//   .table th         :1185           `subtle-foreground`, fundo `surface-2`, textXs, CAIXA ALTA
import * as React from "react";
import {
  FlatList, Pressable, View, useWindowDimensions,
  type StyleProp, type ViewStyle,
} from "react-native";
import {criarFolha} from "./estilos.js";
import {Text} from "./text.js";
import {useAureaStrings, useAureaTokens} from "./theme.js";
import type {AureaTokens} from "./tokens.js";

const folha = criarFolha((t: AureaTokens) => ({
  // ── Timeline ──
  trilha: {gap: t.size.space5},
  trilho: {
    position: "absolute", top: t.size.space2, bottom: t.size.space2,
    // A MEIO DIÂMETRO do ponto, derivado do mesmo token — igual ao CSS, que faz
    // `calc(var(--space-3) / 2)`. Número copiado desalinha no dia em que o token muda.
    left: t.size.space3 / 2,
    width: t.size.borderWidth, backgroundColor: t.color.border,
  },
  evento: {flexDirection: "row", alignItems: "flex-start", gap: t.size.space3},
  ponto: {
    flexGrow: 0, flexShrink: 0,
    width: t.size.space3, height: t.size.space3, borderRadius: t.size.radiusFull,
    marginTop: t.size.space1, backgroundColor: t.color.primary,
    // O halo do CSS é `box-shadow: 0 0 0 space-05 surface-1`. No RN sombra não faz anel —
    // uma BORDA da cor da superfície faz o mesmo buraco, e cresce o ponto pelo mesmo tanto.
    borderWidth: t.size.space05, borderColor: t.color.surface1,
  },
  colunaDoEvento: {flex: 1, minWidth: 0, gap: t.size.space05},

  // ── DataList ──
  pares: {gap: t.size.space2},
  parEmpilhado: {gap: t.size.space05},
  parLadoALado: {flexDirection: "row", gap: t.size.space6, alignItems: "flex-start"},
  termoLadoALado: {flexShrink: 0, maxWidth: "40%"},
  valor: {flex: 1, minWidth: 0},

  // ── Table ──
  tabela: {gap: t.size.space2},
  linha: {
    padding: t.size.space3, gap: t.size.space2,
    borderWidth: t.size.borderWidth, borderColor: t.color.border,
    borderRadius: t.size.radiusLg, backgroundColor: t.color.card,
  },
  linhaTocavel: {minHeight: t.size.targetMin ?? 44},
  celula: {flexDirection: "row", gap: t.size.space3, alignItems: "flex-start"},
  nomeDaColuna: {flexShrink: 0, maxWidth: "45%"},
  vazio: {paddingVertical: t.size.space6, alignItems: "center"},
}));

/**
 * A largura em que a web empilha o `.data-list` (aurea.css:1231). O mesmo número, e de propósito:
 * um telefone fica sempre abaixo, um tablet em paisagem fica acima, e a peça se comporta igual
 * nos dois alvos.
 */
const EMPILHA_ABAIXO_DE = 640;

// ⚠ A regra que vale para os DOIS componentes virtualizáveis deste arquivo, escrita uma vez:
//
// `virtualized` troca o `map` por um `FlatList`, que só monta o que está na tela. É o que faz um
// histórico de mil linhas abrir sem engasgo — e é a resposta à pendência que a ADR-0038 deixou
// aberta em 31/08/2026 (*"o desempenho do `react-native-svg` em lista longa; volta a importar
// quando existir tela de lista"*). Esta é a tela de lista.
//
// ⚠ **E ele NÃO pode ficar dentro de um `<Screen scroll>`.** Dois roladores no mesmo eixo é erro
// conhecido do RN: o de fora dá altura infinita ao de dentro, a virtualização desliga, e o
// console avisa *"VirtualizedLists should never be nested inside plain ScrollViews"*. Com
// `virtualized`, o componente **é** o rolador — o `Screen` fica sem `scroll`.
//
// O padrão é `false` porque a forma composta é a que funciona em qualquer lugar, e porque a
// maioria das listas deste alvo é curta. Ligar é decisão de quem sabe o tamanho do dado.
type Virtualizavel = {
  /** Vira `FlatList`. ⚠ Então este componente é o rolador — não o ponha dentro de `<Screen scroll>`. */
  virtualized?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaTimelineItem = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nó, não string: uma data absoluta e uma relativa são igualmente bem-vindas — como na web. */
  time?: React.ReactNode;
};

export interface TimelineProps extends Virtualizavel {
  items: readonly AureaTimelineItem[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A sequência do que aconteceu.
 *
 * ⚠ **`accessibilityRole="list"` e nada mais.** Na web isto é um `<ol>`, e a ficha explica por
 * quê: *"a ordem É a informação, e um leitor de tela anuncia a contagem e a posição de graça"*.
 * **No RN esse "de graça" não existe** — não há `<ol>`, e `list` não distingue ordenada de não
 * ordenada. A contagem e a posição teriam de ser escritas item a item.
 *
 * E NÃO são, de propósito: pendurar "1 de 40" em cada evento de um histórico é ruído a cada
 * parada do leitor, e a ordem cronológica já está no `time` de cada um, que é a informação de
 * verdade. **Quem precisa de posição precisa é da data.** É a diferença entre traduzir a intenção
 * e traduzir a tag.
 *
 * ⚠ **A coluna de conteúdo é uma PILHA**, e isso é defeito visto: sem ela, o título e o horário
 * colavam na mesma linha — *"Shipped14:20"* (aurea.css:1240). Geometria de componente não muda
 * com o conteúdo.
 */
export function Timeline({items, virtualized = false, style, testID}: TimelineProps) {
  const t = useAureaTokens();
  const s = folha(t);

  const desenhar = React.useCallback((item: AureaTimelineItem) => (
    <View style={s.evento}>
      <View style={s.ponto} />
      <View style={s.colunaDoEvento}>
        {typeof item.title === "string"
          ? <Text size="md" weight={600}>{item.title}</Text> : item.title}
        {item.description != null
          ? (typeof item.description === "string"
              ? <Text size="sm" tone="muted">{item.description}</Text> : item.description)
          : null}
        {item.time != null
          ? (typeof item.time === "string"
              ? <Text size="xs" tone="muted">{item.time}</Text> : item.time)
          : null}
      </View>
    </View>
  ), [s]);

  if (virtualized) {
    return (
      <FlatList
        accessibilityRole="list"
        data={items as AureaTimelineItem[]}
        keyExtractor={(_, n) => String(n)}
        renderItem={({item}) => desenhar(item)}
        ItemSeparatorComponent={() => <View style={{height: t.size.space5}} />}
        // ⚠ O trilho NÃO entra no modo virtualizado, e isso é honesto em vez de quebrado: ele é
        // uma linha absoluta do topo ao pé da lista INTEIRA, e no `FlatList` a lista inteira não
        // existe — só a janela. Desenhá-lo daria um trilho que começa e termina no lugar errado
        // conforme se rola. Os pontos continuam, e são eles que marcam os eventos.
        style={style}
        testID={testID} />
    );
  }

  return (
    <View accessibilityRole="list" style={[s.trilha, style]} testID={testID}>
      {items.length > 0 ? <View style={s.trilho} /> : null}
      {items.map((item, n) => <React.Fragment key={n}>{desenhar(item)}</React.Fragment>)}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// DataList
// ─────────────────────────────────────────────────────────────────────────────────────────────

export type AureaDataListItem = {term: React.ReactNode; value: React.ReactNode};

export interface DataListProps {
  items: readonly AureaDataListItem[];
  /**
   * Força o formato. Sem isto ele decide pela largura da janela, no MESMO ponto em que a web
   * decide (640). `"stacked"` é o que um telefone sempre recebe.
   */
  layout?: "auto" | "stacked" | "inline";
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Os pares termo → valor.
 *
 * ⚠ **Na web isto é um `<dl>` de verdade, e a ficha diz que a razão é a ligação sobreviver "com a
 * folha de estilo desligada".** No RN não há `<dl>`, não há folha para desligar, e **não existe
 * papel de lista de definição.** A ligação, então, tem de ser dita: cada par é UM nó acessível
 * cujo nome é `"termo: valor"` — o leitor lê os dois juntos, que é o que o `<dl>` garante lá.
 *
 * Ler cada metade separada seria o defeito: quem varre com o dedo ouviria "Quilometragem", daria
 * um passo, ouviria "12,4" — e num formulário de oito pares perderia qual valor era de qual
 * termo.
 *
 * ⚠ **Ele empilha abaixo de 640dp, e o número é o mesmo da web.** O comentário do CSS
 * (aurea.css:1224) registra o defeito que a regra evita: a 320px a coluna do valor resolvia em
 * **0px** e jogava o texto para fora da página.
 */
export function DataList({items, layout = "auto", style, testID}: DataListProps) {
  const t = useAureaTokens();
  const s = folha(t);
  const {width} = useWindowDimensions();
  const ladoALado = layout === "inline" || (layout === "auto" && width >= EMPILHA_ABAIXO_DE);

  return (
    <View accessibilityRole="list" style={[s.pares, style]} testID={testID}>
      {items.map((item, n) => {
        const nome = typeof item.term === "string" && typeof item.value === "string"
          ? `${item.term}: ${item.value}`
          : undefined;
        return (
          <View
            key={n}
            accessible
            accessibilityLabel={nome}
            style={ladoALado ? s.parLadoALado : s.parEmpilhado}>
            {typeof item.term === "string"
              ? <Text size="sm" tone="muted" style={ladoALado ? s.termoLadoALado : undefined}>
                  {item.term}
                </Text>
              : item.term}
            {typeof item.value === "string"
              ? <Text size="sm" style={s.valor}>{item.value}</Text>
              : <View style={s.valor}>{item.value}</View>}
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface AureaColumn<T> {
  /** Identidade da coluna, e a chave padrão de leitura em `linha`. */
  key: string;
  /** O que o `<th>` diria. Vira o NOME de cada célula no cartão — não some, muda de lugar. */
  header: React.ReactNode;
  /** Como a célula desenha. Sem isto, `String(linha[key])`. */
  cell?: (linha: T) => React.ReactNode;
  /**
   * Esta coluna vira o TÍTULO do cartão, sem repetir o nome dela. Use na que identifica a linha —
   * numa lista de lançamentos, a data. **Uma só**; a primeira marcada vence.
   */
  primary?: boolean;
}

export interface TableProps<T> extends Virtualizavel {
  /**
   * O nome acessível, e o `<caption>` da web. Sem ele a lista se anuncia com a frase genérica da
   * tabela — que é o mesmo recuo que a web faz.
   */
  caption?: React.ReactNode;
  columns: readonly AureaColumn<T>[];
  rows: readonly T[];
  /** Identidade estável de cada linha. Sem isto, o índice — que basta para lista que não reordena. */
  keyExtractor?: (linha: T, n: number) => string;
  /** Torna a linha tocável. Sem isto ela não é um alvo, e não finge ser. */
  onRowPress?: (linha: T) => void;
  /** O que mostrar sem linhas. Sem isto, a frase de vazio da tabela de frases. */
  empty?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * As linhas e colunas — **e no aparelho ela NÃO é uma tabela.** Cada linha vira um cartão, e cada
 * célula leva o nome da sua coluna junto.
 *
 * ⚠ **Isto não é um recuo: é a única forma que tem as DUAS coisas.** Ver o cabeçalho deste
 * arquivo, onde a medição está inteira. Em resumo: o papel `table` **não mapeia em plataforma
 * nenhuma** (medido no fonte do RN), então uma grade de verdade não se anunciaria como tabela de
 * qualquer jeito; e o `min-width: 720px` do CSS num telefone de 360dp é rolagem horizontal de 2×,
 * que a própria ficha da web considera insuficiente sem teclado — e **no toque não há teclado**.
 * Manter a grade perderia a leitura sem ganhar a semântica.
 *
 * ⚠ **A API é OUTRA, e tinha de ser.** Na web você escreve `<thead>`/`<tbody>` como `children`.
 * No RN não existem elementos de tabela para escrever, então a peça recebe **dados** (`columns` +
 * `rows`) e monta. Não é a mesma prop com outro nome: é uma superfície diferente, e ela está dita
 * aqui em vez de descoberta na hora do erro de tipo.
 *
 * ⚠ **O cabeçalho não some — ele se muda.** Cada `header` passa a nomear a sua célula dentro do
 * cartão. É o que impede o defeito da tabela virada em lista: quatro números soltos, um embaixo
 * do outro, sem dizer o que cada um é.
 */
export function Table<T>({
  caption, columns, rows, keyExtractor, onRowPress, empty,
  virtualized = false, style, testID,
}: TableProps<T>) {
  const t = useAureaTokens();
  const s = folha(t);
  const strings = useAureaStrings();
  const principal = columns.find((c) => c.primary);
  const secundarias = columns.filter((c) => c !== principal);

  const conteudo = React.useCallback((coluna: AureaColumn<T>, linha: T): React.ReactNode => {
    if (coluna.cell) return coluna.cell(linha);
    const bruto = (linha as Record<string, unknown>)[coluna.key];
    return bruto == null ? "" : String(bruto);
  }, []);

  const desenharLinha = React.useCallback((linha: T) => {
    const corpo = (
      <>
        {principal ? (
          <View accessible>
            {(() => {
              const v = conteudo(principal, linha);
              return typeof v === "string" ? <Text size="md" weight={600}>{v}</Text> : v;
            })()}
          </View>
        ) : null}
        {secundarias.map((coluna) => {
          const v = conteudo(coluna, linha);
          const nome = typeof coluna.header === "string" && typeof v === "string"
            ? `${coluna.header}: ${v}` : undefined;
          return (
            <View key={coluna.key} accessible accessibilityLabel={nome} style={s.celula}>
              {typeof coluna.header === "string"
                ? <Text size="sm" tone="muted" style={s.nomeDaColuna}>{coluna.header}</Text>
                : coluna.header}
              {typeof v === "string" ? <Text size="sm" style={s.valor}>{v}</Text> : v}
            </View>
          );
        })}
      </>
    );

    // Só vira alvo se houver o que tocar. Uma linha `Pressable` sem ação é um botão que não faz
    // nada — e o leitor de tela a anunciaria como botão.
    return onRowPress
      ? <Pressable accessibilityRole="button" onPress={() => onRowPress(linha)}
                   style={[s.linha, s.linhaTocavel]}>{corpo}</Pressable>
      : <View style={s.linha}>{corpo}</View>;
  }, [principal, secundarias, conteudo, onRowPress, s]);

  const chave = React.useCallback(
    (linha: T, n: number) => keyExtractor ? keyExtractor(linha, n) : String(n),
    [keyExtractor],
  );

  const nomeDaLista = typeof caption === "string" ? caption : strings.tableLabel;

  if (rows.length === 0) {
    return (
      <View style={[s.vazio, style]} testID={testID}>
        {empty != null
          ? (typeof empty === "string" ? <Text size="sm" tone="muted">{empty}</Text> : empty)
          : <Text size="sm" tone="muted">{strings.dataEmpty}</Text>}
      </View>
    );
  }

  if (virtualized) {
    return (
      <FlatList
        accessibilityRole="list"
        accessibilityLabel={nomeDaLista}
        data={rows as T[]}
        keyExtractor={chave}
        renderItem={({item}) => desenharLinha(item)}
        ItemSeparatorComponent={() => <View style={{height: t.size.space2}} />}
        style={style}
        testID={testID} />
    );
  }

  return (
    <View accessibilityRole="list" accessibilityLabel={nomeDaLista}
          style={[s.tabela, style]} testID={testID}>
      {rows.map((linha, n) => (
        <React.Fragment key={chave(linha, n)}>{desenharLinha(linha)}</React.Fragment>
      ))}
    </View>
  );
}
