// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {NotificationCenter} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the panel lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger with its count; the code is the whole composition.";

export default [
  {
    variant: "Panel",
    name: "The bell in the top bar",
    description: "Grouped by day, unread first, and one control that clears the badge without opening every item. The count on the trigger is the only thing most people ever read.",
    uses: ["NotificationCenter"],
    note: PORTAL,
    code: `<NotificationCenter
  label="Notifications"
  onMarkAllRead={markAll}
  onItemClick={item => go(item.id)}
  items={[
    {id: "1", title: "Build passed", time: "2m", group: "Today"},
    {id: "2", title: "Analyst finished the sweep", time: "1h", group: "Today"},
    {id: "3", title: "New member joined", time: "2d", group: "Earlier", read: true},
  ]}
/>`,
    render: () => h(NotificationCenter, {items: [
      {id: "1", title: "Build passed", time: "2m", group: "Today"},
      {id: "2", title: "Analyst finished the sweep", time: "1h", group: "Today"},
      {id: "3", title: "New member joined", time: "2d", group: "Earlier", read: true},
    ]}),
  },
];
