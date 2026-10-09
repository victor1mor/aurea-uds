import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — o que MOSTRA dado: `Badge`, `Status`, `Avatar` e `KPI`.
//
// Lote 2 do `NATIVE.md` §5.5. O consumidor medido (§5.1) pede, nesta categoria, três coisas
// concretas: **métricas** no painel (`KPI`, e o `Progress` do módulo de feedback ao lado dele),
// um **contador de não lidos** na navegação inferior (`Badge` ancorado) e **avisos** com estado
// (`Status`). O `Avatar` entra pelo cadastro.
//
// Medido antes de escrito, com a linha:
//
//   .badge        aurea.css:976   pílula, minH space-6, padding 3/9, borda 1, textXs, weightMedium
//   .badge-xs/sm/lg  :983-985     as três medidas alternativas
//   .badge-dot    aurea.css:988   space-2 quadrado, redondo, cor corrente
//   .badge-*(tom) :1040-1043      cor X-400, fundo X-bg, borda misturada
//   .badge-solid/outline :1053-4  as duas ênfases além do `soft`
//   .status       aurea.css:1060  linha, gap space-2, mutedForeground, textSm
//   .status-dot   aurea.css:1055  8 quadrado, redondo, halo de 3 na cor corrente a 14%
//   .avatar       aurea.css:1196  quadrado da altura de controle, redondo, borda borderStrong
//   .kpi          aurea.css:1207  coluna com gap 5 — **dentro de um Card**
//
// ⚠ **O `.kpi` do CSS mente sozinho, e o fonte corrige:** `markup.tsx:105` mostra que o `KPI` é
// `<Card className="kpi">`. Quem lesse só o CSS faria uma coluna sem superfície — e a peça
// perderia o cartão, que é metade do que ela é.
import * as React from "react";
import { Image, View } from "react-native";
import { IconButton, folgaDoToque } from "./actions.js";
import { canto, acentoDoTom, criarFolha, fundoDoTom, preenchimentoDoTom } from "./estilos.js";
import { Card } from "./layout.js";
import { gravidadeDoEstado } from "./strings.js";
import { Icon } from "./icon.js";
import { Text } from "./text.js";
import { useAureaStrings, useAureaTokens } from "./theme.js";
const folha = criarFolha((t) => ({
    // ── Badge ──────────────────────────────────────────────────────────────────────────────────
    // 🔴 AS MEDIDAS SÃO AS DO CHIP DA REFERÊNCIA — ordem do Victor de
    // 25/09/2026: "se [a referência] já tem, vamos usar as [dela]". Recheio, letra, linha e vão:
    //     sm  8 × 2  · letra 12 · linha 16        md  12 × 4 · letra 14 · linha 20
    //     lg  16 × 6 · letra 16 · linha 24        vão 4 entre ponto, texto e adornos
    // Até a 0.10.1 eram `3px 9px` e `gap:6` crus, e o texto saía com entrelinha 1,0: no Android a
    // perna do g e do p era cortada (a mesma causa do E1 no `Button`). A linha da referência é ≥ 1,33 ×
    // a letra, e a letra precisa de 1,3 (a IBM Plex e a Atkinson Hyperlegible da ADR-0053, medidas
    // na tabela `hhea`). O raio continua a cápsula da Aurea (identidade) e a
    // borda continua nossa.
    // ⚠ O `xs` NÃO existe na referência (é o contador sobre ícone): fica a medida nossa, 16 de altura,
    // agora com letra 12 e linha 16 para caber a letra inteira.
    selo: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.size.space1,
        paddingVertical: t.size.space1, paddingHorizontal: t.size.space3,
        borderWidth: t.size.borderWidth, ...canto(t.size.radiusControl),
        backgroundColor: t.color.secondary, borderColor: t.color.border,
    },
    selo_xs: { minHeight: t.size.space4, paddingVertical: 0, paddingHorizontal: t.size.space1, borderWidth: 0 },
    selo_sm: { paddingVertical: t.size.space05, paddingHorizontal: t.size.space2 },
    selo_md: {},
    // 6 de recheio vertical: na referência é 1,5 vez a unidade de espaço dela, e essa unidade é o `space1`.
    selo_lg: { paddingVertical: t.size.space1 * 1.5, paddingHorizontal: t.size.space4 },
    ponto: { width: t.size.space2, height: t.size.space2, ...canto(t.size.radiusFull) },
    // `fit="content"` (R-01): o mesmo `alignSelf` que a âncora abaixo já usa para não esticar.
    justo: { alignSelf: "flex-start" },
    // A âncora é `position:relative` na web; aqui o filho absoluto já se posiciona por ela.
    ancora: { position: "relative", alignSelf: "flex-start" },
    // R-24 (08/10/2026): o selo PRESO segue a referência principal. O nativo dela não tem selo, então
    // vale a web dela (o `badge.css` da 3.2.6, lido no pacote): no mínimo um quadrado do tamanho do
    // selo (`MINIMO_PRESO`, abaixo), que vira círculo com um dígito; sem recheio vertical e meia
    // unidade dos lados; e um fio de 1 da cor do FUNDO em volta, que separa o número do que está
    // atrás. Antes sobrava o recheio vertical do tamanho — o "1" do `sm` media 14,9 × 22, esticado —
    // e o anel era uma sombra de 2.
    sobreposto: { position: "absolute", zIndex: 1, paddingVertical: 0, paddingHorizontal: t.size.space05,
        borderWidth: t.size.borderWidth, borderColor: t.color.background },
    // ── Status ─────────────────────────────────────────────────────────────────────────────────
    estado: { flexDirection: "row", alignItems: "center", gap: t.size.space2 },
    // O halo é `box-shadow 0 0 0 3px` da cor corrente a 14% (aurea.css:1055). Sem `color-mix` no
    // RN, o mesmo efeito sai com opacidade no próprio anel.
    pontoDeEstado: { width: 8, height: 8, ...canto(t.size.radiusFull) },
    // ── Avatar ─────────────────────────────────────────────────────────────────────────────────
    avatar: {
        alignItems: "center", justifyContent: "center", overflow: "hidden",
        ...canto(t.size.radiusFull), backgroundColor: t.color.surface3,
        borderWidth: t.size.borderWidth, borderColor: t.color.borderStrong,
    },
    imagem: { width: "100%", height: "100%" },
    // ── KPI ────────────────────────────────────────────────────────────────────────────────────
    kpi: { gap: t.size.space1 },
    // A seta fica na PRIMEIRA linha (quando a tendência quebra, `center` a deixava entre as duas):
    // a caixa dela tem a altura de uma linha do texto `sm` (que no telefone é o `textBase`, ADR-0050).
    tendencia: { flexDirection: "row", alignItems: "flex-start", gap: t.size.space1 },
    seta: { height: t.size.textBase * t.size.leadingNormal, justifyContent: "center" },
}));
/** `count > max ? `${max}+` : String(count)` — a mesma linha do `markup.tsx:140`. */
export const formatarContagem = (count, max = 99) => count > max ? `${max}+` : String(count);
/**
 * A pílula pequena — rótulo, contagem ou ponto.
 *
 * ⚠ **Ancorado, o número é DECORATIVO para o leitor de tela.** Ele some da árvore, e quem carrega
 * a informação é o rótulo de quem foi decorado. Sem isso o leitor anuncia *"sino, 8"* e a pessoa
 * não sabe o que é o 8 — regra lida em três fontes de acessibilidade em 17/08/2026 e registrada
 * no fonte da web. **Quem usa contagem ancorada escreve o rótulo do alvo**, sempre:
 *
 *     <Badge count={8} anchor="top-end">
 *       <IconButton name="bell" label="Avisos, 8 não lidos" onPress={abrir} />
 *     </Badge>
 *
 * ⚠ **`image`/`imageAlt` da web NÃO atravessaram.** Nenhuma das sete telas do consumidor medido
 * usa selo com miniatura, e prop sem consumidor é superfície pública para manter de graça. Volta
 * quando houver tela que peça.
 */
/** A letra e a linha do selo, do chip da referência (ver a folha). O token direto, e não o
 *  `size` do `Text`, que no telefone sobe um degrau (ADR-0050) — a referência não sobe no chip. */
const LETRA_DO_SELO = (t, size) => size === "lg" ? { fontSize: t.size.textBase, lineHeight: t.size.space6 }
    : size === "md" ? { fontSize: t.size.textSm, lineHeight: t.size.space5 }
        : { fontSize: t.size.textXs, lineHeight: t.size.space4 };
export function Badge({ tone = "neutral", emphasis = "soft", size = "md", dot, count, max = 99, showZero, leading, trailing, fit = "auto", anchor, badgeContent, invisible, children, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const categoria = ehCategoria(tone) ? coresDaCategoria(t)[tone] : null;
    const acento = categoria ? categoria[0] : acentoDoTom(t, tone);
    const fundo = categoria ? categoria[1] : fundoDoTom(t, tone);
    // O selo cheio de ESTADO é o botão cheio do mesmo tom (a cor funda e a letra dele); categoria,
    // marca e neutro enchem com o acento, como antes.
    const cheio = categoria ? undefined : preenchimentoDoTom(t, tone);
    const pele = emphasis === "solid"
        ? { backgroundColor: cheio ? cheio[0] : acento, borderColor: "transparent" }
        : emphasis === "outline"
            ? { backgroundColor: "transparent", borderColor: acento }
            : tone === "neutral"
                ? {}
                : { backgroundColor: fundo, borderColor: acento };
    const corDoTexto = emphasis === "solid" ? (cheio ? cheio[1] : t.color.background)
        : tone === "neutral" ? t.color.secondaryForeground : acento;
    const numero = count != null ? formatarContagem(count, max) : undefined;
    const miolo = anchor ? (numero ?? badgeContent) : (numero ?? children);
    // Ponto puro: `dot` sem nada para mostrar. Aí o selo não tem conteúdo e ganha medida própria.
    const soPonto = !!dot && miolo == null;
    // R-24: preso, o selo se prende ao DESENHO do alvo. O `IconButton` tem área de toque maior que o
    // círculo (44 contra 36 no `md`); preso a ela, o selo ficava 4 para fora. A folga sai do próprio
    // `IconButton` (`folgaDoToque`), e não de um número escrito aqui.
    const folga = anchor && React.isValidElement(children) && children.type === IconButton
        ? folgaDoToque(t, children.props.size) : 0;
    // O ponto tem 8 de cor (a medida da Aurea, nos dois alvos) mais o fio de 1 do anel de cada lado.
    const ladoDoPonto = t.size.space2 + 2 * t.size.borderWidth;
    const minimo = soPonto ? ladoDoPonto : MINIMO_PRESO(t, size);
    // O deslocamento de 25% é do TAMANHO DO SELO, que só se sabe depois de desenhar. Até a primeira
    // medida vale o mínimo — o tamanho exato do selo de um dígito, o caso comum —, então o primeiro
    // quadro já sai certo para ele, e o de "99+" se acerta na medida seguinte. Sem `translate` em
    // porcentagem de propósito: ele só existe na Nova Arquitetura, e o pacote aceita RN desde 0.76.
    const [medida, setMedida] = React.useState(null);
    const aoMedir = anchor ? (e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (!medida || medida.w !== w || medida.h !== h)
            setMedida({ w, h });
    } : undefined;
    const selo = (_jsxs(View, { onLayout: aoMedir, style: [
            s.selo, s[`selo_${size}`], pele,
            fit === "content" && !anchor && s.justo,
            anchor && s.sobreposto,
            anchor && { minWidth: minimo, minHeight: minimo },
            anchor && posicaoDaAncora(anchor, folga, medida?.w ?? minimo, medida?.h ?? minimo),
            soPonto && { width: ladoDoPonto, height: ladoDoPonto, paddingHorizontal: 0, paddingVertical: 0,
                backgroundColor: acento, borderWidth: anchor ? t.size.borderWidth : 0 },
            style,
        ], ...(anchor ? { accessibilityElementsHidden: true,
            importantForAccessibility: "no-hide-descendants" } : rest), children: [dot && !soPonto && _jsx(View, { style: [s.ponto, { backgroundColor: corDoTexto }] }), !soPonto && leading, typeof miolo === "string" || typeof miolo === "number"
                ? _jsx(Text, { weight: 500, style: [LETRA_DO_SELO(t, size),
                        // Preso, a linha cabe no mínimo menos o fio: a letra fica no meio do círculo de 16.
                        anchor && { lineHeight: Math.min(LETRA_DO_SELO(t, size).lineHeight, minimo - 2 * t.size.borderWidth) },
                        { color: corDoTexto }], children: miolo })
                : miolo, !soPonto && trailing] }));
    if (!anchor)
        return selo;
    const escondido = invisible || (count === 0 && !showZero) || (miolo == null && !dot);
    return _jsxs(View, { style: s.ancora, ...rest, children: [children, !escondido && selo] });
}
const CATEGORIAS = new Set(["red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"]);
const ehCategoria = (tom) => CATEGORIAS.has(tom);
/**
 * O acento e o fundo suave de cada categoria — os tokens `--category-*` e `--category-*-bg`, os
 * mesmos da web. Ficam AQUI, e não no `acentoDoTom`, de propósito: a moldura do ícone (R-15, R-18)
 * usa aquele mapa, e as categorias são do selo; levá-las para lá abriria a `Timeline` a cores que
 * a da web não tem.
 */
const coresDaCategoria = (t) => ({
    red: [t.color.categoryRed, t.color.categoryRedBg],
    orange: [t.color.categoryOrange, t.color.categoryOrangeBg],
    green: [t.color.categoryGreen, t.color.categoryGreenBg],
    teal: [t.color.categoryTeal, t.color.categoryTealBg],
    cyan: [t.color.categoryCyan, t.color.categoryCyanBg],
    blue: [t.color.categoryBlue, t.color.categoryBlueBg],
    violet: [t.color.categoryViolet, t.color.categoryVioletBg],
    pink: [t.color.categoryPink, t.color.categoryPinkBg],
});
/** O mínimo do selo preso, da referência principal: 16 no `xs` e no `sm`, 28 no `md`, 32 no `lg`. */
const MINIMO_PRESO = (t, size) => size === "lg" ? t.size.space8 : size === "md" ? t.size.space7 : t.size.space4;
/**
 * O canto, do jeito da referência principal (R-24, 08/10/2026): o selo encosta no canto do alvo e
 * sai 25% do PRÓPRIO tamanho para fora — três quartos dele ficam por cima do alvo. A regra é a mesma
 * para alvo redondo e quadrado, como lá.
 *
 * Antes era um `-8` fixo, sem token, a partir do canto da ÁREA DE TOQUE: o selo do sino caía 4,5
 * para fora do círculo (medido no `react-native-web`). A web da Aurea centra o selo no canto e o
 * puxa 14% para dentro em alvo redondo; no sino de 36, as duas contas caem a cerca de 1 ponto uma
 * da outra. `folga` é o quanto a área de toque passa do desenho (0 fora do `IconButton`).
 */
function posicaoDaAncora(anchor, folga, w, h) {
    const fora = 0.25;
    const emCima = anchor === "top-end" || anchor === "top-start";
    const noFim = anchor === "top-end" || anchor === "bottom-end";
    return {
        ...(emCima ? { top: folga } : { bottom: folga }),
        ...(noFim ? { right: folga } : { left: folga }),
        transform: [{ translateX: (noFim ? 1 : -1) * w * fora }, { translateY: (emCima ? -1 : 1) * h * fora }],
    };
}
/**
 * Um ponto e uma palavra.
 *
 * ⚠ **`offline` não é uma cor a menos — é um ponto DIFERENTE.** No CSS ele é vazado: fundo
 * transparente com anel interno (`aurea.css:1071`). É o que separa "está fora" de "está bem",
 * para quem não distingue as duas cores.
 */
export function Status({ variant, state, children, style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const strings = useAureaStrings();
    // Mesma linha do `feedback-client.tsx:34`: `offline` é ele mesmo; o resto vira a gravidade.
    const v = variant
        ?? (state ? (state === "offline" ? "offline" : gravidadeDoEstado(state)) : "neutral");
    const cor = v === "online" || v === "success" ? (t.color.success400 ?? t.color.success)
        : v === "away" || v === "warning" ? (t.color.warning400 ?? t.color.warning)
            : v === "busy" || v === "danger" ? (t.color.danger400 ?? t.color.destructive)
                : v === "info" ? (t.color.info400 ?? t.color.info)
                    : v === "offline" ? t.color.subtleForeground
                        : t.color.mutedForeground;
    const rotulo = children ?? (state ? strings.universalState[state] : null);
    return (_jsxs(View, { style: [s.estado, style], ...rest, children: [_jsx(View, { style: [
                    s.pontoDeEstado,
                    v === "offline"
                        // Vazado: sem preenchimento, com o anel de 2 por dentro. `borderWidth` faz o que o
                        // `inset 0 0 0 2px` do CSS faz.
                        ? { backgroundColor: "transparent", borderWidth: 2, borderColor: cor }
                        : { backgroundColor: cor },
                ] }), typeof rotulo === "string"
                ? _jsx(Text, { size: "sm", children: rotulo })
                : rotulo] }));
}
/**
 * O retrato redondo.
 *
 * ⚠ **A queda para o `fallback` é a parte que importa, e ela é a mesma da web:** se a imagem
 * falhar em carregar, o componente troca para o conteúdo alternativo — e volta a tentar quando a
 * `source` muda. Sem isso, uma URL quebrada deixa um buraco cinza permanente na lista.
 */
export function Avatar({ source, alt, fallback, size = "md", style, testID }) {
    const t = useAureaTokens();
    const s = folha(t);
    const [falhou, setFalhou] = React.useState(false);
    // A `source` nova merece uma tentativa nova — é o `useEffect([src])` do `identity-client.tsx`.
    React.useEffect(() => { setFalhou(false); }, [source]);
    const lado = size === "sm" ? t.size.controlHSm : size === "lg" ? t.size.controlHLg : t.size.controlHMd;
    const fonte = typeof source === "string" ? { uri: source } : source;
    return (_jsx(View, { testID: testID, accessible: !!alt, accessibilityRole: alt ? "image" : undefined, accessibilityLabel: alt || undefined, style: [s.avatar, { width: lado, height: lado }, style], children: fonte && !falhou
            ? _jsx(Image, { source: fonte, style: s.imagem, onError: () => setFalhou(true) })
            : typeof fallback === "string"
                ? _jsx(Text, { size: size === "sm" ? "xs" : "md", weight: 700, children: fallback })
                : fallback }));
}
const TOM_DA_DIRECAO = { up: "success", down: "danger", flat: "neutral" };
const PALAVRA_DA_DIRECAO = { up: "Up", down: "Down", flat: "No change" };
const GLIFO_DA_DIRECAO = { up: "trend-up", down: "trend-down", flat: "minus" };
const comoTexto = (n) => typeof n === "string" || typeof n === "number" ? String(n) : null;
/**
 * Um número com nome. **É um `Card`** — medido em `markup.tsx:105`, e não no CSS, que só mostra
 * a coluna. Com `variant="plain"`, é só a coluna.
 *
 * A ficha da web declara `role="group"`, e **o React Native não tem esse papel** — medido na lista
 * de `accessibilityRole`, que vai de `button` a `toolbar` e não inclui `group`. O que ele tem é
 * `accessible`, e ele faz exatamente o que se queria do `group`: o nó inteiro vira UM elemento de
 * acessibilidade, e o leitor anuncia as três linhas juntas em vez de como três textos soltos.
 *
 * Inventar `accessibilityRole="summary"` porque o nome parece próximo seria pior que não ter papel:
 * `summary` tem significado próprio (o resumo de um bloco expansível) e diria uma coisa errada.
 *
 * Com `direction`, o nome do nó é escrito aqui (rótulo, número, palavra e tendência), porque a seta
 * é desenho e não tem texto para o leitor juntar — a web resolve com o `.sr-only`, que o nativo não
 * tem. Só quando as partes são texto; com nó próprio, o app dá o `accessibilityLabel`.
 *
 * O número em `3xl` e a tendência em `sm` desde a `0.26.0`: os mesmos da web (`0.24.1`).
 */
export function KPI({ label, value, trend, direction, tone, directionLabel, variant = "card", style, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const tom = direction ? (tone ?? TOM_DA_DIRECAO[direction]) : undefined;
    const cor = tom === "success" ? (t.color.success400 ?? t.color.success)
        : tom === "danger" ? (t.color.danger400 ?? t.color.destructive)
            : t.color.mutedForeground;
    const palavra = direction ? (directionLabel ?? PALAVRA_DA_DIRECAO[direction]) : undefined;
    const temTendencia = trend != null && trend !== false && trend !== "";
    const textoDaTendencia = typeof trend === "string" || typeof trend === "number"
        ? _jsx(Text, { size: "sm", tone: direction ? undefined : "muted", style: direction ? { color: cor } : undefined, children: trend })
        : trend;
    const partes = [comoTexto(label), comoTexto(value), palavra ?? "", temTendencia ? comoTexto(trend) : ""];
    const nome = direction && partes.every((p) => p !== null) ? partes.filter(Boolean).join(", ") : undefined;
    const Caixa = variant === "plain" ? View : Card;
    return (_jsxs(Caixa, { style: [s.kpi, style], accessible: true, accessibilityLabel: nome, ...rest, children: [typeof label === "string" ? _jsx(Text, { size: "sm", tone: "muted", children: label }) : label, typeof value === "string" || typeof value === "number"
                ? _jsx(Text, { size: "3xl", weight: 700, numeric: true, children: value }) : value, direction
                ? _jsxs(View, { style: s.tendencia, children: [_jsx(View, { style: s.seta, children: _jsx(Icon, { name: GLIFO_DA_DIRECAO[direction], size: "sm", color: cor }) }), temTendencia && textoDaTendencia] })
                : temTendencia && textoDaTendencia] }));
}
