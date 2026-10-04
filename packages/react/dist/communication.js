"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { cx, useAureaStrings } from "./internal.js";
import { InputGroup, InputGroupAddon } from "./inputs.js";
import { Icon } from "./system.js";
import { IconButton } from "./actions.js";
import { Avatar } from "./identity.js";
import { Badge, Spinner } from "./feedback.js";
import { formatSize, matchesAccept } from "./file-input.js";
// A AN-02 põe álbum na mensagem com a `Gallery` que já existe. `media` mora no "resto" do DAG,
// como este módulo, e não importa `communication` — não há ciclo.
import { Gallery } from "./media.js";
// O contêiner que rola é o ancestral com `overflow` de rolagem, ou a página.
function rolador(el) {
    for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowY;
        if (o === "auto" || o === "scroll" || o === "overlay")
            return p;
    }
    return document.scrollingElement ?? document.documentElement;
}
const ehPagina = (sc) => sc === document.scrollingElement || sc === document.documentElement;
function useVigia(alvo, ligado, avisar, deps) {
    const cb = React.useRef(avisar);
    cb.current = avisar;
    React.useEffect(() => {
        const el = alvo.current;
        if (!el || !ligado || typeof IntersectionObserver === "undefined")
            return;
        const sc = rolador(el);
        const obs = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting))
            cb.current?.(); }, { root: ehPagina(sc) ? null : sc });
        obs.observe(el);
        return () => obs.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ligado, ...deps]);
}
export function MessageList({ messages, label, className, hasMoreBefore, hasMoreAfter, loadingBefore, loadingAfter, onReachStart, onReachEnd, onOpenAttachment }) {
    const s = useAureaStrings();
    const janela = !!onReachStart || !!onReachEnd;
    const raiz = React.useRef(null);
    const topo = React.useRef(null);
    const fim = React.useRef(null);
    const ancora = React.useRef(null);
    const noFim = React.useRef(true);
    const ultimoAntes = React.useRef(undefined);
    const montou = React.useRef(false);
    const [anuncio, setAnuncio] = React.useState("");
    const hasMoreAfterRef = React.useRef(hasMoreAfter);
    hasMoreAfterRef.current = hasMoreAfter;
    // A posição de quem está no alto da tela, e se a última está à vista. Lida a cada rolagem e
    // depois de cada troca: entre uma troca e outra, só a rolagem move as mensagens.
    const medir = React.useCallback(() => {
        const el = raiz.current;
        if (!el)
            return;
        const sc = rolador(el), pag = ehPagina(sc);
        const alto = pag ? 0 : sc.getBoundingClientRect().top, baixo = pag ? window.innerHeight : sc.getBoundingClientRect().bottom;
        const itens = el.querySelectorAll("[data-message-id]");
        // A âncora é a primeira que COMEÇA dentro da tela, e não a primeira que aparece: medido no banco
        // em 04/10/2026, um álbum cortado no alto cresceu 480 px quando as fotos chegaram — para baixo
        // dele —, o topo dele não andou, e a conversa inteira desceu sem a conta perceber. Se nenhuma
        // começa na tela (uma mensagem maior que ela), vale a que está à vista.
        ancora.current = null;
        let vista;
        for (const it of Array.from(itens)) {
            const r = it.getBoundingClientRect();
            if (r.bottom <= alto)
                continue;
            vista ??= it;
            if (r.top >= alto) {
                ancora.current = { id: it.dataset.messageId, top: r.top };
                break;
            }
        }
        if (!ancora.current && vista)
            ancora.current = { id: vista.dataset.messageId, top: vista.getBoundingClientRect().top };
        const ultimo = itens[itens.length - 1];
        noFim.current = !ultimo || ultimo.getBoundingClientRect().bottom <= baixo + 1;
    }, []);
    React.useEffect(() => {
        if (!janela || !raiz.current)
            return;
        const sc = rolador(raiz.current), alvo = ehPagina(sc) ? window : sc;
        alvo.addEventListener("scroll", medir, { passive: true });
        return () => alvo.removeEventListener("scroll", medir);
    }, [janela, medir]);
    const ultimoId = messages[messages.length - 1]?.id;
    React.useLayoutEffect(() => {
        const el = raiz.current;
        if (!janela || !el) {
            ultimoAntes.current = ultimoId;
            return;
        }
        const sc = rolador(el);
        const irAoFim = () => { sc.scrollTop = sc.scrollHeight; };
        const antes = ultimoAntes.current;
        // Chegou mensagem no fim: a última de antes continua na lista, e não é mais a última.
        const ia = antes === undefined ? -1 : messages.findIndex(m => m.id === antes);
        const chegou = montou.current && ia >= 0 && ia < messages.length - 1;
        if (!montou.current) {
            irAoFim();
            montou.current = true;
        }
        else if (chegou && noFim.current && !hasMoreAfter)
            irAoFim();
        else if (ancora.current) {
            const it = el.querySelector(`[data-message-id="${CSS.escape(ancora.current.id)}"]`);
            if (it)
                sc.scrollTop += it.getBoundingClientRect().top - ancora.current.top;
        }
        if (chegou) {
            const novo = el.querySelector(`[data-message-id="${CSS.escape(ultimoId)}"]`);
            setAnuncio(novo?.textContent ?? "");
        }
        ultimoAntes.current = ultimoId;
        medir();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);
    // A ALTURA MUDA DEPOIS DE MONTAR — a fonte chega, a foto decodifica, o app troca um texto — e
    // nenhuma rolagem acontece para avisar. Medido no banco em 04/10/2026: a conversa abria na #4992
    // e não na última. Então se observa o tamanho da lista: quem estava no fim continua no fim; quem
    // não estava mantém a mensagem do alto onde ela estava.
    React.useEffect(() => {
        const el = raiz.current;
        if (!janela || !el || typeof ResizeObserver === "undefined")
            return;
        const ro = new ResizeObserver(() => {
            const sc = rolador(el);
            if (noFim.current && !hasMoreAfterRef.current)
                sc.scrollTop = sc.scrollHeight;
            else if (ancora.current) {
                const it = el.querySelector(`[data-message-id="${CSS.escape(ancora.current.id)}"]`);
                if (it)
                    sc.scrollTop += it.getBoundingClientRect().top - ancora.current.top;
            }
            medir();
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [janela, medir]);
    useVigia(topo, janela && !!hasMoreBefore && !loadingBefore, onReachStart, [messages.length]);
    useVigia(fim, janela && !!hasMoreAfter && !loadingAfter, onReachEnd, [messages.length]);
    return _jsxs(_Fragment, { children: [_jsxs("div", { ref: raiz, className: cx("stack", className), role: "log", "aria-live": janela ? "off" : "polite", "aria-busy": (janela && (loadingBefore || loadingAfter)) || undefined, "aria-label": label ?? s.chatLabel, children: [janela && hasMoreBefore && _jsx("div", { ref: topo, className: "message-more", children: loadingBefore && _jsx(Spinner, {}) }), messages.map((m, i) => {
                        const lado = m.direction;
                        const midia = (m.attachments ?? []).filter(a => a.kind !== "file" && a.src);
                        const arquivos = (m.attachments ?? []).filter(a => a.kind === "file");
                        const dia = m.day != null && m.day !== messages[i - 1]?.day;
                        return _jsxs(React.Fragment, { children: [dia && _jsx("div", { className: "message-day", children: _jsx(Badge, { children: m.day }) }), _jsxs("div", { className: cx("message", lado === "outgoing" && "message-out", lado === "incoming" && "message-in"), "data-message-id": m.id, children: [lado === "outgoing" ? null : m.avatar ? _jsx(Avatar, { src: m.avatar.src, fallback: m.avatar.fallback }) : _jsx("span", {}), _jsxs("div", { className: "message-bubble", children: [(m.author || m.time || m.edited) && _jsxs("div", { className: "label", children: [_jsx("span", { children: m.author }), (m.time || m.edited) && _jsxs("span", { className: "hint", children: [m.edited && _jsxs(_Fragment, { children: [s.chatEdited, m.time != null && " · "] }), m.time] })] }), m.forwardedFrom != null && _jsxs("div", { className: "message-forwarded", children: [_jsx(Icon, { name: "share-fat", size: "sm" }), _jsxs("span", { children: [s.chatForwardedFrom, " ", m.forwardedFrom] })] }), m.replyTo && _jsx("div", { className: "message-quote", children: _jsxs("span", { className: "message-quote-text", children: [_jsx("span", { className: "message-quote-title", children: m.replyTo.author }), _jsx("span", { className: "message-quote-body", children: m.replyTo.body })] }) }), midia.length > 0 && _jsx(Gallery, { className: "message-album", label: s.chatAttachments, zoom: !onOpenAttachment, ratio: midia.length === 1 ? "4/3" : "1/1", items: midia.map(a => ({ id: a.id, src: a.src, alt: a.alt ?? a.name ?? "", kind: a.kind === "video" ? "video" : "image", duration: a.duration })), onSelect: onOpenAttachment ? (id => { const a = midia.find(x => x.id === id); if (a)
                                                        onOpenAttachment(m, a); }) : undefined }), arquivos.length > 0 && _jsx("ul", { className: "file-list", "aria-label": s.chatAttachments, children: arquivos.map(a => _jsxs("li", { className: "file-item", children: [_jsx(Icon, { name: "file-text" }), a.href ? _jsx("a", { className: "file-name", href: a.href, download: a.name ?? true, children: a.name ?? a.href }) : _jsx("span", { className: "file-name", children: a.name }), a.bytes != null && _jsx("span", { className: "file-size", children: formatSize(a.bytes) })] }, a.id)) }), m.body, m.status && _jsx("div", { className: "message-status", children: _jsxs(Badge, { variant: m.status.variant, children: [_jsx("i", { className: "status-dot" }), m.status.label] }) })] })] })] }, m.id);
                    }), janela && hasMoreAfter && _jsx("div", { ref: fim, className: "message-more", children: loadingAfter && _jsx(Spinner, {}) })] }), janela && _jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", children: anuncio })] });
}
export function MessageComposer({ onSend, placeholder, label, icon, sendLabel, disabled, className, attach, replyTo, onCancelReply, editing, onCancelEdit }) {
    const s = useAureaStrings();
    const [text, setText] = React.useState("");
    const [anexos, setAnexos] = React.useState([]);
    const [recusados, setRecusados] = React.useState([]);
    const [aviso, setAviso] = React.useState("");
    const campo = React.useRef(null);
    const seletor = React.useRef(null);
    const seq = React.useRef(0);
    const opcoes = attach === true ? {} : attach || undefined;
    const editandoId = editing?.id;
    const respondendoId = replyTo?.id;
    // O texto antigo entra quando a edição COMEÇA (muda o id), e sai quando ela acaba — sem isso o
    // texto da mensagem editada ficava no campo como rascunho de mensagem nova.
    const editouAntes = React.useRef(undefined);
    React.useEffect(() => {
        if (editandoId !== undefined) {
            setText(editing?.body ?? "");
            campo.current?.focus();
        }
        else if (editouAntes.current !== undefined)
            setText("");
        editouAntes.current = editandoId;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editandoId]);
    React.useEffect(() => { if (respondendoId !== undefined)
        campo.current?.focus(); }, [respondendoId]);
    // As URLs das miniaturas vivem enquanto o anexo vive; desmontar solta todas (o FileInput faz igual).
    const anexosRef = React.useRef(anexos);
    anexosRef.current = anexos;
    React.useEffect(() => () => anexosRef.current.forEach(a => a.url && URL.revokeObjectURL(a.url)), []);
    const soltar = (lista) => lista.forEach(a => a.url && URL.revokeObjectURL(a.url));
    const escolher = (lista) => {
        if (!lista)
            return;
        const novos = [], fora = [];
        for (const file of Array.from(lista)) {
            if (!matchesAccept(file, opcoes?.accept))
                fora.push({ name: file.name, reason: s.fileWrongType });
            else if (opcoes?.maxSize != null && file.size > opcoes.maxSize)
                fora.push({ name: file.name, reason: s.fileTooLarge });
            else
                novos.push({ id: `a${seq.current++}`, file, url: file.type.startsWith("image/") && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined });
        }
        setRecusados(fora);
        if (novos.length) {
            if (opcoes?.multiple === false) {
                soltar(anexos);
                setAnexos(novos.slice(0, 1));
            }
            else
                setAnexos(prev => [...prev, ...novos]);
            setAviso(`${s.fileAdded}: ${novos.map(a => a.file.name).join(", ")}`);
        }
        if (seletor.current)
            seletor.current.value = "";
    };
    const remover = (a) => { soltar([a]); setAnexos(prev => prev.filter(x => x.id !== a.id)); setAviso(`${s.fileRemoved}: ${a.file.name}`); campo.current?.focus(); };
    const podeAnexar = !!opcoes && editandoId === undefined;
    const vazio = !text.trim() && !(podeAnexar && anexos.length);
    const submit = (e) => {
        e.preventDefault();
        if (vazio)
            return;
        const t = text.trim();
        // O segundo argumento só vai quando o app usa uma prop nova: quem chamava `onSend(texto)` e
        // conferia a chamada exata continua recebendo exatamente isso.
        if (!opcoes && replyTo == null && editing == null)
            onSend(t);
        else
            onSend(t, { files: podeAnexar ? anexos.map(a => a.file) : [], replyToId: editandoId === undefined ? respondendoId : undefined, editingId: editandoId });
        setText("");
        soltar(anexos);
        setAnexos([]);
        setRecusados([]);
    };
    const aoTeclar = (e) => {
        if (e.key !== "Escape")
            return;
        if (editandoId !== undefined && onCancelEdit) {
            e.preventDefault();
            onCancelEdit();
        }
        else if (respondendoId !== undefined && onCancelReply) {
            e.preventDefault();
            onCancelReply();
        }
    };
    const citacao = editing
        ? _jsxs("div", { className: "message-quote", children: [_jsx(Icon, { name: "pencil-simple", size: "sm" }), _jsxs("span", { className: "message-quote-text", children: [_jsx("span", { className: "message-quote-title", children: s.chatEditing }), _jsx("span", { className: "message-quote-body", children: editing.body })] }), onCancelEdit && _jsx(IconButton, { variant: "ghost", size: "sm", icon: "x", label: s.chatEditCancel, onClick: onCancelEdit })] })
        : replyTo
            ? _jsxs("div", { className: "message-quote", children: [_jsx(Icon, { name: "arrow-bend-up-left", size: "sm" }), _jsxs("span", { className: "message-quote-text", children: [_jsxs("span", { className: "message-quote-title", children: [s.chatReplyTo, replyTo.author != null && _jsxs(_Fragment, { children: [" ", replyTo.author] })] }), _jsx("span", { className: "message-quote-body", children: replyTo.body })] }), onCancelReply && _jsx(IconButton, { variant: "ghost", size: "sm", icon: "x", label: s.chatReplyCancel, onClick: onCancelReply })] })
            : null;
    const temFaixa = !!citacao || (podeAnexar && (anexos.length > 0 || recusados.length > 0));
    return _jsxs("form", { className: cx("message-composer", className), onSubmit: submit, children: [_jsxs(InputGroup, { children: [icon && _jsx(InputGroupAddon, { children: _jsx(Icon, { name: icon }) }), temFaixa && _jsxs("div", { className: "input-group-addon input-group-addon-start input-group-addon-block message-composer-context", children: [citacao, podeAnexar && anexos.length > 0 && _jsx("ul", { className: "file-list", "aria-label": s.chatAttachments, children: anexos.map(a => _jsxs("li", { className: "file-item", children: [a.url ? _jsx("img", { className: "file-thumb", src: a.url, alt: "" }) : _jsx(Icon, { name: "file-text" }), _jsx("span", { className: "file-name", children: a.file.name }), _jsx("span", { className: "file-size", children: formatSize(a.file.size) }), _jsx(IconButton, { variant: "ghost", size: "sm", icon: "x", label: `${s.fileRemove} ${a.file.name}`, onClick: () => remover(a) })] }, a.id)) }), podeAnexar && recusados.map((r, n) => _jsxs("span", { className: "field-error", children: [r.reason, ": ", r.name] }, n))] }), _jsx("input", { ref: campo, className: "input", value: text, disabled: disabled, placeholder: placeholder, "aria-label": label ?? s.chatMessage, onChange: e => setText(e.target.value), onKeyDown: aoTeclar }), podeAnexar && _jsx(InputGroupAddon, { side: "end", children: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "paperclip", label: s.chatAttach, disabled: disabled, onClick: () => seletor.current?.click() }) })] }), podeAnexar && _jsx("input", { ref: seletor, type: "file", hidden: true, accept: opcoes?.accept, multiple: opcoes?.multiple !== false, onChange: e => escolher(e.target.files) }), _jsx(IconButton, { type: "submit", variant: "primary", icon: editing ? "check" : "paper-plane-tilt", label: editing ? s.chatSave : (sendLabel ?? s.chatSend), disabled: disabled || vazio }), podeAnexar && _jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", children: aviso })] });
}
