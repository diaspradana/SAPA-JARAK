import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SignaturePad from '../../components/common/SignaturePad';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft, 
  FileCheck2, 
  CheckCircle2, 
  Check,
  Printer,
  ExternalLink
} from 'lucide-react';

export default function DesaHandoverView({ onBack }) {
  const { 
    applications, 
    activeTicketNumber, 
    completeHandoverBAST, 
    setCurrentView,
    showConfirm,
    showToast
  } = useApp();

  const app = applications.find(a => a.ticketNumber === activeTicketNumber) || 
    applications.find(a => a.status === 'HANDOVER' || a.status === 'PROCUREMENT' || a.status === 'COMPLETED') || 
    applications[0];

  const [bastNumber, setBastNumber] = useState(
    app?.handover?.bastNumber || `BAST/${app?.assistanceType || 'RTLH'}/${app?.ticketNumber?.split('-')?.[1] || 'KLS'}/${new Date().getFullYear()}/009`
  );
  const [handoverDate, setHandoverDate] = useState(
    app?.handover?.handoverDate || new Date().toISOString().split('T')[0]
  );
  const [recipientSignature, setRecipientSignature] = useState(null);
  const [isCompleted, setIsCompleted] = useState(app?.status === 'COMPLETED');
  const [docModalOpen, setDocModalOpen] = useState(false);

  const handleFinalPublish = async () => {
    if (!app) return;

    const result = await showConfirm({
      title: 'Sahkan Dokumen BAST & Publikasikan?',
      html: `
        <div class="text-left space-y-2 pt-1 text-xs text-foreground">
          <p>Anda akan mengesahkan <b>Berita Acara Serah Terima #${bastNumber}</b> untuk bantuan <b>${app.assistanceType}</b> kepada <b>${app.beneficiaryName}</b>.</p>
          <div class="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
            Status pengajuan akan menjadi <b class="text-emerald-700 dark:text-emerald-400">SELESAI (COMPLETED)</b> dan masuk ke Open Ledger Transparansi Desa.
          </div>
        </div>
      `,
      confirmButtonText: 'Sahkan BAST Sekarang',
      icon: 'question'
    });

    if (!result.isConfirmed) return;

    completeHandoverBAST(app.ticketNumber, {
      bastNumber,
      handoverDate,
      recipientSignature
    });

    setIsCompleted(true);
    showToast(`BAST #${bastNumber} berhasil disahkan!`, 'success');
  };

  if (!app) {
    return (
      <Card className="p-8 text-center border-border/80">
        <CardContent>
          <p className="text-muted-foreground">Tidak ada berkas untuk serah terima BAST.</p>
          <Button onClick={onBack} variant="outline" size="sm" className="mt-3 font-bold">
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Header */}
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
                  #{app.ticketNumber}
                </Badge>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                Pengesahan Berita Acara Serah Terima (BAST)
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
            <span>Cetak Dokumen BAST (A4)</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Official BAST Letter preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="printable-paper bg-white text-neutral-950 p-6 sm:p-8 space-y-5 font-serif rounded-xl border border-neutral-300 shadow-sm">
            
            {/* Kop Surat Desa Jarak */}
            <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-0.5 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block">
                PEMERINTAH KABUPATEN KEDIRI • KECAMATAN PLOSOKLATEN
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-neutral-950">
                PEMERINTAH DESA JARAK
              </h3>
              <p className="text-[10px] text-neutral-500 italic">
                Jl. Raya Jarak No. 12, Desa Jarak, Plosoklaten, Kediri — 64175
              </p>
            </div>

            <div className="text-center space-y-0.5 font-sans">
              <h4 className="text-xs font-bold uppercase underline">
                BERITA ACARA SERAH TERIMA BANTUAN SOSIAL
              </h4>
              <p className="text-[11px] font-mono text-neutral-600">Nomor: {bastNumber}</p>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-800 leading-relaxed">
              <p>
                Pada hari ini, tanggal <b>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(handoverDate))}</b>, bertempat di Desa Jarak, telah diserahterimakan hasil bantuan sosial:
              </p>

              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 font-sans space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nomor Register:</span>
                  <span className="font-mono font-bold text-neutral-900">#{app.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Kategori:</span>
                  <span className="font-bold text-neutral-900">{app.assistanceType === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni' : 'Alat Bantu Disabilitas'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Penerima Manfaat:</span>
                  <span className="font-bold text-neutral-900">{app.beneficiaryName} (NIK: {app.nik})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Sumber Anggaran:</span>
                  <span className="font-bold text-emerald-900">{app.funding?.source || 'APBDes'} (Rp {app.funding?.budget ? app.funding.budget.toLocaleString('id-ID') : '15.000.000'})</span>
                </div>
              </div>

              <p>
                Bantuan tersebut telah diselesaikan dan diterima dalam keadaan baik serta berfungsi sebagaimana mestinya.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 pt-3 font-sans text-xs text-center border-t border-neutral-200">
              <div className="space-y-8">
                <span className="text-neutral-600 block text-[11px]">Penerima Manfaat:</span>
                <div className="h-12 flex items-center justify-center">
                  {recipientSignature ? (
                    <img src={recipientSignature} alt="Tanda Tangan" className="max-h-12 mx-auto" />
                  ) : (
                    <span className="text-[10px] text-neutral-400 italic">[ Tanda Tangan Digital ]</span>
                  )}
                </div>
                <span className="font-bold text-neutral-950 block border-t border-neutral-300 pt-1 text-[11px]">
                  ( {app.beneficiaryName} )
                </span>
              </div>

              <div className="space-y-8">
                <span className="text-neutral-600 block text-[11px]">Pemerintah Desa Jarak:</span>
                <div className="h-12 flex items-center justify-center">
                  <div className="text-[9px] text-emerald-900 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
                    TERVERIFIKASI SISTEM <br />
                    KASI KESRA DESA JARAK
                  </div>
                </div>
                <span className="font-bold text-neutral-950 block border-t border-neutral-300 pt-1 text-[11px]">
                  ( Pemerintah Desa Jarak )
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Signing & 1-Click Publish */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                Validasi Administrasi & Publikasi
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Bubuhkan tanda tangan sebelum mengesahkan</p>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              
              <div className="space-y-1.5">
                <Label htmlFor="bastNumber">Nomor Register BAST:</Label>
                <Input
                  id="bastNumber"
                  type="text"
                  value={bastNumber}
                  onChange={(e) => setBastNumber(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="handoverDate">Tanggal Serah Terima:</Label>
                <Input
                  id="handoverDate"
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                />
              </div>

              <SignaturePad
                title="Tanda Tangan Digital Penerima"
                onSave={(dataUrl) => setRecipientSignature(dataUrl)}
              />

              <Button
                type="button"
                size="default"
                onClick={handleFinalPublish}
                className="w-full h-10 font-bold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                <Check size={15} />
                <span>Sahkan BAST & Publikasikan ke Transparansi</span>
              </Button>

              {isCompleted && (
                <div className="p-3.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                    <span>BAST Telah Disahkan!</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Data realisasi telah masuk ke Open Ledger Transparansi Desa Jarak.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setCurrentView('transparansi');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-0 h-auto font-bold text-primary dark:text-emerald-400 text-xs"
                  >
                    Buka di Open Ledger Transparansi ➔
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Official Government Printable Document Modal */}
      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        app={app}
        documentType="BAST"
      />

    </div>
  );
}
