"""
SAPA-JARAK AI Assistant, Decision Support & Privacy AI Service (FastAPI)
CPMK 5: Deployment Model & Non-Intrusive Sidecar Architecture
PRD Section 18: Privacy AI Face Detection & Automatic Blurring
Optimized for 1 vCPU VPS (Latency < 35ms, RAM < 40MB)
"""

import os
import io
import time
import base64
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import 1-vCPU optimized face blur engine
from face_blur import (
    detect_face_bounding_boxes,
    apply_face_blur,
    process_image_bytes,
)

app = FastAPI(
    title="SAPA-JARAK AI & Privacy Microservice",
    description=(
        "Microservice terpadu asisten rekomendasi bansos (RandomForest) "
        "dan Privacy AI pengaburan wajah dokumentasi warga (OpenCV Haar Cascades)."
    ),
    version="1.1.0"
)

# Enable CORS for local, Docker, and frontend clients
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
        "service": "SAPA-JARAK AI Assistant & Privacy AI Engine",
        "version": "1.1.0",
        "status": "online",
        "capabilities": [
            "Decision Support System (RandomForest Classifier)",
            "Privacy AI: 1-vCPU Face Blurring Engine (OpenCV Haar Cascades)"
        ],
        "vps_profile": "1 vCPU / 1-2GB RAM Optimized",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_ready": os.path.exists(MODEL_PATH) or model is not None,
        "cv_engine_ready": True,
        "engines": {
            "tabular_ml": "FastAPI + scikit-learn (RandomForest)",
            "computer_vision": "OpenCV Headless Haar Cascades (1-vCPU tuned)"
        }
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

# ==============================================================================
# PRIVACY AI: Face Blurring & Face Detection Endpoints (PRD Section 18)
# ==============================================================================

MAX_UPLOAD_SIZE = 15 * 1024 * 1024  # 15 MB limit to protect memory on 1 vCPU VPS

@app.post("/blur-face", summary="Pengaburan Wajah Otomatis (Face Blurring)")
async def blur_face_endpoint(
    file: UploadFile = File(..., description="Berkas gambar (JPEG, PNG, WebP)"),
    blur_strength: int = Query(51, ge=11, le=151, description="Kekuatan kernel Gaussian blur (angka ganjil)"),
    padding: float = Query(0.15, ge=0.0, le=0.5, description="Margin padding di sekeliling wajah (0.0 - 0.5)"),
    return_format: str = Query("image", regex="^(image|json)$", description="'image' untuk binary JPEG stream, 'json' untuk base64 + metadata")
):
    """
    Mendeteksi wajah pada foto dokumentasi warga dan melakukan pengaburan (blur)
    secara otomatis untuk mematuhi PRD Seksi 18 dan prinsip privasi UU PDP.
    
    Dirancang khusus untuk VPS 1 vCPU:
    - Downscaled detection pass (< 35ms)
    - Alokasi memori rendah (< 40MB)
    - Full-resolution blended output
    """
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Ukuran berkas melebihi batas maksimal 15MB.")

    try:
        output_bytes, boxes, elapsed_ms, mime_type = process_image_bytes(
            contents,
            blur_strength=blur_strength,
            padding=padding
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses gambar: {str(e)}")

    if return_format == "image":
        return Response(
            content=output_bytes,
            media_type=mime_type,
            headers={
                "X-Faces-Detected": str(len(boxes)),
                "X-Processing-Time-Ms": str(elapsed_ms),
                "Cache-Control": "no-cache",
            }
        )

    # JSON response with base64 data URL
    b64_str = base64.b64encode(output_bytes).decode("utf-8")
    return {
        "status": "success",
        "faces_detected": len(boxes),
        "processing_time_ms": elapsed_ms,
        "boxes": boxes,
        "mime_type": mime_type,
        "blurred_image_base64": f"data:{mime_type};base64,{b64_str}"
    }

@app.post("/detect-faces", summary="Deteksi Koordinat Wajah (Bounding Boxes)")
async def detect_faces_endpoint(
    file: UploadFile = File(..., description="Berkas gambar (JPEG, PNG, WebP)"),
    padding: float = Query(0.15, ge=0.0, le=0.5, description="Margin padding di sekeliling wajah")
):
    """
    Mengembalikan koordinat kotak pembatas (bounding boxes) wajah tanpa memodifikasi gambar.
    """
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Ukuran berkas melebihi batas maksimal 15MB.")

    import cv2
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Format berkas gambar tidak valid atau korup.")

    h, w = image.shape[:2]
    boxes, elapsed_ms = detect_face_bounding_boxes(image, padding=padding)

    return {
        "status": "success",
        "faces_detected": len(boxes),
        "processing_time_ms": elapsed_ms,
        "image_dimensions": {"width": w, "height": h},
        "boxes": boxes
    }
