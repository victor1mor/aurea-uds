// RECEITA · Catalog · gallery (S-11, 05/11/2026) — o catálogo de imagens como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): a galeria com escolha em lote (`Gallery`), a troca para a vista em lista (a mesma escolha numa `DataGrid`, a
// decisão S-02), e ao lado o item escolhido em tamanho maior com os dados dele. Interação de verdade: escolher vários; trocar
// a vista; "Remove" pede confirmação e tira os escolhidos; clicar num item mostra ele ao lado.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela, Propriedades} from "./_tela.mjs";
import {arte} from "./_arte.mjs";

const CORES = ["#eab308", "#38bdf8", "#f472b6", "#4ade80", "#a78bfa", "#fb923c", "#2dd4bf", "#f87171"];
const NOMES = ["Cover art", "Poster", "Thumbnail", "Banner", "Avatar set", "Hero", "Icon sheet", "Pattern"];
const ITENS = NOMES.map((n, i) => ({id: `a${i + 1}`, src: arte(CORES[i], i), alt: n, caption: n, size: `${[1.2, 3.4, 0.2, 2.1, 0.8, 4.6, 0.5, 1.9][i]} MB`, kind: i % 3 ? "PNG" : "SVG"}));

function Catalog() {
  const [itens, setItens] = useState(ITENS);
  const [escolhidos, setEscolhidos] = useState(["a1", "a2"]);
  const [atual, setAtual] = useState("a1");
  const [vista, setVista] = useState("grid");
  const [confirmar, setConfirmar] = useState(false);
  const item = itens.find(i => i.id === atual) || itens[0];
  const remover = () => {
    setItens(is => is.filter(i => !escolhidos.includes(i.id)));
    if (escolhidos.includes(atual)) setAtual(itens.find(i => !escolhidos.includes(i.id))?.id);
    setEscolhidos([]); setConfirmar(false);
  };
  return h(Tela, {icone: "image", trilha: ["Library", "Brand"], id: "lib_brand", titulo: "Brand assets",
    estado: h(A.Status, {variant: "success"}, `${itens.length} items`),
    propriedades: [["check-square", `${escolhidos.length} selected`], ["cloud-arrow-up", "Synced 09:04"], ["users", "Shared with 4"]],
    acoes: [
      h(A.SegmentedControl, {key: "v", label: "View", value: vista, onChange: setVista, items: [{value: "grid", label: "Grid", icon: "squares-four"}, {value: "list", label: "List", icon: "list"}]}),
      h(A.Button, {key: "r", variant: "danger-ghost", leadingIcon: "trash", disabled: !escolhidos.length, onClick: () => setConfirmar(true)}, `Remove ${escolhidos.length || ""}`.trim())],
    lado: item ? [
      h(A.Image, {key: "i", src: item.src, alt: item.alt, ratio: "3/2"}),
      h(Propriedades, {key: "p", titulo: item.caption, itens: [{term: "Type", value: item.kind}, {term: "Size", value: item.size}, {term: "Used in", value: "3 pages"}]})] : null,
    rodape: "The grid and the list are the same selection: what you pick in one is picked in the other."},
    vista === "grid"
      ? h(A.Gallery, {label: "Brand assets", items: itens, selectionMode: "multiple", selectedIds: escolhidos, onSelectionChange: setEscolhidos,
        selected: atual, onSelect: setAtual})
      : h(DataGrid, {label: "Brand assets", data: itens, getRowId: i => i.id, selectable: true,
        rowSelection: Object.fromEntries(escolhidos.map(id => [id, true])), onRowSelectionChange: s => setEscolhidos(Object.keys(s).filter(k => s[k])),
        columns: [{accessorKey: "caption", header: "Name", cell: ({row}) => h(A.Button, {variant: "link", onClick: () => setAtual(row.original.id)}, row.original.caption)},
          {accessorKey: "kind", header: "Type"}, {accessorKey: "size", header: "Size"}]}),
    h(A.ConfirmDialog, {open: confirmar, destructive: true, title: `Remove ${escolhidos.length} items?`, confirmLabel: "Remove", cancelLabel: "Keep them",
      description: "They leave the library. Pages that use them keep their own copy.", onConfirm: remover, onCancel: () => setConfirmar(false)}));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "SegmentedControl", "Button", "Image", "DataList", "Gallery", "DataGrid", "ConfirmDialog"],
  code: `import {useState} from "react";
import {Button, Card, ConfirmDialog, DataList, Gallery, Heading, Image, SegmentedControl, Separator, Status} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Catalog({initial, remove}) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState([]);
  const [current, setCurrent] = useState(initial[0].id);
  const [view, setView] = useState("grid");
  const [confirm, setConfirm] = useState(false);
  const item = items.find(i => i.id === current);

  return (
    <Card>
      <header>
        <Heading level={3}>Brand assets</Heading> <Status variant="success">{items.length} items</Status>
        <SegmentedControl label="View" value={view} onChange={setView}
          items={[{value: "grid", label: "Grid", icon: "squares-four"}, {value: "list", label: "List", icon: "list"}]} />
        <Button variant="danger-ghost" leadingIcon="trash" disabled={!selected.length} onClick={() => setConfirm(true)}>Remove</Button>
      </header>
      <Separator />

      {view === "grid"
        ? <Gallery label="Brand assets" items={items} selectionMode="multiple" selectedIds={selected}
            onSelectionChange={setSelected} selected={current} onSelect={setCurrent} />
        : <DataGrid label="Brand assets" data={items} getRowId={i => i.id} selectable
            rowSelection={Object.fromEntries(selected.map(id => [id, true]))}
            onRowSelectionChange={s => setSelected(Object.keys(s).filter(k => s[k]))}
            columns={[{accessorKey: "caption", header: "Name"}, {accessorKey: "size", header: "Size"}]} />}

      <aside>
        <Image src={item.src} alt={item.alt} ratio="3/2" />
        <DataList items={[{term: "Type", value: item.kind}, {term: "Size", value: item.size}]} />
      </aside>

      <ConfirmDialog open={confirm} destructive title={\`Remove \${selected.length} items?\`} confirmLabel="Remove"
        onConfirm={() => { remove(selected); setItems(i => i.filter(x => !selected.includes(x.id))); setSelected([]); setConfirm(false); }}
        onCancel={() => setConfirm(false)} />
    </Card>
  );
}`,
  render: () => h(Catalog),
};
