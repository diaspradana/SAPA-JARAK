import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import MapLocationPicker from '../../components/common/MapLocationPicker';
import ScoreMeter from '../../components/common/ScoreMeter';
import ImageUploader from '../../components/common/ImageUploader';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { calculateRtlhScore, calculateDisabilityScore } from '../../data/scoringEngine';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../components/ui/dialog';
import { 
  ArrowLeft, 
  Send, 
  RotateCcw, 
  MapPin, 
  Home,
  Accessibility,
  AlertCircle,
  Printer,
  CheckCircle2
} from 'lucide-react';

export default function KasunSurveyView() {
  const { 
    applications, 
    activeTicketNumber, 
    setCurrentView, 
    submitKasunSurvey, 
    showToast,
    showConfirm
  } = useApp();

  const { speak } = useVoice();

  const app = applications.find(a => a.ticketNumber === activeTicketNumber) || applications[0];

  const [rtlhParams, setRtlhParams] = useState({
    wallCondition: app?.survey?.scoringParams?.wallCondition || 'gedek_bambu',
    floorCondition: app?.survey?.scoringParams?.floorCondition || 'tanah',
    roofCondition: app?.survey?.scoringParams?.roofCondition || 'rapuh_bocor_parah',
    sanitationCondition: app?.survey?.scoringParams?.sanitationCondition || 'tidak_ada_mck'
  });

  const [disabilityParams, setDisabilityParams] = useState({
    disabilityLevel: app?.survey?.scoringParams?.disabilityLevel || 'berat_total',
    economicCondition: app?.survey?.scoringParams?.economicCondition || 'ekstrem_desil_1',
    healthRecommendation: app?.survey?.scoringParams?.healthRecommendation || 'rekomendasi_nakes_prioritas'
  });

  const [surveyNotes, setSurveyNotes] = useState(
    app?.survey?.notes || "Kondisi di lapangan sesuai laporan warga. Sangat membutuhkan bantuan dan tanah merupakan milik pribadi sah."
  );
  const [coordinates, setCoordinates] = useState(
    app?.survey?.coordinates || { lat: -7.9045, lng: 112.1894 }
  );
  const [surveyPhotos, setSurveyPhotos] = useState(
    app?.photos?.survey || [
      "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"
    ]
  );

  const [returnNotesModal, setReturnNotesModal] = useState(false);
  const [returnNotesText, setReturnNotesText] = useState("");
  const [docModalOpen, setDocModalOpen] = useState(false);

  const scoreResult = app?.assistanceType === 'RTLH'
    ? calculateRtlhScore(rtlhParams)
    : calculateDisabilityScore(disabilityParams);

  useEffect(() => {
    speak(`Formulir verifikasi survei lapangan untuk tiket ${app?.ticketNumber}.`);
  }, [app?.ticketNumber]);

  const handleForwardToDesa = async () => {
    const result = await showConfirm({
      title: 'Rekomendasikan ke Pemerintah Desa?',
      html: `
        <div class="text-left space-y-2 pt-1 text-xs text-foreground">
          <p>Anda akan meneruskan rekomendasi survei berkas tiket <b>#${app.ticketNumber}</b> atas nama <b>${app.beneficiaryName}</b> ke Kasi Kesejahteraan & Kepala Desa.</p>
          <div class="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
            <span>Skor Faktual:</span>
            <span class="font-mono text-sm font-bold">${scoreResult.totalScore} / 100 Poin</span>
          </div>
        </div>
      `,
      confirmButtonText: 'Ya, Teruskan Rekomendasi',
      cancelButtonText: 'Periksa Kembali',
      icon: 'question'
    });

    if (!result.isConfirmed) return;

    const surveyData = {
      verifiedBy: `Kasun ${app.dusunName}`,
      coordinates,
      notes: surveyNotes,
      scoringParams: app.assistanceType === 'RTLH' ? rtlhParams : disabilityParams,
      score: scoreResult.totalScore,
      recommendation: scoreResult.recommendation,
      surveyPhotos,
      isReturned: false
    };

    submitKasunSurvey(app.ticketNumber, surveyData);
    showToast("Hasil survei berhasil disimpan dan diteruskan ke Pemdes!", "success");
    setCurrentView('kasun_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnWithNotes = async () => {
    if (!returnNotesText.trim()) {
      showToast("Tuliskan alasan pengembalian berkas untuk warga.", "warning");
      return;
    }

    const result = await showConfirm({
      title: 'Kembalikan Berkas ke Warga?',
      html: `
        <div class="text-left space-y-1.5 pt-1 text-xs text-foreground">
          <p>Berkas <b>#${app.ticketNumber}</b> akan dikembalikan ke status revisi dan warga akan menerima notifikasi perbaikan.</p>
          <div class="p-2 bg-amber-500/10 rounded border border-amber-500/20 italic text-amber-800 dark:text-amber-300 text-[11px]">
            "${returnNotesText}"
          </div>
        </div>
      `,
      confirmButtonText: 'Kembalikan Berkas',
      confirmColorClass: 'bg-amber-700 hover:bg-amber-800',
      icon: 'warning'
    });

    if (!result.isConfirmed) return;

    const surveyData = {
      verifiedBy: `Kasun ${app.dusunName}`,
      coordinates,
      notes: surveyNotes,
      scoringParams: app.assistanceType === 'RTLH' ? rtlhParams : disabilityParams,
      score: scoreResult.totalScore,
      recommendation: "Dikembalikan untuk Perbaikan Berkas",
      surveyPhotos,
      isReturned: true,
      returnNotes: returnNotesText
    };

    submitKasunSurvey(app.ticketNumber, surveyData);
    setReturnNotesModal(false);
    showToast("Pengajuan dikembalikan ke warga dengan catatan revisi.", "info");
    setCurrentView('kasun_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!app) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-md mx-auto p-6">
          <p className="text-muted-foreground">Pengajuan tidak ditemukan.</p>
          <Button onClick={() => setCurrentView('kasun_dashboard')} className="mt-3 font-bold">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Action Header Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentView('kasun_dashboard')}
              className="h-8 w-8 border-border shadow-2xs"
            >
              <ArrowLeft size={15} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono font-bold text-[11px] border-border bg-muted/40">
                  #{app.ticketNumber}
                </Badge>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                Workspace Survei Faktual Kasun — Dusun {app.dusunName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDocModalOpen(true)}
              className="gap-1.5 font-bold border-border shadow-2xs text-xs"
            >
              <Printer size={13} />
              <span>Cetak Rekomendasi (A4)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReturnNotesModal(true)}
              className="gap-1.5 font-bold border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-xs"
            >
              <RotateCcw size={13} />
              <span>Kembalikan dg Catatan</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleForwardToDesa}
              className="gap-1.5 font-bold shadow-xs text-xs"
            >
              <Send size={13} />
              <span>Rekomendasikan ke Desa</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Citizen Application Summary */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Bagian 1</span>
              <CardTitle className="text-xs font-bold text-foreground">Data Pendaftaran Pemohon</CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-0.5">
                <span className="text-muted-foreground text-[10px]">Nama Calon Penerima:</span>
                <div className="font-bold text-foreground text-xs">{app.beneficiaryName}</div>
                <div className="font-mono text-muted-foreground text-[10px]">
                  NIK: {app.nik} | No. KK: {app.kkNumber}
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-0.5">
                <span className="text-muted-foreground text-[10px]">Domisili:</span>
                <div className="font-bold text-foreground">
                  Dusun {app.dusunName}, RT {app.rt} / RW {app.rw}
                </div>
                <p className="text-muted-foreground text-[10px]">{app.address}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-0.5">
                <span className="text-muted-foreground text-[10px]">Pelapor:</span>
                <div className="font-bold text-foreground">{app.reporterName} ({app.reporterRelation})</div>
                <p className="font-mono text-muted-foreground text-[10px]">WA: {app.reporterPhone}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-0.5">
                <span className="text-muted-foreground text-[10px]">Uraian Kondisi Awal:</span>
                <p className="text-foreground italic text-[11px] leading-relaxed">
                  "{app.description}"
                </p>
              </div>

              {app.photos?.initial && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-foreground text-[11px]">Foto Pengajuan Awal:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {app.photos.initial.map((url, idx) => (
                      <div key={idx} className="rounded-lg border border-border overflow-hidden aspect-video">
                        <img src={url} alt="Awal" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Kasun Survey Form & Score Engine */}
        <div className="lg:col-span-7 space-y-4">
          
          <ScoreMeter
            score={scoreResult.totalScore}
            breakdown={scoreResult.breakdown}
            recommendation={scoreResult.recommendation}
          />

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Bagian 2</span>
              <CardTitle className="text-xs font-bold text-foreground">
                Form Penilaian Faktual Lapangan ({app.assistanceType})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              
              {/* RTLH Checklist */}
              {app.assistanceType === 'RTLH' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="wallCondition">1. Kondisi Struktur Dinding (25%):</Label>
                    <select
                      id="wallCondition"
                      value={rtlhParams.wallCondition}
                      onChange={(e) => setRtlhParams({ ...rtlhParams, wallCondition: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="gedek_bambu">Anyaman Bambu (Gedek) Lapuk / Bolong (25 Poin)</option>
                      <option value="setengah_tembok_rusak">Setengah Tembok Retak / Miring Parah (18 Poin)</option>
                      <option value="bata_retak">Bata Mentah / Plester Mengelupas (10 Poin)</option>
                      <option value="layak">Tembok Bata Kokoh & Layak (0 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="floorCondition">2. Kondisi Permukaan Lantai (25%):</Label>
                    <select
                      id="floorCondition"
                      value={rtlhParams.floorCondition}
                      onChange={(e) => setRtlhParams({ ...rtlhParams, floorCondition: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="tanah">Lantai Tanah / Berdebu (25 Poin)</option>
                      <option value="semen_pecah">Plester Semen Pecah & Lembab (18 Poin)</option>
                      <option value="ubin_rusak">Ubin Rusak / Sebagian Tanah (10 Poin)</option>
                      <option value="keramik_baik">Keramik Bersih & Baik (0 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="roofCondition">3. Kondisi Rangka Atap & Genteng (25%):</Label>
                    <select
                      id="roofCondition"
                      value={rtlhParams.roofCondition}
                      onChange={(e) => setRtlhParams({ ...rtlhParams, roofCondition: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="rapuh_bocor_parah">Usuk/Reng Lapuk & Rawan Ambruk / Bocor Parah (25 Poin)</option>
                      <option value="reng_rusak">Rangka Kayu Rusak Sebagian & Bocor (18 Poin)</option>
                      <option value="bocor_ringan">Bocor Ringan pada Genteng (10 Poin)</option>
                      <option value="kokoh">Rangka Atap Kokoh & Tidak Bocor (0 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sanitationCondition">4. Ketersediaan Sanitasi / MCK Mandiri (25%):</Label>
                    <select
                      id="sanitationCondition"
                      value={rtlhParams.sanitationCondition}
                      onChange={(e) => setRtlhParams({ ...rtlhParams, sanitationCondition: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="tidak_ada_mck">Tidak Memiliki Jamban / MCK Sendiri (25 Poin)</option>
                      <option value="mck_numpang">Numpang di Tetangga / Sungai (18 Poin)</option>
                      <option value="mck_tidak_layak">MCK Mandiri Sangat Tidak Layak (12 Poin)</option>
                      <option value="mck_mandiri_layak">Memiliki MCK Mandiri Sehat (0 Poin)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Disability Checklist */}
              {app.assistanceType === 'DISABILITAS' && (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="disabilityLevel">1. Tingkat Disabilitas & Ketergantungan (40%):</Label>
                    <select
                      id="disabilityLevel"
                      value={disabilityParams.disabilityLevel}
                      onChange={(e) => setDisabilityParams({ ...disabilityParams, disabilityLevel: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="berat_total">Disabilitas Berat / Total Bedridden (40 Poin)</option>
                      <option value="sedang_ketergantungan">Ketergantungan Sedang / Butuh Alat Gerak (30 Poin)</option>
                      <option value="ringan_adaptif">Disabilitas Ringan / Adaptif (18 Poin)</option>
                      <option value="mandiri">Dapat Beraktivitas Mandiri (5 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="economicCondition">2. Kondisi Ekonomi Keluarga (30%):</Label>
                    <select
                      id="economicCondition"
                      value={disabilityParams.economicCondition}
                      onChange={(e) => setDisabilityParams({ ...disabilityParams, economicCondition: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="ekstrem_desil_1">Desil 1 (Kemiskinan Ekstrem / Tanpa Penghasilan) (30 Poin)</option>
                      <option value="sangat_miskin_desil_2">Desil 2 (Sangat Miskin / Buruh Tani) (22 Poin)</option>
                      <option value="rentan_miskin">Rentan Miskin (14 Poin)</option>
                      <option value="mampu">Keluarga Mampu (0 Poin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="healthRecommendation">3. Rekomendasi Medis Nakes Puskesmas / Bidan Desa (30%):</Label>
                    <select
                      id="healthRecommendation"
                      value={disabilityParams.healthRecommendation}
                      onChange={(e) => setDisabilityParams({ ...disabilityParams, healthRecommendation: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="rekomendasi_nakes_prioritas">Rekomendasi Medis Prioritas Tinggi Dokter Puskesmas (30 Poin)</option>
                      <option value="rekomendasi_bidan_desa">Keterangan Verifikasi Bidan Desa (22 Poin)</option>
                      <option value="keterangan_umum">Keterangan Medis Umum (12 Poin)</option>
                      <option value="tidak_ada">Tanpa Surat Keterangan Nakes (0 Poin)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Geotagging Map */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <Label>Titik Koordinat GPS Geotagging Lokasi Rumah:</Label>
                <MapLocationPicker
                  coordinates={coordinates}
                  onChange={setCoordinates}
                  dusunId={app.dusunId}
                />
              </div>

              {/* Survey Photos */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <ImageUploader
                  photos={surveyPhotos}
                  onChange={setSurveyPhotos}
                  label="Unggah Foto Survei Kasun di Lokasi"
                  helperText="Lampirkan foto peninjauan kasun bersama warga."
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-3 border-t border-border/60">
                <Label htmlFor="surveyNotes">Catatan Berita Acara Survei Lapangan Kasun:</Label>
                <Textarea
                  id="surveyNotes"
                  rows={2}
                  value={surveyNotes}
                  onChange={(e) => setSurveyNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border/60 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReturnNotesModal(true)}
                  className="font-bold border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-xs"
                >
                  Kembalikan dengan Catatan
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleForwardToDesa}
                  className="font-bold gap-1.5 shadow-xs text-xs"
                >
                  <Send size={13} />
                  <span>Simpan & Teruskan ke Pemdes</span>
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* RETURN MODAL */}
      {returnNotesModal && (
        <Dialog open={returnNotesModal} onOpenChange={setReturnNotesModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Kembalikan Berkas ke Warga
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Uraikan dokumen yang perlu diperbaiki atau dilengkapi oleh pelapor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-1">
              <Textarea
                rows={3}
                value={returnNotesText}
                onChange={(e) => setReturnNotesText(e.target.value)}
                placeholder="Contoh: Mohon lengkapi surat pengantar domisili dari Ketua RT..."
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReturnNotesModal(false)}
                className="border-border"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleReturnWithNotes}
                className="font-bold shadow-xs"
              >
                Kirim Pengembalian
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Government Printable Document Modal */}
      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        app={app}
        documentType="REKOMENDASI_KASUN"
      />

    </div>
  );
}
