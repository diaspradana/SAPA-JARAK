import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  nik: '',
  kkNumber: '',
  rt: '',
  rw: '',
  address: '',
  authCode: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterView() {
  const { register, setCurrentView, openLogin } = useApp();
  const [accountType, setAccountType] = useState('warga');
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const isAdmin = accountType === 'admin_desa';

  const updateField = (field) => (event) => {
    setFormData((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorText('');

    if (formData.password.length < 6) {
      setErrorText('Kata sandi minimal 6 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorText('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        ...formData,
        accountType,
        positionLabel: isAdmin ? 'Administrator Desa' : undefined,
      });
      if (!result.success) setErrorText(result.message || 'Pendaftaran belum berhasil.');
    } catch (error) {
      setErrorText(error.message || 'Terjadi kendala pada sistem. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-neutral-950 dark:to-neutral-950">
      <div className="max-w-xl mx-auto w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('home')}
          className="mb-5 text-sm font-semibold text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Button>

        <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xl overflow-hidden">
          <header className="p-6 sm:p-8 border-b border-border text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
              {isAdmin ? <ShieldCheck size={27} /> : <Users size={27} />}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Daftar Akun SAPA-JARAK</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Registrasi mandiri tersedia untuk warga dan administrator desa.
            </p>
          </header>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <Label className="text-sm font-semibold">Daftar sebagai</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  aria-pressed={!isAdmin}
                  onClick={() => { setAccountType('warga'); setErrorText(''); }}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    !isAdmin
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Users size={19} className="mb-2" />
                  <span className="block text-sm font-bold">Warga</span>
                  <span className="block mt-1 text-xs text-muted-foreground">Akun pemohon bantuan</span>
                </button>
                <button
                  type="button"
                  aria-pressed={isAdmin}
                  onClick={() => { setAccountType('admin_desa'); setErrorText(''); }}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    isAdmin
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <ShieldCheck size={19} className="mb-2" />
                  <span className="block text-sm font-bold">Admin Desa</span>
                  <span className="block mt-1 text-xs text-muted-foreground">Memerlukan kode undangan resmi</span>
                </button>
              </div>
            </div>

            {errorText && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                {errorText}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="register-name">Nama lengkap *</Label>
                <Input
                  id="register-name"
                  value={formData.name}
                  onChange={updateField('name')}
                  autoComplete="name"
                  required
                  maxLength={150}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="register-phone">Nomor WhatsApp *</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={updateField('phone')}
                    autoComplete="tel"
                    required
                    maxLength={30}
                    placeholder="08xxxxxxxxxx"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email {isAdmin ? '*' : '(opsional)'}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={formData.email}
                    onChange={updateField('email')}
                    autoComplete="email"
                    required={isAdmin}
                    maxLength={255}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
              </div>

              {isAdmin ? (
                <>
                  <div>
                    <Label htmlFor="register-auth-code">Kode undangan administrator *</Label>
                    <Input
                      id="register-auth-code"
                      value={formData.authCode}
                      onChange={updateField('authCode')}
                      autoComplete="one-time-code"
                      required
                      className="mt-1.5 h-11 rounded-xl"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minta kode kepada pengelola sistem. Kode tidak ditampilkan secara publik.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-nik">NIK *</Label>
                      <Input id="register-nik" value={formData.nik} onChange={updateField('nik')} inputMode="numeric" minLength={16} maxLength={16} required className="mt-1.5 h-11 rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="register-kk">Nomor KK *</Label>
                      <Input id="register-kk" value={formData.kkNumber} onChange={updateField('kkNumber')} inputMode="numeric" minLength={16} maxLength={16} required className="mt-1.5 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-rt">RT *</Label>
                      <Input id="register-rt" value={formData.rt} onChange={updateField('rt')} inputMode="numeric" maxLength={5} required className="mt-1.5 h-11 rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="register-rw">RW *</Label>
                      <Input id="register-rw" value={formData.rw} onChange={updateField('rw')} inputMode="numeric" maxLength={5} required className="mt-1.5 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="register-address">Alamat lengkap *</Label>
                    <Input id="register-address" value={formData.address} onChange={updateField('address')} maxLength={255} required className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="register-password">Kata sandi *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={updateField('password')}
                      autoComplete="new-password"
                      minLength={6}
                      required
                      className="h-11 pr-10 rounded-xl"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="absolute inset-y-0 right-0 px-3 text-muted-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="register-confirm-password">Ulangi kata sandi *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      autoComplete="new-password"
                      minLength={6}
                      required
                      className="h-11 pr-10 rounded-xl"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'} className="absolute inset-y-0 right-0 px-3 text-muted-foreground">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                {isLoading ? 'Mendaftarkan akun...' : <><UserRound size={17} /> Daftar sebagai {isAdmin ? 'Admin Desa' : 'Warga'}</>}
              </Button>
            </form>

            <div className="pt-5 border-t border-border text-center space-y-3">
              <p className="text-sm text-muted-foreground">Sudah memiliki akun?</p>
              <Button type="button" variant="outline" onClick={() => openLogin(isAdmin ? 'desa' : 'warga')} className="w-full rounded-lg">
                <Lock size={16} className="mr-2" /> Masuk
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
