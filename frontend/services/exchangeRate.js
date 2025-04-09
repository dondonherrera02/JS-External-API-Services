/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

import { LocalStorageService } from './localStorage.js';
import { APIService } from './api-helper.js';

class ExchangeRateHelperService {

    // Constructor initializes the service with default values
    constructor() {
        // Initialize exchange rate data and timestamp variables
        this.exchangeRateInfo = null;
        this.lastExchangeRateUpdate = 0;
    }

    // Get exchange rate data either from localStorage (if available) or from the API
    async getExchangeRateData() {
        try {
            const EXCHANGERATECONFIG = {
                cacheExchangeRateKey: 'exchange-rate-info',
                cacheExchangeRateLastUpdateKey: 'exchange-rate-info-timeStamp',
                endpoint: 'http://localhost:8080/exchange-rate',
                //https://dev.to/delisrey/react-query-staletime-vs-cachetime-hml
                cacheTime: 60 * 60 * 1000 // 1 hour - defines how long weather data should be considered fresh or valid before making a new API call.
            }

            // Check local storage for previously stored weather data and timestamp
            const localExchangeRateInfo = LocalStorageService.getOne(EXCHANGERATECONFIG.cacheExchangeRateKey);
            const exchangeRateTimestamp = LocalStorageService.getOne(EXCHANGERATECONFIG.cacheExchangeRateLastUpdateKey);

            // If data exists in local storage, use it
            if (localExchangeRateInfo && exchangeRateTimestamp) {
                this.exchangeRateInfo = localExchangeRateInfo;
                this.lastExchangeRateUpdate = parseInt(exchangeRateTimestamp); // set the latest time stamp from local storage
            }

            const currentTime = Date.now();
            const exchangeRateAge = currentTime - this.lastExchangeRateUpdate;

            // exchangeRateAge - defines how long exchange rate data should be considered fresh before making API Call
            if (this.exchangeRateInfo && exchangeRateAge < EXCHANGERATECONFIG.cacheTime) {
                // Use cached data
                this.populateCurrencyDropdowns();
                this.setUpExchangeRateConversion();
                return;
            }

            // If no data in local storage, fetch from API
            // Reference: https://www.exchangerate-api.com/
            const url = `${EXCHANGERATECONFIG.endpoint}`;
            const response = await APIService.get(url);

            // Parse the weather data from the response
            this.exchangeRateInfo = response;
            this.lastExchangeRateUpdate = currentTime;

            // Save the new data to localStorage
            LocalStorageService.saveToLocalStorage(EXCHANGERATECONFIG.cacheExchangeRateKey, this.exchangeRateInfo, true);
            LocalStorageService.saveToLocalStorage(EXCHANGERATECONFIG.cacheExchangeRateLastUpdateKey, this.lastExchangeRateUpdate);

            // Update the UI with the fetched or loaded exchange rate information
            this.populateCurrencyDropdowns();
            this.setUpExchangeRateConversion();
        } catch (error) {
            console.error('Error fetching exchange rate data:', error);
        }
    }

    // Set up the exchange rate information in the UI
    setUpExchangeRateConversion() {
        // If there's no exchange rate data, exit early
        if (!this.exchangeRateInfo || !this.exchangeRateInfo.conversion_rates) return;

        // Get inputs
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        // Get the rates
        const rates = this.exchangeRateInfo.conversion_rates;

        // Calculate conversion
        // Ref: https://www.zen.com/blog/guides/how-to-calculate-an-exchange-rate/

        // Convert from source currency to base currency
        const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];

        // Then convert from USD to the target currency
        const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];

        // Calculate the direct exchange rate
        const exchangeRate = fromCurrency === toCurrency ? 1 : (rates[toCurrency] / rates[fromCurrency]);

        document.getElementById('conversion-result').textContent = `${amount.toLocaleString()} ${fromCurrency} = ${convertedAmount.toLocaleString()} ${toCurrency}`;

        document.getElementById('exchange-rate').textContent = `1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;
    }

    // populate currency drop downs
    populateCurrencyDropdowns() {
        if (!this.exchangeRateInfo || !this.exchangeRateInfo.conversion_rates) return;
        
        // Get currencies
        const currencies = Object.keys(this.exchangeRateInfo.conversion_rates);
        
        // Clear existing options
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        
        fromCurrency.innerHTML = '';
        toCurrency.innerHTML = '';
        
        // Add options for each currency
        currencies.forEach(currency => {
            const fromOption = document.createElement('option');
            fromOption.value = currency;
            fromOption.textContent = currency;
            
            const toOption = document.createElement('option');
            toOption.value = currency;
            toOption.textContent = currency;
            
            fromCurrency.appendChild(fromOption);
            toCurrency.appendChild(toOption);
        });
        
        // Set default selections
        fromCurrency.value = 'USD';
        toCurrency.value = 'CAD';
    }

    // swap currencies functionality ...
    swapCurrencies() {
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        const tempVal = fromCurrency.value;

        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempVal;
        
        // Update conversion
        this.setUpExchangeRateConversion();
    }

    setupEventListeners() {
        // Currency conversion event listeners
        document.getElementById('amount').addEventListener('input', () => this.setUpExchangeRateConversion());
        document.getElementById('from-currency').addEventListener('change', () => this.setUpExchangeRateConversion());
        document.getElementById('to-currency').addEventListener('change', () => this.setUpExchangeRateConversion());
        document.getElementById('swap-button').addEventListener('click',  () => this.swapCurrencies());
    }
}

// Export an instance of ExchangeRateHelperService so it can be used elsewhere
export const ExchangeRateService = new ExchangeRateHelperService();