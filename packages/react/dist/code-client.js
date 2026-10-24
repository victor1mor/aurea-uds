"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
// copyable: o gatilho é marcado com data-aurea-copy e o COMPORTAMENTO mora no aurea.js do
// core (uma implementação para React e para HTML puro). O onClick daqui atende quem só
// carrega o pacote React; ele para a propagação pro core não copiar duas vezes.
// DOC-02 (0.32.0): a CAIXA DE EXEMPLO do site da Aurea virou o `preview` do `CodeBlock` — as abas
// Prévia | Código (o controle segmentado ocupando a largura), a prévia no fundo afundado e o código sem
// moldura. É a caixa do site de hoje (decisão do Victor, 06/10/2026: a da Aurea, não a da referência),
// agora no pacote, para o site usar só peças da Aurea. O teclado é o das abas do APG: setas, Home e End.
// Sem o `aurea.js` na página — quem troca a aba é o React.
function CaixaDeExemplo({ preview, codigo, className }) {
    const s = useAureaStrings();
    const id = React.useId();
    const [aba, setAba] = React.useState("preview");
    const refPrevia = React.useRef(null), refCodigo = React.useRef(null);
    const ir = (a) => { setAba(a); (a === "preview" ? refPrevia : refCodigo).current?.focus(); };
    const tecla = (e) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
            return;
        e.preventDefault();
        ir(e.key === "Home" ? "preview" : e.key === "End" ? "code" : aba === "preview" ? "code" : "preview");
    };
    const botao = (a, rotulo) => _jsx("button", { type: "button", role: "tab", id: `${id}-${a}`, ref: a === "preview" ? refPrevia : refCodigo, className: aba === a ? "active" : undefined, "aria-selected": aba === a, "aria-controls": `${id}-${a}-panel`, tabIndex: aba === a ? 0 : -1, onClick: () => setAba(a), onKeyDown: tecla, children: rotulo });
    return _jsxs("div", { className: cx("demo code-preview", className), children: [_jsx("div", { className: "demo-tabs", children: _jsxs("div", { className: "segmented", role: "tablist", children: [botao("preview", s.codeBlockPreview), botao("code", s.codeBlockCode)] }) }), _jsx("div", { className: "demo-panel", "data-panel": "preview", role: "tabpanel", id: `${id}-preview-panel`, "aria-labelledby": `${id}-preview`, tabIndex: 0, hidden: aba !== "preview", children: preview }), _jsx("div", { className: "demo-panel demo-code", "data-panel": "code", role: "tabpanel", id: `${id}-code-panel`, "aria-labelledby": `${id}-code`, tabIndex: 0, hidden: aba !== "code", children: codigo })] });
}
// O CÓDIGO EM ABAS (bloco 1, o 3-A — 23/10/2026): as alternativas do MESMO passo, uma de cada vez — o comando de instalar
// em npm, pnpm, yarn e bun, como na documentação da referência (a fileira em cima, dentro da caixa do código). O estado é
// do React; os painéis levam `data-aurea-tabpanel` para o `aurea.js` do core trocar também na página que não acende (o
// site estático). A tecla para aqui (`stopPropagation`): com os dois na página, a seta andaria duas abas.
function CodigoEmAbas({ tabs, language, copyable, highlight, className }) {
    const s = useAureaStrings();
    const id = React.useId();
    const [aba, setAba] = React.useState(0);
    const refs = React.useRef([]);
    const ir = (i) => { setAba(i); refs.current[i]?.focus(); };
    const tecla = (e) => {
        const n = tabs.length;
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key))
            return;
        e.preventDefault();
        e.stopPropagation();
        ir(e.key === "Home" ? 0 : e.key === "End" ? n - 1 : e.key === "ArrowRight" ? (aba + 1) % n : (aba - 1 + n) % n);
    };
    return _jsxs("div", { className: cx("code-tabs", className), children: [_jsx("div", { className: "code-tabs-list", role: "tablist", "aria-label": s.tabsLabel, children: tabs.map((t, i) => _jsx("button", { type: "button", role: "tab", id: `${id}-${i}`, ref: el => { refs.current[i] = el; }, className: cx("code-tab", aba === i && "active"), "aria-selected": aba === i, "aria-controls": `${id}-${i}-panel`, tabIndex: aba === i ? 0 : -1, onClick: () => setAba(i), onKeyDown: tecla, children: t.label }, t.label)) }), tabs.map((t, i) => _jsx("div", { role: "tabpanel", id: `${id}-${i}-panel`, "aria-labelledby": `${id}-${i}`, "data-aurea-tabpanel": "", hidden: aba !== i, children: _jsx(CodeBlock, { language: t.language ?? language, copyable: copyable, highlight: highlight, children: t.code }) }, t.label))] });
}
// lineNumbers e highlight (lote V, 20/10/2026): as linhas viram um <span class="code-line"> cada, com o "\n" entre
// elas — o texto do bloco continua IGUAL ao código (copiar com o mouse traz o mesmo texto), e o número é desenhado pelo
// CSS, sem entrar no texto nem no leitor de tela. Sem as duas, a marcação é a de antes, sem mudar nada.
// O "\n" do fim (o código que termina em quebra de linha) não vira uma linha numerada e vazia: ele sai depois da última.
function linhasDoCodigo(codigo, language, highlight) {
    const linhas = highlight?.(codigo, language) ?? codigo.split("\n").map(l => l === "" ? [] : [{ text: l }]);
    return codigo.endsWith("\n") && linhas.length > 1 && linhas[linhas.length - 1].length === 0 ? linhas.slice(0, -1) : linhas;
}
export function CodeBlock({ children, language = "text", copyable, preview, lineNumbers, highlight, tabs, className }) {
    if (tabs && tabs.length > 0)
        return _jsx(CodigoEmAbas, { tabs: tabs, language: language, copyable: copyable, highlight: highlight, className: className });
    if (preview !== undefined)
        return _jsx(CaixaDeExemplo, { preview: preview, className: className, codigo: _jsx(CodeBlock, { language: language, copyable: copyable, lineNumbers: lineNumbers, highlight: highlight, children: children }) });
    const s = useAureaStrings();
    // tabIndex no <pre>: `.code-block` é `overflow:auto` por construção, então é REGIÃO ROLÁVEL
    // e não tem nada focável dentro — quem navega por teclado não alcança o código que passa da
    // largura. É a regra `scrollable-region-focusable` do axe, e o mesmo defeito que o painel de
    // demo do catálogo já tinha corrigido em 30/07/2026 no lado dele; aqui, na biblioteca, ele
    // seguia aberto e só não aparecia porque nenhuma linha era comprida o bastante. Quem o achou
    // foi o `catalog-sweep` em 10/08/2026, quando o bloco do I1 fez a linha de import crescer.
    children ??= "";
    const linhas = lineNumbers || highlight ? linhasDoCodigo(children, language, highlight) : null;
    const colorido = linhas != null && highlight != null && linhas.some(l => l.some(p => p.className));
    // Os algarismos da última linha: a coluna do número tem a largura deles (99 → 2, 100 → 3).
    const digitos = lineNumbers && linhas ? { "--code-line-digits": String(linhas.length).length } : undefined;
    const pre = _jsx("pre", { className: cx("code-block", lineNumbers && "code-block-numbered", colorido && "code-block-highlighted", !copyable && className), style: digitos, "data-language": language, tabIndex: 0, children: _jsx("code", { children: linhas
                ? _jsxs(_Fragment, { children: [linhas.map((l, i) => _jsxs(React.Fragment, { children: [_jsx("span", { className: "code-line", children: l.map((p, j) => p.className ? _jsx("span", { className: p.className, children: p.text }, j) : p.text) }), i < linhas.length - 1 ? "\n" : null] }, i)), children.endsWith("\n") ? "\n" : null] })
                : children }) });
    if (!copyable)
        return pre;
    // 0.28.0: o "copiado" é dito ao leitor de tela. Com o `aurea.js` na página, é ele quem diz (pelo
    // texto do `data-aurea-copy-done`, na língua do app); sem ele, a região de status daqui.
    const [copiado, setCopiado] = React.useState(false);
    const onCopy = (e) => {
        e.stopPropagation();
        const vanilla = window.Aurea;
        if (vanilla?.copy) {
            vanilla.copy(e.currentTarget);
            return;
        }
        // Sem área de transferência (ou sem promessa), não há o que avisar — e não pode quebrar o clique.
        const copia = navigator.clipboard?.writeText(children);
        if (typeof copia?.then !== "function")
            return;
        void copia.then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); }, () => { });
    };
    return _jsxs("div", { className: cx("code-block-wrap", className), "data-aurea-copy-scope": true, children: [_jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", children: copiado ? s.copied : "" }), _jsxs("button", { type: "button", className: cx("btn btn-icon btn-ghost copy-code", copiado && "is-done"), "data-aurea-copy": true, "data-aurea-copy-done": s.copied, "aria-label": s.copyCode, onClick: onCopy, children: [_jsx(Icon, { name: "copy", size: "sm", className: "c-copy" }), _jsx(Icon, { name: "check", size: "sm", className: "c-done" })] }), pre] });
}
