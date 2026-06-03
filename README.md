# 🩺 MammoSense AI: Intelligent Breast Cancer Detection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

🔗 **Live Demo Portal:** [https://Afsar426.github.io/Breast-Cancer-Detection/](https://Afsar426.github.io/Breast-Cancer-Detection/)

MammoSense AI is a full-stack Artificial Intelligence healthcare decision-support platform designed to assist in the early detection and classification of breast cancer using Machine Learning. 

The system analyzes medical diagnostic measurements obtained from breast tumor needle-aspirate examinations to classify tumors as **Benign (Non-Cancerous)** or **Malignant (Cancerous)**. It features Explainable AI (XAI) feature attributions, a clinical recommendation engine, dynamic comparative insights, and automated PDF medical report downloads.

---

## 📸 Platform Interface Preview

![MammoSense AI Diagnostic Dashboard](docs/images/mammosense_dashboard_preview.png)

---

## 🌟 Core System Features

*   **AI Risk Assessment Score**: Displays classification outputs coupled with malignant probability percentages categorized into High, Medium, or Low Risk levels.
*   **Explainable AI (XAI)**: Identifies exactly *why* the model made a prediction by showing local feature attributions (positive/negative drift weights) for every cell nucleus measurement.
*   **Medical Recommendation Engine**: Generates clinical recommended action plans (e.g. scheduling diagnostic imaging, biopsy discussions, or screening follow-ups) matching classification profiles.
*   **Dual Complexity Modes**:
    *   *Quick Mode (10 Features)*: Rapid patient screening using only cell nucleus mean dimensions.
    *   *Clinical Mode (30 Features)*: Full diagnostic assessment including Standard Errors (SE) and Worst-case measurements.
*   **Interactive Performance Dashboard**: Real-time evaluation curves including comparative accuracies, Area Under Curve (ROC/AUC), and tabular Confusion Matrix heatmaps.
*   **Dynamic AI Insights**: Dynamic observations analyzing which of the patient's inputs deviate most significantly towards typical malignant or benign database averages.
*   **Patient History SQLite System**: A secure, searchable database logging patient profiles, prediction dates, selected models, risk classifications, and input values.
*   **PDF Report Generation**: Instant, client-side print-ready downloads containing patient profiles, AI insights, recommendations, and clinician signature blocks.

---

## 🧠 Machine Learning Engine & Pipeline

The model utilizes the clinical **Wisconsin Breast Cancer Diagnostic Dataset** (569 instances: 357 benign, 212 malignant) and evaluates three different classification models preprocessed with standard scaling:

1.  **Support Vector Machine (SVM)** (Default classification engine)
2.  **Logistic Regression (LR)** (Utilized as the baseline for XAI local attributions)
3.  **Random Forest (RF)** (Aggregates decision trees to resist dataset noise)

### 📊 Validation Benchmarks (Test Split Evaluation)

| Diagnostic Mode | Support Vector Machine (SVM) | Logistic Regression (LR) | Random Forest (RF) |
| :--- | :--- | :--- | :--- |
| **Clinical Mode (30 Features)** | **98.25% Accuracy** | 97.37% Accuracy | 96.49% Accuracy |
| **Quick Mode (10 Features)** | **97.37% Accuracy** | 93.86% Accuracy | 95.61% Accuracy |

*Note: Models were trained dropping the `id` column to prevent data leakage and ensure standard clinical validity.*

---

## 🛠️ Installation & Execution Guide

### Prerequisite Checks
Ensure you have **Python 3.10+** and **Node.js v18+** installed.

### 1. Set Up and Launch Backend
```bash
# Clone the repository
git clone https://github.com/Afsar426/Breast-Cancer-Detection.git
cd Breast-Cancer-Detection

# Install backend dependencies
pip install -r requirements.txt

# Run model retraining pipeline (optional - outputs updated model pickles and metrics)
python backend/train.py

# Launch FastAPI application server
cd backend
python main.py
```
*The FastAPI server will start on `http://127.0.0.1:8000`.*

### 2. Set Up and Launch Frontend
```bash
# In a new terminal window, enter the frontend directory
cd Breast-Cancer-Detection/frontend

# Install dependencies
npm install

# Start Vite React development server
npm run dev
```
*The Vite development portal will open on `http://localhost:5173/`.*

---

## 🔌 API Reference Endpoints

Developers can query the FastAPI microservice directly to integrate diagnostics into hospital EHR portals:

*   `POST /api/predict`: Runs cancer prediction inference.
    *   **Body**: `{ "patient_name": "ID-90", "features": [...], "model_used": "svm", "mode": "quick" }`
*   `GET /api/analytics`: Returns model accuracy logs, confusion matrices, and ROC curves.
*   `GET /api/feature-importance`: Exposes global Gini and coefficient feature importances.
*   `GET /api/history` / `POST /api/history` / `DELETE /api/history/{id}`: Manages database patient logs.

---

## ⚖️ License & Clinical Disclaimer

MammoSense AI is designed exclusively as an educational demonstration of Artificial Intelligence capabilities in healthcare decision-support. All classification predictions, risk scores, and clinical recommendations generated by the models are based on statistical training data and must **not** be used for clinical triage, medical diagnosis, or treatment planning. All medical assessments must be performed by qualified clinicians in clinical settings.
