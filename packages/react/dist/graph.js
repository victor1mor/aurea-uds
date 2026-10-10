"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// DependencyGraph — PLANO-1.0, Parte H, item H14 (09/08/2026).
//
// SUBPATH PRÓPRIO (`@aurea-uds/react/graph`), como ./chart, ./data-grid, ./calendar e ./qrcode:
// é o único componente que precisa do `@xyflow/react`, que entra como peer OPCIONAL. Quem
// instala a biblioteca pelo Button não paga por ele — e o check 19 reprova se este import
// aparecer em qualquer outro módulo.
//
// A diretiva NÃO vem de um hook nosso: vem do motor, que usa `zustand` e não publica
// `"use client"` no dist — o mesmo caso do `recharts`, do `@tanstack/react-table` e do
// `react-day-picker`, medido em 06/08/2026 e cobrado pelo check 26.
//
// ── O MOTOR, e por que este ──────────────────────────────────────────────────────────────
// Autorizado pelo Victor em 09/08/2026, e a autorização foi RECONFIRMADA por medição depois de
// eu mesmo levantar dúvida. A dúvida era boa e a resposta desfez: a vista de grafo de rastreio
// da referência mais próxima do domínio desenha `<div>` posicionados por um motor de layout de terceiro e NÃO
// usa React Flow, e o React Flow não faz layout nenhum, então adotá-lo não entrega um grafo
// pronto. O que decidiu foi o ALVO, que o Victor nomeou: uma aplicação de automação de fluxos. Aí a conta
// vira outra, e ela é medida:
//   • uma das referências, que já está em `Referencia/` e é concorrente direta do líder desse tipo de aplicação, usa
//     `@xyflow/react` — está no `package.json` dela;
//   • o próprio líder usa o irmão Vue do React Flow, da mesma equipe xyflow.
// Grafo de LEITURA não precisa de motor. EDITOR precisa, e o padrão de mercado para este
// editor é o xyflow. Registro completo no `REFERENCES.md`.
//
// Segurança e saúde, conferidas em 09/08/2026 antes de instalar: `@xyflow/react` 12.11.2,
// **MIT**, publicado há ~1 mês, mantido em tempo integral; **zero** avisos no GitHub Advisory
// Database para `xyflow`. Traz `@xyflow/system`, `classcat` e `zustand@4` — e só para quem
// instalar o peer.
//
// ── A PELE, e a linha que não se cruza ───────────────────────────────────────────────────
// O motor publica DUAS folhas, e só uma pode entrar:
//   • `dist/style.css` é a IDENTIDADE deles — `--xy-node-border-radius-default: 3px`, `#1a192b`,
//     sombras, nó branco. É exatamente o que o `BUILDING.md` proíbe extrair. **Não entra.**
//   • `dist/base.css` é ESTRUTURA — posição, `z-index`, `transform-origin`, `pointer-events` —
//     e todo valor visível está atrás de `var(--xy-algo, --xy-algo-default)`. Sobrescritível
//     por token, no idioma que o `--qr-size` e o `--datagrid-max-h` já usam.
// Quem importa a folha é o CONSUMIDOR, uma vez, como já importa o `@aurea-uds/core/css`: um
// `import "…css"` dentro deste módulo quebraria em Node puro e o build daqui é `tsc` só.
import React from "react";
import { ReactFlow, ReactFlowProvider, Background, BaseEdge, EdgeLabelRenderer, Handle, MiniMap, Panel, Position, applyNodeChanges, getBezierPath, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
import { Badge } from "./markup.js";
import { IconButton } from "./actions.js";
// ── O layout ─────────────────────────────────────────────────────────────────────────────
// O motor recebe `x`/`y` PRONTOS: ele não posiciona nada. Sem isto, um grafo sem coordenadas
// empilha tudo em (0,0) — que foi a medição que quase derrubou a escolha do motor.
//
// Camadas por caminho mais longo: a profundidade de um nó é a maior profundidade entre os que
// apontam para ele, mais um. É o esqueleto do Sugiyama sem a parte cara.
//
// ponytail: sem minimização de cruzamento de arestas — grafo denso vai desenhar linhas se
// cruzando, e isso é aceitável para dependência (dezenas de nós), não para mil. O caminho de
// subida é uma biblioteca de layout automático de grafos, a que a referência usa, e ela é DEPENDÊNCIA NOVA: entra com
// autorização, não de contrabando.
const LARGURA = 180, ALTURA = 52, VAO_X = 90, VAO_Y = 24;
// O VÃO ENTRE COLUNAS CRESCE COM O RÓTULO (A-09, 23/09/2026). Com o rótulo legível, a primeira
// imagem mostrou o que o preto escondia: "Te1/1/1 ↔ Te1/0/1" é mais largo que 90px e entrava por
// baixo dos nós. O layout roda também no servidor, onde não há texto para medir, então a largura
// é ESTIMADA com números medidos, não chutados: o rótulo é `--text-xs` (0.8125rem = 13px com a
// raiz de 16px), e no Chromium, com a IBM Plex Sans 400 carregada, o algarismo mede 0,600 da
// altura da letra e o texto de enlace ("Te1/1/1 ↔ Te1/0/1") mede 0,513 — o algarismo é o teto
// do texto comum, e é ele que entra. Mais os 2 × 4px do fundo do rótulo (padrão do motor) e uma
// folga de 16px de cada lado para a linha aparecer antes e depois dele. Nunca encolhe abaixo de
// `VAO_X`: grafo sem rótulo sai idêntico ao de antes.
const FONTE_DO_ROTULO = 13, GLIFO_DO_ROTULO = 0.6, FUNDO_X = 8, FOLGA_X = 32;
const vaoEntreColunas = (edges) => Math.max(VAO_X, ...edges.map(e => e.label ? Math.ceil(e.label.length * FONTE_DO_ROTULO * GLIFO_DO_ROTULO) + FUNDO_X + FOLGA_X : 0));
const medidasDoNo = (texto) => texto === "lg"
    ? { larg: Math.round(LARGURA * 16 / 14), alt: Math.round(ALTURA * 16 / 14) } : { larg: LARGURA, alt: ALTURA };
function dispor(nodes, edges, orientacao = "horizontal", m = { larg: LARGURA, alt: ALTURA }) {
    const entram = new Map();
    for (const n of nodes)
        entram.set(n.id, []);
    for (const e of edges)
        if (entram.has(e.to) && entram.has(e.from))
            entram.get(e.to).push(e.from);
    const profundidade = new Map();
    // `visitando` corta CICLO. Um grafo de dependências com ciclo é um defeito do dado, não
    // deste componente — mas travar o navegador por causa dele seria defeito nosso.
    const visitando = new Set();
    const calcular = (id) => {
        const pronto = profundidade.get(id);
        if (pronto != null)
            return pronto;
        if (visitando.has(id))
            return 0;
        visitando.add(id);
        const pais = entram.get(id) ?? [];
        const d = pais.length ? Math.max(...pais.map(calcular)) + 1 : 0;
        visitando.delete(id);
        profundidade.set(id, d);
        return d;
    };
    for (const n of nodes)
        calcular(n.id);
    const ocupacao = new Map();
    const posicoes = new Map();
    // DE CIMA PARA BAIXO (MNT-06): a profundidade vira a LINHA, e os irmãos ficam lado a lado. Cada
    // camada se centra na mais larga — a raiz no meio e os filhos equilibrados, como pede a MNT-11.4.
    // O vão entre camadas é o `VAO_X` de sempre: o rótulo da linha fica deitado no meio dela, e a
    // largura dele não pede mais altura. Esquerda→direita continua EXATAMENTE como era.
    if (orientacao === "vertical") {
        const porCamada = new Map();
        for (const n of nodes) {
            const d = profundidade.get(n.id) ?? 0;
            porCamada.set(d, [...(porCamada.get(d) ?? []), n.id]);
        }
        const maior = Math.max(...[...porCamada.values()].map(l => l.length), 1);
        const passo = m.larg + VAO_Y;
        for (const [d, ids] of porCamada) {
            const recuo = (maior - ids.length) * passo / 2;
            ids.forEach((id, i) => posicoes.set(id, { x: recuo + i * passo, y: d * (m.alt + VAO_X) }));
        }
        const camadas = Math.max(...[...porCamada.keys()], 0) + 1;
        return { posicoes, extensao: { larg: maior * m.larg + (maior - 1) * VAO_Y, alt: camadas * m.alt + (camadas - 1) * VAO_X } };
    }
    const vaoX = vaoEntreColunas(edges);
    for (const n of nodes) {
        const d = profundidade.get(n.id) ?? 0;
        const linha = ocupacao.get(d) ?? 0;
        ocupacao.set(d, linha + 1);
        posicoes.set(n.id, { x: d * (m.larg + vaoX), y: linha * (m.alt + VAO_Y) });
    }
    // A EXTENSÃO existe para o SERVIDOR: sem ela o `fitView` não tem viewport para caber, e o
    // grafo renderizado fora do navegador sai ancorado no canto, com metade dos nós do lado de
    // fora da caixa. É a diferença entre a prévia do catálogo existir e não existir.
    //
    // Os campos se chamam `larg`/`alt` e não `width`/`height` por dois motivos: é o vocabulário
    // interno deste arquivo (`posicoes`, `ocupacao`, `profundidade`), e o check 23 lê o fonte
    // INTEIRO — ele existe para impedir prop de dimensão em número, e um par de pixels de layout
    // interno o acionava sem ser prop de ninguém.
    const colunas = Math.max(...[...ocupacao.keys()], 0) + 1;
    const linhas = Math.max(...[...ocupacao.values()], 1);
    return { posicoes, extensao: { larg: colunas * m.larg + (colunas - 1) * vaoX, alt: linhas * m.alt + (linhas - 1) * VAO_Y } };
}
// ── A ARRUMAÇÃO EM CAMADAS (MNT-06 e MNT-11, ADR-0064) ──────────────────────────────────────
// `layout="layered"` chama o `elkjs` (peer OPCIONAL, EPL-2.0): camadas, MENOS cruzamento de linha,
// a raiz no topo (`rootId`, restrição FIRST), a camada que o app sugere (`layer`) e as portas no
// lado declarado. Ele entra por `import()` só quando pedido — quem não usa não baixa os ~465 KB — e
// roda depois do primeiro desenho: até a resposta, e no servidor, vale a arrumação simples acima.
// Sem o pacote instalado, o mapa avisa uma vez no console e fica na simples: não quebra a tela.
const LADO_ELK = { top: "NORTH", right: "EAST", bottom: "SOUTH", left: "WEST" };
// O índice da porta no arrumador anda no sentido do RELÓGIO, a partir do canto de cima à esquerda:
// em cima da esquerda para a direita, à direita de cima para baixo, embaixo da DIREITA para a
// esquerda, e à esquerda de BAIXO para cima. O desenho reparte cada lado na ordem declarada (da
// esquerda para a direita, de cima para baixo), então embaixo e à esquerda a ordem se inverte.
function portasEmOrdem(n) {
    const do_ = (lado) => (n.ports ?? []).filter(p => p.side === lado);
    const volta = [...do_("top"), ...do_("right"), ...do_("bottom").reverse(), ...do_("left").reverse()];
    return volta.map((p, i) => [p, i]);
}
let avisouSemElk = false;
async function disporEmCamadas(nodes, edges, orientacao, m, rootId) {
    let ELK;
    try {
        ELK = (await import("elkjs/lib/elk.bundled.js")).default;
    }
    catch {
        if (!avisouSemElk) {
            avisouSemElk = true;
            console.warn("DependencyGraph: layout=\"layered\" precisa do pacote `elkjs` (peer opcional). Ficou a arrumação simples.");
        }
        return null;
    }
    const ids = new Set(nodes.map(n => n.id));
    const portas = new Set(nodes.flatMap(n => (n.ports ?? []).map(p => `${n.id}::${p.id}`)));
    const ponta = (no, porta) => porta && portas.has(`${no}::${porta}`) ? `${no}::${porta}` : no;
    const resultado = await new ELK().layout({
        id: "raiz",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": orientacao === "vertical" ? "DOWN" : "RIGHT",
            "elk.layered.spacing.nodeNodeBetweenLayers": String(VAO_X),
            "elk.spacing.nodeNode": String(VAO_Y),
            "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
            "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
        },
        children: nodes.map(n => ({ id: n.id, width: m.larg, height: m.alt,
            // ORDEM FIXA, e não só o lado: o desenho põe as portas na ordem em que o app as declarou, e
            // o arrumador livre as reordenava por dentro — a "porta 1" à esquerda ia ao vizinho da direita
            // e as linhas se cruzavam (medido na bancada). Com a ordem fixa, quem se move são os nós.
            layoutOptions: { ...(n.ports?.length ? { "elk.portConstraints": "FIXED_ORDER" } : {}),
                ...(n.id === rootId ? { "elk.layered.layering.layerConstraint": "FIRST" } : {}),
                ...(n.layer != null ? { "elk.layered.layering.layerChoiceConstraint": String(n.layer) } : {}) },
            ports: portasEmOrdem(n).map(([p, i]) => ({ id: `${n.id}::${p.id}`, width: 0, height: 0,
                layoutOptions: { "elk.port.side": LADO_ELK[p.side], "elk.port.index": String(i) } })) })),
        edges: edges.filter(e => ids.has(e.from) && ids.has(e.to)).map((e, i) => ({ id: `e${i}`, sources: [ponta(e.from, e.fromPort)], targets: [ponta(e.to, e.toPort)] })),
    });
    return new Map((resultado.children ?? []).map(c => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
}
// ── AS ALÇAS: o lado de sempre, e as portas (MNT-06 e MNT-14) ─────────────────────────────────
// Sem porta, a linha entra por um lado e sai pelo oposto: esquerda→direita no horizontal, cima→
// baixo no vertical. Com porta, cada uma fica no lado dela, repartindo o lado em partes iguais. As
// alças entram também na lista do nó (`handles`) para a linha existir sem medir — no servidor e no
// modo de leitura, em que a alça não é desenhada (ver o nó, abaixo).
const LADO = { top: Position.Top, right: Position.Right, bottom: Position.Bottom, left: Position.Left };
function alcasDoNo(n, orientacao, m) {
    const entra = orientacao === "vertical" ? Position.Top : Position.Left;
    const sai = orientacao === "vertical" ? Position.Bottom : Position.Right;
    const ponto = (pos, frac) => ({ frac, ...(pos === Position.Left ? { x: 0, y: m.alt * frac } : pos === Position.Right ? { x: m.larg, y: m.alt * frac }
            : pos === Position.Top ? { x: m.larg * frac, y: 0 } : { x: m.larg * frac, y: m.alt }) });
    const base = [{ type: "target", position: entra, ...ponto(entra, 1 / 2) }, { type: "source", position: sai, ...ponto(sai, 1 / 2) }];
    const porLado = new Map();
    for (const p of n.ports ?? [])
        porLado.set(p.side, [...(porLado.get(p.side) ?? []), p]);
    const portas = [];
    for (const [lado, lista] of porLado)
        lista.forEach((p, k) => {
            const pos = LADO[lado], xy = ponto(pos, (k + 1) / (lista.length + 1));
            // A porta é as duas coisas: o cabo de rede não tem sentido, e a linha pode sair ou chegar nela.
            portas.push({ id: p.id, type: "source", position: pos, ...xy, rotulo: p.label }, { id: p.id, type: "target", position: pos, ...xy, rotulo: p.label });
        });
    return [...base, ...portas];
}
const SETAS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
function NoAurea({ data }) {
    const d = data;
    const corpo = _jsxs(_Fragment, { children: [d.icone && _jsx(Icon, { name: d.icone, size: "md", className: "graph-node-icon" }), _jsxs("span", { className: "graph-node-text", children: [_jsx("span", { className: "graph-node-label", children: d.label }), d.kind && _jsx("span", { className: "graph-node-kind", children: d.kind }), d.detail && _jsx("span", { className: "hint", children: d.detail })] })] });
    // As SETAS andam de nó em nó (MNT-19.4) — o mais perto na direção da seta. Só no nó que é botão:
    // nó de leitura não recebe foco, e dar foco a um `<span>` sem papel seria pior que não dar.
    const teclar = (e) => { if (d.aoTeclar && SETAS.has(e.key)) {
        e.preventDefault();
        d.aoTeclar(e.key);
    } };
    return _jsxs("div", { className: "graph-node", "data-selected": d.selecionado || undefined, "data-focused": d.focado || undefined, "data-dimmed": d.apagado || undefined, children: [d.alcas.map(a => {
                // A alça de porta fica no ponto dela ao longo do lado, em porcentagem: o nó pode crescer.
                const lugar = a.position === Position.Left || a.position === Position.Right ? { top: `${a.frac * 100}%` } : { left: `${a.frac * 100}%` };
                return _jsx(Handle, { id: a.id, type: a.type, position: a.position, isConnectable: !!d.conectavel, className: cx("graph-handle", !d.conectavel && "graph-handle-oculta"), style: a.id ? lugar : undefined, title: d.conectavel ? a.rotulo : undefined }, `${a.type}:${a.id ?? "lado"}`);
            }), d.aoSelecionar
                ? _jsx("button", { type: "button", className: cx("graph-node-body", d.icone && "graph-node-has-icon"), "aria-pressed": !!d.selecionado, onClick: d.aoSelecionar, onKeyDown: teclar, children: corpo })
                : _jsx("span", { className: cx("graph-node-body", d.icone && "graph-node-has-icon"), children: corpo }), d.contagem != null && _jsxs("span", { className: "graph-node-count", children: [_jsx(Badge, { size: "xs", variant: "neutral", emphasis: "solid", "aria-hidden": d.nomeDaContagem ? true : undefined, children: d.contagem }), d.nomeDaContagem && _jsx("span", { className: "sr-only", children: d.nomeDaContagem })] }), d.estado && _jsx("span", { className: "graph-node-status", children: _jsx(Badge, { size: "xs", variant: d.estado.tone ?? "neutral", children: d.estado.label }) })] });
}
const TIPOS = { aurea: NoAurea };
// ── A ARESTA, e por que ela também é nossa (A-09 e A-10, 23/09/2026) ─────────────────────────
// A-09 · O RÓTULO SAÍA PRETO SOBRE PRETO no tema escuro. O core declara `--xy-edge-label-color` e
// `--xy-edge-label-background-color` desde o H14, e NINGUÉM AS LIA: quem consome essas duas é o
// `style.css` do motor — a identidade dele, que esta casa proíbe —, e não o `base.css` que o
// consumidor importa. Medido em 23/09 num app que instalou a 0.8.7: `fill: rgb(0,0,0)` no texto e
// no fundo. As variáveis continuam sendo a fonte, e agora quem as lê é o próprio rótulo.
//
// A-10 · ARESTAS PARALELAS. Com `id` distinto as duas existem, mas o motor desenha as duas no
// MESMO caminho e os rótulos se sobrepõem. Cada uma sai de uma altura própria do nó: as `n`
// paralelas dividem a altura do nó em `n + 1` partes iguais. Uma aresta só fica no meio, que é o
// desenho de antes. O número vem de `ALTURA`, a do próprio nó — não há distância inventada aqui.
const ROTULO = { fill: "var(--xy-edge-label-color)", fontSize: "var(--graph-edge-label-size,var(--text-xs))" };
const FUNDO_DO_ROTULO = { fill: "var(--xy-edge-label-background-color)" };
// O canto do DEGRAU (MNT-10) é o `--radius-sm` (8): o traçado em ângulo reto dobra arredondado,
// como o resto da casa, e não em quina viva.
const CANTO_DO_DEGRAU = 8;
// O rótulo da PONTA fica a um `--space-1` (4) da alça, do lado de fora da linha.
const FOLGA_DA_PONTA = 4;
const pontaDoRotulo = (x, y, pos) => {
    const f = FOLGA_DA_PONTA;
    if (pos === Position.Bottom)
        return `translate(${x + f}px,${y + f}px)`;
    if (pos === Position.Top)
        return `translate(${x + f}px,${y - f}px) translateY(-100%)`;
    if (pos === Position.Right)
        return `translate(${x + f}px,${y - f}px) translateY(-100%)`;
    return `translate(${x - f}px,${y - f}px) translate(-100%,-100%)`;
};
function ArestaAurea({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, data, markerEnd, style }) {
    const d = (data ?? { deslocamento: 0, vertical: false, forma: "curve" });
    // A-10 · as paralelas se afastam na direção ATRAVESSADA à linha: na vertical, para os lados.
    const dx = d.vertical ? d.deslocamento : 0, dy = d.vertical ? 0 : d.deslocamento;
    const pontos = { sourceX: sourceX + dx, sourceY: sourceY + dy, sourcePosition, targetX: targetX + dx, targetY: targetY + dy, targetPosition };
    const [caminho, lx, ly] = d.forma === "step" ? getSmoothStepPath({ ...pontos, borderRadius: CANTO_DO_DEGRAU }) : getBezierPath(pontos);
    // O rótulo de texto é SVG (sai também no servidor). Quando a linha tem marca, número ou grupo, o
    // rótulo vai para a pastilha de HTML do meio, junto deles — dois desenhos no mesmo ponto se cobririam.
    // O traço DUPLO desenha o miolo por cima da linha — e por cima do rótulo SVG, que sairia riscado
    // (medido na bancada). Com rótulo, ele também vai para a pastilha.
    const pastilha = !!(d.marca || d.contagem || d.grupo || (d.padrao === "double" && label != null));
    const cls = cx("graph-edge", d.padrao && d.padrao !== "solid" && `graph-edge-${d.padrao}`, d.peso && d.peso !== "regular" && `graph-edge-${d.peso}`, d.apagada && "is-dimmed");
    return _jsxs(_Fragment, { children: [_jsx(BaseEdge, { id: id, path: caminho, className: cls, labelX: lx, labelY: ly, label: pastilha ? undefined : label, markerEnd: markerEnd, style: style, labelStyle: ROTULO, labelShowBg: true, labelBgStyle: FUNDO_DO_ROTULO }), d.padrao === "double" && _jsx("path", { d: caminho, fill: "none", className: cx("graph-edge-double-core", d.peso && d.peso !== "regular" && `graph-edge-${d.peso}`, d.apagada && "is-dimmed") }), (pastilha || d.origem || d.destino) && _jsxs(EdgeLabelRenderer, { children: [pastilha && _jsxs("div", { className: cx("graph-edge-chip nodrag nopan", d.apagada && "is-dimmed"), style: { transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)` }, children: [d.marca && _jsx("span", { className: `graph-edge-mark graph-edge-mark-${d.marca}`, "aria-hidden": "true", children: d.marca === "lock" && _jsx(Icon, { name: "lock-key", size: "sm" }) }), label != null && _jsx("span", { children: label }), d.contagem != null && _jsxs("span", { className: "graph-edge-count", children: ["\u00D7", d.contagem] }), d.grupo && _jsxs("button", { type: "button", className: "graph-edge-group", "aria-expanded": d.grupo.aberto, "aria-label": `${d.grupo.aberto ? d.grupo.juntar : d.grupo.mostrar} ${d.grupo.n} ${d.grupo.conexoes}`, onClick: d.grupo.alternar, children: ["\u00D7", d.grupo.n] })] }), d.origem && _jsx("div", { className: cx("graph-edge-end", d.apagada && "is-dimmed"), style: { transform: pontaDoRotulo(sourceX + dx, sourceY + dy, sourcePosition) }, children: d.origem }), d.destino && _jsx("div", { className: cx("graph-edge-end", d.apagada && "is-dimmed"), style: { transform: pontaDoRotulo(targetX + dx, targetY + dy, targetPosition) }, children: d.destino })] })] });
}
const TIPOS_DE_ARESTA = { aurea: ArestaAurea };
/** A chave de um PAR sem sentido: o cabo entre A e B é o mesmo que entre B e A. */
const parSemSentido = (e) => e.from < e.to ? `${e.from}|${e.to}` : `${e.to}|${e.from}`;
/**
 * O que se desenha com `groupParallel` (MNT-12.4): de cada par com duas ou mais linhas, fechado,
 * só a PRIMEIRA, com o número do grupo; aberto, todas, e a primeira leva o botão de juntar.
 */
function agruparParalelas(edges, ligado, abertos) {
    if (!ligado)
        return edges.map(item => ({ item }));
    const total = new Map();
    for (const e of edges) {
        const k = parSemSentido(e);
        total.set(k, (total.get(k) ?? 0) + 1);
    }
    const visto = new Set();
    const saida = [];
    for (const e of edges) {
        const k = parSemSentido(e), n = total.get(k);
        if (n < 2) {
            saida.push({ item: e });
            continue;
        }
        const aberto = abertos.has(k), primeira = !visto.has(k);
        visto.add(k);
        if (primeira)
            saida.push({ item: e, grupo: { chave: k, n, aberto } });
        else if (aberto)
            saida.push({ item: e });
    }
    return saida;
}
/** Identidade e deslocamento de cada aresta — interno; o teste lê o resultado no DOM. */
function arestasParalelas(edges, alt = ALTURA) {
    const total = new Map();
    for (const e of edges) {
        const k = `${e.from}->${e.to}`;
        total.set(k, (total.get(k) ?? 0) + 1);
    }
    const vista = new Map();
    const usados = new Set();
    return edges.map(e => {
        const par = `${e.from}->${e.to}`;
        const k = vista.get(par) ?? 0;
        vista.set(par, k + 1);
        const n = total.get(par);
        // Sem `id`, a primeira do par mantém o id de sempre; a segunda em diante ganha o índice.
        let id = e.id ?? (k === 0 ? par : `${par}#${k}`);
        while (usados.has(id))
            id = `${id}#`;
        usados.add(id);
        return { id, deslocamento: n > 1 ? alt * ((k + 1) / (n + 1) - 1 / 2) : 0 };
    });
}
// ── AS ALÇAS DECLARADAS SÓ VALEM ATÉ A MEDIDA (achado na bancada da rodada 1, 10/10/2026) ──────
// O motor, quando o nó traz `handles`, usa SEMPRE a lista declarada — mesmo depois de medir a tela
// (`parseHandles`, no `@xyflow/system`). A lista é o que faz o grafo existir no servidor, mas ela
// foi calculada para o nó de 52 de altura: num nó com endereço, mais alto, a linha nascia DENTRO
// dele, e o nome da porta na ponta ficava escondido atrás do texto. Medido: os seis nomes de porta
// cobertos pelo endereço do nó. Depois da primeira medida, a lista sai e vale a borda real.
const semAlcasDeclaradas = (n) => { if (!n.measured?.width)
    return n; const { handles: _, ...resto } = n; return resto; };
const EM_PAR = (a) => a ? new Set(a) : null;
/** O arquivo do draw.io, escrito à mão como o formato documenta (`mxfile > diagram > mxGraphModel`). */
// As aspas vão por código (\x22, \x27): o leitor de declarações do check 46 não casa aspa solta.
const XML = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\x22/g, "&quot;").replace(/\x27/g, "&apos;");
const TRACO_DRAWIO = { solid: "", dashed: "dashed=1;dashPattern=8 4;", dotted: "dashed=1;dashPattern=1 4;", double: "shape=link;" };
const PESO_DRAWIO = { regular: 1, thick: 2, heavy: 3 };
function paraDrawio(nos, itens, forma, titulo) {
    const visiveis = nos.filter(n => !n.hidden);
    const ids = new Set(visiveis.map(n => n.id));
    const celulas = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
    for (const n of visiveis) {
        const d = n.data;
        const texto = [d.label, d.kind, typeof d.detail === "string" ? d.detail : undefined].filter(Boolean).join("\n");
        const w = n.measured?.width ?? n.initialWidth ?? LARGURA, h = n.measured?.height ?? n.initialHeight ?? ALTURA;
        celulas.push(`<mxCell id="${XML(`n-${n.id}`)}" value="${XML(texto)}" style="rounded=1;arcSize=20;whiteSpace=wrap;html=0;" vertex="1" parent="1"><mxGeometry x="${Math.round(n.position.x)}" y="${Math.round(n.position.y)}" width="${Math.round(w)}" height="${Math.round(h)}" as="geometry"/></mxCell>`);
    }
    itens.forEach((e, i) => {
        if (!ids.has(e.from) || !ids.has(e.to))
            return;
        const id = `e-${i}`;
        const estilo = `endArrow=none;html=0;${forma === "step" ? "edgeStyle=orthogonalEdgeStyle;rounded=1;" : "curved=1;"}${TRACO_DRAWIO[e.pattern ?? "solid"]}strokeWidth=${PESO_DRAWIO[e.weight ?? "regular"]};`;
        celulas.push(`<mxCell id="${id}" value="${XML(e.label ?? "")}" style="${estilo}" edge="1" parent="1" source="${XML(`n-${e.from}`)}" target="${XML(`n-${e.to}`)}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
        // O nome da porta na ponta: o rótulo-filho da linha, a 80% do caminho para cada lado (o idioma do draw.io).
        for (const [txt, x, suf] of [[e.sourceLabel, -0.8, "s"], [e.targetLabel, 0.8, "t"]])
            if (txt)
                celulas.push(`<mxCell id="${id}-${suf}" value="${XML(txt)}" style="edgeLabel;html=0;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="${id}"><mxGeometry x="${x}" relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry></mxCell>`);
    });
    return `<mxfile host="Aurea"><diagram name="${XML(titulo)}" id="aurea"><mxGraphModel><root>${celulas.join("")}</root></mxGraphModel></diagram></mxfile>`;
}
export function DependencyGraph({ nodes, edges, label, selectedId, onSelect, connectable, onConnect, onNodeMove, height, className, orientation = "horizontal", layout = "simple", rootId, edgeShape = "curve", groupParallel, minimap, controls, legend, focusId, highlight, highlightNeighbors, hiddenIds, onNodeHover, onNodeContextMenu, onEdgeSelect, textSize = "md", highContrast, apiRef, style, ...props }) {
    const s = useAureaStrings();
    const m = React.useMemo(() => medidasDoNo(textSize), [textSize]);
    const vertical = orientation === "vertical";
    // O layout só roda para quem não trouxe coordenada. Quem traz manda — é o que deixa a Parte I
    // guardar a posição que a pessoa arrastou sem brigar com a disposição automática.
    const automatico = React.useMemo(() => dispor(nodes, edges, orientation, m), [nodes, edges, orientation, m]);
    // A arrumação em camadas chega DEPOIS (é assíncrona e o pacote é opcional); até lá, a simples.
    const [emCamadas, setEmCamadas] = React.useState(null);
    React.useEffect(() => {
        if (layout !== "layered") {
            setEmCamadas(null);
            return;
        }
        let vivo = true;
        disporEmCamadas(nodes, edges, orientation, m, rootId).then(r => { if (vivo)
            setEmCamadas(r); });
        return () => { vivo = false; };
    }, [layout, nodes, edges, orientation, m, rootId]);
    const posicao = React.useCallback((n) => ({
        x: n.x ?? emCamadas?.get(n.id)?.x ?? automatico.posicoes.get(n.id)?.x ?? 0,
        y: n.y ?? emCamadas?.get(n.id)?.y ?? automatico.posicoes.get(n.id)?.y ?? 0,
    }), [emCamadas, automatico]);
    // ── O que fica aceso: o caminho pedido, ou o nó escolhido e os vizinhos ────────────────────
    const ocultos = React.useMemo(() => new Set(hiddenIds ?? []), [hiddenIds]);
    const aceso = React.useMemo(() => {
        if (highlight)
            return { nos: EM_PAR(highlight.nodes), arestas: EM_PAR(highlight.edges) };
        if (highlightNeighbors && selectedId) {
            const nos = new Set([selectedId]), arestas = new Set();
            const ident = arestasParalelas(edges, vertical ? m.larg : m.alt);
            edges.forEach((e, i) => { if (e.from === selectedId || e.to === selectedId) {
                nos.add(e.from);
                nos.add(e.to);
                arestas.add(ident[i].id);
            } });
            return { nos, arestas };
        }
        return null;
    }, [highlight, highlightNeighbors, selectedId, edges, vertical, m]);
    // As setas e o "ir até" moram no lado de DENTRO do provedor (eles precisam do motor); o nó chama
    // por esta referência estável, sem refazer a lista de nós a cada render.
    const teclado = React.useRef(undefined);
    const nosDoMotor = React.useMemo(() => nodes.map(n => ({
        id: n.id, type: "aurea",
        position: posicao(n),
        draggable: !!onNodeMove,
        // `selectable:false` no PRÓPRIO nó, como na aresta: no servidor (a prévia do catálogo) o motor ainda
        // não recebeu o `elementsSelectable={false}` do fluxo, e o nó saía com a classe `.selectable` e a
        // mão de ponteiro — num mapa sem `onSelect`, uma promessa de clique sem teclado. O gate
        // `alvo-clicavel` pegou na página do padrão de rede (10/10/2026).
        selectable: false,
        hidden: ocultos.has(n.id),
        // ── O QUE FAZ ESTE GRAFO EXISTIR FORA DO NAVEGADOR ─────────────────────────────────
        // O motor só desenha nó que tem tamanho, e no servidor não há o que medir. `initialWidth`
        // e `initialHeight` valem SÓ até a primeira medição — no navegador o tamanho real assume
        // e um nó de três linhas deixa de ser aproximado. E sem `handles` declarados a aresta não
        // sabe de onde sai nem onde chega, então ela some.
        //
        // Eu tinha concluído que grafo não cabia em HTML estático e escrevi isso como limite do
        // componente. Era conclusão minha, não medição: o motor tem caminho de SSR documentado, e
        // são estas três coisas. A prévia do catálogo existe por causa deste bloco.
        initialWidth: m.larg, initialHeight: m.alt,
        handles: alcasDoNo(n, orientation, m).map(({ rotulo: _r, frac: _f, ...a }) => a),
        data: { label: n.label, kind: n.kind, detail: n.detail, icone: n.icon, contagem: n.count, nomeDaContagem: n.countLabel, estado: n.status,
            alcas: alcasDoNo(n, orientation, m), selecionado: selectedId === n.id, focado: focusId === n.id,
            apagado: aceso?.nos ? !aceso.nos.has(n.id) : false,
            conectavel: !!connectable, aoSelecionar: onSelect ? () => onSelect(n.id) : undefined,
            aoTeclar: onSelect ? (tecla) => teclado.current?.(n.id, tecla) : undefined },
    })), [nodes, posicao, selectedId, focusId, onSelect, connectable, onNodeMove, ocultos, aceso, orientation, m]);
    // `selectable:false` na PRÓPRIA aresta, e não só no `elementsSelectable` do `<ReactFlow>`:
    // medido em 29/08/2026, a prop do fluxo não tira a classe `.selectable` da aresta, que é onde
    // o `base.css` do motor põe `cursor:pointer`. A mão de ponteiro prometia um clique que a API
    // da Aurea não atende — `onSelect` é do NÓ, e quem o atende é o <button> do corpo dele.
    // (10/10/2026) Com `onEdgeSelect` a aresta passa a ser alvo de verdade, e aí a mão é honesta.
    const [abertos, setAbertos] = React.useState(() => new Set());
    const alternarGrupo = React.useCallback((k) => setAbertos(a => { const b = new Set(a); if (b.has(k))
        b.delete(k);
    else
        b.add(k); return b; }), []);
    const desenhadas = React.useMemo(() => agruparParalelas(edges, !!groupParallel, abertos), [edges, groupParallel, abertos]);
    const arestasDoMotor = React.useMemo(() => {
        const itens = desenhadas.map(x => x.item);
        const ident = arestasParalelas(itens, vertical ? m.larg : m.alt);
        return desenhadas.map(({ item: e, grupo }, i) => ({
            id: ident[i].id, type: "aurea", source: e.from, target: e.to, sourceHandle: e.fromPort, targetHandle: e.toPort,
            // O grupo FECHADO é a linha de todos: o nome da primeira enganaria ("WAN 1" valendo pelas 10).
            label: grupo && !grupo.aberto ? undefined : e.label, animated: e.animated, selectable: !!onEdgeSelect,
            hidden: ocultos.has(e.from) || ocultos.has(e.to),
            data: { deslocamento: ident[i].deslocamento, vertical, forma: edgeShape, padrao: e.pattern, peso: e.weight, marca: e.mark, contagem: e.count,
                origem: e.sourceLabel, destino: e.targetLabel, apagada: aceso?.arestas ? !aceso.arestas.has(e.id ?? ident[i].id) : aceso?.nos ? !(aceso.nos.has(e.from) && aceso.nos.has(e.to)) : false,
                grupo: grupo ? { n: grupo.n, aberto: grupo.aberto, alternar: () => alternarGrupo(grupo.chave), mostrar: s.graphShow, juntar: s.graphJoin, conexoes: s.graphConnections } : undefined },
        }));
    }, [desenhadas, vertical, m, edgeShape, onEdgeSelect, ocultos, aceso, alternarGrupo, s]);
    // ── A MEDIDA TEM DE PODER VOLTAR, e isto foi achado NO NAVEGADOR ───────────────────────
    // A primeira versão passava `nodes` e nenhum `onNodesChange`. O motor aceita calado e o
    // resultado é um grafo INVISÍVEL: ele só tira o `visibility:hidden` do nó depois de gravar
    // a medida dele de volta na lista, e sem o retorno não tem onde gravar. Medido em
    // 09/08/2026 num navegador de verdade — os cinco nós saíam `visibility: hidden`, com ZERO
    // aresta e o `fitView` parado em `scale(1)`. Nenhum teste de jsdom pega isso, porque lá
    // não há layout para medir.
    //
    // A lista interna preserva `measured` quando os dados de fora mudam: sem isso, trocar a
    // seleção jogaria a medida fora e o grafo piscaria a cada clique.
    const [nosVivos, setNosVivos] = React.useState(nosDoMotor);
    React.useEffect(() => {
        setNosVivos(anteriores => {
            const medidos = new Map(anteriores.map(n => [n.id, n.measured]));
            return nosDoMotor.map(n => semAlcasDeclaradas({ ...n, measured: medidos.get(n.id) }));
        });
    }, [nosDoMotor]);
    const aoMudarNos = React.useCallback((mudancas) => {
        setNosVivos(anteriores => applyNodeChanges(mudancas, anteriores).map(semAlcasDeclaradas));
    }, []);
    // A LEGENDA se monta com o que está na tela: uma linha por nome de `legend`, com o desenho dela.
    const legenda = React.useMemo(() => {
        const vistas = new Map();
        for (const e of edges)
            if (e.legend && !vistas.has(e.legend))
                vistas.set(e.legend, e);
        return [...vistas.entries()];
    }, [edges]);
    const raiz = React.useRef(null);
    // `initialWidth`/`initialHeight` no provider é o par do de cima, um nível acima: é o viewport
    // que o `fitView` usa ENQUANTO ninguém mediu. Com o prefixo `initial`, o navegador sobrescreve
    // na primeira medição — passar `width`/`height` direto no ReactFlow fixaria o tamanho e mataria
    // a fluidez. O valor é a extensão do próprio layout, então no servidor o grafo cabe exato.
    const estilo = { ...style, ...(height ? { blockSize: height } : null), "--graph-node-w": `${m.larg}px` };
    return _jsx("div", { ref: raiz, className: cx("dependency-graph", className), style: estilo, "data-text": textSize === "md" ? undefined : textSize, "data-contrast": highContrast ? "high" : undefined, role: "group", "aria-label": label ?? s.graphLabel, ...props, children: _jsx(ReactFlowProvider, { initialNodes: nosDoMotor, initialEdges: arestasDoMotor, fitView: true, initialWidth: automatico.extensao.larg, initialHeight: automatico.extensao.alt, children: _jsxs(ReactFlow, { nodes: nosVivos, onNodesChange: aoMudarNos, edges: arestasDoMotor, nodeTypes: TIPOS, edgeTypes: TIPOS_DE_ARESTA, fitView: true, proOptions: { hideAttribution: false }, nodesDraggable: !!onNodeMove, nodesConnectable: !!connectable, elementsSelectable: false, onNodeDragStop: onNodeMove ? (_, no) => onNodeMove(no.id, no.position) : undefined, onNodeMouseEnter: onNodeHover ? (_, no) => onNodeHover(no.id) : undefined, onNodeMouseLeave: onNodeHover ? () => onNodeHover(null) : undefined, onNodeContextMenu: onNodeContextMenu ? (ev, no) => { ev.preventDefault(); onNodeContextMenu(no.id, { x: ev.clientX, y: ev.clientY }); } : undefined, onEdgeClick: onEdgeSelect ? (_, a) => onEdgeSelect(a.id) : undefined, onConnect: onConnect ? c => { if (c.source && c.target)
                    onConnect({ from: c.source, to: c.target, fromPort: c.sourceHandle ?? undefined, toPort: c.targetHandle ?? undefined }); } : undefined, children: [_jsx(Background, {}), _jsx(Comandos, { raiz: raiz, teclado: teclado, focusId: focusId, posicoesProntas: emCamadas, controls: !!controls, apiRef: apiRef, itens: desenhadas.map(x => x.item), forma: edgeShape, titulo: label ?? s.graphLabel }), minimap && _jsx(MiniMap, { pannable: true, zoomable: true, ariaLabel: s.graphOverview, className: "graph-minimap" }), legend && legenda.length > 0 && _jsx(Panel, { position: "bottom-left", children: _jsx("ul", { className: "graph-legend", "aria-label": s.graphLegend, children: legenda.map(([nome, e]) => _jsxs("li", { children: [_jsxs("svg", { className: "graph-legend-sample", "aria-hidden": "true", viewBox: "0 0 32 8", children: [_jsx("path", { d: "M0 4H32", className: cx("graph-edge", e.pattern && e.pattern !== "solid" && `graph-edge-${e.pattern}`, e.weight && e.weight !== "regular" && `graph-edge-${e.weight}`) }), e.pattern === "double" && _jsx("path", { d: "M0 4H32", className: cx("graph-edge-double-core", e.weight && e.weight !== "regular" && `graph-edge-${e.weight}`) })] }), e.mark && _jsx("span", { className: `graph-edge-mark graph-edge-mark-${e.mark}`, "aria-hidden": "true", children: e.mark === "lock" && _jsx(Icon, { name: "lock-key", size: "sm" }) }), _jsx("span", { children: nome })] }, nome)) }) })] }) }) });
}
// `CSS.escape` existe no navegador; fora dele (o teste em jsdom), as aspas bastam.
const escapar = (id) => typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id.replace(/[\x22\\]/g, "\\$&");
/**
 * O lado de DENTRO do provedor: o que precisa do motor — caber na tela depois da arrumação em
 * camadas, o "ir até", as setas de nó em nó, os botões de zoom e o `apiRef`.
 */
function Comandos({ raiz, teclado, focusId, posicoesProntas, controls, apiRef, itens, forma, titulo }) {
    const rf = useReactFlow();
    const s = useAureaStrings();
    // Quem pediu menos movimento não vê a tela deslizar: o "ir até" e o caber na tela pulam direto.
    const duracao = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    const centralizar = React.useCallback((id) => {
        const no = rf.getNode(id);
        if (!no)
            return;
        const w = no.measured?.width ?? no.initialWidth ?? LARGURA, h = no.measured?.height ?? no.initialHeight ?? ALTURA;
        rf.setCenter(no.position.x + w / 2, no.position.y + h / 2, { zoom: Math.max(rf.getZoom(), 1), duration: duracao() });
    }, [rf]);
    // A arrumação em camadas chegou: o mapa cabe de novo na tela.
    React.useEffect(() => { if (posicoesProntas)
        requestAnimationFrame(() => rf.fitView({ duration: duracao() })); }, [posicoesProntas, rf]);
    React.useEffect(() => { if (focusId)
        centralizar(focusId); }, [focusId, centralizar]);
    // AS SETAS (MNT-19.4): o nó mais perto na direção da seta, dentro de um cone de 45°. O foco vai
    // para o botão dele; se ele estiver fora da tela, a tela vai até ele.
    React.useEffect(() => {
        teclado.current = (id, tecla) => {
            const centro = (n) => ({ x: n.position.x + (n.measured?.width ?? LARGURA) / 2, y: n.position.y + (n.measured?.height ?? ALTURA) / 2 });
            const atual = rf.getNode(id);
            if (!atual)
                return;
            const a = centro(atual);
            let melhor = null;
            for (const n of rf.getNodes()) {
                if (n.id === id || n.hidden)
                    continue;
                const b = centro(n), dx = b.x - a.x, dy = b.y - a.y;
                const naDirecao = tecla === "ArrowRight" ? dx > 0 && Math.abs(dy) <= dx : tecla === "ArrowLeft" ? dx < 0 && Math.abs(dy) <= -dx
                    : tecla === "ArrowDown" ? dy > 0 && Math.abs(dx) <= dy : dy < 0 && Math.abs(dx) <= -dy;
                if (!naDirecao)
                    continue;
                const d = dx * dx + dy * dy;
                if (!melhor || d < melhor.d)
                    melhor = { id: n.id, d };
            }
            if (!melhor)
                return;
            const alvo = raiz.current?.querySelector(`.react-flow__node[data-id="${escapar(melhor.id)}"] button.graph-node-body`);
            alvo?.focus({ preventScroll: true });
            const caixa = raiz.current?.getBoundingClientRect(), noCaixa = alvo?.getBoundingClientRect();
            if (caixa && noCaixa && (noCaixa.left < caixa.left || noCaixa.right > caixa.right || noCaixa.top < caixa.top || noCaixa.bottom > caixa.bottom))
                centralizar(melhor.id);
        };
    }, [rf, raiz, teclado, centralizar]);
    React.useImperativeHandle(apiRef, () => ({
        fitView: () => { void rf.fitView({ duration: duracao() }); },
        zoomIn: () => { void rf.zoomIn({ duration: duracao() }); },
        zoomOut: () => { void rf.zoomOut({ duration: duracao() }); },
        focus: centralizar,
        toDrawio: () => paraDrawio(rf.getNodes(), itens, forma, titulo),
        toPng: () => foto(raiz.current, "png"),
        toSvg: () => foto(raiz.current, "svg"),
    }), [rf, centralizar, itens, forma, titulo]);
    if (!controls)
        return null;
    return _jsxs(Panel, { position: "top-right", className: "graph-controls", children: [_jsx(IconButton, { icon: "magnifying-glass-plus", label: s.graphZoomIn, onClick: () => void rf.zoomIn({ duration: duracao() }) }), _jsx(IconButton, { icon: "magnifying-glass-minus", label: s.graphZoomOut, onClick: () => void rf.zoomOut({ duration: duracao() }) }), _jsx(IconButton, { icon: "corners-out", label: s.graphFit, onClick: () => void rf.fitView({ duration: duracao() }) })] });
}
/**
 * A FOTO do mapa (MNT-19.2), pelo `modern-screenshot` (peer OPCIONAL, MIT), carregado só aqui. Sai
 * o desenho, sem os botões, o minimapa e a legenda flutuante — que são da tela, não do mapa —, no
 * fundo do próprio cartão.
 */
async function foto(el, tipo) {
    if (!el)
        throw new Error("DependencyGraph: o mapa ainda não está na tela.");
    let ms;
    try {
        ms = await import("modern-screenshot");
    }
    catch {
        throw new Error("DependencyGraph: toPng/toSvg precisam do pacote `modern-screenshot` (peer opcional).");
    }
    const opcoes = { backgroundColor: getComputedStyle(el).backgroundColor, scale: tipo === "png" ? 2 : 1,
        filter: (n) => !(n instanceof HTMLElement && n.classList.contains("react-flow__panel")) };
    return tipo === "png" ? ms.domToPng(el, opcoes) : ms.domToSvg(el, opcoes);
}
