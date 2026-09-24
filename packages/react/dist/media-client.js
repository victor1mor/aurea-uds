"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
import { IconButton } from "./actions.js";
// A galeria AMPLIA num Dialog, e o Dialog já existe (trava do item L2). O import é para `overlays`,
// que como este módulo mora no "resto" do DAG e não importa `media` — não há ciclo.
import { Dialog } from "./overlays.js";
// MediaPlayer (Fase 5): headless sobre <video>/<audio> nativos — o MOTOR de mídia é
// o browser; o componente só liga estado (play/tempo/buffer/volume/legenda) às
// classes .media-* já existentes. Sem CSS estrutural novo: o vídeo preenche o
// .media-viewport por style inline no elemento (não por regra no stylesheet), então
// o core e os baselines dos docs não mudam.
// A11y (o APG não fecha player; prática corrente pesquisada 07/2026): os controles
// são <button> nativos com aria-label que troca de estado (Reproduzir/Pausar,
// Silenciar/Ativar som) e a barra é <input type="range"> nativo — um slider de
// verdade, com setas/Home/End vindos do browser — cujo aria-valuetext lê o tempo por
// extenso (o número cru "243" não se entende; "4 minutes and 3 seconds" sim). Nada de
// role="slider" à mão. SEM atalho global de teclado: cada controle é focável e opera
// pelo próprio elemento nativo, então play/pause/seek/volume por teclado saem sem
// interceptar — interceptar quebraria digitação e não é padrão APG. O tempo por
// extenso é helper embutido em inglês (não i18n — como o formatSize do FileInput);
// os rótulos de botão passam pela i18n como todo controle.
function clockTime(sec) { if (!Number.isFinite(sec) || sec < 0)
    sec = 0; const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return `${m}:${String(s).padStart(2, "0")}`; }
export function spokenTime(sec) { if (!Number.isFinite(sec) || sec < 0)
    sec = 0; const m = Math.floor(sec / 60), s = Math.floor(sec % 60); const mp = m === 1 ? "minute" : "minutes", sp = s === 1 ? "second" : "seconds"; return m && s ? `${m} ${mp} and ${s} ${sp}` : m ? `${m} ${mp}` : `${s} ${sp}`; }
// Os handlers de mídia do consumidor são COMPOSTOS com os internos (não podem
// sobrescrevê-los: um onPlay externo silenciaria o estado playing e o botão
// ficaria em "Reproduzir" — auditoria 18/07/2026, MÉDIO 2).
export function MediaPlayer({ kind = "video", src, poster, title, subtitle, className, children, onClick, onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata, onDurationChange, onProgress, onVolumeChange, ...rest }) {
    const s = useAureaStrings();
    const boxRef = React.useRef(null);
    const mediaRef = React.useRef(null);
    const [playing, setPlaying] = React.useState(false);
    const [current, setCurrent] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [buffered, setBuffered] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [muted, setMuted] = React.useState(false);
    const [hasCaptions, setHasCaptions] = React.useState(false);
    const [captionsOn, setCaptionsOn] = React.useState(false);
    const [fullscreen, setFullscreen] = React.useState(false);
    // fullscreenchange vem do document (não do elemento); é o único estado que exige
    // listener — o resto sincroniza pelos eventos de mídia do próprio <video>.
    React.useEffect(() => { const on = () => setFullscreen(document.fullscreenElement === boxRef.current); document.addEventListener("fullscreenchange", on); return () => document.removeEventListener("fullscreenchange", on); }, []);
    const m = () => mediaRef.current;
    // ramifica pelo estado sincronizado (playing), não por el.paused: playing vem dos
    // eventos play/pause e não fica atrás do elemento (nem preso, como no jsdom).
    const togglePlay = () => { const el = m(); if (!el)
        return; if (playing)
        el.pause();
    else {
        const p = el.play();
        if (p)
            p.catch(() => { });
    } };
    const skip = (d) => { const el = m(); if (el)
        el.currentTime = Math.max(0, Math.min(el.currentTime + d, el.duration || Infinity)); };
    // seek/setVol/mute atualizam o estado na hora (input controlado responsivo) e o
    // elemento; os eventos de mídia reconfirmam depois (idempotente) e cobrem mudanças
    // externas (controles nativos, outra aba).
    const seek = (v) => { const el = m(); if (el)
        el.currentTime = v; setCurrent(v); };
    const setVol = (v) => { const el = m(); if (el) {
        el.volume = v;
        if (v > 0)
            el.muted = false;
    } setVolume(v); if (v > 0)
        setMuted(false); };
    const toggleMute = () => { const el = m(); const next = el ? !el.muted : !muted; if (el)
        el.muted = next; setMuted(next); };
    const toggleCaptions = () => { const el = m(); if (!el || !el.textTracks.length)
        return; const show = el.textTracks[0].mode !== "showing"; el.textTracks[0].mode = show ? "showing" : "hidden"; setCaptionsOn(show); };
    const toggleFullscreen = () => { if (document.fullscreenElement)
        document.exitFullscreen?.();
    else
        boxRef.current?.requestFullscreen?.(); };
    const syncVol = () => { const el = m(); if (el) {
        setVolume(el.volume);
        setMuted(el.muted);
    } };
    const syncBuf = () => { const el = m(); if (el && el.buffered.length)
        setBuffered(el.buffered.end(el.buffered.length - 1)); };
    const onMeta = () => { const el = m(); if (el) {
        setDuration(el.duration);
        setHasCaptions(el.textTracks.length > 0);
        syncVol();
    } };
    const playedPct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
    const bufferedPct = duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;
    const volPct = muted ? 0 : Math.round(volume * 100);
    const valueText = duration > 0 ? `${spokenTime(current)} of ${spokenTime(duration)}` : spokenTime(current);
    const MediaTag = kind === "audio" ? "audio" : "video";
    return _jsxs("div", { ref: boxRef, className: cx("media-player", className), role: "group", "aria-label": typeof title === "string" ? title : s.mediaPlayer, children: [_jsxs("div", { className: "media-viewport", children: [kind === "audio" && _jsxs("div", { className: "media-placeholder", children: [_jsx(Icon, { name: "volume--up" }), title && _jsx("strong", { children: title }), subtitle && _jsx("span", { children: subtitle })] }), _jsx(MediaTag, { ref: mediaRef, src: src, ...rest, ...(kind === "video" ? { poster, playsInline: true, className: "media-fill", onClick: (e) => { onClick?.(e); togglePlay(); } } : { onClick }), onPlay: (e) => { setPlaying(true); onPlay?.(e); }, onPause: (e) => { setPlaying(false); onPause?.(e); }, onEnded: (e) => { setPlaying(false); onEnded?.(e); }, onTimeUpdate: (e) => { const el = m(); if (el)
                            setCurrent(el.currentTime); onTimeUpdate?.(e); }, onLoadedMetadata: (e) => { onMeta(); onLoadedMetadata?.(e); }, onDurationChange: (e) => { const el = m(); if (el)
                            setDuration(el.duration); onDurationChange?.(e); }, onProgress: (e) => { syncBuf(); onProgress?.(e); }, onVolumeChange: (e) => { syncVol(); onVolumeChange?.(e); }, children: children })] }), kind === "video" && title && _jsx("div", { className: "media-overlay-title", children: _jsxs("div", { children: [_jsx("strong", { children: title }), subtitle && _jsx("span", { children: subtitle })] }) }), _jsxs("div", { className: "media-controls", children: [_jsxs("div", { className: "media-seek", style: { "--media-played": `${playedPct}%` }, children: [_jsxs("div", { className: "media-seek-track", children: [_jsx("span", { className: "media-seek-buffered", style: { width: `${bufferedPct}%` } }), _jsx("span", { className: "media-seek-played" })] }), _jsx("input", { type: "range", min: 0, max: duration > 0 ? duration : 0, step: "any", value: Math.min(current, duration || 0), "aria-label": s.mediaSeek, "aria-valuetext": valueText, onChange: e => seek(Number(e.target.value)) })] }), _jsxs("div", { className: "media-control-row", children: [_jsxs("div", { className: "media-control-group", children: [_jsx("button", { className: "media-control", type: "button", "aria-label": playing ? s.mediaPause : s.mediaPlay, onClick: togglePlay, children: _jsx(Icon, { name: playing ? "pause" : "play" }) }), _jsx("button", { className: "media-control", type: "button", "aria-label": s.mediaSkipBack, onClick: () => skip(-10), children: _jsx(Icon, { name: "rewind--10" }) }), _jsx("button", { className: "media-control", type: "button", "aria-label": s.mediaSkipForward, onClick: () => skip(10), children: _jsx(Icon, { name: "forward--10" }) }), _jsxs("span", { className: "media-time", children: [clockTime(current), " / ", clockTime(duration)] })] }), _jsxs("div", { className: "media-control-group", children: [_jsx("button", { className: "media-control", type: "button", "aria-label": muted ? s.mediaUnmute : s.mediaMute, onClick: toggleMute, children: _jsx(Icon, { name: muted || volume === 0 ? "volume--mute" : "volume--up" }) }), _jsx("input", { className: "media-volume", type: "range", min: 0, max: 100, value: volPct, "aria-label": s.mediaVolume, "aria-valuetext": `${volPct}%`, onChange: e => setVol(Number(e.target.value) / 100) }), hasCaptions && _jsx("button", { className: cx("media-control", captionsOn && "active"), type: "button", "aria-label": captionsOn ? s.mediaCaptionsHide : s.mediaCaptionsShow, "aria-pressed": captionsOn, onClick: toggleCaptions, children: _jsx(Icon, { name: "closed-caption" }) }), kind === "video" && _jsx("button", { className: "media-control", type: "button", "aria-label": fullscreen ? s.mediaFullscreenExit : s.mediaFullscreenEnter, onClick: toggleFullscreen, children: _jsx(Icon, { name: fullscreen ? "minimize" : "maximize" }) })] })] })] })] });
}
function comAutoplay(src) { try {
    const u = new URL(src);
    u.searchParams.set("autoplay", "1");
    return u.toString();
}
catch {
    return src + (src.includes("?") ? "&" : "?") + "autoplay=1";
} }
export function MediaEmbed({ src, title, poster, ratio = "16/9", href, autoplay = true, className, style, ...rest }) {
    const s = useAureaStrings();
    const [ativo, setAtivo] = React.useState(!poster);
    const [clicou, setClicou] = React.useState(false);
    const frameRef = React.useRef(null);
    React.useEffect(() => { if (clicou)
        frameRef.current?.focus(); }, [clicou]);
    const endereco = clicou && autoplay ? comAutoplay(src) : src;
    return _jsxs("div", { className: cx("media-embed", className), style: style, children: [_jsx("div", { className: "media-embed-frame", style: { aspectRatio: ratio }, children: ativo
                    ? _jsx("iframe", { ref: frameRef, src: endereco, title: title, loading: "lazy", referrerPolicy: "strict-origin-when-cross-origin", allow: "autoplay; encrypted-media; fullscreen; picture-in-picture", allowFullScreen: true, ...rest })
                    : _jsxs("button", { type: "button", className: "media-embed-facade", "aria-label": `${s.mediaPlay}: ${title}`, onClick: () => { setAtivo(true); setClicou(true); }, children: [_jsx("img", { src: poster, alt: "", loading: "lazy", decoding: "async" }), _jsx("span", { className: "media-embed-play", "aria-hidden": "true", children: _jsx(Icon, { name: "play--filled--alt" }) })] }) }), href && _jsxs("a", { className: "media-embed-link", href: href, target: "_blank", rel: "noopener", children: [_jsx(Icon, { name: "launch" }), s.mediaEmbedOpen] })] });
}
export function Image({ ratio, fit, alt, className, style, render, onError, ...props }) {
    const [quebrou, setQuebrou] = React.useState(false);
    // A proporção vai INLINE e só quando existe. Declará-la no core com fallback `auto` custou uma
    // medição em 15/08/2026: `auto` vence o `aspect-ratio: auto <width>/<height>` que o navegador
    // deriva dos atributos, e uma imagem com `width`/`height` e sem `ratio` saía com altura ZERO —
    // a regra escrita contra o salto de layout produzindo o salto. Sem prop, o navegador decide.
    const estilo = { ...(ratio ? { aspectRatio: ratio } : null), ...style };
    // O hook roda SEMPRE, antes de qualquer saída antecipada — trocar a ordem dos hooks entre
    // renders é o que o React proíbe, e o ramo do erro é uma saída antecipada.
    const elemento = useRender({ defaultTagName: "img", render,
        // Os defaults vêm ANTES do spread do consumidor, e a ordem foi corrigida por um teste que
        // reprovou: escritos depois, `loading="eager"` numa imagem de topo de página era engolido pelo
        // nosso `lazy` — o componente prometia default e entregava imposição.
        props: { loading: "lazy", decoding: "async", ...props, alt,
            className: cx("image", fit === "contain" && "image-contain", className), style: estilo,
            onError: (e) => { setQuebrou(true); onError?.(e); } } });
    // `role="img"` com `aria-label={alt}`: a caixa de erro continua sendo a imagem para quem usa
    // leitor de tela, com o mesmo texto alternativo. Sem isso o `alt` some junto com o `<img>`.
    if (quebrou)
        return _jsx("span", { className: cx("image", "image-broken", fit === "contain" && "image-contain", className), style: estilo, role: "img", "aria-label": alt, children: _jsx(Icon, { name: "image" }) });
    return elemento;
}
export function Gallery({ items, label, selected, onSelect, zoom, ratio = "1/1", className, ...props }) {
    const s = useAureaStrings();
    const [ampliado, setAmpliado] = React.useState(null);
    const interativo = !!onSelect || !!zoom;
    const aberto = items.find(i => i.id === ampliado);
    return _jsxs(_Fragment, { children: [_jsx("ul", { className: cx("gallery", className), "aria-label": label ?? s.galleryLabel, ...props, children: items.map(i => {
                    // LEGENDA VISÍVEL TORNA A MINIATURA DECORATIVA, e quem exigiu isso foi o axe, não a
                    // teoria: com `alt` e legenda dizendo a mesma coisa, ele reprova `image-redundant-alt` e o
                    // leitor de tela anuncia o texto DUAS vezes seguidas. É a regra de figura com legenda do
                    // WAI — quando o texto ao lado já diz, a imagem entra com `alt=""`. O `alt` de verdade não
                    // se perde: ele continua nomeando a foto AMPLIADA, que é onde não há legenda ao lado.
                    const miolo = _jsxs(_Fragment, { children: [_jsx(Image, { src: i.src, alt: i.caption != null ? "" : i.alt, ratio: ratio }), i.caption != null && _jsx("span", { className: "gallery-caption", children: i.caption })] });
                    return _jsx("li", { className: "gallery-item", children: interativo
                            ? _jsx("button", { type: "button", className: cx("gallery-tile", i.id === selected && "is-selected"), "aria-current": i.id === selected ? "true" : undefined, onClick: () => { onSelect?.(i.id); if (zoom)
                                    setAmpliado(i.id); }, children: miolo })
                            : miolo }, i.id);
                }) }), zoom && _jsx(Dialog, { open: !!aberto, title: aberto ? (aberto.caption ?? aberto.alt) : "", onClose: () => setAmpliado(null), children: aberto && _jsx(Image, { src: aberto.src, alt: aberto.alt, fit: "contain" }) })] });
}
// ── Carousel (PLANO-1.0, item L1) ────────────────────────────────────────────────────────────
// MARCAÇÃO, NÃO MOTOR — e a pergunta que o item mandava decidir primeiro ("se `scroll-snap` do
// CSS cobre, o componente é marcação") foi respondida MEDINDO, não preferindo:
//
//   • as QUATRO referências embrulham o MESMO motor de terceiro, o `embla-carousel` — medido em
//     15/08/2026 no `kibo-main/packages/shadcn-ui/.../carousel.tsx`, nas quatro bases do
//     `ui-main` (`aria`, `base`, `radix`, `new-york-v4`), no `carousel-base.tsx` do `react-main`
//     e no `activepieces-main`. Nenhuma escreve um motor; todas pagam o mesmo;
//   • o `@base-ui/react` NÃO tem carrossel (medido: 46 pastas em `packages/react/src`, nenhuma
//     é carousel — a mesma medição que abriu a decisão de motor do Calendar);
//   • trazer o `embla` seria DEPENDÊNCIA NOVA, que pelo `BUILDING.md` §3.3 interrompe o lote e
//     exige o Victor — para um componente que o navegador já sabe fazer;
//   • e o caminho SEM JavaScript nenhum ainda não serve: `::scroll-button()`/`::scroll-marker()`
//     (CSS Overflow 5) não são Baseline — pesquisado em 15/08/2026: Chrome/Edge 135+ têm,
//     o Safari 26.6 estava previsto para o fim deste mês e o Firefox segue "em desenvolvimento".
//     Um design system não pode entregar controle que só funciona num navegador.
//
// Então o motor é o CONTÊINER DE ROLAGEM nativo com `scroll-snap`, que é Baseline há anos e dá
// de graça o que o `embla` reimplementa: arrasto por toque com inércia, rolagem por roda e
// teclado, e o encaixe no slide. O que sobra de JavaScript é o que o CSS ainda não tem — saber
// em QUAL slide se está, para desenhar o ponto aceso e desabilitar a seta do fim.
//
// A ANIMAÇÃO é do CSS, de propósito: `scrollBy` sem `behavior` resolve para o `scroll-behavior`
// computado do elemento, então `.carousel-track{scroll-behavior:smooth}` decide — e a regra de
// `prefers-reduced-motion` que o core já tem (`scroll-behavior:auto!important`) alcança este
// componente sem uma linha nova. Passar `behavior:"smooth"` daqui passaria POR CIMA dela.
//
// UM componente, não sete peças: `Carousel.Root/Content/Item/PrevTrigger/NextTrigger/
// IndicatorGroup/Indicator` é a decomposição da referência, e aqui ela custaria sete fichas para
// desenhar uma lista que rola. É o mesmo argumento que o `Stepper`, o `TreeView` e a `Sidebar`
// já resolveram: quem embrulha cada slide é o componente, e por isso o rótulo "Slide 3 de 8"
// nunca fica com o consumidor — que é onde ele seria esquecido.
//
// LIMITES DECLARADOS (todos são escopo menor que o da referência, `BUILDING.md` §Passo 5):
//   • sem laço infinito, sem autoplay e sem arrasto com o MOUSE — os três são do `embla` e
//     nenhum deles apareceu na medição dos consumidores; laço, ainda por cima, não existe em
//     contêiner de rolagem nativo e voltaria a exigir motor;
//   • sem eixo vertical: não há uso medido, e o sprite não tem chevron para cima (a allowlist
//     do contrato tem `chevron--left/right/down`), então o eixo custaria glifo novo por nada;
//   • quantos slides aparecem por vez é CSS, não prop: `--carousel-slide` (default `100%`) é a
//     válvula no idioma do `--qr-size` e do `--datagrid-max-h`. É o caso `multiple` da
//     referência, sem API nenhuma;
//   • em RTL a rolagem vai para o lado certo (o deslocamento é medido pela borda inicial), mas
//     o GLIFO da seta não espelha — é uma linha de CSS que ninguém pediu e que nenhum teste
//     daqui mediria.
const desloc = (caixa, item, rtl) => rtl ? item.right - caixa.right : item.left - caixa.left;
export function Carousel({ children, label, controls = true, indicators = true, className, ...props }) {
    const s = useAureaStrings();
    const trilho = React.useRef(null);
    const slides = React.Children.toArray(children);
    // Nasce com `fim:false` e não com `true`: no HTML estático do catálogo — e no primeiro quadro
    // de qualquer consumidor — ninguém mediu nada ainda, e um carrossel existe porque há mais
    // conteúdo do que cabe. Começar com as duas setas apagadas mostraria um controle morto numa
    // página sem JavaScript; a medição da montagem corrige o caso de um slide só.
    const [pos, setPos] = React.useState({ indice: 0, inicio: true, fim: false });
    const medir = React.useCallback(() => {
        const el = trilho.current;
        if (!el)
            return;
        const rtl = getComputedStyle(el).direction === "rtl";
        const caixa = el.getBoundingClientRect();
        let indice = 0, perto = Infinity;
        [...el.children].forEach((filho, i) => {
            const d = Math.abs(desloc(caixa, filho.getBoundingClientRect(), rtl));
            if (d < perto) {
                perto = d;
                indice = i;
            }
        });
        // `Math.abs` no scrollLeft porque em RTL ele é NEGATIVO (de -max a 0) nos navegadores
        // atuais; sem isso, um carrossel em árabe nasceria com as duas setas no estado errado.
        const rolagem = Math.abs(el.scrollLeft), max = el.scrollWidth - el.clientWidth;
        const inicio = rolagem <= 1, fim = rolagem >= max - 1;
        // Devolver o MESMO objeto quando nada mudou faz o React não re-renderizar: `onScroll` dispara
        // dezenas de vezes por arrasto, e sem isto cada uma delas remontaria a fila de pontos.
        setPos(p => p.indice === indice && p.inicio === inicio && p.fim === fim ? p : { indice, inicio, fim });
    }, []);
    // `slides.length` na dependência: trocar a lista muda quem é o último, e a seta do fim
    // continuaria desabilitada sobre um carrossel que voltou a ter para onde ir.
    React.useEffect(() => { medir(); window.addEventListener("resize", medir); return () => window.removeEventListener("resize", medir); }, [medir, slides.length]);
    const irPara = (i) => {
        const el = trilho.current, alvo = el?.children[i];
        if (!el || !alvo)
            return;
        el.scrollBy({ left: desloc(el.getBoundingClientRect(), alvo.getBoundingClientRect(), getComputedStyle(el).direction === "rtl") });
    };
    // A11y pelo padrão APG de carrossel: a região se anuncia com `aria-roledescription="carousel"`
    // e nome próprio, cada slide é um `group` com "Slide N de M". O trilho é `tabIndex={0}` porque
    // conteúdo que rola tem de ser alcançável por teclado — é a regra `scrollable-region-focusable`
    // do axe, e é o que dá as setas de rolagem nativas sem interceptar tecla nenhuma.
    //
    // Os slides fora da vista NÃO ficam `inert`: aqui todos existem no DOM e na árvore de
    // acessibilidade, como em qualquer lista que rola. Escondê-los seria esconder as fotos 2 a 8 de
    // quem usa leitor de tela para ganhar uma ordem de Tab mais curta.
    return _jsxs("div", { className: cx("carousel", className), role: "region", "aria-roledescription": "carousel", "aria-label": label ?? s.carouselLabel, ...props, children: [_jsx("div", { ref: trilho, className: "carousel-track", tabIndex: 0, onScroll: medir, children: slides.map((slide, i) => _jsx("div", { className: "carousel-slide", role: "group", "aria-roledescription": "slide", "aria-label": `${s.carouselSlide} ${i + 1} ${s.positionOf} ${slides.length}`, children: slide }, i)) }), (controls || indicators) && _jsxs("div", { className: "carousel-controls", children: [controls && _jsx(IconButton, { icon: "chevron--left", label: s.carouselPrev, size: "sm", disabled: pos.inicio, onClick: () => irPara(pos.indice - 1) }), indicators && _jsx("div", { className: "carousel-dots", children: slides.map((_, i) => _jsx("button", { type: "button", className: "carousel-dot", "aria-current": i === pos.indice ? "true" : undefined, "aria-label": `${s.carouselSlide} ${i + 1}`, onClick: () => irPara(i) }, i)) }), controls && _jsx(IconButton, { icon: "chevron--right", label: s.carouselNext, size: "sm", disabled: pos.fim, onClick: () => irPara(pos.indice + 1) })] })] });
}
