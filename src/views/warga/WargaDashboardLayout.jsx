import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  FileText,
  Bell,
  Info,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  Home,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import SyncStatusBanner from '../../components/common/SyncStatusBanner';

// Sub-views
import WargaBerandaView from './WargaBerandaView';
import WargaStatusPengajuanView from './WargaStatusPengajuanView';
import WargaRiwayatView from './WargaRiwayatView';
import WargaNotifikasiView from './WargaNotifikasiView';
import WargaInformasiBantuanView from './WargaInformasiBantuanView';
import WargaPengaduanView from './WargaPengaduanView';
import WargaProfilView from './WargaProfilView';
import SubmissionWizardView from '../public/SubmissionWizardView';

const BREADCRUMB_LABELS = {
  beranda: 'Beranda',
  ajukan: 'Ajukan Bantuan',
  status: 'Status Pengajuan',
  riwayat: 'Riwayat Pengajuan',
  notifikasi: 'Notifikasi',
  informasi: 'Informasi Bantuan',
  pengaduan: 'Pengaduan / Bantuan',
  profil: 'Profil Saya',
};

export default function WargaDashboardLayout() {
  const {
    currentUser,
    wargaView,
    setWargaView,
    currentView,
    setCurrentView,
    logout,
    applications,
    notifications,
    theme,
    toggleTheme,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Map legacy currentView values to warga sub-views
  useEffect(() => {
    const viewMap = {
      ajukan: 'ajukan',
      lacak: 'status',
      warga_dashboard: null, // don't change wargaView
    };
    if (currentView && viewMap[currentView] !== undefined && viewMap[currentView] !== null) {
      setWargaView(viewMap[currentView]);
      setCurrentView('warga_dashboard');
    }
  }, [currentView]);

  // Compute badges
  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const activeStatuses = ['WAITING_KASUN', 'KASUN_SURVEY', 'FORWARDED_TO_DESA', 'VILLAGE_REVIEW', 'FUNDING_APPROVED', 'PROCUREMENT', 'HANDOVER'];
  const activeCount = myApplications.filter((a) => activeStatuses.includes(a.status)).length;

  // Unread notifications (session-based, stored in local component state)
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('readNotifIds') || '[]'); } catch { return []; }
  });

  const unreadCount = notifications.filter((n) => {
    const isRelated =
      n.recipient === currentUser?.phone ||
      myApplications.some((a) => a.ticketNumber === n.ticketNumber);
    return isRelated && !readNotifIds.includes(n.id);
  }).length;

  const activeView = wargaView || 'beranda';

  const sidebarItems = [
    { id: 'beranda', label: 'Beranda', icon: LayoutDashboard },
    { id: 'ajukan', label: 'Ajukan Bantuan', icon: PlusCircle, badge: null },
    { id: 'status', label: 'Status Pengajuan', icon: Clock, badge: activeCount > 0 ? activeCount : null },
    { id: 'riwayat', label: 'Riwayat Pengajuan', icon: FileText },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'informasi', label: 'Informasi Bantuan', icon: Info },
    { id: 'pengaduan', label: 'Pengaduan / Bantuan', icon: MessageCircle },
    { id: 'profil', label: 'Profil Saya', icon: User },
  ];

  const handleNav = (id) => {
    setWargaView(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
  };

  // Close sidebar on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'beranda': return <WargaBerandaView onNav={handleNav} />;
      case 'ajukan': return <SubmissionWizardView />;
      case 'status': return <WargaStatusPengajuanView onNav={handleNav} />;
      case 'riwayat': return <WargaRiwayatView onNav={handleNav} />;
      case 'notifikasi': return (
        <WargaNotifikasiView
          readNotifIds={readNotifIds}
          setReadNotifIds={(ids) => {
            setReadNotifIds(ids);
            try { sessionStorage.setItem('readNotifIds', JSON.stringify(ids)); } catch {}
          }}
        />
      );
      case 'informasi': return <WargaInformasiBantuanView onNav={handleNav} />;
      case 'pengaduan': return <WargaPengaduanView />;
      case 'profil': return <WargaProfilView />;
      default: return <WargaBerandaView onNav={handleNav} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-neutral-950 font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-auto lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-emerald-700 to-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-white font-black text-base tracking-tight">SAPA-JARAK</div>
              <div className="text-emerald-200 text-[10px] font-medium">Portal Warga Masyarakat</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
              {currentUser?.avatarInitials || currentUser?.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                {currentUser?.name || 'Pengguna'}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">
                {currentUser?.dusunName ? `Dusun ${currentUser.dusunName}` : 'Warga Desa Jarak'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Keluar */}
        <div className="p-3 border-t border-gray-100 dark:border-neutral-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Keluar Akun</span>
          </button>
          <div className="text-center text-[10px] text-gray-400 dark:text-gray-600">
            SAPA-JARAK © 2025 Desa Jarak
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-4 sm:px-6 h-14 flex items-center justify-between gap-3 shadow-xs">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Buka Sidebar"
            >
              <Menu size={20} />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <Home size={13} className="shrink-0 text-emerald-600" />
              <ChevronRight size={12} className="shrink-0" />
              <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                {BREADCRUMB_LABELS[activeView] || 'Beranda'}
              </span>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-emerald-700" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => handleNav('notifikasi')}
              className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title="Notifikasi"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <button
              onClick={() => handleNav('profil')}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                {currentUser?.avatarInitials || currentUser?.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
              <span className="hidden sm:block text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                {currentUser?.name}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6">
            <SyncStatusBanner />
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
