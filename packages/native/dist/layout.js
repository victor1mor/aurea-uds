import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — os primitivos de layout: `Stack`, `Cluster`, `Grid`, `Card`.
//
// Medidos no core da web antes de escrever (passo 1 do BUILDING.md), e o que eles são lá:
//
//   .stack   { display:flex; flex-direction:column; gap:var(--space-4) }
//   .cluster { display:flex; align-items:center; flex-wrap:wrap; gap:var(--space-3) }
//   .grid    { display:grid; grid-template-columns:repeat(auto-fill,
//              minmax(min(var(--grid-min,15rem),100%),1fr)); gap:var(--space-4) }
//
// **A decisão de API que atravessa inteira, e é a mais importante:** não há prop `gap`. A ficha
// do `Stack` na web escreve o porquê — *"um primitivo de layout que aceita qualquer espaçamento é
// como um sistema deixa de ter espaçamento"*. Reabrir isso no nativo criaria dois sistemas.
import * as React from "react";
import { Pressable, View } from "react-native";
// `ref` chega por PROPS, sem `forwardRef` — e' o padrao do React 19, e e' o que o
// `@aurea-uds/react` ja' faz (o `Stack` da web e' `HTMLAttributes & RefAttributes`, sem
// envelope). O `ViewProps`/`TextProps` do RN 0.87 ja' declaram `ref`, entao ele viaja no
// `...rest` sem nada a mais.
import { criarFolha, REACAO_AO_TOQUE } from "./estilos.js";
import { Text } from "./text.js";
import { useAureaTokens, SobreAMarca } from "./theme.js";
const folha = criarFolha((t) => ({
    // A LINHA DO SISTEMA, e os números são os mesmos do `.separator` da web (`aurea.css`): cor de
    // `border` e espessura de UM pixel. ⚠ Um pixel não sai de `--space-*` de propósito — a linha
    // do sistema é de um pixel, e um pixel não é espaçamento. A mesma frase está no CSS.
    separador: { backgroundColor: t.color.border },
    separadorH: { height: t.size.borderWidth, width: "100%" },
    separadorV: { width: t.size.borderWidth, alignSelf: "stretch", minHeight: t.size.space5 },
    // A linha COM texto no meio: duas linhas que esticam e o rótulo entre elas, sem encolher.
    separadorRotulado: { flexDirection: "row", alignItems: "center", gap: t.size.space3, width: "100%" },
    separadorPedaco: { flex: 1, height: t.size.borderWidth, backgroundColor: t.color.border },
    // `gap` no RN existe desde a 0.71 e é o mesmo conceito do flex gap do CSS — medido no contrato
    // do `react-native` 0.86/0.87 que o pacote declara como peer (>=0.76).
    stack: { flexDirection: "column", gap: t.size.space4 },
    cluster: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: t.size.space3 },
    clusterSemQuebra: { flexWrap: "nowrap" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: t.size.space4 },
    // O raio 22 e a sombra vêm de token, e os dois são identidade declarada INTOCÁVEL no CLAUDE.md.
    // `boxShadow` é do RN 0.76+, e a Etapa 2 mediu que ele é 1:1 com o CSS — inclusive `spread`,
    // que o par `shadowRadius`/`elevation` perdia. Provado em aparelho no smoke do Lote 0.
    cardBase: {
        borderRadius: t.size.radiusCard,
        padding: t.size.cardPad,
        backgroundColor: t.color.card,
        borderWidth: t.size.borderWidth,
        borderColor: t.color.border,
    },
    card_base: {},
    card_raised: { boxShadow: [t.shadow.shadowLg] },
    card_interactive: { borderColor: t.color.borderStrong },
    // `inset` recessa em vez de flutuar — é o painel DENTRO de um card, e a ficha da web diz isso.
    card_inset: { backgroundColor: t.color.surfaceInset, borderColor: "transparent" },
    card_selected: { borderColor: t.color.primaryOutline, backgroundColor: t.color.surface2 },
    card_danger: { borderColor: t.color.danger400 ?? t.color.destructive, backgroundColor: t.color.dangerBg },
    // O amarelo é o DE PREENCHER — `primary`, o mesmo do botão sólido. A borda some: uma superfície
    // cheia não precisa de contorno, e um contorno sobre o amarelo mede 2,43 no claro (invisível).
    card_brand: { backgroundColor: t.color.primary, borderColor: "transparent" },
    // A ação fica embaixo, separada pelo mesmo respiro que o resto da casa usa entre blocos.
    acaoDaMarca: { marginTop: t.size.space3 },
}));
const ALINHAR_COLUNA = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
/** Coluna com `--space-4` entre os filhos. **Sem prop de espaçamento, de propósito.** */
export function Stack({ align, style, ...rest }) {
    const s = folha(useAureaTokens());
    return _jsx(View, { style: [s.stack, align != null && { alignItems: ALINHAR_COLUNA[align] }, style], ...rest });
}
const ALINHAR = { start: "flex-start", center: "center", end: "flex-end", baseline: "baseline" };
const JUSTIFICAR = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" };
/**
 * Linha que QUEBRA, alinhada no eixo cruzado, com `--space-3`. É a fila de chips e botões.
 *
 * ✅ **`align`, `justify` e `wrap` — R-09, 24/09/2026.** O app centralizava três filas passando
 * `style`, e a regra "só Aurea" dele barra isso. Os nomes são os que o documento dos consumidores
 * propõe para a web na B-01, de propósito: quando a web ganhar os mesmos, os dois alvos dizem a
 * mesma coisa com a mesma palavra. **O espaço entre os itens continua sem prop**, como na `Stack`.
 * Sem nenhuma das três, nada muda.
 */
export function Cluster({ align, justify, wrap, style, ...rest }) {
    const s = folha(useAureaTokens());
    return (_jsx(View, { style: [
            s.cluster,
            align != null && { alignItems: ALINHAR[align] },
            justify != null && { justifyContent: JUSTIFICAR[justify] },
            wrap === false && s.clusterSemQuebra,
            style,
        ], ...rest }));
}
/**
 * Colunas que se acomodam sem breakpoint.
 *
 * ⚠ **NÃO É O MESMO MECANISMO DA WEB, e a diferença é da plataforma.** Lá o `.grid` usa
 * `repeat(auto-fill, minmax(min(--grid-min,100%), 1fr))` — CSS Grid resolve a contagem de colunas
 * sozinho e ESTICA a última linha. **No React Native não existe CSS Grid**: o layout é flexbox e
 * nada mais (medido no contrato do `react-native`; não há `display:grid`).
 *
 * O que se faz aqui é o mais próximo honesto: `flexWrap` com uma largura mínima por filho. A
 * diferença visível é uma só, e fica declarada em vez de escondida — **os itens da última linha
 * não esticam para preencher a sobra**. Quem precisa de célula elástica passa `flexGrow: 1` no
 * filho; é decisão de tela, não do primitivo.
 *
 * O `min(…, 100%)` da web tem par aqui: `maxWidth: "100%"` no filho, para a coluna não estourar o
 * contêiner quando o texto cresce — a mesma lição que a Fase 11 registrou no CSS.
 */
export function Grid({ minColumnWidth = 240, style, children, ...rest }) {
    const s = folha(useAureaTokens());
    const celula = React.useMemo(() => ({ flexGrow: 0, flexShrink: 1, flexBasis: minColumnWidth, minWidth: minColumnWidth, maxWidth: "100%" }), [minColumnWidth]);
    return (_jsx(View, { style: [s.grid, style], ...rest, children: React.Children.map(children, (filho) => {
            if (!React.isValidElement(filho))
                return filho;
            // 🔴 O `flexGrow: 1` É O ITEM C14, e ele existe porque a célula NÃO basta.
            //
            // A célula já tem a altura certa: a grade é `flexWrap: "wrap"`, e o padrão do Yoga é
            // `alignItems: Stretch` — medido no fonte do motor, `Style.h:907` —, então cada célula
            // estica até a mais alta da LINHA. O que não acontecia é o filho preencher a célula: numa
            // coluna, um filho sem `flexGrow` mede o próprio conteúdo, e dois `KPI` lado a lado, um
            // com duas linhas de texto e outro com uma, saíam de alturas diferentes.
            //
            // ⚠ **Na web isto é de graça e por isso não tinha sido notado:** o `.grid`
            // (`aurea.css:54`) é `display: grid`, e ali o cartão é o PRÓPRIO item da grade —
            // `align-items` vale `stretch` por padrão e ele preenche a linha. Aqui existe uma célula
            // no meio, e é ela que corta a herança de altura.
            //
            // ⚠ **O estilo vai ANTES do que o filho já tinha**, para um `style` do consumidor
            // continuar vencendo. E um filho que não aceite `style` simplesmente não estica — fica
            // como estava, nunca pior.
            const proprio = filho.props.style;
            const estica = React.cloneElement(filho, { style: [{ flexGrow: 1 }, proprio] });
            return _jsx(View, { style: celula, children: estica });
        }) }));
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
export function Separator({ orientation = "horizontal", label, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    if (label != null) {
        return (_jsxs(View, { style: [s.separadorRotulado, style], ...rest, children: [_jsx(View, { style: s.separadorPedaco }), typeof label === "string"
                    ? _jsx(Text, { size: "sm", tone: "muted", children: label })
                    : label, _jsx(View, { style: s.separadorPedaco })] }));
    }
    return (_jsx(View, { style: [s.separador, orientation === "vertical" ? s.separadorV : s.separadorH, style], ...rest }));
}
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
export function Card({ variant, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const { action, children, onPress, disabled, ...resto } = rest;
    if (onPress != null) {
        const pele = variant ?? "interactive";
        return (_jsx(Pressable, { onPress: onPress, disabled: disabled, accessibilityRole: "button", accessibilityState: { disabled: !!disabled }, style: ({ pressed: tocando }) => [
                s.cardBase, s[`card_${pele}`],
                tocando && REACAO_AO_TOQUE.pressionado, disabled && REACAO_AO_TOQUE.inerte,
                style,
            ], ...resto, children: children }));
    }
    const corpo = (_jsxs(_Fragment, { children: [children, action != null && _jsx(View, { style: s.acaoDaMarca, children: action })] }));
    const pele = _jsx(View, { style: [s.cardBase, s[`card_${variant ?? "base"}`], style], ...resto, children: corpo });
    // 🔴 SOBRE O AMARELO A COR DO TEXTO NÃO É ESCOLHA, É OBRIGAÇÃO — e os números decidiram isto.
    // Medido nos dois temas, texto contra o `primary`:
    //     texto comum ........ 10,34 no claro  ·  **1,83 no escuro**  🔴 ilegível
    //     texto esmaecido .....  4,24 no claro  ·  **1,35 no escuro**  🔴 ilegível
    //     primary-foreground ..  4,54 nos DOIS                          ✅ único que serve
    // Sem forçar, o cartão da marca sairia quebrado no tema escuro **sem ninguém ver no claro**.
    // ⚠ **E no RN não há cascata de cor**: `color` num `View` não desce para o `Text` de dentro.
    // A saída é CONTEXTO — a mesma decisão que o `Field` do Lote 4 tomou para empurrar nome e dica.
    //
    // ⚠ **Consequência declarada: sobre o amarelo existe UMA cor de texto, não duas.** O tom
    // `muted` mede 1,35 no escuro, então ele não pode sobreviver aqui. A hierarquia dentro deste
    // cartão sai de PESO e TAMANHO, não de cor — e isso é restrição do contraste, não gosto.
    //
    // 🔴 **E ISTO NASCEU PELA METADE — o consumidor achou em UM DIA, 17/09/2026.** O parágrafo
    // acima fala só de TEXTO, e foi só o texto que passou a ler o contexto. Medido depois, dentro
    // deste mesmo cartão: contorno de campo **2,43/2,24**, fundo de campo **1,61** no claro, glifo
    // de botão sem fundo **1,83** no escuro — e as QUATRO aparências do `action` que este tipo
    // EXIGE, todas invisíveis (1,61 · 1,00 · 1,38 · 1,83).
    // **A mesma frase valia para linha e glifo desde o primeiro dia, e eu parei no texto.**
    // ✅ Hoje o contexto carrega o par (tinta, fundo), e quem lê está listado no `useSobreAMarca`.
    return variant === "brand"
        ? _jsx(SobreAMarca.Provider, { value: { tinta: t.color.primaryForeground, fundo: t.color.primary }, children: pele })
        : pele;
}
