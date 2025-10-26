# MarketPulse API Documentation

**Version:** 1.0.0
**Framework:** NestJS 11.x
**Language:** TypeScript 5.x
**License:** MIT

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Getting Started](#getting-started)
4. [API Reference](#api-reference)
5. [Data Models](#data-models)
6. [Frontend Integration](#frontend-integration)
7. [Authentication & Security](#authentication--security)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Deployment Guide](#deployment-guide)
11. [Troubleshooting](#troubleshooting)
12. [Appendix](#appendix)

---

## Executive Summary

MarketPulse is an enterprise-grade REST API designed for fetching, processing, and analyzing National Stock Exchange of India (NSE) market data. The API provides real-time access to stock performance metrics, sector analysis, volume analytics, and historical comparisons.

### Key Capabilities

- **Data Retrieval**: Automated downloading of daily NSE data (stocks, indices, market activity)
- **Sector Analytics**: Performance analysis across all NSE sectors with percentage changes
- **Volume Intelligence**: Comparative volume analysis between trading sessions
- **Stock Performance**: Top gainers/losers identification from Nifty 50 constituents
- **Historical Analysis**: Multi-day comparison and trend analysis capabilities

### Target Audience

- Frontend developers building financial dashboards
- Quantitative analysts requiring programmatic data access
- Trading platform developers
- Financial application integrators

---

## Architecture Overview

### System Design

MarketPulse follows a modular, service-oriented architecture built on NestJS framework principles:

```
┌─────────────────────────────────────────────┐
│           Client Applications               │
│    (Web, Mobile, Desktop, Analytics)        │
└─────────────────┬───────────────────────────┘
                  │ HTTP/HTTPS
                  │ REST API
┌─────────────────▼───────────────────────────┐
│         API Gateway (NestJS)                │
│  ┌─────────────────────────────────────┐   │
│  │  CORS Middleware                    │   │
│  │  Validation Pipeline                │   │
│  │  Exception Filters                  │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────┐
│  Controllers   │  │   Services  │
├────────────────┤  ├─────────────┤
│ • DateCtrl     │  │ • DateSvc   │
│ • NseCtrl      │  │ • NseSvc    │
│ • SectorsCtrl  │  │ • SectorsSvc│
│ • StocksCtrl   │  │ • StocksSvc │
└───────┬────────┘  └──────┬──────┘
        │                  │
        └──────────┬───────┘
                   │
┌──────────────────▼──────────────────┐
│      Data Layer                     │
│  ┌──────────────────────────────┐  │
│  │  File System Storage         │  │
│  │  (.data/NSE-Data/)           │  │
│  │  • stocks/                   │  │
│  │  • indices/                  │  │
│  │  • ma/                       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         │ HTTP Client (Axios)
         │
┌────────▼─────────────────────────────┐
│   External Data Source               │
│   NSE India Archives                 │
│   https://nsearchives.nseindia.com   │
└──────────────────────────────────────┘
```

### Module Structure

| Module | Responsibility | Key Exports |
|--------|---------------|-------------|
| **AppModule** | Root module, dependency injection | Application bootstrap |
| **DateModule** | Date utilities and formatting | DateService, DateController |
| **NseModule** | NSE data fetching and storage | NseService, NseController |
| **SectorsModule** | Sector performance analytics | SectorsService, SectorsController |
| **StocksModule** | Stock-level analysis | PerformanceModule, VolumeModule |

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | NestJS 11.1.7 | Application framework |
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Language** | TypeScript 5.5.4 | Type-safe development |
| **HTTP Client** | Axios 1.7.2 | External API requests |
| **Validation** | class-validator 0.14.1 | Input validation |
| **Transformation** | class-transformer 0.5.1 | DTO mapping |
| **Parsing** | csv-parser 3.0.0 | CSV data processing |
| **Container** | Docker | Deployment packaging |

---

## Getting Started

### Prerequisites

Before integrating with MarketPulse API, ensure you have:

- **Node.js** version 18.x or higher
- **npm** version 9.x or higher (or **yarn** 1.22.x)
- **Network access** to NSE archives (nsearchives.nseindia.com)
- **Storage** ~500MB free disk space for data caching
- **CORS** Frontend origin whitelisted (for browser-based clients)

### Installation

#### Option 1: Local Development

```bash
# Clone repository
git clone <repository-url>
cd marketpulse-api

# Install dependencies
npm install

# Start development server with hot-reload
npm run start:dev

# API available at http://localhost:3000
```

#### Option 2: Docker Container

```bash
# Build Docker image
docker build -t marketpulse-api:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --name marketpulse \
  marketpulse-api:latest

# Verify container status
docker ps | grep marketpulse
```

#### Option 3: Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Or with PM2 process manager
pm2 start dist/main.js --name marketpulse-api
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Data Storage
DATA_DIR=.data

# API Configuration
API_PREFIX=api/v1
ENABLE_CORS=true
```

### Health Check

Verify the API is running:

```bash
curl http://localhost:3000/date

# Expected response: "2025-10-26"
```

---

## API Reference

### Base URL

```
Production:  https://api.marketpulse.com
Development: http://localhost:3000
```

### Global Headers

All API requests should include:

```http
Content-Type: application/json
Accept: application/json
```

---

### 1. Date Module

#### 1.1 Get Current Server Date

Retrieves the server's current date in ISO 8601 format.

**Endpoint:**
```
GET /date
```

**Use Cases:**
- Synchronize client-side date with server
- Validate trading session timing
- Generate date-based request parameters

**Request:**
```bash
curl -X GET http://localhost:3000/date
```

**Response:**
```json
"2025-10-26"
```

**Response Format:** String (ISO 8601 date: YYYY-MM-DD)

**HTTP Status Codes:**
- `200 OK` - Success

**Frontend Implementation:**

```typescript
// TypeScript/JavaScript
interface DateService {
  getCurrentDate(): Promise<string>;
}

class MarketPulseAPI {
  async getCurrentDate(): Promise<string> {
    const response = await fetch('http://localhost:3000/date');
    return await response.json();
  }
}

// Usage
const api = new MarketPulseAPI();
const serverDate = await api.getCurrentDate();
console.log(serverDate); // "2025-10-26"
```

---

### 2. NSE Module

#### 2.1 Download NSE Market Data

Downloads daily market data files from NSE archives for specified dates.

**Endpoint:**
```
POST /nse/download
```

**Request Body:**

```typescript
interface DownloadRequest {
  dates: string[];  // Array of dates in ddmmyyyy format
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/nse/download \
  -H "Content-Type: application/json" \
  -d '{
    "dates": ["26102025", "25102025", "24102025"]
  }'
```

**Response:**

```typescript
interface DownloadResponse {
  date: string;           // Date in ddmmyyyy format
  stocksFile: string;     // Path to stocks bhavdata CSV
  indicesFile: string;    // Path to indices data CSV
  marketActivityFile: string;  // Path to market activity CSV
}

// Response Array
type DownloadResponseArray = DownloadResponse[];
```

**Example Response:**

```json
[
  {
    "date": "26102025",
    "stocksFile": ".data/NSE-Data/stocks/cm26OCT2025bhav.csv",
    "indicesFile": ".data/NSE-Data/indices/ind_close_all_26102025.csv",
    "marketActivityFile": ".data/NSE-Data/ma/MA_26102025.csv"
  },
  {
    "date": "25102025",
    "stocksFile": ".data/NSE-Data/stocks/cm25OCT2025bhav.csv",
    "indicesFile": ".data/NSE-Data/indices/ind_close_all_25102025.csv",
    "marketActivityFile": ".data/NSE-Data/ma/MA_25102025.csv"
  }
]
```

**Downloaded File Contents:**

1. **Stocks Bhavdata** (`cm{DD}{MMM}{YYYY}bhav.csv`)
   - All NSE-listed securities (2000+ stocks)
   - Columns: SYMBOL, SERIES, OPEN, HIGH, LOW, CLOSE, LAST, PREVCLOSE, TOTTRDQTY, TOTTRDVAL, TIMESTAMP, TOTALTRADES
   - Data Volume: ~2-3 MB per file

2. **Indices Data** (`ind_close_all_{ddmmyyyy}.csv`)
   - All NSE indices (Nifty 50, Bank Nifty, sectoral indices)
   - Columns: Index Name, Index Date, Open Index Value, High Index Value, Low Index Value, Closing Index Value, Points Change, Change(%), Volume, Turnover (Rs. Cr.), P/E, P/B, Div Yield
   - Coverage: 50+ indices

3. **Market Activity** (`MA_{ddmmyyyy}.csv`)
   - Nifty 50 constituent performance
   - Pre-calculated gainers/losers
   - Columns: Symbol, Open, High, Low, Close, % Change, Volume

**HTTP Status Codes:**
- `200 OK` - All files downloaded successfully
- `400 Bad Request` - Invalid date format
- `404 Not Found` - Data not available for specified date(s)
- `500 Internal Server Error` - NSE server unreachable

**Error Response:**

```json
{
  "statusCode": 404,
  "message": "Data not available for date: 26102025",
  "error": "Not Found"
}
```

**Frontend Implementation:**

```typescript
interface DownloadService {
  downloadData(dates: string[]): Promise<DownloadResponse[]>;
}

class MarketPulseAPI {
  private baseUrl = 'http://localhost:3000';

  async downloadData(dates: string[]): Promise<DownloadResponse[]> {
    const response = await fetch(`${this.baseUrl}/nse/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Download failed');
    }

    return await response.json();
  }
}

// Usage
const api = new MarketPulseAPI();
const results = await api.downloadData(['26102025', '25102025']);
console.log(`Downloaded ${results.length} date(s)`);
```

**Date Format Helper:**

```typescript
/**
 * Converts JavaScript Date object to NSE date format (ddmmyyyy)
 */
function formatDateNSE(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

// Usage
const today = formatDateNSE(new Date());
const yesterday = formatDateNSE(new Date(Date.now() - 86400000));

await api.downloadData([today, yesterday]);
```

**Important Notes:**

- Data is typically published after 6:00 PM IST on trading days
- No data available for weekends and NSE holidays
- Maximum 31 dates per request recommended
- Files are cached locally; subsequent requests for same date use cached data
- Download time: ~2-5 seconds per date (network dependent)

---

### 3. Sectors Module

#### 3.1 Get Sector Performance

Analyzes and returns top 5 gaining and losing sectors for a trading session.

**Endpoint:**
```
GET /sectors/performance/:date
```

**Path Parameters:**

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `date` | string | Yes | ddmmyyyy | Trading date |

**Example Request:**

```bash
curl -X GET http://localhost:3000/sectors/performance/26102025
```

**Response Model:**

```typescript
interface SectorData {
  sector: string;          // Sector name (e.g., "NIFTY AUTO")
  percentageChange: number; // % change (positive for gain, negative for loss)
  open: number;            // Opening value
  close: number;           // Closing value
  high: number;            // Intraday high
  low: number;             // Intraday low
}

interface SectorPerformanceResponse {
  date: string;                  // Query date (ddmmyyyy)
  topGainers: SectorData[];      // Top 5 gaining sectors
  topLosers: SectorData[];       // Top 5 losing sectors
}
```

**Example Response:**

```json
{
  "date": "26102025",
  "topGainers": [
    {
      "sector": "NIFTY AUTO",
      "percentageChange": 3.42,
      "open": 24156.50,
      "close": 24982.75,
      "high": 25050.00,
      "low": 24100.25
    },
    {
      "sector": "NIFTY IT",
      "percentageChange": 2.87,
      "open": 35412.80,
      "close": 36429.45,
      "high": 36500.00,
      "low": 35350.00
    },
    {
      "sector": "NIFTY PHARMA",
      "percentageChange": 2.15,
      "open": 18967.25,
      "close": 19374.90,
      "high": 19450.00,
      "low": 18890.50
    },
    {
      "sector": "NIFTY FMCG",
      "percentageChange": 1.89,
      "open": 52345.60,
      "close": 53334.95,
      "high": 53400.00,
      "low": 52200.00
    },
    {
      "sector": "NIFTY MEDIA",
      "percentageChange": 1.45,
      "open": 1867.35,
      "close": 1894.43,
      "high": 1900.00,
      "low": 1855.00
    }
  ],
  "topLosers": [
    {
      "sector": "NIFTY METAL",
      "percentageChange": -2.78,
      "open": 7245.60,
      "close": 7044.20,
      "high": 7280.00,
      "low": 7020.00
    },
    {
      "sector": "NIFTY PSU BANK",
      "percentageChange": -2.34,
      "open": 6578.40,
      "close": 6424.50,
      "high": 6600.00,
      "low": 6400.00
    },
    {
      "sector": "NIFTY REALTY",
      "percentageChange": -1.89,
      "open": 956.75,
      "close": 938.68,
      "high": 965.00,
      "low": 935.00
    },
    {
      "sector": "NIFTY ENERGY",
      "percentageChange": -1.23,
      "open": 38678.90,
      "close": 38202.85,
      "high": 38750.00,
      "low": 38150.00
    },
    {
      "sector": "NIFTY BANK",
      "percentageChange": -0.98,
      "open": 51456.75,
      "close": 50952.60,
      "high": 51500.00,
      "low": 50900.00
    }
  ]
}
```

**Calculation Methodology:**

```typescript
// Percentage Change Formula
percentageChange = ((close - open) / open) * 100

// Sorting Logic
// Gainers: Sorted by percentageChange DESC (highest positive first)
// Losers: Sorted by percentageChange ASC (highest negative first)
```

**Sector Coverage:**

The API analyzes all major NSE sectoral indices:

- NIFTY AUTO
- NIFTY BANK
- NIFTY FINANCIAL SERVICES
- NIFTY FMCG
- NIFTY IT
- NIFTY MEDIA
- NIFTY METAL
- NIFTY PHARMA
- NIFTY PSU BANK
- NIFTY REALTY
- NIFTY PRIVATE BANK
- NIFTY COMMODITIES
- NIFTY CONSUMPTION
- NIFTY ENERGY
- NIFTY INFRASTRUCTURE
- NIFTY MNC
- NIFTY PSE
- NIFTY SERVICES SECTOR
- And more...

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `404 Not Found` - Data not available for date

**Frontend Implementation:**

```typescript
interface SectorsService {
  getSectorPerformance(date: string): Promise<SectorPerformanceResponse>;
}

class MarketPulseAPI {
  async getSectorPerformance(date: string): Promise<SectorPerformanceResponse> {
    const response = await fetch(
      `http://localhost:3000/sectors/performance/${date}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sector performance');
    }

    return await response.json();
  }
}

// React Component Example
function SectorPerformance() {
  const [data, setData] = useState<SectorPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const api = new MarketPulseAPI();
      const today = formatDateNSE(new Date());

      try {
        const result = await api.getSectorPerformance(today);
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Top Gaining Sectors</h2>
      {data?.topGainers.map((sector) => (
        <div key={sector.sector}>
          <span>{sector.sector}</span>
          <span className="gain">+{sector.percentageChange.toFixed(2)}%</span>
        </div>
      ))}

      <h2>Top Losing Sectors</h2>
      {data?.topLosers.map((sector) => (
        <div key={sector.sector}>
          <span>{sector.sector}</span>
          <span className="loss">{sector.percentageChange.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}
```

---

#### 3.2 Get Sector Volume Ratio

Calculates volume ratios between two trading sessions, identifying sectors with highest and lowest volume changes.

**Endpoint:**
```
GET /sectors/volume-ratio/:currentDate/:previousDate
```

**Path Parameters:**

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `currentDate` | string | Yes | ddmmyyyy | More recent date |
| `previousDate` | string | Yes | ddmmyyyy | Earlier date |

**Example Request:**

```bash
curl -X GET http://localhost:3000/sectors/volume-ratio/26102025/25102025
```

**Response Model:**

```typescript
interface SectorVolumeData {
  sector: string;              // Sector name
  volumeRatio: number;         // Current volume / Previous volume (2 decimal places)
  currentVolume: number;       // Trading volume on current date
  previousVolume: number;      // Trading volume on previous date
}

interface SectorVolumeRatioResponse {
  currentDate: string;                        // Current date (ddmmyyyy)
  previousDate: string;                       // Previous date (ddmmyyyy)
  highestVolumeRatios: SectorVolumeData[];   // Top 5 volume increases
  lowestVolumeRatios: SectorVolumeData[];    // Top 5 volume decreases
}
```

**Example Response:**

```json
{
  "currentDate": "26102025",
  "previousDate": "25102025",
  "highestVolumeRatios": [
    {
      "sector": "NIFTY METAL",
      "volumeRatio": 2.47,
      "currentVolume": 1456789234,
      "previousVolume": 589630216
    },
    {
      "sector": "NIFTY IT",
      "volumeRatio": 2.15,
      "currentVolume": 2345678901,
      "previousVolume": 1090781349
    },
    {
      "sector": "NIFTY AUTO",
      "volumeRatio": 1.89,
      "currentVolume": 987654321,
      "previousVolume": 522513389
    },
    {
      "sector": "NIFTY PHARMA",
      "volumeRatio": 1.67,
      "currentVolume": 765432198,
      "previousVolume": 458314250
    },
    {
      "sector": "NIFTY MEDIA",
      "volumeRatio": 1.54,
      "currentVolume": 345678912,
      "previousVolume": 224466825
    }
  ],
  "lowestVolumeRatios": [
    {
      "sector": "NIFTY BANK",
      "volumeRatio": 0.42,
      "currentVolume": 567890123,
      "previousVolume": 1351881245
    },
    {
      "sector": "NIFTY ENERGY",
      "volumeRatio": 0.51,
      "currentVolume": 456789012,
      "previousVolume": 895664729
    },
    {
      "sector": "NIFTY FMCG",
      "volumeRatio": 0.63,
      "currentVolume": 678901234,
      "previousVolume": 1077144816
    },
    {
      "sector": "NIFTY REALTY",
      "volumeRatio": 0.71,
      "currentVolume": 234567890,
      "previousVolume": 330377592
    },
    {
      "sector": "NIFTY PSU BANK",
      "volumeRatio": 0.78,
      "currentVolume": 345678901,
      "previousVolume": 443178079
    }
  ]
}
```

**Calculation Methodology:**

```typescript
// Volume Ratio Formula
volumeRatio = currentVolume / previousVolume

// Rounding
volumeRatio = Math.round(volumeRatio * 100) / 100  // 2 decimal places

// Filtering
// Sectors with volume < 1000 shares are excluded
// Ensures meaningful analysis by filtering out negligible trading activity

// Interpretation
if (volumeRatio > 1.5) {
  // Significant volume surge - potential breakout or news-driven
} else if (volumeRatio > 1.0) {
  // Increased interest - growing participation
} else if (volumeRatio === 1.0) {
  // Stable activity - consistent trading pattern
} else if (volumeRatio < 0.7) {
  // Significant volume drop - declining interest
} else {
  // Moderate decrease - slight reduction in participation
}
```

**Use Cases:**

1. **Volume Surge Detection**: Identify sectors with unusual activity spikes
2. **Liquidity Analysis**: Assess trading participation changes
3. **Momentum Signals**: High volume ratios may indicate trend acceleration
4. **Contrarian Indicators**: Low volume ratios may signal exhaustion
5. **Sector Rotation**: Track capital flow between sectors

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `404 Not Found` - Data not available for one or both dates

**Frontend Implementation:**

```typescript
class MarketPulseAPI {
  async getSectorVolumeRatio(
    currentDate: string,
    previousDate: string
  ): Promise<SectorVolumeRatioResponse> {
    const response = await fetch(
      `http://localhost:3000/sectors/volume-ratio/${currentDate}/${previousDate}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch volume ratios');
    }

    return await response.json();
  }
}

// Vue Component Example
export default {
  data() {
    return {
      volumeData: null as SectorVolumeRatioResponse | null,
      loading: true,
      error: null as string | null,
    };
  },

  async mounted() {
    const api = new MarketPulseAPI();
    const today = formatDateNSE(new Date());
    const yesterday = formatDateNSE(new Date(Date.now() - 86400000));

    try {
      this.volumeData = await api.getSectorVolumeRatio(today, yesterday);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  },

  methods: {
    getVolumeChangePercent(ratio: number): string {
      const changePercent = ((ratio - 1) * 100).toFixed(2);
      return ratio >= 1 ? `+${changePercent}%` : `${changePercent}%`;
    },

    getSignalStrength(ratio: number): string {
      if (ratio >= 2.0) return 'Very Strong';
      if (ratio >= 1.5) return 'Strong';
      if (ratio >= 1.2) return 'Moderate';
      if (ratio >= 0.8) return 'Neutral';
      if (ratio >= 0.5) return 'Weak';
      return 'Very Weak';
    }
  }
};
```

---

### 4. Stocks Module - Performance

#### 4.1 Get Top Gainers and Losers

Retrieves top 5 Nifty 50 gainers and losers based on daily percentage change.

**Endpoint:**
```
GET /performance/top-gainers-losers
```

**Query Parameters:**

| Parameter | Type | Required | Format | Default | Description |
|-----------|------|----------|--------|---------|-------------|
| `date` | string | No | ddmmyyyy | Latest available | Trading date |

**Example Requests:**

```bash
# Latest data
curl -X GET http://localhost:3000/performance/top-gainers-losers

# Specific date
curl -X GET "http://localhost:3000/performance/top-gainers-losers?date=26102025"
```

**Response Model:**

```typescript
interface StockData {
  symbol: string;              // Stock ticker symbol
  percentageChange: number;    // % change from previous close
  open: number;                // Opening price
  high: number;                // Intraday high
  low: number;                 // Intraday low
  close: number;               // Closing price
  volume: number;              // Trading volume (shares)
}

interface TopMoversResponse {
  date: string;                // Data date (ddmmyyyy)
  topGainers: StockData[];     // Top 5 gaining stocks
  topLosers: StockData[];      // Top 5 losing stocks
}
```

**Example Response:**

```json
{
  "date": "26102025",
  "topGainers": [
    {
      "symbol": "TCS",
      "percentageChange": 5.23,
      "open": 3567.80,
      "high": 3785.50,
      "low": 3545.00,
      "close": 3753.95,
      "volume": 15678234
    },
    {
      "symbol": "INFY",
      "percentageChange": 4.87,
      "open": 1456.25,
      "high": 1528.90,
      "low": 1448.00,
      "close": 1527.20,
      "volume": 28901234
    },
    {
      "symbol": "RELIANCE",
      "percentageChange": 3.65,
      "open": 2789.50,
      "high": 2891.75,
      "low": 2765.00,
      "close": 2891.35,
      "volume": 45123456
    },
    {
      "symbol": "HDFCBANK",
      "percentageChange": 3.42,
      "open": 1678.90,
      "high": 1736.35,
      "low": 1665.00,
      "close": 1736.35,
      "volume": 32456789
    },
    {
      "symbol": "ICICIBANK",
      "percentageChange": 2.98,
      "open": 1034.75,
      "high": 1065.60,
      "low": 1028.00,
      "close": 1065.60,
      "volume": 41234567
    }
  ],
  "topLosers": [
    {
      "symbol": "TATASTEEL",
      "percentageChange": -4.12,
      "open": 148.75,
      "high": 149.50,
      "low": 142.62,
      "close": 142.62,
      "volume": 78901234
    },
    {
      "symbol": "JSWSTEEL",
      "percentageChange": -3.78,
      "open": 897.60,
      "high": 902.00,
      "low": 863.65,
      "close": 863.65,
      "volume": 56789012
    },
    {
      "symbol": "HINDALCO",
      "percentageChange": -3.45,
      "open": 632.40,
      "high": 635.00,
      "low": 610.58,
      "close": 610.58,
      "volume": 67890123
    },
    {
      "symbol": "COALINDIA",
      "percentageChange": -2.89,
      "open": 438.90,
      "high": 441.00,
      "low": 426.20,
      "close": 426.20,
      "volume": 54321098
    },
    {
      "symbol": "NTPC",
      "percentageChange": -2.34,
      "open": 342.75,
      "high": 344.00,
      "low": 334.73,
      "close": 334.73,
      "volume": 43210987
    }
  ]
}
```

**Data Source:**

Data is extracted from NSE's Market Activity (MA) report, which provides pre-calculated performance metrics for Nifty 50 constituent stocks.

**Nifty 50 Constituents (50 stocks):**

The analysis covers all Nifty 50 index constituents including:
- Financial Services: HDFCBANK, ICICIBANK, KOTAKBANK, SBIN, AXISBANK, etc.
- Information Technology: TCS, INFY, WIPRO, HCLTECH, TECHM, etc.
- Energy: RELIANCE, ONGC, BPCL, IOC, POWERGRID, etc.
- Automobiles: MARUTI, M&M, BAJAJ-AUTO, etc.
- Consumer Goods: HINDUNILVR, ITC, NESTLEIND, etc.
- Pharmaceuticals: SUNPHARMA, DRREDDY, CIPLA, etc.
- Metals & Mining: TATASTEEL, HINDALCO, COALINDIA, etc.
- And more across diverse sectors

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `404 Not Found` - Data not available for date

**Frontend Implementation:**

```typescript
interface PerformanceService {
  getTopMovers(date?: string): Promise<TopMoversResponse>;
}

class MarketPulseAPI {
  async getTopMovers(date?: string): Promise<TopMoversResponse> {
    const url = date
      ? `http://localhost:3000/performance/top-gainers-losers?date=${date}`
      : 'http://localhost:3000/performance/top-gainers-losers';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch top movers');
    }

    return await response.json();
  }
}

// Angular Component Example
@Component({
  selector: 'app-top-movers',
  template: `
    <div class="top-movers">
      <div class="gainers">
        <h2>Top Gainers</h2>
        <div *ngFor="let stock of topGainers" class="stock-card gain">
          <div class="symbol">{{ stock.symbol }}</div>
          <div class="change">+{{ stock.percentageChange.toFixed(2) }}%</div>
          <div class="price">₹{{ stock.close.toFixed(2) }}</div>
          <div class="volume">Vol: {{ formatVolume(stock.volume) }}</div>
        </div>
      </div>

      <div class="losers">
        <h2>Top Losers</h2>
        <div *ngFor="let stock of topLosers" class="stock-card loss">
          <div class="symbol">{{ stock.symbol }}</div>
          <div class="change">{{ stock.percentageChange.toFixed(2) }}%</div>
          <div class="price">₹{{ stock.close.toFixed(2) }}</div>
          <div class="volume">Vol: {{ formatVolume(stock.volume) }}</div>
        </div>
      </div>
    </div>
  `
})
export class TopMoversComponent implements OnInit {
  topGainers: StockData[] = [];
  topLosers: StockData[] = [];

  constructor(private marketService: MarketService) {}

  async ngOnInit() {
    const api = new MarketPulseAPI();
    const data = await api.getTopMovers();

    this.topGainers = data.topGainers;
    this.topLosers = data.topLosers;
  }

  formatVolume(volume: number): string {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(2)} Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(2)} L`;
    }
    return volume.toLocaleString();
  }
}
```

---

### 5. Stocks Module - Volume

#### 5.1 Calculate Volume Differences

Computes volume differences for Nifty 50 stocks between two trading sessions.

**Endpoint:**
```
POST /volume/differences
```

**Request Body:**

```typescript
interface VolumeDifferenceRequest {
  dates: [string, string];  // [previousDate, currentDate] in ddmmyyyy format
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/volume/differences \
  -H "Content-Type: application/json" \
  -d '{
    "dates": ["25102025", "26102025"]
  }'
```

**Important:** Date order is `[previousDate, currentDate]` - earlier date first!

**Response Model:**

```typescript
interface StockVolumeData {
  symbol: string;              // Stock ticker symbol
  volumeDifference: number;    // Current volume - Previous volume
  currentVolume: number;       // Volume on current date
  previousVolume: number;      // Volume on previous date
  percentageChange: number;    // ((current - previous) / previous) * 100
}

type VolumeDifferenceResponse = StockVolumeData[];
```

**Example Response:**

```json
[
  {
    "symbol": "RELIANCE",
    "volumeDifference": 18456789,
    "currentVolume": 48456789,
    "previousVolume": 30000000,
    "percentageChange": 61.52
  },
  {
    "symbol": "TCS",
    "volumeDifference": 9234567,
    "currentVolume": 21234567,
    "previousVolume": 12000000,
    "percentageChange": 76.95
  },
  {
    "symbol": "INFY",
    "volumeDifference": 7890123,
    "currentVolume": 30890123,
    "previousVolume": 23000000,
    "percentageChange": 34.30
  },
  {
    "symbol": "HDFCBANK",
    "volumeDifference": -6789012,
    "currentVolume": 38210988,
    "previousVolume": 45000000,
    "percentageChange": -15.09
  },
  {
    "symbol": "ICICIBANK",
    "volumeDifference": -4567890,
    "currentVolume": 51432110,
    "previousVolume": 56000000,
    "percentageChange": -8.16
  }
  // ... remaining Nifty 50 stocks
]
```

**Calculation Methodology:**

```typescript
// Volume Difference
volumeDifference = currentVolume - previousVolume

// Percentage Change
percentageChange = ((currentVolume - previousVolume) / previousVolume) * 100

// Interpretation
if (volumeDifference > 0) {
  // Increased volume - Higher participation
  if (percentageChange > 50) {
    // Significant surge - Potential breakout or news
  }
} else if (volumeDifference < 0) {
  // Decreased volume - Lower participation
  if (percentageChange < -50) {
    // Significant drop - Potential exhaustion
  }
}
```

**Response Characteristics:**

- **Array Length**: Up to 50 elements (all Nifty 50 stocks)
- **Order**: Unsorted (alphabetical by symbol typically)
- **Missing Stocks**: If a stock has no data for either date, it's excluded
- **Zero Volume**: Stocks with zero volume on either date are excluded

**Use Cases:**

1. **Volume Spike Detection**: Identify stocks with unusual volume increases
2. **Liquidity Analysis**: Assess changes in trading participation
3. **Momentum Confirmation**: High volume + price move = strong signal
4. **Breakout Validation**: Volume surge confirms price breakouts
5. **Exhaustion Signals**: Volume decline may indicate trend fatigue

**HTTP Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid request body or date format
- `404 Not Found` - Data not available for one or both dates

**Frontend Implementation:**

```typescript
interface VolumeService {
  getVolumeDifferences(
    previousDate: string,
    currentDate: string
  ): Promise<StockVolumeData[]>;
}

class MarketPulseAPI {
  async getVolumeDifferences(
    previousDate: string,
    currentDate: string
  ): Promise<StockVolumeData[]> {
    const response = await fetch('http://localhost:3000/volume/differences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dates: [previousDate, currentDate]
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch volume differences');
    }

    return await response.json();
  }
}

// React Hook Example
function useVolumeDifferences(previousDate: string, currentDate: string) {
  const [data, setData] = useState<StockVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const api = new MarketPulseAPI();

      try {
        setLoading(true);
        const result = await api.getVolumeDifferences(previousDate, currentDate);

        // Sort by absolute volume change (descending)
        const sorted = result.sort((a, b) =>
          Math.abs(b.volumeDifference) - Math.abs(a.volumeDifference)
        );

        setData(sorted);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [previousDate, currentDate]);

  return { data, loading, error };
}

// Usage in Component
function VolumeAnalysis() {
  const today = formatDateNSE(new Date());
  const yesterday = formatDateNSE(new Date(Date.now() - 86400000));

  const { data, loading, error } = useVolumeDifferences(yesterday, today);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  // Filter for significant volume surges (>50% increase)
  const surgingStocks = data.filter(stock => stock.percentageChange > 50);

  // Filter for volume drying up (>50% decrease)
  const decliningStocks = data.filter(stock => stock.percentageChange < -50);

  return (
    <div>
      <section>
        <h2>Volume Surges ({surgingStocks.length})</h2>
        {surgingStocks.map(stock => (
          <div key={stock.symbol} className="stock-item surge">
            <span className="symbol">{stock.symbol}</span>
            <span className="volume">
              {formatLargeNumber(stock.volumeDifference)} shares
            </span>
            <span className="change">+{stock.percentageChange.toFixed(2)}%</span>
          </div>
        ))}
      </section>

      <section>
        <h2>Volume Declines ({decliningStocks.length})</h2>
        {decliningStocks.map(stock => (
          <div key={stock.symbol} className="stock-item decline">
            <span className="symbol">{stock.symbol}</span>
            <span className="volume">
              {formatLargeNumber(Math.abs(stock.volumeDifference))} shares
            </span>
            <span className="change">{stock.percentageChange.toFixed(2)}%</span>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## Data Models

### Complete TypeScript Definitions

```typescript
// ============================================
// Date Module Types
// ============================================

type DateString = string; // YYYY-MM-DD format

// ============================================
// NSE Module Types
// ============================================

interface DownloadRequest {
  dates: string[]; // ddmmyyyy format
}

interface DownloadResponse {
  date: string;
  stocksFile: string;
  indicesFile: string;
  marketActivityFile: string;
}

// ============================================
// Sectors Module Types
// ============================================

interface SectorData {
  sector: string;
  percentageChange: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface SectorPerformanceResponse {
  date: string;
  topGainers: SectorData[];
  topLosers: SectorData[];
}

interface SectorVolumeData {
  sector: string;
  volumeRatio: number;
  currentVolume: number;
  previousVolume: number;
}

interface SectorVolumeRatioResponse {
  currentDate: string;
  previousDate: string;
  highestVolumeRatios: SectorVolumeData[];
  lowestVolumeRatios: SectorVolumeData[];
}

// ============================================
// Stocks Module Types
// ============================================

interface StockData {
  symbol: string;
  percentageChange: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TopMoversResponse {
  date: string;
  topGainers: StockData[];
  topLosers: StockData[];
}

interface VolumeDifferenceRequest {
  dates: [string, string]; // [previousDate, currentDate]
}

interface StockVolumeData {
  symbol: string;
  volumeDifference: number;
  currentVolume: number;
  previousVolume: number;
  percentageChange: number;
}

type VolumeDifferenceResponse = StockVolumeData[];

// ============================================
// Error Response Type
// ============================================

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
```

---

## Frontend Integration

### Complete SDK Implementation

```typescript
/**
 * MarketPulse API SDK
 * Version: 1.0.0
 *
 * Complete TypeScript client for MarketPulse API
 */

class MarketPulseSDK {
  private baseUrl: string;
  private timeout: number;

  constructor(config?: { baseUrl?: string; timeout?: number }) {
    this.baseUrl = config?.baseUrl || 'http://localhost:3000';
    this.timeout = config?.timeout || 30000; // 30 seconds
  }

  // ==========================================
  // Date Module
  // ==========================================

  /**
   * Get current server date
   * @returns ISO date string (YYYY-MM-DD)
   */
  async getCurrentDate(): Promise<string> {
    return this.request<string>('/date');
  }

  // ==========================================
  // NSE Module
  // ==========================================

  /**
   * Download NSE data for specified dates
   * @param dates Array of dates in ddmmyyyy format
   * @returns Download status for each date
   */
  async downloadData(dates: string[]): Promise<DownloadResponse[]> {
    return this.request<DownloadResponse[]>('/nse/download', {
      method: 'POST',
      body: { dates },
    });
  }

  // ==========================================
  // Sectors Module
  // ==========================================

  /**
   * Get sector performance for a specific date
   * @param date Trading date in ddmmyyyy format
   * @returns Top 5 gaining and losing sectors
   */
  async getSectorPerformance(date: string): Promise<SectorPerformanceResponse> {
    return this.request<SectorPerformanceResponse>(
      `/sectors/performance/${date}`
    );
  }

  /**
   * Calculate sector volume ratios between two dates
   * @param currentDate More recent date in ddmmyyyy format
   * @param previousDate Earlier date in ddmmyyyy format
   * @returns Top 5 highest and lowest volume ratio sectors
   */
  async getSectorVolumeRatio(
    currentDate: string,
    previousDate: string
  ): Promise<SectorVolumeRatioResponse> {
    return this.request<SectorVolumeRatioResponse>(
      `/sectors/volume-ratio/${currentDate}/${previousDate}`
    );
  }

  // ==========================================
  // Stocks Module - Performance
  // ==========================================

  /**
   * Get top Nifty 50 gainers and losers
   * @param date Optional date in ddmmyyyy format (defaults to latest)
   * @returns Top 5 gainers and losers
   */
  async getTopMovers(date?: string): Promise<TopMoversResponse> {
    const url = date
      ? `/performance/top-gainers-losers?date=${date}`
      : '/performance/top-gainers-losers';

    return this.request<TopMoversResponse>(url);
  }

  // ==========================================
  // Stocks Module - Volume
  // ==========================================

  /**
   * Calculate volume differences for Nifty 50 stocks
   * @param previousDate Earlier date in ddmmyyyy format
   * @param currentDate More recent date in ddmmyyyy format
   * @returns Volume differences for all Nifty 50 stocks
   */
  async getVolumeDifferences(
    previousDate: string,
    currentDate: string
  ): Promise<StockVolumeData[]> {
    return this.request<StockVolumeData[]>('/volume/differences', {
      method: 'POST',
      body: { dates: [previousDate, currentDate] },
    });
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Generic request handler
   */
  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options?.method || 'GET';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new MarketPulseError(
          error.message,
          error.statusCode,
          error.error
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof MarketPulseError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new MarketPulseError('Request timeout', 408, 'Timeout');
      }

      throw new MarketPulseError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'InternalError'
      );
    }
  }
}

/**
 * Custom error class for MarketPulse API
 */
class MarketPulseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorType: string
  ) {
    super(message);
    this.name = 'MarketPulseError';
  }
}

/**
 * Utility: Format JavaScript Date to NSE date format (ddmmyyyy)
 */
function formatDateNSE(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
}

/**
 * Utility: Parse NSE date format to JavaScript Date
 */
function parseDateNSE(dateStr: string): Date {
  const day = parseInt(dateStr.substring(0, 2), 10);
  const month = parseInt(dateStr.substring(2, 4), 10) - 1;
  const year = parseInt(dateStr.substring(4, 8), 10);
  return new Date(year, month, day);
}

/**
 * Utility: Format large numbers with Indian numbering system
 */
function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)} K`;
  }
  return num.toString();
}

// ==========================================
// Export SDK
// ==========================================

export {
  MarketPulseSDK,
  MarketPulseError,
  formatDateNSE,
  parseDateNSE,
  formatIndianNumber,
};

// ==========================================
// Usage Example
// ==========================================

/*
// Initialize SDK
const api = new MarketPulseSDK({
  baseUrl: 'http://localhost:3000',
  timeout: 30000
});

// Get current date
const serverDate = await api.getCurrentDate();

// Download data
const today = formatDateNSE(new Date());
await api.downloadData([today]);

// Get sector performance
const sectors = await api.getSectorPerformance(today);

// Get top movers
const movers = await api.getTopMovers(today);

// Get volume analysis
const yesterday = formatDateNSE(new Date(Date.now() - 86400000));
const volumes = await api.getVolumeDifferences(yesterday, today);
*/
```

### Framework-Specific Examples

#### React with Hooks

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { MarketPulseSDK, formatDateNSE } from './marketpulse-sdk';

// Create Context
const MarketPulseContext = createContext<MarketPulseSDK | null>(null);

// Provider Component
export function MarketPulseProvider({
  children,
  config
}: {
  children: React.ReactNode;
  config?: { baseUrl?: string; timeout?: number };
}) {
  const sdk = new MarketPulseSDK(config);

  return (
    <MarketPulseContext.Provider value={sdk}>
      {children}
    </MarketPulseContext.Provider>
  );
}

// Custom Hook
export function useMarketPulse() {
  const context = useContext(MarketPulseContext);
  if (!context) {
    throw new Error('useMarketPulse must be used within MarketPulseProvider');
  }
  return context;
}

// Custom Hook: Sector Performance
export function useSectorPerformance(date: string) {
  const api = useMarketPulse();
  const [data, setData] = useState<SectorPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getSectorPerformance(date);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, date]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

// Component Usage
function SectorDashboard() {
  const today = formatDateNSE(new Date());
  const { data, loading, error } = useSectorPerformance(today);

  if (loading) return <div>Loading sector data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="sector-dashboard">
      <h1>Sector Performance - {data?.date}</h1>

      <div className="gainers">
        <h2>Top Gaining Sectors</h2>
        {data?.topGainers.map(sector => (
          <div key={sector.sector} className="sector-card gain">
            <span className="name">{sector.sector}</span>
            <span className="change">+{sector.percentageChange.toFixed(2)}%</span>
          </div>
        ))}
      </div>

      <div className="losers">
        <h2>Top Losing Sectors</h2>
        {data?.topLosers.map(sector => (
          <div key={sector.sector} className="sector-card loss">
            <span className="name">{sector.sector}</span>
            <span className="change">{sector.percentageChange.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Vue 3 Composition API

```typescript
import { ref, computed, onMounted, watch } from 'vue';
import { MarketPulseSDK, formatDateNSE } from './marketpulse-sdk';

// Composable
export function useMarketPulseData() {
  const api = new MarketPulseSDK();

  const sectorPerformance = ref<SectorPerformanceResponse | null>(null);
  const topMovers = ref<TopMoversResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSectorPerformance(date: string) {
    loading.value = true;
    error.value = null;

    try {
      sectorPerformance.value = await api.getSectorPerformance(date);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  async function fetchTopMovers(date?: string) {
    loading.value = true;
    error.value = null;

    try {
      topMovers.value = await api.getTopMovers(date);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  return {
    sectorPerformance,
    topMovers,
    loading,
    error,
    fetchSectorPerformance,
    fetchTopMovers,
  };
}

// Component
export default {
  setup() {
    const {
      sectorPerformance,
      topMovers,
      loading,
      error,
      fetchSectorPerformance,
      fetchTopMovers
    } = useMarketPulseData();

    onMounted(async () => {
      const today = formatDateNSE(new Date());
      await Promise.all([
        fetchSectorPerformance(today),
        fetchTopMovers(today)
      ]);
    });

    return {
      sectorPerformance,
      topMovers,
      loading,
      error,
    };
  }
};
```

#### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MarketPulseSDK, formatDateNSE } from './marketpulse-sdk';

@Injectable({
  providedIn: 'root'
})
export class MarketPulseService {
  private api: MarketPulseSDK;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.api = new MarketPulseSDK({
      baseUrl: environment.apiUrl,
      timeout: 30000
    });
  }

  getCurrentDate(): Observable<string> {
    return from(this.api.getCurrentDate());
  }

  downloadData(dates: string[]): Observable<DownloadResponse[]> {
    this.loadingSubject.next(true);
    return from(this.api.downloadData(dates)).pipe(
      map(result => {
        this.loadingSubject.next(false);
        return result;
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getSectorPerformance(date: string): Observable<SectorPerformanceResponse> {
    this.loadingSubject.next(true);
    return from(this.api.getSectorPerformance(date)).pipe(
      map(result => {
        this.loadingSubject.next(false);
        return result;
      })
    );
  }

  getTopMovers(date?: string): Observable<TopMoversResponse> {
    return from(this.api.getTopMovers(date));
  }

  getVolumeDifferences(
    previousDate: string,
    currentDate: string
  ): Observable<StockVolumeData[]> {
    return from(this.api.getVolumeDifferences(previousDate, currentDate));
  }

  // Utility method
  formatDateNSE(date: Date): string {
    return formatDateNSE(date);
  }
}

// Component Usage
@Component({
  selector: 'app-market-dashboard',
  templateUrl: './market-dashboard.component.html'
})
export class MarketDashboardComponent implements OnInit {
  sectorData$: Observable<SectorPerformanceResponse>;
  moversData$: Observable<TopMoversResponse>;

  constructor(private marketService: MarketPulseService) {}

  ngOnInit() {
    const today = this.marketService.formatDateNSE(new Date());

    this.sectorData$ = this.marketService.getSectorPerformance(today);
    this.moversData$ = this.marketService.getTopMovers(today);
  }
}
```

---

## Authentication & Security

### CORS Configuration

MarketPulse API implements a whitelist-based CORS policy for enhanced security.

**Default Allowed Origins:**

```typescript
// src/main.ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4200',  // Angular
  'http://localhost:5173',  // Vite
  'http://localhost:8080',  // Vue CLI
  'https://your-production-domain.com',
];
```

**Adding Your Origin:**

1. Edit `src/main.ts`
2. Add your frontend URL to `allowedOrigins` array
3. Rebuild and restart the API

**Example Configuration:**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://myapp.com',
        'https://www.myapp.com',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
```

### Request Validation

All API inputs are validated using `class-validator`:

- Date format validation (ddmmyyyy)
- Required field checks
- Type validation
- Array length validation

Invalid requests return `400 Bad Request` with detailed error messages.

### Rate Limiting (Recommended)

While not currently implemented, production deployments should implement rate limiting:

```typescript
// Recommended: Install @nestjs/throttler
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Maximum requests per ttl
    }),
  ],
})
export class AppModule {}
```

### Security Best Practices

1. **Always use HTTPS in production**
2. **Implement API key authentication for production**
3. **Set up rate limiting per client**
4. **Enable request logging for audit trails**
5. **Validate and sanitize all inputs**
6. **Keep dependencies updated**
7. **Use environment variables for sensitive config**

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  statusCode: number;     // HTTP status code
  message: string;        // Human-readable error message
  error: string;          // Error type/category
}
```

### HTTP Status Codes

| Status Code | Error Type | Description |
|-------------|-----------|-------------|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Invalid input parameters or date format |
| `404` | Not Found | Data not available for specified date(s) |
| `408` | Timeout | Request exceeded timeout limit |
| `500` | Internal Server Error | Server-side error or NSE unavailable |
| `503` | Service Unavailable | API temporarily unavailable |

### Common Error Scenarios

#### 1. Invalid Date Format

```json
{
  "statusCode": 400,
  "message": "Invalid date format. Expected ddmmyyyy",
  "error": "Bad Request"
}
```

**Solution:** Ensure dates are in `ddmmyyyy` format (e.g., "26102025")

#### 2. Data Not Available

```json
{
  "statusCode": 404,
  "message": "Data not available for date: 26102025",
  "error": "Not Found"
}
```

**Causes:**
- Weekend or NSE holiday
- Data not yet published (before 6 PM IST)
- Invalid date (future date, very old date)

**Solution:** Check NSE trading calendar, use previous trading day

#### 3. Network Timeout

```json
{
  "statusCode": 408,
  "message": "Request timeout",
  "error": "Timeout"
}
```

**Solution:** Retry request, check network connection

#### 4. NSE Server Unavailable

```json
{
  "statusCode": 500,
  "message": "Failed to fetch data from NSE",
  "error": "Internal Server Error"
}
```

**Solution:** Retry after some time, NSE servers may be temporarily down

### Frontend Error Handling

```typescript
class APIErrorHandler {
  static handle(error: MarketPulseError): string {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input parameters.';

      case 404:
        return 'Data not available. This might be a holiday or weekend.';

      case 408:
        return 'Request timed out. Please try again.';

      case 500:
        return 'Server error. NSE data service may be temporarily unavailable.';

      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  static getUserFriendlyMessage(error: MarketPulseError): {
    title: string;
    message: string;
    action: string;
  } {
    if (error.statusCode === 404) {
      return {
        title: 'Data Not Available',
        message: 'Market data for this date is not available. This could be a weekend or holiday.',
        action: 'Try selecting a different date'
      };
    }

    if (error.statusCode === 500) {
      return {
        title: 'Service Temporarily Unavailable',
        message: 'Unable to fetch data from NSE servers. This is usually temporary.',
        action: 'Please try again in a few minutes'
      };
    }

    return {
      title: 'Error',
      message: error.message,
      action: 'Please try again'
    };
  }
}

// Usage
try {
  const data = await api.getSectorPerformance(date);
} catch (error) {
  if (error instanceof MarketPulseError) {
    const userMessage = APIErrorHandler.getUserFriendlyMessage(error);
    showNotification(userMessage.title, userMessage.message);
  }
}
```

---

## Best Practices

### 1. Data Download Workflow

Always download data before querying analytics:

```typescript
// ✅ Correct Workflow
const today = formatDateNSE(new Date());

// Step 1: Download data
await api.downloadData([today]);

// Step 2: Query analytics
const sectors = await api.getSectorPerformance(today);
const movers = await api.getTopMovers(today);
```

### 2. Caching Strategy

Implement client-side caching to reduce API calls:

```typescript
class CachedMarketPulseAPI {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  async getSectorPerformance(date: string): Promise<SectorPerformanceResponse> {
    const cacheKey = `sector-performance-${date}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const data = await api.getSectorPerformance(date);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }
}
```

### 3. Parallel Requests

Fetch multiple metrics simultaneously:

```typescript
// ✅ Parallel Requests (Faster)
const [sectors, movers, volumes] = await Promise.all([
  api.getSectorPerformance(today),
  api.getTopMovers(today),
  api.getVolumeDifferences(yesterday, today)
]);

// ❌ Sequential Requests (Slower)
const sectors = await api.getSectorPerformance(today);
const movers = await api.getTopMovers(today);
const volumes = await api.getVolumeDifferences(yesterday, today);
```

### 4. Date Validation

Validate dates before making requests:

```typescript
function isValidTradingDate(date: Date): boolean {
  // Check if weekend
  const day = date.getDay();
  if (day === 0 || day === 6) return false;

  // Check if NSE holiday (simplified - use actual holiday calendar)
  const holidays = [
    '2025-01-26',  // Republic Day
    '2025-08-15',  // Independence Day
    // Add more holidays...
  ];

  const dateStr = date.toISOString().split('T')[0];
  return !holidays.includes(dateStr);
}

// Usage
const today = new Date();
if (isValidTradingDate(today)) {
  const data = await api.getSectorPerformance(formatDateNSE(today));
} else {
  // Show message: "Markets are closed today"
}
```

### 5. Error Recovery

Implement automatic retry logic:

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Don't retry client errors (4xx)
      if (error instanceof MarketPulseError && error.statusCode < 500) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const data = await fetchWithRetry(() =>
  api.getSectorPerformance(today)
);
```

### 6. Loading States

Provide feedback during API calls:

```typescript
function useAPI<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
```

### 7. Data Freshness

Track when data was last updated:

```typescript
interface CachedData<T> {
  data: T;
  fetchedAt: Date;
  date: string;
}

function isStale(cachedData: CachedData<any>, maxAge: number = 300000): boolean {
  return Date.now() - cachedData.fetchedAt.getTime() > maxAge;
}
```

---

## Deployment Guide

### Docker Deployment

#### 1. Build Image

```bash
docker build -t marketpulse-api:1.0.0 .
```

#### 2. Run Container

```bash
docker run -d \
  --name marketpulse-api \
  -p 3000:3000 \
  --restart unless-stopped \
  -v marketpulse-data:/app/.data \
  marketpulse-api:1.0.0
```

#### 3. Docker Compose

```yaml
version: '3.8'

services:
  marketpulse-api:
    image: marketpulse-api:1.0.0
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - marketpulse-data:/app/.data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/date"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  marketpulse-data:
```

### Cloud Deployment

#### Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/marketpulse-api

# Deploy to Cloud Run
gcloud run deploy marketpulse-api \
  --image gcr.io/PROJECT-ID/marketpulse-api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

#### AWS ECS/Fargate

```bash
# Push to ECR
aws ecr create-repository --repository-name marketpulse-api
docker tag marketpulse-api:latest AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/marketpulse-api:latest
docker push AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/marketpulse-api:latest

# Create ECS task definition and service via AWS Console or CLI
```

#### Heroku

```bash
# Login to Heroku
heroku login
heroku container:login

# Create app
heroku create marketpulse-api

# Deploy
heroku container:push web
heroku container:release web

# Open app
heroku open
```

### Production Checklist

- [ ] Environment variables configured
- [ ] CORS origins whitelisted
- [ ] Rate limiting enabled
- [ ] Health check endpoint available
- [ ] Logging configured
- [ ] Error monitoring (e.g., Sentry) set up
- [ ] SSL/TLS certificate installed
- [ ] Backup strategy for data directory
- [ ] Auto-scaling rules configured
- [ ] Monitoring and alerts set up

---

## Troubleshooting

### Issue: CORS Error

**Symptom:**
```
Access to fetch at 'http://localhost:3000/sectors/performance/26102025'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. Add your frontend origin to `src/main.ts`
2. Rebuild: `npm run build`
3. Restart: `npm run start:prod`

### Issue: 404 Not Found

**Symptom:**
```json
{
  "statusCode": 404,
  "message": "Data not available for date: 27102025"
}
```

**Solutions:**
1. Check if date is a trading day (not weekend/holiday)
2. Verify data is published (after 6 PM IST)
3. Use previous trading day
4. Check NSE holiday calendar

### Issue: Timeout Errors

**Symptom:**
```
Request timeout after 30000ms
```

**Solutions:**
1. Increase timeout in SDK config
2. Check network connectivity
3. Retry request
4. Use cached data if available

### Issue: Data Directory Permissions

**Symptom:**
```
EACCES: permission denied, mkdir '.data'
```

**Solution:**
```bash
# Fix permissions
chmod 755 .data
chown -R node:node .data

# Or run with appropriate user
docker run --user node marketpulse-api
```

---

## Appendix

### NSE Trading Calendar 2025

| Date | Holiday |
|------|---------|
| 26-Jan-2025 | Republic Day |
| 14-Feb-2025 | Mahashivratri |
| 14-Mar-2025 | Holi |
| 29-Mar-2025 | Id-Ul-Fitr |
| 10-Apr-2025 | Mahavir Jayanti |
| 14-Apr-2025 | Dr. Ambedkar Jayanti |
| 21-Apr-2025 | Ram Navami |
| 01-May-2025 | Maharashtra Day |
| 05-Jun-2025 | Id-Ul-Zuha (Bakri Id) |
| 15-Aug-2025 | Independence Day |
| 27-Aug-2025 | Ganesh Chaturthi |
| 02-Oct-2025 | Mahatma Gandhi Jayanti |
| 01-Nov-2025 | Diwali |
| 05-Nov-2025 | Diwali |
| 25-Dec-2025 | Christmas |

### Performance Benchmarks

| Operation | Avg Time | Max Time |
|-----------|----------|----------|
| Download single date | 2-3s | 5s |
| Sector performance | 50-100ms | 200ms |
| Top movers | 30-50ms | 100ms |
| Volume differences | 100-150ms | 300ms |
| Volume ratios | 150-200ms | 400ms |

### Data File Sizes

| File Type | Size (approx) |
|-----------|---------------|
| Stocks Bhavdata | 2-3 MB |
| Indices Data | 20-30 KB |
| Market Activity | 10-15 KB |
| Daily Total | ~3 MB |
| Monthly Storage | ~60-70 MB |

### Support & Community

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: https://docs.marketpulse.com
- **Email**: support@marketpulse.com
- **Discord**: https://discord.gg/marketpulse

### Changelog

**Version 1.0.0** (2025-10-26)
- Initial release
- Core API endpoints
- Docker support
- TypeScript SDK

---

**MarketPulse API** - Professional NSE Data Analysis Platform
© 2025 MarketPulse. Licensed under MIT License.
