export type DocumentChecklistItem = {
  label: string;
  checked: boolean;
};

export type DocumentChecklistCategory = {
  id: string;
  title: string;
  description: string;
  items: DocumentChecklistItem[];
  note: string;
  isCustom?: boolean;
};

export type DocumentPlannerState = {
  legalChecklist: string;
  familyDocuments: string;
  vendorContracts: string;
  paymentProofs: string;
  finalArchive: string;
  categories: DocumentChecklistCategory[];
};

export const defaultDocumentCategories: DocumentChecklistCategory[] = [
  {
    id: "legal-admin",
    title: "Dokumen legal dan administrasi",
    description: "Kelompok ini membantu memastikan berkas inti pernikahan dan tenggat administrasi tidak terlewat.",
    items: [
      { label: "KTP, KK, dan data identitas yang diperlukan", checked: false },
      { label: "Berkas KUA atau rumah ibadah", checked: false },
      { label: "Surat pengantar atau dokumen tambahan bila diperlukan", checked: false },
      { label: "Catatan tenggat pengurusan dokumen", checked: false },
    ],
    note: "",
  },
  {
    id: "dokumen-keluarga",
    title: "Dokumen dan data keluarga",
    description: "Dipakai untuk mengumpulkan data keluarga inti, kontak penting, dan kebutuhan administrasi keluarga lainnya.",
    items: [
      { label: "Data keluarga inti dan kontak penting", checked: false },
      { label: "Susunan perwakilan keluarga pada hari acara", checked: false },
      { label: "Catatan kebutuhan keluarga inti", checked: false },
      { label: "Arsip komunikasi keluarga yang perlu disimpan", checked: false },
    ],
    note: "",
  },
  {
    id: "vendor-file",
    title: "Kontrak dan file vendor",
    description: "Membantu memastikan semua penawaran, kontrak, revisi, dan file kerja vendor tersusun rapi.",
    items: [
      { label: "Quotation dan penawaran vendor utama", checked: false },
      { label: "Kontrak atau kesepakatan vendor", checked: false },
      { label: "Revisi deal atau catatan perubahan", checked: false },
      { label: "Folder bersama untuk file vendor", checked: false },
    ],
    note: "",
  },
  {
    id: "pembayaran-arsip",
    title: "Bukti pembayaran dan arsip akhir",
    description: "Kategori ini membantu menyatukan invoice, bukti transfer, dan arsip pasca acara agar tidak tercecer.",
    items: [
      { label: "Invoice vendor dan pengingat termin", checked: false },
      { label: "Bukti transfer atau pelunasan", checked: false },
      { label: "Folder akhir foto, video, dan arsip proyek", checked: false },
      { label: "Catatan penutup proyek setelah acara", checked: false },
    ],
    note: "",
  },
];

export function createDefaultDocumentCategories() {
  return defaultDocumentCategories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }));
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type StoredDocumentCategory = Partial<Omit<DocumentChecklistCategory, "items">> & {
  items?: Array<Partial<DocumentChecklistItem>>;
};

type StoredDocumentChecklist = {
  categories?: StoredDocumentCategory[];
};

function mergeCategory(base: DocumentChecklistCategory, incoming?: StoredDocumentCategory) {
  if (!incoming) {
    return {
      ...base,
      items: base.items.map((item) => ({ ...item })),
    };
  }

  const incomingItems = Array.isArray(incoming.items) ? incoming.items : [];

  return {
    ...base,
    title: normalizeText(incoming.title) || base.title,
    description: normalizeText(incoming.description) || base.description,
    note: normalizeText(incoming.note) || "",
    isCustom: Boolean(incoming.isCustom ?? base.isCustom),
    items: base.items.map((item) => {
      const savedItem = incomingItems.find((candidate) => normalizeText(candidate.label) === item.label);
      return {
        label: item.label,
        checked: Boolean(savedItem?.checked),
      };
    }),
  };
}

function createCustomCategory(incoming: StoredDocumentCategory, index: number): DocumentChecklistCategory | null {
  const title = normalizeText(incoming.title);
  const items = (Array.isArray(incoming.items) ? incoming.items : [])
    .map((item) => ({ label: normalizeText(item.label), checked: Boolean(item.checked) }))
    .filter((item) => item.label.length > 0);

  if (!title || items.length === 0) {
    return null;
  }

  return {
    id: normalizeText(incoming.id) || `custom-doc-${index + 1}`,
    title,
    description: normalizeText(incoming.description) || "Kategori tambahan ini dibuat agar pengarsipan dokumen tetap fleksibel mengikuti kebutuhan acara dan keluarga.",
    note: normalizeText(incoming.note),
    isCustom: true,
    items,
  };
}

export function buildDocumentPlannerState(module: {
  legalChecklist: string;
  familyDocuments: string;
  vendorContracts: string;
  paymentProofs: string;
  finalArchive: string;
}): DocumentPlannerState {
  let storedChecklist: StoredDocumentChecklist = {};

  if (normalizeText(module.finalArchive).startsWith("{")) {
    try {
      storedChecklist = JSON.parse(module.finalArchive) as StoredDocumentChecklist;
    } catch {
      storedChecklist = {};
    }
  }

  const storedCategories = Array.isArray(storedChecklist.categories) ? storedChecklist.categories : [];
  const defaults = createDefaultDocumentCategories();
  const mergedDefaults = defaults.map((category) => mergeCategory(category, storedCategories.find((candidate) => normalizeText(candidate.id) === category.id)));
  const customCategories = storedCategories
    .filter((candidate) => !defaults.some((category) => category.id === normalizeText(candidate.id)) && (candidate.isCustom || normalizeText(candidate.title)))
    .map((category, index) => createCustomCategory(category, index))
    .filter((category): category is DocumentChecklistCategory => Boolean(category));

  return {
    legalChecklist: normalizeText(module.legalChecklist),
    familyDocuments: normalizeText(module.familyDocuments),
    vendorContracts: normalizeText(module.vendorContracts),
    paymentProofs: normalizeText(module.paymentProofs),
    finalArchive: normalizeText(module.finalArchive) && !normalizeText(module.finalArchive).startsWith("{") ? normalizeText(module.finalArchive) : "",
    categories: [...mergedDefaults, ...customCategories],
  };
}

export function serializeDocumentPlannerState(state: DocumentPlannerState) {
  return {
    legalChecklist: state.legalChecklist,
    familyDocuments: state.familyDocuments,
    vendorContracts: state.vendorContracts,
    paymentProofs: state.paymentProofs,
    finalArchive: JSON.stringify({
      categories: state.categories.map((category) => ({
        id: category.id,
        title: category.title,
        description: category.description,
        note: category.note,
        isCustom: Boolean(category.isCustom),
        items: category.items.map((item) => ({ label: item.label, checked: Boolean(item.checked) })),
      })),
    }),
  };
}

export function getDocumentChecklistStats(categories: DocumentChecklistCategory[]) {
  const allItems = categories.flatMap((category) => category.items);
  const checkedItems = allItems.filter((item) => item.checked).length;
  const completedCategories = categories.filter((category) => category.items.length > 0 && category.items.every((item) => item.checked)).length;
  const customCategories = categories.filter((category) => category.isCustom).length;

  return {
    totalItems: allItems.length,
    checkedItems,
    completedCategories,
    totalCategories: categories.length,
    customCategories,
  };
}
