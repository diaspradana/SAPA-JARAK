import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import StatusBadge from '../../components/common/StatusBadge';
import ScoreMeter from '../../components/common/ScoreMeter';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  MessageSquare, 
  Building2, 
  FileCheck2,
  Award,
  Printer,
  FileText,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TrackingDetailView() {
  const { 
    applications, 
    activeTicketNumber, 
    setActiveTicketNumber, 
    setCurrentView,
    notifications,
    showToast 
  } = useApp();

  const { speak } = useVoice();

  const [searchInput, setSearchInput] = useState(activeTicketNumber || '');
  const [selectedApp, setSelectedApp] = useState(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('TANDA_TERIMA');

  useEffect(() => {
    if (activeTicketNumber) {
      setSearchInput(activeTicketNumber);
      const found = applications.find(a => a.ticketNumber.toUpperCase() === activeTicketNumber.toUpperCase());
      setSelectedApp(found || null);
      if (found) {
        speak(`Menampilkan berkas tiket ${found.ticketNumber}, status: ${found.status}`);
      }
    } else if (applications.length > 0) {
      setSelectedApp(applications[0]);
      setSearchInput(applications[0].ticketNumber);
    }
  }, [activeTicketNumber, applications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase().replace('#', '');
    const found = applications.find(a => a.ticketNumber.toUpperCase() === clean);
    if (found) {
      setSelectedApp(found);
      setActiveTicketNumber(found.ticketNumber);
    } else {
      setSelectedApp(null);
      showToast(`Nomor tiket #${clean} tidak ditemukan.`, "error");
    }
  };

  const copyTicket = () => {
    if (selectedApp) {
      navigator.clipboard.writeText(selectedApp.ticketNumber);
      showToast(`Nomor tiket #${selectedApp.ticketNumber} disalin.`, "success");
    }
  };

  const openOfficialDoc = (type) => {
    setDocType(type);
    setDocModalOpen(true);
  };

  const relatedNotifs = notifications.filter(n => n.ticketNumber === selectedApp?.ticketNumber);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Search Header Bar */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Badge variant="outline" className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-border bg-muted/40 text-foreground">
                Buku Register Bantuan
              </Badge>
              <h1 className="text-lg sm:text-xl font-black text-foreground mt-1">
                Pelacakan Status Berkas Permohonan
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-bold gap-1 self-start sm:self-auto border-border shadow-2xs"
            >
              <span>+ Buat Pengajuan Baru</span>
            </Button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search size={15} />
              </div>
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Masukkan nomor tiket (Contoh: JRK-2026-001)"
                className="pl-9 font-mono text-xs uppercase"
              />
            </div>

            <Button
              type="submit"
              size="default"
              className="font-bold shrink-0 shadow-xs"
            >
              Cari Berkas
            </Button>
          </form>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-muted-foreground text-[11px]">
            <span>Pilih contoh tiket terdaftar:</span>
            {applications.slice(0, 5).map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setSearchInput(app.ticketNumber);
                  setActiveTicketNumber(app.ticketNumber);
                  setSelectedApp(app);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md font-mono text-[10px] border transition-colors",
                  selectedApp?.ticketNumber === app.ticketNumber
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-background text-foreground border-border hover:bg-muted/60"
                )}
              >
                #{app.ticketNumber}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedApp ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Case Details & Timeline */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Document Summary */}
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black font-mono text-foreground">
                        #{selectedApp.ticketNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyTicket}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Salin Nomor Tiket"
                      >
                        <Copy size={13} />
                      </Button>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Tanggal Pendaftaran: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(selectedApp.submittedAt))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOfficialDoc(selectedApp.status === 'COMPLETED' ? 'BAST' : 'TANDA_TERIMA')}
                      className="gap-1.5 font-bold border-border shadow-2xs"
                    >
                      <Printer size={13} />
                      <span>Cetak Dokumen (A4)</span>
                    </Button>
                    <StatusBadge status={selectedApp.status} size="lg" />
                  </div>
                </div>

                {/* Grid metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Penerima Manfaat (Privasi Terjaga):</span>
                    <div className="font-bold text-foreground text-xs">{selectedApp.beneficiaryMaskedName}</div>
                    <p className="text-muted-foreground text-[10px]">
                      Pelapor: {selectedApp.reporterName} ({selectedApp.reporterRelation})
                    </p>
                  </div>

                  <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Wilayah Administrasi:</span>
                    <div className="font-bold text-foreground text-xs">
                      Dusun {selectedApp.dusunName} (RT {selectedApp.rt} / RW {selectedApp.rw})
                    </div>
                    <p className="text-muted-foreground text-[10px] truncate">{selectedApp.address}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-[11px] uppercase tracking-wide block">
                    Uraian Kebutuhan Bantuan:
                  </span>
                  <p className="text-foreground bg-muted/30 p-3 rounded-lg border border-border/60 leading-relaxed text-xs">
                    {selectedApp.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail Timeline */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                    <Clock size={15} className="text-primary" />
                    <span>Riwayat Audit & Verifikasi Berjenjang</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    {selectedApp.timeline?.length || 0} Catatan Terdaftar
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3">
                {selectedApp.timeline?.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-muted/40 rounded-lg border border-border/60 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-5.5 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Photos */}
            {selectedApp.photos && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                    Dokumentasi Foto Faktual Lapangan
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedApp.photos.initial?.map((url, idx) => (
                      <div key={`init-${idx}`} className="rounded-lg border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="Awal" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Foto Warga</span>
                      </div>
                    ))}

                    {selectedApp.photos.survey?.map((url, idx) => (
                      <div key={`surv-${idx}`} className="rounded-lg border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="Survei" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1.5 left-1.5 bg-primary/90 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-bold">Survei Kasun</span>
                      </div>
                    ))}

                    {selectedApp.photos.progress100?.map((url, idx) => (
                      <div key={`p100-${idx}`} className="rounded-lg border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="100%" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">100% Selesai</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column: Case Verification Details */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Score Summary */}
            {selectedApp.survey && (
              <div className="space-y-3">
                <ScoreMeter
                  score={selectedApp.survey.score}
                  recommendation={selectedApp.survey.recommendation}
                />

                <Card className="border-border/80 shadow-xs">
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Award size={14} className="text-primary" />
                      <span>Catatan Lapangan Kasun:</span>
                    </div>
                    <p className="text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg border border-border/60 text-[11px] leading-relaxed">
                      "{selectedApp.survey.notes}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">
                        Petugas: <b>{selectedApp.survey.verifiedBy}</b>
                      </span>
                      <button
                        type="button"
                        onClick={() => openOfficialDoc('REKOMENDASI_KASUN')}
                        className="text-[11px] text-primary font-bold hover:underline"
                      >
                        Lihat Berita Acara ➔
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Funding Allocation */}
            {selectedApp.funding && (
              <Card className="border-border/80 shadow-xs">
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Building2 size={14} className="text-primary" />
                      <span>Penetapan Anggaran Pemdes</span>
                    </span>
                    <Badge variant="success" className="text-[9px] px-1.5 py-0">
                      Disetujui
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sumber Dana:</span>
                      <span className="font-bold text-foreground">{selectedApp.funding.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alokasi Biaya:</span>
                      <span className="font-mono font-bold text-primary dark:text-emerald-400">
                        Rp {selectedApp.funding.budget.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kriteria DTKS:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedApp.funding.dtksDesil || 'Terverifikasi'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* BAST Status if completed */}
            {selectedApp.handover && (
              <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                      <FileCheck2 size={15} />
                      <span>Berita Acara Serah Terima (BAST)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openOfficialDoc('BAST')}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      Buka BAST (A4)
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Nomor: <b className="text-foreground">{selectedApp.handover.bastNumber}</b> <br />
                    Bantuan telah diserahterimakan dan disahkan kedua pihak.
                  </p>
                  <div className="pt-1">
                    <Badge variant="success" className="text-[10px] font-bold">
                      ✓ Sah & Terpublikasi ke Open Ledger
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Simulated WhatsApp Log */}
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Log Notifikasi WhatsApp</span>
                  </span>
                  <Badge variant="outline" className="text-[9px] font-mono border-border">
                    {relatedNotifs.length} Pesan
                  </Badge>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                  {relatedNotifs.length > 0 ? (
                    relatedNotifs.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terkirim</span>
                          <span>{new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(n.timestamp))}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-4">Belum ada riwayat pesan untuk nomor ini.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      ) : (
        <Card className="text-center py-12 p-6 border-border/80 shadow-xs">
          <CardContent>
            <p className="text-muted-foreground">Nomor tiket tidak ditemukan dalam pangkalan data.</p>
          </CardContent>
        </Card>
      )}

      {/* Official Government Printable Document Modal */}
      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        app={selectedApp}
        documentType={docType}
      />

    </div>
  );
}
