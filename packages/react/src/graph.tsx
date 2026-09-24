"use client";
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
// eu mesmo levantar dúvida. A dúvida era boa e a resposta desfez: o `trace-graph-view/` do
// langfuse — a referência mais próxima do domínio — desenha `<div>` posicionados por ELK e NÃO
// usa React Flow, e o React Flow não faz layout nenhum, então adotá-lo não entrega um grafo
// pronto. O que decidiu foi o ALVO, que o Victor nomeou: uma aplicação tipo n8n. Aí a conta
// vira outra, e ela é medida:
//   • a `activepieces-main`, que já está em `Referencia/` e é concorrente direta do n8n, usa
//     `@xyflow/react` 12.3.5 — está no `package.json` dela;
//   • o próprio n8n usa **Vue Flow**, o irmão Vue do React Flow, da mesma equipe xyflow.
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
import React, {type ReactNode} from "react";
import {ReactFlow, ReactFlowProvider, Background, BaseEdge, Handle, Position, applyNodeChanges, getBezierPath, type Node, type Edge, type EdgeProps, type NodeChange, type NodeProps} from "@xyflow/react";
import {cx, useAureaStrings} from "./internal.js";

export interface GraphNodeItem{id:string;label:string;kind?:string;detail?:ReactNode;x?:number;y?:number}
// `id` é OPCIONAL e entrou em 23/09/2026 (A-10): sem ele, a identidade da aresta era o par
// `from->to`, e duas arestas entre os mesmos nós — cabo redundante, agregação de enlaces — viravam
// UMA, com o rótulo da primeira sumindo. Quem não passa `id` recebe o de antes.
export interface GraphEdgeItem{id?:string;from:string;to:string;label?:string;animated?:boolean}

// ── O layout ─────────────────────────────────────────────────────────────────────────────
// O motor recebe `x`/`y` PRONTOS: ele não posiciona nada. Sem isto, um grafo sem coordenadas
// empilha tudo em (0,0) — que foi a medição que quase derrubou a escolha do motor.
//
// Camadas por caminho mais longo: a profundidade de um nó é a maior profundidade entre os que
// apontam para ele, mais um. É o esqueleto do Sugiyama sem a parte cara.
//
// ponytail: sem minimização de cruzamento de arestas — grafo denso vai desenhar linhas se
// cruzando, e isso é aceitável para dependência (dezenas de nós), não para mil. O caminho de
// subida é o `elkjs`, que é o que o langfuse usa, e ele é DEPENDÊNCIA NOVA: entra com
// autorização, não de contrabando.
const LARGURA=180,ALTURA=52,VAO_X=90,VAO_Y=24;
// O VÃO ENTRE COLUNAS CRESCE COM O RÓTULO (A-09, 23/09/2026). Com o rótulo legível, a primeira
// imagem mostrou o que o preto escondia: "Te1/1/1 ↔ Te1/0/1" é mais largo que 90px e entrava por
// baixo dos nós. O layout roda também no servidor, onde não há texto para medir, então a largura
// é ESTIMADA com números medidos, não chutados: o rótulo é `--text-xs` (0.8125rem = 13px com a
// raiz de 16px), e no Chromium, com a IBM Plex Sans 400 carregada, o algarismo mede 0,600 da
// altura da letra e o texto de enlace ("Te1/1/1 ↔ Te1/0/1") mede 0,513 — o algarismo é o teto
// do texto comum, e é ele que entra. Mais os 2 × 4px do fundo do rótulo (padrão do motor) e uma
// folga de 16px de cada lado para a linha aparecer antes e depois dele. Nunca encolhe abaixo de
// `VAO_X`: grafo sem rótulo sai idêntico ao de antes.
const FONTE_DO_ROTULO=13,GLIFO_DO_ROTULO=0.6,FUNDO_X=8,FOLGA_X=32;
const vaoEntreColunas=(edges:GraphEdgeItem[])=>Math.max(VAO_X,...edges.map(e=>
  e.label?Math.ceil(e.label.length*FONTE_DO_ROTULO*GLIFO_DO_ROTULO)+FUNDO_X+FOLGA_X:0));
function dispor(nodes:GraphNodeItem[],edges:GraphEdgeItem[]):{posicoes:Map<string,{x:number;y:number}>;extensao:{larg:number;alt:number}}{
  const entram=new Map<string,string[]>();
  for(const n of nodes)entram.set(n.id,[]);
  for(const e of edges)if(entram.has(e.to)&&entram.has(e.from))entram.get(e.to)!.push(e.from);
  const profundidade=new Map<string,number>();
  // `visitando` corta CICLO. Um grafo de dependências com ciclo é um defeito do dado, não
  // deste componente — mas travar o navegador por causa dele seria defeito nosso.
  const visitando=new Set<string>();
  const calcular=(id:string):number=>{
    const pronto=profundidade.get(id);
    if(pronto!=null)return pronto;
    if(visitando.has(id))return 0;
    visitando.add(id);
    const pais=entram.get(id)??[];
    const d=pais.length?Math.max(...pais.map(calcular))+1:0;
    visitando.delete(id);
    profundidade.set(id,d);
    return d;
  };
  for(const n of nodes)calcular(n.id);
  const vaoX=vaoEntreColunas(edges);
  const ocupacao=new Map<number,number>();
  const posicoes=new Map<string,{x:number;y:number}>();
  for(const n of nodes){
    const d=profundidade.get(n.id)??0;
    const linha=ocupacao.get(d)??0;
    ocupacao.set(d,linha+1);
    posicoes.set(n.id,{x:d*(LARGURA+vaoX),y:linha*(ALTURA+VAO_Y)});
  }
  // A EXTENSÃO existe para o SERVIDOR: sem ela o `fitView` não tem viewport para caber, e o
  // grafo renderizado fora do navegador sai ancorado no canto, com metade dos nós do lado de
  // fora da caixa. É a diferença entre a prévia do catálogo existir e não existir.
  //
  // Os campos se chamam `larg`/`alt` e não `width`/`height` por dois motivos: é o vocabulário
  // interno deste arquivo (`posicoes`, `ocupacao`, `profundidade`), e o check 23 lê o fonte
  // INTEIRO — ele existe para impedir prop de dimensão em número, e um par de pixels de layout
  // interno o acionava sem ser prop de ninguém.
  const colunas=Math.max(...[...ocupacao.keys()],0)+1;
  const linhas=Math.max(...[...ocupacao.values()],1);
  return {posicoes,extensao:{larg:colunas*LARGURA+(colunas-1)*vaoX,alt:linhas*ALTURA+(linhas-1)*VAO_Y}};
}

// O nó é NOSSO, e é o ponto em que este componente deixa de ser "React Flow com outra cor".
// O `GraphNode.tsx` do langfuse declara o motivo em uma linha — *"Real-HTML accessibility (the
// win over the old canvas renderer)"* —: nó desenhado em canvas não existe para o teclado nem
// para o leitor de tela. Aqui ele é `<button>` de verdade quando dá para selecionar.
//
// O que NÃO entrou: as DEZ cores por tipo de nó da referência (`AGENT` roxo, `TOOL` laranja,
// `GENERATION` magenta…). É a quarta vez que esta parte recusa a mesma coisa. `kind` sai como
// TEXTO, que é legível também por quem não separa as cores.
function NoAurea({data}:NodeProps){
  const d=data as unknown as{label:string;kind?:string;detail?:ReactNode;selecionado?:boolean;aoSelecionar?:()=>void;conectavel?:boolean};
  const corpo=<>
    <span className="graph-node-label">{d.label}</span>
    {d.kind&&<span className="graph-node-kind">{d.kind}</span>}
    {d.detail&&<span className="hint">{d.detail}</span>}
  </>;
  return <div className="graph-node" data-selected={d.selecionado||undefined}>
    {/* Os conectores só existem quando o grafo é conectável: alça pendurada num grafo de
        leitura é affordance mentindo — ela promete um arraste que não vai a lugar nenhum.
        ISTO ESTAVA ESCRITO AQUI E ERA MENTIRA, e é a sexta vez que comentário passa por código
        neste repositório: a alça era RENDERIZADA sempre, só com `isConnectable={false}`. O motor
        desenha o ponto do mesmo jeito, com `cursor:pointer` no `base.css` dele, então o grafo de
        leitura oferecia a mão de ponteiro sobre uma alça inerte. O gate `alvo-clicavel` pegou em
        29/08/2026, em duas páginas do catálogo. Agora ela não existe quando não serve. */}
    {d.conectavel&&<Handle type="target" position={Position.Left} isConnectable className="graph-handle"/>}
    {d.aoSelecionar
      ?<button type="button" className="graph-node-body" aria-pressed={!!d.selecionado} onClick={d.aoSelecionar}>{corpo}</button>
      :<span className="graph-node-body">{corpo}</span>}
    {d.conectavel&&<Handle type="source" position={Position.Right} isConnectable className="graph-handle"/>}
  </div>;
}
const TIPOS={aurea:NoAurea};

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
const ROTULO={fill:"var(--xy-edge-label-color)",fontSize:"var(--text-xs)"} as const;
const FUNDO_DO_ROTULO={fill:"var(--xy-edge-label-background-color)"} as const;
function ArestaAurea({id,sourceX,sourceY,targetX,targetY,sourcePosition,targetPosition,label,data,markerEnd,style}:EdgeProps){
  const dy=(data as {deslocamento?:number}|undefined)?.deslocamento??0;
  const [caminho,lx,ly]=getBezierPath({sourceX,sourceY:sourceY+dy,sourcePosition,targetX,targetY:targetY+dy,targetPosition});
  return <BaseEdge id={id} path={caminho} labelX={lx} labelY={ly} label={label} markerEnd={markerEnd} style={style}
                   labelStyle={ROTULO} labelShowBg labelBgStyle={FUNDO_DO_ROTULO}/>;
}
const TIPOS_DE_ARESTA={aurea:ArestaAurea};
/** Identidade e deslocamento de cada aresta — interno; o teste lê o resultado no DOM. */
function arestasParalelas(edges:GraphEdgeItem[]):{id:string;deslocamento:number}[]{
  const total=new Map<string,number>();
  for(const e of edges){const k=`${e.from}->${e.to}`;total.set(k,(total.get(k)??0)+1)}
  const vista=new Map<string,number>();
  const usados=new Set<string>();
  return edges.map(e=>{
    const par=`${e.from}->${e.to}`;
    const k=vista.get(par)??0;vista.set(par,k+1);
    const n=total.get(par)!;
    // Sem `id`, a primeira do par mantém o id de sempre; a segunda em diante ganha o índice.
    let id=e.id??(k===0?par:`${par}#${k}`);
    while(usados.has(id))id=`${id}#`;
    usados.add(id);
    return {id,deslocamento:n>1?ALTURA*((k+1)/(n+1)-1/2):0};
  });
}

// DependencyGraph — quem depende de quem.
//
// O vocabulário da API é NOSSO — `{from,to}`, não `{source,target}`. Não é preciosismo: é o que
// permite trocar o motor sem quebrar quem usa, e é a mesma razão pela qual o `Chart` não expõe
// os tipos do Recharts. O escopo também é menor que o do motor: nada de minimapa, de painéis,
// de nó redimensionável nem de seleção por retângulo — isso é superfície de EDITOR, e o editor
// é a Parte I (`VisualBuilder`, item I8), que compõe este componente em vez de reescrevê-lo.
export function DependencyGraph({nodes,edges,label,selectedId,onSelect,connectable,onConnect,onNodeMove,height,className,...props}:{nodes:GraphNodeItem[];edges:GraphEdgeItem[];label?:string;selectedId?:string|null;onSelect?:(id:string)=>void;connectable?:boolean;onConnect?:(edge:{from:string;to:string})=>void;onNodeMove?:(id:string,pos:{x:number;y:number})=>void;height?:string;className?:string}&Omit<React.HTMLAttributes<HTMLDivElement>,"onSelect">){
  const s=useAureaStrings();
  // O layout só roda para quem não trouxe coordenada. Quem traz manda — é o que deixa a Parte I
  // guardar a posição que a pessoa arrastou sem brigar com a disposição automática.
  const automatico=React.useMemo(()=>dispor(nodes,edges),[nodes,edges]);
  const nosDoMotor=React.useMemo<Node[]>(()=>nodes.map(n=>({
    id:n.id,type:"aurea",
    position:{x:n.x??automatico.posicoes.get(n.id)?.x??0,y:n.y??automatico.posicoes.get(n.id)?.y??0},
    draggable:!!onNodeMove,
    // ── O QUE FAZ ESTE GRAFO EXISTIR FORA DO NAVEGADOR ─────────────────────────────────
    // O motor só desenha nó que tem tamanho, e no servidor não há o que medir. `initialWidth`
    // e `initialHeight` valem SÓ até a primeira medição — no navegador o tamanho real assume
    // e um nó de três linhas deixa de ser aproximado. E sem `handles` declarados a aresta não
    // sabe de onde sai nem onde chega, então ela some.
    //
    // Eu tinha concluído que grafo não cabia em HTML estático e escrevi isso como limite do
    // componente. Era conclusão minha, não medição: o motor tem caminho de SSR documentado, e
    // são estas três coisas. A prévia do catálogo existe por causa deste bloco.
    initialWidth:LARGURA,initialHeight:ALTURA,
    handles:[{type:"target" as const,position:Position.Left,x:0,y:ALTURA/2},
             {type:"source" as const,position:Position.Right,x:LARGURA,y:ALTURA/2}],
    data:{label:n.label,kind:n.kind,detail:n.detail,selecionado:selectedId===n.id,
          conectavel:!!connectable,aoSelecionar:onSelect?()=>onSelect(n.id):undefined},
  })),[nodes,automatico,selectedId,onSelect,connectable,onNodeMove]);
  // `selectable:false` na PRÓPRIA aresta, e não só no `elementsSelectable` do `<ReactFlow>`:
  // medido em 29/08/2026, a prop do fluxo não tira a classe `.selectable` da aresta, que é onde
  // o `base.css` do motor põe `cursor:pointer`. A mão de ponteiro prometia um clique que a API
  // da Aurea não atende — `onSelect` é do NÓ, e quem o atende é o <button> do corpo dele.
  const arestasDoMotor=React.useMemo<Edge[]>(()=>{
    const ident=arestasParalelas(edges);
    return edges.map((e,i)=>({
      id:ident[i].id,type:"aurea",source:e.from,target:e.to,label:e.label,animated:e.animated,
      data:{deslocamento:ident[i].deslocamento},selectable:false,
    }));
  },[edges]);
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
  const [nosVivos,setNosVivos]=React.useState<Node[]>(nosDoMotor);
  React.useEffect(()=>{
    setNosVivos(anteriores=>{
      const medidos=new Map(anteriores.map(n=>[n.id,n.measured]));
      return nosDoMotor.map(n=>({...n,measured:medidos.get(n.id)}));
    });
  },[nosDoMotor]);
  const aoMudarNos=React.useCallback((mudancas:NodeChange[])=>{
    setNosVivos(anteriores=>applyNodeChanges(mudancas,anteriores));
  },[]);
  // `initialWidth`/`initialHeight` no provider é o par do de cima, um nível acima: é o viewport
  // que o `fitView` usa ENQUANTO ninguém mediu. Com o prefixo `initial`, o navegador sobrescreve
  // na primeira medição — passar `width`/`height` direto no ReactFlow fixaria o tamanho e mataria
  // a fluidez. O valor é a extensão do próprio layout, então no servidor o grafo cabe exato.
  return <div className={cx("dependency-graph",className)} style={height?{blockSize:height}:undefined}
              role="group" aria-label={label??s.graphLabel} {...props}>
    <ReactFlowProvider initialNodes={nosDoMotor} initialEdges={arestasDoMotor} fitView
                       initialWidth={automatico.extensao.larg} initialHeight={automatico.extensao.alt}>
    {/* `elementsSelectable` fica FALSO: ele acende a seleção do MOTOR nas arestas também, e com
        ela o `cursor:pointer` que o `base.css` deles põe — uma promessa de clique que a API da
        Aurea não atende, porque `onSelect` é do NÓ e quem o atende é o <button> do corpo do nó.
        Medido em 29/08/2026 pelo gate `alvo-clicavel`, em `dependencygraph.html`. */}
    <ReactFlow nodes={nosVivos} onNodesChange={aoMudarNos} edges={arestasDoMotor} nodeTypes={TIPOS} edgeTypes={TIPOS_DE_ARESTA}
               fitView proOptions={{hideAttribution:false}}
               nodesDraggable={!!onNodeMove} nodesConnectable={!!connectable}
               elementsSelectable={false}
               onNodeDragStop={onNodeMove?(_,no)=>onNodeMove(no.id,no.position):undefined}
               onConnect={onConnect?c=>{if(c.source&&c.target)onConnect({from:c.source,to:c.target})}:undefined}>
      {/* O `<Background/>` fica: a regra dele (`--xy-background-pattern-color`) mora no
          `init.css`, que o `base.css` importa, então ele obedece ao nosso token.
          O `<Controls/>` NÃO fica, e é decisão de pele: os botões dele só ganham cor no
          `style.css`, que é a identidade deles e não entra — e escrever `.react-flow__*` no
          nosso core seria pôr no gate 15 uma classe que componente nenhum daqui produz.
          Zoom e deslocamento continuam no mouse e no teclado do motor; botão de zoom, quem
          quiser, compõe com o `IconButton` que já existe. */}
      <Background/>
    </ReactFlow>
    </ReactFlowProvider>
  </div>;
}
