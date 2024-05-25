# Crypto Trade API

This project is a Node.js application using Express, Mongoose, Multer, and csv-parser to handle file uploads, parse CSV data, and interact with a MongoDB database. The application provides endpoints for uploading trade data and retrieving asset balances at specific timestamps. You can access the deployed API at [https://koinx-assignment.azurewebsites.net/](https://koinx-assignment.azurewebsites.net/) with the endpoints `/upload/trade` and `/time`.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Example CSV Format](#example-csv-format)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm.
- You have a MongoDB instance running and accessible.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/praveensaharan/koinx.git
    cd koinx
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory of the project and add the following environment variables:
    ```env
    PORT=3000
    Mongourl=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cryptoDB?retryWrites=true&w=majority
    ```

2. Replace the placeholder with your actual MongoDB connection string.

## Usage

1. Start the server:
    ```sh
    node index.js
    ```

2. The server will run on the port specified in your `.env` file (default is `3000`). You can access it at `http://localhost:3000`.

## API Endpoints

### POST /upload/trade

Upload a CSV file containing trade data.

- **Request**:
  - `Content-Type: multipart/form-data`
  - File field name: `file`

- **Response**:
  - `201 Created` on success
  - `400 Bad Request` if no file is uploaded
  - `500 Internal Server Error` on server errors

### POST /time

Retrieve asset balances at a specific timestamp.

- **Request**:
  - `Content-Type: application/json`
  - Body:
    ```json
    {
      "timestamp": "2024-05-20T14:48:00.000Z"
    }
    ```

- **Response**:
  - `200 OK` with balances if found
  - `400 Bad Request` if `timestamp` field is missing
  - `500 Internal Server Error` on server errors

### GET /

A simple endpoint to verify the server is running.

- **Response**:
  - `200 OK` with "Hello World"

## Example CSV Format

The uploaded CSV file should have the following columns:

- User_ID
- UTC_Time
- Operation
- Market
- Buy/Sell Amount
- Price

Example:

```csv
User_ID,UTC_Time,Operation,Market,Buy/Sell Amount,Price
1,2024-05-20 14:48:00,Buy,BTC/USD,0.5,40000
2,2024-05-20 14:49:00,Sell,ETH/USD,1,3000
