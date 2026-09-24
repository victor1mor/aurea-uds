import * as React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "./icon.js";
import { type AureaFieldSize } from "./inputs.js";
/** Uma linha do catálogo. **Mesma forma da web** (`ComboboxOption`), mais o `disabled` que o `Select` daqui já tinha. */
export interface AureaComboboxItem {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface ComboboxProps {
    /**
     * O que a folha mostra. **Com `onSearchChange`, é a lista JÁ BUSCADA** — a Aurea não filtra e
     * não guarda; ela desenha o que chegou.
     */
    items: AureaComboboxItem[];
    /**
     * O escolhido, como ITEM inteiro e não como `value` — mesma escolha da web, e ela tem razão
     * prática aqui: numa busca remota o item escolhido pode não estar mais em `items` (a pessoa
     * digitou outra coisa depois de escolher), e o gatilho ainda precisa saber que rótulo mostrar.
     * Guardar só o `value` deixaria o campo em branco no instante seguinte à escolha.
     */
    value?: AureaComboboxItem | null;
    onValueChange?: (v: AureaComboboxItem | null) => void;
    /**
     * O que foi digitado, já com espera. **A presença desta prop DESLIGA o filtro da Aurea** — é a
     * chave entre catálogo remoto e lista na mão, e é presença, não configuração.
     */
    onSearchChange?: (query: string) => void;
    /**
     * A espera antes de chamar `onSearchChange`, em ms. Padrão **250**.
     *
     * Não é enfeite de performance: sem ela, "cadeira" são sete chamadas ao servidor e seis
     * respostas descartadas — e a última a chegar pode não ser a última pedida. `0` desliga.
     */
    searchDelay?: number;
    /** Mostra o anel no lugar da lista. Use enquanto a busca remota não voltou. */
    loading?: boolean;
    /** Fim da lista alcançado — é por aqui que o catálogo remoto pagina. */
    onEndReached?: () => void;
    /** O que o gatilho mostra sem escolha. */
    placeholder?: string;
    /** O que o campo da folha mostra vazio. Sem ele, a frase `comboboxSearch` do provider. */
    searchPlaceholder?: string;
    /** O que a folha mostra sem resultado. Sem ele, a frase `comboboxEmpty` do provider. */
    empty?: React.ReactNode;
    /** Mostra o botão de limpar no gatilho quando há escolha. Padrão **true**. */
    clearable?: boolean;
    /**
     * Arrastar o cabeçalho da folha para baixo fecha. Ligado.
     *
     * ⚠ **É a ÚNICA saída por gesto no iOS** — lá não há botão VOLTAR, então sem isto restaria só
     * tocar no fundo. Mesmo gesto, mesmo limiar e mesma curva do `BottomSheet` do Lote 5.
     */
    draggable?: boolean;
    disabled?: boolean;
    size?: AureaFieldSize;
    /** O glifo da seta. Registre-o, ou passe `false`. */
    chevron?: IconName | false;
    /** O glifo da lupa no campo da folha. Registre-o, ou passe `false`. */
    searchIcon?: IconName | false;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * O campo em que se DIGITA para achar um item.
 *
 * ```tsx
 * // catálogo remoto — a Aurea não filtra, o app busca
 * <Field label="Item">
 *   <Combobox
 *     items={resultados}
 *     value={escolhido}
 *     onValueChange={setEscolhido}
 *     onSearchChange={buscarNoServidor}
 *     loading={buscando}
 *     onEndReached={proximaPagina}
 *   />
 * </Field>
 *
 * // lista na mão — a Aurea filtra
 * <Combobox items={unidades} value={unidade} onValueChange={setUnidade} />
 * ```
 *
 * ⚠ **O gatilho é `button`, não `combobox`** — e desta vez a razão é medida, não herdada do
 * `Select`: `role="combobox"` mapeia no Android (`roleDescription`) e **não mapeia no iOS**; e o
 * gatilho, de qualquer forma, não aceita digitação. Quem digita é o campo da folha, que leva
 * `role="search"` — esse mapeia nos dois. A tabela com arquivo e linha está no topo deste módulo.
 *
 * ⚠ **Ele não guarda a escolha nem o texto buscado.** `value` e o que se digita são do app, como
 * na web e pela mesma razão do achado I1 da auditoria: um componente com a sua própria cópia do
 * estado é a segunda fonte de verdade que ninguém sabe que existe.
 */
export declare function Combobox({ items, value, onValueChange, onSearchChange, searchDelay, loading, onEndReached, placeholder, searchPlaceholder, empty, clearable, draggable, disabled, size, chevron, searchIcon, style, testID, }: ComboboxProps): React.JSX.Element;
export interface SearchFieldProps {
    value?: string;
    onChangeText?: (v: string) => void;
    /** Chamado com o texto já esperado. Mesma espera do `Combobox`, e mesmo padrão de 250 ms. */
    onSearchChange?: (query: string) => void;
    searchDelay?: number;
    placeholder?: string;
    disabled?: boolean;
    size?: AureaFieldSize;
    /** O glifo da lupa. Padrão `search`; `false` tira. */
    icon?: IconName | false;
    /** Mostra o botão de limpar quando há texto. Padrão **true**. */
    clearable?: boolean;
    onSubmit?: () => void;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}
/**
 * A lupa + o campo, numa peça só.
 *
 * ⚠ **Não é o mesmo papel do `Combobox`, e confundir os dois é o erro comum:** o `Combobox`
 * ESCOLHE um item de um catálogo e devolve a escolha; este FILTRA o que já está na tela e devolve
 * texto. Um cadastro pede o primeiro; uma lista com muitas linhas pede o segundo.
 *
 * ⚠ **`role="search"`, e ele mapeia nos dois sistemas** — conferido no fonte do RN 0.87.1, com
 * arquivo e linha no topo deste módulo. É a diferença entre este componente e o `Combobox`, cujo
 * gatilho não pôde levar `combobox` porque o iOS não tem o trait.
 *
 * ⚠ **A borda mora no GRUPO, não no campo** — é o `.input-group` da web (`aurea.css:741`), e é o
 * que deixa lupa, campo e botão de limpar dentro de uma caixa só em vez de três.
 */
export declare function SearchField({ value, onChangeText, onSearchChange, searchDelay, placeholder, disabled, size, icon, clearable, onSubmit, style, testID, }: SearchFieldProps): React.JSX.Element;
