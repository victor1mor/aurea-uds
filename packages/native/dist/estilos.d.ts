import { type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import type { AureaTokens } from "./tokens.js";
/**
 * Recebe a função que descreve os estilos a partir dos tokens e devolve um leitor memoizado.
 *
 *     const folha = criarFolha((t) => ({caixa: {backgroundColor: t.color.card}}));
 *     // dentro do componente:
 *     const s = folha(tokens);   // mesma referência enquanto o par (tema, densidade) não mudar
 *
 * A identidade estável importa duas vezes: o `StyleSheet.create` não roda de novo, e o objeto de
 * estilo que chega ao `View` é o mesmo por referência — o que deixa a comparação de props do
 * React resolver no atalho em vez de descer na árvore.
 */
type NamedStyles<T> = {
    [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};
export declare function criarFolha<T extends NamedStyles<T> | NamedStyles<Record<string, unknown>>>(descrever: (t: AureaTokens) => T & NamedStyles<Record<string, unknown>>): (t: AureaTokens) => T;
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
export declare const comOpacidade: (cor: string, pct: number) => string;
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
export declare const REACAO_AO_TOQUE: {
    readonly pressionado: {
        readonly opacity: 0.9;
        readonly transform: readonly [{
            readonly scale: 0.97;
        }];
    };
    readonly inerte: {
        readonly opacity: 0.45;
    };
};
/** O estado que o leitor de tela anuncia. Mesmas chaves do `accessibilityState` do React Native. */
export type EstadoAcessivel = {
    checked?: boolean | "mixed";
    selected?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    busy?: boolean;
    /** O botão que liga e desliga. No aparelho vira `checked`; na web vira `aria-pressed`. */
    pressed?: boolean;
};
/**
 * O estado para o leitor de tela, dito **duas vezes**: em `accessibilityState` (o aparelho) e em
 * `aria-*` (a web).
 *
 * EXISTE POR UMA MEDIÇÃO (R-20, 01/10/2026). O `react-native-web` 0.21.3 **não lê**
 * `accessibilityState`: o `createDOMProps` dele só conhece `aria-checked`, `aria-selected`,
 * `aria-disabled`, `aria-expanded` e `aria-busy` (e os `accessibilityChecked` e afins, que estão
 * para sair). Com só o `accessibilityState`, o `RadioGroup` aberto no navegador saía sem
 * `aria-checked`, e o leitor de tela não dizia qual opção estava marcada.
 *
 * O React Native 0.87 aceita as mesmas `aria-*` e as junta ao `accessibilityState` com o mesmo
 * valor, então o aparelho não muda.
 *
 * ⚠ `pressed` (o botão de ligar e desligar) é a exceção: no aparelho continua `checked`, como
 * sempre foi; na web vira `aria-pressed`, porque `aria-checked` num `button` o leitor ignora. Os
 * tipos do React Native não têm `aria-pressed`; o aparelho descarta a propriedade que não conhece.
 *
 * Uso: `<Pressable {...estadoAcessivel({checked, disabled})} />`. Ferramenta de dentro: **não
 * sai pela porta da frente do pacote.**
 */
export declare function estadoAcessivel(estado: EstadoAcessivel | undefined): {
    accessibilityState: undefined;
    "aria-checked"?: undefined;
    "aria-selected"?: undefined;
    "aria-disabled"?: undefined;
    "aria-expanded"?: undefined;
    "aria-busy"?: undefined;
    "aria-pressed"?: undefined;
} | {
    accessibilityState: {
        checked?: boolean | "mixed";
        selected?: boolean;
        disabled?: boolean;
        expanded?: boolean;
        busy?: boolean;
    };
    "aria-checked": "mixed" | boolean | undefined;
    "aria-selected": boolean | undefined;
    "aria-disabled": boolean | undefined;
    "aria-expanded": boolean | undefined;
    "aria-busy": boolean | undefined;
    "aria-pressed": boolean | undefined;
};
export {};
