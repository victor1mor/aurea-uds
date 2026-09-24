// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// DataList é <dl>: termo e valor, sobre UM assunto. Não é tabela — tabela compara vários
// assuntos pelos mesmos campos, e o leitor de tela navega as duas de jeitos diferentes. Trocar
// uma pela outra tira do leitor exatamente a estrutura que ele usa para se orientar.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(520px,100%)"};

export default [
  {
    variant: "Default",
    name: "The facts about one record",
    description: "A definition list is the honest markup for \"this thing has these properties\". Every value here belongs to the same run; nothing on the list compares it to another run.",
    uses: ["DataList"],
    code: `<DataList items={[
  {term: "Status", value: "Succeeded"},
  {term: "Started", value: "21 Aug 2026, 09:12"},
  {term: "Duration", value: "1m 48s"},
  {term: "Triggered by", value: "Curator"},
]} />`,
    render: () => h("div", {style: largo}, h(A.DataList, {items: [
      {term: "Status", value: "Succeeded"},
      {term: "Started", value: "21 Aug 2026, 09:12"},
      {term: "Duration", value: "1m 48s"},
      {term: "Triggered by", value: "Curator"}]})),
  },
  {
    variant: "Default",
    name: "Values that are components",
    description: "`value` takes any node, so a status reads as a status and an identity reads as an identity. The alternative — spelling \"Succeeded\" as text — loses the one thing the reader scans for when the list is long.",
    uses: ["DataList", "Status", "Avatar", "Badge"],
    code: `<DataList items={[
  {term: "Result", value: <Status variant="success">Succeeded</Status>},
  {term: "Owner", value: <Avatar fallback="AN" size="sm" />},
  {term: "Version", value: <Badge>v1.4.0</Badge>},
]} />`,
    render: () => h("div", {style: largo}, h(A.DataList, {items: [
      {term: "Result", value: h(A.Status, {variant: "success"}, "Succeeded")},
      {term: "Owner", value: h("span", {style: {display: "inline-flex", gap: "var(--space-2)",
        alignItems: "center"}}, h(A.Avatar, {fallback: "AN", size: "sm"}), "Analyst")},
      {term: "Version", value: h(A.Badge, null, "v1.4.0")}]})),
  },
  {
    variant: "Default",
    name: "Inside a card, under a heading",
    description: "The shape a detail panel repeats: a title that names the record and the list that describes it. The card supplies the surface; the list supplies the structure — neither tries to do the other's job.",
    uses: ["Card", "DataList", "Button"],
    code: `<Card>
  <h3>Invoice AU-2026-0184</h3>
  <DataList items={fields} />
  <Button variant="secondary" size="sm" leadingIcon="download">Download PDF</Button>
</Card>`,
    render: () => h("div", {style: largo}, h(A.Card, null,
      // <strong> e não <h3> no PREVIEW: a demo mora sob o <h1> da página do pattern e não
      // há <h2> entre os dois, então um h3 aqui seria salto de nível — o gate
      // `catalog-sweep` cobra isso em toda página. O `code` mostra o <h3> porque é o que
      // o consumidor escreve DENTRO da própria página, onde o nível existe.
      h("strong", {style: {display: "block", marginBottom: "var(--space-3)",
        fontSize: "var(--text-base)"}}, "Invoice AU-2026-0184"),
      h(A.DataList, {items: [
        {term: "Issued", value: "1 Aug 2026"},
        {term: "Due", value: "31 Aug 2026"},
        {term: "Amount", value: "€ 1,240.00"}]}),
      h("div", {style: {marginTop: "var(--space-4)"}},
        h(A.Button, {variant: "secondary", size: "sm", leadingIcon: "download"}, "Download PDF")))),
  },
];
