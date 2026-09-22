import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Search, ArrowRight, ShieldCheck, Ticket, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
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
      setErrorMsg('Masukkan nomor tiket pengajuan.');
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
      setErrorMsg(`Nomor tiket #${cleanTicket} tidak ditemukan dalam basis data.`);
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
    <section id="tracking-section" className="py-14 sm:py-20 bg-primary/95 text-primary-foreground border-b border-border/80 overflow-hidden relative">
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10" data-aos="zoom-in-up" data-aos-duration="700">
        
        <div className="space-y-2.5">
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-primary-foreground/10 border-primary-foreground/20 text-emerald-300">
            Layanan Pelacakan Terbuka
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Lacak Status Permohonan Bantuan
          </h2>
          <p className="text-xs sm:text-sm text-primary-foreground/80 max-w-xl mx-auto leading-relaxed">
            Masukkan nomor tiket register untuk melihat riwayat survei kasun, validasi desa, dan dokumentasi penyelesaian.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-background/10 backdrop-blur-md p-2 rounded-xl border border-primary-foreground/20 shadow-xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search size={16} />
              </div>
              <Input
                type="text"
                value={inputTicket}
                onChange={(e) => { setInputTicket(e.target.value); setErrorMsg(''); }}
                placeholder="Contoh: JRK-2026-001"
                className="pl-10 pr-3 h-10 bg-background text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-mono uppercase border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <Button
              type="submit"
              size="default"
              className="h-10 px-5 font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shrink-0"
            >
              <span>Lacak Berkas</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          {errorMsg && (
            <div className="mt-2.5 text-xs text-rose-200 bg-rose-950/80 border border-rose-800/80 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
              <AlertCircle size={14} className="text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* Quick Ticket Presets */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-primary-foreground/70 text-[11px] font-medium">Sampel Tiket Aktif:</span>
          {applications.slice(0, 4).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleQuickSelect(app.ticketNumber)}
              className="px-2.5 py-1 rounded-md bg-background/10 hover:bg-background/20 text-emerald-300 font-mono text-[11px] font-bold border border-primary-foreground/15 transition-colors"
            >
              #{app.ticketNumber} ({app.beneficiaryName})
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
