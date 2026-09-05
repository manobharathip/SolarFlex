"""
SolarFlex Fake Sensor Simulator
Generates realistic MQTT sensor data for testing control algorithms

Run in two modes:
1. With MQTT (requires Mosquitto broker): python fake_sensor.py
2. Standalone mode (no MQTT): python fake_sensor.py --standalone
"""

import json
import random
import time
import argparse
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

# MQTT Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_CLIENT_ID = "solarflex_simulator"

# Simulation Parameters
MODULE_IDS = ["module_01", "module_02"]
PUBLISH_INTERVAL = 5  # seconds


def parse_args():
    parser = argparse.ArgumentParser(description="SolarFlex Fake Sensor Simulator")
    parser.add_argument("--standalone", action="store_true", help="Run without MQTT (standalone mode)")
    return parser.parse_args()


class FakeSensorSimulator:
    def __init__(self):
        # Simulation state for each module
        self.module_states = {}
        for module_id in MODULE_IDS:
            self.module_states[module_id] = {
                # Temperature (starts at ambient, will cool down when compressor on)
                "temperature_c": random.uniform(20.0, 28.0),
                "target_temperature_c": 10.0,
                "cooling_rate": 0.05,  # C per update when compressor on
                "warming_rate": 0.02,  # C per update when compressor off

                # Humidity
                "humidity_percent": random.uniform(60.0, 75.0),

                # Ambient conditions
                "ambient_temperature_c": random.uniform(25.0, 32.0),

                # Power
                "battery_voltage": random.uniform(11.5, 12.8),
                "battery_soc_percent": random.uniform(60.0, 95.0),
                "solar_voltage": 0.0,
                "solar_current_amps": 0.0,
                "solar_power_watts": 0.0,

                # Compressor state
                "compressor_on": False,
                "compressor_cycles": 0,

                # Crop type
                "crop_type": random.choice(["tomato", "cabbage", "beans", "leafy_greens", "chilli"])
            }

        # Time of day simulation (for solar)
        self.simulation_hour = 5.0  # Start at 5 AM
        self.standalone_mode = False

    def update_solar_power(self):
        """Simulate solar generation based on time of day"""
        # Solar generation curve: rises from 6 AM, peaks at noon, drops by 6 PM
        hour = self.simulation_hour % 24

        if 6 <= hour <= 18:
            # Daylight hours - bell curve
            solar_factor = 1.0 - abs(hour - 12) / 6.0
            base_power = 500  # 500W panel
            solar_power = base_power * solar_factor * random.uniform(0.7, 1.0)

            # Add cloud variation
            if random.random() < 0.1:  # 10% chance of cloud
                solar_power *= random.uniform(0.3, 0.6)
        else:
            # Night time
            solar_power = 0.0

        return solar_power

    def update_module_state(self, module_id):
        """Update simulation state for a single module"""
        state = self.module_states[module_id]

        # Update solar power
        solar_power = self.update_solar_power()
        state["solar_power_watts"] = round(solar_power, 1)
        state["solar_voltage"] = round(solar_power / 20.0 if solar_power > 0 else 0.0, 1)
        state["solar_current_amps"] = round(solar_power / 18.0 if solar_power > 0 else 0.0, 2)

        # Simple cooling logic: turn compressor on if temp > target + hysteresis
        hysteresis = 1.0
        if state["temperature_c"] > state["target_temperature_c"] + hysteresis:
            if not state["compressor_on"]:
                state["compressor_on"] = True
                state["compressor_cycles"] += 1
        elif state["temperature_c"] < state["target_temperature_c"] - hysteresis:
            state["compressor_on"] = False

        # Update temperature based on compressor state
        if state["compressor_on"]:
            # Cooling
            state["temperature_c"] -= state["cooling_rate"] * random.uniform(0.8, 1.2)
            # Humidity increases when cooling
            state["humidity_percent"] += random.uniform(0.1, 0.3)
        else:
            # Warming towards ambient
            ambient_diff = state["ambient_temperature_c"] - state["temperature_c"]
            state["temperature_c"] += state["warming_rate"] * ambient_diff * random.uniform(0.8, 1.2)
            state["humidity_percent"] -= random.uniform(0.05, 0.2)

        # Clamp values
        state["temperature_c"] = max(0, min(35, state["temperature_c"]))
        state["humidity_percent"] = max(50, min(100, state["humidity_percent"]))

        # Update battery (drain when compressor on, charge when solar available)
        load_watts = 150 if state["compressor_on"] else 10  # Compressor uses 150W
        net_power = solar_power - load_watts

        # Simplified battery model
        if net_power > 0:
            # Charging
            state["battery_soc_percent"] += 0.05 * (net_power / 500)
        else:
            # Discharging
            state["battery_soc_percent"] -= 0.08 * (abs(net_power) / 150)

        state["battery_soc_percent"] = max(20, min(100, state["battery_soc_percent"]))
        state["battery_voltage"] = 10.5 + (state["battery_soc_percent"] / 100) * 2.3

        # Ambient temperature varies with time of day
        hour = self.simulation_hour % 24
        base_ambient = 28.0
        if 6 <= hour <= 18:
            state["ambient_temperature_c"] = base_ambient + 4 * (1 - abs(hour - 12) / 6)
        else:
            state["ambient_temperature_c"] = base_ambient - 2

        # Add noise to ambient
        state["ambient_temperature_c"] += random.uniform(-0.5, 0.5)

    def generate_sensor_payload(self, module_id):
        """Generate MQTT sensor payload for a module"""
        state = self.module_states[module_id]

        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "module_id": module_id,
            "sensor_data": {
                "temperature_c": round(state["temperature_c"], 1),
                "humidity_percent": round(state["humidity_percent"], 1),
                "ambient_temperature_c": round(state["ambient_temperature_c"], 1),
                "soil_moisture_percent": round(random.uniform(40, 60), 1),
                "co2_ppm": round(random.uniform(400, 600), 0)
            },
            "power_data": {
                "battery_voltage": round(state["battery_voltage"], 2),
                "battery_soc_percent": round(state["battery_soc_percent"], 1),
                "solar_voltage": round(state["solar_voltage"], 1),
                "solar_current_amps": round(state["solar_current_amps"], 2),
                "solar_power_watts": round(state["solar_power_watts"], 1),
                "load_current_amps": round(0.8 if state["compressor_on"] else 0.05, 2)
            }
        }

        return payload

    def generate_status_payload(self, module_id):
        """Generate MQTT status payload for a module"""
        state = self.module_states[module_id]

        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "module_id": module_id,
            "status": "active",
            "compressor_state": "on" if state["compressor_on"] else "off",
            "door_open": False,
            "error_codes": [0, 0, 0],
            "crop_type": state["crop_type"],
            "target_temperature_c": state["target_temperature_c"],
            "compressor_cycles": state["compressor_cycles"]
        }

        return payload

    def print_summary(self, module_id, sensor_payload, status_payload):
        """Print module summary (console output)"""
        temp = sensor_payload["sensor_data"]["temperature_c"]
        target = status_payload["target_temperature_c"]
        comp = status_payload["compressor_state"]
        soc = sensor_payload["power_data"]["battery_soc_percent"]
        solar = sensor_payload["power_data"]["solar_power_watts"]
        crop = status_payload["crop_type"]

        comp_icon = " compressor: [ON]" if comp == "on" else " compressor: OFF"
        print(f"[{module_id}] Temp: {temp}C (target: {target}C) | {comp_icon} | "
              f"Bat: {soc}% | Solar: {solar}W | Crop: {crop}")

    def run_standalone(self):
        """Run in standalone mode without MQTT"""
        print("Starting SolarFlex Simulator in STANDALONE mode")
        print(f"Modules: {MODULE_IDS}")
        print(f"Publish interval: {PUBLISH_INTERVAL} seconds")
        print("Running without MQTT broker - console output only")
        print("=" * 80)

        iteration = 0
        while True:
            # Advance simulation time (1 iteration = 1 minute)
            self.simulation_hour += 1/60  # Each update = 1 minute of sim time

            # Update and display for each module
            for module_id in MODULE_IDS:
                self.update_module_state(module_id)

                sensor_payload = self.generate_sensor_payload(module_id)
                status_payload = self.generate_status_payload(module_id)

                self.print_summary(module_id, sensor_payload, status_payload)

            print("-" * 80)
            iteration += 1
            time.sleep(PUBLISH_INTERVAL)

    def run(self):
        """Main simulation loop"""
        args = parse_args()
        self.standalone_mode = args.standalone

        if self.standalone_mode:
            self.run_standalone()
            return

        try:
            import paho.mqtt.client as mqtt

            print(f"Starting SolarFlex Simulator for modules: {MODULE_IDS}")
            print(f"Connecting to {MQTT_BROKER}:{MQTT_PORT}...")

            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=MQTT_CLIENT_ID)
            client.on_connect = self.on_connect
            client.on_disconnect = self.on_disconnect
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            client.loop_start()

            print("Connected! Starting simulation...")
            print("=" * 80)

            iteration = 0
            while True:
                # Advance simulation time (1 iteration = 1 minute)
                self.simulation_hour += 1/60  # Each update = 1 minute of sim time

                # Update and publish for each module
                for module_id in MODULE_IDS:
                    self.update_module_state(module_id)

                    # Publish sensor data
                    sensor_payload = self.generate_sensor_payload(module_id)
                    topic = f"solarflex/{module_id}/sensor"
                    client.publish(topic, json.dumps(sensor_payload), qos=1)

                    # Publish status
                    status_payload = self.generate_status_payload(module_id)
                    status_topic = f"solarflex/{module_id}/status"
                    client.publish(status_topic, json.dumps(status_payload), qos=1)

                    # Print summary
                    self.print_summary(module_id, sensor_payload, status_payload)

                print("-" * 80)
                iteration += 1
                time.sleep(PUBLISH_INTERVAL)

        except KeyboardInterrupt:
            print("\n\nStopping simulator...")
            print("Simulation stopped.")

    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")

    def on_disconnect(self, client, userdata, rc):
        print(f"Disconnected from MQTT broker (rc={rc})")


if __name__ == "__main__":
    simulator = FakeSensorSimulator()
    simulator.run()