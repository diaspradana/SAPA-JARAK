"""
SAPA-JARAK Machine Learning Training Script
CPMK 1 - 4: Data Synthesis, Preprocessing, Modeling, & Pipeline Export
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

def generate_synthetic_dataset(num_samples: int = 1200, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    tanggungan = np.random.randint(1, 9, size=num_samples)
    usia = np.random.randint(22, 85, size=num_samples)
    disabilitas = np.random.choice([0, 1], p=[0.75, 0.25], size=num_samples)
    desil = np.random.choice([1, 2, 3, 4], p=[0.35, 0.35, 0.20, 0.10], size=num_samples)
    daya_listrik = np.random.choice([450, 900, 1300], p=[0.55, 0.35, 0.10], size=num_samples)
    
    # Pendapatan inversely correlated with desil
    pendapatan = []
    for d in desil:
        if d == 1:
            p = np.random.randint(300_000, 950_000)
        elif d == 2:
            p = np.random.randint(700_000, 1_400_000)
        elif d == 3:
            p = np.random.randint(1_200_000, 2_200_000)
        else:
            p = np.random.randint(1_800_000, 3_500_000)
        pendapatan.append(p)
    pendapatan = np.array(pendapatan, dtype=float)
    
    dinding = np.random.choice(['gedek', 'setengah_bata', 'layak'], p=[0.40, 0.35, 0.25], size=num_samples)
    lantai = np.random.choice(['tanah', 'semen_pecah', 'keramik'], p=[0.40, 0.35, 0.25], size=num_samples)
    atap = np.random.choice(['rapuh_bocor', 'reng_rusak', 'kokoh'], p=[0.40, 0.35, 0.25], size=num_samples)
    sanitasi = np.random.choice(['tidak_ada', 'numpang', 'mandiri'], p=[0.40, 0.30, 0.30], size=num_samples)
    tanah = np.random.choice(['milik_sendiri', 'menumpang', 'sengketa'], p=[0.70, 0.25, 0.05], size=num_samples)
    
    # Calculate eligibility score based on Desa Jarak RTLH & Economic parameters
    labels = []
    for i in range(num_samples):
        score = 0
        if dinding[i] == 'gedek': score += 25
        elif dinding[i] == 'setengah_bata': score += 12
        
        if lantai[i] == 'tanah': score += 25
        elif lantai[i] == 'semen_pecah': score += 12
        
        if atap[i] == 'rapuh_bocor': score += 25
        elif atap[i] == 'reng_rusak': score += 12
        
        if sanitasi[i] == 'tidak_ada': score += 25
        elif sanitasi[i] == 'numpang': score += 12
        
        if desil[i] == 1: score += 20
        elif desil[i] == 2: score += 10
        
        if disabilitas[i] == 1: score += 15
        if daya_listrik[i] == 450: score += 8
        if pendapatan[i] < 900_000: score += 10
        if tanggungan[i] >= 4: score += 8
        
        # Add slight realistic noise (+- 5)
        score += np.random.randint(-5, 6)
        
        if score >= 85:
            labels.append('PRIORITAS_TINGGI')
        elif score >= 50:
            labels.append('PRIORITAS_SEDANG')
        else:
            labels.append('TIDAK_LAYAK')
            
    df = pd.DataFrame({
        'tanggungan_keluarga': tanggungan,
        'usia_kepala_keluarga': usia,
        'ada_disabilitas_lansia': disabilitas,
        'desil_dtks': desil,
        'daya_listrik_va': daya_listrik,
        'pendapatan_bulanan': pendapatan,
        'kondisi_dinding': dinding,
        'kondisi_lantai': lantai,
        'kondisi_atap': atap,
        'sanitasi_mck': sanitasi,
        'status_tanah': tanah,
        'status_kelayakan': labels
    })
    return df

def train_and_export_model():
    print("[1/4] Generating Desa Jarak socio-economic & RTLH dataset...")
    df = generate_synthetic_dataset()
    
    csv_path = os.path.join(os.path.dirname(__file__), "dataset_bansos_jarak.csv")
    df.to_csv(csv_path, index=False)
    print(f"      Saved dataset ({len(df)} rows) to: {csv_path}")
    
    X = df.drop(columns=['status_kelayakan'])
    y = df['status_kelayakan']
    
    numeric_features = ['tanggungan_keluarga', 'usia_kepala_keluarga', 'pendapatan_bulanan']
    categorical_features = ['desil_dtks', 'daya_listrik_va', 'ada_disabilitas_lansia', 'kondisi_dinding', 'kondisi_lantai', 'kondisi_atap', 'sanitasi_mck', 'status_tanah']
    
    print("[2/4] Building preprocessing & model pipeline...")
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("[3/4] Training Random Forest Classifier (CPMK 3 benchmark)...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"      Model Accuracy on Test Set: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred))
    
    print("[4/4] Exporting model artifact...")
    model_path = os.path.join(os.path.dirname(__file__), "model_bansos_best.pkl")
    joblib.dump(pipeline, model_path)
    print(f"      Saved model to: {model_path}")
    print("Done! SAPA-JARAK AI Assistant model is ready.")

if __name__ == "__main__":
    train_and_export_model()
