import {createElement as h} from "react";
import {ButtonGroup, Button, IconButton, SegmentedControl} from "../../../../packages/react/dist/index.js";
import {ComLigado} from "../_estado.mjs";

export default [
  {
    variant: "Range",
    name: "Time range",
    description: "Day, week, month over the same chart — the label names the set, the buttons the spans.",
    uses: ["ButtonGroup", "Button"],
    code: [
      '<ButtonGroup label="Range">',
      '  <Button>Day</Button>',
      '  <Button>Week</Button>',
      '  <Button>Month</Button>',
      '</ButtonGroup>',
    ].join("\n"),
    render: () => h(ButtonGroup, {label: "Range"},
      h(Button, null, "Day"), h(Button, null, "Week"), h(Button, null, "Month")),
  },
  {
    variant: "Multiple selection",
    name: "Pinned filters",
    description: "Many-of-many: each button is its own toggle, so two can be on at once.",
    uses: ["ButtonGroup", "Button"],
    code: [
      // o código mostra o estado que o clique troca (06/11/2026), como o exemplo vivo faz
      'const [on, setOn] = useState({starred: true, archived: false, shared: true});',
      'const toggle = (k) => setOn({...on, [k]: !on[k]});',
      '',
      '<ButtonGroup label="Filters">',
      '  <Button pressed={on.starred} onClick={() => toggle("starred")}>Starred</Button>',
      '  <Button pressed={on.archived} onClick={() => toggle("archived")}>Archived</Button>',
      '  <Button pressed={on.shared} onClick={() => toggle("shared")}>Shared</Button>',
      '</ButtonGroup>',
    ].join("\n"),
    render: () => h(ButtonGroup, {label: "Filters"},
      h(ComLigado, {componente: Button, pressed: true}, "Starred"),
      h(ComLigado, {componente: Button, pressed: false}, "Archived"),
      h(ComLigado, {componente: Button, pressed: true}, "Shared")),
  },
  {
    variant: "Single selection",
    name: "View switch",
    description: "One-of-many is not this component: SegmentedControl carries one value and one tab stop.",
    uses: ["SegmentedControl"],
    code: [
      '<SegmentedControl label="View" value="board" onChange={setView}',
      '  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />',
    ].join("\n"),
    render: () => h(SegmentedControl, {label: "View", value: "board", onChange: () => {},
      items: [{value: "list", label: "List"}, {value: "board", label: "Board"}]}),
  },
  {
    variant: "Icons",
    name: "Share actions",
    description: "Glyph-only set at the end of a card: one name for the group, one for each action.",
    uses: ["ButtonGroup", "IconButton"],
    code: [
      '<ButtonGroup label="Share">',
      '  <IconButton icon="link-simple" label="Copy link" />',
      '  <IconButton icon="envelope-simple" label="Send by e-mail" />',
      '  <IconButton icon="download" label="Download" />',
      '</ButtonGroup>',
    ].join("\n"),
    render: () => h(ButtonGroup, {label: "Share"},
      h(IconButton, {icon: "link-simple", label: "Copy link"}),
      h(IconButton, {icon: "envelope-simple", label: "Send by e-mail"}),
      h(IconButton, {icon: "download", label: "Download"})),
  },
];
