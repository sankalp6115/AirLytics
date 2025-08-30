    async function getWeather(city) {
      const res = await fetch(`http://localhost:3000/api/weather?city=${city}`);
      const data = await res.json();

      document.getElementById("air-quality").innerHTML = `
        <div class="aqi-indicator"></div>
        🌍 City: ${data.city}<br>
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
