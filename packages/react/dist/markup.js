import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// SEM `"use client"`, e a ausência é o ponto deste arquivo — item O1 do PLANO-1.0, decidido na
// [ADR-0026](../../../decisions/0026-marcacao-pura-e-de-servidor.md).
//
// O QUE ESTÁ AQUI: os componentes que não fazem NADA que exija o navegador. Sem hook, sem
// manipulador preso em JSX, sem motor de terceiro. `cx` mais marcação. A medição está em
// `node scripts/measure-boundary.mjs`, e ela é o motivo de o arquivo existir:
//
//   importar `Card` — uma <div> com uma classe — embarcava 9 módulos e 118,5 KB de JavaScript,
//   porque `layout.js` tem a diretiva e num framework de RSC a diretiva contamina o módulo
//   INTEIRO e o fecho transitivo dele. `Prose`, que também é uma <div>, custava 123,5 KB.
//
// A PROVA DE QUE ISSO SE RESOLVE JÁ ESTAVA NO REPOSITÓRIO: o `Accordion` mora no
// `disclosure.tsx`, que nunca teve a diretiva, e importá-lo custa **0,3 KB**. Mesma natureza do
// `Card`, três ordens de grandeza de diferença — e a única distinção era o arquivo em que cada um
// tinha caído na Fase 9.
//
// POR QUE UM MÓDULO NOVO E NÃO UM `.pure` POR CATEGORIA: o precedente é o `Kbd`, e ele já estava
// escrito no `MAP.md`. Ele mora no `internal.tsx` **por dependência** (o `Button` precisa dele) e
// a casa PÚBLICA dele é `/data-display`, que o reexporta. Aqui é a mesma regra em escala: o
// arquivo é onde a coisa mora, a categoria é o que a ficha declara, e as duas não precisam
// coincidir. A taxonomia do registry não muda, e nenhuma ficha muda.
//
// A API NÃO QUEBRA. Cada módulo de categoria reexporta os seus, então
// `@aurea-uds/react/layout` continua entregando `Card`. O que muda é o `index.tsx`: ele exporta
// estes nomes EXPLICITAMENTE daqui, e é isso — e só isso — que faz
// `import {Card} from "@aurea-uds/react"` chegar como componente de SERVIDOR. Sem a linha
// explícita o nome ainda existe, vindo do módulo de categoria, e volta a ser cliente sem que
// nada reprove. O check 35 cobra a linha, e foi provado contra esse defeito exato.
//
// LIMITE DECLARADO: pelo subpath da categoria (`@aurea-uds/react/layout`) o `Card` continua
// vindo de um módulo com a diretiva, porque o `AppShell` mora lá e a diretiva é do ARQUIVO. Quem
// renderiza no servidor por SEO deve importar do barril. Separar cada categoria em duas entradas
// resolveria também esse caminho, e é mudança de fronteira pública — não entra sem o Victor.
//
// PARA QUEM VIER: componente novo só entra aqui se não chamar hook, não prender manipulador e não
// tocar motor. Na dúvida, ele NÃO entra — cliente a mais é lento, servidor a mais é quebrado.
import React, { forwardRef } from "react";
import { cx, fundirRender, peleDoEixo } from "./pure.js";
export function Card({ variant = "base", padding = "normal", orientation = "vertical", className, render, ...props }) {
    return fundirRender(render, { className: cx("card", variant !== "base" && `card-${variant}`, padding === "none" && "card-flush", orientation === "horizontal" && "card-horizontal", className), ...props });
}
/** A mídia do cartão — a primeira das partes da especificação do `Card` (A-14). No vertical,
 *  primeira filha, ela SANGRA até a borda de cima e dos lados; no horizontal, fica à esquerda com a
 *  largura de miniatura, dentro do respiro, com o raio que sai da conta da casa (ADR-0033: raio do
 *  cartão menos o respiro dele). O que vai dentro — `Image`, vídeo — é do app. */
function CardMedia({ className, ...props }) { return _jsx("div", { className: cx("card-media", className), ...props }); }
Card.Media = CardMedia;
export function Stack({ gap, align, className, ...props }) { return _jsx("div", { className: cx("stack", gap && gap !== "normal" && `stack-gap-${gap}`, align && align !== "stretch" && `stack-align-${align}`, className), ...props }); }
export function Cluster({ gap, align, justify, wrap, className, ...props }) { return _jsx("div", { className: cx("cluster", gap && gap !== "normal" && `cluster-gap-${gap}`, align && align !== "center" && `cluster-align-${align}`, justify && justify !== "start" && `cluster-justify-${justify}`, wrap === false && "cluster-nowrap", className), ...props }); }
export function Grid({ gap, min, columns, className, style, ...props }) {
    const vars = min != null || columns != null
        ? { ...(min != null ? { "--grid-min": min } : {}), ...(columns != null ? { "--grid-cols": String(columns) } : {}), ...style }
        : style;
    return _jsx("div", { className: cx("grid", gap && gap !== "normal" && `grid-gap-${gap}`, columns != null && "grid-fixed", className), style: vars, ...props });
}
// ── Data Display ─────────────────────────────────────────────────────────────────────────────
export function KPI({ label, value, trend, className, ...props }) { return _jsxs(Card, { className: cx("kpi", className), ...props, children: [_jsx("span", { className: "muted", children: label }), _jsx("strong", { children: value }), trend && _jsx("small", { children: trend })] }); }
export function DataList({ items }) { return _jsx("dl", { className: "data-list", children: items.map((i, n) => _jsxs(React.Fragment, { children: [_jsx("dt", { children: i.term }), _jsx("dd", { children: i.value })] }, n)) }); }
export function Timeline({ items }) { return _jsx("ol", { className: "timeline", children: items.map((i, n) => _jsxs("li", { children: [_jsx("span", { className: "timeline-dot" }), _jsxs("div", { children: [_jsx("strong", { children: i.title }), i.description && _jsx("p", { children: i.description }), i.time && _jsx("small", { className: "muted", children: i.time })] })] }, n)) }); }
// Prose (item L5): UMA LINHA, e é para ser mesmo — quem transforma Markdown em elementos é o
// consumidor. A trava do item é no CSS, escopada em `.prose`, e há prova dela no `skin.spec`.
// Segurança, porque é o caminho de uso mais provável: quem entrega HTML de terceiro por
// `dangerouslySetInnerHTML` tem de SANITIZAR antes. A Aurea desenha o texto; ela não pode decidir
// o que é seguro renderizar. Está dito na ficha, em voz alta.
export function Prose({ className, ...props }) { return _jsx("div", { className: cx("prose", className), ...props }); }
// `max` com `+` é o idioma universal do contador (MUI, Ant, Material 3). Exportada porque quem
// escreve o nome acessível precisa do MESMO texto — "99+ unread" tem de bater com o que se vê.
export function formatBadgeCount(count, max = 99) { return count > max ? `${max}+` : String(count); }
export function Badge({ variant = "neutral", emphasis = "soft", size = "md", dot, leading, trailing, image, imageAlt, count, max = 99, showZero, fit = "auto", anchor, anchorShape = "square", invisible, badgeContent, children, className, ...props }) {
    const numero = count != null ? formatBadgeCount(count, max) : undefined;
    const miolo = anchor ? (numero ?? badgeContent) : (numero ?? children);
    // Ponto puro: `dot` sem nada para mostrar. Aí o badge não tem conteúdo, e ganha medida própria.
    const soPonto = !!dot && miolo == null;
    const chip = _jsxs("span", { className: cx("badge", variant !== "neutral" && `badge-${variant}`, emphasis !== "soft" && `badge-${emphasis}`, size !== "md" && `badge-${size}`, fit === "content" && !anchor && "badge-fit", anchor && `badge-overlay badge-at-${anchor}`, anchor && anchorShape === "circle" && "badge-on-circle", anchor && soPonto && "badge-is-dot", className), ...props, children: [dot && !soPonto && _jsx("span", { className: "badge-dot" }), image && _jsx("img", { className: "badge-image", src: image, alt: imageAlt ?? "" }), leading, miolo, trailing] });
    if (!anchor)
        return chip;
    // Some em zero por padrão, como a MUI: caixa de entrada zerada não merece um "0" no canto.
    const escondido = invisible || (count === 0 && !showZero) || (miolo == null && !dot);
    // `aria-hidden` no contador, e o número vai para o nome de QUEM É DECORADO — regra da própria
    // documentação da MUI e das três fontes de acessibilidade lidas em 17/08/2026. Sem isso, o
    // botão do sino é anunciado "sino 8" e ninguém sabe o que é o 8.
    return _jsxs("span", { className: "badge-anchor", children: [children, !escondido && React.cloneElement(chip, { "aria-hidden": true })] });
}
export function Progress({ value, label }) { const pct = Math.max(0, Math.min(100, value)); return _jsx("div", { children: _jsx("div", { className: "progress", role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, children: _jsx("span", { style: { width: `${pct}%` } }) }) }); }
export function Skeleton({ className, ...props }) { return _jsx("div", { className: cx("skeleton", className), "aria-hidden": "true", ...props }); }
// ── Identity ─────────────────────────────────────────────────────────────────────────────────
// `React.Children` não é hook — é utilitário de leitura de `children`, e roda no servidor.
export function AvatarGroup({ children, max, total, label, size, className }) {
    const itens = React.Children.toArray(children);
    const mostra = max ? itens.slice(0, max) : itens;
    const resto = (total ?? itens.length) - mostra.length;
    return _jsxs("div", { role: "group", "aria-label": label, className: cx("avatar-group", className), children: [mostra, resto > 0 && _jsxs("span", { className: cx("avatar", "avatar-count", peleDoEixo("avatar", size)), "aria-hidden": "true", children: ["+", resto] })] });
}
// ── Code ─────────────────────────────────────────────────────────────────────────────────────
// O NÍVEL É MODIFICADOR DA CÉLULA, não classe na linha. O core pinta `.log-level.warn`, e a
// regra descendente que pintava a partir de uma classe no container (`.log-warn .log-level`)
// saiu do CSS de propósito — o comentário dela dizia, com todas as letras, que servia a um
// arquivo que não existe mais. O merge das duas linhagens ficou com o React da versão antiga
// contra o CSS da nova: `log-warn` era emitido e ninguém o pintava, e `.log-level` saía sem
// modificador nenhum. Os dois testes do `grade-do-core.test.tsx` pegaram os dois lados.
//
// `<time>` fica: é a semântica certa para a hora, e o core casa pela CLASSE, não pela tag.
export function LogStream({ lines }) { return _jsx("div", { className: "log-stream", role: "log", "aria-live": "polite", children: lines.map((l, n) => _jsxs("div", { className: "log-line", children: [_jsx("time", { className: "log-time", children: l.time }), _jsx("span", { className: cx("log-level", l.level && l.level.toLowerCase()), children: l.level }), _jsx("span", { children: l.text })] }, n)) }); }
// ── Media ────────────────────────────────────────────────────────────────────────────────────
export function MediaPlayerShell({ children, className, ...props }) { return _jsx("div", { className: cx("media-player", className), ...props, children: children }); }
// ── Navigation ───────────────────────────────────────────────────────────────────────────────
// B-07 (24/09/2026): `divider` põe a linha de baixo na `flush`. Ela é fundo igual ao da página e
// gruda no topo; sem linha, o conteúdo passa por baixo dela e nada diz onde a barra acaba. Só na
// `flush`: a `floating` e a `pill` são caixas com borda própria.
export function Topbar({ variant = "floating", divider, brand, children, className, ...props }) { return _jsxs("header", { className: cx("topbar", `topbar-${variant}`, divider && variant === "flush" && "topbar-divider", className), ...props, children: [brand != null && _jsx("div", { className: "brand", children: brand }), children] }); }
// ── System / interno ─────────────────────────────────────────────────────────────────────────
// Kbd — representação de tecla/atalho. <kbd> é o elemento HTML certo; a pele é nossa. Ele já
// morava fora da casa dele (no `internal.tsx`, por causa do `Button`); agora mora aqui, pelo
// mesmo motivo elevado a regra.
export function Kbd({ children, className, ...props }) { return _jsx("kbd", { className: cx("kbd", className), ...props, children: children }); }
export const Textarea = forwardRef(function Textarea({ className, size, ...props }, ref) { return _jsx("textarea", { ref: ref, className: cx("textarea", peleDoEixo("textarea", size), className), ...props }); });
// `size` nos três marcáveis pela mesma razão do campo: uma linha de formulário com um campo `sm`
// e um checkbox de tamanho fixo ao lado desalinha. O degrau vai na MARCA, não no rótulo.
export function Checkbox({ label, labelHidden, description, size, className, ...props }) { return _jsxs("label", { className: cx("checkbox", labelHidden && "checkbox-bare", className), children: [_jsx("input", { type: "checkbox", ...props }), _jsx("span", { className: cx("control-mark", peleDoEixo("control-mark", size)) }), _jsxs("span", { className: labelHidden ? "sr-only" : undefined, children: [_jsx("strong", { children: label }), description && _jsxs(_Fragment, { children: [_jsx("br", {}), _jsx("span", { className: "muted", children: description })] })] })] }); }
export function Radio({ label, size, className, ...props }) { return _jsxs("label", { className: cx("radio", className), children: [_jsx("input", { type: "radio", ...props }), _jsx("span", { className: cx("control-mark", peleDoEixo("control-mark", size)) }), label] }); }
export function Switch({ label, size, className, ...props }) { return _jsxs("label", { className: cx("switch", className), children: [_jsx("input", { type: "checkbox", role: "switch", ...props }), _jsx("span", { className: cx("switch-track", peleDoEixo("switch-track", size)) }), _jsx("span", { children: label })] }); }
export function Range({ orientation, className, ...props }) { return _jsx("input", { className: cx("range", peleDoEixo("range", orientation, "horizontal", "range"), className), type: "range", ...props }); }
// `md` é a classe base — não existe `.input-md`, como não existe `.btn-md`. O prefixo é escrito
// literal em cada chamada (`input-${size}`, e não `${base}-${size}`) porque é assim que o check 15
// enxerga uma classe montada em tempo de execução; com prefixo dinâmico ele para de proteger a
// fronteira do core justamente nas classes novas.
// RÓTULO avulso. O `Field` já traz o dele, e é o caminho normal; este existe para quem monta o
// próprio campo — uma linha de tabela editável, um filtro que não é um `Field`. Sem ele, quem sai
// do `Field` escreve um `<label>` cru e perde a pele.
export function Label({ htmlFor, className, children, ...props }) { return _jsx("label", { htmlFor: htmlFor, className: cx("label", className), ...props, children: children }); }
function ladoDoAdorno(no) {
    if (!React.isValidElement(no))
        return null;
    const p = no.props;
    return no.type === InputGroupAddon ? (p.side ?? "start") : null;
}
// A-08 (24/09/2026): `width` tira o grupo dos 100% — `"20rem"` para uma medida, `"auto"` para o
// tamanho do conteúdo. Sem ela, 100% como sempre. Com ela, o grupo também deixa de crescer numa
// fila (`flex:none`): o `flex:1` que as barras dão a ele desfaria a medida pedida.
export function InputGroup({ className, children, width, style, ...props }) {
    const filhos = React.Children.toArray(children);
    const inicio = filhos.filter(f => ladoDoAdorno(f) === "start");
    const fim = filhos.filter(f => ladoDoAdorno(f) === "end");
    const meio = filhos.filter(f => ladoDoAdorno(f) === null);
    return _jsx("div", { className: cx("input-group", className), style: width != null ? { inlineSize: width, flex: "none", ...style } : style, ...props, children: [...inicio, ...meio, ...fim] });
}
// `layout` é responsivo, e a triagem que o autorizou está no `G-AXIS-07`: com o adorno em linha,
// a 200px de caixa sobram 48% da largura para o campo; com ele em faixa, 99%. Não é preferência
// de desenho — é o campo deixar de caber.
//
// `padrao: ""` porque as duas geometrias têm regra própria: um `inline` que não emitisse classe
// ficaria sem o recuo, que mora na regra composta `.…-inline.…-start`.
export function InputGroupAddon({ side = "start", layout = "inline", className, children, ...props }) {
    return _jsx("span", { className: cx("input-group-addon", `input-group-addon-${side}`, peleDoEixo("input-group-addon", layout, "", "input-group-addon"), className), ...props, children: children });
}
// PORTADO no merge de 28/08/2026: não existia na `main`, e a pele (`.aspect-ratio`) veio junto
// no core. Marcação pura — uma linha de CSS —, então é servidor.
// PROPORÇÃO FIXA. Quatro referências têm. Hoje é uma linha de CSS — `aspect-ratio` é suportado em
// todo navegador que a Aurea alcança —, e ainda assim é componente: sem ele cada consumidor
// escreve o `padding-top: 56.25%` de 2015, ou esquece o `min-width: 0` que impede a caixa de
// estourar dentro de um grid.
export function AspectRatio({ ratio = 1, className, style, ...props }) { return _jsx("div", { className: cx("aspect-ratio", className), style: { aspectRatio: ratio, ...style }, ...props }); }
