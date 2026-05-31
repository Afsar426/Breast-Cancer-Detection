from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
import pickle

# Create FastAPI App
app = FastAPI(
    title="MammoSense AI API",
    description="Breast Cancer Detection using Machine Learning",
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

# Load Model and Scaler
try:
    model = pickle.load(open("model.pkl", "rb"))
    scaler = pickle.load(open("scaler.pkl", "rb"))
    print("✅ Model and Scaler Loaded Successfully")
except Exception as e:
    print(f"❌ Error Loading Files: {e}")

# Input Schema
class PatientData(BaseModel):
    features: list[float]

# Home Route
@app.get("/")
def home():
    return {
        "message": "MammoSense AI API Running Successfully"
    }

# Health Check Route
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "Loaded"
    }

# Prediction Route
@app.post("/predict")
def predict(data: PatientData):

    try:

        # Validate Feature Count
        if len(data.features) != 31:
            return {
                "success": False,
                "error": f"Expected 31 features but received {len(data.features)}"
            }

        # Convert to NumPy Array
        input_data = np.array(data.features).reshape(1, -1)

        # Scale Data
        scaled_data = scaler.transform(input_data)

        # Prediction
        prediction = model.predict(scaled_data)[0]

        # Probability
        probabilities = model.predict_proba(scaled_data)[0]

        confidence = round(
            float(max(probabilities)) * 100,
            2
        )

        # Result
        result = (
            "Cancer Detected"
            if prediction == 1
            else "No Cancer Detected"
        )

        return {
            "success": True,
            "prediction": result,
            "confidence": confidence
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

# Run
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )