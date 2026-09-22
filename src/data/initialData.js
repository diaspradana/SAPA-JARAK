// Initial Seed Data for SAPA-JARAK

export const INITIAL_APPLICATIONS = [
  {
    id: "APP-001",
    ticketNumber: "JRK-KLS-2026-009",
    assistanceType: "RTLH",
    dusunId: "kalasan",
    dusunName: "Kalasan",
    rt: "03",
    rw: "01",
    address: "RT 03 / RW 01, Dusun Kalasan, Desa Jarak",
    
    // Beneficiary
    beneficiaryName: "Bpk. Suwarno",
    beneficiaryMaskedName: "Bpk. S*****",
    nik: "3506121908620002",
    kkNumber: "3506122005080015",
    phone: "0813-9988-1234",
    isUnregistered: false,
    
    // Reporter
    reporterName: "Danang Prasetyo",
    reporterPhone: "0813-9988-1234",
    reporterRelation: "Tetangga",
    
    // Application details
    description: "Dinding bagian samping masih anyaman bambu (gedek) yang sudah lapuk dan bolong, atap dapur rawan ambruk saat hujan deras, belum memiliki jamban/MCK keluarga yang layak.",
    status: "COMPLETED",
    submittedAt: "2026-08-10T09:30:00Z",
    
    // Photos
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
      ],
      survey: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"
      ],
      progress50: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"
      ],
      progress100: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80"
      ],
      handover: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"
    },
    
    // Kasun Survey
    survey: {
      verifiedBy: "Bpk. Suwandi (Kasun Kalasan)",
      verifiedAt: "2026-08-12T14:15:00Z",
      coordinates: { lat: -7.9015, lng: 112.1859 },
      notes: "Kondisi rumah sangat memprihatinkan terutama bagian dinding gedek dan atap dapur. Tanah milik pribadi dan sah. Sangat layak direhabilitasi.",
      scoringParams: {
        wallCondition: "gedek_bambu",
        floorCondition: "tanah",
        roofCondition: "rapuh_bocor_parah",
        sanitationCondition: "mck_tidak_layak"
      },
      score: 87,
      recommendation: "Sangat Layak & Prioritas Utama Desa"
    },
    
    // Village Approval & Funding
    funding: {
      source: "APBDes / Dana Desa",
      budget: 15000000,
      approvedBy: "Kasi Kesejahteraan & Kepala Desa Jarak",
      approvedAt: "2026-08-16T10:00:00Z",
      dtksMatched: true,
      dtksDesil: "Desil 1 (Sangat Miskin)",
      duplicateCheckPassed: true
    },
    
    // Procurement & Progress
    procurement: {
      contractor: "Swakelola Kelompok Masyarakat (Pokmas) Dusun Kalasan",
      rabMaterials: [
        { item: "Semen Portland (50kg)", qty: 25, unit: "sak", price: 1700000 },
        { item: "Pasir Pasang & Cor", qty: 3, unit: "m³", price: 840000 },
        { item: "Bata Merah Standar", qty: 2000, unit: "biji", price: 1700000 },
        { item: "Genteng Mantili", qty: 300, unit: "lembar", price: 1050000 },
        { item: "Kalsiboard & Rangka", qty: 15, unit: "lembar", price: 1200000 },
        { item: "Kloset Jongkok & Pipa Sanitasi", qty: 1, unit: "set", price: 450000 },
        { item: "Upah Tukang & Pekerja", qty: 1, unit: "paket", price: 8060000 }
      ],
      totalCost: 15000000,
      progress: 100,
      startDate: "2026-08-20",
      completionDate: "2026-09-08"
    },
    
    // Handover & BAST
    handover: {
      bastNumber: "BAST/RTLH/009/IX/2026",
      handoverDate: "2026-09-10",
      recipientSigned: true,
      officerSigned: true,
      publicPublished: true
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "10 Ags 2026, 09:30", note: "Laporan mandiri tetangga terdaftar melalui SAPA-JARAK." },
      { status: "KASUN_SURVEY", title: "Survei Kasun Selesai", time: "12 Ags 2026, 14:15", note: "Kasun Kalasan telah memverifikasi lokasi & foto geotagging (Skor: 87)." },
      { status: "FORWARDED_TO_DESA", title: "Direkomendasikan ke Desa", time: "12 Ags 2026, 16:00", note: "Diteruskan ke Pemdes dengan rekomendasi prioritas utama." },
      { status: "FUNDING_APPROVED", title: "Anggaran Disetujui Pemdes", time: "16 Ags 2026, 10:00", note: "Dialokasikan Rp15.000.000 dari APBDes / Dana Desa 2026." },
      { status: "PROCUREMENT", title: "Pengerjaan Fisik Dimulai", time: "20 Ags 2026, 08:00", note: "Pengiriman material dan pengerjaan dinding & atap (Progres: 100%)." },
      { status: "COMPLETED", title: "Serah Terima BAST & Selesai", time: "10 Sep 2026, 11:00", note: "BAST ditandatangani dan dipublikasikan ke transparansi publik." }
    ]
  },
  
  {
    id: "APP-002",
    ticketNumber: "JRK-SGI-2026-004",
    assistanceType: "DISABILITAS",
    dusunId: "sagi",
    dusunName: "Sagi",
    rt: "05",
    rw: "02",
    address: "RT 05 / RW 02, Dusun Sagi, Desa Jarak",
    
    beneficiaryName: "Ibu Sumini",
    beneficiaryMaskedName: "Ibu S*****",
    nik: "3506125407780001",
    kkNumber: "3506122005080029",
    phone: "0812-7744-9988",
    isUnregistered: false,
    
    reporterName: "Hartono (Anak Kandung)",
    reporterPhone: "0812-7744-9988",
    reporterRelation: "Anak Kandung",
    
    description: "Ibu mengalami stroke dan kelumpuhan anggota gerak bawah sejak 2 tahun lalu, saat ini hanya bisa berbaring dan sangat membutuhkan kursi roda khusus untuk mobilitas berjemur dan terapi puskesmas.",
    status: "PROCUREMENT",
    submittedAt: "2026-09-02T11:20:00Z",
    
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
      ],
      survey: [
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
      ]
    },
    
    survey: {
      verifiedBy: "Bpk. Bambang Sutrisno (Kasun Sagi)",
      verifiedAt: "2026-09-05T10:00:00Z",
      coordinates: { lat: -7.9082, lng: 112.1930 },
      notes: "Telah dicek bersama Bidan Desa Sagi. Ibu Sumini benar mengalami kelumpuhan total kaki dan membutuhkan kursi roda standar dengan penyangga kaki kuat.",
      scoringParams: {
        disabilityLevel: "berat_total",
        economicCondition: "ekstrem_desil_1",
        healthRecommendation: "rekomendasi_nakes_prioritas"
      },
      score: 100,
      recommendation: "Sangat Layak & Segera Salurkan Alat"
    },
    
    funding: {
      source: "Dinas Sosial Kab. Kediri",
      budget: 2500000,
      approvedBy: "Kasi Kesra & Dinsos Kediri",
      approvedAt: "2026-09-12T09:30:00Z",
      dtksMatched: true,
      dtksDesil: "Desil 1 (DTKS Aktif)",
      duplicateCheckPassed: true
    },
    
    procurement: {
      vendor: "CV Medika Husada Kediri",
      itemOrdered: "Kursi Roda Lipat Standar Stainless + Bantal Dekubitus",
      estimatedDelivery: "2026-09-25",
      statusText: "Proses pemesanan vendor & siap distribusi ke Desa"
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "02 Sep 2026, 11:20", note: "Pengajuan didaftarkan oleh anak kandung pemohon." },
      { status: "KASUN_SURVEY", title: "Survei Bersama Bidan Desa", time: "05 Sep 2026, 10:00", note: "Verifikasi faktual kondisi kelumpuhan (Skor: 100)." },
      { status: "FUNDING_APPROVED", title: "Disetujui Dinsos Kab. Kediri", time: "12 Sep 2026, 09:30", note: "Alokasi bantuan kursi roda disetujui via kuota Dinsos." },
      { status: "PROCUREMENT", title: "Pengadaan Alat Bantu", time: "15 Sep 2026, 14:00", note: "Pemesanan unit kursi roda ke vendor resmi." }
    ]
  },
  
  {
    id: "APP-003",
    ticketNumber: "JRL-JRL-2026-007",
    assistanceType: "RTLH",
    dusunId: "jaraklor",
    dusunName: "Jarak Lor",
    rt: "02",
    rw: "01",
    address: "RT 02 / RW 01, Dusun Jarak Lor, Desa Jarak",
    
    beneficiaryName: "Bpk. Marto Wiyono",
    beneficiaryMaskedName: "Bpk. M*****",
    nik: "3506120101550004",
    kkNumber: "3506122005080033",
    phone: "0813-6611-7788",
    isUnregistered: false,
    
    reporterName: "Rudi Hartono (Ketua RT 02)",
    reporterPhone: "0813-6611-7788",
    reporterRelation: "Perangkat RT / Tetangga",
    
    description: "Lansia sebatang kara, rumah berdinding kalsiboard pecah dan tiang penyangga kayu lapuk termakan rayap. Lantai masih tanah berdebu.",
    status: "PROCUREMENT",
    submittedAt: "2026-08-28T08:00:00Z",
    
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80"
      ],
      survey: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"
      ],
      progress50: [
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"
      ]
    },
    
    survey: {
      verifiedBy: "Bpk. Agus Prasetyo (Kasun Jarak Lor)",
      verifiedAt: "2026-08-30T13:00:00Z",
      coordinates: { lat: -7.8967, lng: 112.1824 },
      notes: "Sangat mendesak, lansia hidup sendiri. Dinding dan lantai butuh perbaikan total segera.",
      scoringParams: {
        wallCondition: "gedek_bambu",
        floorCondition: "tanah",
        roofCondition: "reng_rusak",
        sanitationCondition: "mck_numpang"
      },
      score: 86,
      recommendation: "Sangat Layak & Prioritas Utama Desa"
    },
    
    funding: {
      source: "BAZNAS Kabupaten Kediri",
      budget: 12500000,
      approvedBy: "Kepala Desa & Tim BAZNAS",
      approvedAt: "2026-09-04T11:00:00Z",
      dtksMatched: true,
      dtksDesil: "Desil 1 (Lansia Terlantar)",
      duplicateCheckPassed: true
    },
    
    procurement: {
      contractor: "Gotong Royong Warga & Karang Taruna Jarak Lor",
      totalCost: 12500000,
      progress: 50,
      startDate: "2026-09-10",
      statusText: "Progres 50% — Pemasangan dinding bata batako dan cor tiang selesai."
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "28 Ags 2026, 08:00", note: "Laporan diajukan oleh Ketua RT setempat." },
      { status: "KASUN_SURVEY", title: "Verifikasi Lapangan Kasun", time: "30 Ags 2026, 13:00", note: "Hasil survei skor kelayakan 86." },
      { status: "FUNDING_APPROVED", title: "Disetujui Pendanaan BAZNAS", time: "04 Sep 2026, 11:00", note: "Alokasi stimulan bedah rumah lansia Rp12.500.000." },
      { status: "PROCUREMENT", title: "Pengerjaan Progres 50%", time: "18 Sep 2026, 16:00", note: "Dinding utama dan fondasi selesai dibangun warga." }
    ]
  },
  
  {
    id: "APP-004",
    ticketNumber: "JRK-SMB-2026-011",
    assistanceType: "RTLH",
    dusunId: "simbar",
    dusunName: "Simbar / Kalasan Barat",
    rt: "02",
    rw: "01",
    address: "RT 02 / RW 01, Dusun Simbar, Desa Jarak",
    
    beneficiaryName: "Bpk. Katiran",
    beneficiaryMaskedName: "Bpk. K*****",
    nik: "3506121406690003",
    kkNumber: "3506122005080041",
    phone: "0813-4488-9900",
    isUnregistered: false,
    
    reporterName: "Bpk. Katiran (Diri Sendiri)",
    reporterPhone: "0813-4488-9900",
    reporterRelation: "Diri Sendiri",
    
    description: "Atap rumah miring dan genteng banyak yang pecah. Dinding samping bata mentah sudah mulai rontok tergerus air hujan.",
    status: "FORWARDED_TO_DESA",
    submittedAt: "2026-09-14T10:15:00Z",
    
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
      ],
      survey: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"
      ]
    },
    
    survey: {
      verifiedBy: "Bpk. Eko Wahyudi (Kasun Simbar)",
      verifiedAt: "2026-09-16T15:30:00Z",
      coordinates: { lat: -7.8995, lng: 112.1762 },
      notes: "Kondisi atap sangat berisiko ambrol saat musim hujan tiba. Kasun merekomendasikan penggantian usuk bambu dan genteng.",
      scoringParams: {
        wallCondition: "bata_retak",
        floorCondition: "semen_pecah",
        roofCondition: "rapuh_bocor_parah",
        sanitationCondition: "mck_tidak_layak"
      },
      score: 65,
      recommendation: "Memenuhi Kriteria Bantuan Reguler"
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "14 Sep 2026, 10:15", note: "Pengajuan mandiri via SAPA-JARAK." },
      { status: "KASUN_SURVEY", title: "Survei Kasun Selesai", time: "16 Sep 2026, 15:30", note: "Kasun Simbar mengunggah hasil survei dan skor 65." },
      { status: "FORWARDED_TO_DESA", title: "Menunggu Validasi Desa", time: "17 Sep 2026, 09:00", note: "Berkas dalam antrean telaah Kasi Kesra." }
    ]
  },
  
  {
    id: "APP-005",
    ticketNumber: "JRK-KLS-2026-015",
    assistanceType: "DISABILITAS",
    dusunId: "kalasan",
    dusunName: "Kalasan",
    rt: "04",
    rw: "02",
    address: "RT 04 / RW 02, Dusun Kalasan, Desa Jarak",
    
    beneficiaryName: "Adik Farhan (11 th)",
    beneficiaryMaskedName: "Anak F*****",
    nik: "3506125010150007",
    kkNumber: "3506122005080055",
    phone: "0812-3344-5566",
    isUnregistered: false,
    
    reporterName: "Siti Rahayu (Ibu Kandung)",
    reporterPhone: "0812-3344-5566",
    reporterRelation: "Orang Tua",
    
    description: "Anak berkebutuhan khusus (Cerebral Palsy) sejak lahir. Selama ini digendong saat ke sekolah luar biasa / terapi. Membutuhkan kursi roda adaptif khusus CP.",
    status: "WAITING_KASUN",
    submittedAt: "2026-09-19T14:30:00Z",
    
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
      ]
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "19 Sep 2026, 14:30", note: "Laporan masuk ke sistem SAPA-JARAK." },
      { status: "WAITING_KASUN", title: "Menunggu Survei Kasun", time: "19 Sep 2026, 14:35", note: "Notifikasi telah dikirimkan ke Kasun Kalasan." }
    ]
  },
  
  {
    id: "APP-006",
    ticketNumber: "JRK-JRK-2026-002",
    assistanceType: "DISABILITAS",
    dusunId: "jarakkidul",
    dusunName: "Jarak Kidul",
    rt: "01",
    rw: "01",
    address: "RT 01 / RW 01, Dusun Jarak Kidul, Desa Jarak",
    
    beneficiaryName: "Mbah Sadiyo (74 th)",
    beneficiaryMaskedName: "Bpk. S*****",
    nik: "3506121102520001",
    kkNumber: "3506122005080060",
    phone: "0812-5599-1122",
    isUnregistered: false,
    
    reporterName: "Karang Taruna Jarak Kidul",
    reporterPhone: "0812-5599-1122",
    reporterRelation: "Relawan Desa",
    
    description: "Lansia mengalami patah tulang paha pasca jatuh 6 bulan lalu dan sulit berjalan. Membutuhkan walker 4 kaki untuk latihan jalan di dalam rumah.",
    status: "FUNDING_APPROVED",
    submittedAt: "2026-09-08T09:00:00Z",
    
    photos: {
      initial: [
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
      ],
      survey: [
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80"
      ]
    },
    
    survey: {
      verifiedBy: "Bpk. Joko Maryanto (Kasun Jarak Kidul)",
      verifiedAt: "2026-09-10T11:00:00Z",
      coordinates: { lat: -7.9120, lng: 112.1872 },
      notes: "Sudah disurvei. Sangat membutuhkan alat bantu Walker untuk mobilitas harian.",
      score: 78,
      recommendation: "Sangat Layak & Segera Salurkan Alat"
    },
    
    funding: {
      source: "APBDes / Dana Desa",
      budget: 650000,
      approvedBy: "Kasi Kesra Desa Jarak",
      approvedAt: "2026-09-15T10:00:00Z",
      dtksMatched: true,
      duplicateCheckPassed: true
    },
    
    timeline: [
      { status: "SUBMITTED", title: "Pengajuan Diterima", time: "08 Sep 2026, 09:00", note: "Diajukan oleh Relawan Karang Taruna." },
      { status: "KASUN_SURVEY", title: "Survei Kasun Selesai", time: "10 Sep 2026, 11:00", note: "Kasun memverifikasi kelayakan skor 78." },
      { status: "FUNDING_APPROVED", title: "Disetujui APBDes Desa", time: "15 Sep 2026, 10:00", note: "Dana pengadaan disetujui Rp650.000." }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-01",
    timestamp: "2026-09-19T14:30:00Z",
    recipient: "0812-3344-5566 (Siti Rahayu)",
    ticketNumber: "JRK-KLS-2026-015",
    type: "SUBMISSION_CONFIRMED",
    message: "Halo Ibu Siti Rahayu, pengajuan bantuan Kursi Roda CP di Desa Jarak telah kami terima dengan Nomor Tiket #JRK-KLS-2026-015. Kasun Kalasan akan segera melakukan peninjauan lokasi. Pantau status di: https://sapa-jarak.desa.id/lacak"
  },
  {
    id: "NOTIF-02",
    timestamp: "2026-09-17T09:00:00Z",
    recipient: "0813-4488-9900 (Bpk. Katiran)",
    ticketNumber: "JRK-SMB-2026-011",
    type: "FORWARDED_TO_DESA",
    message: "Pengajuan Anda #JRK-SMB-2026-011 telah selesai disurvei oleh Kasun Simbar dan direkomendasikan ke Pemerintah Desa Jarak untuk penetapan sumber pendanaan. Terima kasih."
  },
  {
    id: "NOTIF-03",
    timestamp: "2026-09-10T11:00:00Z",
    recipient: "0813-9988-1234 (Danang Prasetyo / Suwarno)",
    ticketNumber: "JRK-KLS-2026-009",
    type: "COMPLETED",
    message: "Bantuan Rehabilitasi RTLH #JRK-KLS-2026-009 telah selesai 100% dan Berita Acara Serah Terima (BAST) telah disahkan. Terima kasih atas partisipasi aktif masyarakat Desa Jarak."
  }
];
