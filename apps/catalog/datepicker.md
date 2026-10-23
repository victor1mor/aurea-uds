# DatePicker

DatePicker is a field that opens the calendar. One date closes it on the pick; with range, the first pick is one end and the second the other, every time it opens.

## Usage

```tsx
import {DatePicker} from "@aurea-uds/react/calendar";
```

```tsx
<Field label="Check-in">
  <DatePicker defaultValue={new Date(2026, 7, 12)} minimumDate={new Date(2026, 7, 6)} name="checkin" />
</Field>
```

- The same name and props as the native DatePicker: value, onChange, minimumDate, maximumDate, disabled, size, format, placeholder, icon.

- range picks a range in the same component; every opening starts a new range.

- Inside a Field, the label names the trigger and the calendar window; the calendar opens with focus on the chosen day.

- locale sets the language of the trigger and the calendar together, with the same object Calendar takes. Without it, English.

- name sends the LOCAL date as yyyy-mm-dd; a range goes as yyyy-mm-dd/yyyy-mm-dd.

## Examples

### A range

The first pick is one end and the second the other, in any order.

```tsx
<Field label="Stay">
  <DatePicker range defaultValue={{from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)}} name="stay" />
</Field>
```

### Another language

The trigger and the calendar change language together.

```tsx
import {ptBR} from "react-day-picker/locale";

<Field label="Check-in">
  <DatePicker locale={ptBR} defaultValue={new Date(2026, 7, 12)} />
</Field>
```

### Sizes

The field height, on the same scale as Select and Input. md is the default.

```tsx
<Field label="Small">
  <DatePicker size="sm" defaultValue={new Date(2026, 7, 12)} />
</Field>
<Field label="Medium">
  <DatePicker defaultValue={new Date(2026, 7, 12)} />
</Field>
<Field label="Large">
  <DatePicker size="lg" defaultValue={new Date(2026, 7, 12)} />
</Field>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `Date \| DateRange` | — | The chosen date (controlled). With range, {from, to}. |
| `defaultValue` | `Date \| DateRange` | — | The starting date when you do not control it. |
| `onChange` | `(value) => void` | — | Called on every pick. A single date closes the calendar; a range closes on the second pick. |
| `range` | `boolean` | false | Pick a range instead of one date. Every time the calendar opens, the first pick is one end and the second is the other, in any order — it does not stretch the range that was there. |
| `minimumDate` | `Date` | — | Days before it are disabled, and the calendar does not go back past its month. |
| `maximumDate` | `Date` | — | Days after it are disabled, and the calendar does not go past its month. |
| `format` | `(d: Date) => string` | the locale's language | How a date is written on the trigger. The default is day, short month and year in the language of locale — English without it, the same on the server and in the browser. |
| `locale` | `DayPickerLocale` | English | The language of the trigger AND the calendar, together: the object from react-day-picker/locale (import {ptBR} from "react-day-picker/locale"), the same one Calendar takes. It never comes from the environment, so the server and the browser write the same text. |
| `placeholder` | `string` | strings.datePlaceholder | The text of the empty trigger. With range, strings.dateRangePlaceholder. |
| `icon` | `IconName \| false` | "calendar" | The icon at the end of the trigger; false removes it. |
| `name` | `string` | — | Sends the value with a form: yyyy-mm-dd, from the LOCAL date; a range goes as yyyy-mm-dd/yyyy-mm-dd, the ISO 8601 interval. |
| `size` | `Responsive<sm \| md \| lg>` | md | The field height, the same scale as Select and Input. |
| `disabled` | `boolean` | false | The trigger does not open. |
| `id` | `string` | — | Id of the TRIGGER, which is the focusable node — it is what a <label htmlFor> points at. Inside a Field, the Field gives it one. |
| `aria-label` | `string` | — | Names the trigger when there is no visible label, and the calendar window too. With a Field, prefer the Field's label. |
| `aria-labelledby` | `string` | — | Names the trigger and the calendar window by another element's id. |
| `aria-describedby` | `string` | — | Goes to the trigger. It is spelled out because this component unpacks a fixed list of props and drops anything else. |
| `className` | `string` | — | Merged onto the trigger, after the Aurea skin. |
