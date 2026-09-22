import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import ImageUploader from '../../components/common/ImageUploader';
import { DUSUN_LIST, ASSISTANCE_TYPES } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Copy, 
  Share2, 
  Search, 
  ShieldCheck, 
  Accessibility, 
  Home, 
  RotateCcw,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SubmissionWizardView() {
  const { submitApplication, setCurrentView, setActiveTicketNumber, showToast } = useApp();
  const { speak } = useVoice();

  const [step, setStep] = useState(1);
  const [createdTicket, setCreatedTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    assistanceType: 'RTLH',
    dusunId: 'kalasan',
    rt: '01',
    rw: '01',
    address: '',
    
    beneficiaryName: '',
    nik: '',
    kkNumber: '',
    phone: '',
    isUnregistered: false,
    
    description: '',
    photos: [],
    
    reporterName: '',
    reporterPhone: '',
    reporterRelation: 'Diri Sendiri',
    
    otp: ['', '', '', '', '', '']
  });

  const [errors, setErrors] = useState({});
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);

  useEffect(() => {
    if (step === 1) speak("Langkah 1: Silakan pilih kategori bantuan sosial.");
    else if (step === 2) speak("Langkah 2: Tentukan wilayah dusun, RT, dan RW tempat tinggal.");
    else if (step === 3) speak("Langkah 3: Masukkan identitas nama dan NIK calon penerima manfaat.");
    else if (step === 4) speak("Langkah 4: Jelaskan kondisi faktual dan lampirkan foto kondisi lapangan.");
    else if (step === 5) speak("Langkah 5: Masukkan data nama dan nomor WhatsApp pelapor.");
    else if (step === 6) speak("Langkah 6: Masukkan 6 digit kode OTP verifikasi WhatsApp.");
  }, [step]);

  useEffect(() => {
    let timer;
    if (step === 6 && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  const validateStep = (currentStep) => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.assistanceType) errs.assistanceType = "Pilih kategori bantuan";
    } else if (currentStep === 2) {
      if (!formData.dusunId) errs.dusunId = "Pilih dusun";
      if (!formData.rt) errs.rt = "Nomor RT wajib diisi";
      if (!formData.rw) errs.rw = "Nomor RW wajib diisi";
    } else if (currentStep === 3) {
      if (!formData.beneficiaryName.trim()) errs.beneficiaryName = "Nama penerima wajib diisi";
      if (!formData.isUnregistered && formData.nik.length < 16) {
        errs.nik = "NIK harus terdiri dari 16 digit angka (atau centang opsi tanpa berkas)";
      }
    } else if (currentStep === 4) {
      if (!formData.description.trim() || formData.description.length < 15) {
        errs.description = "Uraikan kondisi faktual minimal 15 karakter untuk asesmen awal";
      }
    } else if (currentStep === 5) {
      if (!formData.reporterName.trim()) errs.reporterName = "Nama pelapor wajib diisi";
      if (!formData.reporterPhone.trim() || formData.reporterPhone.length < 9) {
        errs.reporterPhone = "Nomor WhatsApp aktif wajib diisi";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 60, behavior: 'smooth' });
    } else {
      showToast("Lengkapi kolom yang bertanda merah", "error");
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 60, behavior: 'smooth' });
  };

  const handleOtpChange = (index, val) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...formData.otp];
    newOtp[index] = val;
    setFormData({ ...formData, otp: newOtp });

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setFormData({ ...formData, otp: ['1', '2', '3', '4', '5', '6'] });
    showToast("Kode demo [123456] diisikan.", "info");
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const otpCode = formData.otp.join('');
    if (otpCode.length < 6) {
      setErrors({ otp: "Masukkan 6 digit kode OTP verifikasi." });
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const app = submitApplication(formData);
      setCreatedTicket(app);
      speak(`Pengajuan terdaftar dengan nomor tiket ${app.ticketNumber}`);
    }, 900);
  };

  const copyTicket = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket.ticketNumber);
      showToast(`Nomor Tiket #${createdTicket.ticketNumber} disalin.`, "success");
    }
  };

  const stepsList = [
    { num: 1, label: "Kategori Bantuan" },
    { num: 2, label: "Lokasi Dusun" },
    { num: 3, label: "Data Penerima" },
    { num: 4, label: "Kondisi Faktual" },
    { num: 5, label: "Kontak Pelapor" },
    { num: 6, label: "Verifikasi OTP" }
  ];

  // SUCCESS VIEW
  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in zoom-in-95 duration-300">
        <Card className="border-border/80 p-6 sm:p-10 space-y-6 shadow-xl text-foreground">
          
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Check size={28} className="stroke-[3]" />
          </div>

          <div className="space-y-1.5">
            <Badge variant="success" className="text-[11px] px-3 py-0.5">
              Pengajuan Berhasil Didaftarkan
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Permohonan Terdaftar di Sistem Desa Jarak
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Notifikasi telah diteruskan ke Kepala Dusun {createdTicket.dusunName} untuk jadwal verifikasi peninjauan lapangan.
            </p>
          </div>

          {/* Ticket Display */}
          <div className="bg-muted/40 border border-border/80 rounded-xl p-6 space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Nomor Register Tiket
            </span>
            <div className="text-3xl font-black font-mono text-primary dark:text-emerald-400 tracking-wider">
              #{createdTicket.ticketNumber}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gunakan nomor tiket ini untuk memantau proses verifikasi kasun dan validasi desa.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyTicket}
                className="gap-1.5 font-bold border-border shadow-2xs"
              >
                <Copy size={13} />
                <span>Salin Nomor Tiket</span>
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  const text = `Permohonan bantuan SAPA-JARAK Desa Jarak terdaftar dengan Nomor Tiket #${createdTicket.ticketNumber}. Lacak status di: https://sapa-jarak.desa.id/lacak?ticket=${createdTicket.ticketNumber}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                <Share2 size={13} />
                <span>Bagikan ke WhatsApp</span>
              </Button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch justify-center gap-2.5">
            <Button
              size="default"
              onClick={() => {
                setActiveTicketNumber(createdTicket.ticketNumber);
                setCurrentView('lacak');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="gap-2 font-bold shadow-md"
            >
              <Search size={14} />
              <span>Buka Pelacakan Tiket Ini</span>
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="border-border"
            >
              Kembali ke Beranda
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  // WIZARD FORM
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6" data-aos="fade-up" data-aos-duration="650">
      
      {/* Header */}
      <div className="space-y-1.5">
        <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-bold border-border bg-muted/40 text-foreground">
          Formulir Pelayanan Publik
        </Badge>
        <h1 className="text-xl sm:text-2xl font-black text-foreground">
          Pendaftaran Pengajuan Bantuan Sosial
        </h1>
        <p className="text-xs text-muted-foreground">
          Isi formulir secara berurutan. Data akan diverifikasi faktual di lapangan oleh Kasun wilayah.
        </p>
      </div>

      {/* Stepper Card */}
      <Card className="border-border/80 p-4 shadow-xs">
        <div className="grid grid-cols-6 gap-1 text-center">
          {stepsList.map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center space-y-1.5">
                <div 
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs transition-colors",
                    isDone 
                      ? "bg-emerald-600 text-white" 
                      : isCurrent 
                      ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30" 
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isDone ? <Check size={13} className="stroke-[3]" /> : s.num}
                </div>
                <span className={cn("text-[10px] font-semibold hidden sm:block truncate max-w-[80px]", isCurrent ? "text-foreground font-bold" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3">
          <Progress value={((step - 1) / 5) * 100} className="h-1.5 bg-muted" />
        </div>
      </Card>

      {/* Step Form Box */}
      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-0 duration-200">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground">Langkah 1: Pilih Kategori Bantuan</h2>
                <p className="text-xs text-muted-foreground">Tentukan jenis bantuan yang diajukan</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({ ...formData, assistanceType: 'RTLH' })}
                  className={cn(
                    "p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3",
                    formData.assistanceType === 'RTLH' 
                      ? "border-primary bg-primary/5 shadow-xs" 
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Home size={19} />
                    </div>
                    <div>
                      <Badge variant="success" className="text-[9px] px-1.5 py-0">Kategori 01</Badge>
                      <h3 className="text-sm font-bold text-foreground mt-0.5">Rehabilitasi RTLH</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Perbaikan rumah dengan kerusakan dinding gedek, atap bocor parah, lantai tanah, dan sanitasi.
                  </p>
                </div>

                <div 
                  onClick={() => setFormData({ ...formData, assistanceType: 'DISABILITAS' })}
                  className={cn(
                    "p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3",
                    formData.assistanceType === 'DISABILITAS' 
                      ? "border-primary bg-primary/5 shadow-xs" 
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                      <Accessibility size={19} />
                    </div>
                    <div>
                      <Badge variant="info" className="text-[9px] px-1.5 py-0">Kategori 02</Badge>
                      <h3 className="text-sm font-bold text-foreground mt-0.5">Alat Bantu Disabilitas</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Penyediaan alat mobilitas (Kursi Roda standar/CP, Kruk, Walker, Hearing Aid).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-0 duration-200 text-xs">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground">Langkah 2: Lokasi Domisili di Desa Jarak</h2>
                <p className="text-xs text-muted-foreground">Pilih dusun dan alamat rumah pemohon</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="dusunId">
                    Dusun Wilayah Desa Jarak <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="dusunId"
                    value={formData.dusunId}
                    onChange={(e) => setFormData({ ...formData, dusunId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {DUSUN_LIST.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dusun {d.name} (Kasun: {d.kasunName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rt">Nomor RT <span className="text-destructive">*</span></Label>
                  <Input
                    id="rt"
                    type="text"
                    placeholder="Contoh: 03"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  />
                  {errors.rt && <p className="text-[11px] text-destructive font-medium">{errors.rt}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rw">Nomor RW <span className="text-destructive">*</span></Label>
                  <Input
                    id="rw"
                    type="text"
                    placeholder="Contoh: 01"
                    value={formData.rw}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  />
                  {errors.rw && <p className="text-[11px] text-destructive font-medium">{errors.rw}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="address">Patokan Alamat Rumah</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Contoh: Depan musholla / timur pos kamling"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-0 duration-200 text-xs">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground">Langkah 3: Identitas Calon Penerima Manfaat</h2>
                <p className="text-xs text-muted-foreground">Data warga yang membutuhkan bantuan sosial</p>
              </div>

              <Alert variant="warning" className="p-3.5">
                <Info size={16} />
                <div className="flex items-start gap-2.5 ml-2">
                  <input
                    type="checkbox"
                    id="unreg-check"
                    checked={formData.isUnregistered}
                    onChange={(e) => setFormData({ ...formData, isUnregistered: e.target.checked })}
                    className="mt-0.5 rounded border-border"
                  />
                  <label htmlFor="unreg-check" className="text-[11px] leading-relaxed cursor-pointer text-foreground">
                    <span className="font-bold block">Warga Rentan / Terlantar Tanpa Berkas Kependudukan</span>
                    Centang jika warga sebatang kara dan belum memiliki fisik KTP/KK. Kasun akan memverifikasi dan mendampingi administrasi kependudukan.
                  </label>
                </div>
              </Alert>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="beneficiaryName">
                    Nama Lengkap Penerima <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="beneficiaryName"
                    type="text"
                    placeholder="Nama sesuai KTP atau nama panggilan warga"
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  />
                  {errors.beneficiaryName && <p className="text-[11px] text-destructive font-medium">{errors.beneficiaryName}</p>}
                </div>

                {!formData.isUnregistered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="nik">
                        NIK (16 Digit) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nik"
                        type="text"
                        maxLength={16}
                        placeholder="350612xxxxxxxxxx"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                        className="font-mono"
                      />
                      {errors.nik && <p className="text-[11px] text-destructive font-medium">{errors.nik}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="kkNumber">Nomor KK (16 Digit)</Label>
                      <Input
                        id="kkNumber"
                        type="text"
                        maxLength={16}
                        placeholder="350612xxxxxxxxxx"
                        value={formData.kkNumber}
                        onChange={(e) => setFormData({ ...formData, kkNumber: e.target.value.replace(/\D/g, '') })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-0 duration-200 text-xs">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground">Langkah 4: Kondisi Faktual & Lampiran Foto</h2>
                <p className="text-xs text-muted-foreground">Deskripsikan kondisi fisik rumah atau keterbatasan mobilitas</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Uraian Kondisi Lapangan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Contoh: Dinding samping bambu rapuh termakan rayap, atap dapur bocor parah saat hujan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-[11px] text-destructive font-medium">{errors.description}</p>}
              </div>

              <ImageUploader
                photos={formData.photos}
                onChange={(newPhotos) => setFormData({ ...formData, photos: newPhotos })}
              />
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in-0 duration-200 text-xs">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground">Langkah 5: Identitas Pelapor</h2>
                <p className="text-xs text-muted-foreground">Data pihak yang menyampaikan aspirasi/laporan</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="reporterName">Nama Pelapor <span className="text-destructive">*</span></Label>
                  <Input
                    id="reporterName"
                    type="text"
                    placeholder="Nama Anda"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  />
                  {errors.reporterName && <p className="text-[11px] text-destructive font-medium">{errors.reporterName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reporterRelation">Hubungan dengan Penerima</Label>
                  <select
                    id="reporterRelation"
                    value={formData.reporterRelation}
                    onChange={(e) => setFormData({ ...formData, reporterRelation: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Diri Sendiri">Diri Sendiri (Pemohon)</option>
                    <option value="Keluarga / Anak Kandung">Keluarga / Anak Kandung</option>
                    <option value="Tetangga">Tetangga Sekitar</option>
                    <option value="Pengurus RT / RW">Pengurus RT / RW</option>
                    <option value="Relawan Desa">Relawan Desa</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="reporterPhone">
                    Nomor WhatsApp Pelapor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="081234567890"
                    value={formData.reporterPhone}
                    onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                    className="font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Kode verifikasi OTP dan notifikasi riwayat status akan dikirimkan ke nomor ini.
                  </p>
                  {errors.reporterPhone && <p className="text-[11px] text-destructive font-medium">{errors.reporterPhone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: OTP */}
          {step === 6 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in-0 duration-200 text-center max-w-sm mx-auto py-2">
              <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center mx-auto border border-border">
                <Lock size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-foreground">Verifikasi Nomor WhatsApp</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Masukkan 6 digit kode OTP ke nomor: <b>{formData.reporterPhone}</b>
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-1">
                {formData.otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 h-11 text-center text-lg font-bold font-mono bg-background border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-ring outline-none shadow-xs text-foreground"
                  />
                ))}
              </div>

              {errors.otp && <p className="text-xs text-destructive font-bold">{errors.otp}</p>}

              <div className="p-2.5 bg-muted/60 rounded-lg border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="text-primary hover:underline font-bold"
                >
                  Klik untuk Isi Kode Demo Otomatis [123456]
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground">
                {otpCountdown > 0 ? (
                  <span>Kirim ulang kode dalam {otpCountdown} detik</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setOtpCountdown(60); showToast("Kode OTP dikirim ulang.", "info"); }}
                    className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw size={11} /> Kirim Ulang OTP
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full h-10 font-bold shadow-md"
              >
                {isVerifyingOtp ? "Memverifikasi..." : "Kirim & Dapatkan Nomor Tiket"}
              </Button>
            </form>
          )}

          {/* Navigation Buttons (Steps 1-5) */}
          {step < 6 && (
            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  size="sm"
                  className="gap-1.5 border-border"
                >
                  <ArrowLeft size={13} />
                  <span>Sebelumnya</span>
                </Button>
              ) : <div />}

              <Button
                type="button"
                onClick={handleNext}
                size="sm"
                className="gap-1.5 font-bold shadow-xs"
              >
                <span>Lanjut ke Langkah {step + 1}</span>
                <ArrowRight size={13} />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
