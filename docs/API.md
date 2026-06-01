# API Reference

Complete reference for everything exported from `react-ethiopian-calendar`.

```ts
import {
  EtCalendar,
  EtTimePicker,
  convertToEthiopian,
} from 'react-ethiopian-calendar';

import type {
  EtCalendarProps,
  EtCalendarValue,
  EtTimePickerProps,
  EthiopianDate,
  DateRangeValue,
  SingleDateInput,
  SingleDateValue,
  Language,
  EthiopianTuple,
} from 'react-ethiopian-calendar';
```

Remember to import the stylesheet once: `import 'react-ethiopian-calendar/style.css';`

---

## Components

### `EtCalendar`

A default-styled `forwardRef` component for selecting a single date or a date range, in either the Ethiopian or Gregorian calendar.

```ts
const EtCalendar: React.ForwardRefExoticComponent<
  EtCalendarProps & React.RefAttributes<HTMLDivElement>
>;
```

The forwarded ref points at the wrapper `HTMLDivElement`.

#### Props (`EtCalendarProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `EtCalendarValue \| null` | — | Selected value. Single mode accepts `Date \| Dayjs \| string \| number \| null`; range mode accepts `DateRangeValue` (`{ startDate, endDate }`). |
| `onChange` | `(value: Dayjs \| DateRangeValue) => void` | — | Selection-change callback. Payload differs by mode — see [onChange payload](#onchange-payload). |
| `calendarType` | `boolean` | `true` | `true` renders the Ethiopian calendar; `false` renders Gregorian. |
| `minDate` | `SingleDateInput` | — | Minimum selectable date. |
| `maxDate` | `SingleDateInput` | — | Maximum selectable date. |
| `name` | `string` | — | Name forwarded to the form field. |
| `disabled` | `boolean` | `false` | Disable the component. |
| `disableFuture` | `boolean` | `false` | Prevent selecting dates after today. |
| `fullWidth` | `boolean` | — | Stretch the component to its container's width. |
| `borderRadius` | `string` | — | Custom border radius for the input. |
| `placeholder` | `boolean \| string` | `false` | Placeholder text, or `false` to omit. |
| `lang` | `Language` | `'en'` | UI language: `'am'` (Amharic), `'en'` (English), or `'or'` (Afaan Oromoo). |
| `label` | `string` | — | Accessible label. |
| `inputStyle` | `React.CSSProperties` | — | Inline styles applied to the input. |
| `style` | `React.CSSProperties` | — | Inline styles applied to the wrapper. |
| `onBlur` | `(event: React.FocusEvent<HTMLDivElement>) => void` | — | Blur handler forwarded to the input. |
| `dateRange` | `boolean` | `false` | Enable date-range selection mode. |
| `primaryColor` | `string` | `'#0253a5'` | Accent color (any valid CSS color), applied via the scoped `--et-primary-color` variable. |
| `allowClear` | `boolean` | `true` | Show a clear (×) button at the right of the input (before the calendar icon) that resets the value. On clear, `onChange` fires with `null` (single) or `{ startDate: null, endDate: null }` (range). |
| `allowCalendarSwap` | `boolean` | `false` | Show a header swap button (⇄ + target label) that switches between the Ethiopian and Gregorian calendar views, in either direction. Display-only — the committed `onChange` value is the same underlying date in both views. |

#### onChange payload

The `onChange` argument is typed as `Dayjs | DateRangeValue`, and which one you receive depends on `dateRange`:

- **Single mode** (`dateRange` is `false` / omitted): `onChange` receives a `Dayjs` instance (normalized to the start of the day).
- **Range mode** (`dateRange={true}`): `onChange` receives a `DateRangeValue` object — `{ startDate: Dayjs | null, endDate: Dayjs | null }`. Each endpoint is normalized to the start of the day or `null` when unset.

```ts
// Single mode
<EtCalendar onChange={(value) => {
  const date = value as Dayjs;
}} />

// Range mode
<EtCalendar dateRange onChange={(value) => {
  const { startDate, endDate } = value as DateRangeValue;
}} />
```

---

### `EtTimePicker`

A 12-hour stepper time picker that understands Ethiopian time (the day starts at 6 AM). Values are exchanged with the parent as **24-hour `"HH:mm"` strings**.

```ts
const EtTimePicker: (props: EtTimePickerProps) => JSX.Element;
```

#### Props (`EtTimePickerProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'10:00'` | Current value as a 24-hour `"HH:mm"` string. |
| `onChange` | `(time: string) => void` | — | Called with the selected 24-hour `"HH:mm"` string. |
| `minTime` | `string` | — | Minimum selectable time as a 24-hour `"HH:mm"` string. |
| `maxTime` | `string` | — | Maximum selectable time as a 24-hour `"HH:mm"` string. |
| `calendarType` | `boolean` | `true` | `true` for Ethiopian time (day starts 6 AM), `false` for standard (Gregorian) time. |
| `disabled` | `boolean` | `false` | Disable all interaction. |
| `error` | `boolean` | `false` | Render the picker in an error state. |

If the provided `value` falls outside the `minTime`/`maxTime` bounds, the picker renders no selection until a valid value is supplied.

---

## Functions

### `convertToEthiopian`

Convert a Gregorian date string to an Ethiopian date.

```ts
function convertToEthiopian(dateString: string): EthiopianDate;
```

- **Parameter** — `dateString`: a date in `"yyyy/mm/dd"` or `"yyyy-mm-dd"` format. Must contain exactly three components; month must be 1–12 and day 1–31, with a positive year.
- **Returns** — an [`EthiopianDate`](#ethiopiandate).
- **Throws** — an `Error` (`'Invalid date format. Please use "yyyy/mm/dd" or "yyyy-mm-dd"'`) when the input is not a string, has the wrong number of components, or is out of range.

```ts
convertToEthiopian('2024-09-11');
// {
//   year: 2017,
//   month: 1,
//   day: 1,
//   monthName: 'መስከረም',
//   monthNameEnglish: 'Meskerem',
// }
```

---

## Types

### `EtCalendarValue`

```ts
type EtCalendarValue = SingleDateInput | DateRangeValue;
```

The value accepted by `EtCalendar`: a single date input in single mode, or a `DateRangeValue` in range mode.

### `EtCalendarProps`

The props interface for `EtCalendar`. See the [EtCalendar props table](#props-etcalendarprops).

### `EtTimePickerProps`

The props interface for `EtTimePicker`. See the [EtTimePicker props table](#props-ettimepickerprops).

### `EthiopianDate`

The return shape of `convertToEthiopian`.

```ts
interface EthiopianDate {
  year: number;             // Ethiopian year
  month: number;            // 1-based Ethiopian month (1–13)
  day: number;              // day of month
  monthName: string;        // Amharic month name (e.g. "መስከረም")
  monthNameEnglish: string; // transliterated English name (e.g. "Meskerem")
}
```

### `DateRangeValue`

A selected date range. Both endpoints are normalized to the start of the day or `null` when unset. This is the payload `EtCalendar` emits (and accepts as `value`) in range mode.

```ts
interface DateRangeValue {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}
```

### `SingleDateInput`

Any value accepted for a single selected date. `null`/`undefined`/`''` clear the selection.

```ts
type SingleDateInput = Date | Dayjs | string | number | null | undefined;
```

### `SingleDateValue`

A single normalized calendar value, or `null` when nothing is selected.

```ts
type SingleDateValue = Dayjs | null;
```

### `Language`

Supported UI languages.

```ts
type Language = 'am' | 'en';
```

### `EthiopianTuple`

A `[year, month, day]` tuple as produced/consumed by the `ethiopian-date` package. Month is 1-based (1–13, where 13 is Pagume).

```ts
type EthiopianTuple = [year: number, month: number, day: number];
```

---

## Notes

- **`Dayjs`** values come from the `dayjs` dependency. Import its type with `import type { Dayjs } from 'dayjs';`.
- **Local timezone** — all "today" calculations use device-local time (`dayjs()`), so the Ethiopian "today" can be off by one near midnight for users far from UTC+3.
