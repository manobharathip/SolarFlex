"""
SolarFlex Energy Manager
Handles solar-aware energy allocation and battery management
"""

import json
from datetime import datetime
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class EnergyState:
    battery_soc_percent: float
    solar_power_watts: float
    battery_capacity_wh: float = 1000.0
    min_soc_percent: float = 20.0
    max_discharge_rate: float = 0.5  # Max 50% of battery per hour


class EnergyManager:
    def __init__(self):
        self.energy_states = {}
        self.energy_history = []

    def update_energy_state(self, module_id: str, power_data: dict):
        """Update energy state from sensor data"""
        self.energy_states[module_id] = EnergyState(
            battery_soc_percent=power_data.get("battery_soc_percent", 50.0),
            solar_power_watts=power_data.get("solar_power_watts", 0.0)
        )

    def calculate_available_power(self) -> float:
        """Calculate total available power from solar + battery"""
        total_solar = sum(state.solar_power_watts for state in self.energy_states.values())
        total_battery_power = 0

        for state in self.energy_states.values():
            available_wh = state.battery_capacity_wh * (state.battery_soc_percent / 100)
            usable_wh = available_wh * (1 - state.max_discharge_rate)
            total_battery_power += usable_wh

        return total_solar + total_battery_power

    def check_energy_budget(self, module_id: str, required_watts: float) -> bool:
        """Check if we have energy budget for a module"""
        if module_id not in self.energy_states:
            return False

        state = self.energy_states[module_id]
        available_power = self.calculate_available_power()

        # Check battery SOC
        if state.battery_soc_percent <= state.min_soc_percent:
            return False

        # Check if solar can sustain the load
        if state.solar_power_watts >= required_watts:
            return True

        # Check if battery can cover the deficit
        deficit = required_watts - state.solar_power_watts
        return deficit <= (state.battery_capacity_wh * 0.5)  # 50% max discharge

    def get_energy_priority_score(self, module_id: str) -> float:
        """Calculate priority score based on energy availability (0-100)"""
        if module_id not in self.energy_states:
            return 0.0

        state = self.energy_states[module_id]

        # Score components
        soc_score = state.battery_soc_percent  # 0-100
        solar_score = min(state.solar_power_watts / 500 * 100, 100)  # Normalize to 100

        # Weighted combination (solar matters more for sustainability)
        priority_score = (0.4 * soc_score) + (0.6 * solar_score)

        return round(priority_score, 1)

    def suggest_mode(self, module_id: str) -> str:
        """Suggest fixed vs adaptive mode based on energy state"""
        if module_id not in self.energy_states:
            return "fixed"

        state = self.energy_states[module_id]

        if state.solar_power_watts > 200 and state.battery_soc_percent > 70:
            return "adaptive"  # Plenty of solar, can optimize
        elif state.solar_power_watts > 100 and state.battery_soc_percent > 50:
            return "adaptive"  # Moderate solar, still good
        else:
            return "fixed"  # Low solar/battery, stick to basics

    def log_energy_event(self, module_id: str, event_type: str, details: dict):
        """Log energy event for analytics"""
        self.energy_history.append({
            "timestamp": datetime.utcnow().isoformat(),
            "module_id": module_id,
            "event_type": event_type,
            "details": details
        })

    def get_energy_summary(self) -> dict:
        """Get summary of current energy state"""
        summary = {
            "total_solar_power_watts": sum(s.solar_power_watts for s in self.energy_states.values()),
            "average_soc_percent": sum(s.battery_soc_percent for s in self.energy_states.values()) / max(len(self.energy_states), 1),
            "module_count": len(self.energy_states),
            "recommendation": "adaptive" if self.calculate_available_power() > 500 else "conservative"
        }
        return summary