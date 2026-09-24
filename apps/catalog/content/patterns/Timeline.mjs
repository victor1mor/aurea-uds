// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// Timeline é <ol>: o que aconteceu, EM ORDEM, e a ordem é a informação. O Stepper é o parente
// que descreve um processo com estado; a Timeline descreve o passado, e passado não tem "ativo".
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const cheio = {width: "min(560px,100%)"};

export default [
  {
    variant: "Default",
    name: "What happened to this record",
    description: "An ordered list because the order carries meaning: a screen reader announces \"item 2 of 5\" and the reader knows where in the story they are. A stack of divs would say the same words and lose that.",
    uses: ["Timeline"],
    code: `<Timeline items={[
  {title: "Created", time: "09:02", description: "Drafted by Writer."},
  {title: "Reviewed", time: "10:41", description: "Two comments resolved."},
  {title: "Published", time: "11:15"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.Timeline, {items: [
      {title: "Created", time: "09:02", description: "Drafted by Writer."},
      {title: "Reviewed", time: "10:41", description: "Two comments resolved."},
      {title: "Published", time: "11:15"}]})),
  },
  {
    variant: "Default",
    name: "Entries that carry their own outcome",
    description: "`title` takes a node, so an entry can say what it was and how it went in one line. This is the difference between a log the reader has to interpret and an audit trail they can scan.",
    uses: ["Timeline", "Status"],
    code: `<Timeline items={[
  {title: <>Deploy <Status variant="success">succeeded</Status></>, time: "03:14"},
  {title: <>Rollback <Status variant="warning">manual</Status></>, time: "04:02"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.Timeline, {items: [
      {title: h("span", {style: {display: "inline-flex", gap: "var(--space-2)",
        alignItems: "center"}}, "Deploy ", h(A.Status, {variant: "success"}, "succeeded")),
        time: "03:14", description: "Version 1.4.0 · 42 seconds"},
      {title: h("span", {style: {display: "inline-flex", gap: "var(--space-2)",
        alignItems: "center"}}, "Rollback ", h(A.Status, {variant: "warning"}, "manual")),
        time: "04:02", description: "Triggered by Curator after a latency alert."}]})),
  },
  {
    variant: "Default",
    name: "The activity panel of a detail page",
    description: "Beside the record, not under it: the timeline answers \"what has been done to this\" while the page answers \"what is this\". Putting it in a card of its own is what keeps the two questions from running together.",
    uses: ["Card", "Timeline"],
    code: `<Card>
  <h3>Activity</h3>
  <Timeline items={activity} />
</Card>`,
    render: () => h("div", {style: cheio}, h(A.Card, null,
      // <strong> e não <h3> no PREVIEW: a demo mora sob o <h1> da página do pattern e não
      // há <h2> entre os dois, então um h3 aqui seria salto de nível — o gate
      // `catalog-sweep` cobra isso em toda página. O `code` mostra o <h3> porque é o que
      // o consumidor escreve DENTRO da própria página, onde o nível existe.
      h("strong", {style: {display: "block", marginBottom: "var(--space-3)",
        fontSize: "var(--text-base)"}}, "Activity"),
      h(A.Timeline, {items: [
        {title: "Invoice issued", time: "1 Aug"},
        {title: "Reminder sent", time: "22 Aug", description: "Automatic, 9 days before due."},
        {title: "Paid", time: "28 Aug", description: "Bank transfer · € 1,240.00"}]}))),
  },
];
