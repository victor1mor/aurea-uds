// O EmptyState do nativo no site (bloco 1, o 5-A — 23/10/2026): o vazio dito com jeito, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Button, EmptyState} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(24rem, 100%)"};
const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "var(--space-6)", width: "100%"};
const ESTADOS = ["waiting_user", "waiting_approval", "waiting_dependency", "offline", "stale", "partial", "degraded"];

export default {
  install: 'import {EmptyState} from "@aurea-uds/native";',
  api: {
    icon: "The glyph, in a round 64 frame. Defaults to `file`. Your app's own drawing goes here too.",
    state: "Universal state. It paints no colour — an empty view is already neutral. Without a description, the state's sentence from the strings table is the description.",
    style: "Style for the outer View.",
    testID: "Test id of the root.",
  },
  examples: [
    {
      title: "Usage",
      code: `<EmptyState
  icon="folder"
  title="No reports yet"
  description="Reports you create show up here."
  action={<Button tone="brand" onPress={create}>Create report</Button>} />`,
      render: () => h("div", {style: largura}, h(EmptyState, {icon: "folder", title: "No reports yet",
        description: "Reports you create show up here.", action: h(Button, {tone: "brand"}, "Create report")})),
    },
    {
      title: "Default icon",
      description: "Without icon, the blank file.",
      code: `<EmptyState title="Nothing here" description="Files you add show up here." />`,
      render: () => h("div", {style: largura}, h(EmptyState, {title: "Nothing here", description: "Files you add show up here."})),
    },
    {
      title: "A search with no results",
      description: "The way out is a second action, not a dead end.",
      code: `<EmptyState
  icon="magnifying-glass"
  title="No matches"
  description="Try fewer words, or check the spelling."
  action={<Button appearance="outline" onPress={clear}>Clear search</Button>} />`,
      render: () => h("div", {style: largura}, h(EmptyState, {icon: "magnifying-glass", title: "No matches",
        description: "Try fewer words, or check the spelling.", action: h(Button, {appearance: "outline"}, "Clear search")})),
    },
    cada({titulo: "Universal states", descricao: "Each state writes its own sentence from the strings table, so the same condition reads the same on every screen.",
      valores: ESTADOS, estilo: grade,
      codigo: v => `<EmptyState state="${v}" title="Nothing to show" />`,
      peca: v => h(EmptyState, {state: v, title: "Nothing to show"})}),
  ],
};
