import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Users, Home, Accessibility, ArrowRight, ShieldCheck } from 'lucide-react';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
    <section className="py-14 sm:py-20 bg-muted/30 border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10" data-aos="fade-up">
          <div className="space-y-2">
            <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-background border-border text-foreground shadow-2xs">
              Transparansi Anggaran & Akuntabilitas
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Realisasi Bantuan Sosial Desa Jarak
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Rekapitulasi keterbukaan penggunaan anggaran APBDes dan sumber dana mitra per September 2026.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="font-bold gap-2 border-border shadow-2xs shrink-0 self-start md:self-auto"
          >
            <span>Buka Seluruh Open Ledger Desa</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* 4 Financial Aggregate Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-aos="fade-up" data-aos-delay="100">
          
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Realisasi Anggaran</span>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                Rp {(totalBudgetRealized / 1000000).toFixed(0)} Juta
              </div>
              <p className="text-[11px] text-muted-foreground">Tahun Anggaran 2026</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Warga Penerima Manfaat</span>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {applications.length + 31} Jiwa
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{totalCompleted + 26} Terverifikasi BAST</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Rehabilitasi RTLH</span>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {totalRtlh + 14} Unit
              </div>
              <p className="text-[11px] text-muted-foreground">Swakelola Masyarakat</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Alat Disabilitas</span>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {totalDisabilitas + 17} Unit
              </div>
              <p className="text-[11px] text-muted-foreground">Diserahkan Langsung</p>
            </CardContent>
          </Card>

        </div>

        {/* Hamlet Distribution Grid */}
        <Card className="border-border/80 shadow-xs" data-aos="fade-up" data-aos-delay="200">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Distribusi Penyaluran di 5 Dusun</CardTitle>
                <p className="text-[11px] text-muted-foreground">Pemerataan alokasi berdasarkan asesmen faktual kasun</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-border bg-muted/40">
                5 Wilayah Terdata
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              {DUSUN_LIST.map((dusun) => {
                const count = applications.filter(a => a.dusunId === dusun.id).length || 1;
                const percentage = Math.round((count / (applications.length || 1)) * 100);
                return (
                  <div key={dusun.id} className="bg-muted/40 p-3 rounded-lg border border-border/60 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Dusun {dusun.name}</span>
                      <span className="text-primary font-mono">{count} berkas</span>
                    </div>

                    <Progress value={Math.max(15, percentage)} className="h-1.5" />

                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Kasun: {dusun.kasunName.split(' ')[0]}</span>
                      <span>{percentage}%</span>
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
