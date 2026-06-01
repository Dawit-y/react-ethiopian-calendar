# Roadmap

This document outlines the planned direction for `react-ethiopian-calendar`.
Items are aspirational and may change; ordering does not imply a strict
schedule. Feedback and contributions are welcome.

## Near term

### Timezone-aware "today"

Today, all "today"/date conversions use device-local time (`dayjs()`), so the
computed Ethiopian "today" can be off by one near midnight for users far from
UTC+3. We plan to add an opt-in timezone option (e.g. a `timezone` prop and/or
a configurable "now" source) so consumers can pin the reference time —
defaulting to Africa/Addis_Ababa where appropriate — and resolve the
off-by-one boundary case deterministically.

### Accessibility / ARIA improvements

- Apply a proper `role="grid"` / `gridcell` structure to the month grids.
- Add `aria-selected`, `aria-disabled`, and live-region announcements for the
  active month/year and selected date(s).
- Audit color contrast (including the customizable `primaryColor`) and focus
  visibility against WCAG AA.

### Keyboard navigation in the grid

Full arrow-key navigation within the day grid (left/right/up/down by day and
week), `Home`/`End` for week boundaries, `PageUp`/`PageDown` for month/year
stepping, and `Enter`/`Space` to select — including correct behavior across the
13-month Ethiopian calendar and range selection.

### More locales

Expand beyond Amharic and English. Establish a locale/translation structure for
month names, day names, and UI strings so additional languages (and regional
spellings) can be contributed without code changes.

## Medium term

### Right-to-left (RTL) support

First-class RTL layout for the calendar and inputs, driven by `dir`/locale,
ensuring grid order, navigation arrows, and range highlighting mirror
correctly.

### Headless / unstyled mode

Expose the calendar logic (date math, range state, navigation, validation) via
hooks and/or unstyled primitives so consumers can fully own the markup and
styling, decoupled from the bundled CSS.

### SSR verification

Verify and document server-side rendering behavior (Next.js App Router and
others): no hydration mismatches, stable initial render, and a clear story for
the device-local "today" issue during SSR.

## Long term

### Stable v2

A v2 release that hardens the public API, including a discriminated-union value
typing so `value`/`onChange` are precisely typed by mode (single vs. range)
rather than relying on a broad union. This will be a deliberate, documented
breaking change with a migration guide.
