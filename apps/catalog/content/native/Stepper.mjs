// O Stepper do nativo no site (bloco 1, o 5-A — 23/10/2026). O tipo não tem lista fechada de valores nas props; os
// exemplos mostram os quatro estados do passo (`state`), o passo que se toca e os glifos.
import {createElement as h, useState} from "react";
import {Button, Cluster, Stack, Stepper} from "../../../../packages/native/dist/index.js";

const largo = {width: "min(32rem, 100%)"};
const PASSOS = ["Account", "Profile", "Review"];

// A trilha que anda: o passo atual sai do estado da tela, e os de antes ficam feitos.
function Andando() {
  const [atual, setAtual] = useState(1);
  const items = PASSOS.map((label, n) => ({label,
    state: n < atual ? "done" : n === atual ? "active" : "default", onPress: () => setAtual(n)}));
  return h(Stack, null,
    h(Stepper, {label: "Sign-up steps", items}),
    h(Cluster, null,
      h(Button, {appearance: "outline", disabled: atual === 0, onPress: () => setAtual(n => n - 1)}, "Back"),
      h(Button, {tone: "brand", disabled: atual === PASSOS.length - 1, onPress: () => setAtual(n => n + 1)}, "Next")));
}

export default {
  install: 'import {Stepper} from "@aurea-uds/native";',
  api: {
    items: "One entry per step: {label, state?, optional?, onPress?}. state is default, active, done or error; the number comes from the position. With onPress the step is a button.",
    label: "Accessible name of the whole list. Without it, the provider's stepperLabel sentence.",
    doneIcon: "The glyph of a done step, check by default. Register it, or pass false to show the number.",
    errorIcon: "The glyph of a step with an error, x-circle by default. Register it, or pass false to show the number.",
  },
  examples: [
    {
      title: "Usage",
      description: "Progress through steps that happen in a fixed order. The active step is announced as selected — React Native has no \"current step\".",
      code: `<Stepper label="Sign-up steps" items={[
  {label: "Account", state: "done"},
  {label: "Profile", state: "active"},
  {label: "Review"},
]} />`,
      render: () => h("div", {style: largo}, h(Stepper, {label: "Sign-up steps", items: [
        {label: "Account", state: "done"}, {label: "Profile", state: "active"}, {label: "Review"}]})),
    },
    {
      title: "States",
      description: "default, active, done and error — the colour and the glyph change, and the label is always written.",
      code: `<Stepper items={[
  {label: "Cart", state: "done"},
  {label: "Payment", state: "error", optional: "Card declined"},
  {label: "Shipping", state: "active"},
  {label: "Confirm", state: "default"},
]} />`,
      render: () => h("div", {style: largo}, h(Stepper, {items: [
        {label: "Cart", state: "done"}, {label: "Payment", state: "error", optional: "Card declined"},
        {label: "Shipping", state: "active"}, {label: "Confirm", state: "default"}]})),
    },
    {
      title: "Steps you can tap",
      description: "With onPress each step is a button. The screen keeps the current step; Back and Next change it too.",
      code: `const [current, setCurrent] = useState(1);

<Stepper label="Sign-up steps" items={steps.map((label, n) => ({
  label,
  state: n < current ? "done" : n === current ? "active" : "default",
  onPress: () => setCurrent(n),
}))} />
<Cluster>
  <Button appearance="outline" disabled={current === 0} onPress={() => setCurrent(n => n - 1)}>Back</Button>
  <Button tone="brand" disabled={current === steps.length - 1} onPress={() => setCurrent(n => n + 1)}>Next</Button>
</Cluster>`,
      render: () => h("div", {style: largo}, h(Andando)),
    },
    {
      title: "Glyphs and notes",
      description: "doneIcon and errorIcon change the glyphs, false shows the number; optional adds a muted note under the label.",
      code: `<Stepper doneIcon="check-circle" errorIcon="warning" items={[
  {label: "Upload", state: "done"},
  {label: "Check", state: "error"},
  {label: "Publish", optional: "Optional"},
]} />
<Stepper doneIcon={false} errorIcon={false} items={[
  {label: "Upload", state: "done"},
  {label: "Check", state: "error"},
  {label: "Publish"},
]} />`,
      render: () => h("div", {style: {...largo, display: "grid", gap: "var(--space-6)"}},
        h(Stepper, {doneIcon: "check-circle", errorIcon: "warning", items: [
          {label: "Upload", state: "done"}, {label: "Check", state: "error"}, {label: "Publish", optional: "Optional"}]}),
        h(Stepper, {doneIcon: false, errorIcon: false, items: [
          {label: "Upload", state: "done"}, {label: "Check", state: "error"}, {label: "Publish"}]})),
    },
  ],
};
