// server/routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.API_KEY;

router.get('/', async (req, res) => {
  const { city } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing API key in .env' });
  }

  try {
    const currentRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: API_KEY, units: 'metric' },
    });

    const forecastRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, appid: API_KEY, units: 'metric' },
    });

    res.json({
      current: currentRes.data,
      forecast: forecastRes.data,
    });
  } catch (error) {
    console.error('❌ Weather API error:', error?.response?.data || error.message);
    res.status(500).json({
      error: 'Weather API failed',
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;