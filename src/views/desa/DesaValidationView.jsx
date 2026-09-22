import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ScoreMeter from '../../components/common/ScoreMeter';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { FUNDING_SOURCES } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  Printer
} from 'lucide-react';

export default function DesaValidationView({ onBack }) {
  const { 
    applications, 
    activeTicketNumber, 
    approveDesaFunding,
    showConfirm,
    showToast
  } = useApp();

  const forwardApp = applications.find(a => a.ticketNumber === activeTicketNumber) || 
    applications.find(a => a.status === 'FORWARDED_TO_DESA') || 
    applications[0];

  const defaultBudget = forwardApp?.assistanceType === 'RTLH' ? 15000000 : 2500000;

  const [selectedFunding, setSelectedFunding] = useState('APBDes / Dana Desa');
  const [budgetAmount, setBudgetAmount] = useState(defaultBudget);
  const [dtksDesil, setDtksDesil] = useState('Desil 1 (Kemiskinan Ekstrem)');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [validationNotes, setValidationNotes] = useState(
    'Berdasarkan hasil survei Kasun dan pencocokan data DTKS, pemohon memenuhi syarat prioritas bantuan desa tahun anggaran 2026.'
  );

  const handleApprove = async () => {
    if (!forwardApp) return;

    const result = await showConfirm({
      title: 'Validasi & Tetapkan Alokasi Anggaran?',
      html: `
        <div class="text-left space-y-2 pt-1 text-xs text-foreground">
          <p>Anda akan mengesahkan persetujuan bantuan untuk berkas <b>#${forwardApp.ticketNumber}</b> atas nama <b>${forwardApp.beneficiaryName}</b>.</p>
          <div class="p-3 bg-muted/50 rounded-lg border border-border space-y-1">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Sumber Dana:</span>
              <span class="font-bold text-foreground">${selectedFunding}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Nominal Anggaran:</span>
              <span class="font-mono font-bold text-primary dark:text-emerald-400">Rp ${Number(budgetAmount).toLocaleString('id-ID')}</span>
            </div>
          </div>
          <p class="text-[11px] text-muted-foreground italic">* Notifikasi penetapan otomatis dikirimkan ke WhatsApp pelapor.</p>
        </div>
      `,
      confirmButtonText: 'Setujui & Terbitkan Disposisi',
      icon: 'question'
    });

    if (!result.isConfirmed) return;

    approveDesaFunding(forwardApp.ticketNumber, {
      source: selectedFunding,
      budget: budgetAmount,
      dtksMatched: true,
      dtksDesil,
      notes: validationNotes
    });

    showToast(`Bantuan tiket #${forwardApp.ticketNumber} disetujui & anggaran ditetapkan!`, 'success');

    if (onBack) onBack();
  };

  if (!forwardApp) {
    return (
      <Card className="p-8 text-center border-border/80">
        <CardContent>
          <p className="text-muted-foreground">Tidak ada pengajuan yang membutuhkan validasi desa saat ini.</p>
          <Button onClick={onBack} variant="outline" size="sm" className="mt-3 font-bold">
            Kembali ke Ringkasan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Header Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 border-border shadow-2xs"
            >
              <ArrowLeft size={15} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono font-bold text-[11px] border-border bg-muted/40">
                  #{forwardApp.ticketNumber}
                </Badge>
                <StatusBadge status={forwardApp.status} size="sm" />
              </div>
              <h2 className="text-sm font-bold text-foreground mt-0.5">
                Validasi Kelayakan DTKS & Penetapan Alokasi APBDes
              </h2>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDocModalOpen(true)}
            className="gap-1.5 font-bold border-border shadow-2xs text-xs"
          >
            <Printer size={13} />
            <span>Cetak SK Kades (A4)</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Kasun Survey Summary */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Data Lapangan</span>
              <CardTitle className="text-xs font-bold text-foreground">Hasil Rekomendasi Kasun {forwardApp.dusunName}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[10px]">Penerima Manfaat:</span>
                <div className="font-bold text-foreground text-xs">{forwardApp.beneficiaryName}</div>
                <p className="text-muted-foreground text-[10px]">
                  Dusun {forwardApp.dusunName}, RT {forwardApp.rt} / RW {forwardApp.rw}
                </p>
              </div>

              {forwardApp.survey && (
                <div className="space-y-2">
                  <ScoreMeter
                    score={forwardApp.survey.score}
                    recommendation={forwardApp.survey.recommendation}
                    compact
                  />
                  <div className="p-2.5 bg-muted/30 rounded-lg border border-border/50 text-[11px] italic text-foreground">
                    "{forwardApp.survey.notes}"
                  </div>
                </div>
              )}

              {forwardApp.photos?.survey && (
                <div className="space-y-1 pt-1">
                  <span className="font-bold text-foreground text-[11px]">Foto Survei Kasun:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {forwardApp.photos.survey.map((url, idx) => (
                      <div key={idx} className="rounded-lg border border-border overflow-hidden aspect-video">
                        <img src={url} alt="Survei" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Funding Allocation Form */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Keputusan Musdes / Pemdes</span>
              <CardTitle className="text-xs font-bold text-foreground">
                Penetapan Sumber Anggaran & Verifikasi DTKS
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="fundingSource">Sumber Alokasi Anggaran:</Label>
                <select
                  id="fundingSource"
                  value={selectedFunding}
                  onChange={(e) => setSelectedFunding(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {FUNDING_SOURCES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="budgetAmount">Plafon Nominal Anggaran (Rp):</Label>
                  <Input
                    id="budgetAmount"
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Number(e.target.value))}
                    className="font-mono font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Standar RTLH: Rp 15 Juta | Alat Disabilitas: Rp 1,5–3,5 Juta
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dtksDesil">Status Klasifikasi DTKS / Kemiskinan:</Label>
                  <select
                    id="dtksDesil"
                    value={dtksDesil}
                    onChange={(e) => setDtksDesil(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Desil 1 (Kemiskinan Ekstrem)">Desil 1 (Kemiskinan Ekstrem)</option>
                    <option value="Desil 2 (Sangat Miskin)">Desil 2 (Sangat Miskin)</option>
                    <option value="Desil 3 (Hampir Miskin)">Desil 3 (Hampir Miskin)</option>
                    <option value="Non-DTKS (Rekomendasi Khusus Musdes)">Non-DTKS (Rekomendasi Khusus Musdes)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="validationNotes">Catatan Pertimbangan Validasi Pemdes:</Label>
                <Textarea
                  id="validationNotes"
                  rows={3}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="border-border"
                >
                  Batal
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleApprove}
                  className="font-bold gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={13} />
                  <span>Sahkan & Terbitkan SK Penetapan</span>
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Official Government Printable Document Modal */}
      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        app={forwardApp}
        documentType="SK_KADES"
      />

    </div>
  );
}
