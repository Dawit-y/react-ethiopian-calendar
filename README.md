# React Ethiopian Calendar

<!-- Badges placeholder — add npm version, build, license, and coverage badges here. -->
<!-- e.g. [![npm version](https://img.shields.io/npm/v/react-ethiopian-calendar.svg)](https://www.npmjs.com/package/react-ethiopian-calendar) -->

A fully typed React component library for **Ethiopian** (and **Gregorian**) calendar date and time selection: single-date and date-range pickers, Amharic/English/Afaan&nbsp;Oromoo support, and custom theming. Written in TypeScript and shipped with ESM, CJS, and bundled type declarations.

## Features

- **Single Date Picker** — select individual dates in the Ethiopian or Gregorian calendar.
- **Date Range Picker** — select a start/end range with visual highlighting.
- **Dual Calendar Support** — switch between Ethiopian (ET) and Gregorian (GC) calendars with a single boolean prop.
- **Ethiopian Time Picker** — a 12-hour stepper that understands Ethiopian time (the day starts at 6 AM).
- **Language Support** — Amharic (`"am"`), English (`"en"`), and Afaan Oromoo (`"or"`).
- **Custom Primary Color** — theme the entire calendar via the `primaryColor` prop using a scoped CSS variable.
- **Controlled Components** — full control over `value` and `onChange`.
- **Form Integration** — works with form libraries such as Formik.
- **First-class TypeScript** — strict types and exported interfaces for every public API.
- **React 18 & 19** — supports React `>=18.2`, including React 19.

## Installation

```bash
npm install react-ethiopian-calendar
```

The runtime dependencies (`dayjs`, `ethiopian-date`, `react-element-popper`, `react-icons`) are installed automatically and kept external/tree-shakeable. `react` and `react-dom` are peer dependencies.

### Import the stylesheet

You must import the bundled stylesheet once in your app:

```js
import 'react-ethiopian-calendar/style.css';
```

> The stylesheet is also available at `'react-ethiopian-calendar/dist/index.css'`. Older docs referenced `'react-ethiopian-calendar/src/style/index.css'` — that path does **not** exist in the published package; use `'react-ethiopian-calendar/style.css'`.

## Quick Start

### Single Date Picker (Ethiopian)

```tsx
import { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/style.css';
import type { Dayjs } from 'dayjs';

function Example() {
  const [date, setDate] = useState<Dayjs | null>(null);

  return (
    <EtCalendar
      value={date}
      onChange={(value) => setDate(value as Dayjs)}
      calendarType={true} // true = Ethiopian, false = Gregorian
      lang="am"           // "am" = Amharic, "en" = English (default), "or" = Afaan Oromoo
    />
  );
}
```

In single mode, `onChange` receives a `Dayjs` instance.

### Date Range Picker

```tsx
import { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import type { DateRangeValue } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/style.css';

function Example() {
  const [range, setRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  return (
    <EtCalendar
      value={range}
      onChange={(value) => setRange(value as DateRangeValue)}
      dateRange={true}
      calendarType={true}
      lang="am"
    />
  );
}
```

In range mode, `onChange` receives a `{ startDate, endDate }` object where each endpoint is `Dayjs | null`.

### Gregorian Calendar

Set `calendarType={false}` to render the Gregorian month grid. Everything else (single, range, theming, language) works the same way.

```tsx
<EtCalendar
  value={date}
  onChange={(value) => setDate(value as Dayjs)}
  calendarType={false}
  lang="en"
/>
```

## Date Range Behavior

When `dateRange={true}`:

1. **First click** sets the start date.
2. **Second click** sets the end date.
3. Start and end dates are highlighted; dates in between are shaded.
4. Selecting an earlier end date than the start automatically swaps them.
5. Clicking again after a complete range starts a new selection.

## EtTimePicker

`EtTimePicker` is a 12-hour stepper time picker that understands Ethiopian time (where the day starts at 6 AM). Values are exchanged with the parent as **24-hour `"HH:mm"` strings**.

```tsx
import { useState } from 'react';
import { EtTimePicker } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/style.css';

function Example() {
  const [time, setTime] = useState('10:00'); // 24-hour "HH:mm"

  return (
    <EtTimePicker
      value={time}
      onChange={setTime}
      calendarType={true} // true = Ethiopian time, false = standard time
    />
  );
}
```

With min/max bounds:

```tsx
<EtTimePicker
  value={time}
  onChange={setTime}
  minTime="08:00"
  maxTime="17:00"
/>
```

## TypeScript Usage

All public types are exported from the package root. See [`docs/TYPESCRIPT.md`](./docs/TYPESCRIPT.md) for a full guide.

```tsx
import { EtCalendar, EtTimePicker, convertToEthiopian } from 'react-ethiopian-calendar';
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
import type { Dayjs } from 'dayjs';

// Single mode: onChange receives a Dayjs.
const handleSingle = (value: Dayjs | DateRangeValue) => {
  const date = value as Dayjs;
};

// Range mode: onChange receives { startDate, endDate }.
const handleRange = (value: Dayjs | DateRangeValue) => {
  const { startDate, endDate } = value as DateRangeValue;
};
```

## EtCalendar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `EtCalendarValue \| null` | — | Selected value. Single mode: `Date \| Dayjs \| string \| number \| null`. Range mode: `{ startDate, endDate }`. |
| `onChange` | `(value: Dayjs \| DateRangeValue \| null) => void` | — | Called on selection change. Receives a `Dayjs` in single mode, or `{ startDate, endDate }` in range mode; `null` / empty range when cleared. |
| `calendarType` | `boolean` | `true` | `true` for Ethiopian, `false` for Gregorian. |
| `minDate` | `SingleDateInput` | — | Minimum selectable date. |
| `maxDate` | `SingleDateInput` | — | Maximum selectable date. |
| `name` | `string` | — | Name forwarded to the form field. |
| `disabled` | `boolean` | `false` | Disable the component. |
| `disableFuture` | `boolean` | `false` | Prevent selecting dates after today. |
| `fullWidth` | `boolean` | — | Stretch the component to its container width. |
| `borderRadius` | `string` | — | Custom border radius for the input. |
| `placeholder` | `boolean \| string` | `false` | Placeholder text, or `false` to omit. |
| `lang` | `Language` (`'am' \| 'en' \| 'or'`) | `'en'` | UI language (Amharic / English / Afaan Oromoo). |
| `label` | `string` | — | Accessible label. |
| `inputStyle` | `React.CSSProperties` | — | Inline styles applied to the input. |
| `style` | `React.CSSProperties` | — | Inline styles applied to the wrapper. |
| `onBlur` | `(event: React.FocusEvent<HTMLDivElement>) => void` | — | Blur handler forwarded to the input. |
| `dateRange` | `boolean` | `false` | Enable date-range selection mode. |
| `primaryColor` | `string` | `'#0253a5'` | Accent color (any valid CSS color). |
| `allowClear` | `boolean` | `true` | Show a clear (×) button that resets the value to `null`. |
| `allowCalendarSwap` | `boolean` | `false` | Show a header button to switch between the Ethiopian and Gregorian views. The committed value is unchanged — only the display calendar swaps. |

`EtCalendar` is a `forwardRef` component; the ref is forwarded to the wrapper `HTMLDivElement`.

## EtTimePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'10:00'` | Current value as a 24-hour `"HH:mm"` string. |
| `onChange` | `(time: string) => void` | — | Called with the selected 24-hour `"HH:mm"` string. |
| `minTime` | `string` | — | Minimum selectable time as a 24-hour `"HH:mm"` string. |
| `maxTime` | `string` | — | Maximum selectable time as a 24-hour `"HH:mm"` string. |
| `calendarType` | `boolean` | `true` | `true` for Ethiopian time (day starts 6 AM), `false` for standard time. |
| `disabled` | `boolean` | `false` | Disable all interaction. |
| `error` | `boolean` | `false` | Render in an error state. |

## convertToEthiopian

Convert a Gregorian date string to an Ethiopian date.

```ts
import { convertToEthiopian } from 'react-ethiopian-calendar';

const result = convertToEthiopian('2024-09-11');
// {
//   year: 2017,
//   month: 1,
//   day: 1,
//   monthName: 'መስከረም',
//   monthNameEnglish: 'Meskerem',
// }
```

- **Input:** a date string in `"yyyy/mm/dd"` or `"yyyy-mm-dd"` format (exactly three components).
- **Returns:** `EthiopianDate` — `{ year, month, day, monthName, monthNameEnglish }`.
- **Throws:** an `Error` if the string is not a valid, in-range Gregorian date. Month must be 1–12 and day 1–31.

## Theming / Custom Primary Color

Pass any CSS color string to `primaryColor` to replace the default blue (`#0253a5`) across the calendar UI — header, selected-date highlight, and range shading.

```tsx
{/* Warm orange theme */}
<EtCalendar value={date} onChange={(v) => setDate(v as Dayjs)} primaryColor="#e85d04" />

{/* Forest green theme */}
<EtCalendar value={date} onChange={(v) => setDate(v as Dayjs)} primaryColor="#2d6a4f" />
```

The color is applied via a scoped CSS custom property (`--et-primary-color`), so multiple calendars on the same page can each have a different color without global CSS conflicts.

## Custom Styling

The component ships default styles that you can override via CSS. Key classes:

- `.dateInRange` — dates within the selected range
- `.rangeStart` — start date of the range
- `.rangeEnd` — end date of the range
- `.selectedDate` — selected single date
- `.currentMonth` — dates in the current month
- `.grayText` — disabled or out-of-range dates

```css
.dateInRange {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.rangeStart,
.rangeEnd {
  background-color: #ff0000;
  color: white;
}
```

## Known Limitation: Local Timezone

All "today" calculations and conversions use the device-local time (`dayjs()`). For users far from UTC+3 (Ethiopian time), the computed Ethiopian "today" can be off by one day near midnight. This is a known limitation and applies to date highlighting and `disableFuture` boundaries.

## Development

```bash
npm run dev            # start the Vite dev server
npm run build          # build the library (ESM + CJS + types + CSS)
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # run the Vitest suite once
npm run test:watch     # run Vitest in watch mode
npm run test:coverage  # run tests with coverage
npm run storybook      # start Storybook
```

The build emits ESM (`dist/index.js`), CJS (`dist/index.cjs`), rolled-up types (`dist/index.d.ts`), and `dist/index.css`, all with source maps.

## Contributing

Contributions are welcome! Please run `npm run lint`, `npm run typecheck`, and `npm run test` before opening a Pull Request. See [`docs/API.md`](./docs/API.md) for the full API reference and [`docs/TYPESCRIPT.md`](./docs/TYPESCRIPT.md) for TypeScript guidance.

## License

MIT © Dawit Yimer
