// O AureaProvider do nativo no site (bloco 1, o 5-A — 23/10/2026). O site já põe um provedor em volta de todo exemplo
// (`nativo/moldura.mjs`); aqui um SEGUNDO, numa caixa, mostra o que cada prop faz. Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {
  AureaProvider, Button, Card, DataState, Text, ptBR, useAureaTheme,
} from "../../../../packages/native/dist/index.js";
import {FONTES_NO_NAVEGADOR} from "../../nativo/moldura.mjs";
import {cada} from "../_eixos.mjs";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))", gap: "var(--space-3)", width: "100%"};
const PROXIMA = {compact: "comfortable", comfortable: "spacious", spacious: "compact"};

// O que está dentro de cada caixa: o tema e a densidade que o provedor de perto entrega.
function Amostra({trocar}) {
  const {theme, density, toggleTheme, setDensity} = useAureaTheme();
  return h(Card, null,
    h(Text, {weight: 600}, `theme ${theme}`),
    h(Text, {tone: "muted"}, `density ${density}`),
    ...(trocar
      ? [h(Button, {key: "t", size: "sm", onPress: toggleTheme}, "Switch theme"),
         h(Button, {key: "d", size: "sm", appearance: "outline", onPress: () => setDensity(PROXIMA[density])}, "Next density")]
      : [h(Button, {key: "a", size: "sm", leadingIcon: "plus"}, "Add")]));
}

// No navegador, as fontes do app são as faces do site — o `FONT_FAMILIES` do código, aqui.
const Caixa = ({trocar, ...props}) => h(AureaProvider, {fontFamilies: FONTES_NO_NAVEGADOR, ...props}, h(Amostra, {trocar}));
// O `theme={theme}` do código: o tema do app (aqui, o do site), que o provedor de dentro não herda.
function ComOTemaDoApp({filho, ...props}) {
  const {theme} = useAureaTheme();
  return filho ? h(AureaProvider, {theme, fontFamilies: FONTES_NO_NAVEGADOR, ...props}, filho) : h(Caixa, {theme, ...props});
}

// Controlado: o app guarda o tema e a densidade, e o provedor só pede a troca.
function Controlado() {
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("comfortable");
  return h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(22rem, 100%)"}},
    h(Caixa, {theme, density, onThemeChange: setTheme, onDensityChange: setDensity, trocar: true}),
    h(Text, {tone: "muted", size: "xs"}, `The app holds: ${theme}, ${density}`));
}

export default {
  install: 'import {AureaProvider} from "@aurea-uds/native";',
  description: "The root of every screen: the theme, the density, the fonts, the icon registry and the sentences "
    + "the pieces say on their own. React Native has no style cascade, so a piece outside the provider has no colour "
    + "to read — and it throws instead of guessing.",
  api: {
    children: "Your app. Put the provider once, at the root; a second one inside scopes the theme or the density to a part of the screen.",
    theme: "Controlled theme: dark or light. When present it rules, and setTheme only asks, through onThemeChange.",
    density: "Controlled density: compact, comfortable or spacious. Same convention as theme.",
    defaultTheme: "The starting theme, uncontrolled. Without it (and without theme), the provider follows the device until someone calls setTheme.",
    defaultDensity: "The starting density, uncontrolled. comfortable by default.",
    fontFamilies: "The role → weight → family map that puts the text in Inter, the headings in Sora and the code in IBM Plex Mono: FONT_FAMILIES from @aurea-uds/fonts/native. Without it, every weight but Regular and Bold falls to the system font on the device.",
    icons: "The icon registry that Icon and every piece with a glyph read — built with criarRegistroDeIcones from the icons the app uses, never all of them. A provider without icons keeps the one above.",
    strings: "The sentences the pieces say on their own (a state's alert, the empty face, the spinner's name). English by default; ptBR ships ready.",
    onThemeChange: "Called when a controlled provider is asked to change theme — the app decides.",
    onDensityChange: "Called when a controlled provider is asked to change density.",
  },
  examples: [
    {
      title: "Usage",
      description: "Once, at the root. Below it, useAureaTheme() reads and changes the theme, and useAureaTokens() reads the resolved tokens.",
      code: `import {AureaProvider, criarRegistroDeIcones} from "@aurea-uds/native";
import {FONT_FAMILIES} from "@aurea-uds/fonts/native";
import Plus from "@aurea-uds/native/icons/plus";

const ICONS = criarRegistroDeIcones({plus: Plus});

export default function App() {
  return (
    <AureaProvider fontFamilies={FONT_FAMILIES} icons={ICONS}>
      <Home />
    </AureaProvider>
  );
}`,
      // O provedor do código é o do site, que já envolve o exemplo: aqui sai o que está dentro dele.
      render: () => h("div", {style: {width: "min(22rem, 100%)"}}, h(Amostra)),
    },
    cada({titulo: "Theme", descricao: "A provider inside another paints its part of the screen in its own theme. From the one above it keeps only the icon registry: the theme, the fonts and the sentences are its own, so pass them again.",
      valores: ["dark", "light"], estilo: grade,
      codigo: v => `<AureaProvider theme="${v}" fontFamilies={FONT_FAMILIES}>\n  <Card>…</Card>\n</AureaProvider>`,
      peca: v => h(Caixa, {theme: v})}),
    cada({titulo: "Density", descricao: "compact tightens the card's padding and the control heights (a md button is 44 high), comfortable is the default (48), spacious opens them (52).",
      valores: ["compact", "comfortable", "spacious"], estilo: grade,
      codigo: v => `<AureaProvider theme={theme} density="${v}" fontFamilies={FONT_FAMILIES}>\n  <Card>…</Card>\n</AureaProvider>`,
      peca: v => h(ComOTemaDoApp, {density: v})}),
    {
      title: "Starting values",
      description: "Uncontrolled: defaultTheme and defaultDensity only seed the provider, and the buttons inside change it through useAureaTheme().",
      code: `<AureaProvider defaultTheme="dark" defaultDensity="compact" fontFamilies={FONT_FAMILIES}>
  <Controls />
</AureaProvider>
<AureaProvider defaultTheme="light" defaultDensity="comfortable" fontFamilies={FONT_FAMILIES}>
  <Controls />
</AureaProvider>
<AureaProvider defaultTheme="dark" defaultDensity="spacious" fontFamilies={FONT_FAMILIES}>
  <Controls />
</AureaProvider>

function Controls() {
  const {theme, density, toggleTheme, setDensity} = useAureaTheme();
  return (
    <Card>
      <Text weight={600}>theme {theme}</Text>
      <Text tone="muted">density {density}</Text>
      <Button size="sm" onPress={toggleTheme}>Switch theme</Button>
      <Button size="sm" appearance="outline" onPress={() => setDensity(NEXT[density])}>Next density</Button>
    </Card>
  );
}`,
      render: () => h("div", {style: grade},
        h(Caixa, {defaultTheme: "dark", defaultDensity: "compact", trocar: true}),
        h(Caixa, {defaultTheme: "light", defaultDensity: "comfortable", trocar: true}),
        h(Caixa, {defaultTheme: "dark", defaultDensity: "spacious", trocar: true})),
    },
    {
      title: "The app decides",
      description: "Controlled: the provider asks through onThemeChange and onDensityChange, and nothing changes until the app stores the new value.",
      code: `const [theme, setTheme] = useState<AureaThemeName>("light");
const [density, setDensity] = useState<AureaDensity>("comfortable");

<AureaProvider theme={theme} density={density}
  onThemeChange={setTheme} onDensityChange={setDensity}
  fontFamilies={FONT_FAMILIES}>
  <Controls />
</AureaProvider>`,
      render: () => h(Controlado),
    },
    {
      title: "Sentences",
      description: "strings replaces what the pieces say on their own — here the empty face of DataState, in Portuguese.",
      code: `import {ptBR} from "@aurea-uds/native";

<AureaProvider theme={theme} strings={ptBR} fontFamilies={FONT_FAMILIES}>
  <DataState state="empty">{content}</DataState>
</AureaProvider>`,
      render: () => h("div", {style: {width: "min(22rem, 100%)"}},
        h(ComOTemaDoApp, {strings: ptBR, filho: h(DataState, {state: "empty"}, null)})),
    },
  ],
};
