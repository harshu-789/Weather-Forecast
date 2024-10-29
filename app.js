document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'e5103872dfd9472df7a1fd116bcf67b8';
  
    document.getElementById('search-btn').addEventListener('click', handleCitySearch);
    document.getElementById('current-location-btn').addEventListener('click', getCurrentLocationWeather);
    document.getElementById('city-input').addEventListener('focus', displayRecentSearches);
  
    function handleCitySearch() {
      const city = document.getElementById('city-input').value.trim(); // Get the city name from the input
      if (city) {
        saveRecentSearch(city);
        fetchWeatherDataByCity(city); // Fetch weather data by city if the input is not empty
      } else {
        alert('Please enter a valid city name'); // Alert if the input is empty
      }
    }
  
    function getCurrentLocationWeather() {
      if (navigator.geolocation) { // Check if geolocation is supported by the browser
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords; // Get latitude and longitude from the geolocation API
          fetchWeatherDataByCoords(latitude, longitude); // Fetch weather data by coordinates
        }, error => {
          alert('Error fetching location: ' + error.message); // Alert if there is an error fetching location
        });
      } else {
        alert('Geolocation is not supported by this browser.'); // Alert if geolocation is not supported
      }
    }
  
    function fetchWeatherDataByCity(city) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // API URL for fetching current weather data by city
      fetch(url)
        .then(response => {
          if (!response.ok) { // Check if the response is OK
            throw new Error(`HTTP error! status: ${response.status}`); // Throw an error if the response is not OK
          }
          return response.json(); // Parse the response as JSON
        })
        .then(data => {
          if (data.cod === 200) { // Check if the response code is 200 (success)
            const { coord } = data; // Get coordinates from the response data
            fetchWeatherDataByCoords(coord.lat, coord.lon); // Fetch weather data by coordinates
          } else {
            alert(data.message); // Alert if the response code is not 200
          }
        })
        .catch(error => {
          alert('Failed to fetch weather data'); // Alert if there is an error fetching data
        });
    }
  
    function fetchWeatherDataByCoords(lat, lon) {
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API URL for fetching current weather data by coordinates
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API URL for fetching forecast data by coordinates
  
      fetch(currentWeatherUrl)
        .then(response => {
          if (!response.ok) { // Check if the response is OK
            throw new Error(`HTTP error! status: ${response.status}`); // Throw an error if the response is not OK
          }
          return response.json(); // Parse the response as JSON
        })
        .then(data => {
          displayCurrentWeather(data); // Display the current weather data
        })
        .catch(error => {
          alert('Failed to fetch current weather data'); // Alert if there is an error fetching data
        });
  
      fetch(forecastUrl)
        .then(response => {
          if (!response.ok) { // Check if the response is OK
            throw new Error(`HTTP error! status: ${response.status}`); // Throw an error if the response is not OK
          }
          return response.json(); // Parse the response as JSON
        })
        .then(data => {
          displayExtendedForecast(data.list); // Display the extended forecast data
        })
        .catch(error => {
          alert('Failed to fetch forecast data'); // Alert if there is an error fetching data
        });
    }
  
    function displayCurrentWeather(data) {
      if (!data || !data.weather || data.weather.length === 0) { // Check if the data is valid
        alert('Failed to fetch current weather data'); // Alert if the data is invalid
        return;
      }
  
      const weatherDataDiv = document.getElementById('weather-data'); // Get the element to display the weather data
      const weatherSection = document.getElementById('weather-section');
      weatherSection.classList.remove('hidden');
      const currentDate = new Date(); // Get the current date
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`; // Format the current date
      weatherDataDiv.innerHTML = `
        <div class=" flex items-center justify-between w-full text-white">
          <div class="flex flex-col justify-center gap-2">
            <div class="flex gap-4">
              <h2 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">${data.name}</h2>
              <h3 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">(${formattedDate})</h3>
            </div>
            <p class="text-lg md:text-xl lg:text-2xl">Temperature: ${data.main.temp} °C</p>
            <p class="text-lg md:text-xl lg:text-2xl">Feels Like: ${data.main.feels_like} °C</p>
            <p class="text-lg md:text-xl lg:text-2xl">Humidity: ${data.main.humidity} %</p>
            <p class="text-lg md:text-xl lg:text-2xl">Wind Speed: ${data.wind.speed} m/s</p>
          </div>
          <div class="flex flex-col">
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-20 h-20 ml-4">
            <p class="text-xl md:text-2xl font-bold">${data.weather[0].description}</p>
          </div>
        </div>
      `;
    }
  
    function displayExtendedForecast(forecastList) {
        if (!forecastList || forecastList.length === 0) { // Check if the data is valid
          alert('Failed to fetch extended forecast data'); // Alert if the data is invalid
          return;
        }
      
        const forecastDiv = document.getElementById('extended-forecast'); // Get the element to display the forecast data
        forecastDiv.innerHTML = ''; // Clear previous forecast data
      
        const dailyForecasts = {}; // Object to hold daily forecasts
      
        // Organize forecast data by date
        forecastList.forEach(day => {
          const date = new Date(day.dt * 1000).toLocaleDateString(); // Get the date in a readable format
          if (!dailyForecasts[date]) {
            dailyForecasts[date] = []; // Initialize an array for each date
          }
          dailyForecasts[date].push(day); // Push the day's data into the corresponding date
        });
      
        // Display the first 5 days of forecast
        let count = 0;
        for (const date in dailyForecasts) {
          if (count >= 5) break; // Limit to 5 days
          const days = dailyForecasts[date];
          const avgTemp = days.reduce((sum, day) => sum + day.main.temp, 0) / days.length; 
          const avgWind = days.reduce((sum, day) => sum + day.wind.speed, 0) / days.length; 
          const avgHumidity = days.reduce((sum, day) => sum + day.main.humidity, 0) / days.length; 
          const icon = days[0].weather[0].icon; 
      
          forecastDiv.innerHTML += `
            <div class="bg-slate-600 text-white p-2 lg:p-6 rounded-lg shadow-md text-center h-1 md:h-80">
              <h3 class="text-xl font-bold">${date}</h3>
              <div class="flex justify-center pl-10">
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${days[0].weather[0].description}" class="w-20 h-30">
              </div>
              <p class="text-lg lg:text-xl">Avg Temp: ${avgTemp.toFixed(1)} °C</p>
              <p class="text-lg lg:text-xl">Avg Wind: ${avgWind.toFixed(1)} m/s</p>
              <p class="text-lg lg:text-xl">Avg Humidity: ${avgHumidity.toFixed(1)} %</p>
            </div>
          `;
          count++;
        }
      }
  
    function saveRecentSearch(city) {
      let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      recentSearches = recentSearches.filter(search => search.toLowerCase() !== city.toLowerCase()); // Remove duplicates
      recentSearches.unshift(city); // Add the new search to the beginning
      if (recentSearches.length > 5) recentSearches.pop(); // Limit to 5 recent searches
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  
    function displayRecentSearches() {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
      const recentSearchesDropdown = document.getElementById('recent-searches-dropdown');
      if (recentSearches.length > 0) {
        recentSearchesDropdown.innerHTML = recentSearches.map(city => `
          <option value="${city}">${city}</option>
        `).join('');
        recentSearchesDropdown.size = recentSearches.length; // Adjust the dropdown size based on the number of items
        recentSearchesDropdown.classList.remove('hidden'); // Show the dropdown
      } else {
        recentSearchesDropdown.classList.add('hidden'); // Hide the dropdown if no recent searches
      }
    }
  
    document.getElementById('city-input').addEventListener('blur', () => {
      setTimeout(() => {
        document.getElementById('recent-searches-dropdown').classList.add('hidden');
      }, 200); // Delay hiding to allow click event on dropdown
    });
  
    document.getElementById('recent-searches-dropdown').addEventListener('change', (event) => {
      document.getElementById('city-input').value = event.target.value; // Set the input value to the selected city
      document.getElementById('recent-searches-dropdown').classList.add('hidden'); // Hide the dropdown
    });
  });