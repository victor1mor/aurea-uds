import {createElement as h} from "react";
import {FileInput} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(480px, 100%)"};
// Fila RESTAURADA: é o único estado de transferência que uma página estática pode mostrar sem
// mentir. `restaurar()` rebaixa pending/uploading/paused para `canceled` — um item que voltou do
// armazenamento não tem os bytes, então "enviando 40%" seria uma barra que nunca anda. Os
// terminais (done/error/canceled) são verdade e sobrevivem à volta.
//
// UM item, e não dois. A primeira versão trazia um `done` com checksum e um `error`, e o gate
// "nenhuma prévia rola dentro da caixa" reprovou: 393px de conteúdo para 354px de caixa, 39
// sobrando. A ADR-0002 diz quem cede — o CONTEÚDO, nunca a altura da caixa. Ficou o `error`
// porque é nele que a frase da lede se prova: a linha que normalmente ofereceria "repetir" é
// justamente a que não pode oferecer, e o `done` não mostraria essa ausência.
const filaRestaurada = [
  {id: "f0", name: "contacts.csv", bytes: 84210, status: "error", progress: 0.42},
];

export default {
  description:
    "FileInput collects files by click or by drop, refuses what does not fit before anything is sent, " +
    "and — when you give it an upload function — runs the real transfer with progress, cancel and " +
    "retry. The type and size checks run on the DROP too, not only in the picker dialog, which is " +
    "where most implementations let the wrong file through.",

  install: 'import {FileInput} from "@aurea-uds/react";',

  features: [
    "accept and maxSize are enforced on drop as well as on pick — the dialog filter is not a guarantee.",
    "A refused file says why, in words: wrong type or over the limit, from the i18n dictionary.",
    "upload() drives real progress per file, with cancel and retry, and announces the outcome.",
    "Added and removed files are announced through a live region, so the list is never silent.",
    "A restored item shows its receipt and offers removal, never a retry button that would fail.",
    "The previews show the RESTING states; progress, pause and retry only move in a real app.",
  ],

  examples: [
    {
      title: "Collect files",
      description: "No upload function: the component gathers and validates, you decide what happens next.",
      code: [
        '<FileInput label="Attachments" hint="PDF or PNG, up to 5 MB"',
        '  accept=".pdf,.png" maxSize={5 * 1024 * 1024} multiple',
        "  onFilesChange={setFiles} />",
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(FileInput, {label: "Attachments", hint: "PDF or PNG, up to 5 MB",
          accept: ".pdf,.png", maxSize: 5 * 1024 * 1024, multiple: true})),
    },
    {
      title: "Real upload",
      description: "With upload() it owns progress, cancel and retry for each file.",
      code: [
        '<FileInput label="Import" accept=".csv" maxSize={2000000}',
        "  upload={async ({file, onProgress, signal}) => {",
        "    await put(file, {onProgress, signal});",
        "  }} />",
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(FileInput, {label: "Import", hint: "CSV, up to 2 MB", accept: ".csv",
          maxSize: 2000000, upload: async () => {}})),
    },
    {
      title: "A queue that survived the page",
      description: "initialQueue restores the receipt of what failed — and offers no retry, because a file that came back from storage has no bytes to send.",
      code: [
        "<FileInput",
        '  label="Attachments"',
        "  initialQueue={[",
        '    {id: "f0", name: "contacts.csv", bytes: 84210, status: "error", progress: 0.42},',
        "  ]}",
        "  onQueueChange={save} />",
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(FileInput, {label: "Attachments", multiple: true, initialQueue: filaRestaurada})),
    },
    {
      title: "One file only",
      description: "Without multiple, a new pick replaces the previous file instead of stacking.",
      code: '<FileInput label="Avatar" accept="image/png,image/jpeg" maxSize={512000} />',
      render: () => h("div", {style: stack},
        h(FileInput, {label: "Avatar", hint: "PNG or JPEG, up to 500 KB",
          accept: "image/png,image/jpeg", maxSize: 512000})),
    },
  ],
};
