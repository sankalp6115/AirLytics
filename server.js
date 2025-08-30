const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch
require("dotenv").config(); // npm install dotenv

const app = express();
const PORT = 3000;

// Load API key from .env file
const API_KEY = process.env.OPENWEATHERMAP_KEY;

// Allow frontend access
const cors = require("cors");
app.use(cors());

// Endpoint for weather + AQI
app.get("/api/weather", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    // Fetch weather
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    // If lat/lon not given, extract from weather data
    const latitude = lat || weatherData.coord.lat;
    const longitude = lon || weatherData.coord.lon;

    let aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    // Fetch AQI
    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();

    res.json({
      city: weatherData.name,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      condition: weatherData.weather[0].description,
      aqi: aqiData.list[0].main.aqi,
      pollutants: aqiData.list[0].components
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});


//user data
app.post("/user/save", async (req, res) => {
  const uri = "mongodb://localhost:27017/";
  const client = new MongoClient(uri);

  await client.connect();
  let db = client.db("customers");
  let usercolllection = db.collection("userdetails");

  
  let age = req.body.age;
  let gender = req.body.gender;
  let pincode = req.body.pincode;
  let symptoms = req.body.symptoms;

  //include all fields in the document
  let data = { age: age, pincode: pincode, gender: gender, symptoms: symptoms };
    await usercolllection.insertOne(data);
    res.json({ message: "data stored successfully" });
   
});