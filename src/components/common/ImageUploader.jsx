import React, { useState, useRef } from 'react';
import { Camera, X, Shield } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function ImageUploader({
  photos = [],
  onChange,
  photoFiles = [],
  onPhotoFilesChange,
  maxPhotos = 4,
  label = "Dokumentasi Foto Faktual Lapangan",
  helperText = "Lampirkan foto kondisi fisik rumah atau kondisi warga."
}) {
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const availableSlots = Math.max(0, maxPhotos - photos.length);
    const validFiles = files
      .filter(file => ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE_MB * 1024 * 1024)
      .slice(0, availableSlots);

    if (validFiles.length !== files.length) {
      setUploadError(`Foto harus JPG, PNG, atau WEBP dan maksimal ${MAX_FILE_SIZE_MB} MB (paling banyak ${maxPhotos} foto). Foto yang tidak sesuai tidak ditambahkan.`);
    } else {
      setUploadError('');
    }
    if (!validFiles.length) return;

    const newUrls = validFiles.map(file => URL.createObjectURL(file));
    if (onChange) onChange([...photos, ...newUrls].slice(0, maxPhotos));
    if (onPhotoFilesChange) onPhotoFilesChange([...photoFiles, ...validFiles].slice(0, maxPhotos));
  };

  const handleRemovePhoto = (index) => {
    const updated = photos.filter((_, idx) => idx !== index);
    if (onChange) onChange(updated);
    if (onPhotoFilesChange) onPhotoFilesChange(photoFiles.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="block text-xs font-bold text-foreground">{label}</label>
          <p className="text-[11px] text-muted-foreground">
            {helperText} JPG/PNG/WEBP, maks. {MAX_FILE_SIZE_MB} MB per foto.
          </p>
        </div>

        {/* Face blurring always runs server-side (ml_service/face_blur.py) before a photo is shown publicly */}
        <span
          className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800"
          title="Sesuai PRD Pasal 18: wajah pada foto otomatis disensor sebelum ditampilkan ke publik"
        >
          <Shield size={12} className="text-emerald-700 dark:text-emerald-400" />
          <span>Wajah disensor otomatis</span>
        </span>
      </div>
      {uploadError && <p role="alert" className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">{uploadError}</p>}

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-neutral-400 hover:border-primary-700 bg-neutral-50 hover:bg-neutral-100/70 rounded-lg p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-9 h-9 rounded-md bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center">
          <Camera size={18} />
        </div>

        <div>
          <span className="font-bold text-neutral-900 block text-xs">
            Klik untuk Memilih Berkas Foto Lapangan
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

              <div className="absolute top-1 left-1 bg-neutral-950/80 text-emerald-300 text-[9px] font-semibold px-1 rounded flex items-center gap-0.5">
                <Shield size={9} />
                Disensor saat dikirim
              </div>

              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                aria-label={`Hapus lampiran ${idx + 1}`}
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
