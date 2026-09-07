// ColdGrid Dashboard State Management
import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Alert thresholds from system design
export const ALERT_THRESHOLDS = {
  battery: {
    warning: 30,    // 30% SoC - warning
    critical: 20,  // 20% SoC - critical
    deepDischarge: 15 // 15% SoC - deep discharge
  },
  solar: {
    lowOutput: 50,      // 50W - low generation warning
    highTemp: 65,       // 65°C - panel overheating
    criticalTemp: 80   // 80°C - critical temp
  },
  temperature: {
    warning: 2.0,   // 2°C above target
    critical: 5.0   // 5°C above target
  },
  humidity: {
    low: 60,        // Below 60%
    high: 90        // Above 90%
  },
  door: {
    prolongedOpen: 300 // 5 minutes
  },
  communication: {
    timeout: 60     // 60 seconds
  }
};

// Mock real-time data for demonstration
const generateMockData = () => ({
  system: {
    status: 'RUNNING',
    online: true,
    lastSync: 'Updated 4 sec ago',
    modules: {
      total: 3,
      active: 3
    }
  },
  quickMetrics: {
    storedMass: '6.8 kg',
    avgTemperature: '18.7 °C',
    avgHumidity: '81 %'
  },
  energy: {
    solar: { value: '185 W', status: 'generating' },
    battery: { value: '76 %', status: 'healthy' },
    systemLoad: { value: '142 W' },
    cooling: { value: 'ACTIVE', status: 'active' }
  },
  modules: [
    {
      id: 'M1',
      produce: 'Tomato',
      temperature: '20.4',
      targetTemperature: '20.0',
      humidity: '82',
      weight: '2.4',
      door: 'Closed',
      cooling: 'Active',
      demand: 'High',
      priority: 1,
      status: 'normal'
    },
    {
      id: 'M2',
      produce: 'Bell Pepper',
      temperature: '18.2',
      targetTemperature: '18.0',
      humidity: '79',
      weight: '2.1',
      door: 'Closed',
      cooling: 'Active',
      demand: 'Medium',
      priority: 2,
      status: 'normal'
    },
    {
      id: 'M3',
      produce: 'Leafy Greens',
      temperature: '17.5',
      targetTemperature: '17.0',
      humidity: '85',
      weight: '2.3',
      door: 'Closed',
      cooling: 'Maintain',
      demand: 'Low',
      priority: 3,
      status: 'normal'
    }
  ],
  adaptiveControl: {
    mode: 'AUTOMATIC',
    decisions: [
      { module: 'M1', demand: 'HIGH', priority: 1, cooling: 'ACTIVE', reason: 'Temperature deviation detected' },
      { module: 'M2', demand: 'MEDIUM', priority: 2, cooling: 'ACTIVE', reason: 'Moderate deviation from target' },
      { module: 'M3', demand: 'LOW', priority: 3, cooling: 'MAINTAIN', reason: 'Within acceptable range' }
    ]
  },
  energyDetails: {
    solar: { voltage: '28.4 V', current: '6.5 A', power: '185 W', dailyEnergy: '1.42 kWh', status: 'GENERATING' },
    battery: { soc: '76 %', voltage: '25.1 V', status: 'DISCHARGING', health: 'GOOD' },
    consumption: { cooling: '128 W', fans: '9 W', electronics: '5 W', total: '142 W' }
  },
  // Additional sensor data for the alert engine
  solarPanelTemp: 42,          // °C - panel surface temperature (thermal sensor)
  cameraDustDetected: false,   // Camera ML detection flag
  communicationOk: true,       // MQTT link health
  temperatureHistory: [
    { time: '08:00', M1: 21.2, M2: 19.1, M3: 18.3, target: 18.0 },
    { time: '09:00', M1: 20.8, M2: 18.8, M3: 18.0, target: 18.0 },
    { time: '10:00', M1: 20.5, M2: 18.5, M3: 17.8, target: 18.0 },
    { time: '11:00', M1: 20.4, M2: 18.3, M3: 17.6, target: 18.0 },
    { time: '12:00', M1: 20.4, M2: 18.2, M3: 17.5, target: 18.0 }
  ],
  energyHistory: [
    { time: '08:00', solar: 45, consumption: 142 },
    { time: '09:00', solar: 120, consumption: 138 },
    { time: '10:00', solar: 165, consumption: 145 },
    { time: '11:00', solar: 185, consumption: 142 },
    { time: '12:00', solar: 178, consumption: 140 }
  ]
});

// Transform API data to dashboard format
const transformApiModule = (apiModule, index) => {
  const cropNames = {
    'tomato': 'Tomato',
    'cabbage': 'Cabbage',
    'beans': 'Beans',
    'leafy_greens': 'Leafy Greens',
    'chilli': 'Chilli'
  };

  return {
    id: apiModule.module_id?.replace('module_', 'M') || `M${index + 1}`,
    produce: cropNames[apiModule.crop_type] || apiModule.crop_type || 'Unknown',
    temperature: apiModule.temperature_c?.toFixed(1) || '0',
    targetTemperature: apiModule.target_temperature_c?.toFixed(1) || '0',
    humidity: apiModule.humidity_percent?.toFixed(0) || '0',
    weight: '2.4', // Not in API response, would need weight sensor
    door: 'Closed', // Not in API response, would need door sensor
    cooling: apiModule.compressor_state === 'on' ? 'Active' : 'Off',
    demand: 'Medium',
    priority: index + 1,
    status: 'normal'
  };
};

export const useStore = create((set, get) => ({
  theme: 'light',
  activePage: 'overview',
  data: generateMockData(),
  alerts: [],                       // computed from data by recomputeAlerts
  ackMap: {},                       // { [alertId]: true } - survive refreshes
  dismissMap: {},                   // { [alertId]: true }
  loading: false,
  error: null,
  usingApi: false,

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  setActivePage: (page) => set({ activePage: page }),

  // Recompute alerts from current data, preserving acknowledge/dismiss state
  recomputeAlerts: () => {
    const { data, ackMap, dismissMap } = get();
    const raw = generateAlertsFromData(data);
    const alerts = raw
      .filter(a => !dismissMap[a.id] && (aLive(a, data)))
      .map(a => ({ ...a, acknowledged: !!ackMap[a.id] }));
    set({ alerts });
  },

  // Acknowledge an alert (visible, marked acknowledged)
  acknowledgeAlert: (id) => {
    const ackMap = { ...get().ackMap, [id]: true };
    set({ ackMap, alerts: get().alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) });
  },

  // Dismiss an alert entirely (hidden until condition recurs)
  dismissAlert: (id) => {
    set({
      dismissMap: { ...get().dismissMap, [id]: true },
      alerts: get().alerts.filter(a => a.id !== id)
    });
  },

  // Clear all acknowledged alerts
  clearAcknowledged: () => {
    set({ alerts: get().alerts.filter(a => !a.acknowledged) });
  },

  // Fetch data from API
  fetchFromApi: async () => {
    set({ loading: true, error: null });

    try {
      const [modulesRes, energyRes] = await Promise.all([
        fetch(`${API_BASE}/modules`).catch(() => null),
        fetch(`${API_BASE}/energy/summary`).catch(() => null)
      ]);

      if (modulesRes?.ok && energyRes?.ok) {
        const modulesData = await modulesRes.json();
        const energyData = await energyRes.json();

        const modules = (modulesData.modules || []).map(transformApiModule);

        set({
          data: {
            ...get().data,
            modules,
            quickMetrics: {
              storedMass: `${(modules.length * 2.3).toFixed(1)} kg`,
              avgTemperature: modules.length > 0
                ? `${(modules.reduce((sum, m) => sum + parseFloat(m.temperature), 0) / modules.length).toFixed(1)} °C`
                : '0 °C',
              avgHumidity: modules.length > 0
                ? `${(modules.reduce((sum, m) => sum + parseFloat(m.humidity), 0) / modules.length).toFixed(0)} %`
                : '0 %'
            },
            energy: {
              solar: { value: `${energyData.total_solar_power_watts.toFixed(0)} W`, status: energyData.total_solar_power_watts > 0 ? 'generating' : 'idle' },
              battery: { value: `${energyData.average_soc_percent.toFixed(0)} %`, status: energyData.average_soc_percent > 50 ? 'healthy' : 'low' },
              systemLoad: { value: '142 W' },
              cooling: { value: 'ACTIVE', status: 'active' }
            },
            energyDetails: {
              solar: { voltage: '28.4 V', current: '6.5 A', power: `${energyData.total_solar_power_watts.toFixed(0)} W`, dailyEnergy: '1.42 kWh', status: energyData.total_solar_power_watts > 0 ? 'GENERATING' : 'IDLE' },
              battery: { soc: `${energyData.average_soc_percent.toFixed(0)} %`, voltage: '25.1 V', status: 'DISCHARGING', health: energyData.average_soc_percent > 50 ? 'GOOD' : 'LOW' },
              consumption: { cooling: '128 W', fans: '9 W', electronics: '5 W', total: '142 W' }
            }
          },
          usingApi: true,
          loading: false
        });
      } else {
        // API not available, use mock data
        set({ usingApi: false, loading: false });
      }
    } catch (err) {
      console.warn('API fetch failed, using mock data:', err.message);
      set({ error: null, usingApi: false, loading: false });
    }
  },

  // Simulate real-time updates
  refreshData: () => set((state) => {
    const newData = generateMockData();
    // Add small random variations
    newData.modules = state.data.modules.map(m => ({
      ...m,
      temperature: (parseFloat(m.temperature) + (Math.random() - 0.5) * 0.2).toFixed(1)
    }));
    newData.quickMetrics = {
      storedMass: state.data.quickMetrics.storedMass,
      avgTemperature: (18.5 + Math.random() * 0.5).toFixed(1) + ' °C',
      avgHumidity: (80 + Math.random() * 2).toFixed(0) + ' %'
    };
    return { data: newData };
  })
}));

// Initialize API connection on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useStore.getState().fetchFromApi();
  }, 1000);
}

// ============= ALERT ENGINE =============
// Evaluates live sensor data against thresholds and produces alerts.
// Alert IDs are stable (type + module) so acknowledge/dismiss state
// survives data refreshes.

const alertMeta = {
  battery_low: {
    label: 'Low Battery SoC',
    severity: 'WARNING',
    description: 'Battery state of charge below safe threshold',
    recommendation: 'Reduce cooling load or connect external power'
  },
  battery_critical: {
    label: 'Battery Critical',
    severity: 'CRITICAL',
    description: 'Battery at minimum reserve needed to protect cells',
    recommendation: 'Stop non-essential loads immediately'
  },
  dust_on_panel: {
    label: 'Dust on Solar Panel',
    severity: 'WARNING',
    source: 'camera',
    description: 'Camera detected dust accumulation reducing output',
    recommendation: 'Schedule panel cleaning to restore efficiency'
  },
  solar_panel_high_temp: {
    label: 'Solar Panel Overheating',
    severity: 'WARNING',
    description: 'Panel temperature above safe operating range',
    recommendation: 'Improve ventilation or reduce output draw'
  },
  solar_low_generation: {
    label: 'Low Solar Generation',
    severity: 'WARNING',
    description: 'Solar output below expected level',
    recommendation: 'Check for dust, shading, or panel fault'
  },
  solar_zero_output: {
    label: 'Zero Solar Output',
    severity: 'CRITICAL',
    description: 'No generation detected during daylight hours',
    recommendation: 'Check panel connections and MPPT controller'
  },
  temperature_high: {
    label: 'Temperature Above Target',
    severity: 'WARNING',
    description: 'Module temperature exceeds target by significant margin',
    recommendation: 'Increase cooling allocation'
  },
  temperature_critical: {
    label: 'Critical Temperature',
    severity: 'CRITICAL',
    description: 'Module temperature dangerous for stored produce',
    recommendation: 'Immediate cooling required'
  },
  humidity_high: {
    label: 'Humidity Above Target',
    severity: 'WARNING',
    description: 'Humidity exceeds safe storage range',
    recommendation: 'Enable dehumidification'
  },
  humidity_low: {
    label: 'Humidity Below Target',
    severity: 'WARNING',
    description: 'Humidity below safe storage range',
    recommendation: 'Reduce ventilation'
  },
  door_open: {
    label: 'Door Open',
    severity: 'INFO',
    description: 'Module door is open',
    recommendation: 'Close door to maintain temperature'
  },
  door_prolonged_open: {
    label: 'Door Open Prolonged',
    severity: 'WARNING',
    description: 'Door open for extended period',
    recommendation: 'Close door immediately'
  },
  communication_fault: {
    label: 'Communication Lost',
    severity: 'CRITICAL',
    description: 'Module not responding over MQTT',
    recommendation: 'Check module power and network link'
  }
};

export const generateAlertsFromData = (data) => {
  const alerts = [];
  const now = new Date();
  const timestamp = now.toTimeString().slice(0, 8);
  const date = now.toISOString().slice(0, 10);

  const createAlert = (type, module, message, reason, currentValue = null) => {
    const meta = alertMeta[type] || { label: type, severity: 'INFO', description: '', recommendation: '' };
    return {
      id: `${type}__${module}`,           // stable across refresh
      timestamp,
      date,
      module,
      type,
      label: meta.label,
      description: meta.description,
      recommendation: meta.recommendation,
      source: meta.source,
      message,
      reason,
      currentValue,
      severity: meta.severity,
      acknowledged: false
    };
  };

  // Per-module checks
  (data.modules || []).forEach(module => {
    const tempDiff = parseFloat(module.temperature) - parseFloat(module.targetTemperature);
    const humidity = parseFloat(module.humidity);

    // --- Battery SoC ---
    const moduleSoc = parseFloat(module.batterySoc ?? data.energy?.battery?.value ?? 75);
    if (moduleSoc <= ALERT_THRESHOLDS.battery.critical) {
      alerts.push(createAlert(
        'battery_low', module.id,
        `Battery SoC ${moduleSoc}%`,
        `Battery below critical threshold of ${ALERT_THRESHOLDS.battery.critical}%. Cooling may stop.`,
        `${moduleSoc.toFixed(0)}%`
      ));
    } else if (moduleSoc <= ALERT_THRESHOLDS.battery.warning) {
      alerts.push(createAlert(
        'battery_low', module.id,
        `Battery SoC ${moduleSoc}%`,
        `Battery below warning threshold of ${ALERT_THRESHOLDS.battery.warning}%. Conserve energy.`,
        `${moduleSoc.toFixed(0)}%`
      ));
    }

    // --- Temperature deviation ---
    if (tempDiff >= ALERT_THRESHOLDS.temperature.critical) {
      alerts.push(createAlert(
        'temperature_critical', module.id,
        `Cabin temp ${module.temperature}°C vs target ${module.targetTemperature}°C`,
        `Deviation +${tempDiff.toFixed(1)}°C exceeds critical limit of ${ALERT_THRESHOLDS.temperature.critical}°C.`,
        `+${tempDiff.toFixed(1)}°C`
      ));
    } else if (tempDiff >= ALERT_THRESHOLDS.temperature.warning) {
      alerts.push(createAlert(
        'temperature_high', module.id,
        `Cabin temp ${module.temperature}°C vs target ${module.targetTemperature}°C`,
        `Deviation +${tempDiff.toFixed(1)}°C exceeds warning limit of ${ALERT_THRESHOLDS.temperature.warning}°C.`,
        `+${tempDiff.toFixed(1)}°C`
      ));
    }

    // --- Humidity ---
    if (humidity >= ALERT_THRESHOLDS.humidity.high) {
      alerts.push(createAlert(
        'humidity_high', module.id,
        `Humidity ${humidity}%`,
        `At or above ceiling of ${ALERT_THRESHOLDS.humidity.high}%.`,
        `${humidity}%`
      ));
    } else if (humidity <= ALERT_THRESHOLDS.humidity.low) {
      alerts.push(createAlert(
        'humidity_low', module.id,
        `Humidity ${humidity}%`,
        `At or below floor of ${ALERT_THRESHOLDS.humidity.low}%.`,
        `${humidity}%`
      ));
    }

    // --- Door status ---
    if (module.door === 'Open') {
      alerts.push(createAlert(
        'door_open', module.id,
        'Door open',
        'Door sensor reports open. Temperature risk if prolonged.',
        'Open'
      ));
    }
  });

  // --- System-level solar checks ---
  const solarPower = parseFloat(data.energy?.solar?.value) || 0;
  const panelTemp = data.solarPanelTemp;

  if (solarPower === 0 && isDaytime()) {
    alerts.push(createAlert(
      'solar_zero_output', 'System',
      'Solar output 0W',
      'No generation expected during daylight. Possible disconnect, shading or controller fault.',
      '0 W'
    ));
  } else if (solarPower > 0 && solarPower < ALERT_THRESHOLDS.solar.lowOutput && isDaytime()) {
    alerts.push(createAlert(
      'solar_low_generation', 'System',
      `Solar output ${solarPower.toFixed(0)}W`,
      `Below ${ALERT_THRESHOLDS.solar.lowOutput}W during daylight. Possible dust or partial shading.`,
      `${solarPower.toFixed(0)} W`
    ));
  }

  // --- Panel high temperature (thermal sensor) ---
  if (panelTemp && panelTemp >= ALERT_THRESHOLDS.solar.highTemp) {
    const sev = panelTemp >= ALERT_THRESHOLDS.solar.criticalTemp ? 'CRITICAL' : 'WARNING';
    alerts.push(createAlert(
      'solar_panel_high_temp', 'System',
      `Panel temp ${panelTemp}°C`,
      `Above operating ceiling of ${ALERT_THRESHOLDS.solar.highTemp}°C${sev === 'CRITICAL' ? ' (critical thermal risk)' : ''}.`,
      `${panelTemp}°C`
    ));
  }

  // --- Camera dust detection ---
  if (data.cameraDustDetected) {
    alerts.push(createAlert(
      'dust_on_panel', 'System',
      'Dust detected on panel',
      'Camera ML model flagged dust accumulation, explaining reduced output.',
      'Detected'
    ));
  }

  // --- Communication health ---
  if (data.communicationOk === false) {
    alerts.push(createAlert(
      'communication_fault', 'System',
      'MQTT link down',
      'No heartbeats received from modules. Data may be stale.',
      'Offline'
    ));
  }

  // Sort by severity then label
  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  return alerts.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    return s !== 0 ? s : a.label.localeCompare(b.label);
  });
};

// Check if it's daytime (6 AM - 6 PM)
const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour <= 18;
};

// A computed alert points at the data path that produced it. Returns true if the
// underlying condition still holds, so alerts clear automatically when data recovers.
const aLive = (alert, data) => {
  if (alert.module === 'System') {
    switch (alert.type) {
      case 'solar_zero_output':
      case 'solar_low_generation': {
        const p = parseFloat(data.energy?.solar?.value) || 0;
        return isDaytime() && p === 0;
      }
      case 'solar_panel_high_temp':
        return data.solarPanelTemp >= ALERT_THRESHOLDS.solar.highTemp;
      case 'dust_on_panel':
        return !!data.cameraDustDetected;
      case 'communication_fault':
        return data.communicationOk === false;
      default:
        return true;
    }
  }

  const mod = data.modules?.find(m => m.id === alert.module);
  if (!mod) return false;
  const tempDiff = parseFloat(mod.temperature) - parseFloat(mod.targetTemperature);
  const humidity = parseFloat(mod.humidity);
  const soc = parseFloat(mod.batterySoc ?? data.energy?.battery?.value ?? 75);

  switch (alert.type) {
    case 'battery_low':
      return soc <= ALERT_THRESHOLDS.battery.warning;
    case 'temperature_critical':
      return tempDiff >= ALERT_THRESHOLDS.temperature.critical;
    case 'temperature_high':
      return tempDiff >= ALERT_THRESHOLDS.temperature.warning;
    case 'humidity_high':
      return humidity >= ALERT_THRESHOLDS.humidity.high;
    case 'humidity_low':
      return humidity <= ALERT_THRESHOLDS.humidity.low;
    case 'door_open':
      return mod.door === 'Open';
    default:
      return true;
  }
};
