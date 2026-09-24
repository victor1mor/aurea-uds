// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Fechando o `G-AXIS-01`, a medição do `G-COMP-01` ganhou forma: a média de 0,86 composição por
// componente escondia a distribuição real — **77 dos 90 componentes tinham ZERO**, e um punhado
// carregava tudo. As referências não têm essa forma: kibo e reui estão em cobertura total, e a
// shark só deixa infra de fora. O alvo, portanto, não é "subir a média": é **nenhum componente
// em zero**. Este arquivo é parte dessa cobertura.
import {createElement as h} from "react";
import {Dialog, Button, Field, Input} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the dialog lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

export default [
  {
    variant: "Confirm",
    name: "Destructive confirmation",
    description: "The pause before something irreversible. The title asks the question, the body says what is lost, and the confirming button carries the danger tone — never the cancel.",
    uses: ["Dialog", "Button"],
    note: PORTAL,
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
    render: () => h(Button, {appearance: "outline", tone: "danger"}, "Delete project"),
  },
  {
    variant: "Form",
    name: "Short form in a dialog",
    description: "A dialog is the right home for a form only when it is short enough to fit without scrolling. The primary action repeats the verb of the title, so the user never has to re-read what they are confirming.",
    uses: ["Dialog", "Field", "Input", "Button"],
    note: PORTAL,
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
    render: () => h(Button, {variant: "primary"}, "Invite a teammate"),
  },
];
