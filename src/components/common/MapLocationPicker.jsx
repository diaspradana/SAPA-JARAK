import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { DUSUN_LIST } from '../../data/desaConfig';

export default function MapLocationPicker({ 
  coordinates = { lat: -7.9045, lng: 112.1894 }, 
  onChange, 
  readOnly = false,
  dusunId = "kalasan"
}) {
  const [currentCoords, setCurrentCoords] = useState(coordinates);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Perangkat tidak mendukung geolokasi.");
      return;
    }

    setIsLocating(true);
    setGpsStatus("Mengambil sinyal koordinat GPS...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy)
        };
        setCurrentCoords(newCoords);
        setIsLocating(false);
        setGpsStatus(`Akurasi GPS terverifikasi (±${newCoords.accuracy}m)`);
        if (onChange) onChange(newCoords);
      },
      (error) => {
        setIsLocating(false);
        const fallback = DUSUN_LIST.find(d => d.id === dusunId) || DUSUN_LIST[0];
        const newCoords = {
          lat: fallback.centerCoord[0],
          lng: fallback.centerCoord[1]
        };
        setCurrentCoords(newCoords);
        setGpsStatus("GPS izin ditolak. Menggunakan koordinat pusat dusun.");
        if (onChange) onChange(newCoords);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectDusunPreset = (dusun) => {
    const newCoords = {
      lat: dusun.centerCoord[0],
      lng: dusun.centerCoord[1]
    };
    setCurrentCoords(newCoords);
    setGpsStatus(`Koordinat diset ke pusat Dusun ${dusun.name}`);
    if (onChange) onChange(newCoords);
  };

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white">
      
      {/* Map visual card with coordinates */}
      <div className="relative h-44 sm:h-52 bg-neutral-100 p-3 flex flex-col justify-between border-b border-neutral-200">
        
        {/* Header over map */}
        <div className="flex items-center justify-between z-10">
          <span className="px-2.5 py-1 bg-white/95 rounded border border-neutral-300 text-[11px] font-bold text-neutral-800 shadow-xs">
            Wilayah Administrasi Desa Jarak (Kec. Plosoklaten)
          </span>

          {!readOnly && (
            <button
              type="button"
              onClick={handleGetDeviceLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-800 hover:bg-primary-900 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <Navigation size={12} className={isLocating ? "animate-spin" : ""} />
              {isLocating ? "Mencari GPS..." : "Ambil GPS Lapangan"}
            </button>
          )}
        </div>

        {/* Center Marker */}
        <div className="self-center flex flex-col items-center z-10">
          <div className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center border-2 border-white shadow">
            <MapPin size={16} className="text-amber-300" />
          </div>
          <span className="mt-1 px-2 py-0.5 rounded bg-neutral-950/85 text-white text-[10px] font-mono shadow-xs">
            {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
          </span>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between text-[11px] text-neutral-600 bg-white/90 px-2.5 py-1 rounded border border-neutral-200 z-10">
          <span>Kediri, Jawa Timur</span>
          <a
            href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-800 hover:underline font-bold inline-flex items-center gap-1"
          >
            Buka di Google Maps <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Coordinate Display Bar */}
      <div className="p-3 bg-neutral-50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-700">Geotag:</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-300 text-neutral-900 text-[11px]">
            Lat: <b>{currentCoords.lat}</b> | Lng: <b>{currentCoords.lng}</b>
          </span>
        </div>

        {gpsStatus && (
          <span className="text-[11px] text-primary-800 font-semibold">
            {gpsStatus}
          </span>
        )}
      </div>

      {/* Quick Hamlet Presets */}
      {!readOnly && (
        <div className="p-2.5 border-t border-neutral-200 bg-white flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide mr-1">
            Pilih Pusat Dusun:
          </span>
          {DUSUN_LIST.map((dusun) => (
            <button
              key={dusun.id}
              type="button"
              onClick={() => handleSelectDusunPreset(dusun)}
              className="px-2 py-0.5 rounded border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-[11px] font-medium transition"
            >
              {dusun.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
