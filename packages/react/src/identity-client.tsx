"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
import {peleDoEixo, type Responsive} from "./pure.js";
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, {type ReactNode} from "react";
import {cx} from "./internal.js";

// Lote 2 do BUILDING.md. Medido em 31/07/2026, com só o core, e eram TRÊS defeitos — nenhum
// deles apareceria olhando a página do catálogo, porque lá a imagem de exemplo é quadrada e
// carrega:
//   1. imagem 3:1 saía 300x100 dentro de uma caixa de 40x40 e vazava inteira (sem `overflow`,
//      sem `object-fit`, e `border-radius` não recorta nada sozinho);
//   2. `src` QUEBRADO não caía no fallback — o fallback só aparecia quando não havia `src`, então
//      o que se via era o ícone de imagem quebrada do navegador e o `alt` solto na tela;
//   3. `.avatar-group` saía `display:block` e os avatares empilhavam na vertical.
// O (2) é corrigido aqui, com `onError`, e NÃO com o `avatar` do Base UI — que existe e foi a
// primeira tentativa. Medido: o motor só monta o `<img>` DEPOIS que a imagem carrega, então o
// HTML servido não tem imagem nenhuma. Numa aplicação React isso é invisível (a hidratação
// monta em seguida), mas o nosso catálogo é HTML estático sem runtime: a foto nunca apareceria.
// Trocar um defeito de imagem quebrada por "nenhuma imagem em página estática" seria pior.
// Com `onError` o `<img>` continua no HTML servido, e quem tem JavaScript ganha o fallback.
//
// PLANO-1.0 Parte B, item B5 (06/08/2026) — `size` deixou de ser número. QUEBRA DE API.
// O defeito estava medido desde 31/07 e é o que ensinou o check 23: a dimensão como número, com
// default 40, virava `style` inline, matava os 36px que o CSS declarava, e obrigava o consumidor
// a escrever pixel cru para mudar de tamanho — pixel que a densidade nunca alcança.
// A escala reaproveita `--control-h-*` em vez de inventar `--avatar-*`: um avatar ao lado de um
// botão na mesma linha tem de ter a mesma altura, e agora tem por construção. `md` é o 2.25rem
// que o core já declarava, então nada muda de tamanho em densidade `comfortable`.
import type {AvatarSize} from "./markup.js";
// O DEGRAU RESPONSIVO volta (merge de 28/08/2026): a ficha declara `responsive.size` e o
// componente tinha perdido a capacidade quando este arquivo entrou da `main`. Mesma perda
// silenciosa do `Input`, do `Tabs` e do `NumberField` — a ficha documentava, o código não fazia.
export function Avatar({src,alt="",fallback,size,className}:{src?:string;alt?:string;fallback?:ReactNode;size?:Responsive<AvatarSize>;className?:string}){
const [falhou,setFalhou]=React.useState(false);
React.useEffect(()=>{setFalhou(false)},[src]);
return <span className={cx("avatar",peleDoEixo("avatar",size),className)}>
{src&&!falhou?<img src={src} alt={alt} onError={()=>setFalhou(true)}/>:fallback}
</span>}

// AvatarGroup: a pilha sobreposta com o "+N" no fim. A sobreposição já existia no core desde
// sempre (`.avatar-group .avatar`), e o container nunca teve regra — a peça filha ficou, a mãe
// não, exatamente como no Stepper.
// `max` corta a lista e o excedente vira UM avatar de contagem, que é onde as referências
// convergem. Fora de propósito: o `renderSurplus` de uma delas (callback para desenhar o "+N"),
// que é configuração para um problema que ninguém teve ainda.
// `role="group"` + nome: uma fila de retratos sem nome não diz de quem é.
