/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

import { WeatherService } from './services/weather.js';
import { ExchangeRateService } from './services/exchangeRate.js';

function init() {
    // Fetch weather data
    WeatherService.getWeatherData();

    // Events
    ExchangeRateService.setupEventListeners();

     // Fetch exchange rate data
    ExchangeRateService.getExchangeRateData();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);