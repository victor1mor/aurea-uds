// RECEITA · Developer tools (S-11, 05/11/2026) — a bancada de quem programa como tela de produto, na linguagem dos blocos
// v2 (a `Tela`, e o "Resource workbench" do desenho do Victor): a árvore dos arquivos, o arquivo aberto e o terminal. O
// arquivo abre no `CodeBlock` (que desenha sempre, também sem JavaScript); "Edit" troca para o `CodeEditor`, que só monta no
// navegador. Interação de verdade: escolher um arquivo na árvore abre ele; "Edit"/"Done"; "Run tests" roda e o terminal
// mostra o resultado.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {CodeEditor} from "../../../../packages/react/dist/code-editor.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const ARQUIVOS = {
  "button.tsx": {lang: "tsx", texto: `export function Button({variant = "secondary", children, ...props}) {\n  return <button className={\`btn btn-\${variant}\`} {...props}>{children}</button>;\n}`},
  "total.ts": {lang: "ts", texto: `export const total = (items: {price: number}[]) =>\n  items.reduce((n, i) => n + i.price, 0);`},
  "README.md": {lang: "md", texto: "# Shop\n\nRun the tests with `pnpm test`."},
};
const ARVORE = [
  {id: "src", label: "src", children: [{id: "button.tsx", label: "button.tsx"}, {id: "total.ts", label: "total.ts"}]},
  {id: "README.md", label: "README.md"},
];
const TERMINAL = [{time: "09:12", text: "$ pnpm dev"}, {time: "09:12", text: "ready on http://localhost:5173"}];

function Workbench() {
  const [aberto, setAberto] = useState("total.ts");
  const [textos, setTextos] = useState(() => Object.fromEntries(Object.entries(ARQUIVOS).map(([k, v]) => [k, v.texto])));
  const [editando, setEditando] = useState(false);
  const [linhas, setLinhas] = useState(TERMINAL);
  const [testes, setTestes] = useState("not run");
  const abrir = no => { if (ARQUIVOS[no.id]) { setAberto(no.id); setEditando(false); } };
  const testar = () => {
    setTestes("143 passed");
    setLinhas(ls => [...ls, {time: "09:15", text: "$ pnpm test"}, {time: "09:15", text: "✓ total.test.ts (12)"},
      {time: "09:15", text: "✓ button.test.tsx (131)"}, {time: "09:15", text: "Tests 143 passed · 1.8 s"}]);
  };
  return h(Tela, {icone: "terminal-window", trilha: ["Projects", "shop"], id: "main", titulo: aberto,
    estado: h(A.Status, {variant: editando ? "warning" : "success"}, editando ? "Editing" : "Saved"),
    propriedades: [["git-branch", "main · 2 ahead"], ["file-text", `${Object.keys(ARQUIVOS).length} files`], ["check", `Tests: ${testes}`]],
    acoes: [
      h(A.Button, {key: "e", variant: "secondary", leadingIcon: editando ? "check" : "pencil-simple", onClick: () => setEditando(v => !v)}, editando ? "Done" : "Edit"),
      h(A.Button, {key: "t", variant: "primary", leadingIcon: "play", onClick: testar}, "Run tests")],
    lado: [
      h(Grupo, {key: "a", titulo: "Files"}, h(A.TreeView, {label: "Files", defaultExpandedIds: ["src"], items: ARVORE, selectedId: aberto, onSelect: abrir})),
      h(Propriedades, {key: "p", titulo: "This file", itens: [{term: "Language", value: ARQUIVOS[aberto].lang},
        {term: "Lines", value: String(textos[aberto].split("\n").length)}, {term: "Changed", value: textos[aberto] === ARQUIVOS[aberto].texto ? "no" : "yes"}]})],
    rodape: "The file opens read-only; editing is a choice you make, and the terminal shows exactly what ran."},
    h(Grupo, {titulo: "Editor"}, editando
      ? h(CodeEditor, {key: aberto, defaultValue: textos[aberto], ariaLabel: `Edit ${aberto}`, onChange: t => setTextos(x => ({...x, [aberto]: t}))})
      : h(A.CodeBlock, {key: aberto, language: ARQUIVOS[aberto].lang, filename: aberto, copyable: true, lineNumbers: true}, textos[aberto])),
    h(Grupo, {titulo: "Terminal", contorno: true}, h(A.LogStream, {lines: linhas})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "TreeView", "DataList", "CodeBlock", "CodeEditor", "LogStream"],
  code: `import {useState} from "react";
import {Button, Card, CodeBlock, DataList, Heading, LogStream, Separator, Status, TreeView} from "@aurea-uds/react";
import {CodeEditor} from "@aurea-uds/react/code-editor";

export function Workbench({files, tree, runTests}) {
  const [open, setOpen] = useState(Object.keys(files)[0]);
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState([]);

  return (
    <Card>
      <header>
        <Heading level={3}>{open}</Heading> <Status variant={editing ? "warning" : "success"}>{editing ? "Editing" : "Saved"}</Status>
        <Button variant="secondary" onClick={() => setEditing(e => !e)}>{editing ? "Done" : "Edit"}</Button>
        <Button variant="primary" leadingIcon="play" onClick={async () => setLines(l => [...l, ...await runTests()])}>Run tests</Button>
      </header>
      <Separator />

      <Card variant="inset">
        {editing
          ? <CodeEditor key={open} defaultValue={files[open]} ariaLabel={\`Edit \${open}\`} />
          : <CodeBlock key={open} filename={open} copyable lineNumbers>{files[open]}</CodeBlock>}
      </Card>
      <Card variant="outline"><LogStream lines={lines} /></Card>

      <div>
        <TreeView label="Files" items={tree} selectedId={open} onSelect={node => files[node.id] && setOpen(node.id)} />
        <DataList items={[{term: "Lines", value: files[open].split("\\n").length}]} />
      </div>
    </Card>
  );
}`,
  render: () => h(Workbench),
};
