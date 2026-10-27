import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  Phone, 
  Mail, 
  Lock, 
  Check, 
  ArrowRight,
  Briefcase,
  KeyRound,
  Users,
  UserCheck
} from 'lucide-react';

export default function RegisterView() {
  const { register, setCurrentView, showToast, openLogin } = useApp();

  // Village Officer (Petugas Desa) Form State
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    position: 'Kasi Kesejahteraan (Kesra)',
    phone: '',
    email: '',
    authCode: '',
    password: '',
    confirmPassword: '',
    agreement: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Quick fill test data for village officer (petugas desa)
  const handleQuickFill = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: `Bpk. M. Ridwan Prasetya, S.AP (${randomSuffix})`,
      nip: `19880415 201201 1 ${randomSuffix}`,
      position: 'Kasi Kesejahteraan (Kesra)',
      phone: `08123499${randomSuffix}`,
      email: `ridwan.${randomSuffix}@jarak-kediri.desa.id`,
      authCode: 'DESAJARAK2026',
      password: 'password123',
      confirmPassword: 'password123',
      agreement: true
    });
    setErrorText('');
    showToast('Data contoh Petugas Desa & Kode Otorisasi berhasil diisi otomatis.', 'info');
  };

  // Handle Village Officer Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (!formData.name.trim()) {
      setErrorText('Nama lengkap aparatur desa wajib diisi.');
      return;
    }

    if (!formData.nip.trim()) {
      setErrorText('NIP atau NIK aparatur desa wajib diisi.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorText('Nomor WhatsApp dinas/aktif wajib diisi minimal 10 digit angka.');
      return;
    }

    const cleanAuthCode = (formData.authCode || '').trim().toUpperCase();
    if (cleanAuthCode !== 'DESAJARAK2026' && cleanAuthCode !== 'JARAK2026') {
      setErrorText('Kode Otorisasi Aparatur tidak sesuai. Gunakan kode resmi Balai Desa: DESAJARAK2026.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorText('Kata sandi minimal 6 karakter demi keamanan akun.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorText('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    if (!formData.agreement) {
      setErrorText('Anda harus menyetujui Pakta Integritas Aparatur Pemerintah Desa.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        ...formData,
        accountType: 'petugas_desa',
        positionLabel: formData.position
      });
      if (!res.success) {
        setErrorText(res.message || 'Pendaftaran petugas desa belum berhasil.');
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorText('Terjadi kendala pada sistem. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/50 via-background to-background dark:from-neutral-950 dark:to-neutral-950 transition-colors">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Top Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground gap-2 self-start"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleQuickFill}
            className="text-xs font-bold gap-2 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 shadow-2xs rounded-xl"
            title="Klik untuk mengisi data contoh petugas desa otomatis"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Isi Contoh Petugas Desa (Uji Cepat)</span>
          </Button>
        </div>

        {/* Card Form */}
        <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-border bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-md shrink-0 bg-amber-600 text-white">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      Registrasi Petugas Desa
                    </h1>
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30">
                      Aparatur Pemdes
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pendaftaran resmi staf dan aparatur Balai Desa Jarak untuk verifikasi berkas, validasi DTKS, penetapan APBDes, dan pengesahan BAST.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Error Banner */}
            {errorText && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3 animate-in shake duration-200">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span className="font-medium">{errorText}</span>
              </div>
            )}

            {/* FORM: REGISTRASI PETUGAS DESA */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* INFO SECURITY BADGE */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-foreground text-sm block">
                      Portal Khusus Aparatur Pemerintah Balai Desa Jarak
                    </span>
                    <p className="text-muted-foreground mt-0.5">
                      Hanya ditujukan untuk pejabat, staf Kasi Kesra, Sekdes, staf pelayanan, dan pengelola anggaran desa.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 shrink-0 text-center">
                  <span className="text-[11px] text-muted-foreground block font-medium">Kode Otorisasi Demo:</span>
                  <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-300">DESAJARAK2026</span>
                </div>
              </div>

              {/* SEKSI 1: IDENTITAS APARATUR & JABATAN */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Briefcase size={18} className="text-amber-600" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 1: Identitas Aparatur & Jabatan di Balai Desa
                  </h2>
                </div>

                <div>
                  <Label htmlFor="desa-name" className="text-xs font-bold text-foreground">
                    Nama Lengkap & Gelar Aparatur <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="desa-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Bpk. M. Ridwan Prasetya, S.AP"
                    required
                    className="mt-1.5 h-12 text-sm rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desa-nip" className="text-xs font-bold text-foreground">
                      NIP / NIK Aparatur Desa <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="desa-nip"
                        type="text"
                        value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        placeholder="NIP Pegawai atau NIK 16 Digit"
                        required
                        className="h-12 text-sm font-mono tracking-wider rounded-xl"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Nomor identitas kedinasan atau NIK KTP Anda.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="desa-position" className="text-xs font-bold text-foreground">
                      Jabatan di Balai Desa <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      id="desa-position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="mt-1.5 w-full h-12 px-3 text-sm rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      <option value="Kasi Kesejahteraan (Kesra)">Kepala Seksi Kesejahteraan (Kasi Kesra)</option>
                      <option value="Sekretaris Desa (Sekdes)">Sekretaris Desa (Sekdes)</option>
                      <option value="Kepala Desa (Kades)">Kepala Desa (Kades)</option>
                      <option value="Kaur Keuangan / Bendahara">Kaur Keuangan / Bendahara Desa</option>
                      <option value="Kaur Perencanaan & Pembangunan">Kaur Perencanaan & Pembangunan</option>
                      <option value="Staf Pelayanan & Kesra">Staf Pelayanan & Kesra</option>
                      <option value="Administrator SIMDes SAPA-JARAK">Administrator SIMDes SAPA-JARAK</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Menentukan hak akses dashboard dan validasi APBDes.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEKSI 2: KONTAK & KODE OTORISASI */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <KeyRound size={18} className="text-amber-600" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 2: Kontak Kedinasan & Kode Otorisasi Perangkat Desa
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desa-phone" className="text-xs font-bold text-foreground">
                      Nomor WhatsApp Dinas / Aktif <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="desa-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0812xxxxxxxx"
                        required
                        className="h-12 text-sm pr-10 font-medium rounded-xl"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Phone size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Untuk notifikasi disposisi bantuan dan validasi APBDes.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="desa-email" className="text-xs font-bold text-foreground">
                      Alamat Email Resmi / Dinas
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="desa-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@jarak-kediri.desa.id"
                        className="h-12 text-sm pr-10 rounded-xl"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Mail size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Gunakan email dinas desa atau email aktif.
                    </p>
                  </div>
                </div>

                {/* KODE OTORISASI BALAI DESA */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desa-authcode" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock size={13} className="text-amber-600" />
                      Kode Otorisasi / PIN Pendaftaran Balai Desa <span className="text-rose-500">*</span>
                    </Label>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      Kode: DESAJARAK2026
                    </span>
                  </div>

                  <div className="relative mt-1.5">
                    <Input
                      id="desa-authcode"
                      type="text"
                      value={formData.authCode}
                      onChange={(e) => setFormData({ ...formData, authCode: e.target.value })}
                      placeholder="Masukkan Kode Otorisasi (Contoh: DESAJARAK2026)"
                      required
                      className="h-12 text-sm font-mono tracking-wider uppercase rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Kode pengaman untuk memastikan hanya aparatur sah yang dapat membuat akun petugas balai desa.
                  </p>
                </div>
              </div>

              {/* SEKSI 3: KATA SANDI AKUN */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Lock size={18} className="text-amber-600" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 3: Kata Sandi Akun Petugas Desa
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="desa-password" className="text-xs font-bold text-foreground">
                      Kata Sandi Akun <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="desa-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        required
                        className="h-12 text-sm pr-10 font-mono rounded-xl tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="desa-confirm" className="text-xs font-bold text-foreground">
                      Ulangi Kata Sandi <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="desa-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Ketik ulang kata sandi"
                        required
                        className="h-12 text-sm pr-10 font-mono rounded-xl tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAKTA INTEGRITAS & SUBMIT */}
              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreement}
                    onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                    className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <b>Pakta Integritas Aparatur:</b> Saya menyatakan bahwa saya adalah petugas/aparatur resmi Pemerintah Desa Jarak yang berwenang. Saya berkomitmen mengelola validasi kelayakan bantuan dan anggaran APBDes secara jujur, transparan, dan dapat dipertanggungjawabkan kepada masyarakat.
                  </div>
                </label>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-md rounded-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mendaftarkan Akun Petugas Desa...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Daftarkan Akun Petugas Desa Resmi</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>

            </form>

            {/* Bottom Invitation to Login */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                Sudah memiliki akun aparatur desa yang terdaftar?
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLogin('desa')}
                  className="h-9 px-4 font-bold border-amber-500 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 rounded-xl"
                >
                  Masuk Petugas Desa →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openLogin('warga')}
                  className="h-9 px-3 font-semibold text-muted-foreground hover:text-foreground"
                >
                  Login Warga / Kasun
                </Button>
              </div>
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
          <span>Bantuan & Hotline: (0354) 7482910</span>
        </div>

      </div>
    </div>
  );
}
