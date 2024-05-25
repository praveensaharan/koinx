const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const Trade = require("./models/Trade");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

const uri = process.env.Mongourl;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const database = client.db("cryptoDB");

app.post("/upload/trade", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const trades = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on("data", (row) => {
      const [base_coin, quote_coin] = row["Market"].split("/");
      trades.push({
        user_id: parseInt(row["User_ID"]),
        utc_time: new Date(row["UTC_Time"].replace(/-/g, "/")),
        operation: row["Operation"],
        market: row["Market"],
        base_coin,
        quote_coin,
        amount: parseFloat(row["Buy/Sell Amount"]),
        price: parseFloat(row["Price"]),
      });
    })
    .on("end", async () => {
      try {
        await processTrades(trades);
        res.status(201).json({ message: "File successfully processed" });
      } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).json({ error: "Error saving to database" });
      } finally {
        fs.unlinkSync(file.path);
      }
    })
    .on("error", (error) => {
      console.log("Error reading the file:", error);
      res.status(500).json({ error: "Error reading the file" });
    });
});

async function processTrades(data) {
  try {
    await Trade.deleteMany({});
    await Trade.insertMany(data);
    const balancesCollection = database.collection(`balances`);
    await balancesCollection.deleteMany({});

    let balances = {};

    for (const record of data) {
      const timestamp = record.utc_time;
      const operation = record.operation;
      const amount = record.amount;
      const asset = record.base_coin;

      if (!balances[asset]) {
        balances[asset] = 0;
      }

      if (operation === "Buy") {
        balances[asset] += amount;
      } else if (operation === "Sell") {
        balances[asset] -= amount;
      }

      await balancesCollection.insertOne({
        Timestamp: timestamp,
        Balances: { ...balances },
      });
    }
  } catch (error) {
    console.error("Error in Hello function:", error);
  } finally {
    await client.close();
  }
}

app.post("/time", async (req, res) => {
  try {
    const { timestamp } = req.body;
    if (!timestamp) {
      return res.status(400).json({ error: "Timestamp field is required" });
    }

    const balancesCollection = database.collection(`balances`);
    const parsedTimestamp = new Date(timestamp);
    const balanceSnapshot = await balancesCollection.findOne(
      { Timestamp: { $lte: parsedTimestamp } },
      { sort: { Timestamp: -1 } }
    );

    if (balanceSnapshot) {
      res.json(balanceSnapshot.Balances);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error("Error in getAssetBalancesAtTimestamp function:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
