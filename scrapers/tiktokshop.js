const cheerio = require('cheerio');
const { getHTML } = require('../utils/headlessx');

async function search(keyword) {
  const url = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}&type=product`;
  console.log(`🔍 [TiktokShop] Scraping: "${keyword}"...`);

  const res  = await getHTML(url);
  const html = res.html || res;
  const $    = cheerio.load(html);
  const products = [];

  $('[class*="product-item"], [class*="ProductCard"]').each((i, el) => {
    const name   = $(el).find('[class*="title"], [class*="name"]').first().text().trim();
    const price  = $(el).find('[class*="price"]').first().text().trim();
    const store  = $(el).find('[class*="shop"], [class*="seller"]').text().trim();
    const rating = $(el).find('[class*="rating"], [class*="star"]').text().trim();
    const sold   = $(el).find('[class*="sold"]').text().trim();
    const image  = $(el).find('img').attr('src') || '';
    const link   = $(el).find('a').attr('href') || '';

    if (name) products.push({
      name, price, store,
      location : '-',
      rating, sold, image,
      link: link.startsWith('http') ? link : 'https://www.tiktok.com' + link
    });
  });

  console.log(`✅ [TiktokShop] Ditemukan ${products.length} produk`);
  return products;
}

async function detail(url) {
  console.log(`🔍 [TiktokShop] Detail: ${url}`);

  const res  = await getHTML(url);
  const html = res.html || res;
  const $    = cheerio.load(html);

  return {
    name     : $('[class*="product-title"]').text().trim(),
    price    : $('[class*="price"]').first().text().trim(),
    store    : $('[class*="shop-name"]').text().trim(),
    location : '-',
    rating   : $('[class*="rating"]').text().trim(),
    sold     : $('[class*="sold"]').text().trim(),
    image    : $('[class*="product-image"] img').attr('src') || '',
    link     : url
  };
}

module.exports = { search, detail };