from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse
import os

# Optional MySQL import
try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except Exception as e:
    print("Warning: mysql.connector import failed:", e)
    mysql = None
    MYSQL_AVAILABLE = False

import json

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "userForm"

# CORS: Restrict to your front-end's Railway URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "https://your-frontend.railway.app")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- Models (request bodies) -----------
class Submission(BaseModel):
    name: str
    pincode: str
    age: int
    gender: str
    symptoms: List[str]

# ----------- Routes -----------
@app.get("/api/quality")
def get_quality():
    if not MYSQL_AVAILABLE:
        raise HTTPException(status_code=503, detail="MySQL connector not available")
        
    try:
        conn = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE")
        )
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM pollution_data ORDER BY recorded_at DESC LIMIT 1")
        data = cur.fetchone()
        cur.close()
        conn.close()
        return data if data else {"message": "No data yet"}
    except mysql.connector.Error as e:
        print("Database error in /api/quality:", e)
        raise HTTPException(status_code=500, detail="Database error")

@app.post("/user/rsave")
def save_assessment(user: Submission):
    if not MYSQL_AVAILABLE:
        raise HTTPException(status_code=503, detail="MySQL connector not available")
        
    # Risk logic
    risk_level = "Low"
    if "Respiratory" in user.symptoms or user.age > 50:
        risk_level = "Medium"
    if "Severe Cough" in user.symptoms or user.age > 65:
        risk_level = "High"

    advice = "Stay indoors if pollution levels are high."

    try:
        conn = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE")
        )
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO assessments (name, pincode, age, gender, symptoms, risk_level, advice)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user.name,
                user.pincode,
                user.age,
                user.gender,
                json.dumps(user.symptoms),
                risk_level,
                advice,
            ),
        )
        conn.commit()
        inserted_id = cur.lastrowid
    except mysql.connector.Error as e:
        print("Database error in /user/rsave:", e)
        raise HTTPException(status_code=500, detail="Database error")
    finally:
        try:
            cur.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

    return {"id": inserted_id, "risk": risk_level, "advice": advice}

# SPA catch-all
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    requested = static_dir / full_path
    if full_path and requested.exists() and requested.is_file():
        return FileResponse(requested)

    return FileResponse(static_dir / "index.html")