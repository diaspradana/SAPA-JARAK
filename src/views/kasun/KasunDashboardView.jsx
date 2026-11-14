import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import sapaJarakLogo from '../../assets/sapa-jarak-logo.png';
import StatusBadge from '../../components/common/StatusBadge';
import SyncStatusBanner from '../../components/common/SyncStatusBanner';
import { DUSUN_LIST, getKasunDusunId } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import {
  Accessibility,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileClock,
  FileSearch,
  Home,
  LogOut,
  Menu,
  MapPin,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'incoming', label: 'Pengajuan Masuk', icon: FileSearch },
  { id: 'rtlh', label: 'Verifikasi RTLH', icon: Home },
  { id: 'disability', label: 'Verifikasi Disabilitas', icon: Accessibility },
  { id: 'schedule', label: 'Jadwal Survei', icon: CalendarDays },
  { id: 'results', label: 'Hasil Verifikasi', icon: ClipboardCheck },
  { id: 'revisions', label: 'Perbaikan Data', icon: RotateCcw },
  { id: 'map', label: 'Peta Wilayah', icon: MapPin },
  { id: 'history', label: 'Riwayat Verifikasi', icon: FileClock },
  { id: 'report', label: 'Laporan Dusun', icon: CheckCircle2 },
  { id: 'profile', label: 'Profil', icon: UserCheck },
];

const waitingStatuses = ['SUBMITTED', 'WAITING_KASUN'];
const verifiedStatuses = [
  'FORWARDED_TO_DESA',
  'VILLAGE_REVIEW',
  'FUNDING_APPROVED',
  'PROCUREMENT',
  'HANDOVER',
  'COMPLETED',
];

function formatDate(value) {
  if (!value) return 'Tanggal belum tersedia';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

function displayName(application) {
  if (application.assistanceType === 'DISABILITAS') {
    return application.beneficiaryMaskedName || 'Warga (data terbatas)';
  }
  return application.beneficiaryName || 'Nama belum tersedia';
}

function KasunApplicationList({ applications, onInspect, emptyMessage }) {
  if (!applications.length) {
    return <div className="px-6 py-14 text-center text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="divide-y divide-border">
      {applications.map(application => (
        <div key={application.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                #{application.ticketNumber}
              </span>
              <span className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-bold',
                application.assistanceType === 'RTLH'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              )}>
                {application.assistanceType === 'RTLH' ? 'RTLH' : 'Disabilitas'}
              </span>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <p className="truncate text-sm font-bold text-foreground">{displayName(application)}</p>
            <p className="text-xs text-muted-foreground">
              RT {application.rt || '-'} / RW {application.rw || '-'} · Masuk {formatDate(application.submittedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {application.survey?.score != null && (
              <span className="rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs font-bold text-foreground">
                Skor {application.survey.score}/100
              </span>
            )}
            <Button
              size="sm"
              onClick={() => onInspect(application.ticketNumber)}
              className="gap-1.5 rounded-lg bg-emerald-800 font-bold text-white hover:bg-emerald-700"
            >
              <FileSearch size={14} />
              {application.survey
                ? application.status === 'RETURNED' ? 'Tinjau revisi' : 'Lihat hasil'
                : 'Periksa data'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KasunDashboardView() {
  const {
    applications,
    currentUser,
    theme,
    toggleTheme,
    notifications,
    setIsNotifDrawerOpen,
    updateKasunVisitSchedule,
    showToast,
    setCurrentView,
    setActiveTicketNumber,
    logout,
  } = useApp();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dusunId = getKasunDusunId(currentUser);
  const currentDusun = DUSUN_LIST.find(dusun => dusun.id === dusunId);
  const kasunApps = useMemo(
    () => currentDusun ? applications.filter(application => application.dusunId === currentDusun.id) : [],
    [applications, currentDusun]
  );
  const visitSchedule = Object.fromEntries(
    kasunApps.map(application => [application.ticketNumber, application.surveyScheduledAt || ''])
  );
  const saveVisitSchedule = async (ticketNumber, scheduledAt) => {
    try {
      await updateKasunVisitSchedule(ticketNumber, scheduledAt);
    } catch (error) {
      showToast(error.message || 'Jadwal survei gagal disimpan ke server.', 'error');
    }
  };

  const waitingApps = kasunApps.filter(application => waitingStatuses.includes(application.status));
  const verifiedApps = kasunApps.filter(application => verifiedStatuses.includes(application.status));
  const revisionApps = kasunApps.filter(application => application.status === 'RETURNED');
  const surveyedApps = kasunApps.filter(application => Boolean(application.survey));
  const section = sections.find(item => item.id === activeSection) || sections[0];
  const sectionApplications = useMemo(() => {
    let rows = kasunApps;
    if (activeSection === 'rtlh') rows = rows.filter(application => application.assistanceType === 'RTLH');
    if (activeSection === 'disability') rows = rows.filter(application => application.assistanceType === 'DISABILITAS');
    if (activeSection === 'schedule') rows = rows.filter(application => waitingStatuses.includes(application.status));
    if (activeSection === 'results') rows = surveyedApps;
    if (activeSection === 'revisions') rows = revisionApps;
    if (activeSection === 'history') {
      rows = rows.filter(application => application.timeline?.some(item =>
        ['KASUN_SURVEY', 'RETURNED', 'FORWARDED_TO_DESA'].includes(item.status)
      ));
    }

    const query = search.trim().toLowerCase();
    if (query) {
      rows = rows.filter(application =>
        [application.ticketNumber, application.beneficiaryMaskedName, application.beneficiaryName]
          .some(value => value?.toLowerCase().includes(query))
      );
    }

    return rows;
  }, [activeSection, kasunApps, revisionApps, search, surveyedApps]);

  const handleInspect = ticketNumber => {
    const application = kasunApps.find(item => item.ticketNumber === ticketNumber);
    setActiveTicketNumber(ticketNumber);
    setCurrentView(application?.survey && application.status !== 'RETURNED' ? 'kasun_hasil' : 'kasun_verifikasi');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionChange = sectionId => {
    setActiveSection(sectionId);
    setSearch('');
    setSidebarOpen(false);
  };

  if (!currentDusun) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="rounded-3xl">
          <CardContent className="space-y-3 p-8 text-center">
            <ShieldCheck className="mx-auto text-amber-600" size={34} />
            <h1 className="text-xl font-black">Wilayah tugas belum ditetapkan</h1>
            <p className="text-sm text-muted-foreground">
              Akun ini belum terhubung ke dusun. Data pengajuan tidak ditampilkan sampai wilayah tugas dikonfigurasi oleh administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionTitle = section.id === 'dashboard'
    ? 'Ringkasan pemeriksaan'
    : section.label;

  return (
    <div className="min-h-screen bg-neutral-50 font-sans dark:bg-neutral-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="kasun-sidebar-menu"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-emerald-900 p-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={sapaJarakLogo}
              alt="Logo SAPA-JARAK"
              className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">SAPA-JARAK</p>
              <p className="text-[10px] font-medium text-emerald-200">Menu Kasun</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1 text-white/75 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-border bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <p className="truncate text-sm font-bold text-foreground">Dusun {currentDusun.name}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {currentUser?.name || currentDusun.kasunName}
          </p>
        </div>

        <nav aria-label="Menu Kasun" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {sections.map(item => {
            const Icon = item.icon;
            const badgeCount = item.id === 'incoming' ? waitingApps.length : item.id === 'revisions' ? revisionApps.length : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-emerald-800 text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className={cn(
                    'min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold',
                    activeSection === item.id ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                  )}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-2">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            <LogOut size={17} />
            Keluar
          </Button>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 shadow-xs backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu Kasun"
              aria-expanded={sidebarOpen}
              aria-controls="kasun-sidebar-menu"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu size={20} />
            </button>
            <nav aria-label="Lokasi halaman" className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <span className="hidden font-semibold sm:inline">Ruang Kerja Kasun</span>
              <ChevronRight size={13} className="hidden shrink-0 sm:block" />
              <span className="truncate font-bold text-foreground">{section.label}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-emerald-700" />}
            </button>
            <button
              type="button"
              onClick={() => setIsNotifDrawerOpen(true)}
              aria-label="Buka notifikasi"
              title="Notifikasi"
              className="relative rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSectionChange('profile')}
              aria-label="Buka profil"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-muted sm:px-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                {currentUser?.avatarInitials || currentUser?.name?.charAt(0)?.toUpperCase() || 'K'}
              </span>
              <span className="hidden max-w-[150px] truncate text-xs font-bold text-foreground sm:block">
                {currentUser?.name || currentDusun.kasunName}
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-5 sm:px-6 sm:py-7">
      <Card className="overflow-hidden rounded-3xl border-emerald-900/10 shadow-sm">
        <CardContent className="flex flex-col justify-between gap-4 bg-gradient-to-br from-emerald-950 to-emerald-800 p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-emerald-100">
              <UserCheck size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Ruang kerja Kasun</p>
              <h1 className="mt-1 text-lg font-bold sm:text-xl">{currentUser?.name || currentDusun.kasunName}</h1>
              <p className="mt-1 text-sm text-emerald-100">
                Dusun {currentDusun.name} · RT 01–{String(currentDusun.rtCount).padStart(2, '0')} · Kode {currentDusun.code}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-white/10 p-3 text-xs leading-relaxed text-emerald-50 sm:max-w-sm">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>Kasun memeriksa dan merekomendasikan. Penetapan penerima bantuan dilakukan pada tingkat Pemerintah Desa.</span>
          </div>
        </CardContent>
      </Card>

      <SyncStatusBanner />
      <div className="space-y-5">

      {activeSection === 'profile' ? (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Profil petugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Nama</p><p className="mt-1 font-bold">{currentUser?.name || currentDusun.kasunName}</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Wilayah tanggung jawab</p><p className="mt-1 font-bold">Dusun {currentDusun.name}</p></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeSection === 'dashboard' && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Pengajuan masuk', value: kasunApps.length, icon: FileSearch, color: 'text-sky-600', detail: 'Seluruh berkas di dusun ini' },
                  { label: 'Menunggu pemeriksaan', value: waitingApps.length, icon: Clock3, color: 'text-amber-600', detail: 'Perlu dicocokkan dengan lapangan' },
                  { label: 'Terverifikasi / diteruskan', value: verifiedApps.length, icon: CheckCircle2, color: 'text-emerald-600', detail: 'Sudah diteruskan untuk penilaian desa' },
                  { label: 'Perlu perbaikan', value: revisionApps.length, icon: RotateCcw, color: 'text-rose-600', detail: 'Dikembalikan dengan catatan' },
                ].map(metric => {
                  const Icon = metric.icon;
                  return (
                    <Card key={metric.label} className="rounded-2xl">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{metric.label}</span>
                          <Icon className={metric.color} size={19} />
                        </div>
                        <p className="mt-3 font-mono text-3xl font-black">{metric.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border">
                  <div>
                    <CardTitle>Perlu pemeriksaan</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">Cocokkan informasi formulir dengan kondisi faktual di lapangan.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveSection('incoming')}>Semua pengajuan</Button>
                </CardHeader>
                <KasunApplicationList
                  applications={waitingApps.slice(0, 5)}
                  onInspect={handleInspect}
                  emptyMessage="Tidak ada pengajuan yang menunggu pemeriksaan."
                />
              </Card>

              <Card className="rounded-3xl border-amber-300/70 bg-amber-50/60 dark:bg-amber-950/20">
                <CardContent className="flex items-start gap-3 p-5 text-sm">
                  <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={18} />
                  <p className="text-amber-950 dark:text-amber-100">
                    Informasi warga hanya ditampilkan untuk pemeriksaan wilayah tugas ini. Hasil verifikasi Kasun merupakan rekomendasi, bukan keputusan final penerima bantuan.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection !== 'dashboard' && (
            <Card className="overflow-hidden rounded-3xl">
              <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{sectionTitle} — Dusun {currentDusun.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeSection === 'disability'
                      ? 'Tinjau kebutuhan dukungan yang relevan; identitas ditampilkan secara terbatas.'
                      : 'Data yang ditampilkan dibatasi pada dusun tanggung jawab Anda.'}
                  </p>
                </div>
                {['incoming', 'rtlh', 'disability', 'results', 'revisions'].includes(activeSection) && (
                  <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Cari tiket atau nama"
                    aria-label="Cari pengajuan"
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-700 sm:w-64"
                  />
                )}
              </CardHeader>

              {['incoming', 'rtlh', 'disability', 'results', 'revisions'].includes(activeSection) && (
                <KasunApplicationList
                  applications={sectionApplications}
                  onInspect={handleInspect}
                  emptyMessage="Belum ada data untuk menu ini."
                />
              )}

              {activeSection === 'schedule' && (
                <div className="divide-y divide-border">
                  {!sectionApplications.length ? (
                    <div className="px-6 py-14 text-center text-sm text-muted-foreground">Tidak ada kunjungan lapangan yang menunggu.</div>
                  ) : sectionApplications.map(application => (
                    <div key={application.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">#{application.ticketNumber}</p>
                        <p className="mt-1 font-bold">{displayName(application)} · RT {application.rt || '-'} / RW {application.rw || '-'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{application.address || `Dusun ${currentDusun.name}`} · Masuk {formatDate(application.submittedAt)}</p>
                        <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Status kunjungan: {visitSchedule[application.ticketNumber] ? `terjadwal ${formatDate(visitSchedule[application.ticketNumber])}` : 'belum dijadwalkan'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Tanggal kunjungan
                          <input
                            type="date"
                            value={visitSchedule[application.ticketNumber] || ''}
                            onChange={event => saveVisitSchedule(application.ticketNumber, event.target.value)}
                            className="mt-1 block h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground"
                          />
                        </label>
                        <Button onClick={() => handleInspect(application.ticketNumber)} className="gap-2 bg-emerald-800 text-white hover:bg-emerald-700">
                          <CalendarDays size={15} /> Buka pemeriksaan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'history' && (
                <div className="divide-y divide-border">
                  {!sectionApplications.length ? (
                    <div className="px-6 py-14 text-center text-sm text-muted-foreground">Belum ada riwayat verifikasi di wilayah ini.</div>
                  ) : sectionApplications.map(application => (
                    <div key={application.id} className="space-y-3 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">#{application.ticketNumber}</p>
                          <p className="mt-1 font-bold">{displayName(application)}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{application.survey?.verifiedBy || 'Petugas Kasun'}</span>
                      </div>
                      {(application.timeline || [])
                        .filter(item => ['KASUN_SURVEY', 'RETURNED', 'FORWARDED_TO_DESA'].includes(item.status))
                        .map((item, index) => (
                          <div key={`${item.status}-${index}`} className="ml-1 border-l-2 border-emerald-200 py-1 pl-4">
                            <p className="text-xs font-bold">{item.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.time || 'Waktu tidak tersedia'} · {item.note}</p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'map' && (
                <div className="divide-y divide-border">
                  {!kasunApps.length ? (
                    <div className="px-6 py-14 text-center text-sm text-muted-foreground">Belum ada pengajuan di wilayah ini.</div>
                  ) : kasunApps.map(application => {
                    const coordinates = application.survey?.coordinates;
                    const mapUrl = coordinates
                      ? `https://www.google.com/maps?q=${encodeURIComponent(`${coordinates.lat},${coordinates.lng}`)}`
                      : null;
                    return (
                      <div key={application.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-1 shrink-0 text-emerald-700" size={17} />
                          <div>
                            <p className="font-bold">{displayName(application)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{application.address || `RT ${application.rt || '-'} / RW ${application.rw || '-'}, Dusun ${currentDusun.name}`}</p>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Koordinat belum direkam'}
                            </p>
                          </div>
                        </div>
                        {mapUrl
                          ? <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 self-start text-xs font-bold text-emerald-800 hover:underline dark:text-emerald-300">Buka peta <ArrowUpRight size={13} /></a>
                          : <Button size="sm" variant="outline" onClick={() => handleInspect(application.ticketNumber)}>Catat lokasi saat survei</Button>}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection === 'report' && (
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Total pengajuan', kasunApps.length],
                      ['RTLH', kasunApps.filter(application => application.assistanceType === 'RTLH').length],
                      ['Disabilitas', kasunApps.filter(application => application.assistanceType === 'DISABILITAS').length],
                      ['Survei selesai', surveyedApps.length],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 font-mono text-2xl font-black">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-border">
                    <div className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 text-xs font-bold text-muted-foreground">
                      <span>Hasil pemeriksaan</span><span className="text-right">Jumlah</span>
                    </div>
                    {[
                      ['Menunggu pemeriksaan', waitingApps.length],
                      ['Diteruskan ke Pemerintah Desa', verifiedApps.length],
                      ['Dikembalikan untuk perbaikan', revisionApps.length],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-2 gap-3 border-b border-border/70 px-4 py-3 text-sm last:border-0">
                        <span>{label}</span><span className="text-right font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Rekap ini merangkum pengajuan dan rekomendasi survei di Dusun {currentDusun.name}; bukan penetapan penerima bantuan.</p>
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}
      </div>
        </main>
      </div>
    </div>
  );
}
