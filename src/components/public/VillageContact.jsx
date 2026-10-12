import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, HeartHandshake } from 'lucide-react';
import { DESA_CONFIG } from '../../data/desaConfig';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export default function VillageContact() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Card className="bg-card border-border shadow-xl rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
                🤝 Butuh Bantuan Mengisi Formulir?
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Pusat Pendampingan & Konsultasi Warga Desa Jarak
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl font-normal">
                Bagi warga lanjut usia, penyandang disabilitas, atau yang kesulitan mengisi data lewat HP, jangan ragu untuk menghubungi tim pendamping desa atau Kepala Dusun Anda. Kami siap membantu hingga permohonan selesai diajukan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{DESA_CONFIG.alamatKantor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>{DESA_CONFIG.jamLayanan}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Pemerintah%20Desa%20Jarak,%20saya%20ingin%20konsultasi%20pengajuan%20bantuan%20SAPA-JARAK`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full h-12 gap-2 text-sm sm:text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md">
                  <MessageSquare size={18} />
                  <span>Konsultasi WhatsApp Desa</span>
                </Button>
              </a>

              <div className="p-4 rounded-xl bg-muted/60 border border-border text-center space-y-1">
                <span className="text-muted-foreground text-xs block">Nomor Telepon Kantor Desa:</span>
                <span className="font-mono text-sm font-extrabold text-foreground block">{DESA_CONFIG.teleponKantor}</span>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </section>
  );
}
