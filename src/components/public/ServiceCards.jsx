import React from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Accessibility, Home, ArrowRight, Check, Heart, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

export default function ServiceCards() {
  const { setCurrentView } = useApp();
  const { speak } = useVoice();

  const handleApply = (type) => {
    speak(`Membuka formulir pengajuan bantuan ${type === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni' : 'Alat Bantu Disabilitas'}`);
    setCurrentView('ajukan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
            Pilihan Bantuan Sosial Desa
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Apa Bantuan yang Ingin Anda Ajukan?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Anda dapat mengajukan permohonan untuk diri sendiri, keluarga, atau tetangga yang membutuhkan. Pendaftaran 100% gratis dan akan disurvei langsung oleh Kepala Dusun.
          </p>
        </div>

        {/* 2 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: RTLH */}
          <Card className="border-border rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-card">
            <CardHeader className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-xs">
                  <Home size={30} />
                </div>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                  Kategori 01
                </span>
              </div>

              <div>
                <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Rehabilitasi Rumah (RTLH)
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Bantuan perbaikan bagi warga yang rumahnya mengalami kerusakan atap bocor parah, dinding bambu/gedek rapuh, lantai tanah, atau belum memiliki jamban sehat (MCK).
                </CardDescription>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border">
                <span className="font-extrabold text-foreground text-xs uppercase tracking-wider block">
                  Bantuan yang Diberikan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Kayu balok & seng/asbes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Semen & pasir pasang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Bata & kalsiboard dinding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Kloset jongkok & pipa sanitasi</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 sm:p-8 pt-0 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
              <span className="text-xs text-muted-foreground font-semibold">
                Survei langsung & swakelola warga
              </span>
              <Button
                type="button"
                onClick={() => handleApply('RTLH')}
                className="w-full sm:w-auto h-11 px-5 font-bold gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
              >
                <span>Ajukan Bantuan RTLH</span>
                <ArrowRight size={15} />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Disabilitas */}
          <Card className="border-border rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-card">
            <CardHeader className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold shadow-xs">
                  <Accessibility size={30} />
                </div>
                <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-xs px-3 py-1 rounded-full font-bold">
                  Kategori 02
                </span>
              </div>

              <div>
                <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Alat Bantu Disabilitas & Lansia
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Penyediaan alat mobilitas fisik untuk warga disabilitas, lansia yang sulit berjalan, atau warga yang mengalami kelumpuhan sementara/permanen akibat stroke.
                </CardDescription>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-border">
                <span className="font-extrabold text-foreground text-xs uppercase tracking-wider block">
                  Pilihan Alat yang Tersedia:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Kursi Roda Standar & Khusus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Kruk Ketiak Aluminium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Walker 2-in-1 (Roda depan)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Tongkat Jalan & Alat Dengar</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 sm:p-8 pt-0 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
              <span className="text-xs text-muted-foreground font-semibold">
                Bisa diajukan keluarga / kader RT
              </span>
              <Button
                type="button"
                onClick={() => handleApply('DISABILITAS')}
                className="w-full sm:w-auto h-11 px-5 font-bold gap-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-xs"
              >
                <span>Ajukan Alat Disabilitas</span>
                <ArrowRight size={15} />
              </Button>
            </CardFooter>
          </Card>

        </div>

      </div>
    </section>
  );
}
