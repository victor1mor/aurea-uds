import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomNavSpace } from "./barranav.js";
import { criarFolha } from "./estilos.js";
import { useAureaTokens } from "./theme.js";
const folha = criarFolha((t) => ({
    raiz: { flex: 1 },
    // Três superfícies e não a lista inteira de tokens: uma tela é fundo de página, painel ou
    // painel elevado. `surfaceInset` e `card` são de componente, não de tela.
    fundo_background: { backgroundColor: t.color.background },
    fundo_surface1: { backgroundColor: t.color.surface1 },
    fundo_surface2: { backgroundColor: t.color.surface2 },
    // `--space-4` é a mesma medida que o `Stack` usa entre filhos: a margem da tela e o ritmo do
    // conteúdo passam a ser o mesmo número, que é o que faz a página parecer alinhada.
    respiro: { padding: t.size.space4 },
    // Sem isto, conteúdo curto não ocupa a altura e nada consegue se centralizar na tela.
    conteudo: { flexGrow: 1 },
    // O rodapé fixo (R-06): o mesmo `respiro`, e só o de cima quando a raiz já recua. O
    // `marginTop: "auto"` é o que o cola no pé quando a tela não rola e o conteúdo é curto; com
    // `scroll` ele não muda nada, porque o rolador já ocupa o resto.
    rodape: { marginTop: "auto", padding: t.size.space4 },
    rodapeNoRespiro: { marginTop: "auto", paddingTop: t.size.space4 },
}));
/**
 * As quatro. **Não é excesso de zelo:** em paisagem o entalhe fica à ESQUERDA ou à DIREITA, e a
 * barra de gestos do Android mora embaixo. Uma tela que só protege o topo quebra ao girar.
 */
const TODAS_AS_BORDAS = ["top", "right", "bottom", "left"];
/**
 * A casca de uma tela: preenche, pinta com o tema, e afasta do entalhe e da barra de gestos.
 *
 * ```tsx
 * <Screen scroll>
 *   <Text size="xl" weight={600}>Painel</Text>
 *   <Card>…</Card>
 * </Screen>
 * ```
 *
 * ⚠ **`scroll` muda ONDE o padding cai, e a diferença é visível.** Sem ele, o padding é da raiz.
 * Com ele, o padding vai para o `contentContainerStyle` — que é o certo, porque padding no
 * `ScrollView` em si recorta a área rolável e deixa a barra de rolagem para dentro.
 *
 * ⚠ **Não precisa de `SafeAreaProvider` acima.** O `SafeAreaView` da biblioteca é uma view
 * nativa e lê o inset do sistema sozinha (medido no fonte da 5.9.1: ela não consome contexto
 * nenhum). Quem exige o provider são os HOOKS — e quem usa `react-navigation` já o tem.
 */
export function Screen({ edges = TODAS_AS_BORDAS, padded = true, scroll = false, background = "background", onRefresh, refreshing, footer, style, children, ...rest }) {
    const t = useAureaTokens();
    const s = folha(t);
    const fundo = s[`fundo_${background}`];
    // 🔴 O ESPAÇO DA BARRA DE ABAS, quando ela flutua por cima desta tela — ver `barranav.tsx`.
    // **Zero** fora de um `BottomNavProvider`, que é o caso de toda tela cheia: sem abas, nada muda.
    const respiroDaBarra = useBottomNavSpace();
    return (_jsxs(SafeAreaView, { style: [s.raiz, fundo, !scroll && padded && s.respiro, style], edges: edges, ...rest, children: [scroll ? (_jsx(ScrollView, { style: s.raiz, 
                // ⚠ O respiro da barra SOMA ao do tema em vez de substituí-lo: escrever
                // `paddingBottom` depois de `s.respiro` apagaria os 16 do tema e colaria o último
                // item na pílula. A conta é explícita porque a folha não soma sozinha.
                contentContainerStyle: [
                    s.conteudo, padded && s.respiro,
                    // Com rodapé, quem sobe acima da barra de abas é ELE; a rolagem termina em cima dele.
                    respiroDaBarra > 0 && footer == null
                        && { paddingBottom: (padded ? t.size.space4 : 0) + respiroDaBarra },
                ], 
                // A rosca do sistema é a única aparência da plataforma que a Aurea aceita aqui, e a
                // razão é que ela NÃO É desenho nosso: é o gesto do sistema operacional, com a física
                // que a pessoa já conhece. O que dá para pintar, pintamos — a cor é do tema.
                refreshControl: onRefresh ? (_jsx(RefreshControl, { refreshing: !!refreshing, onRefresh: onRefresh, tintColor: t.color.primary, colors: [t.color.primary], progressBackgroundColor: t.color.card })) : undefined, 
                // Sem isto, tocar um botão com o teclado aberto exige DOIS toques: o primeiro só
                // fecha o teclado. É um defeito conhecido do RN, e a tela é o lugar certo de absorvê-lo
                // — o Lote 4 é todo formulário.
                keyboardShouldPersistTaps: "handled", children: children })) : (children), footer != null && (_jsx(Rodape, { dentroDoRespiro: !scroll && padded, pegaABorda: edges.includes("bottom"), respiroDaBarra: respiroDaBarra, children: footer }))] }));
}
/**
 * O rodapé da `Screen`. Três contas, cada uma com a sua razão:
 *
 * - **o recuo:** `space4`, o `respiro` da própria tela. Sem `scroll` e com `padded`, a raiz já
 *   recua 16 dos quatro lados, então o rodapé só afasta do conteúdo de cima;
 * - **a barra de abas:** dentro de um `BottomNavProvider` ela flutua por cima; o rodapé sobe o
 *   número que ela informa, que já inclui a área do sistema;
 * - **a área do sistema:** se a raiz pega a borda de baixo, ela já soma o inset; se não pega, o
 *   rodapé pega sozinho, com a mesma `SafeAreaView`.
 */
function Rodape({ dentroDoRespiro, pegaABorda, respiroDaBarra, children }) {
    const t = useAureaTokens();
    const s = folha(t);
    const recuo = [
        dentroDoRespiro ? s.rodapeNoRespiro : s.rodape,
        respiroDaBarra > 0
            && { paddingBottom: (dentroDoRespiro ? 0 : t.size.space4) + respiroDaBarra },
    ];
    // Com a barra de abas, o número dela já traz a área do sistema: pegar a borda de novo somaria
    // o inset duas vezes.
    if (pegaABorda || respiroDaBarra > 0)
        return _jsx(View, { style: recuo, children: children });
    return _jsx(SafeAreaView, { edges: ["bottom"], style: recuo, children: children });
}
