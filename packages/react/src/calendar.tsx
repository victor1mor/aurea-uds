"use client";
// A diretiva aqui NÃO vem de um hook nosso — este arquivo não chama nenhum. Vem do motor: o
// `react-day-picker` usa estado e NÃO publica `"use client"` no dist dele (medido em
// 06/08/2026, junto com `recharts` e `@tanstack/react-table`, que também não publicam; o
// `@base-ui/react` publica). Sem a diretiva, o módulo seria de servidor e o motor quebraria
// dentro dele. É o caso que a regra "tem hook? leva diretiva" não enxerga, e por isso o
// check 26 do validate.py também olha para essas três importações.
//
// Lote 4 do BUILDING.md (01/08/2026). SUBPATH PRÓPRIO, como ./chart, ./data-grid e ./qrcode: o
// único componente que precisa do `react-day-picker`, que é peer OPCIONAL.
//
// O MOTOR, e por que este: o Base UI — que já é dependência dura daqui — **não tem** calendário
// nem campo de data. Medido em 01/08/2026 na lista de exports do 1.6.0, que é a versão mais
// recente. Então o motor era decisão aberta, e a resposta é a mesma do shadcn/ui: react-day-picker.
//
// O que foi medido antes de escolher (o registro completo está no REFERENCES.md):
//   • renderiza no SERVIDOR — 8618 bytes, <table> de verdade, 42 células. Ao contrário do
//     Recharts, então o catálogo não precisa de prerender nenhum;
//   • a semântica já vem certa: role="grid"/"gridcell", aria-selected, <button> por dia,
//     o mês em role="status" aria-live, e <thead aria-hidden> com <th scope="col">;
//   • tem API de tema PRÓPRIA (`classNames`), que é o que permite manter todo nome `rdp-*`
//     fora do nosso CSS — mesma saída da pele do CodeEditor, que vem pelo EditorView.theme.
//
// O que NÃO entrou: `react-aria-components` (a escolha do Untitled UI). Trazer um segundo motor
// headless para conviver com o Base UI é criar padrão paralelo, que o protocolo proíbe.
//
// E o que NÃO se constrói aqui: um `DatePicker`. O shadcn não tem componente-raiz para isso e
// diz por quê — seletor de data é composição de Popover com calendário, e a Aurea já tem os
// dois. A composição está registrada como PATTERN, que é o veículo da casa para isso.
import React from "react";
import {DayPicker} from "react-day-picker";
import {cx} from "./internal.js";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {label?: string};

// Só TRÊS nomes são renomeados, e é de propósito. Todo o resto da pele é escrito contra ELEMENTO
// (`.calendar table`, `.calendar th`, `.calendar td button`) e contra os `data-*` que o motor já
// emite (`data-selected`, `data-today`, `data-outside`, `data-disabled`, `data-hidden`) — e
// atributo não é classe, então o check 15 nem os vê. Renomear os 21 nomes do motor encheria o
// core de superfície que ninguém usa.
// Os três que sobram são os que não dão para alcançar por elemento: a raiz (é o escopo de tudo),
// o embrulho dos meses (é o `position:relative` que a navegação usa de âncora) e o rótulo do mês
// (um <span> solto no meio de <div>s).
const NOMES = {months: "calendar-months", month_caption: "calendar-caption"};

export function Calendar({label, className, classNames, ...props}: CalendarProps) {
  const grade = <DayPicker
    // Grade cheia por padrão, como o shadcn: mês com buraco nas pontas treme ao trocar de mês.
    showOutsideDays
    {...props}
    classNames={{...NOMES, root: cx("calendar", className), ...classNames}}
  />;
  // O motor já nomeia a GRADE com o mês ("August 2026"). O que ele não sabe é para que serve
  // ESTE calendário — "de" e "até" lado a lado soariam os dois "August 2026". É o que `label`
  // resolve, e só quando é preciso: dentro de um Popover quem diz o assunto é o gatilho, e um
  // grupo a mais só acrescentaria ruído.
  // O invólucro existe porque o `role` do DayPicker é tipado como "application" | "dialog" — o
  // motor não deixa a raiz dele ser um `group`, e nenhum dos dois papéis dele serve aqui.
  return label ? <div role="group" aria-label={label}>{grade}</div> : grade;
}
