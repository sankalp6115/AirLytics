const express = require("express");
const fetch = require("node-fetch"); // use node-fetch@2
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

const API_KEY ='a8eca21a22c89ba4acce4f4c566699d0';

app.get("/api/weather", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: "Provide city OR lat/lon" });
    }

    let weatherUrl = city
      ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherRes.ok) {
      return res.status(weatherRes.status).json(weatherData);
    }

    const latitude = lat || weatherData.coord.lat;
    const longitude = lon || weatherData.coord.lon;

    const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
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
    console.error(err);
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