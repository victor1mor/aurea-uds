// RECEITA · Personal productivity (S-11, 05/11/2026) — a lista do dia como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): o campo de pôr tarefa, a lista de marcar, a ordem de prioridade que se arrasta (`SortableList`), o quanto do dia
// já foi (`ProgressCircle`), e o trabalho sem rede, que guarda tudo e avisa. Interação de verdade: pôr uma tarefa (também
// com Enter); marcar e desmarcar; reordenar a prioridade (também pelo teclado); "Work offline" mostra o aviso e as mudanças
// esperam a volta da rede.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const TAREFAS = [
  {id: "t1", label: "Review the release notes", done: true},
  {id: "t2", label: "Write the recipe previews", done: false},
  {id: "t3", label: "Answer the support case #3412", done: false},
  {id: "t4", label: "Book the demo for Thursday", done: false},
];

// O id da tarefa nova sai de um contador (e não do relógio, que o validador recusa no conteúdo do catálogo).
let criadas = TAREFAS.length;

function Today() {
  const [tarefas, setTarefas] = useState(TAREFAS);
  const [nova, setNova] = useState("");
  const [semRede, setSemRede] = useState(false);
  const [pendentes, setPendentes] = useState(0);
  const muda = f => { setTarefas(f); if (semRede) setPendentes(n => n + 1); };
  const por = () => { if (!nova.trim()) return; muda(ts => [...ts, {id: `t${++criadas}`, label: nova.trim(), done: false}]); setNova(""); };
  const marcar = (id, done) => muda(ts => ts.map(t => t.id === id ? {...t, done} : t));
  const abertas = tarefas.filter(t => !t.done);
  const mover = (de, para) => muda(ts => {
    const ab = ts.filter(t => !t.done), feitas = ts.filter(t => t.done); const [x] = ab.splice(de, 1); ab.splice(para, 0, x); return [...ab, ...feitas];
  });
  const feitas = tarefas.length - abertas.length;
  const trocarRede = on => { setSemRede(on); if (!on) setPendentes(0); };
  return h(Tela, {icone: "list-checks", trilha: ["My work"], titulo: "Today",
    estado: h(A.Status, {variant: semRede ? "warning" : "success"}, semRede ? "Offline" : "Synced"),
    propriedades: [["check-circle", `${feitas} of ${tarefas.length} done`], ["calendar", "Friday 6 November"], [semRede ? "cloud-slash" : "cloud-check", semRede ? `${pendentes} changes waiting` : "Saved"]],
    acoes: h(A.Switch, {label: "Work offline", checked: semRede, onChange: e => trocarRede(e.target.checked)}),
    lado: [
      h(Grupo, {key: "p", titulo: "Progress"}, h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-3)"}},
        h(A.ProgressCircle, {label: "Done today", value: tarefas.length ? Math.round(feitas / tarefas.length * 100) : 0, size: "lg", tone: "brand"}),
        h("div", {style: {display: "grid"}}, h(A.Text, {type: "h4", numeric: true}, `${tarefas.length ? Math.round(feitas / tarefas.length * 100) : 0}%`),
          h(A.Text, {type: "body-sm", tone: "muted"}, "of today done")))),
      h(Propriedades, {key: "i", titulo: "Day", itens: [{term: "Open", value: String(abertas.length)}, {term: "Done", value: String(feitas)}, {term: "Next", value: abertas[0]?.label ?? "—"}]})],
    rodape: "Nothing is lost offline: changes wait on this device and go out when the connection returns."},
    semRede ? h(A.Banner, {variant: "info", title: "Offline — your changes are saved here"}, `${pendentes} change${pendentes === 1 ? "" : "s"} will sync when the connection returns.`) : null,
    h(Grupo, {titulo: "Add a task"}, h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "flex-end"}},
      h("div", {style: {flex: "1 1 calc(var(--space-24) * 2)"}}, h(A.Field, {label: "Task"}, h(A.Input, {value: nova, placeholder: "What needs doing?",
        onChange: e => setNova(e.target.value), onKeyDown: e => { if (e.key === "Enter") por(); }}))),
      h(A.Button, {variant: "primary", leadingIcon: "plus", disabled: !nova.trim(), onClick: por}, "Add"))),
    h(Grupo, {titulo: "Checklist"}, ...tarefas.map(t => h(A.Checkbox, {key: t.id, label: t.label, checked: t.done, onChange: e => marcar(t.id, e.target.checked)}))),
    abertas.length ? h(Grupo, {titulo: "Priority · drag or use Space and the arrows"}, h(A.SortableList, {label: "Open tasks by priority", items: abertas, onReorder: mover})) : null);
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Switch", "ProgressCircle", "DataList", "Banner", "Field", "Input", "Button", "Checkbox", "SortableList"],
  code: `import {useState} from "react";
import {Banner, Button, Card, Checkbox, Field, Heading, Input, ProgressCircle, Separator, SortableList, Status, Switch} from "@aurea-uds/react";

export function Today({initial}) {
  const [tasks, setTasks] = useState(initial);
  const [draft, setDraft] = useState("");
  const [offline, setOffline] = useState(false);
  const open = tasks.filter(t => !t.done);
  const add = () => { if (draft.trim()) setTasks(t => [...t, {id: crypto.randomUUID(), label: draft.trim(), done: false}]); setDraft(""); };
  const move = (from, to) => setTasks(ts => {
    const o = ts.filter(t => !t.done); const [x] = o.splice(from, 1); o.splice(to, 0, x); return [...o, ...ts.filter(t => t.done)];
  });

  return (
    <Card>
      <header>
        <Heading level={3}>Today</Heading> <Status variant={offline ? "warning" : "success"}>{offline ? "Offline" : "Synced"}</Status>
        <Switch label="Work offline" checked={offline} onChange={e => setOffline(e.target.checked)} />
      </header>
      <Separator />

      {offline && <Banner variant="info" title="Offline — your changes are saved here">They sync when the connection returns.</Banner>}
      <Field label="Task">
        <Input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
      </Field>
      <Button variant="primary" leadingIcon="plus" onClick={add}>Add</Button>
      {tasks.map(t => (
        <Checkbox key={t.id} label={t.label} checked={t.done}
          onChange={e => setTasks(ts => ts.map(x => x.id === t.id ? {...x, done: e.target.checked} : x))} />
      ))}
      <SortableList label="Open tasks by priority" items={open} onReorder={move} />

      <div>
        <ProgressCircle label="Done today" value={(tasks.length - open.length) / tasks.length * 100} size="lg" />
      </div>
    </Card>
  );
}`,
  render: () => h(Today),
};
