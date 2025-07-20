const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const weatherRoute = require('./routes/weather');

const app = express();
app.use(cors());

app.use('/api/weather', weatherRoute);

app.listen(3000, () => {
  console.log('🌤️ Weather server running at http://localhost:3000');
});