const cheerio = require("cheerio");
const { getHTML } = require("../utils/headlessx");

function parseProducts(html) {
  const $ = cheerio.load(html);
  const products = [];

  $('[data-testid="divSRPContentProducts"] a[href*="tokopedia.com"]').each(
    (i, el) => {
      const card = $(el);
      const link = card.attr("href")?.split("?")[0] || "";
      const image = card.find('img[alt="product-image"]').attr("src") || "";
      const rawText = card.text().trim();

      // Nama: teks sebelum "Rp" pertama, buang prefix diskon/label
      let name = rawText.split("Rp")[0].trim();
      name = name
        .replace(/^\d+%/, "")
        .replace(/^(PreOrder|Flash Sale|New)\s*/i, "")
        .trim();

      // Harga
      const hargaMatch = rawText.match(/Rp\d{1,3}(?:[.,]\d{3})*/g);
      const price = hargaMatch?.[0] || "";
      const oriPrice = hargaMatch?.[1] || "";

      // Diskon
      const discMatch = rawText.match(/^(\d+)%/);
      const discount = discMatch ? discMatch[1] + "%" : "";

      // ✅ FIX: store didefinisikan dari URL
      const store =
        link.replace("https://www.tokopedia.com/", "").split("/")[0] || "";

      // Rating
      const ratingMatch = rawText.match(
        /\b([1-5]\.[0-9])\b(?=\s*\(|\s*\d+\s*(?:rb|ribu|k)?(?:\s*ulasan|\s*review)?)/i,
      );
      const rating = ratingMatch ? ratingMatch[1] : "";

      // Terjual
      const soldMatch = rawText.match(
        /(?<!\.)(\b\d+(?:[.,]\d+)?(?:\s*rb)?)\s+terjual/i,
      );
      const sold = soldMatch ? soldMatch[1].trim() + " terjual" : "";

      // Lokasi
      const lokasiMatch = rawText.match(
        /([A-Z][a-z]+ ?(?:Utara|Selatan|Barat|Timur|Tengah)?)\s*$/,
      );
      const location = lokasiMatch ? lokasiMatch[1].trim() : "";

      if (name && link) {
        products.push({
          name,
          price,
          original_price: oriPrice,
          discount,
          store,
          location,
          rating,
          sold,
          image,
          link,
        });
      }
    },
  );

  return products;
}

async function search(keyword) {
  const url = `https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(keyword)}`;
  console.log(`🔍 [Tokopedia] Scraping: "${keyword}"...`);

  const res = await getHTML(url);
  const html = res.html || res;
  const products = parseProducts(html);

  console.log(`✅ [Tokopedia] Ditemukan ${products.length} produk`);
  return products;
}

async function detail(url) {
  console.log(`🔍 [Tokopedia] Detail: ${url}`);
  const res  = await getHTML(url);
  const html = res.html || res;
  const $    = cheerio.load(html);

  // Ambil gambar asli (bukan SVG placeholder)
  let image = '';
  $('[data-testid="PDPImageDetail"] img, [data-testid="PDPImageThumbnail"] img').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (src && !src.startsWith('data:')) { // skip SVG placeholder
      image = src;
      return false; // stop loop
    }
  });

  // Lokasi toko dari footer shop section
  const locationRaw = $('[data-testid="pdpShipmentV4Content"]').text().trim();
  // Ambil baris terakhir yang biasanya berisi nama kota
  const locationLines = locationRaw.split('\n').map(l => l.trim()).filter(Boolean);
  const location = locationLines[locationLines.length - 1] || '';

  return {
    name     : $('[data-testid="lblPDPDetailProductName"]').text().trim(),
    price    : $('[data-testid="lblPDPDetailProductPrice"]').text().trim(),
    store    : $('[data-testid="llbPDPFooterShopName"]').text().trim(),
    location,
    rating   : $('[data-testid="lblPDPDetailProductRatingNumber"]').text().trim(),
    sold     : $('[data-testid="lblPDPDetailProductSoldCounter"]').text().trim(),
    image,
    link     : url
  };
}

module.exports = { search, detail };
