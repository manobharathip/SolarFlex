import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import {
  Search,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Thermometer,
  Droplet,
  Battery,
  Sun,
  DoorOpen,
  Wifi,
  Activity,
  Camera,
  MessageSquare,
  Filter,
  Clock
} from 'lucide-react';

// Alert configuration - defines all alert types, thresholds, and metadata
export const ALERT_CONFIG = {
  // Battery alerts
  battery_low: {
    id: 'battery_low',
    label: 'Low Battery SoC',
    icon: Battery,
    severity: 'critical',
    thresholds: { warning: 30, critical: 20 },
    description: 'Battery state of charge is critically low',
    recommendation: 'Switch to power-saving mode or connect external power'
  },
  battery_deep_discharge: {
    id: 'battery_deep_discharge',
    label: 'Deep Battery Discharge',
    icon: Battery,
    severity: 'critical',
    thresholds: { critical: 15 },
    description: 'Battery is undergoing deep discharge cycle',
    recommendation: 'Stop discharge immediately. Allow solar recharge.'
  },

  // Solar alerts
  solar_low_generation: {
    id: 'solar_low_generation',
    label: 'Low Solar Generation',
    icon: Sun,
    severity: 'warning',
    thresholds: { warning: 50 }, // Watts
    description: 'Solar panel output below expected levels',
    recommendation: 'Check panel orientation, shading, or dust accumulation'
  },
  solar_zero_output: {
    id: 'solar_zero_output',
    label: 'Zero Solar Output',
    icon: Sun,
    severity: 'critical',
    thresholds: { critical: 0 },
    description: 'No solar power generation detected during daylight',
    recommendation: 'Check panel connections, fuses, or MPPT controller'
  },
  solar_panel_high_temp: {
    id: 'solar_panel_high_temp',
    label: 'Solar Panel Overheating',
    icon: Sun,
    severity: 'warning',
    thresholds: { warning: 65, critical: 80 }, // Celsius
    description: 'Solar panel temperature exceeds safe operating range',
    recommendation: 'Ensure adequate ventilation around solar panel'
  },
  dust_on_panel: {
    id: 'dust_on_panel',
    label: 'Dust on Solar Panel',
    icon: Camera,
    severity: 'warning',
    source: 'camera',
    description: 'Camera detected dust accumulation on solar panel',
    recommendation: 'Clean solar panel surface to restore efficiency'
  },

  // Temperature alerts
  temperature_high: {
    id: 'temperature_high',
    label: 'Temperature Above Target',
    icon: Thermometer,
    severity: 'warning',
    thresholds: { warning: 2.0 }, // Celsius above target
    description: 'Module temperature exceeds target by significant margin',
    recommendation: 'Increase cooling allocation or check compressor'
  },
  temperature_critical: {
    id: 'temperature_critical',
    label: 'Critical Temperature',
    icon: Thermometer,
    severity: 'critical',
    thresholds: { critical: 5.0 }, // Celsius above target
    description: 'Module temperature at dangerous levels for stored produce',
    recommendation: 'Immediate cooling required. Check cooling system.'
  },

  // Humidity alerts
  humidity_high: {
    id: 'humidity_high',
    label: 'Humidity Above Target',
    icon: Droplet,
    severity: 'warning',
    thresholds: { warning: 90 },
    description: 'Humidity exceeds safe storage range',
    recommendation: 'Enable dehumidification or increase ventilation'
  },
  humidity_low: {
    id: 'humidity_low',
    label: 'Humidity Below Target',
    icon: Droplet,
    severity: 'warning',
    thresholds: { warning: 60 },
    description: 'Humidity below safe storage range',
    recommendation: 'Reduce ventilation or add moisture source'
  },

  // Door alerts
  door_open: {
    id: 'door_open',
    label: 'Door Open',
    icon: DoorOpen,
    severity: 'info',
    description: 'Module door is open',
    recommendation: 'Close door to maintain temperature'
  },
  door_prolonged_open: {
    id: 'door_prolonged_open',
    label: 'Door Open Prolonged',
    icon: DoorOpen,
    severity: 'warning',
    thresholds: { critical: 300 }, // seconds
    description: 'Door has been open for extended period',
    recommendation: 'Close door immediately to prevent temperature spike'
  },

  // Communication alerts
  communication_fault: {
    id: 'communication_fault',
    label: 'Communication Lost',
    icon: Wifi,
    severity: 'critical',
    description: 'Module not responding to commands',
    recommendation: 'Check MQTT connection and module power supply'
  },
  data_timeout: {
    id: 'data_timeout',
    label: 'Data Timeout',
    icon: Wifi,
    severity: 'warning',
    thresholds: { critical: 60 }, // seconds
    description: 'No data received from module for extended period',
    recommendation: 'Check module connectivity and sensor health'
  },

  // System alerts
  sensor_fault: {
    id: 'sensor_fault',
    label: 'Sensor Fault',
    icon: AlertCircle,
    severity: 'critical',
    description: 'One or more sensors reporting error values',
    recommendation: 'Inspect and replace faulty sensors'
  },
  cooling_fault: {
    id: 'cooling_fault',
    label: 'Cooling System Fault',
    icon: Activity,
    severity: 'critical',
    description: 'Cooling system not responding or operating incorrectly',
    recommendation: 'Check compressor, fans, and coolant levels'
  },
  system_health: {
    id: 'system_health',
    label: 'System Health Check Failed',
    icon: AlertTriangle,
    severity: 'warning',
    description: 'Internal system health check reported issues',
    recommendation: 'Review system logs for detailed error information'
  }
};

// Generate mock alerts with realistic timestamps and variations
const generateMockAlerts = () => {
  const now = new Date();
  const alerts = [];

  // Helper to create timestamp offset from now
  const offsetTime = (seconds) => {
    const d = new Date(now - seconds * 1000);
    return d.toTimeString().slice(0, 8);
  };

  // Battery alerts
  alerts.push({
    id: 1,
    timestamp: offsetTime(120),
    module: 'M1',
    type: 'battery_low',
    ...ALERT_CONFIG.battery_low,
    currentValue: '18%',
    severity: 'CRITICAL',
    message: 'Battery SoC at 18%',
    reason: 'Prolonged night-time operation with high cooling demand',
    acknowledged: false
  });

  alerts.push({
    id: 2,
    timestamp: offsetTime(900),
    module: 'M2',
    type: 'solar_low_generation',
    ...ALERT_CONFIG.solar_low_generation,
    currentValue: '42 W',
    severity: 'WARNING',
    message: 'Solar output below expected (42W)',
    reason: 'Early morning + partial cloud cover',
    acknowledged: true
  });

  // Dust detection (camera-based)
  alerts.push({
    id: 3,
    timestamp: offsetTime(1800),
    module: 'System',
    type: 'dust_on_panel',
    ...ALERT_CONFIG.dust_on_panel,
    currentValue: 'Detected',
    severity: 'WARNING',
    message: 'Dust accumulation detected on solar panel',
    reason: 'Camera ML model: 73% confidence dust class',
    acknowledged: false,
    imageUrl: '/api/camera/dust-detection/latest'
  });

  // Temperature alerts
  alerts.push({
    id: 4,
    timestamp: offsetTime(300),
    module: 'M1',
    type: 'temperature_high',
    ...ALERT_CONFIG.temperature_high,
    currentValue: '21.8°C (target: 18°C)',
    severity: 'WARNING',
    message: 'Temperature 3.8°C above target',
    reason: 'High ambient temperature + door opened 3 times',
    acknowledged: false
  });

  alerts.push({
    id: 5,
    timestamp: offsetTime(4500),
    module: 'M3',
    type: 'solar_panel_high_temp',
    ...ALERT_CONFIG.solar_panel_high_temp,
    currentValue: '68°C',
    severity: 'WARNING',
    message: 'Solar panel at 68°C',
    reason: 'Direct sunlight at peak hours with poor ventilation',
    acknowledged: true
  });

  // Humidity alerts
  alerts.push({
    id: 6,
    timestamp: offsetTime(600),
    module: 'M2',
    type: 'humidity_low',
    ...ALERT_CONFIG.humidity_low,
    currentValue: '58%',
    severity: 'WARNING',
    message: 'Humidity at 58% (target: 80-85%)',
    reason: 'Extended door open period earlier',
    acknowledged: false
  });

  alerts.push({
    id: 7,
    timestamp: offsetTime(7200),
    module: 'M1',
    type: 'door_open',
    ...ALERT_CONFIG.door_open,
    currentValue: 'Closed',
    severity: 'INFO',
    message: 'Door was opened',
    reason: 'Manual inspection at 08:15:00',
    acknowledged: true
  });

  // Communication alerts
  alerts.push({
    id: 8,
    timestamp: offsetTime(14400),
    module: 'M2',
    type: 'data_timeout',
    ...ALERT_CONFIG.data_timeout,
    currentValue: '0 readings',
    severity: 'WARNING',
    message: 'No data for 4 hours',
    reason: 'MQTT broker connection dropped',
    acknowledged: true
  });

  // Solar zero output
  alerts.push({
    id: 9,
    timestamp: offsetTime(28800),
    module: 'System',
    type: 'solar_zero_output',
    ...ALERT_CONFIG.solar_zero_output,
    currentValue: '0W',
    severity: 'CRITICAL',
    message: 'No solar generation after sunrise',
    reason: 'Panel disconnect during night maintenance',
    acknowledged: true
  });

  // System health
  alerts.push({
    id: 10,
    timestamp: offsetTime(3600),
    module: 'System',
    type: 'cooling_fault',
    ...ALERT_CONFIG.cooling_fault,
    currentValue: 'Compressor off',
    severity: 'CRITICAL',
    message: 'Compressor not responding to ON command',
    reason: 'Thermal overload protection triggered',
    acknowledged: false
  });

  alerts.push({
    id: 11,
    timestamp: offsetTime(43200),
    module: 'M3',
    type: 'door_prolonged_open',
    ...ALERT_CONFIG.door_prolonged_open,
    currentValue: '8 min 23 sec',
    severity: 'WARNING',
    message: 'Door open for 8+ minutes',
    reason: 'Loading operation in progress',
    acknowledged: true
  });

  alerts.push({
    id: 12,
    timestamp: offsetTime(60),
    module: 'System',
    type: 'sensor_fault',
    ...ALERT_CONFIG.sensor_fault,
    currentValue: 'Soil moisture: ERR',
    severity: 'CRITICAL',
    message: 'Soil moisture sensor reporting error',
    reason: 'Sensor reading out of range (open circuit)',
    acknowledged: false
  });

  // Add live alerts from store data
  alerts.push({
    id: 13,
    timestamp: offsetTime(45),
    module: 'System',
    type: 'info',
    icon: CheckCircle,
    severity: 'INFO',
    label: 'System Normal',
    message: 'All systems operating normally',
    reason: 'Routine status check passed',
    acknowledged: false
  });

  return alerts.sort((a, b) => {
    // Sort by severity first, then by time
    const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return 0;
  });
};

// Severity badge component
const SeverityBadge = ({ severity }) => {
  const styles = {
    CRITICAL: { bg: 'rgba(201, 92, 84, 0.12)', color: 'var(--danger)', border: '1px solid rgba(201, 92, 84, 0.3)' },
    WARNING: { bg: 'rgba(216, 149, 50, 0.12)', color: 'var(--warning)', border: '1px solid rgba(216, 149, 50, 0.3)' },
    INFO: { bg: 'rgba(76, 127, 163, 0.12)', color: 'var(--info)', border: '1px solid rgba(76, 127, 163, 0.3)' }
  };
  const style = styles[severity] || styles.INFO;

  return (
    <span style={{
      ...style,
      padding: '0.25rem 0.625rem',
      borderRadius: '4px',
      fontSize: '0.6875rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem'
    }}>
      {severity === 'CRITICAL' && <AlertCircle size={12} />}
      {severity === 'WARNING' && <AlertTriangle size={12} />}
      {severity === 'INFO' && <Info size={12} />}
      {severity}
    </span>
  );
};

// Alert card component
const AlertCard = ({ alert, onAcknowledge, onDismiss }) => {
  const Icon = alert.icon || Bell;
  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isCritical ? 'rgba(201, 92, 84, 0.3)' : isWarning ? 'rgba(216, 149, 50, 0.3)' : 'var(--border)'}`,
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      marginBottom: '0.75rem',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '1rem',
      alignItems: 'start',
      transition: 'all 0.15s ease',
      opacity: alert.acknowledged ? 0.6 : 1,
      borderLeft: `3px solid ${isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--info)'}`
    }}>
      {/* Icon */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '8px',
        background: isCritical ? 'rgba(201, 92, 84, 0.1)' : isWarning ? 'rgba(216, 149, 50, 0.1)' : 'rgba(76, 127, 163, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--info)'
      }}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{alert.label}</span>
          <SeverityBadge severity={alert.severity} />
          {alert.module !== 'System' && (
            <span style={{
              fontSize: '0.6875rem',
              padding: '0.125rem 0.5rem',
              background: 'var(--surface-secondary)',
              borderRadius: '4px',
              color: 'var(--text-secondary)'
            }}>
              {alert.module}
            </span>
          )}
          {alert.acknowledged && (
            <span style={{
              fontSize: '0.6875rem',
              padding: '0.125rem 0.5rem',
              background: 'rgba(85, 184, 154, 0.1)',
              borderRadius: '4px',
              color: 'var(--accent-mint)'
            }}>
              Acknowledged
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 0.375rem 0' }}>
          {alert.message}
          {alert.currentValue && (
            <span style={{ fontFamily: 'var(--font-mono)', marginLeft: '0.5rem', fontWeight: 500 }}>
              {alert.currentValue}
            </span>
          )}
        </p>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
          <strong>Reason:</strong> {alert.reason}
        </p>

        {alert.recommendation && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--accent-mint)',
            margin: '0.5rem 0 0 0',
            padding: '0.5rem',
            background: 'rgba(85, 184, 154, 0.06)',
            borderRadius: '4px',
            borderLeft: '2px solid var(--accent-mint)'
          }}>
            <strong>Recommendation:</strong> {alert.recommendation}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Clock size={14} />
          {alert.timestamp}
        </span>
        {!alert.acknowledged && (
          <>
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle size={14} />
              Acknowledge
            </button>
            <button
              onClick={() => onDismiss(alert.id)}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid transparent',
                borderRadius: '6px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <XCircle size={14} />
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Stats summary component
const AlertStats = ({ alerts }) => {
  const stats = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
    const warning = alerts.filter(a => a.severity === 'WARNING' && !a.acknowledged).length;
    const info = alerts.filter(a => a.severity === 'INFO' && !a.acknowledged).length;
    const total = alerts.length;
    const acknowledged = alerts.filter(a => a.acknowledged).length;
    return { critical, warning, info, total, acknowledged };
  }, [alerts]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {[
        { label: 'Critical', value: stats.critical, color: 'var(--danger)', icon: AlertCircle },
        { label: 'Warnings', value: stats.warning, color: 'var(--warning)', icon: AlertTriangle },
        { label: 'Info', value: stats.info, color: 'var(--info)', icon: Info },
        { label: 'Total', value: stats.total, color: 'var(--text-secondary)', icon: Bell }
      ].map(stat => (
        <div key={stat.label} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            background: `${stat.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: stat.color
          }}>
            <stat.icon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 650, fontFamily: 'var(--font-mono)', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Alert categories for filtering
const ALERT_CATEGORIES = [
  { id: 'all', label: 'All Alerts' },
  { id: 'battery', label: 'Battery', types: ['battery_low', 'battery_deep_discharge'] },
  { id: 'solar', label: 'Solar', types: ['solar_low_generation', 'solar_zero_output', 'solar_panel_high_temp', 'dust_on_panel'] },
  { id: 'temperature', label: 'Temperature', types: ['temperature_high', 'temperature_critical'] },
  { id: 'humidity', label: 'Humidity', types: ['humidity_high', 'humidity_low'] },
  { id: 'door', label: 'Door', types: ['door_open', 'door_prolonged_open'] },
  { id: 'communication', label: 'Communication', types: ['communication_fault', 'data_timeout'] },
  { id: 'system', label: 'System', types: ['sensor_fault', 'cooling_fault', 'system_health'] }
];

function Alerts() {
  const [alerts, setAlerts] = useState(generateMockAlerts);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Get unique modules
  const modules = useMemo(() => {
    const unique = Array.from(new Set(alerts.map(a => a.module)));
    return ['ALL', ...unique.sort()];
  }, [alerts]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Category filter
      if (categoryFilter !== 'all') {
        const category = ALERT_CATEGORIES.find(c => c.id === categoryFilter);
        if (category?.types && !category.types.includes(alert.type)) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter !== 'ALL' && alert.severity !== severityFilter) {
        return false;
      }

      // Module filter
      if (moduleFilter !== 'ALL' && alert.module !== moduleFilter) {
        return false;
      }

      // Show acknowledged toggle
      if (!showAcknowledged && alert.acknowledged) {
        return false;
      }

      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          alert.label?.toLowerCase().includes(searchLower) ||
          alert.message?.toLowerCase().includes(searchLower) ||
          alert.reason?.toLowerCase().includes(searchLower) ||
          alert.module?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [alerts, categoryFilter, severityFilter, moduleFilter, search, showAcknowledged]);

  const handleAcknowledge = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const handleDismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleClearAcknowledged = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.acknowledged));
  }, []);

  return (
    <div className="alerts-page">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Alerts & System Logs
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Monitor system health, warnings, and events across all modules
        </p>
      </div>

      {/* Stats Summary */}
      <AlertStats alerts={alerts} />

      {/* Filters */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {ALERT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: categoryFilter === cat.id ? 'var(--primary)' : 'var(--surface-secondary)',
                  color: categoryFilter === cat.id ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: categoryFilter === cat.id ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Dropdown filters */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="INFO">Info Only</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Modules</option>
            {modules.filter(m => m !== 'ALL').map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Show acknowledged toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show Acknowledged
          </label>

          {/* Clear acknowledged */}
          {alerts.some(a => a.acknowledged) && (
            <button
              onClick={handleClearAcknowledged}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--danger)',
                borderRadius: '6px',
                background: 'transparent',
                color: 'var(--danger)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Clear Acknowledged
            </button>
          )}

          {/* Search */}
          <div style={{
            flex: 1,
            minWidth: 220,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--surface)'
          }}>
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="alerts-list">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onDismiss={handleDismiss}
            />
          ))
        ) : (
          <div style={{
            padding: '3rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Bell size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
              No alerts match your current filters
            </p>
          </div>
        )}
      </div>

      {/* Alert Legend */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px'
      }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Alert Types Reference
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {Object.values(ALERT_CONFIG).map(config => {
            const Icon = config.icon;
            return (
              <div key={config.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.5rem',
                background: 'var(--surface-secondary)',
                borderRadius: '6px'
              }}>
                <Icon size={16} style={{ color: config.severity === 'critical' ? 'var(--danger)' : config.severity === 'warning' ? 'var(--warning)' : 'var(--info)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{config.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{config.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Alerts;
