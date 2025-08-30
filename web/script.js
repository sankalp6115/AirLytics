    async function getWeather(city) {
      const res = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      const data = await res.json();

      document.getElementById("air-quality").innerHTML = `
      🌍 City: ${data.city}<br>
        <div class="aqi-indicator"></div>
        🌫️ AQI: ${data.aqi}<br>
        🌡️ Temperature: ${data.temperature}°C<br>
        ⛅ Condition: ${data.condition}<br>
        💧 Humidity: ${data.humidity}%<br>
      `;
    }

    getWeather("Kanpur");


    // Tooltip system
    const tooltipBtns = document.querySelectorAll(".tooltipImg");
    tooltipBtns.forEach(btn => {
        btn.addEventListener("mouseover", () => {
            const tooltip = btn.nextElementSibling;
            tooltip.style.display = "block";
        });
        btn.addEventListener("mouseout", () => {
            const tooltip = btn.nextElementSibling;
            tooltip.style.display = "none";
        });
    });


    // section.pollutants
    //for each poll, [safe, moderate, dangerous]


    const data = {
        aqi: 100,
        temp: 35,
        condition: "Rainy",
        Humidity: 20,
        pm25: 20,
        pm10: 200,
        no2: 300,
        o3: 40,
        tds: 100,
        ph: 6.8 
    }

    const ranges = {
        aqi: [100, 250, 400],
        pm25: [60, 90, 150],
        pm10: [100, 300, 400],
        no2: [80, 180, 400],
        o3: [100, 200, 600],
        tds: [150, 300, 500],
        ph: []
    }