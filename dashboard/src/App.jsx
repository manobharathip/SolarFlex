import React, { useEffect } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Overview from './pages/Overview';
import Modules from './pages/Modules';
import AdaptiveControl from './pages/AdaptiveControl';
import Energy from './pages/Energy';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

const pageComponents = {
  overview: Overview,
  modules: Modules,
  'adaptive-control': AdaptiveControl,
  energy: Energy,
  analytics: Analytics,
  alerts: Alerts
};

const pageTitles = {
  overview: { title: 'System Overview', subtitle: 'Live condition of the cold-storage system' },
  modules: { title: 'Storage Modules', subtitle: 'Individual condition and loading information' },
  'adaptive-control': { title: 'Adaptive Cooling Control', subtitle: 'How the controller is distributing available cooling' },
  energy: { title: 'Energy Management', subtitle: 'Solar generation, battery condition and system consumption' },
  analytics: { title: 'Performance Analytics', subtitle: 'Historical performance and experimental results' },
  alerts: { title: 'Alerts & System Logs', subtitle: 'Events, warnings and system activity' }
};

function App() {
  const { theme, activePage, fetchFromApi, usingApi } = useStore();
  const ActivePage = pageComponents[activePage] || Overview;

  useEffect(() => {
    // Initial fetch
    fetchFromApi();

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchFromApi();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchFromApi]);

  return (
    <div className={`app ${theme}`}>
      <Sidebar />
      <div className="main-content">
        <TopBar
          title={pageTitles[activePage]?.title || 'ColdGrid'}
          subtitle={pageTitles[activePage]?.subtitle}
        />
        <div className="page-content">
          {usingApi && (
            <div style={{
              background: 'rgba(85, 184, 154, 0.08)',
              border: '1px solid var(--accent-mint)',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              fontSize: '0.75rem',
              color: 'var(--accent-mint)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-mint)' }} />
              Live data from API • Real-time updates enabled
            </div>
          )}
          <ActivePage />
        </div>
      </div>
    </div>
  );
}

export default App;