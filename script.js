async function getWeather() {

    const cityInput = document.getElementById("cityInput");
    const city = cityInput.value.trim();

    const errorMessage = document.getElementById("errorMessage");
    const loading = document.getElementById("loading");
    const weatherCard = document.getElementById("weatherCard");

    // Clear old messages
    errorMessage.textContent = "";
    weatherCard.style.display = "none";

    // Check empty input
    if (city === "") {
        errorMessage.textContent = "Please enter a city name.";
        return;
    }

    loading.style.display = "block";

    try {

        // STEP 1: Find latitude and longitude of the city
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Failed to find the city.");
        }

        const locationData = await locationResponse.json();

        // Check whether city exists
        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // STEP 2: Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();

        // Get current weather
        const currentWeather = weatherData.current;

        // STEP 3: Display data
        document.getElementById("cityName").textContent =
            `${location.name}, ${location.country}`;

        document.getElementById("temperature").textContent =
            `${currentWeather.temperature_2m} °C`;

        document.getElementById("humidity").textContent =
            `${currentWeather.relative_humidity_2m} %`;

        document.getElementById("windSpeed").textContent =
            `${currentWeather.wind_speed_10m} km/h`;

        document.getElementById("feelsLike").textContent =
            `${currentWeather.apparent_temperature} °C`;

        // Weather description
        const weatherInfo = getWeatherDescription(
            currentWeather.weather_code
        );

        document.getElementById("description").textContent =
            weatherInfo.description;

        document.getElementById("weatherIcon").textContent =
            weatherInfo.icon;

        weatherCard.style.display = "block";

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {

        loading.style.display = "none";
    }
}


// Convert weather code into description and icon
function getWeatherDescription(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            description: "Partly Cloudy",
            icon: "⛅"
        };
    }

    if (code === 3) {
        return {
            description: "Cloudy",
            icon: "☁️"
        };
    }

    if (code >= 45 && code <= 48) {
        return {
            description: "Foggy",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            description: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            description: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            description: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        description: "Unknown Weather",
        icon: "🌤️"
    };
}


// Press Enter to search
document.getElementById("cityInput").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});