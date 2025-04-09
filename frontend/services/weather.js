/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

import { LocalStorageService } from './localStorage.js';
import { APIService } from './api-helper.js';

class WeatherHelperService {

    // Constructor initializes the weather service with default values
    constructor() {
        // Initialize weather data and timestamp variables
        this.weatherInfo = null;
        this.lastWeatherUpdate = 0;
    }

    // Get weather data either from localStorage (if available) or from the API
    async getWeatherData() {
        try {
            const WEATHERCONFIG = {
                cacheWeatherKey: 'weather-info',
                cacheWeatherLastUpdateKey: 'weather-info-timeStamp',
                endpoint: 'http://localhost:8080/weather',
                city: 'Calgary',
                units: 'metric', // metric - °C, imperial - °F,
                // https://dev.to/delisrey/react-query-staletime-vs-cachetime-hml
                cacheTime: 60 * 60 * 1000, // 1 hour, defines how long weather data should be considered fresh or valid before making a new API call.
            }

            // Check local storage for previously stored weather data and timestamp
            const localWeatherInfo = LocalStorageService.getOne(WEATHERCONFIG.cacheWeatherKey);
            const weatherTimestamp = LocalStorageService.getOne(WEATHERCONFIG.cacheWeatherLastUpdateKey);

            // If data exists in local storage, use it
            if (localWeatherInfo && weatherTimestamp) {
                this.weatherInfo = localWeatherInfo;
                this.lastWeatherUpdate = parseInt(weatherTimestamp); // set the latest time stamp from local storage
            }

            const currentTime = Date.now();
            const weatherAge = currentTime - this.lastWeatherUpdate;

            // weatherAge - defines how long weather data should be considered fresh before making API Call
            if (this.weatherInfo && weatherAge < WEATHERCONFIG.cacheTime) {
                // Use cached data
                this.setUpWeatherInfo();
                return;
            }

            // If no data in local storage, fetch from API
            // Reference: https://openweathermap.org/api
            const url = `${WEATHERCONFIG.endpoint}?city=${WEATHERCONFIG.city}&units=${WEATHERCONFIG.units}`;
            const response = await APIService.get(url);

            // Parse the weather data from the response
            this.weatherInfo = response;
            this.lastWeatherUpdate = currentTime;

            // Save the new data to localStorage
            LocalStorageService.saveToLocalStorage(WEATHERCONFIG.cacheWeatherKey, this.weatherInfo, true);
            LocalStorageService.saveToLocalStorage(WEATHERCONFIG.cacheWeatherLastUpdateKey, this.lastWeatherUpdate);


            // Update the UI with the fetched or loaded weather information
            this.setUpWeatherInfo();
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Set up the weather information in the UI
    setUpWeatherInfo() {
        // If there's no weather data, exit early
        if (!this.weatherInfo) return;

        // Update the temperature display in the UI
        const temp = Math.round(this.weatherInfo.main.temp);
        document.getElementById('temperature').textContent = `${temp}°C`;

        // Update the weather description
        const description = this.weatherInfo.weather[0].description;
        document.getElementById('description').textContent = description;

        // Update the timestamp of the last weather update
        const date = new Date(this.weatherInfo.dt * 1000);
        document.getElementById('timestamp').textContent = `Last updated: ${date.toLocaleString()}`;

        // Set the weather icon based on the icon code from the API
        const iconUrl = this.weatherInfo.iconBaseUrl;
        document.getElementById('weather-icon').style.backgroundImage = `url(${iconUrl}`;
    }
}

// Export an instance of WeatherService so it can be used elsewhere
export const WeatherService = new WeatherHelperService();