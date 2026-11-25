// O BANCO DO INVÁLIDO DO NATIVO (lote 104, 25/11/2026 — a "varredura do inválido no nativo", aprovada pelo Victor em
// 24/11/2026: "Sim"). Não é página do site: a montagem do desenho do nativo (`ssr.mjs`) só reexporta esta lista, e quem a
// usa é o `tests/visual/invalido-nativo.spec.ts`.
//
// Cada caso é UM campo do nativo desenhado duas vezes, no MESMO arranjo: sem erro e com erro. A única diferença entre as
// duas é o erro — no `Field`, a dica dá lugar à frase de erro com o MESMO texto (a árvore fica igual, elemento por
// elemento); nas peças que têm a prop `invalid`, só ela muda. Assim a varredura compara a cor de cada pedaço com o pedaço
// igual da outra metade, e não precisa de seletor por peça (o `react-native-web` não tem classe com nome).
//
// A web tem a mesma régua desde 28/08/2026 (`tests/visual/invalido.spec.ts`), mas lá o erro é o `aria-invalid` posto no
// controle de qualquer página; no nativo o erro é prop, e só um desenho novo o mostra — daí o banco.
import {createElement as h} from "react";
import {
  Checkbox, Combobox, Field, Input, InputGroup, InputGroupAddon, NumberField, OTPField, PasswordField, Radio, RadioGroup,
  SearchField, Select, Text, Textarea,
} from "../../../packages/native/dist/index.js";
import {DatePicker} from "../../../packages/native/dist/sistema.js";
import {FileInput} from "../../../packages/native/dist/arquivo.js";

const FRASE = "Check this value.";
const nada = () => {};
const largura = {width: 320};

// O campo dentro do `Field`: sem erro, a frase é a dica; com erro, é o erro. Mesmo texto, mesma árvore.
const noCampo = (rotulo, controle) => (erro) => h("div", {style: largura},
  h(Field, {label: rotulo, ...(erro ? {error: FRASE} : {hint: FRASE})}, controle()));

const ITENS = [{value: "km", label: "Kilometres"}, {value: "mi", label: "Miles"}];

/**
 * `ficha`: o nome da ficha (`packages/contracts/registry`), para a varredura saber que peça este caso cobre.
 * `nome`: o que aparece na lista de reprovações. `rotulo`: o rótulo do `Field`, quando o caso mora num. `peca(erro)`: o elemento, sem erro (`false`) ou com erro (`true`).
 */
export const CASOS_DO_INVALIDO = [
  {ficha: "Input", nome: "Input no Field", rotulo: "Email", peca: noCampo("Email", () => h(Input, {defaultValue: "ada@"}))},
  {ficha: "Input", nome: "Input com invalid", peca: (erro) => h("div", {style: largura},
    h(Input, {defaultValue: "ada@", invalid: erro, accessibilityLabel: "Email"}))},
  {ficha: "Input", nome: "Input secondary no Field", rotulo: "Email", peca: noCampo("Email", () => h(Input, {defaultValue: "ada@", variant: "secondary"}))},
  {ficha: "Textarea", nome: "Textarea no Field", rotulo: "Notes", peca: noCampo("Notes", () => h(Textarea, {defaultValue: "Trip"}))},
  {ficha: "Textarea", nome: "Textarea com invalid", peca: (erro) => h("div", {style: largura},
    h(Textarea, {defaultValue: "Trip", invalid: erro, accessibilityLabel: "Notes"}))},
  {ficha: "InputGroup", nome: "InputGroup no Field", rotulo: "Price", peca: noCampo("Price", () =>
    h(InputGroup, null, h(InputGroupAddon, null, h(Text, null, "R$")), h(Input, {defaultValue: "12"})))},
  {ficha: "PasswordField", nome: "PasswordField no Field", rotulo: "Password", peca: noCampo("Password", () => h(PasswordField, {defaultValue: "secret"}))},
  {ficha: "Select", nome: "Select no Field", rotulo: "Unit", peca: noCampo("Unit", () => h(Select, {items: ITENS, value: "km", onChange: nada}))},
  {ficha: "Combobox", nome: "Combobox no Field", rotulo: "Unit", peca: noCampo("Unit", () =>
    h(Combobox, {items: ITENS, value: null, onValueChange: nada, placeholder: "Pick a unit"}))},
  {ficha: "SearchField", nome: "SearchField no Field", rotulo: "Search", peca: noCampo("Search", () => h(SearchField, {value: "tea", onChangeText: nada}))},
  {ficha: "NumberField", nome: "NumberField no Field", rotulo: "Quantity", peca: noCampo("Quantity", () => h(NumberField, {value: 2, onValueChange: nada}))},
  {ficha: "OTPField", nome: "OTPField no Field", rotulo: "Code", peca: noCampo("Code", () => h(OTPField, {length: 4, value: "12", onValueChange: nada}))},
  {ficha: "DatePicker", nome: "DatePicker no Field", rotulo: "Due date", peca: noCampo("Due date", () =>
    h(DatePicker, {value: new Date(2026, 10, 25), onChange: nada}))},
  {ficha: "FileInput", nome: "FileInput no Field", rotulo: "Invoice", peca: noCampo("Invoice", () => h(FileInput, {value: [], onChange: nada}))},
  // Os marcáveis nos DOIS estados: na web, o defeito do inválido só aparecia num deles (`invalido.spec.ts`, G-STATE-02).
  {ficha: "Checkbox", nome: "Checkbox vazia no Field", rotulo: "Terms", peca: noCampo("Terms", () => h(Checkbox, {label: "I accept", checked: false, onChange: nada}))},
  {ficha: "Checkbox", nome: "Checkbox marcada no Field", rotulo: "Terms", peca: noCampo("Terms", () => h(Checkbox, {label: "I accept", checked: true, onChange: nada}))},
  {ficha: "Radio", nome: "Radio vazio no Field", rotulo: "Plan", peca: noCampo("Plan", () => h(Radio, {label: "Yearly", checked: false, onChange: nada}))},
  {ficha: "Radio", nome: "Radio marcado no Field", rotulo: "Plan", peca: noCampo("Plan", () => h(Radio, {label: "Yearly", checked: true, onChange: nada}))},
  {ficha: "RadioGroup", nome: "RadioGroup com invalid", peca: (erro) => h("div", {style: largura},
    h(RadioGroup, {label: "Delivery", value: "standard", onValueChange: nada, invalid: erro},
      h(RadioGroup.Item, {value: "standard", label: "Standard"}),
      h(RadioGroup.Item, {value: "express", label: "Express"})))},
];

/**
 * As fichas que declaram `invalid`, existem no nativo e legitimamente não têm caso aqui, com o motivo — a mesma disciplina
 * do `FICHA_SEM_INVALIDO` da web: ausência declarada não é ausência silenciosa.
 */
export const SEM_CASO_NO_NATIVO = {
  Field: "é o INVÓLUCRO que propaga: recebe `error` e o controle de dentro sabe pelo contexto. Quem pinta é o controle, e " +
    "todos os casos com \"no Field\" passam por ele",
};
