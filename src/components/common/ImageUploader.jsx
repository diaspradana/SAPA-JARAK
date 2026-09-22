import React, { useState, useRef } from 'react';
import { Camera, X, Shield, Upload } from 'lucide-react';

export default function ImageUploader({ 
  photos = [], 
  onChange, 
  maxPhotos = 4,
  label = "Dokumentasi Foto Faktual Lapangan", 
  helperText = "Lampirkan foto kondisi fisik rumah atau kondisi warga. Format JPG/PNG (Maks. 5 MB)."
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [blurFaces, setBlurFaces] = useState(true);
  const fileInputRef = useRef(null);

  const samplePresets = [
    { label: "Dinding Bambu Gedek", url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80" },
    { label: "Rangka Atap Rapuh", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" },
    { label: "Warga Butuh Kursi Roda", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" },
    { label: "Dinding Bata Mentah", url: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80" }
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressing(true);
    setTimeout(() => {
      const newUrls = files.map(file => URL.createObjectURL(file));
      const updated = [...photos, ...newUrls].slice(0, maxPhotos);
      if (onChange) onChange(updated);
      setIsCompressing(false);
    }, 400);
  };

  const handleAddPreset = (url) => {
    if (photos.length >= maxPhotos) return;
    const updated = [...photos, url];
    if (onChange) onChange(updated);
  };

  const handleRemovePhoto = (index) => {
    const updated = photos.filter((_, idx) => idx !== index);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-900">{label}</label>
          <p className="text-[11px] text-neutral-500">{helperText}</p>
        </div>

        {/* Privacy Blur Toggle */}
        <button
          type="button"
          onClick={() => setBlurFaces(!blurFaces)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition ${
            blurFaces 
              ? "bg-emerald-50 text-emerald-950 border-emerald-300" 
              : "bg-neutral-100 text-neutral-600 border-neutral-300"
          }`}
          title="Sesuai PRD Pasal 18: Penyamaran wajah warga pada dokumentasi publik"
        >
          <Shield size={12} className={blurFaces ? "text-emerald-700" : ""} />
          <span>{blurFaces ? "Sensor Wajah ON" : "Sensor Wajah OFF"}</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-neutral-400 hover:border-primary-700 bg-neutral-50 hover:bg-neutral-100/70 rounded-lg p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-9 h-9 rounded-md bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center">
          <Camera size={18} />
        </div>

        <div>
          <span className="font-bold text-neutral-900 block text-xs">
            {isCompressing ? "Memproses Kompresi Gambar..." : "Klik untuk Memilih Berkas Foto Lapangan"}
          </span>
          <span className="text-[11px] text-neutral-500 block">
            {photos.length} dari {maxPhotos} foto terlampir
          </span>
        </div>
      </div>

      {/* Sample presets for quick testing */}
      <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200 text-neutral-600 space-y-1">
        <span className="font-bold text-neutral-800 text-[11px] block">
          Sampel Foto Faktual untuk Demo:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={photos.length >= maxPhotos || photos.includes(preset.url)}
              onClick={() => handleAddPreset(preset.url)}
              className="px-2 py-0.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded text-[10px] font-medium text-neutral-800 transition disabled:opacity-40"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {photos.map((url, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden border border-neutral-300 bg-neutral-950 aspect-video group">
              <img 
                src={url} 
                alt={`Lampiran ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />

              {blurFaces && (
                <div className="absolute top-1 left-1 bg-neutral-950/80 text-emerald-300 text-[9px] font-semibold px-1 rounded flex items-center gap-0.5">
                  <Shield size={9} />
                  Sensor
                </div>
              )}

              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded bg-rose-700 text-white flex items-center justify-center hover:bg-rose-800 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
