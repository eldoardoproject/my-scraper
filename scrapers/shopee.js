const cheerio = require('cheerio');
const { getHTML } = require('../utils/headlessx');

const SHOPEE_PROFILE_ID = '8988bae8-9fcc-4a1d-b7f9-6e869020568a';

function parseProducts(html) {
  const $ = cheerio.load(html);
  const products = [];

  $('[data-sqe="item"]').each((i, el) => {
    // Link produk
    const linkRaw = $(el).find('a[href]').first().attr('href') || '';
    const link = linkRaw.startsWith('http')
      ? linkRaw.split('?')[0]
      : 'https://shopee.co.id' + linkRaw.split('?')[0];

    // Gambar
    const image = $(el).find('img').first().attr('src') || '';

    // Ambil semua teks dalam card
    const rawText = $(el).text().trim();

    // Nama: teks pertama yang panjang (bukan angka/simbol)
    let name = '';
    $(el).find('*').each((j, child) => {
      const t = $(child).clone().children().remove().end().text().trim();
      if (t.length > 10 && !t.match(/^[Rp\d.,\s%]+$/) && !name) {
        name = t;
      }
    });

    // Harga: cari pola Rp
    const hargaMatch = rawText.match(/Rp[\d.,]+/g);
    const price      = hargaMatch?.[0] || '';
    const oriPrice   = hargaMatch?.[1] || '';

    // Diskon
    const discMatch = rawText.match(/(\d+)%/);
    const discount  = discMatch ? discMatch[1] + '%' : '';

    // Rating: angka 1-5 dengan desimal
    const ratingMatch = rawText.match(/\b([1-5]\.\d)\b/);
    const rating      = ratingMatch ? ratingMatch[1] : '';

    // Terjual
    const soldMatch = rawText.match(/([\d.,]+[rRkK]?\+?\s*(?:rb\+?|ribu\+?)?\s*terjual)/i);
    const sold      = soldMatch ? soldMatch[1].trim() : '';

    // Lokasi
    const lokasiMatch = rawText.match(/([A-Z][a-zA-Z\s]+(?:Utara|Selatan|Barat|Timur|Tengah|Pusat)?)\s*$/);
    const location    = lokasiMatch ? lokasiMatch[1].trim() : '';

    if (name && link) {
      products.push({
        name,
        price,
        original_price : oriPrice,
        discount,
        store          : '',
        location,
        rating,
        sold,
        image,
        link
      });
    }
  });

  return products;
}

async function search(keyword) {
  const url = `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`;
  console.log(`🔍 [Shopee] Scraping: "${keyword}"...`);

  const res  = await getHTML(url, SHOPEE_PROFILE_ID);
  const html = res.html || res;
  const products = parseProducts(html);

  console.log(`✅ [Shopee] Ditemukan ${products.length} produk`);
  return products;
}

async function detail(url) {
  console.log(`🔍 [Shopee] Detail: ${url}`);
  const res  = await getHTML(url, SHOPEE_PROFILE_ID);
  const html = res.html || res;
  const $    = cheerio.load(html);

  const name  = $('[class*="product-name"]').first().text().trim()
             || $('[class*="pdp-product-title"]').first().text().trim();
  const price = $('[class*="priceSectionWithoutExtraOffer"]').first().text().trim()
             || $('[class*="pdp-price"]').first().text().trim();
  const image = $('div[class*="carousel"] img').first().attr('src') || '';

  return { name, price, store: '', location: '', rating: '', sold: '', image, link: url };
}

module.exports = { search, detail };