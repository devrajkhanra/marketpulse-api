<p align="center">
  <h1 align="center">📈 MarketPulse API</h1>
  <p align="center">
    <strong>NSE market data fetcher and analyzer — built with NestJS</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/NestJS-11.x-ea2845?logo=nestjs" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/License-UNLICENSED-lightgrey" alt="License" />
  </p>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Storage](#data-storage)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

MarketPulse is a backend API that **automates downloading, storing, and analyzing daily market data** from the National Stock Exchange of India (NSE). It provides endpoints for sector performance ranking, volume analysis, and Nifty 50 top gainer/loser identification — all derived from raw CSV data published by the NSE.

**Who is this for?** Developers building financial dashboards, quantitative analysts needing programmatic NSE data access, and trading platform integrators.

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                 Client Applications                   │
│            (Web · Mobile · Scripts · cURL)             │
└─────────────────────┬─────────────────────────────────┘
                      │  HTTP REST
┌─────────────────────▼─────────────────────────────────┐
│              NestJS Application (port 3000)            │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Middleware: CORS · ValidationPipe               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Date   │ │   NSE    │ │ Sectors  │ │  Stocks  │ │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │ │
│  │          │ │          │ │          │ │┌────────┐│ │
│  │ • Ctrl   │ │ • Ctrl   │ │ • Ctrl   │ ││Perf.  ││ │
│  │ • Svc    │ │ • Svc    │ │ • Svc    │ ││Volume ││ │
│  └──────────┘ └────┬─────┘ └────┬─────┘ │└────────┘│ │
│                    │            │        └────┬─────┘ │
└────────────────────┼────────────┼─────────────┼───────┘
                     │            │             │
              ┌──────▼────────────▼─────────────▼──────┐
              │       File System (.data/NSE-Data/)     │
              │  stocks/  ·  indices/  ·  ma/  ·  broad/│
              └──────────────────┬──────────────────────┘
                                 │  Axios HTTP
              ┌──────────────────▼──────────────────────┐
              │        NSE Archives (External)          │
              │   archives.nseindia.com                 │
              └─────────────────────────────────────────┘
```

Each module follows the **Controller → Service** pattern. The `StocksModule` aggregates two sub-modules (`PerformanceModule`, `VolumeModule`), each with their own controller and service.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | NestJS | 11.1.7 |
| Language | TypeScript | 5.5.4 |
| Runtime | Node.js | 18+ |
| HTTP Client | Axios | 1.7.2 |
| CSV Parsing | csv-parser | 3.0.0 |
| Validation | class-validator / class-transformer | 0.14.1 / 0.5.1 |
| ORM (available) | TypeORM + pg | 0.3.20 / 8.12.0 |
| Container | Docker | Alpine |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- Network access to `archives.nseindia.com`
- ~500 MB disk for cached CSV data
- Docker *(optional)*

### Install & Run

```bash
# Clone
git clone <repository-url>
cd marketpulse-api

# Install dependencies
npm install

# Development (hot reload)
npm run start:dev          # → http://localhost:3000

# Production
npm run build
npm run start:prod
```

### Docker

```bash
docker build -t marketpulse-api .
docker run -d -p 3000:3000 --name marketpulse marketpulse-api
```

### Verify

```bash
curl http://localhost:3000
# → "Hello World!"
```

---

## API Reference

> **Base URL:** `http://localhost:3000`
>
> All requests should include `Content-Type: application/json` for POST endpoints.

### 1. Root

#### `GET /`

Health check endpoint.

**Response:** `"Hello World!"`

---

### 2. Date Module

#### `GET /date`

Returns the server's current date.

**Response:**
```json
"2026-02-21"
```

#### `GET /date/details`

Returns date with day-of-week information.

**Response:**
```json
{
  "date": "2026-02-21",
  "dayOfWeek": "Saturday"
}
```

---

### 3. NSE Module

#### `POST /nse/download`

Downloads daily CSV files (stocks bhavdata, indices, market activity) from NSE archives for the specified dates. Also downloads the Nifty 50 constituent list. Uses concurrency (5 workers) for parallel downloads.

**Request Body:**
```json
{
  "dates": ["21022026", "20022026"]
}
```

> Dates must be in `ddmmyyyy` format (validated via `class-validator`).

**Response:** Array of saved file paths.
```json
[
  ".data/NSE-Data/stocks/21022026.csv",
  ".data/NSE-Data/indices/21022026.csv",
  ".data/NSE-Data/ma/21022026.csv",
  ".data/NSE-Data/broad/nifty50list.csv"
]
```

**Notes:**
- NSE publishes data after **6:00 PM IST** on trading days
- Weekends and holidays can be requested — if data is available on NSE, it will be downloaded; otherwise the date is silently skipped (no error thrown)
- Files are stored locally; re-downloading the same date overwrites the cached file

#### `GET /nse/last-date`

Returns the last successfully downloaded date (persisted in `last-success.json`).

**Response:**
```json
"21022026"
```
Returns `null` if no data has been downloaded yet.

---

### 4. Sectors Module

#### `GET /sectors/performance/:date`

Returns top 5 gaining and top 5 losing sectors for a trading day, ranked by `Change(%)` from the indices CSV.

**Path Params:** `date` — in `ddmmyyyy` format

**Example:** `GET /sectors/performance/21022026`

**Response:**
```json
{
  "topGainers": [
    { "sector": "Nifty IT", "percentageChange": 2.87 },
    { "sector": "Nifty Auto", "percentageChange": 2.15 }
  ],
  "topLosers": [
    { "sector": "Nifty Metal", "percentageChange": -2.78 },
    { "sector": "Nifty PSU Bank", "percentageChange": -1.34 }
  ]
}
```

**Covered Sectors:** Nifty Auto, Bank, Financial Services, FMCG, Healthcare, IT, Media, Metal, Pharma, Private Bank, PSU Bank, Realty, Consumer Durables, Oil and Gas, Chemicals, and more (20 total).

#### `GET /sectors/volume-ratio/:currentDate/:previousDate`

Compares trading volume between two sessions. Returns top 5 highest and lowest volume ratios. Filters out sectors with volume below 1,000.

**Path Params:** `currentDate`, `previousDate` — both in `ddmmyyyy` format

**Example:** `GET /sectors/volume-ratio/21022026/20022026`

**Response:**
```json
{
  "topVolumeGainers": [
    { "sector": "Nifty Metal", "volumeRatio": 2.47 },
    { "sector": "Nifty IT", "volumeRatio": 2.15 }
  ],
  "topVolumeLosers": [
    { "sector": "Nifty Bank", "volumeRatio": 0.42 },
    { "sector": "Nifty Energy", "volumeRatio": 0.51 }
  ]
}
```

> **Formula:** `volumeRatio = currentVolume / previousVolume` (rounded to 2 decimals)

---

### 5. Stocks Module

#### `GET /performance/top-gainers-losers`

Returns top 5 Nifty 50 gainers and losers. Parses the Market Activity CSV which contains pre-calculated NSE data.

**Query Params:** `date` *(optional)* — in `ddmmyyyy` format. Defaults to the latest available file.

**Example:** `GET /performance/top-gainers-losers?date=21022026`

**Response:**
```json
{
  "topGainers": [
    { "symbol": "INFY", "percentage": 3.42 },
    { "symbol": "TCS", "percentage": 2.91 }
  ],
  "topLosers": [
    { "symbol": "TATASTEEL", "percentage": -2.67 },
    { "symbol": "HINDALCO", "percentage": -1.89 }
  ]
}
```

#### `POST /volume/differences`

Calculates volume ratio for each Nifty 50 stock between two dates. Only includes stocks present in the `nifty50list.csv` and with `EQ` series.

**Request Body:**
```json
{
  "dates": ["20022026", "21022026"]
}
```

> Array must contain exactly 2 dates: `[previousDate, currentDate]`.

**Response:**
```json
[
  { "symbol": "ADANIENT", "difference": "1.45" },
  { "symbol": "HDFCBANK", "difference": "0.87" },
  { "symbol": "INFY", "difference": "2.13" }
]
```

> **Formula:** `difference = latestVolume / previousVolume` (2 decimal places, as string). Alphabetically sorted by symbol.

---

## Data Storage

All downloaded CSVs are stored locally under `.data/NSE-Data/`:

```
.data/
└── NSE-Data/
    ├── stocks/       # Daily bhavdata (all NSE-listed securities)
    ├── indices/      # Daily index closing data (50+ indices)
    ├── ma/           # Market activity reports (Nifty 50 gainers/losers)
    └── broad/        # Nifty 50 constituent list (nifty50list.csv)
```

The `last-success.json` file in the project root tracks the most recently downloaded date.

> **Note:** `.data/` and `last-success.json` are git-ignored.

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap, CORS config
├── app.module.ts                    # Root module
├── app.controller.ts                # GET / health check
├── app.service.ts                   # Hello World service
│
├── date/
│   ├── date.module.ts
│   ├── date.controller.ts           # GET /date, GET /date/details
│   ├── date.service.ts
│   └── dto/
│       └── date.dto.ts              # { date, dayOfWeek }
│
├── nse/
│   ├── nse.module.ts
│   ├── nse.controller.ts            # POST /nse/download, GET /nse/last-date
│   ├── nse.service.ts               # Download logic, 5-worker concurrency
│   ├── dto/
│   │   └── date-array.dto.ts        # Validated date[] input
│   └── utils/
│       └── date-store.ts            # last-success.json read/write
│
├── sectors/
│   ├── sectors.module.ts
│   ├── sectors.controller.ts        # GET /sectors/performance, GET /sectors/volume-ratio
│   ├── sectors.service.ts           # CSV parsing, sector filtering, ratio calc
│   └── dto/
│       └── sectors.dto.ts           # Performance & VolumeRatio response DTOs
│
└── stocks/
    ├── stocks.module.ts             # Aggregates Performance + Volume modules
    ├── performance/
    │   ├── performance.module.ts
    │   ├── performance.controller.ts  # GET /performance/top-gainers-losers
    │   └── performance.service.ts     # MA CSV parsing, gainer/loser extraction
    └── volume/
        ├── volume.module.ts
        ├── volume.controller.ts       # POST /volume/differences
        └── volume.service.ts          # Bhavdata CSV parsing, Nifty 50 filtering
```

---

## Error Handling

| Status | Condition |
|--------|-----------|
| `200 OK` | Successful response |
| `400 Bad Request` | Invalid date format or missing required fields |
| `404 Not Found` | Data file not found for the requested date |
| `500 Internal Server Error` | NSE server unreachable or file parsing failure |

**Error response format:**
```json
{
  "statusCode": 404,
  "message": "Data for date 21022026 not found.",
  "error": "Not Found"
}
```

---

## Development

```bash
# Lint
npm run lint

# Format
npm run format

# Unit tests
npm test

# Watch mode tests
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Debug mode
npm run start:debug
```

---

## Deployment

### Docker

```bash
# Build
docker build -t marketpulse-api:latest .

# Run
docker run -d -p 3000:3000 --name marketpulse marketpulse-api:latest

# With persistent data volume
docker run -d -p 3000:3000 \
  -v marketpulse-data:/usr/src/app/.data \
  --name marketpulse marketpulse-api:latest
```

The Dockerfile uses `node:18-alpine`, installs dependencies, builds the TypeScript, and runs `node dist/main`.

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listen port |

---

## License

This project is **UNLICENSED** (private).
