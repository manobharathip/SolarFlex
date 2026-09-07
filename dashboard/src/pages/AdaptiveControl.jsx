import React, { useState } from 'react';
import { useStore } from '../store';
import { Brain, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function AdaptiveControl() {
  const { data, setActivePage } = useStore();
  const [controlMode, setControlMode] = useState('AUTOMATIC');

  return (
    <div className="adaptive-control-page">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)' }}>
          Adaptive Cooling Control
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          How the controller is distributing available cooling
        </p>
      </div>

      {/* Priority Panel */}
      <section className="priority-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          Module Priority
        </h3>
        <div className="priority-list">
          {data.adaptiveControl.decisions.map((decision, idx) => (
            <div key={decision.module} style={{
              display: 'grid',
              gridTemplateColumns: '80px 100px 80px 1fr',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
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
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {decision.cooling}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {decision.reason}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Decision Explanation */}
      <section className="priority-panel">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          Controller Decision
        </h3>
        <div style={{
          padding: '1.25rem',
          background: 'var(--surface-secondary)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <Brain size={24} style={{ color: 'var(--accent-mint)', marginTop: '0.25rem' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Module M1 is receiving higher cooling priority because its temperature is 0.4°C above the target.
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Factors considered:
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {data.adaptiveControl.decisions.map((d, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px'
                }}>
                  {d.module}: {d.reason.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cooling Visualization */}
      <section className="allocation-bar">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          Cooling Capacity Allocation
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Available cooling: 100%
        </p>
        <div className="allocation-container">
          <div className="allocation-segment m1" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.625rem' }}>M1: 60%</span>
          </div>
          <div className="allocation-segment m2" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.625rem' }}>M2: 25%</span>
          </div>
          <div className="allocation-segment m3" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.625rem' }}>M3: 15%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High Demand</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Medium Demand</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--accent-mint)', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Low Demand</span>
          </div>
        </div>
      </section>

      {/* Control State */}
      <section className="control-mode">
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          Control Mode
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['AUTOMATIC', 'ENERGY SAVING', 'MANUAL'].map(mode => (
            <button
              key={mode}
              className={`mode-btn ${controlMode === mode ? 'active' : ''}`}
              onClick={() => setControlMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {controlMode === 'AUTOMATIC' && 'System automatically adjusts cooling based on module priority and conditions.'}
          {controlMode === 'ENERGY SAVING' && 'Reduced cooling capacity with extended target ranges to conserve energy.'}
          {controlMode === 'MANUAL' && 'Manual temperature and cooling control enabled for all modules.'}
        </div>
      </section>

      {/* AI Insights */}
      <section className="priority-panel" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 650, marginBottom: '1rem' }}>
          System Insight
        </h3>
        <div style={{
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(85, 184, 154, 0.1) 0%, rgba(85, 184, 154, 0.05) 100%)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <CheckCircle size={20} style={{ color: 'var(--accent-mint)', marginTop: '0.125rem' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Current adaptive cooling strategy is 12% more efficient than uniform cooling based on historical data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdaptiveControl;