// ColdGrid Dashboard State Management
import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  alerts: [
    { id: 1, timestamp: '09:42:18', module: 'M1', event: 'Cooling priority increased', reason: 'Temperature deviation detected', severity: 'INFO' },
    { id: 2, timestamp: '09:38:45', module: 'System', event: 'Solar generation optimal', reason: 'Clear sky conditions', severity: 'INFO' },
    { id: 3, timestamp: '09:15:22', module: 'M2', event: 'Humidity slightly below target', reason: 'Door opened briefly', severity: 'WARNING' },
    { id: 4, timestamp: '08:55:10', module: 'System', event: 'Battery discharge cycle', reason: 'Nighttime operation', severity: 'INFO' }
  ],
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
  loading: false,
  error: null,
  usingApi: false,

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  setActivePage: (page) => set({ activePage: page }),

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
