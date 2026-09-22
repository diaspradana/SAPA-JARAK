// Automatic Eligibility Scoring Engine based on PRD Section 11 & Design Section 26

export function calculateRtlhScore(params = {}) {
  // params:
  // - wallCondition: 'gedek_bambu' (25) | 'setengah_tembok_rusak' (18) | 'bata_retak' (10) | 'layak' (0)
  // - floorCondition: 'tanah' (25) | 'semen_pecah' (18) | 'ubin_rusak' (10) | 'keramik_baik' (0)
  // - roofCondition: 'rapuh_bocor_parah' (25) | 'reng_rusak' (18) | 'bocor_ringan' (10) | 'kokoh' (0)
  // - sanitationCondition: 'tidak_ada_mck' (25) | 'mck_numpang' (18) | 'mck_tidak_layak' (12) | 'mck_mandiri_layak' (0)

  let wallScore = 0;
  if (params.wallCondition === 'gedek_bambu') wallScore = 25;
  else if (params.wallCondition === 'setengah_tembok_rusak') wallScore = 18;
  else if (params.wallCondition === 'bata_retak') wallScore = 10;
  else wallScore = 0;

  let floorScore = 0;
  if (params.floorCondition === 'tanah') floorScore = 25;
  else if (params.floorCondition === 'semen_pecah') floorScore = 18;
  else if (params.floorCondition === 'ubin_rusak') floorScore = 10;
  else floorScore = 0;

  let roofScore = 0;
  if (params.roofCondition === 'rapuh_bocor_parah') roofScore = 25;
  else if (params.roofCondition === 'reng_rusak') roofScore = 18;
  else if (params.roofCondition === 'bocor_ringan') roofScore = 10;
  else roofScore = 0;

  let sanitationScore = 0;
  if (params.sanitationCondition === 'tidak_ada_mck') sanitationScore = 25;
  else if (params.sanitationCondition === 'mck_numpang') sanitationScore = 18;
  else if (params.sanitationCondition === 'mck_tidak_layak') sanitationScore = 12;
  else sanitationScore = 0;

  const totalScore = wallScore + floorScore + roofScore + sanitationScore;

  let recommendation = "Perlu Evaluasi Lanjutan";
  let badgeType = "warning";
  if (totalScore >= 70) {
    recommendation = "Sangat Layak & Prioritas Utama Desa";
    badgeType = "success";
  } else if (totalScore >= 50) {
    recommendation = "Memenuhi Kriteria Bantuan Reguler";
    badgeType = "info";
  } else {
    recommendation = "Skor Rendah / Belum Mendesak";
    badgeType = "error";
  }

  return {
    totalScore,
    breakdown: [
      { label: "Struktur Dinding", score: wallScore, max: 25, weight: "25%" },
      { label: "Kondisi Lantai", score: floorScore, max: 25, weight: "25%" },
      { label: "Kondisi Atap", score: roofScore, max: 25, weight: "25%" },
      { label: "Sanitasi & MCK", score: sanitationScore, max: 25, weight: "25%" },
    ],
    recommendation,
    badgeType
  };
}

export function calculateDisabilityScore(params = {}) {
  // params:
  // - disabilityLevel: 'berat_total' (40) | 'sedang_ketergantungan' (30) | 'ringan_adaptif' (18) | 'mandiri' (5)
  // - economicCondition: 'ekstrem_desil_1' (30) | 'sangat_miskin_desil_2' (22) | 'rentan_miskin' (14) | 'mampu' (0)
  // - healthRecommendation: 'rekomendasi_nakes_prioritas' (30) | 'rekomendasi_bidan_desa' (22) | 'keterangan_umum' (12) | 'tidak_ada' (0)

  let disabilityScore = 0;
  if (params.disabilityLevel === 'berat_total') disabilityScore = 40;
  else if (params.disabilityLevel === 'sedang_ketergantungan') disabilityScore = 30;
  else if (params.disabilityLevel === 'ringan_adaptif') disabilityScore = 18;
  else disabilityScore = 5;

  let economicScore = 0;
  if (params.economicCondition === 'ekstrem_desil_1') economicScore = 30;
  else if (params.economicCondition === 'sangat_miskin_desil_2') economicScore = 22;
  else if (params.economicCondition === 'rentan_miskin') economicScore = 14;
  else economicScore = 0;

  let healthScore = 0;
  if (params.healthRecommendation === 'rekomendasi_nakes_prioritas') healthScore = 30;
  else if (params.healthRecommendation === 'rekomendasi_bidan_desa') healthScore = 22;
  else if (params.healthRecommendation === 'keterangan_umum') healthScore = 12;
  else healthScore = 0;

  const totalScore = disabilityScore + economicScore + healthScore;

  let recommendation = "Perlu Evaluasi Lanjutan";
  let badgeType = "warning";
  if (totalScore >= 70) {
    recommendation = "Sangat Layak & Segera Salurkan Alat";
    badgeType = "success";
  } else if (totalScore >= 50) {
    recommendation = "Memenuhi Kriteria Bantuan";
    badgeType = "info";
  } else {
    recommendation = "Kebutuhan Belum Mendesak";
    badgeType = "error";
  }

  return {
    totalScore,
    breakdown: [
      { label: "Tingkat Disabilitas & Ketergantungan", score: disabilityScore, max: 40, weight: "40%" },
      { label: "Kondisi Ekonomi Keluarga", score: economicScore, max: 30, weight: "30%" },
      { label: "Rekomendasi Tenaga Kesehatan", score: healthScore, max: 30, weight: "30%" },
    ],
    recommendation,
    badgeType
  };
}
