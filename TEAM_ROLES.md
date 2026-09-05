# SolarFlex Coding Team - Role Definitions

**Project:** SolarFlex - Solar-Powered Smart Mini Cold Storage System (SIH 26005)  
**Team Size:** 3 Developers  
**Date:** September 4, 2026

---

## 👥 Team Roles & Responsibilities

### **Role 1: Embedded Systems Engineer (Hardware Lead)**
**Person:** [Name of Person 1]  
**Primary Focus:** ESP32 firmware, sensors, actuators, hardware communication

#### Responsibilities:
- **ESP32 Firmware Development**
  - Write C/C++ code for ESP32 microcontroller
  - Implement sensor reading (DHT22, INA219, etc.)
  - Implement actuator control (compressor relay, fan, vent)
  - Safety limits and error handling

- **MQTT Communication**
  - Publish sensor data to MQTT broker
  - Subscribe to control commands
  - Handle connection/reconnection logic
  - Implement QoS levels

- **Hardware Integration**
  - Test with actual hardware components
  - Debug sensor calibration
  - Optimize power consumption
  - Handle safety shutdowns

#### Deliverables:
- [ ] ESP32 firmware (main.cpp)
- [ ] Sensor driver code (DHT22, INA219)
- [ ] Actuator control code (relay, PWM)
- [ ] MQTT client implementation
- [ ] Hardware test report

#### Skills Required:
- C/C++ programming
- Embedded systems
- Arduino/PlatformIO
- Electronics
- MQTT protocol

#### Dependencies:
- MQTT schema (from Control Engineer)
- Control commands format (from Control Engineer)
- Crop profiles (from Control Engineer)

---

### **Role 2: Control & Energy Systems Engineer (Algorithm Lead)**
**Person:** [Your Name - Mano]  
**Primary Focus:** Cooling algorithms, energy management, priority scheduling

#### Responsibilities:
- **Control Algorithm Development**
  - Implement cooling engine (priority calculation)
  - Implement energy manager (solar/battery logic)
  - Develop scheduling algorithm
  - Test algorithms with simulator

- **MQTT Schema Design**
  - Define message formats for all communication
  - Document topic structure
  - Specify QoS levels and retention flags
  - Ensure compatibility with all teams

- **Crop Profile Management**
  - Maintain crop_profiles.json
  - Validate temperature/humidity targets
  - Add new crops as needed
  - Document special handling for each crop

- **Simulator Development**
  - Create fake_sensor.py for testing
  - Generate realistic test scenarios
  - Run energy savings comparisons
  - Create test data

- **Unit Tests**
  - Write tests for cooling engine
  - Write tests for energy manager
  - Test edge cases
  - Verify algorithm correctness

#### Deliverables:
- [ ] MQTT schema (mqtt_schema.md)
- [ ] Crop profiles (crop_profiles.json)
- [ ] Cooling engine (cooling_engine.py)
- [ ] Energy manager (energy_manager.py)
- [ ] Simulator (fake_sensor.py)
- [ ] Unit tests (test_cooling.py, test_energy.py)
- [ ] Fixed vs adaptive comparison report
- [ ] Energy savings analysis

#### Skills Required:
- Python programming
- Algorithm design
- Energy management concepts
- Data analysis
- Testing & debugging

#### Dependencies:
- MQTT broker (from IoT Engineer)
- Database schema (from IoT Engineer)
- API format (from IoT Engineer)

---

### **Role 3: IoT & Backend Engineer (Integration Lead)**
**Person:** [Name of Person 3]  
**Primary Focus:** MQTT broker, backend API, database, dashboard

#### Responsibilities:
- **MQTT Infrastructure**
  - Set up Mosquitto broker
  - Configure MQTT access control
  - Monitor message flow
  - Handle broker scaling

- **Backend API Development**
  - Implement FastAPI endpoints
  - Connect MQTT listener to API
  - Handle real-time data updates
  - Implement error handling

- **Database Integration**
  - Design database schema
  - Implement PostgreSQL/SQLite models
  - Store historical data
  - Query analytics

- **MQTT Listener**
  - Subscribe to all sensor topics
  - Route messages to appropriate handlers
  - Store data in database
  - Handle disconnections

- **Dashboard Development**
  - Create React or Node-RED frontend
  - Display real-time module status
  - Show energy analytics
  - Create alerts/notifications

- **Docker & Deployment**
  - Configure docker-compose.yml
  - Set up Grafana
  - Enable local testing
  - Document deployment

#### Deliverables:
- [ ] MQTT broker setup (Mosquitto)
- [ ] MQTT listener (mqtt_listener.py)
- [ ] FastAPI backend (api.py)
- [ ] Database models (models.py)
- [ ] Dashboard (React/Node-RED)
- [ ] Grafana configuration
- [ ] Docker compose setup
- [ ] API documentation

#### Skills Required:
- Python (FastAPI)
- MQTT protocol
- PostgreSQL/SQLite
- React or Node-RED
- Docker
- API design
- Database design

#### Dependencies:
- MQTT schema (from Control Engineer)
- Crop profiles (from Control Engineer)
- Algorithm outputs (from Control Engineer)

---

## 📊 Collaboration Matrix

| Task | Embedded | Control | IoT/Backend |
|------|----------|---------|-------------|
| MQTT Schema | ✅ Input | 🔴 **Lead** | ✅ Input |
| Crop Profiles | ✅ Use | 🔴 **Lead** | ✅ Use |
| Sensor Reading | 🔴 **Lead** | - | - |
| Control Commands | ✅ Input | 🔴 **Lead** | ✅ Input |
| Energy Logic | ✅ Input | 🔴 **Lead** | ✅ Input |
| MQTT Broker | ✅ Input | - | 🔴 **Lead** |
| API Endpoints | - | ✅ Input | 🔴 **Lead** |
| Database | ✅ Input | ✅ Input | 🔴 **Lead** |
| Dashboard | ✅ View | ✅ View | 🔴 **Lead** |
| Testing | ✅ Do | 🔴 **Lead** | ✅ Do |

Legend: 🔴 = Primary Responsibility | ✅ = Contributing Role | - = Not involved

---

## 🔄 Communication Protocol

### Daily Standup (5-10 min)
- **What did I complete?**
- **What am I working on?**
- **Are there blockers?**

### Weekly Sync (30 min)
- Review progress on deliverables
- Resolve integration issues
- Plan next week's tasks
- Update timeline

### Integration Points
1. **MQTT Schema** (Control ↔ Embedded, Control ↔ IoT)
2. **Crop Profiles** (Control ↔ Embedded, Control ↔ IoT)
3. **API Format** (Control ↔ IoT)
4. **Database Schema** (Control ↔ IoT)
5. **Testing Data** (Control ↔ IoT, Control ↔ Embedded)

---

## 📅 Development Timeline

### Week 1 (Current)
- **Embedded:** Set up Arduino IDE, ESP32 boilerplate
- **Control:** Finalize MQTT schema, crop profiles, simulator
- **IoT:** Set up MQTT broker, create API skeleton

### Week 2
- **Embedded:** Sensor reading, MQTT publishing
- **Control:** Finish cooling engine, energy manager, unit tests
- **IoT:** Database integration, MQTT listener, API endpoints

### Week 3
- **Embedded:** Actuator control, testing, debugging
- **Control:** Fixed vs adaptive comparison, final algorithms
- **IoT:** Dashboard development, Grafana setup

### Week 4 (Integration)
- **All:** Full system integration testing
- **All:** Bug fixes and optimization
- **All:** Documentation and demo preparation

---

## 🎯 Success Criteria

### Embedded Systems Engineer
- ✅ ESP32 reads all sensors accurately
- ✅ MQTT messages publish every 5 seconds
- ✅ Responds to control commands within 1 second
- ✅ All safety limits enforced

### Control & Energy Engineer
- ✅ Priority algorithm works correctly
- ✅ Energy manager prevents over-discharge
- ✅ Unit tests pass 100%
- ✅ Fixed vs adaptive shows 30-50% energy savings

### IoT & Backend Engineer
- ✅ API returns real-time data
- ✅ Dashboard updates live
- ✅ Historical data stored in database
- ✅ All endpoints documented (Swagger)

### All Team Members
- ✅ Code follows project standards
- ✅ All documentation complete
- ✅ System passes integration tests
- ✅ Demo runs without errors

---

## 📁 Code Ownership

```
E:\Programming\SIH project\
│
├── firmware/esp32/          ← Embedded Systems Engineer
│   ├── main.cpp
│   ├── sensors/
│   ├── actuators/
│   ├── mqtt/
│   └── safety/
│
├── control/                 ← Control & Energy Engineer
│   ├── cooling_engine.py
│   ├── energy_manager.py
│   ├── scheduler.py
│   └── crop_profiles.json
│
├── simulator/               ← Control & Energy Engineer
│   └── fake_sensor.py
│
├── backend/                 ← IoT & Backend Engineer
│   ├── mqtt_listener.py
│   ├── api.py
│   ├── database.py
│   └── models.py
│
├── dashboard/               ← IoT & Backend Engineer
│   └── (React/Node-RED)
│
├── tests/                   ← Control & Energy Engineer (primary)
│   ├── test_cooling.py
│   ├── test_energy.py
│   └── test_integration.py
│
└── docs/                    ← All (collaborative)
    ├── mqtt_schema.md
    ├── architecture.md
    └── deployment.md
```

---

## 🚀 Getting Started

### All Team Members
1. Clone repository
2. Read PROJECT_EXPLANATION.md
3. Review MQTT schema
4. Join team communication (Slack/Discord/Email)

### Embedded Systems Engineer
1. Set up Arduino IDE / PlatformIO
2. Test ESP32 board connectivity
3. Start with sensor reading examples

### Control & Energy Engineer
1. Install Python dependencies: `pip install -r requirements.txt`
2. Verify simulator runs: `python simulator/fake_sensor.py --standalone`
3. Study crop_profiles.json and MQTT schema

### IoT & Backend Engineer
1. Install Docker
2. Set up Python environment
3. Test FastAPI: `uvicorn backend.api:app --reload`

---

## 📞 Contact & Escalation

**Project Lead/Mentor:** [Mentor Name]  
**Embedded Lead:** [Person 1]  
**Control Lead (You):** [Your Name]  
**Backend Lead:** [Person 3]  

**Escalation Path:**
- Technical blocker → Team Lead
- Integration issue → Project Lead
- Timeline concern → Mentor

---

**Document Version:** 1.0  
**Last Updated:** September 4, 2026  
**Status:** Active