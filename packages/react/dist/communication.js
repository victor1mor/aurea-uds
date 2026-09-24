"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { cx, useAureaStrings } from "./internal.js";
import { InputGroup, InputGroupAddon } from "./inputs.js";
import { Icon } from "./system.js";
import { IconButton } from "./actions.js";
import { Avatar } from "./identity.js";
import { Badge } from "./feedback.js";
export function MessageList({ messages, label, className }) {
    const s = useAureaStrings();
    return _jsx("div", { className: cx("stack", className), role: "log", "aria-live": "polite", "aria-label": label ?? s.chatLabel, children: messages.map(m => _jsxs("div", { className: "message", children: [m.avatar ? _jsx(Avatar, { src: m.avatar.src, fallback: m.avatar.fallback }) : _jsx("span", {}), _jsxs("div", { className: "message-bubble", children: [(m.author || m.time) && _jsxs("div", { className: "label", children: [_jsx("span", { children: m.author }), m.time && _jsx("span", { className: "hint", children: m.time })] }), m.body, m.status && _jsx("div", { className: "message-status", children: _jsxs(Badge, { variant: m.status.variant, children: [_jsx("i", { className: "status-dot" }), m.status.label] }) })] })] }, m.id)) });
}
// Composer: <form> sobre InputGroup + .input; Enter envia (submit nativo) e limpa.
// Texto é estado interno (não controlado — controlar de fora só com demanda real,
// precedente MediaPlayer/FileInput). Não envia texto vazio/só-espaço; o botão de
// envio desabilita enquanto vazio. O input sempre tem nome acessível (aria-label),
// pois placeholder não serve de nome. ponytail: input de uma linha; textarea +
// Shift+Enter quando surgir demanda de multilinha.
export function MessageComposer({ onSend, placeholder, label, icon, sendLabel, disabled, className }) {
    const s = useAureaStrings();
    const [text, setText] = React.useState("");
    const submit = (e) => { e.preventDefault(); const t = text.trim(); if (!t)
        return; onSend(t); setText(""); };
    return _jsxs("form", { className: cx("message-composer", className), onSubmit: submit, children: [_jsxs(InputGroup, { children: [icon && _jsx(InputGroupAddon, { children: _jsx(Icon, { name: icon }) }), _jsx("input", { className: "input", value: text, disabled: disabled, placeholder: placeholder, "aria-label": label ?? s.chatMessage, onChange: e => setText(e.target.value) })] }), _jsx(IconButton, { type: "submit", variant: "primary", icon: "send", label: sendLabel ?? s.chatSend, disabled: disabled || !text.trim() })] });
}
