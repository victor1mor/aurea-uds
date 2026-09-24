"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
// SUBPATH PRÓPRIO, e não a categoria Data Display: este é o único componente que precisa do
// pacote `qr`, que é peer OPCIONAL. Se ele morasse junto do Table, quem importa Table teria de
// instalar um gerador de QR — que é exatamente o achado A5 visto de perto.
import React from "react";
import encodeQR from "qr";
import { peleDoEixo } from "./pure.js";
import { cx, useAureaStrings } from "./internal.js";
// QRCode: dado escaneável com a geometria suave da Aurea — módulos REDONDOS (dots) e
// olhos circulares, não quadrados. Miolo de alto contraste FIXO (não segue o tema: dark
// inverteria e nem todo leitor decodifica um QR invertido); override por --qr-module/
// --qr-quiet no CSS. Matriz da lib `qr` (0-dep, Apache-2.0, Paul Miller); o desenho é
// nosso. ecc default "quartile": dots cobrem menos área que quadrados, então mais
// correção de erro preserva a escaneabilidade. ponytail: um estilo (dots) só.
export function QRCode({ value, size, ecc = "quartile", quietZone = 4, label, className, ...props }) {
    const s = useAureaStrings();
    const name = label ?? `${s.qrCode}: ${value}`;
    const m = encodeQR(value, "raw", { ecc, border: quietZone });
    const n = m.length;
    // os 3 finder patterns (7×7) ficam nos cantos da área de dados, logo após o quiet border.
    const b = quietZone, eyes = [[b, b], [n - b - 7, b], [b, n - b - 7]];
    const inEye = (x, y) => eyes.some(([ex, ey]) => x >= ex && x < ex + 7 && y >= ey && y < ey + 7);
    const dots = [];
    for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++)
            if (m[y][x] && !inEye(x, y))
                dots.push(_jsx("circle", { className: "qr-mod", cx: x + 0.5, cy: y + 0.5, r: 0.44 }, y * n + x));
    // olho redondo: anel externo (raio 3.5) → furo (2.5, cor do fundo) → centro (1.5).
    // os raios preservam a proporção 7:5:3 do finder, então o leitor ainda o reconhece.
    const eyeShapes = eyes.map(([ex, ey], i) => { const cx = ex + 3.5, cy = ey + 3.5; return _jsxs(React.Fragment, { children: [_jsx("circle", { className: "qr-mod", cx: cx, cy: cy, r: 3.5 }), _jsx("circle", { className: "qr-eye-gap", cx: cx, cy: cy, r: 2.5 }), _jsx("circle", { className: "qr-mod", cx: cx, cy: cy, r: 1.5 })] }, `eye${i}`); });
    return _jsxs("svg", { className: cx("qrcode", peleDoEixo("qrcode", size), className), role: "img", "aria-label": name, viewBox: `0 0 ${n} ${n}`, ...props, children: [_jsx("title", { children: name }), eyeShapes, dots] });
}
