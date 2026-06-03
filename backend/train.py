import os
import pickle
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, roc_curve

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "Breast Cancer.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Load and clean data
print("📊 Loading dataset...")
df = pd.read_csv(CSV_PATH)
# Drop Unnamed: 32 and id
df = df.drop(columns=["id"], errors="ignore")
if "Unnamed: 32" in df.columns:
    df = df.drop(columns=["Unnamed: 32"])

# Map target M=1, B=0
df["diagnosis"] = df["diagnosis"].map({"M": 1, "B": 0})

# Feature lists
all_features = [col for col in df.columns if col != "diagnosis"]
mean_features = [col for col in all_features if col.endswith("_mean")]

print(f"Total features available: {len(all_features)}")
print(f"Quick mode mean features: {len(mean_features)}")

# Split data
X = df[all_features]
y = df["diagnosis"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Save feature list names for reference
feature_names = {
    "full": all_features,
    "quick": mean_features
}

with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
    json.dump(feature_names, f, indent=4)

# Helper function to downsample ROC curves for UI rendering (e.g. 20 points)
def downsample_roc(fpr, tpr):
    # Select roughly 20 points evenly spaced across thresholds
    n_points = 20
    indices = np.linspace(0, len(fpr) - 1, n_points, dtype=int)
    roc_points = []
    for idx in indices:
        roc_points.append({
            "fpr": round(float(fpr[idx]), 4),
            "tpr": round(float(tpr[idx]), 4)
        })
    # Ensure it starts at 0,0 and ends at 1,1
    if roc_points[0] != {"fpr": 0.0, "tpr": 0.0}:
        roc_points.insert(0, {"fpr": 0.0, "tpr": 0.0})
    if roc_points[-1] != {"fpr": 1.0, "tpr": 1.0}:
        roc_points.append({"fpr": 1.0, "tpr": 1.0})
    return roc_points

metrics_output = {
    "full": {},
    "quick": {}
}

# 2. Train and evaluate function
def train_and_evaluate(features, mode_name):
    print(f"\n⚙️ Training models in [{mode_name.upper()}] mode (features count: {len(features)})...")
    
    X_tr = X_train[features]
    X_ts = X_test[features]
    
    # Scaler
    scaler = StandardScaler()
    X_tr_scaled = scaler.fit_transform(X_tr)
    X_ts_scaled = scaler.transform(X_ts)
    
    # Save Scaler
    scaler_path = os.path.join(MODELS_DIR, f"scaler_{mode_name}.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
        
    models = {
        "lr": LogisticRegression(max_iter=5000, random_state=42),
        "svm": SVC(probability=True, random_state=42),
        "rf": RandomForestClassifier(n_estimators=100, random_state=42)
    }
    
    for name, model in models.items():
        print(f"  Fitting {name.upper()}...")
        model.fit(X_tr_scaled, y_train)
        
        # Predict
        preds = model.predict(X_ts_scaled)
        probs = model.predict_proba(X_ts_scaled)[:, 1]
        
        # Metrics
        acc = accuracy_score(y_test, preds)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="binary")
        cm = confusion_matrix(y_test, preds)
        
        # ROC curve
        fpr, tpr, _ = roc_curve(y_test, probs)
        roc_points = downsample_roc(fpr, tpr)
        
        # Confusion matrix list
        tn, fp, fn, tp = cm.ravel()
        
        # Save metrics
        metrics_output[mode_name][name] = {
            "accuracy": round(float(acc) * 100, 2),
            "precision": round(float(precision) * 100, 2),
            "recall": round(float(recall) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "confusion_matrix": {
                "tn": int(tn),
                "fp": int(fp),
                "fn": int(fn),
                "tp": int(tp)
            },
            "roc_curve": roc_points
        }
        
        # Save Model
        model_path = os.path.join(MODELS_DIR, f"model_{name}_{mode_name}.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(model, f)
            
        print(f"    {name.upper()} Test Accuracy: {acc*100:.2f}%")

# Train Full (30 features) and Quick (10 features)
train_and_evaluate(all_features, "full")
train_and_evaluate(mean_features, "quick")

# 3. Calculate Cohort Statistics (Averages/STDs of Benign vs Malignant)
print("\n📊 Computing Cohort Statistics...")
cohort_stats = {}
for feat in all_features:
    benign_vals = df[df["diagnosis"] == 0][feat]
    malignant_vals = df[df["diagnosis"] == 1][feat]
    
    cohort_stats[feat] = {
        "benign_mean": float(benign_vals.mean()),
        "benign_std": float(benign_vals.std()),
        "malignant_mean": float(malignant_vals.mean()),
        "malignant_std": float(malignant_vals.std())
    }

cohort_stats_path = os.path.join(MODELS_DIR, "cohort_stats.json")
with open(cohort_stats_path, "w") as f:
    json.dump(cohort_stats, f, indent=4)

# 4. Save Metrics
metrics_path = os.path.join(MODELS_DIR, "metrics.json")
with open(metrics_path, "w") as f:
    json.dump(metrics_output, f, indent=4)

print("\n🚀 Model training and configuration complete!")
print(f"Exported files to: {MODELS_DIR}")
