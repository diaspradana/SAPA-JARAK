import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import sapaJarakLogo from '../../assets/sapa-jarak-logo.png';
import { Button } from '../ui/button';
import { 
  Bell, 
  Menu, 
  X,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

export default function Navbar() {
  const { 
    theme,
    toggleTheme,
    currentView, 
    setCurrentView, 
    notifications, 
    setIsNotifDrawerOpen,
    refreshServerData,
    showConfirm,
    currentUser,
    logout,
    openLogin,
    openRegisterAccount
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesaStaff = currentUser?.role === 'desa' || currentUser?.role === 'admin';
  const homeView = isDesaStaff ? 'desa_dashboard' : 'home';

  // Dynamic Navigation Items:
  // Sebelum Login: Beranda Pelayanan, Pengecekan Tiket, Transparansi APBDes
  // Setelah Login: Sesuai peran (Warga: + Pengajuan Bantuan, Kasun: + Dashboard Kasun, Desa: + Dashboard Desa)
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { id: 'home', label: 'Beranda Pelayanan' },
        { id: 'lacak', label: 'Pengecekan Tiket' },
        { id: 'transparansi', label: 'Transparansi APBDes' },
      ];
    }

    if (currentUser.role.startsWith('kasun')) {
      return [
        { id: 'kasun_dashboard', label: 'Ruang Kerja Kasun' },
      ];
    }

    if (isDesaStaff) {
      return [{ id: 'desa_dashboard', label: 'Dashboard Petugas Desa' }];
    }

    // Role Warga / Pelapor yang telah login → they use their own sidebar dashboard
    return [
      { id: 'warga_dashboard', label: 'Dashboard Saya' },
      { id: 'lacak', label: 'Pengecekan Tiket' },
      { id: 'transparansi', label: 'Transparansi APBDes' },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (id) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (
    (currentUser?.role?.startsWith('kasun') && currentView === 'kasun_dashboard')
    || (isDesaStaff && currentView?.startsWith('desa_'))
  ) {
    return null;
  }

  const handleReset = async () => {
    const result = await showConfirm({
      title: 'Muat ulang data server?',
      text: 'Data akan diambil ulang dari database server tanpa mengubah atau menghapusnya.',
      confirmButtonText: 'Muat Ulang',
      confirmColorClass: 'bg-emerald-700 hover:bg-emerald-800',
      icon: 'question'
    });
    if (result.isConfirmed) {
      refreshServerData();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-xs transition-colors">
      
      {/* 1. Top Institutional Banner Strip */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] font-medium py-1.5 px-4 sm:px-6 border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide text-white">
              {isDesaStaff ? 'AREA KERJA INTERNAL' : 'PEMERINTAH KABUPATEN KEDIRI'}
            </span>
            <span className="opacity-40">•</span>
            <span className="opacity-90">Kecamatan Plosoklaten</span>
            <span className="opacity-40">•</span>
            <span className="font-black text-emerald-300">Desa Jarak</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-emerald-200/80 font-mono">
            <span>{isDesaStaff ? 'Pengelolaan Bantuan Desa' : 'Standar Pelayanan Publik Trans-Desa'}</span>
            <span className="opacity-40">•</span>
            <span>Kode: 35.06.12.2005</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[4.5rem] py-2 flex items-center justify-between gap-3">
        
        {/* Brand / Emblem */}
        <div 
          className="flex min-w-0 items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => handleNavClick(homeView)}
        >
          <img
            src={sapaJarakLogo}
            alt="Logo SAPA-JARAK"
            className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0">
            <span className="whitespace-nowrap font-black text-base sm:text-xl text-foreground tracking-tight">SAPA-JARAK</span>
            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              Sistem Aspirasi & Bantuan Sosial RTLH & Disabilitas
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Home screen sebelum login: Beranda Pelayanan, Pengecekan Tiket, Transparansi APBDes) */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-background text-emerald-700 dark:text-emerald-400 shadow-xs border border-border/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-foreground border-border rounded-lg"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-emerald-700" />
            )}
          </Button>

          {/* WhatsApp Notification Bell */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative h-9 w-9 border-border text-foreground rounded-lg"
            title="Riwayat Pesan WhatsApp"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* User Auth Buttons or Profile Dropdown (Menggantikan simulasi peran lama) */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/80">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 px-3 font-bold border-emerald-600/40 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                      {currentUser.avatarInitials || 'U'}
                    </div>
                    <span className="max-w-[130px] truncate text-xs font-bold text-foreground">
                      {currentUser.name}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 shadow-xl border-border rounded-2xl">
                  <DropdownMenuLabel className="p-2">
                    <div className="text-sm font-extrabold text-foreground">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{currentUser.email || currentUser.phone}</div>
                    <div className="mt-1.5">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {currentUser.roleLabel || currentUser.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentUser.role.startsWith('kasun') && (
                    <DropdownMenuItem onClick={() => handleNavClick('kasun_dashboard')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                      📋 Buka Dashboard Survei Kasun
                    </DropdownMenuItem>
                  )}
                  {(currentUser.role === 'desa' || currentUser.role === 'admin') && (
                    <DropdownMenuItem onClick={() => handleNavClick('desa_dashboard')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                      🏛️ Buka Dashboard Pengelolaan Desa
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'public' && (
                    <>
                      <DropdownMenuItem onClick={() => handleNavClick('warga_dashboard')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                        🏠 Buka Dashboard Warga Saya
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavClick('ajukan')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                        ✍️ Ajukan Permohonan Bantuan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavClick('lacak')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                        🔍 Pengecekan Tiket Saya
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="p-2 text-xs font-bold cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 rounded-lg">
                    <LogOut size={14} className="mr-2" />
                    Keluar Akun
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLogin('warga')}
                  className="h-9 px-3 text-xs font-bold rounded-lg border-border bg-background hover:bg-muted/60 text-foreground gap-1.5 shadow-xs"
                >
                  <LogIn size={15} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Masuk</span>
                </Button>

                <Button
                  size="sm"
                  onClick={openRegisterAccount}
                  className="h-9 px-3.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs gap-1.5"
                  title="Pendaftaran akun warga atau administrator desa"
                >
                  <ShieldCheck size={15} />
                  <span>Daftar Akun</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 border-border rounded-lg"
            aria-label="Buka Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {/* 3. Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {/* Mobile Auth Actions */}
          <div>
            {currentUser ? (
              <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white text-sm flex items-center justify-center font-bold">
                    {currentUser.avatarInitials || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground">{currentUser.roleLabel || currentUser.role}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="h-8 text-xs font-bold text-rose-600 border-rose-300 hover:bg-rose-50"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Akses akun:
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    openLogin('warga');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold h-10 gap-2 justify-start px-3"
                >
                  <LogIn size={15} className="text-emerald-700" />
                  <span>Masuk ke akun</span>
                </Button>

                <Button
                  onClick={() => {
                    openRegisterAccount();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold h-10 gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                >
                  <ShieldCheck size={16} />
                  <span>Registrasi Warga / Admin Desa</span>
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Links in Mobile */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                  currentView === item.id 
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{item.label}</span>
                <span>→</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>{isDesaStaff ? 'Ruang kerja internal Pemerintah Desa Jarak' : 'Kantor Balai Desa Jarak'}</span>
            <button
              onClick={handleReset}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw size={12} /> Muat Ulang Data Server
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
