const searchBtn = document.getElementById('searchBtn');
const countrySel = document.getElementById('countrySel');
async function getCountry() {
    const countryName = countrySel.value;
    if (countryName === '') {
        alert('Please select a country.');
        return;
    }
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        if (!response.ok) {
            throw new Error('Country not found');
        }
        const data = await response.json();
        const country = data[0];
        document.querySelector('.country-title h1').textContent = country.name.common;
        document.querySelector('.flag').innerHTML = `<img src="${country.flags.svg}" alt="Flag of ${country.name.common}">`;
        const capital = country.capital
        ? country.capital[0]
         : 'N/A';
         document.querySelector('.capital strong').textContent = capital;
         document.querySelector('.population h3').textContent = country.population.toLocaleString();
         const currencies = Object.values(country.currencies || {});
         if (currencies.length > 0){
            document.querySelector('.currency h3').textContent = currencies[0].symbol || currencies[0].name;
         }
         document.querySelector('.currency small').textContent = currencies[0].name;
         const languages = Object.values(country.languages || {});
         document.querySelector('.language h3').textContent = languages[0] || "Unknown";
         document.querySelector('.language small').textContent = languages.length > 1
         ? `${languages.length} languages`
            : 'official';
            document.querySelector('.about-country h2').textContent = `About ${country.name.common}`;
            document.querySelector('.about-country p').textContent = `${country.name.common} is a country located in ${country.region}. It's capital is ${capital}. The country has a population of ${country.population.toLocaleString()} people.
            `;
            if (country.capitalInfo && country.capitalInfo.latlng) {
                const latitude = country.capitalInfo.latlng[0];
                const longitude = country.capitalInfo.latlng[1];
                getWeather(latitude, longitude, capital);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again later.');
        }
    }

async function getWeather(latitude, longitude, capital) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`);
        const data = await response.json();
        document.querySelector('.weather-card h2').textContent = `Weather in ${capital}`;
        document.querySelector('.main-weather h1').textContent = `${Math.round(data.current.temperature_2m)}°C`;
        document.querySelector('.main-weather p').textContent = getWeatherDescription(data.current.weather_code);
        document.querySelector('.sun').textContent = getWeatherIcon(data.current.weather_code);
        document.querySelector('.weather-details > div:nth-child(1) strong').textContent = `${data.current.relative_humidity_2m}%`;
        document.querySelector('.weather-details > div:nth-child(2) strong').textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
        document.querySelector('.weather-details > div:nth-child(3) strong').textContent = `${Math.round(data.current.apparent_temperature)}°C`;
    } catch (error) {
        console.error("weather error:", error);
    }
}

function getWeatherDescription(code) {
    if (code === 0) {return 'Clear sky';}
    if (code === 1 || code === 2) {return 'Partly cloudy';}
    if (code === 3) {return 'Cloudy';}
    if (code === 45 || code === 48) {return 'Foggy';}
    if (code >= 51 && code <= 67) {return 'Drizzle';}
    if (code >= 71 && code <= 77) {return 'Snowy';}
    if (code >= 80 && code <= 82) {return 'Rain showers';}
    if (code >= 95) {return 'Thunderstorm';}
    return 'Unknown weather';
}
function getWeatherIcon(code) {
    if (code === 0) {return '☀️';}
    if (code === 1 || code === 2) {return '⛅';}
    if (code === 3) {return '☁️';}
    if (code === 45 || code === 48) {return '🌫️';}
    if (code >= 51 && code <= 67) {return '🌦️';}
    if (code >= 71 && code <= 77) {return '❄️';}
    if (code >= 80 && code <= 82) {return '🌧️';}
    if (code >= 95) {return '⛈️';}
    return '❓';
}

searchBtn.addEventListener('click', getCountry);
window.addEventListener('load', () => {
    countrySelect.value = 'Japan';
    getCountry();
});