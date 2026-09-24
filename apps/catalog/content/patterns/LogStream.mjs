// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// Escrever estes patterns foi o que descobriu o `G-CSS-01`: o componente emitia duas células
// numa grade de três e a mensagem media 72px. Está corrigido e gateado em
// `tests/unit/grade-do-core.test.tsx`.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const cheio = {width: "100%"};

export default [
  {
    variant: "Default",
    name: "The tail of a running job",
    description: "Time, level and message in three fixed tracks, so the eye can find the level column without reading the lines. It is a live region: a line that arrives while the reader is elsewhere is announced, not silently appended.",
    uses: ["LogStream"],
    code: `<LogStream lines={[
  {time: "14:32:01", level: "info", text: "task#4821 accepted"},
  {time: "14:32:02", level: "info", text: "model loaded"},
  {time: "14:32:04", level: "warn", text: "external tool requires approval"},
  {time: "14:32:08", level: "error", text: "scope invoke:external denied"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.LogStream, {lines: [
      {time: "14:32:01", level: "info", text: "task#4821 accepted by Messenger"},
      {time: "14:32:02", level: "info", text: "model loaded"},
      {time: "14:32:04", level: "warn", text: "external tool requires human approval"},
      {time: "14:32:08", level: "error", text: "scope invoke:external denied"}]})),
  },
  {
    variant: "Default",
    name: "Lines with no level of their own",
    description: "Program output is not levelled, and forcing a level on it would be inventing information. The three cells stay in place even when two are empty — that is what keeps the message in its own track instead of sliding left.",
    uses: ["LogStream"],
    code: `<LogStream lines={stdout.map(text => ({text}))} />`,
    render: () => h("div", {style: cheio}, h(A.LogStream, {lines: [
      {text: "$ pnpm build"},
      {text: "build-tokens: wrote packages/tokens/dist/aurea.tokens.css"},
      {text: "build-core: wrote packages/core/dist/aurea.css"},
      {text: "Done in 4.2s"}]})),
  },
  {
    variant: "Default",
    name: "The log under the thing it describes",
    description: "A log beside a status is the shape an operations panel repeats: the badge says what happened, the stream says why. Neither answers the other's question, which is why both are here.",
    uses: ["Card", "Status", "LogStream", "Button"],
    code: `<Card>
  <div className="cluster">
    <strong>Nightly sweep</strong>
    <Status variant="danger">Failed</Status>
  </div>
  <LogStream lines={lines} />
  <Button size="sm" variant="secondary" leadingIcon="restart">Run again</Button>
</Card>`,
    render: () => h("div", {style: cheio}, h(A.Card, null,
      // `--space-2` e não `--space-3` nos dois respiros: a prévia media 358px numa caixa de
      // 354px (ADR-0002 — nenhuma deve exigir rolagem). O que encolhe é o espaço em volta do
      // fluxo; as três linhas ficam, porque são elas que mostram os três níveis.
      h("div", {style: {display: "flex", gap: "var(--space-3)", alignItems: "center",
        marginBottom: "var(--space-2)"}},
        h("strong", null, "Nightly sweep"), h(A.Status, {variant: "danger"}, "Failed")),
      h(A.LogStream, {lines: [
        {time: "03:00:00", level: "info", text: "sweep started"},
        {time: "03:01:12", level: "warn", text: "retrying source 3 of 9"},
        {time: "03:01:44", level: "error", text: "source 3 unreachable after 3 attempts"}]}),
      h("div", {style: {marginTop: "var(--space-2)"}},
        h(A.Button, {size: "sm", variant: "secondary", leadingIcon: "restart"}, "Run again")))),
  },
];
