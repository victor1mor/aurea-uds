"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, { useRef, forwardRef } from "react";
import { classesResponsivas, ehResponsivo, peleDoEixo, soOValor, valorBase } from "./pure.js";
import { useValorResponsivo } from "./responsivo-runtime.js";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cx, useAureaStrings } from "./internal.js";
import { Kbd } from "./markup.js";
import { Icon } from "./system.js";
// O dicionário que desachata o enum. É a ÚNICA fonte da correspondência: o gate do
// `validate.py` lê daqui para provar que todo par ou tem regra no core ou está declarado
// ausente com motivo, e a ficha do registry declara os mesmos dois eixos.
const EIXOS = {
    primary: ["solid", "brand"], secondary: ["solid", "neutral"],
    outline: ["outline", "neutral"], ghost: ["ghost", "neutral"],
    "primary-outline": ["outline", "brand"], "primary-ghost": ["ghost", "brand"],
    danger: ["solid", "danger"], "danger-outline": ["outline", "danger"], "danger-ghost": ["ghost", "danger"],
    link: ["link", "neutral"], "link-primary": ["link", "brand"], "link-danger": ["link", "danger"],
    nav: ["nav", "neutral"]
};
// caminho de volta: par → nome antigo. Existir aqui significa "o core já pinta esta célula com
// uma classe própria", e é o que garante que NENHUMA baseline se mexe: `appearance="outline"`
// + `tone="danger"` emite `.btn-danger-outline`, o mesmo DOM de sempre.
const CLASSE_ANTIGA = new Map(Object.entries(EIXOS)
    .map(([v, [a, t]]) => [`${a}/${t}`, v]));
/** Resolve os dois eixos (ou o atalho) na classe que o core pinta. Exportada porque o teste
 *  cobra a matriz inteira, e porque quem monta um botão à mão precisa da mesma conta.
 *
 *  Não há degradação: toda célula dos dois eixos tem regra própria no core. A versão de
 *  21/08 rebaixava `solid` de success/info para `outline` porque faltava o par de token — o
 *  Victor recusou a degradação silenciosa e mandou consertar a infraestrutura, que é o que
 *  `--success`/`--success-foreground` e os irmãos são. `outline` voltou a ser só uma aparência
 *  que se pede, nunca o que sobra quando a nossa paleta não dá conta. */
export function buttonSkin(variant, appearance, tone) {
    const [a0, t0] = EIXOS[variant ?? "secondary"];
    const a = appearance ?? a0, t = tone ?? t0;
    const antiga = CLASSE_ANTIGA.get(`${a}/${t}`);
    return antiga ? `btn-${antiga}` : cx(`btn-${a}`, `btn-tone-${t}`);
}
// type="button" por default: o default do HTML é submit, e um "Cancelar"/"Remover"
// dentro de <form> dispararia a ação principal (auditoria 18/07/2026, ALTO 1).
// Quem quer submeter passa type="submit" explícito (como o MessageComposer faz).
export const Button = forwardRef(function Button({ variant, appearance, tone, size = "md", loading, leadingIcon, trailingIcon, className, children, disabled, type = "button", href, fullWidth, grow, target, rel, download, pressed, kbd, onClick, onClickCapture, "aria-disabled": ariaDisabled, ...props }, ref) {
    // G-AXIS-04 — `size` aceita valor simples, responsivo por viewport ou adaptativo por container.
    // SOMATIVO por construção: valor simples continua emitindo `btn-sm`, byte por byte a mesma classe
    // de antes, e por isso nenhuma baseline se mexe. Só o valor responsivo entra pela camada genérica
    // (`size-*` + `vp-*:`/`ct-*:`), que existe uma vez no core para todo o sistema.
    // Quem decide é o CSS: nada aqui observa largura, e o HTML do servidor já sai correto.
    const responsivo = ehResponsivo(size);
    const base = valorBase(size) ?? "md";
    const cls = cx("btn", buttonSkin(variant, appearance, tone), responsivo ? classesResponsivas("size", size) : (base !== "md" && `btn-${base}`), fullWidth && "btn-block", grow && "btn-grow", className);
    // kbd dentro do botão: mostra o atalho E o anuncia (aria-keyshortcuts), senão é enfeite.
    const inner = _jsxs(_Fragment, { children: [loading && _jsx("span", { className: "spinner" }), leadingIcon && _jsx(Icon, { name: leadingIcon }), _jsx("span", { children: children }), kbd && _jsx(Kbd, { children: kbd }), trailingIcon && _jsx(Icon, { name: trailingIcon })] });
    // INERTE ≠ DESABILITADO, e a diferença é medida (M4, 13/08/2026): `disabled` tira o botão da
    // ordem de foco, então quem navega por teclado nunca alcança a explicação de POR QUE não dá — e
    // "não dá porque você não tem permissão" é justamente o caso em que a explicação é tudo. O
    // embrulho de <span> que o MUI documenta resolve o ponteiro e não resolve o teclado (span nasce
    // com tabIndex -1, medido). Com `aria-disabled` o botão continua focável e anunciado como
    // desabilitado, e é ESTE componente que tem de barrar a ativação — o atributo é só semântica.
    // Mesmo remendo do AUD-0004, que já barrava o link desabilitado; aqui ele alcança o <button>.
    const inerte = ariaDisabled === true || ariaDisabled === "true";
    const off = disabled || loading;
    const shared = { "aria-keyshortcuts": kbd || undefined, "aria-busy": loading || undefined };
    // AUD-0004 (12/08/2026): o ramo de LINK desabilitado tirava o `href` e punha `aria-disabled`, e
    // deixava o `onClick` passar intacto — então um link "desabilitado" continuava executando a ação
    // ao ser clicado, e o `loading` também. Não há `disabled` em `<a>`: quem tem de barrar a ativação
    // é este componente. O ramo de `<button>` nunca teve o defeito, porque `disabled` no elemento
    // nativo já barra o evento — por isso a correção mora só aqui.
    // Os dois handlers de click saem de `props`: no React, onClickCapture roda antes do onClick e
    // também precisa ser barrado. `stopPropagation` evita o handler de bolha em um ancestral.
    const bloqueia = (e) => { e.preventDefault(); e.stopPropagation(); };
    const eventos = (off || inerte) ? { onClick: bloqueia, onClickCapture: bloqueia } : { onClick: onClick, onClickCapture: onClickCapture };
    if (href !== undefined)
        return _jsx("a", { ref: ref, className: cls, target: target, rel: rel, download: download, ...shared, ...props, ...(off ? { "aria-disabled": true } : { href }), ...eventos, children: inner });
    return _jsx("button", { ref: ref, type: type, className: cls, disabled: off, "aria-disabled": inerte || undefined, "aria-pressed": pressed, ...shared, ...(inerte ? { onClick: bloqueia, onClickCapture: bloqueia } : { onClick, onClickCapture }), ...props, children: inner });
});
function temConteudoVisivel(children) {
    const itens = React.Children.toArray(children);
    return itens.some(item => {
        if (typeof item === "string")
            return item.trim().length > 0;
        if (typeof item === "number" || typeof item === "bigint")
            return true;
        if (!React.isValidElement(item))
            return false;
        const p = item.props;
        if (p["aria-hidden"] === true || p["aria-hidden"] === "true")
            return false;
        if (typeof p["aria-label"] === "string" && p["aria-label"].trim())
            return true;
        if (typeof p.alt === "string" && p.alt.trim())
            return true;
        // Inspecionar `children` também cobre Fragment e elementos formatadores. Componente arbitrário
        // sem conteúdo inspecionável é tratado de modo conservador: precisa fornecer `label`.
        return temConteudoVisivel(p.children);
    });
}
// ESTE é o toggle da Aurea. O `pressed` do `Button` está DEPRECIADO em favor dele (0.4.0,
// sai na 1.0): as doze referências pesquisadas em 18/08/2026 têm componente separado, e
// nenhuma põe o estado no botão comum.
// E a REGRA QUE FALTAVA ESTAR ESCRITA AQUI, do Adobe Spectrum e do APG: **o rótulo não muda
// entre os estados**. Se o texto vira "Mute"/"Unmute" ou "Play"/"Pause", não é toggle — é
// botão de ação, porque quem lê tela ouve o rótulo NOVO e o estado ao mesmo tempo e não sabe
// se o botão descreve o que é ou o que fará.
export function Toggle({ pressed, defaultPressed, onPressedChange, value, icon, label, size, disabled, id, className, children }) {
    // O tipo barra o consumidor TypeScript; este aviso barra o de JavaScript, que não tem tipo nenhum.
    // Sem gate por NODE_ENV de propósito: o `dist` é saída de `tsc`, então `process` não existe no
    // navegador e a referência quebraria o render — e um controle sem nome merece aparecer em produção
    // também. Segue o idioma do próprio motor, que usa `console.error` para invariante violada.
    // O tipo barra false/null/undefined diretos. Runtime ainda precisa cobrir os vazios que o tipo não
    // consegue expressar: string em branco, array/Fragment vazio e elemento só decorativo.
    const textoVisivel = temConteudoVisivel(children);
    const rotuloVisivel = typeof label === "string" && label.trim().length > 0;
    if (!textoVisivel && !rotuloVisivel)
        console.error("Aurea: <Toggle> sem `children` visível e sem `label` não tem nome acessível — quem usa leitor de tela encontra um botão anônimo. Passe `label` quando o toggle for só ícone.");
    return _jsxs(BaseToggle, { id: id, value: value, disabled: disabled, pressed: pressed, defaultPressed: defaultPressed, onPressedChange: soOValor(onPressedChange), "aria-label": textoVisivel ? undefined : (rotuloVisivel ? label : undefined), className: cx("btn", "btn-ghost", size !== "md" && `btn-${size}`, !textoVisivel && "btn-icon", "toggle", className), children: [icon && _jsx(Icon, { name: icon }), children] });
}
// default ghost (não secondary): um ícone-ação solto — hambúrguer, tema, fechar — é sem
// caixa por convenção (pedido do Victor: hambúrguer sem borda). Quem quer a caixa passa
// variant. Alinha o React ao HTML dos docs, onde .btn-icon já é transparente.
export const IconButton = forwardRef(function IconButton({ label, icon, variant = "ghost", className, ...props }, ref) { return _jsx(Button, { ref: ref, variant: variant, className: cx("btn-icon", className), "aria-label": label, ...props, children: _jsx(Icon, { name: icon }) }); });
// ButtonGroup: agrupamento semântico. Sem roving tabindex — cada botão continua tabulável (use Toolbar para roving).
// `orientation` (G-AXIS-01) muda só o EIXO do layout, não a semântica: `role="group"` não tem
// noção de direção, e por isso — ao contrário do `Toolbar` e do `ToggleGroup`, que navegam por
// seta e precisam saber para que lado a seta anda — aqui não há `aria-orientation`. Anunciar
// orientação num grupo que não navega seria prometer teclado que não existe.
export function ButtonGroup({ label, orientation, className, ...props }) { const s = useAureaStrings(); return _jsx("div", { role: "group", "aria-label": label ?? s.optionsLabel, className: cx("btn-group", peleDoEixo("btn-group", orientation, "horizontal", "btn-group"), className), ...props }); }
// Toolbar: roving tabindex (setas navegam, Tab entra/sai) via Base UI.
// G-AXIS-06 — o valor responsivo RESOLVIDO é a única fonte de verdade: ele vai para o motor, o
// motor publica `data-orientation`/`aria-orientation` e ajusta o teclado, e a pele reage ao
// atributo publicado. Nada de o CSS decidir a orientação por breakpoint enquanto o atributo
// diz outra coisa — seriam duas fontes de verdade e uma janela em que visual e comportamento
// divergem. Ver `decisions/0047-css-first-para-apresentacao-runtime-para-semantica.md`.
export function Toolbar({ orientation, label, className, ...props }) {
    const s = useAureaStrings();
    const ancora = useRef(null);
    const resolvida = useValorResponsivo(orientation, "horizontal", ancora);
    return _jsx(BaseToolbar.Root, { ref: ancora, orientation: resolvida, "aria-label": label ?? s.toolbarLabel, className: cx("toolbar", className), ...props });
}
export function ToolbarGroup({ label, className, ...props }) { return _jsx(BaseToolbar.Group, { "aria-label": label, className: cx("toolbar-group", className), ...props }); }
export function ToolbarSeparator({ className, ...props }) { return _jsx(BaseToolbar.Separator, { className: cx("toolbar-sep", className), ...props }); }
export const ToolbarButton = forwardRef(function ToolbarButton({ variant = "ghost", ...props }, ref) { return _jsx(BaseToolbar.Button, { ref: ref, disabled: props.disabled, render: _jsx(Button, { variant: variant, ...props }) }); });
// TOGGLE GROUP — vários Toggle com estado compartilhado e navegação por seta entre eles.
//
// Não é o SegmentedControl, e confundir os dois constrói a coisa errada com o nome certo: o
// `SegmentedControl` é escolha ÚNICA e obrigatória entre alternativas de uma mesma dimensão
// ("dia / semana / mês") e se parece com uma cápsula; aqui cada botão liga e desliga por conta
// própria, `multiple` permite vários ao mesmo tempo, e zero selecionado é estado legítimo. É a
// barra de formatação de um editor, não um filtro de período.
//
// O motor dá o roving tabindex, o `loopFocus` e o contrato de pressionado; a pele é a do
// `.btn-group`, porque um grupo de botões é o que isto é.
export function ToggleGroup({ value, defaultValue, onValueChange, multiple, orientation, disabled, label, className, children }) {
    const ancora = useRef(null);
    const resolvida = useValorResponsivo(orientation, "horizontal", ancora);
    return _jsx(BaseToggleGroup, { ref: ancora, value: value, defaultValue: defaultValue, onValueChange: soOValor(onValueChange), multiple: multiple, orientation: resolvida, disabled: disabled, "aria-label": label, className: cx("toggle-group", className), children: children });
}
