import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  CheckCheck,
} from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
  } catch { return ''; }
};

const getNotifIcon = (notif) => {
  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();
  if (msg.includes('disetujui') || msg.includes('selesai') || msg.includes('bast')) {
    return { icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-950/60', color: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (msg.includes('perbaikan') || msg.includes('catatan') || msg.includes('tindak lanjut')) {
    return { icon: AlertTriangle, bg: 'bg-yellow-100 dark:bg-yellow-950/60', color: 'text-yellow-600 dark:text-yellow-400' };
  }
  if (msg.includes('survei') || msg.includes('direkomendasikan') || msg.includes('diproses')) {
    return { icon: Clock, bg: 'bg-blue-100 dark:bg-blue-950/60', color: 'text-blue-600 dark:text-blue-400' };
  }
  return { icon: Bell, bg: 'bg-gray-100 dark:bg-neutral-800', color: 'text-gray-500 dark:text-gray-400' };
};

export default function WargaNotifikasiView({ readNotifIds, setReadNotifIds }) {
  const { currentUser, applications, notifications } = useApp();
  const [activeFilter, setActiveFilter] = useState('semua');

  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const myNotifs = notifications.filter(
    (n) =>
      n.recipient === currentUser?.phone ||
      myApplications.some((a) => a.ticketNumber === n.ticketNumber)
  );

  const isRead = (id) => readNotifIds.includes(id);

  const markAsRead = (id) => {
    if (!isRead(id)) setReadNotifIds([...readNotifIds, id]);
  };

  const markAllRead = () => {
    setReadNotifIds(myNotifs.map((n) => n.id));
  };

  const filterNotifs = (notifs) => {
    if (activeFilter === 'belum_dibaca') return notifs.filter((n) => !isRead(n.id));
    if (activeFilter === 'status') {
      return notifs.filter((n) => {
        const msg = (n.message || '').toLowerCase();
        return msg.includes('status') || msg.includes('disetujui') || msg.includes('survei') || msg.includes('direkomendasikan');
      });
    }
    if (activeFilter === 'kelengkapan') {
      return notifs.filter((n) => {
        const msg = (n.message || '').toLowerCase();
        return msg.includes('perbaikan') || msg.includes('catatan') || msg.includes('tindak lanjut') || msg.includes('kelengkapan');
      });
    }
    return notifs;
  };

  const displayed = filterNotifs(myNotifs);
  const unreadCount = myNotifs.filter((n) => !isRead(n.id)).length;

  const filters = [
    { id: 'semua', label: 'Semua', count: myNotifs.length },
    { id: 'belum_dibaca', label: 'Belum Dibaca', count: unreadCount },
    { id: 'status', label: 'Status', count: null },
    { id: 'kelengkapan', label: 'Kelengkapan', count: null },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell size={22} className="text-emerald-600" />
            Notifikasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? (
              <span>{unreadCount} notifikasi belum dibaca</span>
            ) : (
              <span>Semua notifikasi sudah dibaca</span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800 whitespace-nowrap"
          >
            <CheckCheck size={14} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 hover:border-emerald-300'
            }`}
          >
            {f.label}
            {f.count != null && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Bell size={32} className="opacity-40" />
          </div>
          <p className="text-sm font-medium">Belum ada notifikasi</p>
          <p className="text-xs mt-1 text-gray-400">
            {activeFilter === 'belum_dibaca'
              ? 'Semua notifikasi sudah dibaca!'
              : 'Notifikasi akan muncul ketika status pengajuan Anda berubah.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif) => {
            const { icon: Icon, bg, color } = getNotifIcon(notif);
            const read = isRead(notif.id);
            return (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  read
                    ? 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 opacity-70'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`text-sm font-bold ${read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'} truncate`}>
                        {notif.title || 'Notifikasi'}
                      </div>
                      {!read && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notif.ticketNumber && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold font-mono mt-0.5">
                        #{notif.ticketNumber}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {formatTime(notif.timestamp)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
