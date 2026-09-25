"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type ReactNode} from "react";
import {Toast as BaseToast} from "@base-ui/react/toast";
import {Tooltip as BaseTooltip} from "@base-ui/react/tooltip";
import {DirectionProvider} from "@base-ui/react/direction-provider";
import {peleDoEixo, type Responsive} from "./pure.js";
import {cx, StringsContext, SpriteContext, PortalContext, ThemeContext, DensityContext, DentroDoProviderContext, usePortalContainer, defaultStrings, defaultSpriteUrl, useSpriteUrl, useAureaStrings, type AureaStrings, type AureaTheme, type AureaDensity} from "./internal.js";

// `theme` e `density` seguem a convenção controlado/não-controlado do resto da biblioteca
// (`Toggle`, `ToggleGroup`): passe `theme` para mandar, `defaultTheme` para semear, e ouça por
// `onThemeChange`. Sem nenhum dos dois, o provider ADOTA o que o documento já trouxer no
// `<html>` — e essa é a parte que importa: o `data-theme` do markup existe para não haver
// piscada de tema no carregamento, e um provider que o sobrescrevesse na primeira pintura
// reintroduziria exatamente a piscada que ele evita.
// `portalContainer` (achado B7, Parte C do PLANO-1.0): onde TODO popup da biblioteca é montado.
// Configuração de aplicação, então entra aqui uma vez — o mesmo raciocínio do `spriteUrl`, e
// pela mesma razão medida: com prop por componente seriam nove sítios repassando a mesma coisa
// à mão, que é o achado A4 de novo.
// Sem ela nada muda: o Base UI monta no `document.body`, que é o que permite empilhar e
// posicionar sem herdar `overflow` nem `transform`. Com ela, o consumidor aponta para um nó
// dentro do landmark dele e o conteúdo do popup deixa de ficar fora de qualquer marco.
export function AureaProvider({children,strings,direction="ltr",spriteUrl=defaultSpriteUrl,portalContainer,
  theme,defaultTheme,onThemeChange,density,defaultDensity,onDensityChange}:{children:ReactNode;strings?:Partial<AureaStrings>;direction?:"ltr"|"rtl";spriteUrl?:string;portalContainer?:HTMLElement|null;theme?:AureaTheme;defaultTheme?:AureaTheme;onThemeChange?:(theme:AureaTheme)=>void;density?:AureaDensity;defaultDensity?:AureaDensity;onDensityChange?:(density:AureaDensity)=>void}){
  const value=React.useMemo(()=>strings?{...defaultStrings,...strings}:defaultStrings,[strings]);
  const temaCtx=useEixoDoDocumento("theme",theme,defaultTheme,onThemeChange);
  const densCtx=useEixoDoDocumento("density",density,defaultDensity,onDensityChange);
  const tema=React.useMemo(()=>({theme:temaCtx.valor,setTheme:temaCtx.set,
    // `toggleTheme` existe porque é o gesto real: um botão de tema não escolhe entre dois
    // valores, ele inverte o atual. Deixar isso para o consumidor é como o catálogo e os docs
    // acabaram com duas implementações divergentes da mesma coisa.
    // 🔴 ERA `valor==="light"?"dark":"light"`, e o caso "ninguém escolheu ainda" saía INVERTIDO:
    // com `valor` indefinido aquilo dava `light`, então quem está no claro do sistema clicava e
    // NÃO VIA NADA ACONTECER — exatamente o defeito contra o qual o comentário do `useAureaTheme`
    // avisa, 90 linhas abaixo, e que um teste de lá já cobrava. Os dois `toggleTheme` da
    // biblioteca discordavam no mesmo caso de borda.
    // ⚠ Achado em 09/09/2026 SÓ porque o `useAureaTheme` passou a delegar para cá: a divergência
    // existia desde sempre e nenhum teste a pegava, porque cada metade era testada sozinha.
    // Agora a regra é uma: desconhecido resolve para claro e alterna para ESCURO.
    toggleTheme:()=>temaCtx.set(temaCtx.valor==="dark"?"light":"dark")}),[temaCtx]);
  const dens=React.useMemo(()=>({density:densCtx.valor,setDensity:densCtx.set}),[densCtx]);
  return <DentroDoProviderContext.Provider value={true}><StringsContext.Provider value={value}><SpriteContext.Provider value={spriteUrl}><PortalContext.Provider value={portalContainer}><ThemeContext.Provider value={tema}><DensityContext.Provider value={dens}><DirectionProvider direction={direction}><BaseToast.Provider><BaseTooltip.Provider>{children}<AureaToastViewport/></BaseTooltip.Provider></BaseToast.Provider></DirectionProvider></DensityContext.Provider></ThemeContext.Provider></PortalContext.Provider></SpriteContext.Provider></StringsContext.Provider></DentroDoProviderContext.Provider>;
}

/** Um eixo de apresentação que vive no `<html>`: tema ou densidade. A conta é a mesma para os
 *  dois, e escrevê-la duas vezes seria o defeito do §21 cometido dentro do próprio conserto
 *  dele. */
function useEixoDoDocumento<T extends string>(attr:"theme"|"density",controlado:T|undefined,
  semente:T|undefined,aviso:((v:T)=>void)|undefined){
  // Nada de ler `document` durante o render: em SSR ele não existe, e o valor lido no cliente
  // divergiria do renderizado no servidor (erro de hidratação). O estado nasce da semente, e o
  // efeito abaixo adota o que o documento já traz.
  const [interno,setInterno]=React.useState<T|undefined>(semente);
  const valor=controlado??interno;
  React.useEffect(()=>{
    const raiz=document.documentElement;
    if(valor===undefined){
      const doDoc=raiz.dataset[attr] as T|undefined;
      if(doDoc)setInterno(doDoc);       // adota o markup em vez de sobrescrevê-lo
      return;
    }
    if(raiz.dataset[attr]!==valor)raiz.dataset[attr]=valor;
  },[attr,valor]);
  const set=React.useCallback((v:T)=>{
    if(controlado===undefined)setInterno(v);
    aviso?.(v);
  },[controlado,aviso]);
  return React.useMemo(()=>({valor,set}),[valor,set]);
}
// Toast: use useToast() dentro do AureaProvider e chame add({title,description,type}).
export type AureaToastType="info"|"success"|"warning"|"danger";
export const useToast=()=>BaseToast.useToastManager();

// useAureaTheme (M7): ler e trocar os DOIS eixos que a Aurea põe no <html> — `data-theme` e
// `data-density`. Até aqui só existia `window.Aurea.setTheme` no `aurea.js`, que é vanilla: em
// React não havia como saber o tema atual sem enfiar a mão no DOM, e um botão de tema não sabia
// que ícone desenhar.
//
// O QUE ESTE HOOK NÃO FAZ, e é a parte mais importante dele — pesquisado em 13/08/2026, não
// suposto. O `next-themes` já resolve persistência, preferência do sistema, sincronia entre abas
// e o script embutido que evita o flash, e ele escreve **`data-theme` no <html>**, que é
// exatamente o atributo que a Aurea lê. Ou seja: os dois já se encaixam sem código nosso.
// Reescrever isso aqui seria trocar uma biblioteca mantida por uma cópia pior — e guardar
// preferência de usuário é decisão da APLICAÇÃO, não da biblioteca de interface (é o mesmo
// motivo pelo qual a persistência de tema do catálogo mora no catálogo).
// O que ele faz é o que biblioteca nenhuma faz: **densidade**, que é eixo da Aurea e não existe
// no `next-themes` nem em ninguém.
//
// `useSyncExternalStore` e não `useState`: o valor mora no DOM, e quem o troca pode ser outro —
// o `next-themes`, um script no <head>, ou o `window.Aurea` de sempre. Assinar a mutação do
// atributo é o que mantém o React em dia com quem manda de verdade.
//
// E `getServerSnapshot` devolve `null` de propósito. A armadilha está documentada no próprio
// `next-themes`: no servidor o tema é **desconhecido**, e fingir um valor produz erro de
// hidratação. Por isso o retorno é `theme: string|null` — enquanto for `null`, não desenhe UI que
// dependa do tema. É a mesma regra do "delay rendering until mounted", só que sem um `mounted`
// solto para o consumidor esquecer de checar.
const assinaHtml=(cb:()=>void)=>{
  if(typeof MutationObserver==="undefined")return ()=>{};
  const obs=new MutationObserver(cb);
  obs.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-density"]});
  return ()=>obs.disconnect();
};
const leAtributo=(nome:string)=>()=>typeof document==="undefined"?null:document.documentElement.getAttribute(nome);
const semServidor=()=>null;
export type AureaThemeName="dark"|"light";
// O tipo tem UMA casa — `pure.js` —, e aqui ele é reexportado para quem já o importava daqui.
// Duas declarações idênticas com o mesmo nome é como as duas metades de um sistema passam a
// divergir sem que nada acuse.
export type {AureaDensity};
export function useAureaTheme(){
  const theme=React.useSyncExternalStore(assinaHtml,leAtributo("data-theme"),semServidor) as AureaThemeName|null;
  const density=React.useSyncExternalStore(assinaHtml,leAtributo("data-density"),semServidor) as AureaDensity|null;
  // 🔴 QUEM ESCREVE MUDA CONFORME HAJA PROVIDER — conserto de 09/09/2026, com o defeito medido
  // em `tests/unit/tema-fonte-unica.test.tsx`. Escrever o atributo direto DENTRO de um
  // `AureaProvider` faz o CSS mudar e o contexto ficar para trás: o efeito do provider só
  // reescreve o atributo quando o valor DELE muda, e ele não mudou. Delegar resolve na origem —
  // o provider vira o único que escreve, e o atributo continua saindo dele.
  // ⚠ E a LEITURA continua vindo do DOM nos dois casos, de propósito: o provider escreve o
  // atributo, então o DOM é o denominador comum, e é ele que o CSS obedece.
  const dentroDeProvider=React.useContext(DentroDoProviderContext);
  const ctxTema=React.useContext(ThemeContext);
  const ctxDens=React.useContext(DensityContext);
  return React.useMemo(()=>({
    theme,density,
    setTheme:(t:AureaThemeName)=>{
      if(dentroDeProvider){ctxTema.setTheme(t as AureaTheme);return;}
      document.documentElement.dataset.theme=t;
    },
    setDensity:(d:AureaDensity)=>{
      if(dentroDeProvider){ctxDens.setDensity(d);return;}
      document.documentElement.dataset.density=d;
    },
    // Alternar é sobre o que está NA TELA, então `null` (servidor, ou ninguém escolheu ainda)
    // resolve para claro e vira escuro — e não o contrário, que deixaria o primeiro clique sem
    // efeito visível em quem estava no claro do sistema.
    toggleTheme:()=>{
      if(dentroDeProvider){ctxTema.toggleTheme();return;}
      document.documentElement.dataset.theme=theme==="dark"?"light":"dark";
    },
  }),[theme,density,dentroDeProvider,ctxTema,ctxDens]);
}
function AureaToastList(){
  const {toasts}=BaseToast.useToastManager();
  const s=useAureaStrings();
  return <>{toasts.map(t=>(
    <BaseToast.Root key={t.id} toast={t} className={cx("toast",t.type&&`toast-${t.type}`)}>
      <div className="toast-text"><BaseToast.Title render={<strong/>}/>{t.description?<BaseToast.Description className="muted"/>:null}</div>
      <BaseToast.Close className="btn btn-ghost btn-icon btn-sm" aria-label={s.dismissNotification}>×</BaseToast.Close>
    </BaseToast.Root>
  ))}</>;
}
function AureaToastViewport(){
  const portal=usePortalContainer();
  return <BaseToast.Portal container={portal}><BaseToast.Viewport className="toast-stack"><AureaToastList/></BaseToast.Viewport></BaseToast.Portal>;
}

// A-04: o nome é checado pelo TypeScript. A lista é GERADA do mesmo @carbon/icons que monta o
// sprite (`packages/icons/build-icons.mjs`); nome próprio do app entra por `AureaIconNames`.
export type {IconName,CarbonIconName,AureaIconNames} from "./icon-names.js";
import type {IconName} from "./icon-names.js";
// A escala de GLIFO é própria (`--icon-*`) e começa em `sm`: não existe `--icon-xs`. Emitir um
// degrau `xs` aqui seria desenhar por simetria com o botão, e a medição de 22/08 mostrou que as
// duas escalas nem sequer reagem à densidade do mesmo jeito.
export type IconSize="sm"|"md"|"lg"|"xl";
export interface IconProps extends React.SVGAttributes<SVGSVGElement>{name:IconName;spriteUrl?:string;size?:Responsive<IconSize>}
// spriteUrl aqui é OVERRIDE local (dois sprites na mesma página, por exemplo). O normal é
// não passar nada e deixar o AureaProvider dizer de onde vêm os glifos.
export function Icon({name,spriteUrl,size,className,...props}:IconProps){const base=useSpriteUrl();return <svg aria-hidden="true" className={cx("icon",peleDoEixo("icon",size),className)} {...props}><use href={`${spriteUrl??base}#i-${name}`}/></svg>}

// "nav" = item de navegação; marque o atual com aria-current="page" (texto amarelo +
// traço embaixo, e o leitor de tela anuncia a página atual). Ver .btn-nav no core.
// Eixos do DIRECTION.md §5: aparência (solid/outline/ghost/link) × tom (neutro/marca/
// destrutivo). Os nomes históricos (primary/secondary) continuam; os novos dizem tom+aparência.
