require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const scrapers = {
  tokopedia : require('./scrapers/tokopedia'),
  shopee    : require('./scrapers/shopee'),
  lazada    : require('./scrapers/lazada'),
  tiktokshop: require('./scrapers/tiktokshop'),
};

const VALID_SOURCES = Object.keys(scrapers);

// ================================================
// POST /search
// Body: { "keyword": "buku", "source": "all" }
// ================================================
app.post('/search', async (req, res) => {
  const { keyword, source = 'all' } = req.body;

  if (!keyword) {
    return res.status(400).json({ success: false, error: 'keyword wajib diisi' });
  }

  const targets = source === 'all' ? VALID_SOURCES : [source];

  if (!targets.every(s => VALID_SOURCES.includes(s))) {
    return res.status(400).json({
      success: false,
      error: `source tidak valid. Pilihan: all, ${VALID_SOURCES.join(', ')}`
    });
  }

  try {
    const results = {};

    await Promise.allSettled(
      targets.map(async (src) => {
        try {
          results[src] = await scrapers[src].search(keyword);
        } catch (e) {
          results[src] = { error: e.message };
        }
      })
    );

    const total = Object.values(results)
      .filter(Array.isArray)
      .flat().length;

    return res.json({ success: true, keyword, source, total, data: results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================
// POST /detail
// Body: { "url": "https://...", "source": "tokopedia" }
// ================================================
app.post('/detail', async (req, res) => {
  const { url, source } = req.body;

  if (!url || !source) {
    return res.status(400).json({ success: false, error: 'url dan source wajib diisi' });
  }

  if (!VALID_SOURCES.includes(source)) {
    return res.status(400).json({
      success: false,
      error: `source tidak valid. Pilihan: ${VALID_SOURCES.join(', ')}`
    });
  }

  try {
    const data = await scrapers[source].detail(url);
    return res.json({ success: true, source, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================
// GET /search/:source?keyword=buku
// ================================================
app.get('/search/:source', async (req, res) => {
  const { source } = req.params;
  const { keyword } = req.query;

  if (!keyword) return res.status(400).json({ success: false, error: 'keyword wajib diisi' });
  if (!VALID_SOURCES.includes(source)) {
    return res.status(400).json({ success: false, error: 'source tidak valid' });
  }

  try {
    const data = await scrapers[source].search(keyword);
    return res.json({ success: true, source, keyword, total: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status   : 'ok',
    sources  : VALID_SOURCES,
    endpoints: {
      search_post  : 'POST /search  → body: { keyword, source }',
      search_get   : 'GET  /search/:source?keyword=...',
      detail_post  : 'POST /detail  → body: { url, source }',
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Scraper API berjalan di http://localhost:${PORT}`);
  console.log(`📌 Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/search`);
  console.log(`   POST http://localhost:${PORT}/detail`);
  console.log(`   GET  http://localhost:${PORT}/search/tokopedia?keyword=buku`);
  console.log(`   GET  http://localhost:${PORT}/health\n`);
});