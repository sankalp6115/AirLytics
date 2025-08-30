from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ashar@12345",
    database="airlytics"
)
cursor = db.cursor(dictionary=True)

app = FastAPI()
BASE_DIR = Path(_file_).resolve().parent.parent
static_dir = BASE_DIR / "web"
# Note: don't mount StaticFiles at "/" because that can intercept API requests (POST -> 405).
# We'll serve static files from the web folder manually in the SPA handler below.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- Models (request bodies) -----------
class Submission(BaseModel):
    pincode: str
    age: int
    gender: str
    symptoms: List[str]

# ----------- Routes -----------
@app.get("/api/quality")
def get_quality():
    try:
        cursor.execute("SELECT * FROM pollution_data ORDER BY recorded_at DESC LIMIT 1")
        data = cursor.fetchone()
        return data if data else {"message": "No data yet"}
    except mysql.connector.Error as e:
        # Log error to console and return HTTP 500
        print("Database error in /api/quality:", e)
        raise HTTPException(status_code=500, detail="Database error")

@app.post("/user/save")
def save_assessment(user: Submission):
    # Risk logic
    risk_level = "Low"
    if "Respiratory" in user.symptoms or user.age > 50:
        risk_level = "Medium"
    if "Severe Cough" in user.symptoms or user.age > 65:
        risk_level = "High"

    advice = "Stay indoors if pollution levels are high."

    cursor.execute("""
        INSERT INTO assessments (name, pincode, age, gender, symptoms, risk_level, advice)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        "Anonymous",
        user.pincode,
        user.age,
        user.gender,
        ",".join(user.symptoms),
        risk_level,
        advice
    ))
    db.commit()

    return {"risk": risk_level, "advice": advice}


def assess(data: Submission):
    risk_level = "Low"
    if "Respiratory" in data.symptoms or data.age > 50:
        risk_level = "Medium"
    return {
        "risk": risk_level,
        "advice": "Stay indoors if pollution levels are high."
    }

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    # If the requested file exists in the web folder, serve it (allows script.js, style.css, etc.)
    requested = static_dir / full_path
    if full_path and requested.exists() and requested.is_file():
        return FileResponse(requested)

    # Otherwise, serve index.html (SPA entrypoint)
    return FileResponse(static_dir / "index.html")