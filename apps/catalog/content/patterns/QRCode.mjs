import {createElement as h} from "react";
import {Button, Card, Badge} from "../../../../packages/react/dist/index.js";
// QRCode vem pelo subpath: ele é o único que depende do pacote `qr` (Fase 9, achado A5).
import {QRCode} from "../../../../packages/react/dist/qrcode.js";

const col = {display: "grid", gap: "var(--space-3)", justifyItems: "center"};

export default [
  {
    variant: "Rounded",
    name: "Plain code",
    description: "Round modules and eyes without touching scannability: quiet zone kept, contrast kept.",
    uses: ["QRCode"],
    code: '<QRCode value="https://aureauds.dev" />',
    render: () => h(QRCode, {value: "https://aureauds.dev", label: "Aurea UDS site"}),
  },
  {
    variant: "Rounded",
    name: "Downloadable",
    description: "The code plus the action that takes it away — the pattern from the target image.",
    uses: ["QRCode", "Button"],
    code: '<QRCode value="https://aureauds.dev" />\n<Button variant="outline" leadingIcon="download">Download</Button>',
    render: () => h("div", {style: col},
      h(QRCode, {value: "https://aureauds.dev", label: "Aurea UDS site"}),
      h(Button, {variant: "outline", leadingIcon: "add"}, "Download")),
  },
  {
    variant: "Rounded",
    name: "On a card",
    description: "Framed for sharing: a floating surface, the code, and what it points to written out.",
    uses: ["Card", "QRCode", "Badge"],
    code: '<Card>\n  <QRCode value="https://aureauds.dev" size="sm" />\n  <Badge>aureauds.dev</Badge>\n</Card>',
    render: () => h("div", {style: {width: "min(280px,100%)"}},
      h(Card, null, h("div", {style: col},
        h(QRCode, {value: "https://aureauds.dev", size: "sm", label: "Aurea UDS site"}),
        h(Badge, null, "aureauds.dev")))),
  },
  {
    variant: "High correction",
    name: "Print safe",
    description: "Highest error correction for paper, where a scratch is not an if but a when.",
    uses: ["QRCode"],
    code: '<QRCode value="https://aureauds.dev" ecc="high" quietZone={6} />',
    render: () => h(QRCode, {value: "https://aureauds.dev", ecc: "high", quietZone: 6, label: "Aurea UDS site"}),
  },
];
