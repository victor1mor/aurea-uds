// O DropdownMenu do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. O menu guarda
// sozinho se está aberto: a página parada mostra o gatilho, e o toque abre.
import {createElement as h} from "react";
import {Button, DropdownMenu, IconButton} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const nada = () => {};
const ACOES = [
  {label: "Edit", leadingIcon: "pencil-simple", onClick: nada},
  {label: "Duplicate", leadingIcon: "copy", onClick: nada},
  "separator",
  {label: "Delete", leadingIcon: "trash", destructive: true, onClick: nada},
];

export default {
  install: 'import {DropdownMenu} from "@aurea-uds/native";',
  api: {
    trigger: "The element that opens the menu — usually a Button or an IconButton. It is cloned with the tap that opens, the ref that measures it and the expanded state; its own onPress still runs.",
    items: "The menu, as data — the web's union: actions {label, onClick?, disabled?, leadingIcon?, destructive?}, {kind: \"checkbox\"}, {kind: \"radiogroup\"}, {kind: \"submenu\"}, {kind: \"group\"}, {kind: \"link\", href} and the string \"separator\". destructive is native only: the item that destroys data, in the danger tone.",
    testID: "Test id of the menu's panel.",
  },
  examples: [
    {
      title: "Usage",
      code: `<DropdownMenu
  label="Report actions"
  trigger={<IconButton name="dots-three" label="More actions" />}
  items={[
    {label: "Edit", leadingIcon: "pencil-simple", onClick: edit},
    {label: "Duplicate", leadingIcon: "copy", onClick: duplicate},
    "separator",
    {label: "Delete", leadingIcon: "trash", destructive: true, onClick: remove},
  ]}
/>`,
      render: () => h(DropdownMenu, {label: "Report actions", items: ACOES,
        trigger: h(IconButton, {name: "dots-three", label: "More actions"})}),
    },
    cada({titulo: "Sides", descricao: "The preferred side; it flips when there is no room on that one.",
      valores: ["top", "right", "bottom", "left"],
      codigo: v => `<DropdownMenu side="${v}" label="Actions, ${v}" items={items}\n  trigger={<Button appearance="outline">${v}</Button>} />`,
      peca: v => h(DropdownMenu, {side: v, label: `Actions, ${v}`, items: ACOES,
        trigger: h(Button, {appearance: "outline"}, v)})}),
    {
      title: "Toggles and choices",
      description: "A checkbox item toggles and the menu stays open; choosing in a radio group closes it. Without checked or value, the menu keeps the state itself, between openings.",
      code: `<DropdownMenu
  label="View"
  trigger={<Button appearance="outline" trailingIcon="caret-down">View</Button>}
  items={[
    {kind: "checkbox", label: "Show archived", defaultChecked: false},
    {kind: "checkbox", label: "Compact rows", defaultChecked: true},
    "separator",
    {kind: "radiogroup", label: "Sort by", defaultValue: "date", items: [
      {value: "date", label: "Date"},
      {value: "name", label: "Name"},
      {value: "size", label: "Size"},
    ]},
  ]}
/>`,
      render: () => h("div", {style: {display: "flex"}}, h(DropdownMenu, {label: "View",
        trigger: h(Button, {appearance: "outline", trailingIcon: "caret-down"}, "View"),
        items: [
          {kind: "checkbox", label: "Show archived", defaultChecked: false},
          {kind: "checkbox", label: "Compact rows", defaultChecked: true},
          "separator",
          {kind: "radiogroup", label: "Sort by", defaultValue: "date", items: [
            {value: "date", label: "Date"}, {value: "name", label: "Name"}, {value: "size", label: "Size"}]},
        ]})),
    },
    {
      title: "Groups and submenus",
      description: "A group is a labelled section, and its label is not an item. A submenu opens in place, inside the same panel; the rest of the menu dims while it is open.",
      code: `<DropdownMenu
  label="File"
  trigger={<Button appearance="outline">File</Button>}
  items={[
    {kind: "group", label: "Document", items: [
      {label: "Rename", onClick: rename},
      {label: "Move to folder", leadingIcon: "folder", onClick: move},
    ]},
    {kind: "submenu", label: "Export as", leadingIcon: "download-simple", items: [
      {label: "PDF", onClick: pdf},
      {label: "CSV", onClick: csv},
    ]},
    {label: "Print", disabled: true},
  ]}
/>`,
      render: () => h("div", {style: {display: "flex"}}, h(DropdownMenu, {label: "File",
        trigger: h(Button, {appearance: "outline"}, "File"),
        items: [
          {kind: "group", label: "Document", items: [
            {label: "Rename", onClick: nada}, {label: "Move to folder", leadingIcon: "folder", onClick: nada}]},
          {kind: "submenu", label: "Export as", leadingIcon: "download-simple", items: [
            {label: "PDF", onClick: nada}, {label: "CSV", onClick: nada}]},
          {label: "Print", disabled: true},
        ]})),
    },
  ],
};
