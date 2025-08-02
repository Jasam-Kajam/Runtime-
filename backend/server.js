const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Load products from Statum API
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get('https://statumapi.com/api/products', {
      headers: { 'ApiKey': process.env.STATUM_API_KEY }
    });
    res.json(response.data.products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Verify Paystack payment and trigger bundle
app.post('/api/verify-payment', async (req, res) => {
  const { reference, productCode, phone } = req.body;

  try {
    // Verify payment with Paystack
    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    const status = verifyRes.data.data.status;
    const amountPaid = verifyRes.data.data.amount / 100;

    if (status === 'success') {
      // Purchase product via Statum
      const buyRes = await axios.post('https://statumapi.com/api/purchase', {
        productCode,
        phoneNumber: phone
      }, {
        headers: { 'ApiKey': process.env.STATUM_API_KEY }
      });

      if (buyRes.data.success) {
        return res.json({ message: "Top-up successful!" });
      } else {
        return res.status(500).json({ message: "Payment successful but top-up failed." });
      }
    } else {
      return res.status(400).json({ message: "Payment verification failed." });
    }
  } catch (err) {
    res.status(500).json({ message: "An error occurred during verification." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
