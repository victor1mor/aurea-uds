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
export declare const canto: (raio: number, curva?: "continuous" | "circular") => {
    readonly borderRadius: number;
    readonly borderCurve: "circular" | "continuous";
};
/** Os dois cantos de CIMA — a folha que sobe de baixo (`BottomSheet`, a lista do `Select`). */
export declare const cantosDeCima: (raio: number) => {
    readonly borderTopLeftRadius: number;
    readonly borderTopRightRadius: number;
    readonly borderCurve: "continuous";
};
/**
 * A PELE DO CARTÃO — o raio 22, o recheio, o fundo e a borda do `Card`; e a do cartão ESCOLHIDO
 * (`variant="selected"`): a borda do contorno da marca sobre o fundo `surface2`.
 *
 * ⚠ **Moravam dentro do `layout.tsx` e mudaram de casa em 06/10/2026**, quando o cartão de escolha
 * (CHK-01, `RadioGroup variant="card"`) passou a precisar da mesma pele: um cartão escolhido tem de
 * parecer o cartão escolhido que o app já usa, e não um parecido. Duas cópias dos números é o
 * defeito que o `CLAUDE.md` nomeia.
 */
export declare const peleDoCartao: (t: AureaTokens) => {
    borderRadius: number;
    borderCurve: "circular" | "continuous";
    padding: number;
    backgroundColor: string;
    borderWidth: number;
    borderColor: string;
};
export declare const peleDoCartaoEscolhido: (t: AureaTokens) => {
    borderColor: string;
    backgroundColor: string;
};
/** O tom de cor com significado — o vocabulário do `Badge` (`AureaBadgeTone`). */
export type TomDeCor = "neutral" | "primary" | "info" | "success" | "warning" | "danger";
/**
 * A cor FORTE de um tom: o texto do selo, o ícone da moldura.
 *
 * ⚠ **Morava dentro do `Badge` e mudou de casa em 02/10/2026**, quando a moldura do ícone (R-15 e
 * R-18) passou a precisar da mesma cor por tom. Duas cópias do mapa é o defeito que o `CLAUDE.md`
 * nomeia — e o dia em que um tom novo entra numa só.
 */
export declare const acentoDoTom: (t: AureaTokens, tom: TomDeCor) => string;
/**
 * O FUNDO CHEIO de um tom de estado e a letra em cima dele — o par do botão cheio (ADR-0061, 0.27.0):
 * o selo cheio é o botão cheio do mesmo tom. `primary` e `neutral` não têm o par: `undefined`, e
 * quem chama enche com o acento, como antes.
 */
export declare const preenchimentoDoTom: (t: AureaTokens, tom: TomDeCor) => [string, string] | undefined;
/** O fundo SUAVE de um tom (`--<tom>-bg`). `primary` e `neutral` não têm token: `undefined`. */
export declare const fundoDoTom: (t: AureaTokens, tom: TomDeCor) => string | undefined;
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
export declare const fioDoEscolhido: (t: AureaTokens) => ViewStyle;
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
