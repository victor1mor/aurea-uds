// Aurea nativo — a fábrica de folhas de estilo, memoizada por (tema, densidade).
//
// EXISTE POR UMA MEDIÇÃO, não por gosto. O smoke test do Lote 0 rodou num Android em 03/09/2026
// e a troca de tema custou **182 ms** e **161 ms** sobre 40 linhas. Passou o critério de 200 ms,
// mas passou perto — e três coisas inflavam o número, uma delas de propósito: **o app chamava
// `StyleSheet.create` a cada render**, para medir o pior caso.
//
// A ADR-0037 registrou a lição em uma frase: *"os componentes do Lote 1 não têm essa desculpa"*.
// Este arquivo é essa frase virando código.
//
// COMO FUNCIONA, e por que não é só um `useMemo`: os estilos dependem do par (tema, densidade),
// que tem **seis** combinações e muda raramente. Um `useMemo` por componente recalcularia a folha
// uma vez por INSTÂNCIA; aqui a folha é calculada uma vez por COMBINAÇÃO e compartilhada por
// todas as instâncias daquele componente. Vinte botões na tela produzem uma folha, não vinte.
//
// O cache não tem limite de tamanho, e isso é seguro por construção: a chave é
// `${tema}:${densidade}`, então ele tem **teto de seis entradas por componente**. Não é cache de
// dados do usuário; é uma tabela de seis linhas.
import { StyleSheet } from "react-native";
export function criarFolha(descrever) {
    const cache = new Map();
    return (t) => {
        const chave = `${t.theme}:${t.density}`;
        let folha = cache.get(chave);
        if (!folha) {
            folha = StyleSheet.create(descrever(t));
            cache.set(chave, folha);
        }
        return folha;
    };
}
/**
 * O `color-mix(in srgb, X 12%, transparent)` do CSS, traduzido.
 *
 * **Não há `color-mix` no React Native** — medido no interpretador de cor, o mesmo que a ADR-0027
 * já tinha atravessado a pé. O que existe é hex de OITO dígitos, e `#RRGGBBAA` com o alfa certo
 * dá o mesmo pixel sobre um fundo opaco. Cai para a cor crua se ela não for hex de seis, para
 * nunca produzir uma string que o RN descarte em silêncio.
 *
 * ⚠ **Ele morava dentro do `navigation.tsx` e mudou de casa em 17/09/2026**, quando o
 * `SegmentedControl` passou a precisar do mesmo cálculo para o fio do escolhido. Copiar a função
 * para o segundo arquivo é exatamente o defeito que o `CLAUDE.md` nomeia — *correção local é
 * proibida sem responder "quem mais tem esse problema?"*.
 *
 * ✅ **Sai pela porta da frente do pacote desde 24/09/2026 (R-07).** Até ali era ferramenta de
 * dentro, e o app que precisava de um fundo translúcido sobre a cor do tema (o círculo atrás de
 * um ícone) não tinha como escrevê-lo sem número à mão. O `check 39` cobra o teste dele.
 */
export const comOpacidade = (cor, pct) => /^#[0-9a-fA-F]{6}$/.test(cor)
    ? cor + Math.round(Math.max(0, Math.min(1, pct)) * 255).toString(16).padStart(2, "0")
    : cor;
/**
 * SEM LINHA (16/10/2026), a sugestão: o fundo TRANSLÚCIDO da cor do texto, que se separa de qualquer fundo atrás —
 * como o trilho desligado do switch da referência (o texto a 20%). Uma cor fixa acaba igual a alguma superfície, e foi
 * assim que as peças sumiram quando a linha saiu. Nível 1 = 6% (superfície de dentro), 2 = 10% (campo, botão de
 * contorno), 3 = 20% (marca do checkbox e do rádio, trilho do switch).
 */
export const preenchimento = (t, nivel) => comOpacidade(t.color.foreground, nivel === 1 ? 0.06 : nivel === 2 ? 0.1 : 0.2);
/**
 * O fundo do CAMPO. No CLARO, a cor do cartão com a sombra leve (`shadowSm`, a mesma da referência) — EM TODO LUGAR,
 * também dentro de uma superfície branca (ADR-0083, 26/10/2026: o Victor, "campos brancos e sem borda, na página e
 * dentro dos cartões"; dentro do cartão branco, quem separa o campo é a sombra). No ESCURO, o cinza de sempre
 * (`preenchimento(t, 2)`), sem sombra. Era o cinza dentro da superfície (ADR-0078): o `naSuperficie` continua no sinal
 * (o `Card`, a janela e a folha ainda ligam o contexto de `superficie.tsx`), sem mudar a cor.
 * Com "aumentar contraste" no sistema (`useMaisContraste`, em `contraste.ts`), o campo ganha o contorno de 3:1
 * (`inputStrong`): a única linha que essa preferência acende, como na web (ADR-0083). Quem chama põe este estilo logo
 * depois da pele do campo, antes dos estados (inválido, foco, desativado), que continuam vencendo.
 */
export const fundoDeCampo = (t, _naSuperficie, maisContraste = false) => ({
    ...(t.theme === "light"
        ? { backgroundColor: t.color.card, boxShadow: [...t.shadowLayers.shadowSm] }
        : { backgroundColor: preenchimento(t, 2) }),
    ...(maisContraste ? { borderColor: t.color.inputStrong } : null),
});
/**
 * A cor do FOCO do campo (no nativo, o foco é a borda): o amarelo da marca, nos dois temas — uma linha só, como na web
 * (ADR-0083, 26/10/2026). Com "aumentar contraste" no sistema, volta ao `focusStrong` (o grafite no claro).
 */
export const focoDoCampo = (t, maisContraste = false) => maisContraste ? t.color.focusStrong : t.color.primary;
/**
 * A marca DENTRO de um controle ligado — a bolinha do `Switch`, a alça do `Slider`, o visto do `Checkbox` e o ponto do
 * rádio: branca (ADR-0083, 26/10/2026, o Victor: "como na referência"); com "aumentar contraste" no sistema, a tinta.
 */
export const marcaDoControle = (t, branca, maisContraste = false) => maisContraste ? t.color.brandYellowInk : branca;
/**
 * A mesma mistura, OPACA: a cor da frente a `pct` sobre a do fundo. Para o que tem algo passando POR TRÁS (o traço dos
 * passos) ou cobre outra peça (as fotos sobrepostas) — translúcido, o que está atrás aparece. Hex de seis, como o
 * `comOpacidade`; fora disso devolve a cor da frente.
 */
export const misturaOpaca = (frente, fundo, pct) => {
    const hex = /^#([0-9a-fA-F]{6})$/;
    const a = hex.exec(frente), b = hex.exec(fundo);
    if (!a || !b)
        return frente;
    const canal = (h, i) => parseInt(h.slice(i, i + 2), 16);
    return "#" + [0, 2, 4].map((i) => Math.round(canal(a[1], i) * pct + canal(b[1], i) * (1 - pct))
        .toString(16).padStart(2, "0")).join("");
};
// A mistura no OKLAB, a do `color-mix(in oklab, …)` da web (bloco 1, 23/10/2026). O `misturaOpaca` acima mistura canal
// a canal, e a cor do meio sai outra: para a cor do escolhido, `#806314` por canal contra `#79602f` no oklab — este o mais
// perto do que o navegador pinta na web (medido). Hex de seis; fora disso devolve a cor da frente.
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const tela = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const paraOklab = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const doOklab = ([L, a, b]) => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return "#" + [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
        .map((c) => Math.round(Math.min(1, Math.max(0, tela(c))) * 255).toString(16).padStart(2, "0")).join("");
};
export const misturaNoOklab = (frente, fundo, pct) => {
    const hex = /^#[0-9a-fA-F]{6}$/;
    if (!hex.test(frente) || !hex.test(fundo))
        return frente;
    const a = paraOklab(frente), b = paraOklab(fundo);
    return doOklab([0, 1, 2].map((i) => a[i] * pct + b[i] * (1 - pct)));
};
/**
 * A COR DO ESCOLHIDO, a mesma da web: no claro, o GRAFITE do texto (ADR-0083, 26/10/2026 — o amarelo não vira letra no
 * claro; o fio amarelo de baixo marca o escolhido); no escuro, o destaque (o amarelo). Era a marca a 45% sobre o texto
 * (o "marrom", bloco 1, 23/10/2026), e antes o azul.
 */
export const corDoEscolhido = (t) => t.theme === "light" ? t.color.foreground : t.color.primaryEmphasis;
/**
 * A LETRA DO AMARELO, a do texto com `tone="primary"`: o destaque (`primaryEmphasis`) — no claro, o grafite do texto; no
 * escuro, o amarelo da marca, que já se lê (ADR-0083, 26/10/2026). Era, no claro, o amarelo misturado com o texto do
 * jeito da referência (80/150, decisão de 24/10/2026), que dava um marrom.
 */
export const letraDoAmarelo = (t) => t.theme === "light" ? t.color.primaryEmphasis : t.color.primary;
// ── AS CORES, passo B — os estilos novos (ADR-0084, 27/10/2026) ──────────────────────────────────────────────────────
// Os mesmos estilos da web (`aurea.css`, a seção do passo B), escritos com os tokens: as cores saem do tema, e não de hex
// na mão. Cada função devolve a pele de um estilo, ou `null` no padrão (a peça desenha o que sempre desenhou).
/**
 * O ARO dos estilos de aro (o segmento `ring`, o item `ring`, o `white-ring` e o `bar-ring` da barra de baixo, e o ponto
 * `ring` da linha do tempo): 1,5 da largura de borda (2 no ponto), na cor pedida — uma SOMBRA POR DENTRO, como o
 * `inset 0 0 0 …` da web, e não borda: no React Native a borda ocupa lugar e a peça mudaria de medida ao ser escolhida. A
 * sombra por dentro existe desde a 0.76 (a versão mínima do pacote), e o `react-native-web` a traduz.
 * É linha, e por isso exceção nomeada à ADR-0072 (pela ADR-0084): o aro é o desenho que dá nome ao estilo, e só existe
 * quando o app o escolhe. Quem cobra que ele não escape daqui: `sem-linha.test.tsx`.
 */
export const aroDoEstilo = (t, cor, vezes = 1.5) => ({ offsetX: 0, offsetY: 0, blurRadius: 0, spreadDistance: vezes * t.size.borderWidth, color: cor, inset: true });
/**
 * A MARCA do estilo escolhido, para o navegador (`react-native-web`): o `dataSet` vira o mesmo atributo da web
 * (`data-current-style`, `data-segment-style`, `data-timeline-style`), e a varredura do site reconhece o estilo de aro como
 * na web. No aparelho o `dataSet` não existe e é ignorado — como a marca do cartão de contorno (`layout.tsx`).
 */
export const marcaDoEstilo = (nome, valor) => valor ? { dataSet: { [nome]: valor } } : {};
export const peleDoSegmento = (t, estilo) => {
    const neutra = { fundo: t.color.segment, letra: t.color.foreground, sombra: true, aro: null, ponto: false };
    switch (estilo) {
        case "neutral": return neutra;
        case "contrast": return { fundo: t.color.foreground, letra: t.color.background, sombra: false, aro: null, ponto: false };
        case "brand": return { fundo: t.color.primary, letra: t.color.primaryForeground, sombra: false, aro: null, ponto: false };
        case "ring": return { ...neutra, aro: t.color.primary };
        case "dot": return { ...neutra, ponto: true };
        default: return null;
    }
};
export const peleDoAtual = (t, estilo) => {
    const p = (fundo, letra, extra = {}) => ({ fundo, letra, aro: null, degrade: null, negrito: false, barra: false, ...extra });
    const nada = "transparent";
    switch (estilo) {
        case "neutral": return p(t.color.secondary, t.color.foreground);
        case "contrast": return p(t.color.foreground, t.color.background);
        case "brand": return p(t.color.primary, t.color.primaryForeground);
        case "ring": return p(nada, t.color.foreground, { aro: t.color.primary });
        case "plain": return p(nada, t.color.foreground, { negrito: true });
        case "brand-white": return p(t.color.primary, t.color.white);
        case "white-ring": return p(t.color.white, t.color.brandYellowInk, { aro: t.color.primary });
        case "brand-gradient": return p(t.color.primary, t.color.primaryForeground, { degrade: misturaNoOklab(t.color.primary, t.color.white, 0.3) });
        case "bar-ink": return p(t.color.primaryForeground, t.color.primary, { barra: true });
        case "bar-ring": return p(nada, t.color.primaryForeground, { aro: t.color.primaryForeground, barra: true });
        case "bar-plain": return p(nada, t.color.primaryForeground, { negrito: true, barra: true });
        case "bar-light": return p(misturaNoOklab(t.color.primary, t.color.white, 0.45), t.color.brandYellowInk, { barra: true });
        default: return null;
    }
};
/**
 * O fundo de uma pele: a cor sólida e, no `brand-gradient`, o degradê por cima — `backgroundImage` no RN que já o tem
 * estável e `experimental_backgroundImage` nas versões de 0.76 em diante; onde nenhum existe, fica o amarelo cheio.
 * A SEGUNDA exceção à ADR-0007 (pela ADR-0084): só aqui, e só neste estilo.
 */
export const fundoDaPele = (pele) => {
    if (!pele.degrade)
        return { backgroundColor: pele.fundo };
    const degrade = `linear-gradient(135deg, ${pele.fundo} 20%, ${pele.degrade})`;
    return { backgroundColor: pele.fundo, backgroundImage: degrade, experimental_backgroundImage: degrade };
};
export const peleDoPonto = (t, estilo, ultimo) => {
    switch (estilo) {
        case "ring": return { fundo: "transparent", aro: t.color.primary, halo: null };
        case "latest": return ultimo
            ? { fundo: t.color.primary, aro: null, halo: comOpacidade(t.color.primary, 0.28) }
            : { fundo: t.color.mutedForeground, aro: null, halo: null };
        case "contrast": return { fundo: t.color.foreground, aro: null, halo: null };
        default: return null;
    }
};
/**
 * 🍎 O CANTO DO iOS — HER-01, 06/10/2026: todo canto arredondado do nativo passa por aqui.
 *
 * `borderCurve: "continuous"` é o canto do iPhone: a curva entra no lado aos poucos, em vez de
 * começar de repente como um quarto de círculo. A referência o põe em 24 peças; a
 * Aurea, até aqui, em nenhuma. Pela doc do React Native (tipos do 0.87.1), ele só vale no **iOS
 * 13+**: o Android ignora, e o navegador também — o `react-native-web` 0.21 passa a propriedade
 * adiante e o CSS não a conhece, sem erro. **No Android do Victor nada muda; no iPhone, muda.**
 *
 * ⚠ **Raio escrito fora daqui é defeito.** O `native-canto-continuo.test.tsx` lê o fonte do pacote
 * e reprova `borderRadius` (ou um dos quatro cantos) escrito à mão — a regra *"quem mais tem esse
 * problema?"* virando trava, para a próxima peça não nascer com o canto do Android no iPhone.
 */
export const canto = (raio, curva = "continuous") => ({ borderRadius: raio, borderCurve: curva });
/** Os dois cantos de CIMA — a folha que sobe de baixo (`BottomSheet`, a lista do `Select`). */
export const cantosDeCima = (raio) => ({ borderTopLeftRadius: raio, borderTopRightRadius: raio, borderCurve: "continuous" });
/**
 * A PELE DO CARTÃO — o raio 22, o recheio, o fundo e a borda do `Card`; e a do cartão ESCOLHIDO
 * (`variant="selected"`): a borda do contorno da marca sobre o fundo `surface2`.
 *
 * ⚠ **Moravam dentro do `layout.tsx` e mudaram de casa em 06/10/2026**, quando o cartão de escolha
 * (CHK-01, `RadioGroup variant="card"`) passou a precisar da mesma pele: um cartão escolhido tem de
 * parecer o cartão escolhido que o app já usa, e não um parecido. Duas cópias dos números é o
 * defeito que o `CLAUDE.md` nomeia.
 */
export const peleDoCartao = (t) => ({
    ...canto(t.size.radiusCard),
    padding: t.size.cardPad,
    backgroundColor: t.color.card,
    borderWidth: t.size.borderWidth,
    borderColor: "transparent",
});
// Sem linha (16/10/2026): o escolhido era a linha da marca sobre o fundo de cima; sem linha, o aviso é o FUNDO, na cor
// da marca a 12% — o mesmo da web (`.card-selected`).
export const peleDoCartaoEscolhido = (t) => ({ borderColor: "transparent", backgroundColor: comOpacidade(t.color.primary, 0.12) });
/**
 * A cor FORTE de um tom: o texto do selo, o ícone da moldura.
 *
 * ⚠ **Morava dentro do `Badge` e mudou de casa em 02/10/2026**, quando a moldura do ícone (R-15 e
 * R-18) passou a precisar da mesma cor por tom. Duas cópias do mapa é o defeito que o `CLAUDE.md`
 * nomeia — e o dia em que um tom novo entra numa só.
 */
export const acentoDoTom = (t, tom) => tom === "primary" ? t.color.primaryEmphasis
    : tom === "info" ? t.color.info400 ?? t.color.info
        : tom === "success" ? t.color.success400 ?? t.color.success
            : tom === "warning" ? t.color.warning400 ?? t.color.warning
                : tom === "danger" ? t.color.danger400 ?? t.color.destructive
                    : t.color.secondaryForeground;
/**
 * A cor de LETRA (e de desenho sobre a tela) de um token de cor — ADR-0061. Os quatro tokens de
 * estado (`success`, `info`, `warning`, `destructive`) são o FUNDO cheio; quem escreve ou desenha
 * sobre a tela usa o par `-400` de cada tema. Qualquer outro token passa como está — e é por isso
 * que a lista é FECHADA: um `primary400` que nascesse amanhã não pode mudar o texto amarelo sem
 * ninguém pedir. Achado na 0.28.0: o `Text` com tom e a barra do `Progress` tinham ficado de fora.
 */
const PAR_DE_LETRA = {
    success: "success400", info: "info400", warning: "warning400", destructive: "danger400",
};
export const letraDoToken = (t, token) => (PAR_DE_LETRA[token] ? t.color[PAR_DE_LETRA[token]] : undefined) ?? t.color[token];
/**
 * O FUNDO CHEIO de um tom de estado e a letra em cima dele — o par do botão cheio (ADR-0061, 0.27.0):
 * o selo cheio é o botão cheio do mesmo tom. O `primary` enche com o PRIMÁRIO (o amarelo) e escreve com a
 * letra do botão amarelo (`primaryForeground`, a tinta cinza-escura). Até a ADR-0076 enchia com o acento,
 * que era o próprio amarelo nos dois temas; desde ela o acento do claro é o azul, e a tinta cinza no azul
 * mediria 1,99:1. O `neutral` não tem o par: `undefined`, e quem chama enche com o acento, como antes.
 */
export const preenchimentoDoTom = (t, tom) => tom === "primary" ? [t.color.primary, t.color.primaryForeground]
    : tom === "success" ? [t.color.success, t.color.successForeground]
        : tom === "warning" ? [t.color.warning, t.color.warningForeground]
            : tom === "info" ? [t.color.info, t.color.infoForeground]
                : tom === "danger" ? [t.color.destructive, t.color.destructiveForeground]
                    : undefined;
/** O fundo SUAVE de um tom (`--<tom>-bg`). `primary` e `neutral` não têm token: `undefined`. */
export const fundoDoTom = (t, tom) => tom === "info" ? t.color.infoBg
    : tom === "success" ? t.color.successBg
        : tom === "warning" ? t.color.warningBg
            : tom === "danger" ? t.color.dangerBg
                : undefined;
/**
 * 🔴 O FIO AMARELO DO ESCOLHIDO — o sinal único da casa para "este é o escolhido".
 *
 * O `aurea.css:1037-1039` põe este fio em TODOS os selecionados (`.is-selected`, botão alternado,
 * `.segmented button.active`, item ativo da lateral), e o comentário de lá diz por quê: *"Um
 * usuário aprende uma vez e reconhece em todo lugar (pedido do Victor, 24/07)."* Os três números
 * saem daquela linha, não daqui: altura 2 (fração de pixel borra), recuo 15 de cada lado
 * (`inset-inline:15px`), e o amarelo a 75% (cheio ele grita mais que o próprio rótulo).
 *
 * ⚠ **Morava dentro do `SegmentedControl` e mudou de casa em 01/10/2026**, quando a aba de
 * `<Tabs variant="secondary">` (R-12) passou a precisar do mesmo fio. Copiar os números para o
 * segundo arquivo é o defeito que o `CLAUDE.md` nomeia. Quem desenha o fio, desenha este.
 *
 * ⚠ Em peça estreita o recuo de 15 de cada lado zera a largura e o fio some — **e é o mesmo
 * comportamento da web**, onde `inset-inline:15px` numa caixa estreita não desenha nada.
 */
export const fioDoEscolhido = (t) => ({
    position: "absolute", left: 15, right: 15, bottom: 0, height: 2,
    ...canto(t.size.radiusFull), backgroundColor: comOpacidade(t.color.primary, 0.75),
});
/**
 * A reação ao TOQUE de tudo que é alvo inteiro — hoje o `Button`, o `IconButton` e o `Card` com
 * `onPress`. Os números são os do core: `.btn:active { transform:scale(.97); opacity:.9 }` e
 * `.btn:disabled { opacity:.45 }`.
 *
 * ⚠ **Mora aqui desde 24/09/2026 (R-04)**, quando o `Card` passou a responder ao toque e a
 * decisão foi *"a mesma reação do `Button`"*. Copiar os três números para o `layout.tsx` faria
 * duas peças dizerem a mesma coisa em dois lugares — e a primeira que mudasse deixaria a outra
 * para trás. Mesma razão do `comOpacidade` acima, e pelo mesmo motivo **não sai pela porta da
 * frente do pacote**.
 *
 * ⚠ **Não é animação:** não há transição, o alvo SALTA para 0,97 enquanto o dedo está em cima.
 * Por isso ele não consulta `useReduceMotion` — não há movimento para parar.
 */
export const REACAO_AO_TOQUE = {
    pressionado: { opacity: 0.9, transform: [{ scale: 0.97 }] },
    inerte: { opacity: 0.45 },
};
export function estadoAcessivel(estado, papel) {
    if (!estado)
        return { accessibilityState: undefined };
    const { pressed, ...resto } = estado;
    const doAparelho = pressed === undefined ? resto : { ...resto, checked: pressed };
    const escolhido = resto.selected;
    return {
        accessibilityState: doAparelho,
        "aria-checked": resto.checked,
        "aria-selected": papel ? undefined : escolhido,
        "aria-current": escolhido ? (papel === "link" ? "page" : papel === "step" ? "step" : undefined) : undefined,
        "aria-disabled": resto.disabled,
        "aria-expanded": resto.expanded,
        "aria-busy": resto.busy,
        "aria-pressed": pressed ?? (papel === "button" ? escolhido : undefined),
    };
}
