"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { useDirection } from "@base-ui/react/direction-provider";
import { cx, useAureaStrings } from "./internal.js";
import { useValorResponsivo } from "./responsivo-runtime.js";
import { ESCALA } from "./escala.js";
import { IconButton } from "./actions.js";
import { Tooltip } from "./overlays.js";
import { Sidebar, Topbar } from "./navigation.js";
// ── Auxiliar de topo: mora ANTES do primeiro export, e a posição é obrigatória ───────────────
// O check 22 mede o corpo de um componente do `export` dele até o PRÓXIMO export — fatia longa
// de propósito, porque a implementação de vários componentes daqui continua num auxiliar não
// exportado logo abaixo (a `Sidebar` é o caso: o `aria-current` dela mora num). Encurtar a fatia
// foi tentado em 09/08/2026 e a prova contra o defeito recusou: a `Sidebar` com `states: []`
// deixava de ser acusada.
// Consequência: auxiliar escrito ENTRE dois exports é lido como parte do componente anterior.
// Esta função tem `button:not([disabled])` num seletor, e o `\bdisabled\b` da regra acusou o
// `Grid` de emitir estado que ele não emite. Escrita aqui em cima, não pertence à fatia de
// ninguém. **Auxiliar de topo em módulo de componente vem antes dos exports.**
//
// O que ela faz e por que existe: o popover nativo não entrega a mesma gestão de foco nos três
// motores, e a tabela medida está no `aurea.js` do core. As mesmas cinco linhas moram lá, e a
// repetição é deliberada porque são DOIS RUNTIMES, não dois desenhos — o do core é delegado e
// serve página estática e consumo vanilla (é o que o catálogo carrega); este serve quem instala
// só o `@aurea-uds/react`, que importa o CSS do core e nunca o JS dele. Rodar os dois é
// inofensivo: focar o mesmo elemento duas vezes não faz nada.
//
// A comparação é com `"closed"` e NÃO com `"open"`, e isso é cicatriz — não simplifique de
// volta. O `ToggleEvent.newState` só tem esses dois valores, então as duas formas são idênticas
// em efeito; a diferença é no GATE. O check 15 trata qualquer string do fonte como possível nome
// de classe (de propósito: a versão estrita não vê `badge-${variant}` e quase fez o D1 apagar
// classes vivas). Com o literal `"open"` aqui, a `.drawer-wrap.open` do core — resto morto da
// página vanilla removida na Parte D — passava a parecer PRODUZIDA pela biblioteca, e a catraca
// queria travar um ganho falso.
function focoDaGaveta(e) {
    const gaveta = e.currentTarget;
    // Primeiro focável de DENTRO, não a gaveta: o WebKit não entra no conteúdo do popover pelo
    // Tab nem com o foco no elemento dele — medido no K1.
    if (e.newState !== "closed") {
        const primeiro = gaveta.querySelector('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (primeiro)
            primeiro.focus();
        else {
            gaveta.tabIndex = -1;
            gaveta.focus();
        }
        return;
    }
    // Só devolve o foco se ele ficou órfão; se a pessoa já o moveu, puxá-lo de volta seria roubo.
    if (document.activeElement === document.body || gaveta.contains(document.activeElement))
        document.querySelector(`[popovertarget="${gaveta.id}"]`)?.focus();
}
// API pública intacta: as props seguem brand/navigation/topbar. O que mudou é ONDE a
// marca sai — no topo, não na lateral. `topbarVariant` escolhe a pele do topo; o shell
// precisa saber porque a lateral se encaixa abaixo dele (o `flush` não tem folga em
// cima, então ela sobe um --space-4). `pill` é cabeçalho de site — não é pra shell.
// A lateral RECOLHE em tela estreita: o <aside> é um popover nativo e o botão é o invoker. O
// navegador entrega Escape, clique fora e o `aria-expanded` no disparador. Era o achado A8: em
// 375px o `h1` da página começava 4,6 telas abaixo, depois dos 65 itens da navegação.
// Não-modal de propósito, como o CommandPaletteShell: o foco não fica preso, e por isso não
// declaramos modalidade que não entregamos.
//
// ATÉ 09/08/2026 ESTE COMENTÁRIO DIZIA "sem uma linha de JavaScript" E QUE O NAVEGADOR TAMBÉM
// ENTREGAVA A VOLTA DO FOCO. Entregava — no Chromium, que era o único motor onde a suíte
// rodava. O item K1 pôs Firefox e WebKit no `playwright.config.ts` e a medição derrubou a
// frase: no WebKit o foco vai para o <body> ao abrir, OITO Tabs não entram na gaveta e o
// Escape não devolve nada. Gaveta aberta e inalcançável por teclado é WCAG 2.1.1.
// A gestão de foco agora é NOSSA, igual nos três motores — `focoDaGaveta`, abaixo.
// Id fixo em vez de useId: um documento tem UM AppShell (ele é dono do <main>), então não há
// colisão possível — e o CSS e o gate precisam de um alvo estável.
// `sidebarCollapsed` é CONTROLADO pelo consumidor, como o `open` do CommandPaletteShell: o
// shell não decide quando recolher nem desenha o botão que recolhe — quem sabe se há espaço,
// e se a preferência se guarda, é a aplicação. O shell encolhe o painel para --sidebar-rail e,
// quando ele flutua, preserva as duas margens na coluna (as regras `:has()` no core).
// `sidebarVariant` existe porque SEM ELE a variante da lateral é enfeite. Medido em 20/08/2026: o
// shell chamava `<Sidebar>` sem variante nenhuma, então quem monta por aqui — que é o caminho
// normal, e é como as 106 páginas do catálogo são montadas — recebia o padrão e ponto. A variante
// estava documentada no CHANGELOG como saída para quem instalou a `0.3.0`, e a porta estava
// trancada. É o par do `topbarVariant`, que já existia logo acima. Ver ADR-0034.
// O alvo do link de pular. Mesmo raciocínio do id da navegação: um documento tem UM AppShell,
// então id fixo é estável e não colide. Sem alvo estável não há como o link existir.
const SHELL_MAIN_ID = "aurea-shell-main";
const SHELL_NAV_ID = "aurea-shell-nav";
// A GAVETA NÃO SOBREVIVE À SUBIDA PARA O DESKTOP (A-07, 23/09/2026). Aberta em tela estreita e
// alargada a janela, ela ficava no top layer — que é estado do DOM, e nenhuma media query tira um
// elemento de lá —, flutuando fora de posição, sem véu, e com o botão que a fecharia escondido pelo
// CSS acima de lg. Girar um tablet ou encaixar a janela de lado no Windows bastava. O número é o
// `ESCALA.lg`, gerado dos tokens pela mesma leitura que escreve o `@media (max-width:1023px)` do
// core: um número só, e o `consumidores-lote1.test` cobra que o do `aurea.js` é o mesmo.
function useGavetaFechaNoDesktop() {
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function")
            return;
        const mq = window.matchMedia(`(min-width: ${ESCALA.lg}px)`);
        const aoMudar = (e) => {
            if (!e.matches)
                return;
            const gaveta = document.getElementById(SHELL_NAV_ID);
            try {
                if (gaveta?.matches(":popover-open"))
                    gaveta.hidePopover();
            }
            catch { /* motor sem popover */ }
        };
        mq.addEventListener?.("change", aoMudar);
        return () => mq.removeEventListener?.("change", aoMudar);
    }, []);
}
// A LISTA DA LATERAL ENTRA PELO SHELL (A-03, 24/09/2026). O shell cria o `<Sidebar>` e só
// repassava `children`; quem queria a lista declarativa (`items` + `current`) tinha de passar OUTRO
// `<Sidebar>` como `navigation`, e saíam dois `<aside class="sidebar">` aninhados — duas bordas,
// dois fundos, dois raios de 22px. Com a escala de letras da 0.8.8 a caixa de dentro passou a CORTAR
// texto ("8.174" virava "8.17"), medido num app real a 1400px. `navItems`/`currentNavId` vão para o
// Sidebar que o shell já cria, e a caixa dupla deixa de ser o único caminho. `navigation` continua
// valendo para quem escreve a navegação à mão, e as duas se somam: a lista vem antes.
// B-10 (24/09/2026): `contentVariant="plain"` tira a caixa do `.content`. Ela é um cartão (mesmo
// fundo, borda e raio do `.card`), e todo `Card` lá dentro virava caixa dentro de caixa igual — um
// app gastou 14 `!important` para apagá-la. `surface`, a caixa, continua o padrão.
// B-07: `topbarDivider` repassa a linha de baixo para a barra `flush` que o shell monta.
// AN-01 (03/10/2026): O BOTÃO DE RECOLHER E A TRILHA SOZINHA. Um consumidor viu numa janela de 1508:
// a lateral sempre aberta, sem botão, e diminuir a janela não a recolhia — só virava gaveta abaixo de
// 1024. O modo trilha existia (`sidebarCollapsed`, `.sidebar-collapsed`), mas só controlado e sem
// gatilho. A referência é a `Sidebar` do shadcn que o ReUI usa no `c-sidebar-2` (o HeroUI não tem
// moldura de app): estado aberto/recolhido, controlado e não controlado, um gatilho, e o nome em
// dica na trilha. O lugar do botão é o que o Victor marcou: no alto, na junção do menu com o
// conteúdo. E a trilha sozinha em tela média vem do pedido — a referência não a tem.
//
// Tudo LIGADO por `sidebarCollapsible`: sem ele o shell é o de antes, e quem já usa
// `sidebarCollapsed` com o próprio botão não ganha um segundo.
const MEDIA_MEDIA = `(min-width: ${ESCALA.lg}px) and (max-width: ${ESCALA.xl - 1}px)`;
const MEDIA_ESTREITA = `(max-width: ${ESCALA.lg - 1}px)`;
// A largura pela API do navegador, e não por `resize`: o `useSyncExternalStore` dá a resposta certa
// já no primeiro desenho do lado do cliente, e no servidor (sem janela) diz "não" — a folha cuida da
// tela estreita sozinha, então o HTML do servidor não mostra nada errado.
function useLargura(query) {
    return useSyncExternalStore((avisar) => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function")
            return () => { };
        const mq = window.matchMedia(query);
        mq.addEventListener?.("change", avisar);
        return () => mq.removeEventListener?.("change", avisar);
    }, () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches, () => false);
}
export function AppShell({ brand, navigation, navItems, currentNavId, navLabel, topbar, topbarVariant = "floating", topbarDivider, sidebarVariant, sidebarCollapsed, sidebarCollapsible, defaultSidebarCollapsed, onSidebarCollapsedChange, contentVariant = "surface", children, className, ...props }) {
    const s = useAureaStrings();
    useGavetaFechaNoDesktop();
    const controlado = sidebarCollapsed !== undefined;
    // `null` = ninguém escolheu, e vale a largura.
    const [escolha, setEscolha] = useState(defaultSidebarCollapsed ?? null);
    const media = useLargura(MEDIA_MEDIA), estreita = useLargura(MEDIA_ESTREITA);
    const recolhida = controlado ? !!sidebarCollapsed : (escolha ?? (!!sidebarCollapsible && media));
    // NA GAVETA A LATERAL NUNCA É TRILHA. Abaixo de 1024 ela abre por cima de tudo, com espaço para o
    // nome; recolhida ali, era uma gaveta de ícones sem nome — também para quem já passava
    // `sidebarCollapsed` (medido em 03/10/2026, na mesma conferência).
    const efetiva = recolhida && !estreita;
    const aviso = useRef(onSidebarCollapsedChange);
    aviso.current = onSidebarCollapsedChange;
    // Cruzar 1280 é mudar de contexto: a escolha da pessoa sai e a largura volta a mandar. Pelo
    // evento do navegador, e não comparando desenhos, para a hidratação não contar como cruzamento.
    useEffect(() => {
        if (!sidebarCollapsible || typeof window === "undefined" || typeof window.matchMedia !== "function")
            return;
        const mq = window.matchMedia(MEDIA_MEDIA);
        const aoCruzar = (e) => { if (!controlado)
            setEscolha(null); aviso.current?.(e.matches); };
        mq.addEventListener?.("change", aoCruzar);
        return () => mq.removeEventListener?.("change", aoCruzar);
    }, [sidebarCollapsible, controlado]);
    const alternar = () => { const nova = !recolhida; if (!controlado)
        setEscolha(nova); onSidebarCollapsedChange?.(nova); };
    const rotulo = efetiva ? s.sidebarExpand : s.sidebarCollapse;
    // A seta aponta para onde a lateral vai: recolher é para o começo da linha, abrir é para o fim. Na
    // escrita da direita para a esquerda o começo é a direita — pela direção do provedor, e não por
    // `:dir(rtl)` na folha (ver a nota do `.sidebar-toggle` no core).
    // A condição vai escrita no `icon=` do botão, e não numa variável: é ali que o check 46 lê os
    // ícones que o shell desenha.
    const paraOComeco = !efetiva, direita = useDirection() === "rtl";
    return _jsxs("div", { className: cx("app-shell", topbarVariant === "flush" && "app-shell-flush", sidebarCollapsible && "app-shell-collapsible", className), ...props, children: [_jsx("a", { className: "skip-link", href: `#${SHELL_MAIN_ID}`, children: s.skipToContent }), _jsx(Topbar, { variant: topbarVariant, divider: topbarDivider, brand: _jsxs(_Fragment, { children: [_jsx(IconButton, { className: "nav-toggle", icon: "list", label: s.navigationToggle, popoverTarget: SHELL_NAV_ID }), brand] }), children: topbar }), sidebarCollapsible && _jsx("div", { className: "sidebar-toggle-slot", children: _jsx(Tooltip, { content: rotulo, side: "right", children: _jsx(IconButton, { className: "sidebar-toggle", size: "xs", icon: paraOComeco === direita ? "caret-right" : "caret-left", label: rotulo, "aria-expanded": !efetiva, "aria-controls": SHELL_NAV_ID, onClick: alternar }) }) }), _jsx(Sidebar, { id: SHELL_NAV_ID, popover: "auto", variant: sidebarVariant, collapsed: efetiva, items: navItems, current: currentNavId, label: navLabel, onToggle: focoDaGaveta, children: navigation }), _jsx("main", { id: SHELL_MAIN_ID, tabIndex: -1, className: cx("content", contentVariant === "plain" && "content-plain"), children: children })] });
}
export function Separator({ orientation, spacing = "none", className, ...props }) {
    const ancora = useRef(null);
    const resolvida = useValorResponsivo(orientation, "horizontal", ancora);
    // O elenco existe porque o tipo do motor descreve os manipuladores sobre `HTMLDivElement` — ele
    // não sabe que o `render` troca o elemento. O tipo PÚBLICO desta função é o certo: quem passar um
    // `ref` recebe o <hr> que está de fato no DOM.
    return _jsx(BaseSeparator, { ref: ancora, orientation: resolvida, render: _jsx("hr", {}), role: undefined, "aria-orientation": resolvida === "vertical" ? "vertical" : undefined, className: cx("separator", resolvida === "vertical" && "separator-vertical", spacing !== "none" && `separator-space-${spacing}`, className), ...props });
}
