# @aurea-uds/fonts

The fonts of **Aurea UDS**, with the `@font-face` rules it expects (since `0.39.0`):

- **Inter** for text and controls;
- **Sora** for headings;
- **IBM Plex Mono** for code and values (`numeric` and the `KPI` number).

Up to `0.38.0` the web used Atkinson Hyperlegible; up to `0.12.4`, IBM Plex.

```bash
pnpm add @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // BEFORE @aurea-uds/core/css
```

Order matters: the core only declares `--font-ui`, `--font-heading`, `--font-editorial` and `--font-code`,
and this package is what points those names to real files. Import the core first and the first paint
falls back to a system font.

Headings get Sora on their own: the core applies `--font-heading` to every `h1` to `h6` through a
zero-specificity rule. A font you set on the heading itself wins over it; a font the heading only
inherits from its parent (`body{font-family:…}`) loses.

⚠ `--font-editorial` has no font of its own: it points to the text font (Inter today). It still exists
only so that code using it does not break; it is removed in `1.0`.

## In React Native

React Native does not read `woff2`, and on Android it does not read variable fonts: native gets the same
three families as static `.ttf`, one file per weight (`@aurea-uds/fonts/native`). Load `AUREA_FONTS` and
pass `FONT_FAMILIES` to `AureaProvider`:

```tsx
import {AureaProvider} from "@aurea-uds/native";
import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
import {useFonts} from "expo-font";

const [pronto] = useFonts(AUREA_FONTS);
// ...
<AureaProvider fontFamilies={FONT_FAMILIES}>{/* your app */}</AureaProvider>
```

On the device, each weight is a family of its own, named after the file's PostScript name:
`Inter-SemiBold`, `Sora-Bold`, `IBMPlexMono-Medm`. `FONT_FAMILIES` points the requested role and weight to
them; without it, the device falls back to the system font. There are 14 files, **complete** (every
script each font draws): 3.17 MB in the app.

## Where the files come from

| file | source | how |
|---|---|---|
| `inter-variable-normal.woff2`, `inter-variable-italic.woff2` | Inter 4.1 from the author (`rsms/inter`, `Inter-4.1.zip`, folder `web/`) | subset to the Latin range by `cortar-fontes.py`; still variable (weight 100–900 and optical size 14–32) |
| `sora-variable-normal.woff2` | `google/fonts`, `ofl/sora/Sora[wght].ttf`, commit `a926665019d3` | subset the same way; variable (weight 100–800) |
| `ibm-plex-mono-400-normal.woff2`, `-500-`, `-600-` | `@ibm/plex-mono` 2.5.0, `fonts/split/woff2/IBMPlexMono-{Regular,Medium,SemiBold}-Latin1.woff2` | **no change at all** (the license reserves the name "Plex") — only the file name |

The subset keeps the characters the web served before (the `latin` subset, 218) and every design
feature, such as equal-width figures (`tnum`). Inter keeps 217 of them (the original has no division
slash `∕`) and Sora 217 (it has no thin space); the `Latin1` subset of IBM Plex Mono covers 214. To
rebuild and check:

```bash
python packages/fonts/cortar-fontes.py <InterVariable.woff2> <InterVariable-Italic.woff2> <Sora[wght].ttf>
```

The script prints the digest (sha256) of each file. The IBM files are checked against IBM's package:

| file | sha256 (start) |
|---|---|
| `ibm-plex-mono-400-normal.woff2` | `e8993d946649b9d0` |
| `ibm-plex-mono-500-normal.woff2` | `41201b658a328b9d` |
| `ibm-plex-mono-600-normal.woff2` | `b7acd05041ab65f3` |

The native `.ttf` files (`files-native/`):

| file | source | how |
|---|---|---|
| `inter-{400,500,600,700,800}-normal.ttf`, `inter-400-italic.ttf` | Inter 4.1 from the author (`Inter-4.1.zip`, folder `extras/ttf/`) | **no change**, only the file name |
| `sora-{400,500,600,700,800}-normal.ttf` | the same `Sora[wght].ttf` as the web | pinned to one weight per file, with each weight's name |
| `ibm-plex-mono-{400,500,600}-normal.ttf` | `@ibm/plex-mono` 2.5.0, `fonts/complete/ttf/IBMPlexMono-{Regular,Medium,SemiBold}.ttf` | **no change** (the reserved name "Plex") |

```bash
python packages/fonts/fontes-nativas.py <Inter-4.1.zip> <ibm-plex-mono.zip> <Sora[wght].ttf>
```

The script gives the same output on every run and prints the digest of each file:

| file | sha256 (start) |
|---|---|
| `inter-400-normal.ttf` | `40d692fce188e447` |
| `inter-400-italic.ttf` | `bbc051dd204b5019` |
| `inter-500-normal.ttf` | `97ad806f526e4154` |
| `inter-600-normal.ttf` | `78a843fade9d4612` |
| `inter-700-normal.ttf` | `288316099b1e0a47` |
| `inter-800-normal.ttf` | `e6756ad5690b7760` |
| `sora-400-normal.ttf` | `d160a9b5551b207a` |
| `sora-500-normal.ttf` | `5924a0b3b90f6591` |
| `sora-600-normal.ttf` | `71962517584791ef` |
| `sora-700-normal.ttf` | `f09649958726cec7` |
| `sora-800-normal.ttf` | `4ea25ce1d1f41736` |
| `ibm-plex-mono-400-normal.ttf` | `7c6fbddca4b700be` |
| `ibm-plex-mono-500-normal.ttf` | `98fbd727aae340b2` |
| `ibm-plex-mono-600-normal.ttf` | `f04d7c488ddf7d1f` |

Up to `0.40.0` native used Atkinson Hyperlegible; none of its files remain in the package.

## Why a package of its own

It was split out of the core so that anyone who already serves the font — from their own CDN, or hosted
with other subsets — can skip it without copying and editing the stylesheet.

## License

The three families are under the **SIL Open Font License 1.1**, and the license text ships with the
package, with the copyright of each one. IBM Plex Mono has the **reserved font name "Plex"**: a modified
file cannot carry that name — that is why its files ship unchanged. The OFL is not Apache-2.0: read it
before redistributing the font files.
