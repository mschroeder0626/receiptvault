const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReceiptVault Proxy' });
});

// Claude API proxy
app.post('/api/claude', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy request failed', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ReceiptVault proxy running on port ${PORT}`);
});
