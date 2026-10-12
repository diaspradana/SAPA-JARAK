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
  UserPlus,
  LogOut,
  ChevronDown,
  PhoneCall,
  User,
  HeartHandshake
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
    resetDatabase,
    showConfirm,
    currentUser,
    logout
  } = useApp();

  const { voiceEnabled, toggleVoice } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'ajukan', label: 'Ajukan Bantuan' },
    { id: 'lacak', label: 'Lacak Permohonan' },
    { id: 'transparansi', label: 'Transparansi Dana' },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = async () => {
    const result = await showConfirm({
      title: 'Kembalikan ke Data Awal Demo?',
      text: 'Semua formulir pengajuan dan berkas survei akan direset ke kondisi awal demo.',
      confirmButtonText: 'Ya, Reset Data',
      confirmColorClass: 'bg-rose-600 hover:bg-rose-700',
      icon: 'warning'
    });
    if (result.isConfirmed) {
      resetDatabase();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-xs transition-colors">
      
      {/* Top Banner Strip */}
      <div className="bg-emerald-900 text-emerald-100 text-xs font-medium py-1.5 px-4 sm:px-6 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide text-white">PEMDES JARAK</span>
            <span className="opacity-50">•</span>
            <span className="opacity-90">Kec. Plosoklaten, Kab. Kediri</span>
            <span className="opacity-50 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-300 font-semibold">Layanan Sosial RTLH & Disabilitas</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 text-emerald-200 hover:text-white transition-colors"
            >
              <PhoneCall size={12} className="text-emerald-400" />
              <span>Bantuan WA: <b>0812-3456-7890</b></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Brand / Emblem */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer select-none group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform">
            <Building2 size={22} className="text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-foreground tracking-tight">SAPA-JARAK</span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                Desa Jarak
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
              Sistem Bantuan Sosial & Kesejahteraan Warga
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/60">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all ${
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

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Voice Guide Toggle */}
          <Button
            variant={voiceEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={toggleVoice}
            className={`h-9 gap-1.5 px-3 text-xs font-bold rounded-lg border-border ${
              voiceEnabled ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200' : ''
            }`}
            title="Bantuan Suara (Text-to-Speech untuk lansia dan disabilitas netra)"
          >
            {voiceEnabled ? <Volume2 size={16} className="text-amber-600" /> : <VolumeX size={16} className="text-muted-foreground" />}
            <span className="hidden xl:inline">{voiceEnabled ? 'Suara Aktif' : 'Panduan Suara'}</span>
          </Button>

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

          {/* User Auth Buttons or Profile Dropdown (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-border/80">
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
                      <DropdownMenuItem onClick={() => handleNavClick('ajukan')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                        ✍️ Ajukan Permohonan Bantuan Baru
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavClick('lacak')} className="p-2 text-xs font-semibold cursor-pointer rounded-lg">
                        🔍 Lacak Status Tiket Saya
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
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick('login')}
                  className={`h-9 px-3.5 text-xs font-bold rounded-lg ${
                    currentView === 'login' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'text-foreground'
                  }`}
                >
                  <LogIn size={15} className="mr-1.5" />
                  <span>Masuk</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavClick('register')}
                  className="h-9 px-3.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs"
                >
                  <UserPlus size={15} className="mr-1.5" />
                  <span>Daftar Warga</span>
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

      {/* Mobile Menu Dropdown */}
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
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => handleNavClick('login')}
                  className="w-full text-sm font-bold h-11 gap-2 rounded-xl"
                >
                  <LogIn size={16} /> Masuk Akun
                </Button>
                <Button
                  onClick={() => handleNavClick('register')}
                  className="w-full text-sm font-bold h-11 gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                >
                  <UserPlus size={16} /> Daftar Warga
                </Button>
              </div>
            )}
          </div>

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
              <RotateCcw size={12} /> Reset Data Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
