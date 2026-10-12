import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Building2, 
  UserPlus, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle,
  Phone,
  CreditCard,
  Home,
  Lock,
  MapPin,
  Check,
  Info,
  ArrowRight
} from 'lucide-react';

export default function RegisterView() {
  const { register, setCurrentView, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    kkNumber: '',
    dusunId: 'jaraklor',
    rt: '02',
    rw: '01',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Quick fill test data for instant evaluation
  const handleQuickFill = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: `Siti Nurjanah (${randomSuffix})`,
      nik: `350612450890${randomSuffix}`,
      kkNumber: `350612200508${randomSuffix}`,
      dusunId: 'jaraklor',
      rt: '02',
      rw: '01',
      phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `warga.${randomSuffix}@gmail.com`,
      password: 'password123',
      confirmPassword: 'password123',
      agreement: true
    });
    setErrorText('');
    showToast('Data contoh warga berhasil diisi secara otomatis.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (!formData.name.trim()) {
      setErrorText('Nama lengkap wajib diisi sesuai KTP.');
      return;
    }

    if (formData.nik && formData.nik.length !== 16) {
      setErrorText('NIK harus terdiri dari tepat 16 digit angka.');
      return;
    }

    if (formData.kkNumber && formData.kkNumber.length !== 16) {
      setErrorText('Nomor Kartu Keluarga (KK) harus 16 digit angka.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorText('Nomor WhatsApp aktif wajib diisi minimal 10 digit angka.');
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
      setErrorText('Anda harus mencentang pernyataan kebenaran data kependudukan.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(formData);
      if (!res.success) {
        setErrorText(res.message || 'Pendaftaran belum berhasil. Silakan coba lagi.');
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorText('Terjadi kendala pada server. Silakan coba kembali sesaat lagi.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-neutral-950 dark:to-neutral-950 transition-colors">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleQuickFill}
            className="text-xs font-bold gap-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-2xs rounded-xl"
            title="Klik untuk mengisi data contoh otomatis agar cepat diuji"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Isi Contoh Data Warga (Uji Cepat)</span>
          </Button>
        </div>

        {/* Card Form */}
        <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-border p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
                <UserPlus size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Pendaftaran Akun Warga
                  </h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold">
                    Desa Jarak
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Daftarkan diri Anda untuk mengajukan bantuan RTLH, alat disabilitas, dan memantau status secara mandiri.
                </p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SEKSI 1: IDENTITAS DIRI */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <CreditCard size={18} className="text-primary" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 1: Data Kependudukan (KTP & KK)
                  </h2>
                </div>

                <div>
                  <Label htmlFor="reg-name" className="text-xs font-bold text-foreground">
                    Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Danang Prasetyo"
                    required
                    className="mt-1.5 h-12 text-sm rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-nik" className="text-xs font-bold text-foreground">
                        NIK (16 Digit Angka) <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formData.nik.length}/16
                      </span>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        id="reg-nik"
                        type="text"
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                        placeholder="350612xxxxxxxxxx"
                        required
                        className="h-12 text-sm font-mono tracking-wider pr-10 rounded-xl"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <CreditCard size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Tertera di KTP atau baris data keluarga Anda.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-kk" className="text-xs font-bold text-foreground">
                        Nomor Kartu Keluarga (KK)
                      </Label>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formData.kkNumber.length}/16
                      </span>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        id="reg-kk"
                        type="text"
                        maxLength={16}
                        value={formData.kkNumber}
                        onChange={(e) => setFormData({ ...formData, kkNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="350612xxxxxxxxxx"
                        className="h-12 text-sm font-mono tracking-wider pr-10 rounded-xl"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Home size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      16 digit angka di bagian atas lembar KK.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEKSI 2: WILAYAH TEMPAT TINGGAL */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <MapPin size={18} className="text-blue-600" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 2: Wilayah Dusun Tempat Tinggal
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <Label htmlFor="reg-dusun" className="text-xs font-bold text-foreground">
                      Dusun Domisili <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      id="reg-dusun"
                      value={formData.dusunId}
                      onChange={(e) => setFormData({ ...formData, dusunId: e.target.value })}
                      className="mt-1.5 w-full h-12 px-3.5 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {DUSUN_LIST.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dusun {d.name} ({d.kasunName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="reg-rt" className="text-xs font-bold text-foreground">
                      Nomor RT
                    </Label>
                    <Input
                      id="reg-rt"
                      type="text"
                      maxLength={3}
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      placeholder="01"
                      className="mt-1.5 h-12 text-sm font-mono rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reg-rw" className="text-xs font-bold text-foreground">
                      Nomor RW
                    </Label>
                    <Input
                      id="reg-rw"
                      type="text"
                      maxLength={3}
                      value={formData.rw}
                      onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                      placeholder="01"
                      className="mt-1.5 h-12 text-sm font-mono rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 3: KONTAK & KATA SANDI */}
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Phone size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-extrabold text-foreground">
                    Bagian 3: Nomor WhatsApp & Keamanan Akun
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-phone" className="text-xs font-bold text-foreground">
                      Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        required
                        className="h-12 text-sm pr-10 rounded-xl"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Phone size={16} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Pemberitahuan nomor tiket & status bantuan akan dikirim otomatis ke nomor ini.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reg-email" className="text-xs font-bold text-foreground">
                      Alamat Email <span className="text-muted-foreground font-normal">(Opsional)</span>
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="mt-1.5 h-12 text-sm rounded-xl"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Boleh dikosongkan bila tidak memiliki email.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label htmlFor="reg-pass" className="text-xs font-bold text-foreground">
                      Buat Kata Sandi <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="reg-pass"
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
                    <Label htmlFor="reg-pass2" className="text-xs font-bold text-foreground">
                      Ulangi Kata Sandi <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="reg-pass2"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Ulangi kata sandi di samping"
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

              {/* Checkbox Persetujuan Kebenaran Data */}
              <div className="pt-1">
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreement}
                    onChange={(e) => setFormData({ ...formData, agreement: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary w-5 h-5 mt-0.5 shrink-0"
                    required
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Saya menyatakan dengan sebenarnya bahwa data kependudukan yang saya isikan adalah benar dan sah sebagai warga masyarakat Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md rounded-xl mt-4 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan Akun Warga...
                  </span>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Daftarkan Akun & Langsung Masuk ke Layanan</span>
                    <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Bottom Card to Login */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-5 rounded-2xl">
              <div>
                <span className="font-extrabold text-sm text-foreground block">
                  Sudah memiliki akun terdaftar?
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Masuk menggunakan NIK atau Nomor WhatsApp Anda yang sudah ada.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('login')}
                className="h-9 px-4 text-xs font-bold border-primary text-primary hover:bg-primary/10 shrink-0 gap-1.5 rounded-xl shadow-2xs"
              >
                <span>Masuk ke Akun Anda →</span>
              </Button>
            </div>

          </div>

        </div>

        {/* Footer Assurance */}
        <div className="mt-8 text-center text-xs text-muted-foreground max-w-xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>Data NIK dilindungi enkripsi sesuai standar pelayanan publik Pemerintah Kabupaten Kediri.</span>
        </div>

      </div>
    </div>
  );
}
