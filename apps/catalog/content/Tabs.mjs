import {createElement as h} from "react";
import {Tabs} from "../../../packages/react/dist/index.js";

const wide = {width: "100%", maxWidth: "32rem"};
const ABAS = [
  {id: "overview", label: "Overview", content: "One number per row."},
  {id: "detail", label: "Detail", content: "Every row, unaggregated."},
  {id: "history", label: "History", content: "What changed, and when."},
];

export default {
  description:
    "Tabs switch between views of the same thing. The arrows move between tabs, and the panel " +
    "follows. Two looks, like the reference's: the capsule track, and the secondary tabs with a " +
    "line under them.",

  install: 'import {Tabs} from "@aurea-uds/react";',

  features: [
    "The track has 4 of padding; each tab is 32 high, 16 on each side, medium weight.",
    "The chosen tab is the raised capsule; in the secondary look, the Aurea selected line.",
    "orientation=\"vertical\" stacks the tabs beside the panel; panel=\"plain\" removes the box.",
    "activateOnFocus switches as the arrow moves; turn it off when a panel costs a network call.",
  ],

  examples: [
    {
      title: "Default",
      description: "The capsule track.",
      code: '<Tabs label="Report" value={tab} onChange={setTab} tabs={tabs} />',
      render: () => h("div", {style: wide}, h(Tabs, {label: "Report", value: "overview", onChange: () => {}, tabs: ABAS})),
    },
    {
      title: "Secondary",
      description: "No track: a line under the list, and the chosen tab marked by the selected line.",
      code: '<Tabs variant="secondary" label="Report" value={tab} onChange={setTab} tabs={tabs} panel="plain" />',
      render: () => h("div", {style: wide}, h(Tabs, {variant: "secondary", label: "Report secondary", value: "detail", onChange: () => {}, tabs: ABAS, panel: "plain"})),
    },
  ],
};
