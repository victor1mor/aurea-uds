// VITRINE da categoria — é este arquivo que `@aurea-uds/react/inputs` resolve. Sem `"use client"`
// de propósito: a diretiva contamina o módulo inteiro e faria a marcação pura chegar como cliente
// por vizinhança (ADR-0026; o check 26b reprova quem a puser de volta aqui).
//
// Os seis controles continuam IMPORTADOS pelo irmão de cliente, e não só reexportados aqui: o
// `ehControle` do `Field` compara por IDENTIDADE de referência, e dois objetos com o mesmo nome
// quebrariam o rótulo do campo em silêncio. Um caminho de import, um objeto.
export * from "./inputs-client.js";
export {Textarea, Checkbox, Radio, Switch, Range} from "./markup.js";
// PORTADOS no merge de 28/08/2026, da linhagem da ATIVIDADE-2 — não existiam na `main`.
// Saem do `markup` pela mesma razão dos seis acima: nenhum usa hook, então chegam como
// componente de SERVIDOR e não arrastam a fronteira de cliente com eles.
export {Label, InputGroup, InputGroupAddon, type AddonSide, type AddonLayout, type FieldSize} from "./markup.js";
