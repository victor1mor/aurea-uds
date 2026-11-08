# @aurea-uds/native

The **React Native** target of Aurea UDS.

A **sibling** package of `@aurea-uds/react`, not a wrapper around it: its own components on top of
`View`/`Text`/`Pressable`, consuming `@aurea-uds/tokens`. Only the tokens are shared between the two.

> ⚠ **The `Combobox` differs from the web one on purpose**: it accepts REMOTE search with single selection,
> which does not exist on the web.
> ⚠ **`Combobox`, `SearchField`, `NumberField`, `Image` and `Gallery` have not run on a device yet** — only
> in tests.
>
> ⚠ **`Chart` is the only component in this package whose GEOMETRY is ours.** On the web it is 79 lines
> of skin over `recharts`; here there is no engine, so scale, axis and path are code in this
> repository. **No new dependency.** See the **Chart** section below.
>
> ⚠ **The native `Table` is NOT a table**: each row becomes a card, and each cell carries the column
> name with it. **The API is different** — `columns` + `rows`, because there is no `<thead>` to write.
> See the **Data** section below, which has the full measurement.
>
> ⚠ **One accessibility finding applies to the whole package:** React Native
> **accepts** `role="dialog"` and `role="alertdialog"` — it compiles, passes `tsc`, goes through Fabric —
> and **maps them on neither platform.** See the **Confirm and notify** section below.
>
> **`DatePicker` and `PhotoInput`** need extra dependencies. They **are not exported from the main entry
> point**: they live in `@aurea-uds/native/system` — see the **Date and camera** section below.
>
> ⚠ **Aurea does not provide routing:** `expo-router`/`react-navigation` is the app's choice; this package
> provides the skin. Pull-to-refresh is `onRefresh`/`refreshing` on the `Screen`.
>
> Two things worth knowing before use: the **strings** table (`<AureaProvider strings>`) and the
> **`useReduceMotion`** hook — see the sections below.

## Installation

```sh
pnpm add @aurea-uds/native react-native-svg react-native-safe-area-context
```

Four **required peers**: `react` (≥19), `react-native` (≥0.76, for the New Architecture),
`react-native-svg` (≥15, for the icons) and `react-native-safe-area-context` (≥5, for `Screen`).
For text to render in the Aurea fonts (Inter, Sora for headings and IBM Plex Mono for code), add
`@aurea-uds/fonts`.

The last one is usually **already installed**: `react-navigation` and `expo-router` pull it in. Declaring
it as a peer adds no weight to the app — it only states what was going to be there anyway.

And **three OPTIONAL peers**, marked as such in `peerDependenciesMeta` — if you do not use date,
camera or file, you install nothing and see no warning. Install only the one for the component you use:

```sh
pnpm add @react-native-community/datetimepicker expo-image-picker
pnpm add expo-document-picker
```

| | | |
|---|---|---|
| `@react-native-community/datetimepicker` | ≥8 | MIT · only for `DatePicker` |
| `expo-image-picker` | ≥16 | MIT · only for `PhotoInput` |
| `expo-document-picker` | ≥12 | MIT · only for `FileInput`, which comes from `@aurea-uds/native/system/file` |

## Theme × density

Two axes, as on the web: theme (`dark`/`light`) × density
(`compact`/`comfortable`/`spacious`). In React Native **there is no cascade**, so something has to
resolve both into one value — that is what the provider does, and why it exists (the engine is plain
`StyleSheet` and the theme layer is ours).

```tsx
import {AureaProvider, Button, Card, Cluster, Screen, Stack, Text} from "@aurea-uds/native";
import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
import {useFonts} from "expo-font";

export default function App() {
  const [pronto] = useFonts(AUREA_FONTS);
  if (!pronto) return null;
  return (
    <AureaProvider fontFamilies={FONT_FAMILIES}>
      <Screen scroll><Cartao /></Screen>
    </AureaProvider>
  );
}

function Cartao() {
  return (
    <Card variant="raised">
      <Stack>
        <Text size="lg" weight={600}>Aurea</Text>
        <Text tone="muted">The `Card` already brings the theme's radius, surface and shadow.</Text>
        <Cluster>
          <Button tone="brand" leadingIcon="plus">New</Button>
          <Button appearance="outline">Cancel</Button>
        </Cluster>
      </Stack>
    </Card>
  );
}
```

### Writing your own styles

Use `criarFolha`, not `StyleSheet.create` directly — it memoizes per (theme, density) pair, so
twenty instances of the same component produce **one** stylesheet, not twenty:

```tsx
import {criarFolha, useAureaTokens} from "@aurea-uds/native";

const folha = criarFolha((t) => ({
  caixa: {backgroundColor: t.color.surface2, padding: t.size.space4},
}));

function Meu() {
  const s = folha(useAureaTokens());
  return <View style={s.caixa} />;
}
```

This is not fussiness: the Android smoke test measured **182 ms** for a theme switch with the app
recreating the stylesheet on every render on purpose, to measure the worst case.

### The shell of a screen

```tsx
<Screen scroll>
  <Text size="xl" weight={600}>Dashboard</Text>
  <Card>…</Card>
</Screen>
```

It fills the screen, paints the theme background and keeps clear of the notch and the gesture bar. **All
four edges by default** — in landscape the notch is on the side, and a screen with only `top` breaks on
rotation.

`padded={false}` for an edge-to-edge list. `scroll` wraps it in a `ScrollView` and **changes where the
padding goes**: it moves to `contentContainerStyle`, because padding on the `ScrollView` itself
clips the scrollable area.

No `SafeAreaProvider` is needed above it: the library's `SafeAreaView` is a native view and reads the
inset on its own. The **hooks** are what require the provider — and if you use `react-navigation` you
already have it.

### Touch target

Three of the five control heights (26, 30, 36 dp) are smaller than `--target-min` (44). The `Button`
solves this **without changing the drawing**: the `Pressable` has `minHeight: 44` and the painted box keeps
the token's height.

It is not `hitSlop`, on purpose — `hitSlop` **is not read by TalkBack**, and would leave the target small
exactly for people who use a screen reader.

`useAureaTheme()` returns `{theme, density, setTheme, setDensity, toggleTheme}` — the same shape as the
hook of the same name in `@aurea-uds/react`. `useAureaTokens()` returns the resolved values, and **has
no web counterpart** because there the CSS resolves them where they are used.

Without an `<AureaProvider>` above, both hooks **throw**. This is deliberate: a silent default
would draw the whole app in the wrong theme without anything reporting it.

## Forms

```tsx
<Form>
  <Field label="Mileage" hint="Numbers only" error={erros.km}>
    <Input keyboardType="numeric" value={km} onChangeText={setKm} />
  </Field>
  <Field label="Fuel">
    <Select items={[{value: "g", label: "Gasoline"}, {value: "e", label: "Ethanol"}]}
            value={comb} onChange={setComb} />
  </Field>
  <Switch label="Remember this vehicle" checked={lembrar} onChange={setLembrar} />
</Form>
```

⚠ **The `Field` is what gives the control its NAME**, and this is the most important difference from
the web. There, `<label for>` points to an `id`; **in React Native there is no `id` and no `htmlFor`** — the
name is a string on the control itself. The `Field` passes `label`, `hint` and the invalid state down
through context, which is why an `Input` on its own, outside a `Field`, **has no name** for people
who use a screen reader.

⚠ **`error` is not just red text:** it marks the control as invalid and becomes the hint the
screen reader announces.

⚠ **`keyboardType="numeric"`** is what makes typing `12,4` cost two taps instead of eight.

### What is different from the web, and why

| | |
|---|---|
| `Switch` | **is not React Native's** — that one brings each system's own switch. Measurements from the CSS |
| `Select` | there is no `<select>` in RN: it is a `Modal` + a sheet that slides up. The role is `button`, not `combobox` — `combobox` promises a field you type in |
| `Form` | is only the spacing. There is no `<form>`, no `submit` and no platform validation; each field's error goes on its `Field` |
| `Field` | no `orientation="horizontal"` — on a 360dp screen the `12rem` grid leaves the control with less than half the width |
| `Radio` | no `name` — grouping belongs to the app state, not to the DOM |
| `:hover` | there is no pointer. Focus remains, and it is the only cue to which field the keyboard is filling |

### Keyboard

```tsx
<KeyboardAvoiding offset={alturaDaTopbar}>
  <Screen scroll>…</Screen>
</KeyboardAvoiding>
```

The `behavior` changes with the platform — `padding` on iOS, `height` on Android — and Aurea picks it
for you. A single one on both sides leaves half the devices with the save button under the keyboard.

## Search, numbers and media

### `Combobox` — type to find an item

⚠ **Do not confuse it with `Select`.** The choice between the two is about LIST SIZE, and the line is
firm: `Select` mounts every item in a `ScrollView` — it is for units, states and types.
**A catalog of thousands of rows freezes there.** `Combobox` uses `FlatList` and accepts remote search.

```tsx
import {Combobox, Field} from "@aurea-uds/native";

// ① REMOTE catalog — Aurea does not filter, the app searches
<Field label="Item">
  <Combobox
    items={resultados}          // the list ALREADY FETCHED
    value={escolhido}           // the WHOLE item, not the id
    onValueChange={setEscolhido}
    onSearchChange={buscar}     // ← the presence of this prop TURNS OFF Aurea's filter
    loading={buscando}
    onEndReached={proximaPagina}
  />
</Field>

// ② LOCAL list — Aurea filters, ignoring accents and case
<Combobox items={unidades} value={unidade} onValueChange={setUnidade} />
```

**The rule in one line: `onSearchChange` present = Aurea does not filter.** It is the presence of a prop,
not a setting — and it exists because filtering again what the server returned hides results.

| | |
|---|---|
| wait before calling `onSearchChange` | **250 ms**. `searchDelay={0}` turns it off |
| where you type | **inside the sheet**, not in the trigger — the keyboard takes half the screen |
| `value` | the **whole item**: in a remote search the list disappears under the selection |
| icons to register | `caret-down`, `search`, `close` |

### `SearchField` — filter what is already on screen

A different role: `Combobox` **picks** from a catalog and returns the choice; this one **filters** and
returns text.

```tsx
<SearchField placeholder="Filter" onSearchChange={setFiltro} />
```

### `NumberField` — currency, measurement and counter

```tsx
<Field label="Amount">
  <NumberField value={valor} onValueChange={setValor}
               format={{style: "currency", currency: "BRL"}} locale="pt-BR" />
</Field>

<Field label="Liters">
  <NumberField value={litros} onValueChange={setLitros}
               format={{maximumFractionDigits: 1}} locale="pt-BR" min={0} />
</Field>

<Field label="Quantity">
  <NumberField value={qtd} onValueChange={setQtd} min={0} step={1} />
</Field>
```

⚠ **What comes out of `onValueChange` is always a `number`** — `1234.5`, never `"R$ 1.234,50"`.

⚠ **It formats on BLUR, and only on blur.** While the field has focus, it shows exactly what was typed.
Live masking is a known defect: it has shipped elsewhere with a recorded WCAG failure, and libraries that
tried it abandoned it.

⚠ **`notation: "compact"` is rejected** — it is broken in RN's JS engine on both systems. A warning is
logged in `__DEV__` and the option is ignored; the rest of the format survives.

The three helpers are public, because the app has the same problem outside the field:

```tsx
import {formatarNumero, lerNumero, separadoresDoLocale} from "@aurea-uds/native";

formatarNumero(1234.5, "pt-BR", {style: "currency", currency: "BRL"});  // "R$ 1.234,50"
lerNumero("R$ 1.234,50", "pt-BR");                                      // 1234.5
lerNumero("", "pt-BR");                                                 // null  ← not 0
```

For **text** (licence plate, ID document, phone number) the moment is the same and the format is yours:

```tsx
<Input value={placa} onChangeText={setPlaca} formatOnBlur={(v) => v.toUpperCase()} />
```

⚠ `formatOnBlur` requires a **controlled** field — the formatted value comes out through `onChangeText`.

### `Image` and `Gallery` — showing photos

⚠ **`Image` is NOT React Native's `Image` with another skin.** It does the two things the raw
primitive does not: it **reserves the box** before the bytes arrive (without that the layout jumps) and it
**falls back to a placeholder** when they do not arrive (without that a broken URL leaves a hole).

```tsx
<Image source={foto.uri} alt="Front of the item" ratio="4/3" />

<Gallery items={fotos} zoom selected={atual} onSelect={setAtual} />
```

| | |
|---|---|
| `ratio` | accepts `4/3`, `"4/3"`, `"16:9"` or the number. The web uses a string; RN wants a number |
| `alt` | **required**. A truly decorative image is written `alt=""`, explicitly |
| zoom | it is the existing **`Dialog`**, not a new surface |
| caption | with a caption, the name goes to the TILE and the image leaves the accessibility tree |
| icon to register | `image` (the placeholder) |

If you already use `expo-image` for its disk cache, swap the element without losing the skin:

```tsx
<Image render={<ExpoImage contentFit="cover" transition={150} />} source={u} alt="…" />
```

⚠ `fit` is **not** translated for the element you pass — `resizeMode` belongs to RN's `Image`, and
`expo-image` calls the same thing `contentFit`. If you pass the element, write its own prop.

## Date and camera

These two **are not exported from the main entry point** — they are the only part of the package with its
own import path:

```tsx
import {DatePicker, PhotoInput} from "@aurea-uds/native/system";
```

⚠ **And the deep path is the documented form, for the same reason as the icons:** a module
nobody imports **does not enter the Metro graph**. If they came from `@aurea-uds/native`, every
app that imported a `Button` would drag the date picker and the camera into the bundle — and would fail
to resolve if the optional peers were not installed. Lazy by construction, not by
tree-shaking.

```tsx
<Field label="Entry date">
  <DatePicker value={data} onChange={setData} maximumDate={new Date()} />
</Field>

<Field label="Receipt">
  <PhotoInput value={fotos} onChange={setFotos} max={3} />
</Field>
```

### `DatePicker` — our skin, their calendar

Aurea draws the **trigger** (same height, same border and same radius as `Input`); what opens is
the **system dialog**. Date is a control that Android and iOS do better and that people already
know how to use — reimplementing it would give a calendar in our colour with the wrong behaviour in nine
edge cases (time zone, non-Gregorian calendar, keyboard input, TalkBack).

⚠ **The two platforms have different APIs, and that is what the component hides:**

| | |
|---|---|
| Android | `DateTimePickerAndroid.open({…})` — **imperative**, the dialog belongs to the system |
| iOS | `<RNDateTimePicker>` — **declarative**, it becomes a node in the tree |

An app that did not know this would write the Android path and see **nothing happen** on the
iPhone.

⚠ **Cancelling does not write a date.** On Android the event comes back with `type: "dismissed"`, and only
`type === "set"` calls `onChange`. It is the easiest edge case to get wrong, and there is a test whose
only job is to fail on it.

### `PhotoInput` — the flow decisions, stated

⚠ **The camera is not a component, it is a flow** — permission, intent, preview, and what to do when the
person denies. Each question got a default, and **each default has a way out**:

| the question | the default | how to change it |
|---|---|---|
| what to show **without** permission? | the trigger appears as usual; tapping it is what asks | — |
| what if the person **denies**? | it asks again next time, as long as the system allows | `onPermissionDenied` |
| what if they deny **for good** (`canAskAgain: false`)? | a warning `Alert` + a button to the settings | `offerSettings={false}` |
| camera or library? | **camera** | `source="library"` |
| how to remove? | an X with a background, **fully outside** the photo, at the top right corner | `removeIcon` |
| how many fit? | **one** | `max` |
| how to **view** the photo? | tapping the thumbnail opens the large photo, with the same zoom as `Gallery` | — |

**Since `0.15.0`**, the thumbnail is a 64 square, the size of the add-photo button. The screen reader
hears *"Photo 2 of 3"* and *"Opens the photo"*; the X, *"Remove photo 2"*. With the field disabled, the
photo still opens and the X does not remove.

⚠ **The trigger disappears when the limit is reached**, instead of staying enabled and doing nothing — a
button that exists and does not respond is the defect, not the protection.

⚠ **`source="library"` does NOT request the camera permission.** They are different permissions, and asking
for the wrong one is a scary dialog the app did not need to show.

The strings (`cameraDenied`, `openSettings`, `photoRemove`, `datePlaceholder`) come from the
**Strings** table — see the section below.

### `FileInput` — choosing a file (since `0.15.0`)

It lives on a path **of its own**, not in `/system`:

```tsx
import {FileInput} from "@aurea-uds/native/system/file";

<Field label="Document">
  <FileInput value={arquivos} onChange={setArquivos} accept="application/pdf"
             maxSize={10 * 1024 * 1024} />
</Field>
```

⚠ **The separate path is what makes "optional" true.** If it lived in `/system`, every app
that uses `DatePicker` would have to install `expo-document-picker`, or the build would fail. Only those
who import `/system/file` need it.

| the question | the default | how to change it |
|---|---|---|
| what comes back? | `{uri, name, size, mimeType}` — the local address, **not the content** | — |
| the person **cancelled**? | nothing changes | — |
| over the **size** limit? | rejected, with *"File larger than the limit: name"* in red below | `maxSize` |
| wrong **type**? | the picker filters; the component checks again and rejects | `accept` |
| the size **did not come**? | accepted: there is nothing to measure, and the server checks | — |
| **how many** fit? | one; at the limit the trigger disappears, as in `PhotoInput` | `max` |
| **long name**? | cut in the middle (`relat…2026.pdf`): the extension stays visible | — |

For the screen reader: the trigger is a button with the `Field` name and the text *"Choose file"*;
each file reads *"name, size"*; the X reads *"Remove name"*; the rejection is announced.

The strings `fileChoose`, `fileRemove`, `fileTooLarge` and `fileWrongType` come from the **Strings** table;
the last three are the same as on the web.

## Chart

```tsx
import {Chart} from "@aurea-uds/native";

<Chart
  label="Cost per month"
  labels={["jan", "feb", "mar", "apr"]}
  series={[{name: "Cost", data: [210, 198, 240, 187]}]}
  mark="area"
  formatValue={(v) => `R$ ${v}`} />
```

### ⚠ It is the only one whose geometry is ours

On the web, `Chart` **does not draw**: its documentation says *"Aurea does not wrap the chart types: the
engine draws, this component holds"*, and the file is 79 lines of skin over `recharts`. **Here there is no
engine.** Scale, ruler, path and axis are code in this repository.

The React Native chart libraries available on the registry were evaluated and rejected. The main reason:
a library where data goes in and a finished chart comes out does not fit, even when it brings no new peer.
`recharts`, on the web, works with composed marks — adopting a data-in, chart-out library would invert the
relation in which Aurea holds and the engine draws with Aurea's props.

**No new dependency:** `react-native-svg` has been a peer since the icons.

### The scope, stated

| in | out |
|---|---|
| `line`, `area`, `bar` (and mixing the three) | pie/donut · **two Y axes** (the number one chart mistake) · stacked · animation · zoom |

### ⚠ The legend does NOT turn off with two or more series

This is not advice — it is measurement. The `--chart-1..5` palette is **the same blue from light to dark**:
a magnitude ramp, not an identity set. Measured:

```
all five, neighbouring pairs   ΔE 5.9 (normal vision)  ·  5.2 (colour blindness)   FAIL
--chart-2 + --chart-4          ΔE 13.7                 ·  10.6                     passes for colour blindness
```

That is why the default colour order **skips a step** and starts with the measured pair. And that is why the
legend is required: on a phone the mark is thinner than on the web, and colour alone does not separate the
series of this ramp.

### ⚠ There is no tooltip — touch selects

The web documentation says the tooltip *"follows the pointer and is not focusable"*. **Both halves fail
on touch.** Instead: each label is a target, and its name carries the values —
`"jan, Cost: 210, Target: 200"`.

### ⚠ The list of values is the accessibility layer, and it is ON

The web delegates accessibility to the `recharts` keyboard support (*"arrow navigation between the points,
on by default"*). **There is no engine and there are no arrows.** What replaces it is `showValues`: when a
point is selected, the values come out as text. Turn it off only if you have already solved the same problem
another way.

### What else is different

| | |
|---|---|
| `role="group"` | **does not map** — it falls into `else -> null` on Android, like `dialog` and `table`. Here it is `accessible` + `accessibilityLabel`, which is what really groups |
| height | the web refuses a prop on purpose (*"the box is sized by the CSS"*). **Here there is no CSS**, so `height` exists — with the same default as there, 220 |
| gap in a series | `null` **SKIPS**: it does not become zero and does not join the neighbours across. Joining would invent data that does not exist |
| the base of the bar | zero is included in the ruler whenever the data is positive. **A bar that does not start at zero lies about proportion** |

⚠ **The Y-axis ruler divides the range into equal parts and does not look for round numbers** — an
axis from 0 to 97 comes out `0 · 24.25 · 48.5 · …`, not `0 · 25 · 50 · …`. This is a known
**improvement to make, not a defect**: what exists is correct, just not pretty.

## Data

```tsx
import {DataList, Table, Timeline} from "@aurea-uds/native";
```

### ⚠ `Table` is not a table here — and that is not a step back

Two measurements decide the design, and they point to the same place:

| | |
|---|---|
| **the role does not map** | `accessibilityRole` has no `table`; `role` has it, and it falls into `else -> null` on Android and has no trait on iOS — the same trap as `dialog` (see **Confirm and notify**). **A real grid would announce itself as a table on no platform** |
| **the grid does not fit** | `.table` has `min-width: 720px` in `aurea.css`. On a 360dp phone that is 2× horizontal scrolling — and the web documentation itself only accepts it because the region is keyboard-focusable. **On touch there is no keyboard**: what is left is dragging, which the web already considered the insufficient half |

```
keep the grid   ->  loses readability   AND  gains no semantics
become a list   ->  gains readability   AND  gains `accessibilityRole="list"`, which MAPS
```

**Only the list has both.**

⚠ **The GRID mode was not built**, on purpose: it would only make sense on a tablet, and no
tablet has been measured. On native, **demand comes before coverage** (the opposite of the rule for the
web) — a half-grid would be worse than no grid. It will come back as a prop when there is a measured
tablet screen.

### `Table`

```tsx
<Table
  caption="Entries"
  columns={[
    {key: "data", header: "Date", primary: true},
    {key: "km", header: "Mileage"},
    {key: "custo", header: "Cost", cell: (l) => moeda(l.custo)},
  ]}
  rows={lancamentos}
  keyExtractor={(l) => l.id}
  onRowPress={abrir} />
```

⚠ **The API is DIFFERENT from the web one, and it had to be.** There you write `<thead>`/`<tbody>` as
`children`. Here there are no table elements to write, so the component takes **data**.
It is not the same prop with another name — it is a different surface, stated here instead of discovered
through a type error.

⚠ **The header does not disappear: it moves.** Each `header` names its own cell inside the
card. That is what prevents the classic defect of a table turned into a list — four loose numbers, one
below the other, without saying what each one is.

⚠ **`primary` marks the column that identifies the row** (in a list of entries, the date). It
becomes the card title and **does not repeat its own name**.

⚠ **A row only becomes a target with `onRowPress`.** A tappable row with no action would be announced as a
button and do nothing.

### `Timeline` and `DataList`

```tsx
<Timeline items={[{title: "Created", description: "by the app", time: "08/09 14:20"}]} />

// Since 0.15.0: icon in a frame, colour by tone, value on the right and what happened between two items.
<Timeline items={[
  {title: "Order shipped", description: "28/09", icon: "truck", tone: "success",
   trailing: "R$ 216,00", between: "6 days later"},
  {title: "Payment", description: "22/09", icon: "storefront", tone: "primary",
   trailing: "R$ 460,00"},
]} />

<DataList items={[{term: "Mileage", value: "12,4 km/l"}]} />
```

⚠ **In `DataList`, each pair is ONE accessible node** named `"term: value"`. On the web, `<dl>`
guarantees the pair for free; here there is no `<dl>` and no definition-list role, so the link has to be
stated. Without it, someone swiping with a finger hears "Mileage", takes a step, hears "12,4 km/l" — and
on a panel of eight pairs loses which value belonged to which term.

⚠ **It stacks below 640dp, at the same breakpoint as the web.** A comment in the CSS records the defect
the rule avoids: at 320px the value column resolved to **0px** and pushed the text off the
page. `layout="inline"` / `"stacked"` forces one, regardless of width.

⚠ **One item with `icon` is enough for the whole column to take the frame's width** (40): items without
an icon keep the dot, centred in it, and the line goes through the centre of the frames. `between` does not
appear after the last item, because there is no next one.

⚠ **In `Timeline`, count and position are NOT announced**, and that is a choice. On the web it is an
`<ol>`, and its documentation says the screen reader announces "1 of 40" for free; here that "for free" does
not exist and would have to be written item by item. Attaching it to every event of a history is noise at
every stop of the reader — and the chronological order is already in `time`, which is the real information.
**Whoever needs position actually needs the date.**

### Long list: `virtualized`

```tsx
<Screen>                                {/* NO `scroll` */}
  <Table … rows={mil} virtualized />
</Screen>
```

`virtualized` replaces the `map` with a `FlatList`, which only mounts what is on screen.

⚠ **With `virtualized`, the component IS the scroller — do not put it inside `<Screen scroll>`.** Two
scrollers on the same axis is a known RN error: the outer one gives the inner one infinite height, the
virtualization turns off, and the console warns *"VirtualizedLists should never be nested inside plain
ScrollViews"*.

⚠ **And the `Timeline` rail is not drawn in virtualized mode** — honesty, not a defect.
It is a line from the top to the bottom of the WHOLE list, and in a `FlatList` the whole list does not exist:
only the window. Drawing it would give a rail that starts and ends in the wrong place as you scroll. The
dots remain.

## Confirm and notify

```tsx
import {BottomSheet, ConfirmDialog, Dialog, Drawer, ToastHost, useToast} from "@aurea-uds/native";
```

### ⚠ First, what does NOT work — and passes everything

React Native accepts `role="dialog"` and `role="alertdialog"`. They are in the type, they compile, and
they go through Fabric's C++. **And they do nothing on the device.** Measured on both platforms, in the
`react-native@0.87.1` source:

| platform | where it dies |
|---|---|
| Android | `ReactAccessibilityDelegate.kt:515`, `fromRole()` falls into `else -> null` — with RN's own comment: *"No mapping from ARIA role to AccessibilityRole"* |
| iOS | the trait list (`accessibilityPropsConversions.h:24-104`) **has neither** `dialog` nor `alertdialog`; the `role` string only disambiguates `checkbox` and `radio` |

**This is worse than the role not existing.** A component that used them would pass code review, pass
`tsc`, pass any test that asked "is the prop there?" — and be useless to people who use a screen reader.
There is a test in this repository whose only job is to reject those two words.

**What Aurea does instead:**

| the web | here |
|---|---|
| `role="dialog"` + trapped focus | RN's **`Modal`**. It is a **system window**, and both TalkBack and VoiceOver already limit themselves to the top window — the confinement comes from the operating system, not from a `Tab` loop in JavaScript |
| `Escape` closes | **`onRequestClose`** — the Android BACK button. RN documents the prop as required; without it the box gets **stuck** |
| `aria-labelledby` | the title is a `Text` with `accessibilityRole="header"` — the only role in this family that Android maps |
| `aria-describedby` | does not exist. The sentence is read because it is **in order**, which is why it comes before the buttons in the tree |
| `backdrop-filter: blur(5px)` | **does not carry over.** There is no backdrop filter in RN, and what exists (`expo-blur`) is a new dependency. `--overlay` is already black at 74% and separates on its own |

### `Dialog` and `ConfirmDialog`

```tsx
<Dialog open={aberto} title="Edit entry" onClose={fechar}
        footer={<><Button appearance="outline" onPress={fechar}>Cancel</Button>
                  <Button onPress={salvar}>Save</Button></>}>
  <Field label="Mileage"><Input value={km} onChangeText={setKm} /></Field>
</Dialog>

<ConfirmDialog open={perguntando} destructive
               title="Delete this entry?"
               description="It leaves the history and the cost per km. This cannot be undone."
               confirmLabel="Delete" onConfirm={apagar} onCancel={desistir} />
```

⚠ **`ConfirmDialog` is NOT a `Dialog` with two buttons.** The difference is behaviour, and it
carried over whole from the web: **tapping outside does not close it.** A tap outside turning into "I
cancelled" is the accident the component exists to prevent.

⚠ **What did not carry over, and it is fair to say so:** on the web, focus starts on the safe button,
because someone who opens a "this deletes" and presses Enter by reflex has to cancel. **On touch there is no
such reflex** — there is no keyboard focus and no Enter. Moving the *screen reader* focus to Cancel would
translate the mechanism and lose the intent: it would skip exactly the sentence that says what is lost. So
focus is not moved, and what remains is what matters here: the backdrop does not close it, and the **order**
is cancel → confirm.

⚠ **`description` is required**, and says what is lost and whether it comes back.

### `Drawer`

```tsx
<Drawer open={aberto} title="Filters" side="right" onClose={fechar}>…</Drawer>
```

⚠ **The side is PHYSICAL, not logical.** The reason comes from the web documentation and applies the
same: a panel tied to the writing direction would switch sides when the language changes, and a navigation
panel should not move.

⚠ **The animation is ours, and the `Modal` one is turned off** — RN's `animationType="slide"` comes up from
the **bottom**, always. Leaving it on would make the side panel enter through the floor.

### `BottomSheet` — the only one without a web counterpart

```tsx
<BottomSheet open={aberto} title="New entry" onClose={fechar}>…</BottomSheet>
```

⚠ **It answers the same problem as the centred dialog, and answers differently because the hand is
different:** on a phone held in one hand, the top of the screen is the hardest place to reach.
The centred dialog puts the choices exactly there; the sheet puts them where the thumb is.

⚠ **Dragging is `PanResponder`, which is part of React Native itself — not a new dependency.** This was
a deliberate choice over a bottom-sheet library that would bring **two** new pieces
(`gesture-handler` + `reanimated`) for a one-axis gesture.

**What the choice buys and what it costs, stated instead of hidden:** it buys zero dependencies and a
component that runs in Expo Go. It costs the gesture running on the JS bridge, not on the UI thread — with a
long list inside the sheet, dragging may stutter. If that shows up on a device, the switch will be a
deliberate decision, not a patch.

⚠ **Releasing halfway SNAPS BACK**, it does not close: it only goes through if you dragged more than a third
of the height, or flicked quickly. Closing too early turns a shaky tap into lost data.

### `useToast` — and why the host is explicit

```tsx
<AureaProvider>
  <ToastHost offset={alturaDaBottomNav}>
    <App/>
  </ToastHost>
</AureaProvider>

// anywhere inside:
const {add} = useToast();
add({title: "Entry saved", type: "success"});
```

⚠ **There is no portal in React Native.** On the web, `AureaProvider` hangs the stack at the end of `<body>`
and the app does not need to know. Here a component only draws where it is in the tree.

⚠ **The obvious way out would be for `AureaProvider` to draw the stack, and it is wrong.** Measured: today it
returns **only contexts**, no `View`. Putting a `View` there would change the layout of **every app that
already uses Aurea**, silently — a new container between the root and the first child is exactly what
breaks a `flex: 1` and shows up as *"why did my screen shrink?"* three days later.

So the host is its own component and in plain sight. If you do not call `useToast`, you do not add
`ToastHost`, you do not pay for the `View`, and nothing changes.

⚠ **`useToast()` without a host THROWS**, with a message that says what to do. Returning a silent `add()`
would be the most expensive defect possible: the "saved" notice that never appears breaks nothing, does not
throw, and vanishes in the middle of a flow that looked right.

⚠ **`duration: 0` never closes on its own, and it is what a toast with `action` must use.** An
"Undo" button that slips away in five seconds is a button that does not exist for someone who reads slowly,
for someone who uses a screen reader, or for someone who just looked away.

⚠ **`offset` exists because of `BottomNav`:** without it the toast appears on top of the bar and covers
exactly what the person was about to tap. The gesture bar spacing is `Math.max`, **not a sum** — the
same calculation as `BottomNav`.

⚠ **Time is not motion:** with «remove animations» on, the toast does not slide, but the clock
keeps running. Someone who asked for less motion did not ask for the toast to stay forever.

## The frame

```tsx
<Screen padded={false} scroll onRefresh={buscar} refreshing={carregando}>
  <Topbar brand={<Text weight={700}>Aurea</Text>} />
  …
</Screen>
<BottomNav
  current={aba}
  items={[
    {id: "painel", label: "Dashboard", icon: "squares-four", onPress: () => ir("painel")},
    {id: "avisos", label: "Alerts", icon: "bell", badge: 8, onPress: () => ir("avisos")},
  ]} />
```

⚠ **Aurea does not provide routing.** These components take `items` and `current` and report through
`onPress`. The app is what changes screens.

⚠ **`BottomNav` is not `Tabs`, and this is not a naming detail:** a tab switches a panel of
*this* screen; the bar switches screens. That is why the items are `link` and not `tab` — giving `tablist`
to a menu makes the screen reader promise arrow keys that lead nowhere.

⚠ **It respects the gesture bar on its own**, using the larger of the theme spacing and the system
inset.

⚠ **`Topbar` does not stick on its own** — `position: sticky` does not exist in RN. The bar stays put
because the screen places it **outside** the `ScrollView`, as in the example above.

### Pull to refresh

`onRefresh` + `refreshing` on the `Screen`, and only with `scroll` — there is nothing to pull on a screen that
does not scroll. `refreshing` belongs to the app: the component does not guess when the fetch has finished.

## Strings

`Alert`, `Status`, `EmptyState` and `DataState` speak on their own: the seven universal states, the empty
state, the error, the `Spinner` label. The default is **English**, as on the web.

```tsx
import {AureaProvider, ptBR} from "@aurea-uds/native";

<AureaProvider strings={ptBR}>…</AureaProvider>
```

The table has **far fewer keys** than the one in `@aurea-uds/react` — it is the size of what the
native target draws, and each new key is born with a component that uses it. `useAureaStrings()`
reads whatever is in effect.

## Motion

```tsx
const reduzir = useReduceMotion();   // true · false · null (not known yet)
```

⚠ **On the web this comes for free, and here it does not.** `aurea.css` has a global
`prefers-reduced-motion` rule that zeroes every animation; **React Native has no cascade**, so whoever
animates has to ask. `Spinner` and `Skeleton` already ask — this hook is for your code to do the
same.

`null` is the honest answer while the system has not answered: the read is asynchronous, and starting
at `false` would play an animation frame in the face of someone who asked for none. If you animate, write
`if (reduzir !== false) return;`.

## The reading panel

```tsx
<DataState state={carregando ? "loading" : erro ? "error" : vazio ? "empty" : undefined}>
  {() => (
    <Stack>
      <KPI label="Cost per km" value="R$ 1,20" trend="+3% this month" />
      <Progress value={score} label="Health" />
      <Status variant="online">Synced</Status>
    </Stack>
  )}
</DataState>
```

⚠ **The seven universal states ACCOMPANY the content**, they do not replace it: `stale`, `partial` and
`offline` say the data is there with a caveat. Only `loading`, `error` and `empty` take its place.

⚠ **`children` as a FUNCTION** exists so expensive content is not built behind a skeleton.

⚠ **`Alert` needs the variant glyphs in the registry** (`info`,
`check-circle`, `warning`, `x-circle`). This package does not import them for
you — that would bring icons into the bundler graph behind your back.

### The anchored badge, and the label it requires

```tsx
<Badge count={8} anchor="top-end">
  <IconButton name="bell" label="Alerts, 8 unread" onPress={abrir} />
</Badge>
```

⚠ **When anchored, the number leaves the accessibility tree** — the information is carried by the label
of what was decorated. Without it the screen reader announces *"bell, 8"* and nobody knows what the 8 is.

## Icons

One component per icon and per weight, generated from the `@phosphor-icons/core` SVG on top of
`react-native-svg`. Each icon has two shapes: the regular one (`icons/house`) and the filled one
(`icons/house-fill`), which is used for the selected item and for notices.

**The documented form is the deep path:**

```tsx
import Plus from "@aurea-uds/native/icons/plus";
import CaretDown from "@aurea-uds/native/icons/caret-down";

<Plus size={size.iconMd} color={color.foreground} />
```

Importing 40 icons loads 40. **The barrel (`@aurea-uds/native/icons`) exists, but it is not the documented
form:** it brings every icon into the bundler graph unless Metro's tree-shaking
— experimental, three flags, production only — is on. The deep path does not depend on any
tree-shaking: a module that is not imported does not enter the graph.

`color` **is not inherited**: `currentColor` does not exist in React Native, and the Phosphor drawing paints
with `currentColor`. The default is explicit black — pass the theme colour.

**The filled shape goes into the registry with the `-fill` suffix**, like the file:
`criarRegistroDeIcones({house: House, "house-fill": HouseFill})`. Components ask for the filled one on the
selected item (`BottomNav`), on notices (`Alert`, `Toast`) and on `ThemeToggle`; if it is not in the
registry, the regular one is used.

**Coming from the icons used until `0.12.4`:** every name changed. The table
`@aurea-uds/icons/carbon-para-phosphor.json` maps the old names to the new ones.

The names are **the same as in the web sprite**: what `<Icon name>` draws there, `icons/<name>` draws here.

**A custom glyph** (the app logo) comes from `criarGlifo`, without the app importing
`react-native-svg`: rectangles, circles and paths, filled or stroked. The paint uses the SVG names,
and `"currentColor"` is the `Icon` colour:

```tsx
const Logo = criarGlifo({fill: "none", stroke: "currentColor", strokeWidth: 2,
                         strokeLinecap: "round", paths: ["M…"]});
const ICONES = criarRegistroDeIcones({...OS_DO_APP, logo: Logo});
```

**The name is checked by TypeScript**: `<Icon name="chevron-down">`, with a single hyphen, does not
compile, and the registry key is checked too. A custom glyph is added by declaring its name
**once**:

```tsx
declare module "@aurea-uds/native" {
  interface AureaIconNames { logo: true }
}
```

## What this package does not do

- **It does not promise parity** with the web. React Native has no `<p>`, no type cascade,
  no `<input type=file>` and no hover — the native list is **its own**, not the same one with fewer items.
- **It does not provide routing.** `expo-router`/`react-navigation` is the app's choice.
- **It does not force a framework.** Expo is not a peer: the package is a library.

## Colour: a platform limit, stated

Colours come out in **hex**, and not by our choice. React Native's colour parser
**rejects** `oklch()`, `lab()`, `color(display-p3 …)` and even `color(srgb …)` — measured on versions
0.81.5 and 0.87.0, and it is JavaScript shared between iOS and Android. Passing a wide gamut to a
`style` makes the colour **silently discarded**.

Consequence: on a wide-gamut screen the brand yellow loses **ΔEok 0.0225**, which sits right on the
threshold of what is perceptible. It cannot be avoided today — it is a platform ceiling.

## License

Apache-2.0. The glyphs are from `@phosphor-icons/core` (Phosphor Icons, MIT) — see `NOTICE`.
