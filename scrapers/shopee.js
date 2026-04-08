const cheerio = require('cheerio');
const { getHTML } = require('../utils/headlessx');

async function search(keyword) {
  const url = `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`;
  console.log(`🔍 [Shopee] Scraping: "${keyword}"...`);
  const html = await getHTML(url);
  const $ = cheerio.load(html);
  const products = [];

  $('.shopee-search-item-result__item').each((i, el) => {
    const name     = $(el).find('._44qnta').text().trim();
    const price    = $(el).find('.ZEgDH9').text().trim();
    const store    = $(el).find('.semMnH').text().trim();
    const location = $(el).find('.v9MSQ4').text().trim();
    const rating   = $(el).find('.qFldR2').text().trim();
    const sold     = $(el).find('.r6HknA').text().trim();
    const image    = $(el).find('img').attr('src') || '';
    const link     = 'https://shopee.co.id' + ($(el).find('a').attr('href') || '');

    if (name) products.push({ name, price, store, location, rating, sold, image, link });
  });

  console.log(`✅ [Shopee] Ditemukan ${products.length} produk`);
  return products;
}

async function detail(url) {
  console.log(`🔍 [Shopee] Detail: ${url}`);
  const html = await getHTML(url);
  const $ = cheerio.load(html);

  return {
    name     : $('.pdp-product-title').text().trim(),
    price    : $('.pdp-price_type_normal').text().trim(),
    store    : $('.seller-name__text').text().trim(),
    location : $('.location').text().trim(),
    rating   : $('.pdp-review-summary__label').first().text().trim(),
    sold     : $('.pdp-review-summary__label').last().text().trim(),
    image    : $('.pdp-image img').attr('src') || '',
    link     : url
  };
}

module.exports = { search, detail };