# Contributing to react-ethiopian-calendar

Thanks for your interest in improving **react-ethiopian-calendar** — a TypeScript
React component library for Ethiopian + Gregorian calendar date and time
selection. Contributions of all kinds are welcome: bug reports, bug fixes,
documentation, tests, and new features.

This document describes how to set up the project, the quality gates your change
must pass, and the conventions we follow.

---

## Prerequisites

- **Node.js** 18 or newer (the same LTS line we build against).
- **npm** (the repo is set up around npm scripts; a lockfile is committed).

## Getting started

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/react-ethiopian-calendar.git
cd react-ethiopian-calendar

# 2. Install dependencies
npm install

# 3. Start the dev playground / build watcher
npm run dev
```

### Useful npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run the local Vite dev server / playground. |
| `npm run build` | Build the library (ESM `dist/index.js`, CJS `dist/index.cjs`, types `dist/index.d.ts`, and `dist/index.css`). |
| `npm run typecheck` | Run `tsc --noEmit` against the strict TS config. |
| `npm run lint` | Run ESLint (typescript-eslint flat config). |
| `npm run test` | Run the Vitest + @testing-library/react suite (jsdom). |
| `npm run test:coverage` | Run the test suite with coverage reporting. |
| `npm run storybook` | Launch Storybook to develop and preview components in isolation. |

---

## Branching

Please do not commit directly to `main`. Create a topic branch off the latest
`main`:

```bash
git checkout main
git pull
git checkout -b fix/short-description      # or feat/…, docs/…, chore/…
```

Use a short, descriptive prefix:

- `feat/` — a new feature or prop.
- `fix/` — a bug fix.
- `docs/` — documentation only.
- `test/` — tests only.
- `refactor/` / `chore/` — internal changes with no consumer-visible behavior.

---

## Quality gates (run these before opening a PR)

Every pull request must pass **all four** of the following locally. CI runs the
same checks, and a PR will not be merged until they are green:

```bash
npm run typecheck   # strict TypeScript, no errors
npm run lint        # ESLint clean, no warnings
npm run test        # all Vitest tests pass
npm run build       # the library builds successfully
```

If you touched runtime behavior, also sanity-check coverage with
`npm run test:coverage`. We currently sit around ~95% statements/lines and
should not regress meaningfully.

---

## Coding conventions

This project is **strict TypeScript** and we keep it that way.

- The TS config enables `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`,
  and `noUncheckedIndexedAccess`. Write code that satisfies all of them.
- **No `any`.** Do not use the `any` type, and do not silence the type checker
  with `// @ts-ignore` / `// @ts-expect-error` to paper over real type problems.
  If a type is genuinely hard to express, prefer `unknown` plus narrowing, a
  precise generic, or a discriminated union — and explain it in the PR.
- Index access returns `T | undefined` (`noUncheckedIndexedAccess`); handle the
  `undefined` case explicitly rather than asserting it away.
- Keep the **public API stable**. The exported component/function names and
  their props (`EtCalendar`, `EtTimePicker`, `convertToEthiopian`, and the
  exported types) are a contract. Additive, backward-compatible changes are
  welcome; breaking changes need discussion first (open an issue).
- Match the surrounding code style; ESLint and the formatter settle the rest.
- Prefer the shared utilities (e.g. `src/utils/dateRange.ts`) over
  re-implementing date comparison/range logic.
- Be mindful of date/time correctness. "Today" and conversions use device-local
  time (`dayjs()`); keep that behavior consistent and document any edge cases.

### Tests are required for bug fixes

If you fix a bug, **add a regression test that fails before your fix and passes
after it.** This mirrors how the recent migration handled every confirmed bug.
New features should ship with tests covering the happy path and the obvious edge
cases (Ethiopian vs. Gregorian, Amharic vs. English, single vs. range mode,
leap-year / Pagume handling, min/max bounds, disabled states, etc.).

Tests live alongside the source and run under Vitest with
`@testing-library/react` in a jsdom environment. Prefer user-facing assertions
(roles, text, interactions) over testing implementation details.

---

## Storybook and examples

We use **Storybook** to develop components in isolation and to document props
and states:

```bash
npm run storybook
```

When you add or change a component or a notable prop, please add or update the
relevant story so reviewers and consumers can see the behavior.

---

## Commit and pull request guidance

### Commits

- Write clear, imperative commit messages: `fix: clamp Pagume day on year change`.
- We follow a Conventional-Commits-style prefix (`feat:`, `fix:`, `docs:`,
  `test:`, `refactor:`, `chore:`). This keeps history readable and helps with
  changelogs.
- Keep commits focused; avoid bundling unrelated changes.

### Pull requests

Before opening a PR:

1. Rebase on the latest `main`.
2. Make sure all four quality gates pass (`typecheck`, `lint`, `test`, `build`).
3. Update docs/README and Storybook if behavior or the public API changed.

In the PR description, please include:

- **What** changed and **why**.
- For bug fixes: how to reproduce the original bug, and a note on the regression
  test you added.
- Any consumer-visible impact (props, types, CSS import path, build output).
- Linked issue, if applicable.

A maintainer will review your PR. Please be responsive to feedback — small,
iterative changes are easiest to review and merge.

---

## Reporting bugs and requesting features

Open a GitHub issue with:

- A minimal reproduction (a CodeSandbox/StackBlitz or a short snippet is ideal).
- The library version, React version, browser, and `lang`/`calendarType`/
  `dateRange` settings in use.
- Expected vs. actual behavior.

---

## License

By contributing, you agree that your contributions will be licensed under the
project's **MIT License**.
