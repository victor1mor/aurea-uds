// A NavList do nativo no site (bloco 1, o 5-A — 23/10/2026). O tipo não tem lista fechada de valores; os exemplos mostram
// a linha que abre, a que só se lê, a foto, os sinais, o valor que é controle e a seta.
import {createElement as h, useState} from "react";
import {NavList, Switch} from "../../../../packages/native/dist/index.js";

const largo = {width: "min(26rem, 100%)"};
const nada = () => {};

function ComInterruptor() {
  const [ligado, setLigado] = useState(true);
  return h(NavList, {items: [
    {id: "notif", label: "Notifications", icon: "bell",
      value: h(Switch, {checked: ligado, onChange: setLigado, accessibilityLabel: "Notifications"})},
    {id: "privacy", label: "Privacy", icon: "lock", onPress: nada},
  ]});
}

export default {
  install: 'import {NavList} from "@aurea-uds/native";',
  api: {
    items: "The rows, as data: {id, label, description?, value?, icon?, onPress?, disabled?, avatar?, indicators?}. A row with onPress is a link with the chevron; without it, one plain reading. A text value stays inside the row; a component value (a Switch) sits beside it, so it never becomes a button inside a button.",
    chevron: "The \"this opens\" glyph on the right, drawn only on rows with onPress. caret-right by default; register yours, or pass false.",
  },
  examples: [
    {
      title: "Usage",
      description: "The brick of a settings screen: destinations inside the page. There is no current row — you go in and come back.",
      code: `<NavList items={[
  {id: "account", label: "Account", description: "Name, email, photo", icon: "user", onPress: openAccount},
  {id: "team", label: "Team", icon: "users", value: "12", onPress: openTeam},
  {id: "settings", label: "Preferences", icon: "gear", onPress: openPreferences},
]} />`,
      render: () => h("div", {style: largo}, h(NavList, {items: [
        {id: "account", label: "Account", description: "Name, email, photo", icon: "user", onPress: nada},
        {id: "team", label: "Team", icon: "users", value: "12", onPress: nada},
        {id: "settings", label: "Preferences", icon: "gear", onPress: nada},
      ]})),
    },
    {
      title: "Only to read",
      description: "Without onPress a row is not a link and has no chevron: an arrow on a row that opens nothing is a false promise.",
      code: `<NavList items={[
  {id: "version", label: "Version", value: "4.2.0"},
  {id: "build", label: "Build", value: "2026.10.23"},
]} />`,
      render: () => h("div", {style: largo}, h(NavList, {items: [
        {id: "version", label: "Version", value: "4.2.0"},
        {id: "build", label: "Build", value: "2026.10.23"},
      ]})),
    },
    {
      title: "Photo and signs",
      description: "avatar takes the icon's place; indicators are small muted glyphs, each with a name the screen reader reads with the row.",
      code: `<NavList items={[
  {id: "ana", label: "Ana Lima", description: "See you at 10", avatar: {fallback: "AL"},
   indicators: [{icon: "star", label: "Pinned"}], value: "09:41", onPress: openChat},
  {id: "bruno", label: "Bruno Reis", description: "Sent a file", avatar: {fallback: "BR"},
   indicators: [{icon: "lock", label: "Private"}], value: "Mon", onPress: openChat},
]} />`,
      render: () => h("div", {style: largo}, h(NavList, {items: [
        {id: "ana", label: "Ana Lima", description: "See you at 10", avatar: {fallback: "AL"},
          indicators: [{icon: "star", label: "Pinned"}], value: "09:41", onPress: nada},
        {id: "bruno", label: "Bruno Reis", description: "Sent a file", avatar: {fallback: "BR"},
          indicators: [{icon: "lock", label: "Private"}], value: "Mon", onPress: nada},
      ]})),
    },
    {
      title: "A control as the value",
      description: "A Switch in value sits beside the row, not inside it, and it needs its own accessible name.",
      code: `const [on, setOn] = useState(true);

<NavList items={[
  {id: "notif", label: "Notifications", icon: "bell",
   value: <Switch checked={on} onChange={setOn} accessibilityLabel="Notifications" />},
  {id: "privacy", label: "Privacy", icon: "lock", onPress: openPrivacy},
]} />`,
      render: () => h("div", {style: largo}, h(ComInterruptor)),
    },
    {
      title: "Unavailable, and the chevron",
      description: "A disabled row stays reachable by the screen reader, which announces it as unavailable. chevron changes the glyph, or removes it with false.",
      code: `<NavList items={[
  {id: "billing", label: "Billing", icon: "file", disabled: true, onPress: openBilling},
  {id: "export", label: "Export data", icon: "download-simple", onPress: exportData},
]} chevron="arrow-right" />

<NavList items={[{id: "help", label: "Help", icon: "info", onPress: openHelp}]} chevron={false} />`,
      render: () => h("div", {style: {...largo, display: "grid", gap: "var(--space-4)"}},
        h(NavList, {chevron: "arrow-right", items: [
          {id: "billing", label: "Billing", icon: "file", disabled: true, onPress: nada},
          {id: "export", label: "Export data", icon: "download-simple", onPress: nada},
        ]}),
        h(NavList, {chevron: false, items: [{id: "help", label: "Help", icon: "info", onPress: nada}]})),
    },
  ],
};
