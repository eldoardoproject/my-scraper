const cheerio = require('cheerio');
const { getHTML } = require('../utils/headlessx');

async function search(keyword) {
  const url = `https://www.lazada.co.id/catalog/?q=${encodeURIComponent(keyword)}`;
  console.log(`🔍 [Lazada] Scraping: "${keyword}"...`);
  const html = await getHTML(url);
  const $ = cheerio.load(html);
  const products = [];

  $('[data-tracking="product-card"]').each((i, el) => {
    const name     = $(el).find('[class*="title"]').first().text().trim();
    const price    = $(el).find('[class*="price"]').first().text().trim();
    const store    = $(el).find('[class*="seller"]').text().trim();
    const location = $(el).find('[class*="location"]').text().trim();
    const rating   = $(el).find('[class*="rating"]').text().trim();
    const sold     = $(el).find('[class*="sold"]').text().trim();
    const image    = $(el).find('img').attr('src') || '';
    const link     = $(el).find('a').attr('href') || '';

    if (name) products.push({
      name, price, store, location, rating, sold, image,
      link: link.startsWith('http') ? link : 'https:' + link
    });
  });

  console.log(`✅ [Lazada] Ditemukan ${products.length} produk`);
  return products;
}

async function detail(url) {
  console.log(`🔍 [Lazada] Detail: ${url}`);
  const html = await getHTML(url);
  const $ = cheerio.load(html);

  return {
    name     : $('[class*="pdp-product-title"]').text().trim(),
    price    : $('[class*="pdp-price"]').first().text().trim(),
    store    : $('[class*="seller-name"]').text().trim(),
    location : $('[class*="location"]').text().trim(),
    rating   : $('[class*="score-average"]').text().trim(),
    sold     : $('[class*="sold"]').text().trim(),
    image    : $('.pdp-mod-product-badge-wrapper img').attr('src') || '',
    link     : url
  };
}

module.exports = { search, detail };