"""
SolarFlex Cooling Engine
Handles cooling priority decisions and module scheduling
"""

import json
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ModuleState:
    module_id: str
    current_temperature_c: float
    target_temperature_c: float
    current_humidity_percent: float
    target_humidity_percent: float
    crop_type: str
    priority_score: float = 0.0
    needs_cooling: bool = False


class CoolingEngine:
    def __init__(self):
        self.module_states = {}
        self.crop_profiles = self._load_crop_profiles()

    def _load_crop_profiles(self) -> dict:
        """Load crop temperature/humidity profiles"""
        config_path = Path(__file__).parent / "crop_profiles.json"
        with open(config_path, 'r') as f:
            return json.load(f)

    def update_module_state(self, module_id: str, sensor_data: dict):
        """Update module state from sensor data"""
        if module_id not in self.module_states:
            self.module_states[module_id] = ModuleState(
                module_id=module_id,
                current_temperature_c=sensor_data.get("temperature_c", 25.0),
                target_temperature_c=10.0,
                current_humidity_percent=sensor_data.get("humidity_percent", 65.0),
                target_humidity_percent=85.0,
                crop_type="tomato"
            )
        else:
            self.module_states[module_id].current_temperature_c = sensor_data.get("temperature_c", 25.0)
            self.module_states[module_id].current_humidity_percent = sensor_data.get("humidity_percent", 65.0)

    def set_module_crop(self, module_id: str, crop_type: str):
        """Set crop type for a module and update targets"""
        if crop_type in self.crop_profiles["crop_profiles"]:
            profile = self.crop_profiles["crop_profiles"][crop_type]

            if module_id not in self.module_states:
                self.module_states[module_id] = ModuleState(
                    module_id=module_id,
                    current_temperature_c=25.0,
                    target_temperature_c=profile["target_temperature_c"]["optimal"],
                    current_humidity_percent=65.0,
                    target_humidity_percent=profile["target_humidity_percent"]["optimal"],
                    crop_type=crop_type
                )
            else:
                self.module_states[module_id].target_temperature_c = profile["target_temperature_c"]["optimal"]
                self.module_states[module_id].target_humidity_percent = profile["target_humidity_percent"]["optimal"]
                self.module_states[module_id].crop_type = crop_type

    def calculate_cooling_priority(self, module_id: str, energy_priority_score: float) -> float:
        """
        Calculate cooling priority based on temperature/humidity deviation + energy score
        Returns 0-100 priority score (higher = more urgent)
        """
        if module_id not in self.module_states:
            return 0.0

        state = self.module_states[module_id]

        # Temperature deviation (higher = more urgent)
        temp_dev = max(0, state.current_temperature_c - state.target_temperature_c)
        temp_priority = min(temp_dev * 10, 50)  # Max 50 points from temp

        # Humidity deviation (if too low, increase priority)
        humidity_dev = max(0, state.target_humidity_percent - state.current_humidity_percent)
        humidity_priority = min(humidity_dev / 2, 25)  # Max 25 points from humidity

        # Energy score contribution
        energy_priority = energy_priority_score * 0.25  # Max 25 points from energy

        total_priority = temp_priority + humidity_priority + energy_priority

        state.priority_score = round(total_priority, 1)
        return total_priority

    def should_cool_module(self, module_id: str) -> bool:
        """Determine if a module needs active cooling"""
        if module_id not in self.module_states:
            return False

        state = self.module_states[module_id]

        # Check if temperature is above target + hysteresis
        temp_dev = state.current_temperature_c - state.target_temperature_c
        if temp_dev > 1.0:  # 1°C hysteresis
            return True

        # Check if humidity is too low
        humidity_dev = state.target_humidity_percent - state.current_humidity_percent
        if humidity_dev > 5.0:
            return True

        return False

    def get_priority_list(self, energy_priority_scores: dict) -> List[dict]:
        """
        Get sorted list of modules by cooling priority
        Returns list of {module_id, priority, target_temperature_c}
        """
        priority_list = []

        for module_id, state in self.module_states.items():
            energy_score = energy_priority_scores.get(module_id, 50.0)
            priority = self.calculate_cooling_priority(module_id, energy_score)

            if priority > 20:  # Minimum threshold to include in schedule
                priority_list.append({
                    "module_id": module_id,
                    "priority": priority,
                    "target_temperature_c": state.target_temperature_c,
                    "current_temperature_c": state.current_temperature_c,
                    "crop_type": state.crop_type
                })

        # Sort by priority (descending - highest priority first)
        priority_list.sort(key=lambda x: x["priority"], reverse=True)

        return priority_list

    def generate_control_command(self, module_id: str, should_cool: bool) -> dict:
        """Generate control command for a module"""
        if module_id not in self.module_states:
            return {}

        state = self.module_states[module_id]

        command = {
            "timestamp": datetime.utcnow().isoformat(),
            "module_id": module_id,
            "action": {
                "compressor_setpoint": {
                    "target_temperature_c": state.target_temperature_c,
                    "hysteresis_c": 1.0
                },
                "fan_speed_percent": 75 if should_cool else 30,
                "vent_open": False
            }
        }

        return command