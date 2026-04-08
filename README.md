# 🛒 My Scraper API

Web scraping API untuk marketplace Indonesia.
Powered by [HeadlessX](https://github.com/SaifyXPRO/HeadlessX) + Camoufox.

## ✅ Platform yang Didukung

| Platform  | Search         | Detail |
| --------- | -------------- | ------ |
| Tokopedia | ✅             | ✅     |
| Shopee    | ⚠️ Butuh login | ⚠️     |
| Lazada    | ⚠️ Anti-bot    | ⚠️     |

## 🚀 Setup

### 1. Requirement

- Node.js v18+
- HeadlessX server berjalan di `http://localhost:8000`

### 2. Install

git clone https://github.com/USERNAMEKAMU/my-scraper.git
cd my-scraper
npm install

### 3. Konfigurasi `.env`

Buat file `.env` di root folder:
HEADLESSX_API_URL=http://localhost:8000
HEADLESSX_API_KEY=your_api_key_here
PORT=4000

### 4. Jalankan

node server.js

---

## 📌 Endpoints

### 🔍 Search Keyword — Semua Toko

POST /search
Content-Type: application/json

Body:
{
"keyword": "buku",
"source": "all"
}

Source options: all, tokopedia, shopee, lazada, tiktokshop

---

### 🔍 Search via GET

GET /search/tokopedia?keyword=buku

---

### 📄 Detail Produk

POST /detail
Content-Type: application/json

Body:
{
"url": "https://www.tokopedia.com/toko/nama-produk",
"source": "tokopedia"
}

---

### ❤️ Health Check

GET /health

---

## 📦 Contoh Response

```json
{
  "success": true,
  "source": "tokopedia",
  "keyword": "buku",
  "total": 45,
  "data": [
    {
      "name": "Gramedia Buku Komik Blue Lock 11",
      "price": "Rp60.000",
      "original_price": "",
      "discount": "",
      "store": "gramedia-store",
      "location": "Jakarta Barat",
      "rating": "4.8",
      "sold": "1rb terjual",
      "image": "https://...",
      "link": "https://www.tokopedia.com/..."
    }
  ]
}
```

## ⚠️ Catatan

- Shopee memerlukan sesi login untuk menampilkan hasil pencarian
- Lazada memiliki proteksi anti-bot yang ketat
- Selector HTML dapat berubah sewaktu-waktu mengikuti update platform
