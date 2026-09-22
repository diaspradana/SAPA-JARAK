import React from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Accessibility, Home, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Separator } from '../ui/separator';

export default function ServiceCards() {
  const { setCurrentView } = useApp();
  const { speak } = useVoice();

  const handleApply = (type) => {
    speak(`Membuka formulir pengajuan bantuan ${type === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni' : 'Alat Bantu Disabilitas'}`);
    setCurrentView('ajukan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-20 bg-muted/30 border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-12" data-aos="fade-up">
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-background border-border text-foreground shadow-2xs">
            Nomenklatur Pelayanan Sosial
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Kategori Bantuan yang Dapat Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Masyarakat dapat mendaftarkan diri sendiri atau tetangga rentan untuk 2 skema bantuan terverifikasi berikut:
          </p>
        </div>

        {/* 2 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Disabilitas */}
          <Card 
            className="border-border/80 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            data-aos="fade-right"
            data-aos-duration="700"
          >
            <CardHeader className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                    <Accessibility size={22} />
                  </div>
                  <div>
                    <Badge variant="info" className="text-[10px] px-1.5 py-0">Kategori 01</Badge>
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-0.5">Alat Bantu Disabilitas</CardTitle>
                  </div>
                </div>
              </div>

              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Penyediaan sarana mobilitas untuk warga penyandang disabilitas fisik, lansia berkebutuhan khusus, atau warga yang mengalami kelumpuhan pasca stroke.
              </CardDescription>

              <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                <span className="font-bold text-foreground text-[11px] uppercase tracking-wide block">Jenis Alat Bantu Tersedia:</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Kursi Roda Standar / CP</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Kruk Ketiak Aluminium</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Walker 2-in-1 Roda</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Alat Bantu Dengar / Tongkat</div>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 pt-0 border-t border-border/60 flex items-center justify-between bg-muted/20 mt-0">
              <span className="text-[11px] text-muted-foreground font-medium">Bisa diajukan keluarga / RT</span>
              <Button
                type="button"
                onClick={() => handleApply('DISABILITAS')}
                size="sm"
                className="font-bold gap-1.5 shadow-2xs"
              >
                <span>Ajukan Permohonan</span>
                <ArrowRight size={13} />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: RTLH */}
          <Card 
            className="border-border/80 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            data-aos="fade-left"
            data-aos-duration="700"
            data-aos-delay="100"
          >
            <CardHeader className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Home size={22} />
                  </div>
                  <div>
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Kategori 02</Badge>
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-0.5">Rehabilitasi RTLH</CardTitle>
                  </div>
                </div>
              </div>

              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Stimulan material perbaikan Rumah Tidak Layak Huni bagi warga berpenghasilan rendah dengan kondisi kerusakan struktural mendesak (atap, dinding, lantai, sanitasi).
              </CardDescription>

              <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                <span className="font-bold text-foreground text-[11px] uppercase tracking-wide block">Komponen Bantuan Material:</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Kayu Balok & Seng Asbes</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Semen & Pasir Bangunan</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Bata Ringan / Hebel & Kalsiboard</div>
                  <div className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Kloset Jongkok & Pipa Saluran</div>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 pt-0 border-t border-border/60 flex items-center justify-between bg-muted/20 mt-0">
              <span className="text-[11px] text-muted-foreground font-medium">Prioritas skor asesmen tertinggi</span>
              <Button
                type="button"
                onClick={() => handleApply('RTLH')}
                size="sm"
                className="font-bold gap-1.5 shadow-2xs"
              >
                <span>Ajukan Permohonan</span>
                <ArrowRight size={13} />
              </Button>
            </CardFooter>
          </Card>

        </div>

      </div>
    </section>
  );
}
