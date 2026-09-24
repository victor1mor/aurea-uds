"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, { useRef } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { cx, useAureaStrings, usePortalContainer } from "./internal.js";
import { useValorResponsivo } from "./responsivo-runtime.js";
import { Icon } from "./system.js";
import { Button } from "./actions.js";
export function Dialog({ open, title, children, footer, onClose, size = "md", dismissible = true }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    return _jsx(BaseDialog.Root, { open: open, disablePointerDismissal: !dismissible, onOpenChange: o => { if (!o && dismissible)
            onClose(); }, children: _jsxs(BaseDialog.Portal, { container: portal, children: [_jsx(BaseDialog.Backdrop, { className: "dialog-backdrop" }), _jsxs(BaseDialog.Popup, { className: cx("dialog", size !== "md" && `dialog-${size}`), children: [_jsxs("header", { children: [_jsx(BaseDialog.Title, { render: _jsx("h2", {}), children: title }), _jsx(BaseDialog.Close, { className: "btn btn-ghost btn-icon", "aria-label": s.close, disabled: !dismissible, children: _jsx(Icon, { name: "close" }) })] }), _jsx("div", { className: "dialog-body", children: children }), footer && _jsx("footer", { children: footer })] })] }) });
}
// ConfirmDialog (M5): a decisão que não se fecha por engano. NÃO é um Dialog com dois botões —
// é `role="alertdialog"`, e a diferença é de comportamento, não de aparência: o Base UI tira do
// AlertDialog.Root as props `modal` e `disablePointerDismissal` (medido no d.ts de 1.6.0), ou
// seja, clicar fora NÃO fecha. Num Dialog comum, clicar fora vira "cancelei" sem a pessoa ter
// decidido — que é exatamente o acidente que este componente existe para impedir.
//
// FOCO NO BOTÃO SEGURO: quem abre um "isto apaga" e aperta Enter por reflexo tem de cancelar,
// não apagar. As quatro referências convergem em cancelar-antes-de-agir na ORDEM visual, e
// nenhuma delas move o foco — este passo saiu de medir o teclado, não de ler.
//
// DUAS coisas garantem, e as duas foram medidas em 13/08/2026, uma de cada vez:
//   • a ORDEM do DOM — o Cancelar vem primeiro, e o motor foca o primeiro focável. Sozinha, ela
//     já faz o teste passar; tirar só o `initialFocus` NÃO reprova.
//   • o `initialFocus`, que é o cinto: com a ordem dos dois botões INVERTIDA ele continua
//     segurando o foco no Cancelar, e é aí que ele prova que não é enfeite. Sem ele e com a
//     ordem invertida, o teste reprova — que é o defeito de verdade, porque inverter a ordem é
//     uma mudança de aparência que alguém faz sem pensar no teclado.
// O teste cobra o EFEITO ("o foco nasce no seguro"), não o mecanismo. É por isso que ele
// sobrevive a trocar um dos dois — e reprova quando os dois somem.
//
// ESCOPO MENOR que a referência (BUILDING.md §5): lá são nove peças compostas
// (Root/Trigger/Content/Header/Title/Description/Footer/Cancel/Action). Aqui é uma prop `open`,
// como no `Dialog` e no `Drawer` — a composição não acrescenta escolha nenhuma num diálogo cujo
// corpo é uma frase e dois botões.
//
// `description` é prop e não `children` porque ela é o nó de `aria-describedby`: o AlertDialog
// só anuncia o que passa pelo `Description`. Como `children`, um consumidor poria um <div> no
// meio e o leitor de tela perderia a frase que diz o que se perde.
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    const seguro = React.useRef(null);
    return _jsx(BaseAlertDialog.Root, { open: open, onOpenChange: o => { if (!o)
            onCancel(); }, children: _jsxs(BaseAlertDialog.Portal, { container: portal, children: [_jsx(BaseAlertDialog.Backdrop, { className: "dialog-backdrop" }), _jsxs(BaseAlertDialog.Popup, { className: "dialog dialog-confirm", initialFocus: seguro, children: [_jsx("header", { children: _jsx(BaseAlertDialog.Title, { render: _jsx("h2", {}), children: title }) }), _jsx(BaseAlertDialog.Description, { className: "dialog-body", children: description }), _jsxs("footer", { children: [_jsx(Button, { ref: seguro, variant: "secondary", onClick: onCancel, children: cancelLabel ?? s.confirmCancel }), _jsx(Button, { variant: destructive ? "danger" : "primary", onClick: onConfirm, children: confirmLabel ?? s.confirmProceed })] })] })] }) });
}
export function Drawer({ open, title, children, onClose, side = "right" }) { const s = useAureaStrings(); const portal = usePortalContainer(); return _jsx(BaseDialog.Root, { open: open, onOpenChange: o => { if (!o)
        onClose(); }, children: _jsxs(BaseDialog.Portal, { container: portal, children: [_jsx(BaseDialog.Backdrop, { className: "drawer-backdrop" }), _jsxs(BaseDialog.Popup, { className: cx("drawer", `drawer-${side}`), children: [_jsxs("header", { children: [_jsx(BaseDialog.Title, { render: _jsx("h2", {}), children: title }), _jsx(BaseDialog.Close, { className: "btn btn-ghost btn-icon", "aria-label": s.close, children: _jsx(Icon, { name: "close" }) })] }), children] })] }) }); }
export function AccessGate({ allowed, children, ...resto }) {
    if (allowed)
        return children;
    if (resto.mode === "disable")
        return _jsx(Tooltip, { content: resto.reason, children: React.cloneElement(children, { "aria-disabled": true }) });
    return _jsx(_Fragment, { children: resto.fallback ?? null });
}
// `role="tooltip"` + `aria-describedby` no disparador é o que faz a dica EXISTIR para leitor
// de tela. Medido em 30/07/2026: sem isso, o popup saía sem role e sem id, e o disparador sem
// aria-describedby — quem navega por leitor de tela ouvia só o rótulo do botão e nunca o
// conteúdo da dica. Era tooltip visual, não acessível (padrão APG Tooltip).
// O id aponta para um elemento que só existe quando aberto; referência pendente é ignorada
// pela tecnologia assistiva, então não precisa acompanhar o estado.
export function Tooltip({ children, content, side = "top" }) { const id = React.useId(); const triggerId = children.props.id; const portal = usePortalContainer(); return _jsxs(BaseTooltip.Root, { children: [_jsx(BaseTooltip.Trigger, { id: triggerId, render: children, "aria-describedby": id }), _jsx(BaseTooltip.Portal, { container: portal, children: _jsx(BaseTooltip.Positioner, { side: side, sideOffset: 8, children: _jsx(BaseTooltip.Popup, { id: id, role: "tooltip", className: "tooltip", children: content }) }) })] }); }
export function Popover({ trigger, title, children, side = "bottom" }) { const portal = usePortalContainer(); return _jsxs(BasePopover.Root, { children: [_jsx(BasePopover.Trigger, { render: trigger }), _jsx(BasePopover.Portal, { container: portal, children: _jsx(BasePopover.Positioner, { side: side, sideOffset: 8, children: _jsxs(BasePopover.Popup, { className: "popover", children: [title && _jsx(BasePopover.Title, { render: _jsx("strong", {}), children: title }), children] }) }) })] }); }
// HoverCard (Lote 1 do BUILDING.md). Não é Tooltip nem Popover, e a diferença é de propósito,
// não de aparência: a Tooltip é um RÓTULO curto (`role="tooltip"`, some ao mover o mouse); o
// Popover abre por CLIQUE e pode conter foco; este é uma PRÉVIA rica que aparece ao repousar o
// ponteiro sobre um link e cujo conteúdo é alcançável — o cartão de perfil ao passar sobre um
// nome. As três referências que o têm chamam de hover-card ou preview-card e concordam nisso.
// Superfície reusa `.popover` de propósito: é a mesma camada flutuante do sistema, e dar a ela
// um segundo nome criaria duas peles para a mesma coisa.
// Por depender de repouso do ponteiro, NÃO serve para informação essencial — quem navega só por
// teclado ou toque não abre um hover card. Conteúdo obrigatório vai em Popover.
export function HoverCard({ trigger, children, side = "bottom" }) { const portal = usePortalContainer(); return _jsxs(BasePreviewCard.Root, { children: [_jsx(BasePreviewCard.Trigger, { render: trigger }), _jsx(BasePreviewCard.Portal, { container: portal, children: _jsx(BasePreviewCard.Positioner, { side: side, sideOffset: 8, children: _jsx(BasePreviewCard.Popup, { className: "popover hover-card", children: children }) }) })] }); }
// A MARCA de um item que alterna fica num slot de largura FIXA, e não condicional: sem ele, um
// menu com um item marcado e outro não desalinharia os rótulos a cada clique — o texto andaria
// para o lado sozinho. É a mesma razão de o `leadingIcon` ter lugar próprio.
const marca = (children) => _jsx("span", { className: "menu-mark", "aria-hidden": "true", children: children });
// ContextMenu.Item/.Separator/.Popup são os MESMOS componentes de Menu.* no Base UI,
// então os itens renderizam igual nos dois menus.
// `portal` viaja como PARÂMETRO e não por hook: este renderizador não é componente, e o
// submenu tem portal PRÓPRIO — sem passá-lo adiante, o menu de primeiro nível respeitaria o
// container configurado pelo provider e o submenu escaparia para o `document.body`. Duas
// camadas do mesmo menu em containers diferentes é o tipo de divergência que só aparece quando
// alguém monta a Aurea dentro de um shadow root ou de um diálogo nativo.
function renderMenuItems(items, portal) {
    return items.map((it, i) => {
        if (it === "separator")
            return _jsx(BaseMenu.Separator, { className: "menu-sep" }, i);
        const kind = it.kind ?? "item";
        const dentro = (x) => _jsxs(_Fragment, { children: [x.leadingIcon && _jsx(Icon, { name: x.leadingIcon }), x.label] });
        switch (kind) {
            case "group": {
                const g = it;
                return _jsxs(BaseMenu.Group, { children: [g.label && _jsx(BaseMenu.GroupLabel, { className: "menu-label", children: g.label }), renderMenuItems(g.items, portal)] }, i);
            }
            case "radiogroup": {
                const g = it;
                return _jsxs(BaseMenu.RadioGroup, { value: g.value, defaultValue: g.defaultValue, onValueChange: v => g.onValueChange?.(String(v)), children: [g.label && _jsx(BaseMenu.GroupLabel, { className: "menu-label", children: g.label }), g.items.map((r, j) => _jsxs(BaseMenu.RadioItem, { className: "menu-item", value: r.value, disabled: r.disabled, children: [marca(_jsx(BaseMenu.RadioItemIndicator, { className: "menu-ponto" })), dentro(r)] }, j))] }, i);
            }
            case "submenu": {
                const sm = it;
                // O submenu é uma RAIZ própria com gatilho próprio — não é um item que "abre outro menu".
                // É o que dá `aria-haspopup`, a seta para a direita e o fechamento em cascata de graça.
                return _jsxs(BaseMenu.SubmenuRoot, { children: [_jsxs(BaseMenu.SubmenuTrigger, { className: "menu-item", disabled: sm.disabled, children: [dentro(sm), _jsx(Icon, { name: "chevron--right", size: "sm", className: "menu-seta" })] }), _jsx(BaseMenu.Portal, { container: portal, children: _jsx(BaseMenu.Positioner, { side: "inline-end", sideOffset: 4, children: _jsx(BaseMenu.Popup, { className: "menu", children: renderMenuItems(sm.items, portal) }) }) })] }, i);
            }
            case "checkbox": {
                const c = it;
                // O motor chama `onCheckedChange` com `(checked, detalhes)`. A Aurea passa SÓ o `checked`,
                // e isso é CONTRATO: o segundo argumento é a forma interna do Base UI, e repassá-lo faria a
                // assinatura pública da Aurea mudar junto com uma versão do motor. Mesma decisão do
                // `onValueChange` do grupo de rádio. O teste pegou: sem o embrulho, o `vi.fn()` recebia um
                // `PointerEvent` de brinde.
                return _jsxs(BaseMenu.CheckboxItem, { className: "menu-item", disabled: c.disabled, checked: c.checked, defaultChecked: c.defaultChecked, onCheckedChange: v => c.onCheckedChange?.(v), children: [marca(_jsx(BaseMenu.CheckboxItemIndicator, { children: _jsx(Icon, { name: "checkmark", size: "sm" }) })), dentro(c)] }, i);
            }
            case "link": {
                const l = it;
                return _jsx(BaseMenu.LinkItem, { className: "menu-item", href: l.href, target: l.target, rel: l.rel, closeOnClick: l.closeOnClick ?? true, children: dentro(l) }, i);
            }
            default: {
                const a = it;
                return _jsx(BaseMenu.Item, { className: "menu-item", disabled: a.disabled, onClick: a.onClick, render: a.render, children: dentro(a) }, i);
            }
        }
    });
}
export function DropdownMenu({ trigger, items, side = "bottom", label }) { const portal = usePortalContainer(); return _jsxs(BaseMenu.Root, { children: [_jsx(BaseMenu.Trigger, { render: trigger }), _jsx(BaseMenu.Portal, { container: portal, children: _jsx(BaseMenu.Positioner, { side: side, sideOffset: 6, children: _jsx(BaseMenu.Popup, { className: "menu", "aria-label": label, children: renderMenuItems(items, portal) }) }) })] }); }
// ContextMenu: abre no botão direito e — por teclado — em Shift+F10 / tecla Menu,
// que o browser só dispara (como evento contextmenu) sobre um elemento FOCADO. Por
// isso o gatilho é focável (tabIndex 0) e tem nome acessível (auditoria 18/07/2026,
// MÉDIO 3); sem isso o teclado não alcança o menu. Consumidor pode sobrescrever
// tabIndex via children se o próprio já for focável.
export function ContextMenu({ children, items, label, className }) { const portal = usePortalContainer(); return _jsxs(BaseContextMenu.Root, { children: [_jsx(BaseContextMenu.Trigger, { className: className, tabIndex: 0, "aria-label": label, "aria-haspopup": "menu", children: children }), _jsx(BaseContextMenu.Portal, { container: portal, children: _jsx(BaseContextMenu.Positioner, { children: _jsx(BaseContextMenu.Popup, { className: "menu", "aria-label": label, children: renderMenuItems(items, portal) }) }) })] }); }
// G-AXIS-06 — o valor responsivo RESOLVIDO é a única fonte de verdade: ele vai para o motor, o
// motor publica `data-orientation`/`aria-orientation` e ajusta o teclado, e a pele reage ao
// atributo publicado. Ver `decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md`.
export function Menubar({ menus, label, modal, disabled, loopFocus, orientation, className }) {
    const portal = usePortalContainer();
    const ancora = useRef(null);
    const resolvida = useValorResponsivo(orientation, "horizontal", ancora);
    const vertical = resolvida === "vertical";
    return _jsx(BaseMenubar, { ref: ancora, modal: modal, disabled: disabled, loopFocus: loopFocus, orientation: resolvida, "aria-label": label, className: cx("menubar", className), children: menus.map((m, i) => _jsxs(BaseMenu.Root, { disabled: m.disabled, children: [_jsx(BaseMenu.Trigger, { className: "menubar-trigger", children: m.label }), _jsx(BaseMenu.Portal, { container: portal, children: _jsx(BaseMenu.Positioner, { side: vertical ? "inline-end" : "bottom", align: "start", sideOffset: 4, children: _jsx(BaseMenu.Popup, { className: "menu", children: renderMenuItems(m.items) }) }) })] }, i)) });
}
