"use client";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
// SUBPATH PRÓPRIO, e não a categoria Data Display: este é o único componente que precisa do
// pacote `qr`, que é peer OPCIONAL. Se ele morasse junto do Table, quem importa Table teria de
// instalar um gerador de QR — que é exatamente o achado A5 visto de perto.
import React, {type ReactNode} from "react";
import encodeQR, {type ErrorCorrection} from "qr";
import {peleDoEixo, type Responsive} from "./pure.js";
import {cx, useAureaStrings} from "./internal.js";

// PLANO-1.0 Parte B, item B6 (06/08/2026) — `size` deixou de ser número. QUEBRA DE API, e com
// ela a allowlist `dimensaoNumerica` do check 23 ficou VAZIA.
// Aqui o tamanho é medida de renderização de verdade (um QR pequeno demais não escaneia), então
// a válvula de escape não é voltar ao número: é `--qr-size` no CSS, no mesmo idioma de
// `--qr-module` e `--qr-quiet`, que já eram os botões de ajuste deste componente.
// `md` continua sendo os 160px de antes; as três medidas vivem no core e não aqui, senão o
// valor volta a ser pixel cru dentro de um atributo de SVG.
export type QRCodeSize="sm"|"md"|"lg";
export interface QRCodeProps extends Omit<React.SVGAttributes<SVGSVGElement>,"children">{value:string;size?:Responsive<QRCodeSize>;ecc?:ErrorCorrection;quietZone?:number;label?:string}
// QRCode: dado escaneável com a geometria suave da Aurea — módulos REDONDOS (dots) e
// olhos circulares, não quadrados. Miolo de alto contraste FIXO (não segue o tema: dark
// inverteria e nem todo leitor decodifica um QR invertido); override por --qr-module/
// --qr-quiet no CSS. Matriz da lib `qr` (0-dep, Apache-2.0, Paul Miller); o desenho é
// nosso. ecc default "quartile": dots cobrem menos área que quadrados, então mais
// correção de erro preserva a escaneabilidade. ponytail: um estilo (dots) só.
export function QRCode({value,size,ecc="quartile",quietZone=4,label,className,...props}:QRCodeProps){
  const s=useAureaStrings();
  const name=label??`${s.qrCode}: ${value}`;
  const m=encodeQR(value,"raw",{ecc,border:quietZone});
  const n=m.length;
  // os 3 finder patterns (7×7) ficam nos cantos da área de dados, logo após o quiet border.
  const b=quietZone,eyes:Array<[number,number]>=[[b,b],[n-b-7,b],[b,n-b-7]];
  const inEye=(x:number,y:number)=>eyes.some(([ex,ey])=>x>=ex&&x<ex+7&&y>=ey&&y<ey+7);
  const dots:ReactNode[]=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(m[y][x]&&!inEye(x,y))dots.push(<circle key={y*n+x} className="qr-mod" cx={x+0.5} cy={y+0.5} r={0.44}/>);
  // olho redondo: anel externo (raio 3.5) → furo (2.5, cor do fundo) → centro (1.5).
  // os raios preservam a proporção 7:5:3 do finder, então o leitor ainda o reconhece.
  const eyeShapes=eyes.map(([ex,ey],i)=>{const cx=ex+3.5,cy=ey+3.5;return <React.Fragment key={`eye${i}`}><circle className="qr-mod" cx={cx} cy={cy} r={3.5}/><circle className="qr-eye-gap" cx={cx} cy={cy} r={2.5}/><circle className="qr-mod" cx={cx} cy={cy} r={1.5}/></React.Fragment>;});
  return <svg className={cx("qrcode",peleDoEixo("qrcode",size),className)} role="img" aria-label={name} viewBox={`0 0 ${n} ${n}`} {...props}><title>{name}</title>{eyeShapes}{dots}</svg>;
}
