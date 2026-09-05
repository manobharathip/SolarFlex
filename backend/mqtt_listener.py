"""
SolarFlex MQTT Listener
Subscribes to MQTT topics and forwards data to backend
"""

import json
import paho.mqtt.client as mqtt
import os
from dotenv import load_dotenv
from typing import Callable, Dict

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))

TOPIC_PATTERNS = [
    "solarflex/+/sensor",
    "solarflex/+/status",
    "solarflex/energy/control",
    "solarflex/analytics/#+"
]


class MQTTListener:
    def __init__(self, on_sensor_callback: Callable = None,
                 on_status_callback: Callable = None,
                 on_energy_callback: Callable = None):
        self.client = mqtt.Client(client_id="solarflex_mqtt_listener_01")
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

        self.sensor_callback = on_sensor_callback
        self.status_callback = on_status_callback
        self.energy_callback = on_energy_callback

        # Internal data buffer
        self.module_data = {}

    def on_connect(self, client, userdata, flags, rc):
        print(f"✓ MQTT Listener connected (rc={rc})")
        # Subscribe to all relevant topics
        for topic in TOPIC_PATTERNS:
            client.subscribe(topic, qos=1)
            print(f"  - Subscribed to: {topic}")

    def on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode('utf-8'))
            topic = msg.topic

            print(f"[MQTT] Received: {topic} - {len(str(payload))} bytes")

            # Route to appropriate handler
            if "/sensor" in topic or "/status" in topic:
                module_id = self._extract_module_id(topic)

                # Update internal state
                if module_id not in self.module_data:
                    self.module_data[module_id] = {}

                if "/sensor" in topic:
                    self.module_data[module_id]["sensor"] = payload
                    if self.sensor_callback:
                        self.sensor_callback(module_id, payload)
                elif "/status" in topic:
                    self.module_data[module_id]["status"] = payload
                    if self.status_callback:
                        self.status_callback(module_id, payload)

            elif "energy" in topic:
                if self.energy_callback:
                    self.energy_callback(payload)

            elif "analytics" in topic:
                # Store analytics data
                pass

        except json.JSONDecodeError:
            print(f"[MQTT] Error: Invalid JSON in message on topic {msg.topic}")
        except Exception as e:
            print(f"[MQTT] Error processing message: {e}")

    def _extract_module_id(self, topic: str) -> str:
        """Extract module ID from MQTT topic"""
        parts = topic.split('/')
        if len(parts) >= 2:
            return parts[1]
        return "unknown"

    def start(self):
        """Start MQTT listener"""
        print(f"Starting MQTT Listener connecting to {MQTT_BROKER}:{MQTT_PORT}...")
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_forever()
        except Exception as e:
            print(f"✗ Failed to start MQTT listener: {e}")
            raise

    def stop(self):
        """Stop MQTT listener"""
        self.client.loop_stop()
        self.client.disconnect()
        print("MQTT Listener stopped.")

    def get_module_state(self, module_id: str) -> Dict:
        """Get current state for a module"""
        return self.module_data.get(module_id, {})


if __name__ == "__main__":
    # Demo mode - just print incoming messages
    listener = MQTTListener()

    def on_sensor(module_id: str, payload: dict):
        temp = payload.get("sensor_data", {}).get("temperature_c", "N/A")
        print(f"  [Sensor] {module_id}: {temp}°C")

    def on_status(module_id: str, payload: dict):
        comp = payload.get("compressor_state", "unknown")
        print(f"  [Status] {module_id}: compressor={comp}")

    listener.sensor_callback = on_sensor
    listener.status_callback = on_status
    listener.start()