# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-01

This release is a full migration of the library from JavaScript/JSX to
TypeScript, shipping first-class type declarations, a corrected package
entry/exports map, and a batch of confirmed bug fixes — all covered by a new
test suite.

### Breaking / Behavioral notes

- **BREAKING (CSS import path):** The stylesheet must now be imported from the
  exported path `react-ethiopian-calendar/style.css` (also available at
  `react-ethiopian-calendar/dist/index.css`). The path previously documented in
  the README, `react-ethiopian-calendar/src/style/index.css`, never existed in
  the published package and no longer applies. Consumers relying on the old
  path must update their import.
- **BREAKING (UMD dropped):** The standalone UMD bundle has been removed in
  favor of ESM (`dist/index.js`) + CJS (`dist/index.cjs`). npm/bundler
  consumption is unaffected; only consumers loading a UMD global directly via a
  `<script>` tag are impacted.

### Added

- TypeScript source throughout (`.ts`/`.tsx`) compiled under `strict`,
  `noImplicitAny`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`.
- Shipped type declarations: a rolled-up `dist/index.d.ts` entry. Exported
  types: `EtCalendarProps`, `EtCalendarValue`, `EtTimePickerProps`,
  `EthiopianDate`, `DateRangeValue`, `SingleDateInput`, `SingleDateValue`,
  `Language`, `EthiopianTuple`.
- Working CJS entry (`dist/index.cjs`) and a proper package `exports` map
  alongside the ESM build; source maps for both.
- New test suite: 111 tests (Vitest + @testing-library/react, jsdom) with
  ~95% statements/lines, ~92% functions, and ~82% branches coverage.
- `primaryColor` styling support (default `#0253a5`).
- **Afaan Oromoo** language support via `lang="or"` (localized Ethiopian month
  names, weekday headers, and the "Today" label).
- **Clear button** (`allowClear`, default `true`): a × control at the right of
  the input that resets the value. `onChange` now also fires with `null`
  (single mode) or `{ startDate: null, endDate: null }` (range mode) on clear —
  its type widened to `(value: Dayjs | DateRangeValue | null) => void`.
- **Calendar swap** (`allowCalendarSwap`, default `false`): an opt-in header
  button (with a swap icon and target-calendar label) that switches the view
  between Ethiopian and Gregorian in both directions. It is display-only — the
  committed value is unchanged. Previously a Gregorian-only, always-on, unlabeled
  toggle existed; it is now opt-in, bidirectional, and clearly iconified.

### Changed

- Build now uses Vite library mode emitting ESM + CJS + types + `dist/index.css`
  with source maps.
- De-duplicated date-range logic (`isDateInRange`/`getRangePosition`) into a
  shared `src/utils/dateRange.ts`.
- Extracted a shared `YearGrid` component and a shared time utility.
- React performance improvements: memoized `currentDate`/`minDateIn`/`maxDateIn`
  and the 42-cell month grids via `useMemo`, hoisted constant arrays.
- Renamed the misspelled `TImePicker` directory to `TimePicker`.

### Removed

- Dead code: `NewInput.jsx`/`CustomDatePicker`, `etLabel`, `etDaysEnglish`,
  `englishDays`, the exported `etDays`, an unused `toGregorian` import, and the
  `prop-types` dependency.

### Fixed

- **[CRITICAL]** `GcPicker` used dayjs `isSameOrAfter`/`isSameOrBefore` without
  registering the required plugins, throwing a `TypeError` in Gregorian
  date-range mode. Fixed via the shared dateRange util using
  `isSame`/`isAfter`/`isBefore`.
- **[HIGH]** The Gregorian month-grid prefix used `.date(i)` from `i = 0`,
  producing wrong/duplicated leading days. Fixed by computing trailing
  previous-month days via `subtract()`.
- **[HIGH]** The segmented date `Input` received a no-op `setDate` and read
  stale state immediately after `setState`, breaking keyboard date entry.
  Fixed by giving `Input` real local segment state synced from props and
  converting from fresh values.
- **[MEDIUM]** `EtTimePicker`'s default `value` of `'10:00'` violated its
  default `minTime` of `'11:00'`, rendering empty. Fixed by removing the bogus
  default `minTime`.
- **[MEDIUM]** `EtPicker` year selection and year navigation carried the
  day/month over blindly, which could form an invalid Pagume 6 in a non-leap
  year. Fixed by clamping the day to the target month length.
- **[LOW]** The `Input` Pagume leap-year guard used an always-true comparison
  (`+date.year !== ""`) that blocked a valid leap-year Pagume. Fixed.
- **[LOW]** `convertToEthiopian` performed no range validation and silently
  dropped extra tokens. It now validates month 1-12, day 1-31, and requires
  exactly 3 components, throwing on invalid/out-of-range input.
- **[LOW]** `TimeInput.get12HourFormat` could return `undefined` for
  out-of-range hours, causing a destructure crash. Added a fallback return.

### Known limitations

- All "today"/conversions use device-local time (`dayjs()`), so the computed
  Ethiopian "today" can be off by one near midnight for users far from UTC+3.
  This is documented as a known limitation; a timezone-aware option is planned
  (see ROADMAP).

## [1.0.18]

- Prior published release (JavaScript). Baseline before the TypeScript
  migration.
