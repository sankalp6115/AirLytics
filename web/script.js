// Weather Data
    async function getWeather(city) {
      const res = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      const data = await res.json();

      document.getElementById("output").innerHTML = `
        🌍 City: ${data.city}<br>
        🌡️ Temperature: ${data.temperature}°C<br>
        💧 Humidity: ${data.humidity}%<br>
        ⛅ Condition: ${data.condition}<br>
        🌫️ AQI: ${data.aqi}<br>
      `;
    }

    getWeather("Kanpur");