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
export declare function useReduceMotion(): boolean | null;
