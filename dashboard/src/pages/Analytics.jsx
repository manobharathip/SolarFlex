import React from 'react';
import { useStore } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, Gauge, Zap } from 'lucide-react';

function Analytics() {
  const { data, theme } = useStore();

  const baseSeries = data.temperatureHistory.map(p => ({
    time: p.time,
    temp: p.M1,
    target: p.target
  }));

  const color = theme === 'dark' ? '#8DD5C0' : '#55B89A';

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)' }}>Performance Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Historical performance and experimental results
        </p>
      </div>

      <div className="metrics-grid">
        {[
          { label: 'Pull-down time', value: '18.4 min', icon: <TrendingUp size={18} /> },
          { label: 'Temperature stability', value: '±0.3 °C', icon: <Gauge size={18} /> },
          { label: 'Humidity stability', value: '±2 %', icon: <Gauge size={18} /> },
          { label: 'Cooling runtime', value: '7.2 hrs', icon: <Zap size={18} /> },
          { label: 'Solar energy generated', value: '8.9 kWh', icon: <Zap size={18} /> },
          { label: 'Energy consumed', value: '6.1 kWh', icon: <Zap size={18} /> },
          { label: 'Battery utilization', value: '44 %', icon: <Gauge size={18} /> },
          { label: 'Adaptive cooling savings', value: '12 %', icon: <TrendingUp size={18} /> }
        ].map(m => (
          <div key={m.label} className="analytics-card">
            <div className="label">{m.label}</div>
            <div className="value">{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
        <section className="chart-section" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <h3 className="chart-title">Temperature Stability</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={baseSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis domain={[15, 23]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="temp" stroke={color} strokeWidth={2} dot={false} name="Measured" />
              <Line type="monotone" dataKey="target" stroke="var(--text-secondary)" strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-section" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <h3 className="chart-title">Solar vs System Consumption</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.energyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="solar" name="Solar" stroke="var(--accent-amber)" fill="rgba(230, 162, 60, 0.12)" />
              <Area type="monotone" dataKey="consumption" name="Consumption" stroke="var(--accent-mint)" fill="rgba(85, 184, 154, 0.12)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-section" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <h3 className="chart-title">Battery State of Charge</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.energyHistory.map((p, idx) => ({ time: p.time, soc: 72 + idx * 1.2 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis domain={[60, 90]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="soc" stroke="var(--info)" strokeWidth={2} dot={false} name="SoC" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-section" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <h3 className="chart-title">Cooling Runtime by Module</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { name: 'M1', runtime: 3.6 },
              { name: 'M2', runtime: 2.4 },
              { name: 'M3', runtime: 1.2 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="runtime" fill="var(--accent-mint)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="comparison-section">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '0.25rem' }}>
          Adaptive Cooling Performance
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Compare uniform cooling vs adaptive cooling under similar conditions
        </p>

        <table className="comparison-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Uniform Cooling</th>
              <th>Adaptive Cooling</th>
            </tr>
          </thead>
          <tbody>
            {[
              { p: 'Energy Consumption', a: '7.1 kWh', b: '6.1 kWh' },
              { p: 'Cooling Runtime', a: '9.0 hrs', b: '7.2 hrs' },
              { p: 'Temperature Stability', a: '±0.5 °C', b: '±0.3 °C' }
            ].map(row => (
              <tr key={row.p}>
                <td>{row.p}</td>
                <td>{row.a}</td>
                <td>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Analytics;