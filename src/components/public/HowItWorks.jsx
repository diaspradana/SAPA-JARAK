import React from 'react';
import { Send, FileSearch, Layers, Hammer, BarChart3, CheckCircle2, UserCheck, Building2, HeartHandshake } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Warga Mendaftar",
      actor: "Warga / Pelapor",
      icon: Send,
      desc: "Isi formulir pengajuan online, sebutkan nama penerima, dusun, dan sertakan foto kondisi rumah atau kondisi fisik warga."
    },
    {
      num: "2",
      title: "Kasun Survei ke Rumah",
      actor: "Kepala Dusun",
      icon: UserCheck,
      desc: "Kepala Dusun wilayah Anda akan datang langsung meninjau ke lokasi rumah untuk memastikan kondisi secara faktual."
    },
    {
      num: "3",
      title: "Penetapan Anggaran Desa",
      actor: "Pemerintah Desa",
      icon: Building2,
      desc: "Pemdes Jarak memvalidasi berkas dan menetapkan bantuan secara musyawarah dari dana desa (APBDes) atau mitra sosial."
    },
    {
      num: "4",
      title: "Pengerjaan & Penyaluran",
      actor: "Pokmas / Relawan",
      icon: Hammer,
      desc: "Material bangunan dikirim dan diperbaiki gotong royong, atau alat bantu mobilitas diantarkan langsung ke penerima."
    },
    {
      num: "5",
      title: "Bantuan Diterima & Terbuka",
      actor: "Warga & Desa",
      icon: HeartHandshake,
      desc: "Penyerahan resmi kepada penerima manfaat dan laporan bantuan dicatat transparan di sistem desa."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
            Alur Pelayanan Mudah
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Bagaimana Proses Pengajuan Berjalan?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hanya 5 tahapan jelas dari pendaftaran hingga bantuan diterima di rumah Anda.
          </p>
        </div>

        {/* 5-step grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.num}
                className="border-border rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all bg-card"
              >
                <CardHeader className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {step.num}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                      {step.actor}
                    </span>
                  </div>

                  <div className="pt-1">
                    <CardTitle className="text-base font-extrabold text-foreground">
                      {step.title}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
                      {step.desc}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="pt-3 border-t border-border flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span>Langkah ke-{step.num} dari 5</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
