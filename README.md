# SolarFlex

## Solar-Powered Smart Mini Cold Storage System for Fresh Vegetables in NER

**SIH Problem Statement 26005, MDoNER**

---

### Problem Statement

Farmers in the North Eastern Region lose produce (tomatoes, cabbage, beans, leafy greens, chilli) post-harvest due to:
- No cold storage access
- Unreliable power supply
- Remote terrain logistics

### Solution

Modular 50–500 kg cold storage system where multiple storage modules share one refrigeration unit. Software intelligently decides which modules need cooling based on:
- Demand (current temperature/humidity)
- Crop profile (specific storage requirements)
- Available solar/battery energy

This replaces the need for each farmer to buy a full-size unit or duplicate compressors per module.

---

### Architecture

```
solarflex/
├── firmware/esp32/     # Embedded code for ESP32
├── control/            # Cooling & energy algorithms
├── simulator/          # Fake sensor data generator
├── backend/            # FastAPI + MQTT listener
├── dashboard/          # React/Node-RED frontend
├── tests/              # Unit & integration tests
├── docs/               # Documentation
└── data/               # Database & logs
```

---

### Quick Start

```bash
# Clone and enter directory
cd "SIH project"

# Install Python dependencies
pip install -r requirements.txt

# Start MQTT broker (Docker)
docker compose up -d mosquitto

# Run simulator (generates fake sensor data)
python simulator/fake_sensor.py

# Start backend API
uvicorn backend.api:app --reload

# Access dashboard at http://localhost:3000 (Grafana)
```

---

### Team

1. **Embedded + Hardware** — ESP32 firmware, sensors, actuators
2. **Control + Energy** — Cooling priority algorithm, energy management (you)
3. **IoT + Web + Business** — MQTT backend, dashboard, billing

---

### Key Metrics

- Prove real energy savings with measured data (kWh/day, Wh/kg/day)
- Modular: shared refrigeration across independently controlled modules
- Solar-aware: cooling decisions factor in solar generation + battery SOC
- Crop-specific temperature/RH targets

---

### License

MIT License - SIH 2026