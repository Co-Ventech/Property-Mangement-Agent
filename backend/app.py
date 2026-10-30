import streamlit as st
from backend.triage import triage, save

st.title("RE-01 Maintenance Triage")
st.caption("Free Gemini tier sends request text to Google. Do not enter sensitive data unless approved.")
txt = st.text_area("Tenant request")
if st.button("Triage") and txt:
    st.session_state.r = triage(txt)
if r := st.session_state.get("r"):
    st.json(r)
    if st.button("Approve & save"):
        r["status"] = "approved"; save(r); st.success("Saved"); del st.session_state.r

