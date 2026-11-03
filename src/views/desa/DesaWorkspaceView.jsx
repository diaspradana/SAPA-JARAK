import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import sapaJarakLogo from '../../assets/sapa-jarak-logo.png';
import StatusBadge from '../../components/common/StatusBadge';
import SyncStatusBanner from '../../components/common/SyncStatusBanner';
import DesaValidationView from './DesaValidationView';
import DesaProcurementView from './DesaProcurementView';
import DesaHandoverView from './DesaHandoverView';
import DesaReportsView from './DesaReportsView';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ChevronDown,
  FileCheck2,
  FileText,
  Hammer,
  Home,
  LogOut,
  Menu,
  Map as MapIcon,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Plus,
  Pencil,
  Trash2,
  UserRound,
  UserRoundCog,
  HeartPulse,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS = [
  ['ALL', 'Semua status'],
  ['SUBMITTED', 'Pengajuan diterima'],
  ['WAITING_KASUN', 'Menunggu Kasun'],
  ['KASUN_SURVEY', 'Survei Kasun'],
  ['FORWARDED_TO_DESA', 'Diteruskan ke desa'],
  ['VILLAGE_REVIEW', 'Ditinjau desa'],
  ['FUNDING_APPROVED', 'Disetujui'],
  ['PROCUREMENT', 'Pengadaan'],
  ['HANDOVER', 'Menunggu BAST'],
  ['COMPLETED', 'Selesai'],
  ['RETURNED', 'Dikembalikan'],
  ['REJECTED', 'Tidak memenuhi kriteria']
];

const MENU_ITEMS = [
  { id: 'overview', label: 'Dashboard Utama', icon: BarChart3 },
  { id: 'applications', label: 'Manajemen Pengajuan', icon: FileText },
  { id: 'verification', label: 'Verifikasi Tingkat 2', icon: ClipboardCheck },
  { id: 'validation', label: 'Validasi Data', icon: ShieldCheck },
  { id: 'residents', label: 'Akun Warga', icon: Users },
  { id: 'kasun_accounts', label: 'Akun Kasun', icon: UserRoundCog },
  { id: 'rtlh', label: 'Data RTLH', icon: Home },
  { id: 'disability', label: 'Data Disabilitas', icon: HeartPulse, restricted: true },
  { id: 'recommendations', label: 'Rekomendasi Bantuan', icon: CheckCircle2 },
  { id: 'statistics', label: 'Peta & Statistik', icon: MapIcon },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'audit', label: 'Audit Log', icon: Activity },
  { id: 'users', label: 'Akun Administrator', icon: UserRoundCog, adminOnly: true },
  { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, adminOnly: true },
  { id: 'procurement', label: 'Pengadaan RAB', icon: Hammer },
  { id: 'handover', label: 'BAST & Ledger', icon: FileCheck2, kadesOnly: true },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

const MENU_GROUPS = [
  { id: 'workflow', label: 'Pengajuan & Verifikasi', itemIds: ['applications', 'verification', 'validation', 'recommendations'] },
  { id: 'data', label: 'Data Warga & Wilayah', itemIds: ['residents', 'rtlh', 'disability', 'statistics'] },
  { id: 'operations', label: 'Pelaksanaan & Laporan', itemIds: ['procurement', 'handover', 'reports'] },
  { id: 'accounts', label: 'Manajemen Akun', itemIds: ['kasun_accounts', 'users'] },
  { id: 'administration', label: 'Administrasi Sistem', itemIds: ['audit', 'settings', 'profile'] }
];

function getRoleCategory(user) {
  const identity = `${user?.position || ''} ${user?.roleLabel || ''} ${user?.subtitle || ''} ${user?.name || ''} ${user?.email || ''}`.toLowerCase();
  if (/administrator|admin sistem/.test(identity)) return 'admin';
  if (/kepala desa|kades/.test(identity)) return 'kades';
  if (/sekretaris desa|sekdes|operator desa/.test(identity)) return 'operator';
  return 'verifier';
}

function getPossibleDuplicates(applications) {
  const byNik = new Map();
  const duplicateIds = new Set();
  applications.forEach((application) => {
    const nik = String(application.nik || '').replace(/\D/g, '');
    if (!nik) return;
    if (byNik.has(nik)) {
      duplicateIds.add(byNik.get(nik));
      duplicateIds.add(application.id);
    } else {
      byNik.set(nik, application.id);
    }
  });
  return duplicateIds;
}

function StatCard({ label, value, note, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'text-foreground bg-muted/70',
    warning: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50',
    success: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50',
    info: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/50'
  };
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', tones[tone])}><Icon size={19} /></div>
      </CardContent>
    </Card>
  );
}

function ApplicationTable({ rows, onSelect, onFinalReview, showActions = true }) {
  if (!rows.length) {
    return <p className="p-8 text-center text-sm text-muted-foreground">Tidak ada data yang sesuai dengan filter.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs font-bold">
            <TableHead>No. Tiket</TableHead>
            <TableHead>Nama Penerima</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Dusun / RT</TableHead>
            <TableHead>Skor Kasun</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Tindakan</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((application) => (
            <TableRow key={application.id} className="text-sm">
              <TableCell className="whitespace-nowrap font-mono font-bold text-emerald-700 dark:text-emerald-400">
                #{application.ticketNumber}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="font-bold">{application.beneficiaryName || 'Nama belum tersedia'}</div>
                <div className="text-xs text-muted-foreground">NIK: {application.nik || 'Belum tersedia'}</div>
              </TableCell>
              <TableCell><Badge variant={application.assistanceType === 'RTLH' ? 'success' : 'info'}>{application.assistanceType || 'Lainnya'}</Badge></TableCell>
              <TableCell className="whitespace-nowrap">Dusun {application.dusunName || '-'} / RT {application.rt || '-'}</TableCell>
              <TableCell>{application.survey?.score ?? <span className="text-xs text-muted-foreground">Belum dinilai</span>}</TableCell>
              <TableCell><StatusBadge status={application.status} size="sm" /></TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => onSelect(application)}>
                      Lihat detail
                    </Button>
                    {onFinalReview && application.status === 'FORWARDED_TO_DESA' && (
                      <Button size="sm" className="h-8 bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => onFinalReview(application)}>
                        Tinjau keputusan
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DesaWorkspaceView() {
  const {
    applications: savedApplications,
    currentUser,
    setActiveTicketNumber,
    logout,
    fetchManagedAccounts,
    createManagedAccount,
    updateManagedAccount,
    deleteManagedAccount,
    showToast,
    showConfirm
  } = useApp();
  const applications = Array.isArray(savedApplications) ? savedApplications : [];
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterDusun, setFilterDusun] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openMenuGroup, setOpenMenuGroup] = useState('workflow');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [managedAccounts, setManagedAccounts] = useState([]);
  const [accountHamlets, setAccountHamlets] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    hamlet_id: '',
    status: 'active'
  });
  const [accountsError, setAccountsError] = useState('');
  const roleCategory = getRoleCategory(currentUser);
  const isVillageHead = roleCategory === 'kades';
  const isSystemAdmin = roleCategory === 'admin';
  const duplicateIds = useMemo(() => getPossibleDuplicates(applications), [applications]);

  const visibleMenu = MENU_ITEMS.filter((item) => (
    (!item.adminOnly || isSystemAdmin)
    && (!item.kadesOnly || isVillageHead)
    && (!item.restricted || isVillageHead || roleCategory === 'verifier')
  ));
  const visibleMenuGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: visibleMenu.filter((item) => group.itemIds.includes(item.id))
  })).filter((group) => group.items.length > 0);
  const accountCategory = activeTab === 'kasun_accounts'
    ? 'kasun'
    : activeTab === 'residents'
      ? 'warga'
      : activeTab === 'users'
        ? 'admin'
        : null;

  useEffect(() => {
    const activeGroup = MENU_GROUPS.find((group) => group.itemIds.includes(activeTab));
    if (activeGroup) setOpenMenuGroup(activeGroup.id);
  }, [activeTab]);

  useEffect(() => {
    if (!accountCategory) return undefined;

    let active = true;
    setAccountsLoading(true);
    setAccountsError('');
    fetchManagedAccounts(accountCategory)
      .then(({ users, hamlets: availableHamlets }) => {
        if (!active) return;
        setManagedAccounts(users);
        setAccountHamlets(availableHamlets);
      })
      .catch((error) => {
        if (!active) return;
        setAccountsError(error.message);
        showToast(`Data akun gagal dimuat dari database: ${error.message}`, 'error');
      })
      .finally(() => {
        if (active) setAccountsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accountCategory, currentUser?.token]);

  const reloadManagedAccounts = async (category = accountCategory) => {
    const result = await fetchManagedAccounts(category);
    setManagedAccounts(result.users);
    setAccountHamlets(result.hamlets);
  };

  const openAccountForm = (account = null) => {
    setEditingAccount(account);
    setAccountForm({
      name: account?.name || '',
      email: account?.email || '',
      phone: account?.phone || '',
      password: '',
      hamlet_id: account?.hamlet_id ? String(account.hamlet_id) : '',
      status: account?.status || 'active'
    });
    setAccountFormOpen(true);
  };

  const saveManagedAccount = async (event) => {
    event.preventDefault();
    if (!accountCategory) return;

    setAccountSaving(true);
    setAccountsError('');
    const payload = {
      name: accountForm.name.trim(),
      email: accountForm.email.trim() || null,
      phone: accountForm.phone.trim(),
      status: accountForm.status
    };
    if (accountForm.password) payload.password = accountForm.password;
    if (accountCategory === 'kasun') payload.hamlet_id = Number(accountForm.hamlet_id);

    try {
      if (editingAccount) {
        await updateManagedAccount(accountCategory, editingAccount.id, payload);
        showToast('Akun berhasil diperbarui.', 'success');
      } else {
        await createManagedAccount(accountCategory, payload);
        showToast('Akun berhasil dibuat.', 'success');
      }
      setAccountFormOpen(false);
      setEditingAccount(null);
      await reloadManagedAccounts();
    } catch (error) {
      setAccountsError(error.message);
      showToast(`Perubahan akun gagal disimpan: ${error.message}`, 'error');
    } finally {
      setAccountSaving(false);
    }
  };

  const removeManagedAccount = async (account) => {
    if (!accountCategory) return;
    const confirmation = await showConfirm({
      title: 'Hapus akun ini?',
      text: `Akun ${account.name} akan dihapus dari database dan tidak dapat digunakan untuk masuk.`,
      confirmButtonText: 'Hapus akun',
      confirmColorClass: 'bg-rose-600 hover:bg-rose-700',
      icon: 'warning'
    });
    if (!confirmation.isConfirmed) return;

    try {
      await deleteManagedAccount(accountCategory, account.id);
      showToast('Akun berhasil dihapus.', 'success');
      await reloadManagedAccounts();
    } catch (error) {
      showToast(`Akun gagal dihapus: ${error.message}`, 'error');
    }
  };

  const hamlets = [...new Set(applications.map((application) => application.dusunName).filter(Boolean))].sort();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredApplications = applications.filter((application) => {
    const searchTarget = [
      application.ticketNumber,
      application.beneficiaryName,
      application.nik,
      application.dusunName,
      application.assistanceType
    ].join(' ').toLowerCase();
    return (!normalizedSearch || searchTarget.includes(normalizedSearch))
      && (filterDusun === 'ALL' || application.dusunName === filterDusun)
      && (filterStatus === 'ALL' || application.status === filterStatus)
      && (filterType === 'ALL' || application.assistanceType === filterType);
  });

  const pendingVerification = applications.filter((application) => application.status === 'FORWARDED_TO_DESA');
  const attentionCount = applications.filter((application) => (
    ['FORWARDED_TO_DESA', 'RETURNED', 'WAITING_KASUN'].includes(application.status)
  )).length;
  const activeApplications = applications.filter((application) => !['COMPLETED', 'REJECTED'].includes(application.status)).length;
  const eligibleRecommendations = applications
    .filter((application) => application.status === 'FORWARDED_TO_DESA' || application.status === 'VILLAGE_REVIEW')
    .sort((a, b) => (b.survey?.score || 0) - (a.survey?.score || 0));

  const openApplication = (application, tab = 'applications') => {
    setSelectedApplication(application);
    setActiveTicketNumber(application.ticketNumber);
    setActiveTab(tab);
  };

  const renderApplicationPanel = (title, rows, description, showActions = true, allowFinalReview = false) => (
    <Card className="overflow-hidden rounded-2xl border-border/80">
      <CardHeader className="border-b border-border/60 p-4 sm:p-5">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <ApplicationTable
        rows={rows}
        onSelect={(application) => openApplication(application, activeTab === 'verification' ? 'verification' : 'applications')}
        onFinalReview={allowFinalReview && isVillageHead ? (application) => {
          setActiveTicketNumber(application.ticketNumber);
          setActiveTab('final-approval');
        } : undefined}
        showActions={showActions}
      />
    </Card>
  );

  const renderOverview = () => {
    const byStatus = STATUS_OPTIONS.slice(1).map(([status, label]) => ({
      status,
      label,
      count: applications.filter((application) => application.status === status).length
    })).filter((item) => item.count > 0);
    const needsFollowUp = applications.filter((application) => (
      ['FORWARDED_TO_DESA', 'RETURNED', 'WAITING_KASUN'].includes(application.status)
    )).slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total pengajuan" value={applications.length} note={`${hamlets.length} dusun tercatat`} icon={FileText} />
          <StatCard label="Perlu tindak lanjut" value={attentionCount} note="Antrean verifikasi / dikembalikan" icon={AlertTriangle} tone="warning" />
          <StatCard label="Pengajuan aktif" value={activeApplications} note="Belum selesai atau ditolak" icon={Activity} tone="info" />
          <StatCard label="Potensi data ganda" value={duplicateIds.size} note="Perlu pemeriksaan identitas" icon={ShieldCheck} tone={duplicateIds.size ? 'warning' : 'success'} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="p-4 sm:p-5">
              <CardTitle className="text-base">Distribusi status</CardTitle>
              <p className="text-xs text-muted-foreground">Ringkasan pengajuan seluruh dusun.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {byStatus.length ? byStatus.map((item) => (
                <button key={item.status} type="button" onClick={() => { setFilterStatus(item.status); setActiveTab('applications'); }} className="flex w-full items-center gap-3 text-left">
                  <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{item.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(4, item.count / Math.max(applications.length, 1) * 100)}%` }} />
                  </span>
                  <span className="w-8 text-right font-mono text-xs font-bold">{item.count}</span>
                </button>
              )) : <p className="py-4 text-sm text-muted-foreground">Belum ada data pengajuan.</p>}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="p-4 sm:p-5">
              <CardTitle className="text-base">Perlu ditindaklanjuti</CardTitle>
              <p className="text-xs text-muted-foreground">Prioritaskan berkas yang menunggu pemeriksaan.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsFollowUp.length ? needsFollowUp.map((application) => (
                <button key={application.id} type="button" onClick={() => openApplication(application)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 p-3 text-left hover:bg-muted/40">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{application.beneficiaryName}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">Dusun {application.dusunName} · #{application.ticketNumber}</span>
                  </span>
                  <StatusBadge status={application.status} size="sm" />
                </button>
              )) : <p className="py-4 text-sm text-muted-foreground">Tidak ada pekerjaan mendesak saat ini.</p>}
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('applications')}>Buka semua pengajuan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderApplicationList = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-48 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Cari pengajuan" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, NIK, tiket, kategori..." className="pl-9" />
        </div>
        <select aria-label="Filter dusun" value={filterDusun} onChange={(event) => setFilterDusun(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs">
          <option value="ALL">Semua dusun</option>
          {hamlets.map((hamlet) => <option key={hamlet} value={hamlet}>Dusun {hamlet}</option>)}
        </select>
        <select aria-label="Filter status" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs">
          {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="Filter kategori" value={filterType} onChange={(event) => setFilterType(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs">
          <option value="ALL">Semua kategori</option>
          <option value="RTLH">RTLH</option>
          <option value="DISABILITAS">Disabilitas</option>
        </select>
      </div>
      {renderApplicationPanel(`Daftar pengajuan (${filteredApplications.length})`, filteredApplications, 'Data lintas dusun sesuai kata kunci dan filter.')}
      {selectedApplication && activeTab === 'applications' && (
        <Card className="rounded-2xl border-emerald-600/30">
          <CardHeader className="flex flex-row items-start justify-between gap-3 p-4">
            <div>
              <CardTitle className="text-base">Detail berkas #{selectedApplication.ticketNumber}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{selectedApplication.beneficiaryName} · Dusun {selectedApplication.dusunName}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedApplication(null)}>Tutup</Button>
          </CardHeader>
          <CardContent className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <p><b>NIK:</b> {selectedApplication.nik || 'Belum tersedia'}</p>
            <p><b>No. KK:</b> {selectedApplication.kkNumber || 'Belum tersedia'}</p>
            <p><b>Kontak:</b> {selectedApplication.phone || 'Belum tersedia'}</p>
            <p><b>Alamat:</b> {selectedApplication.address || `Dusun ${selectedApplication.dusunName}, RT ${selectedApplication.rt || '-'}/RW ${selectedApplication.rw || '-'}`}</p>
            <p><b>Pengaju:</b> {selectedApplication.reporterName || 'Tidak tersedia'}</p>
            <p><b>Tanggal masuk:</b> {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleDateString('id-ID') : 'Tidak tersedia'}</p>
            <p className="sm:col-span-2 lg:col-span-3"><b>Deskripsi:</b> {selectedApplication.description || 'Tidak ada keterangan.'}</p>
            <div className="sm:col-span-2 lg:col-span-3">
              <b>Dokumen/foto awal:</b>
              {selectedApplication.photos?.initial?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedApplication.photos.initial.map((photo, index) => <a key={`${photo}-${index}`} href={photo} target="_blank" rel="noreferrer" className="text-emerald-700 underline dark:text-emerald-400">Buka berkas {index + 1}</a>)}
                </div>
              ) : <span className="ml-1 text-muted-foreground">Belum tersedia.</span>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/80">
        <CardContent className="flex items-start gap-3 p-4">
          <ClipboardCheck className="mt-0.5 shrink-0 text-emerald-700" size={19} />
          <div>
            <p className="font-bold">Pemeriksaan ulang hasil Kasun</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cocokkan identitas, dokumen, hasil survei, dan rekomendasi sebelum berkas diproses lebih lanjut.
              {isVillageHead ? ' Persetujuan akhir hanya tersedia untuk akun Kepala Desa.' : ' Halaman ini tidak menerbitkan persetujuan bantuan.'}
            </p>
          </div>
        </CardContent>
      </Card>
      {renderApplicationPanel(`Antrean pemeriksaan (${pendingVerification.length})`, pendingVerification, 'Berkas yang telah diteruskan Kasun kepada Pemerintah Desa.')}
      {selectedApplication && activeTab === 'verification' && (
        <Card className="rounded-2xl border-border/80">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Pemeriksaan tingkat 2 · #{selectedApplication.ticketNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Identitas penerima', Boolean(selectedApplication.nik && selectedApplication.kkNumber)],
                ['Alamat dan wilayah', Boolean(selectedApplication.dusunName && selectedApplication.rt)],
                ['Hasil survei Kasun', Boolean(selectedApplication.survey?.verifiedBy && selectedApplication.survey?.score !== undefined)],
                ['Dokumentasi awal', Boolean(selectedApplication.photos?.initial?.length)]
              ].map(([label, passed]) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-border/70 p-3 text-xs">
                  {passed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-2">
              <p><b>Penerima:</b> {selectedApplication.beneficiaryName} · NIK {selectedApplication.nik || 'belum tersedia'}</p>
              <p><b>Kasun:</b> {selectedApplication.survey?.verifiedBy || 'Belum tercatat'}</p>
              <p><b>Skor:</b> {selectedApplication.survey?.score ?? 'Belum tersedia'} · {selectedApplication.survey?.recommendation || 'Tanpa rekomendasi'}</p>
              <p><b>Pemeriksaan duplikasi NIK:</b> {duplicateIds.has(selectedApplication.id) ? 'Perlu klarifikasi' : 'Tidak terdeteksi pada data saat ini'}</p>
              <p className="sm:col-span-2"><b>Catatan survei:</b> {selectedApplication.survey?.notes || 'Belum ada catatan survei.'}</p>
            </div>
            {isVillageHead && selectedApplication.status === 'FORWARDED_TO_DESA' && (
              <Button onClick={() => setActiveTab('final-approval')} className="bg-emerald-700 text-white hover:bg-emerald-800">Tinjau persetujuan akhir</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderValidation = () => {
    const issues = applications.filter((application) => (
      duplicateIds.has(application.id)
      || !application.nik
      || !application.dusunName
      || !application.rt
      || !application.assistanceType
    ));
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-border/80">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 text-amber-600" size={19} />
            <p className="text-xs text-muted-foreground">Pemeriksaan ini menandai NIK yang muncul pada lebih dari satu pengajuan dan kolom identitas/wilayah yang belum lengkap. Penanda adalah potensi untuk ditinjau, bukan keputusan bahwa data pasti ganda.</p>
          </CardContent>
        </Card>
        {issues.length ? renderApplicationPanel(`Perlu pemeriksaan (${issues.length})`, issues, 'Gunakan detail pengajuan untuk menelusuri data sumber.') : (
          <Card className="rounded-2xl border-border/80"><CardContent className="flex items-center gap-3 p-8 text-sm text-muted-foreground"><CheckCircle2 className="text-emerald-600" /> Tidak ditemukan masalah kelengkapan atau NIK ganda pada data saat ini.</CardContent></Card>
        )}
      </div>
    );
  };

  const renderManagedAccounts = () => {
    const categoryLabels = {
      kasun: { title: 'Manajemen Akun Kasun', description: 'Daftarkan akun Kasun, tetapkan dusun tugas, dan kelola akses masuk.' },
      warga: { title: 'Manajemen Akun Warga', description: 'Kelola akun warga yang terdaftar pada sistem.' },
      admin: { title: 'Manajemen Akun Administrator', description: 'Lihat, perbarui, atau hapus akun administrator sistem.' }
    };
    const config = categoryLabels[accountCategory];
    if (!config) return null;

    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-border/80">
          <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">{config.title}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>
            </div>
            {accountCategory !== 'admin' && (
              <Button size="sm" onClick={() => openAccountForm()} className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800">
                <Plus size={15} /> Tambah akun
              </Button>
            )}
          </CardHeader>
        </Card>

        {accountFormOpen && (editingAccount || accountCategory !== 'admin') && (
          <Card className="rounded-2xl border-border/80">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base">{editingAccount ? 'Ubah akun' : 'Daftarkan akun baru'}</CardTitle>
            </CardHeader>
            <form onSubmit={saveManagedAccount}>
              <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold">
                  Nama lengkap
                  <Input required maxLength={255} value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  Nomor HP
                  <Input required maxLength={30} value={accountForm.phone} onChange={(event) => setAccountForm({ ...accountForm, phone: event.target.value })} />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  Email <span className="font-normal text-muted-foreground">(opsional)</span>
                  <Input type="email" maxLength={255} value={accountForm.email} onChange={(event) => setAccountForm({ ...accountForm, email: event.target.value })} />
                </label>
                {accountCategory === 'kasun' && (
                  <label className="space-y-1.5 text-xs font-semibold">
                    Dusun tugas
                    <select
                      required
                      value={accountForm.hamlet_id}
                      onChange={(event) => setAccountForm({ ...accountForm, hamlet_id: event.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Pilih dusun</option>
                      {accountHamlets.map((hamlet) => (
                        <option key={hamlet.id} value={hamlet.id}>{hamlet.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="space-y-1.5 text-xs font-semibold">
                  Kata sandi {editingAccount && <span className="font-normal text-muted-foreground">(kosongkan jika tidak diubah)</span>}
                  <Input
                    type="password"
                    minLength={8}
                    required={!editingAccount}
                    autoComplete="new-password"
                    value={accountForm.password}
                    onChange={(event) => setAccountForm({ ...accountForm, password: event.target.value })}
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold">
                  Status akun
                  <select
                    value={accountForm.status}
                    onChange={(event) => setAccountForm({ ...accountForm, status: event.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>
                {accountsError && <p role="alert" className="text-xs font-medium text-rose-600 sm:col-span-2">{accountsError}</p>}
                <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setAccountFormOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={accountSaving} className="bg-emerald-700 text-white hover:bg-emerald-800">
                    {accountSaving ? 'Menyimpan...' : editingAccount ? 'Simpan perubahan' : 'Buat akun'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden rounded-2xl border-border/80">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  {accountCategory === 'kasun' && <TableHead>Dusun</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedAccounts.map((account) => {
                  const isCurrentAccount = String(account.id) === String(currentUser?.serverId);
                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <p className="font-semibold">{account.name}{isCurrentAccount ? ' (Akun Anda)' : ''}</p>
                        <p className="text-xs text-muted-foreground">{account.email || 'Email belum diisi'}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{account.phone}</TableCell>
                      {accountCategory === 'kasun' && <TableCell>{account.hamlet?.name || 'Belum ditetapkan'}</TableCell>}
                      <TableCell>
                        <Badge variant={account.status === 'active' ? 'success' : 'outline'}>
                          {account.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="outline" size="sm" onClick={() => openAccountForm(account)} className="gap-1.5">
                            <Pencil size={13} /> Ubah
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isCurrentAccount}
                            onClick={() => removeManagedAccount(account)}
                            className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                            title={isCurrentAccount ? 'Akun yang sedang digunakan tidak dapat dihapus' : 'Hapus akun'}
                          >
                            <Trash2 size={13} /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {accountsLoading && <p className="p-8 text-center text-sm text-muted-foreground">Memuat akun dari database...</p>}
          {!accountsLoading && accountsError && <p role="alert" className="p-8 text-center text-sm text-rose-600">{accountsError}</p>}
          {!accountsLoading && !accountsError && managedAccounts.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">Belum ada akun pada kategori ini.</p>
          )}
        </Card>
      </div>
    );
  };

  const renderRecommendations = () => (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/80">
        <CardContent className="flex items-start gap-3 p-4">
          <CheckCircle2 className="mt-0.5 text-emerald-700" size={19} />
          <p className="text-xs text-muted-foreground">Daftar diurutkan berdasarkan skor survei Kasun tertinggi. Ini merupakan bahan pertimbangan, bukan penetapan penerima atau jaminan memperoleh bantuan.</p>
        </CardContent>
      </Card>
      {renderApplicationPanel(`Calon untuk ditinjau (${eligibleRecommendations.length})`, eligibleRecommendations, 'Kepala Desa meninjau rekomendasi dan memegang kewenangan persetujuan akhir.', true, true)}
    </div>
  );

  const renderStatistics = () => {
    const byHamlet = hamlets.map((hamlet) => ({
      hamlet,
      total: applications.filter((application) => application.dusunName === hamlet).length,
      rtlh: applications.filter((application) => application.dusunName === hamlet && application.assistanceType === 'RTLH').length,
      disability: applications.filter((application) => application.dusunName === hamlet && application.assistanceType === 'DISABILITAS').length
    }));
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border-border/80">
          <CardHeader className="p-4"><CardTitle className="text-base">Persebaran pengajuan per dusun</CardTitle><p className="text-xs text-muted-foreground">Rekap kategori bantuan dan jumlah berkas dari data yang tersedia.</p></CardHeader>
          <CardContent className="space-y-4">
            {byHamlet.length ? byHamlet.map((row) => (
              <div key={row.hamlet} className="space-y-2">
                <div className="flex justify-between text-xs"><b>Dusun {row.hamlet}</b><span>{row.total} pengajuan</span></div>
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  <span className="bg-emerald-600" style={{ width: `${row.total ? row.rtlh / row.total * 100 : 0}%` }} />
                  <span className="bg-blue-500" style={{ width: `${row.total ? row.disability / row.total * 100 : 0}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground">RTLH {row.rtlh} · Disabilitas {row.disability}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Belum ada data dusun.</p>}
            <div className="flex gap-4 border-t border-border/60 pt-3 text-xs"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />RTLH</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500" />Disabilitas</span></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80"><CardContent className="p-4 text-xs text-muted-foreground">Peta geografis belum ditampilkan karena lokasi koordinat hanya tersedia untuk sebagian hasil survei. Statistik di atas menggunakan agregasi dusun agar tidak menampilkan lokasi warga secara tidak perlu.</CardContent></Card>
      </div>
    );
  };

  const renderAudit = () => {
    const events = applications.flatMap((application) => (application.timeline || []).map((entry, index) => ({
      id: `${application.id}-${index}`,
      ticket: application.ticketNumber,
      name: application.beneficiaryName,
      ...entry
    }))).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    return (
      <Card className="overflow-hidden rounded-2xl border-border/80">
        <CardHeader className="border-b border-border/60 p-4"><CardTitle className="text-base">Riwayat aktivitas pengajuan</CardTitle><p className="text-xs text-muted-foreground">Catatan yang tersedia dari linimasa tiap berkas.</p></CardHeader>
        {events.length ? <div className="divide-y divide-border/60">{events.map((event) => (
          <div key={event.id} className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
            <div><p className="text-xs font-bold">{event.title} · #{event.ticket}</p><p className="mt-1 text-xs text-muted-foreground">{event.name} — {event.note || 'Tidak ada catatan'}</p></div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{event.time ? new Date(event.time).toLocaleString('id-ID') : 'Waktu tidak tercatat'}</span>
          </div>
        ))}</div> : <p className="p-8 text-center text-sm text-muted-foreground">Belum ada catatan aktivitas.</p>}
      </Card>
    );
  };

  const renderSettings = () => (
    <Card className="rounded-2xl border-border/80">
      <CardHeader className="p-4"><CardTitle className="text-base">Pengaturan alur kerja</CardTitle><p className="text-xs text-muted-foreground">Informasi konfigurasi yang digunakan dalam aplikasi.</p></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 p-4"><p className="text-xs font-bold">Jenis bantuan</p><p className="mt-1 text-xs text-muted-foreground">RTLH dan bantuan Disabilitas.</p></div>
        <div className="rounded-xl border border-border/70 p-4"><p className="text-xs font-bold">Tahapan</p><p className="mt-1 text-xs text-muted-foreground">Pengajuan → verifikasi Kasun → pemeriksaan desa → keputusan → pelaksanaan → BAST.</p></div>
        <div className="rounded-xl border border-border/70 p-4 sm:col-span-2"><p className="text-xs font-bold">Kewenangan persetujuan</p><p className="mt-1 text-xs text-muted-foreground">Persetujuan akhir bantuan berada pada Kepala Desa; admin sistem mengelola teknis dan tidak otomatis memiliki kewenangan persetujuan.</p></div>
      </CardContent>
    </Card>
  );

  const renderProfile = () => (
    <Card className="max-w-2xl rounded-2xl border-border/80">
      <CardHeader className="p-5"><CardTitle className="text-base">Profil petugas</CardTitle></CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-4"><div className="rounded-full bg-emerald-700 p-3 text-white"><UserRound size={20} /></div><div><p className="font-bold">{currentUser?.name || 'Petugas Desa'}</p><p className="text-xs text-muted-foreground">{currentUser?.position || currentUser?.roleLabel || 'Petugas Pemerintah Desa'}</p></div></div>
        <p className="text-xs text-muted-foreground">{currentUser?.email || currentUser?.phone || 'Kontak tidak tersedia'}</p>
        <Button variant="destructive" onClick={logout} className="gap-2"><LogOut size={15} /> Keluar dari akun</Button>
      </CardContent>
    </Card>
  );

  const titles = Object.fromEntries(MENU_ITEMS.map((item) => [item.id, item.label]));
  const renderActiveView = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'applications') return renderApplicationList();
    if (activeTab === 'verification') return renderVerification();
    if (activeTab === 'validation') return renderValidation();
    if (['residents', 'kasun_accounts', 'users'].includes(activeTab)) return renderManagedAccounts();
    if (activeTab === 'rtlh') return renderApplicationPanel('Rekap data RTLH', applications.filter((application) => application.assistanceType === 'RTLH'), 'Kondisi rumah, hasil penilaian, dan dokumen terkait.', false);
    if (activeTab === 'disability') return renderApplicationPanel('Rekap data Disabilitas', applications.filter((application) => application.assistanceType === 'DISABILITAS'), 'Data dukungan berdasarkan pengajuan bantuan Disabilitas.', false);
    if (activeTab === 'recommendations') return renderRecommendations();
    if (activeTab === 'statistics') return renderStatistics();
    if (activeTab === 'audit') return renderAudit();
    if (activeTab === 'settings' && isSystemAdmin) return renderSettings();
    if (activeTab === 'profile') return renderProfile();
    if (activeTab === 'reports') return <DesaReportsView onBack={() => setActiveTab('overview')} />;
    if (activeTab === 'procurement') return <DesaProcurementView onBack={() => setActiveTab('overview')} />;
    if (activeTab === 'handover' && isVillageHead) return <DesaHandoverView onBack={() => setActiveTab('overview')} />;
    if (activeTab === 'final-approval' && isVillageHead) return <DesaValidationView onBack={() => setActiveTab('recommendations')} />;
    return renderOverview();
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans dark:bg-neutral-950" data-aos="fade-up" data-aos-duration="500">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen w-[250px] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 border-b border-border bg-emerald-900 p-4">
          <img src={sapaJarakLogo} alt="Logo SAPA-JARAK" className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">SAPA-JARAK</p>
            <p className="text-[10px] font-medium text-emerald-200">Ruang Kerja Desa</p>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" className="ml-auto rounded-lg p-1 text-white/75 hover:bg-white/10 hover:text-white lg:hidden">
            <X size={17} />
          </button>
        </div>

        <div className="border-b border-border bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
          <p className="truncate text-sm font-bold text-foreground">{currentUser?.name || 'Petugas Desa'}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{currentUser?.position || currentUser?.roleLabel || 'Petugas Verifikasi'}</p>
        </div>

        <nav aria-label="Menu dashboard desa" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          <button
            type="button"
            onClick={() => {
              setSelectedApplication(null);
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-colors',
              activeTab === 'overview'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <BarChart3 size={15} className="shrink-0" />
            <span>Dashboard Utama</span>
          </button>
          {visibleMenuGroups.map((group) => {
            const GroupIcon = group.items[0].icon;
            const isOpen = openMenuGroup === group.id;
            return (
              <section key={group.id} className="rounded-xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenuGroup(isOpen ? null : group.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-colors',
                    isOpen || group.items.some(item => item.id === activeTab)
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <GroupIcon size={15} className="shrink-0" />
                  <span className="flex-1">{group.label}</span>
                  <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="ml-2 space-y-0.5 border-l border-border py-1 pl-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedApplication(null);
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          aria-current={activeTab === item.id ? 'page' : undefined}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors',
                            activeTab === item.id
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Icon size={15} className="shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.id === 'verification' && pendingVerification.length > 0 && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{pendingVerification.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-2.5 rounded-lg text-sm font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            <LogOut size={16} /> Keluar akun
          </Button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[250px]">
        <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-6 lg:py-7">
          <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
            <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Buka menu desa"
                  aria-expanded={sidebarOpen}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
                >
                  <Menu size={19} />
                </button>
                <img
                  src={sapaJarakLogo}
                  alt="Logo SAPA-JARAK"
                  className="hidden h-12 w-12 shrink-0 rounded-2xl bg-white object-contain sm:block"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">Pemerintah Desa Jarak</Badge>
                    <span className="text-xs text-muted-foreground">Kec. Plosoklaten</span>
                  </div>
                  <h1 className="mt-1 text-xl font-black sm:text-2xl">Dashboard Petugas Desa</h1>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.name || 'Petugas Desa'} · {currentUser?.position || currentUser?.roleLabel || 'Petugas Verifikasi'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="hidden gap-2 self-start sm:inline-flex sm:self-auto"
              >
                <UserRound size={15} /> Profil
              </Button>
            </CardContent>
          </Card>

          <SyncStatusBanner />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-black">{titles[activeTab] || 'Dashboard Utama'}</h2>
            <Badge variant="outline">
              {isVillageHead ? 'Kepala Desa' : isSystemAdmin ? 'Admin Sistem' : roleCategory === 'operator' ? 'Operator Desa' : 'Petugas Verifikasi'}
            </Badge>
          </div>
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
