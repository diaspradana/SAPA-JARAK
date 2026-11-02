import React from 'react';
import { AlertCircle, CheckCircle2, Cloud, LoaderCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';

export default function SyncStatusBanner() {
  const { currentUser, syncStatus, syncError, lastSyncedAt, refreshApplications } = useApp();
  const isConnected = Boolean(currentUser?.token);

  const handleRefresh = async () => {
    try {
      await refreshApplications();
    } catch {
      // The context exposes the server error in the banner.
    }
  };

  if (!isConnected) {
    return (
      <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>Mode lokal: sesi ini belum terhubung ke server. Masuk dengan akun server untuk melihat dan memperbarui data bersama.</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        <span className="flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /> Sinkronisasi gagal: {syncError}</span>
        <Button size="sm" variant="outline" onClick={handleRefresh} className="shrink-0 gap-1.5"><RefreshCw size={13} /> Coba lagi</Button>
      </div>
    );
  }

  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
      <span className="flex items-center gap-2">
        {syncStatus === 'syncing' ? <LoaderCircle size={15} className="animate-spin" /> : syncStatus === 'synced' ? <CheckCircle2 size={15} /> : <Cloud size={15} />}
        {syncStatus === 'syncing' ? 'Mengambil data terbaru dari server...' : `Tersinkron dengan server${lastSyncedAt ? ` · ${new Date(lastSyncedAt).toLocaleTimeString('id-ID')}` : ''}`}
      </span>
      <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={syncStatus === 'syncing'} className="h-7 shrink-0 gap-1.5 px-2">
        <RefreshCw size={13} /> Segarkan
      </Button>
    </div>
  );
}
