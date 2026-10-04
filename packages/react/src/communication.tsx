"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type ReactNode} from "react";
import {cx, useAureaStrings} from "./internal.js";
import {InputGroup, InputGroupAddon} from "./inputs.js";
import {Icon, type IconName} from "./system.js";
import {IconButton} from "./actions.js";
import {Avatar} from "./identity.js";
import {Badge, Spinner, type BadgeVariant} from "./feedback.js";
import {formatSize, matchesAccept} from "./file-input.js";
// A AN-02 põe álbum na mensagem com a `Gallery` que já existe. `media` mora no "resto" do DAG,
// como este módulo, e não importa `communication` — não há ciclo.
import {Gallery} from "./media.js";


// Chat/colaboração (Fase 5 etapa 4): primitives que só COMPÕEM o que já existe —
// .message/.message-bubble + Avatar + Badge + .status-dot no log, .input-group +
// .input no composer. Presentational: transporte e estado (mensagens, envio) são
// do consumidor, mesma linha do NotificationCenter. Sem CSS novo (só estilo inline
// no elemento, precedente das etapas 1-3) e sem dependência nova.
// A11y do log de conversa (pesquisado 07/2026: W3C ARIA23 + MDN "log role"): o
// container das mensagens É a live region — role="log" aria-live="polite". O role
// já implica polite, mas o aria-live vai explícito por robustez entre leitores
// (idioma do LogStream). Isto DIFERE do NotificationCenter, cujo painel NÃO é live
// region e usa um anunciador à parte: um chat se lê na ordem em que chega; um feed
// de notificações se revisita no próprio ritmo. Mensagens novas (mutações após a
// montagem) são anunciadas nativamente — sem o diff manual do feed; a lista inicial
// não dispara, pois a região só anuncia o que muda DEPOIS de existir no DOM.
//
// AN-02 (Lote H, 04/10/2026) — A CONVERSA LONGA, só acrescentando. Um consumidor mostra conversas
// com centenas de milhares de mensagens. O HeroUI 3.2.6 não tem conversa; a anatomia é a do ReUI
// (`Message` com `align`, `Bubble`, `Attachment`, `message-scroller`), com nomes da casa:
//   • `direction` ("incoming" | "outgoing"): a minha vai para o fim da linha, sem avatar, com o
//     canto pequeno do lado dela e o fundo tingido da marca (o mesmo tom do nó escolhido do
//     `TreeView`). Quem declara o lado também ganha a folga do lado oposto, do tamanho do avatar.
//   • `forwardedFrom`, `replyTo` (a citação do `MessageComposer`, `.message-quote`), `attachments`
//     (foto e vídeo viram ÁLBUM na `Gallery`, com ampliar; arquivo vira a linha do `FileInput`) e
//     `edited` ("editada" ao lado da hora).
//   • `day`: quando muda de uma mensagem para a seguinte, entra o separador com o texto dela. O
//     texto é do app (ele sabe dizer "Hoje" na língua dele).
//   • A JANELA DESLIZANTE (decisão do Victor, 04/10/2026: nossa, sem biblioteca de virtualização).
//     Medido no Chromium: mil mensagens na tela abrem em 0,3 s; 50 mil, em 10,7 s, com a rolagem
//     travando. Então o app guarda um pedaço (umas mil) e troca pelas pontas: `hasMoreBefore` +
//     `onReachStart` em cima, `hasMoreAfter` + `onReachEnd` embaixo, com `loadingBefore` e
//     `loadingAfter`. A linha de cada ponta é a do `Table.LoadMore` do HeroUI, como na `Gallery`.
//     O que é nosso é NÃO PULAR: a mensagem que estava no alto da tela continua no mesmo lugar
//     quando entram antigas em cima ou saem recentes embaixo — guarda-se a posição dela a cada
//     rolagem e, depois da troca, rola-se a diferença. Quem está no fim acompanha a que chega.
//     Com a janela ligada, a lista abre no fim, como toda conversa.
//     E o LEITOR DE TELA: `role="log"` anuncia tudo o que entra, inclusive as cinquenta antigas
//     carregadas em cima. Com a janela, a lista deixa de ser região viva (`aria-live="off"`), e
//     um anunciador à parte lê só a mensagem que CHEGA no fim — o idioma do `NotificationCenter`.
// Sem as props novas, nada muda: a lista não rola nada e continua anunciando como antes.
export type ChatDirection="incoming"|"outgoing";
export interface MessageAttachment{id:string;kind:"image"|"video"|"file";src?:string;alt?:string;name?:string;bytes?:number;duration?:number;href?:string}
export interface ChatMessage{id:string;body:ReactNode;author?:ReactNode;time?:ReactNode;avatar?:{src?:string;fallback?:ReactNode};status?:{label:ReactNode;variant?:BadgeVariant};direction?:ChatDirection;attachments?:MessageAttachment[];replyTo?:{id:string;author?:ReactNode;body:ReactNode};forwardedFrom?:ReactNode;edited?:boolean;day?:string}
export interface MessageListProps{messages:ChatMessage[];label?:string;className?:string;hasMoreBefore?:boolean;hasMoreAfter?:boolean;loadingBefore?:boolean;loadingAfter?:boolean;onReachStart?:()=>void;onReachEnd?:()=>void;onOpenAttachment?:(message:ChatMessage,attachment:MessageAttachment)=>void}
// O contêiner que rola é o ancestral com `overflow` de rolagem, ou a página.
function rolador(el:HTMLElement):HTMLElement{
  for(let p=el.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowY;if(o==="auto"||o==="scroll"||o==="overlay")return p}
  return (document.scrollingElement as HTMLElement|null)??document.documentElement;
}
const ehPagina=(sc:HTMLElement)=>sc===document.scrollingElement||sc===document.documentElement;
function useVigia(alvo:React.RefObject<HTMLDivElement|null>,ligado:boolean,avisar:(()=>void)|undefined,deps:unknown[]){
  const cb=React.useRef(avisar);
  cb.current=avisar;
  React.useEffect(()=>{
    const el=alvo.current;
    if(!el||!ligado||typeof IntersectionObserver==="undefined")return;
    const sc=rolador(el);
    const obs=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))cb.current?.()},{root:ehPagina(sc)?null:sc});
    obs.observe(el);
    return ()=>obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ligado,...deps]);
}
export function MessageList({messages,label,className,hasMoreBefore,hasMoreAfter,loadingBefore,loadingAfter,onReachStart,onReachEnd,onOpenAttachment}:MessageListProps){
  const s=useAureaStrings();
  const janela=!!onReachStart||!!onReachEnd;
  const raiz=React.useRef<HTMLDivElement>(null);
  const topo=React.useRef<HTMLDivElement>(null);
  const fim=React.useRef<HTMLDivElement>(null);
  const ancora=React.useRef<{id:string;top:number}|null>(null);
  const noFim=React.useRef(true);
  const ultimoAntes=React.useRef<string|undefined>(undefined);
  const montou=React.useRef(false);
  const [anuncio,setAnuncio]=React.useState("");
  const hasMoreAfterRef=React.useRef(hasMoreAfter);
  hasMoreAfterRef.current=hasMoreAfter;
  // A posição de quem está no alto da tela, e se a última está à vista. Lida a cada rolagem e
  // depois de cada troca: entre uma troca e outra, só a rolagem move as mensagens.
  const medir=React.useCallback(()=>{
    const el=raiz.current;if(!el)return;
    const sc=rolador(el),pag=ehPagina(sc);
    const alto=pag?0:sc.getBoundingClientRect().top,baixo=pag?window.innerHeight:sc.getBoundingClientRect().bottom;
    const itens=el.querySelectorAll<HTMLElement>("[data-message-id]");
    // A âncora é a primeira que COMEÇA dentro da tela, e não a primeira que aparece: medido no banco
    // em 04/10/2026, um álbum cortado no alto cresceu 480 px quando as fotos chegaram — para baixo
    // dele —, o topo dele não andou, e a conversa inteira desceu sem a conta perceber. Se nenhuma
    // começa na tela (uma mensagem maior que ela), vale a que está à vista.
    ancora.current=null;
    let vista:HTMLElement|undefined;
    for(const it of Array.from(itens)){const r=it.getBoundingClientRect();if(r.bottom<=alto)continue;vista??=it;if(r.top>=alto){ancora.current={id:it.dataset.messageId!,top:r.top};break}}
    if(!ancora.current&&vista)ancora.current={id:vista.dataset.messageId!,top:vista.getBoundingClientRect().top};
    const ultimo=itens[itens.length-1];
    noFim.current=!ultimo||ultimo.getBoundingClientRect().bottom<=baixo+1;
  },[]);
  React.useEffect(()=>{
    if(!janela||!raiz.current)return;
    const sc=rolador(raiz.current),alvo:HTMLElement|Window=ehPagina(sc)?window:sc;
    alvo.addEventListener("scroll",medir,{passive:true});
    return ()=>alvo.removeEventListener("scroll",medir);
  },[janela,medir]);
  const ultimoId=messages[messages.length-1]?.id;
  React.useLayoutEffect(()=>{
    const el=raiz.current;
    if(!janela||!el){ultimoAntes.current=ultimoId;return}
    const sc=rolador(el);
    const irAoFim=()=>{sc.scrollTop=sc.scrollHeight};
    const antes=ultimoAntes.current;
    // Chegou mensagem no fim: a última de antes continua na lista, e não é mais a última.
    const ia=antes===undefined?-1:messages.findIndex(m=>m.id===antes);
    const chegou=montou.current&&ia>=0&&ia<messages.length-1;
    if(!montou.current){irAoFim();montou.current=true}
    else if(chegou&&noFim.current&&!hasMoreAfter)irAoFim();
    else if(ancora.current){
      const it=el.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(ancora.current.id)}"]`);
      if(it)sc.scrollTop+=it.getBoundingClientRect().top-ancora.current.top;
    }
    if(chegou){const novo=el.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(ultimoId!)}"]`);setAnuncio(novo?.textContent??"")}
    ultimoAntes.current=ultimoId;
    medir();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[messages]);
  // A ALTURA MUDA DEPOIS DE MONTAR — a fonte chega, a foto decodifica, o app troca um texto — e
  // nenhuma rolagem acontece para avisar. Medido no banco em 04/10/2026: a conversa abria na #4992
  // e não na última. Então se observa o tamanho da lista: quem estava no fim continua no fim; quem
  // não estava mantém a mensagem do alto onde ela estava.
  React.useEffect(()=>{
    const el=raiz.current;
    if(!janela||!el||typeof ResizeObserver==="undefined")return;
    const ro=new ResizeObserver(()=>{
      const sc=rolador(el);
      if(noFim.current&&!hasMoreAfterRef.current)sc.scrollTop=sc.scrollHeight;
      else if(ancora.current){const it=el.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(ancora.current.id)}"]`);if(it)sc.scrollTop+=it.getBoundingClientRect().top-ancora.current.top}
      medir();
    });
    ro.observe(el);
    return ()=>ro.disconnect();
  },[janela,medir]);
  useVigia(topo,janela&&!!hasMoreBefore&&!loadingBefore,onReachStart,[messages.length]);
  useVigia(fim,janela&&!!hasMoreAfter&&!loadingAfter,onReachEnd,[messages.length]);
  return <>
    <div ref={raiz} className={cx("stack",className)} role="log" aria-live={janela?"off":"polite"} aria-busy={(janela&&(loadingBefore||loadingAfter))||undefined} aria-label={label??s.chatLabel}>
      {janela&&hasMoreBefore&&<div ref={topo} className="message-more">{loadingBefore&&<Spinner/>}</div>}
      {messages.map((m,i)=>{
        const lado=m.direction;
        const midia=(m.attachments??[]).filter(a=>a.kind!=="file"&&a.src);
        const arquivos=(m.attachments??[]).filter(a=>a.kind==="file");
        const dia=m.day!=null&&m.day!==messages[i-1]?.day;
        return <React.Fragment key={m.id}>
          {dia&&<div className="message-day"><Badge>{m.day}</Badge></div>}
          <div className={cx("message",lado==="outgoing"&&"message-out",lado==="incoming"&&"message-in")} data-message-id={m.id}>
            {lado==="outgoing"?null:m.avatar?<Avatar src={m.avatar.src} fallback={m.avatar.fallback}/>:<span/>}
            <div className="message-bubble">
              {(m.author||m.time||m.edited)&&<div className="label"><span>{m.author}</span>{(m.time||m.edited)&&<span className="hint">{m.edited&&<>{s.chatEdited}{m.time!=null&&" · "}</>}{m.time}</span>}</div>}
              {m.forwardedFrom!=null&&<div className="message-forwarded"><Icon name="share-fat" size="sm"/><span>{s.chatForwardedFrom} {m.forwardedFrom}</span></div>}
              {m.replyTo&&<div className="message-quote"><span className="message-quote-text"><span className="message-quote-title">{m.replyTo.author}</span><span className="message-quote-body">{m.replyTo.body}</span></span></div>}
              {midia.length>0&&<Gallery className="message-album" label={s.chatAttachments} zoom={!onOpenAttachment} ratio={midia.length===1?"4/3":"1/1"}
                items={midia.map(a=>({id:a.id,src:a.src!,alt:a.alt??a.name??"",kind:a.kind==="video"?"video" as const:"image" as const,duration:a.duration}))}
                onSelect={onOpenAttachment?(id=>{const a=midia.find(x=>x.id===id);if(a)onOpenAttachment(m,a)}):undefined}/>}
              {arquivos.length>0&&<ul className="file-list" aria-label={s.chatAttachments}>{arquivos.map(a=><li key={a.id} className="file-item">
                <Icon name="file-text"/>
                {a.href?<a className="file-name" href={a.href} download={a.name??true}>{a.name??a.href}</a>:<span className="file-name">{a.name}</span>}
                {a.bytes!=null&&<span className="file-size">{formatSize(a.bytes)}</span>}
              </li>)}</ul>}
              {m.body}
              {m.status&&<div className="message-status"><Badge variant={m.status.variant}><i className="status-dot"/>{m.status.label}</Badge></div>}
            </div>
          </div>
        </React.Fragment>;
      })}
      {janela&&hasMoreAfter&&<div ref={fim} className="message-more">{loadingAfter&&<Spinner/>}</div>}
    </div>
    {janela&&<span className="sr-only" role="status" aria-live="polite">{anuncio}</span>}
  </>;
}
// Composer: <form> sobre InputGroup + .input; Enter envia (submit nativo) e limpa.
// Texto é estado interno (não controlado — controlar de fora só com demanda real,
// precedente MediaPlayer/FileInput). Não envia texto vazio/só-espaço; o botão de
// envio desabilita enquanto vazio. O input sempre tem nome acessível (aria-label),
// pois placeholder não serve de nome. ponytail: input de uma linha; textarea +
// Shift+Enter quando surgir demanda de multilinha.
//
// AN-03 (Lote H, 04/10/2026) — ANEXAR, RESPONDER E EDITAR, só acrescentando. O HeroUI 3.2.6 não
// tem compositor; o ReUI (`c-attachment-2`) põe a bandeja de anexos num adorno EM BLOCO acima do
// campo, que só existe quando tem conteúdo, e anuncia cada remoção numa região viva. A Aurea já
// tinha o adorno em bloco (`side="start"` + `layout="block"`, G-AXIS-01); a faixa entra nele.
//   • ANEXAR (`attach`) reaproveita o `FileInput` por dentro, e não a zona grande de soltar, que não
//     cabe numa conversa: o mesmo filtro (`matchesAccept` + `maxSize`), as mesmas mensagens de
//     recusa e de aviso, o mesmo tamanho (`formatSize`) e a mesma linha de arquivo (`.file-item`,
//     com a miniatura `.file-thumb` para imagem). O clipe fica dentro do campo, no fim. O envio é do
//     app: os arquivos saem no segundo argumento do `onSend` (que só existe quando uma prop nova está
//     em uso). Com anexo, texto vazio pode ir.
//   • RESPONDER (`replyTo`) mostra de quem e o começo da mensagem, com o X de cancelar; EDITAR
//     (`editing`) põe o texto antigo no campo e troca o enviar por salvar. Os dois são do app (ele
//     diz quando começam e acaba com eles), e Esc no campo cancela, como nos apps de conversa.
//     Editando, não se anexa.
// A faixa é `<div>` com as classes do adorno em bloco, e não `InputGroupAddon`: o adorno é `<span>`,
// e lista dentro de `<span>` é HTML inválido. O `InputGroup` deixa no meio, na ordem escrita, o que
// não é adorno — então ela cai antes do campo.
export interface ComposerReply{id:string;author?:ReactNode;body:ReactNode}
export interface ComposerEdit{id:string;body:string}
export interface ComposerAttach{accept?:string;maxSize?:number;multiple?:boolean}
export interface MessageSendDetails{files:File[];replyToId?:string;editingId?:string}
type Anexo={id:string;file:File;url?:string};
export function MessageComposer({onSend,placeholder,label,icon,sendLabel,disabled,className,attach,replyTo,onCancelReply,editing,onCancelEdit}:{onSend:(text:string,details?:MessageSendDetails)=>void;placeholder?:string;label?:string;icon?:IconName;sendLabel?:string;disabled?:boolean;className?:string;attach?:boolean|ComposerAttach;replyTo?:ComposerReply|null;onCancelReply?:()=>void;editing?:ComposerEdit|null;onCancelEdit?:()=>void}){
  const s=useAureaStrings();
  const [text,setText]=React.useState("");
  const [anexos,setAnexos]=React.useState<Anexo[]>([]);
  const [recusados,setRecusados]=React.useState<Array<{name:string;reason:string}>>([]);
  const [aviso,setAviso]=React.useState("");
  const campo=React.useRef<HTMLInputElement>(null);
  const seletor=React.useRef<HTMLInputElement>(null);
  const seq=React.useRef(0);
  const opcoes:ComposerAttach|undefined=attach===true?{}:attach||undefined;
  const editandoId=editing?.id;
  const respondendoId=replyTo?.id;
  // O texto antigo entra quando a edição COMEÇA (muda o id), e sai quando ela acaba — sem isso o
  // texto da mensagem editada ficava no campo como rascunho de mensagem nova.
  const editouAntes=React.useRef<string|undefined>(undefined);
  React.useEffect(()=>{
    if(editandoId!==undefined){setText(editing?.body??"");campo.current?.focus()}
    else if(editouAntes.current!==undefined)setText("");
    editouAntes.current=editandoId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[editandoId]);
  React.useEffect(()=>{if(respondendoId!==undefined)campo.current?.focus()},[respondendoId]);
  // As URLs das miniaturas vivem enquanto o anexo vive; desmontar solta todas (o FileInput faz igual).
  const anexosRef=React.useRef(anexos);
  anexosRef.current=anexos;
  React.useEffect(()=>()=>anexosRef.current.forEach(a=>a.url&&URL.revokeObjectURL(a.url)),[]);
  const soltar=(lista:Anexo[])=>lista.forEach(a=>a.url&&URL.revokeObjectURL(a.url));
  const escolher=(lista:FileList|null)=>{
    if(!lista)return;
    const novos:Anexo[]=[],fora:Array<{name:string;reason:string}>=[];
    for(const file of Array.from(lista)){
      if(!matchesAccept(file,opcoes?.accept))fora.push({name:file.name,reason:s.fileWrongType});
      else if(opcoes?.maxSize!=null&&file.size>opcoes.maxSize)fora.push({name:file.name,reason:s.fileTooLarge});
      else novos.push({id:`a${seq.current++}`,file,url:file.type.startsWith("image/")&&typeof URL.createObjectURL==="function"?URL.createObjectURL(file):undefined});
    }
    setRecusados(fora);
    if(novos.length){
      if(opcoes?.multiple===false){soltar(anexos);setAnexos(novos.slice(0,1))}else setAnexos(prev=>[...prev,...novos]);
      setAviso(`${s.fileAdded}: ${novos.map(a=>a.file.name).join(", ")}`);
    }
    if(seletor.current)seletor.current.value="";
  };
  const remover=(a:Anexo)=>{soltar([a]);setAnexos(prev=>prev.filter(x=>x.id!==a.id));setAviso(`${s.fileRemoved}: ${a.file.name}`);campo.current?.focus()};
  const podeAnexar=!!opcoes&&editandoId===undefined;
  const vazio=!text.trim()&&!(podeAnexar&&anexos.length);
  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    if(vazio)return;
    const t=text.trim();
    // O segundo argumento só vai quando o app usa uma prop nova: quem chamava `onSend(texto)` e
    // conferia a chamada exata continua recebendo exatamente isso.
    if(!opcoes&&replyTo==null&&editing==null)onSend(t);
    else onSend(t,{files:podeAnexar?anexos.map(a=>a.file):[],replyToId:editandoId===undefined?respondendoId:undefined,editingId:editandoId});
    setText("");soltar(anexos);setAnexos([]);setRecusados([]);
  };
  const aoTeclar=(e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key!=="Escape")return;
    if(editandoId!==undefined&&onCancelEdit){e.preventDefault();onCancelEdit()}
    else if(respondendoId!==undefined&&onCancelReply){e.preventDefault();onCancelReply()}
  };
  const citacao=editing
    ?<div className="message-quote">
      <Icon name="pencil-simple" size="sm"/>
      <span className="message-quote-text"><span className="message-quote-title">{s.chatEditing}</span><span className="message-quote-body">{editing.body}</span></span>
      {onCancelEdit&&<IconButton variant="ghost" size="sm" icon="x" label={s.chatEditCancel} onClick={onCancelEdit}/>}
    </div>
    :replyTo
      ?<div className="message-quote">
        <Icon name="arrow-bend-up-left" size="sm"/>
        <span className="message-quote-text"><span className="message-quote-title">{s.chatReplyTo}{replyTo.author!=null&&<> {replyTo.author}</>}</span><span className="message-quote-body">{replyTo.body}</span></span>
        {onCancelReply&&<IconButton variant="ghost" size="sm" icon="x" label={s.chatReplyCancel} onClick={onCancelReply}/>}
      </div>
      :null;
  const temFaixa=!!citacao||(podeAnexar&&(anexos.length>0||recusados.length>0));
  return <form className={cx("message-composer",className)} onSubmit={submit}>
    {/* No `.input-wrap` o vão de 40px antes do texto era INCONDICIONAL, e o ícone aqui é
        opcional — então um composer sem ícone abria um buraco. Com o grupo não existe vão sem
        adorno, porque o adorno é um item de flex e não um glifo posicionado por cima. */}
    <InputGroup>
      {icon&&<InputGroupAddon><Icon name={icon}/></InputGroupAddon>}
      {temFaixa&&<div className="input-group-addon input-group-addon-start input-group-addon-block message-composer-context">
        {citacao}
        {podeAnexar&&anexos.length>0&&<ul className="file-list" aria-label={s.chatAttachments}>
          {anexos.map(a=><li key={a.id} className="file-item">
            {a.url?<img className="file-thumb" src={a.url} alt=""/>:<Icon name="file-text"/>}
            <span className="file-name">{a.file.name}</span>
            <span className="file-size">{formatSize(a.file.size)}</span>
            <IconButton variant="ghost" size="sm" icon="x" label={`${s.fileRemove} ${a.file.name}`} onClick={()=>remover(a)}/>
          </li>)}
        </ul>}
        {podeAnexar&&recusados.map((r,n)=><span key={n} className="field-error">{r.reason}: {r.name}</span>)}
      </div>}
      <input ref={campo} className="input" value={text} disabled={disabled} placeholder={placeholder} aria-label={label??s.chatMessage} onChange={e=>setText(e.target.value)} onKeyDown={aoTeclar}/>
      {podeAnexar&&<InputGroupAddon side="end"><IconButton variant="ghost" size="sm" icon="paperclip" label={s.chatAttach} disabled={disabled} onClick={()=>seletor.current?.click()}/></InputGroupAddon>}
    </InputGroup>
    {podeAnexar&&<input ref={seletor} type="file" hidden accept={opcoes?.accept} multiple={opcoes?.multiple!==false} onChange={e=>escolher(e.target.files)}/>}
    <IconButton type="submit" variant="primary" icon={editing?"check":"paper-plane-tilt"} label={editing?s.chatSave:(sendLabel??s.chatSend)} disabled={disabled||vazio}/>
    {podeAnexar&&<span className="sr-only" role="status" aria-live="polite">{aviso}</span>}
  </form>;
}
