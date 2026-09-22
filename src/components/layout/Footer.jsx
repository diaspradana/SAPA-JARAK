import React from 'react';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import { DESA_CONFIG, DUSUN_LIST } from '../../data/desaConfig';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function Footer() {
  const { setCurrentView, resetDatabase, showConfirm } = useApp();

  return (
    <footer className="bg-card text-card-foreground border-t border-border pt-12 pb-8 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Government Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold border border-primary/30 shadow-xs">
                <Building2 size={16} className="text-emerald-300" />
              </div>
              <div>
                <span className="font-extrabold text-foreground block tracking-tight">PEMERINTAH DESA JARAK</span>
                <span className="text-[11px] text-muted-foreground font-medium">Kec. Plosoklaten, Kab. Kediri</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              SAPA-JARAK adalah platform sistem pelayanan aspirasi dan bantuan sosial berbasis verifikasi faktual berjenjang 3 tingkat (Warga ➔ Kasun ➔ Pemdes).
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-semibold">
              <ShieldCheck size={13} />
              <span>Satu Data Desa & Perlindungan Privasi</span>
            </div>
          </div>

          {/* Col 2: 5 Dusun */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-3">Wilayah Dusun Binaan</h4>
            <ul className="space-y-1.5 text-[11px]">
              {DUSUN_LIST.map((d) => (
                <li key={d.id} className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                  <span className="text-foreground font-medium">Dusun {d.name}</span>
                  <span>Kasun: {d.kasunName}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-3">Layanan Aplikasi</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button 
                  onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Formulir Pengajuan Bantuan Baru
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('lacak'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pelacakan Status Register Tiket
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open Ledger & Transparansi Anggaran
                </button>
              </li>
              <li className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await showConfirm({
                      title: 'Reset Database Simulasi?',
                      text: 'Seluruh riwayat tiket pengajuan, log notifikasi, dan data survei akan dikembalikan ke data awal demo.',
                      confirmButtonText: 'Ya, Reset Data',
                      confirmColorClass: 'bg-rose-700 hover:bg-rose-800',
                      icon: 'warning'
                    });
                    if (result.isConfirmed) {
                      resetDatabase();
                    }
                  }}
                  className="h-7 text-[10px] font-semibold gap-1.5 border-border shadow-2xs"
                >
                  <RotateCcw size={11} />
                  <span>Reset Database Simulasi</span>
                </Button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-3">Kantor Pelayanan Desa</h4>
            <ul className="space-y-2 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span>{DESA_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                <span>{DESA_CONFIG.hotlineWhatsapp}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary shrink-0" />
                <span>{DESA_CONFIG.emailOfficial}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-primary shrink-0" />
                <span>{DESA_CONFIG.operatingHours}</span>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="border-border/60" />

        {/* Bottom Legal Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Pemerintah Desa Jarak, Plosoklaten, Kediri.</span>
            <span className="hidden sm:inline">•</span>
            <span>Versi Produksi Standard 2.0 (Civic-Tech Engine)</span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Sistem Aktif & Terhubung Server
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
