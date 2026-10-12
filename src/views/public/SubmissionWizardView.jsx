import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoice } from '../../context/VoiceContext';
import ImageUploader from '../../components/common/ImageUploader';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Alert } from '../../components/ui/alert';
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
  Info,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SubmissionWizardView() {
  const { submitApplication, setCurrentView, setActiveTicketNumber, showToast, currentUser } = useApp();
  const { speak } = useVoice();

  const [step, setStep] = useState(1);
  const [createdTicket, setCreatedTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    assistanceType: 'RTLH',
    dusunId: currentUser?.dusunId || 'kalasan',
    rt: currentUser?.rt || '01',
    rw: currentUser?.rw || '01',
    address: currentUser?.address || '',
    
    beneficiaryName: currentUser?.name || '',
    nik: currentUser?.nik || '',
    kkNumber: currentUser?.kkNumber || '',
    phone: currentUser?.phone || '',
    isUnregistered: false,
    
    description: '',
    photos: [],
    
    reporterName: currentUser?.name || '',
    reporterPhone: currentUser?.phone || '',
    reporterRelation: 'Diri Sendiri',
    
    otp: ['1', '2', '3', '4', '5', '6']
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Speech helper on step change
  useEffect(() => {
    if (step === 1) speak("Tahap 1: Pilih kategori bantuan sosial yang ingin Anda ajukan.");
    else if (step === 2) speak("Tahap 2: Masukkan identitas nama, nomor KTP, dan lokasi dusun penerima.");
    else if (step === 3) speak("Tahap 3: Lampirkan foto dan ceritakan kondisi yang membutuhkan bantuan.");
    else if (step === 4) speak("Tahap 4: Masukkan nomor WhatsApp untuk menerima kabar status dan konfirmasi permohonan.");
  }, [step]);

  // Autofill helpers
  const handleAutoFillUser = () => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        beneficiaryName: currentUser.name,
        nik: currentUser.nik || '3506121405850001',
        kkNumber: currentUser.kkNumber || '3506121008030002',
        reporterName: currentUser.name,
        reporterPhone: currentUser.phone || '081234567890',
        dusunId: currentUser.dusunId || 'kalasan',
        rt: currentUser.rt || '02',
        rw: currentUser.rw || '01',
        address: currentUser.address || 'Dekat Balai Dusun',
      }));
      showToast('Data akun Anda berhasil diisikan ke formulir!', 'success');
    }
  };

  const handleFillDemo = () => {
    setFormData({
      assistanceType: 'RTLH',
      dusunId: 'jaraklor',
      rt: '03',
      rw: '01',
      address: 'Sebelah barat Masjid Nurul Huda, Dusun Jarak Lor',
      beneficiaryName: 'Bpk. Danang Prasetyo',
      nik: '3506121405850001',
      kkNumber: '3506121008030002',
      phone: '081234567890',
      isUnregistered: false,
      description: 'Atap dapur dan ruang tengah bocor parah saat musim hujan. Dinding samping anyaman bambu (gedek) sudah lapuk dan miring.',
      photos: [
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=800'
      ],
      reporterName: 'Danang Prasetyo',
      reporterPhone: '081234567890',
      reporterRelation: 'Diri Sendiri',
      otp: ['1', '2', '3', '4', '5', '6']
    });
    showToast('Contoh data pengajuan berhasil diisikan secara lengkap.', 'info');
  };

  // Validation
  const validateStep = (currentStep) => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.assistanceType) errs.assistanceType = "Pilih salah satu kategori bantuan";
    } else if (currentStep === 2) {
      if (!formData.beneficiaryName.trim()) errs.beneficiaryName = "Nama lengkap penerima wajib diisi";
      if (!formData.isUnregistered && (!formData.nik || formData.nik.length < 16)) {
        errs.nik = "Nomor Induk Kependudukan (NIK) harus 16 digit angka (atau centang opsi tanpa KTP)";
      }
      if (!formData.dusunId) errs.dusunId = "Pilih wilayah dusun";
      if (!formData.rt) errs.rt = "Nomor RT wajib diisi";
      if (!formData.rw) errs.rw = "Nomor RW wajib diisi";
    } else if (currentStep === 3) {
      if (!formData.description.trim() || formData.description.length < 10) {
        errs.description = "Ceritakan kondisi rumah atau kebutuhan alat minimal 10 karakter agar kasun paham";
      }
    } else if (currentStep === 4) {
      if (!formData.reporterName.trim()) errs.reporterName = "Nama pelapor/pemohon wajib diisi";
      if (!formData.reporterPhone.trim() || formData.reporterPhone.length < 9) {
        errs.reporterPhone = "Nomor WhatsApp aktif wajib diisi untuk kabar status";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 40, behavior: 'smooth' });
    } else {
      showToast("Lengkapi kolom bertanda merah terlebih dahulu.", "warning");
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 40, behavior: 'smooth' });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) {
      showToast("Lengkapi data kontak Anda sebelum mengirim.", "warning");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const app = submitApplication(formData);
      setCreatedTicket(app);
      speak(`Selamat, pengajuan Anda berhasil terdaftar dengan nomor tiket ${app.ticketNumber}`);
    }, 800);
  };

  const copyTicket = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket.ticketNumber);
      showToast(`Nomor Tiket #${createdTicket.ticketNumber} berhasil disalin!`, "success");
    }
  };

  const stepsList = [
    { num: 1, title: "Pilih Bantuan", subtitle: "RTLH atau Alat Disabilitas" },
    { num: 2, title: "Data Penerima & Dusun", subtitle: "Nama, NIK, dan Alamat" },
    { num: 3, title: "Kondisi & Foto", subtitle: "Cerita kondisi & bukti foto" },
    { num: 4, title: "Kontak WhatsApp", subtitle: "Nomor untuk kabar status" }
  ];

  // ---------------- SUCCESS SCREEN ----------------
  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center animate-in zoom-in-95 duration-300">
        <Card className="border-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl bg-card">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-md">
            <Check size={36} className="stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold">
              ✓ Permohonan Berhasil Dikirim
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Permohonan Anda Sudah Terdaftar!
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Kabar telah otomatis diteruskan kepada <b>Kepala Dusun {createdTicket.dusunName}</b> untuk peninjauan langsung ke rumah Anda.
            </p>
          </div>

          {/* Ticket Display Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
              Nomor Tiket Anda
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-800 dark:text-emerald-300 tracking-wider">
              #{createdTicket.ticketNumber}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Simpan nomor tiket ini untuk mengecek sejauh mana proses survei kasun dan validasi desa berjalan.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="default"
                onClick={copyTicket}
                className="h-11 px-4 gap-2 font-bold border-border bg-card hover:bg-muted rounded-xl shadow-xs"
              >
                <Copy size={16} />
                <span>Salin Nomor Tiket</span>
              </Button>

              <Button
                size="default"
                onClick={() => {
                  const text = `Halo, permohonan bantuan sosial SAPA-JARAK Desa Jarak telah terdaftar dengan Nomor Tiket #${createdTicket.ticketNumber} untuk penerima ${createdTicket.beneficiaryName} di Dusun ${createdTicket.dusunName}.`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="h-11 px-4 gap-2 font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
              >
                <Share2 size={16} />
                <span>Bagikan ke WhatsApp</span>
              </Button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <Button
              size="lg"
              onClick={() => {
                setActiveTicketNumber(createdTicket.ticketNumber);
                setCurrentView('lacak');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-12 px-6 gap-2 text-sm sm:text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
            >
              <Search size={18} />
              <span>Lacak Status Permohonan Ini</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-12 px-5 text-sm font-bold border-border rounded-xl"
            >
              Kembali ke Beranda
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  // ---------------- FORM WIZARD ----------------
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Header & Autofill Tool */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
            Formulir Pendaftaran Bantuan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Pengajuan Bantuan Sosial Warga
          </h1>
          <p className="text-sm text-muted-foreground">
            Layanan pengajuan resmi Desa Jarak. Gratis dan diproses berjenjang secara adil.
          </p>
        </div>

        {/* Quick Fill Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFillUser}
              className="h-9 gap-1.5 text-xs font-bold border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl"
            >
              <UserCheck size={14} /> Gunakan Data Akun Saya
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="h-9 gap-1.5 text-xs font-bold border-border bg-card hover:bg-muted text-muted-foreground rounded-xl"
            >
              <Sparkles size={14} className="text-amber-500" /> Isi Contoh Demo Cepat
            </Button>
          )}
        </div>
      </div>

      {/* Stepper Card */}
      <Card className="border-border rounded-2xl p-4 sm:p-5 shadow-xs bg-card">
        <div className="grid grid-cols-4 gap-2 text-center">
          {stepsList.map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center space-y-2">
                <div 
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all",
                    isDone 
                      ? "bg-emerald-700 text-white shadow-xs" 
                      : isCurrent 
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-600 shadow-sm" 
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {isDone ? <Check size={18} className="stroke-[3]" /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <div className={cn("text-xs font-bold", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                    {s.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                    {s.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Progress value={((step - 1) / 3) * 100} className="h-2 bg-muted" />
        </div>
      </Card>

      {/* Main Step Form Card */}
      <Card className="border-border rounded-3xl shadow-lg bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: Pilih Kategori Bantuan */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Tahap 1: Pilih Jenis Bantuan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Klik salah satu bantuan di bawah ini yang sesuai dengan kebutuhan Anda atau warga.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option RTLH */}
                <div 
                  onClick={() => setFormData({ ...formData, assistanceType: 'RTLH' })}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4",
                    formData.assistanceType === 'RTLH' 
                      ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-600/30" 
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <Home size={26} />
                    </div>
                    {formData.assistanceType === 'RTLH' && (
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                        <Check size={14} className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                      Rehabilitasi Rumah (RTLH)
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5">
                      Bantuan material semen, bata, genteng/asbes, kayu, dan sanitasi bagi rumah tidak layak huni dengan kerusakan atap, dinding bambu lapuk, atau lantai tanah.
                    </p>
                  </div>
                </div>

                {/* Option Disabilitas */}
                <div 
                  onClick={() => setFormData({ ...formData, assistanceType: 'DISABILITAS' })}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4",
                    formData.assistanceType === 'DISABILITAS' 
                      ? "border-sky-600 bg-sky-50/80 dark:bg-sky-950/40 shadow-md ring-2 ring-sky-600/30" 
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                      <Accessibility size={26} />
                    </div>
                    {formData.assistanceType === 'DISABILITAS' && (
                      <span className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center">
                        <Check size={14} className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                      Alat Bantu Disabilitas & Lansia
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5">
                      Penyediaan alat mobilitas seperti kursi roda (standar/CP), kruk ketiak, walker roda, tongkat, atau alat bantu dengar bagi lansia dan disabilitas fisik.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: Data Penerima & Lokasi Dusun */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Tahap 2: Data Calon Penerima & Wilayah Dusun</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Isi data warga yang membutuhkan bantuan sosial dan tentukan lokasi tempat tinggalnya.
                </p>
              </div>

              {/* Special notice for unregistered elders */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="unreg-check"
                  checked={formData.isUnregistered}
                  onChange={(e) => setFormData({ ...formData, isUnregistered: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="unreg-check" className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 cursor-pointer">
                  <span className="font-bold block">Penerima belum punya fisik KTP / Lansia sebatang kara?</span>
                  Centang opsi ini jika warga belum memiliki berkas KTP/KK. Pengajuan tetap diproses dan Kasun akan mendampingi administrasi kependudukan saat survei.
                </label>
              </div>

              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <Label htmlFor="beneficiaryName" className="text-sm font-bold text-foreground">
                    Nama Lengkap Penerima Manfaat <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="beneficiaryName"
                    type="text"
                    placeholder="Contoh: Danang Prasetyo atau Mbah Sutinah"
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    className="h-12 text-sm sm:text-base rounded-xl"
                  />
                  {errors.beneficiaryName && <p className="text-xs text-rose-600 font-bold">{errors.beneficiaryName}</p>}
                </div>

                {!formData.isUnregistered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nik" className="text-sm font-bold text-foreground">
                        Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-600">*</span>
                      </Label>
                      <Input
                        id="nik"
                        type="text"
                        maxLength={16}
                        placeholder="350612xxxxxxxxxx"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                        className="h-12 text-sm sm:text-base font-mono rounded-xl"
                      />
                      {errors.nik && <p className="text-xs text-rose-600 font-bold">{errors.nik}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="kkNumber" className="text-sm font-bold text-foreground">
                        Nomor Kartu Keluarga (KK 16 Digit - Opsional)
                      </Label>
                      <Input
                        id="kkNumber"
                        type="text"
                        maxLength={16}
                        placeholder="350612xxxxxxxxxx"
                        value={formData.kkNumber}
                        onChange={(e) => setFormData({ ...formData, kkNumber: e.target.value.replace(/\D/g, '') })}
                        className="h-12 text-sm sm:text-base font-mono rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-1 space-y-1.5">
                    <Label htmlFor="dusunId" className="text-sm font-bold text-foreground">
                      Wilayah Dusun <span className="text-rose-600">*</span>
                    </Label>
                    <select
                      id="dusunId"
                      value={formData.dusunId}
                      onChange={(e) => setFormData({ ...formData, dusunId: e.target.value })}
                      className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      {DUSUN_LIST.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dusun {d.name} (Kasun: {d.kasunName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rt" className="text-sm font-bold text-foreground">
                      Nomor RT <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      id="rt"
                      type="text"
                      placeholder="Contoh: 02"
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      className="h-12 text-sm sm:text-base rounded-xl"
                    />
                    {errors.rt && <p className="text-xs text-rose-600 font-bold">{errors.rt}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rw" className="text-sm font-bold text-foreground">
                      Nomor RW <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      id="rw"
                      type="text"
                      placeholder="Contoh: 01"
                      value={formData.rw}
                      onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                      className="h-12 text-sm sm:text-base rounded-xl"
                    />
                    {errors.rw && <p className="text-xs text-rose-600 font-bold">{errors.rw}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-bold text-foreground">
                    Patokan Alamat Rumah / Petunjuk Jalan
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Contoh: Depan musholla Al-Ikhlas, timur pos kamling RT 02"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-12 text-sm sm:text-base rounded-xl"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Kondisi Faktual & Lampiran Foto */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Tahap 3: Cerita Kondisi & Lampiran Foto</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Jelaskan kondisi fisik rumah atau kebutuhan alat mobilitas agar Kepala Dusun dapat mempersiapkan peninjauan.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-bold text-foreground">
                  Uraian Kondisi Lapangan <span className="text-rose-600">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Contoh: Atap rumah bagian dapur dan ruang tamu bocor parah saat hujan. Dinding bambu lapuk termakan rayap. Calon penerima seorang lansia dan membutuhkan bantuan perbaikan mendesak..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="text-sm sm:text-base rounded-2xl p-4 leading-relaxed"
                />
                {errors.description && <p className="text-xs text-rose-600 font-bold">{errors.description}</p>}
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-sm font-bold text-foreground block">
                  Unggah Foto Kondisi Rumah / Penerima (Opsional tetapi Dianjurkan)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Foto memudahkan Kepala Dusun mengenali lokasi dan tingkat kerusakan sebelum datang ke rumah.
                </p>
                <ImageUploader
                  photos={formData.photos}
                  onChange={(newPhotos) => setFormData({ ...formData, photos: newPhotos })}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Kontak WhatsApp & Konfirmasi */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in-0 duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Tahap 4: Kontak WhatsApp & Konfirmasi Pengajuan</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Nomor WhatsApp ini akan menerima pemberitahuan setiap ada pembaruan status dari desa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <Label htmlFor="reporterName" className="text-sm font-bold text-foreground">
                    Nama Pemohon / Pelapor <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="reporterName"
                    type="text"
                    placeholder="Nama Anda"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    className="h-12 text-sm sm:text-base rounded-xl"
                  />
                  {errors.reporterName && <p className="text-xs text-rose-600 font-bold">{errors.reporterName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reporterRelation" className="text-sm font-bold text-foreground">
                    Hubungan dengan Calon Penerima
                  </Label>
                  <select
                    id="reporterRelation"
                    value={formData.reporterRelation}
                    onChange={(e) => setFormData({ ...formData, reporterRelation: e.target.value })}
                    className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <option value="Diri Sendiri">Diri Sendiri (Penerima Langsung)</option>
                    <option value="Keluarga / Anak">Keluarga / Anak Kandung</option>
                    <option value="Tetangga Sekitar">Tetangga Dekat</option>
                    <option value="Pengurus RT / RW">Pengurus RT / RW</option>
                    <option value="Relawan Sosial">Relawan Sosial Desa</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="reporterPhone" className="text-sm font-bold text-foreground">
                    Nomor WhatsApp Aktif <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={formData.reporterPhone}
                    onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                    className="h-12 text-sm sm:text-base font-mono rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nomor tiket dan kabar survei Kepala Dusun akan dikirimkan otomatis ke WhatsApp ini.
                  </p>
                  {errors.reporterPhone && <p className="text-xs text-rose-600 font-bold">{errors.reporterPhone}</p>}
                </div>

              </div>

              {/* Summary Review Card */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs sm:text-sm">
                <span className="font-extrabold text-foreground block">Ringkasan Data Permohonan:</span>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Jenis Bantuan: <b className="text-foreground">{formData.assistanceType === 'RTLH' ? 'Rehabilitasi Rumah (RTLH)' : 'Alat Disabilitas'}</b></div>
                  <div>Wilayah: <b className="text-foreground">Dusun {DUSUN_LIST.find(d => d.id === formData.dusunId)?.name || formData.dusunId}</b></div>
                  <div>Penerima: <b className="text-foreground">{formData.beneficiaryName || '-'}</b></div>
                  <div>Pelapor: <b className="text-foreground">{formData.reporterName || '-'} ({formData.reporterRelation})</b></div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-lg gap-2"
              >
                {isSubmitting ? (
                  <span>Mengirimkan Permohonan...</span>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Kirim Permohonan & Dapatkan Nomor Tiket</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Stepper Navigation Buttons (Step 1-3) */}
          {step < 4 && (
            <div className="pt-6 border-t border-border flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-12 px-5 gap-2 text-sm font-bold border-border rounded-xl"
                >
                  <ArrowLeft size={16} />
                  <span>Sebelumnya</span>
                </Button>
              ) : <div />}

              <Button
                type="button"
                onClick={handleNext}
                className="h-12 px-6 gap-2 text-sm sm:text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md"
              >
                <span>Lanjut ke Tahap {step + 1}</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}
