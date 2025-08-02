import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Get Statum access token
async function getStatumToken() {
  const key = process.env.STATUM_CONSUMER_KEY;
  const secret = process.env.STATUM_CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await axios.post("https://api.statum.co.ke/api/token", null, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return res.data.access_token;
}

// Get products
app.get("/api/products", async (req, res) => {
  try {
    const token = await getStatumToken();

    const response = await axios.get("https://api.statum.co.ke/api/v2/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Paystack webhook and post-payment delivery will be added later
// Placeholder POST endpoint for /api/verify-and-send

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));