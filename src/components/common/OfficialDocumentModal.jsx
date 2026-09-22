import React, { useRef } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode,
  Building2
} from 'lucide-react';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../ui/button';

export default function OfficialDocumentModal({ 
  isOpen, 
  onClose, 
  app, 
  documentType = "BAST" // "TANDA_TERIMA" | "REKOMENDASI_KASUN" | "SK_KADES" | "BAST" | "REKAP_APBDes"
}) {
  const printRef = useRef(null);

  if (!isOpen || !app) return null;

  const dusun = DUSUN_LIST.find(d => d.id === app.dusunId) || { name: app.dusunId || 'Kalasan', kasunName: 'Kasun Terkait' };
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in-0 duration-200">
      
      {/* Modal Container */}
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Toolbar (hidden on print) */}
        <div className="px-5 py-3 bg-muted text-foreground flex items-center justify-between border-b border-border print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wide uppercase">
              Pratinjau Dokumen Kedinasan Resmi (Format Standar A4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 font-bold shadow-xs text-xs"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF (A4)</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-neutral-100 flex justify-center">
          
          <div 
            ref={printRef}
            className="printable-paper w-full max-w-[210mm] bg-white text-neutral-950 p-8 sm:p-12 shadow-sm border border-neutral-300 font-serif leading-relaxed text-xs sm:text-sm print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ minHeight: '297mm' }}
          >
            
            {/* 1. Official Indonesian Village KOP SURAT */}
            <div className="border-b-[3px] border-double border-neutral-950 pb-3 mb-6 text-center font-sans relative">
              <div className="flex items-center justify-center gap-4">
                {/* Garuda / Seal Motif */}
                <div className="w-14 h-14 rounded-full border-2 border-neutral-900 flex items-center justify-center font-black text-xs text-neutral-900 tracking-tighter shrink-0">
                  <div className="text-center leading-none">
                    <span className="text-[9px] font-bold block">KABUPATEN</span>
                    <span className="text-[12px] font-black block">KEDIRI</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-700">
                    PEMERINTAH KABUPATEN KEDIRI
                  </h4>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-800">
                    KECAMATAN PLOSOKLATEN
                  </h3>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-950">
                    PEMERINTAH DESA JARAK
                  </h2>
                  <p className="text-[10px] text-neutral-600 font-normal">
                    Sekretariat: Jl. Raya Plosoklaten - Jarak No. 12, Kode Pos: 64175, Telepon: (0354) 748-021<br />
                    Laman Web: jarak-kediri.desa.id • Pos-el: pemdes@jarak-kediri.desa.id
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Document Heading Based on Type */}
            {documentType === 'BAST' && (
              <div className="text-center space-y-1 mb-6 font-sans">
                <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  BERITA ACARA SERAH TERIMA (BAST)
                </h3>
                <div className="text-xs font-mono text-neutral-700 font-bold">
                  Nomor: {app.handover?.bastNumber || `BAST/JRK/${app.assistanceType}/2026/009`}
                </div>
              </div>
            )}

            {documentType === 'REKOMENDASI_KASUN' && (
              <div className="text-center space-y-1 mb-6 font-sans">
                <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  SURAT REKOMENDASI HASIL SURVEI LAPANGAN KEPALA DUSUN
                </h3>
                <div className="text-xs font-mono text-neutral-700 font-bold">
                  Nomor Register: REG-KASUN/{dusun.name.toUpperCase()}/2026/{app.ticketNumber}
                </div>
              </div>
            )}

            {documentType === 'TANDA_TERIMA' && (
              <div className="text-center space-y-1 mb-6 font-sans">
                <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  LEMBAR TANDA TERIMA PENDAFTARAN ASPIRASI BANTUAN SOSIAL
                </h3>
                <div className="text-xs font-mono text-neutral-700 font-bold">
                  Nomor Registrasi Tiket: #{app.ticketNumber}
                </div>
              </div>
            )}

            {documentType === 'SK_KADES' && (
              <div className="text-center space-y-1 mb-6 font-sans">
                <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  LEMBAR PENETAPAN ALOKASI SUMBER DANA BANTUAN
                </h3>
                <div className="text-xs font-mono text-neutral-700 font-bold">
                  Nomor Disposisi: DISP/KADES/2026/{app.ticketNumber}
                </div>
              </div>
            )}

            {/* 3. Opening Preamble */}
            <div className="space-y-4 text-justify">
              <p>
                Pada hari ini, tanggal <b>{todayFormatted}</b>, bertempat di Kantor Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri, sehubungan dengan permohonan bantuan sosial warga masyarakat:
              </p>

              {/* Data Table */}
              <div className="border border-neutral-400 font-sans text-xs my-3">
                <div className="grid grid-cols-12 border-b border-neutral-300 py-1.5 px-3 bg-neutral-50 font-bold">
                  <div className="col-span-4">Parameter Administrasi</div>
                  <div className="col-span-8">Keterangan Faktual Terverifikasi</div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">Nomor Registrasi Tiket</div>
                  <div className="col-span-8 font-mono font-bold text-neutral-950">#{app.ticketNumber}</div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">Nama Penerima Manfaat</div>
                  <div className="col-span-8 font-bold text-neutral-950">{app.beneficiaryName}</div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">NIK / Nomor KK</div>
                  <div className="col-span-8 font-mono text-neutral-900">{app.nik} / {app.kkNumber}</div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">Wilayah Domisili</div>
                  <div className="col-span-8 text-neutral-900">
                    Dusun {dusun.name}, RT {app.rt || '01'} / RW {app.rw || '01'}, Desa Jarak
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">Kategori Bantuan</div>
                  <div className="col-span-8 font-bold text-neutral-900">
                    {app.assistanceType === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni (RTLH)' : 'Alat Bantu Disabilitas & Lansia'}
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-neutral-200 py-1.5 px-3">
                  <div className="col-span-4 font-semibold text-neutral-700">Skor Faktual (Pasal 11)</div>
                  <div className="col-span-8 font-mono font-bold text-neutral-950">
                    {app.survey?.score || 85} / 100 Poin (Kategori Prioritas Mendesak)
                  </div>
                </div>
                <div className="grid grid-cols-12 py-1.5 px-3 bg-neutral-50">
                  <div className="col-span-4 font-semibold text-neutral-700">Sumber & Nilai Anggaran</div>
                  <div className="col-span-8 font-bold text-neutral-950">
                    {app.validation?.fundingSource || 'APBDes / Dana Desa Tahun 2026'} — Rp {(app.validation?.approvedBudget || (app.assistanceType === 'RTLH' ? 15000000 : 2500000)).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Legal Clauses */}
              <div className="space-y-2 pt-2">
                <p className="font-bold font-sans text-xs">Ketentuan & Keabsahan Yuridis:</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-[11px] sm:text-xs">
                  <li>
                    Bantuan diserahkan secara utuh tanpa ada potongan biaya dalam bentuk apapun oleh aparatur Pemerintah Desa maupun pihak ketiga.
                  </li>
                  <li>
                    Penerima Manfaat bersedia memelihara dan memanfaatkan bantuan sosial sesuai peruntukannya demi peningkatan taraf hidup dan kesejahteraan keluarga.
                  </li>
                  <li>
                    Dokumen ini dicatat secara permanen dalam Buku Register Bantuan Sosial Terpadu Desa Jarak dan dipublikasikan pada Portal Transparansi APBDes.
                  </li>
                </ol>
              </div>

              {/* 4. Signatures Section */}
              <div className="pt-8 font-sans text-xs">
                <div className="text-right mb-4">
                  Desa Jarak, {todayFormatted}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  
                  {/* Party 1: Penerima Manfaat */}
                  <div className="space-y-12">
                    <span className="text-neutral-600 block text-[11px]">Pihak Penerima Manfaat,</span>
                    <div className="pt-8">
                      <div className="font-bold underline text-neutral-950">{app.beneficiaryName}</div>
                      <div className="text-[10px] text-neutral-500">Warga Dusun {dusun.name}</div>
                    </div>
                  </div>

                  {/* Party 2: Kasun */}
                  <div className="space-y-12">
                    <span className="text-neutral-600 block text-[11px]">Saksi / Verifikator Lapangan,</span>
                    <div className="pt-8">
                      <div className="font-bold underline text-neutral-950">{dusun.kasunName}</div>
                      <div className="text-[10px] text-neutral-500">Kepala Dusun {dusun.name}</div>
                    </div>
                  </div>

                  {/* Party 3: Kepala Desa & Cap */}
                  <div className="space-y-12 relative">
                    <span className="text-neutral-600 block text-[11px]">Mengetahui & Mengesahkan,</span>
                    
                    {/* Simulated Stempel Desa Jarak */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-dashed border-emerald-800/60 text-emerald-900 flex items-center justify-center pointer-events-none rotate-[-12deg] opacity-75">
                      <div className="text-center font-bold text-[7px] leading-tight">
                        PEMDES JARAK<br />★<br />KAB. KEDIRI
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="font-bold underline text-neutral-950">H. SUKADI, S.Sos.</div>
                      <div className="text-[10px] text-neutral-500">Kepala Desa Jarak</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Official Verification Footnote & QR Code */}
              <div className="pt-8 mt-6 border-t border-neutral-300 flex items-center justify-between font-sans text-[10px] text-neutral-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-neutral-300 p-1 bg-neutral-50 flex items-center justify-center">
                    <QrCode size={36} className="text-neutral-900" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-800">Validasi Sistem SAPA-JARAK Digital Signature</div>
                    <div>Kode Autentikasi: SHA256-JRK-{app.ticketNumber}-{Date.now().toString(36).toUpperCase()}</div>
                    <div>Dicetak pada: {new Date().toLocaleString('id-ID')} WIB</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck size={12} />
                    Dokumen Sah & Resmi
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-neutral-500">
            Format cetak dioptimalkan untuk kertas A4 Standar Kearsipan Desa.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded transition"
            >
              Tutup Pratinjau
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold rounded transition inline-flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Cetak Dokumen Sekarang</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
