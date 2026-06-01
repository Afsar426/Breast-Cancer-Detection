import streamlit as st
import pickle
import numpy as np

# Page Configuration
st.set_page_config(
    page_title="Breast Cancer Detection System",
    page_icon="🩺",
    layout="wide"
)

# Load Model and Scaler
try:
    model = pickle.load(open("model.pkl", "rb"))
    scaler = pickle.load(open("scaler.pkl", "rb"))
except Exception as e:
    st.error(f"Error loading model: {e}")
    st.stop()

# Header
st.title("🩺 AI-Powered Breast Cancer Detection System")
st.markdown("""
Predict whether a breast tumor is **Benign** or **Malignant**
using Machine Learning models trained on the
Wisconsin Breast Cancer Diagnostic Dataset.
""")

# Sidebar
st.sidebar.title("📋 Project Information")
st.sidebar.markdown("""
### Models Used
- Logistic Regression
- Random Forest
- Support Vector Machine (SVM)

### Model Accuracy
🏆 SVM: **98.25%**

Logistic Regression: **97.37%**

Random Forest: **96.49%**
""")

st.sidebar.markdown("---")
st.sidebar.markdown("Developed by **Afsar Azam**")

# Metrics
col1, col2, col3 = st.columns(3)

with col1:
    st.metric("Best Model", "SVM")

with col2:
    st.metric("Accuracy", "98.25%")

with col3:
    st.metric("Dataset", "Wisconsin")

st.markdown("---")

st.subheader("📊 Enter Tumor Characteristics")

col1, col2 = st.columns(2)

with col1:
    radius_mean = st.number_input("Radius Mean", value=0.0)
    texture_mean = st.number_input("Texture Mean", value=0.0)
    perimeter_mean = st.number_input("Perimeter Mean", value=0.0)
    area_mean = st.number_input("Area Mean", value=0.0)
    smoothness_mean = st.number_input("Smoothness Mean", value=0.0)

with col2:
    compactness_mean = st.number_input("Compactness Mean", value=0.0)
    concavity_mean = st.number_input("Concavity Mean", value=0.0)
    symmetry_mean = st.number_input("Symmetry Mean", value=0.0)
    fractal_dimension_mean = st.number_input("Fractal Dimension Mean", value=0.0)

# Prediction Button
if st.button("🔍 Predict Cancer Type"):

    try:
        input_data = np.array([[
            radius_mean,
            texture_mean,
            perimeter_mean,
            area_mean,
            smoothness_mean,
            compactness_mean,
            concavity_mean,
            symmetry_mean,
            fractal_dimension_mean
        ]])

        scaled_data = scaler.transform(input_data)

        prediction = model.predict(scaled_data)[0]

        confidence = 0

        if hasattr(model, "predict_proba"):
            confidence = np.max(model.predict_proba(scaled_data)) * 100

        st.markdown("---")
        st.subheader("📋 Prediction Result")

        if prediction == 1:
            st.success("✅ BENIGN (Non-Cancerous)")
        else:
            st.error("⚠️ MALIGNANT (Cancerous)")

        st.metric(
            label="Confidence Score",
            value=f"{confidence:.2f}%"
        )

        if prediction == 1:
            st.info("""
            Recommendation:
            The tumor appears to be benign.
            Consult a healthcare professional for proper diagnosis.
            """)
        else:
            st.warning("""
            Recommendation:
            The tumor appears malignant.
            Please seek immediate medical consultation.
            """)

    except Exception as e:
        st.error(f"Prediction Error: {e}")

st.markdown("---")

st.subheader("🧠 About This Project")

st.write("""
This Breast Cancer Detection System uses Machine Learning
algorithms to classify tumors as Benign or Malignant.

The project was developed using:

- Python
- Scikit-Learn
- Pandas
- NumPy
- Streamlit
- Machine Learning
- Healthcare Analytics

Models evaluated:

- Logistic Regression (97.37%)
- Random Forest (96.49%)
- Support Vector Machine (98.25%)

The Support Vector Machine (SVM) achieved the highest accuracy
and was selected as the final model.
""")

st.markdown("---")

st.markdown(
    "[🔗 GitHub Repository](https://github.com/Afsar426/Breast-Cancer-Detection)"
)

st.caption("© 2026 Afsar Azam | AI-Powered Healthcare Analytics")