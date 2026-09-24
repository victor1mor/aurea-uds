"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { peleDoEixo } from "./pure.js";
import { cx, StringsContext, SpriteContext, PortalContext, ThemeContext, DensityContext, DentroDoProviderContext, usePortalContainer, defaultStrings, defaultSpriteUrl, useSpriteUrl, useAureaStrings } from "./internal.js";
// `theme` e `density` seguem a convenção controlado/não-controlado do resto da biblioteca
// (`Toggle`, `ToggleGroup`): passe `theme` para mandar, `defaultTheme` para semear, e ouça por
// `onThemeChange`. Sem nenhum dos dois, o provider ADOTA o que o documento já trouxer no
// `<html>` — e essa é a parte que importa: o `data-theme` do markup existe para não haver
// piscada de tema no carregamento, e um provider que o sobrescrevesse na primeira pintura
// reintroduziria exatamente a piscada que ele evita.
// `portalContainer` (achado B7, Parte C do PLANO-1.0): onde TODO popup da biblioteca é montado.
// Configuração de aplicação, então entra aqui uma vez — o mesmo raciocínio do `spriteUrl`, e
// pela mesma razão medida: com prop por componente seriam nove sítios repassando a mesma coisa
// à mão, que é o achado A4 de novo.
// Sem ela nada muda: o Base UI monta no `document.body`, que é o que permite empilhar e
// posicionar sem herdar `overflow` nem `transform`. Com ela, o consumidor aponta para um nó
// dentro do landmark dele e o conteúdo do popup deixa de ficar fora de qualquer marco.
export function AureaProvider({ children, strings, direction = "ltr", spriteUrl = defaultSpriteUrl, portalContainer, theme, defaultTheme, onThemeChange, density, defaultDensity, onDensityChange }) {
    const value = React.useMemo(() => strings ? { ...defaultStrings, ...strings } : defaultStrings, [strings]);
    const temaCtx = useEixoDoDocumento("theme", theme, defaultTheme, onThemeChange);
    const densCtx = useEixoDoDocumento("density", density, defaultDensity, onDensityChange);
    const tema = React.useMemo(() => ({ theme: temaCtx.valor, setTheme: temaCtx.set,
        // `toggleTheme` existe porque é o gesto real: um botão de tema não escolhe entre dois
        // valores, ele inverte o atual. Deixar isso para o consumidor é como o catálogo e os docs
        // acabaram com duas implementações divergentes da mesma coisa.
        // 🔴 ERA `valor==="light"?"dark":"light"`, e o caso "ninguém escolheu ainda" saía INVERTIDO:
        // com `valor` indefinido aquilo dava `light`, então quem está no claro do sistema clicava e
        // NÃO VIA NADA ACONTECER — exatamente o defeito contra o qual o comentário do `useAureaTheme`
        // avisa, 90 linhas abaixo, e que um teste de lá já cobrava. Os dois `toggleTheme` da
        // biblioteca discordavam no mesmo caso de borda.
        // ⚠ Achado em 09/09/2026 SÓ porque o `useAureaTheme` passou a delegar para cá: a divergência
        // existia desde sempre e nenhum teste a pegava, porque cada metade era testada sozinha.
        // Agora a regra é uma: desconhecido resolve para claro e alterna para ESCURO.
        toggleTheme: () => temaCtx.set(temaCtx.valor === "dark" ? "light" : "dark") }), [temaCtx]);
    const dens = React.useMemo(() => ({ density: densCtx.valor, setDensity: densCtx.set }), [densCtx]);
    return _jsx(DentroDoProviderContext.Provider, { value: true, children: _jsx(StringsContext.Provider, { value: value, children: _jsx(SpriteContext.Provider, { value: spriteUrl, children: _jsx(PortalContext.Provider, { value: portalContainer, children: _jsx(ThemeContext.Provider, { value: tema, children: _jsx(DensityContext.Provider, { value: dens, children: _jsx(DirectionProvider, { direction: direction, children: _jsx(BaseToast.Provider, { children: _jsxs(BaseTooltip.Provider, { children: [children, _jsx(AureaToastViewport, {})] }) }) }) }) }) }) }) }) });
}
/** Um eixo de apresentação que vive no `<html>`: tema ou densidade. A conta é a mesma para os
 *  dois, e escrevê-la duas vezes seria o defeito do §21 cometido dentro do próprio conserto
 *  dele. */
function useEixoDoDocumento(attr, controlado, semente, aviso) {
    // Nada de ler `document` durante o render: em SSR ele não existe, e o valor lido no cliente
    // divergiria do renderizado no servidor (erro de hidratação). O estado nasce da semente, e o
    // efeito abaixo adota o que o documento já traz.
    const [interno, setInterno] = React.useState(semente);
    const valor = controlado ?? interno;
    React.useEffect(() => {
        const raiz = document.documentElement;
        if (valor === undefined) {
            const doDoc = raiz.dataset[attr];
            if (doDoc)
                setInterno(doDoc); // adota o markup em vez de sobrescrevê-lo
            return;
        }
        if (raiz.dataset[attr] !== valor)
            raiz.dataset[attr] = valor;
    }, [attr, valor]);
    const set = React.useCallback((v) => {
        if (controlado === undefined)
            setInterno(v);
        aviso?.(v);
    }, [controlado, aviso]);
    return React.useMemo(() => ({ valor, set }), [valor, set]);
}
export const useToast = () => BaseToast.useToastManager();
// useAureaTheme (M7): ler e trocar os DOIS eixos que a Aurea põe no <html> — `data-theme` e
// `data-density`. Até aqui só existia `window.Aurea.setTheme` no `aurea.js`, que é vanilla: em
// React não havia como saber o tema atual sem enfiar a mão no DOM, e um botão de tema não sabia
// que ícone desenhar.
//
// O QUE ESTE HOOK NÃO FAZ, e é a parte mais importante dele — pesquisado em 13/08/2026, não
// suposto. O `next-themes` já resolve persistência, preferência do sistema, sincronia entre abas
// e o script embutido que evita o flash, e ele escreve **`data-theme` no <html>**, que é
// exatamente o atributo que a Aurea lê. Ou seja: os dois já se encaixam sem código nosso.
// Reescrever isso aqui seria trocar uma biblioteca mantida por uma cópia pior — e guardar
// preferência de usuário é decisão da APLICAÇÃO, não da biblioteca de interface (é o mesmo
// motivo pelo qual a persistência de tema do catálogo mora no catálogo).
// O que ele faz é o que biblioteca nenhuma faz: **densidade**, que é eixo da Aurea e não existe
// no `next-themes` nem em ninguém.
//
// `useSyncExternalStore` e não `useState`: o valor mora no DOM, e quem o troca pode ser outro —
// o `next-themes`, um script no <head>, ou o `window.Aurea` de sempre. Assinar a mutação do
// atributo é o que mantém o React em dia com quem manda de verdade.
//
// E `getServerSnapshot` devolve `null` de propósito. A armadilha está documentada no próprio
// `next-themes`: no servidor o tema é **desconhecido**, e fingir um valor produz erro de
// hidratação. Por isso o retorno é `theme: string|null` — enquanto for `null`, não desenhe UI que
// dependa do tema. É a mesma regra do "delay rendering until mounted", só que sem um `mounted`
// solto para o consumidor esquecer de checar.
const assinaHtml = (cb) => {
    if (typeof MutationObserver === "undefined")
        return () => { };
    const obs = new MutationObserver(cb);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-density"] });
    return () => obs.disconnect();
};
const leAtributo = (nome) => () => typeof document === "undefined" ? null : document.documentElement.getAttribute(nome);
const semServidor = () => null;
export function useAureaTheme() {
    const theme = React.useSyncExternalStore(assinaHtml, leAtributo("data-theme"), semServidor);
    const density = React.useSyncExternalStore(assinaHtml, leAtributo("data-density"), semServidor);
    // 🔴 QUEM ESCREVE MUDA CONFORME HAJA PROVIDER — conserto de 09/09/2026, com o defeito medido
    // em `tests/unit/tema-fonte-unica.test.tsx`. Escrever o atributo direto DENTRO de um
    // `AureaProvider` faz o CSS mudar e o contexto ficar para trás: o efeito do provider só
    // reescreve o atributo quando o valor DELE muda, e ele não mudou. Delegar resolve na origem —
    // o provider vira o único que escreve, e o atributo continua saindo dele.
    // ⚠ E a LEITURA continua vindo do DOM nos dois casos, de propósito: o provider escreve o
    // atributo, então o DOM é o denominador comum, e é ele que o CSS obedece.
    const dentroDeProvider = React.useContext(DentroDoProviderContext);
    const ctxTema = React.useContext(ThemeContext);
    const ctxDens = React.useContext(DensityContext);
    return React.useMemo(() => ({
        theme, density,
        setTheme: (t) => {
            if (dentroDeProvider) {
                ctxTema.setTheme(t);
                return;
            }
            document.documentElement.dataset.theme = t;
        },
        setDensity: (d) => {
            if (dentroDeProvider) {
                ctxDens.setDensity(d);
                return;
            }
            document.documentElement.dataset.density = d;
        },
        // Alternar é sobre o que está NA TELA, então `null` (servidor, ou ninguém escolheu ainda)
        // resolve para claro e vira escuro — e não o contrário, que deixaria o primeiro clique sem
        // efeito visível em quem estava no claro do sistema.
        toggleTheme: () => {
            if (dentroDeProvider) {
                ctxTema.toggleTheme();
                return;
            }
            document.documentElement.dataset.theme = theme === "dark" ? "light" : "dark";
        },
    }), [theme, density, dentroDeProvider, ctxTema, ctxDens]);
}
function AureaToastList() {
    const { toasts } = BaseToast.useToastManager();
    const s = useAureaStrings();
    return _jsx(_Fragment, { children: toasts.map(t => (_jsxs(BaseToast.Root, { toast: t, className: cx("toast", t.type && `toast-${t.type}`), children: [_jsxs("div", { className: "toast-text", children: [_jsx(BaseToast.Title, { render: _jsx("strong", {}) }), t.description ? _jsx(BaseToast.Description, { className: "muted" }) : null] }), _jsx(BaseToast.Close, { className: "btn btn-ghost btn-icon btn-sm", "aria-label": s.dismissNotification, children: "\u00D7" })] }, t.id))) });
}
function AureaToastViewport() {
    const portal = usePortalContainer();
    return _jsx(BaseToast.Portal, { container: portal, children: _jsx(BaseToast.Viewport, { className: "toast-stack", children: _jsx(AureaToastList, {}) }) });
}
// spriteUrl aqui é OVERRIDE local (dois sprites na mesma página, por exemplo). O normal é
// não passar nada e deixar o AureaProvider dizer de onde vêm os glifos.
export function Icon({ name, spriteUrl, size, className, ...props }) { const base = useSpriteUrl(); return _jsx("svg", { "aria-hidden": "true", className: cx("icon", peleDoEixo("icon", size), className), ...props, children: _jsx("use", { href: `${spriteUrl ?? base}#i-${name}` }) }); }
