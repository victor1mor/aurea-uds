# v0.8.5

React Native gets Tabs, new props on Badge, Switch and NavList, and fixes for controls that VoiceOver on iPhone could not reach.

This release adds `Tabs` to React Native and fills several gaps in existing components. It also fixes a family of iPhone accessibility bugs: when an accessible container holds something tappable, VoiceOver hides what is inside, so close buttons, chart data and switches could not be reached.

## New

### React Native

- **[`Tabs`](./tabs.html)**: tabs inside a screen that switch a panel instead of changing page, with the `tablist` and `tab` roles. No new dependency.
- **`Tabs` scrolls sideways**, unlike the web version: on a narrow phone four labels do not fit, and squeezing them would hide the text.
- **`Tabs` unmounts the inactive panel**, unlike the web. Its internal state (scroll position, typed text) is lost when you switch tabs.
- **`Tabs` does not use the brand color for the selected tab**, matching the web, where the selected tab uses the text color.
- **[`Badge`](./badge.html)**: `leading` and `trailing`. They take a node, not an icon name, and do not tint what they receive.
- **[`Switch`](./switch.html)**: `description`. The web `Switch` does not have it yet.
- **[`NavList`](./navlist.html)**: a row with no action no longer announces itself as a link, and the chevron only appears when the row does something.

## Fixed

### React Native

- **[`Alert`](./alert.html): the close button was unreachable for VoiceOver on iPhone.** It sat inside the alert's reading group. It is now outside it.
- **[`Chart`](./chart.html): on iPhone, screen reader users heard the chart name and no data.** The accessible name moved from the frame to the drawing, so the tappable bands with their labels and values are reachable again.
- **[`NavList`](./navlist.html): a tappable `value` (for example a `Switch`) became a button inside a button.** The value now sits outside the row's pressable area. Text values stay inside, as part of the row's sentence.
- **[`SegmentedControl`](./segmentedcontrol.html): the selected option now uses the same selected style as the web and `BottomNav`**: the brand emphasis color and the yellow underline. It uses `primaryEmphasis`, because plain yellow text does not read on the light theme.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.5 @aurea-uds/core@0.8.5 @aurea-uds/fonts@0.8.5 @aurea-uds/icons@0.8.5
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.5
```
