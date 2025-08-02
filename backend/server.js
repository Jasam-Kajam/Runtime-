require('dotenv').config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get("https://statumapi.com/api/products", {
      headers: {
        ApiKey: process.env.STATUM_API_KEY
      }
    });

    res.json(response.data.products || []);
  } catch (error) {
    console.error("❌ Failed to fetch Statum products:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch products from Statum." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});