// O FileInput do nativo no site (bloco 1, o 5-A — 23/10/2026): escolher arquivo do aparelho, rodando pelo
// `react-native-web`. Ele mora num caminho só dele (`@aurea-uds/native/system/file`), porque pede o `expo-document-picker`.
// No navegador, a versão web dessa biblioteca abre a janela de arquivos do próprio navegador (lido no fonte dela,
// `ExpoDocumentPicker.web.js`): nada sai da página.
import {createElement as h, useState} from "react";
import {Field} from "../../../../packages/native/dist/index.js";
import {FileInput} from "../../../../packages/native/dist/arquivo.js";

const largura = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
const NOTA = {uri: "file:///invoice-october-2026.pdf", name: "invoice-october-2026.pdf", size: 248000, mimeType: "application/pdf"};

// A lista escolhida fica aqui, como na tela do app: a peça devolve, quem guarda é quem usa.
function Arquivos({rotulo, inicial = [], campo = {}, ...props}) {
  const [arquivos, setArquivos] = useState(inicial);
  return h(Field, {label: rotulo, ...campo}, h(FileInput, {value: arquivos, onChange: setArquivos, ...props}));
}

export default {
  install: 'import {FileInput} from "@aurea-uds/native/system/file";',
  description: "Choose files from the device. It hands back each file's local uri, name, size and type; the app sends it. On a phone it opens the system document picker through expo-document-picker. Here in the browser, that library's web version opens the browser's own file dialog, and nothing leaves the page.",
  api: {
    value: "The chosen files: {uri, name, size?, mimeType?}. Controlled: the screen keeps the list.",
    onChange: "Called with the new list when files are chosen or one is removed.",
    accept: "MIME types, as text or a list: \"application/pdf\", [\"image/*\", \"application/pdf\"]. It filters the system picker, and the piece checks again on the way back.",
    max: "How many files fit. Defaults to 1; at the limit the trigger goes away.",
    disabled: "Disables the trigger and the remove buttons.",
    addIcon: "The trigger's glyph. Defaults to `paperclip`; false removes it.",
    fileIcon: "The glyph of each chosen file. Defaults to `file-text`; false removes it.",
    removeIcon: "The glyph of the remove button. Defaults to `x`.",
    style: "Style for the outer View.",
    testID: "Test id of the root.",
  },
  examples: [
    {
      title: "Usage",
      description: "Inside a Field, the trigger takes the label as its name. Over maxSize, or of a type accept does not allow, the file is refused with a sentence under the field.",
      code: `const [files, setFiles] = useState<AureaFile[]>([]);

<Field label="Invoice">
  <FileInput accept="application/pdf" maxSize={5000000} value={files} onChange={setFiles} />
</Field>`,
      render: () => h("div", {style: largura}, h(Arquivos, {rotulo: "Invoice", accept: "application/pdf", maxSize: 5000000})),
    },
    {
      title: "Several files",
      description: "max sets how many fit. Each file shows its name, cut in the middle so the extension stays, its size and a remove button.",
      code: `<Field label="Attachments">
  <FileInput max={3} value={files} onChange={setFiles} />
</Field>`,
      render: () => h("div", {style: largura}, h(Arquivos, {rotulo: "Attachments", max: 3, inicial: [NOTA]})),
    },
    {
      title: "Glyphs",
      description: "addIcon, fileIcon and removeIcon take any registered glyph; false removes the first two.",
      code: `<FileInput addIcon="upload-simple" fileIcon="file" removeIcon="trash" max={2} value={files} onChange={setFiles} />
<FileInput addIcon={false} fileIcon={false} value={files} onChange={setFiles} />`,
      render: () => h("div", {style: coluna},
        h(Arquivos, {rotulo: "Contract", addIcon: "upload-simple", fileIcon: "file", removeIcon: "trash", max: 2, inicial: [NOTA]}),
        h(Arquivos, {rotulo: "Receipt", addIcon: false, fileIcon: false})),
    },
    {
      title: "Error and disabled",
      description: "The Field's error marks the trigger; disabled dims it and the touch does nothing.",
      code: `<Field label="Proof of address" error="Add a file to continue.">
  <FileInput value={files} onChange={setFiles} />
</Field>
<Field label="Signed copy" disabled>
  <FileInput value={files} onChange={setFiles} />
</Field>`,
      render: () => h("div", {style: coluna},
        h(Arquivos, {rotulo: "Proof of address", campo: {error: "Add a file to continue."}}),
        h(Arquivos, {rotulo: "Signed copy", campo: {disabled: true}})),
    },
  ],
};
