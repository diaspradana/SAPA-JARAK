import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Apakah pengajuan bantuan ini dipungut biaya?",
      a: "Sama sekali tidak dipungut biaya (100% Gratis). Seluruh biaya pengadaan alat disabilitas maupun stimulan bahan bangunan RTLH ditanggung dari anggaran resmi desa (APBDes) dan mitra bantuan sosial pemerintah."
    },
    {
      q: "Siapa saja yang boleh mengajukan bantuan ini?",
      a: "Setiap warga Desa Jarak berhak mendaftar. Anda bisa mendaftarkan diri sendiri, atau mendaftarkan anggota keluarga, tetangga dekat, maupun warga lansia/disabilitas yang membutuhkan bantuan di lingkungan RT/RW Anda."
    },
    {
      q: "Bagaimana jika calon penerima tidak memiliki KTP atau lansia sebatang kara?",
      a: "Jangan khawatir, pengajuan tetap bisa diproses! Anda cukup mencentang opsi 'Warga Belum Memiliki KTP' di formulir. Kepala Dusun dan petugas desa akan turun langsung ke lokasi untuk verifikasi fisik sekaligus mendampingi pengurusan dokumen kependudukan."
    },
    {
      q: "Berapa lama waktu yang dibutuhkan sampai Kepala Dusun datang survei?",
      a: "Setelah formulir diajukan dan Anda menerima nomor tiket, laporan langsung diteruskan ke Kepala Dusun terkait. Biasanya Kepala Dusun akan melakukan kunjungan langsung dalam kurun waktu 1 hingga 3 hari kerja."
    },
    {
      q: "Bagaimana cara saya mengetahui perkembangan status pengajuan?",
      a: "Anda akan menerima kabar secara otomatis melalui pesan WhatsApp ke nomor yang didaftarkan. Selain itu, Anda juga dapat mengecek status kapan saja di halaman 'Lacak Permohonan' dengan memasukkan nomor tiket Anda."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div className="text-center space-y-3">
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
            Bantuan & Pertanyaan Umum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Pertanyaan yang Sering Ditanyakan Warga
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Pelajari hal-hal penting seputar pengajuan bantuan, survei kasun, dan transparansi penyaluran.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card 
                key={idx}
                className={cn(
                  "border-border rounded-2xl overflow-hidden shadow-xs transition-colors bg-card",
                  isOpen ? "border-emerald-600/40 ring-1 ring-emerald-600/20" : ""
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <HelpCircle size={18} />
                    </div>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown size={18} className={cn("text-muted-foreground shrink-0 transition-transform duration-200", isOpen ? "rotate-180 text-emerald-700 dark:text-emerald-400" : "")} />
                </button>

                {isOpen && (
                  <CardContent className="px-6 pb-6 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/50 animate-in fade-in-0 duration-200">
                    <p className="pt-4">{faq.a}</p>
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
