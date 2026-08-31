const searchBtn = document.getElementById("searchBtn");
const countrySel = document.getElementById("countrySel");

const countryCodes = {
    Japan: "JP",
    Ukraine: "UA",
    France: "FR",
    Germany: "DE"
};

async function getCountry() {
    const countryName = countrySel.value;

    if (!countryName) {
        alert("Please select a country.");
        return;
    }

    const countryCode = countryCodes[countryName];

    try {
        const response = await fetch(
            `https://countries.dev/alpha/${countryCode}`
        );

        if (!response.ok) {
            throw new Error(`Country API error: ${response.status}`);
        }

        const country = await response.json();

        document.querySelector(".name").textContent = country.name;

        if (country.flags?.svg) {
            document.querySelector(".flag").innerHTML = `
                <img
                    src="${country.flags.svg}"
                    alt="Flag of ${country.name}"
                >
            `;
        } else {
            document.querySelector(".flag").textContent = "🌍";
        }

        const capital =
            typeof country.capital === "string"
                ? country.capital
                : country.capital?.name || "N/A";

        document.querySelector(".capital strong").textContent =
            capital;

        document.querySelector(".population h3").textContent =
            Number(country.population).toLocaleString();

        document.querySelector(".population small").textContent =
            "people";

        const currencies = country.currencies || [];

        if (currencies.length > 0) {
            const currency = currencies[0];

            document.querySelector(".currency h3").textContent =
                `${currency.code || ""} ${currency.symbol || ""}`.trim();

            document.querySelector(".currency small").textContent =
                currency.name || "Currency";
        } else {
            document.querySelector(".currency h3").textContent = "N/A";
            document.querySelector(".currency small").textContent = "No data";
        }

        const languages = country.languages || [];

        if (languages.length > 0) {
            const language = languages[0];

            document.querySelector(".language h3").textContent =
                typeof language === "string"
                    ? language
                    : language.name;

            document.querySelector(".language small").textContent =
                languages.length > 1
                    ? `${languages.length} languages`
                    : "Official";
        } else {
            document.querySelector(".language h3").textContent =
                "Unknown";

            document.querySelector(".language small").textContent =
                "No data";
        }

        document.querySelector(".about-country h2").textContent =
            `About ${country.name}`;

        document.querySelector(".about-country p").textContent =
            `${country.name} is a country located in ${country.region || "the world"}. Its capital is ${capital}. The country has a population of ${Number(country.population).toLocaleString()} people.`;

        let latitude;
        let longitude;

        if (Array.isArray(country.latlng)) {
            latitude = country.latlng[0];
            longitude = country.latlng[1];
        }

        if (
            typeof latitude === "number" &&
            typeof longitude === "number"
        ) {
            await getWeather(latitude, longitude, capital);
        } else {
            showWeatherUnavailable(capital);
        }

    } catch (error) {
        console.error("Country error:", error);

        alert(
            "Could not load country information. Please try again."
        );
    }
}

async function getWeather(latitude, longitude, capital) {
    try {
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Weather API error: ${response.status}`
            );
        }

        const data = await response.json();

        document.querySelector(".weather-card h2").textContent =
            `Weather in ${capital}`;

        document.querySelector(".main-weather h1").textContent =
            `${Math.round(data.current.temperature_2m)}°C`;

        document.querySelector(".main-weather p").textContent =
            getWeatherDescription(data.current.weather_code);

        document.querySelector(".sun").textContent =
            getWeatherIcon(data.current.weather_code);

        document.querySelector(
            ".weather-details > div:nth-child(1) strong"
        ).textContent =
            `${data.current.relative_humidity_2m}%`;

        document.querySelector(
            ".weather-details > div:nth-child(2) strong"
        ).textContent =
            `${Math.round(data.current.wind_speed_10m)} km/h`;

        document.querySelector(
            ".weather-details > div:nth-child(3) strong"
        ).textContent =
            `${Math.round(data.current.apparent_temperature)}°C`;

        updateForecast(data.daily);

    } catch (error) {
        console.error("Weather error:", error);
        showWeatherUnavailable(capital);
    }
}

function showWeatherUnavailable(capital) {
    document.querySelector(".weather-card h2").textContent =
        `Weather in ${capital}`;

    document.querySelector(".main-weather h1").textContent =
        "N/A";

    document.querySelector(".main-weather p").textContent =
        "Weather unavailable";

    document.querySelector(".sun").textContent =
        "❓";
}

function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if (code === 1 || code === 2) return "Partly cloudy";
    if (code === 3) return "Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Drizzle";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code >= 95) return "Thunderstorm";

    return "Unknown weather";
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌦️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 95) return "⛈️";

    return "❓";
}

function updateForecast(daily) {
    const forecastItems =
        document.querySelectorAll(".forecast > div");

    for (let i = 0; i < 5; i++) {
        const date = new Date(daily.time[i]);

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const temperature =
            Math.round(daily.temperature_2m_max[i]);

        const icon =
            getWeatherIcon(daily.weather_code[i]);

        forecastItems[i].querySelector("strong").textContent =
            day;

        forecastItems[i].querySelector("span").textContent =
            icon;

        forecastItems[i].querySelector("p").textContent =
            `${temperature}°C`;
    }
}

searchBtn.addEventListener("click", getCountry);

countrySel.addEventListener("change", getCountry);

window.addEventListener("DOMContentLoaded", () => {
    countrySel.value = "Japan";
    getCountry();
});