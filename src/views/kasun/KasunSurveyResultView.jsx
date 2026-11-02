import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { getKasunDusunId } from '../../data/desaConfig';
import { calculateDisabilityScore, calculateRtlhScore } from '../../data/scoringEngine';
import { ArrowLeft, MapPin, Printer, ShieldCheck } from 'lucide-react';

function maskIdentifier(value) {
  return value ? `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}` : '-';
}

function formatDate(value) {
  if (!value) return 'Belum tercatat';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function KasunSurveyResultView() {
  const { applications, currentUser, activeRole, activeTicketNumber, setCurrentView } = useApp();
  const [docModalOpen, setDocModalOpen] = useState(false);

  const authorizedDusunId = getKasunDusunId(currentUser || { role: activeRole });
  const app = applications.find(application =>
    application.ticketNumber === activeTicketNumber
    && application.dusunId === authorizedDusunId
    && application.survey
  );

  if (!app) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <Card className="rounded-2xl">
          <CardContent className="space-y-4 p-6 text-center">
            <ShieldCheck className="mx-auto text-amber-600" size={32} />
            <h1 className="text-lg font-bold">Hasil verifikasi tidak ditemukan</h1>
            <p className="text-sm text-muted-foreground">
              Data mungkin belum diverifikasi atau tidak termasuk wilayah tugas Anda.
            </p>
            <Button onClick={() => setCurrentView('kasun_dashboard')} className="gap-2">
              <ArrowLeft size={16} /> Kembali ke ruang kerja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDisability = app.assistanceType === 'DISABILITAS';
  const beneficiaryName = isDisability
    ? app.beneficiaryMaskedName || 'Warga (identitas terbatas)'
    : app.beneficiaryName || 'Nama belum tersedia';
  const scoringParams = app.survey.scoringParams || {};
  const requiredParams = isDisability
    ? ['disabilityLevel', 'economicCondition', 'healthRecommendation']
    : ['wallCondition', 'floorCondition', 'roofCondition', 'sanitationCondition'];
  const hasSavedScoringParams = requiredParams.every(key => scoringParams[key] != null);
  const scoring = hasSavedScoringParams
    ? (isDisability ? calculateDisabilityScore(scoringParams) : calculateRtlhScore(scoringParams))
    : null;
  const savedScore = app.survey.score;
  const hasMatchingBreakdown = savedScore != null && scoring && Number(savedScore) === scoring.totalScore;
  const coordinates = app.survey.coordinates;
  const mapUrl = coordinates?.lat != null && coordinates?.lng != null
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${coordinates.lat},${coordinates.lng}`)}`
    : null;
  const nextStep = app.status === 'RETURNED'
    ? 'Pengajuan dikembalikan untuk perbaikan. Tinjau kembali catatan dan kondisi sebelum mengirim rekomendasi terbaru.'
    : app.status === 'COMPLETED'
      ? 'Bantuan telah direalisasikan dan dicatat pada sistem.'
      : ['FORWARDED_TO_DESA', 'VILLAGE_REVIEW', 'FUNDING_APPROVED', 'PROCUREMENT', 'HANDOVER'].includes(app.status)
        ? 'Rekomendasi faktual telah diteruskan untuk ditinjau Pemerintah Desa. Penetapan bantuan dilakukan oleh Pemerintah Desa.'
        : 'Hasil pemeriksaan faktual tersimpan. Periksa status pengajuan untuk mengetahui tahapan selanjutnya.';

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCurrentView('kasun_dashboard')}
              aria-label="Kembali ke ruang kerja Kasun"
              className="shrink-0 rounded-lg"
            >
              <ArrowLeft size={17} />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold">#{app.ticketNumber}</span>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <h1 className="mt-1 text-lg font-bold sm:text-xl">Hasil Verifikasi Faktual</h1>
              <p className="text-sm text-muted-foreground">
                {app.assistanceType === 'RTLH' ? 'Perbaikan rumah (RTLH)' : 'Alat bantu disabilitas'} · Dusun {app.dusunName}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setDocModalOpen(true)} className="gap-2 self-start sm:self-auto">
            <Printer size={16} /> Cetak berita acara
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-5">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Data pengajuan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Calon penerima</p>
                <p className="mt-1 font-semibold">{beneficiaryName}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  NIK: {maskIdentifier(app.nik)} · No. KK: {maskIdentifier(app.kkNumber)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Alamat</p>
                <p className="mt-1 font-semibold">RT {app.rt || '-'} / RW {app.rw || '-'}, Dusun {app.dusunName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{app.address || 'Alamat belum tersedia'}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Diverifikasi oleh</p>
                <p className="mt-1 font-semibold">{app.survey.verifiedBy || 'Petugas Kasun'}</p>
                <p className="mt-1 text-xs text-muted-foreground">Tanggal: {formatDate(app.survey.verifiedAt)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Kondisi awal yang dilaporkan</p>
                <p className="mt-1 text-sm">{app.description || 'Tidak ada uraian kondisi.'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan survei lapangan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {app.survey.notes || 'Tidak ada catatan survei.'}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
                >
                  <MapPin size={16} /> Buka lokasi survei di peta
                </a>
              )}
              {app.photos?.survey?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-foreground">Foto survei</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {app.photos.survey.map((url, index) => (
                      <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="aspect-video overflow-hidden rounded-lg border border-border">
                        <img src={url} alt={`Dokumentasi survei ${index + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Penilaian faktual Kasun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold text-muted-foreground">Skor hasil pemeriksaan</p>
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">
                  {savedScore != null ? savedScore : '—'}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/ 100</span>
                </p>
                {app.survey.recommendation && (
                  <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    {app.survey.recommendation}
                  </p>
                )}
              </div>

              {hasMatchingBreakdown ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Rincian kriteria tersimpan</p>
                  {scoring.breakdown.map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                      <span>{item.label}</span>
                      <span className="shrink-0 font-mono text-xs font-semibold">{item.score} / {item.max}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Rincian kriteria tidak tersedia atau tidak cocok dengan skor tersimpan. Skor di atas ditampilkan sesuai catatan server.
                </p>
              )}

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                {nextStep}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Hasil ini adalah rekomendasi berdasarkan pemeriksaan faktual, bukan keputusan final penerima bantuan. Keputusan akhir ditetapkan Pemerintah Desa melalui proses yang berlaku.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        app={app}
        documentType="REKOMENDASI_KASUN"
      />
    </div>
  );
}
