// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {FileInput} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Upload",
    name: "Dropping files with a limit",
    description: "The limits are written before the mistake, not after it: type and size are on the field, so the refusal never surprises. Dropping and clicking reach the same input, because a drop zone that is not also a button is unusable by keyboard.",
    uses: ["FileInput"],
    code: `<FileInput
  label="Attachments"
  hint="PDF or PNG, up to 5 MB each"
  accept=".pdf,.png"
  maxSize={5 * 1024 * 1024}
  multiple
  onFilesChange={setFiles}
/>`,
    render: () => h("div", {style: {width: "min(460px,100%)"}}, h(FileInput, {
      label: "Attachments", hint: "PDF or PNG, up to 5 MB each",
      accept: ".pdf,.png", maxSize: 5 * 1024 * 1024, multiple: true})),
  },
];
