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

export interface CohortFeatureStats {
  benign_mean: number;
  benign_std: number;
  malignant_mean: number;
  malignant_std: number;
}

export interface CohortStatsResponse {
  [feature_name: string]: CohortFeatureStats;
}

export const api = {
  async predict(data: PredictRequest): Promise<PredictResponse> {
    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Prediction failed');
    }
    return response.json();
  },

  async getAnalytics(): Promise<AnalyticsResponse> {
    const response = await fetch(`${API_BASE}/analytics`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  async getCohortStats(): Promise<CohortStatsResponse> {
    const response = await fetch(`${API_BASE}/cohort-stats`);
    if (!response.ok) throw new Error('Failed to fetch cohort stats');
    return response.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async saveHistory(data: SaveHistoryRequest): Promise<{ success: boolean; id: string; prediction_date: string }> {
    const response = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save to database');
    return response.json();
  },

  async deleteHistory(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete history record');
    return response.json();
  },

  async getFeatureImportance(): Promise<Array<{ name: string; lr: number; rf: number }>> {
    const response = await fetch(`${API_BASE}/feature-importance`);
    if (!response.ok) throw new Error('Failed to fetch feature importance');
    return response.json();
  },
};
