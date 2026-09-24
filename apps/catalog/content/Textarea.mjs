import {createElement as h} from "react";
import {Textarea, Field} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(460px, 100%)"};

export default {
  description:
    "Textarea is the control for text that runs long: several lines, resizable by the user, with " +
    "the same skin as Input. Same rule as Input — no state of its own, every native attribute " +
    "passes through, and the label belongs to Field.",

  install: 'import {Textarea, Field} from "@aurea-uds/react";',

  features: [
    "rows sets the visible height; the user can still drag it taller and we do not fight that.",
    "Native attributes pass through: maxLength, required, readOnly, spellCheck, wrap.",
    "Same radius family as the other surfaces — a text area is not a pill, it is a panel of text.",
    "For code use CodeEditor: it brings a language, gutters and highlighting, which a textarea has not.",
  ],

  examples: [
    {
      title: "Sizes",
      description:
        "The exception in the family, and it is deliberate: a textarea has no fixed height — " +
        "its body is the content. What scales is the minimum box, the padding and the type.",
      code: [
        '<Textarea size="sm" />',
        '<Textarea />',
        '<Textarea size="lg" />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Textarea, {size: "sm", "aria-label": "Small", defaultValue: "Small"}),
        h(Textarea, {"aria-label": "Medium", defaultValue: "Medium (default)"}),
        h(Textarea, {size: "lg", "aria-label": "Large", defaultValue: "Large"})),
    },
    {
      title: "With hint",
      description: "Three visible lines and a note about what belongs there.",
      code: [
        '<Field label="Description" hint="Shown to every member.">',
        '  <Textarea rows={3} />',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Description", hint: "Shown to every member."},
          h(Textarea, {rows: 3, placeholder: "What this workspace is for…"}))),
    },
    {
      title: "With a limit",
      description: "maxLength is enforced by the browser; say the number in the hint so it is not a surprise.",
      code: [
        '<Field label="Summary" hint="Up to 140 characters">',
        '  <Textarea rows={2} maxLength={140} />',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Summary", hint: "Up to 140 characters"},
          h(Textarea, {rows: 2, maxLength: 140, defaultValue: "A design system that stays itself on every platform."}))),
    },
    {
      title: "With error",
      description: "Rejected content: the message is the accessible description and marks the field invalid; the label stays the name.",
      code: '<Field label="Reason" error="Tell us a bit more."><Textarea rows={2} /></Field>',
      render: () => h("div", {style: stack},
        h(Field, {label: "Reason", error: "Tell us a bit more."}, h(Textarea, {rows: 2, defaultValue: "No"}))),
    },
    {
      title: "Read-only",
      description: "Selectable and copyable, not editable — for a log or a generated snippet you must not lose.",
      code: '<Textarea rows={3} readOnly defaultValue={log} />',
      render: () => h("div", {style: stack},
        h(Field, {label: "Last run"}, h(Textarea, {rows: 3, readOnly: true,
          defaultValue: "build-tokens: ok\nbuild-core: ok\nbuild-catalog: 160 pages"}))),
    },
  ],
};
