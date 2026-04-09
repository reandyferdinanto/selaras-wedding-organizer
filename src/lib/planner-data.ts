import { budgetBuckets, phasePlan, vendorTracks, weddingMoments } from "@/lib/wedding-plan";

export type ProjectSetupValues = {
  brideName: string;
  groomName: string;
  weddingDate: string;
  city: string;
  venue: string;
  guestCount: string;
  template: string;
  concept: string;
};

export type PlannerNotes = {
  phasePlan: string;
  moments: string;
  nextSteps: string;
  vendorPlan: string;
  guestPlan: string;
  budgetPlan: string;
  documentPlan: string;
};

export type PlannerSnapshot = {
  projectSetup: ProjectSetupValues;
  notes: PlannerNotes;
  updatedAt: string | null;
};

export type DashboardFeature = {
  slug: string;
  href: string;
  step: string;
  title: string;
  description: string;
};

function buildPhasePlanText() {
  return phasePlan
    .map((item) => `${item.title} | ${item.window} | ${item.status} | ${item.tasks.join("; ")}`)
    .join("\n");
}

function buildMomentsText() {
  return weddingMoments
    .map((item) => `${item.title} | ${item.timeframe} | ${item.description}`)
    .join("\n");
}

function buildBudgetText() {
  return budgetBuckets.map((item) => `${item.name} | ${item.notes}`).join("\n");
}

function buildVendorText() {
  return vendorTracks.map((item) => `${item.title} | ${item.priority} | ${item.description}`).join("\n");
}

export const dashboardFeatures: DashboardFeature[] = [
  {
    slug: "proyek",
    href: "/dashboard/proyek",
    step: "Langkah 1",
    title: "Data acara",
    description: "Isi nama pasangan, tanggal, kota, venue, jumlah tamu, dan gaya acara sebagai dasar semua fitur lain.",
  },
  {
    slug: "timeline",
    href: "/dashboard/timeline",
    step: "Langkah 2",
    title: "Timeline",
    description: "Susun tahapan persiapan, momen acara, dan langkah lanjutan agar arah kerja tetap jelas.",
  },
  {
    slug: "vendor",
    href: "/dashboard/vendor",
    step: "Langkah 3",
    title: "Vendor",
    description: "Catat vendor utama, prioritas pencarian, kebutuhan negosiasi, dan rencana pembayaran bertahap.",
  },
  {
    slug: "tamu",
    href: "/dashboard/tamu",
    step: "Langkah 4",
    title: "Tamu dan RSVP",
    description: "Rangkum pembagian tamu, strategi undangan, RSVP, dan alur penerima tamu.",
  },
  {
    slug: "anggaran",
    href: "/dashboard/anggaran",
    step: "Langkah 5",
    title: "Anggaran",
    description: "Buat kelompok biaya, catatan prioritas pengeluaran, dan kontrol perubahan budget.",
  },
  {
    slug: "dokumen",
    href: "/dashboard/dokumen",
    step: "Langkah 6",
    title: "Dokumen",
    description: "Simpan catatan berkas legal, arsip vendor, dan daftar dokumen penting agar tidak tercecer.",
  },
];

export const defaultPlannerSnapshot: PlannerSnapshot = {
  projectSetup: {
    brideName: "",
    groomName: "",
    weddingDate: "",
    city: "",
    venue: "",
    guestCount: "",
    template: "",
    concept: "",
  },
  notes: {
    phasePlan: "",
    moments: "",
    nextSteps: "",
    vendorPlan: "",
    guestPlan: "",
    budgetPlan: "",
    documentPlan: "",
  },
  updatedAt: null,
};

export const demoPlannerSnapshot: PlannerSnapshot = {
  projectSetup: {
    brideName: "Maulidina",
    groomName: "Nashir",
    weddingDate: "2026-07-25",
    city: "Medan",
    venue: "Jambur Jawata",
    guestCount: "400",
    template: "Internasional",
    concept: "Intimate wedding bernuansa hangat dengan akad pagi, resepsi malam, dan alur keluarga inti yang ringkas agar tamu merasa dekat dan nyaman.",
  },
  notes: {
    phasePlan: JSON.stringify({
      planningWindow: "Resepsi",
      stageFocus: "Resepsi malam intimate dengan keluarga besar dan teman dekat setelah akad pagi selesai.",
      mainMoments: "Jambur Jawata, Sabtu 25 Juli 2026, open gate 18.00 WIB dan prosesi masuk keluarga inti 19.00 WIB.",
      familyFlow: "Catering keluarga, dekorasi ballroom, dokumentasi, live music akustik, MC, penerima tamu, dan liaison keluarga inti.",
      nextPriority: "Finalisasi seating keluarga, rundown MC, dan konfirmasi jumlah tamu H-7.",
    }),
    moments: "Akad pagi | 08.00 WIB | Keluarga inti dan saksi hadir lebih awal untuk briefing singkat.\nResepsi malam | 18.30 WIB | Open gate, sambutan keluarga, makan malam, lalu sesi foto bersama.",
    nextSteps: "Finalisasi rundown MC dan briefing penerima tamu satu minggu sebelum acara.",
    vendorPlan: JSON.stringify({
      venueStatus: "Jambur Jawata sudah dipilih sebagai venue utama. Layout ballroom dan area penerima tamu tinggal finalisasi bersama dekorasi.",
      cateringStatus: "Menu buffet Nusantara dan stall ringan sedang difinalkan. Testing rasa terakhir dijadwalkan dua minggu sebelum acara.",
      documentationStatus: "Vendor foto dan video sudah shortlist dua kandidat. Fokus utama pada dokumentasi candid keluarga dan highlight video singkat.",
      coordinatorNeed: "Butuh satu PIC keluarga dan satu koordinator lapangan untuk jembatan vendor, keluarga inti, dan MC saat hari H.",
      paymentPlan: "DP venue sudah berjalan. Pembayaran catering, dekorasi, dan dokumentasi dibagi menjadi termin DP, pelunasan H-7, dan closing pasca acara.",
    }),
    guestPlan: JSON.stringify({
      guestGroups: "Daftar tamu dibagi ke keluarga besar mempelai wanita, keluarga besar mempelai pria, teman dekat, kolega, dan tamu orang tua.",
      invitationChannel: "Undangan digital dan kartu cetak untuk keluarga inti",
      rsvpOwner: "RSVP dipegang oleh Dina dan satu PIC keluarga agar update jumlah tamu harian tetap terpantau.",
      familySeating: "Meja keluarga inti diletakkan paling dekat panggung dengan jalur masuk yang mudah untuk sesi foto dan salam keluarga.",
      hospitalityNotes: "Siapkan dua penerima tamu utama, satu meja registrasi, dan penanda meja keluarga agar alur masuk tetap rapi.",
    }),
    budgetPlan: JSON.stringify({
      totalRange: "Rp180 juta - Rp220 juta",
      biggestExpense: "Biaya terbesar saat ini diperkirakan ada di venue, catering, dan dekorasi ballroom.",
      paymentStrategy: "Pembayaran dibagi bertahap sesuai milestone vendor agar arus kas keluarga tetap aman menjelang hari acara.",
      reserveFund: "Sisihkan 8-10% dari total budget untuk kebutuhan mendadak seperti penambahan tamu atau perubahan teknis venue.",
      budgetControl: "Setiap perubahan vendor atau penambahan kebutuhan harus dicatat di satu ringkasan anggaran mingguan.",
    }),
    documentPlan: JSON.stringify({
      legalChecklist: "KTP, KK, surat numpang nikah bila diperlukan, dan berkas KUA/rumah ibadah disusun dalam satu map utama.",
      familyDocuments: "Data keluarga inti, kontak darurat, dan susunan perwakilan keluarga disimpan dalam catatan bersama.",
      vendorContracts: "Semua quotation, invoice, dan kontrak vendor disimpan dalam folder cloud dan satu map cetak.",
      paymentProofs: "Bukti transfer venue, catering, dan dekorasi diarsipkan per vendor agar mudah dicek saat pelunasan.",
      finalArchive: "Setelah acara, dokumentasi akhir, invoice lunas, dan daftar ucapan terima kasih akan disatukan dalam arsip proyek.",
    }),
  },
  updatedAt: "2026-04-06T09:00:00.000Z",
};

export const plannerExamples = {
  phasePlan: buildPhasePlanText(),
  moments: buildMomentsText(),
  budget: buildBudgetText(),
  vendor: buildVendorText(),
};

export function mergePlannerSnapshot(input: unknown): PlannerSnapshot {
  const data = (input && typeof input === "object" ? input : {}) as Partial<PlannerSnapshot>;
  const notes = (data.notes && typeof data.notes === "object" ? data.notes : {}) as Partial<PlannerNotes>;
  const projectSetup =
    data.projectSetup && typeof data.projectSetup === "object"
      ? (data.projectSetup as Partial<ProjectSetupValues>)
      : {};

  return {
    projectSetup: {
      ...defaultPlannerSnapshot.projectSetup,
      ...projectSetup,
    },
    notes: {
      ...defaultPlannerSnapshot.notes,
      ...notes,
    },
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : defaultPlannerSnapshot.updatedAt,
  };
}

export function hasPlannerContent(snapshot: PlannerSnapshot) {
  return Object.values(snapshot.projectSetup).some((value) => String(value ?? "").trim().length > 0)
    || Object.values(snapshot.notes).some((value) => String(value ?? "").trim().length > 0);
}

