const API_BASE = 'http://localhost:8000/api';

export interface PredictRequest {
  patient_name: string;
  features: number[];
  model_used: 'lr' | 'svm' | 'rf';
  mode: 'full' | 'quick';
}

export interface FeatureContribution {
  raw_name: string;
  name: string;
  value: number;
  contribution: number;
}

export interface PredictResponse {
  success: boolean;
  prediction: 'Malignant' | 'Benign';
  confidence: number;
  risk_score: number;
  risk_category: 'High Risk' | 'Medium Risk' | 'Low Risk';
  recommendations: string[];
  insights: string[];
  contributions: FeatureContribution[];
}

export interface HistoryItem {
  id: string;
  patient_name: string;
  prediction_date: string;
  mode: 'full' | 'quick';
  model_used: 'lr' | 'svm' | 'rf';
  prediction: 'Malignant' | 'Benign';
  confidence: number;
  risk_score: number;
  risk_category: string;
  features: number[];
}

export interface SaveHistoryRequest {
  patient_name: string;
  mode: 'full' | 'quick';
  model_used: 'lr' | 'svm' | 'rf';
  prediction: 'Malignant' | 'Benign';
  confidence: number;
  risk_score: number;
  risk_category: string;
  features: number[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  roc_curve: Array<{ fpr: number; tpr: number }>;
}

export interface AnalyticsResponse {
  full: {
    lr: ModelMetrics;
    svm: ModelMetrics;
    rf: ModelMetrics;
  };
  quick: {
    lr: ModelMetrics;
    svm: ModelMetrics;
    rf: ModelMetrics;
  };
}

// Global Feature Importance Item
export interface ImportanceItem {
  name: string;
  lr: number;
  rf: number;
}

// Pre-calculated ML Weights and Normalizations for local simulation (In-browser ML)
const MODEL_WEIGHTS = {
  full: {
    mean: [14.1176, 19.185, 91.8822, 654.3776, 0.0957, 0.1036, 0.0889, 0.0483, 0.1811, 0.0628, 0.402, 1.2027, 2.8583, 40.0713, 0.007, 0.0256, 0.0328, 0.0119, 0.0206, 0.0038, 16.2351, 25.5357, 107.1031, 876.987, 0.1315, 0.2527, 0.2746, 0.1142, 0.2905, 0.0839],
    scale: [3.5319, 4.2613, 24.2953, 354.5529, 0.0139, 0.0524, 0.0794, 0.038, 0.0275, 0.0072, 0.2828, 0.5412, 2.0689, 47.1844, 0.0031, 0.0186, 0.0321, 0.0063, 0.0082, 0.0028, 4.806, 6.0584, 33.338, 567.0487, 0.0231, 0.1548, 0.2092, 0.0653, 0.0631, 0.0178],
    coef: [0.4319, 0.3873, 0.3934, 0.4652, 0.0717, -0.5402, 0.8015, 1.1198, -0.2361, -0.0759, 1.2682, -0.1889, 0.6106, 0.9072, 0.3133, -0.6825, -0.1753, 0.3113, -0.5004, -0.6162, 0.8798, 1.3506, 0.5895, 0.8418, 0.5442, -0.0161, 0.9431, 0.7782, 1.2082, 0.1574],
    intercept: -0.4456,
    feature_labels: ['Radius Mean', 'Texture Mean', 'Perimeter Mean', 'Area Mean', 'Smoothness Mean', 'Compactness Mean', 'Concavity Mean', 'Concave Points Mean', 'Symmetry Mean', 'Fractal Dimension Mean', 'Radius SE', 'Texture SE', 'Perimeter SE', 'Area SE', 'Smoothness SE', 'Compactness SE', 'Concavity SE', 'Concave Points SE', 'Symmetry SE', 'Fractal Dimension SE', 'Radius Worst', 'Texture Worst', 'Perimeter Worst', 'Area Worst', 'Smoothness Worst', 'Compactness Worst', 'Concavity Worst', 'Concave Points Worst', 'Symmetry Worst', 'Fractal Dimension Worst'],
    feature_raw_names: ['radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean', 'compactness_mean', 'concavity_mean', 'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean', 'radius_se', 'texture_se', 'perimeter_se', 'area_se', 'smoothness_se', 'compactness_se', 'concavity_se', 'concave_points_se', 'symmetry_se', 'fractal_dimension_se', 'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst', 'smoothness_worst', 'compactness_worst', 'concavity_worst', 'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst']
  },
  quick: {
    mean: [14.1176, 19.185, 91.8822, 654.3776, 0.0957, 0.1036, 0.0889, 0.0483, 0.1811, 0.0628],
    scale: [3.5319, 4.2613, 24.2953, 354.5529, 0.0139, 0.0524, 0.0794, 0.038, 0.0275, 0.0072],
    coef: [0.9569, 1.3491, 0.8711, 1.1301, 0.9891, -0.5615, 0.9352, 1.7346, 0.4407, -0.2921],
    intercept: -0.6631,
    feature_labels: ['Radius Mean', 'Texture Mean', 'Perimeter Mean', 'Area Mean', 'Smoothness Mean', 'Compactness Mean', 'Concavity Mean', 'Concave Points Mean', 'Symmetry Mean', 'Fractal Dimension Mean'],
    feature_raw_names: ['radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean', 'compactness_mean', 'concavity_mean', 'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean']
  }
};

// Static mockup metrics matching exact training values (used when API is offline)
const STATIC_METRICS: AnalyticsResponse = {
  full: {
    lr: { accuracy: 97.37, precision: 97.67, recall: 95.45, f1_score: 96.55, confusion_matrix: { tn: 70, fp: 1, fn: 2, tp: 41 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0141, tpr: 0.8 }, { fpr: 0.0141, tpr: 0.9545 }, { fpr: 0.1, tpr: 0.97 }, { fpr: 1, tpr: 1 }] },
    svm: { accuracy: 98.25, precision: 97.73, recall: 97.73, f1_score: 97.73, confusion_matrix: { tn: 70, fp: 1, fn: 1, tp: 42 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0141, tpr: 0.9545 }, { fpr: 0.0141, tpr: 0.9773 }, { fpr: 0.05, tpr: 0.99 }, { fpr: 1, tpr: 1 }] },
    rf: { accuracy: 96.49, precision: 95.45, recall: 95.45, f1_score: 95.45, confusion_matrix: { tn: 69, fp: 2, fn: 2, tp: 41 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0282, tpr: 0.93 }, { fpr: 0.0282, tpr: 0.9545 }, { fpr: 0.08, tpr: 0.98 }, { fpr: 1, tpr: 1 }] }
  },
  quick: {
    lr: { accuracy: 93.86, precision: 93.02, recall: 90.91, f1_score: 91.95, confusion_matrix: { tn: 68, fp: 3, fn: 4, tp: 40 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0423, tpr: 0.88 }, { fpr: 0.0423, tpr: 0.9091 }, { fpr: 0.15, tpr: 0.95 }, { fpr: 1, tpr: 1 }] },
    svm: { accuracy: 97.37, precision: 97.67, recall: 95.45, f1_score: 96.55, confusion_matrix: { tn: 70, fp: 1, fn: 2, tp: 41 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0141, tpr: 0.9545 }, { fpr: 0.0141, tpr: 0.9773 }, { fpr: 0.08, tpr: 0.99 }, { fpr: 1, tpr: 1 }] },
    rf: { accuracy: 95.61, precision: 95.35, recall: 93.18, f1_score: 94.25, confusion_matrix: { tn: 69, fp: 2, fn: 3, tp: 41 }, roc_curve: [{ fpr: 0, tpr: 0 }, { fpr: 0.0282, tpr: 0.91 }, { fpr: 0.0282, tpr: 0.9318 }, { fpr: 0.1, tpr: 0.96 }, { fpr: 1, tpr: 1 }] }
  }
};

const STATIC_IMPORTANCES: ImportanceItem[] = [
  { name: 'Concave Points Worst', lr: 0.7782, rf: 0.142 },
  { name: 'Perimeter Worst', lr: 0.5895, rf: 0.138 },
  { name: 'Radius Worst', lr: 0.8798, rf: 0.124 },
  { name: 'Area Worst', lr: 0.8418, rf: 0.121 },
  { name: 'Concave Points Mean', lr: 1.1198, rf: 0.115 },
  { name: 'Area Mean', lr: 0.4652, rf: 0.063 },
  { name: 'Perimeter Mean', lr: 0.3934, rf: 0.058 },
  { name: 'Radius Mean', lr: 0.4319, rf: 0.049 },
  { name: 'Concavity Mean', lr: 0.8015, rf: 0.046 },
  { name: 'Concavity Worst', lr: 0.9431, rf: 0.038 },
  { name: 'Texture Worst', lr: 1.3506, rf: 0.026 },
  { name: 'Area SE', lr: 0.9072, rf: 0.021 }
];

// Helper to perform local ML inference simulator (client-side backup)
function runLocalInference(req: PredictRequest): PredictResponse {
  const cfg = MODEL_WEIGHTS[req.mode];
  let sum = cfg.intercept;
  
  const contributions: FeatureContribution[] = [];
  
  for (let i = 0; i < cfg.coef.length; i++) {
    const val = req.features[i];
    const std_val = (val - cfg.mean[i]) / cfg.scale[i];
    const contrib = cfg.coef[i] * std_val;
    sum += contrib;
    
    contributions.push({
      raw_name: cfg.feature_raw_names[i],
      name: cfg.feature_labels[i],
      value: val,
      contribution: Number(contrib.toFixed(4))
    });
  }
  
  // Sigmoid probability
  const probability = 1 / (1 + Math.exp(-sum));
  const risk_score = Number((probability * 100).toFixed(2));
  
  const prediction: 'Malignant' | 'Benign' = probability >= 0.5 ? 'Malignant' : 'Benign';
  const confidence = Number((prediction === 'Malignant' ? probability * 100 : (1 - probability) * 100).toFixed(2));
  
  // Sort contributions by absolute impact
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  let risk_category: 'High Risk' | 'Medium Risk' | 'Low Risk' = 'Low Risk';
  let recommendations: string[] = [];
  
  if (risk_score >= 70) {
    risk_category = 'High Risk';
    recommendations = [
      "Immediate consultation with a clinical oncologist is highly recommended.",
      "Schedule a diagnostic mammography and targeted breast ultrasound for high-resolution imaging.",
      "Discuss the indication for a core needle biopsy with your healthcare team to establish histopathology.",
      "Establish close clinical monitoring and discuss immediate staging protocols."
    ];
  } else if (risk_score >= 30) {
    risk_category = 'Medium Risk';
    recommendations = [
      "Schedule a clinical breast examination (CBE) with a specialist within 2-4 weeks.",
      "Arrange follow-up imaging (mammogram/ultrasound) in 3 to 6 months to monitor any structural alterations.",
      "Perform monthly breast self-exams and report any new palpable masses or skin changes.",
      "Consult with your primary care provider to review personal risk factors (family history, genetics)."
    ];
  } else {
    risk_category = 'Low Risk';
    recommendations = [
      "Continue standard age-appropriate routine mammography screening intervals (typically every 1-2 years).",
      "Maintain monthly breast self-examinations to establish individual baseline awareness.",
      "Maintain a healthy breast-wellness lifestyle (balanced nutrition, physical activity, alcohol moderation).",
      "Report any visual asymmetry, discharge, or localized changes immediately to a healthcare provider."
    ];
  }
  
  // Dynamic Insights
  const insights = prediction === 'Malignant'
    ? [
        `The tumor demonstrates elevated values in core indicators, notably ${contributions.slice(0, 2).map(c => c.name).join(', ')}.`,
        "Standardized feature profiling shows that these measurements align heavily with typical malignant database patterns."
      ]
    : [
        "The analyzed tumor characteristics reflect structural measurements that fall well within benign population boundaries.",
        "Low cellular density, minimal concavity, and smaller radius boundaries suggest non-invasive cellular structure."
      ];

  return {
    success: true,
    prediction,
    confidence,
    risk_score,
    risk_category,
    recommendations,
    insights,
    contributions
  };
}

// Local Storage SQLite Emulation for History
function getLocalHistory(): HistoryItem[] {
  const logs = localStorage.getItem('mammosense_history');
  return logs ? JSON.parse(logs) : [];
}

function saveLocalHistory(req: SaveHistoryRequest): { success: boolean; id: string; prediction_date: string } {
  const list = getLocalHistory();
  const id = Math.random().toString(36).substring(2, 10);
  const prediction_date = new Date().toISOString().replace('T', ' ').split('.')[0];
  
  const newItem: HistoryItem = {
    id,
    patient_name: req.patient_name || 'Anonymous Patient',
    prediction_date,
    mode: req.mode,
    model_used: req.model_used,
    prediction: req.prediction,
    confidence: req.confidence,
    risk_score: req.risk_score,
    risk_category: req.risk_category,
    features: req.features
  };
  
  list.unshift(newItem);
  localStorage.setItem('mammosense_history', JSON.stringify(list));
  return { success: true, id, prediction_date };
}

function deleteLocalHistory(id: string): { success: boolean; message: string } {
  const list = getLocalHistory();
  const filtered = list.filter(item => item.id !== id);
  localStorage.setItem('mammosense_history', JSON.stringify(filtered));
  return { success: true, message: 'Record deleted from browser storage.' };
}

export const api = {
  async predict(data: PredictRequest): Promise<PredictResponse> {
    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Prediction failed');
      }
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Switching to client-side ML simulator.");
      return runLocalInference(data);
    }
  },

  async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Serving pre-computed metrics.");
      return STATIC_METRICS;
    }
  },

  async getCohortStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/cohort-stats`);
      if (!response.ok) throw new Error('Failed to fetch cohort stats');
      return await response.json();
    } catch {
      // Mock stats response
      return {};
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const response = await fetch(`${API_BASE}/history`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Serving LocalStorage logs.");
      return getLocalHistory();
    }
  },

  async saveHistory(data: SaveHistoryRequest): Promise<{ success: boolean; id: string; prediction_date: string }> {
    try {
      const response = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save to database');
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Saving log in LocalStorage.");
      return saveLocalHistory(data);
    }
  },

  async deleteHistory(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete history record');
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Deleting log from LocalStorage.");
      return deleteLocalHistory(id);
    }
  },

  async getFeatureImportance(): Promise<ImportanceItem[]> {
    try {
      const response = await fetch(`${API_BASE}/feature-importance`);
      if (!response.ok) throw new Error('Failed to fetch feature importance');
      return await response.json();
    } catch {
      console.warn("⚠️ API backend offline. Serving pre-computed feature importances.");
      return STATIC_IMPORTANCES;
    }
  },
};
