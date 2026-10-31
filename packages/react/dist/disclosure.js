"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cx } from "./internal.js";
import { soOValor } from "./pure.js";
import { Icon } from "./system.js";
// O SITE B (30/10/2026, protótipo): `indicator="plus"` troca a setinha pelo "+" numa bolinha, que gira e vira o "×"
// amarelo quando abre; `size="lg"` é a linha de 60 com a letra do texto (16), a das perguntas do desenho aprovado.
export function Accordion({ items, variant = "default", multiple = false, defaultValue, indicator = "chevron", size = "md", className }) {
    const grupo = React.useId();
    return _jsx("div", { className: cx("accordion", variant === "surface" && "accordion-surface", indicator === "plus" && "accordion-plus", size === "lg" && "accordion-lg", className), children: items.map(i => _jsxs("details", { className: "accordion-item", name: multiple ? undefined : grupo, open: defaultValue?.includes(i.id) || undefined, children: [_jsxs("summary", { "aria-disabled": i.disabled || undefined, tabIndex: i.disabled ? -1 : undefined, onClick: i.disabled ? (e) => e.preventDefault() : undefined, children: [_jsx("span", { className: "accordion-title", children: i.title }), _jsx("span", { className: "accordion-chevron", "aria-hidden": "true" })] }), _jsx("div", { className: "accordion-content", children: i.content })] }, i.id)) });
}
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
    return _jsxs(BaseCollapsible.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: soOValor(onOpenChange), disabled: disabled, className: cx("collapsible", className), children: [_jsxs(BaseCollapsible.Trigger, { className: "collapsible-trigger", children: [_jsx(Icon, { name: "caret-down", size: "sm", className: "collapsible-chevron" }), trigger] }), _jsx(BaseCollapsible.Panel, { className: "collapsible-panel", children: children })] });
}
