// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Fechando o `G-AXIS-01`, a medição do `G-COMP-01` ganhou forma: a média de 0,86 composição por
// componente escondia a distribuição real — **77 dos 90 componentes tinham ZERO**, e um punhado
// carregava tudo. As referências não têm essa forma: duas delas estão em cobertura total, e uma
// terceira só deixa infra de fora. O alvo, portanto, não é "subir a média": é **nenhum componente
// em zero**. Este arquivo é parte dessa cobertura.
import {createElement as h, Fragment} from "react";
import {Dialog, Button, Field, Input} from "../../../../packages/react/dist/index.js";
import {ComJanela} from "../_estado.mjs";

export default [
  {
    variant: "Confirm",
    name: "Destructive confirmation",
    description: "The pause before something irreversible. The title asks the question, the body says what is lost, and the confirming button carries the danger tone — never the cancel.",
    uses: ["Dialog", "Button"],
    code: `const [open, setOpen] = useState(false);

<Button appearance="outline" tone="danger" onClick={() => setOpen(true)}>Delete project</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete this project?"
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button appearance="solid" tone="danger" onClick={remove}>Delete</Button>
  </>}
>
  Every run, dataset and share link goes with it. This cannot be undone.
</Dialog>`,
    render: () => h(ComJanela, {
      gatilho: (abrir) => h(Button, {appearance: "outline", tone: "danger", onClick: abrir}, "Delete project"),
      janela: (open, fechar) => h(Dialog, {open, onClose: fechar, title: "Delete this project?",
        footer: h(Fragment, null, h(Button, {variant: "ghost", onClick: fechar}, "Cancel"),
          h(Button, {appearance: "solid", tone: "danger", onClick: fechar}, "Delete"))},
        "Every run, dataset and share link goes with it. This cannot be undone.")}),
  },
  {
    variant: "Form",
    name: "Short form in a dialog",
    description: "A dialog is the right home for a form only when it is short enough to fit without scrolling. The primary action repeats the verb of the title, so the user never has to re-read what they are confirming.",
    uses: ["Dialog", "Field", "Input", "Button"],
    code: `<Dialog
  open={open}
  onClose={close}
  title="Invite a teammate"
  footer={<>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="primary" type="submit" form="invite">Send invite</Button>
  </>}
>
  <form id="invite" onSubmit={send}>
    <Field label="Email" hint="They get access to this workspace only">
      <Input type="email" name="email" required />
    </Field>
  </form>
</Dialog>`,
    render: () => h(ComJanela, {
      gatilho: (abrir) => h(Button, {variant: "primary", onClick: abrir}, "Invite a teammate"),
      janela: (open, fechar) => h(Dialog, {open, onClose: fechar, title: "Invite a teammate",
        footer: h(Fragment, null, h(Button, {variant: "ghost", onClick: fechar}, "Cancel"),
          h(Button, {variant: "primary", type: "submit", form: "invite"}, "Send invite"))},
        h("form", {id: "invite", onSubmit: (e) => { e.preventDefault(); fechar(); }},
          h(Field, {label: "Email", hint: "They get access to this workspace only"}, h(Input, {type: "email", name: "email", required: true}))))}),
  },
];
