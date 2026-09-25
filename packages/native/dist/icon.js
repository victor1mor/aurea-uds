import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aurea nativo — `Icon`, e a razão de ele existir apesar de `icons/<nome>` já desenhar.
//
// A **cláusula 4 da ADR-0038** manda: *"`<Icon name>` continua existindo, para a paridade de API
// com a web — mas como REGISTRO QUE O APP MONTA com o que usa, nunca como mapa dos 2856, que
// anularia tudo acima"*. "Tudo acima" é a cláusula 1: o caminho profundo
// (`@aurea-uds/native/icons/add`) não depende do tree-shaking do Metro, que é experimental.
//
// Então este arquivo **não importa ícone nenhum**. Ele recebe os que o app já importou.
//
//     import Add from "@aurea-uds/native/icons/add";
//     import ChevronDown from "@aurea-uds/native/icons/chevron--down";
//
//     const ICONES = criarRegistroDeIcones({add: Add, "chevron--down": ChevronDown});
//     <AureaProvider icons={ICONES}>          // ou <Icon icons={ICONES} name="add" />
//
// **Por que ter `<Icon name>` se o caminho profundo já funciona?** Porque as fichas da Aurea
// falam em nome de ícone (`leadingIcon: IconName`), e um `Button` que recebe `"add"` precisa de
// alguém que saiba desenhá-lo. Sem o registro, cada componente que aceita ícone teria de receber
// um componente — o que empurra a decisão para a tela, uma prop de cada vez.
import * as React from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useAureaTokens } from "./theme.js";
/**
 * Declara o registro. É uma função de identidade tipada, e ela existe por um motivo prático:
 * escrita como constante no módulo do app, a referência é estável — e um registro recriado a cada
 * render invalidaria o `useMemo` de todo componente que o recebe.
 */
export const criarRegistroDeIcones = (r) => r;
/** `"currentColor"` vira a cor do `Icon`; o resto passa como veio. */
const tinta = (v, color) => (v === "currentColor" ? color : v);
/** A tinta final de uma forma: a dela, senão a do desenho, senão a cor do `Icon` no `fill`. */
function pintar(forma, desenho, color) {
    const stroke = tinta(forma.stroke ?? desenho.stroke, color);
    return {
        fill: tinta(forma.fill ?? desenho.fill, color) ?? color,
        ...(stroke !== undefined && {
            stroke,
            strokeWidth: forma.strokeWidth ?? desenho.strokeWidth,
            strokeLinecap: forma.strokeLinecap ?? desenho.strokeLinecap,
            strokeLinejoin: forma.strokeLinejoin ?? desenho.strokeLinejoin,
        }),
    };
}
/**
 * Um glifo PRÓPRIO do app — um logotipo, por exemplo — desenhado pela Aurea a partir dos dados
 * do desenho. R-05, 24/09/2026.
 *
 * ```tsx
 * const Marca = criarGlifo({viewBox: "0 0 64 64", circles: [{cx: 32, cy: 32, r: 30}], paths: ["M…"]});
 * // a traço: a tinta no desenho inteiro, como no `<svg>` raiz
 * const Logo = criarGlifo({fill: "none", stroke: "currentColor", strokeWidth: 2,
 *                          strokeLinecap: "round", paths: ["M…"]});
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
export function criarGlifo(desenho) {
    const { viewBox = "0 0 32 32", rects = [], circles = [], paths = [] } = desenho;
    const Glifo = ({ size = 32, color = "#000000" }) => (_jsxs(Svg, { width: size, height: size, viewBox: viewBox, children: [rects.map((r, i) => _jsx(Rect, { ...r, ...pintar(r, desenho, color) }, `r${i}`)), circles.map((c, i) => _jsx(Circle, { ...c, ...pintar(c, desenho, color) }, `c${i}`)), paths.map((p, i) => {
                const c = typeof p === "string" ? { d: p } : p;
                return _jsx(Path, { ...c, ...pintar(c, desenho, color) }, `p${i}`);
            })] }));
    return Glifo;
}
const Contexto = React.createContext(null);
/** Põe o registro em contexto. O `AureaProvider` já faz isto quando recebe `icons`. */
export function IconRegistryProvider({ registry, children }) {
    return _jsx(Contexto.Provider, { value: registry, children: children });
}
const ESCALA = {
    sm: "iconSm", md: "iconMd", lg: "iconLg", xl: "iconXl",
};
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
export function Icon({ name, size = "md", color, icons, label }) {
    const t = useAureaTokens();
    const doContexto = React.useContext(Contexto);
    const registro = icons ?? doContexto;
    const Glifo = registro?.[name];
    if (!Glifo) {
        if (__DEV__) {
            console.warn(`Aurea Icon: "${name}" não está no registro. Importe-o pelo caminho profundo e ` +
                `acrescente ao registro:\n` +
                `  import Glifo from "@aurea-uds/native/icons/${name}";\n` +
                `  criarRegistroDeIcones({"${name}": Glifo, …})\n` +
                `O barril "@aurea-uds/native/icons" existe mas NÃO é a forma documentada: ele traz os ` +
                `2571 ao grafo do bundler (ADR-0038, cláusula 1).`);
        }
        return null;
    }
    const lado = typeof size === "number" ? size : (t.size[ESCALA[size]] ?? t.size.iconMd);
    const glifo = _jsx(Glifo, { size: lado, color: color ?? t.color.foreground });
    // Sem rótulo o ícone é decorativo e sai da árvore de acessibilidade — se ele repete um texto
    // que já está ao lado, anunciá-lo duas vezes é pior do que não anunciar.
    return label
        ? _jsx(View, { accessible: true, accessibilityRole: "image", accessibilityLabel: label, children: glifo })
        : _jsx(View, { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants", children: glifo });
}
