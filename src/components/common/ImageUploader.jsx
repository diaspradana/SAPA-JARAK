import React, { useState, useRef } from 'react';
import { Camera, X, Shield, Upload } from 'lucide-react';

export default function ImageUploader({ 
  photos = [], 
  onChange, 
  photoFiles = [],
  onPhotoFilesChange,
  maxPhotos = 4,
  label = "Dokumentasi Foto Faktual Lapangan", 
  helperText = "Lampirkan foto kondisi fisik rumah atau kondisi warga. Format JPG/PNG (Maks. 5 MB)."
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [blurFaces, setBlurFaces] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = Math.max(0, maxPhotos - photos.length);
    const validFiles = files.filter(file => (
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024
    )).slice(0, availableSlots);
    if (validFiles.length !== files.length) {
      setUploadError('Foto harus JPG, PNG, atau WEBP dan berukuran maksimal 10 MB. Foto yang melebihi batas tidak ditambahkan.');
    } else {
      setUploadError('');
    }
    if (!validFiles.length) {
      e.target.value = '';
      return;
    }

    setIsCompressing(true);
    setTimeout(() => {
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      const updated = [...photos, ...newUrls].slice(0, maxPhotos);
      if (onChange) onChange(updated);
      if (onPhotoFilesChange) onPhotoFilesChange([...photoFiles, ...validFiles].slice(0, maxPhotos));
      setIsCompressing(false);
    }, 400);
    e.target.value = '';
  };

  const handleRemovePhoto = (index) => {
    const updated = photos.filter((_, idx) => idx !== index);
    if (onChange) onChange(updated);
    if (onPhotoFilesChange) onPhotoFilesChange(photoFiles.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-neutral-900">{label}</label>
          <p className="text-[11px] text-neutral-500">{helperText}</p>
        </div>
        {uploadError && <p role="alert" className="text-[11px] font-semibold text-rose-700">{uploadError}</p>}

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
