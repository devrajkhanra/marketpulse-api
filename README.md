# MarketPulse API

A comprehensive backend API for fetching and analyzing National Stock Exchange of India (NSE) data. Built with NestJS and TypeScript, MarketPulse provides automated data retrieval, sector performance analysis, and stock volume analytics.

## Base URL

```
http://localhost:3000
```

## Tech Stack

- **Framework**: NestJS v11
- **Language**: TypeScript v5
- **HTTP Client**: Axios
- **Data Parsing**: csv-parser
- **Validation**: class-validator, class-transformer
- **Container**: Docker

## Quick Start

### Local Development

```bash
npm install
npm run start:dev
```

### Docker

```bash
docker build -t marketpulse .
docker run -p 3000:3000 marketpulse
```

## API Reference

### 1. Date Module

#### Get Current Date

```
GET /date
```

Returns the current date in ISO format.

**Response:**

```json
"2025-10-26"
```

**Use Case**: Get server's current date for synchronization purposes.

---

### 2. NSE Module

#### Download NSE Data

```
POST /nse/download
```

Downloads daily market data from NSE for specified dates.

**Request Body:**

```json
{
  "dates": ["26102025", "25102025"]
}
```

**Date Format**: `ddmmyyyy` (e.g., 26102025 for October 26, 2025)

**Response:**

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

**Downloaded Files:**
- **Stocks Bhavdata**: Daily stock trading data (open, high, low, close, volume)
- **Indices Data**: Index closing values
- **Market Activity**: Nifty 50 top gainers/losers report

**Error Codes:**
- `400`: Invalid date format
- `404`: Data not available for the specified date
- `500`: NSE server unavailable or network error

**Frontend Usage Example:**

```javascript
const downloadData = async (dates) => {
  try {
    const response = await fetch('http://localhost:3000/nse/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Download failed:', error);
  }
};

// Download data for today and yesterday
await downloadData(['26102025', '25102025']);
```

---

### 3. Sectors Module

#### Get Sector Performance

```
GET /sectors/performance/:date
```

Retrieves top 5 gaining and losing sectors for a specific date.

**URL Parameters:**
- `date` (required): Date in `ddmmyyyy` format

**Example Request:**

```
GET /sectors/performance/26102025
```

**Response:**

```json
{
  "date": "26102025",
  "topGainers": [
    {
      "sector": "NIFTY AUTO",
      "percentageChange": 2.45,
      "open": 24500.50,
      "close": 25100.75,
      "high": 25150.00,
      "low": 24450.25
    },
    {
      "sector": "NIFTY IT",
      "percentageChange": 1.89,
      "open": 35200.00,
      "close": 35865.50,
      "high": 35900.00,
      "low": 35100.00
    },
    {
      "sector": "NIFTY PHARMA",
      "percentageChange": 1.67,
      "open": 18900.25,
      "close": 19215.75,
      "high": 19250.00,
      "low": 18850.00
    },
    {
      "sector": "NIFTY FMCG",
      "percentageChange": 1.23,
      "open": 52000.00,
      "close": 52639.60,
      "high": 52700.00,
      "low": 51900.00
    },
    {
      "sector": "NIFTY MEDIA",
      "percentageChange": 0.98,
      "open": 1850.50,
      "close": 1868.65,
      "high": 1875.00,
      "low": 1845.00
    }
  ],
  "topLosers": [
    {
      "sector": "NIFTY METAL",
      "percentageChange": -2.15,
      "open": 7200.00,
      "close": 7045.20,
      "high": 7250.00,
      "low": 7020.00
    },
    {
      "sector": "NIFTY PSU BANK",
      "percentageChange": -1.78,
      "open": 6500.50,
      "close": 6384.75,
      "high": 6520.00,
      "low": 6350.00
    },
    {
      "sector": "NIFTY REALTY",
      "percentageChange": -1.45,
      "open": 950.25,
      "close": 936.50,
      "high": 955.00,
      "low": 930.00
    },
    {
      "sector": "NIFTY ENERGY",
      "percentageChange": -0.89,
      "open": 38500.00,
      "close": 38157.35,
      "high": 38600.00,
      "low": 38100.00
    },
    {
      "sector": "NIFTY BANK",
      "percentageChange": -0.67,
      "open": 51200.00,
      "close": 50857.04,
      "high": 51300.00,
      "low": 50800.00
    }
  ]
}
```

**Frontend Usage Example:**

```javascript
const getSectorPerformance = async (date) => {
  const response = await fetch(`http://localhost:3000/sectors/performance/${date}`);
  const data = await response.json();

  // Display top gainers
  data.topGainers.forEach(sector => {
    console.log(`${sector.sector}: +${sector.percentageChange}%`);
  });

  return data;
};

await getSectorPerformance('26102025');
```

---

#### Get Sector Volume Ratio

```
GET /sectors/volume-ratio/:currentDate/:previousDate
```

Calculates volume ratios between two dates for all sectors, returning top 5 highest and lowest.

**URL Parameters:**
- `currentDate` (required): Current date in `ddmmyyyy` format
- `previousDate` (required): Previous date in `ddmmyyyy` format

**Example Request:**

```
GET /sectors/volume-ratio/26102025/25102025
```

**Response:**

```json
{
  "currentDate": "26102025",
  "previousDate": "25102025",
  "highestVolumeRatios": [
    {
      "sector": "NIFTY METAL",
      "volumeRatio": 2.34,
      "currentVolume": 1234567890,
      "previousVolume": 527606794
    },
    {
      "sector": "NIFTY IT",
      "volumeRatio": 1.87,
      "currentVolume": 987654321,
      "previousVolume": 528236000
    },
    {
      "sector": "NIFTY AUTO",
      "volumeRatio": 1.65,
      "currentVolume": 856234567,
      "previousVolume": 518930040
    },
    {
      "sector": "NIFTY PHARMA",
      "volumeRatio": 1.45,
      "currentVolume": 654321987,
      "previousVolume": 451256198
    },
    {
      "sector": "NIFTY MEDIA",
      "volumeRatio": 1.32,
      "currentVolume": 234567890,
      "previousVolume": 177703704
    }
  ],
  "lowestVolumeRatios": [
    {
      "sector": "NIFTY BANK",
      "volumeRatio": 0.45,
      "currentVolume": 345678901,
      "previousVolume": 768175336
    },
    {
      "sector": "NIFTY ENERGY",
      "volumeRatio": 0.56,
      "currentVolume": 456789012,
      "previousVolume": 815694664
    },
    {
      "sector": "NIFTY FMCG",
      "volumeRatio": 0.67,
      "currentVolume": 567890123,
      "previousVolume": 847597199
    },
    {
      "sector": "NIFTY REALTY",
      "volumeRatio": 0.78,
      "currentVolume": 123456789,
      "previousVolume": 158278447
    },
    {
      "sector": "NIFTY PSU BANK",
      "volumeRatio": 0.82,
      "currentVolume": 234567891,
      "previousVolume": 286058403
    }
  ]
}
```

**Volume Ratio Calculation:**
- `volumeRatio = currentVolume / previousVolume`
- Rounded to 2 decimal places
- Filters out sectors with negligible volume (<1000 shares)

**Interpretation:**
- Ratio > 1.0: Increased trading activity
- Ratio < 1.0: Decreased trading activity
- Ratio ≈ 1.0: Stable trading activity

**Frontend Usage Example:**

```javascript
const getVolumeRatio = async (currentDate, previousDate) => {
  const response = await fetch(
    `http://localhost:3000/sectors/volume-ratio/${currentDate}/${previousDate}`
  );
  const data = await response.json();

  // Identify sectors with surging volume
  const surgingSectors = data.highestVolumeRatios.filter(s => s.volumeRatio > 1.5);

  return data;
};

await getVolumeRatio('26102025', '25102025');
```

---

### 4. Stocks Module - Performance

#### Get Top Gainers and Losers

```
GET /performance/top-gainers-losers?date=ddmmyyyy
```

Retrieves top 5 Nifty 50 gainers and losers from the market activity report.

**Query Parameters:**
- `date` (optional): Date in `ddmmyyyy` format. If omitted, uses latest available data.

**Example Request:**

```
GET /performance/top-gainers-losers?date=26102025
```

**Response:**

```json
{
  "date": "26102025",
  "topGainers": [
    {
      "symbol": "TCS",
      "percentageChange": 4.25,
      "open": 3500.50,
      "high": 3650.00,
      "low": 3480.00,
      "close": 3648.75,
      "volume": 12345678
    },
    {
      "symbol": "INFY",
      "percentageChange": 3.87,
      "open": 1450.25,
      "high": 1505.50,
      "low": 1440.00,
      "close": 1506.35,
      "volume": 23456789
    },
    {
      "symbol": "RELIANCE",
      "percentageChange": 2.95,
      "open": 2750.00,
      "high": 2831.25,
      "low": 2735.50,
      "close": 2831.13,
      "volume": 34567890
    },
    {
      "symbol": "HDFCBANK",
      "percentageChange": 2.67,
      "open": 1650.75,
      "high": 1694.80,
      "low": 1642.00,
      "close": 1694.80,
      "volume": 45678901
    },
    {
      "symbol": "ICICIBANK",
      "percentageChange": 2.34,
      "open": 1020.50,
      "high": 1044.40,
      "low": 1015.00,
      "close": 1044.39,
      "volume": 56789012
    }
  ],
  "topLosers": [
    {
      "symbol": "TATASTEEL",
      "percentageChange": -3.45,
      "open": 145.50,
      "high": 146.00,
      "low": 140.48,
      "close": 140.48,
      "volume": 67890123
    },
    {
      "symbol": "JSWSTEEL",
      "percentageChange": -2.98,
      "open": 890.25,
      "high": 895.00,
      "low": 863.73,
      "close": 863.73,
      "volume": 78901234
    },
    {
      "symbol": "HINDALCO",
      "percentageChange": -2.67,
      "open": 625.50,
      "high": 628.00,
      "low": 608.81,
      "close": 608.81,
      "volume": 89012345
    },
    {
      "symbol": "COALINDIA",
      "percentageChange": -2.23,
      "open": 435.75,
      "high": 438.00,
      "low": 426.03,
      "close": 426.03,
      "volume": 90123456
    },
    {
      "symbol": "NTPC",
      "percentageChange": -1.89,
      "open": 340.50,
      "high": 342.00,
      "low": 334.07,
      "close": 334.07,
      "volume": 12345670
    }
  ]
}
```

**Frontend Usage Example:**

```javascript
const getTopMovers = async (date = null) => {
  const url = date
    ? `http://localhost:3000/performance/top-gainers-losers?date=${date}`
    : 'http://localhost:3000/performance/top-gainers-losers';

  const response = await fetch(url);
  const data = await response.json();

  return data;
};

// Get latest data
const latestMovers = await getTopMovers();

// Get specific date
const historicalMovers = await getTopMovers('26102025');
```

---

### 5. Stocks Module - Volume

#### Calculate Volume Differences

```
POST /volume/differences
```

Calculates volume differences for Nifty 50 stocks between two dates.

**Request Body:**

```json
{
  "dates": ["25102025", "26102025"]
}
```

**Date Order**: [previousDate, currentDate]

**Response:**

```json
[
  {
    "symbol": "RELIANCE",
    "volumeDifference": 15234567,
    "currentVolume": 45234567,
    "previousVolume": 30000000,
    "percentageChange": 50.78
  },
  {
    "symbol": "TCS",
    "volumeDifference": 8456789,
    "currentVolume": 20456789,
    "previousVolume": 12000000,
    "percentageChange": 70.47
  },
  {
    "symbol": "INFY",
    "volumeDifference": 6789012,
    "currentVolume": 29789012,
    "previousVolume": 23000000,
    "percentageChange": 29.52
  },
  {
    "symbol": "HDFCBANK",
    "volumeDifference": -5678901,
    "currentVolume": 39321099,
    "previousVolume": 45000000,
    "percentageChange": -12.62
  },
  {
    "symbol": "ICICIBANK",
    "volumeDifference": -3456789,
    "currentVolume": 52543211,
    "previousVolume": 56000000,
    "percentageChange": -6.17
  }
]
```

**Volume Difference Calculation:**
- `volumeDifference = currentVolume - previousVolume`
- Positive value: Volume increased
- Negative value: Volume decreased

**Frontend Usage Example:**

```javascript
const getVolumeDifferences = async (previousDate, currentDate) => {
  const response = await fetch('http://localhost:3000/volume/differences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates: [previousDate, currentDate] })
  });
  const data = await response.json();

  // Sort by absolute volume change
  const sortedByChange = data.sort((a, b) =>
    Math.abs(b.volumeDifference) - Math.abs(a.volumeDifference)
  );

  return sortedByChange;
};

await getVolumeDifferences('25102025', '26102025');
```

---

## Data Flow & Best Practices

### Typical Workflow

1. **Download Data First**
   ```javascript
   await fetch('http://localhost:3000/nse/download', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ dates: ['26102025', '25102025'] })
   });
   ```

2. **Query Analytics**
   ```javascript
   // Get sector performance
   const sectors = await fetch('http://localhost:3000/sectors/performance/26102025');

   // Get top movers
   const movers = await fetch('http://localhost:3000/performance/top-gainers-losers?date=26102025');

   // Get volume analysis
   const volumes = await fetch('http://localhost:3000/sectors/volume-ratio/26102025/25102025');
   ```

### Date Format Helper

```javascript
// Convert Date object to ddmmyyyy format
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// Usage
const today = formatDate(new Date());
const yesterday = formatDate(new Date(Date.now() - 86400000));

console.log(today); // "26102025"
```

### Error Handling

```javascript
const safeApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error message
    if (error.message.includes('404')) {
      return { error: 'Data not available for this date' };
    }
    return { error: 'Network error. Please try again.' };
  }
};
```

### CORS Configuration

The API uses a whitelist-based CORS policy. For local development, ensure your frontend origin is allowed in `src/main.ts`:

```typescript
// Default allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite
  'http://localhost:4200', // Angular
  'http://localhost:3001', // React
];
```

---

## Data Storage Structure

```
.data/
└── NSE-Data/
    ├── stocks/
    │   ├── cm26OCT2025bhav.csv
    │   └── cm25OCT2025bhav.csv
    ├── indices/
    │   ├── ind_close_all_26102025.csv
    │   └── ind_close_all_25102025.csv
    └── ma/
        ├── MA_26102025.csv
        └── MA_25102025.csv
```

### File Contents

**Stocks Bhavdata** (cm{DD}{MMM}{YYYY}bhav.csv):
- Symbol, Open, High, Low, Close, Volume, Turnover, etc.
- All NSE-listed stocks (2000+ entries)

**Indices Data** (ind_close_all_{ddmmyyyy}.csv):
- Index Name, Open, High, Low, Close
- All NSE indices (Nifty 50, Bank Nifty, sectoral indices, etc.)

**Market Activity** (MA_{ddmmyyyy}.csv):
- Nifty 50 stocks with daily performance
- Pre-filtered for top gainers/losers

---

## Frontend Integration Examples

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function MarketDashboard() {
  const [sectorPerformance, setSectorPerformance] = useState(null);
  const [topMovers, setTopMovers] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const today = formatDate(new Date());

      // Download data first
      await fetch('http://localhost:3000/nse/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: [today] })
      });

      // Fetch analytics
      const sectorsRes = await fetch(
        `http://localhost:3000/sectors/performance/${today}`
      );
      const moversRes = await fetch(
        `http://localhost:3000/performance/top-gainers-losers?date=${today}`
      );

      setSectorPerformance(await sectorsRes.json());
      setTopMovers(await moversRes.json());
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Top Gaining Sectors</h2>
      {sectorPerformance?.topGainers.map(sector => (
        <div key={sector.sector}>
          {sector.sector}: +{sector.percentageChange}%
        </div>
      ))}

      <h2>Top Stock Gainers</h2>
      {topMovers?.topGainers.map(stock => (
        <div key={stock.symbol}>
          {stock.symbol}: +{stock.percentageChange}%
        </div>
      ))}
    </div>
  );
}
```

### Vue Component Example

```vue
<template>
  <div class="market-dashboard">
    <h2>Sector Performance</h2>
    <div v-for="sector in topGainers" :key="sector.sector">
      {{ sector.sector }}: +{{ sector.percentageChange }}%
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      topGainers: []
    };
  },
  async mounted() {
    const today = this.formatDate(new Date());
    const response = await fetch(
      `http://localhost:3000/sectors/performance/${today}`
    );
    const data = await response.json();
    this.topGainers = data.topGainers;
  },
  methods: {
    formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}${month}${year}`;
    }
  }
};
</script>
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MarketService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  downloadData(dates: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/nse/download`, { dates });
  }

  getSectorPerformance(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sectors/performance/${date}`);
  }

  getTopMovers(date?: string): Observable<any> {
    const url = date
      ? `${this.baseUrl}/performance/top-gainers-losers?date=${date}`
      : `${this.baseUrl}/performance/top-gainers-losers`;
    return this.http.get(url);
  }

  getVolumeRatio(currentDate: string, previousDate: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/sectors/volume-ratio/${currentDate}/${previousDate}`
    );
  }
}
```

---

## Common Use Cases

### 1. Daily Market Dashboard

Display today's top gainers, losers, and sector performance:

```javascript
const buildDashboard = async () => {
  const today = formatDate(new Date());

  // Download today's data
  await fetch('http://localhost:3000/nse/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates: [today] })
  });

  // Fetch all metrics
  const [sectors, stocks] = await Promise.all([
    fetch(`http://localhost:3000/sectors/performance/${today}`).then(r => r.json()),
    fetch(`http://localhost:3000/performance/top-gainers-losers?date=${today}`).then(r => r.json())
  ]);

  return { sectors, stocks };
};
```

### 2. Volume Surge Detection

Identify stocks/sectors with unusual volume activity:

```javascript
const detectVolumeSurges = async () => {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // Download both dates
  await fetch('http://localhost:3000/nse/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates: [yesterday, today] })
  });

  // Get sector volume ratios
  const sectorVolumes = await fetch(
    `http://localhost:3000/sectors/volume-ratio/${today}/${yesterday}`
  ).then(r => r.json());

  // Get stock volume differences
  const stockVolumes = await fetch('http://localhost:3000/volume/differences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates: [yesterday, today] })
  }).then(r => r.json());

  // Filter for significant surges (>50% increase)
  const surgingSectors = sectorVolumes.highestVolumeRatios.filter(
    s => s.volumeRatio > 1.5
  );
  const surgingStocks = stockVolumes.filter(
    s => s.percentageChange > 50
  );

  return { surgingSectors, surgingStocks };
};
```

### 3. Historical Comparison

Compare performance across multiple dates:

```javascript
const compareHistorical = async (dates) => {
  // Download all dates
  await fetch('http://localhost:3000/nse/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates })
  });

  // Fetch performance for each date
  const performances = await Promise.all(
    dates.map(date =>
      fetch(`http://localhost:3000/sectors/performance/${date}`)
        .then(r => r.json())
    )
  );

  return performances;
};

// Compare last 5 trading days
const last5Days = Array.from({ length: 5 }, (_, i) => {
  const date = new Date(Date.now() - i * 86400000);
  return formatDate(date);
});

const comparison = await compareHistorical(last5Days);
```

---

## Performance Optimization

### Caching Strategy

```javascript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cachedFetch = async (url) => {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });

  return data;
};
```

### Batch Requests

```javascript
const fetchAllMetrics = async (date) => {
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  const [sectors, stocks, volumeRatios, volumeDiffs] = await Promise.all([
    fetch(`http://localhost:3000/sectors/performance/${date}`),
    fetch(`http://localhost:3000/performance/top-gainers-losers?date=${date}`),
    fetch(`http://localhost:3000/sectors/volume-ratio/${date}/${yesterday}`),
    fetch('http://localhost:3000/volume/differences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: [yesterday, date] })
    })
  ]).then(responses => Promise.all(responses.map(r => r.json())));

  return { sectors, stocks, volumeRatios, volumeDiffs };
};
```

---

## Development Scripts

```json
{
  "lint": "eslint 'src/**/*.{ts,tsx}'",
  "format": "prettier --write 'src/**/*.{ts,tsx,json,md}'",
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

---

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:cov
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

---

## Troubleshooting

### Common Issues

**1. Data Not Available (404 Error)**
- NSE doesn't publish data on holidays/weekends
- Data is typically available after 6 PM IST on trading days
- Solution: Check NSE holiday calendar, use previous trading day

**2. CORS Errors**
- Frontend origin not whitelisted
- Solution: Add your frontend URL to `allowedOrigins` in `src/main.ts`

**3. Download Fails**
- NSE servers may be temporarily unavailable
- Network connectivity issues
- Solution: Retry after some time, check network connection

**4. Invalid Date Format**
- Wrong date format provided
- Solution: Use `ddmmyyyy` format (e.g., 26102025)

---

## API Rate Limits

- No built-in rate limiting currently
- NSE servers may throttle excessive requests
- Recommended: Cache responses, avoid rapid repeated calls
- Best practice: Download data once per day, cache analytics results

---

## Deployment

### Production Environment

1. Build the application:
```bash
npm run build
```

2. Start in production mode:
```bash
npm run start:prod
```

### Docker Production

```bash
docker build -t marketpulse:prod .
docker run -p 3000:3000 --env-file .env marketpulse:prod
```

### Cloud Deployment

Compatible with:
- Google Cloud Run
- AWS Fargate
- Azure Container Instances
- Heroku
- Railway
- Render

---

## License

MIT

---

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API response error messages

---

## Roadmap

- Database integration (PostgreSQL/Supabase)
- WebSocket support for real-time updates
- Historical data storage and querying
- Technical indicators (RSI, MACD, Moving Averages)
- Automated daily data fetching scheduler
- API authentication and rate limiting
- GraphQL API option
