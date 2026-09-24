"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Fase 9 (achado A5): este arquivo saiu do index.tsx de 970 linhas. Um módulo por categoria
// do registry — a taxonomia já existia e é gateada. A ordem de import entre eles é um DAG:
// internal → system → actions → feedback → inputs → navigation → layout → data-display → resto.
import React, { forwardRef } from "react";
import { valorBase, peleDoEixo, soOValor } from "./pure.js";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Form as BaseForm } from "@base-ui/react/form";
import { Field as BaseField } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { cx, useAureaStrings, usePortalContainer, useReorder } from "./internal.js";
// Os seis controles abaixo saíram deste arquivo no item O1 e moram no `markup.tsx`, sem a
// diretiva — são marcação, e quem escuta `onChange` é o consumidor. Voltam IMPORTADOS e não só
// reexportados porque o `ehControle` do `Field` compara por IDENTIDADE de referência: dois
// objetos diferentes com o mesmo nome quebrariam o rótulo do campo em silêncio.
import { Textarea, Checkbox, Radio, Switch, Range, InputGroup, InputGroupAddon } from "./markup.js";
import { Icon } from "./system.js";
import { IconButton } from "./actions.js";
// FileInput mora em arquivo próprio (132 linhas — upload real, aborto, progresso) e é público
// por aqui: a categoria dele é Inputs.
export { FileInput, matchesAccept } from "./file-input.js";
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
const TAGS_ROTULAVEIS = new Set(["input", "select", "textarea", "button", "meter", "output", "progress"]);
function filhoUnico(children) {
    const filhos = React.Children.toArray(children);
    if (filhos.length !== 1 || !React.isValidElement(filhos[0]))
        return null;
    const filho = filhos[0];
    return filho.type === React.Fragment ? filhoUnico(filho.props.children) : filho;
}
function elementoRotulavel(tipo) {
    if (typeof tipo === "string")
        return TAGS_ROTULAVEIS.has(tipo);
    // Componente React arbitrário pode consumir as props no wrapper e nunca entregá-las ao nó
    // focal. Só os controles Aurea cujo encaminhamento é parte do contrato entram aqui.
    // `PasswordField` entrou em 29/08/2026, e entrou medido: `<Field label="Senha"><PasswordField/></Field>`
    // reprovava no axe com "Form elements must have labels". Fora desta lista o Field vira GRUPO e
    // não pendura `htmlFor`, então o <input> de dentro ficava sem nome. Ele qualifica pela mesma
    // regra que os outros: recebe `id` e espalha `...props` no `Input`, que é o nó focal.
    return [Input, Select, Textarea, SearchField, PasswordField, Checkbox, Radio, Switch, Range, Combobox, MultiCombobox].includes(tipo);
}
export function Field({ label, hint, description, error, children, className, id, name, orientation, labelWidth, style, ...props }) {
    const auto = React.useId();
    // Fragment não cria nó no DOM. Um Fragment com um só controle é só sintaxe; com vários,
    // Field precisa voltar para grupo em vez de pendurar `htmlFor` num id que nunca existirá.
    const unico = filhoUnico(children);
    // e o TERCEIRO caso de "não dono", que o gate achou e eu não tinha previsto: o filho único pode
    // ser um `<div>` de LAYOUT com os controles dentro — o catálogo faz isso no `Range` ("With the
    // number": um slider e um campo numérico lado a lado). `htmlFor` apontando para um `<div>` não
    // nomeia nada, e o `catalog-sweep` reprovou `range.html` com duas violações de `label` no axe.
    // A leitura é do TIPO do elemento JSX, que é API estável do React. Para tag nativa vale a lista
    // do HTML; para componente vale a lista explícita dos controles Aurea que repassam a ligação ao
    // nó focal. Componente arbitrário vira grupo — presumir forwarding recria o id sem alvo.
    const rotulavel = !!unico && elementoRotulavel(unico.type);
    // `label` é a API dos controles compostos; aria-label/labelledby são a API universal. Se uma
    // delas já nomeia o filho, acrescentar `<label for>` daria dois donos para o mesmo nome.
    const nomeProprio = rotulavel && (unico.props.label !== undefined || [unico.props["aria-label"], unico.props["aria-labelledby"]].some(v => typeof v === "string" && v.trim().length > 0));
    const nomeAqui = rotulavel && !nomeProprio;
    // o id que o filho já declara VENCE: sobrescrevê-lo quebraria uma ligação que o consumidor fez.
    const idControle = unico?.props.id ?? id ?? `${auto}-control`;
    const idRotulo = `${auto}-label`;
    const idHint = hint ? `${auto}-hint` : undefined;
    const idDescricao = description ? `${auto}-description` : undefined;
    const idErro = error ? `${auto}-error` : undefined;
    const descrito = [idHint, idDescricao, idErro].filter(Boolean).join(" ") || undefined;
    // As chaves de aria só entram quando têm VALOR. Passar `undefined` explícito não é o mesmo que
    // não passar: quando o filho vira `Field.Control` do motor (ramo do `name`), a prop explícita
    // do elemento vence a mesclagem, e o `aria-invalid` que o motor calculou a partir do erro
    // externo era apagado por um `undefined` nosso. Medido em 13/08/2026: o input saía com
    // `data-invalid` e SEM `aria-invalid`, ou seja, vermelho na tela e válido para o leitor de
    // tela — que é o pior dos dois mundos.
    const injecao = { id: idControle };
    const descritoFinal = [unico?.props["aria-describedby"], descrito].filter(Boolean).join(" ");
    if (descritoFinal)
        injecao["aria-describedby"] = descritoFinal;
    const invalidoFinal = error ? true : unico?.props["aria-invalid"];
    if (invalidoFinal !== undefined)
        injecao["aria-invalid"] = invalidoFinal;
    const controle = rotulavel ? React.cloneElement(unico, injecao) : children;
    // a descrição mora no nó FOCAL quando existe um; sem filho único, no grupo — que é o que sobra
    // para anunciar. Nos dois lugares seria anunciar duas vezes.
    // Com `name`, o filho passa a ser o CONTROLE do motor: é isso que faz o `aria-invalid` e o
    // `aria-describedby` do erro externo chegarem ao nó focal. Medido em 13/08/2026 — sem este
    // embrulho o `Field.Root` recebe o erro e não tem a quem entregá-lo, e o campo fica válido na
    // árvore de acessibilidade enquanto a frase de erro aparece na tela. Pior que não mostrar.
    const controleFinal = name ? _jsx(BaseField.Control, { render: controle }) : controle;
    const estilo = labelWidth ? { ...style, "--field-label-width": labelWidth === "auto" ? "max-content" : labelWidth } : style;
    const corpo = _jsxs("div", { className: cx("field", peleDoEixo("field", orientation, "vertical", "field"), className), ...(nomeAqui ? {} : { role: "group", "aria-labelledby": idRotulo, ...(rotulavel ? {} : { "aria-describedby": descrito }) }), style: estilo, ...props, children: [_jsxs("span", { className: "label", children: [nomeAqui ? _jsx("label", { htmlFor: idControle, children: label }) : _jsx("span", { id: idRotulo, children: label }), hint && _jsx("span", { className: "hint", id: idHint, children: hint })] }), controleFinal, description && _jsx("span", { className: "field-description", id: idDescricao, children: description }), error && _jsx("span", { className: "field-error", id: idErro, children: error }), name && _jsx(BaseField.Error, { className: "field-error" })] });
    // `Field.Root` do motor entra SÓ quando há `name`: é ele que liga o campo à chave de `errors`
    // do formulário. Ele não desenha nada — é contexto — então a pele não muda.
    return name ? _jsx(BaseField.Root, { name: name, invalid: error ? true : undefined, render: corpo }) : corpo;
}
// Form (M1): o formulário que EXIBE erro, e não o que decide o que é erro.
//
// A divisão saiu de pesquisa e da medição dos consumidores (13/08/2026). O padrão de mercado é
// `react-hook-form` + `zod`, e é o que o shadcn embrulha — mas embrulhar isso aqui obrigaria TODO
// projeto que usa a Aurea a usar react-hook-form, inclusive os que já validam de outro jeito (um
// consumidor real valida com zod em server action, sem biblioteca de formulário no cliente).
// Dependência nova também é decisão do Victor pelo BUILDING.md §3.3, e ela não foi necessária:
// o `Form` do Base UI — motor que a Aurea JÁ paga desde a Fase 2 — declara no próprio tipo que
// `errors` são "validation errors returned externally, typically after submission by a server or
// a form action". Ou seja, a divisão que eu ia propor já é a do motor.
//
// O que a Aurea entrega: a pele, o `name` ligando campo a erro, e o envio com os valores já
// coletados. O que ela NÃO entrega, e não vai: schema, regra, resolver, estado de campo.
export function Form({ errors, onSubmit, children, className, ...props }) {
    return _jsx(BaseForm, { errors: errors, onFormSubmit: onSubmit ? (v) => onSubmit(v) : undefined, className: cx("form", className), ...props, children: children });
}
export const Input = forwardRef(function Input({ className, formatOnBlur, size, onBlur, onChange, ...props }, ref) {
    return _jsx("input", { ref: ref, className: cx("input", peleDoEixo("input", size), className), onChange: onChange, onBlur: e => {
            if (formatOnBlur) {
                const formatado = formatOnBlur(e.currentTarget.value);
                if (formatado !== e.currentTarget.value) {
                    e.currentTarget.value = formatado;
                    onChange?.(e);
                }
            }
            onBlur?.(e);
        }, ...props });
});
// O glifo entra por `InputGroup`/`InputGroupAddon`, e não pelo `.input-wrap`: o mesmo problema
// tinha sido resolvido DUAS vezes localmente aqui — `.input-wrap` para o glifo do SearchField e
// `.input-wrap-end` para o botão do PasswordField —, e o grupo é a terceira vez virando uma. O
// merge das duas linhagens tinha trazido de volta a versão com `.input-wrap`, contra um core
// que já não a pinta.
export function SearchField({ icon = "search", className, size, width, ...props }) { return _jsxs(InputGroup, { className: className, width: width, children: [_jsx(InputGroupAddon, { children: _jsx(Icon, { name: icon, size: valorBase(size) === "sm" ? "sm" : undefined }) }), _jsx(Input, { type: "search", size: size, ...props })] }); }
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
export function NumberField({ value, defaultValue, onValueChange, min, max, step, disabled, readOnly, required, label, id, name, format, locale, className, scrubbable, scrubDirection }) {
    const s = useAureaStrings();
    return _jsx(BaseNumberField.Root, { id: id, name: name, value: value, defaultValue: defaultValue, onValueChange: soOValor(onValueChange), min: min, max: max, step: step, format: format, locale: locale, disabled: disabled, readOnly: readOnly, required: required, className: cx("number-field", className), children: _jsxs(BaseNumberField.Group, { className: "number-field-group", children: [scrubbable && _jsxs(BaseNumberField.ScrubArea, { className: cx("number-field-scrub", scrubDirection === "vertical" && "number-field-scrub-vertical"), direction: scrubDirection, "aria-hidden": "true", children: [_jsx(Icon, { name: "draggable", "aria-hidden": true }), _jsx(BaseNumberField.ScrubAreaCursor, { className: "number-field-scrub-cursor", children: _jsx(Icon, { name: "draggable", "aria-hidden": true }) })] }), _jsx(BaseNumberField.Decrement, { className: "btn btn-ghost btn-icon", "aria-label": s.decrement, children: _jsx(Icon, { name: "subtract" }) }), _jsx(BaseNumberField.Input, { className: "input number-field-input", "aria-label": label }), _jsx(BaseNumberField.Increment, { className: "btn btn-ghost btn-icon", "aria-label": s.increment, children: _jsx(Icon, { name: "add" }) })] }) });
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
export function OTPField({ length, value, defaultValue, onValueChange, mask, disabled, required, label, id, className }) {
    const s = useAureaStrings();
    return _jsx(BaseOTPField.Root, { id: id, length: length, value: value, defaultValue: defaultValue, onValueChange: soOValor(onValueChange), mask: mask, disabled: disabled, required: required, role: "group", "aria-label": label, className: cx("otp-field", className), children: Array.from({ length }, (_, i) => _jsx(BaseOTPField.Input, { render: _jsx("input", { "aria-label": `${s.otpDigit} ${i + 1}` }), className: "input otp-slot" }, i)) });
}
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
export function SegmentedControl({ items, value, onChange, label }) {
    const s = useAureaStrings();
    return _jsx(BaseRadioGroup, { className: "segmented", "aria-label": label ?? s.optionsLabel, value: value, onValueChange: v => onChange(String(v)), children: items.map(i => _jsx(BaseRadio.Root, { value: i.value, className: i.value === value ? "active" : undefined, nativeButton: true, render: _jsx("button", { type: "button" }), children: i.label }, i.value)) });
}
const ehAgrupado = (items) => items != null && items.length > 0 && typeof items[0] === "object" && items[0] != null && "items" in items[0];
// UM renderizador e UMA lista para os dois combobox: duas cópias da mesma árvore é como a
// segunda fica para trás na mudança seguinte.
// A COLUNA DO CHECK EXISTE SEMPRE (A-01, 23/09/2026). O `ItemIndicator` do Base UI não põe
// NADA no DOM quando o item não está escolhido; com um filho só, o texto caía na primeira coluna
// da grade — a de 16px — e quebrava em duas ou três linhas. O invólucro fica montado sempre, como
// o `.menu-mark` do `Menu` já faz, e o indicador aparece e some DENTRO dele.
const renderComboboxItem = (item) => _jsxs(BaseCombobox.Item, { value: item, className: "menu-item combobox-item", children: [_jsx("span", { className: "combobox-check", "aria-hidden": "true", children: _jsx(BaseCombobox.ItemIndicator, { children: _jsx(Icon, { name: "checkmark", size: "sm" }) }) }), _jsx("span", { children: item.label })] }, item.value);
const listaCombobox = (items) => _jsx(BaseCombobox.List, { children: ehAgrupado(items)
        ? (group) => _jsxs(BaseCombobox.Group, { items: group.items, className: "combobox-section", children: [_jsx(BaseCombobox.GroupLabel, { className: "combobox-group-label", children: group.label }), _jsx(BaseCombobox.Collection, { children: renderComboboxItem })] }, group.label)
        : renderComboboxItem });
// `aria-describedby` e `aria-invalid` são explícitos e não caem em `...props` por acidente: este
// componente destrincha uma lista fixa, então o que não está aqui é DESCARTADO em silêncio — e era
// exatamente isso que fazia o `Field` não alcançar o input do Combobox (AUD-0001, 12/08/2026).
// Vão para o `Input`, que é o nó focal: no contêiner eles não seriam anunciados.
// `disabled` vai na ROOT, não no Input: `Input`, `Trigger`, `Clear` e `ChipRemove` leem todos o
// mesmo `selectors.disabled` do store do Base UI (@base-ui/react 1.6.0). Desabilitar o Input
// deixaria os dois botões vivos — abrir a lista de um campo desabilitado é o defeito, não o texto.
export function Combobox({ items, value, onValueChange, placeholder, label, empty, disabled, size, id, className, "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return _jsxs(BaseCombobox.Root, { items: items, value: value, onValueChange: soOValor(onValueChange), disabled: disabled, itemToStringLabel: (i) => i.label, children: [_jsxs("div", { className: cx("field", className), children: [label && _jsx("label", { className: "label", htmlFor: inputId, children: label }), _jsxs(BaseCombobox.InputGroup, { className: "combobox-group", children: [_jsx(BaseCombobox.Input, { id: inputId, placeholder: placeholder, className: cx("input", peleDoEixo("input", size)), "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo }), _jsxs("span", { className: "combobox-actions", children: [_jsx(BaseCombobox.Clear, { render: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "close", label: s.comboboxClear }) }), _jsx(BaseCombobox.Trigger, { render: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "chevron--down", label: s.comboboxOpen }) })] })] })] }), _jsx(BaseCombobox.Portal, { container: portal, children: _jsx(BaseCombobox.Positioner, { sideOffset: 6, children: _jsxs(BaseCombobox.Popup, { className: "menu combobox-popup", children: [_jsx(BaseCombobox.Empty, { className: "combobox-empty", children: empty ?? s.comboboxEmpty }), listaCombobox(items)] }) }) })] });
}
// MultiCombobox (Fase 4): multi-seleção com chips, opções agrupadas e filtro
// externo (async). Reusa .combobox-popup/-item/-empty do básico.
// - Agrupar: passar ComboboxOptGroup[] em items (label + items). Detecção pela
//   presença de .items no 1º elemento — não misturar plano com agrupado.
// - Async: passar onInputChange; o filtro interno do Base UI desliga
//   (filter={null}) e o consumidor troca os items conforme a busca retorna.
//   loading só troca o texto do vazio para não piscar "Nenhum resultado".
export function MultiCombobox({ items, value, onValueChange, onInputChange, loading, placeholder, label, empty, disabled, id, className, "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo }) {
    const s = useAureaStrings();
    const portal = usePortalContainer();
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return _jsxs(BaseCombobox.Root, { multiple: true, items: items, value: value, onValueChange: soOValor(onValueChange), disabled: disabled, itemToStringLabel: (i) => i.label, filter: onInputChange ? null : undefined, onInputValueChange: onInputChange ? ((v, d) => { if (d.reason !== "item-press")
            onInputChange(v); }) : undefined, children: [_jsxs("div", { className: cx("field", className), children: [label && _jsx("label", { className: "label", htmlFor: inputId, children: label }), _jsxs(BaseCombobox.InputGroup, { className: "combobox-multi", children: [_jsx(BaseCombobox.Chips, { className: "combobox-chips", children: _jsx(BaseCombobox.Value, { children: (selected) => _jsxs(_Fragment, { children: [selected.map((item) => _jsxs(BaseCombobox.Chip, { className: "combobox-chip", children: [item.label, _jsx(BaseCombobox.ChipRemove, { className: "combobox-chip-remove", "aria-label": `${s.comboboxRemove} ${item.label}`, children: _jsx(Icon, { name: "close", size: "sm" }) })] }, item.value)), _jsx(BaseCombobox.Input, { id: inputId, placeholder: selected.length ? undefined : placeholder, className: "combobox-chip-input", "aria-describedby": descrito, "aria-invalid": invalido, "aria-label": rotulo })] }) }) }), _jsxs("span", { className: "combobox-actions", children: [_jsx(BaseCombobox.Clear, { render: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "close", label: s.comboboxClear }) }), _jsx(BaseCombobox.Trigger, { render: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "chevron--down", label: s.comboboxOpen }) })] })] })] }), _jsx(BaseCombobox.Portal, { container: portal, children: _jsx(BaseCombobox.Positioner, { sideOffset: 6, children: _jsxs(BaseCombobox.Popup, { className: "menu combobox-popup", children: [_jsx(BaseCombobox.Empty, { className: "combobox-empty", children: loading ? s.comboboxLoading : (empty ?? s.comboboxEmpty) }), listaCombobox(items)] }) }) })] });
}
const ehGrupoDoSelect = (i) => typeof i === "object" && i != null && "items" in i;
// Lê `<option>`/`<optgroup>` como o navegador lê: `value` ausente vale o TEXTO da opção.
function opcoesDosFilhos(children) {
    const lista = [];
    React.Children.forEach(children, filho => {
        if (!React.isValidElement(filho))
            return;
        const pr = filho.props;
        if (filho.type === "option")
            lista.push({ value: String(pr.value ?? React.Children.toArray(pr.children).join("")), label: pr.children, disabled: pr.disabled });
        else if (filho.type === "optgroup")
            lista.push({ label: pr.label, items: opcoesDosFilhos(pr.children) });
        else if (filho.type === React.Fragment)
            lista.push(...opcoesDosFilhos(pr.children));
    });
    return lista;
}
const itemDoSelect = (o) => _jsxs(BaseSelect.Item, { value: o.value, disabled: o.disabled, className: "menu-item combobox-item", children: [_jsx("span", { className: "combobox-check", "aria-hidden": "true", children: _jsx(BaseSelect.ItemIndicator, { children: _jsx(Icon, { name: "checkmark", size: "sm" }) }) }), _jsx(BaseSelect.ItemText, { children: o.label })] }, o.value);
export const Select = forwardRef(function Select({ items, children, value, defaultValue, onChange, onValueChange, placeholder, name, required, disabled, size, className, ...props }, ref) {
    const portal = usePortalContainer();
    const lista = items ?? opcoesDosFilhos(children);
    const planas = lista.flatMap(i => ehGrupoDoSelect(i) ? i.items : [i]);
    const inicial = value === undefined && defaultValue === undefined && placeholder === undefined ? planas.find(o => !o.disabled)?.value : defaultValue;
    const mudar = (v) => {
        const valor = v ?? "";
        onValueChange?.(valor);
        onChange?.({ target: { value: valor, name }, currentTarget: { value: valor, name } });
    };
    return _jsxs(BaseSelect.Root, { items: planas.map(o => ({ value: o.value, label: o.label })), ...(value !== undefined ? { value } : { defaultValue: inicial }), onValueChange: v => mudar(v), name: name, required: required, disabled: disabled, children: [_jsx(BaseSelect.Trigger, { ref: ref, className: cx("select", "select-trigger", peleDoEixo("select", size), className), ...props, children: _jsx(BaseSelect.Value, { placeholder: placeholder, className: "select-value" }) }), _jsx(BaseSelect.Portal, { container: portal, children: _jsx(BaseSelect.Positioner, { sideOffset: 6, alignItemWithTrigger: false, children: _jsx(BaseSelect.Popup, { className: "menu combobox-popup", children: _jsx(BaseSelect.List, { children: lista.map((i, n) => ehGrupoDoSelect(i)
                                ? _jsxs(BaseSelect.Group, { className: "combobox-section", children: [_jsx(BaseSelect.GroupLabel, { className: "combobox-group-label", children: i.label }), i.items.map(itemDoSelect)] }, n)
                                : itemDoSelect(i)) }) }) }) })] });
});
export function BlockEditor({ blocks, onReorder, onRemove, label, className, ...props }) {
    const s = useAureaStrings();
    const bid = React.useId();
    const n = blocks.length;
    // O protocolo de arrasto acessível é o MESMO da `SortableList` — extraído para o `internal` em
    // vez de copiado, porque duas cópias garantem que a próxima correção entre em uma só.
    const r = useReorder({ count: n, order: blocks, onReorder,
        rowSelector: ".block-item", handleSelector: ".block-handle" });
    return _jsxs(_Fragment, { children: [_jsx("ol", { ref: r.ref, className: cx("block-editor", className), "aria-label": label ?? s.blockEditorLabel, ...props, children: blocks.map((b, i) => {
                    const kid = `${bid}k${i}`, hid = `${bid}h${i}`, rid = `${bid}r${i}`;
                    return _jsxs("li", { className: "block-item", "data-grabbed": r.pego === i || undefined, children: [_jsxs("div", { className: "block-rail", children: [_jsxs("button", { type: "button", id: hid, className: "block-handle", "aria-labelledby": `${hid} ${kid}`, "aria-describedby": `${bid}ajuda`, "aria-pressed": r.pego === i, onKeyDown: e => r.teclado(e, i), onPointerDown: e => r.ponteiroBaixo(e, i), onPointerMove: r.ponteiroMove, onPointerUp: r.ponteiroSolta, onPointerCancel: r.ponteiroSolta, children: [_jsx(Icon, { name: "drag--horizontal" }), _jsx("span", { className: "sr-only", children: s.sortableHandle })] }), onRemove && _jsxs("button", { type: "button", id: rid, className: "block-remove", "aria-labelledby": `${rid} ${kid}`, onClick: () => onRemove(i), children: [_jsx(Icon, { name: "trash-can" }), _jsx("span", { className: "sr-only", children: s.blockRemove })] })] }), _jsx("div", { className: "block-body", children: b.children }), _jsxs("span", { id: kid, className: "sr-only", children: [b.kind ?? s.blockLabel, " ", i + 1, " ", s.positionOf, " ", n] })] }, b.id);
                }) }), _jsx("span", { id: `${bid}ajuda`, className: "sr-only", children: s.sortableHelp }), _jsx("div", { role: "status", "aria-live": "polite", className: "sr-only", children: r.aviso })] });
}
export function PasswordField({ className, size, defaultVisible = false, id, ...props }) {
    const s = useAureaStrings();
    const [visivel, setVisivel] = React.useState(defaultVisible);
    const auto = React.useId();
    const campoId = id ?? auto;
    return _jsxs(InputGroup, { className: className, children: [_jsx(Input, { id: campoId, type: visivel ? "text" : "password", className: peleDoEixo("input", size) || undefined, autoComplete: "current-password", ...props }), _jsx(InputGroupAddon, { side: "end", layout: "inline", children: _jsx(IconButton, { variant: "ghost", size: valorBase(size) === "lg" ? "md" : "sm", icon: visivel ? "view--off" : "view", label: visivel ? s.passwordHide : s.passwordShow, "aria-controls": campoId, onClick: () => setVisivel(v => !v) }) })] });
}
