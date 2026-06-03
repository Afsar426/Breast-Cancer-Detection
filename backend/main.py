import os
import sqlite3
import pickle
import json
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# Directory Setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Database Setup
DB_PATH = os.path.join(DATA_DIR, "patients.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id TEXT PRIMARY KEY,
            patient_name TEXT,
            prediction_date TEXT,
            mode TEXT,
            model_used TEXT,
            prediction TEXT,
            confidence REAL,
            risk_score REAL,
            risk_category TEXT,
            features TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Load models and scalers on startup
models = {}
scalers = {}
feature_names = {}
cohort_stats = {}
metrics = {}
feature_importances = []

try:
    # Feature Names
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "r") as f:
        feature_names = json.load(f)
        
    # Cohort Stats
    with open(os.path.join(MODELS_DIR, "cohort_stats.json"), "r") as f:
        cohort_stats = json.load(f)
        
    # Performance Metrics
    with open(os.path.join(MODELS_DIR, "metrics.json"), "r") as f:
        metrics = json.load(f)

    # Feature Importances
    with open(os.path.join(MODELS_DIR, "feature_importances.json"), "r") as f:
        feature_importances = json.load(f)

    # Scalers
    for mode in ["full", "quick"]:
        scaler_path = os.path.join(MODELS_DIR, f"scaler_{mode}.pkl")
        if os.path.exists(scaler_path):
            with open(scaler_path, "rb") as f:
                scalers[mode] = pickle.load(f)

    # Models
    for mode in ["full", "quick"]:
        models[mode] = {}
        for m_name in ["lr", "svm", "rf"]:
            model_path = os.path.join(MODELS_DIR, f"model_{m_name}_{mode}.pkl")
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    models[mode][m_name] = pickle.load(f)
                    
    print("✅ All AI models, scalers, and stats preloaded successfully!")
except Exception as e:
    print(f"❌ Error preloading ML resources: {e}")

# Create FastAPI application
app = FastAPI(
    title="MammoSense AI Backend API",
    description="Intelligent Breast Cancer Detection Support Engine",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PredictionRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    features: List[float]
    model_used: str  # 'lr', 'svm', 'rf'
    mode: str        # 'full' or 'quick'

class HistoryItem(BaseModel):
    id: str
    patient_name: str
    prediction_date: str
    mode: str
    model_used: str
    prediction: str
    confidence: float
    risk_score: float
    risk_category: str
    features: List[float]

# Helper function to get clean feature label
def clean_feature_label(name: str) -> str:
    return name.replace("_", " ").title()

# API Endpoints
@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "MammoSense AI Backend Engine",
        "version": "1.0.0",
        "models_loaded": list(models.keys())
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected" if os.path.exists(DB_PATH) else "disconnected",
        "models_count": sum(len(m) for m in models.values())
    }

@app.post("/api/predict")
def predict_cancer(req: PredictionRequest):
    mode = req.mode
    model_name = req.model_used
    
    # Validation
    if mode not in ["full", "quick"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'full' or 'quick'.")
    if model_name not in ["lr", "svm", "rf"]:
        raise HTTPException(status_code=400, detail="Invalid model. Must be 'lr', 'svm', or 'rf'.")
    
    expected_count = len(feature_names[mode])
    if len(req.features) != expected_count:
        raise HTTPException(
            status_code=400, 
            detail=f"Feature length mismatch. Expected {expected_count} values for {mode} mode, got {len(req.features)}."
        )
        
    try:
        # Load scaler & model
        scaler = scalers[mode]
        model = models[mode][model_name]
        lr_model = models[mode]["lr"]  # Used as XAI baseline coeff exporter
        
        # Prepare inputs
        raw_features = np.array(req.features).reshape(1, -1)
        scaled_features = scaler.transform(raw_features)
        
        # Prediction
        prediction_val = model.predict(scaled_features)[0]
        prediction_label = "Malignant" if prediction_val == 1 else "Benign"
        
        # Probability / Risk Score
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(scaled_features)[0]
            # Risk is probability of malignant class (1)
            risk_score = round(float(probs[1]) * 100, 2)
            confidence = round(float(max(probs)) * 100, 2)
        else:
            # Fallback (SVM distance metrics or default)
            risk_score = 100.0 if prediction_val == 1 else 0.0
            confidence = 100.0
            
        # Risk Categories
        if risk_score >= 70:
            risk_category = "High Risk"
            risk_color = "🔴"
        elif risk_score >= 30:
            risk_category = "Medium Risk"
            risk_color = "🟡"
        else:
            risk_category = "Low Risk"
            risk_color = "🟢"
            
        # Local XAI contributions using Logistic Regression coefficients
        # contribution = coeff * standardized_value
        coefs = lr_model.coef_[0]
        means = scaler.mean_
        stds = scaler.scale_
        
        contributions = []
        for i, f_name in enumerate(feature_names[mode]):
            val = req.features[i]
            std_val = (val - means[i]) / stds[i]
            contrib = coefs[i] * std_val
            contributions.append({
                "raw_name": f_name,
                "name": clean_feature_label(f_name),
                "value": round(val, 4),
                "contribution": round(float(contrib), 4)
            })
            
        # Sort contributions by absolute impact
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        
        # dynamic Medical Recommendations
        recommendations = []
        if risk_score >= 70:
            recommendations = [
                "Immediate consultation with a clinical oncologist is highly recommended.",
                "Schedule a diagnostic mammography and targeted breast ultrasound for high-resolution imaging.",
                "Discuss the indication for a core needle biopsy with your healthcare team to establish histopathology.",
                "Establish close clinical monitoring and discuss immediate staging protocols."
            ]
        elif risk_score >= 30:
            recommendations = [
                "Schedule a clinical breast examination (CBE) with a specialist within 2-4 weeks.",
                "Arrange follow-up imaging (mammogram/ultrasound) in 3 to 6 months to monitor any structural alterations.",
                "Perform monthly breast self-exams and report any new palpable masses or skin changes.",
                "Consult with your primary care provider to review personal risk factors (family history, genetics)."
            ]
        else:
            recommendations = [
                "Continue standard age-appropriate routine mammography screening intervals (typically every 1-2 years).",
                "Maintain monthly breast self-examinations to establish individual baseline awareness.",
                "Maintain a healthy breast-wellness lifestyle (balanced nutrition, physical activity, alcohol moderation).",
                "Report any visual asymmetry, discharge, or localized changes immediately to a healthcare provider."
            ]
            
        # Dynamic AI Insights (comparisons to population cohorts)
        insights = []
        # Find features where the input deviates significantly towards the malignant profile
        malignant_alignments = []
        for c in contributions[:5]: # look at top 5 most impactful features
            f_name = c["raw_name"]
            f_val = c["value"]
            stats = cohort_stats.get(f_name, {})
            
            if stats:
                b_mean = stats["benign_mean"]
                m_mean = stats["malignant_mean"]
                
                # Check if it leans closer to malignant mean than benign
                dist_to_b = abs(f_val - b_mean)
                dist_to_m = abs(f_val - m_mean)
                
                if dist_to_m < dist_to_b and m_mean > b_mean and f_val > b_mean:
                    malignant_alignments.append(c["name"])
        
        if prediction_label == "Malignant":
            insights.append(
                f"The tumor demonstrates elevated values in core indicators, notably "
                f"{', '.join(malignant_alignments[:3]) if malignant_alignments else 'perimeter and area metrics'}."
            )
            insights.append(
                "Standardized feature profiling shows that these measurements align heavily with typical "
                "malignant cohort signatures in the Wisconsin database."
            )
        else:
            insights.append(
                "The analyzed tumor characteristics reflect structural measurements that fall well within "
                "benign population boundaries."
            )
            insights.append(
                "Low cellular density, minimal concavity, and smaller radius boundaries suggest "
                "non-invasive cellular structure."
            )
            
        # Return response
        return {
            "success": True,
            "prediction": prediction_label,
            "confidence": confidence,
            "risk_score": risk_score,
            "risk_category": risk_category,
            "recommendations": recommendations,
            "insights": insights,
            "contributions": contributions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/analytics")
def get_analytics():
    return metrics

@app.get("/api/cohort-stats")
def get_cohort_stats():
    return cohort_stats

# Patient History Routes
@app.get("/api/history", response_model=List[HistoryItem])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY prediction_date DESC")
    rows = cursor.fetchall()
    
    history = []
    for r in rows:
        history.append(HistoryItem(
            id=r["id"],
            patient_name=r["patient_name"],
            prediction_date=r["prediction_date"],
            mode=r["mode"],
            model_used=r["model_used"],
            prediction=r["prediction"],
            confidence=r["confidence"],
            risk_score=r["risk_score"],
            risk_category=r["risk_category"],
            features=json.loads(r["features"])
        ))
    conn.close()
    return history

class SaveHistoryRequest(BaseModel):
    patient_name: str
    mode: str
    model_used: str
    prediction: str
    confidence: float
    risk_score: float
    risk_category: str
    features: List[float]

@app.post("/api/history")
def save_history(req: SaveHistoryRequest):
    record_id = str(uuid.uuid4())[:8]
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions (id, patient_name, prediction_date, mode, model_used, prediction, confidence, risk_score, risk_category, features)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record_id,
            req.patient_name,
            date_str,
            req.mode,
            req.model_used,
            req.prediction,
            req.confidence,
            req.risk_score,
            req.risk_category,
            json.dumps(req.features)
        ))
        conn.commit()
        conn.close()
        return {"success": True, "id": record_id, "prediction_date": date_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save prediction record: {str(e)}")

@app.delete("/api/history/{record_id}")
def delete_history(record_id: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions WHERE id = ?", (record_id,))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()
        
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="Prediction record not found.")
            
        return {"success": True, "message": "Record deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")

@app.get("/api/feature-importance")
def get_feature_importance():
    return feature_importances

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)