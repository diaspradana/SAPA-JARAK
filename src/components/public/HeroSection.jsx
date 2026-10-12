import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileEdit, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCircle2, 
  Building2,
  Clock,
  Send,
  HeartHandshake,
  Sparkles,
  Users,
  Home
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
      showToast('Ketik nomor tiket pengajuan Anda', 'warning');
      return;
    }
    const found = applications.find(a => a.ticketNumber.toUpperCase() === clean);
    if (found) {
      setActiveTicketNumber(found.ticketNumber);
      setCurrentView('lacak');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(`Nomor tiket #${clean} tidak ditemukan. Periksa kembali kodenya.`, 'error');
    }
  };

  const completedCount = applications.filter(a => a.status === 'COMPLETED').length;
  const inProgressCount = applications.filter(a => !['COMPLETED', 'REJECTED'].includes(a.status)).length;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 border-b border-border bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-background transition-colors">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Notice Bar Pill */}
        <div className="flex items-center justify-center sm:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-background border border-emerald-600/30 text-emerald-900 dark:text-emerald-300 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Portal Resmi Pelayanan Bantuan Sosial Desa Jarak</span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground hidden sm:inline font-normal">Kecamatan Plosoklaten</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
                Bantuan Sosial Rumah & Disabilitas <br className="hidden sm:inline" />
                <span className="text-emerald-700 dark:text-emerald-400">Mudah, Adil & Transparan</span>
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl font-normal">
                Warga Desa Jarak kini dapat mengajukan bantuan perbaikan rumah tidak layak huni (RTLH) dan alat mobilitas disabilitas secara mandiri atau dibantu tetangga. Survei dilakukan langsung oleh Kepala Dusun ke rumah Anda.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="h-12 px-6 gap-2 text-sm sm:text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
              >
                <FileEdit size={18} />
                <span>Ajukan Bantuan Sekarang</span>
                <ArrowRight size={16} />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="h-12 px-5 gap-2 text-sm font-bold border-border bg-card hover:bg-muted rounded-xl shadow-xs text-foreground"
              >
                <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Lihat Transparansi Dana Desa</span>
              </Button>
            </div>

            {/* Quick Auth Portal Link */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-1">
              <span>Perangkat desa atau kasun ingin masuk?</span>
              <button
                type="button"
                onClick={() => { setCurrentView('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Halaman Masuk (Login) →
              </button>
            </div>

            {/* 3 Core Principles Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-border">
              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Survei ke Rumah</span>
                </div>
                <p className="text-xs text-muted-foreground">Kasun datang langsung mengecek kondisi fisik rumah.</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Send size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Kabar via WhatsApp</span>
                </div>
                <p className="text-xs text-muted-foreground">Setiap perkembangan langsung dikirim ke HP Anda.</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Terbuka & Bebas Biaya</span>
                </div>
                <p className="text-xs text-muted-foreground">100% Gratis. Semua data penyaluran dapat diaudit publik.</p>
              </div>
            </div>

          </div>

          {/* Right Hero Card: Quick Ticket Tracker */}
          <div className="lg:col-span-5">
            <Card className="border-border shadow-xl bg-card rounded-2xl overflow-hidden">
              <CardHeader className="p-6 pb-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    🔍 Pelacakan Langsung
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">Cek Status Kapan Saja</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-extrabold text-foreground pt-1.5">
                  Lacak Berkas Pengajuan Anda
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Sudah pernah mendaftar? Masukkan nomor tiket untuk melihat proses survei dan penetapan bantuan.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <form onSubmit={handleQuickTrack} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="text"
                      placeholder="Contoh: JRK-2026-001"
                      value={quickTicketInput}
                      onChange={(e) => setQuickTicketInput(e.target.value)}
                      className="h-11 font-mono text-sm uppercase rounded-xl border-border focus-visible:ring-emerald-600"
                    />
                    <Button type="submit" size="default" className="h-11 px-5 font-bold gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shrink-0">
                      <Search size={16} />
                      <span>Cari</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format nomor tiket: <span className="font-mono font-bold text-foreground">JRK-2026-XXX</span> (diberikan setelah pendaftaran)
                  </p>
                </form>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="bg-muted/50 p-3.5 rounded-xl border border-border">
                    <span className="text-xs font-bold text-muted-foreground block">
                      Dalam Proses
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-foreground">{inProgressCount}</span>
                      <span className="text-xs text-muted-foreground">berkas</span>
                    </div>
                  </div>

                  <div className="bg-emerald-100/60 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Telah Terealisasi
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">{completedCount}</span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">penerima</span>
                    </div>
                  </div>
                </div>

                {/* Demo Quick Sample */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                  <span className="font-semibold text-muted-foreground block">Contoh Tiket yang Terdaftar:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['JRK-2026-001', 'JRK-2026-002', 'JRK-2026-003'].map(sample => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setQuickTicketInput(sample);
                          setActiveTicketNumber(sample);
                          setCurrentView('lacak');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-background border border-border font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                      >
                        #{sample}
                      </button>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
}
