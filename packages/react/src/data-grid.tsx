"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
// SUBPATH PRÓPRIO (ver ./qrcode): é o único componente que precisa do @tanstack/react-table,
// que é peer OPCIONAL. Table, DataList, KPI e Timeline ficam em /data-display sem essa conta.
import React, {type InputHTMLAttributes, type RefAttributes} from "react";
import {useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, getFacetedRowModel, getFacetedUniqueValues, flexRender, type Column, type ColumnDef, type FilterFn, type SortingState, type RowSelectionState, type ColumnFiltersState, type VisibilityState, type ColumnSizingState, type PaginationState, type Updater} from "@tanstack/react-table";
import {cx, useAureaStrings, stateSeverity, type UniversalState} from "./internal.js";
import {Icon, type IconName} from "./system.js";
import {Button, Toolbar, ToolbarButton, ToolbarSeparator} from "./actions.js";
import {Input, SearchField, MultiCombobox} from "./inputs.js";
import {Pagination} from "./navigation.js";
import {Cluster} from "./layout.js";
import {Alert, Skeleton} from "./feedback.js";
import {IconButton} from "./actions.js";

// Reexportados pelo mesmo motivo que ColumnDef: quem controla o estado de fora
// precisa TIPAR esse estado, e não deve ter de instalar o motor para isso.
export type {ColumnDef, SortingState, RowSelectionState, ColumnFiltersState, VisibilityState, ColumnSizingState} from "@tanstack/react-table";

// DataGrid (Fase 4): TanStack Table v8 (8.21.3) headless + pele Aurea — sort,
// filtro global, paginação e seleção por checkbox. A pele reusa .table-wrap/th/td.
//
// PLANO-1.0 Parte F, itens F1 e F2 (08/08/2026): o estado deixou de ser SÓ interno.
// Cada eixo aceita valor + callback de fora, e o interno segue sendo o default —
// nenhuma chamada existente muda. E os quatro `manual*` dizem ao motor que quem
// ordena/filtra/pagina é o servidor, não ele.
//
// Por que os nomes `manualSorting`/`manualFiltering`/`manualPagination` são os DO
// MOTOR e não inventados aqui: as três referências de tabela foram medidas em
// 08/08/2026 e NENHUMA expõe API controlada — o shadcn guarda tudo em useState
// dentro do exemplo, o Kibo põe a ordenação num átomo global (jotai) e o Untitled
// é apresentação. Não havia anatomia para copiar; o vocabulário veio do contrato
// do motor, que é o que o consumidor já lê na documentação dele.
//
// LIMITE de `manualPagination`: `data` passa a ser UMA página, então `rowCount`
// (total no servidor) é obrigatório — sem ele o motor devolve pageCount -1 e a
// paginação some da tela. E `onSelectionChange` emite as linhas da página atual,
// porque é só o que existe em memória; para seleção que atravessa páginas, use
// `rowSelection`/`onRowSelectionChange`, que são ids.
// A11y: aria-sort fica SÓ no th ordenado (padrão APG) e o cabeçalho ordenável é
// um <button> de verdade. A paginação reusa o componente Pagination.
//
// G-A11Y-07 — ELE É UM `grid`, E ATÉ 28/08/2026 SÓ DIZIA QUE ERA.
//
// A ficha declarava `role: "grid"`, `apg: "grid"` e quatro setas. Medido no navegador em
// 27/08, as quatro eram INERTES: `<table>` puro, nenhum `onKeyDown`, nenhum `tabIndex` em
// célula. Prometer acessibilidade que não existe é pior que não ter — quem lê o contrato para
// decidir se adota confia nele. A ficha foi corrigida naquele dia para o que se media
// (`role: "table"`); hoje o componente passa a merecer o que prometia.
//
// POR QUE `grid` E NÃO `table`, agora de verdade: a APG manda usar `grid` quando as células
// contêm widgets operáveis, e as deste contêm — cabeçalho ordenável é `<button>`, seleção é
// `<input type=checkbox>`. E vem de brinde a correção de uma limitação que o comentário antigo
// deste arquivo registrava como fato da vida: **`aria-selected` é inválido em `role=table`, e é
// VÁLIDO em `role=grid`**. A seleção deixou de ser só `data-selected` (estilo) e passou a ser
// estado ACESSÍVEL na linha, que é o que o leitor de tela anuncia.
//
// O MODELO DE FOCO é o da APG: um tab stop para a grade inteira (roving tabindex pelas
// CÉLULAS, cabeçalho incluído), setas navegam, `Enter`/`F2` entram no widget da célula e
// `Escape` volta para a célula. Duas teclas para marcar um checkbox é o preço de a grade ter
// navegação — e é exatamente o que o exemplo "Data Grid" da APG faz.
//
// A conta de posição é feita contra o DOM (`table.rows[r].cells[c]`), não contra os dados: a
// linha de "vazio" tem uma célula só com `colSpan`, e qualquer aritmética baseada no número de
// colunas dos dados sairia da caixa ali. Quem sabe quantas células a linha tem é a linha.
function GridCheck({label,indeterminate,...props}:InputHTMLAttributes<HTMLInputElement>&RefAttributes<HTMLInputElement>&{label:string;indeterminate?:boolean}){
  // `tabIndex={-1}`: numa grade APG a parada de Tab é UMA, a grade inteira. O checkbox continua
  // focável por programa — é o que o `Enter`/`F2` da célula faz —, e o `Space` marca dali.
  return <label className="checkbox"><input type="checkbox" tabIndex={-1} ref={el=>{if(el)el.indeterminate=!!indeterminate}} {...props}/><span className="control-mark"/><span className="sr-only">{label}</span></label>;
}
// F3 (08/08/2026): filtro POR COLUNA, numa linha do próprio cabeçalho — cada
// controle nasce alinhado com a sua coluna sem uma linha de layout, porque quem
// alinha é a tabela. A alternativa era uma barra acima com os controles soltos,
// que é o que o shadcn faz no exemplo dele e que reinventa o alinhamento à mão.
//
// A faceta é um `MultiCombobox`, não um popover novo: escolher vários valores de
// uma lista É esse componente, e ele já traz teclado, ARIA, portal e pele
// gateados. O que o shadcn desenha com Popover + Command + Badge + Separator
// (147 linhas) aqui é reuso.
//
// A contagem por opção vem de `getFacetedUniqueValues()` e entra no RÓTULO —
// "Active (12)". O mapa do motor é chaveado pelo valor CRU da célula, então é
// normalizado para texto aqui; sem isso uma coluna numérica não acha a contagem.
export interface GridFilterSpec{column:string;label:string;facet?:boolean;options?:Array<{value:string;label:string}>}
// A faceta guarda um ARRAY de valores e a célula é ESCALAR — e nenhum filterFn de
// fábrica faz "valor da célula ∈ selecionados": `arrIncludes`/`arrIncludesSome`
// esperam a célula array (medido em filterFns.ts:45,67). É uma linha, e mora aqui
// para o consumidor não repeti-la em cada coluna, que é o que a referência obriga.
const facetFilterFn:FilterFn<any>=(row,columnId,value)=>!Array.isArray(value)||!value.length||value.includes(String(row.getValue(columnId)));
function GridFilter<T>({col,spec,name}:{col:Column<T,unknown>;spec:GridFilterSpec;name:string}){
  if(!spec.facet)return <Input value={(col.getFilterValue() as string)??""} onChange={e=>col.setFilterValue(e.target.value||undefined)} aria-label={name}/>;
  const counts=new Map([...col.getFacetedUniqueValues()].map(([k,n])=>[String(k),n]));
  // `options` explícitas mantêm na lista um valor que NENHUMA linha tem agora —
  // é a diferença entre "não há nenhum cancelado" e "cancelado não existe".
  const base=spec.options??[...counts.keys()].filter(v=>v!==""&&v!=="null"&&v!=="undefined").sort();
  const items=(typeof base[0]==="string"?(base as string[]).map(v=>({value:v,label:v})):base as Array<{value:string;label:string}>)
    .map(o=>({value:o.value,label:counts.has(o.value)?`${o.label} (${counts.get(o.value)})`:o.label}));
  const picked=(col.getFilterValue() as string[]|undefined)??[];
  return <MultiCombobox items={items} value={items.filter(i=>picked.includes(i.value))} onValueChange={v=>col.setFilterValue(v.length?v.map(i=>i.value):undefined)} label={<span className="sr-only">{name}</span>}/>;
}
// F1: um só lugar decide entre "o valor vem de fora" e "eu guardo". Escrever o
// ternário em cada eixo é como se erra em um — e o erro típico (esquecer o
// onChange no modo controlado) trava a tela do consumidor, não a nossa.
function useMaybe<S>(outer:S|undefined,onChange:((v:S)=>void)|undefined,initial:S):[S,(u:Updater<S>)=>void]{
  const [inner,setInner]=React.useState(initial);
  const controlled=outer!==undefined;
  const value=controlled?outer:inner;
  return [value,u=>{const next=typeof u==="function"?(u as (old:S)=>S)(value):u;if(!controlled)setInner(next);onChange?.(next)}];
}
export function DataGrid<T>({data,columns,label,filterable,pageSize,selectable,onSelectionChange,getRowId,className,sorting:sortingProp,onSortingChange,globalFilter:globalFilterProp,onGlobalFilterChange,page,onPageChange,rowSelection:rowSelectionProp,onRowSelectionChange,manualSorting,manualFiltering,manualPagination,rowCount,filters,columnFilters:columnFiltersProp,onColumnFiltersChange,bulkActions,stickyHeader,hideableColumns,columnVisibility:columnVisibilityProp,onColumnVisibilityChange,resizableColumns,columnSizing:columnSizingProp,onColumnSizingChange,state,stateMessage,renderDetail,detailRowId:detailRowIdProp,onDetailRowIdChange,onExport}:{data:T[];columns:Array<ColumnDef<T,any>>;label?:string;filterable?:boolean;pageSize?:number;selectable?:boolean;onSelectionChange?:(rows:T[])=>void;getRowId?:(row:T,index:number)=>string;className?:string;sorting?:SortingState;onSortingChange?:(sorting:SortingState)=>void;globalFilter?:string;onGlobalFilterChange?:(filter:string)=>void;page?:number;onPageChange?:(page:number)=>void;rowSelection?:RowSelectionState;onRowSelectionChange?:(selection:RowSelectionState)=>void;manualSorting?:boolean;manualFiltering?:boolean;manualPagination?:boolean;rowCount?:number;filters?:GridFilterSpec[];columnFilters?:ColumnFiltersState;onColumnFiltersChange?:(filters:ColumnFiltersState)=>void;bulkActions?:Array<{id:string;label:string;icon?:IconName;onAction:(rows:T[],clear:()=>void)=>void}>;stickyHeader?:boolean;hideableColumns?:boolean;columnVisibility?:VisibilityState;onColumnVisibilityChange?:(v:VisibilityState)=>void;resizableColumns?:boolean;columnSizing?:ColumnSizingState;onColumnSizingChange?:(s:ColumnSizingState)=>void;state?:"loading"|"error"|UniversalState;stateMessage?:string;renderDetail?:(row:T)=>React.ReactNode;detailRowId?:string|null;onDetailRowIdChange?:(id:string|null)=>void;onExport?:(rows:T[],scope:{count:number;filtered:boolean;selected:boolean})=>void}){
  const s=useAureaStrings();
  const [sorting,setSorting]=useMaybe<SortingState>(sortingProp,onSortingChange,[]);
  const [globalFilter,setGlobalFilter]=useMaybe<string>(globalFilterProp,onGlobalFilterChange,"");
  const [columnFilters,setColumnFilters]=useMaybe<ColumnFiltersState>(columnFiltersProp,onColumnFiltersChange,[]);
  // F7: os dois são MAPAS serializáveis — é isso que torna a escolha persistível,
  // e por isso a persistência não é nossa: quem decide entre localStorage, perfil
  // do usuário ou URL é o consumidor, exatamente como no F4.
  const [columnVisibility,setColumnVisibility]=useMaybe<VisibilityState>(columnVisibilityProp,onColumnVisibilityChange,{});
  const [columnSizing,setColumnSizing]=useMaybe<ColumnSizingState>(columnSizingProp,onColumnSizingChange,{});
  const [detailRowId,setDetailRowId]=useMaybe<string|null>(detailRowIdProp,onDetailRowIdChange,null);
  const [rowSelection,setRowSelection]=useMaybe<RowSelectionState>(rowSelectionProp,onRowSelectionChange,{});
  // `page` é 1-based porque o nosso Pagination é 1-based e é ele que aparece na
  // tela; o motor é 0-based. A conversão fica AQUI, uma vez. Só o índice é
  // estado: o tamanho vem sempre da prop, então mudar `pageSize` não deixa um
  // valor velho preso em useState.
  const paginated=pageSize!=null;
  const [innerIndex,setInnerIndex]=React.useState(0);
  const pageIndex=page!==undefined?page-1:innerIndex;
  const pagination=React.useMemo<PaginationState>(()=>({pageIndex,pageSize:pageSize??10}),[pageIndex,pageSize]);
  const setPagination=(u:Updater<PaginationState>)=>{const next=typeof u==="function"?u(pagination):u;if(page===undefined)setInnerIndex(next.pageIndex);onPageChange?.(next.pageIndex+1)};
  // Sem getRowId a seleção do TanStack é por ÍNDICE: trocar/reordenar data faria o
  // checkbox "seguir" a posição e marcar OUTRO registro (auditoria 18/07/2026,
  // ALTO 3). Sem id estável a seleção não sobrevive à mudança de dados — limpa.
  // Com getRowId ela persiste corretamente; prefira passá-lo quando selectable.
  const prevData=React.useRef(data);
  React.useEffect(()=>{
    if(prevData.current===data)return;
    prevData.current=data;
    if(!getRowId&&Object.keys(rowSelection).length){setRowSelection({});onSelectionChange?.([])}
  },[data]);
  const facetIds=React.useMemo(()=>new Set((filters??[]).filter(f=>f.facet).map(f=>f.column)),[filters]);
  const allColumns=React.useMemo<Array<ColumnDef<T,any>>>(()=>{
    const comFn:Array<ColumnDef<T,any>>=columns.map(c=>{const id=(c as {id?:string;accessorKey?:string}).id??(c as {accessorKey?:string}).accessorKey;
      return id&&facetIds.has(id)?{...c,filterFn:facetFilterFn}:c});
    return selectable?[{
      id:"select",enableSorting:false,
      header:({table})=><GridCheck label={s.dataGridSelectAll} checked={table.getIsAllRowsSelected()} indeterminate={table.getIsSomeRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()}/>,
      cell:({row})=><GridCheck label={s.dataGridSelectRow} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()}/>,
    },...comFn]:comFn;
  },[selectable,columns,s,facetIds]);
  // F9: o gatilho do detalhe é uma COLUNA com botão por linha, no molde da coluna de
  // seleção — e não um <tr> clicável. Linha não é foco de teclado, e transformá-la em
  // alvo exige inventar papel, tabindex e tecla; um <button> já é tudo isso.
  const colunas=React.useMemo<Array<ColumnDef<T,any>>>(()=>renderDetail?[...allColumns,{
    id:"detail",enableSorting:false,enableHiding:false,header:()=>null,
    cell:({row})=><IconButton icon="chevron--right" label={s.dataGridDetails} size="sm" variant="ghost"
      aria-expanded={detailRowId===row.id} onClick={()=>setDetailRowId(detailRowId===row.id?null:row.id)}/>,
  }]:allColumns,[allColumns,renderDetail,detailRowId,s]);
  // A função acima precisa da tabela, e a tabela é o que esta chamada devolve: a referência fecha o
  // círculo. Ela é lida só quando o motor filtra, que é sempre depois da primeira montagem.
  const tabelaRef=React.useRef<ReturnType<typeof useReactTable<T>>|null>(null);
  const table=useReactTable({
    data,columns:colunas,getRowId,
    state:{sorting,globalFilter,rowSelection,columnFilters,columnVisibility,columnSizing,...(paginated?{pagination}:{})},
    onSortingChange:setSorting,
    onGlobalFilterChange:setGlobalFilter,
    onColumnFiltersChange:setColumnFilters,
    onColumnVisibilityChange:setColumnVisibility,
    onColumnSizingChange:setColumnSizing,
    enableColumnResizing:!!resizableColumns,columnResizeMode:"onChange",
    onPaginationChange:setPagination,
    // F2: os três curto-circuitam o modelo de linha correspondente dentro do
    // motor — medido no fonte instalado (RowSorting.ts:535, ColumnFiltering.ts:408,
    // RowPagination.ts:376). Por isso os getters abaixo seguem ligados sem
    // condição: sob `manual` o motor simplesmente não os chama.
    manualSorting,manualFiltering,manualPagination,rowCount,
    // emite as linhas ORIGINAIS já aqui (não em effect): getPreFilteredRowModel
    // ignora filtro/página, então a seleção sobrevive a ambos.
    onRowSelectionChange:updater=>{
      const next=typeof updater==="function"?updater(rowSelection):updater;
      setRowSelection(next);
      onSelectionChange?.(table.getPreFilteredRowModel().flatRows.filter(r=>next[r.id]).map(r=>r.original));
    },
    getCoreRowModel:getCoreRowModel(),
    getSortedRowModel:getSortedRowModel(),
    getFilteredRowModel:getFilteredRowModel(),
    // A BUSCA NÃO DEPENDE DE QUEM VEM PRIMEIRO (A-11, 23/09/2026). A regra do motor (TanStack v8,
    // `GlobalFiltering.js`, `getColumnCanGlobalFilter`) olha SÓ a primeira linha: se o valor dela
    // não for texto nem número, a coluna sai da busca. Medido num app com 298 endereços: o primeiro
    // não tinha fabricante, e procurar "Hikvision" dava zero onde havia 17. A regra daqui é a mesma
    // pergunta — "esta coluna guarda texto ou número?" — respondida pelo primeiro valor PRESENTE,
    // não pela primeira linha. `enableGlobalFilter:false` na coluna continua mandando: o motor
    // confere essa chave antes de chamar esta função.
    getColumnCanGlobalFilter:coluna=>{
      for(const linha of tabelaRef.current?.getCoreRowModel().flatRows??[]){
        const v=linha.getValue(coluna.id);
        if(v==null||v==="")continue;
        return typeof v==="string"||typeof v==="number";
      }
      return false;
    },
    enableRowSelection:!!selectable,
    ...(paginated?{getPaginationRowModel:getPaginationRowModel()}:{}),
    // só quando há faceta: os dois varrem os dados para montar o mapa de valores
    // únicos, e ninguém paga por isso sem ter pedido.
    // <T> explícito: chamados sem argumento de tipo, os dois fixam TData em
    // `unknown` e derrubam a inferência do useReactTable inteiro — o erro sai
    // longe daqui, em `columns` e em `row.original`.
    ...(facetIds.size?{getFacetedRowModel:getFacetedRowModel<T>(),getFacetedUniqueValues:getFacetedUniqueValues<T>()}:{}),
  });
  tabelaRef.current=table;
  const rows=table.getRowModel().rows;
  // O TAB STOP ROVING, e o `clamp` não é zelo: filtrar, ordenar ou paginar troca as linhas sob
  // o foco. Sem ele a grade inteira ficaria `tabIndex=-1` e sumiria da ordem do Tab — é o mesmo
  // defeito que o `TreeView` pagou (MÉDIO 1 da auditoria) e resolve com `effectiveActive`.
  const grade=React.useRef<HTMLTableElement>(null);
  const [foco,setFoco]=React.useState({r:0,c:0});
  const nColunas=table.getVisibleLeafColumns().length;
  // A LINHA DE "VAZIO" CONTA, e conta com UMA coluna só.
  //
  // O defeito que isto corrige foi MEDIDO, e não é o que eu tinha escrito aqui na primeira
  // versão. Eu havia afirmado que sem o clamp a grade "sumia da ordem do Tab"; a medição
  // desmentiu — ela continua alcançável. O que quebra é mais sutil e mais chato: com o `clamp`
  // de linha dizendo "só existe o cabeçalho" enquanto o DOM tem a linha do vazio, **a parada de
  // Tab fica numa célula e o foco em outra**. Filtrando até não sobrar nada e descendo para a
  // linha do vazio, o DOM ficava assim:
  //
  //     sem o clamp   TH:0  TH:-1  TD:-1   ← foco no TD, parada de Tab no TH
  //     com o clamp   TH:-1 TH:-1  TD:0    ← a parada acompanha o foco
  //
  // Ou seja: sair da grade e voltar devolvia a pessoa ao cabeçalho, e não a onde ela estava. É
  // a invariante do roving tabindex — a célula focada É a parada — e o teste que a cobra assere
  // exatamente isso, porque contar quantas células têm `tabindex=0` passava verde com o defeito.
  const nLinhas=(rows.length||1)+1;                  // +1: a linha de cabeçalho é navegável
  const r=Math.min(foco.r,nLinhas-1);
  const colunasNaLinha=rows.length===0&&r===1?1:nColunas;
  const eff={r,c:Math.min(foco.c,colunasNaLinha-1)};
  // Mover é reposicionar NO DOM e focar. `setFoco` só existe para o `tabIndex` da próxima
  // renderização; quem devolve o foco de verdade é o `.focus()` aqui.
  const irPara=(r:number,c:number)=>{
    const linhas=grade.current?.rows;
    if(!linhas?.length)return;
    const nr=Math.max(0,Math.min(r,linhas.length-1));
    const nc=Math.max(0,Math.min(c,linhas[nr].cells.length-1));
    setFoco({r:nr,c:nc});
    (linhas[nr].cells[nc] as HTMLElement).focus();
  };
  const teclado=(e:React.KeyboardEvent<HTMLTableElement>)=>{
    const alvo=e.target as HTMLElement;
    const celula=alvo.closest("th,td") as HTMLTableCellElement|null;
    if(!celula||!grade.current?.contains(celula))return;
    const r=(celula.parentElement as HTMLTableRowElement).rowIndex,c=celula.cellIndex;
    // DENTRO de um widget da célula, o teclado é DELE. Interceptar as setas aqui quebraria o
    // campo de texto que um dia entre numa célula, e é o defeito que o probe de teclado pegou
    // no `Space` dos bancos com <input> (`digitaTexto`).
    const dentro=alvo!==celula;
    if(dentro){
      if(e.key==="Escape"){e.preventDefault();irPara(r,c)}
      return;
    }
    // O SALTO DE PÁGINA é de 10 linhas e é ARBITRÁRIO com aval: a APG diz "um número de linhas
    // definido pelo autor". 10 é o que cabe numa tela sem passar do fim na maioria das grades.
    const salto=10;
    switch(e.key){
      case "ArrowRight":e.preventDefault();irPara(r,c+1);break;
      case "ArrowLeft":e.preventDefault();irPara(r,c-1);break;
      case "ArrowDown":e.preventDefault();irPara(r+1,c);break;
      case "ArrowUp":e.preventDefault();irPara(r-1,c);break;
      case "PageDown":e.preventDefault();irPara(r+salto,c);break;
      case "PageUp":e.preventDefault();irPara(r-salto,c);break;
      case "Home":e.preventDefault();irPara(e.ctrlKey?0:r,0);break;
      case "End":e.preventDefault();irPara(e.ctrlKey?(grade.current.rows.length-1):r,nColunas-1);break;
      // ENTRAR NA CÉLULA. Se ela não tem widget, não há o que fazer e a tecla segue seu caminho
      // (um `Enter` numa célula de texto não deve engolir nada).
      case "Enter":case "F2":{
        const w=celula.querySelector<HTMLElement>(
          "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])");
        if(w){e.preventDefault();w.focus()}
        break;
      }
    }
  };
  // O FOCO QUE CHEGA POR CLIQUE OU POR TAB também reposiciona o roving. Sem isto, sair da grade
  // e voltar devolveria o foco à célula ANTIGA, e clicar numa célula deixaria o tab stop noutra.
  const focoEntrou=(e:React.FocusEvent<HTMLTableElement>)=>{
    const celula=(e.target as HTMLElement).closest("th,td") as HTMLTableCellElement|null;
    if(celula&&grade.current?.contains(celula)){
      setFoco({r:(celula.parentElement as HTMLTableRowElement).rowIndex,c:celula.cellIndex});
    }
  };
  const rove=(r:number,c:number)=>eff.r===r&&eff.c===c?0:-1;
  const sortIcon=(dir:false|"asc"|"desc")=>dir==="asc"?"chevron--sort--up":dir==="desc"?"chevron--sort--down":"chevron--sort";
  // F5: a barra de lote. Duas referências independentes (Activepieces e Kaneo) chegam
  // à MESMA anatomia — contagem, divisória, ações, e um jeito de limpar —, então é
  // ela que entra. O que não entra é o resto das duas: barra `position:fixed` sobre a
  // janela inteira (decisão da APLICAÇÃO, não de um componente que o consumidor põe
  // onde quer, e briga de z-index de graça) e animação por biblioteca de movimento.
  //
  // E ela não tem CSS NENHUM: é `Toolbar` + `ToolbarButton` + `ToolbarSeparator`, que
  // já são superfície flutuante com pele e teclado de setas do Base UI, mais `.hint`
  // para a contagem. A referência desenha a mesma barra à mão em 57 linhas.
  //
  // As linhas vão como as ORIGINAIS e de antes do filtro, igual ao onSelectionChange —
  // agir em lote sobre o que o filtro escondeu é o que o consumidor pediu ao marcar.
  const emLote=bulkActions?.length?table.getPreFilteredRowModel().flatRows.filter(r=>rowSelection[r.id]).map(r=>r.original):[];
  const limparSelecao=()=>table.resetRowSelection();
  // F10: o botão DIZ o escopo, e é essa a exigência do item — "exportar" sozinho
  // esconde a pergunta que importa: exportar o quê, tudo ou o que está na tela?
  // A precedência é a que a pessoa acabou de fazer: se marcou, é o marcado; se
  // filtrou, é o filtrado; senão é tudo.
  //
  // FRONTEIRA, e ela não se move: a grade não gera arquivo nem baixa nada. Formato,
  // codificação e transporte são do consumidor — é a mesma linha que a Parte G traça
  // para o envio de arquivo. O que entra é a peça de interface e o escopo certo.
  const selecionadasExp=onExport?table.getPreFilteredRowModel().flatRows.filter(r=>rowSelection[r.id]).map(r=>r.original):[];
  const filtradas=onExport?table.getFilteredRowModel().rows.map(r=>r.original):[];
  const escopo=selecionadasExp.length?{linhas:selecionadasExp,filtered:false,selected:true,sufixo:s.dataGridExportSelected}
    :filtradas.length!==data.length?{linhas:filtradas,filtered:true,selected:false,sufixo:s.dataGridExportFiltered}
    :{linhas:filtradas,filtered:false,selected:false,sufixo:s.dataGridExportRows};
  const exportar=onExport?<Button variant="secondary" leadingIcon="download" onClick={()=>onExport(escopo.linhas,{count:escopo.linhas.length,filtered:escopo.filtered,selected:escopo.selected})}>
    {`${s.dataGridExport} ${escopo.linhas.length} ${escopo.sufixo}`}</Button>:null;
  const busca=filterable?<SearchField value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)} placeholder={s.dataGridFilter} aria-label={s.dataGridFilter}/>:null;
  // F7: esconder coluna é escolher várias de uma lista — o mesmo `MultiCombobox` da
  // faceta do F3. Terceira peça desta parte que entra por reuso em vez de construção.
  const ocultaveis=hideableColumns?table.getAllLeafColumns().filter(c=>c.getCanHide()&&c.id!=="select"):[];
  const itensColuna=ocultaveis.map(c=>({value:c.id,label:String(c.columnDef.header??c.id)}));
  const seletorColunasEl=hideableColumns?<MultiCombobox items={itensColuna} value={itensColuna.filter(i=>table.getColumn(i.value)?.getIsVisible())}
    onValueChange={v=>setColumnVisibility(Object.fromEntries(ocultaveis.map(c=>[c.id,v.some(i=>i.value===c.id)])))}
    label={<span className="sr-only">{s.dataGridColumns}</span>} placeholder={s.dataGridColumns}/>:null;
  // O Cluster só entra com DOIS ou mais controles: sozinho, cada um continua item de
  // grade e ocupa a largura toda, como antes desta parte. Medido no F7.
  const controles=[busca,seletorColunasEl,exportar].filter(Boolean).map((c,i)=><React.Fragment key={i}>{c}</React.Fragment>);
  // F8: dado velho sem aviso é pior que tela vazia — então o aviso é TEXTO, e não uma
  // cor. `Alert` já resolve os dois lados: `danger` vira role="alert" (interrompe),
  // os outros viram role="status" (entra na próxima pausa do leitor de tela).
  //
  // `loading` NÃO apaga o que já está na tela: recarregar não é motivo para o
  // consumidor perder o que estava lendo. Só quando não há linha nenhuma é que
  // entram os esqueletos. O `aria-busy` diz o resto.
  //
  // Os nomes daqui são os DESTA grade. A Parte J é que vai nomear os estados
  // universais uma vez só — antecipá-la aqui criaria o segundo vocabulário que ela
  // existe para impedir.
  //
  // A Parte J (09/08/2026) nomeou os estados universais, e este `state` passou a ACEITÁ-LOS —
  // era a previsão escrita no parágrafo acima e ela se cumpriu sem renomear nada: `stale` e
  // `partial` já se chamavam assim. `loading` e `error` continuam sendo DESTA grade e de
  // propósito: nos sete universais a tela AINDA SERVE, e sem linha nenhuma ela não serve.
  //
  // As três frases da grade ficam, e não é apego — elas falam de LINHAS ("algumas linhas não
  // puderam ser carregadas") onde a universal fala do genérico ("parte disto"). Mais específico
  // ganha de mais geral; o universal entra para os quatro estados que a grade não tinha.
  const carregando=state==="loading";
  const universal=state&&state!=="loading"&&state!=="error"?state:null;
  const recado=state&&!carregando?(stateMessage??(state==="stale"?s.dataGridStale:state==="partial"?s.dataGridPartial:state==="error"?s.dataGridError:s.universalState[state])):null;
  // O marcador vai na GRADE, não no recado: quem está obsoleto é a tabela, e o `Alert` é só
  // como ela conta isso. Achado pelo check 30 na primeira execução dele — eu tinha marcado o
  // recado, e com `state="loading"` não há recado nenhum, então o estado não chegava ao DOM.
  return <div className={cx("datagrid",stickyHeader&&"datagrid-sticky",className)} data-state={state}>
    {emLote.length>0&&<Toolbar label={s.dataGridBulkLabel}>
      <span className="hint">{emLote.length} {s.dataGridSelected}</span>
      <ToolbarSeparator/>
      {bulkActions?.map(a=><ToolbarButton key={a.id} size="sm" leadingIcon={a.icon} onClick={()=>a.onAction(emLote,limparSelecao)}>{a.label}</ToolbarButton>)}
      <ToolbarButton size="sm" onClick={limparSelecao}>{s.dataGridClearSelection}</ToolbarButton>
    </Toolbar>}
    {/* A busca sozinha continua sendo item de GRADE, ocupando a largura toda, como
        antes do F7 — medido: dentro de um Cluster ela cairia de 900px para 207px, e
        isso seria mudança de aparência para quem já usa `filterable` e não pediu nada.
        O Cluster só entra quando há um segundo controle para ficar ao lado dele. */}
    {controles.length>1?<Cluster>{controles}</Cluster>:controles[0]??null}
    {recado&&<Alert variant={state==="error"?"danger":universal?stateSeverity(universal):"warning"}>{recado}</Alert>}
    {(() => {
      // F9: o embrulho de duas colunas só existe COM o painel aberto — fechado, a
      // marcação é a de sempre. É a lição do F7: não mudar a estrutura de quem não
      // pediu nada. A largura do painel é `--datagrid-detail-w`, e quem decide se
      // ele cabe é a largura da GRADE, não a da janela: por isso `@container`, no
      // precedente do MediaPlayer.
      const linhaAberta=detailRowId!=null?table.getRowModel().rows.find(r=>r.id===detailRowId):undefined;
      // A REGIÃO DE ROLAGEM PERDEU O `tabIndex={0}` que o `Table` mantém, e a diferença é o
      // motivo de a regra existir: `scrollable-region-focusable` do axe cobra que um contêiner
      // rolável tenha COMO ser alcançado pelo teclado, e a grade agora tem células focáveis
      // dentro — inclusive a de "vazio". Manter o `tabIndex` daria uma parada de Tab a mais
      // ANTES da grade, e a APG pede que a grade inteira seja UMA parada.
      const tabela=(
    <div className="table-wrap" role="region" aria-label={label??s.tableLabel} aria-busy={carregando||undefined}>
      {/* `aria-rowcount`/`aria-colcount` só aparecem quando há PAGINAÇÃO, e é aí que eles
          significam alguma coisa: o DOM tem uma página, o conjunto tem mais. Sem paginação, o
          que está no DOM é o total, e declarar o óbvio é ruído para o leitor de tela.
          O `+1` conta a linha de cabeçalho, como a especificação manda. */}
      <table ref={grade} role="grid" aria-label={label??s.tableLabel} onKeyDown={teclado}
        onFocus={focoEntrou}
        aria-rowcount={pageSize!=null?table.getPreFilteredRowModel().rows.length+1:undefined}
        aria-colcount={pageSize!=null?nColunas:undefined}>
        <thead>{table.getHeaderGroups().map(hg=><tr key={hg.id}>{hg.headers.map((h,ci)=>{
          const dir=h.column.getIsSorted();
          return <th key={h.id} colSpan={h.colSpan} tabIndex={rove(0,ci)} className={h.column.id==="select"?"datagrid-selcol":undefined} aria-sort={dir==="asc"?"ascending":dir==="desc"?"descending":undefined} style={resizableColumns?{width:h.getSize()}:undefined}>
            {h.isPlaceholder?null:h.column.getCanSort()
              ?<button type="button" tabIndex={-1} className="datagrid-sort" onClick={h.column.getToggleSortingHandler()}>{flexRender(h.column.columnDef.header,h.getContext())}<Icon name={sortIcon(dir)} size="sm" className="datagrid-sort-icon"/></button>
              :flexRender(h.column.columnDef.header,h.getContext())}
            {/* A alça é um <button> e não um <div>: arrastar com o mouse é o que o motor
                entrega, e teclado é o que ele NÃO entrega. Coluna que só se redimensiona
                com mouse é funcionalidade que exclui — as setas movem 16px por toque. */}
            {resizableColumns&&h.column.getCanResize()&&<button type="button" className="datagrid-resizer"
              aria-label={`${s.dataGridResize}: ${String(h.column.columnDef.header??h.column.id)}`}
              onMouseDown={h.getResizeHandler()} onTouchStart={h.getResizeHandler()}
              onKeyDown={e=>{const d=e.key==="ArrowLeft"?-16:e.key==="ArrowRight"?16:0;if(!d)return;e.preventDefault();
                setColumnSizing({...columnSizing,[h.column.id]:Math.max(40,h.column.getSize()+d)})}}/>}
          </th>;
        })}</tr>)}
        {!!filters?.length&&<tr className="datagrid-filters">{table.getVisibleLeafColumns().map(col=>{
          const spec=filters.find(f=>f.column===col.id);
          return <th key={col.id} className={col.id==="select"?"datagrid-selcol":undefined}>{spec?<GridFilter col={col as Column<T,unknown>} spec={spec} name={`${s.dataGridFilter} ${spec.label}`}/>:null}</th>;
        })}</tr>}</thead>
        <tbody>
          {/* `aria-selected` na LINHA só existe quando a grade é selecionável: numa grade sem
              seleção, dizer `aria-selected="false"` em toda linha anuncia um estado que não
              existe. E ele só é válido aqui porque o papel é `grid` — em `table` seria inválido.
              O esqueleto de carregamento vem da MAIN e é irmão disto, não alternativa: ele
              responde "ainda não chegou", e o `aria-selected` responde "esta linha está
              escolhida". */
          }
          {carregando&&!rows.length
            ? Array.from({length:pageSize??3},(_,i)=><tr key={`sk${i}`}>{table.getVisibleLeafColumns().map(c=><td key={c.id}><Skeleton className="datagrid-skeleton"/></td>)}</tr>)
            : rows.length?rows.map((row,ri)=><tr key={row.id} aria-selected={selectable?row.getIsSelected():undefined} data-selected={row.getIsSelected()||undefined}>{row.getVisibleCells().map((cell,ci)=><td key={cell.id} tabIndex={rove(ri+1,ci)} className={cell.column.id==="select"?"datagrid-selcol":undefined}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)
            :<tr><td colSpan={nColunas} tabIndex={rove(1,0)} className="datagrid-empty">{s.dataGridEmpty}</td></tr>}
        </tbody>
      </table>
    </div>
      );
      if(!renderDetail||!linhaAberta)return tabela;
      return <div className="datagrid-split">
        {tabela}
        <aside className="datagrid-detail" aria-label={s.dataGridDetailPanel}>
          <div className="datagrid-detail-head">
            <IconButton icon="close" label={s.close} size="sm" variant="ghost" onClick={()=>setDetailRowId(null)}/>
          </div>
          {renderDetail(linhaAberta.original)}
        </aside>
      </div>;
    })()}
    {paginated&&table.getPageCount()>1&&<Pagination page={pageIndex+1} total={table.getPageCount()} onPageChange={p=>table.setPageIndex(p-1)}/>}
  </div>;
}
