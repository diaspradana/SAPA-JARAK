import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Siapa yang berhak mengajukan permohonan bantuan melalui SAPA-JARAK?",
      a: "Setiap warga Desa Jarak atau pihak pelapor (keluarga, tetangga, pengurus RT/RW, dan relawan) dapat mendaftarkan warga rentan yang berdomisili di 5 Dusun (Jarak Lor, Jarak Kidul, Kalasan, Sagi, Simbar) yang membutuhkan bantuan alat disabilitas atau rehabilitasi RTLH."
    },
    {
      q: "Bagaimana jika calon penerima bantuan tidak memiliki KTP/KK atau terlantar?",
      a: "Sistem SAPA-JARAK menyediakan opsi 'Warga Terlantar Tanpa Berkas'. Pengajuan tetap dapat didaftarkan, dan Kasun bersama Pemerintah Desa akan memverifikasi fisik di lapangan serta mendampingi penerbitan dokumen kependudukan."
    },
    {
      q: "Bagaimana perlindungan data pribadi dan NIK penerima manfaat?",
      a: "SAPA-JARAK menerapkan standar Privacy by Design. Data pribadi sensitif (NIK lengkap, nomor KK, nomor kontak, alamat privat) hanya dapat diakses oleh petugas internal yang berwenang. Pada buku register dan dashboard keterbukaan publik, identitas penerima disamarkan (contoh: Bpk. S*****)."
    },
    {
      q: "Bagaimana tahapan operasional dari pelaporan hingga bantuan direalisasikan?",
      a: "Tahap 1: Laporan masuk sistem dan terbit nomor tiket. Tahap 2: Kasun melakukan survei lapangan maksimal 3 hari kerja. Tahap 3: Pemdes memvalidasi data dan menetapkan sumber anggaran (APBDes/BKK/Dinsos/BAZNAS). Tahap 4: Pelaksanaan pengerjaan/pengadaan. Tahap 5: Pengesahan BAST dan publikasi open ledger."
    },
    {
      q: "Apakah proses pengajuan ini dipungut biaya?",
      a: "Tidak ada biaya apa pun (100% Bebas Biaya Administrasi). Seluruh alokasi bantuan bersumber resmi dari anggaran pemerintah dan lembaga mitra."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-background border-b border-border/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8" data-aos="fade-up">
        
        <div className="text-center space-y-2.5">
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-muted/50 border-border text-foreground shadow-2xs">
            Pedoman Pelayanan
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Penjelasan mengenai tata cara pendaftaran, kriteria penilaian kasun, dan alokasi dana desa.
          </p>
        </div>

        <div className="space-y-3" data-aos="fade-up" data-aos-delay="100">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card 
                key={idx}
                className={cn(
                  "border-border/80 overflow-hidden shadow-xs transition-colors",
                  isOpen ? "border-primary/50" : ""
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={16} className="text-primary shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown size={16} className={cn("text-muted-foreground shrink-0 transition-transform duration-200", isOpen ? "rotate-180 text-primary" : "")} />
                </button>

                {isOpen && (
                  <CardContent className="px-4.5 pb-4.5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50 animate-in fade-in-0 duration-200">
                    <p className="pt-3">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
