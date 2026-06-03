import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  HeartPulse, 
  LineChart, 
  BookOpen, 
  Cpu, 
  Terminal, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { api } from './services/api';

// Pages
import { Predictor } from './pages/Predictor';
import { ModelPerformance } from './pages/ModelPerformance';
import { FeatureImportance } from './pages/FeatureImportance';
import { PredictionAnalytics } from './pages/PredictionAnalytics';
import { ApiDoc } from './pages/ApiDoc';
import { AboutModel } from './pages/AboutModel';

type PageId = 'predictor' | 'performance' | 'importance' | 'analytics' | 'api' | 'about';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('predictor');
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  // Perform API health check on startup
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.predict({
          patient_name: 'test',
          features: Array(10).fill(0),
          model_used: 'lr',
          mode: 'quick'
        }).catch(() => null); // ignore test errors, just ping
        
        // Query the dedicated health endpoint
        const health = await api.getHistory().then(() => true).catch(() => false);
        setApiHealthy(health);
      } catch {
        setApiHealthy(false);
      }
    };
    
    checkHealth();
    // Ping every 10 seconds
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'predictor':
        return <Predictor />;
      case 'performance':
        return <ModelPerformance />;
      case 'importance':
        return <FeatureImportance />;
      case 'analytics':
        return <PredictionAnalytics />;
      case 'api':
        return <ApiDoc />;
      case 'about':
        return <AboutModel />;
      default:
        return <Predictor />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'predictor': return 'Diagnostic Predictor Panel';
      case 'performance': return 'Model Evaluation Benchmarks';
      case 'importance': return 'Feature Influence Analytics';
      case 'analytics': return 'Patient History Logs & Analytics';
      case 'api': return 'System API Reference';
      case 'about': return 'AI Model Technical Background';
      default: return 'Diagnostic Predictor Panel';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <HeartPulse size={24} color="#fff" />
          </div>
          <span className="logo-text">MammoSense AI</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentPage === 'predictor' ? 'active' : ''}`}
            onClick={() => setCurrentPage('predictor')}
          >
            <Activity size={18} />
            <span>Diagnostic Panel</span>
          </button>
          
          <button 
            className={`nav-item ${currentPage === 'performance' ? 'active' : ''}`}
            onClick={() => setCurrentPage('performance')}
          >
            <LineChart size={18} />
            <span>Model Benchmarks</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'importance' ? 'active' : ''}`}
            onClick={() => setCurrentPage('importance')}
          >
            <Settings size={18} />
            <span>Feature Importance</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <BookOpen size={18} />
            <span>History & Logs</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'api' ? 'active' : ''}`}
            onClick={() => setCurrentPage('api')}
          >
            <Terminal size={18} />
            <span>Developer API</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => setCurrentPage('about')}
          >
            <Cpu size={18} />
            <span>About AI Model</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div>Developed by Afsar Azam</div>
          <div style={{ marginTop: '4px', fontSize: '10px' }}>v1.0.0 | © 2026</div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="top-bar">
          <h2 className="top-bar-title">{getPageTitle()}</h2>
          
          <div className="top-bar-meta">
            <span>Server: <strong>localhost:8000</strong></span>
            {apiHealthy === true && (
              <span className="status-badge">
                <ShieldCheck size={14} /> API Status: ONLINE
              </span>
            )}
            {apiHealthy === false && (
              <span className="status-badge" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-glow)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <ShieldAlert size={14} /> API Status: OFFLINE
              </span>
            )}
            {apiHealthy === null && (
              <span className="status-badge" style={{ color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                Checking connection...
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Page Viewport */}
        <section className="page-body">
          {renderPage()}
        </section>
      </main>
    </div>
  );
};

export default App;
