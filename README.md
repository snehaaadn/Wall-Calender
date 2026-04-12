# Wall Calendar

Take-home calendar UI: React, Vite, Tailwind. Dark glass layout with a per-month hero, range selection on the grid, and notes saved in the browser (`localStorage`).

## Live Demo

https://wall-calender-tau.vercel.app/

## Setup

```bash
npm install
npm run dev
```

Use the URL Vite prints (often `http://localhost:5173`).

```bash
npm run build
npm run preview
```

`preview` serves the production build from `dist/`.

## Behavior

- Pick a start date, then an end date; a third click starts a new range. Single-day span uses a `1` badge. **Today** on the grid jumps to the current month; **T** / **Esc** do the same / clear the range when focus is not in a text field.
- Notes: month memo, day note, range note. Save writes to `localStorage`. **Copy dates** puts the current selection (single day or range) on the clipboard. **Stored** lists every range and day note that touches the open month (not only the current selection), plus month memo. Each block has **Delete**.
- Holidays use a fixed 2026 list in `src/utils/calendar.js`. Those days get an amber border on the grid; a small “Holiday” strip appears under the month when that month has entries.
- Changing months runs a short panel animation on the calendar (`MonthFlipPanel`, styles in `src/index.css`).
- Hero art swaps by month; a light color wash follows the month (`src/data/monthAccents.js`).

## Stack

- React 19, Vite 8, Tailwind 4 (`@tailwindcss/vite`)
- Fonts loaded in `index.html` (Outfit + JetBrains Mono)

## Ship

`npm run build` then deploy `dist/` to any static host.
