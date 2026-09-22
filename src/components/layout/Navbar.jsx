import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import RoleSwitcher from './RoleSwitcher';
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
  Sparkles,
  ShieldCheck
} from 'lucide-react';

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
    showConfirm
  } = useApp();

  const { voiceEnabled, toggleVoice } = useVoice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda Pelayanan' },
    { id: 'ajukan', label: 'Pengajuan Bantuan' },
    { id: 'lacak', label: 'Pelacakan Tiket' },
    { id: 'transparansi', label: 'Transparansi APBDes' },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = async () => {
    const result = await showConfirm({
      title: 'Reset Database Simulasi?',
      text: 'Semua berkas dan riwayat pengajuan akan dikembalikan ke data awal demo.',
      confirmButtonText: 'Reset Data',
      confirmColorClass: 'bg-rose-700 hover:bg-rose-800',
      icon: 'warning'
    });
    if (result.isConfirmed) {
      resetDatabase();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-2xs transition-colors">
      
      {/* Top Institutional Banner Strip */}
      <div className="bg-primary/95 text-primary-foreground text-[11px] font-medium py-1 px-4 sm:px-6 border-b border-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide">PEMERINTAH KABUPATEN KEDIRI</span>
            <span className="opacity-40">•</span>
            <span className="opacity-90">Kecamatan Plosoklaten</span>
            <span className="opacity-40">•</span>
            <span className="font-black text-emerald-300">Desa Jarak</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[10px] opacity-80 font-mono">
            <span>Standar Pelayanan Publik Trans-Desa</span>
            <span>Kode: 35.06.12.2005</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Emblem */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm border border-primary/30 shadow-xs group-hover:scale-105 transition-transform">
            <Building2 size={18} className="text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-foreground tracking-tight">SAPA-JARAK</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold border-border bg-muted/60 text-muted-foreground uppercase">
                Verifikasi 3 Tingkat
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
              Sistem Aspirasi & Bantuan Sosial RTLH & Disabilitas
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-background text-foreground shadow-xs font-bold border border-border/60' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Dark / Light Mode Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-foreground border-border bg-background shadow-2xs"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-primary" />
            )}
          </Button>

          {/* Voice Guide Toggle */}
          <Button
            variant={voiceEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={toggleVoice}
            className={`h-8 gap-1.5 px-2.5 text-xs font-semibold shadow-2xs ${
              voiceEnabled ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' : 'border-border'
            }`}
            title="Aksesibilitas Suara (Text-to-Speech)"
          >
            {voiceEnabled ? <Volume2 size={14} className="text-amber-600 dark:text-amber-400" /> : <VolumeX size={14} className="text-muted-foreground" />}
            <span className="hidden xl:inline">{voiceEnabled ? 'Suara Aktif' : 'Panduan Suara'}</span>
          </Button>

          {/* Low Bandwidth Mode Toggle */}
          <Button
            variant={lowBandwidthMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`h-8 gap-1.5 px-2.5 text-xs font-semibold shadow-2xs ${
              lowBandwidthMode ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'border-border'
            }`}
            title="Mode Hemat Kuota (Offline First)"
          >
            {lowBandwidthMode ? <WifiOff size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Wifi size={14} className="text-muted-foreground" />}
            <span className="hidden xl:inline">{lowBandwidthMode ? 'Hemat Aktif' : 'Hemat Kuota'}</span>
          </Button>

          {/* Simulated WhatsApp Notification Bell */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative h-8 w-8 border-border bg-background text-foreground shadow-2xs"
            title="Pusat Log Pesan WhatsApp"
          >
            <Bell size={15} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* Role Switcher Widget */}
          <div className="hidden sm:block">
            <RoleSwitcher />
          </div>

          {/* Mobile Menu Trigger */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-8 w-8 border-border"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="pb-2 border-b border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Peran Uji Coba:</span>
              <RoleSwitcher />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-1.5 h-8 font-bold border-border"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-primary" />}
              <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
            </Button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentView === item.id 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
            <span>Desa Jarak (Kec. Plosoklaten)</span>
            <button
              onClick={handleReset}
              className="text-primary hover:underline font-bold flex items-center gap-1 text-xs"
            >
              <RotateCcw size={12} /> Reset Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
