import {createElement as h} from "react";
import {Alert, Banner, Button, EmptyState, Progress, Skeleton} from "../../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-3)", width: "min(560px, 100%)"};

export default [
  {
    variant: "Info",
    name: "Inline notice",
    description: "Context that belongs to the section it sits in — an Alert stays put; a Toast would vanish.",
    uses: ["Alert"],
    code: '<Alert variant="info" title="Heads up">\n  Changes apply to every member of the workspace.\n</Alert>',
    render: () => h("div", {style: stack},
      h(Alert, {variant: "info", title: "Heads up"}, "Changes apply to every member of the workspace.")),
  },
  {
    variant: "Danger",
    name: "Failure with retry",
    description: "What broke, plus the way out in the same block. An error without an action is a dead end.",
    uses: ["Alert", "Button"],
    code: '<Alert variant="danger" title="Upload failed">\n  The connection dropped at 40%.\n  <Button variant="outline">Retry</Button>\n</Alert>',
    render: () => h("div", {style: stack},
      h(Alert, {variant: "danger", title: "Upload failed"}, "The connection dropped at 40%. ",
        h(Button, {variant: "outline"}, "Retry"))),
  },
  {
    variant: "Banner",
    name: "Degraded service",
    description: "Page-width notice for something that affects the whole surface, dismissible by the reader.",
    uses: ["Banner"],
    code: '<Banner variant="warning" title="Degraded performance" onDismiss={close}>\n  Search is slower than usual while we reindex.\n</Banner>',
    render: () => h("div", {style: stack},
      h(Banner, {variant: "warning", title: "Degraded performance"},
        "Search is slower than usual while we reindex.")),
  },
  {
    variant: "Empty",
    name: "Nothing found",
    description: "The empty result of a filter: says why it is empty and offers the way back.",
    uses: ["EmptyState", "Button"],
    code: '<EmptyState icon="search" title="No results"\n  description="No component matches that filter."\n  action={<Button variant="outline">Clear filters</Button>} />',
    render: () => h(EmptyState, {icon: "search", title: "No results", titleAs: "h2",
      description: "No component matches that filter.",
      action: h(Button, {variant: "outline"}, "Clear filters")}),
  },
  {
    variant: "Progress",
    name: "Determinate upload",
    description: "Known progress with a label. Unknown progress is a Skeleton or a spinner, never a fake bar.",
    uses: ["Progress"],
    code: '<Progress value={64} label="Uploading" />',
    render: () => h("div", {style: stack}, h(Progress, {value: 64, label: "Uploading"})),
  },
  {
    variant: "Progress",
    name: "Loading placeholder",
    description: "The shape of the content before the content — Skeleton is aria-hidden by design.",
    uses: ["Skeleton"],
    code: '<Skeleton style={{height: 14, width: "70%"}} />\n<Skeleton style={{height: 14, width: "90%"}} />',
    render: () => h("div", {style: stack},
      h(Skeleton, {style: {height: 14, width: "70%"}}),
      h(Skeleton, {style: {height: 14, width: "90%"}}),
      h(Skeleton, {style: {height: 14, width: "55%"}})),
  },
];
