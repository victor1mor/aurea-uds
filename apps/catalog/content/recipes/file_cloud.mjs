// RECEITA · Files · cloud (S-11, 05/11/2026) — os arquivos na nuvem como tela de produto, na linguagem dos blocos v2 (a
// `Tela`, e o "Resource workbench" do desenho do Victor): as pastas, a grade dos arquivos (`DataGrid`, a decisão S-02) com
// o estado de cada um, o envio com progresso de verdade (`FileInput` com `upload`), e o inspetor do arquivo escolhido com
// as ações que a fase dele permite. Interação de verdade: trocar de pasta; escolher um arquivo; enviar um arquivo do seu
// computador (o progresso anda e ele entra na grade); pausar e retomar a transferência; conferir a soma.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const ESTADO = {verified: ["success", "Verified"], transferring: ["info", "Transferring"], paused: ["warning", "Paused"], uploaded: ["neutral", "Not verified"]};
const PASTAS = [{id: "brand", label: "Brand", children: [{id: "marks", label: "Marks"}, {id: "type", label: "Type"}]}, {id: "reports", label: "Reports"}];
const ARQUIVOS = [
  {id: "f1", folder: "marks", name: "brand-mark.svg", size: "12 KB", state: "transferring", progress: 62, sum: "sha256 9f2c…4be1"},
  {id: "f2", folder: "marks", name: "wordmark.svg", size: "9 KB", state: "verified", progress: 100, sum: "sha256 a01d…77c0"},
  {id: "f3", folder: "type", name: "Inter-Variable.woff2", size: "294 KB", state: "verified", progress: 100, sum: "sha256 3be8…02a9"},
  {id: "f4", folder: "reports", name: "q3-report.pdf", size: "1.2 MB", state: "uploaded", progress: 100, sum: "sha256 c4f1…9e3d"},
];
const tamanho = b => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`;
const espera = ms => new Promise(r => setTimeout(r, ms));
// O id do arquivo enviado sai de um contador (e não do relógio, que o validador recusa no conteúdo do catálogo).
let enviados = 0;

function Files() {
  const [pasta, setPasta] = useState("marks");
  const [arquivos, setArquivos] = useState(ARQUIVOS);
  const [escolhido, setEscolhido] = useState("f1");
  const muda = (id, campos) => setArquivos(as => as.map(a => a.id === id ? {...a, ...campos} : a));
  const daPasta = arquivos.filter(a => a.folder === pasta);
  const f = arquivos.find(a => a.id === escolhido) || daPasta[0];
  // O envio de exemplo: o progresso anda em passos e o arquivo entra na grade da pasta aberta.
  const enviar = async (file, {onProgress, signal}) => {
    for (let i = 1; i <= 10; i++) { if (signal.aborted) throw new Error("canceled"); await espera(120); onProgress(i / 10); }
    const id = `n${++enviados}`;
    setArquivos(as => [...as, {id, folder: pasta, name: file.name, size: tamanho(file.size), state: "uploaded", progress: 100, sum: "not computed yet"}]);
    setEscolhido(id);
  };
  const colunas = [
    {accessorKey: "name", header: "Name", cell: ({row}) => h(A.Button, {variant: "link", leadingIcon: "file-text", onClick: () => setEscolhido(row.original.id),
      "aria-pressed": escolhido === row.original.id ? "true" : "false"}, row.original.name)},
    {accessorKey: "size", header: "Size"},
    {accessorKey: "state", header: "State", cell: ({getValue}) => h(A.Status, {variant: ESTADO[getValue()][0]}, ESTADO[getValue()][1])},
  ];
  const nomeDaPasta = id => [...PASTAS, ...PASTAS.flatMap(p => p.children || [])].find(p => p.id === id)?.label ?? id;
  return h(Tela, {icone: "folder-open", trilha: ["Shared workspace", "Brand"], titulo: nomeDaPasta(pasta),
    estado: h(A.Status, {variant: arquivos.some(a => a.state === "transferring") ? "info" : "success"},
      arquivos.some(a => a.state === "transferring") ? "1 transfer" : "All synced"),
    propriedades: [["file-text", `${daPasta.length} files`], ["cloud-arrow-up", "Synced 09:04"], ["users", "Shared with 4"]],
    lado: [
      h(Grupo, {key: "p", titulo: "Folders"}, h(A.TreeView, {label: "Folders", items: PASTAS, defaultExpandedIds: ["brand"], selectedId: pasta,
        onSelect: no => { if (no.id !== "brand") { setPasta(no.id); setEscolhido(arquivos.find(a => a.folder === no.id)?.id); } }})),
      f ? h(Propriedades, {key: "i", titulo: f.name, itens: [{term: "Size", value: f.size}, {term: "State", value: ESTADO[f.state][1]},
        {term: "Checksum", value: h(A.Code, null, f.sum)}]}) : null,
      f && (f.state === "transferring" || f.state === "paused") ? h("div", {key: "t", style: {display: "grid", gap: "var(--space-3)"}},
        h(A.Progress, {value: f.progress, label: f.state === "paused" ? "Paused" : "Transferring", showLabel: true, detail: `${f.progress}%`}),
        h(A.Button, {variant: "secondary", leadingIcon: f.state === "paused" ? "play" : "pause", onClick: () => muda(f.id, {state: f.state === "paused" ? "transferring" : "paused"})},
          f.state === "paused" ? "Resume" : "Pause")) : null,
      f && f.state === "uploaded" ? h(A.Button, {key: "v", variant: "secondary", leadingIcon: "shield-check",
        onClick: () => muda(f.id, {state: "verified", sum: f.sum === "not computed yet" ? "sha256 7d1e…aa04" : f.sum})}, "Verify checksum") : null].filter(Boolean),
    rodape: "Only the actions the file's phase allows are shown: a transfer can be paused, a finished file can be verified."},
    h(DataGrid, {label: `Files in ${nomeDaPasta(pasta)}`, data: daPasta, columns: colunas, getRowId: a => a.id}),
    h(Grupo, {titulo: "Upload", contorno: true}, h(A.FileInput, {label: `Add to ${nomeDaPasta(pasta)}`, hint: "Any file, up to 10 MB", maxSize: 10000000, multiple: true, upload: enviar})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "TreeView", "DataList", "Progress", "Button", "DataGrid", "FileInput"],
  code: `import {useState} from "react";
import {Button, Card, Code, DataList, FileInput, Heading, Progress, Separator, Status, TreeView} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Files({folders, initialFiles, put}) {
  const [folder, setFolder] = useState(folders[0].id);
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState(null);
  const inFolder = files.filter(f => f.folder === folder);
  const file = files.find(f => f.id === selected);

  return (
    <Card>
      <header><Heading level={3}>{folder}</Heading> <Status variant="success">All synced</Status></header>
      <Separator />

      <DataGrid label="Files" data={inFolder} getRowId={f => f.id}
        columns={[
          {accessorKey: "name", header: "Name", cell: ({row}) => <Button variant="link" onClick={() => setSelected(row.original.id)}>{row.original.name}</Button>},
          {accessorKey: "size", header: "Size"},
          {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={variant[getValue()]}>{label[getValue()]}</Status>},
        ]} />
      <Card variant="outline">
        <FileInput label="Add files" multiple maxSize={10_000_000}
          upload={async (f, {onProgress, signal}) => {
            await put(f, {onProgress, signal});
            setFiles(all => [...all, {id: crypto.randomUUID(), folder, name: f.name, state: "uploaded"}]);
          }} />
      </Card>

      <div>
        <TreeView label="Folders" items={folders} selectedId={folder} onSelect={n => setFolder(n.id)} />
        {file && <DataList items={[{term: "Size", value: file.size}, {term: "Checksum", value: <Code>{file.sum}</Code>}]} />}
        {file?.state === "transferring" && <Progress value={file.progress} label="Transferring" showLabel />}
      </div>
    </Card>
  );
}`,
  render: () => h(Files),
};
