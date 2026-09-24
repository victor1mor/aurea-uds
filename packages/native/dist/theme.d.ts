import * as React from "react";
import { type AureaIconRegistry } from "./icon.js";
import { type AureaStrings } from "./strings.js";
import { type AureaDensity, type AureaFontFamilies, type AureaThemeName, type AureaTokens } from "./tokens.js";
export type AureaThemeControl = {
    theme: AureaThemeName;
    density: AureaDensity;
    setTheme: (t: AureaThemeName) => void;
    setDensity: (d: AureaDensity) => void;
    toggleTheme: () => void;
};
export type AureaProviderProps = {
    children: React.ReactNode;
    /** Controlado: quando presente, manda, e `setTheme` só avisa. */
    theme?: AureaThemeName;
    /** Controlado: quando presente, manda, e `setDensity` só avisa. */
    density?: AureaDensity;
    /**
     * Tema inicial do modo não controlado. Ausente, segue o **aparelho** (`useColorScheme`) até
     * alguém chamar `setTheme` — a partir daí a escolha da pessoa manda e o sistema não a desfaz.
     */
    defaultTheme?: AureaThemeName;
    /**
     * Densidade inicial do modo não controlado. Um app de consumidor final não expõe densidade ao
     * usuário (NATIVE.md §5.4): ali isto é uma escolha do app, feita uma vez.
     */
    defaultDensity?: AureaDensity;
    /**
     * O mapa `papel -> peso -> família` que faz o texto sair no IBM Plex. Sem ele, o tema devolve a
     * família PEDIDA ("IBM Plex Sans"), que no aparelho vira fonte de sistema para todo peso que
     * não seja Regular/Italic/Bold — **medido na tabela `name` dos .ttf**: Medium e SemiBold são
     * famílias próprias, não pesos da mesma família (ADR-0039).
     *
     *     import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
     *     const [pronto] = useFonts(AUREA_FONTS);
     *     <AureaProvider fontFamilies={FONT_FAMILIES}>
     *
     * É injetável, e não importado daqui, pela mesma razão que a ADR-0038 deu ao renderizador de
     * ícone: quem já tem a própria pilha de fonte não é obrigado a carregar 1,91 MB da nossa.
     */
    fontFamilies?: AureaFontFamilies;
    /**
     * O registro de ícones que `<Icon name>` e os botões consultam. Montado pelo app com o que ele
     * usa — **nunca** o mapa dos 2571, que anularia a poda (ADR-0038, cláusula 4).
     *
     *     import Add from "@aurea-uds/native/icons/add";
     *     const ICONES = criarRegistroDeIcones({add: Add});
     *     <AureaProvider icons={ICONES}>
     */
    icons?: AureaIconRegistry;
    /**
     * As frases que os componentes dizem sozinhos — o estado universal do `Alert`, o vazio do
     * `DataState`, o rótulo do `Spinner` para o leitor de tela. Padrão em **inglês**, como na web.
     *
     *     import {ptBR} from "@aurea-uds/native";
     *     <AureaProvider strings={ptBR}>
     *
     * A tabela é pequena de propósito, e o `strings.ts` escreve por quê: ela tem o tamanho do que
     * o alvo nativo desenha, não das 200 chaves de 124 componentes da web.
     */
    strings?: AureaStrings;
    /** Avisado quando o modo CONTROLADO recebe um pedido de troca — é o app que decide. */
    onThemeChange?: (t: AureaThemeName) => void;
    onDensityChange?: (d: AureaDensity) => void;
};
export declare function AureaProvider({ children, theme, density, defaultTheme, defaultDensity, fontFamilies, icons, strings, onThemeChange, onDensityChange, }: AureaProviderProps): React.JSX.Element;
/** Os dois eixos e como trocá-los. Mesma forma do hook homônimo de `@aurea-uds/react`. */
export declare function useAureaTheme(): AureaThemeControl;
/** Os tokens já resolvidos para o par (tema, densidade) atual. Não tem par na web: lá o CSS resolve. */
export declare function useAureaTokens(): AureaTokens;
/**
 * As frases visíveis. Mesmo nome do hook da web (`useAureaStrings`), tabela bem menor — ver
 * `strings.ts`.
 */
export declare function useAureaStrings(): AureaStrings;
export interface SobreAMarcaValor {
    /** A única cor que se pode desenhar sobre a marca: letra, contorno e glifo. 4,54 nos dois temas. */
    tinta: string;
    /** A cor do cartão por baixo. Serve de letra para quem se pinta com a tinta INTEIRA. */
    fundo: string;
}
/** O provedor. Quem usa é o `Card variant="brand"`. */
export declare const SobreAMarca: React.Context<SobreAMarcaValor | null>;
/**
 * O par de cores obrigatório quando se está sobre a marca, ou `null` quando não se está.
 *
 * ⚠ **Ele vence TODOS os tons, inclusive os explícitos.** Um `tone="danger"` sobre o amarelo
 * mediria menos que os 4,5 da norma, então respeitá-lo entregaria texto ilegível em nome da
 * obediência. **Sobre o amarelo existe UMA tinta** — a hierarquia sai de peso e tamanho.
 *
 * ⚠ **E o alcance dele é DECLARADO, não completo.** Leem o contexto: `Text`, a família de campo,
 * o `Button` e o `IconButton`. **Componente fora dessa lista continua quebrado dentro do cartão
 * amarelo**, e gate estático nenhum vê isso — o que o consumidor encaixa não está no nosso
 * código, exatamente o ponto cego que o `check 43` já declara.
 */
export declare function useSobreAMarca(): SobreAMarcaValor | null;
/**
 * Corta a marca para dentro.
 *
 * 🔴 **Existe por uma armadilha do React Native que é invisível na tela e óbvia no código:** o
 * `Modal` desenha numa camada POR CIMA de tudo, mas em React ele continua sendo FILHO de quem o
 * escreveu. Um `Select` dentro de um `Card variant="brand"` abre a folha dele **fora** do cartão
 * amarelo — e a folha herdaria a tinta do amarelo mesmo assim, pintando texto marrom sobre fundo
 * normal.
 *
 * ⚠ **Camada visual e árvore de contexto são coisas diferentes**, e é só o segundo que manda na
 * cor. Toda superfície que sai do fluxo — as duas folhas de escolha e os quatro sobrepostos —
 * passa por aqui.
 */
export declare function ForaDaMarca({ children }: {
    children?: React.ReactNode;
}): React.JSX.Element;
/**
 * A pele que um CAMPO tem de vestir quando está dentro de um `Card variant="brand"`, ou `null`
 * quando não está.
 *
 * O campo perde o fundo e passa a ser um contorno da tinta: **4,54 contra o amarelo nos dois
 * temas**, contra os 2,43/2,24 do `borderStrong` e os 1,61 do `fieldBg` no tema claro. A norma
 * 1.4.11 pede 3:1 para o contorno que identifica um campo, e só a tinta chega lá.
 *
 * ⚠ **O fundo some porque NÃO HÁ fundo possível** — medidas as três superfícies neutras do
 * sistema contra o amarelo no tema claro: `card` 1,91 · `background` 1,73 · `secondary` 1,61.
 * Nenhuma separa. Um contorno forte separa.
 *
 * 🔴 **E a tinta vence o estado de INVÁLIDO, que é o contrário do que a intuição manda.** Medido:
 * a borda de inválido (`danger-400`, `#9f2330`) mede **1,86** contra o amarelo — ela é MENOS
 * visível que a tinta. Pintar de vermelho ali deixaria o campo errado mais difícil de achar que o
 * campo certo. Dentro deste cartão o erro é dito pela MENSAGEM do `Field` e pelo estado que o
 * leitor de tela anuncia, não pela cor — que é o que a norma 1.4.1 já exige de qualquer forma.
 *
 * ⚠ **O texto digitado e o marcador de dica ficam da MESMA cor**, porque só existe uma tinta. É
 * perda real de hierarquia, declarada e não escondida: sobre o amarelo não há segunda cor.
 */
export declare function usePeleSobreAMarca(): {
    borderColor: string;
    backgroundColor: string;
    color: string;
} | null;
