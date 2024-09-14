// API key
const apiKey = 'bb17debd5651111cc348d081b32041ba';

// Function to get coordinates from city name
async function getCoordinates(cityName) {
    if (!cityName) {
        throw new Error('City name is required');
    }
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`;
    const response = await fetch(geoUrl);
    const data = await response.json();
    if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
    }
    throw new Error('City not found');
}

// Function to get weather data from coordinates
async function getWeatherData(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(weatherUrl);
    return await response.json();
}

// Function to display weather data
function displayWeather(weatherData) {
    const currentWeather = weatherData.list[0];
    const cityName = weatherData.city.name;
    const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
    const iconCode = currentWeather.weather[0].icon;
    const temperatureC = currentWeather.main.temp;
    const temperatureF = (temperatureC * 9/5) + 32; // Convert to Fahrenheit
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;

    // Display current weather
    document.getElementById('current-weather-details').innerHTML = `
        <h2>${cityName}</h2>
        <p>Date: ${date}</p>
        <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
        <p>Temperature: ${temperatureF.toFixed(1)}°F</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;

    // Display 5-day forecast
    const forecastHTML = weatherData.list
        .filter((item, index) => index % 8 === 0) // Get data for every 24 hours
        .slice(1, 6) // Get next 5 days
        .map(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString();
            const iconCode = day.weather[0].icon;
            const tempC = day.main.temp;
            const tempF = (tempC * 9/5) + 32; // Convert to Fahrenheit
            const windSpeed = day.wind.speed;
            const humidity = day.main.humidity;

            return `
                <div class="forecast-card">
                    <h4>${date}</h4>
                    <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
                    <p>Temp: ${tempF.toFixed(1)}°F</p>
                    <p>Wind: ${windSpeed} m/s</p>
                    <p>Humidity: ${humidity}%</p>
                </div>
            `;
        })
        .join('');

    document.getElementById('forecast-cards').innerHTML = forecastHTML;
}
// Function to handle form submission
async function handleSearch(event) {
    event.preventDefault();
    const cityInput = document.getElementById('city-input');
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert("Please enter a city name");
        return;
    }
    try {
        const coords = await getCoordinates(cityName);
        const weatherData = await getWeatherData(coords.lat, coords.lon);
        displayWeather(weatherData);
        addToSearchHistory(cityName);
    } catch (error) {
        console.error('Error:', error);
        alert("Unable to find weather data for the specified city. Please check the city name and try again.");
    }
}

// Function to add city to search history
function addToSearchHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(cityName)) {
        history.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        updateSearchHistoryDisplay();
    }
}

// Function to update search history display
function updateSearchHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyList = document.getElementById('search-history');
    historyList.innerHTML = '';
    history.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        listItem.addEventListener('click', () => {
            document.getElementById('city-input').value = city;
            handleSearch(new Event('submit'));
        });
        historyList.appendChild(listItem);
    });
}

// Event listeners
document.getElementById('search-form').addEventListener('submit', handleSearch);

// Initial load
updateSearchHistoryDisplay();

