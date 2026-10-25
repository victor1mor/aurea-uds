import {createElement as h} from "react";
import {ProgressCircle} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)"};
// Os seis tons, cada anel com o nome próprio: o código e o desenho saem desta lista.
const TONS = [["brand", "Publishing", 60], ["neutral", "Paused", 40], ["success", "Backup", 100],
  ["warning", "Storage", 92], ["danger", "Failed upload", 30], ["info", "Sync", 50]];

export default {
  description:
    "ProgressCircle shows progress as a ring that fills from the top. Without a value it spins, " +
    "because nobody knows how much is left. It needs a label, like every progress bar.",

  install: 'import {ProgressCircle} from "@aurea-uds/react";',

  features: [
    "role=\"progressbar\" with aria-valuenow, min and max; indeterminate leaves the values out.",
    "Three sizes from the reference library: 20, 28 and 36.",
    "The same tones as Progress, with the brand yellow by default.",
    "With reduced motion, the indeterminate ring turns slower.",
  ],

  examples: [
    {
      title: "Sizes",
      description: "sm, md and lg, at 60%.",
      code: [
        '<ProgressCircle label="Uploading" value={60} size="sm" />',
        '<ProgressCircle label="Uploading" value={60} />',
        '<ProgressCircle label="Uploading" value={60} size="lg" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(ProgressCircle, {label: "Uploading", value: 60, size: "sm"}),
        h(ProgressCircle, {label: "Uploading", value: 60}),
        h(ProgressCircle, {label: "Uploading", value: 60, size: "lg"})),
    },
    {
      title: "Tones and no value",
      description: "The tone says how it is going; without a value, it spins.",
      code: [
        '<ProgressCircle label="Backup" value={100} tone="success" />',
        '<ProgressCircle label="Storage" value={92} tone="warning" />',
        '<ProgressCircle label="Loading" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(ProgressCircle, {label: "Backup", value: 100, tone: "success"}),
        h(ProgressCircle, {label: "Storage", value: 92, tone: "warning"}),
        h(ProgressCircle, {label: "Errors", value: 30, tone: "danger"}),
        h(ProgressCircle, {label: "Loading"})),
    },
    {
      title: "Every tone",
      description: "The same closed list as Progress. Brand is the default; paused is neutral, failed is danger, "
        + "and info is for work that is neither good nor bad news.",
      code: TONS.map(([tone, label, value]) =>
        `<ProgressCircle label="${label}" value={${value}}${tone === "brand" ? "" : ` tone="${tone}"`} />`).join("\n"),
      render: () => h("div", {style: row}, ...TONS.map(([tone, label, value]) =>
        h(ProgressCircle, {key: tone, label, value, ...(tone === "brand" ? {} : {tone})}))),
    },
  ],
};
