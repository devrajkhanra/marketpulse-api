MarketPulse: NSE Data Fetcher and Analyzer
Overview
MarketPulse is a NestJS-based backend application designed to fetch, store, and analyze data from the National Stock Exchange of India (NSE). It automates the downloading of daily CSV files containing stock bhavdata, indices closing data, market activity reports, and the Nifty 50 stock list. The application processes this data to provide insights such as top gainers and losers from the Nifty 50 index and volume ratio differences between trading days.
The application uses file-based storage for downloaded CSVs (saved to a desktop folder) and includes a PostgreSQL database integration via TypeORM, although the current implementation primarily relies on file operations rather than database storage. This could be extended in the future for persistent data management.
Key features include:

Downloading historical NSE data for specified dates.
Retrieving the last successfully downloaded date.
Extracting top 5 gainers and losers from market activity reports.
Calculating volume ratios for Nifty 50 stocks between two dates.
Simple date utilities for current date and details.

This project is ideal for developers, traders, or analysts interested in NSE data automation and basic stock market analytics.
Table of Contents

Overview
Features
Architecture
Prerequisites
Installation
Configuration
Running the Application
API Endpoints

Date Module
NSE Module
Performance Module
Volume Module

Data Storage and Management
Error Handling and Logging
Dependencies
Testing
Contributing
License
Troubleshooting
Future Enhancements

Features

Data Downloading: Fetch CSV files from NSE archives for stocks, indices, market activity (MA), and Nifty 50 list. Supports multiple dates in ddmmyyyy format. Skips invalid dates (e.g., holidays) gracefully.
Date Management: Stores and retrieves the last successfully downloaded date using a local JSON file.
Performance Analysis: Parses market activity CSVs to extract top 5 Nifty 50 gainers and losers, including their percentage changes.
Volume Analysis: Calculates the ratio of trading volumes for Nifty 50 stocks between two specified dates.
Date Utilities: Provides endpoints for current date and detailed date information (including day of week).
CORS Enabled: Allows cross-origin requests for easy integration with frontend applications.
Validation: Uses class-validator for input validation on date arrays (ddmmyyyy format).
Logging: Utilizes NestJS Logger for tracking operations, warnings, and errors.
File System Integration: Creates directories on the user's desktop for organized storage of downloaded CSVs.

Architecture
The application is structured as a modular NestJS project:

Modules:

AppModule: Root module importing all others, including TypeORM for PostgreSQL.
DateModule: Handles date-related utilities.
NseModule: Manages downloading NSE CSVs.
PerformanceModule: Analyzes market activity for gainers/losers.
VolumeModule: Computes volume ratios.

Services:

AppService: Basic hello world service.
DateService: Provides current date and details.
NseService: Downloads CSVs, ensures folder structure, handles errors (e.g., 404 for missing files).
PerformanceService: Parses MA CSVs to find top gainers/losers.
VolumeService: Parses stock CSVs and Nifty list to calculate volume ratios.

Controllers:

AppController: Root endpoint for hello world.
DateController: Endpoints for date info.
NseController: Endpoints for downloading data and getting last date.
PerformanceController: Endpoint for gainers/losers.
VolumeController: Endpoint for volume differences.

DTOs:

DateDto: For date details (date, dayOfWeek).
DateArrayDto: For validating arrays of dates in ddmmyyyy format.

Utilities:

date-store.ts: Simple JSON-based storage for last successful date.

Database: Configured for PostgreSQL but not actively used in current logic. Entities are auto-loaded but none are defined in provided files.

Data flow:

User requests downloads via /nse/download with dates.
Service fetches URLs, saves to desktop folders, updates last date.
Analysis endpoints read from saved files.

Prerequisites

Node.js (v14+ recommended)
npm or yarn
PostgreSQL database (running on localhost:5432 with user 'postgres', password 'root', database 'marketpulse')
Internet access for downloading NSE data
Operating system with desktop folder access (tested on macOS/Linux/Windows via os.homedir())

Note: The database is configured but not utilized; you can disable TypeORM if not needed.
Installation

Clone the repository:
git clone <repository-url>
cd marketpulse

Install dependencies:
npm install

or

yarn install

Set up the PostgreSQL database:

Create a database named marketpulse.
Ensure user postgres with password root has access.
(Optional) If using entities, run migrations; currently, none exist.

(Optional) Update database credentials in app.module.ts for production.

Configuration

Environment Variables:

PORT: Server port (defaults to 3000).

File Paths:

Downloads saved to ~/Desktop/NSE-Data/ with subfolders: stocks, indices, ma, broad.
Last date stored in src/nse/utils/last-success.json.

NSE URLs (hardcoded in nse.service.ts):

Stocks: https://archives.nseindia.com/products/content/sec_bhavdata_full_${date}.csv
Indices: https://archives.nseindia.com/content/indices/ind_close_all_${date}.csv
MA: https://archives.nseindia.com/archives/equities/mkt/MA${shortDate}.csv (shortDate = ddmmyy)
Broad: https://archives.nseindia.com/content/indices/ind_nifty50list.csv

Warning: NSE URLs may change; monitor for updates.

Production Notes:

Set synchronize: false in TypeORM config.
Use environment variables for DB creds.
Consider cloud storage instead of desktop for files.

Running the Application

Start the server:
npm run start

or for development with hot-reload:
npm run start:dev

The app listens on http://localhost:3000 (or custom PORT).
Test the root endpoint:
curl http://localhost:3000/

Response: "Hello World!"

API Endpoints
All endpoints are under http://localhost:3000/. Use tools like Postman or curl for testing.
Date Module

GET /date

Description: Get the current date in YYYY-MM-DD format.
Response: string (e.g., "2025-09-29")

GET /date/details

Description: Get current date details.
Response: JSON { date: "YYYY-MM-DD", dayOfWeek: "Monday" }

NSE Module

POST /nse/download

Description: Download CSVs for specified dates (ddmmyyyy). Skips unavailable dates. Also downloads Nifty 50 list once.
Body: JSON { "dates": ["ddmmyyyy", "ddmmyyyy"] } (array of strings, validated for 8-digit format)
Response: Array of saved file paths (e.g., ["/Users/user/Desktop/NSE-Data/stocks/29092025.csv", ...])
Notes: Creates folders if needed. Updates last successful date.

GET /nse/last-date

Description: Get the last successfully downloaded date (ddmmyyyy).
Response: string or null

Performance Module

GET /performance/top-gainers-losers

Description: Get top 5 Nifty 50 gainers and losers.
Query Params: date (optional, ddmmyyyy; defaults to latest available file)
Response: JSON { topGainers: [{ symbol: "ABC", percentage: 5.2 }, ...], topLosers: [...] }
Notes: Parses the latest (or specified) MA CSV. Throws 404 if file not found.

Volume Module

POST /volume/differences

Description: Calculate volume ratios for Nifty 50 stocks between two dates.
Body: JSON { "dates": ["prev_ddmmyyyy", "latest_ddmmyyyy"] }
Response: Array of { symbol: "ABC", difference: "1.50" } (sorted by symbol)
Notes: Requires exactly two dates. Uses stock CSVs and Nifty list. Throws error if files missing.

Data Storage and Management

Folders Created:

~/Desktop/NSE-Data/stocks/: Daily stock bhavdata CSVs.
~/Desktop/NSE-Data/indices/: Daily indices closing CSVs.
~/Desktop/NSE-Data/ma/: Daily market activity CSVs.
~/Desktop/NSE-Data/broad/: Nifty 50 list CSV (static).

File Naming: ${date}.csv for date-specific files; nifty50list.csv for broad.
Parsing Logic:

Performance: Scans MA CSV for "Top Five Nifty 50 Gainers/Losers" sections, extracts symbol and % change.
Volume: Parses stock CSVs for EQ series TTL_SHARES, filters to Nifty 50, computes latest/prev ratio.

Date Format: All dates in ddmmyyyy (e.g., 29092025). Internal parsing converts to Date objects.

Error Handling and Logging

Common Errors:

404 from NSE: Logged as warning, date skipped.
File not found: Throws NotFoundException or Error.
Invalid input: ValidationPipe enforces date format.

Logging: Uses NestJS Logger in services for info, warnings, errors.

Dependencies

@nestjs/common, @nestjs/core, @nestjs/typeorm
typeorm, pg (for PostgreSQL)
axios (for HTTP downloads)
class-validator, class-transformer (for DTO validation)
fs, path, os (Node.js built-ins)
Dev: @nestjs/cli, typescript, etc.

Full list in package.json.
Testing

Unit tests: Add with Jest (configured in NestJS).
E2E tests: Use Supertest for API endpoints.
Manual: Download data, then query analysis endpoints.

Example test flow:

POST /nse/download with dates.
GET /performance/top-gainers-losers.
POST /volume/differences with two dates.

Contributing

Fork the repo.
Create feature branches.
Submit PRs with clear descriptions.
Follow code style (Prettier/ESLint if configured).

License
MIT License. See LICENSE file (add one if missing).
Troubleshooting

Folder Creation Issues: Ensure write permissions on desktop.
DB Connection Fail: Check Postgres running, creds match.
Download Fails: Verify internet; NSE may block IPs or change URLs.
Date Format Errors: Use exactly ddmmyyyy; validation will catch.
No Data Files: Run downloads first before analysis.
Axios Errors: Handle network issues in code.

Future Enhancements

Integrate database: Store parsed data in entities for querying.
Scheduler: Auto-download daily via cron.
More Analytics: Add charts, trends, or ML predictions.
Authentication: Secure endpoints.
Frontend: Build a UI for visualization.
Error Notifications: Email/Slack on failures.
Broader Indices: Support beyond Nifty 50.
Cloud Deployment: AWS/GCP for scalability.
