"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
import { peleDoEixo } from "./pure.js";
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cx, useAureaStrings, usePortalContainer, stateSeverity } from "./internal.js";
import { Icon } from "./system.js";
import { Button, IconButton } from "./actions.js";
// `oracle` saiu daqui (achado M9, 26/07/2026): estava no tipo e no CSS, e NÃO estava na
// ficha — ou seja, era superfície pública que o contrato não declarava. E é vocabulário do
// app de origem (papel de agente), não do sistema, como as classes de domínio que o achado
// A6 mapeou. As classes `.badge-oracle`/`.btn-oracle` seguem no core porque o
// `apps/docs/index.html` escrito à mão as usa; saem junto com ele, na Fase 4 do plano.
// `.btn-oracle` nunca foi alcançável pelo React — `ButtonVariant` não tem `oracle`.
import { Skeleton } from "./markup.js";
// Status (DIRECTION §3.6): condição OPERACIONAL — ponto + rótulo. Não é Badge: Badge é
// metadado curto num pill; Status diz em que estado a coisa está. Reusa o .status-dot que
// já existia solto. A variante colore só o PONTO (currentColor); o rótulo fica legível em
// --foreground. Cor não é o único sinal — quem diz o estado é o texto (WCAG 1.4.1); o
// ponto é decorativo e sai do leitor de tela. ponytail: rótulo é do consumidor (sem i18n
// nova) — a variante é só a cor.
// `state` (Parte J) é EIXO À PARTE de `variant`, e os dois convivem: a variante é a cor do
// ponto, o estado é a condição universal. Quem passa `state` e não passa `variant` recebe a
// cor derivada — `offline` fica com o ponto vazado que ele já tinha desde sempre, os outros
// seis caem na gravidade. Quem passa os dois manda, porque só o consumidor sabe se aquele
// "esperando" dele é grave. E o rótulo é o do consumidor, como sempre foi: a string universal
// entra só quando não há filho, para o componente não passar a inventar texto.
export function Status({ variant, state, children, className, ...props }) { const s = useAureaStrings(); const v = variant ?? (state ? (state === "offline" ? "offline" : stateSeverity(state)) : "neutral"); return _jsxs("span", { className: cx("status", v !== "neutral" && `status-${v}`, className), "data-state": state, ...props, children: [_jsx("i", { className: "status-dot", "aria-hidden": "true" }), _jsx("span", { className: "status-label", children: children ?? (state ? s.universalState[state] : null) })] }); }
// O ícone é FUNÇÃO da variante, como o `role` já era. A referência congelada desenha o alerta
// com ele em toda variante, e um sistema que faz o consumidor lembrar qual glifo significa
// "perigo" acaba com quatro respostas diferentes para a mesma pergunta. `icon` sobrepõe quando o
// caso é específico. O Banner NÃO ganha o mesmo padrão de propósito: ele não existe na
// referência e o aviso de largura de página nem sempre quer glifo — a assimetria é decidida,
// não herdada.
const ICONE_DA_VARIANTE = { info: "information--filled",
    success: "checkmark--filled", warning: "warning--alt--filled", danger: "error--filled" };
// A grade do `.alert` tem TRÊS trilhas (auto 1fr auto): ícone, corpo, ação. Uma versão anterior
// emitia o título solto na trilha 1 — a do ícone — e o corpo como item anônimo. Medido no
// navegador em 21/08/2026: o título ocupava a coluna do ícone e crescia com o próprio texto,
// enquanto a referência dá 300px de trilha ao ícone e 544px ao corpo. Título e corpo vão JUNTOS
// na trilha 2, dentro de um <div>, que é o que a referência faz.
// `<strong>` e não `<h4>`: um alerta aparece em qualquer profundidade da página e um h4 fixo
// quebra a ordem de cabeçalhos onde ele cair (é a razão de o EmptyState ter `titleAs`).
//
// A anatomia das três trilhas voltou em 29/08/2026: o merge das duas linhagens ficou com a
// versão sem ícone, e os oito testes do `grade-do-core.test.tsx` foram o que pegou. `state` é da
// outra linhagem e fica: é EIXO À PARTE de `variant` — a variante é a cor, o estado é a condição
// universal. Quem passa só `state` recebe a cor derivada da gravidade e o rótulo universal
// quando não há filho; quem passa os dois manda, porque só o consumidor sabe se aquele
// "esperando" dele é grave.
export function Alert({ variant, state, title, icon, onDismiss, children, className, ...props }) { const s = useAureaStrings(); const v = variant ?? (state ? stateSeverity(state) : "info"); return _jsxs("div", { className: cx("alert", `alert-${v}`, className), role: v === "danger" ? "alert" : "status", "data-state": state, ...props, children: [_jsx(Icon, { name: icon ?? ICONE_DA_VARIANTE[v] }), _jsxs("div", { children: [title && _jsx("strong", { children: title }), children ?? (state ? s.universalState[state] : null)] }), onDismiss ? _jsx(IconButton, { variant: "ghost", size: "sm", icon: "close", label: s.close, onClick: onDismiss }) : _jsx("span", {})] }); }
export function Banner({ variant, state, title, icon, onDismiss, children, className, ...props }) { const s = useAureaStrings(); const v = variant ?? (state ? stateSeverity(state) : "info"); return _jsxs("div", { className: cx("banner", `banner-${v}`, className), role: v === "danger" ? "alert" : "status", "data-state": state, ...props, children: [icon ? _jsx(Icon, { name: icon }) : _jsx("span", {}), _jsxs("div", { children: [title && _jsx("strong", { children: title }), children ?? (state ? s.universalState[state] : null)] }), onDismiss ? _jsx(IconButton, { variant: "ghost", size: "sm", icon: "close", label: s.close, onClick: onDismiss }) : _jsx("span", {})] }); }
// A barra grampeava 0..100 e o `aria-valuenow` NÃO — medido ao publicar o contrato de API na
// Parte E: com value=150 o desenho parava em 100% e o leitor de tela anunciava "150 de 100".
// A causa é a de sempre: o grampo existia num lugar só. Agora é UMA expressão que serve os dois,
// então não há como divergirem de novo.
// SÓ DETERMINADA, de propósito: não há modo indeterminado nem `.progress` para ele no core. A
// ficha dizia que havia e era falso — corrigido junto, porque contrato que promete o que não
// existe custa mais que ausência.
// O DEGRAU RESPONSIVO volta (merge de 28/08/2026): a ficha declara `responsive.size` e o
// componente tinha perdido a capacidade quando este arquivo entrou da `main`. Mesma perda
// silenciosa do `Input`, do `Tabs` e do `NumberField` — a ficha documentava, o código não fazia.
export function Spinner({ size, label, decorative, className, ...props }) { const s = useAureaStrings(); return _jsx("span", { className: cx("spinner", peleDoEixo("spinner", size, "sm", "spinner"), className), ...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": label ?? s.loading }), ...props }); }
// `children` como FUNÇÃO é de propósito para o caso `loading`: assim o consumidor não paga o
// render do conteúdo enquanto ele não existe. Aceita nó também, porque a maioria das telas já
// tem o conteúdo pronto e obrigar função seria cerimônia.
export function DataState({ state, message, skeleton, emptyTitle, emptyIcon, action, children, className, ...props }) {
    const s = useAureaStrings();
    const conteudo = () => typeof children === "function" ? children() : children;
    const caixa = (inner, ocupado) => _jsx("div", { className: cx("data-state", className), "aria-busy": ocupado || undefined, "data-state": state, ...props, children: inner });
    if (state === "loading")
        return caixa(skeleton ?? _jsx(Skeleton, { style: { height: "var(--space-8)" } }), true);
    if (state === "error")
        return caixa(_jsx(Alert, { variant: "danger", children: message ?? s.dataError }));
    // `titleAs="p"` e não o `h3` padrão do EmptyState: aqui o vazio é estado de uma REGIÃO, não
    // seção do documento. Injetar um h3 no meio do conteúdo do consumidor salta nível de título —
    // o gate de hierarquia pegou (`salto h1 → h3`) e o axe repetiu como `heading-order`.
    if (state === "empty")
        return caixa(_jsx(EmptyState, { icon: emptyIcon, titleAs: "p", title: emptyTitle ?? s.dataEmpty, description: message, action: action }));
    // Os universais NÃO substituem o conteúdo: eles o acompanham. É a regra do DataGrid, e o
    // motivo é o mesmo — a pessoa precisa do dado E do aviso, não de um no lugar do outro.
    if (state)
        return caixa(_jsxs(_Fragment, { children: [_jsx(Alert, { variant: stateSeverity(state), state: state, children: message }), conteudo()] }));
    return caixa(conteudo());
}
export function EmptyState({ icon = "document--blank", title, titleAs: TitleTag = "h3", description, action, state }) { const s = useAureaStrings(); const desc = description ?? (state ? s.universalState[state] : null); return _jsxs("div", { className: "empty-state", "data-state": state, children: [_jsx(Icon, { name: icon, size: "xl" }), _jsx(TitleTag, { className: "empty-title", children: title }), desc && _jsx("p", { className: "muted", children: desc }), action] }); }
function groupNotifications(items) {
    const out = [];
    for (const it of items) {
        const last = out[out.length - 1];
        if (last && last.label === it.group)
            last.items.push(it);
        else
            out.push({ label: it.group, items: [it] });
    }
    return out;
}
export function NotificationCenter({ items, onItemClick, onMarkAllRead, label, icon = "notification", side = "bottom" }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    const title = label ?? s.notificationsLabel;
    const unread = items.filter(i => !i.read).length;
    const groups = groupNotifications(items);
    const baseId = React.useId();
    const seen = React.useRef(undefined);
    const [announce, setAnnounce] = React.useState("");
    React.useEffect(() => {
        const ids = new Set(items.map(i => i.id));
        if (seen.current === undefined) {
            seen.current = ids;
            return;
        }
        const fresh = items.filter(i => !seen.current.has(i.id)).length;
        seen.current = ids;
        // Texto idêntico duas vezes seguidas não muta o DOM e o leitor silencia a 2ª
        // chegada (auditoria 18/07/2026, MÉDIO 4). Um NBSP alternado no fim força a
        // mutação sem mudar o que se ouve.
        if (fresh)
            setAnnounce(prev => { const text = `${fresh} ${s.notificationNew}`; return prev === text ? text + " " : text; });
    }, [items, s.notificationNew]);
    const renderRow = (it) => {
        const body = _jsxs(_Fragment, { children: [_jsx("span", { className: "notification-dot", "aria-hidden": "true" }), _jsxs("span", { className: "notification-item-title", children: [it.icon && _jsx(Icon, { name: it.icon, size: "sm" }), !it.read && _jsxs("span", { className: "sr-only", children: [s.notificationUnread, " "] }), it.title] }), it.time && _jsx("span", { className: "notification-time", children: it.time }), it.description && _jsx("span", { className: "notification-item-desc", children: it.description })] });
        return it.onClick || onItemClick
            ? _jsx("button", { type: "button", className: "notification-item", "data-read": it.read || undefined, onClick: () => { it.onClick?.(); onItemClick?.(it); }, children: body })
            : _jsx("div", { className: "notification-item", "data-read": it.read || undefined, children: body });
    };
    return _jsxs(BasePopover.Root, { children: [_jsxs("span", { className: "notification-trigger", children: [_jsx(BasePopover.Trigger, { render: _jsx(IconButton, { variant: "ghost", icon: icon, label: unread ? `${title} (${unread})` : title }) }), unread > 0 && _jsx("span", { className: "notification-count", "aria-hidden": "true", children: unread > 99 ? "99+" : unread })] }), _jsx(BasePopover.Portal, { container: portal, children: _jsx(BasePopover.Positioner, { side: side, sideOffset: 8, children: _jsxs(BasePopover.Popup, { className: "popover notification-panel", "aria-label": title, children: [_jsxs("div", { className: "notification-head", children: [_jsx(BasePopover.Title, { render: _jsx("strong", {}), children: title }), unread > 0 && onMarkAllRead && _jsx(Button, { variant: "ghost", size: "sm", onClick: onMarkAllRead, children: s.notificationMarkAll })] }), items.length
                                ? _jsx("div", { className: "notification-list", children: groups.map((g, gi) => {
                                        const gid = baseId + gi;
                                        return _jsxs(React.Fragment, { children: [g.label && _jsx("p", { className: "notification-group-label", id: gid, children: g.label }), _jsx("ul", { className: "notification-sublist", "aria-labelledby": g.label ? gid : undefined, children: g.items.map(it => _jsx("li", { children: renderRow(it) }, it.id)) })] }, gi);
                                    }) })
                                : _jsx("p", { className: "notification-empty", children: s.notificationEmpty })] }) }) }), _jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", children: announce })] });
}
