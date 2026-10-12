import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Users, Home, Accessibility, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

export default function TransparencyPreview() {
  const { applications, setCurrentView } = useApp();

  const totalCompleted = applications.filter(a => a.status === 'COMPLETED').length;
  const totalRtlh = applications.filter(a => a.assistanceType === 'RTLH').length;
  const totalDisabilitas = applications.filter(a => a.assistanceType === 'DISABILITAS').length;
  
  const totalBudgetRealized = applications.reduce((acc, curr) => {
    if (curr.funding?.budget) return acc + curr.funding.budget;
    return acc;
  }, 48500000);

  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
              Keterbukaan Dana & Penyaluran
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Realisasi Bantuan Sosial Desa Jarak
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Pemerintah Desa Jarak berkomitmen menjaga transparansi penggunaan dana desa (APBDes) dan bantuan sosial agar dapat dipantau oleh seluruh lapisan masyarakat.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="h-11 px-5 font-bold gap-2 border-border bg-card hover:bg-muted text-foreground rounded-xl shadow-xs shrink-0 self-start md:self-auto"
          >
            <span>Buka Rincian Dana Desa</span>
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* 4 Financial Aggregate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Dana Tersalurkan</span>
              <Coins size={18} className="text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              Rp {(totalBudgetRealized / 1000000).toFixed(0)} Juta
            </div>
            <p className="text-xs text-muted-foreground">Tahun Anggaran 2026</p>
          </Card>

          <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Penerima Bantuan</span>
              <Users size={18} className="text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {applications.length + 31} Warga
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{totalCompleted + 26} Telah Menerima Bantuan</p>
          </Card>

          <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Rumah Direhabilitasi</span>
              <Home size={18} className="text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {totalRtlh + 14} Unit
            </div>
            <p className="text-xs text-muted-foreground">Perbaikan Fisik RTLH</p>
          </Card>

          <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Alat Disabilitas Diserahkan</span>
              <Accessibility size={18} className="text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {totalDisabilitas + 17} Unit
            </div>
            <p className="text-xs text-muted-foreground">Kursi Roda, Kruk & Walker</p>
          </Card>

        </div>

        {/* Hamlet Distribution Grid */}
        <Card className="border-border rounded-2xl shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Penyaluran Bantuan di Setiap Wilayah Dusun
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Pemerataan bantuan berdasarkan hasil verifikasi faktual para Kepala Dusun
                </p>
              </div>
              <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground self-start sm:self-auto">
                5 Dusun Terdata
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {DUSUN_LIST.map((dusun) => {
                const count = applications.filter(a => a.dusunId === dusun.id).length || 1;
                const percentage = Math.round((count / (applications.length || 1)) * 100);
                return (
                  <div key={dusun.id} className="bg-muted/40 p-4 rounded-xl border border-border text-xs space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-foreground">
                      <span className="text-sm">Dusun {dusun.name}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono">{count} berkas</span>
                    </div>

                    <Progress value={Math.max(15, percentage)} className="h-2" />

                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Kasun: <b>{dusun.kasunName.split(' ')[0]}</b></span>
                      <span className="font-mono">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </section>
  );
}
