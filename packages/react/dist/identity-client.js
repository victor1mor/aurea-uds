"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
import { peleDoEixo } from "./pure.js";
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { cx } from "./internal.js";
// O DEGRAU RESPONSIVO volta (merge de 28/08/2026): a ficha declara `responsive.size` e o
// componente tinha perdido a capacidade quando este arquivo entrou da `main`. Mesma perda
// silenciosa do `Input`, do `Tabs` e do `NumberField` — a ficha documentava, o código não fazia.
export function Avatar({ src, alt = "", fallback, size, className }) {
    const [falhou, setFalhou] = React.useState(false);
    React.useEffect(() => { setFalhou(false); }, [src]);
    return _jsx("span", { className: cx("avatar", peleDoEixo("avatar", size), className), children: src && !falhou ? _jsx("img", { src: src, alt: alt, onError: () => setFalhou(true) }) : fallback });
}
