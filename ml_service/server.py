"""
SAPA-JARAK AI Assistant & Decision Support Service (FastAPI)
CPMK 5: Deployment Model (API Mini FastAPI) & Integrasi ke UI SAPA-JARAK
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib

app = FastAPI(
    title="SAPA-JARAK ML Decision Support Service",
    description="Microservice inferensi cerdas asisten rekomendasi bantuan sosial Desa Jarak",
    version="1.0.0"
)

# Enable CORS for local and Docker network cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_bansos_best.pkl")
model = None

def get_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            from train import train_and_export_model
            print("Model artifact not found. Training model now...")
            train_and_export_model()
        model = joblib.load(MODEL_PATH)
    return model

@app.on_event("startup")
def startup_event():
    try:
        get_model()
        print("SAPA-JARAK ML Model loaded successfully into memory.")
    except Exception as e:
        print(f"Warning: Could not preload model on startup: {e}")

class CitizenFeatures(BaseModel):
    tanggungan_keluarga: int = Field(default=3, ge=1, le=15, description="Jumlah tanggungan dalam KK")
    usia_kepala_keluarga: int = Field(default=54, ge=18, le=110, description="Usia kepala keluarga")
    ada_disabilitas_lansia: int = Field(default=1, ge=0, le=1, description="Ada anggota disabilitas / lansia (0 atau 1)")
    desil_dtks: int = Field(default=1, ge=1, le=4, description="Desil kemiskinan DTKS (1-4)")
    daya_listrik_va: int = Field(default=450, description="Daya listrik PLN (450, 900, 1300)")
    pendapatan_bulanan: float = Field(default=650000.0, ge=0, description="Estimasi pendapatan keluarga per bulan (Rp)")
    kondisi_dinding: str = Field(default="gedek", description="gedek | setengah_bata | layak")
    kondisi_lantai: str = Field(default="tanah", description="tanah | semen_pecah | keramik")
    kondisi_atap: str = Field(default="rapuh_bocor", description="rapuh_bocor | reng_rusak | kokoh")
    sanitasi_mck: str = Field(default="tidak_ada", description="tidak_ada | numpang | mandiri")
    status_tanah: str = Field(default="milik_sendiri", description="milik_sendiri | menumpang | sengketa")

@app.get("/")
def root():
    return {
        "service": "SAPA-JARAK ML Decision Support Assistant",
        "version": "1.0.0",
        "status": "online",
        "model_loaded": model is not None or os.path.exists(MODEL_PATH),
        "cpmk_reference": "CPMK 5: Deployment Model & Non-Intrusive Sidecar Architecture",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_ready": os.path.exists(MODEL_PATH) or model is not None,
        "engine": "FastAPI + scikit-learn (RandomForest)"
    }

@app.get("/features")
def feature_schema():
    return {
        "features": {
            "tanggungan_keluarga": {"type": "integer", "range": [1, 15]},
            "usia_kepala_keluarga": {"type": "integer", "range": [18, 110]},
            "ada_disabilitas_lansia": {"type": "binary", "options": [0, 1]},
            "desil_dtks": {"type": "ordinal", "options": [1, 2, 3, 4]},
            "daya_listrik_va": {"type": "categorical", "options": [450, 900, 1300]},
            "pendapatan_bulanan": {"type": "numeric", "unit": "IDR"},
            "kondisi_dinding": {"type": "categorical", "options": ["gedek", "setengah_bata", "layak"]},
            "kondisi_lantai": {"type": "categorical", "options": ["tanah", "semen_pecah", "keramik"]},
            "kondisi_atap": {"type": "categorical", "options": ["rapuh_bocor", "reng_rusak", "kokoh"]},
            "sanitasi_mck": {"type": "categorical", "options": ["tidak_ada", "numpang", "mandiri"]},
            "status_tanah": {"type": "categorical", "options": ["milik_sendiri", "menumpang", "sengketa"]},
        },
        "target_classes": ["PRIORITAS_TINGGI", "PRIORITAS_SEDANG", "TIDAK_LAYAK"]
    }

@app.post("/predict")
def predict_eligibility(features: CitizenFeatures):
    try:
        active_model = get_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat model machine learning: {str(e)}")

    payload_dict = features.model_dump()
    data = pd.DataFrame([payload_dict])
    
    prediction = active_model.predict(data)[0]
    
    # Calculate probabilities for all classes
    probabilities = {}
    confidence = 0.0
    if hasattr(active_model, "predict_proba"):
        probs = active_model.predict_proba(data)[0]
        classes = active_model.classes_
        for cls_name, prob in zip(classes, probs):
            prob_percent = round(float(prob) * 100, 1)
            probabilities[cls_name] = prob_percent
            if cls_name == prediction:
                confidence = prob_percent
    else:
        confidence = 90.0
        probabilities[prediction] = 90.0

    # Human-readable reasoning breakdown for Kasun
    reasons: List[str] = []
    if features.kondisi_dinding == "gedek":
        reasons.append("Material dinding anyaman bambu/gedek (urgensi fisik tinggi)")
    if features.sanitasi_mck == "tidak_ada":
        reasons.append("Tidak memiliki fasilitas MCK / jamban mandiri")
    if features.kondisi_atap == "rapuh_bocor":
        reasons.append("Kerangka atap rapuh dan mengalami kebocoran")
    if features.desil_dtks == 1:
        reasons.append("Terdaftar dalam DTKS Desil 1 (Kemiskinan Ekstrem)")
    if features.ada_disabilitas_lansia == 1:
        reasons.append("Terdapat anggota keluarga disabilitas / lansia terlantar")
    if features.kondisi_lantai == "tanah":
        reasons.append("Lantai rumah masih beralaskan tanah")

    if not reasons:
        reasons.append("Kondisi bangunan dan profil keluarga dalam batas wajar")

    recommendation_map = {
        "PRIORITAS_TINGGI": "Sangat Layak & Memenuhi Kriteria Prioritas Bantuan Desa Jarak",
        "PRIORITAS_SEDANG": "Layak Dipertimbangkan dalam Musyawarah Desa (Musdes)",
        "TIDAK_LAYAK": "Belum Memenuhi Ambang Batas Prioritas Bantuan (Perlu Evaluasi Manual)"
    }

    return {
        "status": "success",
        "predicted_class": prediction,
        "confidence": confidence,
        "probabilities": probabilities,
        "recommendation_text": recommendation_map.get(prediction, "Perlu Evaluasi Lanjutan Kasun"),
        "reasons": reasons,
        "model_version": "RF-v1.0-DesaJarak",
        "cpmk_reference": "CPMK 5: Deployment Model (FastAPI Sidecar)"
    }
