require("dotenv").config();
const axios = require("axios");

const client = axios.create({
  baseURL: process.env.HEADLESSX_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.HEADLESSX_API_KEY,
  },
  timeout: 120000,
});

async function getHTML(url) {
  const res = await client.post("/api/website/html", {
    url,
    timeout: 30000,
    waitForTimeout: 12000, // ✅ naik dari 8000 ke 12000
  });
  return res.data;
}

module.exports = { getHTML };
