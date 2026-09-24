"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DayPicker } from "react-day-picker";
import { cx } from "./internal.js";
// Só TRÊS nomes são renomeados, e é de propósito. Todo o resto da pele é escrito contra ELEMENTO
// (`.calendar table`, `.calendar th`, `.calendar td button`) e contra os `data-*` que o motor já
// emite (`data-selected`, `data-today`, `data-outside`, `data-disabled`, `data-hidden`) — e
// atributo não é classe, então o check 15 nem os vê. Renomear os 21 nomes do motor encheria o
// core de superfície que ninguém usa.
// Os três que sobram são os que não dão para alcançar por elemento: a raiz (é o escopo de tudo),
// o embrulho dos meses (é o `position:relative` que a navegação usa de âncora) e o rótulo do mês
// (um <span> solto no meio de <div>s).
const NOMES = { months: "calendar-months", month_caption: "calendar-caption" };
export function Calendar({ label, className, classNames, ...props }) {
    const grade = _jsx(DayPicker
    // Grade cheia por padrão, como o shadcn: mês com buraco nas pontas treme ao trocar de mês.
    , { 
        // Grade cheia por padrão, como o shadcn: mês com buraco nas pontas treme ao trocar de mês.
        showOutsideDays: true, ...props, classNames: { ...NOMES, root: cx("calendar", className), ...classNames } });
    // O motor já nomeia a GRADE com o mês ("August 2026"). O que ele não sabe é para que serve
    // ESTE calendário — "de" e "até" lado a lado soariam os dois "August 2026". É o que `label`
    // resolve, e só quando é preciso: dentro de um Popover quem diz o assunto é o gatilho, e um
    // grupo a mais só acrescentaria ruído.
    // O invólucro existe porque o `role` do DayPicker é tipado como "application" | "dialog" — o
    // motor não deixa a raiz dele ser um `group`, e nenhum dos dois papéis dele serve aqui.
    return label ? _jsx("div", { role: "group", "aria-label": label, children: grade }) : grade;
}
