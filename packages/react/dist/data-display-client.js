"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { cx, useAureaStrings, useReorder } from "./internal.js";
import { Icon } from "./system.js";
export function Table({ caption, children, className, ...props }) { const s = useAureaStrings(); return _jsx("div", { className: "table-region", role: "region", "aria-label": typeof caption === "string" ? caption : s.tableLabel, tabIndex: 0, children: _jsxs("table", { className: cx("table", className), ...props, children: [caption && _jsx("caption", { children: caption }), children] }) }); }
// O protocolo de teclado e de ponteiro saiu daqui para o `useReorder` do `internal` no item N1,
// quando o `BlockEditor` virou o segundo dono dele. A DOM abaixo não mudou uma vírgula na
// extração — é o que o gate de pixel e o `skin.spec` continuam medindo.
export function SortableList({ items, onReorder, label, className, ...props }) {
    const s = useAureaStrings();
    const bid = React.useId();
    const r = useReorder({ count: items.length, order: items, onReorder,
        rowSelector: ".sortable-item", handleSelector: ".sortable-handle" });
    return _jsxs(_Fragment, { children: [_jsx("ul", { ref: r.ref, className: cx("sortable-list", className), "aria-label": label ?? s.sortableLabel, ...props, children: items.map((it, i) => {
                    const lid = `${bid}l${i}`, hid = `${bid}h${i}`;
                    return _jsxs("li", { className: "sortable-item", "data-grabbed": r.pego === i || undefined, children: [_jsxs("button", { type: "button", id: hid, className: "sortable-handle", "aria-labelledby": `${hid} ${lid}`, "aria-describedby": `${bid}ajuda`, "aria-pressed": r.pego === i, onKeyDown: e => r.teclado(e, i), onPointerDown: e => r.ponteiroBaixo(e, i), onPointerMove: r.ponteiroMove, onPointerUp: r.ponteiroSolta, onPointerCancel: r.ponteiroSolta, children: [_jsx(Icon, { name: "drag--horizontal" }), _jsx("span", { className: "sr-only", children: s.sortableHandle })] }), _jsx("span", { id: lid, className: "sortable-label", children: it.label })] }, it.id);
                }) }), _jsx("span", { id: `${bid}ajuda`, className: "sr-only", children: s.sortableHelp }), _jsx("div", { role: "status", "aria-live": "polite", className: "sr-only", children: r.aviso })] });
}
