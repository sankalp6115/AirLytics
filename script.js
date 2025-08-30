// Shooting stars background
    const canvas = document.getElementById("stars");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stars = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.2,
    }));

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        stars.forEach((s) => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            s.x -= s.speed;
            s.y += s.speed * 0.5;
            if (s.x < 0 || s.y > canvas.height) {
                s.x = Math.random() * canvas.width;
                s.y = 0;
            }
        });
        requestAnimationFrame(drawStars);
    }
    drawStars();

// Gauge Representation of AQI
function setNeedle(aqi) {
    const minAQI = 0;
    const maxAQI = 500;
    const angle = ((aqi - minAQI) / (maxAQI - minAQI)) * 180 - 90;

    const needle = document.querySelector(".needle");
    console.log(needle);
    if (needle) {
        needle.style.transform = `rotate(${angle}deg)`;
    }
}

const molecularWeights = {
    co: 28,
    no: 30,
    no2: 46,
    o3: 48,
    so2: 64,
    nh3: 17
};

// Convert µg/m³ to ppb
function ugm3ToPpb(valueUgM3, gas) {
    if (!molecularWeights[gas]) return null;
    return (valueUgM3 * 24.45) / molecularWeights[gas];
}

// Convert µg/m³ to ppm
function ugm3ToPpm(valueUgM3, gas) {
    const ppb = ugm3ToPpb(valueUgM3, gas);
    return ppb ? ppb / 1000 : null;
}

// Classification and risk calculation helpers
const ranges = {
    aqi: [100, 250, 400],
    pm25: [60, 90, 150],
    pm10: [100, 300, 400],
    no2: [80, 180, 400],
    o3: [100, 200, 600],
    tds: [150, 300, 500], // static placeholders
    ph: [6.5, 7, 8.5]     // static placeholders
};

const weights = {
    aqi: 0.35,
    pm25: 0.25,
    pm10: 0.15,
    no2: 0.10,
    o3: 0.05,
    tds: 0.05,
    ph: 0.05
};

function classifyPollutant(value, thresholds, key) {
    if (key === "ph") return (value >= thresholds[0] && value <= thresholds[2]) ? "Good" : "Bad";
    if (value <= thresholds[0]) return "Good";
    if (value <= thresholds[1]) return "Moderate";
    if (value <= thresholds[2]) return "Bad";
    return "Very Bad";
}

function getScore(value, thresholds) {
    if (value <= thresholds[0]) return 0;
    if (value <= thresholds[1]) return 1;
    if (value <= thresholds[2]) return 2;
    return 3;
}

// Main function
async function getWeather(city) {
    const apiKey = 'a8eca21a22c89ba4acce4f4c566699d0';

    try {
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherRes.json();
        const { lat, lon } = weatherData.coord;

        const aqiRes = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const aqiData = await aqiRes.json();
        const aqi = aqiData.list[0].main.aqi;
        const components = aqiData.list[0].components;

        // Map AQI 1–5 to text
        const aqiLevels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];

        document.getElementById("air-quality").innerHTML += `
            🌍 City: ${weatherData.name}<br>
            🌫️ AQI: ${aqiLevels[aqi]}<br>
            🌡️ Temperature: ${weatherData.main.temp}°C<br>
            ⛅ Condition: ${weatherData.weather[0].description}<br>
            💧 Humidity: ${weatherData.main.humidity}%<br>
        `;

        setNeedle(aqi);

        // Update pollutants in HTML
        const elements = {
            pm25: document.querySelector(".pm25"),
            pm10: document.querySelector(".pm10"),
            no2: document.querySelector(".no2"),
            o3: document.querySelector(".o3"),
            tds: document.querySelector(".tds"),
            ph: document.querySelector(".ph"),
            aqi: document.querySelector(".aqi")
        };

        const dynamicData = {
            pm25: components.pm2_5,
            pm10: components.pm10,
            no2: components.no2,
            o3: components.o3,
            aqi: aqi,
            tds: 200, 
            ph: 7.0
        };

        for (let key in dynamicData) {
            if (elements[key]) {
                const value = dynamicData[key];
                const status = classifyPollutant(value, ranges[key], key);
                
                // Update color
                if (status === "Good") elements[key].style.backgroundColor = "greenyellow";
                else if (status === "Moderate") elements[key].style.backgroundColor = "orange";
                else if (status === "Bad") elements[key].style.backgroundColor = "red";
                else elements[key].style.backgroundColor = "maroon";

                // Update text content
                if (key === "no2" || key === "o3" || key === "co" || key === "so2" || key === "nh3") {
                    const ppb = ugm3ToPpb(components[key], key)?.toFixed(2);
                    elements[key].querySelector("p").textContent = ppb ? `${ppb} ppb` : "N/A";
                } else {
                    elements[key].querySelector("p").textContent = `${value.toFixed(1)}${key === "aqi" ? "" : " µg/m³"}`;
                }
            }
        }

        // Risk calculation
        let totalScore = 0;
        let reasons = [];

        for (let key in dynamicData) {
            const score = getScore(dynamicData[key], ranges[key]);
            totalScore += score * weights[key];
            if (score >= 2) reasons.push(`${key.toUpperCase()} is ${score === 2 ? "Poor" : "Very Bad"}`);
        }

        const riskLevelValue = totalScore / Object.values(weights).reduce((a,b)=>a+b,0);
        const riskLevel = document.querySelector(".riskLevel");
        let riskLevelText = "";

        if (riskLevelValue < 0.5) {
            riskLevelText = "Low";
            riskLevel.style.backgroundColor = "greenyellow";
        } else if (riskLevelValue < 1.5) {
            riskLevelText = "Moderate";
            riskLevel.style.backgroundColor = "orange";
        } else if (riskLevelValue < 2.5) {
            riskLevelText = "High";
            riskLevel.style.backgroundColor = "red";
        } else {
            riskLevelText = "Severe";
            riskLevel.style.backgroundColor = "maroon";
        }

        riskLevel.textContent = `Risk Level: ${riskLevelText}`;
        document.querySelector(".reason").textContent = reasons.length ? `Reason: ${reasons.join(", ")}` : "Reason: All parameters are safe.";

    } catch (err) {
        console.error("Error fetching weather or air pollution data:", err);
        document.getElementById("air-quality").innerHTML = "⚠️ Could not fetch weather data.";
    }
}

// Run for default city
getWeather("Kanpur");

const tooltipBtns = document.querySelectorAll("tooltipBtn");
// Tooltip system
tooltipBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const tooltip = btn.nextElementSibling;
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
        tooltip.style.display = "block";
    });
    btn.addEventListener("mouseout", () => {
        const tooltip = btn.nextElementSibling;
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
        tooltip.style.display = "none";
    });
});


// Adding shrink functionality to info box
const infoBox = document.querySelector(".inforamaticsAndFormulas");
const expandBtn = document.querySelector(".expandBtn");

let isExpanded = false;

expandBtn.addEventListener("click", () => {
    infoBox.style.height = isExpanded ? "70px" : "max-content";
    expandBtn.querySelector("img").style.transform = isExpanded ? "rotate(00deg)" : "rotate(90deg)";
    
    isExpanded = !isExpanded; // toggle the state
});

