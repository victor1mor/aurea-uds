"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cx } from "./internal.js";
import { soOValor } from "./pure.js";
import { Icon } from "./system.js";
export function Accordion({ items }) { return _jsx("div", { className: "accordion", children: items.map(i => _jsxs("details", { children: [_jsx("summary", { children: i.title }), _jsx("div", { className: "accordion-content", children: i.content })] }, i.id)) }); }
// COLLAPSIBLE — uma seção que abre e fecha, com o estado do lado de quem usa.
//
// Não é um Accordion de um item só, e a diferença é o motivo de existir: o `Accordion` é um
// CONJUNTO de seções sobre `<details>` nativo, que abre sem JS e guarda o próprio estado. Aqui a
// aplicação é a dona do estado — um grupo da lateral que lembra se estava aberto, um painel de
// filtros que abre por ação de outro lugar, um "mostrar mais" que fecha ao trocar de página.
// `<details>` controlado é possível e desconfortável; e cinco das nove referências tratam os dois
// como componentes distintos.
//
// A API é a daqui: `trigger` é dado, o conteúdo são os filhos. Não é a API composta da referência
// (Root/Trigger/Panel) — quem quiser compor esse nível usa o motor direto.
export function Collapsible({ trigger, children, open, defaultOpen, onOpenChange, disabled, className }) {
    return _jsxs(BaseCollapsible.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: soOValor(onOpenChange), disabled: disabled, className: cx("collapsible", className), children: [_jsxs(BaseCollapsible.Trigger, { className: "collapsible-trigger", children: [_jsx(Icon, { name: "chevron--down", size: "sm", className: "collapsible-chevron" }), trigger] }), _jsx(BaseCollapsible.Panel, { className: "collapsible-panel", children: children })] });
}
