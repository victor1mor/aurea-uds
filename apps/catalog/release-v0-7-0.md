# v0.7.0

The first release of @aurea-uds/native, with 46 React Native components, plus fixes for crashing accessibility roles and a theme switch that got out of sync on the web.

`@aurea-uds/native` is published for the first time, bringing Aurea to React Native with 46 components. Three of them deliberately differ from the web: `Table`, `Chart` and `ToastHost`. On the web, theme switching through `useAureaTheme` no longer goes out of sync with `AureaProvider`.

## New

### React Native

- **`@aurea-uds/native`**, published for the first time, with 46 components.
- **Layout and basics**: [`Text`](./text.html), `Screen`, [`Stack`](./stack.html), [`Cluster`](./cluster.html), [`Grid`](./grid.html), [`Card`](./card.html), [`Icon`](./icon.html), [`Button`](./button.html), [`IconButton`](./iconbutton.html), plus `criarFolha`, a memoized stylesheet factory.
- **Feedback and data display**: [`KPI`](./kpi.html), [`Progress`](./progress.html), [`Status`](./status.html), [`Badge`](./badge.html), [`Alert`](./alert.html), [`Skeleton`](./skeleton.html), [`Spinner`](./spinner.html), [`EmptyState`](./emptystate.html), [`DataState`](./datastate.html), [`Avatar`](./avatar.html), plus the strings table and `useReduceMotion`.
- **Navigation**: [`BottomNav`](./bottomnav.html), [`Topbar`](./topbar.html), [`NavList`](./navlist.html), [`Stepper`](./stepper.html), and pull-to-refresh through `onRefresh` and `refreshing` on `Screen`.
- **Forms**: [`Field`](./field.html), [`Label`](./label.html), [`Input`](./input.html), [`Textarea`](./textarea.html), [`Select`](./select.html), [`Switch`](./switch.html), [`Checkbox`](./checkbox.html), [`Radio`](./radio.html), [`SegmentedControl`](./segmentedcontrol.html), [`Form`](./form.html), `KeyboardAvoiding`.
- **`DatePicker` and `PhotoInput`** live in the separate path `@aurea-uds/native/system`.
- **Overlays**: [`Dialog`](./dialog.html), [`ConfirmDialog`](./confirmdialog.html), [`Drawer`](./drawer.html), `BottomSheet`, `ToastHost` and [`useToast`](./usetoast.html).
- **Data**: [`Timeline`](./timeline.html), [`DataList`](./datalist.html), [`Table`](./table.html), [`Chart`](./chart.html) and [`ChartLegend`](./chartlegend.html).
- **Icons** are one generated component per icon over `react-native-svg`, built from the Carbon icons, and are imported from deep paths (`@aurea-uds/native/icons/*`).
- **Peer dependencies**: `react` 19 or later, `react-native` 0.76 or later, `react-native-svg` 15 or later and `react-native-safe-area-context` 5 or later. Optional: `@react-native-community/datetimepicker` 8 or later and `expo-image-picker` 16 or later, needed only if you use dates or the camera.

## Changed

### React Native

- **`Table` is not a grid**: each row becomes a card and each cell carries its column name. The API is `columns` and `rows`, not `children`. A 720px table does not fit a phone, and the table accessibility role does nothing on either platform.
- **`Chart` draws its own scale, ruler, path and axis** instead of wrapping recharts. With two or more series the legend cannot be turned off, because the chart palette is a single-hue ramp.
- **`ToastHost` is placed explicitly** in your layout. React Native has no portal, and adding it inside `AureaProvider` would add a view to every existing layout.

## Fixed

### Web

- **The theme had two sources of truth that went out of sync.** Inside an `AureaProvider`, calling `useAureaTheme().setTheme("light")` changed the page to light while components reading `useTheme()` still saw dark. With a provider present, `setTheme`, `setDensity` and `toggleTheme` now go through it; without a provider they still write to the page directly.
- **`toggleTheme` from the provider did nothing for users on a light system default.** With no theme chosen yet it switched to light, which was already showing, so clicking it changed nothing. This is fixed.

### React Native

- **`Alert` and `Toast` crashed on Android** by passing the `status` accessibility role, which React Native does not support. The `danger` variant now uses `alert`; the others pass no role and keep the live region that makes TalkBack speak.
- **`Input` clipped its own text on Android.** Android added its theme padding to a fixed-height box and left the text at the top. The field now sets its vertical padding and centers the text.
- **Touching the body of a sheet closed it.** In `Select`, `Dialog`, `Drawer` and `BottomSheet`, the closing backdrop is no longer a parent of the panel, so touches on the panel (including scrolling lists) stay inside.
- **`Alert`'s dismiss button label was always in English.** It now uses the `close` string.
- **Note for `BottomNav`**: if a white band shows under the bar in the dark theme, your app's root view is unpainted. Wrap the screen and the bar in a view with the theme background.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.7.0 @aurea-uds/core@0.7.0 @aurea-uds/fonts@0.7.0 @aurea-uds/icons@0.7.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.7.0
```
