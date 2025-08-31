from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse
from pathlib import path

# Optional import for MySQL — guard so server still starts if package missing
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
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
            host="localhost",
            user="root",
            password="Ashar@12345",
            database="airlytics"
        )
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM pollution_data ORDER BY recorded_at DESC LIMIT 1")
        data = cur.fetchone()
        cur.close()
        conn.close()
        return data if data else {"message": "No data yet"}
    except mysql.connector.Error as e:
        # Log error to console and return HTTP 500
        print("Database error in /api/quality:", e)
        raise HTTPException(status_code=500, detail="Database error")

# Replace existing save handler with a safer per-request DB implementation
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
            host= os.getenv("MYSQL_HOST"),
            user= os.getenv("MYSQL_USER"),
            password= os.getenv("MYSQL_PASSWORD"),
            database="os.getenv("MYSQL_DATABASE")
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


# SPA catch-all (placed after API routes so APIs are matched first)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If this looks like an API route, return 404 and let the client handle it
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    # If the requested file exists in the web folder, serve it (allows script.js, style.css, etc.)
    requested = static_dir / full_path
    if full_path and requested.exists() and requested.is_file():
        return FileResponse(requested)

    # Otherwise, serve index.html (SPA entrypoint)
    return FileResponse(static_dir / "index.html")