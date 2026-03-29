const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve index.html with injected Supabase config
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  // Inject config before the app script
  const configScript = `<script>
    window.__SUPABASE_URL__ = "${SUPABASE_URL}";
    window.__SUPABASE_ANON_KEY__ = "${SUPABASE_ANON_KEY}";
  </script>`;
  html = html.replace('</head>', configScript + '\n</head>');
  res.type('html').send(html);
});

// Serve static files (for any future assets)
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReceiptVault', supabase: !!SUPABASE_URL });
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

// SPA catch-all: serve index.html for any unmatched GET route
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.type('html').send(fs.readFileSync(indexPath, 'utf8'));
  } else {
    res.status(404).send('index.html not found');
  }
});

app.listen(PORT, () => {
  console.log(`ReceiptVault running on port ${PORT}`);
  console.log(`Supabase: ${SUPABASE_URL ? 'configured' : 'NOT configured'}`);
});
