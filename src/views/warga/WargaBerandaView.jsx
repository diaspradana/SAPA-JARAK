import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Bell,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

// Status badge (warga-friendly)
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
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(isoString));
  } catch { return isoString; }
};

export default function WargaBerandaView({ onNav }) {
  const { currentUser, applications, notifications } = useApp();

  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const activeStatuses = ['WAITING_KASUN', 'KASUN_SURVEY', 'FORWARDED_TO_DESA', 'VILLAGE_REVIEW', 'FUNDING_APPROVED', 'PROCUREMENT', 'HANDOVER'];
  const stats = {
    total: myApplications.length,
    aktif: myApplications.filter((a) => activeStatuses.includes(a.status)).length,
    selesai: myApplications.filter((a) => a.status === 'COMPLETED').length,
    ditolak: myApplications.filter((a) => a.status === 'REJECTED' || a.status === 'RETURNED').length,
  };

  const recentApps = myApplications.slice(0, 3);
  const recentNotifs = notifications
    .filter((n) => n.recipient === currentUser?.phone || myApplications.some((a) => a.ticketNumber === n.ticketNumber))
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 19 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-10">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black shadow-inner shrink-0">
              {currentUser?.avatarInitials || currentUser?.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div>
              <div className="text-emerald-100 text-sm font-medium">{greeting},</div>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5 leading-tight">
                {currentUser?.name || 'Pengguna'}!
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                {currentUser?.dusunName ? `Warga Dusun ${currentUser.dusunName}, Desa Jarak` : 'Warga Desa Jarak'}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onNav('ajukan')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              Ajukan Bantuan
            </button>
            <button
              onClick={() => onNav('status')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur text-white text-sm font-bold hover:bg-white/25 transition-colors border border-white/20"
            >
              <Clock size={15} />
              Cek Status
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Pengajuan', value: stats.total, icon: FileText, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Pengajuan Aktif', value: stats.aktif, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Selesai', value: stats.selesai, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Ditolak/Dikembalikan', value: stats.ditolak, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={s.color} />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'ajukan', label: 'Ajukan Bantuan', icon: PlusCircle, color: 'bg-emerald-600 hover:bg-emerald-700', desc: 'RTLH & Disabilitas' },
            { id: 'status', label: 'Status Pengajuan', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700', desc: 'Pantau progres' },
            { id: 'notifikasi', label: 'Notifikasi', icon: Bell, color: 'bg-orange-500 hover:bg-orange-600', desc: 'Pesan masuk' },
            { id: 'informasi', label: 'Info Bantuan', icon: FileText, color: 'bg-purple-600 hover:bg-purple-700', desc: 'Syarat & ketentuan' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`${item.color} text-white rounded-xl p-4 text-left transition-colors shadow-sm hover:shadow-md`}
              >
                <Icon size={22} className="mb-2 opacity-90" />
                <div className="text-sm font-bold">{item.label}</div>
                <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengajuan Terakhir</h2>
            <button onClick={() => onNav('riwayat')} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight size={13} />
            </button>
          </div>
          {recentApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700 p-8 text-center text-gray-400 dark:text-gray-600">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada pengajuan</p>
              <p className="text-xs mt-1">Mulai ajukan bantuan sekarang!</p>
              <button
                onClick={() => onNav('ajukan')}
                className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Ajukan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => onNav('status')}
                  className="w-full text-left bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                        #{app.ticketNumber}
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {app.assistanceType === 'RTLH' ? 'Bantuan RTLH' : 'Bantuan Disabilitas'}
                      </div>
                    </div>
                    <WargaStatusBadge status={app.status} />
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(app.submittedAt)} · Dusun {app.dusunName || '-'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notifikasi Terbaru</h2>
            <button onClick={() => onNav('notifikasi')} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
              Semua <ArrowRight size={13} />
            </button>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-700 p-8 text-center text-gray-400 dark:text-gray-600">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Bell size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {notif.title || 'Notifikasi'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {notif.timestamp ? formatDate(notif.timestamp) : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info / Contact Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <PhoneCall size={20} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">Butuh Bantuan?</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Hubungi Kantor Balai Desa Jarak atau kirim pengaduan melalui aplikasi ini.
          </div>
        </div>
        <button
          onClick={() => onNav('pengaduan')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
        >
          <MessageCircle size={14} />
          Kirim Pengaduan
        </button>
      </div>
    </div>
  );
}
