import { jsx as _jsx } from "react/jsx-runtime";
// Aurea nativo — quanto espaço a barra de abas ocupa, e quem precisa saber.
//
// 🔴 **ESTE MÓDULO EXISTE POR UM DEFEITO MEDIDO EM APARELHO, 19/09/2026**, e não por arquitetura.
// A variante `floating` do `BottomNav` passou a flutuar POR CIMA da tela — que é o que o nome
// dela sempre prometeu e o que a web já fazia (`.bottom-nav` é `position: sticky; bottom: 0`,
// `aurea.css:270`). Flutuar por cima tem um preço: **o fim da rolagem fica escondido atrás da
// pílula.** Alguém tem de reservar esse espaço, e a conta não pode cair no app.
//
// ⚠ **Por que a conta não pode ser do app:** ela é a altura da pílula (que depende da densidade,
// do tamanho da letra do sistema e de haver rótulo) mais as duas margens mais a folga do sistema
// — que muda entre um aparelho com três botões (≈48) e um com gesto (≈16). Deixar isso para o
// consumidor é pedir um número mágico que fica errado no primeiro aparelho diferente.
//
// ── POR QUE ELE MORA NUM ARQUIVO SÓ DELE ─────────────────────────────────────────────────────
// Quem MEDE é o `BottomNav` (`navigation.tsx`); quem LÊ é o `Screen` (`screen.tsx`). Os dois não
// se importam hoje, e pôr o contexto em qualquer um dos dois criaria um ciclo. É a mesma razão
// que fez a tinta da marca morar no `theme.tsx` — com a diferença de que ali os dois já
// importavam o `theme`, e aqui não há módulo comum. Então: um arquivo, sem dependência nenhuma
// além do React.
import * as React from "react";
const BarraCtx = React.createContext(null);
/**
 * Põe em volta do navegador de abas. O `BottomNav` mede a própria altura e conta para ele; o
 * `Screen` com `scroll` lê e reserva o espaço no fim do conteúdo, sozinho.
 *
 * ```tsx
 * <BottomNavProvider>
 *   <Tabs
 *     screenOptions={{headerShown: false}}
 *     tabBar={({state, navigation}) => (
 *       <BottomNav
 *         label="Menu principal"
 *         current={state.routes[state.index].name}
 *         items={rotas.map((r) => ({
 *           id: r.name, label: r.titulo, icon: r.icone,
 *           onPress: () => navigation.navigate(r.name),
 *         }))} />
 *     )} />
 * </BottomNavProvider>
 * ```
 *
 * ⚠ **O `BottomNav` vai SOLTO no `tabBar`, sem `View` em volta.** Um embrulho com fundo pinta uma
 * faixa atrás da pílula e acaba com a flutuação — era o que a documentação antiga mandava fazer,
 * e era o defeito.
 *
 * ⚠ **Fora daqui, `useBottomNavSpace()` devolve 0** e o `Screen` não reserva nada. É o que faz
 * uma tela cheia, sem abas, continuar exatamente como era.
 */
export function BottomNavProvider({ children }) {
    const [espaco, setEspaco] = React.useState(0);
    // `setEspaco` tem identidade estável, então isto só muda quando o número muda — e o número só
    // muda quando a barra muda de tamanho de verdade (rotação, letra do sistema, troca de variante).
    const valor = React.useMemo(() => ({ espaco, anotar: setEspaco }), [espaco]);
    return _jsx(BarraCtx.Provider, { value: valor, children: children });
}
/**
 * Quanto espaço a barra de abas ocupa no pé da tela, em pontos — pílula, margens e folga do
 * sistema somadas. **Zero** quando não há `BottomNavProvider` em volta, ou quando a barra é
 * `edge` (que fica no fluxo e já encurta a tela sozinha).
 *
 * O `Screen` com `scroll` já usa isto sozinho. Este gancho é para o resto: uma fileira de botões
 * presa no pé da tela, por exemplo, que precisa subir acima da pílula.
 *
 * ```tsx
 * const respiro = useBottomNavSpace();
 * <View style={{position: "absolute", left: 0, right: 0, bottom: respiro}}>
 *   <Button fullWidth>Salvar</Button>
 * </View>
 * ```
 */
export function useBottomNavSpace() {
    return React.useContext(BarraCtx)?.espaco ?? 0;
}
/**
 * Interno: como o `BottomNav` conta a própria altura. Devolve `null` fora de um provedor, e nesse
 * caso a barra não mede nada — ninguém está ouvindo.
 */
export function useAnotarBottomNav() {
    return React.useContext(BarraCtx)?.anotar ?? null;
}
