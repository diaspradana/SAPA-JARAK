import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { DESA_CONFIG } from '../../data/desaConfig';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function VillageContact() {
  return (
    <section className="py-14 sm:py-20 bg-background border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Card className="bg-card border-border/80 shadow-lg text-card-foreground p-6 sm:p-10 relative overflow-hidden" data-aos="fade-up" data-aos-duration="700">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-3.5" data-aos="fade-right" data-aos-delay="100">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Layanan Pendampingan Warga
              </Badge>

              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Pusat Pelayanan & Konsultasi Bantuan Sosial Desa Jarak
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-normal">
                Bagi warga lanjut usia, penyandang disabilitas, atau masyarakat yang membutuhkan pendampingan teknis dalam pengisian data permohonan, silakan hubungi petugas Kasi Kesejahteraan atau Kepala Dusun setempat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                  <span>{DESA_CONFIG.alamatKantor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-primary shrink-0" />
                  <span>{DESA_CONFIG.jamLayanan}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3" data-aos="fade-left" data-aos-delay="150">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Pemerintah%20Desa%20Jarak,%20saya%20ingin%20konsultasi%20pengajuan%20SAPA-JARAK`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full h-11 gap-2 font-bold shadow-md">
                  <MessageSquare size={16} />
                  <span>Konsultasi via WhatsApp Desa</span>
                </Button>
              </a>

              <div className="p-3.5 rounded-lg bg-muted/50 border border-border/60 text-xs text-center space-y-1">
                <span className="text-muted-foreground text-[11px] block">Telepon Kantor Pelayanan:</span>
                <span className="font-mono text-xs font-bold text-foreground block">{DESA_CONFIG.teleponKantor}</span>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </section>
  );
}
