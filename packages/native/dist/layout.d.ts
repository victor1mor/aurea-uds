import * as React from "react";
import { type ViewProps } from "react-native";
/** Eixo cruzado do `Stack` — os MESMOS valores do `Stack` da web (B-01). */
export type AureaStackAlign = "start" | "center" | "end" | "stretch";
export interface StackProps extends ViewProps {
    children?: React.ReactNode;
    /**
     * Eixo cruzado (o horizontal). Padrão `stretch`: os filhos ocupam a largura, como sempre e como
     * na web. E2, 25/09/2026: desde que o `Button` passou a obedecer o pai (como no HeroUI Native e
     * na web), é aqui que se diz "botão do tamanho do texto" (`start`) ou "no meio" (`center`).
     */
    align?: AureaStackAlign;
}
/** Coluna com `--space-4` entre os filhos. **Sem prop de espaçamento, de propósito.** */
export declare function Stack({ align, style, ...rest }: StackProps): React.JSX.Element;
export type AureaClusterAlign = "start" | "center" | "end" | "baseline";
export type AureaClusterJustify = "start" | "center" | "end" | "between";
export interface ClusterProps extends Omit<StackProps, "align"> {
    /** Eixo cruzado (o vertical). Padrão `center`, o `align-items:center` do `.cluster`. */
    align?: AureaClusterAlign;
    /** Eixo principal (o horizontal). Padrão `start`. `between` espalha o que sobrar entre os itens. */
    justify?: AureaClusterJustify;
    /** Padrão `true`: a fila quebra linha, como o `.cluster`. `false` mantém tudo numa linha só. */
    wrap?: boolean;
}
/**
 * Linha que QUEBRA, alinhada no eixo cruzado, com `--space-3`. É a fila de chips e botões.
 *
 * ✅ **`align`, `justify` e `wrap` — R-09, 24/09/2026.** O app centralizava três filas passando
 * `style`, e a regra "só Aurea" dele barra isso. Os nomes são os que o documento dos consumidores
 * propõe para a web na B-01, de propósito: quando a web ganhar os mesmos, os dois alvos dizem a
 * mesma coisa com a mesma palavra. **O espaço entre os itens continua sem prop**, como na `Stack`.
 * Sem nenhuma das três, nada muda.
 */
export declare function Cluster({ align, justify, wrap, style, ...rest }: ClusterProps): React.JSX.Element;
export interface GridProps extends ViewProps {
    /**
     * Largura mínima de cada coluna, em dp. O equivalente do `--grid-min` da web, cujo padrão é
     * `15rem` — e `1rem = 16dp`, medido, então **240**.
     */
    minColumnWidth?: number;
    children?: React.ReactNode;
}
/**
 * Colunas que se acomodam sem breakpoint.
 *
 * ⚠ **NÃO É O MESMO MECANISMO DA WEB, e a diferença é da plataforma.** Lá o `.grid` usa
 * `repeat(auto-fill, minmax(min(--grid-min,100%), 1fr))` — CSS Grid resolve a contagem de colunas
 * sozinho e ESTICA a última linha. **No React Native não existe CSS Grid**: o layout é flexbox e
 * nada mais (medido no contrato do `react-native`; não há `display:grid`).
 *
 * ~~O que se faz aqui é o mais próximo honesto: `flexWrap` com uma largura mínima por filho. A
 * diferença visível é uma só (…) os itens da última linha não esticam para preencher a sobra.~~
 * **E11 (0.12.1):** a diferença era maior do que a declarada — nenhuma linha repartia a sobra.
 * Com `minColumnWidth={150}` numa linha de 372 ficavam duas colunas de 150 e 56 vazios (medido no
 * Yoga). Agora a grade mede a própria largura (`onLayout`) e faz a conta do `auto-fill` da web:
 * cabem `⌊(largura + vão) / (mínimo + vão)⌋` colunas, e a sobra se reparte entre elas. Na última
 * linha a célula continua do tamanho de UMA coluna, como na web. Antes da medida (o primeiro
 * quadro), vale a largura mínima de sempre.
 *
 * O `min(…, 100%)` da web tem par aqui: `maxWidth: "100%"` no filho, para a coluna não estourar o
 * contêiner quando o texto cresce — a mesma lição que a Fase 11 registrou no CSS.
 */
export declare function Grid({ minColumnWidth, style, children, onLayout, ...rest }: GridProps): React.JSX.Element;
/** Qual superfície o cartão é. Mesmos seis nomes da ficha da web. */
export interface SeparatorProps extends ViewProps {
    orientation?: "horizontal" | "vertical";
    /**
     * Um texto NO MEIO da linha — "ou entre com", numa tela de entrar.
     *
     * ⚠ **Isto NÃO existe na web, e a divergência fica declarada em vez de escondida.** Lá o
     * `.separator` é só a linha, e um rótulo no meio nunca foi pedido. Aqui foi: o app mediu essa
     * lacuna na tela de entrar, e a demanda manda no nativo desde o Lote 7. **Com `label`, a
     * orientação é sempre horizontal** — texto no meio de uma linha vertical não é a mesma peça.
     */
    label?: React.ReactNode;
}
/**
 * A linha de divisão do sistema. Mesma cor e mesma espessura do `.separator` da web.
 *
 * ⚠ **Ela NÃO recebe papel de acessibilidade, e isso é escolha medida, não esquecimento.** O
 * `<hr>` da web traz o papel `separator` de graça; no React Native esse papel **não existe na
 * lista** — inventar o mais parecido diria uma coisa errada ao leitor de tela, que é exatamente
 * a armadilha que o Lote 5 e a `Table` do Lote 6 já pagaram. Uma linha decorativa calada é o
 * comportamento certo.
 */
export declare function Separator({ orientation, label, style, ...rest }: SeparatorProps): React.JSX.Element;
export type AureaCardVariant = "base" | "raised" | "interactive" | "inset" | "selected" | "danger" | "brand";
interface CardBase extends ViewProps {
    children?: React.ReactNode;
}
/**
 * 🔴 **O `brand` EXIGE `action`, e isso é de propósito — a regra é do TIPO, não de documento.**
 *
 * O cartão na cor da marca entrou em 17/09/2026 e é a **primeira superfície grande preenchida
 * com o amarelo** neste sistema. Até aqui ele só pintava coisa pequena: o ponto do contador, a
 * pílula do passo atual, o link de pular para o conteúdo. Um cartão amarelo é precedente, e
 * precedente sem trava vira decoração — outras telas pedem o mesmo e o amarelo deixa de
 * significar "aja aqui".
 *
 * A regra combinada foi *"o cartão amarelo é só para pedir uma ação da pessoa"*. **Escrita num
 * documento, ela apagaria** — este repositório tem registro disso em cada arquivo, e a §"Afirmação
 * velha" do `CLAUDE.md` existe por causa desse desgaste. Então ela mora no tipo: sem `action`, o
 * `brand` não compila. É a mesma escolha que faz o `label` do `IconButton` ser obrigatório.
 */
interface CardDaMarca extends CardBase {
    variant: "brand";
    /** O que a pessoa faz aqui — um `Button`, um `IconButton`, um campo. Sem isto não compila. */
    action: React.ReactNode;
}
interface CardComum extends CardBase {
    variant?: Exclude<AureaCardVariant, "brand">;
    action?: never;
    onPress?: undefined;
}
/**
 * 🔴 **O cartão que É um alvo — R-04, 24/09/2026.** Até aqui a documentação mandava a tela
 * embrulhar o cartão num `Pressable`, e o consumidor que segue a regra "só Aurea" ficava sem
 * caminho. Agora o toque é do `Card`, e **as duas obrigações que a nota antiga deixava com a tela
 * passam a ser do TIPO:** com `onPress` o nome para o leitor de tela é obrigatório, e o papel de
 * botão vem de dentro. Mesma escolha do `action` do `brand` e do `label` do `IconButton`.
 *
 * ⚠ **E o `brand` NÃO aceita `onPress`, de propósito.** Ele exige `action`, e `action` é um botão
 * DENTRO do cartão — botão dentro de botão, o defeito que o `check 43` barra. No iPhone o de
 * dentro some para o VoiceOver.
 */
interface CardTocavel extends CardBase {
    variant?: Exclude<AureaCardVariant, "brand">;
    action?: never;
    /** O que acontece ao tocar no cartão. Com isto o cartão inteiro vira UM botão. */
    onPress: () => void;
    /** O nome do cartão para o leitor de tela. Obrigatório com `onPress`: é o que ele anuncia. */
    accessibilityLabel: string;
    disabled?: boolean;
}
export type CardProps = CardDaMarca | CardComum | CardTocavel;
/**
 * Superfície flutuante, raio 22 (`--radius-card`) — identidade declarada INTOCÁVEL.
 *
 * ✅ **O cartão responde ao toque com `onPress`** (R-04, 24/09/2026):
 *
 * ```tsx
 * <Card onPress={abrir} accessibilityLabel="Relatório de março">…</Card>
 * ```
 *
 * Com `onPress` a variante padrão passa a ser `interactive` — a pele de um cartão que é alvo — e
 * o toque dá a MESMA reação do `Button` (`REACAO_AO_TOQUE`). Sem `onPress`, nada muda: `interactive`
 * continua sendo só a pele.
 *
 * 🔴 **Um cartão com `onPress` NÃO PODE ter coisa tocável dentro** — nem `Button`, nem `Switch`,
 * nem link. O cartão vira UM elemento para o leitor de tela, e no iPhone quem é elemento **não
 * expõe os filhos**: o botão de dentro existiria na tela e não existiria para o VoiceOver. É o
 * defeito que o `check 43` guarda no nosso código, e aqui ele não alcança, porque o conteúdo é
 * do app. ⚠ **O exemplo do HeroUI faz exatamente isso** (`PressableFeedback` em volta de um
 * `Card` com `Button` dentro, `heroui-native@1.0.10`) — é o ponto em que a referência não serve.
 * Cartão com duas ações não tem `onPress`: cada ação é um botão dentro de um cartão comum.
 */
export declare function Card({ variant, style, ...rest }: CardProps): React.JSX.Element;
export {};
