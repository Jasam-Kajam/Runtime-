const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load Statum products
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get('https://statumapi.com/api/products', {
      headers: { 'ApiKey': process.env.STATUM_API_KEY }
    });
    res.json(response.data.products || []);
  } catch (err) {
    console.error('Statum fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// Verify Paystack payment and top up
app.post('/api/verify-payment', async (req, res) => {
  const { reference, productCode, phone } = req.body;
  try {
    const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    const data = verifyRes.data.data;
    if (data.status === 'success') {
      const buyRes = await axios.post('https://statumapi.com/api/purchase', {
        productCode,
        phoneNumber: phone
      }, {
        headers: { 'ApiKey': process.env.STATUM_API_KEY }
      });

      if (buyRes.data.success) {
        return res.json({ message: 'Top-up successful!' });
      } else {
        return res.status(500).json({ message: 'Payment verified but Statum purchase failed.' });
      }
    } else {
      return res.status(400).json({ message: 'Payment not verified.' });
    }
  } catch (err) {
    console.error('Verify/Top-up error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Error verifying payment or topping up.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));