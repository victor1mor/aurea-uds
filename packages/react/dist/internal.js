"use client";
// A diretiva na LINHA 1, como as referências a escrevem (Base UI e shadcn/ui, medidos em
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
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { defaultStrings, defaultSpriteUrl } from "./pure.js";
export { cx, fundirRender, defaultStrings, ptBR, defaultSpriteUrl, universalStates, stateSeverity } from "./pure.js";
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
export const ThemeContext = createContext({ theme: undefined, setTheme: () => { }, toggleTheme: () => { } });
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
export const PortalContext = createContext(undefined);
export const usePortalContainer = () => useContext(PortalContext);
export function useReorder({ count, order, onReorder, rowSelector, handleSelector }) {
    const s = useAureaStrings();
    const ref = useRef(null);
    const [pego, setPego] = useState(null);
    const [foco, setFoco] = useState(null);
    const [aviso, setAviso] = useState("");
    const origem = useRef(null);
    const arrasto = useRef(null);
    const anuncia = (verbo, i) => setAviso(`${verbo}: ${i + 1} ${s.positionOf} ${count}`);
    const alcas = () => [...(ref.current?.querySelectorAll(handleSelector) ?? [])];
    // Vai por efeito e não por `requestAnimationFrame`: o React precisa ter commitado a ordem nova
    // antes de procurar a alça.
    useEffect(() => { if (foco !== null) {
        alcas()[foco]?.focus();
        setFoco(null);
    } }, [foco, order]);
    const mover = (de, para) => { if (para >= 0 && para < count && de !== para)
        onReorder(de, para); };
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
    // trocar de lugar ao passar da metade da linha vizinha, e não ao encostar nela.
    const ponteiroMove = (e) => {
        const de = arrasto.current;
        if (de === null)
            return;
        const linhas = [...(ref.current?.querySelectorAll(rowSelector) ?? [])];
        const achado = linhas.findIndex(l => { const r = l.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
        const para = achado === -1 ? linhas.length - 1 : achado;
        if (para !== de) {
            mover(de, para);
            arrasto.current = para;
            setPego(para);
        }
    };
    const ponteiroSolta = () => {
        if (arrasto.current === null)
            return;
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
    };
    return { ref, pego, aviso, teclado, ponteiroBaixo, ponteiroMove, ponteiroSolta };
}
