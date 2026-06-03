import React from 'react';
import { Award, Layers, ShieldAlert, Cpu } from 'lucide-react';

export const AboutModel: React.FC = () => {
  return (
    <div className="animated-fadeIn">
      {/* Intro */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title"><Award size={20} className="text-primary" /> The Science Behind MammoSense AI</h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          MammoSense AI is built to demonstrate the application of supervised machine learning in clinical oncology decision-support. By processing numeric representations of fine-needle aspiration (FNA) biopsy cell nuclei images, the system recognizes intricate mathematical patterns distinguishing malignant (invasive cancer cells) from benign (non-cancerous cellular groupings) profiles.
        </p>
      </div>

      <div className="grid-2">
        {/* Dataset */}
        <div className="card">
          <h3 className="card-title"><Layers size={18} className="text-primary" /> Wisconsin Breast Cancer Dataset</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            The models are trained using the clinical <strong>Breast Cancer Wisconsin (Diagnostic) Dataset</strong>, originally compiled by Dr. William H. Wolberg, General Surgery Dept., University of Wisconsin Clinical Sciences Center.
          </p>
          <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
            <li><strong>Total Clinical Instances:</strong> 569 patient profiles</li>
            <li><strong>Class Distribution:</strong> 357 Benign (62.7%), 212 Malignant (37.3%)</li>
            <li><strong>Measurements:</strong> 30 features computing cell nucleus dimensions: radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, and fractal dimension.</li>
          </ul>
        </div>

        {/* Feature Scaling */}
        <div className="card">
          <h3 className="card-title"><Cpu size={18} className="text-primary" /> StandardScaler Preprocessing</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            Raw medical features range from decimal points (e.g., cell smoothness: <code>0.097</code>) to thousands (e.g., cell area: <code>2501.0</code>). Models fail when features have drastically different magnitudes.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We apply a <strong>StandardScaler</strong> that centers features by subtracting the mean and scaling to unit variance:
            <code style={{ display: 'block', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', margin: '8px 0', textAlign: 'center', color: 'var(--primary)' }}>
              z = (x - u) / s
            </code>
            This ensures that all dimensions contribute equally to model boundaries and local XAI attribution weights.
          </p>
        </div>
      </div>

      {/* Classifiers Explainers */}
      <h4 style={{ fontSize: '16px', margin: '24px 0 16px 0', fontFamily: 'var(--font-title)' }}>Classification Engines Explained</h4>
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h5 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '8px' }}>Support Vector Machine (SVM)</h5>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            SVM models project features into high-dimensional space and compute an optimal separating hyperplane. By maximizing the margin between malignant and benign boundaries, it achieves the highest generalization accuracy (<strong>98.25%</strong> on test validation).
          </p>
        </div>

        <div className="card">
          <h5 style={{ fontSize: '14px', color: 'var(--success)', marginBottom: '8px' }}>Logistic Regression (LR)</h5>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Logistic Regression models the probability of binary outputs using the sigmoid logit function. It provides highly interpretable log-odds coefficients, which we utilize as the baseline to calculate local Explainable AI (XAI) feature attributions.
          </p>
        </div>

        <div className="card">
          <h5 style={{ fontSize: '14px', color: 'var(--warning)', marginBottom: '8px' }}>Random Forest (RF)</h5>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Random Forest compiles an ensemble of decision trees trained on random feature subsets. It aggregates predictions to resist overfitting, making it robust against individual noise and providing solid, Gini-index-based global feature importances.
          </p>
        </div>
      </div>

      {/* Clinical Warning */}
      <div className="card" style={{ borderColor: 'rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.03)' }}>
        <h3 className="card-title" style={{ color: 'var(--warning)', fontSize: '15px' }}>
          <ShieldAlert size={18} /> Important Clinical Disclaimer
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          MammoSense AI is designed exclusively as an educational demonstration of Artificial Intelligence capabilities in healthcare decision-support. The classification predictions, risk scores, and clinical recommendations generated by the models are based on statistical training data and must not be used for medical diagnosis, treatment planning, or clinical triage. All patient assessments must be conducted by qualified medical professionals using standard laboratory biopsy protocols and imaging standards.
        </p>
      </div>
    </div>
  );
};
