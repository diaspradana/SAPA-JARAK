import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2,
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
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
  PhoneCall,
  User,
  Users,
  UserCheck
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
    lowBandwidthMode,
    setLowBandwidthMode,
    refreshServerData,
    showConfirm,
    currentUser,
    logout,
    openLogin,
    openRegisterPetugas
  } = useApp();

  const { voiceEnabled, toggleVoice } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { id: 'home', label: 'Beranda Pelayanan' },
        { id: 'kasun_dashboard', label: 'Dashboard Kasun' },
        { id: 'lacak', label: 'Pengecekan Tiket' },
        { id: 'transparansi', label: 'Transparansi APBDes' },
      ];
    }

    if (currentUser.role === 'desa' || currentUser.role === 'admin') {
      return [
        { id: 'home', label: 'Beranda Pelayanan' },
        { id: 'desa_dashboard', label: 'Dashboard Desa' },
        { id: 'lacak', label: 'Pengecekan Tiket' },
        { id: 'transparansi', label: 'Transparansi APBDes' },
      ];
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
            <span className="font-extrabold tracking-wide text-white">PEMERINTAH KABUPATEN KEDIRI</span>
            <span className="opacity-40">•</span>
            <span className="opacity-90">Kecamatan Plosoklaten</span>
            <span className="opacity-40">•</span>
            <span className="font-black text-emerald-300">Desa Jarak</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-emerald-200/80 font-mono">
            <span>Standar Pelayanan Publik Trans-Desa</span>
            <span className="opacity-40">•</span>
            <span>Kode: 35.06.12.2005</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Brand / Emblem */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
            <Building2 size={20} className="text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-foreground tracking-tight">SAPA-JARAK</span>
              <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-border">
                Verifikasi 3 Tingkat
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              Sistem Aspirasi & Bantuan Sosial RTLH & Disabilitas
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Home screen sebelum login: Beranda Pelayanan, Pengecekan Tiket, Transparansi APBDes) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/60">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
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
        <div className="flex items-center gap-2">
          
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

          {/* Voice Guide Toggle */}
          <Button
            variant={voiceEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={toggleVoice}
            className={`h-9 gap-1.5 px-3 text-xs font-bold rounded-lg border-border hidden md:flex ${
              voiceEnabled ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200' : ''
            }`}
            title="Bantuan Suara (Text-to-Speech untuk lansia dan disabilitas)"
          >
            {voiceEnabled ? <Volume2 size={16} className="text-amber-600" /> : <VolumeX size={16} className="text-muted-foreground" />}
            <span className="hidden xl:inline">{voiceEnabled ? 'Suara Aktif' : 'Panduan Suara'}</span>
          </Button>

          {/* Low Bandwidth Mode Toggle */}
          <Button
            variant={lowBandwidthMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`h-9 gap-1.5 px-3 text-xs font-bold rounded-lg border-border hidden xl:flex ${
              lowBandwidthMode ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200' : ''
            }`}
            title="Mode Hemat Kuota (Offline First)"
          >
            {lowBandwidthMode ? <WifiOff size={15} className="text-emerald-600" /> : <Wifi size={15} className="text-muted-foreground" />}
            <span>Hemat Kuota</span>
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
                
                {/* 1. Dropdown Masuk (Login Warga / Kasun / Pemdes) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-xs font-bold rounded-lg border-border bg-background hover:bg-muted/60 text-foreground gap-1.5 shadow-xs"
                    >
                      <LogIn size={15} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Masuk</span>
                      <ChevronDown size={13} className="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-border">
                    <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Pilihan Akses Masuk:
                    </DropdownMenuLabel>
                    
                    {/* Login Warga / Pelapor */}
                    <DropdownMenuItem
                      onClick={() => openLogin('warga')}
                      className="p-2.5 text-xs font-semibold cursor-pointer rounded-xl flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
                        <Users size={16} />
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground">Login Warga / Pelapor</div>
                        <div className="text-[10px] text-muted-foreground">Layanan Mandiri & Lacak Bantuan</div>
                      </div>
                    </DropdownMenuItem>

                    {/* Login Kasun */}
                    <DropdownMenuItem
                      onClick={() => openLogin('kasun')}
                      className="p-2.5 text-xs font-semibold cursor-pointer rounded-xl flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                        <UserCheck size={16} />
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground">Login Kepala Dusun (Kasun)</div>
                        <div className="text-[10px] text-muted-foreground">Verifikasi Lapangan 4 Dusun</div>
                      </div>
                    </DropdownMenuItem>

                    {/* Login Petugas Desa */}
                    <DropdownMenuItem
                      onClick={() => openLogin('desa')}
                      className="p-2.5 text-xs font-semibold cursor-pointer rounded-xl flex items-center gap-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground">Login Petugas Desa</div>
                        <div className="text-[10px] text-muted-foreground">Kasi Kesra, Sekdes, Kades & Admin</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. Tombol Khusus: Register Petugas Desa */}
                <Button
                  size="sm"
                  onClick={openRegisterPetugas}
                  className="h-9 px-3.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs gap-1.5"
                  title="Pendaftaran Akun Aparatur & Petugas Balai Desa Jarak"
                >
                  <ShieldCheck size={15} />
                  <span>Daftar Petugas Desa</span>
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
                  Akses Masuk & Registrasi:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      openLogin('warga');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-xs font-bold h-10 gap-2 justify-start px-3"
                  >
                    <Users size={15} className="text-emerald-700" />
                    <span>Login Warga / Pelapor</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      openLogin('kasun');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-xs font-bold h-10 gap-2 justify-start px-3"
                  >
                    <UserCheck size={15} className="text-blue-600" />
                    <span>Login Kasun</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      openLogin('desa');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-xs font-bold h-10 gap-2 justify-start px-3"
                  >
                    <Building2 size={15} className="text-amber-600" />
                    <span>Login Petugas Desa</span>
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    openRegisterPetugas();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold h-10 gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                >
                  <ShieldCheck size={16} />
                  <span>Registrasi Petugas Desa Baru</span>
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
            <span>Kantor Balai Desa Jarak</span>
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
