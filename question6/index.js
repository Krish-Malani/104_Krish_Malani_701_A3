const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PRIMARY_API_BASE = 'https://api.frankfurter.dev/v1';
const FALLBACK_API_BASE = 'https://api.frankfurter.app';

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/currencies', async (req, res) => {
  try {
    let response;
    try {
      response = await fetch(`${PRIMARY_API_BASE}/currencies`);
    } catch (e) {
      response = await fetch(`${FALLBACK_API_BASE}/currencies`);
    }

    if (!response.ok) {
      throw new Error(`Currencies API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching currencies in backend:', err.message);
    res.json({
      USD: 'United States Dollar',
      EUR: 'Euro',
      INR: 'Indian Rupee',
      GBP: 'British Pound',
      JPY: 'Japanese Yen',
      CAD: 'Canadian Dollar',
      AUD: 'Australian Dollar',
      SGD: 'Singapore Dollar',
      CHF: 'Swiss Franc',
      CNY: 'Chinese Renminbi'
    });
  }
});

app.get('/api/convert-backend', async (req, res) => {
  const amount = parseFloat(req.query.amount) || 1;
  const from = (req.query.from || 'USD').toUpperCase();
  const to = (req.query.to || 'INR').toUpperCase();

  if (from === to) {
    return res.json({
      source: 'Backend (Express Server)',
      amount: amount,
      from: from,
      to: to,
      rate: 1,
      result: amount,
      date: new Date().toISOString().split('T')[0]
    });
  }

  try {
    const url = `${PRIMARY_API_BASE}/latest?amount=${amount}&from=${from}&to=${to}`;
    let response;

    try {
      response = await fetch(url);
    } catch (netErr) {
      const fallbackUrl = `${FALLBACK_API_BASE}/latest?amount=${amount}&from=${from}&to=${to}`;
      response = await fetch(fallbackUrl);
    }

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `External API error (${response.status}): ${errText}`
      });
    }

    const data = await response.json();
    const rate = data.rates[to] ? (data.rates[to] / amount) : 1;
    const result = data.rates[to];

    res.json({
      source: 'Backend (Node.js Express Server -> Frankfurter API)',
      amount: amount,
      from: from,
      to: to,
      rate: rate,
      result: result,
      date: data.date
    });
  } catch (err) {
    console.error('Backend conversion failed:', err.message);
    res.status(500).json({
      error: 'Backend failed to convert currency: ' + err.message
    });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Question 6 Currency Converter running at http://localhost:${PORT}`);
  }
});
