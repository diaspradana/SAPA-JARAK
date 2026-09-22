import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool } from 'lucide-react';

export default function SignaturePad({ onSave, title = "Tanda Tangan Digital Penerima Manfaat", subtitle = "Bubuhkan tanda tangan pada kolom di bawah ini" }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F1412';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (hasDrawn && onSave) {
      const canvas = canvasRef.current;
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onSave) onSave(null);
  };

  return (
    <div className="border border-neutral-300 rounded-lg p-3.5 bg-white space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
            <PenTool size={13} className="text-primary-800" />
            {title}
          </h4>
          <p className="text-[11px] text-neutral-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-neutral-700 hover:text-rose-700 hover:bg-rose-50 rounded border border-neutral-300 transition"
        >
          <Eraser size={12} />
          Hapus Ulang
        </button>
      </div>

      <div className="relative border border-dashed border-neutral-400 rounded bg-neutral-50 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={450}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 sm:h-36 cursor-crosshair block bg-white"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-xs italic">
            Tanda tangan di sini (Sentuh / Mouse)
          </div>
        )}
      </div>
    </div>
  );
}
