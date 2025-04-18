/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

// modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express(); // create express app

// Ref: https://dev.to/hamzakhan/api-rate-limiting-in-nodejs-strategies-and-best-practices-3gef
const rateLimit = require('express-rate-limit');

// Rate limiter
const minutesLimit = process.env.API_MINUTE_LIMIT || 15;
const maxRequest = process.env.API_MAX_REQUEST || 100;
const limiter = rateLimit({
    windowMs: minutesLimit * 60 * 1000,
    max: maxRequest, // X requests per Y minutes
    message: 'Rate limit exceeded, please try again later.'
  });

// load the enviroment variables
dotenv.config();

// allowed origins for CORS
const allowedOrigins = [
    'https://external-api-services.vercel.app',      
    'http://127.0.0.1:5500'                         // local server [UI]
];

// CORS Middleware
app.use(cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// Endpoints to apply the limit
app.use('/weather', limiter);
app.use('/exchange-rate', limiter);
app.use(express.json()); // Body parsing middleware

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Utility function to set CORS headers dynamically
const setCorsHeaders = (req, res) => {
    const origin = allowedOrigins.includes(req.headers.origin) ? req.headers.origin : allowedOrigins[0];
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    console.log(`SET to origin: ${origin}`);
};

// Endpoints

// GET Weather Information
//  Reference: https://openweathermap.org/api
app.get('/weather/', async (req, res) => {

    setCorsHeaders(req, res);

    const { city, units } = req.query;

    const WEATHERCONFIG = {
        apiKey : process.env.WEATHER_API_KEY || 'WEATHER_API_KEY',
        endpoint : process.env.WEATHER_EXTERNAL_API || 'WEATHER_EXTERNAL_API',
        iconBaseUrl: process.env.WEATHER_ICON_BASE_URL || 'WEATHER_ICON_BASE_URL'
    }

    try {
        const url = `${WEATHERCONFIG.endpoint}?q=${city}&units=${units}&appid=${WEATHERCONFIG.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch weather data' });
        }
        
        const data = await response.json();

        if (data.weather && data.weather[0] && data.weather[0].icon) {
            data.iconBaseUrl = `${WEATHERCONFIG.iconBaseUrl}${data.weather[0].icon}@4x.png`;
        }
        
        res.status(200).json(data);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching the weather data.' });
    }
});

// GET Exchange Rate Information
//  Reference: https://www.exchangerate-api.com/
app.get('/exchange-rate/', async (req, res) => {

    setCorsHeaders(req, res);

    const EXCHANGERATE = {
        apiKey : process.env.EXCHANGE_RATE_API_KEY || 'EXCHANGE_RATE_API_KEY',
        endpoint : process.env.EXCHANGE_RATE_EXTERNAL_API || 'EXCHANGE_RATE_EXTERNAL_API',
        baseCurrency : process.env.BASE_CURRENCY_CODE || 'BASE_CURRENCY_CODE'
    }

    try {
        const url = `${EXCHANGERATE.endpoint}${EXCHANGERATE.apiKey}/latest/${EXCHANGERATE.baseCurrency}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch exchange rate data' });
        }
        
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching the exchange rate data.' });
    }
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
