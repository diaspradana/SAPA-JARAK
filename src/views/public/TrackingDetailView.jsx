import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import StatusBadge from '../../components/common/StatusBadge';
import ScoreMeter from '../../components/common/ScoreMeter';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
  ArrowRight,
  Phone,
  User,
  Home,
  Accessibility
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
        speak(`Menampilkan berkas tiket nomor ${found.ticketNumber}`);
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
      speak(`Berkas nomor ${clean} ditemukan`);
    } else {
      setSelectedApp(null);
      showToast(`Nomor tiket #${clean} tidak ditemukan dalam daftar.`, "error");
    }
  };

  const copyTicket = () => {
    if (selectedApp) {
      navigator.clipboard.writeText(selectedApp.ticketNumber);
      showToast(`Nomor tiket #${selectedApp.ticketNumber} disalin!`, "success");
    }
  };

  const openOfficialDoc = (type) => {
    setDocType(type);
    setDocModalOpen(true);
  };

  const relatedNotifs = notifications.filter(n => n.ticketNumber === selectedApp?.ticketNumber);

  // Status step progression helper (0 to 4)
  const getStageStep = (status) => {
    switch (status) {
      case 'SUBMITTED':
      case 'WAITING_KASUN':
        return 1;
      case 'SURVEY_SCHEDULED':
      case 'FORWARDED_TO_DESA':
        return 2;
      case 'FUNDING_APPROVED':
        return 3;
      case 'PROCUREMENT':
      case 'HANDOVER':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStage = selectedApp ? getStageStep(selectedApp.status) : 1;

  const stageTitles = [
    { step: 1, label: "Pendaftaran" },
    { step: 2, label: "Survei Kasun" },
    { step: 3, label: "Validasi Desa" },
    { step: 4, label: "Pengerjaan" },
    { step: 5, label: "Selesai (BAST)" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in-0 duration-200">
      
      {/* Search Header Bar */}
      <Card className="border-border rounded-3xl shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                Buku Register Resmi Desa Jarak
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Lacak Status Permohonan Bantuan
              </h1>
              <p className="text-sm text-muted-foreground">
                Ketik nomor tiket Anda untuk melihat catatan survei kasun dan pencairan dana.
              </p>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={() => { setCurrentView('ajukan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="h-11 px-4 text-xs sm:text-sm font-bold gap-1.5 border-border rounded-xl self-start sm:self-auto"
            >
              <span>+ Ajukan Permohonan Baru</span>
            </Button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Search size={18} />
              </div>
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ketik nomor tiket (Contoh: JRK-2026-001)"
                className="h-12 pl-12 pr-4 font-mono text-sm sm:text-base uppercase rounded-xl border-border"
              />
            </div>

            <Button
              type="submit"
              size="default"
              className="h-12 px-6 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs shrink-0"
            >
              Cari Berkas
            </Button>
          </form>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className="font-semibold">Pilih contoh tiket aktif:</span>
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
                  "px-3 py-1 rounded-lg font-mono text-xs border transition-colors",
                  selectedApp?.ticketNumber === app.ticketNumber
                    ? "bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                #{app.ticketNumber} ({app.beneficiaryName.split(' ')[0]})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedApp ? (
        <div className="space-y-6">
          
          {/* Main Stage Stepper Visualizer */}
          <Card className="border-border rounded-3xl shadow-md p-6 sm:p-8 bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Tahapan Saat Ini
                </span>
                <div className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  {currentStage === 1 && "Menunggu Survei Lapangan Kepala Dusun"}
                  {currentStage === 2 && "Sudah Disurvei — Menunggu Musyawarah Validasi Desa"}
                  {currentStage === 3 && "Anggaran Disetujui — Menunggu Pengerjaan / Pengadaan"}
                  {currentStage === 4 && "Dalam Pengerjaan Swakelola / Pengadaan Unit"}
                  {currentStage === 5 && "Bantuan Telah Diserahkan Resmi (Selesai)"}
                </div>
              </div>
              <StatusBadge status={selectedApp.status} size="lg" />
            </div>

            {/* 5-step progress pill */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {stageTitles.map((s) => {
                const isPassed = currentStage >= s.step;
                const isCurrent = currentStage === s.step;
                return (
                  <div key={s.step} className="space-y-2 text-center">
                    <div 
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        isPassed ? "bg-emerald-600" : "bg-muted"
                      )} 
                    />
                    <div className={cn("text-xs font-bold truncate", isCurrent ? "text-emerald-700 dark:text-emerald-400 font-extrabold" : "text-muted-foreground")}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (8 cols): Summary & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header Document Summary */}
              <Card className="border-border rounded-3xl shadow-sm bg-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-800 dark:text-emerald-300">
                        #{selectedApp.ticketNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyTicket}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Salin Nomor Tiket"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Didaftarkan: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(selectedApp.submittedAt))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOfficialDoc(selectedApp.status === 'COMPLETED' ? 'BAST' : 'TANDA_TERIMA')}
                      className="h-10 px-3.5 gap-2 text-xs font-bold border-border rounded-xl"
                    >
                      <Printer size={15} />
                      <span>Cetak Surat (A4)</span>
                    </Button>
                  </div>
                </div>

                {/* Metadata cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
                    <span className="text-muted-foreground text-xs block">Penerima Bantuan:</span>
                    <div className="text-sm font-extrabold text-foreground">{selectedApp.beneficiaryMaskedName}</div>
                    <p className="text-xs text-muted-foreground">
                      Pelapor: {selectedApp.reporterName} ({selectedApp.reporterRelation})
                    </p>
                  </div>

                  <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
                    <span className="text-muted-foreground text-xs block">Wilayah Domisili:</span>
                    <div className="text-sm font-extrabold text-foreground">
                      Dusun {selectedApp.dusunName} (RT {selectedApp.rt} / RW {selectedApp.rw})
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{selectedApp.address}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-extrabold text-foreground text-xs uppercase tracking-wider block">
                    Kebutuhan Bantuan yang Dilaporkan:
                  </span>
                  <p className="text-foreground bg-muted/30 p-4 rounded-2xl border border-border leading-relaxed text-sm">
                    {selectedApp.description}
                  </p>
                </div>
              </Card>

              {/* Timeline Audit Card */}
              <Card className="border-border rounded-3xl shadow-sm bg-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <CardTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Clock size={18} className="text-emerald-700 dark:text-emerald-400" />
                    <span>Riwayat Penanganan & Survei</span>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {selectedApp.timeline?.length || 0} Catatan Terdaftar
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {selectedApp.timeline?.map((item, idx) => (
                    <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-foreground flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Photos */}
              {selectedApp.photos && (
                <Card className="border-border rounded-3xl shadow-sm bg-card p-6 sm:p-8 space-y-4">
                  <CardTitle className="text-base font-extrabold text-foreground">
                    Dokumentasi Foto Lapangan
                  </CardTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedApp.photos.initial?.map((url, idx) => (
                      <div key={`init-${idx}`} className="rounded-xl border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="Awal" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md font-bold">Foto Pengajuan</span>
                      </div>
                    ))}

                    {selectedApp.photos.survey?.map((url, idx) => (
                      <div key={`surv-${idx}`} className="rounded-xl border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="Survei" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 bg-emerald-700 text-white text-xs px-2 py-0.5 rounded-md font-bold">Survei Kasun</span>
                      </div>
                    ))}

                    {selectedApp.photos.progress100?.map((url, idx) => (
                      <div key={`p100-${idx}`} className="rounded-xl border border-border overflow-hidden aspect-video relative group">
                        <img src={url} alt="100%" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md font-bold">100% Selesai</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            </div>

            {/* Right Column (4 cols): Kasun notes & Action */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Kasun Survey Card */}
              {selectedApp.survey && (
                <div className="space-y-4">
                  <ScoreMeter
                    score={selectedApp.survey.score}
                    recommendation={selectedApp.survey.recommendation}
                  />

                  <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-3">
                    <div className="font-extrabold text-foreground flex items-center gap-2 text-sm">
                      <Award size={16} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Catatan Peninjauan Kasun:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-border leading-relaxed">
                      "{selectedApp.survey.notes}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                      <span className="text-muted-foreground">
                        Kasun: <b>{selectedApp.survey.verifiedBy}</b>
                      </span>
                      <button
                        type="button"
                        onClick={() => openOfficialDoc('REKOMENDASI_KASUN')}
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Lihat Berita Acara →
                      </button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Funding Card */}
              {selectedApp.funding && (
                <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="font-extrabold text-foreground flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Alokasi Anggaran Desa</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      Disetujui
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sumber Dana:</span>
                      <span className="font-bold text-foreground">{selectedApp.funding.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nominal Bantuan:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                        Rp {selectedApp.funding.budget.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* WhatsApp Notification Log */}
              <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="font-extrabold text-foreground flex items-center gap-2 text-sm">
                    <MessageSquare size={16} className="text-emerald-700 dark:text-emerald-400" />
                    <span>Pemberitahuan WhatsApp</span>
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {relatedNotifs.length} Pesan
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {relatedNotifs.length > 0 ? (
                    relatedNotifs.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                        <div className="flex justify-between text-muted-foreground font-semibold">
                          <span className="text-emerald-600 dark:text-emerald-400">Terkirim</span>
                          <span>{new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(n.timestamp))}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Belum ada pesan tercatat untuk nomor tiket ini.</p>
                  )}
                </div>
              </Card>

            </div>

          </div>

        </div>
      ) : (
        <Card className="text-center py-16 p-6 border-border rounded-3xl shadow-sm bg-card">
          <CardContent className="space-y-2">
            <p className="text-base font-bold text-foreground">Nomor tiket tidak ditemukan.</p>
            <p className="text-sm text-muted-foreground">Pastikan format kode tiket sudah benar (contoh: JRK-2026-001).</p>
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
