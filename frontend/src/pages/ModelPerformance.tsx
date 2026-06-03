import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend, Tooltip } from 'recharts';
import { api } from '../services/api';
import type { AnalyticsResponse } from '../services/api';
import { BarChart2, CheckSquare, Target, Activity } from 'lucide-react';

export const ModelPerformance: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [mode, setMode] = useState<'full' | 'quick'>('full');
  const [selectedModel, setSelectedModel] = useState<'lr' | 'svm' | 'rf'>('svm');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err: any) {
        setError('Failed to load performance metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading model performance metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px' }}>
        <p>{error || 'No analytics data available.'}</p>
      </div>
    );
  }

  const currentModeMetrics = analytics[mode];
  const modelMetrics = currentModeMetrics[selectedModel];
  const cm = modelMetrics.confusion_matrix;

  // Prepare accuracy data for bar chart
  const accuracyData = [
    { name: 'Support Vector Machine (SVM)', Accuracy: currentModeMetrics.svm.accuracy },
    { name: 'Logistic Regression (LR)', Accuracy: currentModeMetrics.lr.accuracy },
    { name: 'Random Forest (RF)', Accuracy: currentModeMetrics.rf.accuracy }
  ];

  // Combine ROC curves data for comparison chart
  // We align them based on index to plot three lines on one chart
  const svmRoc = currentModeMetrics.svm.roc_curve;
  const lrRoc = currentModeMetrics.lr.roc_curve;
  const rfRoc = currentModeMetrics.rf.roc_curve;

  const combinedRocData = svmRoc.map((pt, i) => ({
    fpr: pt.fpr,
    'SVM TPR': pt.tpr,
    'LR TPR': lrRoc[i] ? lrRoc[i].tpr : pt.tpr,
    'RF TPR': rfRoc[i] ? rfRoc[i].tpr : pt.tpr,
    diagonal: pt.fpr // y=x line reference
  }));

  return (
    <div className="animated-fadeIn">
      {/* Selector Mode */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Toggle dataset feature complexity configuration:</span>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
            <button 
              className={`btn ${mode === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '12px' }}
              onClick={() => setMode('quick')}
            >
              Quick Mode (10 features)
            </button>
            <button 
              className={`btn ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '12px' }}
              onClick={() => setMode('full')}
            >
              Clinical Mode (30 features)
            </button>
          </div>
        </div>
      </div>

      {/* Top Level Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Best Model (Accuracy)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
              SVM Model ({currentModeMetrics.svm.accuracy}%)
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--success-glow)', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Logistic Regression</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
              Test Acc: {currentModeMetrics.lr.accuracy}%
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Random Forest</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
              Test Acc: {currentModeMetrics.rf.accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Comparison Bar Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title"><BarChart2 size={20} className="text-primary" /> Model Accuracy Benchmarks</h3>
        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-secondary)" />
              <YAxis domain={[80, 100]} fontSize={11} stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }}
              />
              <Bar dataKey="Accuracy" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {accuracyData.map((_, index) => {
                  // highlight best model with success color
                  const fill = index === 0 ? 'var(--primary)' : index === 1 ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.5)';
                  return <rect key={`bar-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Confusion Matrix & ROC Curves */}
      <div className="grid-2">
        {/* Model Specific Performance Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>📊 Local Matrix & Stats</h3>
            <select 
              className="form-input" 
              value={selectedModel} 
              onChange={e => setSelectedModel(e.target.value as any)}
              style={{ width: '140px', padding: '6px 12px', fontSize: '12px' }}
            >
              <option value="svm">SVM Classifier</option>
              <option value="lr">Logistic Regression</option>
              <option value="rf">Random Forest</option>
            </select>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Precision</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>
                {modelMetrics.precision}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sensitivity (Recall)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>
                {modelMetrics.recall}%
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>F1-Score</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--warning)', marginTop: '4px' }}>
                {modelMetrics.f1_score}%
              </div>
            </div>
          </div>

          {/* 2x2 Confusion Matrix Heatmap */}
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Confusion Matrix (Test Evaluation):
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' }}>
            {/* Headers */}
            <div style={{ display: 'flex', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ flex: 1 }}></div>
              <div style={{ flex: 2, fontWeight: 'bold' }}>Predicted Benign</div>
              <div style={{ flex: 2, fontWeight: 'bold' }}>Predicted Malignant</div>
            </div>
            
            {/* Row 1: Actual Benign */}
            <div style={{ display: 'flex', gap: '4px', height: '80px' }}>
              <div style={{ width: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>
                Actual B
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: 'rgba(16, 185, 129, 0.25)', 
                border: '1px solid rgba(16,185,129,0.3)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>{cm.tn}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>True Negative</span>
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)' }}>{cm.fp}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>False Positive</span>
              </div>
            </div>

            {/* Row 2: Actual Malignant */}
            <div style={{ display: 'flex', gap: '4px', height: '80px', marginTop: '4px' }}>
              <div style={{ width: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>
                Actual M
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)' }}>{cm.fn}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>False Negative</span>
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: 'rgba(16, 185, 129, 0.25)', 
                border: '1px solid rgba(16,185,129,0.3)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>{cm.tp}</span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>True Positive</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROC Curves Area */}
        <div className="card">
          <h3 className="card-title">📈 Receiver Operating Characteristic (ROC)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            ROC curves evaluate model classification boundaries. Higher area under curves (AUC) closer to top-left corners denote superior predictive diagnostics.
          </p>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedRocData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5 }} fontSize={9} stroke="var(--text-secondary)" />
                <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} fontSize={9} stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                
                {/* Reference diagonal line (y=x) */}
                <Area type="monotone" dataKey="diagonal" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" fill="none" legendType="none" />
                
                <Area type="monotone" dataKey="SVM TPR" stroke="var(--primary)" fill="rgba(99, 102, 241, 0.03)" strokeWidth={2} />
                <Area type="monotone" dataKey="LR TPR" stroke="var(--success)" fill="none" strokeWidth={1.5} />
                <Area type="monotone" dataKey="RF TPR" stroke="var(--warning)" fill="none" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
