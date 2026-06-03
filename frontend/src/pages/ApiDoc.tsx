import React, { useState } from 'react';
import { Terminal, Cpu, Database, Eye } from 'lucide-react';

export const ApiDoc: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'predict' | 'analytics' | 'history'>('predict');

  const predictRequestExample = {
    patient_name: "Patient #104",
    features: [17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.0787],
    model_used: "svm",
    mode: "quick"
  };

  const predictResponseExample = {
    success: true,
    prediction: "Malignant",
    confidence: 98.24,
    risk_score: 98.24,
    risk_category: "High Risk",
    recommendations: [
      "Immediate consultation with a clinical oncologist is highly recommended.",
      "Schedule a diagnostic mammography and targeted breast ultrasound..."
    ],
    insights: [
      "The tumor demonstrates elevated values in core indicators: Radius Mean, Area Mean.",
      "Standardized feature profiling shows that these measurements align heavily with typical malignant cohorts."
    ],
    contributions: [
      { raw_name: "radius_mean", name: "Radius Mean", value: 17.99, contribution: 1.284 },
      { raw_name: "concave points_mean", name: "Concave Points Mean", value: 0.1471, contribution: 1.185 }
    ]
  };

  return (
    <div className="animated-fadeIn">
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title"><Terminal size={20} className="text-primary" /> Developer API Integrations</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          MammoSense AI is designed as a modular, interoperable microservice. Healthcare institutions and developers can query the prediction endpoints to integrate AI diagnostic screening capabilities into EHR (Electronic Health Record) software or clinical portals.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === 'predict' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '12px' }}
            onClick={() => setActiveTab('predict')}
          >
            <Cpu size={16} /> POST /predict
          </button>
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '12px' }}
            onClick={() => setActiveTab('analytics')}
          >
            <Eye size={16} /> GET /analytics
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '12px' }}
            onClick={() => setActiveTab('history')}
          >
            <Database size={16} /> GET/POST /history
          </button>
        </div>

        {/* API Details Panel */}
        <div className="card" style={{ minHeight: '400px' }}>
          {activeTab === 'predict' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Tumor Cancer Classification Inference</h4>
                <span className="badge badge-high" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                  POST
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Submits fine-needle aspirate (FNA) measurements to run classifier predictions. Supports 10-feature quick screening or 30-feature full diagnostic reports.
              </p>
              
              <code style={{ display: 'block', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)', marginBottom: '20px' }}>
                URL: http://localhost:8000/api/predict
              </code>

              <div className="grid-2" style={{ gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>JSON Request Body Parameters:</h5>
                  <table className="custom-table" style={{ fontSize: '11px', marginTop: 0 }}>
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>patient_name</code></td>
                        <td>string</td>
                        <td>Optional name or ID label</td>
                      </tr>
                      <tr>
                        <td><code>features</code></td>
                        <td>float[]</td>
                        <td>Array of floats (10 for quick mode, 30 for full mode)</td>
                      </tr>
                      <tr>
                        <td><code>model_used</code></td>
                        <td>string</td>
                        <td>Classifier engine: <code>"lr"</code>, <code>"svm"</code>, or <code>"rf"</code></td>
                      </tr>
                      <tr>
                        <td><code>mode</code></td>
                        <td>string</td>
                        <td>Analysis complexity: <code>"quick"</code> or <code>"full"</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>cURL Integration:</h5>
                  <pre style={{ padding: '12px', background: '#070a13', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', color: '#a5b4fc', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`curl -X POST http://localhost:8000/api/predict \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_name": "Patient #104",
    "features": [17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.0787],
    "model_used": "svm",
    "mode": "quick"
  }'`}
                  </pre>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>Sample Request JSON:</h5>
                  <pre style={{ padding: '12px', background: '#070a13', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', color: '#a5b4fc', maxHeight: '180px', overflowY: 'auto' }}>
                    {JSON.stringify(predictRequestExample, null, 2)}
                  </pre>
                </div>
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>Sample Response JSON:</h5>
                  <pre style={{ padding: '12px', background: '#070a13', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', color: '#a5b4fc', maxHeight: '180px', overflowY: 'auto' }}>
                    {JSON.stringify(predictResponseExample, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Retrieve Model Benchmarks & Metrics</h4>
                <span className="badge badge-low" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                  GET
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Fetches pre-computed model accuracy metrics, confusion matrices, and ROC curve coordinates for all modes. Used to feed the performance comparison charts.
              </p>
              
              <code style={{ display: 'block', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)', marginBottom: '20px' }}>
                URL: http://localhost:8000/api/analytics
              </code>

              <h5 style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>JavaScript Integration Example:</h5>
              <pre style={{ padding: '12px', background: '#070a13', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '10px', color: '#a5b4fc', overflowX: 'auto' }}>
{`fetch('http://localhost:8000/api/analytics')
  .then(res => res.json())
  .then(metrics => {
    console.log("SVM Clinical Accuracy: " + metrics.full.svm.accuracy + "%");
  });`}
              </pre>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Patient History Database CRUD Enpoints</h4>
                <span className="badge badge-medium" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)' }}>
                  GET/POST/DELETE
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Interact with the patient logging system. Saved items write directly to a local SQLite instance on the backend server.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <code style={{ display: 'block', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)' }}>
                  GET http://localhost:8000/api/history -- Fetch all patient history logs
                </code>
                <code style={{ display: 'block', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)' }}>
                  POST http://localhost:8000/api/history -- Save a new prediction record
                </code>
                <code style={{ display: 'block', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)' }}>
                  DELETE http://localhost:8000/api/history/&#123;id&#125; -- Delete a record by ID
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
