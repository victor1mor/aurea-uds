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
import { ReactFlow, ReactFlowProvider, Background, BaseEdge, EdgeLabelRenderer, EdgeText, Handle, MiniMap, Panel, Position, SelectionMode, applyNodeChanges, getBezierPath, getSmoothStepPath, useOnViewportChange, useReactFlow, useStore } from "@xyflow/react";
import { cx, useAureaStrings } from "./internal.js";
import { Icon } from "./system.js";
import { Badge } from "./markup.js";
import { IconButton, Toolbar, ToolbarButton, ToolbarSeparator } from "./actions.js";
import { alinhar, distribuir, subarvores, recolher, remapear, simplificar, pontes, tracado, meioDoTracado, ladoDoTrecho, rotaCruza, bordaNaDirecao, rotulosQueSomem, contornoDeNuvem } from "./graph-geometria.js";
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
// ── AS MEDIDAS DA RODADA 2 (ADR-0065), cada uma com o token que dá o mesmo número ─────────────────
// O contêiner: a cabeça (botão de fechar + nome) tem `--space-10` (40) e o recheio em volta dos
// filhos é `--space-4` (16) — a caixa desenhada e o recheio que o arrumador usa são os MESMOS números.
const CABECA_DO_GRUPO = 40, RECHEIO_DO_GRUPO = 16;
// A grade do modo de arrumar: `--space-4` (16). As setas andam um passo dela; com Shift, quatro.
const GRADE = 16;
// A ponte no cruzamento: meia elipse de raio `--radius-xs` (6) — o tamanho do salto do draw.io.
const RAIO_DA_PONTE = 6;
// O desvio de linhas (`@tisoap/react-flow-smart-edge`): folga em volta do nó e malha da busca, as duas
// `--space-2` (8). Com folga de 16, o vão de 24 entre dois irmãos (`VAO_Y`) fechava de vez, e a linha
// entre dois vizinhos dava a volta no mapa inteiro (medido na bancada, na arrumação em árvore).
const FOLGA_DO_DESVIO = 8, MALHA_DO_DESVIO = 8;
// Abaixo desta escala o texto das linhas some (MNT-12.5 e 19.1): a 60%, o `--text-xs` vira ~8px.
const ESCALA_DOS_ROTULOS = 0.6;
// O mapa grande (MNT-19.1) precisa caber na tela: o motor para em 50% por padrão, e um site de 100
// equipamentos com andares não cabe nisso. Afasta até 10%.
const ESCALA_MINIMA = 0.1;
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
// ⚠ 10/10/2026, rodada 1: a porta ia com ORDEM FIXA (`FIXED_ORDER`), e não só com o lado — o arrumador
// livre reordenava as portas por dentro e a "porta 1" à esquerda ia ao vizinho da direita (as linhas se
// cruzavam, medido na bancada). Na rodada 2 a ordem virou POSIÇÃO FIXA (`FIXED_POS`): a rota que o
// arrumador devolve tem de nascer EXATAMENTE na alça desenhada, e a alça fica na fração do lado.
// E no nó com porta, a linha SEM porta vai a uma porta "de base", no meio do lado de entrada ou de
// saída: medido no protótipo, sem ela o arrumador ligava a linha no CANTO do nó (o 0,0 da caixa).
let avisouSemElk = false;
let elkNaTela = null;
// FORA DA TELA PRINCIPAL (MNT-19.1): o `elk.bundled.js` roda na própria tela (é um "falso trabalhador").
// Com `layoutWorker`, o APP entrega o trabalhador de verdade — o jeito de criar um trabalhador muda de
// empacotador para empacotador, e copiar o do `elkjs` para dentro do nosso pacote seria redistribuí-lo
// (decisão do Victor, 10/10/2026). A receita de cada empacotador está no README.
async function motorElk(trabalhador) {
    try {
        if (trabalhador) {
            const ELK = (await import("elkjs/lib/elk-api.js")).default;
            return new ELK({ workerFactory: () => trabalhador() });
        }
        elkNaTela ??= import("elkjs/lib/elk.bundled.js").then(m => new m.default());
        return await elkNaTela;
    }
    catch {
        elkNaTela = null;
        if (!avisouSemElk) {
            avisouSemElk = true;
            console.warn("DependencyGraph: layout=\"layered\", \"tree\" e \"radial\" precisam do pacote `elkjs` (peer opcional). Ficou a arrumação simples.");
        }
        return null;
    }
}
const PORTA_DE_ENTRADA = "\u0000entra", PORTA_DE_SAIDA = "\u0000sai";
async function arrumarComElk(elk, e) {
    const vertical = e.orientacao === "vertical";
    const hierarquia = e.algoritmo === "layered" && e.grupos.length > 0;
    const ids = new Set(e.folhas.map(f => f.id)), grupos = new Set(hierarquia ? e.grupos.map(g => g.id) : []);
    const existe = (x) => ids.has(x) || grupos.has(x);
    let arestas = e.arestas.filter(a => existe(a.de) && existe(a.para));
    if (e.algoritmo !== "layered") {
        // A árvore geradora: a primeira linha que alcança cada nó, em largura, a partir da raiz.
        const raizes = new Set([...e.folhas.filter(f => f.raiz).map(f => f.id), ...e.folhas.filter(f => !arestas.some(a => a.para === f.id)).map(f => f.id)]);
        const visto = new Set(raizes), fila = [...raizes], arvore = [];
        while (fila.length || visto.size < ids.size) {
            if (!fila.length) {
                const solto = e.folhas.find(f => !visto.has(f.id));
                visto.add(solto.id);
                fila.push(solto.id);
                continue;
            }
            const n = fila.shift();
            for (const a of arestas) {
                const outro = a.de === n ? a.para : a.para === n ? a.de : null;
                if (outro && ids.has(outro) && !visto.has(outro)) {
                    visto.add(outro);
                    fila.push(outro);
                    arvore.push({ ...a, de: n, para: outro, portaDe: undefined, portaPara: undefined });
                }
            }
        }
        arestas = arvore;
    }
    const comPortas = new Set(e.algoritmo === "layered" ? e.folhas.filter(f => f.portas.length).map(f => f.id) : []);
    const noElk = (f) => {
        const opcoes = {};
        if (f.raiz && e.algoritmo === "layered")
            opcoes["elk.layered.layering.layerConstraint"] = "FIRST";
        if (f.camada != null && e.algoritmo === "layered")
            opcoes["elk.layered.layering.layerChoiceConstraint"] = String(f.camada);
        if (!comPortas.has(f.id))
            return { id: f.id, width: f.larg, height: f.alt, layoutOptions: opcoes };
        opcoes["elk.portConstraints"] = "FIXED_POS";
        const porLado = new Map();
        for (const p of f.portas)
            porLado.set(p.side, [...(porLado.get(p.side) ?? []), p]);
        const xy = (s, frac) => s === "left" ? { x: 0, y: f.alt * frac } : s === "right" ? { x: f.larg, y: f.alt * frac } : s === "top" ? { x: f.larg * frac, y: 0 } : { x: f.larg * frac, y: f.alt };
        const porta = (id, s, frac) => ({ id: `${f.id}::${id}`, width: 0, height: 0, ...xy(s, frac), layoutOptions: { "elk.port.side": LADO_ELK[s] } });
        const entra = vertical ? "top" : "left", sai = vertical ? "bottom" : "right";
        return { id: f.id, width: f.larg, height: f.alt, layoutOptions: opcoes,
            ports: [...[...porLado].flatMap(([s, l]) => l.map((p, k) => porta(p.id, s, (k + 1) / (l.length + 1)))), porta(PORTA_DE_ENTRADA, entra, 1 / 2), porta(PORTA_DE_SAIDA, sai, 1 / 2)] };
    };
    const portasValidas = new Set(e.folhas.flatMap(f => f.portas.map(p => `${f.id}::${p.id}`)));
    const ponta = (no, porta, saida) => !comPortas.has(no) ? no
        : porta && portasValidas.has(`${no}::${porta}`) ? `${no}::${porta}` : `${no}::${saida ? PORTA_DE_SAIDA : PORTA_DE_ENTRADA}`;
    // Cada folha DENTRO do contêiner dela. O recheio do contêiner é o mesmo da caixa desenhada.
    const raiz = { id: "\u0000raiz", children: [], edges: [] };
    const caixas = new Map();
    const recheio = `[top=${RECHEIO_DO_GRUPO + CABECA_DO_GRUPO},left=${RECHEIO_DO_GRUPO},bottom=${RECHEIO_DO_GRUPO},right=${RECHEIO_DO_GRUPO}]`;
    if (hierarquia)
        for (const g of e.grupos)
            caixas.set(g.id, { id: g.id, children: [], layoutOptions: { "elk.padding": recheio } });
    const dentro = (pai) => (pai && caixas.get(pai)) || raiz;
    if (hierarquia)
        for (const g of e.grupos)
            dentro(g.pai).children.push(caixas.get(g.id));
    // A raiz pedida vai PRIMEIRO: o círculo e a árvore começam pelo primeiro nó.
    for (const f of [...e.folhas].sort((a, b) => Number(!!b.raiz) - Number(!!a.raiz)))
        dentro(hierarquia ? f.pai : undefined).children.push(noElk(f));
    raiz.edges = arestas.map(a => ({ id: a.id, sources: [ponta(a.de, a.portaDe, true)], targets: [ponta(a.para, a.portaPara, false)] }));
    raiz.layoutOptions = { "elk.json.shapeCoords": "ROOT", "elk.json.edgeCoords": "ROOT", "elk.spacing.nodeNode": String(VAO_Y),
        ...(e.algoritmo === "layered" ? { "elk.algorithm": "layered", "elk.direction": vertical ? "DOWN" : "RIGHT",
            "elk.layered.spacing.nodeNodeBetweenLayers": String(VAO_X),
            "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF", "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
            ...(hierarquia ? { "elk.hierarchyHandling": "INCLUDE_CHILDREN" } : {}) }
            : e.algoritmo === "mrtree" ? { "elk.algorithm": "mrtree", "elk.direction": vertical ? "DOWN" : "RIGHT" }
                : { "elk.algorithm": "radial" }) };
    let r;
    try {
        r = await elk.layout(raiz);
    }
    catch (erro) {
        console.warn("DependencyGraph: o arrumador recusou o mapa; ficou a arrumação simples.", erro);
        return null;
    }
    const posicoes = new Map(), rotas = new Map();
    const percorrer = (n) => {
        for (const c of n.children ?? []) {
            posicoes.set(c.id, { x: c.x ?? 0, y: c.y ?? 0 });
            percorrer(c);
        }
        // A rota só vale no `layered`: a árvore devolve diagonais tortas, e o círculo, retas que o mapa já traça.
        if (e.algoritmo === "layered")
            for (const a of (n.edges ?? []))
                if (a.sections?.length)
                    rotas.set(a.id, simplificar(a.sections.flatMap(s => [s.startPoint, ...(s.bendPoints ?? []), s.endPoint])));
    };
    percorrer(r);
    return { posicoes, rotas };
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
/** Onde a alça fica NO MAPA, com a caixa medida (a fração do lado vale para qualquer tamanho). */
const pontoDaAlca = (c, a) => a.position === Position.Left ? { x: c.x, y: c.y + c.alt * a.frac } : a.position === Position.Right ? { x: c.x + c.larg, y: c.y + c.alt * a.frac }
    : a.position === Position.Top ? { x: c.x + c.larg * a.frac, y: c.y } : { x: c.x + c.larg * a.frac, y: c.y + c.alt };
const SETAS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
/**
 * O botão de fechar e abrir (MNT-16.4 e 16.7), no canto de baixo à direita — fora do nome, longe do
 * selo de estado (embaixo, à esquerda) e da alça (no meio do lado). Fechado, ele mostra QUANTOS o nó
 * guarda ("+12"), o "número no canto" do mercado; aberto, um traço. O nome diz o que ele faz.
 */
// O clique NÃO sobe até a caixa do motor: no modo de arrumar, ela escolheria o nó junto (medido na bancada).
function BotaoDeRecolher({ r, rotulo }) {
    return _jsx("button", { type: "button", className: "graph-node-toggle nodrag nopan", "aria-expanded": !r.fechado, "aria-label": `${r.fechado ? r.abrir : r.fechar} ${rotulo}${r.fechado ? ` (${r.n} ${r.ocultos})` : ""}`, onClick: e => { e.stopPropagation(); r.alternar(); }, children: r.fechado ? _jsxs("span", { "aria-hidden": "true", children: ["+", r.n] }) : _jsx(Icon, { name: "minus", size: "sm" }) });
}
const NoAurea = React.memo(function NoAurea({ data, selected, width, height }) {
    const d = data;
    const corpo = _jsxs(_Fragment, { children: [d.icone && _jsx(Icon, { name: d.icone, size: "md", className: "graph-node-icon" }), _jsxs("span", { className: "graph-node-text", children: [_jsx("span", { className: "graph-node-label", children: d.label }), d.kind && _jsx("span", { className: "graph-node-kind", children: d.kind }), d.detail && _jsx("span", { className: "hint", children: d.detail })] })] });
    // As SETAS andam de nó em nó (MNT-19.4) — o mais perto na direção da seta. Só no nó que é botão:
    // nó de leitura não recebe foco, e dar foco a um `<span>` sem papel seria pior que não dar.
    const teclar = (e) => { if (d.aoTeclar && SETAS.has(e.key)) {
        e.preventDefault();
        d.aoTeclar(e.key);
    } };
    // A NUVEM (MNT-16.5) é desenho de FUNDO, do tamanho medido do nó: recortar a caixa cortaria o foco.
    const larg = width ?? LARGURA, alt = height ?? ALTURA;
    return _jsxs("div", { className: "graph-node", "data-selected": d.selecionado || selected || undefined, "data-focused": d.focado || undefined, "data-dimmed": d.apagado || undefined, "data-shape": d.nuvem ? "cloud" : undefined, children: [d.alcas.map(a => {
                // A alça de porta fica no ponto dela ao longo do lado, em porcentagem: o nó pode crescer.
                const lugar = a.position === Position.Left || a.position === Position.Right ? { top: `${a.frac * 100}%` } : { left: `${a.frac * 100}%` };
                return _jsx(Handle, { id: a.id, type: a.type, position: a.position, isConnectable: !!d.conectavel, className: cx("graph-handle", !d.conectavel && "graph-handle-oculta"), style: a.id ? lugar : undefined, title: d.conectavel ? a.rotulo : undefined }, `${a.type}:${a.id ?? "lado"}`);
            }), d.nuvem && _jsx("svg", { className: "graph-node-cloud", viewBox: `0 0 ${larg} ${alt}`, "aria-hidden": "true", children: _jsx("path", { d: contornoDeNuvem(larg, alt) }) }), d.aoSelecionar && !d.editavel
                ? _jsx("button", { type: "button", className: cx("graph-node-body", d.icone && "graph-node-has-icon"), "aria-pressed": !!d.selecionado, onClick: d.aoSelecionar, onKeyDown: teclar, children: corpo })
                : _jsx("span", { className: cx("graph-node-body", d.icone && "graph-node-has-icon"), children: corpo }), d.contagem != null && _jsxs("span", { className: "graph-node-count", children: [_jsx(Badge, { size: "xs", variant: "neutral", emphasis: "solid", "aria-hidden": d.nomeDaContagem ? true : undefined, children: d.contagem }), d.nomeDaContagem && _jsx("span", { className: "sr-only", children: d.nomeDaContagem })] }), d.estado && _jsx("span", { className: "graph-node-status", children: _jsx(Badge, { size: "xs", variant: d.estado.tone ?? "neutral", children: d.estado.label }) }), d.fixo && _jsxs("span", { className: "graph-node-pin", children: [_jsx(Icon, { name: "push-pin", size: "sm" }), _jsx("span", { className: "sr-only", children: d.fixo.nome })] }), d.recolher && _jsx(BotaoDeRecolher, { r: d.recolher, rotulo: d.label })] });
});
const NoGrupo = React.memo(function NoGrupo({ data, selected }) {
    const d = data;
    return _jsxs("div", { className: "graph-group", "data-selected": selected || undefined, "data-dimmed": d.apagado || undefined, children: [d.alcas.map(a => _jsx(Handle, { type: a.type, position: a.position, isConnectable: false, className: "graph-handle graph-handle-oculta" }, `${a.type}:lado`)), _jsxs("div", { className: "graph-group-head", children: [_jsx("button", { type: "button", className: "graph-group-toggle nodrag nopan", "aria-expanded": "true", "aria-label": `${d.recolher.fechar} ${d.label}`, onClick: e => { e.stopPropagation(); d.recolher.alternar(); }, children: _jsx(Icon, { name: "caret-down", size: "sm" }) }), d.icone && _jsx(Icon, { name: d.icone, size: "sm", className: "graph-node-icon" }), _jsx("span", { className: "graph-group-label", children: d.label }), d.kind && _jsx("span", { className: "graph-node-kind", children: d.kind }), d.fixo && _jsxs("span", { className: "graph-node-pin", children: [_jsx(Icon, { name: "push-pin", size: "sm" }), _jsx("span", { className: "sr-only", children: d.fixo.nome })] })] })] });
});
const TIPOS = { aurea: NoAurea, aureaGrupo: NoGrupo };
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
const ArestaAurea = React.memo(function ArestaAurea({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, data, markerEnd, style }) {
    const d = (data ?? { deslocamento: 0, vertical: false, forma: "curve" });
    // A-10 · as paralelas se afastam na direção ATRAVESSADA à linha: na vertical, para os lados.
    const dx = d.vertical ? d.deslocamento : 0, dy = d.vertical ? 0 : d.deslocamento;
    // COM ROTA (MNT-12.1 e 12.3), o traçado é NOSSO: passa pelos pontos, dobra com o canto da casa e salta
    // nas pontes. A ponta e o lado de cada rótulo da ponta saem do primeiro e do último trecho dela — no
    // arrumador, a linha nasce onde ele a repartiu no lado, e não no meio da alça.
    const rota = d.rota && d.rota.length > 1 ? d.rota : undefined;
    let caminho, lx, ly, ini, fim, ladoIni, ladoFim;
    if (rota) {
        caminho = tracado(rota, CANTO_DO_DEGRAU, d.saltos ? new Map(d.saltos) : undefined, RAIO_DA_PONTE);
        ({ x: lx, y: ly } = meioDoTracado(rota));
        ini = rota[0];
        fim = rota[rota.length - 1];
        ladoIni = LADO[ladoDoTrecho(rota[0], rota[1], true)];
        ladoFim = LADO[ladoDoTrecho(rota[rota.length - 2], fim, false)];
    }
    else {
        const pontos = { sourceX: sourceX + dx, sourceY: sourceY + dy, sourcePosition, targetX: targetX + dx, targetY: targetY + dy, targetPosition };
        [caminho, lx, ly] = d.forma === "step" ? getSmoothStepPath({ ...pontos, borderRadius: CANTO_DO_DEGRAU }) : getBezierPath(pontos);
        ini = { x: pontos.sourceX, y: pontos.sourceY };
        fim = { x: pontos.targetX, y: pontos.targetY };
        ladoIni = sourcePosition;
        ladoFim = targetPosition;
    }
    // O rótulo de texto é SVG (sai também no servidor). Quando a linha tem marca, número ou grupo, o
    // rótulo vai para a pastilha de HTML do meio, junto deles — dois desenhos no mesmo ponto se cobririam.
    // O traço DUPLO desenha o miolo por cima da linha — e por cima do rótulo SVG, que sairia riscado
    // (medido na bancada). Com rótulo, ele também vai para a pastilha.
    const pastilha = !!(d.marca || d.contagem || d.grupo || (d.padrao === "double" && label != null));
    const cls = cx("graph-edge", d.padrao && d.padrao !== "solid" && `graph-edge-${d.padrao}`, d.peso && d.peso !== "regular" && `graph-edge-${d.peso}`, d.apagada && "is-dimmed");
    // MNT-12.5: cada rótulo leva quem é, a prioridade e a ordem — o mapa esconde o que encosta.
    const marca = (parte) => ({ "data-edge-label": `${id}${parte}`, "data-priority": d.prioridade ?? 0, "data-order": d.ordem ?? 0 });
    return _jsxs(_Fragment, { children: [_jsx(BaseEdge, { id: id, path: caminho, className: cls, markerEnd: markerEnd, style: style }), d.padrao === "double" && _jsx("path", { d: caminho, fill: "none", className: cx("graph-edge-double-core", d.peso && d.peso !== "regular" && `graph-edge-${d.peso}`, d.apagada && "is-dimmed") }), !pastilha && label != null && _jsx(EdgeText, { x: lx, y: ly, label: label, labelStyle: ROTULO, labelShowBg: true, labelBgStyle: FUNDO_DO_ROTULO, className: cx("graph-edge-text", d.apagada && "is-dimmed"), ...marca("") }), (pastilha || d.origem || d.destino) && _jsxs(EdgeLabelRenderer, { children: [pastilha && _jsxs("div", { className: cx("graph-edge-chip nodrag nopan", d.apagada && "is-dimmed"), style: { transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)` }, ...marca(""), children: [d.marca && _jsx("span", { className: `graph-edge-mark graph-edge-mark-${d.marca}`, "aria-hidden": "true", children: d.marca === "lock" && _jsx(Icon, { name: "lock-key", size: "sm" }) }), label != null && _jsx("span", { className: "graph-edge-chip-text", children: label }), d.contagem != null && _jsxs("span", { className: "graph-edge-count", children: ["\u00D7", d.contagem] }), d.grupo && _jsxs("button", { type: "button", className: "graph-edge-group", "aria-expanded": d.grupo.aberto, "aria-label": `${d.grupo.aberto ? d.grupo.juntar : d.grupo.mostrar} ${d.grupo.n} ${d.grupo.conexoes}`, onClick: d.grupo.alternar, children: ["\u00D7", d.grupo.n] })] }), d.origem && _jsx("div", { className: cx("graph-edge-end", d.apagada && "is-dimmed"), style: { transform: pontaDoRotulo(ini.x, ini.y, ladoIni) }, ...marca(":origem"), children: d.origem }), d.destino && _jsx("div", { className: cx("graph-edge-end", d.apagada && "is-dimmed"), style: { transform: pontaDoRotulo(fim.x, fim.y, ladoFim) }, ...marca(":destino"), children: d.destino })] })] });
});
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
// Rodada 2 (ADR-0065): o CONTÊINER sai como contêiner do draw.io (`container=1`), com os filhos dentro
// dele em coordenada RELATIVA — a mesma do motor —; a NUVEM sai com a forma de nuvem do draw.io; e a
// linha com rota leva as DOBRAS (`Array as="points"`), para o desenho abrir lá como está aqui.
function paraDrawio(nos, linhas, forma, titulo) {
    const visiveis = nos.filter(n => !n.hidden);
    const ids = new Set(visiveis.map(n => n.id));
    const celulas = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
    for (const n of visiveis) {
        const d = n.data;
        const texto = [d.label, d.kind, typeof d.detail === "string" ? d.detail : undefined].filter(Boolean).join("\n");
        const w = n.width ?? n.measured?.width ?? n.initialWidth ?? LARGURA, h = n.height ?? n.measured?.height ?? n.initialHeight ?? ALTURA;
        const estilo = n.type === "aureaGrupo" ? "rounded=1;arcSize=6;container=1;collapsible=0;verticalAlign=top;align=left;spacingLeft=8;whiteSpace=wrap;html=0;"
            : d.nuvem ? "ellipse;shape=cloud;whiteSpace=wrap;html=0;" : "rounded=1;arcSize=20;whiteSpace=wrap;html=0;";
        const pai = n.parentId && ids.has(n.parentId) ? XML(`n-${n.parentId}`) : "1";
        celulas.push(`<mxCell id="${XML(`n-${n.id}`)}" value="${XML(texto)}" style="${estilo}" vertex="1" parent="${pai}"><mxGeometry x="${Math.round(n.position.x)}" y="${Math.round(n.position.y)}" width="${Math.round(w)}" height="${Math.round(h)}" as="geometry"/></mxCell>`);
    }
    linhas.forEach(({ item: e, rota }, i) => {
        if (!ids.has(e.from) || !ids.has(e.to))
            return;
        const id = `e-${i}`;
        const estilo = `endArrow=none;html=0;${forma === "step" ? "edgeStyle=orthogonalEdgeStyle;rounded=1;" : "curved=1;"}${TRACO_DRAWIO[e.pattern ?? "solid"]}strokeWidth=${PESO_DRAWIO[e.weight ?? "regular"]};`;
        const dobras = rota && rota.length > 2 ? `<Array as="points">${rota.slice(1, -1).map(p => `<mxPoint x="${Math.round(p.x)}" y="${Math.round(p.y)}"/>`).join("")}</Array>` : "";
        celulas.push(`<mxCell id="${id}" value="${XML(e.label ?? "")}" style="${estilo}" edge="1" parent="1" source="${XML(`n-${e.from}`)}" target="${XML(`n-${e.to}`)}"><mxGeometry relative="1" as="geometry">${dobras}</mxGeometry></mxCell>`);
        // O nome da porta na ponta: o rótulo-filho da linha, a 80% do caminho para cada lado (o idioma do draw.io).
        for (const [txt, x, suf] of [[e.sourceLabel, -0.8, "s"], [e.targetLabel, 0.8, "t"]])
            if (txt)
                celulas.push(`<mxCell id="${id}-${suf}" value="${XML(txt)}" style="edgeLabel;html=0;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="${id}"><mxGeometry x="${x}" relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry></mxCell>`);
    });
    return `<mxfile host="Aurea"><diagram name="${XML(titulo)}" id="aurea"><mxGraphModel><root>${celulas.join("")}</root></mxGraphModel></diagram></mxfile>`;
}
// ── O DESVIO (MNT-12.1), peer OPCIONAL ──────────────────────────────────────────────────────────
// Depois de arrumar à mão, a rota do arrumador deixa de valer. A linha que passa POR DENTRO de um nó
// pede o desvio do `@tisoap/react-flow-smart-edge` (MIT, sem dependência; autorizado pelo Victor em
// 10/10/2026): só a CONTA dele — a função pura que devolve os pontos —, e não a aresta dele; o desenho
// continua o nosso, com o canto e as pontes. Roda em lotes pequenos entre um quadro e outro, para a
// tela não travar num mapa grande. Sem o pacote, a linha fica como está e o console avisa uma vez.
let desviadorCarregado = null;
let avisouSemDesvio = false;
function desviador() {
    desviadorCarregado ??= import("@tisoap/react-flow-smart-edge").catch(() => {
        if (!avisouSemDesvio) {
            avisouSemDesvio = true;
            console.warn("DependencyGraph: o desvio de linhas precisa do pacote `@tisoap/react-flow-smart-edge` (peer opcional). As linhas que cruzam nós ficaram como estão.");
        }
        return null;
    });
    return desviadorCarregado;
}
const LOTE_DO_DESVIO = 16;
/** O degrau simples, o mesmo do motor quando os nós estão bem postos: sai, dobra no meio, entra. */
function esqueleto(s, ls, t, lt) {
    if (ls === Position.Bottom && lt === Position.Top && t.y > s.y) {
        const my = (s.y + t.y) / 2;
        return simplificar([s, { x: s.x, y: my }, { x: t.x, y: my }, t]);
    }
    if (ls === Position.Right && lt === Position.Left && t.x > s.x) {
        const mx = (s.x + t.x) / 2;
        return simplificar([s, { x: mx, y: s.y }, { x: mx, y: t.y }, t]);
    }
    return null;
}
const centroDe = (c) => ({ x: c.x + c.larg / 2, y: c.y + c.alt / 2 });
const naBorda = (p, c) => p.x >= c.x - 1 && p.x <= c.x + c.larg + 1 && p.y >= c.y - 1 && p.y <= c.y + c.alt + 1
    && (Math.abs(p.x - c.x) < 1 || Math.abs(p.x - c.x - c.larg) < 1 || Math.abs(p.y - c.y) < 1 || Math.abs(p.y - c.y - c.alt) < 1);
// O modo de arrumar: o laço é o botão principal na área vazia; a tela anda com o do meio e o direito
// (e com Espaço + arrastar, o padrão do motor). Shift, Ctrl e Cmd somam à escolha, como no draw.io.
const BOTOES_DE_ARRASTAR = [1, 2], TECLAS_DE_SOMAR = ["Shift", "Meta", "Control"];
// Esperar a medida chegar antes de chamar o arrumador: sem isto, ele roda duas vezes no começo.
const ESPERA_DO_ARRUMADOR = 30;
// O desfazer guarda os últimos CEM passos, como o draw.io. É PILHA DE COMANDOS (cada passo com o
// inverso), e não foto do mapa inteiro: o mapa é controlado pelo app, e cada passo — para frente ou
// para trás — vira um `onLayoutChange` com as posições, que o app guarda (decisão do Victor, 10/10/2026).
const LIMITE_DO_DESFAZER = 100;
export function DependencyGraph({ nodes, edges, label, selectedId, onSelect, connectable, onConnect, onNodeMove, height, className, orientation = "horizontal", layout = "simple", rootId, edgeShape = "curve", groupParallel, minimap, controls, legend, focusId, highlight, highlightNeighbors, hiddenIds, onNodeHover, onNodeContextMenu, onEdgeSelect, textSize = "md", highContrast, apiRef, editable, grid = true, onLayoutChange, onSelectionChange, collapsible, onCollapseChange, visibleOnly, layoutWorker, style, ...props }) {
    const s = useAureaStrings();
    const m = React.useMemo(() => medidasDoNo(textSize), [textSize]);
    const vertical = orientation === "vertical";
    const editavel = !!editable;
    const porId = React.useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);
    // ── O CONTÊINER (MNT-16.6): quem está dentro de quem ──────────────────────────────────────
    const pais = React.useMemo(() => {
        const p = new Map();
        for (const n of nodes)
            if (n.parentId && n.parentId !== n.id && porId.has(n.parentId))
                p.set(n.id, n.parentId);
        // Contêiner em ciclo (A dentro de B dentro de A) é defeito do dado; o elo que fecha o ciclo sai.
        for (const id of [...p.keys()]) {
            const visto = new Set([id]);
            for (let q = p.get(id); q; q = p.get(q)) {
                if (visto.has(q)) {
                    p.delete(id);
                    break;
                }
                visto.add(q);
            }
        }
        return p;
    }, [nodes, porId]);
    const contemFilhos = React.useMemo(() => new Set(pais.values()), [pais]);
    // ── O QUE O APP DISSE × O QUE A PESSOA FEZ (MNT-13) ─────────────────────────────────────────
    // O mapa é controlado pelo app (`x`/`y`, `pinned`, `collapsed`), mas a pessoa mexe nele antes de o app
    // guardar. Vale o ÚLTIMO QUE ESCREVEU: o que a pessoa fez vale até o app mudar AQUELE valor — aí vale
    // o do app. Quem devolve o que recebeu pelo `onLayoutChange` não muda nada.
    const [posMao, setPosMao] = React.useState(() => new Map());
    const [fixoMao, setFixoMao] = React.useState(() => new Map());
    const [fechadoMao, setFechadoMao] = React.useState(() => new Map());
    const nodesAntes = React.useRef(nodes);
    React.useEffect(() => {
        const antes = new Map(nodesAntes.current.map(n => [n.id, n]));
        nodesAntes.current = nodes;
        const mudou = (f) => nodes.filter(n => { const a = antes.get(n.id); return !!a && f(a, n); }).map(n => n.id);
        const sem = (ids) => (x) => { if (!ids.some(i => x.has(i)))
            return x; const b = new Map(x); for (const i of ids)
            b.delete(i); return b; };
        setPosMao(sem(mudou((a, n) => a.x !== n.x || a.y !== n.y)));
        setFixoMao(sem(mudou((a, n) => a.pinned !== n.pinned)));
        setFechadoMao(sem(mudou((a, n) => a.collapsed !== n.collapsed)));
    }, [nodes]);
    const fechados = React.useMemo(() => new Set(nodes.filter(n => fechadoMao.get(n.id) ?? n.collapsed).map(n => n.id)), [nodes, fechadoMao]);
    const fixos = React.useMemo(() => new Set(nodes.filter(n => fixoMao.get(n.id) ?? n.pinned).map(n => n.id)), [nodes, fixoMao]);
    // ── O QUE FECHA (MNT-16.4, 16.6 e 16.7) ────────────────────────────────────────────────────
    const dominados = React.useMemo(() => collapsible ? subarvores(nodes.filter(n => !contemFilhos.has(n.id)).map(n => n.id), edges, rootId) : new Map(), [collapsible, nodes, edges, rootId, contemFilhos]);
    const { rep, guardados } = React.useMemo(() => recolher(nodes.map(n => n.id), pais, dominados, fechados, contemFilhos), [nodes, pais, dominados, fechados, contemFilhos]);
    // ABERTO: o contêiner visível, não fechado, com algum filho visível. Todo o resto que se vê é FOLHA.
    const abertosLogicos = React.useMemo(() => new Set([...contemFilhos].filter(c => rep.get(c) === c && !fechados.has(c)
        && nodes.some(n => pais.get(n.id) === c && rep.get(n.id) === n.id))), [contemFilhos, rep, fechados, nodes, pais]);
    // Na ÁRVORE e no CÍRCULO o contêiner aberto não vira caixa: o arrumador só põe filho dentro de pai na
    // arrumação em camadas, e a caixa em volta de filhos espalhados cobria os outros nós (medido na
    // bancada). Ali os filhos aparecem soltos; fechado, o contêiner continua sendo um nó.
    const abertos = React.useMemo(() => layout === "tree" || layout === "radial" ? new Set() : abertosLogicos, [layout, abertosLogicos]);
    const folhas = React.useMemo(() => nodes.filter(n => rep.get(n.id) === n.id && !abertosLogicos.has(n.id)), [nodes, rep, abertosLogicos]);
    const paiAberto = React.useCallback((id) => { const p = pais.get(id); return p && abertos.has(p) ? p : undefined; }, [pais, abertos]);
    const profundidade = React.useCallback((id) => { let k = 0; for (let q = pais.get(id); q; q = pais.get(q))
        k++; return k; }, [pais]);
    const descendentes = React.useCallback((g) => folhas.filter(n => { for (let q = pais.get(n.id); q; q = pais.get(q))
        if (q === g)
            return true; return false; }).map(n => n.id), [folhas, pais]);
    const desenhaveis = React.useMemo(() => new Set([...folhas.map(n => n.id), ...abertos]), [folhas, abertos]);
    // As linhas depois do fechamento: a de dentro some, a do escondido sai do representante, e as que
    // sobram entre o mesmo par viram UMA com o número. A porta do escondido não existe no representante.
    const remapeadas = React.useMemo(() => remapear(edges, rep).map(({ item, de, para, n }) => de === item.from && para === item.to ? item : { ...item, from: de, to: para,
        fromPort: de === item.from ? item.fromPort : undefined, toPort: para === item.to ? item.toPort : undefined,
        sourceLabel: de === item.from ? item.sourceLabel : undefined, targetLabel: para === item.to ? item.targetLabel : undefined,
        label: n > 1 ? undefined : item.label, count: n > 1 ? n : item.count })
        // A linha que liga num contêiner sem caixa (árvore e círculo) não tem onde chegar: não se desenha.
        .filter(e => desenhaveis.has(e.from) && desenhaveis.has(e.to)), [edges, rep, desenhaveis]);
    const [gruposAbertos, setGruposAbertos] = React.useState(() => new Set());
    const alternarGrupo = React.useCallback((k) => setGruposAbertos(a => { const b = new Set(a); if (b.has(k))
        b.delete(k);
    else
        b.add(k); return b; }), []);
    const desenhadas = React.useMemo(() => agruparParalelas(remapeadas, !!groupParallel, gruposAbertos), [remapeadas, groupParallel, gruposAbertos]);
    const ident = React.useMemo(() => arestasParalelas(desenhadas.map(x => x.item), vertical ? m.larg : m.alt), [desenhadas, vertical, m]);
    // ── AS MEDIDAS (vêm do motor; antes de medir, a estimada) ─────────────────────────────────
    const [medidas, setMedidas] = React.useState(() => new Map());
    const tamanho = React.useCallback((id) => medidas.get(id) ?? m, [medidas, m]);
    // ── A ARRUMAÇÃO AUTOMÁTICA ─────────────────────────────────────────────────────────────────
    // O layout só roda para quem não trouxe coordenada. Quem traz manda — é o que deixa a Parte I
    // guardar a posição que a pessoa arrastou sem brigar com a disposição automática.
    const automatico = React.useMemo(() => dispor(folhas, remapeadas, orientation, m), [folhas, remapeadas, orientation, m]);
    const algoritmo = layout === "layered" ? "layered" : layout === "tree" ? "mrtree" : layout === "radial" ? "radial" : null;
    const entradaElk = React.useMemo(() => algoritmo ? { algoritmo, orientacao: orientation,
        folhas: folhas.map(n => ({ id: n.id, ...tamanho(n.id), portas: n.ports ?? [], camada: n.layer, pai: paiAberto(n.id), raiz: n.id === rootId })),
        grupos: [...abertos].sort((a, b) => profundidade(a) - profundidade(b)).map(id => ({ id, pai: paiAberto(id) })),
        arestas: desenhadas.map((x, i) => ({ id: ident[i].id, de: x.item.from, para: x.item.to, portaDe: x.item.fromPort, portaPara: x.item.toPort })) } : null, [algoritmo, orientation, folhas, tamanho, paiAberto, rootId, abertos, profundidade, desenhadas, ident]);
    const chaveElk = React.useMemo(() => entradaElk ? JSON.stringify(entradaElk) : "", [entradaElk]);
    // A arrumação chega DEPOIS (é assíncrona e o pacote é opcional); até lá, e no servidor, a simples.
    const [elk, setElk] = React.useState(null);
    const trabalhador = React.useRef(layoutWorker);
    trabalhador.current = layoutWorker;
    const motorProprio = React.useRef(null);
    React.useEffect(() => () => { motorProprio.current?.terminateWorker(); motorProprio.current = null; }, []);
    // O mapa cabe na tela de novo quando chega a PRIMEIRA arrumação de um dado novo — e não quando um
    // grupo abre ou fecha, que a câmera pular a cada clique desorienta.
    const [pedidoDeCaber, setPedidoDeCaber] = React.useState(0);
    const dadosCabidos = React.useRef(null);
    React.useEffect(() => {
        if (!entradaElk) {
            setElk(null);
            return;
        }
        let vivo = true;
        const espera = setTimeout(async () => {
            let motor;
            if (trabalhador.current) {
                motorProprio.current ??= await motorElk(() => trabalhador.current());
                motor = motorProprio.current;
            }
            else
                motor = await motorElk();
            if (!motor || !vivo)
                return;
            const r = await arrumarComElk(motor, entradaElk);
            if (!vivo || !r)
                return;
            setElk(r);
            if (dadosCabidos.current !== nodes) {
                dadosCabidos.current = nodes;
                setPedidoDeCaber(x => x + 1);
            }
        }, ESPERA_DO_ARRUMADOR);
        return () => { vivo = false; clearTimeout(espera); };
        // `entradaElk` muda junto com a chave; a chave é o que diz se mudou DE VERDADE.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaveElk]);
    const autoDe = React.useCallback((id) => elk?.posicoes.get(id) ?? automatico.posicoes.get(id) ?? { x: 0, y: 0 }, [elk, automatico]);
    // ── ONDE CADA UM ESTÁ (coordenada ABSOLUTA) ──────────────────────────────────────────────────
    const posFinal = React.useMemo(() => {
        const p = new Map();
        for (const n of folhas) {
            const auto = autoDe(n.id), mao = posMao.get(n.id);
            // O `x`/`y` do contêiner não vale: a caixa dele é a dos filhos. Fechado, ele está onde a arrumação o pôs.
            const proprio = contemFilhos.has(n.id) ? undefined : n;
            p.set(n.id, mao ?? { x: proprio?.x ?? auto.x, y: proprio?.y ?? auto.y });
        }
        return p;
    }, [folhas, posMao, autoDe, contemFilhos]);
    const caixas = React.useMemo(() => {
        const c = new Map();
        for (const n of folhas) {
            const p = posFinal.get(n.id), t = tamanho(n.id);
            c.set(n.id, { x: p.x, y: p.y, larg: t.larg, alt: t.alt });
        }
        // O contêiner ABERTO envolve os filhos, mais o recheio e a cabeça — do mais fundo para o de fora.
        for (const g of [...abertos].sort((a, b) => profundidade(b) - profundidade(a))) {
            const filhos = [...c].filter(([id]) => pais.get(id) === g).map(([, x]) => x);
            if (!filhos.length)
                continue;
            const x0 = Math.min(...filhos.map(f => f.x)) - RECHEIO_DO_GRUPO, y0 = Math.min(...filhos.map(f => f.y)) - RECHEIO_DO_GRUPO - CABECA_DO_GRUPO;
            const x1 = Math.max(...filhos.map(f => f.x + f.larg)) + RECHEIO_DO_GRUPO, y1 = Math.max(...filhos.map(f => f.y + f.alt)) + RECHEIO_DO_GRUPO;
            c.set(g, { x: x0, y: y0, larg: x1 - x0, alt: y1 - y0 });
        }
        return c;
    }, [folhas, posFinal, tamanho, abertos, profundidade, pais]);
    // ── O que fica aceso: o caminho pedido, ou o nó escolhido e os vizinhos ────────────────────
    const ocultos = React.useMemo(() => new Set(hiddenIds ?? []), [hiddenIds]);
    const aceso = React.useMemo(() => {
        if (highlight)
            return { nos: EM_PAR(highlight.nodes), arestas: EM_PAR(highlight.edges) };
        if (highlightNeighbors && selectedId) {
            const nos = new Set([selectedId]), arestas = new Set();
            const ident0 = arestasParalelas(edges, vertical ? m.larg : m.alt);
            edges.forEach((e, i) => { if (e.from === selectedId || e.to === selectedId) {
                nos.add(e.from);
                nos.add(e.to);
                arestas.add(ident0[i].id);
            } });
            return { nos, arestas };
        }
        return null;
    }, [highlight, highlightNeighbors, selectedId, edges, vertical, m]);
    // As setas e o "ir até" moram no lado de DENTRO do provedor (eles precisam do motor); o nó chama
    // por esta referência estável, sem refazer a lista de nós a cada render. O botão de fechar também.
    const teclado = React.useRef(undefined);
    const alternar = React.useRef(() => { });
    const nosDoMotor = React.useMemo(() => {
        const lista = [];
        const relativa = (id) => { const c = caixas.get(id), p = paiAberto(id), cp = p ? caixas.get(p) : undefined; return cp ? { x: c.x - cp.x, y: c.y - cp.y } : { x: c.x, y: c.y }; };
        const recolherDe = (id) => ({ fechado: fechados.has(id), n: guardados.get(id) ?? 0, alternar: () => alternar.current(id),
            abrir: s.graphExpand, fechar: s.graphCollapse, ocultos: s.graphHidden });
        const fixoDe = (id) => editavel && fixos.has(id) ? { nome: s.graphPinned } : undefined;
        // O pai vem ANTES dos filhos na lista: é o que o motor pede para o filho andar junto com ele.
        for (const g of [...abertos].filter(x => caixas.has(x)).sort((a, b) => profundidade(a) - profundidade(b))) {
            const n = porId.get(g), c = caixas.get(g), pai = paiAberto(g);
            lista.push({ id: g, type: "aureaGrupo", position: relativa(g), ...(pai ? { parentId: pai } : {}), width: c.larg, height: c.alt,
                draggable: editavel && !fixos.has(g), selectable: editavel, focusable: editavel, hidden: ocultos.has(g),
                ariaLabel: editavel ? [n.label, n.kind].filter(Boolean).join(", ") : undefined,
                data: { label: n.label, kind: n.kind, icone: n.icon, alcas: alcasDoNo({ ...n, ports: undefined }, orientation, { larg: c.larg, alt: c.alt }),
                    recolher: recolherDe(g), apagado: aceso?.nos ? !aceso.nos.has(g) : false, fixo: fixoDe(g) } });
        }
        for (const n of folhas) {
            const pai = paiAberto(n.id);
            // O botão de fechar: todo contêiner (fechado, ele é folha) e, com `collapsible`, todo nó com subárvore.
            const recolhivel = contemFilhos.has(n.id) || (!!collapsible && dominados.has(n.id));
            lista.push({ id: n.id, type: "aurea", position: relativa(n.id), ...(pai ? { parentId: pai } : {}),
                draggable: (editavel || !!onNodeMove) && !fixos.has(n.id),
                // `selectable:false` no PRÓPRIO nó, como na aresta: no servidor (a prévia do catálogo) o motor ainda
                // não recebeu o `elementsSelectable={false}` do fluxo, e o nó saía com a classe `.selectable` e a
                // mão de ponteiro — num mapa sem `onSelect`, uma promessa de clique sem teclado. O gate
                // `alvo-clicavel` pegou na página do padrão de rede (10/10/2026).
                // (Rodada 2) No modo de arrumar, escolher é o trabalho: aí ele é escolhível e recebe o foco.
                selectable: editavel, focusable: editavel,
                ariaLabel: editavel ? [n.label, n.kind].filter(Boolean).join(", ") : undefined,
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
                    aoTeclar: onSelect && !editavel ? (tecla) => teclado.current?.(n.id, tecla) : undefined,
                    nuvem: n.shape === "cloud", fixo: fixoDe(n.id), recolher: recolhivel ? recolherDe(n.id) : undefined, editavel },
            });
        }
        return lista;
    }, [abertos, caixas, paiAberto, profundidade, porId, editavel, fixos, ocultos, orientation, aceso, folhas, contemFilhos, collapsible, dominados,
        onNodeMove, m, selectedId, focusId, connectable, onSelect, fechados, guardados, s]);
    // ── A LISTA VIVA DO MOTOR ────────────────────────────────────────────────────────────────────
    // ── A MEDIDA TEM DE PODER VOLTAR, e isto foi achado NO NAVEGADOR ───────────────────────
    // A primeira versão passava `nodes` e nenhum `onNodesChange`. O motor aceita calado e o
    // resultado é um grafo INVISÍVEL: ele só tira o `visibility:hidden` do nó depois de gravar
    // a medida dele de volta na lista, e sem o retorno não tem onde gravar. Medido em
    // 09/08/2026 num navegador de verdade — os cinco nós saíam `visibility: hidden`, com ZERO
    // aresta e o `fitView` parado em `scale(1)`. Nenhum teste de jsdom pega isso, porque lá
    // não há layout para medir.
    //
    // A lista interna preserva `measured` quando os dados de fora mudam: sem isso, trocar a
    // seleção jogaria a medida fora e o grafo piscaria a cada clique. (Rodada 2) Preserva também a
    // ESCOLHA do modo de arrumar — e a medida só passa entre nós do MESMO tipo: o contêiner que fecha
    // vira nó comum, e a caixa grande de antes não é a medida dele.
    const [nosVivos, setNosVivos] = React.useState(nosDoMotor);
    React.useEffect(() => {
        setNosVivos(anteriores => {
            const antes = new Map(anteriores.map(n => [n.id, n]));
            return nosDoMotor.map(n => {
                const a = antes.get(n.id), mesmo = !!a && a.type === n.type;
                return semAlcasDeclaradas({ ...n, measured: mesmo ? a.measured : undefined, selected: editavel && mesmo ? a.selected : undefined });
            });
        });
    }, [nosDoMotor, editavel]);
    const confirmar = React.useRef(() => { });
    const abertosAgora = React.useRef(abertos);
    abertosAgora.current = abertos;
    const aoMudarNos = React.useCallback((mudancas) => {
        setNosVivos(anteriores => applyNodeChanges(mudancas, anteriores).map(semAlcasDeclaradas));
        const dims = mudancas.filter(c => c.type === "dimensions" && !!c.dimensions && !abertosAgora.current.has(c.id));
        if (dims.length)
            setMedidas(md => {
                let b = null;
                for (const c of dims)
                    if (c.type === "dimensions" && c.dimensions) {
                        const v = md.get(c.id), { width: larg, height: alt } = c.dimensions;
                        if (!v || Math.abs(v.larg - larg) > 0.5 || Math.abs(v.alt - alt) > 0.5) {
                            b ??= new Map(md);
                            b.set(c.id, { larg, alt });
                        }
                    }
                return b ?? md;
            });
        // SOLTOU (fim do arraste) ou ANDOU PELA SETA: a mudança de posição que não está mais arrastando.
        const soltos = mudancas.filter((c) => c.type === "position" && !c.dragging && !!c.position);
        if (soltos.length)
            confirmar.current(soltos);
    }, []);
    // ── O DESFAZER (MNT-13.5) E O AVISO PARA O APP GUARDAR (MNT-13.6) ─────────────────────────────
    const pilha = React.useRef({ lista: [], ponteiro: 0 });
    const [, setVersaoDaPilha] = React.useState(0);
    const arrumacao = (pos, fix) => {
        const positions = {};
        for (const n of nodes) {
            if (abertosLogicos.has(n.id))
                continue;
            const p = pos?.get(n.id) ?? posMao.get(n.id) ?? posFinal.get(n.id) ?? (n.x != null && n.y != null ? { x: n.x, y: n.y } : undefined);
            if (p)
                positions[n.id] = { x: Math.round(p.x), y: Math.round(p.y) };
        }
        return { positions, pinned: nodes.filter(n => fix?.get(n.id) ?? fixoMao.get(n.id) ?? n.pinned).map(n => n.id) };
    };
    const aplicar = (pos, fix) => {
        if (pos.size)
            setPosMao(x => { const b = new Map(x); for (const [k, v] of pos)
                b.set(k, v); return b; });
        if (fix?.size)
            setFixoMao(x => { const b = new Map(x); for (const [k, v] of fix)
                b.set(k, v); return b; });
        onLayoutChange?.(arrumacao(pos, fix));
    };
    const executar = (c) => {
        if (!c.depois.size && !c.fixosDepois?.size)
            return;
        const p = pilha.current;
        p.lista = [...p.lista.slice(0, p.ponteiro), c].slice(-LIMITE_DO_DESFAZER);
        p.ponteiro = p.lista.length;
        setVersaoDaPilha(v => v + 1);
        aplicar(c.depois, c.fixosDepois);
    };
    const posAntes = (ids) => new Map([...ids].map(id => [id, posFinal.get(id) ?? caixas.get(id) ?? { x: 0, y: 0 }]));
    confirmar.current = mudancas => {
        const depois = new Map();
        // Primeiro os nós soltos; DEPOIS o contêiner, que arrasta os filhos junto pelo mesmo tanto.
        const ordenadas = [...mudancas].sort((a, b) => Number(abertos.has(a.id)) - Number(abertos.has(b.id)));
        for (const c of ordenadas) {
            const pai = paiAberto(c.id), cp = pai ? caixas.get(pai) : undefined;
            const abs = { x: c.position.x + (cp?.x ?? 0), y: c.position.y + (cp?.y ?? 0) };
            if (abertos.has(c.id)) {
                const antes = caixas.get(c.id);
                if (!antes)
                    continue;
                const dx = abs.x - antes.x, dy = abs.y - antes.y;
                if (!dx && !dy)
                    continue;
                for (const f of descendentes(c.id)) {
                    const p = depois.get(f) ?? posFinal.get(f);
                    if (p)
                        depois.set(f, { x: p.x + dx, y: p.y + dy });
                }
            }
            else {
                const antes = posFinal.get(c.id);
                if (antes && Math.abs(antes.x - abs.x) < 0.5 && Math.abs(antes.y - abs.y) < 0.5)
                    continue;
                depois.set(c.id, abs);
            }
        }
        if (!depois.size)
            return;
        executar({ antes: posAntes(depois.keys()), depois });
        if (onNodeMove)
            for (const [id, p] of depois)
                onNodeMove(id, p);
    };
    const escolhidos = () => nosVivos.filter(n => n.selected && !n.hidden).map(n => n.id);
    const alinhaveis = () => escolhidos().filter(id => caixas.has(id) && !abertos.has(id));
    const semFixos = (r) => { for (const id of [...r.keys()])
        if (fixos.has(id))
            r.delete(id); return r; };
    const acoes = React.useRef(null);
    acoes.current = {
        desfazer() { const p = pilha.current; if (!p.ponteiro)
            return; const c = p.lista[--p.ponteiro]; setVersaoDaPilha(v => v + 1); aplicar(c.antes, c.fixosAntes); },
        refazer() { const p = pilha.current; if (p.ponteiro >= p.lista.length)
            return; const c = p.lista[p.ponteiro++]; setVersaoDaPilha(v => v + 1); aplicar(c.depois, c.fixosDepois); },
        alinhar(b) { const ids = alinhaveis(); if (ids.length < 2)
            return; const r = semFixos(alinhar(new Map(ids.map(id => [id, caixas.get(id)])), b)); executar({ antes: posAntes(r.keys()), depois: r }); },
        distribuir(e) { const ids = alinhaveis(); if (ids.length < 3)
            return; const r = semFixos(distribuir(new Map(ids.map(id => [id, caixas.get(id)])), e)); executar({ antes: posAntes(r.keys()), depois: r }); },
        fixar() {
            const ids = escolhidos();
            if (!ids.length)
                return;
            const todos = ids.every(id => fixos.has(id));
            executar({ antes: new Map(), depois: new Map(), fixosAntes: new Map(ids.map(id => [id, fixos.has(id)])), fixosDepois: new Map(ids.map(id => [id, !todos])) });
        },
        // REORGANIZAR (MNT-13.4): todos voltam à arrumação automática, MENOS os fixos. O arrumador em camadas
        // não tem alfinete por nó (pesquisado), então quem cairia em cima de um fixo é empurrado para o lado,
        // na direção das camadas — e a linha que passar por ele desvia.
        reorganizar() {
            const presos = folhas.filter(n => fixos.has(n.id)).map(n => caixas.get(n.id));
            const encosta = (a, b) => a.x < b.x + b.larg + VAO_Y && b.x < a.x + a.larg + VAO_Y && a.y < b.y + b.alt + VAO_Y && b.y < a.y + a.alt + VAO_Y;
            const depois = new Map();
            for (const n of folhas) {
                if (fixos.has(n.id))
                    continue;
                const t = tamanho(n.id), p = { ...autoDe(n.id) };
                for (let k = 0; k <= presos.length; k++) {
                    const c = presos.find(c => encosta({ ...p, ...t }, c));
                    if (!c)
                        break;
                    if (vertical)
                        p.x = c.x + c.larg + VAO_Y;
                    else
                        p.y = c.y + c.alt + VAO_Y;
                }
                const antes = posFinal.get(n.id);
                if (!antes || Math.abs(antes.x - p.x) >= 0.5 || Math.abs(antes.y - p.y) >= 0.5)
                    depois.set(n.id, p);
            }
            executar({ antes: posAntes(depois.keys()), depois });
            setPedidoDeCaber(x => x + 1);
        },
        escolherTodos() { setNosVivos(ns => ns.map(n => n.selectable && !n.hidden ? { ...n, selected: true } : n)); },
        arrumacao: () => arrumacao(),
    };
    alternar.current = id => { const novo = !fechados.has(id); setFechadoMao(x => new Map(x).set(id, novo)); onCollapseChange?.(id, novo); };
    const escolhaMudou = React.useRef(() => { });
    escolhaMudou.current = ids => { onSelectionChange?.(ids); if (ids.length === 1)
        onSelect?.(ids[0]); };
    const aoMudarEscolha = React.useCallback(({ nodes: sel }) => escolhaMudou.current(sel.map(n => n.id)), []);
    const barra = { podeDesfazer: pilha.current.ponteiro > 0, podeRefazer: pilha.current.ponteiro < pilha.current.lista.length,
        alinhaveis: alinhaveis().length, escolhidos: escolhidos().length, todosFixos: escolhidos().length > 0 && escolhidos().every(id => fixos.has(id)) };
    // ── AS ROTAS (MNT-12.1 a 12.3) ─────────────────────────────────────────────────────────────
    // Cada linha em degrau tem, nesta ordem: a rota do ARRUMADOR, se os dois nós continuam onde ele os pôs
    // e nenhum nó entrou no caminho; o DESVIO já calculado, se as pontas não mudaram e o caminho segue
    // livre; o DEGRAU SIMPLES, se ele não atravessa nó nenhum; e, se nada disso serve, ela vai para a fila
    // do desvio — até a resposta, fica o degrau do motor. Na arrumação radial a linha é RETA, de borda a
    // borda, na direção do outro centro. Durante o arraste, a linha de quem se move segue o motor ao vivo.
    const chaveMovendo = React.useMemo(() => nosVivos.filter(n => n.dragging).map(n => n.id).sort().join("|"), [nosVivos]);
    const movendo = React.useMemo(() => {
        const base = chaveMovendo ? chaveMovendo.split("|") : [], out = new Set(base);
        for (const g of base)
            if (abertos.has(g))
                for (const f of descendentes(g))
                    out.add(f);
        return out;
    }, [chaveMovendo, abertos, descendentes]);
    const [desvios, setDesvios] = React.useState(() => new Map());
    const tracados = React.useMemo(() => {
        const mapa = new Map();
        const pendentes = [];
        const obstaculos = [...caixas].filter(([id]) => !abertos.has(id) && !ocultos.has(id));
        const menos = (a, b) => obstaculos.filter(([id]) => id !== a && id !== b).map(([, c]) => c);
        const todos = obstaculos.map(([, c]) => c);
        const alcaDe = (id, porta, tipo) => {
            const n = porId.get(id), c = caixas.get(id);
            const lista = alcasDoNo(abertos.has(id) || contemFilhos.has(id) ? { ...n, ports: undefined } : n, orientation, { larg: c.larg, alt: c.alt });
            return (porta && lista.find(a => a.id === porta && a.type === tipo)) || lista.find(a => !a.id && a.type === tipo);
        };
        desenhadas.forEach(({ item: e }, i) => {
            const id = ident[i].id;
            if (ocultos.has(e.from) || ocultos.has(e.to) || movendo.has(e.from) || movendo.has(e.to))
                return;
            const cs = caixas.get(e.from), ct = caixas.get(e.to);
            if (!cs || !ct || !porId.has(e.from) || !porId.has(e.to))
                return;
            if (layout === "radial") {
                mapa.set(id, [bordaNaDirecao(cs, centroDe(ct)), bordaNaDirecao(ct, centroDe(cs))]);
                return;
            }
            if (edgeShape !== "step")
                return;
            const doElk = elk?.rotas.get(id);
            const noLugar = (no) => { const a = elk?.posicoes.get(no), c = caixas.get(no); return !!a && !!c && Math.abs(a.x - c.x) < 0.5 && Math.abs(a.y - c.y) < 0.5; };
            if (doElk && noLugar(e.from) && noLugar(e.to) && naBorda(doElk[0], cs) && naBorda(doElk[doElk.length - 1], ct) && !rotaCruza(doElk, menos(e.from, e.to))) {
                mapa.set(id, doElk);
                return;
            }
            const as = alcaDe(e.from, e.fromPort, "source"), at = alcaDe(e.to, e.toPort, "target");
            const desl = ident[i].deslocamento, ddx = vertical ? desl : 0, ddy = vertical ? 0 : desl;
            const ps = pontoDaAlca(cs, as), pt = pontoDaAlca(ct, at);
            const sp = { x: ps.x + ddx, y: ps.y + ddy }, tp = { x: pt.x + ddx, y: pt.y + ddy };
            const chave = `${sp.x},${sp.y},${tp.x},${tp.y}`;
            const salvo = desvios.get(id);
            // O desvio vale enquanto as pontas não mudam e nenhum nó ENTROU no caminho. O que já nasceu cruzando —
            // a ponta largada em cima de outro nó, e não há caminho livre — vale até as pontas mudarem: sem
            // isto, a linha voltava ao degrau do motor e pedia o mesmo desvio impossível de novo.
            if (salvo && salvo.chave === chave && (salvo.cruzava || !rotaCruza(salvo.pontos, menos(e.from, e.to)))) {
                mapa.set(id, salvo.pontos);
                return;
            }
            const degrau = esqueleto(sp, as.position, tp, at.position);
            if (degrau && !rotaCruza(degrau, todos)) {
                mapa.set(id, degrau);
                return;
            }
            pendentes.push({ id, de: e.from, para: e.to, s: sp, t: tp, ls: as.position, lt: at.position, chave });
        });
        return { mapa, pendentes, obstaculos };
    }, [desenhadas, ident, caixas, abertos, ocultos, movendo, porId, contemFilhos, orientation, layout, edgeShape, elk, desvios, vertical]);
    const chavePendentes = tracados.pendentes.map(p => `${p.id}@${p.chave}`).join("|");
    React.useEffect(() => {
        if (!tracados.pendentes.length || movendo.size)
            return;
        let vivo = true;
        (async () => {
            const se = await desviador();
            if (!se || !vivo)
                return;
            const nosObstaculo = tracados.obstaculos.map(([id, c]) => ({ id, position: { x: c.x, y: c.y }, measured: { width: c.larg, height: c.alt }, data: {} }));
            const novos = new Map(), lote = tracados.pendentes;
            const caixasDe = (a, b) => tracados.obstaculos.filter(([id]) => id !== a && id !== b).map(([, c]) => c);
            for (let i = 0; i < lote.length; i += LOTE_DO_DESVIO) {
                const parte = lote.slice(i, i + LOTE_DO_DESVIO);
                const r = se.routeSmartEdgeBatch(nosObstaculo, parte.map(p => ({ id: p.id, source: p.de, target: p.para, sourceX: p.s.x, sourceY: p.s.y, targetX: p.t.x, targetY: p.t.y,
                    sourcePosition: p.ls, targetPosition: p.lt, preset: "step", options: { nodePadding: FOLGA_DO_DESVIO, gridRatio: MALHA_DO_DESVIO } })));
                for (const p of parte) {
                    const x = r[p.id];
                    if (x?.kind !== "routed")
                        continue;
                    const pontos = simplificar([p.s, ...x.points.map(([a, b]) => ({ x: a, y: b })), p.t]);
                    novos.set(p.id, { chave: p.chave, pontos, cruzava: rotaCruza(pontos, caixasDe(p.de, p.para)) });
                }
                if (i + LOTE_DO_DESVIO < lote.length) {
                    await new Promise(ok => setTimeout(ok, 0));
                    if (!vivo)
                        return;
                }
            }
            if (vivo && novos.size)
                setDesvios(d => { const b = new Map(d); for (const [k, v] of novos)
                    b.set(k, v); return b; });
        })();
        return () => { vivo = false; };
        // A fila muda junto com o traçado; a chave é o que diz se ela mudou DE VERDADE.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chavePendentes, movendo.size]);
    // As PONTES (MNT-12.3): a linha de depois salta sobre as de antes, na ordem da lista do app.
    const saltos = React.useMemo(() => pontes(ident.filter(x => tracados.mapa.has(x.id)).map(x => ({ id: x.id, pontos: tracados.mapa.get(x.id) })), RAIO_DA_PONTE, CANTO_DO_DEGRAU), [ident, tracados]);
    // `selectable:false` na PRÓPRIA aresta, e não só no `elementsSelectable` do `<ReactFlow>`:
    // medido em 29/08/2026, a prop do fluxo não tira a classe `.selectable` da aresta, que é onde
    // o `base.css` do motor põe `cursor:pointer`. A mão de ponteiro prometia um clique que a API
    // da Aurea não atende — `onSelect` é do NÓ, e quem o atende é o <button> do corpo dele.
    // (10/10/2026) Com `onEdgeSelect` a aresta passa a ser alvo de verdade, e aí a mão é honesta.
    // (Rodada 2) E só aí ela recebe o Tab: medido na bancada da rodada 1, TODA linha recebia o Tab, com
    // o nome do motor em inglês ("Edge from internet to fw") e a instrução de apagar com Delete. Agora o
    // nome é nosso ("Ligação: Internet – Firewall") e o Enter escolhe a linha.
    const nomeDe = React.useCallback((id) => porId.get(id)?.label ?? id, [porId]);
    const arestasDoMotor = React.useMemo(() => desenhadas.map(({ item: e, grupo }, i) => {
        const id = ident[i].id, rota = tracados.mapa.get(id), sl = saltos.get(id);
        return { id, type: "aurea", source: e.from, target: e.to, sourceHandle: e.fromPort, targetHandle: e.toPort,
            // O grupo FECHADO é a linha de todos: o nome da primeira enganaria ("WAN 1" valendo pelas 10).
            label: grupo && !grupo.aberto ? undefined : e.label, animated: e.animated, selectable: !!onEdgeSelect, focusable: !!onEdgeSelect,
            ariaLabel: `${s.graphEdge}: ${nomeDe(e.from)} – ${nomeDe(e.to)}${e.label ? ` (${e.label})` : ""}`,
            ...(onEdgeSelect ? { domAttributes: { onKeyDown: (ev) => { if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        onEdgeSelect(id);
                    } } } } : {}),
            hidden: ocultos.has(e.from) || ocultos.has(e.to),
            data: { deslocamento: rota ? 0 : ident[i].deslocamento, vertical, forma: edgeShape, padrao: e.pattern, peso: e.weight, marca: e.mark, contagem: e.count,
                origem: e.sourceLabel, destino: e.targetLabel, apagada: aceso?.arestas ? !aceso.arestas.has(e.id ?? id) : aceso?.nos ? !(aceso.nos.has(e.from) && aceso.nos.has(e.to)) : false,
                grupo: grupo ? { n: grupo.n, aberto: grupo.aberto, alternar: () => alternarGrupo(grupo.chave), mostrar: s.graphShow, juntar: s.graphJoin, conexoes: s.graphConnections } : undefined,
                rota, saltos: sl ? [...sl] : undefined, prioridade: e.priority, ordem: i },
        };
    }), [desenhadas, ident, tracados, saltos, vertical, edgeShape, onEdgeSelect, ocultos, aceso, alternarGrupo, s, nomeDe]);
    // A LEGENDA se monta com o que está na tela: uma linha por nome de `legend`, com o desenho dela.
    const legenda = React.useMemo(() => {
        const vistas = new Map();
        for (const e of edges)
            if (e.legend && !vistas.has(e.legend))
                vistas.set(e.legend, e);
        return [...vistas.entries()];
    }, [edges]);
    // O texto que o MOTOR põe na tela (descrição do nó para o leitor de tela, aviso de "movido", nome das
    // alças e do minimapa) sai na língua da Aurea — o padrão dele é inglês.
    const rotulosDoMotor = React.useMemo(() => ({
        "node.a11yDescription.default": s.graphNodeHelp, "node.a11yDescription.keyboardDisabled": s.graphNodeHelp,
        "node.a11yDescription.ariaLiveMessage": ({ x, y }) => `${s.graphMoved}: x ${x}, y ${y}`,
        "edge.a11yDescription.default": s.graphEdgeHelp, "controls.ariaLabel": s.graphLabel, "controls.zoomIn.ariaLabel": s.graphZoomIn,
        "controls.zoomOut.ariaLabel": s.graphZoomOut, "controls.fitView.ariaLabel": s.graphFit, "controls.interactive.ariaLabel": s.graphArrange,
        "minimap.ariaLabel": s.graphOverview, "handle.ariaLabel": s.graphHandle
    }), [s]);
    const linhas = React.useMemo(() => desenhadas.map(({ item }, i) => ({ item, rota: tracados.mapa.get(ident[i].id) })), [desenhadas, tracados, ident]);
    const raiz = React.useRef(null);
    // `initialWidth`/`initialHeight` no provider é o par do de cima, um nível acima: é o viewport
    // que o `fitView` usa ENQUANTO ninguém mediu. Com o prefixo `initial`, o navegador sobrescreve
    // na primeira medição — passar `width`/`height` direto no ReactFlow fixaria o tamanho e mataria
    // a fluidez. O valor é a extensão do próprio layout, então no servidor o grafo cabe exato.
    const estilo = { ...style, ...(height ? { blockSize: height } : null), "--graph-node-w": `${m.larg}px` };
    return _jsx("div", { ref: raiz, className: cx("dependency-graph", className), style: estilo, "data-text": textSize === "md" ? undefined : textSize, "data-contrast": highContrast ? "high" : undefined, "data-editable": editavel || undefined, role: "group", "aria-label": label ?? s.graphLabel, ...props, children: _jsx(ReactFlowProvider, { initialNodes: nosDoMotor, initialEdges: arestasDoMotor, fitView: true, initialWidth: automatico.extensao.larg, initialHeight: automatico.extensao.alt, children: _jsxs(ReactFlow, { nodes: nosVivos, onNodesChange: aoMudarNos, edges: arestasDoMotor, nodeTypes: TIPOS, edgeTypes: TIPOS_DE_ARESTA, fitView: true, proOptions: { hideAttribution: false }, minZoom: ESCALA_MINIMA, nodesDraggable: editavel || !!onNodeMove, nodesConnectable: !!connectable, elementsSelectable: editavel, nodesFocusable: editavel, edgesFocusable: !!onEdgeSelect, disableKeyboardA11y: !editavel, selectionOnDrag: editavel, panOnDrag: editavel ? BOTOES_DE_ARRASTAR : true, selectionMode: SelectionMode.Partial, multiSelectionKeyCode: TECLAS_DE_SOMAR, deleteKeyCode: null, snapToGrid: editavel && grid, snapGrid: [GRADE, GRADE], onlyRenderVisibleElements: !!visibleOnly, ariaLabelConfig: rotulosDoMotor, onSelectionChange: editavel ? aoMudarEscolha : undefined, onNodeMouseEnter: onNodeHover ? (_, no) => onNodeHover(no.id) : undefined, onNodeMouseLeave: onNodeHover ? () => onNodeHover(null) : undefined, onNodeContextMenu: onNodeContextMenu ? (ev, no) => { ev.preventDefault(); onNodeContextMenu(no.id, { x: ev.clientX, y: ev.clientY }); } : undefined, onEdgeClick: onEdgeSelect ? (_, a) => onEdgeSelect(a.id) : undefined, onConnect: onConnect ? c => { if (c.source && c.target)
                    onConnect({ from: c.source, to: c.target, fromPort: c.sourceHandle ?? undefined, toPort: c.targetHandle ?? undefined }); } : undefined, children: [_jsx(Background, { gap: editavel && grid ? GRADE : undefined }), _jsx(Comandos, { raiz: raiz, teclado: teclado, focusId: focusId, pedidoDeCaber: pedidoDeCaber, controls: !!controls, apiRef: apiRef, linhas: linhas, forma: edgeShape, titulo: label ?? s.graphLabel, desenho: tracados, editavel: editavel, barra: barra, acoes: acoes }), minimap && _jsx(MiniMap, { pannable: true, zoomable: true, ariaLabel: s.graphOverview, className: "graph-minimap" }), legend && legenda.length > 0 && _jsx(Panel, { position: "bottom-left", children: _jsx("ul", { className: "graph-legend", "aria-label": s.graphLegend, children: legenda.map(([nome, e]) => _jsxs("li", { children: [_jsxs("svg", { className: "graph-legend-sample", "aria-hidden": "true", viewBox: "0 0 32 8", children: [_jsx("path", { d: "M0 4H32", className: cx("graph-edge", e.pattern && e.pattern !== "solid" && `graph-edge-${e.pattern}`, e.weight && e.weight !== "regular" && `graph-edge-${e.weight}`) }), e.pattern === "double" && _jsx("path", { d: "M0 4H32", className: cx("graph-edge-double-core", e.weight && e.weight !== "regular" && `graph-edge-${e.weight}`) })] }), e.mark && _jsx("span", { className: `graph-edge-mark graph-edge-mark-${e.mark}`, "aria-hidden": "true", children: e.mark === "lock" && _jsx(Icon, { name: "lock-key", size: "sm" }) }), _jsx("span", { children: nome })] }, nome)) }) })] }) }) });
}
// `CSS.escape` existe no navegador; fora dele (o teste em jsdom), as aspas bastam.
const escapar = (id) => typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id.replace(/[\x22\\]/g, "\\$&");
/**
 * OS RÓTULOS QUE SE ENCOSTAM (MNT-12.5): mede cada rótulo na tela e esconde, pela prioridade, o que
 * cobre outro rótulo ou um nó. Medir na tela vale para qualquer escala — o rótulo e o nó crescem
 * juntos com o zoom. O atributo é posto à mão, fora do React, e tirado antes de cada nova conta.
 */
function esconderRotulos(el) {
    if (!el)
        return;
    const caixa = (e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, larg: b.width, alt: b.height }; };
    const rotulos = [...el.querySelectorAll("[data-edge-label]")];
    for (const r of rotulos)
        r.removeAttribute("data-crowded");
    const medidos = rotulos.map(r => ({ id: r.getAttribute("data-edge-label"), caixa: caixa(r), prioridade: Number(r.getAttribute("data-priority")) || 0,
        ordem: Number(r.getAttribute("data-order")) || 0, el: r })).filter(r => r.caixa.larg > 0).sort((a, b) => a.ordem - b.ordem);
    const somem = rotulosQueSomem(medidos, [...el.querySelectorAll(".graph-node")].map(caixa));
    for (const r of medidos)
        if (somem.has(r.id))
            r.el.setAttribute("data-crowded", "");
}
/**
 * O lado de DENTRO do provedor: o que precisa do motor — caber na tela depois da arrumação, o "ir
 * até", as setas de nó em nó, os botões de zoom, a barra do modo de arrumar, os rótulos que somem e
 * o `apiRef`.
 */
function Comandos({ raiz, teclado, focusId, pedidoDeCaber, controls, apiRef, linhas, forma, titulo, desenho, editavel, barra, acoes }) {
    const rf = useReactFlow();
    const s = useAureaStrings();
    // Quem pediu menos movimento não vê a tela deslizar: o "ir até" e o caber na tela pulam direto.
    const duracao = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300;
    // O centro de um nó NO MAPA: o filho de um contêiner tem posição RELATIVA ao pai, e o motor guarda a absoluta.
    const centro = React.useCallback((id) => {
        const n = rf.getInternalNode(id);
        if (!n)
            return null;
        const w = n.measured?.width ?? n.width ?? n.initialWidth ?? LARGURA, h = n.measured?.height ?? n.height ?? n.initialHeight ?? ALTURA;
        return { x: n.internals.positionAbsolute.x + w / 2, y: n.internals.positionAbsolute.y + h / 2 };
    }, [rf]);
    const centralizar = React.useCallback((id) => {
        const c = centro(id);
        if (c)
            rf.setCenter(c.x, c.y, { zoom: Math.max(rf.getZoom(), 1), duration: duracao() });
    }, [rf, centro]);
    // A arrumação chegou (ou a pessoa pediu "Reorganizar"): o mapa cabe de novo na tela.
    React.useEffect(() => { if (pedidoDeCaber)
        requestAnimationFrame(() => rf.fitView({ duration: duracao() })); }, [pedidoDeCaber, rf]);
    React.useEffect(() => { if (focusId)
        centralizar(focusId); }, [focusId, centralizar]);
    // AS SETAS (MNT-19.4): o nó mais perto na direção da seta, dentro de um cone de 45°. O foco vai
    // para o botão dele; se ele estiver fora da tela, a tela vai até ele. (Rodada 2) Com `visibleOnly`
    // o nó de fora da tela nem existe ainda: a tela vai até ele primeiro, e o foco vem no quadro seguinte.
    React.useEffect(() => {
        teclado.current = (id, tecla) => {
            const a = centro(id);
            if (!a)
                return;
            let melhor = null;
            for (const n of rf.getNodes()) {
                if (n.id === id || n.hidden || n.type !== "aurea")
                    continue;
                const b = centro(n.id);
                if (!b)
                    continue;
                const dx = b.x - a.x, dy = b.y - a.y;
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
            const alvo = () => raiz.current?.querySelector(`.react-flow__node[data-id="${escapar(melhor.id)}"] button.graph-node-body`);
            const botao = alvo();
            if (!botao) {
                centralizar(melhor.id);
                requestAnimationFrame(() => alvo()?.focus({ preventScroll: true }));
                return;
            }
            botao.focus({ preventScroll: true });
            const caixa = raiz.current?.getBoundingClientRect(), noCaixa = botao.getBoundingClientRect();
            if (caixa && (noCaixa.left < caixa.left || noCaixa.right > caixa.right || noCaixa.top < caixa.top || noCaixa.bottom > caixa.bottom))
                centralizar(melhor.id);
        };
    }, [rf, raiz, teclado, centralizar, centro]);
    // MNT-12.5 e 19.1: longe, o texto das linhas some (o atributo é da raiz, e a regra mora no core).
    const longe = useStore(st => st.transform[2] < ESCALA_DOS_ROTULOS);
    React.useEffect(() => { const el = raiz.current; if (!el)
        return; if (longe)
        el.setAttribute("data-far", "");
    else
        el.removeAttribute("data-far"); }, [longe, raiz]);
    // E o rótulo que encosta noutro some — depois de cada desenho novo e de cada parada da câmera
    // (com `visibleOnly`, o rótulo que entra na tela só existe depois de ela andar).
    const [vista, setVista] = React.useState(0);
    useOnViewportChange({ onEnd: () => setVista(v => v + 1) });
    React.useEffect(() => { const q = requestAnimationFrame(() => esconderRotulos(raiz.current)); return () => cancelAnimationFrame(q); }, [desenho, vista, raiz]);
    // OS ATALHOS do modo de arrumar, como no draw.io: Ctrl+Z desfaz; Ctrl+Shift+Z ou Ctrl+Y refaz; Ctrl+A
    // escolhe todos. (Cmd no Mac.) Só com o foco dentro do mapa.
    React.useEffect(() => {
        const el = raiz.current;
        if (!editavel || !el)
            return;
        const atalho = (ev) => {
            if (!(ev.ctrlKey || ev.metaKey) || ev.altKey)
                return;
            const t = ev.target;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))
                return;
            const k = ev.key.toLowerCase();
            if (k === "z" && !ev.shiftKey) {
                ev.preventDefault();
                acoes.current.desfazer();
            }
            else if ((k === "z" && ev.shiftKey) || k === "y") {
                ev.preventDefault();
                acoes.current.refazer();
            }
            else if (k === "a") {
                ev.preventDefault();
                acoes.current.escolherTodos();
            }
        };
        el.addEventListener("keydown", atalho);
        return () => el.removeEventListener("keydown", atalho);
    }, [editavel, raiz, acoes]);
    React.useImperativeHandle(apiRef, () => ({
        fitView: () => { void rf.fitView({ duration: duracao() }); },
        zoomIn: () => { void rf.zoomIn({ duration: duracao() }); },
        zoomOut: () => { void rf.zoomOut({ duration: duracao() }); },
        focus: centralizar,
        toDrawio: () => paraDrawio(rf.getNodes(), linhas, forma, titulo),
        toPng: () => foto(raiz.current, "png"),
        toSvg: () => foto(raiz.current, "svg"),
        undo: () => acoes.current.desfazer(), redo: () => acoes.current.refazer(),
        align: b => acoes.current.alinhar(b), distribute: e => acoes.current.distribuir(e),
        relayout: () => acoes.current.reorganizar(), getLayout: () => acoes.current.arrumacao(),
    }), [rf, centralizar, linhas, forma, titulo, raiz, acoes]);
    const a = acoes.current;
    return _jsxs(_Fragment, { children: [editavel && _jsx(Panel, { position: "top-left", className: "graph-toolbar", children: _jsxs(Toolbar, { label: s.graphArrange, children: [_jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphUndo, disabled: !barra.podeDesfazer, onClick: () => a.desfazer(), children: _jsx(Icon, { name: "arrow-u-up-left" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphRedo, disabled: !barra.podeRefazer, onClick: () => a.refazer(), children: _jsx(Icon, { name: "arrow-u-up-right" }) }), _jsx(ToolbarSeparator, {}), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignLeft, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("left"), children: _jsx(Icon, { name: "align-left" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignCenter, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("center"), children: _jsx(Icon, { name: "align-center-horizontal" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignRight, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("right"), children: _jsx(Icon, { name: "align-right" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignTop, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("top"), children: _jsx(Icon, { name: "align-top" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignMiddle, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("middle"), children: _jsx(Icon, { name: "align-center-vertical" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphAlignBottom, disabled: barra.alinhaveis < 2, onClick: () => a.alinhar("bottom"), children: _jsx(Icon, { name: "align-bottom" }) }), _jsx(ToolbarSeparator, {}), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphDistributeH, disabled: barra.alinhaveis < 3, onClick: () => a.distribuir("horizontal"), children: _jsx(Icon, { name: "arrows-out-line-horizontal" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphDistributeV, disabled: barra.alinhaveis < 3, onClick: () => a.distribuir("vertical"), children: _jsx(Icon, { name: "arrows-out-line-vertical" }) }), _jsx(ToolbarSeparator, {}), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphPin, disabled: !barra.escolhidos, onClick: () => a.fixar(), "aria-pressed": barra.todosFixos, children: _jsx(Icon, { name: "push-pin" }) }), _jsx(ToolbarButton, { className: "btn-icon", "aria-label": s.graphRelayout, disabled: false, onClick: () => a.reorganizar(), children: _jsx(Icon, { name: "tree-structure" }) })] }) }), controls && _jsxs(Panel, { position: "top-right", className: "graph-controls", children: [_jsx(IconButton, { icon: "magnifying-glass-plus", label: s.graphZoomIn, onClick: () => void rf.zoomIn({ duration: duracao() }) }), _jsx(IconButton, { icon: "magnifying-glass-minus", label: s.graphZoomOut, onClick: () => void rf.zoomOut({ duration: duracao() }) }), _jsx(IconButton, { icon: "corners-out", label: s.graphFit, onClick: () => void rf.fitView({ duration: duracao() }) })] })] });
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
