"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type HTMLAttributes, type RefAttributes, type ReactNode} from "react";
import {useRender} from "@base-ui/react/use-render";
import {cx, useAureaStrings} from "./internal.js";
import {Icon} from "./system.js";
import {IconButton} from "./actions.js";
// A galeria AMPLIA num Dialog, e o Dialog já existe (trava do item L2). O import é para `overlays`,
// que como este módulo mora no "resto" do DAG e não importa `media` — não há ciclo.
import {Dialog} from "./overlays.js";

// MediaPlayer (Fase 5): headless sobre <video>/<audio> nativos — o MOTOR de mídia é
// o browser; o componente só liga estado (play/tempo/buffer/volume/legenda) às
// classes .media-* já existentes. Sem CSS estrutural novo: o vídeo preenche o
// .media-viewport por style inline no elemento (não por regra no stylesheet), então
// o core e os baselines dos docs não mudam.
// A11y (o APG não fecha player; prática corrente pesquisada 07/2026): os controles
// são <button> nativos com aria-label que troca de estado (Reproduzir/Pausar,
// Silenciar/Ativar som) e a barra é <input type="range"> nativo — um slider de
// verdade, com setas/Home/End vindos do browser — cujo aria-valuetext lê o tempo por
// extenso (o número cru "243" não se entende; "4 minutes and 3 seconds" sim). Nada de
// role="slider" à mão. SEM atalho global de teclado: cada controle é focável e opera
// pelo próprio elemento nativo, então play/pause/seek/volume por teclado saem sem
// interceptar — interceptar quebraria digitação e não é padrão APG. O tempo por
// extenso é helper embutido em inglês (não i18n — como o formatSize do FileInput);
// os rótulos de botão passam pela i18n como todo controle.
function clockTime(sec:number):string{if(!Number.isFinite(sec)||sec<0)sec=0;const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,"0")}`}
export function spokenTime(sec:number):string{if(!Number.isFinite(sec)||sec<0)sec=0;const m=Math.floor(sec/60),s=Math.floor(sec%60);const mp=m===1?"minute":"minutes",sp=s===1?"second":"seconds";return m&&s?`${m} ${mp} and ${s} ${sp}`:m?`${m} ${mp}`:`${s} ${sp}`}
export interface MediaPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>&RefAttributes<HTMLVideoElement>,"title">{kind?:"video"|"audio";title?:ReactNode;subtitle?:ReactNode}
// Os handlers de mídia do consumidor são COMPOSTOS com os internos (não podem
// sobrescrevê-los: um onPlay externo silenciaria o estado playing e o botão
// ficaria em "Reproduzir" — auditoria 18/07/2026, MÉDIO 2).
export function MediaPlayer({kind="video",src,poster,title,subtitle,className,children,onClick,onPlay,onPause,onEnded,onTimeUpdate,onLoadedMetadata,onDurationChange,onProgress,onVolumeChange,...rest}:MediaPlayerProps){
  const s=useAureaStrings();
  const boxRef=React.useRef<HTMLDivElement>(null);
  const mediaRef=React.useRef<HTMLVideoElement>(null);
  const [playing,setPlaying]=React.useState(false);
  const [current,setCurrent]=React.useState(0);
  const [duration,setDuration]=React.useState(0);
  const [buffered,setBuffered]=React.useState(0);
  const [volume,setVolume]=React.useState(1);
  const [muted,setMuted]=React.useState(false);
  const [hasCaptions,setHasCaptions]=React.useState(false);
  const [captionsOn,setCaptionsOn]=React.useState(false);
  const [fullscreen,setFullscreen]=React.useState(false);
  // fullscreenchange vem do document (não do elemento); é o único estado que exige
  // listener — o resto sincroniza pelos eventos de mídia do próprio <video>.
  React.useEffect(()=>{const on=()=>setFullscreen(document.fullscreenElement===boxRef.current);document.addEventListener("fullscreenchange",on);return ()=>document.removeEventListener("fullscreenchange",on)},[]);
  const m=()=>mediaRef.current;
  // ramifica pelo estado sincronizado (playing), não por el.paused: playing vem dos
  // eventos play/pause e não fica atrás do elemento (nem preso, como no jsdom).
  const togglePlay=()=>{const el=m();if(!el)return;if(playing)el.pause();else{const p=el.play();if(p)p.catch(()=>{})}};
  const skip=(d:number)=>{const el=m();if(el)el.currentTime=Math.max(0,Math.min(el.currentTime+d,el.duration||Infinity))};
  // seek/setVol/mute atualizam o estado na hora (input controlado responsivo) e o
  // elemento; os eventos de mídia reconfirmam depois (idempotente) e cobrem mudanças
  // externas (controles nativos, outra aba).
  const seek=(v:number)=>{const el=m();if(el)el.currentTime=v;setCurrent(v)};
  const setVol=(v:number)=>{const el=m();if(el){el.volume=v;if(v>0)el.muted=false}setVolume(v);if(v>0)setMuted(false)};
  const toggleMute=()=>{const el=m();const next=el?!el.muted:!muted;if(el)el.muted=next;setMuted(next)};
  const toggleCaptions=()=>{const el=m();if(!el||!el.textTracks.length)return;const show=el.textTracks[0].mode!=="showing";el.textTracks[0].mode=show?"showing":"hidden";setCaptionsOn(show)};
  const toggleFullscreen=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else boxRef.current?.requestFullscreen?.()};
  const syncVol=()=>{const el=m();if(el){setVolume(el.volume);setMuted(el.muted)}};
  const syncBuf=()=>{const el=m();if(el&&el.buffered.length)setBuffered(el.buffered.end(el.buffered.length-1))};
  const onMeta=()=>{const el=m();if(el){setDuration(el.duration);setHasCaptions(el.textTracks.length>0);syncVol()}};
  const playedPct=duration>0?Math.min(100,(current/duration)*100):0;
  const bufferedPct=duration>0?Math.min(100,(buffered/duration)*100):0;
  const volPct=muted?0:Math.round(volume*100);
  const valueText=duration>0?`${spokenTime(current)} of ${spokenTime(duration)}`:spokenTime(current);
  const MediaTag:any=kind==="audio"?"audio":"video";
  return <div ref={boxRef} className={cx("media-player",className)} role="group" aria-label={typeof title==="string"?title:s.mediaPlayer}>
    <div className="media-viewport">
      {kind==="audio"&&<div className="media-placeholder"><Icon name="volume--up"/>{title&&<strong>{title}</strong>}{subtitle&&<span>{subtitle}</span>}</div>}
      {/* AUD-0005 (12/08/2026): `onClick` é destrinchado das props para poder ser COMPOSTO com o
          togglePlay no vídeo — clicar na imagem dá play, e o callback do consumidor roda antes.
          No áudio não há alternância por clique (o elemento não tem superfície), e o callback
          simplesmente NÃO era recomposto: sumia. O tipo prometia `onClick` (herda de
          VideoHTMLAttributes) e o áudio nunca entregava. Agora o áudio repassa o original. */}
      <MediaTag ref={mediaRef} src={src} {...rest} {...(kind==="video"?{poster,playsInline:true,className:"media-fill",onClick:(e:React.MouseEvent<HTMLVideoElement>)=>{onClick?.(e);togglePlay()}}:{onClick})}
        onPlay={(e:React.SyntheticEvent<HTMLVideoElement>)=>{setPlaying(true);onPlay?.(e)}} onPause={(e:React.SyntheticEvent<HTMLVideoElement>)=>{setPlaying(false);onPause?.(e)}} onEnded={(e:React.SyntheticEvent<HTMLVideoElement>)=>{setPlaying(false);onEnded?.(e)}}
        onTimeUpdate={(e:React.SyntheticEvent<HTMLVideoElement>)=>{const el=m();if(el)setCurrent(el.currentTime);onTimeUpdate?.(e)}}
        onLoadedMetadata={(e:React.SyntheticEvent<HTMLVideoElement>)=>{onMeta();onLoadedMetadata?.(e)}} onDurationChange={(e:React.SyntheticEvent<HTMLVideoElement>)=>{const el=m();if(el)setDuration(el.duration);onDurationChange?.(e)}}
        onProgress={(e:React.SyntheticEvent<HTMLVideoElement>)=>{syncBuf();onProgress?.(e)}} onVolumeChange={(e:React.SyntheticEvent<HTMLVideoElement>)=>{syncVol();onVolumeChange?.(e)}}>{children}</MediaTag>
    </div>
    {kind==="video"&&title&&<div className="media-overlay-title"><div><strong>{title}</strong>{subtitle&&<span>{subtitle}</span>}</div></div>}
    <div className="media-controls">
      <div className="media-seek" style={{"--media-played":`${playedPct}%`} as React.CSSProperties}>
        <div className="media-seek-track"><span className="media-seek-buffered" style={{width:`${bufferedPct}%`}}/><span className="media-seek-played"/></div>
        <input type="range" min={0} max={duration>0?duration:0} step="any" value={Math.min(current,duration||0)} aria-label={s.mediaSeek} aria-valuetext={valueText} onChange={e=>seek(Number(e.target.value))}/>
      </div>
      <div className="media-control-row">
        <div className="media-control-group">
          <button className="media-control" type="button" aria-label={playing?s.mediaPause:s.mediaPlay} onClick={togglePlay}><Icon name={playing?"pause":"play"}/></button>
          <button className="media-control" type="button" aria-label={s.mediaSkipBack} onClick={()=>skip(-10)}><Icon name="rewind--10"/></button>
          <button className="media-control" type="button" aria-label={s.mediaSkipForward} onClick={()=>skip(10)}><Icon name="forward--10"/></button>
          <span className="media-time">{clockTime(current)} / {clockTime(duration)}</span>
        </div>
        <div className="media-control-group">
          <button className="media-control" type="button" aria-label={muted?s.mediaUnmute:s.mediaMute} onClick={toggleMute}><Icon name={muted||volume===0?"volume--mute":"volume--up"}/></button>
          <input className="media-volume" type="range" min={0} max={100} value={volPct} aria-label={s.mediaVolume} aria-valuetext={`${volPct}%`} onChange={e=>setVol(Number(e.target.value)/100)}/>
          {hasCaptions&&<button className={cx("media-control",captionsOn&&"active")} type="button" aria-label={captionsOn?s.mediaCaptionsHide:s.mediaCaptionsShow} aria-pressed={captionsOn} onClick={toggleCaptions}><Icon name="closed-caption"/></button>}
          {kind==="video"&&<button className="media-control" type="button" aria-label={fullscreen?s.mediaFullscreenExit:s.mediaFullscreenEnter} onClick={toggleFullscreen}><Icon name={fullscreen?"minimize":"maximize"}/></button>}
        </div>
      </div>
    </div>
  </div>;
}

// ── MediaEmbed (achado N-10 dos consumidores, 24/09/2026) ─────────────────────────────────────
// O `MediaPlayer` toca ARQUIVO; isto incorpora a PÁGINA de um terceiro (YouTube, Vimeo). Antes dele o
// consumidor escrevia `<iframe>` nu, e o que ficava a cargo dele era exatamente o que costuma sair
// errado: o nome acessível, a proporção, a política de origem e o peso de carregar o terceiro.
//
// O QUE ESTE COMPONENTE ASSUME, cada coisa com a razão:
//   • `title` é OBRIGATÓRIO no tipo — é o nome acessível do `<iframe>`, e iframe sem nome é
//     reprovação de axe. Regra que mora em documento apaga; a que mora no tipo não compila.
//   • `referrerPolicy="strict-origin-when-cross-origin"` por padrão. Lido em 24/09/2026 nos termos
//     do YouTube (Required Minimum Functionality): o player "must provide identification through
//     the HTTP Referer request header", e essa é a política que eles recomendam. `no-referrer`
//     quebra a incorporação deles.
//   • `allow` enxuto (tocar sozinho, mídia protegida, tela cheia, imagem-na-imagem) e
//     `loading="lazy"`. Tudo sobrescrevível: as props do consumidor vêm depois.
//   • COM `poster`, o terceiro só carrega depois do clique — a "fachada". Até lá há uma imagem e um
//     botão nossos: nada do site de fora é baixado, e a página não paga o peso de um player que
//     talvez ninguém abra. No clique o endereço ganha `autoplay=1` (YouTube e Vimeo leem a mesma
//     chave), porque a pessoa já pediu para tocar e não deve ter de clicar duas vezes. Os termos
//     do YouTube só vetam tocar sozinho com o player fora da tela — e aqui ele acabou de ser
//     clicado. `autoplay={false}` desliga.
//   • O foco vai para o `<iframe>` quando ele nasce: o botão que o teclado estava usando some, e
//     sem isso o foco cairia no `<body>`.
//   • A SAÍDA quando o dono do vídeo bloqueia a incorporação é `href`: um link para o vídeo no site
//     de origem. Não dá para DETECTAR o bloqueio — a página de dentro é de outra origem e não
//     conta nada para a de fora —, então a saída fica sempre visível quando existe.
export interface MediaEmbedProps extends Omit<React.IframeHTMLAttributes<HTMLIFrameElement>,"title"|"src"|"children">{
  /** Endereço de INCORPORAÇÃO do terceiro (ex.: `https://www.youtube.com/embed/<id>`). */
  src:string;
  /** Nome acessível do vídeo. Obrigatório. */
  title:string;
  /** Imagem da fachada. Com ela, o terceiro só carrega depois do clique. */
  poster?:string;
  /** Proporção da caixa, no formato do CSS. Padrão `16/9`. */
  ratio?:string;
  /** Endereço do vídeo no site de origem: a saída quando a incorporação é bloqueada. */
  href?:string;
  /** Na fachada, tocar ao clicar. Padrão `true`. */
  autoplay?:boolean;
}
function comAutoplay(src:string):string{try{const u=new URL(src);u.searchParams.set("autoplay","1");return u.toString()}catch{return src+(src.includes("?")?"&":"?")+"autoplay=1"}}
export function MediaEmbed({src,title,poster,ratio="16/9",href,autoplay=true,className,style,...rest}:MediaEmbedProps){
  const s=useAureaStrings();
  const [ativo,setAtivo]=React.useState(!poster);
  const [clicou,setClicou]=React.useState(false);
  const frameRef=React.useRef<HTMLIFrameElement>(null);
  React.useEffect(()=>{if(clicou)frameRef.current?.focus()},[clicou]);
  const endereco=clicou&&autoplay?comAutoplay(src):src;
  return <div className={cx("media-embed",className)} style={style}>
    <div className="media-embed-frame" style={{aspectRatio:ratio}}>
      {ativo
        ?<iframe ref={frameRef} src={endereco} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen {...rest}/>
        :<button type="button" className="media-embed-facade" aria-label={`${s.mediaPlay}: ${title}`} onClick={()=>{setAtivo(true);setClicou(true)}}>
          <img src={poster} alt="" loading="lazy" decoding="async"/>
          <span className="media-embed-play" aria-hidden="true"><Icon name="play--filled--alt"/></span>
        </button>}
    </div>
    {href&&<a className="media-embed-link" href={href} target="_blank" rel="noopener"><Icon name="launch"/>{s.mediaEmbedOpen}</a>}
  </div>;
}

// ── Image (PLANO-1.0, item L4) ───────────────────────────────────────────────────────────────
// A RAZÃO É CLS, não enfeite — a mesma que o I7 mediu no player e escreveu no comentário do
// `--media-ar` no core: sem proporção reservada, a imagem mede ZERO até o byte chegar e a página
// SALTA quando ele chega. `aspect-ratio` faz isso em uma propriedade.
//
// A referência aqui ensinou pelo AVESSO, e vale registrar: o `aspect-ratio` do
// `Referencia/kibo-main` é o `AspectRatio` do Radix, um COMPONENTE que existe para emular a
// proporção com o truque do `padding-bottom`. Isso era necessário antes de a propriedade CSS ser
// Baseline; hoje não é, e copiar aquele desenho seria trazer um componente inteiro para fazer o
// que uma linha de CSS faz. Por isso aqui não há `<AspectRatio>`: há `ratio`.
//
// O CUIDADO MEDIDO DO ITEM: um consumidor já usa o `<Image>` do framework dele (otimização,
// `srcset` gerado, CDN), e o nosso não pode brigar com isso. Então o elemento é TROCÁVEL por
// `render`, que é o idioma do motor que a Aurea já paga — o mesmo `useRender` que o
// `ToolbarButton` daqui usa desde a Fase 2. `<Image render={<NextImage/>} ratio="16/9"/>` desenha
// o do framework com a nossa pele e a nossa proporção.
//
// O MARCADOR DE CARREGAMENTO NÃO TEM ESTADO, e isso foi decisão, não esquecimento: a caixa
// reservada nasce com `background:var(--surface-3)` — a mesma superfície do `.skeleton` — e o
// bitmap a cobre quando pinta. Guardar `loaded` em `useState` daria o mesmo resultado visual
// custando um render por imagem, e no HTML estático do catálogo (sem hidratação) o estado nunca
// sairia de "carregando".
//
// O QUE PRECISA DE ESTADO É O ERRO, e ele é dívida conhecida desta casa: o `Avatar` foi medido em
// 31/07/2026 com `src` quebrado e NÃO caía no fallback — mostrava o glifo de imagem partida do
// navegador. Aqui `onError` troca por uma caixa com o mesmo tamanho reservado e o `alt` como nome
// acessível, que é a anatomia do `image-gallery` do `Referencia/tool-ui-main`.
//
// `loading="lazy"` e `decoding="async"` como default, e são sobrescrevíveis: as props do
// consumidor vêm depois no spread. Imagem de topo de página quer `loading="eager"`.
export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>,"children">{ratio?:string;fit?:"cover"|"contain";render?:React.ReactElement}
export function Image({ratio,fit,alt,className,style,render,onError,...props}:ImageProps){
  const [quebrou,setQuebrou]=React.useState(false);
  // A proporção vai INLINE e só quando existe. Declará-la no core com fallback `auto` custou uma
  // medição em 15/08/2026: `auto` vence o `aspect-ratio: auto <width>/<height>` que o navegador
  // deriva dos atributos, e uma imagem com `width`/`height` e sem `ratio` saía com altura ZERO —
  // a regra escrita contra o salto de layout produzindo o salto. Sem prop, o navegador decide.
  const estilo={...(ratio?{aspectRatio:ratio}:null),...style};
  // O hook roda SEMPRE, antes de qualquer saída antecipada — trocar a ordem dos hooks entre
  // renders é o que o React proíbe, e o ramo do erro é uma saída antecipada.
  const elemento=useRender({defaultTagName:"img",render,
    // Os defaults vêm ANTES do spread do consumidor, e a ordem foi corrigida por um teste que
    // reprovou: escritos depois, `loading="eager"` numa imagem de topo de página era engolido pelo
    // nosso `lazy` — o componente prometia default e entregava imposição.
    props:{loading:"lazy" as const,decoding:"async" as const,...props,alt,
      className:cx("image",fit==="contain"&&"image-contain",className),style:estilo,
      onError:(e:React.SyntheticEvent<HTMLImageElement>)=>{setQuebrou(true);onError?.(e)}}});
  // `role="img"` com `aria-label={alt}`: a caixa de erro continua sendo a imagem para quem usa
  // leitor de tela, com o mesmo texto alternativo. Sem isso o `alt` some junto com o `<img>`.
  if(quebrou)return <span className={cx("image","image-broken",fit==="contain"&&"image-contain",className)} style={estilo} role="img" aria-label={alt}><Icon name="image"/></span>;
  return elemento;
}

// ── Gallery (PLANO-1.0, item L2) ─────────────────────────────────────────────────────────────
// O QUE ESTE ITEM É: extrair de dentro do bloco `MediaLibrary` (I7) o que era COMPONENTE. Aquele
// bloco compõe galeria, detalhe e player para demonstrar um arquétipo — quem quisesse a galeria
// copiava o bloco. Aqui ela vira peça, e o que sobra no bloco continua sendo composição.
//
// TRÊS COISAS VÊM MEDIDAS DE LÁ, e nenhuma delas é aparência:
//   • o ladrilho é `<button>`, não `Card`. Medido em 11/08/2026: o `.card-interactive` do core tem
//     `cursor:pointer` e `:hover` e NADA de foco — uma `<div>` com cursor de mão não recebe Tab.
//     A pele continua sendo a que já existe; o elemento é o que o teclado alcança.
//   • o selecionado se marca com `aria-current`, como o item ativo da `Sidebar`;
//   • a seleção é UMA constante do consumidor, não três strings paralelas — por isso `selected`
//     é prop, e a galeria não guarda escolha nenhuma. Foi o achado I1 que ensinou isso.
//
// AMPLIAR É DIÁLOGO, E DIÁLOGO JÁ EXISTE — a trava escrita no próprio item. A ampliação abre o
// `Dialog` daqui, com o motor, o foco preso e o Escape que ele já tem; não nasce uma segunda
// superfície flutuante. É a mesma leitura que o `image-gallery` do `Referencia/tool-ui-main` faz
// com o `<dialog>` nativo: lá, ampliar é um diálogo com a foto, a legenda e um fechar.
// A foto ampliada usa `fit="contain"`: cortar a imagem que a pessoa pediu para VER é o oposto do
// que ela pediu.
//
// O QUE DECIDE SE O LADRILHO É BOTÃO é haver o que fazer ao clicar. Sem `onSelect` e sem `zoom`,
// os ladrilhos saem como conteúdo — um `<button>` que não faz nada é um alvo de foco que engana
// quem navega por teclado, e o axe não pega isso porque o botão é válido.
//
// SEM roving tabindex, e é decisão: numa grade de fotos a pessoa ESPERA tabular foto a foto, como
// na lateral (a razão está escrita no `Sidebar`). Roving aqui copiaria o `TreeView` para onde ele
// atrapalha.
export interface GalleryItem{id:string;src:string;alt:string;caption?:ReactNode}
export interface GalleryProps extends Omit<HTMLAttributes<HTMLUListElement>,"onSelect">,RefAttributes<HTMLUListElement>{items:GalleryItem[];label?:string;selected?:string;onSelect?:(id:string)=>void;zoom?:boolean;ratio?:string}
export function Gallery({items,label,selected,onSelect,zoom,ratio="1/1",className,...props}:GalleryProps){
  const s=useAureaStrings();
  const [ampliado,setAmpliado]=React.useState<string|null>(null);
  const interativo=!!onSelect||!!zoom;
  const aberto=items.find(i=>i.id===ampliado);
  return <>
    <ul className={cx("gallery",className)} aria-label={label??s.galleryLabel} {...props}>
      {items.map(i=>{
        // LEGENDA VISÍVEL TORNA A MINIATURA DECORATIVA, e quem exigiu isso foi o axe, não a
        // teoria: com `alt` e legenda dizendo a mesma coisa, ele reprova `image-redundant-alt` e o
        // leitor de tela anuncia o texto DUAS vezes seguidas. É a regra de figura com legenda do
        // WAI — quando o texto ao lado já diz, a imagem entra com `alt=""`. O `alt` de verdade não
        // se perde: ele continua nomeando a foto AMPLIADA, que é onde não há legenda ao lado.
        const miolo=<><Image src={i.src} alt={i.caption!=null?"":i.alt} ratio={ratio}/>{i.caption!=null&&<span className="gallery-caption">{i.caption}</span>}</>;
        return <li key={i.id} className="gallery-item">
          {interativo
            ?<button type="button" className={cx("gallery-tile",i.id===selected&&"is-selected")} aria-current={i.id===selected?"true":undefined}
              onClick={()=>{onSelect?.(i.id);if(zoom)setAmpliado(i.id)}}>{miolo}</button>
            :miolo}
        </li>;
      })}
    </ul>
    {/* O Dialog fica montado e fechado quando não há foto ampliada — é o contrato dele, e o motor
        não desenha nada nesse estado. O título é a legenda, e o texto alternativo quando não há
        legenda: um diálogo sem nome acessível é o defeito que o catalog-sweep pegaria.
        Esta prosa não cita o nome da prop entre aspas nem entre crases, e isso é cicatriz de
        15/08/2026: comentário de BLOCO não é removido pelo check 15, que lê o conteúdo das strings
        do fonte — então o nome da prop de abertura, citado aqui, fez a classe de mesmo nome do
        core parecer produzida por este pacote. É a terceira vez que um gate deste repositório lê
        prosa como se fosse código, e as outras duas estão escritas no validate.py. */}
    {zoom&&<Dialog open={!!aberto} title={aberto?(aberto.caption??aberto.alt):""} onClose={()=>setAmpliado(null)}>
      {aberto&&<Image src={aberto.src} alt={aberto.alt} fit="contain"/>}
    </Dialog>}
  </>;
}

// ── Carousel (PLANO-1.0, item L1) ────────────────────────────────────────────────────────────
// MARCAÇÃO, NÃO MOTOR — e a pergunta que o item mandava decidir primeiro ("se `scroll-snap` do
// CSS cobre, o componente é marcação") foi respondida MEDINDO, não preferindo:
//
//   • as QUATRO referências embrulham o MESMO motor de terceiro, o `embla-carousel` — medido em
//     15/08/2026 no `kibo-main/packages/shadcn-ui/.../carousel.tsx`, nas quatro bases do
//     `ui-main` (`aria`, `base`, `radix`, `new-york-v4`), no `carousel-base.tsx` do `react-main`
//     e no `activepieces-main`. Nenhuma escreve um motor; todas pagam o mesmo;
//   • o `@base-ui/react` NÃO tem carrossel (medido: 46 pastas em `packages/react/src`, nenhuma
//     é carousel — a mesma medição que abriu a decisão de motor do Calendar);
//   • trazer o `embla` seria DEPENDÊNCIA NOVA, que pelo `BUILDING.md` §3.3 interrompe o lote e
//     exige o Victor — para um componente que o navegador já sabe fazer;
//   • e o caminho SEM JavaScript nenhum ainda não serve: `::scroll-button()`/`::scroll-marker()`
//     (CSS Overflow 5) não são Baseline — pesquisado em 15/08/2026: Chrome/Edge 135+ têm,
//     o Safari 26.6 estava previsto para o fim deste mês e o Firefox segue "em desenvolvimento".
//     Um design system não pode entregar controle que só funciona num navegador.
//
// Então o motor é o CONTÊINER DE ROLAGEM nativo com `scroll-snap`, que é Baseline há anos e dá
// de graça o que o `embla` reimplementa: arrasto por toque com inércia, rolagem por roda e
// teclado, e o encaixe no slide. O que sobra de JavaScript é o que o CSS ainda não tem — saber
// em QUAL slide se está, para desenhar o ponto aceso e desabilitar a seta do fim.
//
// A ANIMAÇÃO é do CSS, de propósito: `scrollBy` sem `behavior` resolve para o `scroll-behavior`
// computado do elemento, então `.carousel-track{scroll-behavior:smooth}` decide — e a regra de
// `prefers-reduced-motion` que o core já tem (`scroll-behavior:auto!important`) alcança este
// componente sem uma linha nova. Passar `behavior:"smooth"` daqui passaria POR CIMA dela.
//
// UM componente, não sete peças: `Carousel.Root/Content/Item/PrevTrigger/NextTrigger/
// IndicatorGroup/Indicator` é a decomposição da referência, e aqui ela custaria sete fichas para
// desenhar uma lista que rola. É o mesmo argumento que o `Stepper`, o `TreeView` e a `Sidebar`
// já resolveram: quem embrulha cada slide é o componente, e por isso o rótulo "Slide 3 de 8"
// nunca fica com o consumidor — que é onde ele seria esquecido.
//
// LIMITES DECLARADOS (todos são escopo menor que o da referência, `BUILDING.md` §Passo 5):
//   • sem laço infinito, sem autoplay e sem arrasto com o MOUSE — os três são do `embla` e
//     nenhum deles apareceu na medição dos consumidores; laço, ainda por cima, não existe em
//     contêiner de rolagem nativo e voltaria a exigir motor;
//   • sem eixo vertical: não há uso medido, e o sprite não tem chevron para cima (a allowlist
//     do contrato tem `chevron--left/right/down`), então o eixo custaria glifo novo por nada;
//   • quantos slides aparecem por vez é CSS, não prop: `--carousel-slide` (default `100%`) é a
//     válvula no idioma do `--qr-size` e do `--datagrid-max-h`. É o caso `multiple` da
//     referência, sem API nenhuma;
//   • em RTL a rolagem vai para o lado certo (o deslocamento é medido pela borda inicial), mas
//     o GLIFO da seta não espelha — é uma linha de CSS que ninguém pediu e que nenhum teste
//     daqui mediria.
const desloc=(caixa:DOMRect,item:DOMRect,rtl:boolean)=>rtl?item.right-caixa.right:item.left-caixa.left;
export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>,"children">,RefAttributes<HTMLDivElement>{children?:ReactNode;label?:string;controls?:boolean;indicators?:boolean}
export function Carousel({children,label,controls=true,indicators=true,className,...props}:CarouselProps){
  const s=useAureaStrings();
  const trilho=React.useRef<HTMLDivElement>(null);
  const slides=React.Children.toArray(children);
  // Nasce com `fim:false` e não com `true`: no HTML estático do catálogo — e no primeiro quadro
  // de qualquer consumidor — ninguém mediu nada ainda, e um carrossel existe porque há mais
  // conteúdo do que cabe. Começar com as duas setas apagadas mostraria um controle morto numa
  // página sem JavaScript; a medição da montagem corrige o caso de um slide só.
  const [pos,setPos]=React.useState({indice:0,inicio:true,fim:false});
  const medir=React.useCallback(()=>{
    const el=trilho.current;if(!el)return;
    const rtl=getComputedStyle(el).direction==="rtl";
    const caixa=el.getBoundingClientRect();
    let indice=0,perto=Infinity;
    [...el.children].forEach((filho,i)=>{
      const d=Math.abs(desloc(caixa,filho.getBoundingClientRect(),rtl));
      if(d<perto){perto=d;indice=i}
    });
    // `Math.abs` no scrollLeft porque em RTL ele é NEGATIVO (de -max a 0) nos navegadores
    // atuais; sem isso, um carrossel em árabe nasceria com as duas setas no estado errado.
    const rolagem=Math.abs(el.scrollLeft),max=el.scrollWidth-el.clientWidth;
    const inicio=rolagem<=1,fim=rolagem>=max-1;
    // Devolver o MESMO objeto quando nada mudou faz o React não re-renderizar: `onScroll` dispara
    // dezenas de vezes por arrasto, e sem isto cada uma delas remontaria a fila de pontos.
    setPos(p=>p.indice===indice&&p.inicio===inicio&&p.fim===fim?p:{indice,inicio,fim});
  },[]);
  // `slides.length` na dependência: trocar a lista muda quem é o último, e a seta do fim
  // continuaria desabilitada sobre um carrossel que voltou a ter para onde ir.
  React.useEffect(()=>{medir();window.addEventListener("resize",medir);return ()=>window.removeEventListener("resize",medir)},[medir,slides.length]);
  const irPara=(i:number)=>{
    const el=trilho.current,alvo=el?.children[i] as HTMLElement|undefined;
    if(!el||!alvo)return;
    el.scrollBy({left:desloc(el.getBoundingClientRect(),alvo.getBoundingClientRect(),getComputedStyle(el).direction==="rtl")});
  };
  // A11y pelo padrão APG de carrossel: a região se anuncia com `aria-roledescription="carousel"`
  // e nome próprio, cada slide é um `group` com "Slide N de M". O trilho é `tabIndex={0}` porque
  // conteúdo que rola tem de ser alcançável por teclado — é a regra `scrollable-region-focusable`
  // do axe, e é o que dá as setas de rolagem nativas sem interceptar tecla nenhuma.
  //
  // Os slides fora da vista NÃO ficam `inert`: aqui todos existem no DOM e na árvore de
  // acessibilidade, como em qualquer lista que rola. Escondê-los seria esconder as fotos 2 a 8 de
  // quem usa leitor de tela para ganhar uma ordem de Tab mais curta.
  return <div className={cx("carousel",className)} role="region" aria-roledescription="carousel" aria-label={label??s.carouselLabel} {...props}>
    <div ref={trilho} className="carousel-track" tabIndex={0} onScroll={medir}>
      {slides.map((slide,i)=><div key={i} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${s.carouselSlide} ${i+1} ${s.positionOf} ${slides.length}`}>{slide}</div>)}
    </div>
    {(controls||indicators)&&<div className="carousel-controls">
      {controls&&<IconButton icon="chevron--left" label={s.carouselPrev} size="sm" disabled={pos.inicio} onClick={()=>irPara(pos.indice-1)}/>}
      {/* O ponto é `<button>` de 24px com o desenho de 8px no `::before`: alvo menor que 24×24 é
          reprovação do WCAG 2.2 AA (2.5.8), e é o tamanho que uma fila de pontos convida a errar. */}
      {indicators&&<div className="carousel-dots">{slides.map((_,i)=><button key={i} type="button" className="carousel-dot" aria-current={i===pos.indice?"true":undefined} aria-label={`${s.carouselSlide} ${i+1}`} onClick={()=>irPara(i)}/>)}</div>}
      {controls&&<IconButton icon="chevron--right" label={s.carouselNext} size="sm" disabled={pos.fim} onClick={()=>irPara(pos.indice+1)}/>}
    </div>}
  </div>;
}
