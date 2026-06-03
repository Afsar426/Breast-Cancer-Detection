import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { HistoryItem } from '../services/api';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Search, Filter, RefreshCw, TrendingUp, BarChart } from 'lucide-react';

export const PredictionAnalytics: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError('Failed to fetch prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete patient record ID: ${id}?`)) return;
    try {
      await api.deleteHistory(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Filter history records
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.patient_name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase()) ||
                          item.model_used.toLowerCase().includes(search.toLowerCase());
    
    if (filterClass === 'all') return matchesSearch;
    return matchesSearch && item.prediction.toLowerCase() === filterClass.toLowerCase();
  });

  // Calculate aggregated stats
  const totalCount = history.length;
  const malignantCount = history.filter(h => h.prediction === 'Malignant').length;
  const benignCount = totalCount - malignantCount;
  const avgConfidence = totalCount 
    ? Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / totalCount) 
    : 0;

  // Filter for today's predictions
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todaysPredictions = history.filter(h => h.prediction_date.startsWith(todayStr)).length;

  // Pie chart data
  const pieData = [
    { name: 'Benign', value: benignCount },
    { name: 'Malignant', value: malignantCount }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  // Line chart data (predictions over time, chronologically)
  const lineData = [...history]
    .reverse()
    .map((item, idx) => ({
      index: idx + 1,
      date: item.prediction_date.split(' ')[0], // Date only
      'Risk Score': item.risk_score,
      Patient: item.patient_name
    }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading patient history and database analytics...</p>
      </div>
    );
  }

  return (
    <div className="animated-fadeIn">
      {/* Analytics Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Predictions</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>{totalCount}</span>
            <span className="badge badge-low" style={{ textTransform: 'none' }}>All Logs</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Today's Predictions</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>{todaysPredictions}</span>
            <span className="badge badge-medium" style={{ textTransform: 'none' }}>Active Today</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>High Risk Cases</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--danger)' }}>{malignantCount}</span>
            <span className="badge badge-high" style={{ textTransform: 'none' }}>🔴 Malignant</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Avg. AI Confidence</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--primary)' }}>{avgConfidence}%</span>
            <span className="badge badge-low" style={{ textTransform: 'none' }}>Model Trust</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      {totalCount > 0 && (
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Benign vs Malignant Ratio Pie Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 className="card-title" style={{ alignSelf: 'flex-start' }}><BarChart size={18} className="text-primary" /> Case Ratio (Benign vs Malignant)</h3>
            <div style={{ height: '160px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', fontSize: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span>Benign: <strong>{benignCount}</strong> ({Math.round(benignCount/totalCount*100) || 0}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                <span>Malignant: <strong>{malignantCount}</strong> ({Math.round(malignantCount/totalCount*100) || 0}%)</span>
              </div>
            </div>
          </div>

          {/* Timeline chart */}
          <div className="card">
            <h3 className="card-title"><TrendingUp size={18} className="text-primary" /> Risk Score History Log</h3>
            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="index" fontSize={9} stroke="var(--text-secondary)" />
                  <YAxis fontSize={9} stroke="var(--text-secondary)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }}
                    labelFormatter={(label) => `Run #${label}`}
                  />
                  <Line type="monotone" dataKey="Risk Score" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Database logs Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>🗃️ Patient Diagnostic Logs</h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <span style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search patient / model..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', width: '100%' }}
              />
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0 8px', borderRadius: '8px' }}>
              <Filter size={12} className="text-muted" />
              <select 
                value={filterClass} 
                onChange={e => setFilterClass(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '11px', outline: 'none', cursor: 'pointer', padding: '6px 0' }}
              >
                <option value="all">All Classifications</option>
                <option value="benign">Benign Only</option>
                <option value="malignant">Malignant Only</option>
              </select>
            </div>

            <button className="btn btn-secondary" onClick={fetchHistory} style={{ padding: '6px 12px' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Diagnostic Date</th>
                <th>Mode</th>
                <th>AI Model</th>
                <th>Risk Score</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => (
                <tr key={item.id}>
                  <td><code>#{item.id}</code></td>
                  <td><strong>{item.patient_name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.prediction_date}</td>
                  <td>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {item.mode === 'full' ? 'Clinical (30)' : 'Quick (10)'}
                    </span>
                  </td>
                  <td><code>{item.model_used.toUpperCase()}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${item.risk_score}%`, 
                          height: '100%', 
                          backgroundColor: item.prediction === 'Malignant' ? 'var(--danger)' : 'var(--success)'
                        }}></div>
                      </div>
                      <strong>{item.risk_score}%</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.prediction === 'Malignant' ? 'badge-high' : 'badge-low'}`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(item.id)} 
                      style={{ padding: '6px', borderRadius: '6px' }}
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    {totalCount === 0 ? 'No patient records in database. Complete a prediction and log it.' : 'No matching logs found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
