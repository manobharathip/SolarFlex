import React, { useState } from 'react';
import { useStore } from '../store';
import { Sun, Battery, Zap, Snowflake, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function Overview() {
  const { data, theme } = useStore();
  const [timeRange, setTimeRange] = useState('6H');

  const colors = {
    m1: theme === 'dark' ? '#FF6B6B' : '#C95C54',
    m2: theme === 'dark' ? '#FFB74D' : '#D89532',
    m3: theme === 'dark' ? '#4ECDC4' : '#55B89A',
    target: theme === 'dark' ? '#9CAFAA' : '#667574'
  };

  return (
    <div className="overview-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="system-status">
          <span className="indicator" />
          <div>
            <div className="status-text">SYSTEM RUNNING</div>
            <div className="description">All critical systems operating normally</div>
          </div>
        </div>

        <div className="quick-metrics">
          <div className="metric-card">
            <div className="label">Connected Modules</div>
            <div className="value">{data.modules.length} / {data.modules.length}</div>
          </div>
          <div className="metric-card">
            <div className="label">Stored Mass</div>
            <div className="value">{data.quickMetrics.storedMass}</div>
          </div>
          <div className="metric-card">
            <div className="label">Average Temperature</div>
            <div className="value">{data.quickMetrics.avgTemperature}</div>
          </div>
          <div className="metric-card">
            <div className="label">Average Humidity</div>
            <div className="value">{data.quickMetrics.avgHumidity}</div>
          </div>
        </div>
      </section>

      {/* Energy Strip */}
      <section className="energy-strip">
        <div className="energy-card">
          <div className="icon solar">
            <Sun size={20} />
          </div>
          <div className="info">
            <span className="label">Solar</span>
            <span className="value">{data.energy.solar.value}</span>
            <span className="status active">{data.energy.solar.status}</span>
          </div>
        </div>

        <div className="energy-card">
          <div className="icon battery">
            <Battery size={20} />
          </div>
          <div className="info">
            <span className="label">Battery</span>
            <span className="value">{data.energy.battery.value}</span>
            <span className="status active">{data.energy.battery.status}</span>
          </div>
        </div>

        <div className="energy-card">
          <div className="icon load">
            <Zap size={20} />
          </div>
          <div className="info">
            <span className="label">System Load</span>
            <span className="value">{data.energy.systemLoad.value}</span>
          </div>
        </div>

        <div className="energy-card">
          <div className="icon cooling">
            <Snowflake size={20} />
          </div>
          <div className="info">
            <span className="label">Cooling</span>
            <span className="value">{data.energy.cooling.value}</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Module Summary */}
        <section className="module-summary">
          <h2 className="section-title">Module Conditions</h2>
          <div className="module-cards">
            {data.modules.map(module => (
              <div key={module.id} className="module-card">
                <div className="header">
                  <div>
                    <div className="module-id">{module.id}</div>
                    <div className="produce">{module.produce}</div>
                  </div>
                  <span className="priority-badge">Priority {module.priority}</span>
                </div>
                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">Temp</span>
                    <span className="metric-value">
                      {module.temperature}
                      <span className="target"> / {module.targetTemperature}</span>
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Humidity</span>
                    <span className="metric-value">{module.humidity}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Weight</span>
                    <span className="metric-value">{module.weight} kg</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Cooling</span>
                    <span className="metric-value">{module.cooling}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Temperature Chart */}
        <section className="chart-section">
          <div className="chart-header">
            <h3 className="chart-title">Temperature Trend</h3>
            <div className="chart-tabs">
              {['1H', '6H', '24H'].map(range => (
                <button
                  key={range}
                  className={`chart-tab ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.temperatureHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                domain={[16, 22]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickFormatter={(v) => `${v}°C`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="M1"
                stroke={colors.m1}
                strokeWidth={2}
                dot={false}
                name="Module 1"
              />
              <Line
                type="monotone"
                dataKey="M2"
                stroke={colors.m2}
                strokeWidth={2}
                dot={false}
                name="Module 2"
              />
              <Line
                type="monotone"
                dataKey="M3"
                stroke={colors.m3}
                strokeWidth={2}
                dot={false}
                name="Module 3"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={colors.target}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Adaptive Summary */}
      <section style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Current Cooling Allocation</h2>
        <div className="priority-panel" style={{ padding: '1.25rem' }}>
          <div className="priority-list">
            {data.adaptiveControl.decisions.map((decision, idx) => (
              <div key={decision.module} style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 100px 1fr',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                background: 'var(--surface-secondary)',
                borderRadius: '6px'
              }}>
                <span style={{ fontWeight: 650 }}>{decision.module}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: decision.demand === 'HIGH' ? 'rgba(201, 92, 84, 0.1)' :
                              decision.demand === 'MEDIUM' ? 'rgba(230, 162, 60, 0.1)' :
                              'rgba(85, 184, 154, 0.1)',
                  color: decision.demand === 'HIGH' ? 'var(--danger)' :
                         decision.demand === 'MEDIUM' ? 'var(--warning)' :
                         'var(--accent-mint)',
                  textAlign: 'center'
                }}>
                  {decision.demand}
                </span>
                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{decision.cooling}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {decision.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Overview;