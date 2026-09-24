import * as React from "react";
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
export declare function BottomNavProvider({ children }: {
    children?: React.ReactNode;
}): React.JSX.Element;
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
export declare function useBottomNavSpace(): number;
/**
 * Interno: como o `BottomNav` conta a própria altura. Devolve `null` fora de um provedor, e nesse
 * caso a barra não mede nada — ninguém está ouvindo.
 */
export declare function useAnotarBottomNav(): ((n: number) => void) | null;
