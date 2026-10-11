import {createElement as h} from "react";
import {Link} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-6)"};

export default {
  description:
    "Link is a text link: medium weight in the link colour, with no underline until the pointer rests " +
    "on it. external opens in a new tab and shows the arrow; disabled does not navigate.",

  install: 'import {Link} from "@aurea-uds/react";',

  features: [
    "A real <a href> — the browser opens it in a new tab, copies it, and a search engine follows it.",
    "The underline appears on hover and while pressed, 4 below the text.",
    "external sets target=\"_blank\" with rel=\"noopener noreferrer\" and draws the arrow.",
    "disabled renders without href and with aria-disabled.",
    "It wraps inside a paragraph, which a page zoomed to 200% needs.",
  ],

  examples: [
    {
      title: "Basic",
      description: "Inside a sentence and on its own.",
      code: [
        '<p>Read the <Link href="/terms">terms of use</Link> before you sign.</p>',
        '<Link href="/pricing">See the plans</Link>',
      ].join("\n"),
      render: () => h("div", {style: {display: "grid", gap: "var(--space-4)"}},
        h("p", {style: {margin: 0}}, "Read the ", h(Link, {href: "#terms"}, "terms of use"), " before you sign."),
        h(Link, {href: "#pricing"}, "See the plans")),
    },
    {
      title: "External and disabled",
      description: "The arrow says it leaves the site; the disabled one does not go anywhere.",
      code: [
        '<Link href="https://example.com" external>Documentation</Link>',
        '<Link href="/export" disabled>Export (no permission)</Link>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Link, {href: "https://example.com", external: true}, "Documentation"),
        h(Link, {href: "#export", disabled: true}, "Export (no permission)")),
    },
  ],
};
