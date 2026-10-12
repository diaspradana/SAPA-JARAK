import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Search, ArrowRight, ShieldCheck, Ticket, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function TrackingSection() {
  const { applications, setCurrentView, setActiveTicketNumber, showToast } = useApp();
  const { speak } = useVoice();
  const [inputTicket, setInputTicket] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanTicket = inputTicket.trim().toUpperCase().replace('#', '');
    if (!cleanTicket) {
      setErrorMsg('Silakan ketik nomor tiket pengajuan Anda');
      speak('Silakan masukkan nomor tiket pengajuan Anda.');
      return;
    }

    const found = applications.find(a => 
      a.ticketNumber.toUpperCase() === cleanTicket ||
      a.ticketNumber.toUpperCase().includes(cleanTicket)
    );

    if (found) {
      setErrorMsg('');
      setActiveTicketNumber(found.ticketNumber);
      speak(`Membuka status pengajuan nomor tiket ${found.ticketNumber}`);
      setCurrentView('lacak');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg(`Nomor tiket #${cleanTicket} tidak ditemukan dalam daftar.`);
      speak('Nomor tiket tidak ditemukan.');
    }
  };

  const handleQuickSelect = (ticket) => {
    setInputTicket(ticket);
    setActiveTicketNumber(ticket);
    setCurrentView('lacak');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="tracking-section" className="py-16 sm:py-24 bg-gradient-to-br from-emerald-900 via-emerald-950 to-neutral-950 text-white border-b border-border overflow-hidden relative">
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
        
        <div className="space-y-3">
          <span className="inline-block px-4 py-1 font-bold text-xs sm:text-sm rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            🔍 Layanan Pelacakan Terbuka
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cek Status Pengajuan Bantuan Anda
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Ketik nomor tiket pendaftaran untuk memantau apakah berkas Anda sedang disurvei oleh Kepala Dusun, menunggu penetapan, atau sudah siap diserahkan.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto pt-2">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-300">
                <Search size={20} />
              </div>
              <Input
                type="text"
                value={inputTicket}
                onChange={(e) => { setInputTicket(e.target.value); setErrorMsg(''); }}
                placeholder="Ketik Nomor Tiket (Contoh: JRK-2026-001)"
                className="pl-12 pr-4 h-12 bg-white text-neutral-900 placeholder:text-neutral-500 text-sm sm:text-base font-mono uppercase rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              size="default"
              className="h-12 px-6 text-sm sm:text-base font-bold gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl shadow-lg shrink-0 transition-transform active:scale-95"
            >
              <span>Lacak Berkas</span>
              <ArrowRight size={18} />
            </Button>
          </div>

          {errorMsg && (
            <div className="mt-3 text-sm text-rose-200 bg-rose-950/90 border border-rose-700/80 px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-sm animate-in fade-in-0">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* Quick Ticket Presets */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="text-emerald-200/80 font-semibold">Coba Tiket Contoh:</span>
          {applications.slice(0, 4).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleQuickSelect(app.ticketNumber)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-mono text-xs font-bold border border-white/20 transition-all hover:scale-105"
            >
              #{app.ticketNumber} ({app.beneficiaryName})
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
