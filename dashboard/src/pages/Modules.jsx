import React, { useState } from 'react';
import { useStore } from '../store';
import { Thermometer, Droplet, Scale, DoorOpen, Activity, Clock } from 'lucide-react';

function Modules() {
  const { data } = useStore();
  const [selectedModule, setSelectedModule] = useState('M1');

  const currentModule = data.modules.find(m => m.id === selectedModule) || data.modules[0];

  return (
    <div className="modules-page">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)' }}>
          Storage Modules
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Individual condition and loading information
        </p>
      </div>

      <div className="module-selector">
        {data.modules.map(module => (
          <button
            key={module.id}
            className={`module-tab ${selectedModule === module.id ? 'active' : ''}`}
            onClick={() => setSelectedModule(module.id)}
          >
            {module.id}
          </button>
        ))}
      </div>

      {/* Module Details Grid */}
      <div className="module-detail-grid">
        <div className="detail-card">
          <div className="card-header">
            <Thermometer size={18} />
            <span className="card-title">Temperature</span>
          </div>
          <div className="main-value" style={{ color: 'var(--text-primary)' }}>
            {currentModule.temperature}°C
          </div>
          <div className="sub-value">Target: {currentModule.targetTemperature}°C</div>
          <div className="target-range">
            Difference: {parseFloat(currentModule.temperature) - parseFloat(currentModule.targetTemperature) > 0 ? '+' : ''}{(parseFloat(currentModule.temperature) - parseFloat(currentModule.targetTemperature)).toFixed(1)}°C
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <Droplet size={18} />
            <span className="card-title">Humidity</span>
          </div>
          <div className="main-value" style={{ color: 'var(--text-primary)' }}>
            {currentModule.humidity}%
          </div>
          <div className="sub-value">Target: 80–85%</div>
          <div className="target-range">
            Within optimal range
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <Scale size={18} />
            <span className="card-title">Weight</span>
          </div>
          <div className="main-value" style={{ color: 'var(--text-primary)' }}>
            {currentModule.weight} kg
          </div>
          <div className="sub-value">Capacity: 2.5 kg</div>
          <div className="target-range">
            Utilization: 96%
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <DoorOpen size={18} />
            <span className="card-title">Door Status</span>
          </div>
          <div className="main-value" style={{ color: 'var(--success)' }}>
            {currentModule.door}
          </div>
          <div className="sub-value">Last opened: 2 hours ago</div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <Activity size={18} />
            <span className="card-title">Cooling State</span>
          </div>
          <div className="main-value" style={{ color: 'var(--accent-mint)' }}>
            {currentModule.cooling.toUpperCase()}
          </div>
          <div className="sub-value">Demand: {currentModule.demand}</div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <Clock size={18} />
            <span className="card-title">Module Runtime</span>
          </div>
          <div className="main-value" style={{ color: 'var(--text-primary)' }}>
            48.2 hrs
          </div>
          <div className="sub-value">Cooling cycles: 127</div>
        </div>
      </div>

      {/* Module Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="module-card" style={{ height: '120px', cursor: 'default' }}>
          <div style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Temperature History</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            24-hour trend with target line
          </p>
        </div>
        <div className="module-card" style={{ height: '120px', cursor: 'default' }}>
          <div style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Humidity History</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            24-hour trend with target range
          </p>
        </div>
        <div className="module-card" style={{ height: '120px', cursor: 'default' }}>
          <div style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Weight History</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Daily changes and removals
          </p>
        </div>
        <div className="module-card" style={{ height: '120px', cursor: 'default' }}>
          <div style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Door Events</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Open/close events and timestamps
          </p>
        </div>
        <div className="module-card" style={{ height: '120px', cursor: 'default' }}>
          <div style={{ fontWeight: 650, marginBottom: '0.5rem' }}>Cooling Activity</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Runtime and power consumption
          </p>
        </div>
      </div>
    </div>
  );
}

export default Modules;