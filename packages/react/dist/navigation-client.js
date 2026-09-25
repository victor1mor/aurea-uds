"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, { useRef } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { useValorResponsivo } from "./responsivo-runtime.js";
import { cx, fundirRender, useAureaStrings, usePortalContainer } from "./internal.js";
import { Kbd } from "./markup.js";
import { Icon } from "./system.js";
import { Button } from "./actions.js";
import { Badge } from "./feedback.js";
import { SearchField } from "./inputs.js";
// `overlays` PASSOU A VIR ANTES de `navigation` no DAG (18/08/2026, MAP.md §DAG). Ele só
// importa `internal`, `system` e `actions` — todos anteriores —, então não há ciclo: o que
// mudou foi a ORDEM documentada, que colocava overlays no "resto" sem motivo medido.
import { Tooltip } from "./overlays.js";
export function Stepper({ items, label, className }) {
    const s = useAureaStrings();
    return _jsx("div", { role: "list", "aria-label": label ?? s.stepperLabel, className: cx("stepper", className), children: items.map((it, n) => {
            const st = it.state ?? "default";
            const marca = st === "done" ? _jsx(Icon, { name: "checkmark" }) : st === "error" ? _jsx(Icon, { name: "error" }) : n + 1;
            const miolo = _jsxs(_Fragment, { children: [_jsx("span", { className: "step-dot", children: marca }), _jsx("strong", { children: it.label }), it.optional && _jsx("small", { className: "step-optional", children: it.optional })] });
            return _jsx("div", { role: "listitem", className: cx("step", st !== "default" && `step-${st}`), "aria-current": st === "active" ? "step" : undefined, children: it.onClick ? _jsx("button", { type: "button", className: "step-trigger", onClick: it.onClick, children: miolo }) : miolo }, n);
        }) });
}
export function Breadcrumb({ items, label }) { const s = useAureaStrings(); return _jsx("nav", { className: "breadcrumb", "aria-label": label ?? s.breadcrumbLabel, children: items.map((i, n) => _jsxs(React.Fragment, { children: [n > 0 && _jsx(Icon, { name: "chevron--right", size: "sm" }), " ", i.render ? fundirRender(i.render, { children: i.label }, "a") : i.href ? _jsx("a", { href: i.href, children: i.label }) : _jsx("strong", { "aria-current": "page", children: i.label })] }, n)) }); }
export function Tabs({ tabs, value, onChange, label, orientation, activateOnFocus = true, loopFocus }) { const s = useAureaStrings(); const ancora = useRef(null); const resolvida = useValorResponsivo(orientation, "horizontal", ancora); return _jsxs(BaseTabs.Root, { ref: ancora, value: value, onValueChange: v => onChange(String(v)), orientation: resolvida, className: "tabs-root", children: [_jsx(BaseTabs.List, { className: "tabs", "aria-label": label ?? s.tabsLabel, activateOnFocus: activateOnFocus, loopFocus: loopFocus, children: tabs.map(t => _jsx(BaseTabs.Tab, { value: t.id, className: "tab", children: t.label }, t.id)) }), tabs.map(t => _jsx(BaseTabs.Panel, { value: t.id, className: "card card-inset", tabIndex: 0, children: t.content }, t.id))] }); }
export function Pagination({ page, total, onPageChange }) { const s = useAureaStrings(); return _jsxs("nav", { className: "pagination", "aria-label": s.paginationLabel, children: [_jsx(Button, { variant: "ghost", size: "sm", disabled: page <= 1, onClick: () => onPageChange(page - 1), children: s.previous }), _jsxs(Badge, { variant: "primary", children: [page, " / ", total] }), _jsx(Button, { variant: "ghost", size: "sm", disabled: page >= total, onClick: () => onPageChange(page + 1), children: s.next })] }); }
export function TableOfContents({ items, current, label, className, ...props }) {
    const s = useAureaStrings();
    const meu = React.useRef(null);
    const observado = useSecaoEmVista(items, current === undefined, meu);
    const atual = current ?? observado;
    // O `ref` do consumidor continua chegando: em React 19 ele é prop comum, então espalhá-lo por
    // `...props` depois do nosso o sobrescreveria em silêncio. Os dois são atendidos aqui.
    const refDele = props.ref;
    const { ref: _ignorado, ...resto } = props;
    return _jsxs("nav", { ref: n => { meu.current = n; if (typeof refDele === "function")
            refDele(n);
        else if (refDele)
            refDele.current = n; }, className: cx("toc", className), "aria-label": label ?? s.tocLabel, ...resto, children: [_jsx("p", { className: "toc-label", children: label ?? s.tocLabel }), items.map(i => _jsx("a", { href: `#${i.id}`, className: cx(i.sub && "toc-sub"), ...(i.id === atual ? { "aria-current": "true" } : {}), children: i.label }, i.id))] });
}
/** Qual dos `items` está na faixa de leitura, observando o documento. Devolve `undefined` até o
 *  primeiro cálculo — e em SSR, onde não há documento para observar.
 *
 *  A afinação NÃO é escolha nova: é a mesma do `tocSpy` do `aurea.js`, que já estava provada em
 *  produção. Uma faixa estreita no alto da janela (`-75%` embaixo), e vence o ÚLTIMO que a cruza,
 *  não o primeiro — seção e subseção cruzam juntas, e o específico é o que interessa. Nada
 *  cruzando quer dizer topo da página, e aí o atual é o primeiro item. Reimplementar com outra
 *  régua seria criar a terceira versão divergente do mesmo comportamento, que é o defeito que
 *  este componente existe para encerrar. */
function useSecaoEmVista(items, ligado, nav) {
    const [atual, setAtual] = React.useState(undefined);
    // os ids como string estável: sem isto o efeito re-roda a cada render, porque `items` é um
    // array novo toda vez que o pai renderiza.
    const ids = items.map(i => i.id).join(" ");
    React.useEffect(() => {
        if (!ligado)
            return;
        if (typeof IntersectionObserver === "undefined")
            return; // navegador antigo: fica lista de links
        const lista = ids ? ids.split(" ") : [];
        const alvos = lista.map(id => document.getElementById(id)).filter((e) => e !== null);
        if (!alvos.length)
            return;
        // O acordo com o runtime vanilla, e ele mora no EFEITO e não no render por um motivo medido:
        // o catálogo é gerado ESTÁTICO a partir deste mesmo componente. Marcar no render poria o
        // atributo nas páginas todas, onde não há React vivo para observar — e o `tocSpy` do
        // `aurea.js`, que é quem de fato marca lá, se afastaria de um substituto inexistente. Efeito
        // só roda onde há React de verdade, que é exatamente o que a marca precisa afirmar.
        nav.current?.setAttribute("data-toc-spy", "react");
        setAtual(alvos[0].id);
        const visivel = new Map();
        const obs = new IntersectionObserver(entradas => {
            for (const e of entradas)
                visivel.set(e.target.id, e.isIntersecting);
            let achado = alvos[0].id;
            for (const alvo of alvos)
                if (visivel.get(alvo.id))
                    achado = alvo.id;
            setAtual(achado);
        }, { rootMargin: "0px 0px -75% 0px" });
        for (const alvo of alvos)
            obs.observe(alvo);
        return () => obs.disconnect();
    }, [ids, ligado]);
    return ligado ? atual : undefined;
}
function flattenVisible(nodes, expanded, level = 1, parentId, acc = []) {
    for (const node of nodes) {
        acc.push({ node, level, parentId });
        if (node.children?.length && expanded.has(node.id))
            flattenVisible(node.children, expanded, level + 1, node.id, acc);
    }
    return acc;
}
export function TreeView({ items, defaultExpandedIds, onSelect, label, className }) {
    const s = useAureaStrings();
    const baseId = React.useId();
    const [expanded, setExpanded] = React.useState(() => new Set(defaultExpandedIds));
    const [selected, setSelected] = React.useState();
    const [active, setActive] = React.useState(() => items[0]?.id);
    const rootRef = React.useRef(null);
    const visible = flattenVisible(items, expanded);
    // Roving tab stop derivado: se o nó ativo saiu do conjunto visível (dados
    // trocados, nó removido), o primeiro visível volta a ser tabulável — senão a
    // árvore inteira fica tabIndex=-1 e some da ordem do Tab (auditoria, MÉDIO 1).
    const effectiveActive = active !== undefined && visible.some(v => v.node.id === active) ? active : visible[0]?.node.id;
    const focusId = (id) => { setActive(id); rootRef.current?.querySelector(`[data-tree-id="${CSS.escape(id)}"]`)?.focus(); };
    const toggle = (id, open) => setExpanded(prev => { const n = new Set(prev); if (open)
        n.add(id);
    else
        n.delete(id); return n; });
    const select = (node) => { setSelected(node.id); onSelect?.(node); };
    const onKeyDown = (e) => {
        const idx = visible.findIndex(v => v.node.id === effectiveActive);
        if (idx < 0)
            return;
        const cur = visible[idx], hasChildren = !!cur.node.children?.length, isOpen = expanded.has(cur.node.id);
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const expandKey = rtl ? "ArrowLeft" : "ArrowRight", collapseKey = rtl ? "ArrowRight" : "ArrowLeft";
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (idx < visible.length - 1)
                    focusId(visible[idx + 1].node.id);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (idx > 0)
                    focusId(visible[idx - 1].node.id);
                break;
            case expandKey:
                e.preventDefault();
                if (hasChildren && !isOpen)
                    toggle(cur.node.id, true);
                else if (hasChildren && isOpen)
                    focusId(cur.node.children[0].id);
                break;
            case collapseKey:
                e.preventDefault();
                if (hasChildren && isOpen)
                    toggle(cur.node.id, false);
                else if (cur.parentId)
                    focusId(cur.parentId);
                break;
            case "Home":
                e.preventDefault();
                focusId(visible[0].node.id);
                break;
            case "End":
                e.preventDefault();
                focusId(visible[visible.length - 1].node.id);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                select(cur.node);
                if (hasChildren)
                    toggle(cur.node.id, !isOpen);
                break;
        }
    };
    const renderNodes = (nodes, level) => (_jsx("ul", { ref: level === 1 ? rootRef : undefined, className: cx(level === 1 ? "tree" : "tree-group", level === 1 && className), role: level === 1 ? "tree" : "group", "aria-label": level === 1 ? (label ?? s.treeLabel) : undefined, onKeyDown: level === 1 ? onKeyDown : undefined, children: nodes.map(node => {
            const hasChildren = !!node.children?.length, isOpen = expanded.has(node.id), isSelected = selected === node.id, labelId = baseId + node.id;
            return _jsxs("li", { className: "tree-item", role: "treeitem", "data-tree-id": node.id, "aria-level": level, "aria-expanded": hasChildren ? isOpen : undefined, "aria-selected": isSelected, "aria-labelledby": labelId, tabIndex: node.id === effectiveActive ? 0 : -1, children: [_jsxs("span", { className: "tree-node", "data-selected": isSelected || undefined, style: { paddingInlineStart: `calc(var(--space-3) + ${level - 1} * var(--space-4))` }, onClick: () => { focusId(node.id); select(node); if (hasChildren)
                            toggle(node.id, !isOpen); }, children: [hasChildren ? _jsx(Icon, { name: "chevron--right", size: "sm", className: "tree-twist" }) : _jsx("span", { className: "tree-indent", "aria-hidden": "true" }), node.icon && _jsx(Icon, { name: node.icon, size: "sm" }), _jsx("span", { id: labelId, className: "tree-label", children: node.label })] }), hasChildren && isOpen && renderNodes(node.children, level + 1)] }, node.id);
        }) }));
    return renderNodes(items, 1);
}
function sidebarList(items, ctx, sub, labelledBy) {
    return _jsx("ul", { className: cx("sidebar-list", sub && "sidebar-sub"), "aria-labelledby": labelledBy, children: items.map(it => {
            const lid = ctx.baseId + it.id;
            const filhos = it.items?.length ? it.items : undefined;
            // Rótulo escondido vira `.sr-only` em vez de sumir do DOM: na lateral recolhida o item
            // continua tendo nome para quem usa leitor de tela. Ícone sozinho não nomeia nada.
            const oculto = (no) => ctx.collapsed ? _jsx("span", { className: "sr-only", children: no }) : no;
            if (filhos && !it.href && !it.onClick && !it.render)
                return _jsxs("li", { children: [_jsx("p", { id: lid, className: cx("sidebar-group-label", ctx.collapsed && "sr-only"), children: it.label }), sidebarList(filhos, ctx, false, lid)] }, it.id);
            const ativo = it.id === ctx.current;
            const miolo = _jsxs(_Fragment, { children: [it.icon && _jsx(Icon, { name: it.icon }), _jsx("span", { className: cx("sidebar-label", ctx.collapsed && "sr-only"), children: it.label }), it.badge != null && oculto(it.badge)] });
            const alvo = it.render
                ? fundirRender(it.render, { id: lid, className: "sidebar-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo }, "a")
                : it.href
                    ? _jsx("a", { id: lid, href: it.href, className: "sidebar-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo })
                    : _jsx("button", { id: lid, type: "button", className: "sidebar-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo });
            // NO TRILHO O NOME SÓ EXISTE NO TOOLTIP. Recolhida, a lateral manda o rótulo para `.sr-only`: quem
            // usa leitor de tela continua ouvindo, e quem ENXERGA fica com um ícone mudo. A referência resolve
            // isso com tooltip no `NavButton`, e é o que falta para um trilho de ícone não virar adivinhação.
            // Só quando recolhida: com o rótulo visível ao lado, o tooltip repetiria o que já está na tela.
            // `side="right"` porque a lateral encosta na borda esquerda — para cima o balão sairia do trilho.
            return _jsxs("li", { children: [ctx.collapsed ? _jsx(Tooltip, { content: it.label, side: "right", children: alvo }) : alvo, filhos && sidebarList(filhos, ctx, true, lid)] }, it.id);
        }) });
}
// A GAVETA FECHA AO ESCOLHER (A-06, 23/09/2026). Abaixo de lg a lateral do `AppShell` é popover,
// e a biblioteca a abria e NUNCA a fechava por código: `hidePopover` tinha zero ocorrências. O
// usuário tocava "Relatórios", a página trocava por baixo e a gaveta ficava na frente dela. Material 3,
// Fluent 2 e o guia de gaveta do iOS fecham ao escolher. O fechamento mora NA LATERAL, e não no
// item, para valer também para a navegação que o consumidor escreve e passa como `children` — o
// catálogo é um desses. Fora do popover (desktop, lateral solta) o teste de `:popover-open` falha e
// nada acontece. O `try` é porque `:popover-open` é seletor desconhecido em motor antigo, e lá o
// `matches` lança em vez de devolver falso.
function fecharGavetaAoEscolher(e) {
    if (e.defaultPrevented)
        return;
    const gaveta = e.currentTarget;
    const alvo = e.target?.closest?.("a[href], .sidebar-item");
    if (!alvo || !gaveta.contains(alvo))
        return;
    try {
        if (gaveta.matches(":popover-open"))
            gaveta.hidePopover();
    }
    catch { /* motor sem popover: não há gaveta */ }
}
export function Sidebar({ items, current, collapsed, variant = "floating", label, children, className, onClick, ...props }) {
    const s = useAureaStrings();
    const baseId = React.useId();
    return _jsxs("aside", { className: cx("sidebar", variant !== "floating" && `sidebar-${variant}`, collapsed && "sidebar-collapsed", className), onClick: e => { onClick?.(e); fecharGavetaAoEscolher(e); }, ...props, children: [items && items.length > 0 && _jsx("nav", { className: "sidebar-nav", "aria-label": label ?? s.sidebarLabel, children: sidebarList(items, { baseId, current, collapsed }) }), children] });
}
const LEGADO = {
    flat: ["edge", "none"], surface: ["floating", "circle"], pill: ["floating", "pill"], dock: ["floating", "circle"]
};
export function BottomNav({ items, current, variant = "floating", indicator = "none", width = "full", label, className, ...props }) {
    const s = useAureaStrings();
    const [layout, marca0] = variant in LEGADO ? LEGADO[variant] : [variant, indicator];
    // O indicador explícito ganha do que o nome legado implica: quem escreveu os dois quis os dois.
    const ind = indicator !== "none" ? indicator : marca0;
    return _jsx("nav", { className: cx("bottom-nav", layout === "edge" && "bottom-nav-edge", layout !== "edge" && width === "content" && "bottom-nav-content", `bottom-nav-ind-${ind}`, className), "aria-label": label ?? s.bottomNavLabel, ...props, children: items.map(it => {
            const ativo = it.id === current;
            // O CONTADOR PENDURA NO ÍCONE, e é por isso que existe esta caixa. Pendurado no ITEM (a
            // primeira versão), `50%` cai no meio do RÓTULO quando o item é linha — o Victor viu o número
            // cobrir o nome inteiro em 17/08/2026. A pesquisa (Material 3 e os guias de barra de abas do
            // iOS) diz a mesma coisa: canto superior do ÍCONE, encostando na borda dele, nunca sobre o
            // texto. A caixa é o que dá ao contador um canto para se ancorar — e nos quatro indicadores
            // redondos é ela que VIRA o círculo, com o rótulo embaixo, fora dele.
            // `size="lg"` porque a proporção contra o contador foi medida: 24 para 16, razão 0,67.
            const marca = _jsxs("span", { className: "bottom-nav-mark", children: [it.icon && _jsx(Icon, { name: it.icon, size: "lg" }), it.badge != null && _jsx("span", { className: "bottom-nav-badge", children: it.badge })] });
            const miolo = _jsxs(_Fragment, { children: [marca, _jsx("span", { className: "bottom-nav-label", children: it.label })] });
            return it.render
                ? _jsx(React.Fragment, { children: fundirRender(it.render, { className: "bottom-nav-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo }, "a") }, it.id)
                : it.href
                    ? _jsx("a", { href: it.href, className: "bottom-nav-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo }, it.id)
                    : _jsx("button", { type: "button", className: "bottom-nav-item", "aria-current": ativo ? "page" : undefined, onClick: it.onClick, children: miolo }, it.id);
        }) });
}
export function NavList({ items, className, ...props }) {
    return _jsx("ul", { className: cx("nav-list", className), ...props, children: items.map(it => {
            const miolo = _jsxs(_Fragment, { children: [it.icon && _jsx(Icon, { name: it.icon }), _jsxs("span", { className: "nav-list-text", children: [_jsx("span", { className: "nav-list-label", children: it.label }), it.description != null && _jsx("span", { className: "nav-list-description", children: it.description })] }), it.value != null && _jsx("span", { className: "nav-list-value", children: it.value }), (it.href || it.render) && _jsx(Icon, { name: "chevron--right", size: "sm", className: "nav-list-chevron" })] });
            return _jsx("li", { children: it.render && !it.disabled
                    ? fundirRender(it.render, { className: "nav-list-row", onClick: it.onClick, children: miolo }, "a")
                    : it.href && !it.disabled
                        ? _jsx("a", { href: it.href, className: "nav-list-row", onClick: it.onClick, children: miolo })
                        : _jsx("button", { type: "button", className: "nav-list-row", "aria-disabled": it.disabled || undefined, onClick: it.disabled ? undefined : it.onClick, children: miolo }) }, it.id);
        }) });
}
export function CommandPalette({ open, onClose, items, placeholder, label }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    if (!open)
        return null;
    // SEM AGRUPAMENTO na v1, e a medição é que decidiu (13/08/2026). O `Autocomplete.Root` não
    // consome a estrutura agrupada como o `Combobox.Root` consome — e o caminho alternativo, dar a
    // cada `Group` a sua fatia de itens, PASSA POR CIMA do filtro do motor: digitar "the" devolvia
    // os três comandos. Entre agrupar e filtrar, filtrar é o ponto de uma paleta de comandos.
    // Fica registrado como limite, não como esquecimento: quando alguém precisar de grupo aqui, o
    // caminho é o `Combobox.Root`, e isso é troca de motor, não ajuste.
    const executa = (item) => { onClose(); item.run(); };
    const linha = (item) => _jsxs(BaseAutocomplete.Item, { value: item, className: "menu-item command-item", onClick: () => executa(item), children: [item.icon && _jsx(Icon, { name: item.icon }), _jsx("span", { className: "command-item-label", children: item.label }), item.kbd && _jsx(Kbd, { children: item.kbd })] }, item.id);
    // Escape fecha, e é o teclado que a pessoa tenta primeiro. O motor não fecha sozinho porque
    // quem é dono do `open` é o consumidor — mesma regra do Dialog e do Drawer daqui.
    return _jsx("div", { className: "command-overlay", onKeyDown: e => { if (e.key === "Escape")
            onClose(); }, children: _jsx("div", { className: "command-palette", role: "dialog", "aria-label": label ?? s.commandLabel, children: _jsxs(BaseAutocomplete.Root, { items: items, itemToStringValue: (i) => i.label, mode: "list", open: true, children: [_jsx(BaseAutocomplete.Input, { autoFocus: true, className: "input", onKeyDown: e => { if (e.key === "Escape")
                            onClose(); }, "aria-label": placeholder ?? s.commandPlaceholder, placeholder: placeholder ?? s.commandPlaceholder }), _jsx(BaseAutocomplete.Portal, { container: portal, children: _jsx(BaseAutocomplete.Positioner, { sideOffset: 6, className: "command-positioner", children: _jsxs(BaseAutocomplete.Popup, { className: "menu command-list", children: [_jsx(BaseAutocomplete.Empty, { className: "combobox-empty", children: s.comboboxEmpty }), _jsx(BaseAutocomplete.List, { children: _jsx(BaseAutocomplete.Collection, { children: linha }) })] }) }) })] }) }) });
}
export function CommandPaletteShell({ open, query, onQueryChange, children }) { const s = useAureaStrings(); if (!open)
    return null; return _jsx("div", { className: "command-overlay", children: _jsxs("div", { className: "command-palette", role: "dialog", "aria-label": s.commandLabel, children: [_jsx(SearchField, { autoFocus: true, "aria-label": s.commandPlaceholder, value: query, onChange: e => onQueryChange(e.target.value), placeholder: s.commandPlaceholder }), children] }) }); }
