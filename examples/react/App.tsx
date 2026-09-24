import {useState, useMemo} from "react";
import {
  AureaProvider, AppShell, Button, Card, Field, Input,
  Dialog, Drawer, Tooltip, Popover, DropdownMenu, Tabs, useToast,
  Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator,
  ButtonGroup, Banner, ContextMenu, Combobox,
  MessageList, MessageComposer, type ComboboxOption, type ChatMessage,
} from "@aurea-uds/react";
// CodeEditor vem por subpath: ele é o único que precisa do CodeMirror, e o CodeMirror é peer
// OPCIONAL (Fase 9). Quem não usa o editor não instala nada disso.
import {CodeEditor} from "@aurea-uds/react/code-editor";
// The LANGUAGE is the consumer's (we bundle none): install the one you need,
// e.g. `pnpm add @codemirror/lang-javascript`, and pass it in `extensions`.
import {javascript} from "@codemirror/lang-javascript";
import "@aurea-uds/fonts/css"; // before the core
import "@aurea-uds/core/css";

const FRUITS: ComboboxOption[] = [
  {value: "apple", label: "Apple"},
  {value: "banana", label: "Banana"},
  {value: "orange", label: "Orange"},
];

function Demo() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState("overview");
  const [banner, setBanner] = useState(true);
  const [fruit, setFruit] = useState<ComboboxOption | null>(null);
  // Presentational chat: the consumer owns the messages and the sending (transport
  // is theirs). MessageComposer emits the text; here we just append to the array.
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    {id: "1", author: "Analyst", time: "14:36", avatar: {fallback: "A"}, body: "Discrepancy between the policy and ADR-0091.", status: {label: "Delivered", variant: "success"}},
  ]);
  // Memoize the extensions so the editor doesn't reconfigure on every render.
  const editorExt = useMemo(() => [javascript({typescript: true})], []);
  const toast = useToast();

  return (
    <AppShell brand="Aurea" navigation={<nav />}>
      {banner && (
        <Banner variant="warning" title="Scheduled maintenance" icon="warning" onDismiss={() => setBanner(false)}>
          <p>The service is unavailable from 2 to 4 AM.</p>
        </Banner>
      )}

      <Card>
        <h1>Aurea</h1>

        {/* Toolbar: arrows move between buttons, Tab enters and leaves (roving tabindex). */}
        <Toolbar label="Editing">
          <ToolbarGroup label="Format">
            <ToolbarButton leadingIcon="edit">Edit</ToolbarButton>
            <ToolbarButton leadingIcon="copy">Duplicate</ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton leadingIcon="trash-can" variant="danger">Delete</ToolbarButton>
        </Toolbar>

        {/* ButtonGroup: grouping only. Each button stays tabbable. */}
        <ButtonGroup label="Alignment">
          <Button>Left</Button>
          <Button>Center</Button>
          <Button>Right</Button>
        </ButtonGroup>

        <Combobox items={FRUITS} label="Fruit" placeholder="Type to filter" value={fruit} onValueChange={setFruit} />

        <ContextMenu
          label="Item actions"
          items={[
            {label: "Rename", leadingIcon: "edit"},
            "separator",
            {label: "Delete", leadingIcon: "trash-can", onClick: () => toast.add({title: "Deleted", type: "danger"})},
          ]}
        >
          <Card variant="inset"><p className="muted">Right-click here.</p></Card>
        </ContextMenu>

        <div className="cluster">
          <Button variant="primary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => setDrawer(true)}>Open panel</Button>
          <Tooltip content="Button hint"><Button variant="ghost">With hint</Button></Tooltip>
          <Popover trigger={<Button variant="outline">Details</Button>} title="Details">
            <p className="muted">Content anchored to the trigger.</p>
          </Popover>
          <DropdownMenu
            label="Actions"
            trigger={<Button variant="secondary">Actions</Button>}
            items={[
              {label: "Duplicate", onClick: () => toast.add({title: "Duplicated"})},
              "separator",
              {label: "Delete", onClick: () => toast.add({title: "Deleted", type: "danger"})},
            ]}
          />
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            {id: "overview", label: "Overview", content: <p>Overview content.</p>},
            {id: "settings", label: "Settings", content: <Field label="Name"><Input /></Field>},
          ]}
        />

        {/* CodeEditor: CodeMirror 6 engine, Aurea skin via tokens (dark/light).
            The language comes from outside (editorExt). Uncontrolled: defaultValue +
            onChange, like FileInput. Give the container a height. */}
        <Field label="Editor">
          <div style={{height: 220}}>
            <CodeEditor
              defaultValue={"// edit freely\nexport const sum = (a: number, b: number) => a + b;\n"}
              extensions={editorExt}
              onChange={code => console.log(code.length, "characters")}
            />
          </div>
        </Field>

        {/* Chat: MessageList is the live region (role="log") — a new message is
            announced in the order it arrives. Composer sends on Enter and clears.
            (Not inside a Field: the composer already owns its form and label.) */}
        <div className="stack">
          <span className="label">Conversation</span>
          <MessageList messages={msgs} label="Paired channel" />
          <MessageComposer
            placeholder="Write a message…"
            onSend={text => setMsgs(m => [...m, {id: String(m.length + 1), author: "You", time: "now", body: text}])}
          />
        </div>
      </Card>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Confirm action"
        footer={
          <div className="cluster" style={{justifyContent: "flex-end"}}>
            <Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { setDialog(false); toast.add({title: "Saved", type: "success"}); }}>Confirm</Button>
          </div>
        }
      >
        <p>Focus trapped; Escape closes and focus returns to the trigger.</p>
      </Dialog>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Side panel">
        <Field label="Search"><Input placeholder="Filter" /></Field>
      </Drawer>
    </AppShell>
  );
}

// AureaProvider supplies the default (English) strings and mounts the tooltip/toast
// providers. For pt-BR, pass the exported locale: <AureaProvider strings={ptBR}>.
export default function App() {
  return <AureaProvider><Demo /></AureaProvider>;
}
