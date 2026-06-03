import React, { useState } from 'react';
import { Play, RotateCcw, UserCheck, ShieldAlert, FileText, CheckCircle, Database } from 'lucide-react';
import { api } from '../services/api';
import type { PredictResponse } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Feature Lists
const QUICK_FEATURES = [
  { key: 'radius_mean', label: 'Radius Mean', desc: 'Distance from center to points on perimeter', min: 6.9, max: 28.1, step: 0.1, default: 14.0 },
  { key: 'texture_mean', label: 'Texture Mean', desc: 'Standard deviation of gray-scale values', min: 9.7, max: 39.2, step: 0.1, default: 19.0 },
  { key: 'perimeter_mean', label: 'Perimeter Mean', desc: 'Size of the core tumor perimeter', min: 43.7, max: 188.5, step: 1.0, default: 91.0 },
  { key: 'area_mean', label: 'Area Mean', desc: 'Estimated area of the tumor cells', min: 143.5, max: 2501.0, step: 1.0, default: 650.0 },
  { key: 'smoothness_mean', label: 'Smoothness Mean', desc: 'Local variation in radius lengths', min: 0.05, max: 0.16, step: 0.001, default: 0.096 },
  { key: 'compactness_mean', label: 'Compactness Mean', desc: 'Perimeter^2 / area - 1.0', min: 0.01, max: 0.345, step: 0.001, default: 0.104 },
  { key: 'concavity_mean', label: 'Concavity Mean', desc: 'Severity of concave portions of the contour', min: 0.0, max: 0.426, step: 0.001, default: 0.088 },
  { key: 'concave points_mean', label: 'Concave Points Mean', desc: 'Number of concave portions of the contour', min: 0.0, max: 0.201, step: 0.001, default: 0.048 },
  { key: 'symmetry_mean', label: 'Symmetry Mean', desc: 'Symmetrical balance of the cell structures', min: 0.1, max: 0.304, step: 0.001, default: 0.181 },
  { key: 'fractal_dimension_mean', label: 'Fractal Dimension Mean', desc: 'Coastline approximation - 1.0', min: 0.049, max: 0.097, step: 0.001, default: 0.062 }
];

const SE_FEATURES = [
  { key: 'radius_se', label: 'Radius SE', min: 0.11, max: 2.87, step: 0.01, default: 0.4 },
  { key: 'texture_se', label: 'Texture SE', min: 0.36, max: 4.88, step: 0.01, default: 1.2 },
  { key: 'perimeter_se', label: 'Perimeter SE', min: 0.75, max: 21.98, step: 0.01, default: 2.8 },
  { key: 'area_se', label: 'Area SE', min: 6.8, max: 542.2, step: 0.1, default: 40.3 },
  { key: 'smoothness_se', label: 'Smoothness SE', min: 0.001, max: 0.031, step: 0.0001, default: 0.007 },
  { key: 'compactness_se', label: 'Compactness SE', min: 0.002, max: 0.135, step: 0.0001, default: 0.025 },
  { key: 'concavity_se', label: 'Concavity SE', min: 0.0, max: 0.396, step: 0.0001, default: 0.031 },
  { key: 'concave points_se', label: 'Concave Points SE', min: 0.0, max: 0.052, step: 0.0001, default: 0.011 },
  { key: 'symmetry_se', label: 'Symmetry SE', min: 0.007, max: 0.078, step: 0.0001, default: 0.02 },
  { key: 'fractal_dimension_se', label: 'Fractal Dimension SE', min: 0.0008, max: 0.029, step: 0.0001, default: 0.003 }
];

const WORST_FEATURES = [
  { key: 'radius_worst', label: 'Radius Worst', min: 7.9, max: 36.0, step: 0.1, default: 16.2 },
  { key: 'texture_worst', label: 'Texture Worst', min: 12.0, max: 49.5, step: 0.1, default: 25.6 },
  { key: 'perimeter_worst', label: 'Perimeter Worst', min: 50.4, max: 251.2, step: 0.1, default: 107.2 },
  { key: 'area_worst', label: 'Area Worst', min: 185.2, max: 4254.0, step: 1.0, default: 880.0 },
  { key: 'smoothness_worst', label: 'Smoothness Worst', min: 0.07, max: 0.22, step: 0.001, default: 0.132 },
  { key: 'compactness_worst', label: 'Compactness Worst', min: 0.027, max: 1.058, step: 0.001, default: 0.254 },
  { key: 'concavity_worst', label: 'Concavity Worst', min: 0.0, max: 1.252, step: 0.001, default: 0.272 },
  { key: 'concave points_worst', label: 'Concave Points Worst', min: 0.0, max: 0.291, step: 0.001, default: 0.114 },
  { key: 'symmetry_worst', label: 'Symmetry Worst', min: 0.156, max: 0.663, step: 0.001, default: 0.29 },
  { key: 'fractal_dimension_worst', label: 'Fractal Dimension Worst', min: 0.055, max: 0.207, step: 0.001, default: 0.083 }
];

// Presets from actual Wisconsin records
const PRESETS = {
  benign: [
    13.54, 14.36, 87.46, 566.3, 0.0978, 0.0813, 0.0666, 0.0478, 0.1885, 0.0577,
    0.2699, 0.7886, 2.058, 23.56, 0.0085, 0.0146, 0.0239, 0.0132, 0.0198, 0.0023,
    15.11, 19.26, 99.7, 711.2, 0.144, 0.1773, 0.239, 0.1288, 0.2977, 0.0726
  ],
  malignant: [
    17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.0787,
    1.095, 0.9053, 8.589, 153.4, 0.0064, 0.049, 0.0537, 0.0159, 0.03, 0.0062,
    25.38, 17.33, 184.6, 2019.0, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601, 0.1189
  ]
};

export const Predictor: React.FC = () => {
  const [mode, setMode] = useState<'full' | 'quick'>('full');
  const [model, setModel] = useState<'lr' | 'svm' | 'rf'>('svm');
  const [patientName, setPatientName] = useState<string>('');
  
  // State for feature inputs (stores 30 features)
  const [inputs, setInputs] = useState<number[]>(() => {
    return [
      ...QUICK_FEATURES.map(f => f.default),
      ...SE_FEATURES.map(f => f.default),
      ...WORST_FEATURES.map(f => f.default)
    ];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load Preset
  const handlePresetSelect = (presetType: 'benign' | 'malignant') => {
    const data = PRESETS[presetType];
    setInputs([...data]);
    setPatientName(presetType === 'benign' ? 'Preset: Benign Case #142' : 'Preset: Malignant Case #99');
    setResult(null);
    setSaveSuccess(false);
  };

  // Clear inputs to minimums
  const handleReset = () => {
    const cleared = [
      ...QUICK_FEATURES.map(f => f.default),
      ...SE_FEATURES.map(f => f.default),
      ...WORST_FEATURES.map(f => f.default)
    ];
    setInputs(cleared);
    setPatientName('');
    setResult(null);
    setSaveSuccess(false);
    setError(null);
  };

  // Handle single input change
  const handleInputChange = (index: number, val: number) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);
    setSaveSuccess(false);
  };

  // Run prediction
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);

    try {
      // Determine feature array based on mode
      const featuresToSend = mode === 'full' 
        ? inputs 
        : inputs.slice(0, 10); // Quick mode sends first 10

      const res = await api.predict({
        patient_name: patientName.trim() || 'Anonymous Patient',
        features: featuresToSend,
        model_used: model,
        mode: mode
      });

      setResult(res);
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  // Save to Database
  const handleSaveToDb = async () => {
    if (!result) return;
    try {
      const featuresSaved = mode === 'full' ? inputs : inputs.slice(0, 10);
      await api.saveHistory({
        patient_name: patientName.trim() || 'Anonymous Patient',
        mode: mode,
        model_used: model,
        prediction: result.prediction,
        confidence: result.confidence,
        risk_score: result.risk_score,
        risk_category: result.risk_category,
        features: featuresSaved
      });
      setSaveSuccess(true);
    } catch (err: any) {
      alert('Failed to save to patient history: ' + err.message);
    }
  };

  // PDF Report Generation
  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(15, 21, 36);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MAMMOSENSE AI - MEDICAL REPORT', 15, 20);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Advanced Machine Learning Diagnostic Support Engine', 15, 28);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 36);

    // Color indicators
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('PATIENT REPORT PROFILE', 15, 55);

    // Patient details
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Detail']],
      body: [
        ['Patient Name / ID', patientName.trim() || 'Anonymous Patient'],
        ['Analysis Mode', mode === 'full' ? 'Clinical (30 Features)' : 'Quick (10 Features)'],
        ['AI Model Utilized', model === 'svm' ? 'Support Vector Machine' : model === 'lr' ? 'Logistic Regression' : 'Random Forest Classifier'],
        ['Risk Category Classification', result.risk_category],
        ['AI Prediction Output', result.prediction.toUpperCase()],
        ['Model Probability Assessment', `${result.risk_score}% Malignant Probability`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] }
    });

    // Medical recommendations header
    const nextY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('Helvetica', 'bold');
    doc.text('RECOMMENDED CLINICAL ACTION PLAN', 15, nextY);
    
    // Recommendations items
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    let currentY = nextY + 6;
    result.recommendations.forEach((rec, idx) => {
      doc.text(`[${idx + 1}] ${rec}`, 18, currentY);
      currentY += 8;
    });

    // Explainable AI (XAI)
    doc.setFont('Helvetica', 'bold');
    doc.text('LOCAL AI FEATURE ATTRIBUTIONS (XAI)', 15, currentY + 6);
    
    const xaiRows = result.contributions.slice(0, 5).map(c => [
      c.name,
      c.value.toString(),
      c.contribution > 0 ? `+${c.contribution.toFixed(4)} (Malignant Drift)` : `${c.contribution.toFixed(4)} (Benign Drift)`
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      head: [['Feature Name', 'Observed Value', 'Drift Attribution Score']],
      body: xaiRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });

    // Signature and disclaimer
    const endY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Disclaimer: MammoSense AI is an artificial intelligence decision-support tool trained on the Scikit-learn Wisconsin dataset.', 15, endY);
    doc.text('Predictions are informational only and do not replace professional clinical evaluation, biopsy analysis, or specialist review.', 15, endY + 4);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(140, endY + 15, 195, endY + 15);
    doc.text('Authorized Clinician Signature / Stamp', 140, endY + 20);

    doc.save(`MammoSense_Report_${patientName.trim().replace(/\s+/g, '_') || 'Patient'}.pdf`);
  };

  // Recharts local contribution XAI preparation
  const xaiData = result
    ? result.contributions.slice(0, 8).map(c => ({
        name: c.name.length > 20 ? c.name.slice(0, 18) + '..' : c.name,
        contribution: c.contribution,
        value: c.value
      })).reverse()
    : [];

  return (
    <div className="animated-fadeIn">
      {/* Configuration & Presets */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3 className="card-title"><UserCheck size={20} className="text-primary" /> Patient Intake & Pre-Sets</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Enter patient identification and choose a sample clinical profile to automatically populate tumor dimensions, or write features manually.
          </p>
          <div className="form-control">
            <label>Patient Name / Case ID</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Patient #742" 
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-secondary" onClick={() => handlePresetSelect('benign')} style={{ flex: 1, fontSize: '12px' }}>
              🔴 Load Benign Preset
            </button>
            <button className="btn btn-secondary" onClick={() => handlePresetSelect('malignant')} style={{ flex: 1, fontSize: '12px' }}>
              🟣 Load Malignant Preset
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title"><ShieldAlert size={20} className="text-primary" /> System Configuration</h3>
          <div className="grid-2">
            <div className="form-control">
              <label>Diagnostic Analysis Mode</label>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  className={`btn ${mode === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  onClick={() => { setMode('quick'); setResult(null); }}
                >
                  Quick (10 Feat.)
                </button>
                <button 
                  className={`btn ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  onClick={() => { setMode('full'); setResult(null); }}
                >
                  Clinical (30 Feat.)
                </button>
              </div>
            </div>

            <div className="form-control">
              <label>AI Classification Engine</label>
              <select 
                className="form-input" 
                value={model} 
                onChange={e => { setModel(e.target.value as any); setResult(null); }}
                style={{ cursor: 'pointer' }}
              >
                <option value="svm">Support Vector Machine (SVM)</option>
                <option value="lr">Logistic Regression (LR)</option>
                <option value="rf">Random Forest Classifier (RF)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
              <RotateCcw size={16} /> Reset Form
            </button>
            <button className="btn btn-primary" onClick={handlePredict} disabled={loading} style={{ flex: 2 }}>
              <Play size={16} /> {loading ? 'Running Inference...' : 'Perform Diagnostic Analysis'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
          <strong>Inference Failed:</strong> {error}
        </div>
      )}

      {/* Main Predictor Form & Results Container */}
      <div style={{ display: 'grid', gridTemplateColumns: result ? '3.2fr 4fr' : '1fr', gap: '24px' }}>
        {/* Features Input Form */}
        <div className="card">
          <h3 className="card-title">🔬 Tumor Characteristic Measurements</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Adjust the sliders below corresponding to the patient's needle-aspirate cellular analysis. Averages represent the standardized dataset scaling boundaries.
          </p>
          
          <form onSubmit={handlePredict}>
            <div style={{ display: 'grid', gridTemplateColumns: mode === 'full' ? '1fr 1fr' : '1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                  Mean Cell Dimensions
                </h4>
                {QUICK_FEATURES.map((f, i) => (
                  <div className="form-control" key={f.key} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span title={f.desc} style={{ cursor: 'help', textDecoration: 'underline dotted var(--text-muted)' }}>{f.label}</span>
                      <strong className="text-primary">{inputs[i].toFixed(f.step < 0.01 ? 4 : 2)}</strong>
                    </div>
                    <input 
                      type="range" 
                      min={f.min} 
                      max={f.max} 
                      step={f.step} 
                      value={inputs[i]} 
                      onChange={e => handleInputChange(i, parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>
                ))}
              </div>

              {mode === 'full' && (
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    Standard Errors (SE) & Worst
                  </h4>
                  <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                    <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Standard Errors</h5>
                    {SE_FEATURES.map((f, i) => {
                      const idx = i + 10;
                      return (
                        <div className="form-control" key={f.key} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>{f.label}</span>
                            <strong className="text-secondary">{inputs[idx].toFixed(f.step < 0.01 ? 4 : 2)}</strong>
                          </div>
                          <input 
                            type="range" 
                            min={f.min} 
                            max={f.max} 
                            step={f.step} 
                            value={inputs[idx]} 
                            onChange={e => handleInputChange(idx, parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                        </div>
                      );
                    })}

                    <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '16px', marginBottom: '8px' }}>Worst (Largest) Averages</h5>
                    {WORST_FEATURES.map((f, i) => {
                      const idx = i + 20;
                      return (
                        <div className="form-control" key={f.key} style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>{f.label}</span>
                            <strong className="text-secondary">{inputs[idx].toFixed(f.step < 0.01 ? 4 : 2)}</strong>
                          </div>
                          <input 
                            type="range" 
                            min={f.min} 
                            max={f.max} 
                            step={f.step} 
                            value={inputs[idx]} 
                            onChange={e => handleInputChange(idx, parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Prediction Results & Explanation */}
        {result && (
          <div className="animated-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ 
              borderColor: result.prediction === 'Malignant' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
              boxShadow: result.prediction === 'Malignant' ? '0 0 15px rgba(239,68,68,0.1)' : '0 0 15px rgba(16,185,129,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>📋 Diagnostic Assessment</h3>
                <span className={`badge ${result.risk_category === 'High Risk' ? 'badge-high' : result.risk_category === 'Medium Risk' ? 'badge-medium' : 'badge-low'}`}>
                  {result.risk_category}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {/* Confidence Gauge */}
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  <svg width="120" height="120" className="gauge-svg">
                    <circle cx="60" cy="60" r="50" className="gauge-bg" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      className={`gauge-fill ${result.risk_category === 'High Risk' ? 'high' : result.risk_category === 'Medium Risk' ? 'medium' : 'low'}`}
                      strokeDasharray="314.16"
                      strokeDashoffset={314.16 - (result.risk_score / 100) * 314.16}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>
                      {result.risk_score}%
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Malignant Prob.</div>
                  </div>
                </div>

                {/* Text Result Summary */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: result.prediction === 'Malignant' ? 'var(--danger)' : 'var(--success)',
                    marginBottom: '8px'
                  }}>
                    {result.prediction === 'Malignant' ? '🔴 MALIGNANT DETECTED' : '🟢 BENIGN INDICATION'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Model Confidence: <strong>{result.confidence}%</strong> ({model.toUpperCase()} Engine). The cellular measurements strongly lean towards a {result.prediction.toLowerCase()} biological profile.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF} style={{ padding: '8px 12px', fontSize: '11px' }}>
                      <FileText size={14} /> PDF Report
                    </button>
                    <button 
                      className={`btn ${saveSuccess ? 'btn-secondary' : 'btn-primary'} btn-sm`} 
                      onClick={handleSaveToDb} 
                      disabled={saveSuccess}
                      style={{ padding: '8px 12px', fontSize: '11px' }}
                    >
                      {saveSuccess ? (
                        <>
                          <CheckCircle size={14} className="text-success" /> Saved to History
                        </>
                      ) : (
                        <>
                          <Database size={14} /> Log to History
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable AI Local Contributions */}
            <div className="card">
              <h3 className="card-title">🔍 Local Feature Attributions (Explainable AI)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Attribution scores indicate how each dimension drives the prediction. Positive scores (red) drift the model towards Malignant, while negative (green) drift it towards Benign.
              </p>
              
              <div style={{ height: '180px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={xaiData} 
                    layout="vertical" 
                    margin={{ top: 5, right: 15, left: -25, bottom: 5 }}
                  >
                    <XAxis type="number" fontSize={10} stroke="var(--text-muted)" />
                    <YAxis dataKey="name" type="category" fontSize={9} stroke="var(--text-secondary)" width={100} />
                    <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
                    <Bar 
                      dataKey="contribution" 
                      fill="var(--primary)"
                      radius={2}
                    >
                      {xaiData.map((entry, index) => {
                        const color = entry.contribution > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)';
                        return <rect key={`rect-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights & Clinical Recommendations */}
            <div className="card">
              <h3 className="card-title">🩺 Medical Recommendation Board</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--primary)', fontSize: '12px' }}>
                  <strong>🤖 AI Clinical Insight:</strong>
                  {result.insights.map((insight, idx) => (
                    <p key={idx} style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                      {insight}
                    </p>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>Action Recommendations:</h4>
                  <ul className="rec-list">
                    {result.recommendations.map((rec, idx) => (
                      <li className="rec-item" key={idx}>
                        <span className="rec-icon text-primary">✔</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
