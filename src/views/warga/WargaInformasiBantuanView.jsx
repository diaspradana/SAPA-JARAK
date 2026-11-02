import React, { useState } from 'react';
import {
  Info,
  Home,
  Accessibility,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Star,
  HelpCircle,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Siapa yang berhak mengajukan bantuan RTLH?',
    a: 'Warga Desa Jarak yang memiliki rumah tidak layak huni dengan kondisi lantai tanah/bambu/papan rusak, dinding bambu/papan rusak, atap seng/genteng bocor parah, atau sanitasi tidak memadai, dan masuk kategori keluarga miskin/tidak mampu.',
  },
  {
    q: 'Apa saja dokumen yang perlu disiapkan?',
    a: 'Dokumen yang diperlukan: Fotokopi KTP, Fotokopi KK, Surat Keterangan Tidak Mampu (SKTM) dari Desa, Foto kondisi rumah (4 sisi), dan Surat pernyataan kepemilikan/penguasaan tanah.',
  },
  {
    q: 'Berapa lama proses pengajuan sampai mendapat kepastian?',
    a: 'Proses verifikasi oleh Kasun berlangsung 3-7 hari kerja. Validasi Pemerintah Desa 7-14 hari kerja. Total estimasi 2-4 minggu untuk mendapat kepastian persetujuan.',
  },
  {
    q: 'Apakah pengajuan bisa ditolak?',
    a: 'Ya, pengajuan bisa ditolak apabila tidak memenuhi kriteria penerima, data ganda/duplikat, kondisi rumah tidak sesuai, atau warga sudah pernah menerima bantuan serupa dalam 5 tahun terakhir.',
  },
  {
    q: 'Bagaimana jika pengajuan saya dikembalikan?',
    a: 'Jika dikembalikan, Anda akan mendapat notifikasi beserta catatan kekurangan. Silakan melengkapi dokumen atau memperbaiki data sesuai catatan Kasun/Desa, lalu ajukan ulang.',
  },
  {
    q: 'Apakah bantuan Disabilitas berbeda dengan RTLH?',
    a: 'Ya, bantuan Disabilitas diperuntukkan bagi warga penyandang disabilitas yang membutuhkan alat bantu (kursi roda, alat bantu jalan, alat bantu dengar, dll.) dan tidak mampu secara ekonomi.',
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-neutral-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3 pr-4">
          <HelpCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.q}</span>
        </div>
        {open ? <ChevronUp size={16} className="shrink-0 text-gray-400" /> : <ChevronDown size={16} className="shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-3">{item.a}</p>
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { num: 1, title: 'Daftar & Login', desc: 'Buat akun warga dengan NIK, nama, dan nomor HP. Login ke portal SAPA-JARAK.' },
  { num: 2, title: 'Isi Formulir', desc: 'Pilih jenis bantuan (RTLH atau Disabilitas), isi data diri, unggah foto kondisi rumah/alat bantu.' },
  { num: 3, title: 'Verifikasi Kasun', desc: 'Kepala Dusun melakukan survei lapangan dan verifikasi kesesuaian data di lokasi Anda.' },
  { num: 4, title: 'Validasi Desa', desc: 'Pemerintah Desa memeriksa DTKS, duplikasi data, dan menetapkan sumber pendanaan (APBDes/APBD).' },
  { num: 5, title: 'Realisasi Bantuan', desc: 'Proses pengadaan/pengerjaan dilakukan, dilanjutkan Serah Terima BAST kepada penerima bantuan.' },
];

export default function WargaInformasiBantuanView({ onNav }) {
  return (
    <div className="pb-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white px-6 py-10 sm:py-14 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4">
          <Info size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black leading-tight">Program Bantuan Sosial</h1>
        <h2 className="text-xl sm:text-2xl font-black text-emerald-200 mt-1">Desa Jarak</h2>
        <p className="text-sm text-emerald-100/90 mt-3 max-w-lg mx-auto leading-relaxed">
          Pemerintah Desa Jarak menyediakan program bantuan untuk Rumah Tidak Layak Huni (RTLH) dan Penyandang Disabilitas bagi warga yang membutuhkan.
        </p>
        <button
          onClick={() => onNav('ajukan')}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
        >
          Ajukan Sekarang <ArrowRight size={16} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 mt-8">

        {/* Section 1: RTLH */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <Home size={20} className="text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Bantuan RTLH</h3>
              <p className="text-xs text-gray-500">Rumah Tidak Layak Huni</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Star size={14} className="text-amber-500" /> Kriteria Penerima
              </h4>
              <ul className="space-y-2">
                {[
                  'Lantai tanah / bambu / papan rusak parah',
                  'Dinding bambu / papan rusak ≥ 50%',
                  'Atap bocor / tidak layak fungsi',
                  'Tidak memiliki MCK yang memadai',
                  'Keluarga miskin/tidak mampu',
                  'Belum pernah menerima RTLH dalam 5 tahun',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Persyaratan Dokumen
              </h4>
              <ul className="space-y-2">
                {[
                  'Fotokopi KTP penerima',
                  'Fotokopi Kartu Keluarga (KK)',
                  'SKTM dari Pemerintah Desa',
                  'Foto kondisi rumah (4 sisi)',
                  'Surat keterangan kepemilikan tanah',
                  'Surat pernyataan tidak menerima bantuan serupa',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={13} className="text-blue-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5">
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-2">Estimasi Nilai Bantuan</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { cat: 'Atap', value: 'Rp 7 - 15 juta' },
                  { cat: 'Dinding', value: 'Rp 5 - 10 juta' },
                  { cat: 'Lantai', value: 'Rp 3 - 8 juta' },
                ].map((item) => (
                  <div key={item.cat} className="bg-white dark:bg-emerald-950/40 rounded-xl p-3">
                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">{item.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{item.cat}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">*Nilai bantuan disesuaikan dengan hasil survei lapangan dan ketersediaan anggaran APBDes/APBD.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Disabilitas */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center">
              <Accessibility size={20} className="text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Bantuan Disabilitas</h3>
              <p className="text-xs text-gray-500">Alat Bantu Penyandang Disabilitas</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">Jenis Alat Bantu</h4>
              <ul className="space-y-2">
                {[
                  'Kursi Roda Manual / Elektrik',
                  'Tongkat / Walker / Kruk',
                  'Alat Bantu Dengar',
                  'Kacamata / Alat Bantu Penglihatan',
                  'Protese (Kaki/Tangan Palsu)',
                  'Alat Bantu Komunikasi (AAC)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={13} className="text-purple-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">Persyaratan</h4>
              <ul className="space-y-2">
                {[
                  'KTP penyandang disabilitas',
                  'Kartu Keluarga (KK)',
                  'Surat Keterangan Disabilitas dari dokter/puskesmas',
                  'Surat keterangan tidak mampu',
                  'Foto kondisi saat ini',
                  'Belum memiliki alat bantu yang berfungsi',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={13} className="text-purple-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Steps */}
        <section>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
            <ArrowRight size={20} className="text-emerald-600" />
            Prosedur Pengajuan
          </h3>
          <div className="space-y-3">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-start gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-4">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{step.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.desc}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" />
            Pertanyaan Umum (FAQ)
          </h3>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        {/* Section 5: Contact */}
        <section>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-emerald-600" />
            Kontak Desa
          </h3>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 space-y-3">
            {[
              { icon: MapPin, label: 'Alamat', value: 'Jl. Desa Jarak No. 1, Plosoklaten, Kediri, Jawa Timur 64175' },
              { icon: Phone, label: 'Telepon', value: '(0354) 123-4567' },
              { icon: Clock, label: 'Jam Layanan', value: 'Senin – Jumat: 08.00 – 14.00 WIB' },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{c.label}</div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
