import React from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Accessibility, Home, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';

export default function ServiceCards() {
  const { setCurrentView, currentUser, showToast, openLogin } = useApp();
  const { speak } = useVoice();

  const handleApply = (type) => {
    if (!currentUser) {
      showToast('Silakan masuk sebagai Warga / Pelapor untuk mengajukan bantuan sosial.', 'info');
      openLogin('warga');
      return;
    }
    speak(`Membuka formulir pengajuan bantuan ${type === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni' : 'Alat Bantu Disabilitas'}`);
    setCurrentView('ajukan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-7">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Pilih jenis bantuan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ajukan untuk diri sendiri, keluarga, atau tetangga yang membutuhkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          
          <Card className="border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden bg-card">
            <CardHeader className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Home size={23} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Bantuan rumah</span>
              </div>

              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Perbaikan rumah (RTLH)
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Untuk rumah dengan kerusakan berat, lantai tanah, atau belum memiliki jamban sehat.
                </CardDescription>
              </div>
            </CardHeader>

            <CardFooter className="p-5 sm:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Gratis, dengan survei ke rumah
              </span>
              <Button
                type="button"
                onClick={() => handleApply('RTLH')}
                className="w-full sm:w-auto h-10 px-4 font-semibold gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
              >
                <span>Pilih bantuan</span>
                <ArrowRight size={15} />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden bg-card">
            <CardHeader className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                  <Accessibility size={23} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Bantuan mobilitas</span>
              </div>

              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Alat bantu disabilitas & lansia
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Dukungan alat mobilitas bagi warga disabilitas, lansia, atau warga dengan keterbatasan berjalan.
                </CardDescription>
              </div>
            </CardHeader>

            <CardFooter className="p-5 sm:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Bisa diajukan keluarga atau tetangga
              </span>
              <Button
                type="button"
                onClick={() => handleApply('DISABILITAS')}
                className="w-full sm:w-auto h-10 px-4 font-semibold gap-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg"
              >
                <span>Pilih bantuan</span>
                <ArrowRight size={15} />
              </Button>
            </CardFooter>
          </Card>

        </div>

      </div>
    </section>
  );
}
