import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  FileText,
  RefreshCw,
} from 'lucide-react';

const WargaStatusBadge = ({ status }) => {
  const map = {
    WAITING_KASUN: { label: 'Menunggu Verifikasi', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    KASUN_SURVEY: { label: 'Sedang Diperiksa', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    FORWARDED_TO_DESA: { label: 'Sedang Diperiksa', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    VILLAGE_REVIEW: { label: 'Sedang Diperiksa', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    RETURNED: { label: 'Perlu Perbaikan', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    FUNDING_APPROVED: { label: 'Disetujui', color: 'bg-green-100 text-green-800 border-green-200' },
    PROCUREMENT: { label: 'Dalam Pengerjaan', color: 'bg-green-100 text-green-800 border-green-200' },
    HANDOVER: { label: 'Disetujui', color: 'bg-green-100 text-green-800 border-green-200' },
    COMPLETED: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-200' },
  };
  const info = map[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.color}`}>
      {info.label}
    </span>
  );
};

const getProgressPercent = (status) => {
  const map = {
    WAITING_KASUN: 15,
    KASUN_SURVEY: 30,
    FORWARDED_TO_DESA: 45,
    VILLAGE_REVIEW: 55,
    RETURNED: 25,
    FUNDING_APPROVED: 70,
    PROCUREMENT: 85,
    HANDOVER: 90,
    COMPLETED: 100,
    REJECTED: 100,
  };
  return map[status] || 0;
};

const getStatusExplanation = (status) => {
  const map = {
    WAITING_KASUN: 'Pengajuan Anda sudah diterima dan sedang menunggu verifikasi dari Kepala Dusun setempat.',
    KASUN_SURVEY: 'Kepala Dusun sedang melakukan survei lapangan untuk memverifikasi kondisi di lokasi Anda.',
    FORWARDED_TO_DESA: 'Kepala Dusun telah merekomendasikan pengajuan Anda ke Pemerintah Desa untuk divalidasi lebih lanjut.',
    VILLAGE_REVIEW: 'Pemerintah Desa sedang meninjau dan memvalidasi pengajuan Anda.',
    RETURNED: 'Pengajuan Anda memerlukan perbaikan atau kelengkapan dokumen. Silakan hubungi Kasun atau Balai Desa.',
    FUNDING_APPROVED: 'Pengajuan Anda telah disetujui dan anggaran bantuan telah ditetapkan.',
    PROCUREMENT: 'Proses pengadaan/pengerjaan bantuan sedang berlangsung.',
    HANDOVER: 'Bantuan siap diserahterimakan kepada Anda.',
    COMPLETED: 'Bantuan telah berhasil diserahterimakan. Terima kasih telah menjadi bagian program ini.',
    REJECTED: 'Maaf, pengajuan Anda tidak dapat diproses lebih lanjut. Lihat catatan penolakan untuk detail.',
  };
  return map[status] || 'Status tidak diketahui.';
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(isoString));
  } catch { return isoString; }
};

function ApplicationCard({ app }) {
  const [expanded, setExpanded] = useState(false);
  const progress = getProgressPercent(app.status);
  const isRejected = app.status === 'REJECTED';
  const isCompleted = app.status === 'COMPLETED';
  const isReturned = app.status === 'RETURNED';

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-2xl border shadow-sm transition-all ${
      expanded ? 'border-emerald-200 dark:border-emerald-800' : 'border-gray-100 dark:border-neutral-800'
    } hover:shadow-md`}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/60' :
            isRejected ? 'bg-red-100 dark:bg-red-950/60' :
            isReturned ? 'bg-yellow-100 dark:bg-yellow-950/60' :
            'bg-blue-100 dark:bg-blue-950/60'
          }`}>
            {isCompleted ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> :
             isRejected ? <XCircle size={18} className="text-red-600 dark:text-red-400" /> :
             isReturned ? <AlertTriangle size={18} className="text-yellow-600 dark:text-yellow-400" /> :
             <Clock size={18} className="text-blue-600 dark:text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  #{app.ticketNumber}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  Bantuan {app.assistanceType === 'RTLH' ? 'Rumah Tidak Layak Huni (RTLH)' : 'Penyandang Disabilitas'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatDate(app.submittedAt)} · Dusun {app.dusunName || '-'}
                </div>
              </div>
              <WargaStatusBadge status={app.status} />
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Progres Pengajuan</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : isRejected ? 'bg-red-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="shrink-0 text-gray-400 mt-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-neutral-800 px-4 sm:px-5 pb-5 pt-4 space-y-4">
          {/* Status Explanation */}
          <div className={`rounded-xl p-3 text-sm flex items-start gap-2 ${
            isReturned ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200' :
            isRejected ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200' :
            isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200' :
            'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200'
          }`}>
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>{getStatusExplanation(app.status)}</span>
          </div>

          {/* Return/Reject notes */}
          {(isReturned || isRejected) && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
              <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Catatan dari Petugas:</div>
              <p className="text-sm text-red-800 dark:text-red-300">
                {app.timeline?.findLast((t) => t.status === app.status)?.note || '-'}
              </p>
            </div>
          )}

          {/* Timeline */}
          {app.timeline && app.timeline.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Riwayat Proses
              </div>
              <ol className="relative border-l border-gray-200 dark:border-neutral-700 ml-2 space-y-4">
                {[...app.timeline].reverse().map((item, idx) => (
                  <li key={idx} className="ml-4">
                    <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                    <div className="text-xs text-gray-400 dark:text-gray-500">{item.time}</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title}</div>
                    {item.note && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.note}</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Survey info */}
          {app.survey && (
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-gray-700 dark:text-gray-300">Hasil Survei Kasun</div>
              <div className="text-gray-600 dark:text-gray-400">Skor Kelayakan: <span className="font-bold text-emerald-600 dark:text-emerald-400">{app.survey.score}/100</span></div>
              {app.survey.recommendation && (
                <div className="text-gray-600 dark:text-gray-400">Rekomendasi: {app.survey.recommendation}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WargaStatusPengajuanView({ onNav }) {
  const { currentUser, applications } = useApp();
  const [activeTab, setActiveTab] = useState('semua');

  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const activeStatuses = ['WAITING_KASUN', 'KASUN_SURVEY', 'FORWARDED_TO_DESA', 'VILLAGE_REVIEW', 'FUNDING_APPROVED', 'PROCUREMENT', 'HANDOVER'];

  const tabs = [
    { id: 'semua', label: 'Semua', count: myApplications.length },
    { id: 'aktif', label: 'Aktif', count: myApplications.filter((a) => activeStatuses.includes(a.status)).length },
    { id: 'selesai', label: 'Selesai', count: myApplications.filter((a) => a.status === 'COMPLETED').length },
    { id: 'ditolak', label: 'Ditolak/Dikembalikan', count: myApplications.filter((a) => a.status === 'REJECTED' || a.status === 'RETURNED').length },
  ];

  const filteredApps = myApplications.filter((app) => {
    if (activeTab === 'aktif') return activeStatuses.includes(app.status);
    if (activeTab === 'selesai') return app.status === 'COMPLETED';
    if (activeTab === 'ditolak') return app.status === 'REJECTED' || app.status === 'RETURNED';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock size={22} className="text-emerald-600" />
          Status Pengajuan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pantau progres semua pengajuan bantuan Anda secara real-time.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 hover:border-emerald-300'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Application List */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Tidak ada pengajuan di kategori ini</p>
          <button
            onClick={() => onNav('ajukan')}
            className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Ajukan Bantuan Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
