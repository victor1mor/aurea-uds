import {createElement as h} from "react";
import {Progress} from "../../../packages/react/dist/index.js";

// A largura do exemplo de antes (`_starters.mjs`, `wide`): a barra de uma tela, não a da página.
const col = {display: "grid", gap: "var(--space-5)", width: "min(30rem,100%)"};

export default {
  description:
    "Progress shows how far a task has gone. With a value it is determinate; without one it is " +
    "indeterminate — the total is not known yet, and a piece runs across the track instead of a " +
    "0% that reads as stalled. The anatomy is the reference library's ProgressBar: the detail above, on the end " +
    "side, and the track below.",
  install: 'import {Progress} from "@aurea-uds/react";',
  features: [
    "No value, no aria-valuenow: the bar never announces a 0% it does not mean.",
    "With reduced motion the indeterminate bar does not run — it fills and dims, and never stands still at 40%.",
    "A text detail is heard once, inside aria-valuetext (\"64%, 2.3 MB/s\").",
    "Tone uses Button's closed list: paused is neutral, failed is danger. Every tone keeps 3:1 against the track.",
  ],
  examples: [
    {
      title: "Determinate and indeterminate",
      description: "With a value it fills; without one it runs, until the total is known.",
      code:
        '<Progress value={64} label="Uploading" />\n' +
        '<Progress label="Counting files" />',
      render: () => h("div", {style: col},
        h(Progress, {value: 64, label: "Uploading"}),
        h(Progress, {label: "Counting files"})),
    },
    {
      title: "Detail",
      description: "Speed, time left, bytes — small, muted, with figures of equal width so the numbers do not jitter.",
      code:
        '<Progress value={64} label="Uploading" detail="2.3 MB/s · 12 s left" />\n' +
        '<Progress label="Counting files" detail="1,204 files" />',
      render: () => h("div", {style: col},
        h(Progress, {value: 64, label: "Uploading", detail: "2.3 MB/s · 12 s left"}),
        h(Progress, {label: "Counting files", detail: "1,204 files"})),
    },
    {
      title: "Tone",
      description: "What the colour means. Paused is neutral; failed is danger.",
      code:
        '<Progress value={40} label="Paused" tone="neutral" detail="Paused" />\n' +
        '<Progress value={100} label="Done" tone="success" detail="Done" />\n' +
        '<Progress value={72} label="Disk" tone="warning" detail="72% full" />\n' +
        '<Progress value={58} label="Upload" tone="danger" detail="Failed at 58%" />',
      render: () => h("div", {style: col},
        h(Progress, {value: 40, label: "Paused", tone: "neutral", detail: "Paused"}),
        h(Progress, {value: 100, label: "Done", tone: "success", detail: "Done"}),
        h(Progress, {value: 72, label: "Disk", tone: "warning", detail: "72% full"}),
        h(Progress, {value: 58, label: "Upload", tone: "danger", detail: "Failed at 58%"})),
    },
  ],
};
