# Stock Intraday Dashboard

A full-stack app that takes a stock symbol, pulls the last month of 15-minute
intraday data from Yahoo Finance, aggregates it by trading day, and displays
it as a chart and table.

## Tech Stack

- **Backend:** Node.js, TypeScript, Express 5
- **Frontend:** React 19, TypeScript, Vite 6, Recharts
- **Testing:** Node's built-in test runner (`node:test`)

## Project Structure

```
stock-intraday-dashboard/
├── backend/
│   └── src/
│       ├── index.ts                   # Express app entry point
│       ├── routes/dailySummary.ts     # GET /api/stocks/:symbol/daily-summary
│       ├── yahooFinance.ts            # Yahoo Finance API client
│       ├── aggregation.ts             # day-grouping & averaging logic
│       ├── aggregation.test.ts
│       ├── errors.ts                  # error classes + error-handling middleware
│       └── types/                     # Yahoo response + output DTO types
└── frontend/
    └── src/
        ├── App.tsx
        ├── components/                # SymbolForm, DailySummaryChart, DailySummaryTable
        ├── api/stockApi.ts
        ├── format.ts                  # price/volume/year display formatting
        └── types.ts
```

## Setup & Run
Requires Node.js 20+ (tested on 20.15.0).

### Backend

```
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000` by default.

### Frontend

```
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default. Open it in a browser, enter a symbol (e.g. `TSLA`), and submit.

## Environment Variables

**Backend** (optional — these are the defaults if unset):
```
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:4000
```

## API

```
GET /api/stocks/:symbol/daily-summary
```

Example: `GET /api/stocks/TSLA/daily-summary`

```json
[
  { "day": "2026-09-08", "lowAverage": 364.7665, "highAverage": 366.9835, "volume": 46169064 }
]
```

Errors return `{ "error": { "message": "..." } }` with:
- `400` — malformed symbol (empty, too long, invalid characters)
- `404` — well-formed symbol that doesn't exist
- `502` — Yahoo Finance request failed

## Tests & Builds

**Backend**
```
npm test          # runs the aggregation test suite
npm run build     # compiles to dist/
```

**Frontend**
```
npx tsc -p tsconfig.app.json --noEmit   # typecheck
npm run build                            # production build to dist/
```

## Key Design Decisions

- **Timezone handling:** days are grouped by the exchange's local calendar date (derived from Yahoo's `exchangeTimezoneName` via `Intl.DateTimeFormat`), not a fixed UTC offset — this keeps grouping correct across daylight saving transitions that fall within the requested month.
- **Null handling:** Yahoo sometimes returns `null` for a bar's low/high/volume. Low/high averages exclude nulls rather than treating them as zero; volume treats a null as zero when summing. A day with no valid low or high values at all is dropped from the output rather than returned with a misleading value.
- **Precision:** the backend rounds `lowAverage`/`highAverage` to 4 decimal places as numbers. Since JSON numbers don't preserve trailing zeros (`101` instead of `101.0000`), the frontend reformats them to exactly 4 decimal places for display.
