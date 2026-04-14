require('dotenv').config();
const axios = require('axios');

const client = axios.create({
  baseURL: process.env.HEADLESSX_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.HEADLESSX_API_KEY
  },
  timeout: 300000  // ✅ naik ke 5 menit
});

async function getHTML(url, profileId = null) {
  const body = {
    url,
    timeout       : 60000,   // ✅ naik ke 60 detik
    waitForTimeout: 25000    // ✅ naik ke 25 detik
  };

  if (profileId) body.profileId = profileId;

  const res = await client.post('/api/website/html', body);
  return res.data;
}

module.exports = { getHTML };