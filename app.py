import streamlit as st

st.set_page_config(
    page_title="Breast Cancer Detection",
    page_icon="🩺"
)

st.title("🩺 Breast Cancer Detection System")

st.write(
    "Predict whether a tumor is Benign or Malignant using Machine Learning."
)

radius = st.number_input("Radius Mean")
texture = st.number_input("Texture Mean")
perimeter = st.number_input("Perimeter Mean")
area = st.number_input("Area Mean")

if st.button("Predict"):
    st.success("Connect this button to your FastAPI backend.")