import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
type Virtualizavel = {
    /** Vira `FlatList`. ⚠ Então este componente é o rolador — não o ponha dentro de `<Screen scroll>`. */
    virtualized?: boolean;
};
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
export declare function Timeline({ items, virtualized, style, testID }: TimelineProps): React.JSX.Element;
export type AureaDataListItem = {
    term: React.ReactNode;
    value: React.ReactNode;
};
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
export declare function DataList({ items, layout, style, testID }: DataListProps): React.JSX.Element;
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
export declare function Table<T>({ caption, columns, rows, keyExtractor, onRowPress, empty, virtualized, style, testID, }: TableProps<T>): React.JSX.Element;
export {};
