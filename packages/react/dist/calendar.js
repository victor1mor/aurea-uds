"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
// recente. Então o motor era decisão aberta, e a resposta é a mesma de uma das referências: react-day-picker.
//
// O que foi medido antes de escolher (o registro completo está no REFERENCES.md):
//   • renderiza no SERVIDOR — 8618 bytes, <table> de verdade, 42 células. Ao contrário do
//     Recharts, então o catálogo não precisa de prerender nenhum;
//   • a semântica já vem certa: role="grid"/"gridcell", aria-selected, <button> por dia,
//     o mês em role="status" aria-live, e <thead aria-hidden> com <th scope="col">;
//   • tem API de tema PRÓPRIA (`classNames`), que é o que permite manter todo nome `rdp-*`
//     fora do nosso CSS — mesma saída da pele do CodeEditor, que vem pelo EditorView.theme.
//
// O que NÃO entrou: o motor headless que outra das referências escolheu. Trazer um segundo motor
// headless para conviver com o Base UI é criar padrão paralelo, que o protocolo proíbe.
//
// ~~E o que NÃO se constrói aqui: um `DatePicker`. Aquela mesma referência não tem componente-raiz para isso e
// diz por quê — seletor de data é composição de Popover com calendário, e a Aurea já tem os
// dois. A composição está registrada como PATTERN, que é o veículo da casa para isso.~~
// 13/10/2026 (ADR-0068): o `DatePicker` ENTRA, e mora aqui. A referência principal tem a peça (a frase
// acima falava de outra referência), o nativo da Aurea já tem um `DatePicker`, e quase todo sistema do
// mercado entrega o seletor de data como componente — deixado como padrão, cada app refazia o foco, a
// janela e a leitura da data, e cada um saía diferente. Escolha do Victor: *"data B"*. Mora neste arquivo
// pelo mesmo motivo do `Calendar`: o motor de calendário é dependência OPCIONAL, e só este caminho o puxa.
import React from "react";
import { DayPicker } from "react-day-picker";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cx, useAureaStrings, usePortalContainer, controlesRotulaveis } from "./internal.js";
import { peleDoEixo } from "./pure.js";
import { Icon } from "./system.js";
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
    // Grade cheia por padrão, como naquela referência: mês com buraco nas pontas treme ao trocar de mês.
    , { 
        // Grade cheia por padrão, como naquela referência: mês com buraco nas pontas treme ao trocar de mês.
        showOutsideDays: true, ...props, classNames: { ...NOMES, root: cx("calendar", className), ...classNames } });
    // O motor já nomeia a GRADE com o mês ("August 2026"). O que ele não sabe é para que serve
    // ESTE calendário — "de" e "até" lado a lado soariam os dois "August 2026". É o que `label`
    // resolve, e só quando é preciso: dentro de um Popover quem diz o assunto é o gatilho, e um
    // grupo a mais só acrescentaria ruído.
    // O invólucro existe porque o `role` do DayPicker é tipado como "application" | "dialog" — o
    // motor não deixa a raiz dele ser um `group`, e nenhum dos dois papéis dele serve aqui.
    return label ? _jsx("div", { role: "group", "aria-label": label, children: grade }) : grade;
}
// A data do formulário pela data LOCAL: `toISOString` passa por UTC e, à noite no Brasil, daria o dia seguinte.
const dataIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// A língua vem do `locale`, a MESMA que o calendário usa, e nunca do ambiente: com a língua do ambiente, o
// servidor escrevia "12 de ago. de 2026" e o navegador "Aug 12, 2026" — medido em 13/10/2026, erro de
// hidratação 418 no catálogo. Sem `locale`, inglês, como o motor (a regra da casa do `agents.tsx`: padrão fixo).
const formatoPadrao = (d, locale) => d.toLocaleDateString(locale?.code ?? "en-US", { day: "numeric", month: "short", year: "numeric" });
export function DatePicker(props) {
    const { minimumDate, maximumDate, disabled, size, locale, format, placeholder, icon = "calendar", name, id, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby } = props;
    const s = useAureaStrings();
    const portal = usePortalContainer();
    const [aberta, setAberta] = React.useState(false);
    const cliques = React.useRef(0);
    const gatilho = React.useRef(null);
    const [idDoRotulo, setIdDoRotulo] = React.useState();
    const [interno, setInterno] = React.useState(props.defaultValue);
    const valor = props.value !== undefined ? props.value : interno;
    const formatar = format ?? ((d) => formatoPadrao(d, locale));
    let texto;
    let campo;
    if (props.range) {
        const r = valor;
        if (r?.from)
            texto = r.to && r.to.getTime() !== r.from.getTime() ? `${formatar(r.from)} – ${formatar(r.to)}` : formatar(r.from);
        if (r?.from)
            campo = `${dataIso(r.from)}/${dataIso(r.to ?? r.from)}`;
    }
    else {
        const d = valor;
        if (d) {
            texto = formatar(d);
            campo = dataIso(d);
        }
    }
    const vazio = texto === undefined;
    const limites = [minimumDate && { before: minimumDate }, maximumDate && { after: maximumDate }].filter(Boolean);
    const comum = {
        disabled: limites.length ? limites : undefined,
        startMonth: minimumDate, endMonth: maximumDate, locale,
        defaultMonth: props.range ? valor?.from : valor,
        autoFocus: true,
    };
    // O intervalo é NOSSO, pelo dia clicado (o 2º argumento do motor), e não o que o motor calcula: o dele
    // ESTENDE o intervalo que já existe — com 1 a 3 escolhido, clicar 15 e 20 dava 1 a 20. Aqui, cada
    // abertura começa um intervalo novo: o 1º clique é uma ponta, o 2º a outra, em qualquer ordem.
    const calendario = props.range
        ? _jsx(Calendar, { ...comum, mode: "range", selected: valor, onSelect: (_, dia) => {
                cliques.current += 1;
                const inicio = valor?.from;
                const r = cliques.current === 1 || !inicio ? { from: dia, to: undefined }
                    : dia < inicio ? { from: dia, to: inicio } : { from: inicio, to: dia };
                if (props.value === undefined)
                    setInterno(r);
                props.onChange?.(r);
                if (cliques.current >= 2)
                    setAberta(false);
            } })
        : _jsx(Calendar, { ...comum, mode: "single", selected: valor, onSelect: (d) => {
                if (!d)
                    return;
                if (props.value === undefined)
                    setInterno(d);
                props.onChange?.(d);
                setAberta(false);
            } });
    return _jsxs(BasePopover.Root, { open: aberta, onOpenChange: (o) => {
            // O `<label for>` que nomeia o gatilho (o do `Field` tem `id`), pela ligação do próprio navegador.
            if (o) {
                cliques.current = 0;
                setIdDoRotulo(gatilho.current?.labels?.[0]?.id || undefined);
            }
            setAberta(o);
        }, children: [_jsxs(BasePopover.Trigger, { ref: gatilho, disabled: disabled, id: id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby, className: cx("select", "select-trigger", "date-picker-trigger", peleDoEixo("select", size), className), children: [_jsx("span", { className: "select-value", "data-placeholder": vazio ? "" : undefined, lang: vazio ? undefined : locale?.code, children: texto ?? placeholder ?? (props.range ? s.dateRangePlaceholder : s.datePlaceholder) }), icon !== false && _jsx(Icon, { name: icon })] }), name && _jsx("input", { type: "hidden", name: name, value: campo ?? "" }), _jsx(BasePopover.Portal, { container: portal, children: _jsx(BasePopover.Positioner, { className: "positioner", side: "bottom", align: "start", sideOffset: 6, children: _jsx(BasePopover.Popup, { className: "popover date-picker-popover", "aria-labelledby": ariaLabelledby ?? idDoRotulo, "aria-label": (ariaLabelledby ?? idDoRotulo) ? undefined
                            : ariaLabel ?? (props.range ? s.dateRangePlaceholder : s.datePlaceholder), children: calendario }) }) })] });
}
// O `Field` nomeia o gatilho com `<label for>`: o `id` que ele injeta vai para o botão (ver `internal.tsx`).
controlesRotulaveis.add(DatePicker);
