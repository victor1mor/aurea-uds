"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type ReactNode} from "react";
import {cx, useAureaStrings} from "./internal.js";
import {Icon} from "./system.js";
import {Button, IconButton} from "./actions.js";

// FileInput / DropZone (Fase 4 + upload real na Fase 5).
// A zona é um <label> envolvendo o <input type="file"> nativo, então clique,
// foco e teclado saem de graça (nada de role="button" + keydown à mão) e o
// drag-and-drop é só um reforço para mouse. A validação de tipo/tamanho é
// fronteira de confiança: o accept nativo só filtra o seletor — quem arrasta ou
// escolhe "todos os arquivos" passa reto —, então validamos de verdade.
export interface FileRejection{file:File;reason:string}
// Upload real (Fase 5): o consumidor injeta a função de envio — a UI não embute
// endpoint nem protocolo. Damos o AbortSignal (cancelar) e onProgress(0..1); o
// transporte é dele (XHR/fetch). Pesquisa (07/2026): progresso REAL de envio
// segue sendo XMLHttpRequest.upload.onprogress — o fetch ainda não expõe progresso
// de upload de forma confiável (request streams só em Chromium e dão número
// impreciso). Por isso onProgress vem de FORA, não é medido por nós.
// `resumeFrom` é a fração que já subiu quando o envio foi PAUSADO. Existe porque
// pausar HTTP não é pausar: o que se pode fazer é abortar e recomeçar. Um consumidor
// com transporte resumível de verdade (tus, Range) usa esse número para continuar de
// onde parou; um consumidor sem isso ignora e reenvia. A escolha é dele porque o
// transporte é dele — a mesma fronteira que faz `onProgress` vir de fora.
export interface UploadContext{signal:AbortSignal;onProgress:(fraction:number)=>void;resumeFrom:number}
// G4: o envio pode devolver a soma que o SERVIDOR calculou. Devolver nada continua
// válido — `void` é atribuível —, então nenhum consumidor existente muda. Quem
// devolve ganha conferência de verdade: bytes diferentes reprovam o item.
export type UploadFn=(file:File,ctx:UploadContext)=>Promise<void|{checksum?:string}>
type UploadStatus="pending"|"uploading"|"paused"|"done"|"error"|"canceled";
// G1: o item da fila é DADO — nome, tamanho, estado e progresso, tudo serializável.
// É o que o consumidor persiste, e é o que ele devolve em `initialQueue`.
//
// `bytes` e não `size`: o check 23 leu `size:number` como DIMENSÃO e reprovou — e
// estava certo pelo motivo errado. Num sistema onde `size` é escala de token em
// todo lugar, chamar o peso do arquivo de `size` era ambiguidade esperando acontecer.
// O gate achou um nome ruim procurando outra coisa.
//
// LIMITE, e ele é da plataforma, não nosso: `File` NÃO volta de um armazenamento.
// Um item restaurado tem a ficha completa e não tem os bytes — dá para mostrar e
// para remover, não para reenviar. `restored: true` diz isso na cara, e a interface
// esconde o botão de repetir nesses itens em vez de oferecer um botão que falha.
export interface FileQueueItem{id:string;name:string;bytes:number;status:UploadStatus;progress:number;restored?:boolean;checksum?:string;finishedAt?:string}
interface FileEntry{id:string;file?:File;name:string;bytes:number;status:UploadStatus;progress:number;restored?:boolean;checksum?:string;preview?:string;erro?:string;finishedAt?:string}
// matchesAccept espelha o algoritmo do atributo accept do HTML: extensão (.json),
// grupo de tipo (image/*) ou MIME exato (application/json). accept vazio = tudo.
export function matchesAccept(file:{name:string;type:string},accept?:string):boolean{
  const tokens=(accept??"").split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);
  if(!tokens.length)return true;
  const name=file.name.toLowerCase(),type=file.type.toLowerCase();
  return tokens.some(t=>t.startsWith(".")?name.endsWith(t):t.endsWith("/*")?type.startsWith(t.slice(0,-1)):type===t);
}
// G3: a miniatura é uma URL de objeto, e ela VAZA se ninguém revogar — o navegador
// segura o blob até a página morrer. Só imagem ganha prévia; para o resto o ícone de
// documento já diz o que é, e gerar URL para um PDF de 40 MB não mostra nada.
const ehImagem=(f:File)=>f.type.startsWith("image/");
// G6: o "quando" do recibo. Fora do render de propósito — dentro dele o HTML mudaria
// sozinho a cada segundo, que é o defeito que o check 25 pega no catálogo.
const agora=()=>new Date().toISOString();
// O recibo é colado num chamado, num e-mail ou num bloco de notas — nenhum dos três
// lê marcação, então o formato é TSV puro. Os separadores vêm por código porque
// escapes literais neste arquivo já se perderam uma vez em edição por script.
const TAB=String.fromCharCode(9),NL=String.fromCharCode(10);
// G4: SHA-256 pelo Web Crypto — nada de dependência, é API de plataforma.
// LIMITE, e ele é declarado: `crypto.subtle` só existe em contexto seguro (https ou
// localhost), e o digest precisa do arquivo INTEIRO em memória, porque o Web Crypto
// não tem hash em fluxo. Por isso é opcional, e não o default.
async function somaSha256(file:File):Promise<string|undefined>{
  if(typeof crypto==="undefined"||!crypto.subtle)return undefined;
  try{
    const buf=await crypto.subtle.digest("SHA-256",await file.arrayBuffer());
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }catch{return undefined}
}
// AUD-0006 (12/08/2026): um item restaurado NÃO tem os bytes — a plataforma não devolve `File` de
// um armazenamento —, então ele não está subindo e não vai subir. Persistido como
// `pending`/`uploading`/`paused`, ele mostrava Pausar/Retomar/Cancelar INERTES (não há controller
// em memória para abortar, e `retomar` exige `e.file`) e contava como "em voo", o que travava o
// recibo para sempre: `emVoo` nunca zerava.
//
// `canceled` é o único terminal HONESTO aqui. A transferência foi de fato abortada — pelo fim da
// página —, e não houve falha de servidor que justificasse `error`. `pending` seria mentira dupla:
// não está esperando nada e continuaria contando como em voo.
//
// E o ganho é que a marcação certa sai de graça: o ramo de `canceled` já esconde o botão de
// repetir quando não há `File` (era uma decisão do item G1) e já oferece só a remoção. Zero string
// nova, zero branch novo.
const ATIVOS=new Set<UploadStatus>(["pending","uploading","paused"]);
const restaurar=(q:FileQueueItem):FileEntry=>({...q,restored:true,status:ATIVOS.has(q.status)?"canceled":q.status});
function formatSize(bytes:number):string{
  if(bytes<1024)return `${bytes} B`;
  const units=["KB","MB","GB"];let n=bytes/1024,i=0;
  while(n>=1024&&i<units.length-1){n/=1024;i++}
  return `${n<10?n.toFixed(1):Math.round(n)} ${units[i]}`;
}
export function FileInput({accept,maxSize,multiple,onFilesChange,upload,label,hint,id,className,initialQueue,onQueueChange,preview,checksum}:{accept?:string;maxSize?:number;multiple?:boolean;onFilesChange?:(files:File[])=>void;upload?:UploadFn;label?:ReactNode;hint?:ReactNode;id?:string;className?:string;initialQueue?:FileQueueItem[];onQueueChange?:(queue:FileQueueItem[])=>void;preview?:boolean;checksum?:boolean}){
  const s=useAureaStrings();
  const autoId=React.useId();
  const inputId=id??autoId;
  // G1: a fila restaurada entra como estado INICIAL, não como prop controlada — e a
  // palavra "inicial" é literal: um item restaurado não tem `File`, então controlá-lo
  // de fora seria prometer um round-trip que a plataforma não faz.
  // AUD-0002 (12/08/2026): o contador SEMPRE começava em zero, e os ids restaurados vêm do
  // consumidor — inclusive `f0`, que é exatamente o que ele gera. Restaurar `f0` e escolher um
  // arquivo novo dava `id: "f0"` aos DOIS: remover um removia os dois (`filter` por id), `patch`
  // atualizava os dois, e o React avisava chave duplicada. Perda de registro no fluxo oficial de
  // persistência.
  // O conjunto dos ids em uso faz o gerador PULAR, e por ser conjunto ele vale para id fora do
  // padrão também — semear o contador com "o maior sufixo numérico" só resolveria `f<N>`.
  const nextId=React.useRef(0);
  const usados=React.useRef<Set<string>|null>(null);
  if(!usados.current)usados.current=new Set((initialQueue??[]).map(q=>q.id));
  const novoId=()=>{let novo:string;do{novo=`f${nextId.current++}`}while(usados.current!.has(novo));usados.current!.add(novo);return novo};
  const [files,setFiles]=React.useState<FileEntry[]>(()=>(initialQueue??[]).map(restaurar));
  const [rejected,setRejected]=React.useState<FileRejection[]>([]);
  // a soma chega DEPOIS do envio começar (é assíncrona), então a comparação lê a
  // lista atual por ref em vez da closure do início do upload.
  // semeada com a MESMA lista inicial do estado, e não com `[]`: com fila restaurada as duas
  // divergiam até a primeira emissão, e é desta ref que o AUD-0009 abaixo lê a lista anterior.
  const filesRef=React.useRef<FileEntry[]>(files);
  // E guarda a PROMESSA, não só o valor: um arquivo pequeno com envio rápido termina
  // antes de o hash sair, e comparar contra `undefined` pularia a conferência em
  // silêncio — que é pior que não conferir, porque parece que conferiu. Quem achou
  // isso foi o teste, não a leitura.
  const somas=React.useRef<Map<string,Promise<string|undefined>>>(new Map());
  const [announce,setAnnounce]=React.useState("");
  // G5: conflito NÃO é rejeição — o arquivo é válido, só o nome já está na fila.
  // Fica em espera com a escolha na tela, porque sobrescrever em silêncio é o
  // comportamento que o item existe para proibir.
  const [conflitos,setConflitos]=React.useState<Array<{file:File;existente:string}>>([]);
  const [dragging,setDragging]=React.useState(false);
  const controllers=React.useRef<Map<string,AbortController>>(new Map());
  // Desmontar aborta tudo em voo — sem isso requisições e closures sobrevivem à
  // tela (auditoria 18/07/2026, MÉDIO 5). Concorrência/agenda é do consumidor: o
  // transporte é dele (UploadFn); o componente dispara um upload() por arquivo aceito.
  React.useEffect(()=>{const map=controllers.current;return ()=>map.forEach(c=>c.abort())},[]);
  // As URLs de objeto vivas moram numa ref para poderem ser revogadas no desmonte —
  // ler `files` de dentro do cleanup pegaria a lista do primeiro render.
  const previas=React.useRef<Set<string>>(new Set());
  React.useEffect(()=>{const set=previas.current;return ()=>set.forEach(u=>URL.revokeObjectURL(u))},[]);
  // G1: toda mudança da fila avisa por fora, em forma serializável. É o que o
  // consumidor guarda; onde ele guarda — armazenamento local, servidor, nada — é
  // decisão dele, a mesma linha do estado da grade na URL (PLANO-1.0 F4).
  const paraFila=(l:FileEntry[]):FileQueueItem[]=>l.map(({id,name,bytes,status,progress,restored,checksum:soma,finishedAt})=>({id,name,bytes,status,progress,...(soma?{checksum:soma}:{}),...(finishedAt?{finishedAt}:{}),...(restored?{restored:true}:{})}));
  // AUD-0009 (12/08/2026): a lista PERDE itens por dois caminhos — a troca em modo single e o
  // "substituir" do conflito —, e a URL de objeto da prévia deles ficava viva até o desmonte. O
  // navegador segura o blob inteiro nesse tempo, então trocar a mesma foto dez vezes acumulava dez
  // imagens em memória com uma na tela.
  // Revogado AQUI, num lugar só, porque `emit` é por onde toda substituição passa. Corrigir em
  // cada chamador é exatamente o que a regra "quem MAIS tem esse problema?" existe para impedir —
  // e por isso o `remove` deixou de revogar por conta própria: ele passa por aqui.
  const emit=(next:FileEntry[])=>{
    const idsNovos=new Set(next.map(e=>e.id));
    for(const e of filesRef.current)if(e.preview&&!idsNovos.has(e.id)){URL.revokeObjectURL(e.preview);previas.current.delete(e.preview)}
    filesRef.current=next;setFiles(next);onFilesChange?.(next.flatMap(f=>f.file?[f.file]:[]));onQueueChange?.(paraFila(next));
  };
  const patch=(fid:string,p:Partial<FileEntry>)=>setFiles(prev=>{const next=prev.map(e=>e.id===fid?{...e,...p}:e);filesRef.current=next;onQueueChange?.(paraFila(next));return next});
  const abortId=(fid:string)=>controllers.current.get(fid)?.abort();
  // Cada arquivo envia por conta própria (promessa independente + catch por arquivo):
  // erro ou cancelamento de um não derruba a fila. Cancelar = abort() no controller;
  // no catch, signal.aborted distingue "cancelado" de "falhou" seja qual for o erro
  // que o consumidor lançou. patch é setState funcional → seguro sob closures velhas.
  // G2: pausar HTTP não é pausar — é abortar. Então `pausando` marca a INTENÇÃO antes
  // do abort, e o catch a lê para separar "pausei" de "cancelei": os dois chegam como
  // `signal.aborted`, e tratá-los igual perderia o progresso e o direito de retomar.
  const pausando=React.useRef<Set<string>>(new Set());
  const startUpload=(fid:string,file:File,resumeFrom=0)=>{
    if(!upload)return;
    const c=new AbortController();
    controllers.current.set(fid,c);
    patch(fid,{status:"uploading",progress:resumeFrom});
    (async()=>{
      try{
        const devolvido=await upload(file,{signal:c.signal,resumeFrom,onProgress:f=>patch(fid,{progress:Math.max(0,Math.min(1,f))})});
        // G4: conferir é comparar. Se o servidor devolveu uma soma e ela difere da
        // nossa, o arquivo que chegou lá NÃO é o que saiu daqui — e isso é erro, não
        // detalhe. Sem soma devolvida não há o que conferir, e o envio segue válido.
        const local=await(somas.current.get(fid)??Promise.resolve(filesRef.current.find(e=>e.id===fid)?.checksum));
        const doServidor=devolvido&&typeof devolvido==="object"?devolvido.checksum:undefined;
        if(doServidor&&local&&doServidor.toLowerCase()!==local.toLowerCase()){
          patch(fid,{status:"error",erro:s.uploadChecksumBad,finishedAt:agora()});setAnnounce(`${s.uploadChecksumBad}: ${file.name}`);return;
        }
        patch(fid,{status:"done",progress:1,finishedAt:agora()});setAnnounce(`${s.uploadComplete}: ${file.name}`);
      }catch{
        const foiPausa=pausando.current.delete(fid);
        const st:UploadStatus=foiPausa?"paused":c.signal.aborted?"canceled":"error";
        patch(fid,{status:st,...(st==="paused"?{}:{finishedAt:agora()})});
        setAnnounce(`${st==="paused"?s.uploadPaused:st==="canceled"?s.uploadCanceled:s.uploadError}: ${file.name}`);
      }finally{controllers.current.delete(fid)}
    })();
  };
  const add=(list:FileList|null)=>{
    if(!list||!list.length)return;
    const ok:FileEntry[]=[],bad:FileRejection[]=[],novosConflitos:Array<{file:File;existente:string}>=[];
    for(const file of Array.from(list)){
      const reason=!matchesAccept(file,accept)?s.fileWrongType:(maxSize!=null&&file.size>maxSize)?s.fileTooLarge:null;
      if(reason){bad.push({file,reason});continue}
      const jaTem=multiple?files.find(e=>e.name===file.name):undefined;
      if(jaTem){novosConflitos.push({file,existente:jaTem.id});continue}
      ok.push({id:novoId(),file,name:file.name,bytes:file.size,status:"pending",progress:0});
    }
    if(novosConflitos.length)setConflitos(c=>[...c,...novosConflitos]);
    // multiple acumula; single substitui (input nativo já entrega 1 arquivo).
    // só emite se algo passou — drop 100% rejeitado não mexe na lista atual.
    const added=multiple?ok:ok.slice(-1);
    if(added.length){
      if(!multiple)files.forEach(f=>abortId(f.id)); // single troca o arquivo: aborta o envio anterior
      emit(multiple?[...files,...added]:added);
      if(preview)added.forEach(e=>{if(e.file&&ehImagem(e.file)){const u=URL.createObjectURL(e.file);previas.current.add(u);patch(e.id,{preview:u})}});
      if(checksum)added.forEach(e=>{if(e.file)somas.current.set(e.id,somaSha256(e.file).then(h=>{if(h)patch(e.id,{checksum:h});return h}))});
      added.forEach(e=>startUpload(e.id,e.file!));
    }
    setRejected(bad);
    setAnnounce([ok.length&&`${s.fileAdded}: ${ok.map(f=>f.name).join(", ")}`,...bad.map(b=>`${b.reason}: ${b.file.name}`)].filter(Boolean).join(". "));
  };
  // G2: pausar é abortar com intenção declarada; retomar é chamar de novo, passando
  // o quanto já subiu. Por ITEM e no CONJUNTO — e o conjunto é só o laço, porque a
  // regra tem de ser a mesma nos dois: senão "pausar tudo" e "pausar cada um" acabam
  // em estados diferentes, que é o defeito clássico deste tipo de barra.
  const pausar=(fid:string)=>{pausando.current.add(fid);abortId(fid)};
  const retomar=(e:FileEntry)=>{if(e.file)startUpload(e.id,e.file,e.progress)};
  const pausarTudo=()=>files.filter(f=>f.status==="uploading").forEach(f=>pausar(f.id));
  const retomarTudo=()=>files.filter(f=>f.status==="paused").forEach(retomar);
  const enviando=files.some(f=>f.status==="uploading"),pausados=files.some(f=>f.status==="paused");
  // As três saídas do conflito, e nenhuma é silenciosa. "Manter os dois" não renomeia
  // nada: os ids é que distinguem, e inventar "arquivo (1).txt" seria decidir pelo
  // consumidor um nome que o servidor dele talvez não aceite.
  // A lista base vem por ARGUMENTO, não da closure: em "substituir" o item removido
  // ainda está em `files` quando esta função roda — o React não re-renderizou — e ler
  // a closure deixava os DOIS na fila. Foi o teste que achou.
  const aceitarConflito=(file:File,base:FileEntry[]=files)=>{
    const e:FileEntry={id:novoId(),file,name:file.name,bytes:file.size,status:"pending",progress:0};
    emit([...base,e]);
    if(preview&&ehImagem(file)){const u=URL.createObjectURL(file);previas.current.add(u);patch(e.id,{preview:u})}
    if(checksum)somas.current.set(e.id,somaSha256(file).then(h=>{if(h)patch(e.id,{checksum:h});return h}));
    startUpload(e.id,file);
  };
  const resolverConflito=(i:number,escolha:"replace"|"both"|"skip")=>{
    const c=conflitos[i];
    setConflitos(l=>l.filter((_,n)=>n!==i));
    if(escolha==="skip")return;
    if(escolha==="replace"){abortId(c.existente);aceitarConflito(c.file,files.filter(x=>x.id!==c.existente));return}
    aceitarConflito(c.file);
  };
  // a revogação da prévia saiu daqui: quem revoga é o `emit`, para todo item que a lista perder.
  // Duplicar a regra em cada chamador é como o AUD-0009 nasceu — o `remove` revogava e os outros
  // dois caminhos de substituição, não.
  const remove=(rid:string)=>{const f=files.find(x=>x.id===rid);abortId(rid);emit(files.filter(x=>x.id!==rid));setAnnounce(f?`${s.fileRemoved}: ${f.name}`:"")};
  // G6: "terminou" é não haver mais nada em voo nem esperando — pausado conta como em
  // voo, porque a pessoa ainda vai retomar.
  const emVoo=files.some(f=>f.status==="uploading"||f.status==="paused"||f.status==="pending");
  const recibo=files.filter(f=>f.status==="done"||f.status==="error"||f.status==="canceled");
  const reciboTexto=recibo.map(r=>[r.name,r.status,r.finishedAt??""].join(TAB)).join(NL);
  return <div className={cx("field",className)}>
    {label&&<label className="label" htmlFor={inputId}>{label}</label>}
    <label className="dropzone" data-dragging={dragging||undefined}
      onDragOver={e=>{e.preventDefault();setDragging(true)}}
      onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setDragging(false)}}
      onDrop={e=>{e.preventDefault();setDragging(false);add(e.dataTransfer.files)}}>
      {/* input dentro do label: associação implícita + :focus-within acende o
          anel na zona visível (o input real fica sr-only mas focável). */}
      {/* G-STATE-02 — a REJEIÇÃO é o inválido deste campo, e até 28/08/2026 ela só existia como
          texto solto embaixo: o componente sabia que o arquivo tinha sido recusado e não marcava
          o campo. `aria-invalid` faz a zona ficar vermelha (a regra mora no bloco INVÁLIDO do
          core, que reage ao `.dropzone:has([aria-invalid])`) e diz ao leitor de tela que o valor
          é inválido; `aria-describedby` liga o motivo, que é o mesmo idioma do `Field` — ali o
          erro também descreve em vez de virar parte do nome. */}
      <input id={inputId} type="file" className="sr-only" accept={accept} multiple={multiple}
        aria-invalid={rejected.length>0||undefined}
        aria-describedby={rejected.length>0?rejected.map((_,n)=>`${inputId}-rejeitado-${n}`).join(" "):undefined}
        onChange={e=>{add(e.target.files);e.target.value=""}}/>
      <Icon name="cloud--upload" size="xl" className="dropzone-icon"/>
      <strong>{s.fileDropPrompt}</strong>
      {hint&&<span className="dropzone-hint">{hint}</span>}
    </label>
    {upload&&(enviando||pausados)&&<div className="file-queue-actions">
      {enviando?<Button variant="secondary" size="sm" leadingIcon="pause" onClick={pausarTudo}>{s.uploadPause}</Button>
        :<Button variant="secondary" size="sm" leadingIcon="play" onClick={retomarTudo}>{s.uploadResume}</Button>}
    </div>}
    {files.length>0&&<ul className="file-list">
      {files.map(({id,file,name,bytes,status,progress=0,restored,checksum:soma,preview:previa,erro})=>{
        // A barra reusa .progress + .file-progress (largura fixa em classe); só o
        // preenchimento (width %) fica inline, por ser data-driven. Erro reusa
        // .field-error. Como .file-progress não é usada nos docs, adicioná-la ao core
        // não muda pixel de screenshot nenhum (auditoria 18/07, M14: CSS não usado
        // pelos docs não altera baseline — a justificativa antiga estava invertida).
        const pct=Math.round(progress*100);
        return <li key={id} className="file-item">
          {/* G3: a prévia entra NO LUGAR do ícone, no mesmo espaço — a linha não muda
              de altura por causa dela. `alt` vazio porque o nome do arquivo está ao
              lado: descrever a imagem duas vezes só atrapalha quem ouve. */}
          {previa?<img className="file-thumb" src={previa} alt=""/>:<Icon name="document"/>}
          <span className="file-name">{name}</span>
          {status==="uploading"?<>
            {/* progressbar APG: valor conta pelo leitor; o cancelar aborta a requisição. */}
            <div className="progress file-progress" role="progressbar" aria-label={`${s.uploadSending} ${name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{width:`${pct}%`}}/></div>
            <IconButton variant="ghost" size="sm" icon="pause" label={`${s.uploadPause} ${name}`} onClick={()=>pausar(id)}/>
            <IconButton variant="ghost" size="sm" icon="close" label={`${s.uploadCancel} ${name}`} onClick={()=>abortId(id)}/>
          </>:status==="paused"?<>
            <span className="file-size">{s.uploadPaused} · {Math.round(progress*100)}%</span>
            <IconButton variant="ghost" size="sm" icon="play" label={`${s.uploadResume} ${name}`} onClick={()=>retomar({id,file,name,bytes,status,progress,restored})}/>
            <IconButton variant="ghost" size="sm" icon="close" label={`${s.fileRemove} ${name}`} onClick={()=>remove(id)}/>
          </>:(status==="error"||status==="canceled")?<>
            <span className="field-error">{erro??(status==="error"?s.uploadError:s.uploadCanceled)}</span>
            {/* item restaurado não tem os bytes: oferecer "repetir" seria oferecer um
                botão que falha. Some, e a ficha diz por quê. */}
            {file&&<IconButton variant="ghost" size="sm" icon="restart" label={`${s.uploadRetry} ${name}`} onClick={()=>startUpload(id,file)}/>}
            <IconButton variant="ghost" size="sm" icon="close" label={`${s.fileRemove} ${name}`} onClick={()=>remove(id)}/>
          </>:<>
            {status==="done"&&<Icon name="checkmark--filled"/>}
            <span className="file-size">{formatSize(bytes)}</span>
            {/* G4: os 8 primeiros dígitos bastam para conferir de olho; o valor
                inteiro sai na fila, para quem precisa comparar de verdade. */}
            {soma&&<span className="file-checksum" title={`${s.uploadChecksum}: ${soma}`}>{soma.slice(0,8)}</span>}
            {/* ponytail: remover leva o foco ao body; aceitável p/ UI de entrada, o
                aria-live anuncia a remoção. */}
            <IconButton variant="ghost" size="sm" icon="close" label={`${s.fileRemove} ${name}`} onClick={()=>remove(id)}/>
          </>}
        </li>;
      })}
    </ul>}
    {conflitos.map((c,i)=><div key={`c${i}`} className="file-conflict" role="alert">
      <span>{s.fileConflict}: <strong>{c.file.name}</strong></span>
      <Button size="sm" variant="secondary" onClick={()=>resolverConflito(i,"replace")}>{s.fileReplace}</Button>
      <Button size="sm" variant="secondary" onClick={()=>resolverConflito(i,"both")}>{s.fileKeepBoth}</Button>
      <Button size="sm" variant="ghost" onClick={()=>resolverConflito(i,"skip")}>{s.fileSkip}</Button>
    </div>)}
    {/* G6: o recibo só aparece quando NÃO HÁ MAIS NADA em voo — recibo de fila que
        ainda anda é mentira. Copiar é texto puro, porque o destino é um chamado, um
        e-mail ou um bloco de notas, e nenhum dos três lê a nossa marcação. */}
    {recibo.length>0&&!emVoo&&<div className="file-receipt">
      <div className="file-receipt-head">
        <strong>{s.uploadReceipt}</strong>
        <Button size="sm" variant="ghost" leadingIcon="copy" onClick={()=>void navigator.clipboard?.writeText(reciboTexto)}>{s.uploadReceiptCopy}</Button>
      </div>
      <ul>{recibo.map(r=><li key={r.id}>{r.name} · {r.status==="done"?s.uploadComplete:r.status==="canceled"?s.uploadCanceled:s.uploadError}{r.finishedAt?` · ${r.finishedAt}`:""}</li>)}</ul>
    </div>}
    {rejected.map((r,n)=><span key={n} id={`${inputId}-rejeitado-${n}`} className="field-error">{r.reason}: {r.file.name}</span>)}
    <span className="sr-only" role="status" aria-live="polite">{announce}</span>
  </div>;
}
