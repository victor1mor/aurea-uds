import React, { type ReactNode } from "react";
import { type AureaIcon } from "./system.js";
import { type Borda } from "./graph-geometria.js";
export type GraphOrientation = "horizontal" | "vertical";
/**
 * `simple` (a de sempre, sem dependência), `layered` (camadas, com contêineres por dentro), `tree`
 * (árvore compacta) e `radial` (a raiz no centro, as linhas retas). As três últimas pedem o `elkjs`.
 */
export type GraphLayout = "simple" | "layered" | "tree" | "radial";
export type GraphEdgeShape = "curve" | "step";
export type GraphPortSide = "top" | "right" | "bottom" | "left";
/** Uma porta do nó: uma alça com nome e lado (MNT-14). A aresta liga nela por `fromPort`/`toPort`. */
export interface GraphPort {
    id: string;
    side: GraphPortSide;
    label?: string;
}
export type GraphTone = "neutral" | "info" | "success" | "warning" | "danger";
export interface GraphNodeItem {
    id: string;
    label: string;
    kind?: string;
    detail?: ReactNode;
    x?: number;
    y?: number;
    /** O ícone do tipo, JUNTO do texto do tipo, nunca no lugar dele (MNT-07). Nome do sprite ou desenho do app. */
    icon?: AureaIcon;
    /** O selo de quantidade no canto (MNT-09): "20". `countLabel` é o que o leitor de tela ouve ("20 estações"). */
    count?: number;
    countLabel?: string;
    /** O selo de estado, no outro canto (MNT-16): a palavra, e o tom só reforça. */
    status?: {
        label: string;
        tone?: GraphTone;
    };
    ports?: GraphPort[];
    /** A camada sugerida pelo app, contada de 0 (só na arrumação `layered`). */
    layer?: number;
    /** O CONTÊINER deste nó (site, andar, rack): um só. O contêiner é um nó como os outros, e vira
     *  a caixa em volta dos filhos, com o botão de fechar (MNT-16.6). VLAN não é contêiner: um
     *  equipamento está em várias — ela é filtro e destaque (`hiddenIds`, `highlight`). */
    parentId?: string;
    /** Começa FECHADO: o contêiner esconde o que tem dentro, e o nó com `collapsible` esconde a
     *  subárvore. Fechado, ele mostra quantos guarda (MNT-16.4 e 16.7). */
    collapsed?: boolean;
    /** Fixo no lugar: não arrasta, e "Reorganizar" não o move (MNT-13.4). */
    pinned?: boolean;
    /** `cloud` desenha o nó como nuvem: Internet, nuvem pública, site remoto (MNT-16.5). */
    shape?: "box" | "cloud";
}
export type GraphEdgePattern = "solid" | "dashed" | "dotted" | "double";
export type GraphEdgeWeight = "regular" | "thick" | "heavy";
export type GraphEdgeMark = "cross" | "dot" | "lock";
export interface GraphEdgeItem {
    id?: string;
    from: string;
    to: string;
    label?: string;
    animated?: boolean;
    /** A porta de cada ponta (MNT-14); sem ela, o lado de sempre. */
    fromPort?: string;
    toPort?: string;
    /** O nome da porta escrito na PONTA da linha, perto do nó (MNT-14.3). */
    sourceLabel?: string;
    targetLabel?: string;
    /** O desenho do traço, que diz o que a linha é SEM depender de cor (MNT-08 e MNT-15). */
    pattern?: GraphEdgePattern;
    weight?: GraphEdgeWeight;
    mark?: GraphEdgeMark;
    /** Um número no meio da linha: os membros de uma agregação (LAG). */
    count?: number;
    /** O nome desta espécie de linha na legenda automática (`legend`). */
    legend?: string;
    /** Quando dois rótulos se encostam, fica o de prioridade MAIOR; no empate, o que vem antes na
     *  lista (MNT-12.5). O nome da porta na ponta conta com a mesma prioridade da linha. */
    priority?: number;
}
/** A arrumação para o app guardar (MNT-13.6): onde cada nó está e quais estão fixos. */
export interface GraphLayoutChange {
    positions: Record<string, {
        x: number;
        y: number;
    }>;
    pinned: string[];
}
export type GraphAlign = Borda;
/** O que o app pede ao mapa pelo `apiRef` (MNT-18 e MNT-19). */
export interface DependencyGraphApi {
    fitView(): void;
    zoomIn(): void;
    zoomOut(): void;
    focus(id: string): void;
    /** O mapa como arquivo do draw.io (`.drawio`), com as posições e as dobras de agora. */
    toDrawio(): string;
    /** A foto do mapa inteiro, como `data:` URL. Pede o peer opcional `modern-screenshot`. */
    toPng(): Promise<string>;
    toSvg(): Promise<string>;
    undo(): void;
    redo(): void;
    /** Alinha os nós escolhidos pela borda pedida. */
    align(edge: GraphAlign): void;
    /** Deixa os vãos iguais entre os escolhidos (três ou mais). */
    distribute(axis: "horizontal" | "vertical"): void;
    /** Volta à arrumação automática, menos os fixos. */
    relayout(): void;
    /** A arrumação de agora, no mesmo formato do `onLayoutChange`. */
    getLayout(): GraphLayoutChange;
}
export interface DependencyGraphProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
    nodes: GraphNodeItem[];
    edges: GraphEdgeItem[];
    label?: string;
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    connectable?: boolean;
    onConnect?: (edge: {
        from: string;
        to: string;
        fromPort?: string;
        toPort?: string;
    }) => void;
    onNodeMove?: (id: string, pos: {
        x: number;
        y: number;
    }) => void;
    height?: string;
    className?: string;
    /** `vertical` desenha de cima para baixo: a linha entra por cima e sai por baixo (MNT-06). */
    orientation?: GraphOrientation;
    /** `layered` arruma em camadas com o `elkjs` (peer opcional): menos cruzamento, raiz no topo (MNT-11). */
    layout?: GraphLayout;
    /** O nó do topo, na arrumação `layered`. */
    rootId?: string;
    /** `step` desenha a linha em ângulo reto, com o canto arredondado (MNT-10). */
    edgeShape?: GraphEdgeShape;
    /** As linhas entre o mesmo par viram uma só, com o número; o número abre e junta (MNT-12.4). */
    groupParallel?: boolean;
    /** A visão geral no canto, com o retângulo da parte que está na tela (MNT-18.1). */
    minimap?: boolean;
    /** Os botões de aproximar, afastar e caber na tela (MNT-18.1). */
    controls?: boolean;
    /** A legenda das espécies de linha, montada sozinha pelo `legend` de cada aresta (MNT-15). */
    legend?: boolean;
    /** Centraliza e marca este nó — o "ir até" de uma busca (MNT-18.2). */
    focusId?: string | null;
    /** Destaca um caminho (nós e arestas) e apaga o resto (MNT-18.3). */
    highlight?: {
        nodes?: string[];
        edges?: string[];
    } | null;
    /** Com um nó escolhido, destaca ele e os vizinhos e apaga o resto (MNT-18.6). */
    highlightNeighbors?: boolean;
    /** Some com estes nós SEM refazer a arrumação: o resto fica onde estava (MNT-18.5). */
    hiddenIds?: string[];
    onNodeHover?: (id: string | null) => void;
    onNodeContextMenu?: (id: string, point: {
        x: number;
        y: number;
    }) => void;
    onEdgeSelect?: (id: string) => void;
    /** O texto do nó, independente do zoom (MNT-19.3). */
    textSize?: "md" | "lg";
    /** Linhas e bordas no tom da letra, e mais grossas (MNT-19.3). */
    highContrast?: boolean;
    /** Os comandos do mapa para o app: caber, aproximar, ir até, e exportar (MNT-18 e MNT-19). */
    apiRef?: React.Ref<DependencyGraphApi>;
    /**
     * O MODO DE ARRUMAR (MNT-13): arrastar na área vazia faz o laço; Shift soma à escolha; arrastar
     * move todos os escolhidos; a barra alinha, distribui, fixa, reorganiza, desfaz e refaz; as setas
     * movem os escolhidos (com Shift, quatro passos). Desligado, é o mapa de leitura.
     */
    editable?: boolean;
    /** A grade com encaixe do modo de arrumar. Ligada por padrão. */
    grid?: boolean;
    /** A arrumação mudou (arraste, alinhar, fixar, reorganizar, desfazer): guardar é do app (MNT-13.6). */
    onLayoutChange?: (layout: GraphLayoutChange) => void;
    /** Os nós escolhidos no modo de arrumar. Com UM escolhido, o `onSelect` também é chamado. */
    onSelectionChange?: (ids: string[]) => void;
    /** Os nós com subárvore ganham o botão de fechar e abrir (MNT-16.7). O contêiner sempre tem. */
    collapsible?: boolean;
    /** Um contêiner ou uma subárvore abriu ou fechou. */
    onCollapseChange?: (id: string, collapsed: boolean) => void;
    /** Desenha só o que está na tela (mapa muito grande, MNT-19.1). */
    visibleOnly?: boolean;
    /** O trabalhador que arruma FORA da tela principal (MNT-19.1). A receita de cada empacotador está no README. */
    layoutWorker?: () => Worker;
}
export declare function DependencyGraph({ nodes, edges, label, selectedId, onSelect, connectable, onConnect, onNodeMove, height, className, orientation, layout, rootId, edgeShape, groupParallel, minimap, controls, legend, focusId, highlight, highlightNeighbors, hiddenIds, onNodeHover, onNodeContextMenu, onEdgeSelect, textSize, highContrast, apiRef, editable, grid, onLayoutChange, onSelectionChange, collapsible, onCollapseChange, visibleOnly, layoutWorker, style, ...props }: DependencyGraphProps): React.JSX.Element;
