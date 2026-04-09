export const timelineStageLabels = [
  "Pertemuan keluarga",
  "Lamaran",
  "Pengajian / Siraman",
  "Akad nikah",
  "Resepsi",
  "Unduh mantu / acara lanjutan",
] as const;

export type TimelineStageLabel = (typeof timelineStageLabels)[number];

export type TimelineStageRecord = {
  summary: string;
  schedule: string;
  vendor: string;
  next: string;
  completed: boolean;
  quickNote: string;
};

export type TimelineStageConfig = {
  intro: string;
  focusLabel: string;
  focusHint: string;
  focusPlaceholder: string;
  scheduleLabel: string;
  scheduleHint: string;
  schedulePlaceholder: string;
  vendorLabel: string;
  vendorHint: string;
  vendorPlaceholder: string;
  nextLabel: string;
  nextHint: string;
  nextPlaceholder: string;
  overview: string;
  review: Omit<TimelineStageRecord, "completed" | "quickNote">;
};

export const timelineStageConfig: Record<TimelineStageLabel, TimelineStageConfig> = {
  "Pertemuan keluarga": {
    intro: "Tahap ini biasanya dipakai untuk menyamakan arah awal antara dua keluarga sebelum keputusan besar diambil.",
    focusLabel: "Agenda pertemuan",
    focusHint: "Tulis tujuan utama pertemuan keluarga ini.",
    focusPlaceholder: "Contoh: Perkenalan keluarga inti dan pembahasan rencana menuju lamaran.",
    scheduleLabel: "Lokasi dan waktu pertemuan",
    scheduleHint: "Isi tempat, tanggal, atau jam yang sudah disepakati.",
    schedulePlaceholder: "Contoh: Rumah keluarga mempelai wanita, Minggu 12 Juli 2026, pukul 16.00 WIB.",
    vendorLabel: "Kebutuhan utama",
    vendorHint: "Tulis kebutuhan penting untuk pertemuan ini.",
    vendorPlaceholder: "Contoh: Konsumsi keluarga, fotografer internal, dekorasi sederhana, atau susunan acara keluarga.",
    nextLabel: "Hasil atau tindak lanjut",
    nextHint: "Tulis keputusan atau hal yang harus dilanjutkan setelah pertemuan.",
    nextPlaceholder: "Contoh: Menentukan tanggal lamaran dan siapa yang menjadi penghubung antar keluarga.",
    overview: "Pertemuan awal untuk menyamakan arah, tanggal besar, dan peran keluarga inti.",
    review: {
      summary: "Perkenalan keluarga inti dan pembahasan arah umum rangkaian acara.",
      schedule: "Rumah keluarga mempelai wanita, Minggu 12 Juli 2026, pukul 16.00 WIB.",
      vendor: "Konsumsi keluarga, dokumentasi internal, dan susunan acara sederhana.",
      next: "Menentukan tanggal lamaran dan menunjuk PIC komunikasi dua keluarga.",
    },
  },
  Lamaran: {
    intro: "Tahap lamaran membantu Anda merangkum kebutuhan inti sebelum masuk ke persiapan pernikahan yang lebih lengkap.",
    focusLabel: "Agenda lamaran",
    focusHint: "Tulis bentuk acara lamaran yang sedang disusun.",
    focusPlaceholder: "Contoh: Lamaran keluarga inti dengan sesi cincin dan makan bersama.",
    scheduleLabel: "Lokasi dan waktu lamaran",
    scheduleHint: "Isi tempat, tanggal, atau jam penting yang sudah diketahui.",
    schedulePlaceholder: "Contoh: Jambur Jawata, 25 Juli 2026, pukul 10.00 WIB.",
    vendorLabel: "Vendor atau kebutuhan lamaran",
    vendorHint: "Tambahkan vendor atau kebutuhan inti untuk acara lamaran.",
    vendorPlaceholder: "Contoh: Catering keluarga, dekorasi meja seserahan, dokumentasi, atau makeup sederhana.",
    nextLabel: "Catatan lanjutan setelah lamaran",
    nextHint: "Tambahkan hal yang masih menunggu keputusan setelah tahap ini.",
    nextPlaceholder: "Contoh: Finalisasi tanggal akad dan daftar vendor utama yang akan disurvei.",
    overview: "Momen pengikat komitmen kedua keluarga sekaligus jembatan menuju persiapan inti.",
    review: {
      summary: "Lamaran keluarga inti dengan sesi seserahan, pemasangan cincin, dan makan bersama.",
      schedule: "Jambur Jawata, Sabtu 25 Juli 2026, pukul 10.00 WIB.",
      vendor: "Catering keluarga, dekorasi meja lamaran, dokumentasi, dan makeup sederhana.",
      next: "Finalisasi tanggal akad dan daftar vendor utama yang akan disurvei setelah lamaran.",
    },
  },
  "Pengajian / Siraman": {
    intro: "Tahap pra-acara biasanya membutuhkan detail keluarga, rundown singkat, dan kebutuhan vendor yang lebih spesifik.",
    focusLabel: "Bentuk acara pra-acara",
    focusHint: "Tulis bentuk acara yang sedang disiapkan.",
    focusPlaceholder: "Contoh: Siraman keluarga inti pada sore hari dengan tamu terbatas.",
    scheduleLabel: "Lokasi dan waktu pra-acara",
    scheduleHint: "Isi tempat, tanggal, atau jam acara.",
    schedulePlaceholder: "Contoh: Rumah keluarga, Jumat 24 Juli 2026, pukul 15.30 WIB.",
    vendorLabel: "Vendor atau kebutuhan pra-acara",
    vendorHint: "Tambahkan vendor atau perlengkapan penting untuk tahap ini.",
    vendorPlaceholder: "Contoh: Makeup keluarga, dekorasi siraman, konsumsi tamu inti, dokumentasi, atau perlengkapan adat.",
    nextLabel: "Catatan lanjutan pra-acara",
    nextHint: "Tulis hal yang masih perlu dibereskan sebelum hari H.",
    nextPlaceholder: "Contoh: Final cek busana, gladi keluarga, dan pengaturan kedatangan vendor pagi hari.",
    overview: "Tahap pemanasan menuju hari utama dengan fokus pada keluarga, adat, dan transisi vendor.",
    review: {
      summary: "Siraman dan pengajian keluarga inti dengan susunan acara yang lebih intim dan khidmat.",
      schedule: "Rumah keluarga, Jumat 24 Juli 2026, pukul 15.30 WIB.",
      vendor: "Makeup keluarga, dekorasi siraman, konsumsi tamu inti, dan dokumentasi ringan.",
      next: "Final cek busana, gladi keluarga, dan koordinasi vendor yang datang sejak pagi hari H-1.",
    },
  },
  "Akad nikah": {
    intro: "Tahap akad biasanya membutuhkan fokus pada lokasi, waktu inti, dan pihak-pihak yang terlibat langsung.",
    focusLabel: "Rangkaian akad",
    focusHint: "Tulis bentuk akad yang sedang disusun.",
    focusPlaceholder: "Contoh: Akad pagi dengan keluarga inti dan tamu terbatas sebelum resepsi.",
    scheduleLabel: "Lokasi dan waktu akad",
    scheduleHint: "Isi tempat, tanggal, dan jam pelaksanaan akad.",
    schedulePlaceholder: "Contoh: Ballroom utama, Sabtu 25 Juli 2026, pukul 08.00 WIB.",
    vendorLabel: "Vendor atau kebutuhan akad",
    vendorHint: "Tuliskan vendor inti atau kebutuhan utama untuk akad.",
    vendorPlaceholder: "Contoh: Penghulu, dekorasi akad, kursi keluarga inti, dokumentasi, MC, atau sound system.",
    nextLabel: "Catatan setelah akad",
    nextHint: "Tuliskan hal yang masih perlu dilanjutkan menuju resepsi atau sesi berikutnya.",
    nextPlaceholder: "Contoh: Transisi ke resepsi, briefing penerima tamu, dan kesiapan ruang ganti keluarga.",
    overview: "Momen inti pernikahan yang menuntut sinkronisasi waktu, keluarga inti, dan vendor utama.",
    review: {
      summary: "Akad pagi dengan keluarga inti, saksi, dan tamu terbatas sebelum masuk ke persiapan resepsi malam.",
      schedule: "Ballroom utama, Sabtu 25 Juli 2026, pukul 08.00 WIB.",
      vendor: "Penghulu, dekorasi akad, kursi keluarga inti, dokumentasi, dan sound system.",
      next: "Briefing penerima tamu, transisi ke resepsi, dan kesiapan ruang ganti keluarga setelah akad selesai.",
    },
  },
  Resepsi: {
    intro: "Tahap resepsi cocok untuk merangkum alur tamu, vendor utama, dan kebutuhan operasional saat acara berlangsung.",
    focusLabel: "Konsep resepsi",
    focusHint: "Tulis bentuk resepsi yang sedang disiapkan.",
    focusPlaceholder: "Contoh: Resepsi malam dengan 400 tamu, live music, dan alur keluarga inti yang ringkas.",
    scheduleLabel: "Lokasi dan waktu resepsi",
    scheduleHint: "Isi venue, tanggal, atau jam resepsi.",
    schedulePlaceholder: "Contoh: Jambur Jawata, Sabtu 25 Juli 2026, pukul 18.30 WIB.",
    vendorLabel: "Vendor utama resepsi",
    vendorHint: "Tambahkan vendor atau kebutuhan inti yang harus siap di resepsi.",
    vendorPlaceholder: "Contoh: Catering, dekorasi ballroom, dokumentasi, entertainment, MC, WO, dan penerima tamu.",
    nextLabel: "Catatan lanjutan resepsi",
    nextHint: "Tulis hal yang masih perlu dipastikan untuk acara berjalan lancar.",
    nextPlaceholder: "Contoh: Final seating keluarga, alur foto bersama, dan konfirmasi rundown MC.",
    overview: "Puncak perayaan yang menggabungkan tamu, keluarga, vendor, dan pengalaman acara secara utuh.",
    review: {
      summary: "Resepsi malam intimate dengan keluarga besar dan teman dekat setelah akad pagi selesai.",
      schedule: "Jambur Jawata, Sabtu 25 Juli 2026, open gate 18.00 WIB dan prosesi masuk keluarga inti 19.00 WIB.",
      vendor: "Catering keluarga, dekorasi ballroom, dokumentasi, live music akustik, MC, penerima tamu, dan liaison keluarga inti.",
      next: "Finalisasi seating keluarga, rundown MC, dan konfirmasi jumlah tamu H-7.",
    },
  },
  "Unduh mantu / acara lanjutan": {
    intro: "Tahap acara lanjutan membantu Anda merangkum kebutuhan tambahan setelah hari utama selesai.",
    focusLabel: "Bentuk acara lanjutan",
    focusHint: "Tulis bentuk acara lanjutan yang disiapkan.",
    focusPlaceholder: "Contoh: Unduh mantu sederhana dengan keluarga besar dan makan bersama.",
    scheduleLabel: "Lokasi dan waktu acara lanjutan",
    scheduleHint: "Isi tempat, tanggal, atau jam acara lanjutan.",
    schedulePlaceholder: "Contoh: Rumah keluarga mempelai pria, Minggu 26 Juli 2026, pukul 11.00 WIB.",
    vendorLabel: "Kebutuhan utama acara lanjutan",
    vendorHint: "Tambahkan vendor atau kebutuhan inti yang masih dibutuhkan.",
    vendorPlaceholder: "Contoh: Konsumsi keluarga besar, dekorasi rumah, dokumentasi ringan, atau hiburan keluarga.",
    nextLabel: "Catatan setelah acara lanjutan",
    nextHint: "Tulis hal yang masih perlu dibereskan setelah semua rangkaian selesai.",
    nextPlaceholder: "Contoh: Arsip dokumentasi, pelunasan vendor, dan pembagian ucapan terima kasih keluarga.",
    overview: "Tahap penutup yang menjaga relasi keluarga dan merapikan sisa pekerjaan pasca acara utama.",
    review: {
      summary: "Acara lanjutan yang lebih santai untuk keluarga besar dan penutup seluruh rangkaian.",
      schedule: "Rumah keluarga mempelai pria, Minggu 26 Juli 2026, pukul 11.00 WIB.",
      vendor: "Konsumsi keluarga besar, dekorasi rumah, dokumentasi ringan, dan hiburan keluarga.",
      next: "Arsip dokumentasi, pelunasan vendor, dan pembagian ucapan terima kasih keluarga.",
    },
  },
};

export function createDefaultTimelineStages(): Record<TimelineStageLabel, TimelineStageRecord> {
  return timelineStageLabels.reduce((acc, label) => {
    acc[label] = {
      ...timelineStageConfig[label].review,
      completed: false,
      quickNote: "",
    };
    return acc;
  }, {} as Record<TimelineStageLabel, TimelineStageRecord>);
}

export function mergeTimelineStages(
  partial?: Partial<Record<TimelineStageLabel, Partial<TimelineStageRecord>>> | null,
) {
  const defaults = createDefaultTimelineStages();

  if (!partial) {
    return defaults;
  }

  return timelineStageLabels.reduce((acc, label) => {
    const candidate = partial[label];
    acc[label] = {
      ...defaults[label],
      ...candidate,
      completed: Boolean(candidate?.completed),
      quickNote: candidate?.quickNote ?? defaults[label].quickNote,
    };
    return acc;
  }, {} as Record<TimelineStageLabel, TimelineStageRecord>);
}
