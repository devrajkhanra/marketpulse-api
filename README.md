
# MarketPulse: NSE Data Fetcher and Analyzer

## Overview

MarketPulse is a robust backend application built with NestJS, designed to fetch, store, and analyze daily data from the National Stock Exchange of India (NSE). It automates the process of downloading daily CSV files, including stock bhavdata, indices closing data, and market activity reports. The application processes this data to provide valuable insights, such as identifying the top-performing sectors, top Nifty 50 gainers and losers, and volume analysis for both individual stocks and entire market sectors.

The application is structured to be modular and scalable, with dedicated modules for handling date utilities, NSE data fetching, stock-specific analysis, and sector-specific metrics. It uses a file-based storage system, organizing downloaded data into a structured directory on the user's desktop. This makes it an ideal tool for developers, traders, and financial analysts who require automated access to NSE data and insightful market analytics.

## Key Features

- **Automated Data Downloading**: Fetches daily CSV files from the NSE archives for stocks, indices, and market activity.
- **Sector Performance Analysis**: Identifies the top 5 gaining and losing market sectors for a given day based on percentage change.
- **Sector Volume Analysis**: Calculates the volume ratio for market sectors between two dates, highlighting the top 5 with the highest and lowest ratios. This analysis filters out sectors with insignificant trading volume to provide more meaningful data.
- **Nifty 50 Stock Performance**: Extracts the top 5 gainers and losers from the Nifty 50 index based on daily market reports.
- **Nifty 50 Stock Volume Analysis**: Calculates volume differences for individual Nifty 50 stocks between two dates.
- **Date Management**: Keeps track of the last successfully downloaded date to ensure data consistency.
- **CORS Enabled**: Allows cross-origin requests for easy integration with frontend applications.
- **Modular Architecture**: A clean, modular structure that separates concerns, making the application easy to maintain and extend.

## Tech Stack

- **Framework**: NestJS
- **Programming Language**: TypeScript
- **HTTP Client**: Axios (for fetching data from NSE)
- **Data Parsing**: csv-parser
- **Validation**: class-validator, class-transformer

## System Architecture

The application follows a modular architecture, with each module responsible for a specific set of functionalities:

- **AppModule**: The root module that integrates all other modules.
- **DateModule**: Provides utility functions for handling dates.
- **NseModule**: Manages the downloading of CSV files from the NSE.
- **SectorsModule**: Responsible for all sector-specific analysis, including performance and volume ratios.
- **StocksModule**: Handles all stock-specific analysis, including performance and volume for Nifty 50 stocks.

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Internet access to download data from the NSE website.

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd marketpulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run start:dev
   ```
   The application will be available at `http://localhost:3000`.

## API Endpoints

### Date Module

- **GET /date**
  - **Description**: Retrieves the current date in `YYYY-MM-DD` format.
  - **Response**: A string representing the current date.

### NSE Module

- **POST /nse/download**
  - **Description**: Downloads daily reports from the NSE for the provided dates.
  - **Body**: `{ "dates": ["ddmmyyyy", ...] }`
  - **Response**: An array of file paths for the downloaded reports.

### Sectors Module

- **GET /sectors/performance/:date**
  - **Description**: Retrieves the top 5 gaining and losing market sectors for a given date.
  - **URL Params**: `date` (in `ddmmyyyy` format).
  - **Response**: `GetSectorPerformanceResponseDto`

- **GET /sectors/volume-ratio/:currentDate/:previousDate**
  - **Description**: Calculates the volume ratio for all major market sectors and returns the top 5 with the highest and lowest ratios. The calculation filters out sectors with insignificant trading volume and rounds the ratio to two decimal places.
  - **URL Params**: `currentDate`, `previousDate` (in `ddmmyyyy` format).
  - **Response**: `GetSectorVolumeRatioResponseDto`

### Stocks Module

- **GET /performance/top-gainers-losers**
  - **Description**: Retrieves the top 5 Nifty 50 gainers and losers for a specific date.
  - **Query Params**: `date` (optional, in `ddmmyyyy` format). Defaults to the latest available data.
  - **Response**: A JSON object with `topGainers` and `topLosers` arrays.

- **POST /volume/differences**
  - **Description**: Calculates the volume differences for individual Nifty 50 stocks between two dates.
  - **Body**: `{ "dates": ["previous_date", "current_date"] }` (in `ddmmyyyy` format).
  - **Response**: An array of objects containing the stock symbol and the calculated volume difference.

## Data Storage

- **File-Based Storage**: The application stores downloaded CSV files on the user's desktop in a structured folder format:
  - `~/Desktop/NSE-Data/indices/`: For index data.
  - `~/Desktop/NSE-Data/ma/`: For market activity reports.
  - `~/Desktop/NSE-Data/stocks/`: For stock bhavdata.

- **Date Tracking**: The last successfully downloaded date is stored in a JSON file to maintain data consistency.

## Running the Application

To run the application in development mode with hot-reloading:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` by default. You can test the root endpoint with a `GET` request to `/`, which should return "Hello World!".

## Error Handling

The application includes robust error handling:

- **404 Not Found**: Thrown when data for a specific date is not available on the NSE servers.
- **ValidationPipe**: Ensures that all API inputs conform to the expected format.
- **Logging**: The NestJS Logger is used to provide detailed logs for tracking and debugging.

## Future Enhancements

- **Database Integration**: Implement a database (e.g., PostgreSQL) to store and manage parsed data for more complex querying and historical analysis.
- **Automated Daily Downloads**: Add a scheduler (e.g., using a cron job) to automate the daily data fetching process.
- **Expanded Analytics**: Introduce more advanced analytics, such as trend analysis, moving averages, and volatility calculations.
- **Authentication**: Secure the API endpoints with an authentication layer to control access.

## Contributing

Contributions are welcome! If you would like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License.
