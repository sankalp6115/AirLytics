async function getWeather(city) {
  const apiKey = 'a8eca21a22c89ba4acce4f4c566699d0';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather data");

    const data = await res.json();

    // OpenWeatherMap doesn’t directly give AQI, that comes from another endpoint (Air Pollution API)
    // We'll fetch AQI separately below

    // Fetch AQI
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    const aqiRes = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const aqiData = await aqiRes.json();
    const aqi = aqiData.list[0].main.aqi; // AQI scale is 1–5 in OpenWeatherMap

    // Map AQI scale 1–5 to descriptive text
    const aqiLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];

    document.getElementById("air-quality").innerHTML = `
      🌍 City: ${data.name}<br>
      <div class="aqi-indicator"></div>
      🌫️ AQI: ${aqi} (${aqiLevels[aqi]})<br>
      🌡️ Temperature: ${data.main.temp}°C<br>
      ⛅ Condition: ${data.weather[0].description}<br>
      💧 Humidity: ${data.main.humidity}%<br>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById("air-quality").innerHTML = "⚠️ Error fetching weather data.";
  }
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
    o3: 120,
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
    ph: [6.5, 7, 8.5]
}


const weights = {
    aqi: 0.35,
    pm25: 0.25,
    pm10: 0.15,
    no2: 0.10,
    o3: 0.05,
    tds: 0.05,
    ph: 0.05
};


// Map keys to DOM elements
const elements = {
    pm25: document.querySelector(".pm25"),
    pm10: document.querySelector(".pm10"),
    no2: document.querySelector(".no2"),
    o3: document.querySelector(".o3"),
    tds: document.querySelector(".tds"),
    ph: document.querySelector(".ph"),
    aqi: document.querySelector(".aqi")
}

// Function to classify value
function classifyPollutant(value, thresholds, key) {
    // Handle pH separately (since it’s a range instead of increasing)
    if (key === "ph") {
        if (value >= thresholds[0] && value <= thresholds[2]) {
            return "Good";
        } else {
            return "Bad";
        }
    }

    if (value <= thresholds[0]) return "Good";
    if (value <= thresholds[1]) return "Moderate";
    if (value <= thresholds[2]) return "Bad";
    return "Very Bad";
}

// Loop through pollutants and update DOM
for (let key in ranges) {
    if (elements[key]) {
        const status = classifyPollutant(data[key], ranges[key], key);
        // elements[key].textContent = `${key.toUpperCase()}: ${data[key]} (${status})`;

        // Optional: add color classes
        if (status === "Good") elements[key].style.backgroundColor = "greenyellow";
        else if (status === "Moderate") elements[key].style.backgroundColor = "orange";
        else if (status === "Bad") elements[key].style.backgroundColor = "red";
        else elements[key].style.backgroundColor = "maroon";
    }
}
function getScore(value, thresholds) {
    if (value <= thresholds[0]) return 0;
    if (value <= thresholds[1]) return 1;
    if (value <= thresholds[2]) return 2;
    return 3;
}


let totalScore = 0;
let reasons = [];

for (let key in ranges) {
    const score = getScore(data[key], ranges[key]);
    totalScore += score * weights[key];
    
    if (score >= 2) {
        reasons.push(`${key.toUpperCase()} is ${score === 2 ? "Poor" : "Very Bad"}`);
    }
}

// Normalize score to a 0–3 scale
const riskLevelValue = totalScore / Object.values(weights).reduce((a,b)=>a+b,0);

// if (status === "Good") elements[key].style.backgroundColor = "greenyellow";
        // else if (status === "Moderate") elements[key].style.backgroundColor = "orange";
        // else if (status === "Bad") elements[key].style.backgroundColor = "red";
        // else elements[key].style.backgroundColor = "maroon";

const riskLevel = document.querySelector(".riskLevel");


let riskLevelText = "";
if (riskLevelValue < 0.5) {
    riskLevelText = "Low";
    riskLevel.style.backgroundColor = "greenyellow";
}
else if (riskLevelValue < 1.5) {
    riskLevelText = "Moderate"
    riskLevel.style.backgroundColor = "orange";
}
else if (riskLevelValue < 2.5) {
    riskLevelText = "High"
    riskLevel.style.backgroundColor = "red"
}
else {
    riskLevelText = "Severe"
    riskLevel.style.backgroundColor = "maroon"
};

// Update DOM
riskLevel.textContent = `Risk Level: ${riskLevelText}`;
document.querySelector(".reason").textContent = 
    reasons.length ? `Reason: ${reasons.join(", ")}` : "Reason: All parameters are safe.";