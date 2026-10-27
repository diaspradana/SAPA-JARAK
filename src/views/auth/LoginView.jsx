import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_KASUN_ACCOUNTS, OFFICIAL_DESA_ACCOUNTS } from '../../data/initialData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  LogIn, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Info,
  KeyRound,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function LoginView() {
  const { login, setCurrentView, showToast, showAlert, loginRole, openRegisterPetugas } = useApp();
  
  // Selected role tab: 'warga' | 'kasun' | 'desa'
  const [selectedRole, setSelectedRole] = useState(loginRole || 'warga');
  
  // Active credentials
  const [identifier, setIdentifier] = useState('warga@jarak-kediri.desa.id');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Kasun card index (default: Putro Dwi S.)
  const [selectedKasunIndex, setSelectedKasunIndex] = useState(0);

  // Selected Petugas Desa card index (default: Ahmad Fauzi - Kasi Kesra)
  const [selectedDesaIndex, setSelectedDesaIndex] = useState(0);

  const currentKasun = OFFICIAL_KASUN_ACCOUNTS[selectedKasunIndex] || OFFICIAL_KASUN_ACCOUNTS[0];
  const currentDesa = OFFICIAL_DESA_ACCOUNTS[selectedDesaIndex] || OFFICIAL_DESA_ACCOUNTS[0];

  // Sync if loginRole changes from navbar
  useEffect(() => {
    if (loginRole) {
      handleRoleChange(loginRole);
    }
  }, [loginRole]);

  // Handle Role Tab Switching
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'kasun') {
      const k = OFFICIAL_KASUN_ACCOUNTS[selectedKasunIndex] || OFFICIAL_KASUN_ACCOUNTS[0];
      setIdentifier(k.email);
      setPassword('123456');
    } else if (role === 'warga') {
      setIdentifier('warga@jarak-kediri.desa.id');
      setPassword('password');
    } else if (role === 'desa') {
      const d = OFFICIAL_DESA_ACCOUNTS[selectedDesaIndex] || OFFICIAL_DESA_ACCOUNTS[0];
      setIdentifier(d.email);
      setPassword('password');
    }
  };

  // Handle Kasun specific card selection
  const handleSelectKasun = (kasun, index) => {
    setSelectedKasunIndex(index);
    setIdentifier(kasun.email);
    setPassword('123456');
    showToast(`Dipilih: ${kasun.name} (${kasun.roleLabel})`, 'info');
  };

  // Handle Petugas Desa specific card selection
  const handleSelectDesa = (officer, index) => {
    setSelectedDesaIndex(index);
    setIdentifier(officer.email);
    setPassword('password');
    showToast(`Dipilih: ${officer.name} (${officer.roleLabel})`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Harap isi nomor HP / email / NIK dan kata sandi.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      showToast('Gagal terhubung ke sistem. Coba lagi.', 'error');
    }
  };

  // Quick 1-Click login helper
  const handleQuickLogin = async (idToUse, pwToUse) => {
    setIdentifier(idToUse);
    setPassword(pwToUse);
    setIsLoading(true);
    try {
      await login(idToUse, pwToUse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpForgotPassword = () => {
    showAlert({
      title: 'Bantuan Masuk & Kata Sandi',
      html: `
        <div class="text-left space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <div>
            <p class="font-bold text-emerald-700 dark:text-emerald-400">1. Warga / Publik:</p>
            <p class="text-xs">Gunakan Nomor WhatsApp, NIK KTP (16 digit), atau Email. Akun demo warga: <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">warga@jarak-kediri.desa.id</code> (Sandi: <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">password</code>).</p>
          </div>
          <div>
            <p class="font-bold text-blue-700 dark:text-blue-400">2. Kepala Dusun (Kasun):</p>
            <p class="text-xs">Kata sandi resmi seluruh Kepala Dusun adalah <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700 dark:text-blue-300">123456</code>.</p>
          </div>
          <div>
            <p class="font-bold text-amber-700 dark:text-amber-400">3. Petugas Desa:</p>
            <p class="text-xs">Gunakan email dinas atau nomor WhatsApp terdaftar. Sandi akun dinas bawaan: <code class="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-300">password</code>.</p>
          </div>
          <div class="pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500">
            Hotline Balai Desa Jarak: <b>0812-3456-7890</b> / (0354) 7482910
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Tutup Bantuan'
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-neutral-950 dark:to-neutral-950 transition-colors">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft size={16} /> Kembali ke Halaman Utama
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Portal Masuk Resmi SAPA-JARAK</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-xl overflow-hidden transition-all">
          
          {/* Card Hero Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md shrink-0">
                  <Building2 size={28} className="text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      Masuk ke Sistem
                    </h1>
                    <Badge className="bg-primary text-primary-foreground text-xs px-2.5 py-0.5 font-bold">
                      SAPA-JARAK
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Silakan pilih peran pengguna untuk masuk sesuai hak akses Anda
                  </p>
                </div>
              </div>

              {selectedRole === 'kasun' && (
                <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200 self-start sm:self-auto">
                  <KeyRound size={16} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Kata Sandi Seluruh Kasun:</span>
                    <span className="font-mono text-sm font-black text-blue-700 dark:text-blue-300">123456</span>
                  </div>
                </div>
              )}

              {selectedRole === 'desa' && (
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200 self-start sm:self-auto">
                  <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Aparatur Pemdes Jarak</span>
                    <span className="text-[11px] text-muted-foreground">Kasi Kesra, Sekdes, Kades, Admin</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* 1. ROLE SELECTOR TABS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <span>Pilih Peran Pengguna:</span>
                </Label>
                <span className="text-xs text-muted-foreground">Klik peran Anda di bawah ini</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Warga / Publik */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('warga')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'warga'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-600 ring-2 ring-emerald-600/30 shadow-md scale-[1.01]'
                      : 'bg-background hover:bg-muted/40 border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'warga' ? 'bg-emerald-700 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Users size={18} />
                    </div>
                    {selectedRole === 'warga' && (
                      <Badge className="bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5">
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className={`text-base font-extrabold leading-tight ${selectedRole === 'warga' ? 'text-emerald-800 dark:text-emerald-200' : 'text-foreground'}`}>
                      Warga / Publik
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      Akses layanan mandiri & lacak status tiket bantuan
                    </p>
                  </div>
                </button>

                {/* 2. Kepala Dusun (Kasun) */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('kasun')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'kasun'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-600/30 shadow-md scale-[1.01]'
                      : 'bg-background hover:bg-muted/40 border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'kasun' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <UserCheck size={18} />
                    </div>
                    {selectedRole === 'kasun' && (
                      <Badge className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5">
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className={`text-base font-extrabold leading-tight ${selectedRole === 'kasun' ? 'text-blue-800 dark:text-blue-200' : 'text-foreground'}`}>
                      Kepala Dusun (Kasun)
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      Verifikasi & survei lapangan 4 wilayah dusun
                    </p>
                  </div>
                </button>

                {/* 3. Petugas Desa */}
                <button
                  type="button"
                  onClick={() => handleRoleChange('desa')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    selectedRole === 'desa'
                      ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-600 ring-2 ring-amber-600/30 shadow-md scale-[1.01]'
                      : 'bg-background hover:bg-muted/40 border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedRole === 'desa' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Building2 size={18} />
                    </div>
                    {selectedRole === 'desa' && (
                      <Badge className="bg-amber-600 text-white text-[11px] font-bold px-2 py-0.5">
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className={`text-base font-extrabold leading-tight ${selectedRole === 'desa' ? 'text-amber-800 dark:text-amber-200' : 'text-foreground'}`}>
                      Petugas Desa
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      Kasi Kesra, Sekdes, Kades, & pengelola APBDes
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* 2. AREA KHUSUS JIKA MEMILIH WARGA / PUBLIK */}
            {selectedRole === 'warga' && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-foreground text-sm flex items-center gap-2">
                      <Users size={16} className="text-emerald-700" />
                      Login Layanan Warga & Pelapor Publik
                    </span>
                    <p className="text-muted-foreground">
                      Gunakan Nomor WhatsApp, NIK (KTP), atau Email untuk masuk dan melacak bantuan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIdentifier('warga@jarak-kediri.desa.id');
                        setPassword('password');
                        showToast('Kredensial warga contoh diisi (Danang Prasetyo).', 'info');
                      }}
                      className="h-8 text-xs font-bold border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50"
                    >
                      <Sparkles size={13} className="text-amber-500 mr-1.5" />
                      Isi Contoh Warga
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin('warga@jarak-kediri.desa.id', 'password')}
                      className="h-8 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      <LogIn size={13} className="mr-1.5" />
                      Masuk Cepat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AREA KHUSUS JIKA MEMILIH KEPALA DUSUN */}
            {selectedRole === 'kasun' && (
              <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Pilih Pejabat Kepala Dusun
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Klik salah satu Kasun untuk mengisi data otomatis atau langsung masuk
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs bg-background text-blue-700 dark:text-blue-300 border-blue-300 font-mono font-bold">
                    4 Wilayah Dusun
                  </Badge>
                </div>

                {/* 4 Kasun Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OFFICIAL_KASUN_ACCOUNTS.map((kasun, idx) => {
                    const isSelected = identifier === kasun.email;

                    return (
                      <div
                        key={kasun.id}
                        onClick={() => handleSelectKasun(kasun, idx)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md border-blue-600'
                            : 'bg-card hover:bg-blue-50/50 dark:hover:bg-blue-900/30 text-card-foreground border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          }`}>
                            {kasun.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm truncate">
                              {kasun.name}
                            </div>
                            <div className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}>
                              {kasun.roleLabel} • RT 01-{kasun.dusunId === 'sagi' ? '08' : kasun.dusunId === 'jaraklor' ? '07' : kasun.dusunId === 'simbar' ? '04' : '06'}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <Check size={14} className="stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-md">
                              Pilih
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick 1-Click Login Button for Kasun */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 dark:bg-neutral-900/60 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Info size={15} className="text-blue-600 shrink-0" />
                    <span>Terpilih: <b>{currentKasun.name}</b> ({currentKasun.roleLabel}) • Sandi: <b>123456</b></span>
                  </div>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickLogin(currentKasun.email, '123456')}
                    className="w-full sm:w-auto h-9 px-4 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white gap-2 shrink-0 shadow-xs"
                  >
                    <LogIn size={14} />
                    <span>Masuk Langsung sebagai {currentKasun.name.split(' ')[0]} →</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 4. AREA KHUSUS JIKA MEMILIH PETUGAS DESA */}
            {selectedRole === 'desa' && (
              <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-5 space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <ShieldCheck size={16} className="text-amber-600" />
                      Pilih Akun Petugas Desa atau Masukkan Akun Anda
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Pilih aparatur di bawah untuk mengisi data otomatis, atau masukkan akun terdaftar Anda
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs bg-background text-amber-700 dark:text-amber-300 border-amber-300 font-mono font-bold">
                    Aparatur Balai Desa
                  </Badge>
                </div>

                {/* 4 Official Desa Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OFFICIAL_DESA_ACCOUNTS.map((officer, idx) => {
                    const isSelected = identifier === officer.email;

                    return (
                      <div
                        key={officer.id}
                        onClick={() => handleSelectDesa(officer, idx)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-md border-amber-600'
                            : 'bg-card hover:bg-amber-50/50 dark:hover:bg-amber-900/30 text-card-foreground border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                          }`}>
                            {officer.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm truncate">
                              {officer.name}
                            </div>
                            <div className={`text-xs truncate ${isSelected ? 'text-amber-100' : 'text-muted-foreground'}`}>
                              {officer.position} • {officer.email}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                              <Check size={14} className="stroke-[3]" />
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-md">
                              Pilih
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick 1-Click Login Button for Petugas Desa */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 dark:bg-neutral-900/60 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Info size={15} className="text-amber-600 shrink-0" />
                    <span>Terpilih: <b>{currentDesa.name}</b> ({currentDesa.position}) • Sandi: <b>password</b></span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickLogin(currentDesa.email, 'password')}
                      className="w-full sm:w-auto h-9 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-2 shrink-0 shadow-xs"
                    >
                      <LogIn size={14} />
                      <span>Masuk Langsung sebagai {currentDesa.name.split(' ')[0]} →</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FORM INPUT KREDENSIAL */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Field 1: Email / No HP / NIK */}
                <div>
                  <Label htmlFor="login-id" className="text-xs font-bold text-foreground">
                    {selectedRole === 'kasun' 
                      ? 'Email atau No. WhatsApp Kasun' 
                      : selectedRole === 'warga' 
                        ? 'Nomor WhatsApp / NIK (16 Digit) / Email' 
                        : 'Email / Nomor HP / NIP Petugas Desa'}
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="login-id"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'kasun' 
                          ? 'kasun.jaraklor@jarak-kediri.desa.id' 
                          : selectedRole === 'warga'
                            ? '0812xxxxxxxx atau NIK 16 Digit'
                            : 'kesra@jarak-kediri.desa.id atau No. HP'
                      }
                      required
                      className="h-12 text-sm pr-10 font-medium rounded-xl"
                      autoComplete="username"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                      {selectedRole === 'warga' ? <Phone size={16} /> : <Mail size={16} />}
                    </div>
                  </div>
                </div>

                {/* Field 2: Kata Sandi */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-bold text-foreground">
                      Kata Sandi {selectedRole === 'kasun' ? <span className="font-mono text-blue-600 font-bold">(123456)</span> : <span className="font-mono text-muted-foreground font-normal">(demo: password)</span>}
                    </Label>
                    <button
                      type="button"
                      onClick={handleHelpForgotPassword}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      Bantuan Sandi?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-12 text-sm pr-10 font-medium font-mono rounded-xl tracking-wider"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 text-sm font-bold text-white gap-2 shadow-md rounded-xl mt-3 transition-all ${
                  selectedRole === 'kasun'
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : selectedRole === 'desa'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memeriksa Kredensial...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>
                      {selectedRole === 'kasun' && `Masuk sebagai Kasun (${currentKasun.name})`}
                      {selectedRole === 'warga' && 'Masuk ke Layanan Warga'}
                      {selectedRole === 'desa' && `Masuk ke Panel Petugas Desa (${currentDesa.position})`}
                    </span>
                    <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Bottom Invitation to Register (Specifically for Petugas Desa) */}
            <div className="mt-8 pt-6 border-t border-border">
              {selectedRole === 'desa' ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/50">
                  <div>
                    <span className="font-extrabold text-sm text-foreground block">
                      Aparatur atau Petugas Baru di Kantor Balai Desa?
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Daftarkan akun petugas resmi Anda dengan memasukkan NIP/NIK, jabatan, dan kode otorisasi balai desa.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openRegisterPetugas}
                    className="h-9 px-4 text-xs font-bold border-amber-500 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 shrink-0 gap-1.5 rounded-xl shadow-2xs"
                  >
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>Registrasi Petugas Desa Baru →</span>
                  </Button>
                </div>
              ) : selectedRole === 'warga' ? (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-bold text-foreground block">Layanan Mandiri Warga Desa Jarak</span>
                    Warga masyarakat dapat masuk menggunakan Nomor WhatsApp atau NIK KTP untuk melihat transparansi bantuan.
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('home')}
                    className="h-8 text-xs font-bold text-primary shrink-0"
                  >
                    Pelajari Layanan Bantuan →
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs text-muted-foreground">
                  <span className="font-bold text-foreground block mb-0.5">Penetapan Akun Kepala Dusun:</span>
                  Akun verifikator Kasun telah ditetapkan berdasarkan SK Kepala Desa Jarak. Hubungi Bagian Pemerintahan Kantor Balai Desa jika ada perubahan pejabat dusun.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Security & Public Service Assurance Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground text-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Platform Resmi Pemerintah Desa Jarak, Kec. Plosoklaten, Kab. Kediri</span>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <span>Bantuan & Hotline: (0354) 7482910 / 0812-3456-7890</span>
        </div>

      </div>
    </div>
  );
}
