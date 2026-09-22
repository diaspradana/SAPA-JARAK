// Konfigurasi Resmi Wilayah & Parameter Desa Jarak, Kec. Plosoklaten, Kab. Kediri

export const DESA_CONFIG = {
  namaDesa: "Desa Jarak",
  kecamatan: "Kecamatan Plosoklaten",
  kabupaten: "Kabupaten Kediri",
  provinsi: "Jawa Timur",
  kodePos: "64175",
  alamatKantor: "Jl. Raya Jarak No. 12, Desa Jarak, Kec. Plosoklaten, Kab. Kediri",
  teleponKantor: "(0354) 7482910",
  whatsappCenter: "0812-3456-7890",
  emailDesa: "pemdes@jarak-kediri.desa.id",
  jamLayanan: "Senin – Jumat: 08.00 – 15.30 WIB",
  koordinatKantor: {
    lat: -7.904512,
    lng: 112.189421
  }
};

export const DUSUN_LIST = [
  { id: "kalasan", name: "Kalasan", code: "KLS", kasunName: "Bpk. Suwandi", kasunPhone: "0813-8822-1101", rtCount: 6, rwCount: 2, centerCoord: [-7.9012, 112.1854] },
  { id: "sagi", name: "Sagi", code: "SGI", kasunName: "Bpk. Bambang Sutrisno", kasunPhone: "0812-7744-2202", rtCount: 8, rwCount: 2, centerCoord: [-7.9085, 112.1932] },
  { id: "jaraklor", name: "Jarak Lor", code: "JRL", kasunName: "Bpk. Agus Prasetyo", kasunPhone: "0813-6611-3303", rtCount: 7, rwCount: 2, centerCoord: [-7.8965, 112.1821] },
  { id: "jarakkidul", name: "Jarak Kidul", code: "JRK", kasunName: "Bpk. Joko Maryanto", kasunPhone: "0812-5599-4404", rtCount: 5, rwCount: 2, centerCoord: [-7.9124, 112.1876] },
  { id: "simbar", name: "Simbar / Kalasan Barat", code: "SMB", kasunName: "Bpk. Eko Wahyudi", kasunPhone: "0813-4488-5505", rtCount: 4, rwCount: 1, centerCoord: [-7.8998, 112.1765] },
];

export const ASSISTANCE_TYPES = {
  RTLH: {
    id: "RTLH",
    title: "Rehabilitasi RTLH",
    subtitle: "Rumah Tidak Layak Huni",
    icon: "Home",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Bantuan perbaikan komponen struktural rumah (dinding gedek/bambu, atap rapuh bocor, lantai tanah/semen rusak, sanitasi MCK).",
    defaultEstimatedBudget: 15000000,
    materialDefaults: [
      { item: "Semen Portland (50kg)", qty: 25, unit: "sak", pricePerUnit: 68000 },
      { item: "Pasir Pasang / Cor", qty: 3, unit: "m³", pricePerUnit: 280000 },
      { item: "Bata Merah Standar", qty: 1500, unit: "biji", pricePerUnit: 850 },
      { item: "Genteng Mantili / Asbes Gelombang", qty: 250, unit: "lembar", pricePerUnit: 32000 },
      { item: "Kalsiboard Dinding / Plafon", qty: 12, unit: "lembar", pricePerUnit: 75000 },
      { item: "Kloset Jongkok & Pipa Sanitasi", qty: 1, unit: "set", pricePerUnit: 450000 },
      { item: "Ongkos Tukang & Pekerja Swakelola", qty: 1, unit: "paket", pricePerUnit: 4500000 }
    ]
  },
  DISABILITAS: {
    id: "DISABILITAS",
    title: "Alat Bantu Disabilitas",
    subtitle: "Mobilitas & Aksesibilitas",
    icon: "Accessibility",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Penyediaan sarana alat bantu fisik untuk penyandang disabilitas (Kursi Roda standar/CP, Kruk Ketiak, Walker, Tongkat Tunanetra, Alat Bantu Dengar).",
    defaultEstimatedBudget: 3500000,
    options: [
      { id: "kursi_roda_standar", label: "Kursi Roda Standar (Lipat)", estPrice: 1850000 },
      { id: "kursi_roda_cp", label: "Kursi Roda Khusus Cerebral Palsy (Anak/Dewasa)", estPrice: 5500000 },
      { id: "kruk_ketiak", label: "Kruk Ketiak Aluminium (Sepasang)", estPrice: 320000 },
      { id: "walker_roda", label: "Walker Roda Depan 2-in-1", estPrice: 480000 },
      { id: "hearing_aid", label: "Alat Bantu Dengar Digital", estPrice: 2200000 },
      { id: "tongkat_adaptif", label: "Tongkat Adaptif 4 Kaki", estPrice: 210000 },
    ]
  }
};

export const STATUS_STAGES = {
  SUBMITTED: { key: "SUBMITTED", label: "Pengajuan Diterima", step: 1, type: "neutral" },
  WAITING_KASUN: { key: "WAITING_KASUN", label: "Menunggu Verifikasi Kasun", step: 2, type: "warning" },
  KASUN_SURVEY: { key: "KASUN_SURVEY", label: "Kasun Sedang Meninjau Lokasi", step: 3, type: "info" },
  FORWARDED_TO_DESA: { key: "FORWARDED_TO_DESA", label: "Direkomendasikan ke Desa", step: 4, type: "info" },
  VILLAGE_REVIEW: { key: "VILLAGE_REVIEW", label: "Sedang Diverifikasi Desa", step: 5, type: "info" },
  FUNDING_APPROVED: { key: "FUNDING_APPROVED", label: "Bantuan & Anggaran Disetujui", step: 6, type: "success" },
  PROCUREMENT: { key: "PROCUREMENT", label: "Pengadaan / Pengerjaan Fisik", step: 7, type: "info" },
  HANDOVER: { key: "HANDOVER", label: "Menunggu Serah Terima (BAST)", step: 8, type: "warning" },
  COMPLETED: { key: "COMPLETED", label: "Selesai & Terealisasi", step: 9, type: "success" },
  RETURNED: { key: "RETURNED", label: "Dikembalikan dengan Catatan", step: -1, type: "warning" },
  REJECTED: { key: "REJECTED", label: "Tidak Memenuhi Kriteria", step: -1, type: "error" }
};

export const FUNDING_SOURCES = [
  { id: "APBDes", name: "APBDes / Dana Desa Jarak", quotaYear: 2026, totalAllocated: 180000000, remaining: 75000000 },
  { id: "BKK", name: "BKK Kabupaten Kediri", quotaYear: 2026, totalAllocated: 100000000, remaining: 40000000 },
  { id: "Dinsos", name: "Dinas Sosial Kab. Kediri", quotaYear: 2026, totalAllocated: 60000000, remaining: 25000000 },
  { id: "BAZNAS", name: "BAZNAS Kabupaten Kediri", quotaYear: 2026, totalAllocated: 50000000, remaining: 35000000 },
];
