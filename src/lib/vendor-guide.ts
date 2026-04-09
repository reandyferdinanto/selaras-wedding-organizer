/**
 * vendor-guide.ts
 *
 * Setiap item checklist punya 3 status:
 *   "include"  – sudah termasuk dalam paket vendor yang dipilih
 *   "exclude"  – TIDAK termasuk, perlu dicari / ditangani sendiri
 *   "tbd"      – belum dikonfirmasi ke vendor
 *
 * Tujuan output:
 *   - Item "include"  → Checklist keluarga (diurus vendor, keluarga cukup tahu)
 *   - Item "exclude"  → Tugas koordinator (perlu ditangani / dianggarkan sendiri)
 *   - Item "tbd"      → Masih perlu konfirmasi ke vendor
 */

export type ItemStatus = "include" | "exclude" | "tbd";

export type VendorChecklistItem = {
  label: string;
  status: ItemStatus;
  /** Catatan spesifik per item: nama vendor, detail paket, atau pertanyaan open */
  note: string;
  /** Referensi gambar (base64) opsional */
  imageUrl?: string;
};

export type EventGroup = "Lamaran" | "Akad & Resepsi";

export type VendorChecklistCategory = {
  id: string;
  title: string;
  description: string;
  items: VendorChecklistItem[];
  /** Nama vendor yang ditunjuk untuk kategori ini */
  vendorName: string;
  isCustom?: boolean;
  group: EventGroup;
};

export type VendorPlannerState = {
  vendorLamaranName: string;
  vendorLamaranNote: string;
  vendorAkadResepsiName: string;
  vendorAkadResepsiNote: string;
  categories: VendorChecklistCategory[];
};

// ─── Default categories ──────────────────────────────────────────────────────

export const defaultVendorCategories: VendorChecklistCategory[] = [
  {
    id: "lamaran-pertunangan",
    title: "Lamaran & Pertunangan",
    description: "Kebutuhan vendor atau persiapan mandiri spesifik untuk acara pra-nikah (Lamaran).",
    vendorName: "",
    group: "Lamaran",
    items: [
      { label: "Dekorasi area lamaran (MUA/DIY)", status: "tbd", note: "" },
      { label: "Busana lamaran wanita (Sewa/Beli)", status: "tbd", note: "" },
      { label: "Busana / kemeja pria", status: "tbd", note: "" },
      { label: "MUA spesifik lamaran", status: "tbd", note: "" },
      { label: "Catering / Konsumsi tamu lamaran", status: "tbd", note: "" },
      { label: "Sewa alat makan prasmanan (jika perlu)", status: "tbd", note: "" },
      { label: "Fotografer / Dokumentasi", status: "tbd", note: "" },
      { label: "Seserahan (Makanan/Barang)", status: "tbd", note: "" },
      { label: "Cincin lamaran", status: "tbd", note: "" },
    ],
  },
  {
    id: "catering-venue",
    title: "Venue & Catering",
    description: "Ketersediaan area, layanan makan dan minum, serta koordinasi teknis tempat acara.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "Venue utama atau rekomendasi tempat acara", status: "tbd", note: "" },
      { label: "Paket catering prasmanan atau plated service", status: "tbd", note: "" },
      { label: "Minuman pendamping dan area service", status: "tbd", note: "" },
      { label: "Layout meja, kursi, dan area tamu", status: "tbd", note: "" },
      { label: "Koordinasi teknis venue pada hari acara", status: "tbd", note: "" },
    ],
  },
  {
    id: "dekorasi-rental",
    title: "Dekorasi & Sewa",
    description: "Styling panggung, pelaminan, elemen visual, dan furnitur pendukung acara.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "Backdrop utama atau area pelaminan", status: "tbd", note: "" },
      { label: "Aisle, meja akad, atau focal point utama", status: "tbd", note: "" },
      { label: "Centerpiece dan styling meja tamu", status: "tbd", note: "" },
      { label: "Lighting dasar dan ambience ruang", status: "tbd", note: "" },
      { label: "Sewa furnitur atau properti pendukung", status: "tbd", note: "" },
    ],
  },
  {
    id: "foto-video",
    title: "Fotografi & Videografi",
    description: "Dokumentasi dari persiapan, akad, hingga resepsi dalam format foto dan video.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "Tim fotografer utama pada hari acara", status: "tbd", note: "" },
      { label: "Tim videografer utama pada hari acara", status: "tbd", note: "" },
      { label: "Highlight video atau cinematic recap", status: "tbd", note: "" },
      { label: "Dokumentasi full event atau full footage", status: "tbd", note: "" },
      { label: "Sesi pre-wedding atau sesi tambahan bila perlu", status: "tbd", note: "" },
    ],
  },
  {
    id: "mua-grooming",
    title: "MUA & Grooming",
    description: "Rias dan grooming untuk mempelai, keluarga inti, dan touch-up sepanjang acara.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "MUA mempelai wanita full day", status: "tbd", note: "" },
      { label: "Grooming mempelai pria", status: "tbd", note: "" },
      { label: "MUA ibu kedua mempelai", status: "tbd", note: "" },
      { label: "Touch-up selama rangkaian acara", status: "tbd", note: "" },
      { label: "Trial look atau sesi konsultasi rias", status: "tbd", note: "" },
    ],
  },
  {
    id: "busana",
    title: "Busana & Aksesori",
    description: "Kelengkapan set busana mempelai termasuk fitting, aksesori, dan busana tambahan.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "Busana utama mempelai wanita", status: "tbd", note: "" },
      { label: "Busana utama mempelai pria", status: "tbd", note: "" },
      { label: "Busana tambahan untuk akad atau sesi lain", status: "tbd", note: "" },
      { label: "Aksesori dasar (veil, sepatu, atau pelengkap)", status: "tbd", note: "" },
      { label: "Sesi fitting dan penyesuaian ukuran", status: "tbd", note: "" },
    ],
  },
  {
    id: "wo-koordinasi",
    title: "Wedding Organizer",
    description: "Siapa yang memegang kendali alur kerja vendor, rundown, dan komunikasi antar pihak.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "WO full service atau planner utama", status: "tbd", note: "" },
      { label: "Koordinator hari-H", status: "tbd", note: "" },
      { label: "Rundown dan briefing vendor", status: "tbd", note: "" },
      { label: "PIC keluarga dan liaison antar pihak", status: "tbd", note: "" },
      { label: "Pendamping mempelai atau bridal assistant", status: "tbd", note: "" },
    ],
  },
  {
    id: "mc-hiburan",
    title: "MC & Hiburan",
    description: "Elemen suara dan hiburan yang menjaga ritme dan suasana acara.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "MC utama acara", status: "tbd", note: "" },
      { label: "Live music, band, atau entertainment", status: "tbd", note: "" },
      { label: "Sound system dan operator teknis", status: "tbd", note: "" },
      { label: "Playlist atau konsep hiburan yang disepakati", status: "tbd", note: "" },
      { label: "Gladi singkat atau sinkronisasi panggung", status: "tbd", note: "" },
    ],
  },
  {
    id: "pelengkap",
    title: "Pelengkap Acara",
    description: "Kebutuhan tambahan yang sering ditawarkan dalam paket: kue, suvenir, transportasi, dsb.",
    vendorName: "",
    group: "Akad & Resepsi",
    items: [
      { label: "Wedding cake atau cake display", status: "tbd", note: "" },
      { label: "Souvenir atau gift untuk tamu", status: "tbd", note: "" },
      { label: "Signage, buku tamu, atau meja penerima tamu", status: "tbd", note: "" },
      { label: "Transportasi tamu VIP atau keluarga inti", status: "tbd", note: "" },
      { label: "Kebutuhan hospitality tambahan", status: "tbd", note: "" },
    ],
  },
];

export function createDefaultVendorCategories(): VendorChecklistCategory[] {
  return defaultVendorCategories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value: unknown): ItemStatus {
  if (value === "include" || value === "exclude" || value === "tbd") return value;
  // backward-compat: old boolean "checked" → include
  if (value === true) return "include";
  return "tbd";
}

type StoredItem = Partial<{ label: string; status: ItemStatus; checked: boolean; note: string; imageUrl: string }>;
type StoredCategory = Partial<Omit<VendorChecklistCategory, "items">> & {
  items?: StoredItem[];
};
type StoredChecklist = { categories?: StoredCategory[] };

function mergeCategory(
  base: VendorChecklistCategory,
  incoming?: StoredCategory,
): VendorChecklistCategory {
  if (!incoming) return { ...base, items: base.items.map((i) => ({ ...i })) };

  const incomingItems = Array.isArray(incoming.items) ? incoming.items : [];

  return {
    ...base,
    title: normalizeText(incoming.title) || base.title,
    description: normalizeText(incoming.description) || base.description,
    vendorName: normalizeText(incoming.vendorName),
    group: base.group,
    isCustom: Boolean(incoming.isCustom ?? base.isCustom),
    items: base.items.map((item) => {
      const saved = incomingItems.find((c) => normalizeText(c.label) === item.label);
      return {
        label: item.label,
        status: saved ? normalizeStatus(saved.status ?? saved.checked) : "tbd",
        note: saved ? normalizeText(saved.note) : "",
        imageUrl: saved?.imageUrl,
      };
    }),
  };
}

function createCustomCategory(
  incoming: StoredCategory,
  index: number,
): VendorChecklistCategory | null {
  const title = normalizeText(incoming.title);
  const rawItems = Array.isArray(incoming.items) ? incoming.items : [];
  const items = rawItems
    .map((i) => ({
      label: normalizeText(i.label),
      status: normalizeStatus(i.status ?? i.checked),
      note: normalizeText(i.note),
      imageUrl: i.imageUrl,
    }))
    .filter((i) => i.label.length > 0);

  if (!title || items.length === 0) return null;

  return {
    id: normalizeText(incoming.id) || `custom-${index + 1}`,
    title,
    description: normalizeText(incoming.description) || "Kategori tambahan.",
    vendorName: normalizeText(incoming.vendorName),
    group: "Akad & Resepsi",
    isCustom: true,
    items,
  };
}

// ─── Build / Serialize ────────────────────────────────────────────────────────

export function buildVendorPlannerState(module: {
  venueStatus: string;
  documentationStatus: string;
  coordinatorNeed: string;
  paymentPlan: string;
  cateringStatus: any;
}): VendorPlannerState {
  let stored: StoredChecklist = {};

  if (typeof module.cateringStatus === "string" && normalizeText(module.cateringStatus).startsWith("{")) {
    try {
      stored = JSON.parse(module.cateringStatus) as StoredChecklist;
    } catch {
      stored = {};
    }
  } else if (module.cateringStatus && typeof module.cateringStatus === "object") {
    stored = module.cateringStatus as StoredChecklist;
  }

  const storedCats = Array.isArray(stored.categories) ? stored.categories : [];
  const defaults = createDefaultVendorCategories();

  let ctx: any = {
    vendorLamaranName: "",
    vendorLamaranNote: "",
    vendorAkadResepsiName: normalizeText(module.venueStatus),
    vendorAkadResepsiNote: normalizeText(module.documentationStatus),
  };

  if (typeof module.venueStatus === "string" && module.venueStatus.trim().startsWith("{")) {
    try {
      ctx = JSON.parse(module.venueStatus);
    } catch {}
  }

  const merged = defaults.map((cat) =>
    mergeCategory(cat, storedCats.find((c) => normalizeText(c.id) === cat.id)),
  );

  const custom = storedCats
    .filter(
      (c) =>
        !defaults.some((d) => d.id === normalizeText(c.id)) &&
        (c.isCustom || normalizeText(c.title)),
    )
    .map((c, i) => createCustomCategory(c, i))
    .filter((c): c is VendorChecklistCategory => c !== null);

  return {
    vendorLamaranName: normalizeText(ctx.vendorLamaranName),
    vendorLamaranNote: normalizeText(ctx.vendorLamaranNote),
    vendorAkadResepsiName: normalizeText(ctx.vendorAkadResepsiName),
    vendorAkadResepsiNote: normalizeText(ctx.vendorAkadResepsiNote),
    categories: [...merged, ...custom],
  };
}

export function serializeVendorPlannerState(state: VendorPlannerState) {
  return {
    venueStatus: JSON.stringify({
      vendorLamaranName: state.vendorLamaranName,
      vendorLamaranNote: state.vendorLamaranNote,
      vendorAkadResepsiName: state.vendorAkadResepsiName,
      vendorAkadResepsiNote: state.vendorAkadResepsiNote,
    }),
    cateringStatus: {
      categories: state.categories.map((cat) => ({
        id: cat.id,
        title: cat.title,
        description: cat.description,
        vendorName: cat.vendorName,
        isCustom: Boolean(cat.isCustom),
        items: cat.items.map((item) => ({
          label: item.label,
          status: item.status,
          note: item.note,
          imageUrl: item.imageUrl,
        })),
      })),
    },
    documentationStatus: "",
    coordinatorNeed: "",
    paymentPlan: "",
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getVendorChecklistStats(categories: VendorChecklistCategory[]) {
  const allItems = categories.flatMap((c) => c.items);
  const included = allItems.filter((i) => i.status === "include").length;
  const excluded = allItems.filter((i) => i.status === "exclude").length;
  const tbdItems = allItems.filter((i) => i.status === "tbd").length;
  const confirmed = allItems.filter((i) => i.status !== "tbd").length;
  const categoryConfirmed = categories.filter((c) => c.items.every((i) => i.status !== "tbd")).length;

  return {
    totalItems: allItems.length,
    included,
    excluded,
    tbdItems,
    confirmed,
    completedCategories: categoryConfirmed,
    totalCategories: categories.length,
    customCategories: categories.filter((c) => c.isCustom).length,
  };
}
