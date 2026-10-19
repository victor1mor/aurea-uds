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
import { Button, IconButton, CloseButton } from "./actions.js";
// NotificationCenter aceita `side`: o tipo é do módulo que define overlay, não uma cópia.
import { Dialog } from "./overlays.js";
// `oracle` saiu daqui (achado M9, 26/07/2026): estava no tipo e no CSS, e NÃO estava na
// ficha — ou seja, era superfície pública que o contrato não declarava. E é vocabulário do
// app de origem (papel de agente), não do sistema, como as classes de domínio que o achado
// A6 mapeou. As classes `.badge-oracle`/`.btn-oracle` seguem no core porque o
// `apps/docs/index.html` escrito à mão as usa; saem junto com ele, na Fase 4 do plano.
// `.btn-oracle` nunca foi alcançável pelo React — `ButtonVariant` não tem `oracle`.
import { Skeleton, Badge, Switch } from "./markup.js";
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
const ICONE_DA_VARIANTE = { info: "info",
    success: "check-circle", warning: "warning", danger: "x-circle", accent: "info" };
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
// `action` (15/10/2026, o "Upgrade" da referência): o botão do aviso, depois do texto e antes do X; no celular ele desce
// para baixo do texto, na mesma coluna (a referência repete o botão; aqui ele só muda de lugar).
export function Alert({ variant, state, title, icon, onDismiss, action, children, className, ...props }) { const s = useAureaStrings(); const v = variant ?? (state ? stateSeverity(state) : "info"); return _jsxs("div", { className: cx("alert", `alert-${v}`, action != null && "alert-has-action", className), role: v === "danger" ? "alert" : "status", "data-state": state, ...props, children: [_jsx(Icon, { name: icon ?? ICONE_DA_VARIANTE[v], weight: icon ? undefined : "fill" }), _jsxs("div", { children: [title && _jsx("strong", { children: title }), children ?? (state ? s.universalState[state] : null)] }), action != null && _jsx("div", { className: "alert-action", children: action }), onDismiss ? _jsx(CloseButton, { onClick: onDismiss }) : _jsx("span", {})] }); }
export function Banner(props) {
    if (props.variant === "consent")
        return _jsx(BannerConsent, { ...props });
    const { variant, state, title, icon, onDismiss, children, className, categories: _c, value: _v, onConsent: _o, ...rest } = props;
    const s = useAureaStrings();
    const v = variant ?? (state ? stateSeverity(state) : "info");
    return _jsxs("div", { className: cx("banner", `banner-${v}`, className), role: v === "danger" ? "alert" : "status", "data-state": state, ...rest, children: [icon ? _jsx(Icon, { name: icon }) : _jsx("span", {}), _jsxs("div", { children: [title && _jsx("strong", { children: title }), children ?? (state ? s.universalState[state] : null)] }), onDismiss ? _jsx(IconButton, { variant: "ghost", size: "sm", icon: "x", label: s.close, onClick: onDismiss }) : _jsx("span", {})] });
}
// GAR-19 (lote U, 19/10/2026): o aviso de cookies é uma VARIAÇÃO do Banner (decisão do Victor). Nenhuma referência da fila
// tem a peça aberta; as regras vêm de duas fontes primárias, lidas em 19/10/2026:
// - o guia de cookies da ANPD (págs. 30–33): no primeiro nível, o botão de rejeitar os não necessários, tão fácil de ver
//   quanto o de aceitar (nada de destaque só no aceite); categoria não necessária DESLIGADA por padrão; um segundo nível
//   com as categorias; e um jeito direto de mudar a escolha depois. Os três botões são os do exemplo do guia.
// - o aviso de cookies do governo britânico: no alto da página, sem `position:fixed` (que cobriria o foco — WCAG 2.4.11),
//   uma região com nome e título h2, e a confirmação depois da escolha com `role="alert"`, que recebe o foco.
// O app guarda a escolha (`onConsent`) e deixa de desenhar o aviso; para mudar depois, desenha de novo, com `value`.
function BannerConsent({ title, icon: _icon, state: _state, variant: _variant, onDismiss, categories = [], value, onConsent, children, className, ...props }) {
    const s = useAureaStrings();
    const tituloId = React.useId();
    const inicial = React.useCallback(() => Object.fromEntries(categories.map(c => [c.id, c.required ? true : value?.[c.id] === true])), [categories, value]);
    const [escolha, setEscolha] = React.useState(inicial);
    const [aberta, setAberta] = React.useState(false);
    const [feito, setFeito] = React.useState(null);
    const [oculto, setOculto] = React.useState(false);
    const aviso = React.useRef(null);
    // A confirmação recebe o foco quando aparece: o botão que a pessoa apertou some com a pergunta.
    React.useEffect(() => { if (feito)
        aviso.current?.focus(); }, [feito]);
    const escolher = (acao, custom) => {
        const final = Object.fromEntries(categories.map(c => [c.id, c.required ? true : acao === "accept-all" ? true : acao === "reject" ? false : custom?.[c.id] === true]));
        setEscolha(final);
        setAberta(false);
        setFeito(acao);
        onConsent?.(final, acao);
    };
    if (oculto)
        return null;
    const confirmacao = feito === "accept-all" ? s.consentAccepted : feito === "reject" ? s.consentRejected : s.consentSaved;
    return _jsxs("div", { role: "region", "aria-labelledby": tituloId, className: cx("banner", "banner-consent", className), ...props, children: [_jsx("h2", { id: tituloId, className: "banner-consent-title", children: title ?? s.consentTitle }), feito
                ? _jsxs(_Fragment, { children: [_jsx("div", { ref: aviso, role: "alert", tabIndex: -1, className: "banner-consent-message", children: confirmacao }), _jsx("div", { className: "banner-consent-actions", children: _jsx(Button, { variant: "secondary", onClick: () => { onDismiss ? onDismiss() : setOculto(true); }, children: s.consentHide }) })] })
                : _jsxs(_Fragment, { children: [_jsx("div", { className: "banner-consent-text", children: children }), _jsxs("div", { className: "banner-consent-actions", children: [_jsx(Button, { variant: "secondary", onClick: () => escolher("reject"), children: s.consentReject }), _jsx(Button, { variant: "secondary", onClick: () => escolher("accept-all"), children: s.consentAccept }), _jsx(Button, { variant: "tertiary", onClick: () => { setEscolha(inicial()); setAberta(true); }, children: s.consentChoose })] })] }), _jsx(Dialog, { open: aberta, title: s.consentPreferences, onClose: () => setAberta(false), footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", onClick: () => escolher("reject"), children: s.consentReject }), _jsx(Button, { variant: "secondary", onClick: () => escolher("accept-all"), children: s.consentAccept }), _jsx(Button, { variant: "primary", onClick: () => escolher("custom", escolha), children: s.consentSave })] }), children: _jsx("div", { className: "banner-consent-categories", children: categories.map(c => c.required
                        ? _jsxs("div", { className: "banner-consent-required", children: [_jsxs("div", { className: "banner-consent-required-head", children: [_jsx("strong", { children: c.label }), _jsx(Badge, { children: s.consentRequired })] }), c.description != null && _jsx("p", { children: c.description })] }, c.id)
                        : _jsx(Switch, { label: c.label, description: c.description, checked: escolha[c.id] === true, onChange: (e) => { const ligado = e.currentTarget.checked; setEscolha(atual => ({ ...atual, [c.id]: ligado })); } }, c.id)) }) })] });
}
export function Spinner({ size = "md", label, decorative, className, ...props }) { const s = useAureaStrings(); return _jsx("span", { className: cx("spinner", peleDoEixo("spinner", size, "sm", "spinner"), className), ...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": label ?? s.loading }), ...props }); }
// `children` como FUNÇÃO é de propósito para o caso `loading`: assim o consumidor não paga o
// render do conteúdo enquanto ele não existe. Aceita nó também, porque a maioria das telas já
// tem o conteúdo pronto e obrigar função seria cerimônia.
// MNT-25 (passo 10, 0.32.0): A BARREIRA DE ERRO, como variação do `DataState` (escolha do Victor,
// 12/10/2026: escrita na Aurea, sem dependência nova; variação, e não peça nova). Um erro de desenho no app
// de rede deixou a tela inteira em branco. Com `catchErrors`, o que quebra DENTRO do `DataState` vira a
// cara de erro dele (a mensagem e "Tentar de novo"), e o resto da tela fica. O React só pega erro de
// desenho com um componente de CLASSE (não há gancho para isso) — é o jeito que ele manda, e o único.
// `onCatch`, e não `onError`: `onError` já é o evento do HTML que o `DataState` repassa ao `<div>`.
// O que a barreira NÃO pega (é do React, não daqui): erro em evento de clique, em código assíncrono e no
// desenho no servidor.
class BarreiraDeErro extends React.Component {
    state = { quebrou: false };
    static getDerivedStateFromError() { return { quebrou: true }; }
    componentDidCatch(erro, info) { this.props.onCatch?.(erro, info); }
    tentar = () => this.setState({ quebrou: false });
    render() { return this.state.quebrou ? this.props.falha(this.tentar) : this.props.children; }
}
export function DataState({ catchErrors, onCatch, ...props }) {
    const s = useAureaStrings();
    if (!catchErrors)
        return _jsx(CorpoDoDataState, { ...props });
    return _jsx(BarreiraDeErro, { onCatch: onCatch, falha: tentar => _jsxs("div", { className: cx("data-state", props.className), "data-state": "error", children: [_jsx(Alert, { variant: "danger", children: props.message ?? s.dataCrashed }), _jsx("div", { children: _jsx(Button, { size: "sm", onClick: tentar, children: s.dataRetry }) })] }), children: _jsx(CorpoDoDataState, { ...props }) });
}
function CorpoDoDataState({ state, message, skeleton, emptyTitle, emptyIcon, action, children, className, ...props }) {
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
export function EmptyState({ icon = "file", title, titleAs: TitleTag = "h3", description, action, state }) { const s = useAureaStrings(); const desc = description ?? (state ? s.universalState[state] : null); return _jsxs("div", { className: "empty-state", "data-state": state, children: [_jsx(Icon, { name: icon, size: "xl" }), _jsx(TitleTag, { className: "empty-title", children: title }), desc && _jsx("p", { className: "muted", children: desc }), action] }); }
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
export function NotificationCenter({ items, onItemClick, onMarkAllRead, label, icon = "bell", side = "bottom" }) {
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
    return _jsxs(BasePopover.Root, { children: [_jsxs("span", { className: "notification-trigger", children: [_jsx(BasePopover.Trigger, { render: _jsx(IconButton, { variant: "ghost", icon: icon, label: unread ? `${title} (${unread})` : title }) }), unread > 0 && _jsx("span", { className: "notification-count", "aria-hidden": "true", children: unread > 99 ? "99+" : unread })] }), _jsx(BasePopover.Portal, { container: portal, children: _jsx(BasePopover.Positioner, { className: "positioner", side: side, sideOffset: 8, children: _jsxs(BasePopover.Popup, { className: "popover notification-panel", "aria-label": title, children: [_jsxs("div", { className: "notification-head", children: [_jsx(BasePopover.Title, { render: _jsx("strong", {}), children: title }), unread > 0 && onMarkAllRead && _jsx(Button, { variant: "ghost", size: "sm", onClick: onMarkAllRead, children: s.notificationMarkAll })] }), items.length
                                ? _jsx("div", { className: "notification-list", children: groups.map((g, gi) => {
                                        const gid = baseId + gi;
                                        return _jsxs(React.Fragment, { children: [g.label && _jsx("p", { className: "notification-group-label", id: gid, children: g.label }), _jsx("ul", { className: "notification-sublist", "aria-labelledby": g.label ? gid : undefined, children: g.items.map(it => _jsx("li", { children: renderRow(it) }, it.id)) })] }, gi);
                                    }) })
                                : _jsx("p", { className: "notification-empty", children: s.notificationEmpty })] }) }) }), _jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", children: announce })] });
}
