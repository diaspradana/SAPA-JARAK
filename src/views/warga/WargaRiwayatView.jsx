import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
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

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(isoString));
  } catch { return isoString; }
};

function DetailModal({ app, onClose }) {
  const { showToast } = useApp();

  const handleDownload = () => {
    showToast(`Tanda terima untuk #${app.ticketNumber} sedang diproses...`, 'info');
    setTimeout(() => showToast('Tanda terima berhasil diunduh (simulasi).', 'success'), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">#{app.ticketNumber}</div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5">
              Bantuan {app.assistanceType === 'RTLH' ? 'RTLH' : 'Disabilitas'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 transition-colors"
            >
              <Download size={13} />
              Tanda Terima
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <WargaStatusBadge status={app.status} />
            <span className="text-xs text-gray-400">Diajukan {formatDate(app.submittedAt)}</span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nama Penerima', value: app.beneficiaryName },
              { label: 'Dusun', value: app.dusunName },
              { label: 'RT/RW', value: `RT ${app.rt || '-'} / RW ${app.rw || '-'}` },
              { label: 'Jenis Bantuan', value: app.assistanceType },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">{item.value || '-'}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {app.description && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deskripsi Masalah</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
                {app.description}
              </p>
            </div>
          )}

          {/* Survey */}
          {app.survey && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hasil Survei Kasun</div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Diverifikasi oleh</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{app.survey.verifiedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Skor Kelayakan</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{app.survey.score}/100</span>
                </div>
                {app.survey.recommendation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rekomendasi</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{app.survey.recommendation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Funding */}
          {app.funding && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anggaran Bantuan</div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sumber Dana</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{app.funding.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nilai Bantuan</span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    Rp {Number(app.funding.budget).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {app.timeline && app.timeline.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Riwayat Proses</div>
              <ol className="relative border-l border-gray-200 dark:border-neutral-700 ml-2 space-y-4">
                {[...app.timeline].reverse().map((item, idx) => (
                  <li key={idx} className="ml-4">
                    <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                    <div className="text-[11px] text-gray-400">{item.time}</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title}</div>
                    {item.note && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.note}</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WargaRiwayatView({ onNav }) {
  const { currentUser, applications } = useApp();
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const filtered = myApplications.filter((app) =>
    search === '' ||
    app.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    app.assistanceType?.toLowerCase().includes(search.toLowerCase()) ||
    app.dusunName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText size={22} className="text-emerald-600" />
          Riwayat Pengajuan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Semua pengajuan bantuan yang pernah Anda buat.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nomor tiket, jenis bantuan, dusun..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Stats bar */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{filtered.length}</span> dari {myApplications.length} pengajuan
      </div>

      {/* Table / Card List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Tidak ada pengajuan ditemukan</p>
          {myApplications.length === 0 && (
            <button
              onClick={() => onNav('ajukan')}
              className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Mulai Pengajuan
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden sm:grid grid-cols-[1fr,1fr,auto,auto,auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-neutral-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div>No. Registrasi</div>
            <div>Jenis Bantuan</div>
            <div>Tanggal</div>
            <div>Status</div>
            <div>Aksi</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="px-4 sm:px-5 py-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">#{app.ticketNumber}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {app.assistanceType === 'RTLH' ? 'Bantuan RTLH' : 'Bantuan Disabilitas'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(app.submittedAt)}</div>
                    </div>
                    <WargaStatusBadge status={app.status} />
                  </div>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Eye size={13} /> Lihat Detail
                  </button>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid grid-cols-[1fr,1fr,auto,auto,auto] gap-4 items-center">
                  <div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">#{app.ticketNumber}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Dusun {app.dusunName || '-'}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {app.assistanceType === 'RTLH' ? 'Rumah Tidak Layak Huni' : 'Penyandang Disabilitas'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(app.submittedAt)}</div>
                  <WargaStatusBadge status={app.status} />
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Eye size={13} /> Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <DetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
}
