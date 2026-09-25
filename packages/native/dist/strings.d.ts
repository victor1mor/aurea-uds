/**
 * Os sete estados que qualquer coisa pode estar, e que não são "carregando" nem "deu erro".
 * Mesma lista e mesmos nomes do `@aurea-uds/react` (`pure.tsx`) — se divergirem, o mesmo app
 * mostra o mesmo estado com dois nomes.
 */
export type AureaUniversalState = "waiting_user" | "waiting_approval" | "waiting_dependency" | "offline" | "stale" | "partial" | "degraded";
export declare const AUREA_UNIVERSAL_STATES: readonly AureaUniversalState[];
/**
 * A gravidade de um estado universal, e a regra é a MESMA linha da web:
 * `state.startsWith("waiting_") ? "info" : "warning"`.
 *
 * Esperar não é problema — é o sistema funcionando e avisando. Estar `stale`, `partial`,
 * `degraded` ou `offline` é. Trocar isso faria a tela gritar onde deveria informar.
 */
export declare const gravidadeDoEstado: (estado: AureaUniversalState) => "info" | "warning";
export interface AureaStrings {
    /** O que o `Spinner` diz para o leitor de tela quando não recebe rótulo. */
    loading: string;
    /** O que o `DataState` mostra em `error` sem `message`. */
    dataError: string;
    /** O título que o `EmptyState` e o `DataState` usam sem `title`. */
    dataEmpty: string;
    /** O nome da barra inferior para o leitor de tela. */
    bottomNavLabel: string;
    /** Nome da fila de abas. Mesma chave da web (`pure.tsx`), traduzida de lá. */
    tabsLabel: string;
    /** O nome da trilha de passos. */
    stepperLabel: string;
    /** O que o `DatePicker` mostra quando não há data escolhida. */
    datePlaceholder: string;
    /** O que o `PhotoInput` diz quando a pessoa negou a câmera e o sistema não vai perguntar de novo. */
    cameraDenied: string;
    /** O botão que leva às configurações do app. */
    openSettings: string;
    /** O rótulo do botão que tira uma foto anexada. */
    photoRemove: string;
    /**
     * O botão que revela a senha no `PasswordField`, e o que a esconde de volta. Mesmos nomes da
     * web (`pure.tsx`), porque é a mesma peça com a mesma decisão: **o rótulo é que anuncia o
     * estado**, e não um `accessibilityState` de pressionado — com os dois, o leitor de tela diz
     * a mesma coisa duas vezes.
     */
    passwordShow: string;
    passwordHide: string;
    /** O botão de fechar do `Dialog` e do `Drawer`. Mesmo nome da web. */
    close: string;
    /** A saída do `ConfirmDialog`. Mesmo nome da web. */
    confirmCancel: string;
    /** A ação do `ConfirmDialog` quando o app não nomeia a sua. Mesmo nome da web. */
    confirmProceed: string;
    /** O botão que dispensa um aviso da pilha. Mesmo nome da web. */
    dismissNotification: string;
    /** O nome da `Table` sem `caption`. Mesmo nome — e mesmo recuo — da web. */
    tableLabel: string;
    /** O nome do `Chart` sem `label`. Mesmo nome da web. */
    chartLabel: string;
    /** O botão que soma um passo no `NumberField`. Mesmo nome da web. */
    increment: string;
    /** O botão que tira um passo no `NumberField`. Mesmo nome da web. */
    decrement: string;
    /** O que o `Combobox` mostra quando a busca não achou nada. Mesmo nome da web. */
    comboboxEmpty: string;
    /** O botão que desfaz a escolha do `Combobox`. Mesmo nome da web. */
    comboboxClear: string;
    /** O nome do `ThemeToggle` quando ele leva ao tema escuro, e ao claro. Mesmos nomes da web. */
    themeToDark: string;
    themeToLight: string;
    /** O que o `Combobox` anuncia enquanto a busca remota não voltou. Mesmo nome da web. */
    comboboxLoading: string;
    /**
     * O nome e o texto-guia do campo de busca DENTRO da folha do `Combobox`.
     *
     * ⚠ **Não existe na web**, e é uma das duas chaves deste pacote sem par lá — porque a anatomia
     * é outra: lá o `<input>` É o combobox e o texto-guia vem do consumidor; aqui a folha tem um
     * campo próprio, que precisa de nome mesmo quando ninguém passou um.
     */
    comboboxSearch: string;
    /**
     * O botão que apaga o que foi digitado numa busca — no `SearchField` e no campo da folha do
     * `Combobox`. **Não existe na web** pela mesma razão: lá o `type="search"` do navegador desenha
     * o "x" sozinho, e no React Native não há nada equivalente.
     */
    searchClear: string;
    /** O nome da grade de fotos da `Gallery`. Mesmo nome da web. */
    galleryLabel: string;
    /** A frase de cada estado universal. */
    universalState: Record<AureaUniversalState, string>;
}
/** Inglês, o idioma base do produto. É o que vale sem `strings` no provider. */
export declare const defaultStrings: AureaStrings;
/** Português, copiado do `ptBR` do `@aurea-uds/react` — não retraduzido. */
export declare const ptBR: AureaStrings;
