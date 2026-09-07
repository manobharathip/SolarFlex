import React, { useState } from 'react';
import { useStore } from '../store';
import { Sun, Battery, Zap, Activity, TrendingUp, Clock } from 'lucide-react';
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

function Energy() {
  const { data, theme } = useStore();
  const [timeRange, setTimeRange] = useState('24H');

  const colors = {
    solar: theme === 'dark' ? '#FFB74D' : '#E6A23C',
    consumption: theme === 'dark' ? '#4ECDC4' : '#55B89A'
  };

  return (
    <div className="energy-page">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)' }}>
          Energy Management
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Solar generation, battery condition and system consumption
        </p>
      </div>

      {/* Power Flow Diagram */}
      <section className="power-flow">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          Power Flow
        </h3>
        <div className="flow-diagram">
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(230, 162, 60, 0.1)', color: 'var(--accent-amber)' }}>
              <Sun size={24} />
            </div>
            <span className="node-label">Solar Panel</span>
            <span className="node-value">{data.energyDetails.solar.power}</span>
          </div>
          <div style={{ color: 'var(--border)' }}>&rarr;</div>
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(76, 127, 163, 0.1)', color: 'var(--info)' }}>
              <Activity size={24} />
            </div>
            <span className="node-label">MPPT</span>
            <span className="node-value">98%</span>
          </div>
          <div style={{ color: 'var(--border)' }}>&rarr;</div>
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(85, 184, 154, 0.1)', color: 'var(--accent-mint)' }}>
              <Battery size={24} />
            </div>
            <span className="node-label">Battery</span>
            <span className="node-value">{data.energyDetails.battery.soc}</span>
          </div>
          <div style={{ color: 'var(--border)' }}>&rarr;</div>
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(246, 248, 247, 0.2)', color: 'var(--text-secondary)' }}>
              <Zap size={24} />
            </div>
            <span className="node-label">24V DC Bus</span>
            <span className="node-value">24.5V</span>
          </div>
          <div style={{ color: 'var(--border)' }}>&rarr;</div>
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(46, 139, 104, 0.1)', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
            <span className="node-label">Cooling</span>
            <span className="node-value">{data.energyDetails.consumption.cooling}</span>
          </div>
          <div style={{ color: 'var(--border)' }}>&rarr;</div>
          <div className="flow-node">
            <div className="node-icon" style={{ background: 'rgba(76, 127, 163, 0.1)', color: 'var(--info)' }}>
              <Zap size={24} />
            </div>
            <span className="node-label">Electronics</span>
            <span className="node-value">{data.energyDetails.consumption.electronics}</span>
          </div>
        </div>
      </section>

      {/* Energy Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {/* Solar Details */}
        <div className="energy-detail-card">
          <div className="card-title">Solar Generation</div>
          <div className="detail-row">
            <span className="detail-label">Voltage</span>
            <span className="detail-value">{data.energyDetails.solar.voltage}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Current</span>
            <span className="detail-value">{data.energyDetails.solar.current}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Power</span>
            <span className="detail-value">{data.energyDetails.solar.power}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Daily Energy</span>
            <span className="detail-value">{data.energyDetails.solar.dailyEnergy}</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="status-badge generating">{data.energyDetails.solar.status}</span>
          </div>
        </div>

        {/* Battery Details */}
        <div className="energy-detail-card">
          <div className="card-title">Battery</div>
          <div className="detail-row">
            <span className="detail-label">State of Charge</span>
            <span className="detail-value">{data.energyDetails.battery.soc}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Voltage</span>
            <span className="detail-value">{data.energyDetails.battery.voltage}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">{data.energyDetails.battery.status}</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '76%', height: '100%', background: 'var(--accent-mint)', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '0.75rem' }}>76%</span>
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="status-badge" style={{ background: 'rgba(46, 139, 104, 0.1)', color: 'var(--success)' }}>GOOD</span>
          </div>
        </div>

        {/* Consumption Details */}
        <div className="energy-detail-card">
          <div className="card-title">System Consumption</div>
          <div className="detail-row">
            <span className="detail-label">Cooling System</span>
            <span className="detail-value">{data.energyDetails.consumption.cooling}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fans</span>
            <span className="detail-value">{data.energyDetails.consumption.fans}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Electronics</span>
            <span className="detail-value">{data.energyDetails.consumption.electronics}</span>
          </div>
          <div className="detail-row" style={{ borderTop: '2px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span className="detail-label" style={{ fontWeight: 650 }}>Total</span>
            <span className="detail-value" style={{ fontWeight: 650 }}>{data.energyDetails.consumption.total}</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className="status-badge" style={{ background: 'rgba(76, 127, 163, 0.1)', color: 'var(--info)' }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Energy Chart */}
      <section className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Solar Generation vs Consumption</h3>
          <div className="chart-tabs">
            {['6H', '24H', '7D'].map(range => (
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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.energyHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              domain={[0, 200]}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={(v) => `${v} W`}
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
              dataKey="solar"
              stroke={colors.solar}
              strokeWidth={2}
              dot={false}
              name="Solar Generation"
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke={colors.consumption}
              strokeWidth={2}
              dot={false}
              name="Consumption"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

export default Energy;