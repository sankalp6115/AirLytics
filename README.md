# AirLytics – Know Your Air, Protect Your Health

**Group Leader:** Sankalp  
**Team Members:** [Add names of all other teammates]

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features Implemented](#features-implemented)
3. [Planned Future Features](#planned-future-features)
4. [System Workflow](#system-workflow)
5. [How to Start the Project](#how-to-start-the-project)
6. [How to Use the Project](#how-to-use-the-project)
7. [Technologies Used](#technologies-used)
8. [Acknowledgements](#acknowledgements)

---

## Project Overview

AirLytics is a modern web application designed to provide **real-time insights into air and water quality** based on city-level data and user input. The system calculates a **weighted risk factor** for health and visually represents it using gauges, colors, and an interactive UI. Users can also download a **self-diagnosis PDF report** based on their inputs.

Our mission: **Empower users to make informed decisions about their environment and health.**

---

## Features Implemented

### 1. Data Acquisition

- Air and weather data fetched from **OpenWeatherMap API**.
- Data includes:
  - AQI and pollutant concentrations (PM2.5, PM10, NO₂, O₃, CO, SO₂, NH₃)
  - Temperature, humidity, and weather conditions
- User input form:
  - Age, gender, PIN code, and self-reported symptoms

### 2. Pollutant Risk Assessment

- Weighted scoring system:
  - Each pollutant assigned a weight (e.g., AQI 0.35, PM2.5 0.25, etc.)
  - Pollutants scored 0–3 based on thresholds
  - Overall Risk Score = Σ(score × weight) normalized by total weights
- Risk Levels:
  - 0 – 0.5 → Low
  - 0.5 – 1.5 → Moderate
  - 1.5 – 2.5 → High
  - 2.5 – 3 → Severe
- Visual cues:
  - Color-coded indicators for pollutants and overall risk
  - AQI gauge with rotating needle (mapped -90° to +90° for 0–500 AQI)

### 3. Dynamic UI Elements

- Tooltips for pollutants and water quality parameters
- Shrinkable info box for “Working of our system”
- PDF generation for user self-diagnosis report

### 4. Water Quality Parameters

- Display of TDS and pH with sample/static data
- Future plans to integrate real water quality APIs

---

## Planned Future Features

- Integration of **real-time water quality APIs**
- Database storage for user self-diagnosis data
- Machine learning model to **predict risk trends** based on historical data
- Enhanced **PDF reports** with visualizations (graphs/charts)
- Interactive **dashboard with analytics** for multi-city air quality comparison
- Mobile-first responsive design improvements
- Real-time **alerts and notifications** for severe AQI levels
- Personalized **health recommendations** based on age, gender, and symptoms

---

## System Workflow

### 1. Data Acquisition

- Fetch weather & AQI using city name or geolocation
- Collect user inputs from form

### 2. Pollutant Scoring

- For each pollutant:
  - Compare against thresholds → assign score (0–3)
- Apply weights → calculate overall risk score
- Map risk score to risk level and color-code UI

### 3. Visual Representation

- AQI needle gauge rotates according to current AQI
- DOM elements colored according to pollutant risk levels
- Tooltips provide pollutant descriptions

### 4. PDF Report

- Self-diagnosis form data exported as downloadable PDF
- Future: Store reports in database for ML predictions

---

## How to Start the Project

### Requirements

- Node.js (v16+ recommended)
- Internet connection (for API calls)
- Modern web browser

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>

   ```

2. Navigate to project folder:

   ```bash
   cd AirLytics

   ```

3. Install Dependancies:
   ```bash
   npm install
   ```

## How to Use the Project

- Enter your city name to fetch real-time air quality and weather data

- Fill out the self-diagnosis form:

- Age, gender, symptoms, and PIN code

- View:

- Pollutant levels (PM2.5, PM10, NO₂, O₃, etc.) in µg/m³ or ppb

- Overall risk level with color-coded indicator

- Tooltip descriptions for each pollutant

- Download PDF report of your self-diagnosis (click Submit)

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- API: OpenWeatherMap (Weather & Air Pollution)
- PDF Generation: jsPDF (for generating user's reports)
- Design: Responsive layouts, tooltips, gauges


## Acknowledgements

- OpenWeatherMap API for air quality and weather data
- jsPDF library for PDF report generation
- Team collaboration and support
