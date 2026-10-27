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
 * SEM LINHA (16/10/2026), a sugestão: o fundo TRANSLÚCIDO da cor do texto, que se separa de qualquer fundo atrás —
 * como o trilho desligado do switch da referência (o texto a 20%). Uma cor fixa acaba igual a alguma superfície, e foi
 * assim que as peças sumiram quando a linha saiu. Nível 1 = 6% (superfície de dentro), 2 = 10% (campo, botão de
 * contorno), 3 = 20% (marca do checkbox e do rádio, trilho do switch).
 */
export declare const preenchimento: (t: AureaTokens, nivel: 1 | 2 | 3) => string;
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
export declare const fundoDeCampo: (t: AureaTokens, _naSuperficie: boolean, maisContraste?: boolean) => ViewStyle;
/**
 * A cor do FOCO do campo (no nativo, o foco é a borda): o amarelo da marca, nos dois temas — uma linha só, como na web
 * (ADR-0083, 26/10/2026). Com "aumentar contraste" no sistema, volta ao `focusStrong` (o grafite no claro).
 */
export declare const focoDoCampo: (t: AureaTokens, maisContraste?: boolean) => string;
/**
 * A marca DENTRO de um controle ligado — a bolinha do `Switch`, a alça do `Slider`, o visto do `Checkbox` e o ponto do
 * rádio: branca (ADR-0083, 26/10/2026, o Victor: "como na referência"); com "aumentar contraste" no sistema, a tinta.
 */
export declare const marcaDoControle: (t: AureaTokens, branca: string, maisContraste?: boolean) => string;
/**
 * A mesma mistura, OPACA: a cor da frente a `pct` sobre a do fundo. Para o que tem algo passando POR TRÁS (o traço dos
 * passos) ou cobre outra peça (as fotos sobrepostas) — translúcido, o que está atrás aparece. Hex de seis, como o
 * `comOpacidade`; fora disso devolve a cor da frente.
 */
export declare const misturaOpaca: (frente: string, fundo: string, pct: number) => string;
export declare const misturaNoOklab: (frente: string, fundo: string, pct: number) => string;
/**
 * A COR DO ESCOLHIDO, a mesma da web: no claro, o GRAFITE do texto (ADR-0083, 26/10/2026 — o amarelo não vira letra no
 * claro; o fio amarelo de baixo marca o escolhido); no escuro, o destaque (o amarelo). Era a marca a 45% sobre o texto
 * (o "marrom", bloco 1, 23/10/2026), e antes o azul.
 */
export declare const corDoEscolhido: (t: AureaTokens) => string;
/**
 * A LETRA DO AMARELO, a do texto com `tone="primary"`: o destaque (`primaryEmphasis`) — no claro, o grafite do texto; no
 * escuro, o amarelo da marca, que já se lê (ADR-0083, 26/10/2026). Era, no claro, o amarelo misturado com o texto do
 * jeito da referência (80/150, decisão de 24/10/2026), que dava um marrom.
 */
export declare const letraDoAmarelo: (t: AureaTokens) => string;
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
export declare const letraDoToken: (t: AureaTokens, token: string) => string | undefined;
/**
 * O FUNDO CHEIO de um tom de estado e a letra em cima dele — o par do botão cheio (ADR-0061, 0.27.0):
 * o selo cheio é o botão cheio do mesmo tom. O `primary` enche com o PRIMÁRIO (o amarelo) e escreve com a
 * letra do botão amarelo (`primaryForeground`, a tinta cinza-escura). Até a ADR-0076 enchia com o acento,
 * que era o próprio amarelo nos dois temas; desde ela o acento do claro é o azul, e a tinta cinza no azul
 * mediria 1,99:1. O `neutral` não tem o par: `undefined`, e quem chama enche com o acento, como antes.
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
/**
 * `papel` (bloco 1, 24/10/2026): o "escolhido" na web depende de QUEM é escolhido. O `aria-selected` só vale em aba,
 * opção, linha e célula — num link ou num botão o axe o recusa e o leitor de tela o ignora (o site, rodando o nativo no
 * navegador, mediu 112 no `BottomNav`, 30 no `TagGroup`, 16 na `Gallery`, 32 no `Stepper`, 75 no `Chart`). Então, só na
 * web: link escolhido é `aria-current="page"` (o par que a ficha do `BottomNav` já escreve), botão escolhido é
 * `aria-pressed`, passo atual é `aria-current="step"`. No aparelho, o `accessibilityState` continua com o `selected`.
 */
export type PapelDoEscolhido = "link" | "button" | "step";
export declare function estadoAcessivel(estado: EstadoAcessivel | undefined, papel?: PapelDoEscolhido): {
    accessibilityState: undefined;
    "aria-checked"?: undefined;
    "aria-selected"?: undefined;
    "aria-current"?: undefined;
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
    "aria-current": string | undefined;
    "aria-disabled": boolean | undefined;
    "aria-expanded": boolean | undefined;
    "aria-busy": boolean | undefined;
    "aria-pressed": boolean | undefined;
};
export {};
