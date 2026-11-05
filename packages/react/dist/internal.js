"use client";
// A diretiva na LINHA 1, como as referências a escrevem (o Base UI e outra delas, medidos em
// 06/08/2026) — Parte A do PLANO-1.0. Este módulo chama `createContext`, que é API só de
// cliente: sem a diretiva, `import {Button} from "@aurea-uds/react"` dentro de um componente
// de servidor quebrava na hora, e quebrava no consumidor.
//
// O que NÃO tem estado saiu daqui para o `pure.tsx` — está explicado lá. A reexportação abaixo
// existe para os 18 módulos de cliente seguirem importando `cx` de "./internal.js" sem mudança.
//
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// pure → internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
// INTERNO: o que todo módulo precisa e ninguém publica como componente próprio.
// NÃO é subpath — `@aurea-uds/react/internal` não existe, de propósito.
// Kbd mora aqui por dependência, não por categoria: o Button precisa dele e ele não precisa de
// ninguém. A casa pública dele continua sendo `/data-display`, que o reexporta.
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { defaultStrings, defaultSpriteUrl } from "./pure.js";
export { cx, fundirRender, defaultStrings, ptBR, defaultSpriteUrl, universalStates, stateSeverity } from "./pure.js";
// Os controles da Aurea que moram FORA do pacote principal (o `DatePicker`, em `./calendar`, 0.32.0) e
// entregam o `id` ao nó focal. O `Field` os nomeia com `<label for>`, como os da lista dele; eles se
// registram aqui ao carregar, porque importar cada um no `Field` puxaria o motor deles para todo app.
export const controlesRotulaveis = new WeakSet();
export const StringsContext = createContext(defaultStrings);
export const useAureaStrings = () => useContext(StringsContext);
export const SpriteContext = createContext(defaultSpriteUrl);
export const useSpriteUrl = () => useContext(SpriteContext);
// Tema e densidade viajam por contexto, e não por leitura do DOM, por um motivo que já custou
// caro em outro lugar deste repositório: quem lê o DOM não é notificado quando ele muda. O
// `TableOfContents` é presentacional pelo mesmo desenho e por isso NÃO marca a seção em vista
// (`G-CAP-25`). Aqui o provider é o dono do valor, escreve no `<html>` e avisa quem depende.
//
// O valor inicial é `undefined` de propósito: significa "ninguém decidiu ainda", que é
// diferente de "escuro". Um default concreto aqui faria o provider sobrescrever, na primeira
// pintura, o `data-theme` que o documento já traz no markup — e esse atributo existe justamente
// para não haver piscada de tema ao carregar.
// `preference` (15/10/2026): o que foi ESCOLHIDO, que pode ser `"system"`; `theme` é o que está na tela.
export const ThemeContext = createContext({ theme: undefined, preference: undefined, setTheme: () => { }, toggleTheme: () => { } });
/** Tema atual e como trocá-lo. Fora de um `AureaProvider`, devolve `undefined` e no-ops — não
 *  lança: um componente isolado num teste não deve morrer por falta de provider. */
export const useTheme = () => useContext(ThemeContext);
export const DensityContext = createContext({ density: undefined, setDensity: () => { } });
/** Densidade atual e como trocá-la. Mesma regra do `useTheme`. */
export const useDensity = () => useContext(DensityContext);
// ONDE OS POPUPS SÃO MONTADOS — achado B7, fechado na Parte C do PLANO-1.0 (07/08/2026).
// O DEFEITO não era o portal: era o consumidor não ter como mexer nele. Todo popup da Aurea
// (diálogo, gaveta, dica, popover, os dois menus, notificação, combobox, toast) monta num
// portal no nível do `body` — é o que permite empilhar e posicionar sem herdar `overflow` nem
// `transform` de ninguém. A consequência é que o conteúdo dele fica FORA de qualquer landmark,
// e o axe acusa `region` ("todo conteúdo num landmark"). A auditoria registrou, e escreveu que
// "a única forma de satisfazer seria o consumidor montar o portal dentro do landmark dele" —
// só que ele não tinha essa forma, porque o `container` do Base UI nunca foi exposto.
// Agora tem, e entra pelo provider, UMA vez, como o sprite: é configuração de aplicação, não
// prop de componente (foi a lição do achado A4, com 52 sítios repassando `spriteUrl` à mão).
// `undefined` é o default e mantém o comportamento de sempre: `document.body`.
// 🔴 A SENTINELA DE "ESTOU DENTRO DE UM PROVIDER" — 09/09/2026, e ela existe por um defeito
// medido, não por precaução. O `useAureaTheme` (porta `/system`) escrevia o `data-theme` no
// documento DIRETO; o efeito do `AureaProvider` só reescreve o atributo quando o valor DELE muda,
// e não mudava. Resultado: o CSS ia para claro e o contexto continuava dizendo escuro, então todo
// componente que lê `useTheme()` renderizava do jeito errado — sem erro, sem aviso, publicado.
// ⚠ POR QUE UMA SENTINELA E NÃO "olhar o ThemeContext": o padrão dele é
// `{theme:undefined,setTheme:noop}` DE PROPÓSITO — `useTheme()` fora de um provider devolve isso
// em vez de lançar, e um componente isolado num teste depende disso. Então o valor do contexto
// NÃO distingue "sem provider" de "provider que ainda não adotou tema". Só um booleano que
// apenas o provider fornece distingue.
export const DentroDoProviderContext = createContext(false);
// GAR-14 (0.28.0): o gerenciador dos avisos PRESOS a um botão (o "Link copiado" do `Button share`).
// Separado do da pilha, como a documentação do motor manda; o hospedeiro é o `AvisosAncorados` do
// `system.tsx`, montado pelo `AureaProvider` de fora. Mora aqui para não sair no barril público.
export const avisosAncorados = BaseToast.createToastManager();
export const PortalContext = createContext(undefined);
export const usePortalContainer = () => useContext(PortalContext);
// direction informa o Base UI (lado dos popovers, setas do teclado). O CSS
// espelha sozinho por propriedade lógica, mas depende do atributo dir no DOM:
// quem consome precisa pôr dir="rtl" no <html>. Este provider não mexe no DOM.
// ── O MOVIMENTO (S-04 e S-05, 05/11/2026) ─────────────────────────────────────────────────────
// O Victor achou a Aurea "estática": o escolhido do `SegmentedControl` e do `Tabs` PULAVA, e o arrasto do
// `SortableList` e do `BlockEditor` ia de casa em casa. Decidido por ele (05/11/2026, "Construir nós"): sem biblioteca
// nova, CSS e a animação do próprio navegador (`Element.animate`). O tempo e a curva NÃO se escrevem aqui: saem dos
// tokens da folha (`--duration-*`, `--ease-*`), lidos no elemento — o mesmo número que o CSS usa. Sem a folha, não há
// token, e não há animação: a troca acontece de uma vez, como antes. E quem pediu "reduzir movimento" também vê de
// uma vez — a regra global do CSS não alcança a animação feita por código, então quem pergunta é este arquivo.
export const reduzMovimento = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export function tempoDoToken(el, duracao, curva) {
    const cs = getComputedStyle(el);
    const d = cs.getPropertyValue(duracao).trim(), easing = cs.getPropertyValue(curva).trim();
    const duration = d.endsWith("ms") ? parseFloat(d) : d.endsWith("s") ? parseFloat(d) * 1000 : NaN;
    return Number.isFinite(duration) && duration > 0 && easing ? { duration, easing } : null;
}
// O nome das animações deste arquivo: para cancelar só as nossas, e não a transição de CSS da mesma peça.
const ANIMACAO = "aurea-movimento";
// ── useDeslize (S-04) ─────────────────────────────────────────────────────────────────────────
// O ESCOLHIDO DESLIZA. A referência tem uma peça separada atrás dos itens. Aqui o escolhido continua se pintando — as
// sete cores do segmento, as treze marcas e os dois temas são regras de CSS que este gancho NÃO repete —, e só na troca
// entra uma peça de passagem: ela COPIA a pintura do novo escolhido (o fundo, a sombra, o aro e o fio de baixo, que na
// aba secundária é o único sinal), esconde a do item e anda da posição de antes até a nova. No fim, sai, e o item volta
// a se pintar. Copiar o que o navegador calculou, em vez de reescrever as cores, é o que garante que o escolhido em
// repouso fique IDÊNTICO ao de hoje. Troca no meio do caminho parte de onde a peça está, e não do item de antes.
// `seletor` acha o escolhido dentro de `ref`; `chave` é o valor escolhido.
export function useDeslize(ref, seletor, chave) {
    const anterior = useRef(null);
    const emCurso = useRef(null);
    React.useLayoutEffect(() => () => { emCurso.current?.(); }, []);
    React.useLayoutEffect(() => {
        const raiz = ref.current;
        if (!raiz)
            return;
        const novo = raiz.querySelector(seletor);
        const velho = anterior.current;
        anterior.current = novo;
        const corrente = emCurso.current;
        emCurso.current = null;
        const de = corrente ? corrente() : velho && velho !== novo && velho.isConnected ? velho.getBoundingClientRect() : null;
        if (!novo || !de || !de.width || reduzMovimento() || typeof novo.animate !== "function")
            return;
        const tempo = tempoDoToken(raiz, "--duration-slow", "--ease-emphasized");
        if (!tempo)
            return;
        const para = novo.getBoundingClientRect();
        if (!para.width)
            return;
        const cs = getComputedStyle(novo), fio = getComputedStyle(novo, "::after");
        const passagem = document.createElement("span");
        passagem.className = "selection-indicator";
        passagem.setAttribute("aria-hidden", "true");
        Object.assign(passagem.style, { left: "0px", top: "0px", borderRadius: cs.borderRadius, backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage, boxShadow: cs.boxShadow });
        if (fio.content && fio.content !== "none" && fio.content !== "normal" && fio.display !== "none") {
            const linha = document.createElement("span");
            Object.assign(linha.style, { left: fio.left, right: fio.right, bottom: fio.bottom, height: fio.height,
                borderRadius: fio.borderRadius, backgroundColor: fio.backgroundColor });
            passagem.append(linha);
        }
        // A peça mora DENTRO da fila, atrás dos itens (`z-index:-1` num contexto de empilhamento só dela), e a fila só
        // ganha posição e contexto durante a passagem — em repouso, nada nela muda.
        const antes = { position: raiz.style.position, isolation: raiz.style.isolation };
        if (getComputedStyle(raiz).position === "static")
            raiz.style.position = "relative";
        raiz.style.isolation = "isolate";
        const rr = raiz.getBoundingClientRect();
        const quadro = (r) => ({ transform: `translate(${r.left - rr.left - raiz.clientLeft + raiz.scrollLeft}px,${r.top - rr.top - raiz.clientTop + raiz.scrollTop}px)`,
            width: `${r.width}px`, height: `${r.height}px` });
        const pintura = ["background-color", "background-image", "box-shadow"].map(p => [p, novo.style.getPropertyValue(p), novo.style.getPropertyPriority(p)]);
        for (const [p] of pintura)
            novo.style.setProperty(p, p === "background-color" ? "transparent" : "none", "important");
        novo.setAttribute("data-sliding", "");
        raiz.prepend(passagem);
        const a = passagem.animate([quadro(de), quadro(para)], { ...tempo, fill: "forwards", id: ANIMACAO });
        let feito = false;
        const encerra = () => {
            const onde = passagem.getBoundingClientRect();
            if (feito)
                return onde;
            feito = true;
            a.cancel();
            passagem.remove();
            for (const [p, v, pr] of pintura) {
                if (v)
                    novo.style.setProperty(p, v, pr);
                else
                    novo.style.removeProperty(p);
            }
            if (!novo.getAttribute("style"))
                novo.removeAttribute("style");
            novo.removeAttribute("data-sliding");
            raiz.style.position = antes.position;
            raiz.style.isolation = antes.isolation;
            if (!raiz.getAttribute("style"))
                raiz.removeAttribute("style");
            if (emCurso.current === encerra)
                emCurso.current = null;
            return onde;
        };
        emCurso.current = encerra;
        a.onfinish = () => { encerra(); };
    }, [chave]);
}
export function useReorder({ count, order, onReorder, rowSelector, handleSelector }) {
    const s = useAureaStrings();
    const ref = useRef(null);
    const [pego, setPego] = useState(null);
    const [foco, setFoco] = useState(null);
    const [aviso, setAviso] = useState("");
    const origem = useRef(null);
    const arrasto = useRef(null);
    // S-05: a MÃO — a linha que o ponteiro pegou, onde o ponteiro estava ao pegar e agora, e o topo dela ao pegar. Com isso a
    // linha anda com o ponteiro (`translate`), e não só pula de casa em casa.
    const mao = useRef(null);
    // S-05: onde cada linha estava NA TELA antes da troca — a conta do "First, Last, Invert, Play": depois de a ordem nova
    // entrar, cada vizinho parte de onde estava e desliza até o lugar novo.
    const antes = useRef(null);
    const anuncia = (verbo, i) => setAviso(`${verbo}: ${i + 1} ${s.positionOf} ${count}`);
    const alcas = () => [...(ref.current?.querySelectorAll(handleSelector) ?? [])];
    const linhas = () => [...(ref.current?.querySelectorAll(rowSelector) ?? [])];
    // `offsetTop` não conta o `translate` nem a animação: é o lugar da linha na lista, e não onde ela aparece agora.
    const seguir = (m) => { m.linha.style.translate = `0 ${m.y - m.y0 - (m.linha.offsetTop - m.topo0)}px`; };
    // Vai por efeito e não por `requestAnimationFrame`: o React precisa ter commitado a ordem nova
    // antes de procurar a alça.
    useEffect(() => { if (foco !== null) {
        alcas()[foco]?.focus();
        setFoco(null);
    } }, [foco, order]);
    // A ordem nova entrou: a linha pega volta para baixo do ponteiro, e os vizinhos deslizam de onde estavam.
    useLayoutEffect(() => {
        const m = mao.current;
        if (m)
            seguir(m);
        const mapa = antes.current;
        antes.current = null;
        if (!mapa || !ref.current || reduzMovimento())
            return;
        const tempo = tempoDoToken(ref.current, "--duration-base", "--ease-emphasized");
        if (!tempo)
            return;
        for (const l of linhas()) {
            if (m && l === m.linha)
                continue;
            const de = mapa.get(l);
            if (de == null || typeof l.animate !== "function")
                continue;
            for (const a of l.getAnimations?.() ?? [])
                if (a.id === ANIMACAO)
                    a.cancel();
            const d = de - l.getBoundingClientRect().top;
            if (Math.abs(d) >= 1)
                l.animate([{ transform: `translateY(${d}px)` }, { transform: "none" }], { ...tempo, id: ANIMACAO });
        }
    }, [order]);
    const mover = (de, para) => {
        if (para >= 0 && para < count && de !== para) {
            antes.current = new Map(linhas().map(l => [l, l.getBoundingClientRect().top]));
            onReorder(de, para);
        }
    };
    const teclado = (e, i) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (pego === null) {
                origem.current = i;
                setPego(i);
                anuncia(s.sortableGrabbed, i);
            }
            else {
                setPego(null);
                origem.current = null;
                anuncia(s.sortableDropped, i);
            }
            return;
        }
        // As setas não podem fazer NADA com o item solto, senão o componente sequestra a navegação.
        if (pego === null)
            return;
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const para = i + (e.key === "ArrowUp" ? -1 : 1);
            if (para < 0 || para >= count)
                return;
            mover(i, para);
            setPego(para);
            setFoco(para);
            anuncia(s.sortableMoved, para);
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            const volta = origem.current;
            if (volta !== null && volta !== i) {
                mover(i, volta);
                setFoco(volta);
            }
            setPego(null);
            origem.current = null;
            anuncia(s.sortableCanceled, volta ?? i);
        }
    };
    // O alvo é a primeira linha cujo MEIO ainda está abaixo do ponteiro — a conta que faz o item
    // trocar de lugar ao passar da metade da linha vizinha, e não ao encostar nela. O meio é o do LUGAR da linha
    // (`offsetTop`), e não o de onde ela aparece: a linha pega anda com o ponteiro e os vizinhos estão deslizando, e medir a
    // caixa na tela faria o alvo tremer. A origem dos `offsetTop` na tela sai da própria lista.
    const ponteiroMove = (e) => {
        const de = arrasto.current;
        if (de === null)
            return;
        const m = mao.current;
        if (m) {
            m.y = e.clientY;
            seguir(m);
        }
        const lista = ref.current;
        if (!lista)
            return;
        const ls = linhas();
        const caixa = lista.getBoundingClientRect();
        const zero = ls[0]?.offsetParent === lista ? caixa.top + lista.clientTop - lista.scrollTop : caixa.top - lista.offsetTop;
        const achado = ls.findIndex(l => e.clientY < zero + l.offsetTop + l.offsetHeight / 2);
        const para = achado === -1 ? ls.length - 1 : achado;
        if (para !== de) {
            mover(de, para);
            arrasto.current = para;
            setPego(para);
        }
    };
    // Ao soltar, a linha desliza do ponteiro até o lugar dela, e só então desce de volta para o nível das outras.
    const pousa = () => {
        const m = mao.current;
        mao.current = null;
        if (!m)
            return;
        const d = m.y - m.y0 - (m.linha.offsetTop - m.topo0);
        m.linha.style.translate = "";
        if (!m.linha.getAttribute("style"))
            m.linha.removeAttribute("style");
        const fim = () => m.linha.removeAttribute("data-dragging");
        const tempo = ref.current && !reduzMovimento() && typeof m.linha.animate === "function" ? tempoDoToken(ref.current, "--duration-base", "--ease-emphasized") : null;
        if (!tempo || Math.abs(d) < 1) {
            fim();
            return;
        }
        const a = m.linha.animate([{ transform: `translateY(${d}px)` }, { transform: "none" }], { ...tempo, id: ANIMACAO });
        a.onfinish = fim;
        a.oncancel = fim;
    };
    const ponteiroSolta = () => {
        if (arrasto.current === null)
            return;
        pousa();
        anuncia(s.sortableDropped, arrasto.current);
        arrasto.current = null;
        setPego(null);
    };
    const ponteiroBaixo = (e, i) => {
        if (e.pointerType === "mouse" && e.button !== 0)
            return;
        e.currentTarget.setPointerCapture(e.pointerId);
        arrasto.current = i;
        setPego(i);
        const linha = e.currentTarget.closest(rowSelector);
        if (linha) {
            for (const a of linha.getAnimations?.() ?? [])
                if (a.id === ANIMACAO)
                    a.finish();
            linha.setAttribute("data-dragging", "");
            mao.current = { linha, y0: e.clientY, topo0: linha.offsetTop, y: e.clientY };
        }
    };
    return { ref, pego, aviso, teclado, ponteiroBaixo, ponteiroMove, ponteiroSolta };
}
