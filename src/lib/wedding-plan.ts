import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  FileSpreadsheet,
  ScrollText,
  UsersRound,
} from "lucide-react";

export const featureHighlights: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Roadmap otomatis berbasis tanggal pernikahan",
    description:
      "Tahapan 12 bulan, 6 bulan, atau sprint mepet dapat diturunkan menjadi milestone yang lebih manusiawi.",
    icon: CalendarClock,
  },
  {
    title: "Checklist legal dan dokumen",
    description:
      "Persiapan KUA, SIMKAH, atau Dukcapil tidak lagi tercecer karena setiap syarat bisa jadi task dan arsip.",
    icon: ScrollText,
  },
  {
    title: "Budget dan pembayaran vendor",
    description:
      "Ruang untuk DP, pelunasan, dan catatan biaya tambahan disusun sejak awal agar keluarga mudah audit.",
    icon: FileSpreadsheet,
  },
  {
    title: "Kolaborasi panitia keluarga",
    description:
      "Task bisa dibagi untuk pasangan, orang tua, bendahara, sampai koordinator acara tanpa kehilangan konteks.",
    icon: UsersRound,
  },
];

export const phasePlan = [
  {
    slug: "lamaran",
    title: "Lamaran & Pertemuan Keluarga",
    window: "Fase Awal",
    status: "Start now",
    tasks: [
      "Pertemuan antar keluarga inti dan penentuan tanggal utama.",
      "Kunci budget kasar dan prioritas keluarga.",
      "Kesepakatan jumlah undangan dan alokasi dana antar pihak.",
      "Membentuk susunan panitia inti dari keluarga besar.",
    ],
  },
  {
    slug: "persiapan-pernikahan",
    title: "Persiapan Pernikahan",
    window: "Persiapan Inti",
    status: "Critical",
    tasks: [
      "Booking venue, katering, dekorasi, dan dokumentasi.",
      "Mulai pendaftaran syarat KUA atau pencatatan sipil.",
      "Desain undangan, finalisasi list tamu, dan pesan suvenir.",
      "Fitting busana pengantin, MUA, dan keluarga inti.",
    ],
  },
  {
    slug: "menjelang-hari-h",
    title: "Pra-Acara & Pendalaman",
    window: "H-30 hingga H-7",
    status: "Prepare",
    tasks: [
      "Persiapkan acara adat/pra-nikah (pengajian, siraman, dsb).",
      "Konfirmasi vendor, technical meeting, dan rundown final.",
      "Sebar undangan dan kumpulkan konfirmasi kehadiran.",
      "Kunci layout, seating plan, dan flow tamu.",
    ],
  },
  {
    slug: "akad-dan-resepsi",
    title: "Akad Nikah & Resepsi",
    window: "Hari H",
    status: "Upcoming",
    tasks: [
      "Pelaksanaan akad nikah / pemberkatan.",
      "Pelaksanaan acara resepsi dan penyambutan tamu.",
      "Koordinasi WO dan panitia keluarga memastikan alur jalan.",
      "Penyimpanan kotak angpao dan barang berharga.",
    ],
  },
  {
    slug: "closure",
    title: "Penutupan Pasca Pernikahan",
    window: "Pasca Acara",
    status: "Later",
    tasks: [
      "Pelunasan seluruh vendor (apabila ada retensi biaya).",
      "Arsip foto, video, kontrak, dan bukti transfer.",
      "Ucapan terima kasih untuk keluarga, panitia, dan kolega.",
      "Pengembalian barang sewaan (busana, properti, dll).",
    ],
  },
];

export const cultureTemplates = [
  {
    name: "Internasional",
    focus: "Umum dan fleksibel",
    summary:
      "Cocok sebagai template default untuk pasangan yang ingin susunan acara modern dan ringkas, tetapi tetap memuat kebiasaan umum di Indonesia seperti sesi keluarga, penerima tamu, dan alur makan bersama.",
  },
  {
    name: "Jawa",
    focus: "Siraman sampai panggih",
    summary:
      "Cocok untuk alur multi-hari dengan kebutuhan rundown adat, busana, dan properti ritual yang cukup detail.",
  },
  {
    name: "Sunda",
    focus: "Pra-akad simbolik",
    summary:
      "Mendukung segmen seperti ngeuyeuk seureuh, saweran, dan momen adat lain yang perlu catatan timing khusus.",
  },
  {
    name: "Minangkabau",
    focus: "Keluarga besar dan adat",
    summary:
      "Perlu perhatian ekstra pada peran keluarga besar, malam bainai, dan logistik penjemputan atau baralek.",
  },
  {
    name: "Betawi / Custom",
    focus: "Tambahkan ritual sendiri",
    summary:
      "Template dasar tetap fleksibel untuk palang pintu, prosesi keluarga, atau rangkaian lokal lain yang unik.",
  },
];

export const vendorTracks = [
  {
    title: "Venue dan catering",
    priority: "Highest",
    description:
      "Dua pos ini biasanya paling cepat menentukan skala budget, kapasitas tamu, dan bentuk keseluruhan acara.",
  },
  {
    title: "Dekorasi dan dokumentasi",
    priority: "High",
    description:
      "Berpengaruh besar pada pengalaman tamu dan hasil akhir, jadi perlu ruang untuk revisi scope dan style.",
  },
  {
    title: "WO, MC, dan entertainment",
    priority: "Medium",
    description:
      "Menentukan ritme acara dan eksekusi hari-H, terutama saat rundown melibatkan adat dan keluarga besar.",
  },
];

export const weddingMoments = [
  {
    title: "Lamaran atau pertemuan keluarga",
    timeframe: "Fase awal",
    description:
      "Mulai dari kesepakatan keluarga, format seserahan, hingga dokumentasi dasar dan daftar keputusan awal.",
  },
  {
    title: "Administrasi pernikahan",
    timeframe: "Sebelum akad",
    description:
      "Checklist pendaftaran, pemeriksaan berkas, sertifikat bimbingan, dan dokumen legal sesuai jalur pernikahan.",
  },
  {
    title: "Akad atau pemberkatan",
    timeframe: "Hari inti",
    description:
      "Rundown petugas, wali atau saksi, mahar, dokumen, serta alur foto keluarga inti.",
  },
  {
    title: "Resepsi dan hospitality",
    timeframe: "Hari inti",
    description:
      "Flow tamu, penerima tamu, buffer buffet, hiburan, dan pengendalian waktu agar acara tidak menumpuk.",
  },
  {
    title: "Closing project",
    timeframe: "Pasca acara",
    description:
      "Pelunasan vendor, pengarsipan, evaluasi keluarga, dan penyerahan akses atau retensi data.",
  },
];

export const budgetBuckets = [
  {
    name: "Venue, konsumsi, service",
    notes:
      "Kelompok biaya terbesar. Cocok dijadikan kategori induk pertama di database budget.",
  },
  {
    name: "Dekorasi dan produksi visual",
    notes:
      "Mencakup panggung, pelaminan, bunga, signage, photobooth, dan produksi estetika lain.",
  },
  {
    name: "Dokumentasi dan hiburan",
    notes:
      "Foto, video, MC, band, sound, lighting, dan kebutuhan operator acara.",
  },
  {
    name: "Busana, MUA, souvenir, legal",
    notes:
      "Kategori penunjang yang sering tersebar, sehingga baik disusun sebagai bucket terpisah.",
  },
];

