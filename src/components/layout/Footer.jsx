import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, RotateCcw } from 'lucide-react';
import sapaJarakLogo from '../../assets/sapa-jarak-logo.png';
import { DESA_CONFIG, DUSUN_LIST, getKasunDusunId } from '../../data/desaConfig';
import { useApp } from '../../context/AppContext';
import { Separator } from '../ui/separator';

const FOOTER_DUSUN_ORDER = ['jaraklor', 'jarakkidul', 'sagi', 'kalasan', 'simbar'];
const FOOTER_KASUN_NAMES = {
  jarakkidul: '-',
  kalasan: 'Septian Yoga P.',
};

export default function Footer() {
  const { currentUser, refreshServerData, showConfirm } = useApp();

  const isDesaStaff = currentUser?.role === 'desa' || currentUser?.role === 'admin';
  const isKasun = currentUser?.role?.startsWith('kasun');
  const footerDusunList = [...DUSUN_LIST]
    .sort((a, b) => FOOTER_DUSUN_ORDER.indexOf(a.id) - FOOTER_DUSUN_ORDER.indexOf(b.id));
  const kasunDusun = DUSUN_LIST.find(dusun => dusun.id === getKasunDusunId(currentUser));
  const handleRefresh = async () => {
    const result = await showConfirm({
      title: 'Muat ulang data server?',
      text: 'Data akan diambil ulang dari database server tanpa mengubah atau menghapusnya.',
      confirmButtonText: 'Muat Ulang',
      confirmColorClass: 'bg-emerald-700 hover:bg-emerald-800',
      icon: 'question'
    });
    if (result.isConfirmed) refreshServerData();
  };

  if (isKasun) {
    return (
      <footer className="mt-auto border-t border-border bg-card text-card-foreground">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={sapaJarakLogo}
              alt="Logo SAPA-JARAK"
              className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="font-bold text-foreground">Ruang Kerja Kasun · Desa Jarak</p>
              <p className="mt-0.5 truncate text-muted-foreground">
                {currentUser?.name || kasunDusun?.kasunName || 'Kepala Dusun'}
                {kasunDusun?.name ? ` · Dusun ${kasunDusun.name}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-muted-foreground sm:items-end">
            <a href={`mailto:${DESA_CONFIG.emailDesa}`} className="hover:text-emerald-700 dark:hover:text-emerald-300">
              Bantuan: {DESA_CONFIG.emailDesa}
            </a>
            <span>© {new Date().getFullYear()} Pemerintah Desa Jarak</span>
          </div>
        </div>
      </footer>
    );
  }

  if (isDesaStaff) {
    return (
      <footer className="mt-auto border-t border-border bg-card text-card-foreground">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <img
              src={sapaJarakLogo}
              alt="Logo SAPA-JARAK"
              className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain"
            />
            <div>
              <p className="font-bold text-foreground">Ruang Kerja Pemerintah Desa Jarak</p>
              <p className="mt-0.5 text-muted-foreground">
                {currentUser?.position || currentUser?.roleLabel || 'Petugas Desa'} · Gunakan data sesuai kewenangan dan jaga kerahasiaan informasi warga.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <a href={`mailto:${DESA_CONFIG.emailDesa}`} className="hover:text-emerald-700 dark:hover:text-emerald-300">
                Bantuan: {DESA_CONFIG.emailDesa}
              </a>
              <span className="hidden sm:inline">·</span>
              <span>© {new Date().getFullYear()} Pemdes Jarak</span>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 self-start font-semibold text-emerald-800 hover:underline dark:text-emerald-300 sm:self-end"
            >
              <RotateCcw size={12} /> Muat ulang data
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card text-card-foreground border-t border-border pt-14 pb-10 text-xs sm:text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Col 1: Government Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={sapaJarakLogo}
                alt="Logo SAPA-JARAK"
                className="w-10 h-10 rounded-xl bg-white object-contain shadow-xs"
              />
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
              {footerDusunList.map((d) => (
                <li key={d.id} className="flex justify-between py-1 border-b border-border text-muted-foreground">
                  <span className="text-foreground font-semibold">Kasun {d.name}</span>
                  <span><b>{FOOTER_KASUN_NAMES[d.id] || d.kasunName}</b></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
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
              onClick={handleRefresh}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={12} /> Muat Ulang Data Server
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
