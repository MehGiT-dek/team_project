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