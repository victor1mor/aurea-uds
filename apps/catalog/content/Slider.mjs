import {createElement as h} from "react";
import {Slider} from "../../../packages/react/dist/index.js";

const col = {display: "grid", gap: "var(--space-6)", width: "100%", maxWidth: "24rem"};

export default {
  description:
    "Slider picks a number by dragging a thumb along a track: label and value on top, the track with " +
    "its fill, a capsule thumb in the brand colour. One value or a range of two, horizontal or vertical, with the number " +
    "written by the platform's Intl. It speaks numbers — onValueChange(value) — where Range speaks the " +
    "browser's change event.",

  install: 'import {Slider} from "@aurea-uds/react";',

  features: [
    "The label names the thumbs; with two values, thumbLabels gives each one its own name.",
    "Arrows step, Page Up/Down and Shift + arrow take the large step, Home and End jump to the ends.",
    "onValueChange on every step; onValueCommitted when the thumb is released — the moment to save.",
    "format and locale write the value (percent, currency…) with Intl, as NumberField does.",
    "Range stays for the browser's own slider, with its change event.",
  ],

  examples: [
    {
      title: "One value",
      description: "The value sits next to the label and follows the thumb.",
      code: '<Slider label="Volume" defaultValue={40} />',
      render: () => h("div", {style: col}, h(Slider, {label: "Volume", defaultValue: 40})),
    },
    {
      title: "A range of two",
      description: "Pass a list: two thumbs, and the fill between them. Each thumb has its own name.",
      code: '<Slider label="Price" defaultValue={[200, 800]} min={0} max={1000} step={50}\n  thumbLabels={["Minimum", "Maximum"]} format={{style: "currency", currency: "BRL"}} locale="pt-BR" />',
      render: () => h("div", {style: col}, h(Slider, {label: "Price", defaultValue: [200, 800], min: 0, max: 1000, step: 50,
        thumbLabels: ["Minimum", "Maximum"], format: {style: "currency", currency: "BRL"}, locale: "pt-BR"})),
    },
    {
      title: "Formatted",
      description: "A percentage, written by Intl. The stored value stays the raw number.",
      code: '<Slider label="Discount" defaultValue={0.25} min={0} max={1} step={0.05} format={{style: "percent"}} />',
      render: () => h("div", {style: col}, h(Slider, {label: "Discount", defaultValue: 0.25, min: 0, max: 1, step: 0.05, format: {style: "percent"}})),
    },
    {
      title: "Vertical",
      description: "Value on top, track in the middle, label below. The height is --range-vertical-size.",
      code: '<Slider label="Level" orientation="vertical" defaultValue={60} />',
      render: () => h("div", {style: {display: "flex", gap: "var(--space-8)"}},
        h(Slider, {label: "Level", orientation: "vertical", defaultValue: 60}),
        h(Slider, {label: "Bass", orientation: "vertical", defaultValue: 30})),
    },
    {
      title: "Disabled",
      description: "Unavailable, not hidden.",
      code: '<Slider label="Brightness" defaultValue={70} disabled />',
      render: () => h("div", {style: col}, h(Slider, {label: "Brightness", defaultValue: 70, disabled: true})),
    },
  ],
};
