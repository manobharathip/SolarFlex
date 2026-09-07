import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Search, Filter, CheckSquare, XCircle } from 'lucide-react';

function Alerts() {
  const { data } = useStore();
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const modules = useMemo(() => {
    const unique = Array.from(new Set(data.alerts.map(a => a.module)));
    return ['ALL', ...unique];
  }, [data.alerts]);

  const severities = ['ALL', 'INFO', 'WARNING', 'CRITICAL'];

  const filtered = data.alerts.filter(a => {
    const moduleOk = moduleFilter === 'ALL' || a.module === moduleFilter;
    const sevOk = severityFilter === 'ALL' || a.severity === severityFilter;
    const searchOk =
      a.event.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    return moduleOk && sevOk && searchOk;
  });

  return (
    <div className="alerts-page">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)' }}>Alerts & System Logs</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Events, warnings and system activity
        </p>
      </div>

      <div className="alerts-filters">
        <select className="filter-select" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          {modules.map(m => (
            <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>
          ))}
        </select>

        <select className="filter-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          {severities.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>
          ))}
        </select>

        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Search size={18} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or reasons"
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      <div className="alerts-list">
        {filtered.map(a => (
          <div key={a.id} className="alert-item">
            <div className="timestamp">{a.timestamp}</div>
            <div className="module-badge">{a.module}</div>
            <div>
              <div className="event">{a.event}</div>
              <div className="reason">Reason: {a.reason}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div
                className={`severity ${a.severity === 'INFO' ? 'info' : a.severity === 'WARNING' ? 'warning' : 'critical'}`}
              >
                {a.severity}
              </div>
              <button
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-secondary)',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CheckSquare size={16} /> Acknowledge
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)' }}>
            No alerts match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;