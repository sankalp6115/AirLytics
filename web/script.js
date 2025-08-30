    async function getWeather(city) {
      const res = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      const data = await res.json();

      document.getElementById("air-quality").innerHTML = `
        🌍 City: ${data.city}<br>
        <div class="aqi-indicator'></div>
        🌫️ AQI: ${data.aqi}<br>
        🌡️ Temperature: ${data.temperature}°C<br>
        ⛅ Condition: ${data.condition}<br>
        💧 Humidity: ${data.humidity}%<br>
      `;
    }

    getWeather("Kanpur");