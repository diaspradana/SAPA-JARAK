import React from 'react';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import { DESA_CONFIG, DUSUN_LIST } from '../../data/desaConfig';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function Footer() {
  const { setCurrentView, resetDatabase, showConfirm } = useApp();

  return (
    <footer className="bg-card text-card-foreground border-t border-border pt-14 pb-10 text-xs sm:text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Government Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 size={20} className="text-emerald-200" />
              </div>
              <div>
                <span className="font-extrabold text-foreground block tracking-tight text-sm sm:text-base">PEMDES JARAK</span>
                <span className="text-xs text-muted-foreground font-medium">Kec. Plosoklaten, Kab. Kediri</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
              SAPA-JARAK adalah platform resmi pelayanan bantuan sosial RTLH dan alat bantu disabilitas yang transparan, mudah, dan terverifikasi langsung oleh Kepala Dusun.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-lg font-bold">
              <ShieldCheck size={16} />
              <span>Satu Pintu Layanan Bantuan Sosial Desa</span>
            </div>
          </div>

          {/* Col 2: 5 Dusun */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Wilayah Dusun Binaan</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {DUSUN_LIST.map((d) => (
                <li key={d.id} className="flex justify-between py-1 border-b border-border text-muted-foreground">
                  <span className="text-foreground font-semibold">Dusun {d.name}</span>
                  <span>Kasun: <b>{d.kasunName}</b></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Menu Layanan Cepat</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  ✍️ Ajukan Permohonan Bantuan
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('lacak'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  🔍 Lacak Status Nomor Tiket
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('transparansi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  📊 Transparansi & Keterbukaan APBDes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold transition-colors"
                >
                  🔑 Masuk Petugas / Akun Warga
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  👤 Pendaftaran Akun Warga Baru
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Kantor Pelayanan Desa</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{DESA_CONFIG.alamatKantor}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>WA: <b>{DESA_CONFIG.whatsappCenter}</b></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{DESA_CONFIG.emailDesa}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{DESA_CONFIG.jamLayanan}</span>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="border-border" />

        {/* Bottom Legal Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const result = await showConfirm({
                  title: 'Kembalikan ke Data Awal Demo?',
                  text: 'Seluruh riwayat tiket pengajuan dan survei akan dikembalikan ke kondisi awal demo.',
                  confirmButtonText: 'Ya, Reset Data',
                  confirmColorClass: 'bg-rose-600 hover:bg-rose-700',
                  icon: 'warning'
                });
                if (result.isConfirmed) {
                  resetDatabase();
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={12} /> Reset Data Demo
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
