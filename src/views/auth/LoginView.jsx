import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';

const LOGIN_ROLES = [
  { id: 'warga', label: 'Warga / Pelapor', icon: Users },
  { id: 'kasun', label: 'Kepala Dusun', icon: UserCheck },
  { id: 'desa', label: 'Petugas Desa', icon: Building2 }
];

export default function LoginView() {
  const { login, setCurrentView, showToast, showAlert, loginRole, openRegisterPetugas } = useApp();
  const [selectedRole, setSelectedRole] = useState(loginRole || 'warga');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loginRole) setSelectedRole(loginRole);
  }, [loginRole]);

  const handleHelpForgotPassword = () => {
    showAlert({
      title: 'Bantuan Masuk & Kata Sandi',
      html: `
        <div class="text-left space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <div>
            <p class="font-bold text-emerald-700 dark:text-emerald-400">Warga / Publik:</p>
            <p class="text-xs">Gunakan Nomor WhatsApp, NIK KTP (16 digit), atau email yang terdaftar.</p>
          </div>
          <div>
            <p class="font-bold text-blue-700 dark:text-blue-400">Kepala Dusun:</p>
            <p class="text-xs">Gunakan email atau nomor WhatsApp dan kata sandi akun Kasun.</p>
          </div>
          <div>
            <p class="font-bold text-amber-700 dark:text-amber-400">Petugas Desa:</p>
            <p class="text-xs">Gunakan email dinas atau nomor WhatsApp dan kata sandi akun terdaftar.</p>
          </div>
          <div class="pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500">
            Hubungi Balai Desa Jarak untuk bantuan pemulihan akun.
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Tutup Bantuan'
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast('Harap isi nomor HP / email / NIK dan kata sandi.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
    } finally {
      setIsLoading(false);
    }
  };

  const identifierLabel = selectedRole === 'kasun'
    ? 'Email atau nomor WhatsApp'
    : selectedRole === 'warga'
      ? 'Nomor WhatsApp, NIK, atau email'
      : 'Email, nomor HP, atau NIP';
  const identifierPlaceholder = selectedRole === 'kasun'
    ? 'Masukkan email atau nomor WhatsApp'
    : selectedRole === 'warga'
      ? 'Masukkan nomor WhatsApp, NIK, atau email'
      : 'Masukkan email dinas, nomor HP, atau NIP';
  const activeRole = LOGIN_ROLES.find((role) => role.id === selectedRole) || LOGIN_ROLES[0];
  const ActiveRoleIcon = activeRole.icon;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 px-4 sm:px-6 bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-neutral-950 dark:to-neutral-950">
      <div className="max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('home')}
          className="mb-5 text-sm font-medium text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft size={16} />
          Kembali ke beranda
        </Button>

        <section className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg overflow-hidden">
          <header className="p-6 sm:p-8 text-center border-b border-border">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Masuk ke SAPA-JARAK</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pilih jenis akun, lalu masukkan informasi login Anda.
            </p>
          </header>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-foreground">Jenis akun</Label>
              <div className="grid grid-cols-3 gap-2 mt-2" role="group" aria-label="Pilih jenis akun">
                {LOGIN_ROLES.map(({ id, label, icon: Icon }) => {
                  const isSelected = selectedRole === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedRole(id)}
                      className={`min-h-[76px] px-2 py-3 rounded-xl border text-center transition-colors ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon size={19} className="mx-auto mb-1.5" />
                      <span className="text-[11px] sm:text-xs font-semibold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-id" className="text-sm font-medium">{identifierLabel}</Label>
                <div className="relative">
                  <Input
                    id="login-id"
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder={identifierPlaceholder}
                    autoComplete="username"
                    required
                    className="h-11 pr-10 rounded-lg"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground pointer-events-none">
                    {selectedRole === 'warga' ? <Phone size={16} /> : <Mail size={16} />}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Kata sandi</Label>
                  <button
                    type="button"
                    onClick={handleHelpForgotPassword}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Butuh bantuan?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    required
                    className="h-11 pr-11 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memeriksa akun...
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    Masuk sebagai {activeRole.label}
                  </>
                )}
              </Button>
            </form>

            {selectedRole === 'desa' && (
              <div className="pt-5 border-t border-border text-center space-y-3">
                <p className="text-sm text-muted-foreground">Belum memiliki akun petugas?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openRegisterPetugas}
                  className="w-full gap-2 rounded-lg"
                >
                  <ShieldCheck size={16} />
                  Daftar sebagai petugas desa
                </Button>
              </div>
            )}
          </div>
        </section>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ActiveRoleIcon size={14} />
          <span>Login aman untuk {activeRole.label.toLowerCase()}</span>
        </div>
      </div>
    </main>
  );
}
