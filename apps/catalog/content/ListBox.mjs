import {createElement as h} from "react";
import {ListBox} from "../../../packages/react/dist/index.js";

const box = {width: "100%", maxWidth: "20rem", borderRadius: "var(--radius-card)", background: "var(--card)"};

export default {
  description:
    "ListBox is a standalone list of options: icons, descriptions and sections, with none, one or many " +
    "chosen. With no selection it is a list of actions. It is the list a Select opens, without the " +
    "trigger around it.",

  install: 'import {ListBox} from "@aurea-uds/react";',

  features: [
    "One tab stop. Arrows, Home and End move; Space and Enter choose; a letter jumps to the next option starting with it.",
    "selectionMode: single (the default), multiple (Space toggles) or none (onAction).",
    "Sections are groups named by their title. Disabled options are skipped by the arrows.",
    "The chosen option shows a check at the end; a danger option is written in the danger colour.",
  ],

  examples: [
    {
      title: "Single choice",
      description: "Icons and descriptions; the check marks the chosen one.",
      code: [
        '<ListBox label="Plan" defaultValue={["pro"]} items={[',
        '  {id: "free", label: "Free", description: "For trying it out", icon: "leaf"},',
        '  {id: "pro", label: "Pro", description: "For a small team", icon: "rocket-launch"},',
        '  {id: "team", label: "Team", description: "For the whole company", icon: "buildings"},',
        ']} />',
      ].join("\n"),
      render: () => h("div", {style: box}, h(ListBox, {label: "Plan", defaultValue: ["pro"], items: [
        {id: "free", label: "Free", description: "For trying it out", icon: "leaf"},
        {id: "pro", label: "Pro", description: "For a small team", icon: "rocket-launch"},
        {id: "team", label: "Team", description: "For the whole company", icon: "buildings"}]})),
    },
    {
      title: "Sections, many chosen",
      description: "Space toggles each option. A disabled one keeps its place.",
      code: [
        '<ListBox label="Columns" selectionMode="multiple" defaultValue={["name", "status"]} items={[',
        '  {title: "Basic", items: [{id: "name", label: "Name"}, {id: "status", label: "Status"}]},',
        '  {title: "Dates", items: [{id: "created", label: "Created"}, {id: "due", label: "Due", disabled: true}]},',
        ']} />',
      ].join("\n"),
      render: () => h("div", {style: box}, h(ListBox, {label: "Columns", selectionMode: "multiple", defaultValue: ["name", "status"], items: [
        {title: "Basic", items: [{id: "name", label: "Name"}, {id: "status", label: "Status"}]},
        {title: "Dates", items: [{id: "created", label: "Created"}, {id: "due", label: "Due", disabled: true}]}]})),
    },
    {
      title: "Actions",
      description: "With no selection, an option is an action. The dangerous one says so in colour and in words.",
      code: [
        '<ListBox label="File" selectionMode="none" onAction={run} items={[',
        '  {id: "rename", label: "Rename", icon: "pencil-simple"},',
        '  {id: "share", label: "Share", icon: "share-network"},',
        '  {id: "delete", label: "Delete file", icon: "trash", danger: true},',
        ']} />',
      ].join("\n"),
      render: () => h("div", {style: box}, h(ListBox, {label: "File", selectionMode: "none", items: [
        {id: "rename", label: "Rename", icon: "pencil-simple"},
        {id: "share", label: "Share", icon: "share-network"},
        {id: "delete", label: "Delete file", icon: "trash", danger: true}]})),
    },
  ],
};
