import React from 'react';
import { Send, FileSearch, Layers, Hammer, BarChart3, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Pendaftaran Mandiri",
      actor: "Warga / Pelapor",
      badgeVariant: "neutral",
      desc: "Pelapor mengisi identitas penerima, lokasi dusun/RT/RW, unggah foto kondisi lapangan, dan verifikasi OTP WhatsApp."
    },
    {
      num: "02",
      title: "Verifikasi Lapangan",
      actor: "Kepala Dusun (Kasun)",
      badgeVariant: "info",
      desc: "Kasun melakukan peninjauan lokasi dengan geotagging GPS dan mengisi parameter kelayakan 0–100 poin."
    },
    {
      num: "03",
      title: "Validasi & Penetapan Dana",
      actor: "Pemerintah Desa",
      badgeVariant: "success",
      desc: "Kasi Kesra & Kades mencocokkan DTKS, memeriksa duplikasi, dan menetapkan alokasi sumber dana (APBDes/BKK/Dinsos)."
    },
    {
      num: "04",
      title: "Pengerjaan / Pengadaan",
      actor: "Pokmas / Mitra",
      badgeVariant: "secondary",
      desc: "Pelaksanaan swakelola bertahap (0% ➔ 50% ➔ 100%) untuk RTLH atau pengadaan unit alat bantu disabilitas."
    },
    {
      num: "05",
      title: "BAST & Open Ledger",
      actor: "Penerima & Pemdes",
      badgeVariant: "warning",
      desc: "Penandatanganan Berita Acara Serah Terima (BAST) digital dan data agregat otomatis dipublikasikan ke transparansi desa."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-background border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-12" data-aos="fade-up">
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-muted/50 border-border text-foreground shadow-2xs">
            SOP Tata Kelola Penyaluran Bantuan
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Alur Mekanisme Berjenjang 3 Tingkat
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Standar operasional prosedur dari pendaftaran, survei faktual, penetapan anggaran, hingga pertanggungjawaban terbuka.
          </p>
        </div>

        {/* 5-step grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <Card 
              key={step.num}
              data-aos="fade-up"
              data-aos-delay={(idx + 1) * 80}
              data-aos-duration="650"
              className="border-border/80 flex flex-col justify-between shadow-xs hover:border-primary/50 transition-colors"
            >
              <CardHeader className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground font-mono font-black text-xs flex items-center justify-center shadow-xs">
                    {step.num}
                  </span>
                  <Badge variant={step.badgeVariant} className="text-[10px] px-1.5 py-0 font-bold">
                    {step.actor}
                  </Badge>
                </div>

                <CardTitle className="text-xs sm:text-sm font-bold text-foreground pt-1">
                  {step.title}
                </CardTitle>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="pt-2 border-t border-border/50 text-[10px] font-bold text-primary font-mono">
                  Tahap Operasional {step.num} / 05
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
