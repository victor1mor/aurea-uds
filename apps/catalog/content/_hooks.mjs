// OS HOOKS PÚBLICOS — a metade da API que não tem ficha, e por isso não tinha página.
//
// `_` no começo = conteúdo que não é de um componente, como o `_starters` e o `_recipes`.
//
// POR QUE ESTE ARQUIVO EXISTE, e a razão é um erro medido: em 16/08/2026 eu escrevi que a Aurea
// "não tem Toast em React" e isso virou uma das três lacunas que separavam a biblioteca do
// primeiro consumidor. O `useToast` existia desde sempre. Eu tinha lido o REGISTRY — que só
// conhece componente — e concluído sobre o CÓDIGO. Enquanto hook não tiver onde ser lido, a
// próxima pessoa erra igual.
//
// TUDO AQUI FOI MEDIDO NA FONTE, não lembrado: as assinaturas saíram de
// `packages/react/src/system.tsx` e `internal.tsx`, e os campos do `add()` saíram do
// `node_modules/@base-ui/react/toast/useToastManager.d.ts` — o gerente é do Base UI, e inventar
// o contrato dele aqui seria documentar uma biblioteca que não é a nossa.
export default [
  {
    name: "useToast",
    source: "packages/react/src/system.tsx",
    lede: "Puts a temporary message on screen. The stack renders itself — AureaProvider already "
      + "mounts the viewport, so there is no <Toaster/> to place and no second provider to install.",
    signature: `const toast = useToast();

toast.add({title, description, type, timeout, priority}) // → id
toast.close(id)
toast.update(id, {...})
toast.promise(promise, {loading, success, error})`,
    example: `import {AureaProvider, Button, useToast} from "@aurea-uds/react";

function SaveButton() {
  const toast = useToast();
  return (
    <Button onClick={() => toast.add({
      title: "Saved",
      description: "Two files uploaded.",
      type: "success",
    })}>
      Save
    </Button>
  );
}

// useToast() only works under the provider — it is where the queue lives.
export default () => <AureaProvider><SaveButton/></AureaProvider>;`,
    notes: [
      ["The four types are the ones the skin paints", "AureaToastType is info · success · warning · danger, and each one has a rule in the core. The manager comes from Base UI, where type is a plain string — pass something else and you get a class with nothing behind it."],
      ["The queue is the engine's, not ours", "Stacking, timers, pause on hover and focus, and the live region are Base UI's. Aurea contributes the skin and the four types."],
      ["It is a hook, so it is client-side", "Calling it from a server component is the same error as any other hook. The toast is a reaction to something the user did."],
    ],
  },
  {
    name: "useAureaTheme",
    source: "packages/react/src/system.tsx",
    lede: "Reads and sets the two axes Aurea puts on <html>: theme and density. It exists because "
      + "density is ours and no theme library has it.",
    signature: `const {theme, density, setTheme, setDensity, toggleTheme} = useAureaTheme();

theme    // "dark" | "light" | null   ← null on the server
density  // "compact" | "comfortable" | "spacious" | null`,
    example: `import {IconButton, useAureaTheme} from "@aurea-uds/react";

function ThemeToggle() {
  const {theme, toggleTheme} = useAureaTheme();
  // theme is null until the DOM is known. Draw nothing that depends on it before that,
  // or the server and the client disagree and React complains about hydration.
  if (!theme) return null;
  return <IconButton icon={theme === "dark" ? "light" : "asleep"}
                     label="Toggle theme" onClick={toggleTheme}/>;
}`,
    notes: [
      ["null is an answer, not a bug", "On the server the theme is unknown, and pretending otherwise produces a hydration mismatch. That is why there is no default value."],
      ["It does not persist anything, on purpose", "Remembering a preference belongs to the application. next-themes already writes data-theme on <html> — the same attribute Aurea reads — so the two fit with no code of ours in between."],
      ["It follows whoever changes the attribute", "It subscribes to the mutation, so a script in <head> or window.Aurea.setTheme keeps React in sync."],
    ],
  },
  {
    name: "useAureaStrings",
    source: "packages/react/src/internal.tsx",
    lede: "The label dictionary in use — the defaults merged with whatever you passed to the provider. "
      + "Every built-in label a component speaks comes from here.",
    signature: `const strings = useAureaStrings();   // AureaStrings`,
    example: `import {AureaProvider, ptBR} from "@aurea-uds/react";

// English is the default (ADR-0012). Override the whole dictionary, or one line of it.
<AureaProvider strings={ptBR}>{app}</AureaProvider>
<AureaProvider strings={{comboboxEmpty: "No results"}}>{app}</AureaProvider>`,
    notes: [
      ["Reach for it when you are composing", "A screen of your own that sits next to Aurea components should speak the same words instead of hard-coding a second set."],
    ],
  },
  {
    name: "useSpriteUrl",
    source: "packages/react/src/internal.tsx",
    lede: "Where the icon sprite is being loaded from — the value AureaProvider was given.",
    signature: `const spriteUrl = useSpriteUrl();   // string`,
    example: `// The sprite is configuration, so it lives on the provider and not on every icon.
<AureaProvider spriteUrl="/aurea-icons.svg">{app}</AureaProvider>

// Icon takes a local override when a page genuinely has two sprites.
<Icon name="add" spriteUrl="/other-sprite.svg"/>`,
    notes: [
      ["Rarely needed directly", "Icon already reads it. It is here for the case where you draw a <use> yourself."],
    ],
  },
];
