"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type RefAttributes, type ReactNode, type ReactElement} from "react";
import {valorBase, peleDoEixo, soOValor, type Responsive} from "./pure.js";
import {Combobox as BaseCombobox} from "@base-ui/react/combobox";
import {Select as BaseSelect} from "@base-ui/react/select";
import {Form as BaseForm} from "@base-ui/react/form";
import {Field as BaseField} from "@base-ui/react/field";
import {NumberField as BaseNumberField} from "@base-ui/react/number-field";
import {OTPField as BaseOTPField} from "@base-ui/react/otp-field";
import {Slider as BaseSlider} from "@base-ui/react/slider";
import {RadioGroup as BaseRadioGroup} from "@base-ui/react/radio-group";
import {Radio as BaseRadio} from "@base-ui/react/radio";
import {useDirection} from "@base-ui/react/direction-provider";
import {cx, useAureaStrings, usePortalContainer, useReorder, controlesRotulaveis} from "./internal.js";
import {COLOR_CHANNELS, areaBackground, channelRange, colorName, corToHex, formatChannel, getChannel, hsbToRgb, parseColor, pureHue, setChannel, spaceOf, trackBackground, type ColorChannel, type ColorSpace, type Cor} from "./color.js";
import {Popover as BasePopover} from "@base-ui/react/popover";
// Os seis controles abaixo saíram deste arquivo no item O1 e moram no `markup.tsx`, sem a
// diretiva — são marcação, e quem escuta `onChange` é o consumidor. Voltam IMPORTADOS e não só
// reexportados porque o `ehControle` do `Field` compara por IDENTIDADE de referência: dois
// objetos diferentes com o mesmo nome quebrariam o rótulo do campo em silêncio.
import {Textarea, Checkbox, Radio, Switch, Range, InputGroup, InputGroupAddon, ColorSwatch, Kbd, type ColorSwatchOption, type FieldSize, type FieldVariant} from "./markup.js";
import {Icon, type IconName} from "./system.js";
import {IconButton} from "./actions.js";
// A FAMÍLIA DE COR (0.32.0, ADR-0069) — as peças INTERNAS moram aqui, no topo, antes do primeiro export (auxiliar
// entre exports entra na fatia de outro componente — regra do check 22). As públicas (`ColorArea`, `Slider` com
// `channel`, `ColorField`, `ColorPicker`) ficam com as irmãs delas, lá embaixo.
//
// A COR DE DENTRO é HSB com alfa (`Cor`, do `color.ts`), e não hex: o hex perde o matiz no cinza e no preto —
// puxar a saturação a 0 não pode trocar a cor do fundo da área. Os três espaços (RGB, HSL, HSB) e o alfa entram por
// ela, com as faixas de cada canal iguais às da biblioteca de acessibilidade em que a referência se apoia.
//
// A ÁREA (`AreaDeCor`) é o DESENHO acessível da referência, lido no código da biblioteca dela: um grupo com DOIS
// `input type="range"` escondidos, um por eixo, anunciados como controle 2D, e o valor dito com o NOME da cor. Só um
// dos dois fica na ordem do Tab (o do eixo que mexeu por último); o outro sai da árvore até a pessoa mexer nele pelo
// teclado. As teclas são as dela: setas (Shift: o salto do canal), Page Up/Down no eixo de cima, Home/End no de
// lado, invertidas na escrita da direita para a esquerda.
const no01=(n:number)=>Math.min(1,Math.max(0,n));
// COMO A PESSOA CHEGOU AQUI: a última interação foi teclado ou ponteiro? O anel de foco da área é só do teclado, e o
// foco que chega por código (a janela do `ColorPicker` o põe na área ao abrir; o arrasto o põe no `range`) não diz
// nada por si. É o jeito da biblioteca de acessibilidade em que a referência se apoia: ouvir o documento inteiro, uma
// vez, e lembrar a última modalidade. Medido em 13/10/2026: abrindo o seletor com o mouse, o anel acendia.
let modalidade:"teclado"|"ponteiro"="teclado";
let ouvindoModalidade=false;
function ouvirModalidade(){
  if(ouvindoModalidade||typeof document==="undefined")return;
  ouvindoModalidade=true;
  document.addEventListener("keydown",(e)=>{if(!e.metaKey&&!e.ctrlKey&&!e.altKey)modalidade="teclado";},true);
  document.addEventListener("pointerdown",()=>{modalidade="ponteiro";},true);
}

/** O texto de entrada → a cor de dentro. Hex e `rgb()` não dizem o matiz do cinza: aí vale o matiz (e a saturação)
 *  da cor de antes. `hsl()`/`hsb()` dizem, e o que veio no texto vale. */
function corDoTexto(texto:string|undefined,anterior?:Cor):Cor{
  const nova=texto?parseColor(texto):null;
  if(!nova)return anterior??{h:0,s:0,b:1,a:1};
  if(anterior&&(nova.s===0||nova.b===0)&&!/^\s*hs[lb]/i.test(texto!))return {...nova,h:anterior.h,s:nova.b===0?anterior.s:nova.s};
  return nova;
}

/** A cor que o `ColorPicker` reparte com as peças de dentro, quando o conteúdo da janela é montado por quem usa
 *  ("com campos", "com trilhas" — os exemplos da referência). */
const CorDoSeletor=React.createContext<{cor:Cor;mudar:(c:Cor,fim:boolean)=>void}|null>(null);

/** O estado de cor das peças: a cor de dentro por dentro, hex por fora. Controlado, se o hex que chega é o que a peça
 *  acabou de mandar, a cor de dentro vale (com o matiz); se é outro, vira cor guardando o matiz de antes no cinza.
 *  Dentro de um `ColorPicker`, a peça sem valor próprio usa a cor DELE. */
function useCor(value:string|undefined,defaultValue:string|undefined,onValueChange?:(v:string)=>void,onValueCommitted?:(v:string)=>void):[Cor,(novo:Cor,fim:boolean)=>void]{
  const doSeletor=React.useContext(CorDoSeletor);
  const [interno,setInterno]=React.useState<Cor>(()=>corDoTexto(defaultValue));
  const ultimo=React.useRef<Cor>(interno);
  let cor=interno;
  if(value!==undefined){
    const chegou=parseColor(value);
    const mesmo=chegou!==null&&corToHex(chegou)===corToHex(ultimo.current);
    cor=mesmo?ultimo.current:corDoTexto(value,ultimo.current);
  }
  ultimo.current=cor;
  const avisar=(novo:Cor,fim:boolean)=>{const h=corToHex(novo);onValueChange?.(h);if(fim)onValueCommitted?.(h);};
  if(doSeletor&&value===undefined&&defaultValue===undefined)return [doSeletor.cor,(novo,fim)=>{doSeletor.mudar(novo,fim);avisar(novo,fim);}];
  const mudar=(novo:Cor,fim:boolean)=>{
    ultimo.current=novo;
    // SEMPRE, e não só sem controle: no cinza o hex não muda com o matiz, o app devolve o MESMO valor e nada
    // redesenharia — a trilha mexia e a área não (o teste do `ColorPicker` pegou). Este estado é o que redesenha;
    // com controle, quem decide continua sendo o `value` (acima).
    setInterno(novo);
    avisar(novo,fim);
  };
  return [cor,mudar];
}

/** O espaço de uma peça de cor: o pedido, ou o que os canais exigem (vermelho/verde/azul no RGB, luminosidade no
 *  HSL, brilho no HSB). */
function espacoDosCanais(pedido:ColorSpace|undefined,...canais:ColorChannel[]):ColorSpace{
  if(pedido)return pedido;
  for(const ch of canais){const e=spaceOf(ch);if(e!=="hsb"||ch==="brightness")return e;}
  return "hsb";
}

interface AreaDeCorProps{cor:Cor;onCor:(c:Cor,fim:boolean)=>void;space:ColorSpace;x:ColorChannel;y:ColorChannel;showDots?:boolean;
  disabled?:boolean;name?:string;id?:string;className?:string;"aria-label"?:string;"aria-labelledby"?:string;"aria-describedby"?:string}
function AreaDeCor({cor,onCor,space,x:canalX,y:canalY,showDots,disabled,name,id,className,"aria-label":ariaLabel,"aria-labelledby":ariaLabelledby,"aria-describedby":ariaDescribedby}:AreaDeCorProps){
  const s=useAureaStrings();
  const rtl=useDirection()==="rtl";
  const caixa=React.useRef<HTMLDivElement>(null);
  const inX=React.useRef<HTMLInputElement>(null),inY=React.useRef<HTMLInputElement>(null);
  const [arrastando,setArrastando]=React.useState(false);
  const [focado,setFocado]=React.useState<"x"|"y"|null>(null);
  const [pelaTecla,setPelaTecla]=React.useState(false);
  // O anel de foco é do TECLADO, como na referência: o foco que o arrasto põe no `range` não acende o anel.
  const [peloPonteiro,setPeloPonteiro]=React.useState(false);
  React.useEffect(ouvirModalidade,[]);
  const fx=channelRange(canalX),fy=channelRange(canalY);
  const canalZ=COLOR_CHANNELS[space].find((ch)=>ch!==canalX&&ch!==canalY)!;
  const vx=getChannel(cor,canalX,space),vy=getChannel(cor,canalY,space);
  const px=(vx-fx.min)/(fx.max-fx.min),py=(vy-fy.min)/(fy.max-fy.min);
  const hex=corToHex({...cor,a:1}),nome=colorName(hsbToRgb(cor),s);
  // Antes de mexer, o leitor de tela ouve os três canais e o nome; depois de mexer pelo teclado, só o canal que
  // mudou e o nome — como na referência (o resto ele já ouviu).
  const fala=(ch:ColorChannel,v:number)=>`${s.colorChannel[ch]} ${formatChannel(ch,v)}`;
  const textoDo=(eixo:"x"|"y")=>{
    const a=fala(canalX,vx),b=fala(canalY,vy),c=fala(canalZ,getChannel(cor,canalZ,space));
    const partes=pelaTecla?[eixo==="x"?a:b]:eixo==="x"?[a,b,c]:[b,a,c];
    return `${partes.join(", ")}, ${nome}`;
  };
  const rotulo=ariaLabel?`${ariaLabel}, ${s.colorPicker}`:ariaLabelledby?undefined:s.colorPicker;
  // Na grade do passo do canal: somar passos em ponto flutuante acumula erro.
  const naGrade=(v:number,f:{min:number;max:number;step:number})=>Math.round(Math.min(f.max,Math.max(f.min,v))/f.step)*f.step;
  const com=(nx:number,ny:number)=>setChannel(setChannel(cor,canalX,nx,space),canalY,ny,space);
  const pelaPosicao=(cx:number,cy:number,fim:boolean)=>{
    const r=caixa.current!.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const x=no01((cx-r.left)/r.width),y=no01((cy-r.top)/r.height);
    onCor(com(fx.min+(rtl?1-x:x)*(fx.max-fx.min),fy.min+(1-y)*(fy.max-fy.min)),fim);
  };
  const focar=(eixo:"x"|"y")=>{(eixo==="x"?inX:inY).current?.focus({preventScroll:true});setFocado(eixo);};
  const aoApertar=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(disabled||e.button!==0)return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setArrastando(true);setPelaTecla(false);setPeloPonteiro(true);focar("x");
    pelaPosicao(e.clientX,e.clientY,false);
  };
  const aoMover=(e:React.PointerEvent<HTMLDivElement>)=>{if(arrastando)pelaPosicao(e.clientX,e.clientY,false);};
  const aoSoltar=(e:React.PointerEvent<HTMLDivElement>)=>{if(!arrastando)return;setArrastando(false);pelaPosicao(e.clientX,e.clientY,true);};
  const aoTeclar=(e:React.KeyboardEvent<HTMLDivElement>)=>{
    if(disabled)return;
    const frente=rtl?-1:1,sx=e.shiftKey?fx.page:fx.step,sy=e.shiftKey?fy.page:fy.step;
    let nx=vx,ny=vy,eixo:"x"|"y";
    switch(e.key){
      case "ArrowRight":nx+=sx*frente;eixo="x";break;
      case "ArrowLeft":nx-=sx*frente;eixo="x";break;
      case "ArrowUp":ny+=sy;eixo="y";break;
      case "ArrowDown":ny-=sy;eixo="y";break;
      case "PageUp":ny+=fy.page;eixo="y";break;
      case "PageDown":ny-=fy.page;eixo="y";break;
      case "Home":nx-=fx.page*frente;eixo="x";break;
      case "End":nx+=fx.page*frente;eixo="x";break;
      default:return;
    }
    e.preventDefault();
    setPelaTecla(true);setPeloPonteiro(false);focar(eixo);
    onCor(com(naGrade(nx,fx),naGrade(ny,fy)),true);
  };
  // O motor do navegador também muda o `range` (o leitor de tela pede "aumentar"): o valor chega pelo `onChange`.
  const aoMudar=(eixo:"x"|"y")=>(e:React.ChangeEvent<HTMLInputElement>)=>{
    setPelaTecla(true);
    onCor(setChannel(cor,eixo==="x"?canalX:canalY,Number(e.target.value),space),true);
  };
  const escondido=(eixo:"x"|"y")=>focado===null?eixo==="y":focado!==eixo;
  const fundo=areaBackground(cor,space,canalX,canalY,rtl);
  return <div ref={caixa} role="group" id={id} aria-label={ariaLabel?rotulo:undefined} aria-labelledby={ariaLabelledby}
    aria-disabled={disabled||undefined} data-disabled={disabled?"":undefined} data-dragging={arrastando?"":undefined}
    className={cx("color-area",showDots&&"color-area-dots",className)}
    style={{"--color-area-fill":fundo.background,"--color-area-blend":fundo.blend??"normal","--color-area-thumb":hex} as React.CSSProperties}
    onPointerDown={aoApertar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} onKeyDown={aoTeclar}>
    <div className="color-area-thumb" data-focus-visible={focado&&!peloPonteiro?"":undefined} style={{insetInlineStart:`${px*100}%`,insetBlockStart:`${(1-py)*100}%`}}>
      {(["x","y"] as const).map((eixo)=>{
        const f=eixo==="x"?fx:fy;
        return <input key={eixo} ref={eixo==="x"?inX:inY} type="range" className="color-area-input"
          min={f.min} max={f.max} step={f.step} value={naGrade(eixo==="x"?vx:vy,f)} disabled={disabled}
          aria-label={rotulo} aria-labelledby={rotulo?undefined:ariaLabelledby} aria-describedby={ariaDescribedby}
          aria-roledescription={s.colorArea2D} aria-valuetext={textoDo(eixo)} aria-orientation={eixo==="x"?"horizontal":"vertical"}
          tabIndex={escondido(eixo)?-1:undefined} aria-hidden={escondido(eixo)&&!pelaTecla?true:undefined}
          onChange={aoMudar(eixo)} onFocus={()=>{setFocado(eixo);setPeloPonteiro(modalidade==="ponteiro");}}
          onBlur={(e)=>{if(!caixa.current?.contains(e.relatedTarget as Node|null)){setFocado(null);setPeloPonteiro(false);}}}/>;
      })}
    </div>
    {name&&<input type="hidden" name={name} value={corToHex(cor)}/>}
  </div>;
}

// A TRILHA DE COR (`TrilhaDeCor`) — o `Slider` da Aurea (o motor dele, Base UI) andando num canal da cor. O valor de
// fora é a COR, como na referência (várias trilhas repartem a mesma); por dentro o motor anda no número do canal, na
// faixa dele. A trilha pinta o canal de ponta a ponta (a cor chapada nas folgas, pelas paradas); o alfa ganha o
// xadrez embaixo. O leitor de tela ouve o canal e o nome da cor (no matiz, o nome do matiz puro; no alfa, só o
// número — como na referência).
interface TrilhaDeCorProps{cor:Cor;onCor:(c:Cor,fim:boolean)=>void;channel:ColorChannel;colorSpace?:ColorSpace;label:ReactNode;labelHidden?:boolean;
  showValue?:boolean;orientation?:SliderOrientation;disabled?:boolean;name?:string;className?:string;id?:string}
function TrilhaDeCor({cor,onCor,channel,colorSpace,label,labelHidden,showValue=true,orientation="horizontal",disabled,name,className,id}:TrilhaDeCorProps){
  const s=useAureaStrings();
  const rtl=useDirection()==="rtl";
  const space=spaceOf(channel,colorSpace);
  const {min,max,step,page}=channelRange(channel);
  const v=getChannel(cor,channel,space);
  const idDoRotulo=React.useId();
  const fundo=trackBackground(cor,channel,space,orientation==="vertical"?"to top":rtl?"to left":"to right");
  const pino=channel==="hue"?pureHue(v):channel==="alpha"?corToHex(cor):corToHex({...cor,a:1});
  const falado=(n:number)=>{
    const base=`${s.colorChannel[channel]} ${formatChannel(channel,n)}`;
    if(channel==="alpha")return base;
    return `${base}, ${colorName(hsbToRgb(channel==="hue"?{h:n,s:1,b:1}:setChannel(cor,channel,n,space)),s)}`;
  };
  return <BaseSlider.Root id={id} aria-labelledby={idDoRotulo} aria-disabled={disabled||undefined} value={v}
    onValueChange={(n:number)=>onCor(setChannel(cor,channel,n,space),false)} onValueCommitted={(n:number)=>onCor(setChannel(cor,channel,n,space),true)}
    min={min} max={max} step={step} largeStep={page} orientation={orientation} disabled={disabled}
    className={cx("slider","slider-color",channel==="alpha"&&"slider-alpha",className)}
    style={{"--slider-track-fill":fundo,"--slider-thumb-color":pino} as React.CSSProperties}>
    <div id={idDoRotulo} className={labelHidden?"sr-only":"slider-label"}>{label}</div>
    {/* O valor é escrito AQUI, e não pelo `Intl` do motor: ele formata na língua do ambiente, e o servidor (Node em
        pt-BR: "210 °") e o navegador (en: "210°") escreveriam diferente — a hidratação cairia. */}
    {showValue&&<BaseSlider.Value className="slider-output">{(_:readonly string[],valores:readonly number[])=>formatChannel(channel,valores[0]??v)}</BaseSlider.Value>}
    <BaseSlider.Control className="slider-control">
      <BaseSlider.Track className="slider-track">
        <BaseSlider.Thumb className="slider-thumb" aria-labelledby={idDoRotulo} getAriaValueText={(_f:string,n:number)=>falado(n)}/>
      </BaseSlider.Track>
    </BaseSlider.Control>
    {name&&<input type="hidden" name={name} value={corToHex(cor)}/>}
  </BaseSlider.Root>;
}

// FileInput mora em arquivo próprio (132 linhas — upload real, aborto, progresso) e é público
// por aqui: a categoria dele é Inputs.
export {FileInput, matchesAccept, type FileRejection, type UploadContext, type UploadFn} from "./file-input.js";

// `id`, quando vem, é o id do CONTROLE — não deste contêiner. É o que um consumidor quer dizer
// ao passá-lo, e é o que faz `htmlFor` apontar para o lugar certo. O `htmlFor` que este tipo
// declarava saiu: o contêiner deixou de ser `<label>`, então não havia mais o que ele nomeasse.
// `orientation` (G-AXIS-01): a linha do formulário de configurações — rótulo à esquerda, controle
// à direita — só saía da Aurea com CSS avulso. A pele (`.field-horizontal`) veio no core pelo
// merge; a prop faltava. É visual puro: não muda ordem, semântica nem teclado, então resolve por
// classe, como manda a ADR-0047.
export type FieldOrientation="vertical"|"horizontal";
// `labelWidth` (C-10, 24/09/2026): no `horizontal` a coluna do rótulo é o token
// `--field-label-width` (12rem, 192px), e não havia prop para ele. "Ordenar" (60px) deixava 130px
// vazios, e num telefone a 375px o campo ficava com 85px — 13 de respiro e 70 dos botões, ZERO para
// o texto: o valor escolhido sumia. Medido num app real com a 0.8.8. `"auto"` faz a coluna do
// tamanho do rótulo; uma medida CSS ("8rem") fixa outra. Sem a prop, os 192px de sempre. A prop só
// escreve o token que o core já lê — nenhuma regra nova de CSS.
export type FieldLabelWidth="auto"|(string&{});
export interface FieldProps extends HTMLAttributes<HTMLDivElement>,RefAttributes<HTMLDivElement>{label:string;hint?:ReactNode;error?:ReactNode;
  /** B-12 (24/09/2026): texto de ajuda que precisa de uma FRASE — mora embaixo do controle, onde
   *  cabe, e não divide a linha do rótulo. O `hint` continua o que é: nota curta ao lado do rótulo
   *  ("opcional", "em MB"). É o lugar da descrição da referência e da `description` que o
   *  `Checkbox` desta casa já tem. Entra no `aria-describedby` na ordem da tela: hint, descrição,
   *  erro. */
  description?:ReactNode;name?:string;orientation?:Responsive<FieldOrientation>;labelWidth?:FieldLabelWidth;
  /** 0.32.0, como o `isRequired` da referência: o asterisco vermelho depois do rótulo (escondido do
   *  leitor de tela) e o `required` no controle — é ele que anuncia "obrigatório". */
  required?:boolean}
// hint e error são DESCRIÇÃO (aria-describedby), nunca parte do NOME. Nome é o que o campo É;
// hint e erro são sobre o VALOR.
//
// ISTO JÁ ESTAVA ESCRITO AQUI E ERA MENTIRA — reaberto como AUD-0001 em 12/08/2026, e o achado
// A12 volta com ele. O comentário anterior dizia "medido em 30/07/2026, corrigido", e a marcação
// logo abaixo mantinha `hint` e `error` DENTRO do `<label>` externo. Nome acessível medido:
// "E-mail Usamos para entrar Endereço inválido" — os três grudados —, e a descrição repetindo o
// que já estava no nome. Quinta vez neste repositório que comentário passou por código; a
// diferença é que aqui ele passou por CORREÇÃO. O teste que devia pegar aceitava `/E-mail/`, que
// casa com a frase inteira: regex frouxa é gate que dorme.
//
// O contêiner é `<div>` e não `<label>`, e isso resolve três coisas de uma vez: hint e erro saem
// da árvore de nome; `Checkbox`/`Radio`/`Switch`, que trazem `<label>` próprio, param de produzir
// `<label>` dentro de `<label>` (HTML inválido); e a ligação passa a ser explícita.
//
// DUAS FORMAS, e a regra que escolhe entre elas é UMA: o Field só é dono do NOME quando há um
// filho único que não se nomeia sozinho.
//   • dono do nome  → `<label htmlFor>`, e o filho recebe `id`/`aria-describedby`/`aria-invalid`;
//   • não dono      → `role="group"` + `aria-labelledby`, sem `htmlFor`.
// Os dois casos de "não dono" foram medidos, não imaginados:
//   1. VÁRIOS FILHOS — o catálogo já faz isso (um grupo de rádios sob um rótulo). Aqui `htmlFor`
//      apontaria para um id que não existe, o que é pior que não ligar.
//   2. FILHO COM RÓTULO PRÓPRIO — `Switch`, `Checkbox`, `Radio` trazem `<label>` deles. Somar um
//      `<label for>` daria DOIS rótulos ao mesmo controle, e o nome acessível vira a concatenação
//      dos dois ("Notificações Ativo"). A detecção é a prop `label` do filho: é prop NOSSA, não
//      é farejar tipo — todo controle que se nomeia declara ela.
// O `role="group"` não é invenção: é o que a ficha do Field sempre declarou.
//
// LIMITE DECLARADO, e é o que faz o clone falhar em silêncio: componente que destrincha uma
// lista fixa de props DESCARTA o que for injetado. `Input`, `Select`, `Textarea`, `Range` e
// `Switch` espalham `...props` e recebem tudo. `Combobox` e `MultiCombobox` não espalhavam, e
// por isso ganharam `aria-describedby`/`aria-invalid` explícitos abaixo. Os outros
// (`NumberField`, `OTPField`, `SegmentedControl`, `Toggle`) têm rótulo próprio e não são filhos
// de `Field` — a ficha diz quais são.
// As tags que o HTML permite associar a um `<label>`. Fora desta lista (e fora dos nossos
// componentes), o filho é layout e o Field vira grupo — ver o comentário dentro da função.
const TAGS_ROTULAVEIS=new Set(["input","select","textarea","button","meter","output","progress"]);
function filhoUnico(children:ReactNode):ReactElement<Record<string,unknown>>|null{
  const filhos=React.Children.toArray(children);
  if(filhos.length!==1||!React.isValidElement(filhos[0]))return null;
  const filho=filhos[0] as ReactElement<Record<string,unknown>>;
  return filho.type===React.Fragment?filhoUnico(filho.props.children as ReactNode):filho;
}
function elementoRotulavel(tipo:ReactElement["type"]):boolean{
  if(typeof tipo==="string")return TAGS_ROTULAVEIS.has(tipo);
  // Componente React arbitrário pode consumir as props no wrapper e nunca entregá-las ao nó
  // focal. Só os controles Aurea cujo encaminhamento é parte do contrato entram aqui.
  // `PasswordField` entrou em 29/08/2026, e entrou medido: `<Field label="Senha"><PasswordField/></Field>`
  // reprovava no axe com "Form elements must have labels". Fora desta lista o Field vira GRUPO e
  // não pendura `htmlFor`, então o <input> de dentro ficava sem nome. Ele qualifica pela mesma
  // regra que os outros: recebe `id` e espalha `...props` no `Input`, que é o nó focal.
  return ([Input,Select,Textarea,SearchField,PasswordField,Checkbox,Radio,Switch,Range,Combobox,MultiCombobox,ColorField] as unknown[]).includes(tipo)
    // os que moram fora do pacote principal e se registraram (o `DatePicker`, 0.32.0)
    ||(typeof tipo==="function"&&controlesRotulaveis.has(tipo));
}
export function Field({label,hint,description,error,children,className,id,name,orientation,labelWidth,style,required,...props}:FieldProps){
  const auto=React.useId();
  // Fragment não cria nó no DOM. Um Fragment com um só controle é só sintaxe; com vários,
  // Field precisa voltar para grupo em vez de pendurar `htmlFor` num id que nunca existirá.
  const unico=filhoUnico(children);
  // e o TERCEIRO caso de "não dono", que o gate achou e eu não tinha previsto: o filho único pode
  // ser um `<div>` de LAYOUT com os controles dentro — o catálogo faz isso no `Range` ("With the
  // number": um slider e um campo numérico lado a lado). `htmlFor` apontando para um `<div>` não
  // nomeia nada, e o `catalog-sweep` reprovou `range.html` com duas violações de `label` no axe.
  // A leitura é do TIPO do elemento JSX, que é API estável do React. Para tag nativa vale a lista
  // do HTML; para componente vale a lista explícita dos controles Aurea que repassam a ligação ao
  // nó focal. Componente arbitrário vira grupo — presumir forwarding recria o id sem alvo.
  const rotulavel=!!unico&&elementoRotulavel(unico.type);
  // `label` é a API dos controles compostos; aria-label/labelledby são a API universal. Se uma
  // delas já nomeia o filho, acrescentar `<label for>` daria dois donos para o mesmo nome.
  const nomeProprio=rotulavel&&(unico!.props.label!==undefined||[unico!.props["aria-label"],unico!.props["aria-labelledby"]].some(v=>typeof v==="string"&&v.trim().length>0));
  const nomeAqui=rotulavel&&!nomeProprio;
  // o id que o filho já declara VENCE: sobrescrevê-lo quebraria uma ligação que o consumidor fez.
  const idControle=(unico?.props.id as string|undefined)??id??`${auto}-control`;
  const idRotulo=`${auto}-label`;
  const idHint=hint?`${auto}-hint`:undefined;
  const idDescricao=description?`${auto}-description`:undefined;
  const idErro=error?`${auto}-error`:undefined;
  const descrito=[idHint,idDescricao,idErro].filter(Boolean).join(" ")||undefined;
  // As chaves de aria só entram quando têm VALOR. Passar `undefined` explícito não é o mesmo que
  // não passar: quando o filho vira `Field.Control` do motor (ramo do `name`), a prop explícita
  // do elemento vence a mesclagem, e o `aria-invalid` que o motor calculou a partir do erro
  // externo era apagado por um `undefined` nosso. Medido em 13/08/2026: o input saía com
  // `data-invalid` e SEM `aria-invalid`, ou seja, vermelho na tela e válido para o leitor de
  // tela — que é o pior dos dois mundos.
  const injecao:Record<string,unknown>={id:idControle};
  const descritoFinal=[unico?.props["aria-describedby"],descrito].filter(Boolean).join(" ");
  if(descritoFinal)injecao["aria-describedby"]=descritoFinal;
  const invalidoFinal=error?true:unico?.props["aria-invalid"];
  if(invalidoFinal!==undefined)injecao["aria-invalid"]=invalidoFinal;
  // o `required` do controle é o que anuncia; o do filho, se ele já disse, vence
  if(required&&unico?.props.required===undefined)injecao.required=true;
  const asterisco=required?<span className="label-required" aria-hidden="true">*</span>:null;
  const controle=rotulavel?React.cloneElement(unico!,injecao):children;
  // a descrição mora no nó FOCAL quando existe um; sem filho único, no grupo — que é o que sobra
  // para anunciar. Nos dois lugares seria anunciar duas vezes.
  // Com `name`, o filho passa a ser o CONTROLE do motor: é isso que faz o `aria-invalid` e o
  // `aria-describedby` do erro externo chegarem ao nó focal. Medido em 13/08/2026 — sem este
  // embrulho o `Field.Root` recebe o erro e não tem a quem entregá-lo, e o campo fica válido na
  // árvore de acessibilidade enquanto a frase de erro aparece na tela. Pior que não mostrar.
  const controleFinal=name?<BaseField.Control render={controle as ReactElement}/>:controle;
  const estilo=labelWidth?{...style,"--field-label-width":labelWidth==="auto"?"max-content":labelWidth} as React.CSSProperties:style;
  const corpo=<div className={cx("field",peleDoEixo("field",orientation,"vertical","field"),className)} {...(nomeAqui?{}:{role:"group","aria-labelledby":idRotulo,...(rotulavel?{}:{"aria-describedby":descrito})})} style={estilo} {...props}>
    <span className="label">
      {/* O `<label>` tem `for` E `id` (0.32.0, como o rótulo da biblioteca de acessibilidade do mercado): o `id`
          deixa outra parte do controle apontar para ele — a janela do `DatePicker` se chama pelo rótulo. */}
      {nomeAqui?<label htmlFor={idControle} id={idRotulo}>{label}{asterisco}</label>:<span id={idRotulo}>{label}{asterisco}</span>}
      {hint&&<span className="hint" id={idHint}>{hint}</span>}
    </span>
    {controleFinal}
    {description&&<span className="field-description" id={idDescricao}>{description}</span>}
    {error&&<span className="field-error" id={idErro}>{error}</span>}
    {/* O erro que veio DE FORA (servidor, action, schema) — o `Form` o entrega por `name`, e é
        este nó que o motor preenche. Sem `name` ele não existe, e o `Field` continua sendo o de
        antes byte a byte: a mudança é aditiva de propósito, porque a semântica deste componente
        foi paga com auditoria (AUD-0001) e não se mexe nela para acrescentar recurso. */}
    {name&&<BaseField.Error className="field-error"/>}
  </div>;
  // `Field.Root` do motor entra SÓ quando há `name`: é ele que liga o campo à chave de `errors`
  // do formulário. Ele não desenha nada — é contexto — então a pele não muda.
  return name?<BaseField.Root name={name} invalid={error?true:undefined} render={corpo}/>:corpo;
}

// Form (M1): o formulário que EXIBE erro, e não o que decide o que é erro.
//
// A divisão saiu de pesquisa e da medição dos consumidores (13/08/2026). O padrão de mercado é
// uma biblioteca de formulário com uma de esquema, e é o que uma das referências embrulha — mas embrulhar isso aqui obrigaria TODO
// projeto que usa a Aurea a usar essa biblioteca de formulário, inclusive os que já validam de outro jeito (um
// consumidor real valida com a biblioteca de esquema em server action, sem biblioteca de formulário no cliente).
// Dependência nova também é decisão do Victor pelo BUILDING.md §3.3, e ela não foi necessária:
// o `Form` do Base UI — motor que a Aurea JÁ paga desde a Fase 2 — declara no próprio tipo que
// `errors` são "validation errors returned externally, typically after submission by a server or
// a form action". Ou seja, a divisão que eu ia propor já é a do motor.
//
// O que a Aurea entrega: a pele, o `name` ligando campo a erro, e o envio com os valores já
// coletados. O que ela NÃO entrega, e não vai: schema, regra, resolver, estado de campo.
export function Form({errors,onSubmit,children,className,...props}:Omit<React.FormHTMLAttributes<HTMLFormElement>,"onSubmit">&RefAttributes<HTMLFormElement>&{errors?:Record<string,string|string[]>;onSubmit?:(values:Record<string,unknown>)=>void}){
  return <BaseForm errors={errors} onFormSubmit={onSubmit?(v:Record<string,unknown>)=>onSubmit(v):undefined} className={cx("form",className)} {...props}>{children}</BaseForm>;
}
// `formatOnBlur` é a metade de TEXTO do item L6 (máscara no campo), e a decisão de NÃO mascarar
// enquanto se digita é pesquisada, não preferida — três medições independentes, em 15/08/2026:
//   • a máscara de entrada de um **design system público** é publicada com
//     reprovação registrada em WCAG 2.1 AA: sair de um erro fica difícil por falta de
//     retorno. Não é que ninguém tenha feito; é que quem fez, publicou o defeito junto;
//   • uma das **referências** ABANDONOU máscara nos campos de data e escreveu por quê: o texto vaza
//     para as seções anteriores ao editar o meio do valor. Há até um vídeo no repositório deles
//     mostrando a máscara como experiência ruim — foi a referência que o item mandava ler;
//   • a prática corrente diz o mesmo: máscara ao vivo descasa o que o leitor de tela ANUNCIA (o
//     que foi digitado) do que o campo MOSTRA (o que a máscara deixou), e a recomendação é deixar
//     digitar e colar à vontade, formatando DEPOIS que o foco sai.
//
// Então a Aurea entrega o MOMENTO, que é a decisão de acessibilidade, e não o formato — placa,
// documento e telefone são regra de país, conhecimento do consumidor, não do design system.
//
// A TRAVA DO ITEM ESTÁ SATISFEITA POR CONSTRUÇÃO: o valor formatado é o `value` do elemento, no
// DOM. Nada é pintado por cima, nada mora só na tela — é o que o teste cobra.
//
// O `onChange` é chamado DEPOIS de o valor do elemento já ter mudado, e é isso que faz o campo
// controlado funcionar: o consumidor lê `e.target.value` e recebe o texto formatado. O evento é
// de blur, e isso está declarado — quem ramifica por `e.type` precisa saber.
// O DEGRAU DE TAMANHO (merge de 28/08/2026): a página deste componente já PROMETIA que `size` é
// o degrau do sistema (sm/md/lg) e não a contagem de caracteres do HTML — e o componente passava
// o atributo nativo adiante, então os três campos de exemplo saíam do mesmo tamanho. Promessa na
// documentação e nada no código. `Omit<…,"size">` faz o que a documentação já dizia.
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>,"size">,RefAttributes<HTMLInputElement>{formatOnBlur?:(value:string)=>string;size?:Responsive<FieldSize>;
  /** 0.32.0, a da referência: `secondary` é o fundo neutro, para o campo dentro de um cartão. */
  variant?:FieldVariant}
export const Input=forwardRef<HTMLInputElement,InputProps>(function Input({className,formatOnBlur,size,variant,onBlur,onChange,...props},ref){
return <input ref={ref} className={cx("input",peleDoEixo("input",size),variant==="secondary"&&"input-secondary",className)} onChange={onChange} onBlur={e=>{
  if(formatOnBlur){
    const formatado=formatOnBlur(e.currentTarget.value);
    if(formatado!==e.currentTarget.value){
      e.currentTarget.value=formatado;
      onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }
  onBlur?.(e);
}} {...props}/>});


// O mesmo degrau do `Input`, porque ele É um `Input` por dentro: sem o `Omit` o tipo nativo
// (`size: number`) chega ao componente que hoje espera o degrau, e o compilador reprova — foi
// exatamente assim que este sítio apareceu.
export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>,"size"|"width">,RefAttributes<HTMLInputElement>{icon?:IconName;size?:Responsive<FieldSize>;
  /** A-08 (24/09/2026): a largura do campo — `"20rem"` ou `"auto"`. Sem ela, 100% da linha, como
   *  sempre. O `size` muda altura e letra, nunca largura. */
  width?:string}
// O glifo entra por `InputGroup`/`InputGroupAddon`, e não pelo `.input-wrap`: o mesmo problema
// tinha sido resolvido DUAS vezes localmente aqui — `.input-wrap` para o glifo do SearchField e
// `.input-wrap-end` para o botão do PasswordField —, e o grupo é a terceira vez virando uma. O
// merge das duas linhagens tinha trazido de volta a versão com `.input-wrap`, contra um core
// que já não a pinta.
// `search-field` (15/10/2026): a busca tem a medida própria da referência — 12, a lupa, 8 (ver o core).
export function SearchField({icon="magnifying-glass",className,size,width,...props}:SearchFieldProps){return <InputGroup className={cx("search-field",className)} width={width}><InputGroupAddon><Icon name={icon} size={valorBase(size)==="sm"?"sm":undefined}/></InputGroupAddon><Input type="search" size={size} {...props}/></InputGroup>}
// labelHidden: coluna de seleção de tabela precisa do rótulo POR LINHA para o leitor de
// tela ("Select Analyst"), mas mostrá-lo engorda a coluna. O rótulo continua no DOM, só
// sai da tela (.sr-only) — nunca trocar por aria-label solto num <label> visível vazio.





// NumberField (Lote 1 do BUILDING.md). Um `<input type="number">` cru tem três problemas que
// este resolve, e todos vieram do motor, não de nós: as setas nativas são alvos minúsculos e
// somem no Safari; a roda do mouse altera o valor por acidente sobre o campo focado; e o valor
// digitado não é formatado por locale. O Base UI trata os três.
// A anatomia (menos · campo · mais numa peça só) é a que as referências convergem.
// Fora de propósito: o ScrubArea do Base UI — arrastar o rótulo para variar o número. É gesto
// que ninguém descobre sozinho e que não tem equivalente por teclado.
// `format`/`locale`/`name` são a metade de MOEDA do item L6, e não custaram componente nenhum: o
// comentário acima já dizia que o motor formata por locale, e a nossa casca simplesmente não
// repassava a opção. Medido no `@base-ui/react@1.6.0`: `NumberFieldRoot` aceita
// `format?: Intl.NumberFormatOptions` e `locale?`, e formata no BLUR — que é exatamente o momento
// que a pesquisa de acessibilidade recomenda, e o oposto da máscara ao vivo.
// Com isso, `<NumberField format={{style:"currency",currency:"BRL"}} locale="pt-BR"/>` substitui a
// biblioteca de moeda que um consumidor carrega só para isso. Quem formata é o `Intl` da
// plataforma; a Aurea não escreve formatador de dinheiro, e nem deveria.
// `name` entra junto porque é ele que faz o motor renderizar o input escondido com o valor CRU —
// é a trava do item ("o valor mascarado continua no DOM") entregue pelo motor, e o teste a cobra.
export function NumberField({value,defaultValue,onValueChange,min,max,step,disabled,readOnly,required,label,id,name,format,locale,className,scrubbable,scrubDirection}:{value?:number|null;defaultValue?:number;onValueChange?:(v:number|null)=>void;min?:number;max?:number;step?:number;disabled?:boolean;readOnly?:boolean;required?:boolean;label?:string;id?:string;name?:string;format?:Intl.NumberFormatOptions;locale?:string;className?:string;scrubbable?:boolean;scrubDirection?:"horizontal"|"vertical"}){
const s=useAureaStrings();
return <BaseNumberField.Root id={id} name={name} value={value} defaultValue={defaultValue} onValueChange={soOValor(onValueChange)} min={min} max={max} step={step} format={format} locale={locale} disabled={disabled} readOnly={readOnly} required={required} className={cx("number-field",className)}>
<BaseNumberField.Group className="number-field-group">
{/* ── REPORTADA no merge de 28/08/2026 ─────────────────────────────────────────────────────
    A alça de arrasto vivia na outra linhagem e sumiu quando este arquivo entrou inteiro da
    `main`. A perda foi SILENCIOSA — a conferência comparou NOMES de componente, e
    `NumberField` existe nos dois lados; o que mudou foi o corpo. Quem denunciou foi o gate da
    fronteira do core: `.number-field-scrub` ficou no CSS sem ninguém a emitir.

    `scrubbable` é OPT-IN e SOMA em vez de substituir: os dois botões, as setas e Home/End continuam intactos. O
    arrasto é atalho de PONTEIRO por cima de um caminho que já existe inteiro.
    `aria-hidden` na alça porque ela não é operável por teclado nem por leitor de tela, e
    anunciar um alvo que a tecnologia assistiva não alcança é pior que não anunciar.
    O eixo sai como CLASSE porque o motor não publica atributo para ele — a regra da casa é
    atributo quando o motor publica, classe quando não.
    E o cursor virtual PRECISA de conteúdo: o Pointer Lock esconde o ponteiro do sistema e
    desenha este elemento no lugar; vazio, o arraste fica sem cursor nenhum. */}
{scrubbable&&<BaseNumberField.ScrubArea className={cx("number-field-scrub",scrubDirection==="vertical"&&"number-field-scrub-vertical")} direction={scrubDirection} aria-hidden="true">
  <Icon name="dots-six-vertical" aria-hidden={true}/>
  <BaseNumberField.ScrubAreaCursor className="number-field-scrub-cursor"><Icon name="dots-six-vertical" aria-hidden={true}/></BaseNumberField.ScrubAreaCursor>
</BaseNumberField.ScrubArea>}
{/* 0.32.0: os botões DENTRO do grupo, como o da referência (ver o `.number-field-group`) */}
<BaseNumberField.Decrement className="number-field-button number-field-decrement" aria-label={s.decrement}><Icon name="minus"/></BaseNumberField.Decrement>
<BaseNumberField.Input className="input number-field-input" aria-label={label}/>
<BaseNumberField.Increment className="number-field-button number-field-increment" aria-label={s.increment}><Icon name="plus"/></BaseNumberField.Increment>
</BaseNumberField.Group></BaseNumberField.Root>}

// CHECKBOXGROUP (0.32.0) — o grupo de caixas da referência: o rótulo do grupo, a descrição, as caixas
// (16 de espaço antes de cada uma) e o erro no fim. O grupo GUARDA a lista do que está marcado:
// cada `Checkbox` de dentro diz o seu `value`, e o grupo passa a ele o `checked` e o clique — o mesmo
// caminho do `Field`, que injeta no filho em vez de exigir um `Checkbox` especial. O `Checkbox` solto
// continua igual. O grupo é `role="group"` com o nome do rótulo; a descrição e o erro entram no
// `aria-describedby`. Inválido (com `error`), cada caixa recebe `aria-invalid`.
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>,"defaultValue"|"onChange">,RefAttributes<HTMLDivElement>{
  label:ReactNode;description?:ReactNode;error?:ReactNode;
  value?:readonly string[];defaultValue?:readonly string[];onValueChange?:(value:string[])=>void;
  /** O `name` de todas as caixas, para o formulário. */
  name?:string;disabled?:boolean;
  /** O asterisco no rótulo, como o `Field`. */
  required?:boolean}
export function CheckboxGroup({label,description,error,value,defaultValue,onValueChange,name,disabled,required,children,className,...props}:CheckboxGroupProps){
  const auto=React.useId();
  const [proprio,setProprio]=React.useState<readonly string[]>(defaultValue??[]);
  const marcados=value??proprio;
  const trocar=(v:string,ligado:boolean)=>{
    const novo=ligado?[...marcados.filter(x=>x!==v),v]:marcados.filter(x=>x!==v);
    if(value===undefined)setProprio(novo);
    onValueChange?.(novo);
  };
  const idRotulo=`${auto}-label`,idDescricao=description?`${auto}-description`:undefined,idErro=error?`${auto}-error`:undefined;
  const caixas=React.Children.map(children,filho=>{
    if(!React.isValidElement(filho))return filho;
    const p=filho.props as {value?:unknown;onChange?:(e:React.ChangeEvent<HTMLInputElement>)=>void;disabled?:boolean};
    if(typeof p.value!=="string")return filho;
    const v=p.value;
    return React.cloneElement(filho as ReactElement<Record<string,unknown>>,{checked:marcados.includes(v),name:name??(filho.props as {name?:string}).name,
      disabled:p.disabled??disabled,...(error?{"aria-invalid":true}:null),
      onChange:(e:React.ChangeEvent<HTMLInputElement>)=>{p.onChange?.(e);trocar(v,e.currentTarget.checked)}});
  });
  return <div role="group" aria-labelledby={idRotulo} aria-describedby={[idDescricao,idErro].filter(Boolean).join(" ")||undefined}
    className={cx("checkbox-group",className)} {...props}>
    <span className="label" id={idRotulo}><span>{label}{required?<span className="label-required" aria-hidden="true">*</span>:null}</span></span>
    {description&&<span className="field-description" id={idDescricao}>{description}</span>}
    {caixas}
    {error&&<span className="field-error" id={idErro}>{error}</span>}
  </div>;
}

// RADIOGROUP (15/10/2026, o Victor: "A, B, C, pode") — o grupo de opções da referência, na web. O nativo já tinha
// `RadioGroup` e `RadioGroup.Item`; aqui os mesmos nomes de prop (`value`, `onValueChange`, `orientation`, `disabled`,
// `invalid`), e o molde do `CheckboxGroup` da casa: o rótulo do grupo, a descrição, as opções (16 antes de cada uma, ou
// 16 entre elas na horizontal) e o erro no fim. As opções são o `Radio` de sempre (`RadioGroup.Item` é ele): botões de
// opção NATIVOS com o mesmo `name`, então o Tab entra na escolhida e as setas andam e escolhem — do navegador. O grupo
// é `role="radiogroup"` com o nome do rótulo; a descrição e o erro entram no `aria-describedby`.
export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>,"defaultValue"|"onChange">,RefAttributes<HTMLDivElement>{
  label:ReactNode;
  /** O nome sai da tela e fica para o leitor de tela, como no `Checkbox` (a fileira de controles da vitrine da referência). */
  labelHidden?:boolean;description?:ReactNode;error?:ReactNode;
  value?:string;defaultValue?:string;onValueChange?:(value:string)=>void;
  /** O `name` de todas as opções, para o formulário. Sem ele, um nome próprio do grupo. */
  name?:string;disabled?:boolean;
  /** Pinta todas as opções de erro, como o `invalid` do nativo. Com `error`, já vale. */
  invalid?:boolean;
  /** `vertical` (o padrão) ou `horizontal`, como a referência e o nativo. */
  orientation?:"vertical"|"horizontal";
  /** O asterisco no rótulo, como o `Field`. */
  required?:boolean}
export function RadioGroup({label,labelHidden,description,error,value,defaultValue,onValueChange,name,disabled,invalid,orientation="vertical",required,children,className,...props}:RadioGroupProps){
  const auto=React.useId();
  const [proprio,setProprio]=React.useState<string|undefined>(defaultValue);
  const escolhido=value??proprio;
  const idRotulo=`${auto}-label`,idDescricao=description?`${auto}-description`:undefined,idErro=error?`${auto}-error`:undefined;
  const opcoes=React.Children.map(children,filho=>{
    if(!React.isValidElement(filho))return filho;
    const p=filho.props as {value?:unknown;onChange?:(e:React.ChangeEvent<HTMLInputElement>)=>void;disabled?:boolean};
    if(typeof p.value!=="string")return filho;
    const v=p.value;
    return React.cloneElement(filho as ReactElement<Record<string,unknown>>,{checked:escolhido===v,name:name??auto,required,
      disabled:p.disabled??disabled,...(error||invalid?{"aria-invalid":true}:null),
      onChange:(e:React.ChangeEvent<HTMLInputElement>)=>{p.onChange?.(e);if(!e.currentTarget.checked)return;
        if(value===undefined)setProprio(v);onValueChange?.(v)}});
  });
  return <div role="radiogroup" aria-labelledby={idRotulo} aria-describedby={[idDescricao,idErro].filter(Boolean).join(" ")||undefined}
    aria-orientation={orientation} aria-required={required||undefined} aria-invalid={error||invalid?true:undefined}
    className={cx("radio-group",orientation==="horizontal"&&"radio-group-horizontal",labelHidden&&"radio-group-bare",className)} {...props}>
    <span className={cx("label",labelHidden&&"sr-only")} id={idRotulo}><span>{label}{required?<span className="label-required" aria-hidden="true">*</span>:null}</span></span>
    {description&&<span className="field-description" id={idDescricao}>{description}</span>}
    {orientation==="horizontal"?<div className="radio-group-items">{opcoes}</div>:opcoes}
    {error&&<span className="field-error" id={idErro}>{error}</span>}
  </div>;
}
/** A opção do grupo: o `Radio`, como o `RadioGroup.Item` do nativo. */
RadioGroup.Item=Radio;

// LISTBOX (0.32.0) — a lista de opções da referência, solta (não dentro de um Select): itens com
// rótulo, descrição e ícone, SEÇÕES com título, e escolha de nenhum, um ou vários. O motor da Aurea só
// tem a lista DENTRO do Select, do Combobox e do Menu, então o teclado é nosso, pelo padrão do APG
// para listbox: um ponto de Tab só (o item ativo), setas para cima e para baixo, Home e End, Espaço e
// Enter escolhem (em `multiple`, ligam e desligam), e a primeira letra pula para o item que começa com
// ela. Item desligado é pulado pelas setas e não escolhe. Sem escolha (`selectionMode="none"`), Enter
// e clique chamam `onAction` — é a lista de ações.
// A pele é a dela: recheio de 4, 4 entre itens, item de 36 com 8 dos lados e 6 em cima e embaixo,
// vão 12, o visto de 16 no fim do escolhido; o canto é o nosso — o item é cápsula.
export interface ListBoxItem{id:string;label:ReactNode;
  /** O texto que a busca pela letra lê, quando o `label` não é texto. */
  textValue?:string;description?:ReactNode;icon?:IconName;disabled?:boolean;
  /** O item de perigo ("Excluir"), na cor de perigo. */
  danger?:boolean;
  /** O atalho do item ("⌘N"), à direita, como na lista da referência (15/10/2026). Só mostra: quem liga a tecla é o app. */
  kbd?:string}
export interface ListBoxSection{title:ReactNode;items:readonly ListBoxItem[]}
export type ListBoxSelectionMode="none"|"single"|"multiple";
export interface ListBoxProps extends Omit<HTMLAttributes<HTMLDivElement>,"defaultValue"|"onChange">{
  /** O nome da lista para o leitor de tela. */
  label:string;
  items:readonly (ListBoxItem|ListBoxSection)[];
  selectionMode?:ListBoxSelectionMode;
  value?:readonly string[];defaultValue?:readonly string[];onValueChange?:(value:string[])=>void;
  /** Sem escolha: o item foi ativado (Enter, Espaço ou clique). */
  onAction?:(id:string)=>void}
const ehSecao=(x:ListBoxItem|ListBoxSection):x is ListBoxSection=>"items" in x;
const textoDoItem=(it:ListBoxItem)=>it.textValue??(typeof it.label==="string"?it.label:"");
export function ListBox({label,items,selectionMode="single",value,defaultValue,onValueChange,onAction,className,...props}:ListBoxProps){
  const auto=React.useId();
  const [proprio,setProprio]=React.useState<readonly string[]>(defaultValue??[]);
  const escolhidos=value??proprio;
  const todos=React.useMemo(()=>items.flatMap(x=>ehSecao(x)?x.items:[x]),[items]);
  const habilitados=todos.filter(it=>!it.disabled);
  const [ativo,setAtivo]=React.useState<string|undefined>(undefined);
  // O item que recebe o Tab: o ativo; senão o primeiro escolhido; senão o primeiro habilitado.
  const alvo=ativo??habilitados.find(it=>escolhidos.includes(it.id))?.id??habilitados[0]?.id;
  const refs=React.useRef(new Map<string,HTMLDivElement>());
  const focar=(id:string|undefined)=>{if(!id)return;setAtivo(id);refs.current.get(id)?.focus()};
  const escolher=(it:ListBoxItem)=>{
    if(it.disabled)return;
    if(selectionMode==="none"){onAction?.(it.id);return}
    const ja=escolhidos.includes(it.id);
    const novo=selectionMode==="multiple"?(ja?escolhidos.filter(x=>x!==it.id):[...escolhidos,it.id]):[it.id];
    if(value===undefined)setProprio(novo);
    onValueChange?.(novo);
    onAction?.(it.id);
  };
  const aoTeclar=(e:React.KeyboardEvent<HTMLDivElement>,it:ListBoxItem)=>{
    const i=habilitados.findIndex(x=>x.id===it.id);
    if(e.key==="ArrowDown"){e.preventDefault();focar(habilitados[Math.min(i+1,habilitados.length-1)]?.id)}
    else if(e.key==="ArrowUp"){e.preventDefault();focar(habilitados[Math.max(i-1,0)]?.id)}
    else if(e.key==="Home"){e.preventDefault();focar(habilitados[0]?.id)}
    else if(e.key==="End"){e.preventDefault();focar(habilitados[habilitados.length-1]?.id)}
    else if(e.key===" "||e.key==="Enter"){e.preventDefault();escolher(it)}
    else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
      // a primeira letra: o próximo item, depois do atual, que começa com ela (e dá a volta)
      const letra=e.key.toLocaleLowerCase();
      const ordem=[...habilitados.slice(i+1),...habilitados.slice(0,i+1)];
      const achou=ordem.find(x=>textoDoItem(x).toLocaleLowerCase().startsWith(letra));
      if(achou){e.preventDefault();focar(achou.id)}
    }
  };
  const item=(it:ListBoxItem)=>{
    const escolhido=selectionMode!=="none"&&escolhidos.includes(it.id);
    const idDesc=it.description?`${auto}-${it.id}-d`:undefined;
    return <div key={it.id} ref={n=>{if(n)refs.current.set(it.id,n);else refs.current.delete(it.id)}}
      role="option" aria-selected={selectionMode==="none"?undefined:escolhido} aria-disabled={it.disabled||undefined} aria-describedby={idDesc}
      tabIndex={it.id===alvo?0:-1} className={cx("list-box-item",it.danger&&"list-box-item-danger")}
      onClick={()=>{if(!it.disabled){setAtivo(it.id);escolher(it)}}} onKeyDown={e=>aoTeclar(e,it)} onFocus={()=>setAtivo(it.id)}>
      {it.icon&&<Icon name={it.icon}/>}
      <span className="list-box-item-text"><span className="list-box-item-label">{it.label}</span>
        {it.description&&<span className="list-box-item-description" id={idDesc}>{it.description}</span>}</span>
      {it.kbd&&<Kbd className="list-box-item-kbd">{it.kbd}</Kbd>}
      {escolhido&&<Icon name="check" className="list-box-item-indicator"/>}
    </div>;
  };
  return <div role="listbox" aria-label={label} aria-multiselectable={selectionMode==="multiple"||undefined} className={cx("list-box",className)} {...props}>
    {items.map((x,i)=>ehSecao(x)
      ?<div key={`s${i}`} role="group" aria-labelledby={`${auto}-s${i}`} className="list-box-section">
        <span className="list-box-section-title" id={`${auto}-s${i}`} role="presentation">{x.title}</span>
        {x.items.map(item)}</div>
      :item(x))}
  </div>;
}

// TAGGROUP (0.32.0) — o grupo de etiquetas da referência: as etiquetas numa fila que quebra, com rótulo,
// descrição e erro; escolha de nenhuma, uma ou várias; e o X de tirar. O motor da Aurea não tem
// etiqueta, então o teclado é nosso, no desenho dela: um ponto de Tab só para o grupo (a etiqueta
// ativa), as setas andam entre as etiquetas, Home e End vão às pontas, e Delete ou Backspace tiram a
// etiqueta ativa (o X é para o mouse e não entra no Tab). Com escolha, cada etiqueta é um botão que
// liga e desliga (`aria-pressed`) num `group`; sem escolha, é uma lista, e o foco anda pelos X.
// A pele é a dela — 24 de altura (sm 20, lg 32), 8 dos lados, letra de 12 peso médio, 6 entre as
// etiquetas, a escolhida no clarinho —; o canto é o nosso, a cápsula.
export type TagGroupSelectionMode="none"|"single"|"multiple";
export type TagSize="sm"|"md"|"lg";
export type TagVariant="default"|"surface";
export interface TagItem{id:string;label:ReactNode;
  /** O texto do nome do X ("Remover Design"), quando o `label` não é texto. */
  textValue?:string;icon?:IconName;disabled?:boolean}
export interface TagGroupProps{
  /** O nome do grupo. `labelHidden` o tira da tela e deixa para o leitor de tela. */
  label:ReactNode;labelHidden?:boolean;description?:ReactNode;errorMessage?:ReactNode;
  items:readonly TagItem[];
  selectionMode?:TagGroupSelectionMode;
  selectedKeys?:readonly string[];defaultSelectedKeys?:readonly string[];onSelectionChange?:(keys:string[])=>void;
  /** Com ele, cada etiqueta ganha o X, e Delete/Backspace tiram a ativa. */
  onRemove?:(ids:string[])=>void;
  size?:TagSize;variant?:TagVariant;className?:string;id?:string}
const textoDaEtiqueta=(it:TagItem)=>it.textValue??(typeof it.label==="string"?it.label:"");
export function TagGroup({label,labelHidden,description,errorMessage,items,selectionMode="none",selectedKeys,defaultSelectedKeys,onSelectionChange,onRemove,size="md",variant="default",className,id}:TagGroupProps){
  const s=useAureaStrings();
  const auto=React.useId();
  const [proprio,setProprio]=React.useState<readonly string[]>(defaultSelectedKeys??[]);
  const escolhidos=selectedKeys??proprio;
  const escolhe=selectionMode!=="none";
  const habilitadas=items.filter(it=>!it.disabled);
  const [ativa,setAtiva]=React.useState<string|undefined>(undefined);
  const alvo=(ativa&&habilitadas.some(it=>it.id===ativa)?ativa:undefined)??habilitadas[0]?.id;
  const refs=React.useRef(new Map<string,HTMLButtonElement>());
  const focar=(id:string|undefined)=>{if(!id)return;setAtiva(id);refs.current.get(id)?.focus()};
  const escolher=(it:TagItem)=>{
    if(!escolhe||it.disabled)return;
    const ja=escolhidos.includes(it.id);
    const novo=selectionMode==="multiple"?(ja?escolhidos.filter(x=>x!==it.id):[...escolhidos,it.id]):(ja?[]:[it.id]);
    if(selectedKeys===undefined)setProprio(novo);
    onSelectionChange?.(novo);
  };
  const tirar=(it:TagItem)=>{
    if(!onRemove||it.disabled)return;
    // o foco vai para a vizinha (a seguinte; na última, a anterior), e não se perde no documento
    const i=habilitadas.findIndex(x=>x.id===it.id);
    const vizinha=habilitadas[i+1]??habilitadas[i-1];
    onRemove([it.id]);
    if(vizinha)requestAnimationFrame(()=>focar(vizinha.id));
  };
  const aoTeclar=(e:React.KeyboardEvent<HTMLButtonElement>,it:TagItem)=>{
    const i=habilitadas.findIndex(x=>x.id===it.id);
    const rtl=getComputedStyle(e.currentTarget).direction==="rtl";
    const frente=rtl?"ArrowLeft":"ArrowRight", tras=rtl?"ArrowRight":"ArrowLeft";
    if(e.key===frente||e.key==="ArrowDown"){e.preventDefault();focar(habilitadas[Math.min(i+1,habilitadas.length-1)]?.id)}
    else if(e.key===tras||e.key==="ArrowUp"){e.preventDefault();focar(habilitadas[Math.max(i-1,0)]?.id)}
    else if(e.key==="Home"){e.preventDefault();focar(habilitadas[0]?.id)}
    else if(e.key==="End"){e.preventDefault();focar(habilitadas[habilitadas.length-1]?.id)}
    else if((e.key==="Delete"||e.key==="Backspace")&&onRemove){e.preventDefault();tirar(it)}
  };
  const guardar=(itId:string)=>(n:HTMLButtonElement|null)=>{if(n)refs.current.set(itId,n);else refs.current.delete(itId)};
  const idRotulo=`${auto}-l`, idDesc=description?`${auto}-d`:undefined, idErro=errorMessage?`${auto}-e`:undefined;
  return <div className={cx("tag-group",className)} id={id}>
    <span className={labelHidden?"sr-only":"label"} id={idRotulo}>{label}</span>
    <div role={escolhe?"group":"list"} aria-labelledby={idRotulo} aria-describedby={[idDesc,idErro].filter(Boolean).join(" ")||undefined}
      className="tag-group-list">
      {items.map(it=>{
        const escolhida=escolhe&&escolhidos.includes(it.id);
        const conteudo=<>{it.icon&&<Icon name={it.icon}/>}<span className="tag-label">{it.label}</span></>;
        const x=onRemove&&<button type="button" className="tag-remove" disabled={it.disabled}
          tabIndex={escolhe?-1:it.id===alvo?0:-1} ref={escolhe?undefined:guardar(it.id)}
          aria-label={`${s.comboboxRemove} ${textoDaEtiqueta(it)}`.trim()}
          onClick={()=>tirar(it)} onKeyDown={escolhe?undefined:e=>aoTeclar(e,it)} onFocus={escolhe?undefined:()=>setAtiva(it.id)}>
          <Icon name="x" weight="bold"/></button>;
        return <span key={it.id} role={escolhe?undefined:"listitem"}
          className={cx("tag",size!=="md"&&`tag-${size}`,variant!=="default"&&`tag-${variant}`)}
          data-selected={escolhida||undefined} data-disabled={it.disabled||undefined}>
          {escolhe
            ?<button type="button" className="tag-main" ref={guardar(it.id)} aria-pressed={escolhida} disabled={it.disabled}
              tabIndex={it.id===alvo?0:-1} onClick={()=>{setAtiva(it.id);escolher(it)}} onKeyDown={e=>aoTeclar(e,it)} onFocus={()=>setAtiva(it.id)}>{conteudo}</button>
            :<span className="tag-main">{conteudo}</span>}
          {x}
        </span>;
      })}
    </div>
    {description&&<span className="field-description" id={idDesc}>{description}</span>}
    {errorMessage&&<span className="field-error" id={idErro}>{errorMessage}</span>}
  </div>;
}

// SLIDER (HER-05, 0.32.0) — o controle deslizante DESENHADO da referência, com o nome e as partes
// dela: rótulo e valor na linha de cima, o trilho com o preenchimento, a alça. Um valor ou DOIS (a
// faixa: passe uma lista), na horizontal ou na vertical, com o número formatado pelo `Intl`
// (`format`/`locale`, como o `NumberField`). Quem faz o comportamento — arrastar, setas, Page
// Up/Down, Home/End, o papel `slider` em cada alça — é o motor que a Aurea já usa; não entra
// dependência nova.
// O `Range` continua: é o do navegador, com o `onChange` de evento (decisão do Victor, 11/10/2026,
// "Slider novo"). Este fala NÚMERO: `onValueChange(valor)`.
// O NOME: o rótulo visível nomeia as alças sozinho (desde a varredura do passo 4, por um id nosso,
// já na marcação — ver abaixo). Com dois valores,
// cada alça precisa do próprio nome ("Mínimo", "Máximo") — `thumbLabels`.
export type SliderOrientation="horizontal"|"vertical";
/** O que os dois modos do Slider têm em comum (o número e a cor). É a base que o leitor da API segue em
 *  `base & (a | b)` — com a união sozinha, ele não acha prop nenhuma (medido no `ColorSwatch`, 13/10/2026). */
export interface SliderBase{
  /** O rótulo. Obrigatório: é o nome das alças. `labelHidden` o tira da tela e deixa para o leitor de tela. */
  label:ReactNode;labelHidden?:boolean;
  orientation?:SliderOrientation;disabled?:boolean;name?:string;
  /** Mostrar o valor ao lado do rótulo. Padrão: sim. */
  showValue?:boolean;
  className?:string;id?:string}
export interface SliderProps<V extends number|readonly number[]=number|readonly number[]> extends SliderBase{
  value?:V;defaultValue?:V;
  /** Chamado a cada passo, com o número (ou a lista, na faixa). */
  onValueChange?:(value:V)=>void;
  /** Chamado ao soltar a alça — o momento de salvar. */
  onValueCommitted?:(value:V)=>void;
  min?:number;max?:number;step?:number;
  /** O passo do Page Up/Down e do Shift + seta. */
  largeStep?:number;
  format?:Intl.NumberFormatOptions;locale?:string;
  /** Com dois valores, o nome de cada alça, na ordem ("Mínimo", "Máximo"). */
  thumbLabels?:readonly string[];
  channel?:undefined}
/** A TRILHA DE COR (0.32.0, ADR-0069), variação deste mesmo Slider: com `channel`, ele anda num canal da cor — e o
 *  valor passa a ser a COR (hex), como na referência, para várias trilhas repartirem a mesma. */
export interface SliderColorProps extends SliderBase{
  /** O canal: `hue`, `saturation`, `brightness`, `lightness`, `red`, `green`, `blue` ou `alpha`. */
  channel:ColorChannel;
  /** O espaço de `hue` e `saturation` (`hsb` ou `hsl`); os outros canais já dizem o deles. Padrão: `hsb`. */
  colorSpace?:ColorSpace;
  /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
  value?:string;defaultValue?:string;
  /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
  onValueChange?:(value:string)=>void;
  /** Chamado ao soltar — o momento de salvar. */
  onValueCommitted?:(value:string)=>void}
export function Slider<V extends number|readonly number[]>(props:SliderBase&(SliderProps<V>|SliderColorProps)){
  return props.channel?<SliderDeCor {...props as SliderColorProps}/>:<SliderDeNumero {...props as SliderProps<V>}/>;
}
function SliderDeCor({value,defaultValue,onValueChange,onValueCommitted,...resto}:SliderColorProps){
  const [cor,mudar]=useCor(value,defaultValue,onValueChange,onValueCommitted);
  return <TrilhaDeCor {...resto} cor={cor} onCor={mudar}/>;
}
function SliderDeNumero<V extends number|readonly number[]>({label,labelHidden,value,defaultValue,onValueChange,onValueCommitted,min,max,step,largeStep,orientation="horizontal",disabled,name,format,locale,showValue=true,thumbLabels,className,id}:SliderProps<V>){
  // Quantas alças: tantas quantos valores houver (a faixa é uma lista).
  const atual=value??defaultValue;
  const alcas=Array.isArray(atual)?atual.length:1;
  // O NOME DA ALÇA SAI NA MARCAÇÃO. O motor liga o `<input>` de cada alça ao rótulo por um id que ele
  // só conhece DEPOIS de montar — no HTML do servidor (e no catálogo, que é HTML parado) as alças saíam
  // sem nome, e o axe do catálogo acusou as cinco. O `Slider.Label` do motor não aceita id, então o
  // rótulo é um `<div>` nosso, com id, que nomeia o grupo e cada alça — o nome já vem no HTML. E o desligado vai também para o grupo (`aria-disabled`): o motor só marca o `<input>`, e a
  // letra esmaecida do rótulo e do valor era lida como texto de contraste baixo, e não como peça desligada.
  const idDoRotulo=React.useId();
  return <BaseSlider.Root id={id} name={name} aria-labelledby={idDoRotulo} aria-disabled={disabled||undefined} value={value as number|readonly number[]|undefined} defaultValue={defaultValue as number|readonly number[]|undefined}
    onValueChange={onValueChange?(v:unknown)=>onValueChange(v as V):undefined} onValueCommitted={onValueCommitted?(v:unknown)=>onValueCommitted(v as V):undefined}
    min={min} max={max} step={step} largeStep={largeStep} orientation={orientation} disabled={disabled} format={format} locale={locale}
    className={cx("slider",className)}>
    <div id={idDoRotulo} className={labelHidden?"sr-only":"slider-label"}>{label}</div>
    {showValue&&<BaseSlider.Value className="slider-output"/>}
    <BaseSlider.Control className="slider-control">
      <BaseSlider.Track className="slider-track">
        <BaseSlider.Indicator className="slider-fill"/>
        {Array.from({length:alcas},(_,i)=><BaseSlider.Thumb key={i} index={i} className="slider-thumb" getAriaLabel={thumbLabels?()=>thumbLabels[i]??"":undefined} aria-labelledby={thumbLabels?undefined:idDoRotulo}/>)}
      </BaseSlider.Track>
    </BaseSlider.Control>
  </BaseSlider.Root>;
}

// ColorArea (0.32.0, ADR-0069): a peça interna `AreaDeCor` mora no TOPO do arquivo, antes do primeiro export —
// auxiliar entre exports entra na fatia de outro componente (regra do check 22).
export interface ColorAreaProps{
  /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
  value?:string;
  /** A cor de partida quando você não controla. Padrão: branco. */
  defaultValue?:string;
  /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
  onValueChange?:(value:string)=>void;
  /** Chamado ao soltar o ponteiro e a cada tecla — o momento de salvar. */
  onValueCommitted?:(value:string)=>void;
  /** O espaço de cor da área: `hsb` (o padrão), `hsl` ou `rgb`. */
  colorSpace?:ColorSpace;
  /** O canal do eixo de lado. Padrão: saturação (HSB e HSL) ou vermelho (RGB). A área não tem alfa. */
  xChannel?:Exclude<ColorChannel,"alpha">;
  /** O canal do eixo de cima. Padrão: brilho (HSB), luminosidade (HSL) ou verde (RGB). */
  yChannel?:Exclude<ColorChannel,"alpha">;
  /** Pontinhos por cima da área, como na referência — ajudam a ver a posição. */
  showDots?:boolean;
  disabled?:boolean;
  /** Vai no formulário como hex. */
  name?:string;
  id?:string;className?:string;
  "aria-label"?:string;"aria-labelledby"?:string;"aria-describedby"?:string}
const EIXOS_PADRAO:Record<ColorSpace,[ColorChannel,ColorChannel]>={hsb:["saturation","brightness"],hsl:["saturation","lightness"],rgb:["red","green"]};
export function ColorArea({value,defaultValue,onValueChange,onValueCommitted,colorSpace,xChannel,yChannel,...resto}:ColorAreaProps){
  const [cor,mudar]=useCor(value,defaultValue,onValueChange,onValueCommitted);
  const space=espacoDosCanais(colorSpace,...[xChannel,yChannel].filter((c):c is Exclude<ColorChannel,"alpha">=>!!c));
  const [x,y]=[xChannel??EIXOS_PADRAO[space][0],yChannel??EIXOS_PADRAO[space][1]];
  return <AreaDeCor {...resto} cor={cor} onCor={mudar} space={space} x={x} y={y}/>;
}

// ColorField (0.32.0, ADR-0069 — o Victor, 14/10/2026: "Pode, componente novo") — o campo de cor da referência: o
// `InputGroup` com a amostra na frente e o `Input` da Aurea (as mesmas peles: `size`, `variant`), como o
// `SearchField`. Dentro do `Field`, o rótulo, a descrição e o erro são os dele. Dois modos, como na referência:
//   • o CÓDIGO (o padrão): aceita hex, `rgb()`, `hsl()` e `hsb()`; vale no Enter ou ao sair do campo (como o
//     código do `ColorPicker`); texto que não é cor VOLTA ao de antes; texto vazio LIMPA (avisa com "").
//   • UM CANAL (`channel`): o número do canal, na faixa dele, com as setas, Page Up/Down e Home/End — anunciado
//     como campo numérico (`spinbutton`), com o valor escrito ("208°", "80%").
// Dentro de um `ColorPicker`, sem valor próprio, ele reparte a cor do seletor.
export interface ColorFieldProps{
  /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`; `""` é o campo vazio. Controlado. */
  value?:string;
  /** A cor de partida quando você não controla. Sem ela, o campo começa vazio. */
  defaultValue?:string;
  /** Chamado ao confirmar (Enter ou sair do campo) e a cada tecla no canal, com o hex — ou `""`, ao limpar. */
  onValueChange?:(value:string)=>void;
  /** Chamado junto do `onValueChange` — o momento de salvar. */
  onValueCommitted?:(value:string)=>void;
  /** Um canal só, no lugar do código: `hue`, `saturation`, `brightness`, `lightness`, `red`, `green`, `blue`, `alpha`. */
  channel?:ColorChannel;
  /** O espaço de `hue` e `saturation` no modo canal (`hsb` ou `hsl`). Padrão: `hsb`. */
  colorSpace?:ColorSpace;
  /** A amostra na frente. Padrão: sim no código, não no canal. */
  swatch?:boolean;
  size?:Responsive<FieldSize>;
  /** `secondary` é o fundo neutro, para o campo dentro de um cartão (o mesmo do `Input`). */
  variant?:FieldVariant;
  /** A largura do campo — `"20rem"` ou `"auto"`. Sem ela, 100% da linha, como os outros campos. */
  width?:string;
  disabled?:boolean;readOnly?:boolean;required?:boolean;
  /** Vai no formulário como hex. */
  name?:string;
  placeholder?:string;
  id?:string;className?:string;
  "aria-label"?:string;"aria-labelledby"?:string;"aria-describedby"?:string;"aria-invalid"?:boolean|"true"|"false"}
export function ColorField({value,defaultValue,onValueChange,onValueCommitted,channel,colorSpace,swatch,size,variant,width,disabled,readOnly,required,name,placeholder,id,className,...aria}:ColorFieldProps){
  const s=useAureaStrings();
  const doSeletor=React.useContext(CorDoSeletor);
  const [cor,mudar]=useCor(value===""?undefined:value,defaultValue,onValueChange,onValueCommitted);
  // Vazio: o valor "" de fora, ou sem valor nenhum e ainda não escrito (o campo da referência começa vazio).
  const [escrito,setEscrito]=React.useState(defaultValue!==undefined);
  const vazio=!doSeletor&&(value!==undefined?value==="":!escrito);
  const [rascunho,setRascunho]=React.useState<string|null>(null);
  const canal=channel;
  const space=canal?spaceOf(canal,colorSpace):"hsb";
  const faixa=canal?channelRange(canal):null;
  const v=canal?getChannel(cor,canal,space):0;
  const mostrado=vazio?"":canal?formatChannel(canal,v):corToHex(cor);
  const confirmar=()=>{
    if(rascunho===null)return;
    const t=rascunho.trim();
    setRascunho(null);
    if(t===""){
      if(canal)return;
      setEscrito(false);onValueChange?.("");onValueCommitted?.("");return;
    }
    if(canal){
      const n=Number(t.replace(/[°%\s]/g,"").replace(",","."));
      if(!Number.isFinite(n))return;
      mudar(setChannel(cor,canal,canal==="alpha"&&(n>1||/%/.test(t))?n/100:n,space),true);
      return;
    }
    const nova=parseColor(t);
    if(!nova)return;
    setEscrito(true);
    mudar(corDoTexto(t,cor),true);
  };
  const aoTeclar=(e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==="Enter"){e.preventDefault();confirmar();return;}
    if(!canal||!faixa||disabled||readOnly)return;
    const passo=e.key==="ArrowUp"?faixa.step:e.key==="ArrowDown"?-faixa.step:e.key==="PageUp"?faixa.page:e.key==="PageDown"?-faixa.page:0;
    const alvo=e.key==="Home"?faixa.min:e.key==="End"?faixa.max:passo?v+passo:null;
    if(alvo===null)return;
    e.preventDefault();
    setRascunho(null);
    mudar(setChannel(cor,canal,Math.round(alvo/faixa.step)*faixa.step,space),true);
  };
  const comAmostra=swatch??!canal;
  return <InputGroup className={className} width={width}>
    {comAmostra&&<InputGroupAddon><ColorSwatch color={vazio?"transparent":corToHex(cor)} size="sm" aria-hidden="true"/></InputGroupAddon>}
    <Input id={id} size={size} variant={variant} value={rascunho??mostrado} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
      required={required} spellCheck={false} autoComplete="off" inputMode={canal?"decimal":undefined}
      role={canal?"spinbutton":undefined} aria-valuenow={canal?v:undefined} aria-valuemin={faixa?.min} aria-valuemax={faixa?.max}
      aria-valuetext={canal?`${formatChannel(canal,v)}, ${colorName(hsbToRgb(cor),s)}`:undefined}
      {...aria} onChange={(e)=>setRascunho(e.target.value)} onBlur={confirmar} onKeyDown={aoTeclar}/>
    {name&&<input type="hidden" name={name} value={vazio?"":corToHex(cor)}/>}
  </InputGroup>;
}

// ColorPicker (0.32.0, ADR-0069 — o Victor: "ColorPicker componente") — o seletor de cor da referência: o gatilho
// é a amostra com o nome; a janela traz a área, a trilha do matiz e o CAMPO DO CÓDIGO, que está sempre lá (o
// Victor: "sempre com campo do código e teclado" — baixa visão). Com `swatches`, as amostras também. A variação
// `variant="swatches"` é a "C": a paleta fechada — só as amostras e o código, sem a área e a trilha.
// O CONTEÚDO PODE SER MONTADO (`children`), como na referência ("com campos", "com trilhas"): as peças de cor de
// dentro — `ColorArea`, `Slider` com `channel`, `ColorField` — sem valor próprio repartem a cor do seletor.
// As peças são as da Aurea: a área e a trilha pelas internas (a cor de dentro direto, para o matiz não se perder no
// cinza), o `ColorSwatch` com `options` (com o nome de cada cor na língua do app) e o `InputGroup`.
// O código só vale ao confirmar (Enter ou sair do campo); texto que não é cor volta ao valor de antes.
export interface ColorPickerProps{
  /** O nome, ao lado da amostra no gatilho ("Cor da marca"). Nomeia o gatilho e a janela. */
  label:string;
  /** A cor, em hex ou `rgb()`/`hsl()`/`hsb()`. Controlado. */
  value?:string;
  /** A cor de partida quando você não controla. Padrão: branco. */
  defaultValue?:string;
  /** Chamado a cada passo, com o hex (`#rrggbb`, ou `#rrggbbaa` com transparência). */
  onValueChange?:(value:string)=>void;
  /** Chamado ao soltar, a cada tecla, ao escolher uma amostra e ao confirmar o código — o momento de salvar. */
  onValueCommitted?:(value:string)=>void;
  /** Cores prontas, embaixo da trilha; com `variant="swatches"`, no lugar da área. Hex ou `{color, label}`. */
  swatches?:readonly (string|ColorSwatchOption)[];
  /** `"swatches"`: a paleta fechada — só as amostras e o campo do código. Padrão: `"full"`. */
  variant?:"full"|"swatches";
  /** O conteúdo da janela, montado por quem usa (no lugar do padrão): `ColorArea`, `Slider` com `channel`,
   *  `ColorField` e o que mais couber. As peças de cor sem valor próprio usam a cor do seletor. */
  children?:ReactNode;
  disabled?:boolean;
  /** Vai no formulário como hex. */
  name?:string;
  id?:string;className?:string}
export function ColorPicker({label,value,defaultValue,onValueChange,onValueCommitted,swatches,variant="full",children,disabled,name,id,className}:ColorPickerProps){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const idGrupo=React.useId();
  const [cor,mudar]=useCor(value,defaultValue,onValueChange,onValueCommitted);
  const hex=corToHex(cor),nome=colorName(hsbToRgb(cor),s);
  const amostras=swatches?.map((o)=>{
    const op=typeof o==="string"?{color:o}:o;
    const c=parseColor(op.color);
    return {color:op.color,label:op.label??(c?colorName(hsbToRgb(c),s):op.color)};
  });
  const escolhida=amostras?.find((o)=>{const c=parseColor(o.color);return c!==null&&corToHex(c)===hex;})?.color??"";
  const contexto=React.useMemo(()=>({cor,mudar}),[cor,mudar]);
  // O seletor escuta o teclado e o ponteiro desde que MONTA: a área só monta ao abrir, DEPOIS do clique que abriu, e
  // a primeira abertura com o mouse acendia o anel (medido na bancada em 14/10/2026; o teste abria pelo teclado antes).
  React.useEffect(ouvirModalidade,[]);
  // O foco fica PRESO na janela (`trap-focus`), como na referência: com quatro peças dentro, o Tab que saía depois
  // do código fechava a janela (medido no navegador). O motor pede um botão de fechar dentro, para o leitor de tela
  // por toque sair; ele fica invisível e fora do Tab — quem usa teclado tem o Esc, e o foco nunca some na tela.
  return <BasePopover.Root modal="trap-focus">
    {/* O nome inteiro no `aria-label`, começando pelo texto que se vê (WCAG 2.5.3): com a cor num texto escondido,
        os navegadores punham um espaço antes da vírgula ("Brand colour , vivid blue") — medido nos três. */}
    <BasePopover.Trigger disabled={disabled} id={id} aria-label={`${label}, ${nome}`} className={cx("color-picker-trigger",className)}>
      <ColorSwatch color={hex} aria-hidden="true"/>
      <span>{label}</span>
    </BasePopover.Trigger>
    {name&&<input type="hidden" name={name} value={hex}/>}
    <BasePopover.Portal container={portal}>
      <BasePopover.Positioner className="positioner" side="bottom" align="start" sideOffset={6}>
        <BasePopover.Popup className="popover color-picker-popover" aria-label={label}>
          <CorDoSeletor.Provider value={contexto}>
            {children??<>
              {variant!=="swatches"&&<>
                <AreaDeCor cor={cor} onCor={mudar} space="hsb" x="saturation" y="brightness" aria-label={label}/>
                <TrilhaDeCor cor={cor} onCor={mudar} channel="hue" label={s.colorChannel.hue} labelHidden showValue={false}/>
              </>}
              {amostras&&<ColorSwatch options={amostras} name={`${idGrupo}-amostras`} label={s.colorSwatches} value={escolhida}
                onChange={(e:React.ChangeEvent<HTMLInputElement>)=>mudar(corDoTexto(e.target.value,cor),true)}/>}
              <ColorField aria-label={s.colorHex}/>
            </>}
          </CorDoSeletor.Provider>
          <BasePopover.Close className="sr-only" tabIndex={-1}>{s.close}</BasePopover.Close>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  </BasePopover.Root>;
}

// OTPField (Lote 1 do BUILDING.md). Um campo por dígito, com o comportamento que ninguém acerta
// à mão: colar o código inteiro distribui pelos campos, Backspace volta um, e o
// `autocomplete="one-time-code"` deixa o iOS oferecer o código do SMS. Tudo do motor.
// Uma referência resolve isto com um pacote npm separado; aqui não entra dependência nova —
// o `@base-ui/react`, que já é a única dependência de runtime da biblioteca, tem `otp-field`.
// `length` é obrigatório de propósito: sem ele o campo não sabe quando está completo.
// CADA caixa leva nome próprio, e não só o grupo. O `catalog-sweep` pegou isto no primeiro
// lote: com `aria-label` só na raiz, o axe acusou `label` em todas as seis — seis campos de
// formulário anônimos. Um leitor de tela anunciaria "editar texto" seis vezes seguidas sem
// dizer qual é qual. O grupo continua nomeado (`role="group"`), que é o que diz para que serve
// o código; o nome de cada caixa é o que diz onde você está.
// 15/10/2026 (o Victor: "A, B, C, pode"), como o campo de código da referência: `groupSize` põe o TRACINHO a cada N
// caixas (o 3 + 3 da vitrine dela; o `Separator` do motor, de 6 × 2), e `variant="secondary"` dá às caixas o fundo
// neutro do `Input` secundário. Sem os dois, a marcação é a de antes.
export function OTPField({length,value,defaultValue,onValueChange,mask,disabled,required,label,id,className,groupSize,variant}:{length:number;value?:string;defaultValue?:string;onValueChange?:(v:string)=>void;mask?:boolean;disabled?:boolean;required?:boolean;label?:string;id?:string;className?:string;
  /** O tracinho entre os grupos: a cada `groupSize` caixas (3 num código de 6). */
  groupSize?:number;
  /** `secondary`: o fundo neutro do `Input` secundário, para o campo dentro de um cartão. */
  variant?:"primary"|"secondary"}){
const s=useAureaStrings();
return <BaseOTPField.Root id={id} length={length} value={value} defaultValue={defaultValue} onValueChange={soOValor(onValueChange)} mask={mask} disabled={disabled} required={required} role="group" aria-label={label} className={cx("otp-field",className)}>
{/* Duas coisas medidas no Base UI 1.6.0, e as duas custaram uma volta:
    1. O índice de cada campo é do MOTOR, pela ordem no DOM — `index` não é prop.
    2. `aria-label` passado direto no `Input` é DESCARTADO no PRIMEIRO campo (só nele), com ou
       sem rótulo na raiz. Medido: o axe acusou `label` justamente nele. Pelo `render` o
       atributo sobrevive, e todos os outros que o motor injeta (autocomplete=one-time-code,
       pattern, enterKeyHint, tabindex) continuam intactos — conferido no markup emitido. */}
{Array.from({length},(_,i)=><React.Fragment key={i}><BaseOTPField.Input render={<input aria-label={`${s.otpDigit} ${i+1}`}/>} className={cx("input otp-slot",variant==="secondary"&&"input-secondary")}/>
  {groupSize&&groupSize>0&&(i+1)%groupSize===0&&i<length-1?<BaseOTPField.Separator className="otp-separator"/>:null}</React.Fragment>)}
</BaseOTPField.Root>}
// SegmentedControl — achado M20, fechado na Parte C do PLANO-1.0 em 07/08/2026.
//
// O DEFEITO: era `role="group"` com N botões de `aria-pressed`. Isso descreve N alternâncias
// INDEPENDENTES — cada botão anuncia "pressionado/não pressionado", nada diz que só um pode
// valer, e nunca se ouve "1 de 2". Para escolha única entre poucas opções o padrão APG é
// `radiogroup`, e a diferença é o que o leitor de tela consegue prometer.
// A troca mudou a semântica de um componente publicado, então foi registrada: ADR-0016.
//
// O MOTOR ENTREGA, ENTÃO NÃO ESCREVEMOS (BUILDING.md §1). O `RadioGroup` do Base UI 1.6 traz o
// padrão inteiro: roving tabindex, setas que movem E selecionam, Home/End, e `aria-checked`.
// Escrever isso à mão seria reimplementar um composite que já está testado.
//
// `render={<button type="button"/>}` não é enfeite, e a medição de 07/08 é que disse: o
// `Radio.Root` renderiza um `<span>` por padrão, e a pele da Aurea é `.segmented button`. Sem
// isso o componente perderia a pele inteira — e o check 18 não veria, porque ele olha CLASSE.
// O motor também emite um `<input type="radio">` escondido por item (para envio de formulário);
// ele é `position:fixed` e `aria-hidden`, então não entra no flex nem na árvore de acessibilidade.
//
// E `nativeButton` é o par obrigatório do `render` acima — medido em 11/08/2026. O `Radio.Root`
// declara `nativeButton = false` por padrão (é o valor certo para o `<span>` que ele renderiza
// sozinho), e o `useButton` do motor CONFERE isso no DOM montado, dentro de um efeito: sem esta
// palavra sai um `console.error` do Base UI a cada montagem de CLIENTE. Não no catálogo, que é
// HTML estático — no console de quem INSTALA.
// O DOM foi medido nos dois lados antes da troca. O `role="button"` que a mensagem ameaça NÃO
// aparecia (o `role="radio"` do motor já vencia a fusão); o que muda de fato é o `<input>`
// escondido perder o `id`, que migra para este botão — e migra para o lado certo, porque o botão
// é o rádio e o input é `aria-hidden`. Comportamento idêntico: Enter não seleciona, Espaço
// seleciona, a seta move E seleciona. O que sai é a camada sintética que o motor punha por cima
// da ativação nativa do `<button>`.
//
// `fullWidth` (A5, 06/10/2026): o mesmo nome e o mesmo desenho do nativo — o controle ocupa a
// linha e cada segmento CRESCE a partir do rótulo, sem encolher abaixo dele. É como o grupo
// de botões alternáveis da referência ocupa a linha.
// NAVEGAÇÃO (bloco 1, o 5-A — 23/10/2026): com `href` em TODOS os itens, a cápsula é um <nav> de links — o atual leva
// `aria-current="page"` —, e não um grupo de escolha: ir para outra página é navegação, e o leitor de tela tem de ouvir
// "link", não "opção". É a chave Web | Native do site. `size="sm"`: a cápsula baixa da referência (abas de 24).
export function SegmentedControl({items,value,onChange,label,fullWidth,size="md"}:{items:Array<{value:string;label:ReactNode;href?:string}>;value:string;onChange?:(v:string)=>void;label?:string;fullWidth?:boolean;size?:"sm"|"md"}){
const s=useAureaStrings();
const classe=cx("segmented",fullWidth&&"segmented-full",size==="sm"&&"segmented-sm");
if(items.length>0&&items.every(i=>i.href!=null))return <nav className={classe} aria-label={label??s.optionsLabel}>{items.map(i=><a key={i.value} href={i.href} className={i.value===value?"active":undefined} aria-current={i.value===value?"page":undefined}>{i.label}</a>)}</nav>;
return <BaseRadioGroup className={classe} aria-label={label??s.optionsLabel} value={value} onValueChange={v=>onChange?.(String(v))}>
{items.map(i=><BaseRadio.Root key={i.value} value={i.value} className={i.value===value?"active":undefined} nativeButton render={<button type="button"/>}>{i.label}</BaseRadio.Root>)}
</BaseRadioGroup>}


// Combobox básico: input + lista filtrável de item único. O filtro é do Base UI
// (via items + itemToStringLabel). Multi-seleção/async ficam para a Fase 4.
export interface ComboboxOption{value:string;label:string}
// ── AGRUPAMENTO, REPORTADO no merge de 28/08/2026 ───────────────────────────────────────────
// O `Combobox` de seleção única agrupava na outra linhagem e voltou a não agrupar quando este
// arquivo entrou inteiro da `main`. A perda foi silenciosa pelo mesmo motivo do `Tabs` e do
// `NumberField`: a conferência comparou NOMES, e `Combobox` existe nos dois lados.
//
// COMO O MOTOR RECEBE ITEM AGRUPADO — medido lendo o `AriaCombobox` do Base UI 1.6.0, não
// presumido. É a MESMA prop `items`: o tipo é `readonly any[] | readonly Group<any>[]`, e `Group`
// é só `{items: Item[]}` com o resto das chaves livre, então `{label, items}` serve sem
// adaptador. O motor achata para resolver rótulo e seleção, e filtra DENTRO de cada grupo,
// descartando o que ficou vazio e devolvendo `{...grupo, items: filtrados}`. Por isso o que chega
// ao `List` já vem filtrado, e no caso agrupado o que chega é o GRUPO.
//
// O PREDICADO É O DO MOTOR, letra por letra. Havia dois — o dele, que decide o FILTRO, e um
// local, que decidia a MARCAÇÃO — e bastava discordarem para a lista sair com marcação de grupo
// e conteúdo plano. O `typeof === "object" && != null` não é zelo: `"items" in x` LANÇA
// TypeError em primitivo, onde o do motor devolve `false`.
export interface ComboboxOptGroup{label:string;items:ComboboxOption[]}
const ehAgrupado=(items:ComboboxOption[]|ComboboxOptGroup[]):items is ComboboxOptGroup[]=>
  items!=null&&items.length>0&&typeof items[0]==="object"&&items[0]!=null&&"items" in items[0];
// UM renderizador e UMA lista para os dois combobox: duas cópias da mesma árvore é como a
// segunda fica para trás na mudança seguinte.
// A COLUNA DO CHECK EXISTE SEMPRE (A-01, 23/09/2026). O `ItemIndicator` do Base UI não põe
// NADA no DOM quando o item não está escolhido; com um filho só, o texto caía na primeira coluna
// da grade — a de 16px — e quebrava em duas ou três linhas. O invólucro fica montado sempre, como
// o `.menu-mark` do `Menu` já faz, e o indicador aparece e some DENTRO dele.
const renderComboboxItem=(item:ComboboxOption)=><BaseCombobox.Item key={item.value} value={item} className="menu-item combobox-item">
  <span className="combobox-check" aria-hidden="true"><BaseCombobox.ItemIndicator><Icon name="check" size="sm"/></BaseCombobox.ItemIndicator></span>
  <span>{item.label}</span>
</BaseCombobox.Item>;
const listaCombobox=(items:ComboboxOption[]|ComboboxOptGroup[])=><BaseCombobox.List>
  {ehAgrupado(items)
    ?(group:ComboboxOptGroup)=><BaseCombobox.Group key={group.label} items={group.items} className="combobox-section">
        <BaseCombobox.GroupLabel className="combobox-group-label">{group.label}</BaseCombobox.GroupLabel>
        <BaseCombobox.Collection>{renderComboboxItem}</BaseCombobox.Collection>
      </BaseCombobox.Group>
    :renderComboboxItem}
</BaseCombobox.List>;
// `aria-describedby` e `aria-invalid` são explícitos e não caem em `...props` por acidente: este
// componente destrincha uma lista fixa, então o que não está aqui é DESCARTADO em silêncio — e era
// exatamente isso que fazia o `Field` não alcançar o input do Combobox (AUD-0001, 12/08/2026).
// Vão para o `Input`, que é o nó focal: no contêiner eles não seriam anunciados.
// `disabled` vai na ROOT, não no Input: `Input`, `Trigger`, `Clear` e `ChipRemove` leem todos o
// mesmo `selectors.disabled` do store do Base UI (@base-ui/react 1.6.0). Desabilitar o Input
// deixaria os dois botões vivos — abrir a lista de um campo desabilitado é o defeito, não o texto.
export function Combobox({items,value,onValueChange,placeholder,label,empty,disabled,size,id,className,"aria-describedby":descrito,"aria-invalid":invalido,"aria-label":rotulo}:{items:ComboboxOption[]|ComboboxOptGroup[];empty?:ReactNode;value?:ComboboxOption|null;onValueChange?:(v:ComboboxOption|null)=>void;placeholder?:string;label?:ReactNode;disabled?:boolean;size?:Responsive<FieldSize>;id?:string;className?:string;"aria-describedby"?:string;"aria-invalid"?:boolean|"true"|"false";
  /** C-01 (24/09/2026): nome para o leitor de tela quando não há `label` visível — um filtro numa
   *  grade sem rótulos. Vai direto para o campo. Com `label`, prefira o `label`. */
  "aria-label"?:string}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const autoId=React.useId();
  const inputId=id??autoId;
  return <BaseCombobox.Root items={items} value={value} onValueChange={soOValor(onValueChange)} disabled={disabled} itemToStringLabel={(i:ComboboxOption)=>i.label}>
    <div className={cx("field",className)}>
      {/* <label> nativo, não Combobox.Label: este associa ao TRIGGER, deixando o
          input sem nome acessível e sobrescrevendo o aria-label do botão. */}
      {label&&<label className="label" htmlFor={inputId}>{label}</label>}
      <BaseCombobox.InputGroup className="combobox-group">
        <BaseCombobox.Input id={inputId} placeholder={placeholder} className={cx("input",peleDoEixo("input",size))} aria-describedby={descrito} aria-invalid={invalido} aria-label={rotulo}/>
        <span className="combobox-actions">
          <BaseCombobox.Clear render={<IconButton variant="ghost" size="sm" icon="x" label={s.comboboxClear}/>}/>
          <BaseCombobox.Trigger render={<IconButton variant="ghost" size="sm" icon="caret-down" label={s.comboboxOpen}/>}/>
        </span>
      </BaseCombobox.InputGroup>
    </div>
    <BaseCombobox.Portal container={portal}><BaseCombobox.Positioner className="positioner" sideOffset={6}>
      <BaseCombobox.Popup className="menu combobox-popup">
        <BaseCombobox.Empty className="combobox-empty">{empty??s.comboboxEmpty}</BaseCombobox.Empty>
        {listaCombobox(items)}
      </BaseCombobox.Popup>
    </BaseCombobox.Positioner></BaseCombobox.Portal>
  </BaseCombobox.Root>;
}
// MultiCombobox (Fase 4): multi-seleção com chips, opções agrupadas e filtro
// externo (async). Reusa .combobox-popup/-item/-empty do básico.
// - Agrupar: passar ComboboxOptGroup[] em items (label + items). Detecção pela
//   presença de .items no 1º elemento — não misturar plano com agrupado.
// - Async: passar onInputChange; o filtro interno do Base UI desliga
//   (filter={null}) e o consumidor troca os items conforme a busca retorna.
//   loading só troca o texto do vazio para não piscar "Nenhum resultado".

export function MultiCombobox({items,value,onValueChange,onInputChange,loading,placeholder,label,empty,disabled,id,className,"aria-describedby":descrito,"aria-invalid":invalido,"aria-label":rotulo}:{items:ComboboxOption[]|ComboboxOptGroup[];empty?:ReactNode;value?:ComboboxOption[];onValueChange?:(v:ComboboxOption[])=>void;onInputChange?:(query:string)=>void;loading?:boolean;placeholder?:string;label?:ReactNode;disabled?:boolean;id?:string;className?:string;"aria-describedby"?:string;"aria-invalid"?:boolean|"true"|"false";
  /** C-01 (24/09/2026): nome para o leitor de tela quando não há `label` visível — um filtro numa
   *  grade sem rótulos. Vai direto para o campo. Com `label`, prefira o `label`. */
  "aria-label"?:string}){
  const s=useAureaStrings();
  const portal=usePortalContainer();
  const autoId=React.useId();
  const inputId=id??autoId;
  return <BaseCombobox.Root multiple items={items} value={value} onValueChange={soOValor(onValueChange)} disabled={disabled} itemToStringLabel={(i:ComboboxOption)=>i.label} filter={onInputChange?null:undefined} onInputValueChange={onInputChange?((v:string,d:{reason:string})=>{if(d.reason!=="item-press")onInputChange(v)}):undefined}>
    <div className={cx("field",className)}>
      {label&&<label className="label" htmlFor={inputId}>{label}</label>}
      <BaseCombobox.InputGroup className="combobox-multi">
        <BaseCombobox.Chips className="combobox-chips">
          <BaseCombobox.Value>
            {(selected:ComboboxOption[])=><>
              {selected.map((item:ComboboxOption)=><BaseCombobox.Chip key={item.value} className="combobox-chip">
                {item.label}
                <BaseCombobox.ChipRemove className="combobox-chip-remove" aria-label={`${s.comboboxRemove} ${item.label}`}><Icon name="x" size="sm"/></BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>)}
              <BaseCombobox.Input id={inputId} placeholder={selected.length?undefined:placeholder} className="combobox-chip-input" aria-describedby={descrito} aria-invalid={invalido} aria-label={rotulo}/>
            </>}
          </BaseCombobox.Value>
        </BaseCombobox.Chips>
        <span className="combobox-actions">
          <BaseCombobox.Clear render={<IconButton variant="ghost" size="sm" icon="x" label={s.comboboxClear}/>}/>
          <BaseCombobox.Trigger render={<IconButton variant="ghost" size="sm" icon="caret-down" label={s.comboboxOpen}/>}/>
        </span>
      </BaseCombobox.InputGroup>
    </div>
    <BaseCombobox.Portal container={portal}><BaseCombobox.Positioner className="positioner" sideOffset={6}>
      <BaseCombobox.Popup className="menu combobox-popup">
        <BaseCombobox.Empty className="combobox-empty">{loading?s.comboboxLoading:(empty??s.comboboxEmpty)}</BaseCombobox.Empty>
        {listaCombobox(items)}
      </BaseCombobox.Popup>
    </BaseCombobox.Positioner></BaseCombobox.Portal>
  </BaseCombobox.Root>;
}

// ── Select (A-02 e B-08, 24/09/2026) ────────────────────────────────────────────────────────
// A LISTA É DA AUREA, NÃO DO SISTEMA OPERACIONAL. Até a 0.8.9 o `Select` era o `<select>` nativo, e
// a lista que ele abre é desenhada pelo navegador: canto reto, azul do Windows, fonte do sistema —
// CSS de autor não a alcança. Sem outra escolha fechada com a pele da casa, um app real pôs cinco
// resoluções e seis ordenações atrás do `Combobox`, que é sempre um campo de BUSCA. O Victor viu a
// busca numa lista de cinco e decidiu: o `Select` passa a ser o padrão Aurea, sem componente novo.
//
// A FORMA DE ESCREVER NÃO MUDA. `<option>` e `<optgroup>` dentro, `value`/`defaultValue` em string,
// `onChange` lendo `e.target.value`, `name`, `disabled`, `size` — o que funcionava continua
// funcionando. Por baixo é o `Select` do Base UI, a MESMA base do `Combobox`: o gatilho veste a pele
// `.select` (a cápsula e a seta de sempre) e a lista veste a pele da lista do `Combobox` (painel,
// raio de 18px, coluna do check). `items` é a forma nova, para quem monta a lista a partir de dados.
//
// O QUE MUDOU DE VERDADE, e é por isso que está escrito: o nó é um <button> (papel `combobox`), não
// um <select>. O `ref` aponta para ele. E sem `value`, `defaultValue` nem `placeholder` o primeiro
// item vem escolhido — é o que o <select> nativo fazia, e quem dependia disso não percebe a troca.
// `alignItemWithTrigger={false}`: o padrão do motor abre a lista POR CIMA do gatilho (jeito do macOS);
// nesta casa as listas abrem embaixo, e duas maneiras de abrir o mesmo desenho seria o defeito.
export interface SelectOption{value:string;label:ReactNode;disabled?:boolean}
export interface SelectOptGroup{label:ReactNode;items:SelectOption[]}
type SelectChange={target:{value:string;name?:string};currentTarget:{value:string;name?:string}};
export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,"value"|"defaultValue"|"onChange"|"name">,RefAttributes<HTMLButtonElement>{
  items?:SelectOption[]|SelectOptGroup[];value?:string;defaultValue?:string;onChange?:(e:SelectChange)=>void;
  onValueChange?:(value:string)=>void;placeholder?:ReactNode;name?:string;required?:boolean;size?:Responsive<FieldSize>}
const ehGrupoDoSelect=(i:SelectOption|SelectOptGroup):i is SelectOptGroup=>typeof i==="object"&&i!=null&&"items" in i;
// Lê `<option>`/`<optgroup>` como o navegador lê: `value` ausente vale o TEXTO da opção.
function opcoesDosFilhos(children:ReactNode):(SelectOption|SelectOptGroup)[]{
  const lista:(SelectOption|SelectOptGroup)[]=[];
  React.Children.forEach(children,filho=>{
    if(!React.isValidElement(filho))return;
    const pr=filho.props as {value?:unknown;children?:ReactNode;disabled?:boolean;label?:ReactNode};
    if(filho.type==="option")lista.push({value:String(pr.value??React.Children.toArray(pr.children).join("")),label:pr.children,disabled:pr.disabled});
    else if(filho.type==="optgroup")lista.push({label:pr.label,items:opcoesDosFilhos(pr.children) as SelectOption[]});
    else if(filho.type===React.Fragment)lista.push(...opcoesDosFilhos(pr.children));
  });
  return lista;
}
const itemDoSelect=(o:SelectOption)=><BaseSelect.Item key={o.value} value={o.value} disabled={o.disabled} className="menu-item combobox-item">
  <span className="combobox-check" aria-hidden="true"><BaseSelect.ItemIndicator><Icon name="check" size="sm"/></BaseSelect.ItemIndicator></span>
  <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
</BaseSelect.Item>;
export const Select=forwardRef<HTMLButtonElement,SelectProps>(function Select({items,children,value,defaultValue,onChange,onValueChange,placeholder,name,required,disabled,size,className,...props},ref){
  const portal=usePortalContainer();
  const lista=items??opcoesDosFilhos(children);
  const planas=lista.flatMap(i=>ehGrupoDoSelect(i)?i.items:[i]);
  const inicial=value===undefined&&defaultValue===undefined&&placeholder===undefined?planas.find(o=>!o.disabled)?.value:defaultValue;
  const mudar=(v:string|null)=>{
    const valor=v??"";
    onValueChange?.(valor);
    onChange?.({target:{value:valor,name},currentTarget:{value:valor,name}});
  };
  return <BaseSelect.Root items={planas.map(o=>({value:o.value,label:o.label}))} {...(value!==undefined?{value}:{defaultValue:inicial})}
    onValueChange={v=>mudar(v as string|null)} name={name} required={required} disabled={disabled}>
    <BaseSelect.Trigger ref={ref} className={cx("select","select-trigger",peleDoEixo("select",size),className)} {...props}>
      <BaseSelect.Value placeholder={placeholder} className="select-value"/>
    </BaseSelect.Trigger>
    <BaseSelect.Portal container={portal}><BaseSelect.Positioner className="positioner" sideOffset={6} alignItemWithTrigger={false}>
      <BaseSelect.Popup className="menu combobox-popup">
        <BaseSelect.List>
          {lista.map((i,n)=>ehGrupoDoSelect(i)
            ?<BaseSelect.Group key={n} className="combobox-section">
                <BaseSelect.GroupLabel className="combobox-group-label">{i.label}</BaseSelect.GroupLabel>
                {i.items.map(itemDoSelect)}
              </BaseSelect.Group>
            :itemDoSelect(i))}
        </BaseSelect.List>
      </BaseSelect.Popup>
    </BaseSelect.Positioner></BaseSelect.Portal>
  </BaseSelect.Root>;
});

// ── BlockEditor (PLANO-1.0, item N1) ─────────────────────────────────────────────────────────
// A DECISÃO QUE O ITEM MANDAVA TOMAR ANTES DE ESCREVER está na
// [ADR-0025](../../../decisions/0025-editor-por-blocos-sem-motor.md): a Aurea entrega a PELE DOS
// BLOCOS e o motor de texto rico fica com o consumidor. Não é preferência — é o que a medição
// devolveu, em quatro partes:
//
// 1. A REFERÊNCIA NÃO É O MESMO COMPONENTE, e essa é a primeira pergunta do `BUILDING.md` §2
//    passo 2. O `editor` de uma das referências (na pasta `Referencia/`) tem 39 exports e é feito sobre um
//    motor de texto rico de terceiro, com 17 dependências no `package.json` — e é um editor de DOCUMENTO ÚNICO:
//    negrito, itálico, tabelas, menu-bolha. Ele não tem lista de blocos, não tem reordenação e
//    não tem bloco de imagem com legenda. Anatomia de bloco, ali, não existe para copiar.
// 2. EMBRULHAR O MOTOR CUSTARIA A TODO CONSUMIDOR. É a conta que o `Chart` e o `Calendar` já
//    pagaram de propósito em subpath próprio — mas lá o motor ERA o componente. Aqui o que o
//    item descreve ("texto, imagem com legenda") é moldura, e moldura não justifica um motor de texto rico
//    no pacote de quem só quer um artigo.
// 3. O QUE FALTAVA JÁ ESTAVA QUASE TODO AQUI, medido no passo 1: `Prose` (L5) desenha a saída,
//    `Image` (L4) é o bloco de imagem, `Textarea` e `Field` são a entrada, `Toolbar` é a barra.
//    O buraco era a MOLDURA — ordem, alça, remoção, e o lugar onde o editor do consumidor entra.
// 4. SEGURANÇA, e esta é a razão que fecha a porta. Editor que é dono do texto rico é dono da
//    colagem, e o navegador NÃO sanitiza HTML colado: quem cola vira XSS. A pesquisa de 15/08
//    confirma que os motores de texto rico de mercado tratam o `contenteditable` como ALVO de renderização e
//    nunca como fonte da verdade, justamente por isso. A Aurea não pode decidir o que é seguro
//    renderizar no domínio do consumidor — é a mesma frase que a ficha do `Prose` já diz em voz
//    alta. Entregando a moldura, a superfície de colagem continua com quem tem o contexto.
//
// O QUE ESTE COMPONENTE NÃO TEM, declarado: nada de negrito/itálico (é do motor do consumidor),
// nada de menu-bolha, nada de barra de formatação, e nada de `onInsert`. O último é YAGNI
// medido, não esquecimento: acrescentar bloco é APENDAR na coleção do consumidor, e a
// reordenação daqui leva o novo bloco a qualquer posição. Uma costura de inserção entre blocos
// seria uma segunda forma de fazer a mesma coisa.
//
// CONTROLADO, como a `SortableList`, a `Gallery` e as `Tabs`: `blocks` e os dois callbacks. O
// componente não guarda ordem nem conteúdo.
export interface EditorBlock{id:string;kind?:ReactNode;children:ReactNode}
export interface BlockEditorProps extends Omit<HTMLAttributes<HTMLOListElement>,"onReorder">,RefAttributes<HTMLOListElement>{
  blocks:EditorBlock[];onReorder:(from:number,to:number)=>void;onRemove?:(index:number)=>void;label?:string;
}
export function BlockEditor({blocks,onReorder,onRemove,label,className,...props}:BlockEditorProps){
  const s=useAureaStrings();
  const bid=React.useId();
  const n=blocks.length;
  // O protocolo de arrasto acessível é o MESMO da `SortableList` — extraído para o `internal` em
  // vez de copiado, porque duas cópias garantem que a próxima correção entre em uma só.
  const r=useReorder<HTMLOListElement>({count:n,order:blocks,onReorder,
    rowSelector:".block-item",handleSelector:".block-handle"});
  return <>
    <ol ref={r.ref} className={cx("block-editor",className)} aria-label={label??s.blockEditorLabel} {...props}>
      {blocks.map((b,i)=>{
        const kid=`${bid}k${i}`,hid=`${bid}h${i}`,rid=`${bid}r${i}`;
        return <li key={b.id} className="block-item" data-grabbed={r.pego===i||undefined}>
          {/* O conteúdo do bloco é do consumidor e é conteúdo de FLUXO — figura, legenda, campo.
              Por isso ele mora num `<div>` dentro do `<li>`, e não no `<span>` que a
              `SortableList` usa: `<span>` só aceita conteúdo de frase, e uma `<figure>` ali
              dentro é marcação inválida que o navegador reescreve. Foi o motivo medido de este
              componente existir em vez de virar uma prop da `SortableList`. */}
          <div className="block-rail">
            {/* Os dois botões são nomeados pelo próprio texto MAIS o rótulo do bloco: sai
                "Reordenar, Imagem 2 de 5, botão", sem o consumidor mandar o texto duas vezes. */}
            <button type="button" id={hid} className="block-handle" aria-labelledby={`${hid} ${kid}`}
              aria-describedby={`${bid}ajuda`} aria-pressed={r.pego===i}
              onKeyDown={e=>r.teclado(e,i)} onPointerDown={e=>r.ponteiroBaixo(e,i)}
              onPointerMove={r.ponteiroMove} onPointerUp={r.ponteiroSolta} onPointerCancel={r.ponteiroSolta}>
              <Icon name="dots-six"/><span className="sr-only">{s.sortableHandle}</span>
            </button>
            {onRemove&&<button type="button" id={rid} className="block-remove" aria-labelledby={`${rid} ${kid}`}
              onClick={()=>onRemove(i)}>
              <Icon name="trash"/><span className="sr-only">{s.blockRemove}</span>
            </button>}
          </div>
          <div className="block-body">{b.children}</div>
          {/* A posição vai no NOME dos controles e não numa região viva: aqui ela é permanente
              ("Imagem 2 de 5"), enquanto a região viva abaixo é o que MUDOU agora. */}
          <span id={kid} className="sr-only">{b.kind??s.blockLabel} {i+1} {s.positionOf} {n}</span>
        </li>;
      })}
    </ol>
    <span id={`${bid}ajuda`} className="sr-only">{s.sortableHelp}</span>
    <div role="status" aria-live="polite" className="sr-only">{r.aviso}</div>
  </>;
}

// ── PORTADO da linhagem da ATIVIDADE-2 no merge de 28/08/2026 ───────────────────────────────
// Não existia na `main`. Fica no módulo de CLIENTE porque guarda estado (`useState` do
// mostrar/ocultar); a moldura (`InputGroup`) vem do `markup`, que é servidor.
// CAMPO DE SENHA com mostrar/ocultar. Duas das nove referências têm (com nomes diferentes
// em cada uma) e as duas convergem na anatomia: o campo, um botão ao FIM dele,
// `aria-controls` apontando para o campo, e o rótulo do botão mudando com o estado.
//
// O rótulo que muda é o anúncio — não há `aria-pressed`. Com os dois, o leitor de tela diz duas
// vezes a mesma coisa ("Mostrar senha, não pressionado"), e nenhuma das duas referências faz isso.
//
// O `type` é do componente e não passa: um campo de senha que aceitasse `type` deixaria de ser um.
export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>,"size"|"type">,RefAttributes<HTMLInputElement>{size?:Responsive<FieldSize>;defaultVisible?:boolean}
export function PasswordField({className,size,defaultVisible=false,id,...props}:PasswordFieldProps){
  const s=useAureaStrings();
  const [visivel,setVisivel]=React.useState(defaultVisible);
  const auto=React.useId();
  const campoId=id??auto;
  return <InputGroup className={className}>
    {/* O DEGRAU SAI COMO CLASSE, e não pela prop `size` do `Input`. Hoje os dois dariam no
        mesmo — o `size` do `Input` é o degrau do sistema desde 28/08/2026 —, mas emitir a
        classe aqui deixa o caminho explícito e sobrevive a `Input` mudar de ideia. É a mesma
        classe que o core pinta (`peleDoEixo`). */}
    <Input id={campoId} type={visivel?"text":"password"} className={peleDoEixo("input",size)||undefined} autoComplete="current-password" {...props}/>
    <InputGroupAddon side="end" layout="inline">
      <IconButton variant="ghost" size={valorBase(size)==="lg"?"md":"sm"}
        icon={visivel?"eye-slash":"eye"} label={visivel?s.passwordHide:s.passwordShow}
        aria-controls={campoId} onClick={()=>setVisivel(v=>!v)}/>
    </InputGroupAddon>
  </InputGroup>;
}
