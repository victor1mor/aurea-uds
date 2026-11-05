// RECEITA · Education (S-11, 05/11/2026) — uma aula de um curso como tela de produto, na linguagem dos blocos v2 (a `Tela`):
// o caminho das aulas (`Stepper`), o progresso do módulo, o conteúdo da aula em partes que abrem (`Accordion`), e a pergunta
// de fixação com a resposta conferida. Interação de verdade: responder e conferir (certo ou errado, com o porquê); "Mark as
// complete" fecha a aula, o progresso anda e a próxima aula abre.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const AULAS = ["Tokens", "Density", "Themes", "Focus", "Contrast"];
const CONTEUDO = [
  {id: "a", title: "What a token is", content: "A named value — a colour, a radius, a space — that every component reads instead of writing its own number."},
  {id: "b", title: "Why names, not numbers", content: "When the brand changes, one value changes, and every screen follows. A raw number is a place that will not."},
  {id: "c", title: "Where they live", content: "In one file, in a standard format, built for the web and for native from the same source."},
];

function Lesson() {
  const [feitas, setFeitas] = useState(2);
  const [resposta, setResposta] = useState("");
  const [conferida, setConferida] = useState(false);
  const atual = Math.min(feitas, AULAS.length - 1);
  const certa = resposta === "one";
  const concluir = () => { setFeitas(f => Math.min(AULAS.length, f + 1)); setResposta(""); setConferida(false); };
  return h(Tela, {icone: "graduation-cap", trilha: ["Courses", "Foundations"], id: `lesson-${atual + 1}`, titulo: `Lesson ${atual + 1} · ${AULAS[atual]}`,
    estado: h(A.Status, {variant: feitas >= AULAS.length ? "success" : "info"}, feitas >= AULAS.length ? "Module complete" : "In progress"),
    propriedades: [["clock", "12 min"], ["file-text", "3 parts"], ["check", `${feitas} of ${AULAS.length} lessons`]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "check", disabled: !conferida || !certa || feitas >= AULAS.length, onClick: concluir}, "Mark as complete"),
    lado: [
      h(Grupo, {key: "p", titulo: "Module"}, h(A.Progress, {value: Math.round(feitas / AULAS.length * 100), label: "Module progress", showLabel: true, detail: `${feitas} of ${AULAS.length}`})),
      h(Propriedades, {key: "i", titulo: "Course", itens: [{term: "Teacher", value: "Curator"}, {term: "Level", value: "Beginner"}, {term: "Certificate", value: "At 5 of 5"}]})],
    rodape: "A lesson closes only after its question is answered right; the answer explains itself either way."},
    // Cinco aulas não cabem lado a lado num celular: o caminho rola no próprio lugar em vez de passar da caixa.
    h(Grupo, {titulo: "Lessons"}, h("div", {style: {minInlineSize: 0, overflowX: "auto"}},
      h(A.Stepper, {label: "Lessons", items: AULAS.map((a, i) => ({label: a, state: i < feitas ? "done" : i === atual ? "active" : "default"}))}))),
    h(A.Accordion, {variant: "surface", defaultValue: ["a"], items: CONTEUDO}),
    h(Grupo, {titulo: "Check your understanding"},
      h(A.RadioGroup, {label: "When the brand colour changes, how many values change?", value: resposta, onValueChange: v => { setResposta(v); setConferida(false); }},
        h(A.Radio, {value: "one", label: "One — the token"}),
        h(A.Radio, {value: "all", label: "One per component that uses it"}),
        h(A.Radio, {value: "none", label: "None — it is set in each screen"})),
      h("div", null, h(A.Button, {appearance: "soft", tone: "brand", disabled: !resposta, onClick: () => setConferida(true)}, "Check the answer")),
      conferida ? h(A.Alert, {variant: certa ? "success" : "warning", title: certa ? "Right" : "Not quite"},
        certa ? "Every component reads the token, so changing it once changes them all." : "Components read the token instead of keeping their own copy — so only the token changes.") : null));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "Progress", "DataList", "Stepper", "Accordion", "RadioGroup", "Radio", "Alert"],
  code: `import {useState} from "react";
import {Accordion, Alert, Button, Card, DataList, Heading, Progress, Radio, RadioGroup, Separator, Status, Stepper} from "@aurea-uds/react";

export function Lesson({lessons, parts, question}) {
  const [done, setDone] = useState(2);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const right = answer === question.correct;

  return (
    <Card>
      <header>
        <Heading level={3}>Lesson {done + 1} · {lessons[done]}</Heading> <Status variant="info">In progress</Status>
        <Button variant="primary" disabled={!checked || !right}
          onClick={() => { setDone(d => d + 1); setAnswer(""); setChecked(false); }}>Mark as complete</Button>
      </header>
      <Separator />

      <Stepper label="Lessons" items={lessons.map((l, i) => ({label: l, state: i < done ? "done" : i === done ? "active" : "default"}))} />
      <Accordion variant="surface" defaultValue={[parts[0].id]} items={parts} />
      <RadioGroup label={question.text} value={answer} onValueChange={v => { setAnswer(v); setChecked(false); }}>
        {question.options.map(o => <Radio key={o.value} value={o.value} label={o.label} />)}
      </RadioGroup>
      <Button appearance="soft" tone="brand" disabled={!answer} onClick={() => setChecked(true)}>Check the answer</Button>
      {checked && <Alert variant={right ? "success" : "warning"} title={right ? "Right" : "Not quite"}>{question.why}</Alert>}

      <aside>
        <Progress value={done / lessons.length * 100} label="Module progress" showLabel />
      </aside>
    </Card>
  );
}`,
  render: () => h(Lesson),
};
