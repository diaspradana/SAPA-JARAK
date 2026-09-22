import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileEdit, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FileSpreadsheet, 
  CheckCircle2, 
  Building2,
  Clock,
  Send
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';

export default function HeroSection() {
  const { setCurrentView, setActiveTicketNumber, applications, showToast } = useApp();
  const [quickTicketInput, setQuickTicketInput] = useState('');

  const handleQuickTrack = (e) => {
    e.preventDefault();
    const clean = quickTicketInput.trim().toUpperCase().replace('#', '');
    if (!clean) {
      showToast('Masukkan nomor tiket permohonan', 'error');
      return;
    }
    const found = applications.find(a => a.ticketNumber.toUpperCase() === clean);
    if (found) {
      setActiveTicketNumber(found.ticketNumber);
      setCurrentView('lacak');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(`Nomor tiket #${clean} tidak terdaftar.`, 'error');
    }
  };

  const completedCount = applications.filter(a => a.status === 'COMPLETED').length;
  const inProgressCount = applications.filter(a => !['COMPLETED', 'REJECTED'].includes(a.status)).length;

  return (
    <section className="relative overflow-hidden pt-8 pb-12 border-b border-border/80 bg-linear-to-b from-primary/5 via-background to-background">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Notice Bar Pill */}
        <div className="flex items-center justify-center sm:justify-start mb-6">
          <Badge variant="outline" className="px-3 py-1 gap-2 text-xs font-semibold bg-background/80 backdrop-blur-xs border-border shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground">Sistem Satu Pintu Bantuan Sosial</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground hidden sm:inline">Desa Jarak, Plosoklaten</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                Layanan Aspirasi Bantuan <br />
                <span className="text-primary dark:text-emerald-400">RTLH & Disabilitas</span> Berkeadilan
              </h1>
              
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl font-medium">
                Portal resmi terpadu Pemerintah Desa Jarak untuk pengajuan rehabilitasi rumah tidak layak huni dan alat bantu disabilitas berbasis verifikasi faktual berjenjang 3 tingkat.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="lg"
                onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="gap-2 font-bold shadow-sm"
              >
                <FileEdit size={16} />
                <span>Ajukan Permohonan Bantuan</span>
                <ArrowRight size={15} />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="gap-2 font-bold border-border shadow-2xs"
              >
                <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Buka Open Ledger APBDes</span>
              </Button>
            </div>

            {/* 3 Core Principles Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Verifikasi Faktual</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Survei langsung Kasun wilayah ke lokasi rumah.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Send size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Notifikasi WA</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Kabar status otomatis dikirim ke nomor warga.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Audit Terbuka</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Setiap rupiah APBDes dapat dipantau publik.</p>
              </div>
            </div>

          </div>

          {/* Right Hero Card: Quick Ticket Tracker */}
          <div className="lg:col-span-5">
            <Card className="border-border/80 shadow-lg bg-card/95 backdrop-blur-xs">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                    Pelacakan Instan
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">Buku Register Desa</span>
                </div>
                <CardTitle className="text-base font-bold text-foreground pt-1">
                  Lacak Berkas Permohonan
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Masukkan nomor register tiket untuk memantau tahapan survei Kasun dan penetapan SK Desa.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <form onSubmit={handleQuickTrack} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Contoh: JRK-2026-001"
                      value={quickTicketInput}
                      onChange={(e) => setQuickTicketInput(e.target.value)}
                      className="font-mono text-xs uppercase"
                    />
                    <Button type="submit" size="default" className="font-bold gap-1 px-4 shrink-0">
                      <Search size={14} />
                      <span>Cari</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Format kode: <span className="font-mono font-semibold">JRK-2026-XXX</span> (diberikan saat pengajuan)
                  </p>
                </form>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60">
                  <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Dalam Proses
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black font-mono text-foreground">{inProgressCount}</span>
                      <span className="text-[10px] text-muted-foreground">berkas</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                      Terealisasi (BAST)
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">{completedCount}</span>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">penerima</span>
                    </div>
                  </div>
                </div>

                {/* Demo Quick Sample */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border border-border/40">
                  <span>Contoh Tiket Demo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickTicketInput('JRK-2026-001');
                      setActiveTicketNumber('JRK-2026-001');
                      setCurrentView('lacak');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-mono font-bold text-primary hover:underline"
                  >
                    #JRK-2026-001 ➔
                  </button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
}
