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
import {Badge, type BadgeVariant} from "./feedback.js";


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
export interface ChatMessage{id:string;body:ReactNode;author?:ReactNode;time?:ReactNode;avatar?:{src?:string;fallback?:ReactNode};status?:{label:ReactNode;variant?:BadgeVariant}}
export function MessageList({messages,label,className}:{messages:ChatMessage[];label?:string;className?:string}){
  const s=useAureaStrings();
  return <div className={cx("stack",className)} role="log" aria-live="polite" aria-label={label??s.chatLabel}>
    {messages.map(m=><div className="message" key={m.id}>
      {m.avatar?<Avatar src={m.avatar.src} fallback={m.avatar.fallback}/>:<span/>}
      <div className="message-bubble">
        {(m.author||m.time)&&<div className="label"><span>{m.author}</span>{m.time&&<span className="hint">{m.time}</span>}</div>}
        {m.body}
        {m.status&&<div className="message-status"><Badge variant={m.status.variant}><i className="status-dot"/>{m.status.label}</Badge></div>}
      </div>
    </div>)}
  </div>;
}
// Composer: <form> sobre InputGroup + .input; Enter envia (submit nativo) e limpa.
// Texto é estado interno (não controlado — controlar de fora só com demanda real,
// precedente MediaPlayer/FileInput). Não envia texto vazio/só-espaço; o botão de
// envio desabilita enquanto vazio. O input sempre tem nome acessível (aria-label),
// pois placeholder não serve de nome. ponytail: input de uma linha; textarea +
// Shift+Enter quando surgir demanda de multilinha.
export function MessageComposer({onSend,placeholder,label,icon,sendLabel,disabled,className}:{onSend:(text:string)=>void;placeholder?:string;label?:string;icon?:IconName;sendLabel?:string;disabled?:boolean;className?:string}){
  const s=useAureaStrings();
  const [text,setText]=React.useState("");
  const submit=(e:React.FormEvent)=>{e.preventDefault();const t=text.trim();if(!t)return;onSend(t);setText("")};
  return <form className={cx("message-composer",className)} onSubmit={submit}>
    {/* No `.input-wrap` o vão de 40px antes do texto era INCONDICIONAL, e o ícone aqui é
        opcional — então um composer sem ícone abria um buraco. Com o grupo não existe vão sem
        adorno, porque o adorno é um item de flex e não um glifo posicionado por cima. */}
    <InputGroup>
      {icon&&<InputGroupAddon><Icon name={icon}/></InputGroupAddon>}
      <input className="input" value={text} disabled={disabled} placeholder={placeholder} aria-label={label??s.chatMessage} onChange={e=>setText(e.target.value)}/>
    </InputGroup>
    <IconButton type="submit" variant="primary" icon="send" label={sendLabel??s.chatSend} disabled={disabled||!text.trim()}/>
  </form>;
}
