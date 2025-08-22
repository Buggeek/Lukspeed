"""
LukSpeed Backend API - FastAPI Application
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import uuid

# Initialize FastAPI app
app = FastAPI(
    title="LukSpeed API",
    description="Cycling performance platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    strava_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class Activity(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    type: Optional[str] = None
    distance_m: Optional[float] = None
    moving_time_s: Optional[int] = None
    average_power: Optional[float] = None
    start_date: Optional[datetime] = None
    created_at: datetime

class DashboardData(BaseModel):
    total_activities: int
    total_distance: float
    total_time: int
    avg_power: float
    recent_activities: List[Activity]
    performance_trends: List[Dict[str, Any]]

# Mock data
MOCK_ACTIVITIES = [
    {
        "id": "1",
        "user_id": "user1",
        "name": "Morning Ride",
        "type": "Ride",
        "distance_m": 35200,
        "moving_time_s": 3600,
        "average_power": 245,
        "start_date": "2025-08-10T07:30:00Z",
        "created_at": "2025-08-10T07:30:00Z",
    }
]

# API Routes
@app.get("/")
async def root():
    return {"message": "LukSpeed API v1.0.0"}

@app.post("/auth/strava/connect")
async def strava_connect():
    """Initiate Strava OAuth connection"""
    return {
        "auth_url": "https://www.strava.com/oauth/authorize?client_id=123&response_type=code&redirect_uri=http://localhost:3000/callback&scope=read,activity:read"
    }

@app.post("/auth/strava/callback")
async def strava_callback(code: str):
    """Handle Strava OAuth callback"""
    # Mock user creation after OAuth
    return {
        "id": "user_123",
        "email": "john.doe@example.com", 
        "name": "John Doe",
        "strava_id": "12345",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

@app.get("/users/profile")
async def get_user_profile():
    """Get user profile"""
    return {
        "id": "user_123",
        "email": "john.doe@example.com",
        "name": "John Doe", 
        "strava_id": "12345",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

@app.get("/activities")
async def get_activities(page: int = 1, limit: int = 20):
    """Get user's activities with pagination"""
    return {
        "activities": MOCK_ACTIVITIES,
        "total": len(MOCK_ACTIVITIES)
    }

@app.post("/activities/sync")
async def sync_activities():
    """Sync activities from Strava"""
    return {"synced": 5}

@app.get("/analytics/dashboard")
async def get_dashboard_data():
    """Get dashboard data"""
    return {
        "total_activities": 45,
        "total_distance": 1245.8,
        "total_time": 82800,
        "avg_power": 245,
        "recent_activities": MOCK_ACTIVITIES,
        "performance_trends": [
            {"date": "2025-07-14", "power": 235, "speed": 32.5, "distance": 28.2},
            {"date": "2025-08-11", "power": 248, "speed": 34.8, "distance": 37.2}
        ]
    }

@app.get("/bicycles")
async def get_bicycles():
    """Get user's bicycles"""
    return [
        {
            "id": "1",
            "user_id": "user1", 
            "brand": "Canyon",
            "model": "Aeroad CF SLX",
            "type": "road",
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)