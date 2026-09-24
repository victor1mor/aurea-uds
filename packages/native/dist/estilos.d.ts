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
export {};
