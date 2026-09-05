"""
SolarFlex FastAPI Backend
Provides REST API for dashboard and analytics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SolarFlex API",
    description="Solar-Powered Smart Cold Storage System API",
    version="1.0.0"
)

# CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class ModuleStatus(BaseModel):
    module_id: str
    temperature_c: float
    humidity_percent: float
    compressor_state: str
    battery_soc_percent: float
    solar_power_watts: float
    crop_type: str
    timestamp: Optional[str] = None


class EnergySummary(BaseModel):
    total_solar_power_watts: float
    average_soc_percent: float
    module_count: int
    recommendation: str


# In-memory storage (will be replaced with PostgreSQL/SQLite)
module_states: Dict[str, ModuleStatus] = {}
energy_summary: EnergySummary = EnergySummary(
    total_solar_power_watts=0.0,
    average_soc_percent=50.0,
    module_count=0,
    recommendation="conservative"
)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "SolarFlex API",
        "version": "1.0.0",
        "status": "running",
        "modules_monitored": len(module_states),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.get("/modules", tags=["Modules"])
async def get_all_modules():
    """Get status of all monitored modules"""
    return {
        "modules": list(module_states.values()),
        "count": len(module_states),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/modules/{module_id}", tags=["Modules"])
async def get_module(module_id: str):
    """Get status of a specific module"""
    if module_id not in module_states:
        raise HTTPException(status_code=404, detail=f"Module {module_id} not found")
    return module_states[module_id]


@app.get("/energy/summary", tags=["Energy"])
async def get_energy_summary():
    """Get current energy summary"""
    return energy_summary


@app.get("/energy/priority", tags=["Energy"])
async def get_energy_priority():
    """Get energy-based priority ranking for modules"""
    priorities = []
    for module_id, state in module_states.items():
        # Calculate priority based on SOC and solar
        soc_score = state.battery_soc_percent
        solar_score = min(state.solar_power_watts / 5, 100)  # Normalize

        priority = round(0.4 * soc_score + 0.6 * solar_score, 1)
        priorities.append({
            "module_id": module_id,
            "priority_score": priority,
            "battery_soc_percent": state.battery_soc_percent,
            "solar_power_watts": state.solar_power_watts
        })

    priorities.sort(key=lambda x: x["priority_score"], reverse=True)

    return {
        "priorities": priorities,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/analytics/energy", tags=["Analytics"])
async def get_energy_analytics():
    """Get energy analytics (kWh, Wh/kg)"""
    # Placeholder - will connect to database
    return {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "total_kwh_consumed": 12.5,
        "average_wh_per_kg_day": 150.0,
        "total_modules_active": len(module_states),
        "efficiency_score": 0.85
    }


@app.get("/config/crop/{crop_type}", tags=["Config"])
async def get_crop_config(crop_type: str):
    """Get crop profile configuration"""
    return {
        "crop_type": crop_type,
        "targets": {
            "tomato": {"temp_c": 10, "humidity_percent": 85},
            "cabbage": {"temp_c": 0, "humidity_percent": 98},
            "beans": {"temp_c": 5, "humidity_percent": 95},
            "leafy_greens": {"temp_c": 1, "humidity_percent": 98},
            "chilli": {"temp_c": 9, "humidity_percent": 95}
        }.get(crop_type, {"temp_c": 10, "humidity_percent": 85})
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("API_PORT", 8000)))