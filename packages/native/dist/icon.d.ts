import * as React from "react";
/** O que cada módulo de `icons/*` exporta por padrão. */
export type AureaIconComponent = (props: {
    size?: number;
    color?: string;
}) => React.ReactElement;
/** Nome do glifo, no vocabulário do Carbon — o MESMO do sprite da web (check 38). */
export type IconName = string;
export type AureaIconRegistry = Readonly<Record<IconName, AureaIconComponent>>;
/**
 * Declara o registro. É uma função de identidade tipada, e ela existe por um motivo prático:
 * escrita como constante no módulo do app, a referência é estável — e um registro recriado a cada
 * render invalidaria o `useMemo` de todo componente que o recebe.
 */
export declare const criarRegistroDeIcones: <T extends AureaIconRegistry>(r: T) => T;
/** Uma forma do glifo. Sem `fill`, ela pinta com a cor que o `Icon` passar (a do tema, por padrão). */
interface Pintura {
    /** Cor fixa desta forma, ou `"none"` para não pintar. Sem isto, a forma segue o `color`. */
    fill?: string;
}
export interface AureaGlifoCaminho extends Pintura {
    d: string;
    fillRule?: "nonzero" | "evenodd";
}
export interface AureaGlifoCirculo extends Pintura {
    cx: number;
    cy: number;
    r: number;
}
export interface AureaGlifoRetangulo extends Pintura {
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
}
export interface AureaGlifoDesenho {
    /** Padrão `"0 0 32 32"`, a caixa dos glifos do Carbon. */
    viewBox?: string;
    rects?: readonly AureaGlifoRetangulo[];
    circles?: readonly AureaGlifoCirculo[];
    /** Um caminho SVG por item — a string solta vale por `{d}`. */
    paths?: readonly (string | AureaGlifoCaminho)[];
}
/**
 * Um glifo PRÓPRIO do app — um logotipo, por exemplo — desenhado pela Aurea a partir dos dados
 * do desenho. R-05, 24/09/2026.
 *
 * ```tsx
 * const Marca = criarGlifo({viewBox: "0 0 64 64", circles: [{cx: 32, cy: 32, r: 30}], paths: ["M…"]});
 * const ICONES = criarRegistroDeIcones({...OS_DO_APP, marca: Marca});
 * <Icon name="marca" size="xl" />
 * ```
 *
 * **Por que existe:** o registro já aceitava qualquer componente, mas para ESCREVER esse
 * componente o app precisava importar o `react-native-svg` — o motor que a Aurea usa por dentro,
 * e que a regra "só Aurea" do app barra. Agora o app passa só números e caminhos.
 *
 * ⚠ **A ordem de pintura é fixa:** retângulos, depois círculos, depois caminhos — o de baixo
 * primeiro. Um desenho que precise de outra ordem passa tudo como `paths`, que respeitam a ordem
 * da lista.
 *
 * ⚠ **Não traz peso novo:** o `react-native-svg` já é dependência obrigatória, e o `Chart` o usa
 * pela mesma porta.
 */
export declare function criarGlifo(desenho: AureaGlifoDesenho): AureaIconComponent;
/** Põe o registro em contexto. O `AureaProvider` já faz isto quando recebe `icons`. */
export declare function IconRegistryProvider({ registry, children }: {
    registry: AureaIconRegistry;
    children: React.ReactNode;
}): React.JSX.Element;
/** A escala de glifo dos tokens. Começa em `sm`: **não existe `--icon-xs`** — como na web. */
export type AureaIconSize = "sm" | "md" | "lg" | "xl";
export interface IconProps {
    name: IconName;
    size?: AureaIconSize | number;
    /** Padrão: a cor de texto do tema. Ver a nota sobre herança abaixo. */
    color?: string;
    /** Registro local, quando não há um em contexto — ou para sobrepor o do provider. */
    icons?: AureaIconRegistry;
    /**
     * Rótulo para leitor de tela. **Sem ele o ícone é decorativo** e some da árvore de
     * acessibilidade, que é o correto quando há texto ao lado dizendo a mesma coisa.
     */
    label?: string;
}
/**
 * Desenha um glifo do registro.
 *
 * ⚠ **A cor não herda**, e isso não é omissão: `currentColor` não existe no React Native e não há
 * cascata. O padrão aqui é `color.foreground` do tema — a mesma cor que o texto teria —, o que
 * recria a herança da web no único lugar onde ela pode ser recriada: no valor, não na cascata.
 *
 * ⚠ **Nome ausente do registro não desenha nada, e é decisão.** Um losango de erro ou um quadrado
 * vazio pareceria um glifo de verdade numa tela cheia, e passaria por revisão. Em `__DEV__` sai
 * um aviso nomeando o ícone e o caminho do import que resolve.
 */
export declare function Icon({ name, size, color, icons, label }: IconProps): React.JSX.Element | null;
export {};
