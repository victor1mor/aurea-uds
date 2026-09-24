// Aurea nativo — "a pessoa pediu menos movimento?".
//
// ── POR QUE ISTO EXISTE, E NÃO É ZELO ────────────────────────────────────────────────────────
// A web já respeita isso, e de graça: o `aurea.css` tem, na linha 2128, uma regra global que
// zera `animation-duration`, `transition-duration` e `scroll-behavior` sob
// `@media (prefers-reduced-motion: reduce)`. Um `.spinner` ou um `.skeleton` da web param
// sozinhos, sem o componente saber de nada.
//
// **No React Native não existe essa regra global**, porque não existe folha em cascata: cada
// `Animated.loop` roda até alguém mandar parar. Se o alvo nativo não perguntar, ele fica MENOS
// acessível que a web nos mesmos componentes — e a diferença não apareceria em teste de
// estrutura nenhum. É uma paridade que se perde em silêncio, que é a classe de defeito que este
// pacote existe para não ter.
//
// A pergunta é do sistema: iOS "Reduzir movimento", Android "Remover animações".
import * as React from "react";
import { AccessibilityInfo } from "react-native";
/**
 * `true` quando a pessoa pediu menos movimento, `false` quando não, **`null` enquanto o sistema
 * não respondeu**.
 *
 * ⚠ **O `null` não é preguiça de tipo — é a única resposta honesta, e ela muda o comportamento.**
 * `isReduceMotionEnabled()` é assíncrono nas duas plataformas: não existe leitura síncrona, ao
 * contrário da media query do CSS, que a web resolve antes do primeiro pixel. Começar em `false`
 * pareceria mais simples e faria **um quadro de animação tocar na cara de quem pediu que não
 * tocasse** — pequeno, e exatamente o público que pediu para não ver isso.
 *
 * Então quem anima espera saber: `if (reduzir !== false) return;`. O custo é uma microtarefa
 * antes de a animação começar, para todo mundo. O ganho é que a preferência é respeitada desde o
 * primeiro quadro.
 *
 * Quem só quer um booleano escreve `useReduceMotion() === true`.
 */
export function useReduceMotion() {
    const [reduzir, setReduzir] = React.useState(null);
    React.useEffect(() => {
        let vivo = true;
        AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (vivo)
            setReduzir(v); });
        // A pessoa pode ligar a preferência com o app aberto — e aí a animação tem de parar sozinha.
        const inscricao = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduzir);
        return () => { vivo = false; inscricao?.remove?.(); };
    }, []);
    return reduzir;
}
