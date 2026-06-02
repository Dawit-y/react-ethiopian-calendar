# Using react-ethiopian-calendar with TypeScript

This library is written in TypeScript and ships rolled-up declarations (`dist/index.d.ts`), so types work out of the box — no `@types/*` package needed.

## Importing types

All public types are exported from the package root and should be imported with `import type`:

```ts
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
```

`Dayjs` comes from the `dayjs` dependency:

```ts
import type { Dayjs } from 'dayjs';
```

## Typing `onChange`: single vs. range mode

`EtCalendar`'s `onChange` is typed as `(value: Dayjs | DateRangeValue) => void`. The runtime payload depends on the `dateRange` prop, so narrow the union accordingly.

### Single mode

In single mode (`dateRange` omitted or `false`), `onChange` receives a `Dayjs`:

```tsx
import { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import type { Dayjs } from 'dayjs';

function SingleExample() {
  const [date, setDate] = useState<Dayjs | null>(null);

  const handleChange = (value: Dayjs) => {
    setDate(value);
  };

  return (
    <EtCalendar
      value={date}
      onChange={(value) => handleChange(value as Dayjs)}
    />
  );
}
```

### Range mode

In range mode (`dateRange={true}`), `onChange` receives a `DateRangeValue`:

```tsx
import { useState } from 'react';
import { EtCalendar } from 'react-ethiopian-calendar';
import type { DateRangeValue } from 'react-ethiopian-calendar';

function RangeExample() {
  const [range, setRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  const handleChange = (value: DateRangeValue) => {
    setRange(value);
  };

  return (
    <EtCalendar
      dateRange
      value={range}
      onChange={(value) => handleChange(value as DateRangeValue)}
    />
  );
}
```

A small typed helper can centralize the narrowing:

```ts
import type { Dayjs } from 'dayjs';
import type { DateRangeValue } from 'react-ethiopian-calendar';

const isRange = (
  value: Dayjs | DateRangeValue,
): value is DateRangeValue =>
  typeof value === 'object' &&
  value !== null &&
  ('startDate' in value || 'endDate' in value);
```

## Typing `EtTimePicker`

`EtTimePicker` exchanges 24-hour `"HH:mm"` strings, so its handler is simply `(time: string) => void`:

```tsx
import { useState } from 'react';
import { EtTimePicker } from 'react-ethiopian-calendar';

function TimeExample() {
  const [time, setTime] = useState('10:00');

  return <EtTimePicker value={time} onChange={setTime} />;
}
```

## Typed Formik example

The example below uses a single date and a date range in one Formik form. Because Formik's `setFieldValue` is loosely typed, the calendar callbacks are narrowed at the call site.

```tsx
import { useFormik } from 'formik';
import { EtCalendar } from 'react-ethiopian-calendar';
import type { DateRangeValue } from 'react-ethiopian-calendar';
import type { Dayjs } from 'dayjs';

interface FormValues {
  appointment: Dayjs | null;
  stay: DateRangeValue;
}

function BookingForm() {
  const formik = useFormik<FormValues>({
    initialValues: {
      appointment: null,
      stay: { startDate: null, endDate: null },
    },
    onSubmit: (values) => {
      // values.appointment: Dayjs | null
      // values.stay: { startDate: Dayjs | null, endDate: Dayjs | null }
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Single date */}
      <EtCalendar
        name="appointment"
        label="Appointment"
        value={formik.values.appointment}
        onChange={(value) =>
          formik.setFieldValue('appointment', value as Dayjs)
        }
        onBlur={formik.handleBlur}
      />

      {/* Date range */}
      <EtCalendar
        dateRange
        name="stay"
        label="Stay"
        value={formik.values.stay}
        onChange={(value) =>
          formik.setFieldValue('stay', value as DateRangeValue)
        }
        onBlur={formik.handleBlur}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## `convertToEthiopian` typing

```ts
import { convertToEthiopian } from 'react-ethiopian-calendar';
import type { EthiopianDate } from 'react-ethiopian-calendar';

const result: EthiopianDate = convertToEthiopian('2024-09-11');
// result.year, result.month, result.day, result.monthName, result.monthNameEnglish
```

It throws on invalid or out-of-range input, so wrap it in a `try`/`catch` when the input is untrusted.

## See also

- [`API.md`](./API.md) — the complete API reference for every export.
- [`../README.md`](../README.md) — installation, quick start, and props overview.
