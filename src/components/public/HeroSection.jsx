import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileEdit, 
  Search, 
  ArrowRight, 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';

export default function HeroSection() {
  const { setCurrentView, setActiveTicketNumber, showToast, currentUser, openLogin } = useApp();
  const [quickTicketInput, setQuickTicketInput] = useState('');
  const [publicMetrics, setPublicMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/public/transparency/metrics', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          throw new Error(payload.message || 'Statistik layanan gagal dimuat dari server.');
        }
        if (active) {
          setPublicMetrics(payload.data);
          setMetricsError('');
        }
      })
      .catch((error) => {
        if (active) setMetricsError(error.message || 'Statistik layanan tidak dapat dimuat dari server.');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    const clean = quickTicketInput.trim().toUpperCase().replace('#', '');
    if (!clean) {
      showToast('Ketik nomor tiket pengajuan Anda', 'warning');
      return;
    }
    setActiveTicketNumber(clean);
    setCurrentView('lacak');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 border-b border-border bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-background transition-colors">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Notice Bar Pill */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-background border border-emerald-600/30 text-emerald-900 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Layanan Bantuan Sosial Desa Jarak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Bantuan sosial yang <span className="text-emerald-700 dark:text-emerald-400">mudah diakses</span>
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Ajukan bantuan perbaikan rumah atau alat bantu disabilitas. Pengajuan gratis dan dapat dibantu keluarga maupun tetangga.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  if (!currentUser) {
                    showToast('Silakan masuk sebagai Warga / Pelapor untuk mengajukan permohonan bantuan.', 'info');
                    openLogin('warga');
                  } else {
                    setCurrentView('ajukan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="h-12 px-6 gap-2 text-sm sm:text-base font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
              >
                <FileEdit size={18} />
                <span>Ajukan bantuan</span>
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Gratis</span>
              <span>•</span>
              <span>Survei langsung ke rumah</span>
              <span>•</span>
              <span>Status dapat dipantau</span>
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
                      placeholder="Masukkan nomor tiket"
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
                      <span className="text-2xl font-black font-mono text-foreground">{publicMetrics ? publicMetrics.total_in_progress : '—'}</span>
                      <span className="text-xs text-muted-foreground">berkas</span>
                    </div>
                  </div>

                  <div className="bg-emerald-100/60 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Telah Terealisasi
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">{publicMetrics ? publicMetrics.total_completed : '—'}</span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">penerima</span>
                    </div>
                  </div>
                </div>
                {metricsError && <p className="text-xs text-rose-700 dark:text-rose-300">{metricsError}</p>}

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
}
