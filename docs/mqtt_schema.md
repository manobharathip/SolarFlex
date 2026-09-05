# SolarFlex MQTT Topic Schema

## Topic Structure

All topics follow this pattern:
```
solarflex/<module_id>/<message_type>
```

## Message Types

### 1. Sensors (Module → Server)
Topic: `solarflex/{module_id}/sensor`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "module_id": "module_01",
  "sensor_data": {
    "temperature_c": 22.5,
    "humidity_percent": 65.3,
    "ambient_temperature_c": 28.0,
    "soil_moisture_percent": 45.0,
    "co2_ppm": 450
  },
  "power_data": {
    "battery_voltage": 12.4,
    "battery_soc_percent": 85,
    "solar_voltage": 18.2,
    "solar_current_amps": 2.1,
    "solar_power_watts": 38.2,
    "load_current_amps": 0.5
  }
}
```

### 2. Module Status (Module → Server)
Topic: `solarflex/{module_id}/status`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "module_id": "module_01",
  "status": "active|idle|error",
  "compressor_state": "on|off",
  "door_open": false,
  "error_codes": [0, 0, 0]
}
```

### 3. Control Command (Server → Module)
Topic: `solarflex/{module_id}/control`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "module_id": "module_01",
  "action": {
    "compressor_setpoint": {
      "target_temperature_c": 8.0,
      "hysteresis_c": 1.0
    },
    "fan_speed_percent": 75,
    "vent_open": false
  }
}
```

### 4. Energy Command (Server → Module)
Topic: `solarflex/energy/control`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "priority_list": [
    {
      "module_id": "module_01",
      "priority": 1,
      "target_temperature_c": 8.0
    },
    {
      "module_id": "module_02",
      "priority": 2,
      "target_temperature_c": 5.0
    }
  ],
  "energy_state": {
    "battery_soc_percent": 85,
    "solar_power_watts": 38.2,
    "mode": "adaptive|fixed"
  }
}
```

### 5. Crop Profile (Server → Module)
Topic: `solarflex/{module_id}/crop/config`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "module_id": "module_01",
  "crop_type": "tomato",
  "target_temperature_c": 8.0,
  "target_humidity_percent": 85,
  "optimal_storage_hours": 168
}
```

### 6. Analytics/Data (Server → Grafana)
Topic: `solarflex/analytics/{module_id}`

Payload (JSON):
```json
{
  "timestamp": "2026-09-04T05:00:00Z",
  "module_id": "module_01",
  "kwh_consumed": 1.25,
  "wh_per_kg": 25.0,
  "cooling_hours": 4.5,
  "compressor_cycles": 12
}
```

---

## Reserved Topics (Server Internal)

| Topic | Purpose |
|-------|---------|
| `solarflex/internal/health` | System health check |
| `solarflex/internal/scheduler` | Scheduler status updates |
| `solarflex/internal/energy_report` | Hourly energy summary |

---

## Quality of Service (QoS)

- Sensor data: **QoS 1** (at least once delivery)
- Control commands: **QoS 1** (at least once delivery)
- Analytics: **QoS 0** (at most once - can skip)
- Crop config: **QoS 1** (must reach module)

---

## Retain Flag

- Set `retain=true` for:
  - Crop configuration (module should know its crop on connect)
  - Last known status (new subscribers get instant state)
- Set `retain=false` for:
  - Timestamped sensor readings (don't overwrite)
  - Control commands (re-send on disconnect/reconnect)