import { type ReactNode, type RefObject } from "react";
import { type Responsive } from "./pure.js";
/** O contêiner Aurea como PRIMITIVE. Declara o contêiner para o CSS (`container-scope`) e publica
 *  o elemento para quem precisar medi-lo — os dois pelo mesmo elemento, por construção. */
export declare function ContainerScope({ children, className, ...props }: {
    children?: ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>): import("react").JSX.Element;
/** RESOLVE um `Responsive<T>` no valor único que vale agora.
 *
 *  Genérico de propósito: o `G-AXIS-06` chegou por `orientation`, mas nada aqui sabe o que é
 *  orientação. Qualquer eixo COMPORTAMENTAL futuro usa este mesmo resolvedor — foi o que o Victor
 *  pediu ao recusar um `useResponsiveOrientation`.
 *
 *  SSR/RSC: o servidor devolve sempre o valor BASE, deterministicamente. A hidratação casa com
 *  ele — `useSyncExternalStore` usa o snapshot de servidor durante a hidratação e só então
 *  re-renderiza com o do cliente —, e o contêiner só é medido depois da montagem, quando existe
 *  elemento para medir. Valor simples não assina nada: nem `matchMedia`, nem observer, nem
 *  estado que dependa de hidratação. */
export declare function useValorResponsivo<T extends string>(valor: Responsive<T> | undefined, padrao: T, ancora?: RefObject<HTMLElement | null>): T;
