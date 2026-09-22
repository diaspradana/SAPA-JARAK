import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';

export default function WhatsAppPreviewModal() {
  const { 
    activeWhatsAppModal, 
    setActiveWhatsAppModal, 
    setCurrentView, 
    setActiveTicketNumber 
  } = useApp();

  if (!activeWhatsAppModal) return null;

  const handleTrackDirect = () => {
    if (activeWhatsAppModal.ticketNumber) {
      setActiveTicketNumber(activeWhatsAppModal.ticketNumber);
      setCurrentView('lacak');
    }
    setActiveWhatsAppModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 text-xs">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#0b141a] text-white shadow-2xl border border-neutral-800">
        
        {/* WhatsApp Mobile Mockup Header */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              SJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-neutral-100">SAPA-JARAK Desa Jarak</span>
                <ShieldCheck size={13} className="text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-400 block font-medium">Akun Layanan Resmi</span>
            </div>
          </div>

          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setActiveWhatsAppModal(null)}
            className="h-7 w-7 text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X size={15} />
          </Button>
        </div>

        {/* Chat Body */}
        <div className="p-3.5 bg-[#0b141a] min-h-[220px] flex flex-col justify-end space-y-2.5 font-sans">
          <div className="self-center bg-[#182229] px-3 py-0.5 rounded text-[10px] text-[#ffd279] text-center max-w-[240px]">
            🔒 Pesan resmi sistem SAPA-JARAK Desa Jarak
          </div>

          <div className="self-start max-w-[92%] bg-[#202c33] rounded-lg rounded-tl-none p-3 shadow-md space-y-1.5 text-neutral-100">
            <span className="text-[10px] font-bold text-emerald-400 block">
              Pemerintah Desa Jarak
            </span>

            <p className="text-xs leading-relaxed whitespace-pre-line text-neutral-200 font-sans">
              {activeWhatsAppModal.message}
            </p>

            <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-400 pt-0.5">
              <span>{new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(activeWhatsAppModal.timestamp))}</span>
              <CheckCheck size={13} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-[#1f2c34] p-3 border-t border-neutral-800 flex items-center justify-between">
          {activeWhatsAppModal.ticketNumber ? (
            <Button
              onClick={handleTrackDirect}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 text-xs shadow-xs"
            >
              <span>Buka Pelacakan Tiket</span>
              <ExternalLink size={12} />
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setActiveWhatsAppModal(null)}
              className="w-full h-8 text-xs font-semibold"
            >
              Tutup
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
