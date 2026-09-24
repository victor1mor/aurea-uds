"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
// copyable: o gatilho é marcado com data-aurea-copy e o COMPORTAMENTO mora no aurea.js do
// core (uma implementação para React e para HTML puro). O onClick daqui atende quem só
// carrega o pacote React; ele para a propagação pro core não copiar duas vezes.
export function CodeBlock({ children, language = "text", copyable, className }) {
    const s = useAureaStrings();
    // tabIndex no <pre>: `.code-block` é `overflow:auto` por construção, então é REGIÃO ROLÁVEL
    // e não tem nada focável dentro — quem navega por teclado não alcança o código que passa da
    // largura. É a regra `scrollable-region-focusable` do axe, e o mesmo defeito que o painel de
    // demo do catálogo já tinha corrigido em 30/07/2026 no lado dele; aqui, na biblioteca, ele
    // seguia aberto e só não aparecia porque nenhuma linha era comprida o bastante. Quem o achou
    // foi o `catalog-sweep` em 10/08/2026, quando o bloco do I1 fez a linha de import crescer.
    const pre = _jsx("pre", { className: cx("code-block", !copyable && className), "data-language": language, tabIndex: 0, children: _jsx("code", { children: children }) });
    if (!copyable)
        return pre;
    const onCopy = (e) => { e.stopPropagation(); window.Aurea?.copy?.(e.currentTarget) ?? navigator.clipboard?.writeText(children); };
    return _jsxs("div", { className: cx("code-block-wrap", className), "data-aurea-copy-scope": true, children: [_jsxs("button", { type: "button", className: "btn btn-icon btn-ghost copy-code", "data-aurea-copy": true, "aria-label": s.copyCode, onClick: onCopy, children: [_jsx(Icon, { name: "copy", size: "sm", className: "c-copy" }), _jsx(Icon, { name: "checkmark", size: "sm", className: "c-done" })] }), pre] });
}
