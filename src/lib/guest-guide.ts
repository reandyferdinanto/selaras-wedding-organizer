export type GuestGroupItem = {
  label: string;
  checked: boolean;
};

export type GuestGroupCategory = {
  id: string;
  title: string;
  description: string;
  items: GuestGroupItem[];
  note: string;
  isCustom?: boolean;
};

export type GuestPlannerState = {
  guestDirection: string;
  invitationChannel: string;
  rsvpOwner: string;
  seatingNotes: string;
  hospitalityNotes: string;
  categories: GuestGroupCategory[];
};

export const defaultGuestCategories: GuestGroupCategory[] = [
  {
    id: "keluarga-inti",
    title: "Keluarga inti",
    description: "Kelompok ini biasanya paling perlu dipastikan lebih awal karena berhubungan dengan posisi duduk, alur masuk, dan koordinasi utama.",
    items: [
      { label: "Orang tua kedua mempelai", checked: false },
      { label: "Saudara kandung dan pasangan", checked: false },
      { label: "Perwakilan keluarga inti untuk sesi foto", checked: false },
      { label: "Daftar tamu prioritas keluarga inti", checked: false },
    ],
    note: "",
  },
  {
    id: "keluarga-besar",
    title: "Keluarga besar",
    description: "Dipakai untuk memastikan undangan keluarga besar tersebar rapi dan tidak tumpang tindih antar pihak keluarga.",
    items: [
      { label: "Keluarga besar dari pihak mempelai wanita", checked: false },
      { label: "Keluarga besar dari pihak mempelai pria", checked: false },
      { label: "PIC keluarga untuk membantu sebar undangan", checked: false },
      { label: "Rekap kehadiran keluarga besar", checked: false },
    ],
    note: "",
  },
  {
    id: "sahabat-teman",
    title: "Sahabat dan teman dekat",
    description: "Cocok untuk memisahkan tamu yang lebih personal agar komunikasi undangannya lebih hangat dan tidak tercampur daftar lain.",
    items: [
      { label: "Sahabat dekat mempelai wanita", checked: false },
      { label: "Sahabat dekat mempelai pria", checked: false },
      { label: "Teman kuliah atau komunitas", checked: false },
      { label: "Teman kerja yang dianggap dekat", checked: false },
    ],
    note: "",
  },
  {
    id: "kolega-relasi",
    title: "Kolega dan relasi",
    description: "Bagian ini membantu memisahkan tamu profesional atau relasi keluarga agar RSVP dan tata duduknya lebih tertata.",
    items: [
      { label: "Rekan kerja mempelai wanita", checked: false },
      { label: "Rekan kerja mempelai pria", checked: false },
      { label: "Relasi orang tua atau mitra keluarga", checked: false },
      { label: "Daftar tamu VIP atau tamu kehormatan", checked: false },
    ],
    note: "",
  },
  {
    id: "pelayanan-tamu",
    title: "Layanan tamu pada hari acara",
    description: "Kategori ini membantu menyiapkan pengalaman tamu saat datang, registrasi, duduk, sampai pulang dari acara.",
    items: [
      { label: "Tim penerima tamu dan meja registrasi", checked: false },
      { label: "Penanda meja atau area duduk keluarga", checked: false },
      { label: "Bantuan untuk tamu lansia atau tamu prioritas", checked: false },
      { label: "Alur souvenir atau guest flow setelah acara", checked: false },
    ],
    note: "",
  },
];

export function createDefaultGuestCategories() {
  return defaultGuestCategories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  }));
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type StoredGuestCategory = Partial<Omit<GuestGroupCategory, "items">> & {
  items?: Array<Partial<GuestGroupItem>>;
};

type StoredGuestChecklist = {
  categories?: StoredGuestCategory[];
};

function mergeCategory(base: GuestGroupCategory, incoming?: StoredGuestCategory) {
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

function createCustomCategory(incoming: StoredGuestCategory, index: number): GuestGroupCategory | null {
  const title = normalizeText(incoming.title);
  const items = (Array.isArray(incoming.items) ? incoming.items : [])
    .map((item) => ({ label: normalizeText(item.label), checked: Boolean(item.checked) }))
    .filter((item) => item.label.length > 0);

  if (!title || items.length === 0) {
    return null;
  }

  return {
    id: normalizeText(incoming.id) || `custom-guest-${index + 1}`,
    title,
    description: normalizeText(incoming.description) || "Kategori tambahan ini membantu menyesuaikan pembagian tamu bila struktur keluarga atau acara Anda tidak sama dengan pola umum.",
    note: normalizeText(incoming.note),
    isCustom: true,
    items,
  };
}

export function buildGuestPlannerState(module: {
  guestGroups: string;
  invitationChannel: string;
  rsvpOwner: string;
  familySeating: string;
  hospitalityNotes: string;
}): GuestPlannerState {
  let storedChecklist: StoredGuestChecklist = {};

  if (normalizeText(module.guestGroups).startsWith("{")) {
    try {
      storedChecklist = JSON.parse(module.guestGroups) as StoredGuestChecklist;
    } catch {
      storedChecklist = {};
    }
  }

  const storedCategories = Array.isArray(storedChecklist.categories) ? storedChecklist.categories : [];
  const defaults = createDefaultGuestCategories();
  const mergedDefaults = defaults.map((category) => mergeCategory(category, storedCategories.find((candidate) => normalizeText(candidate.id) === category.id)));
  const customCategories = storedCategories
    .filter((candidate) => !defaults.some((category) => category.id === normalizeText(candidate.id)) && (candidate.isCustom || normalizeText(candidate.title)))
    .map((category, index) => createCustomCategory(category, index))
    .filter((category): category is GuestGroupCategory => Boolean(category));

  return {
    guestDirection: normalizeText(module.guestGroups) && !normalizeText(module.guestGroups).startsWith("{") ? normalizeText(module.guestGroups) : "",
    invitationChannel: normalizeText(module.invitationChannel),
    rsvpOwner: normalizeText(module.rsvpOwner),
    seatingNotes: normalizeText(module.familySeating),
    hospitalityNotes: normalizeText(module.hospitalityNotes),
    categories: [...mergedDefaults, ...customCategories],
  };
}

export function serializeGuestPlannerState(state: GuestPlannerState) {
  return {
    guestGroups: JSON.stringify({
      categories: state.categories.map((category) => ({
        id: category.id,
        title: category.title,
        description: category.description,
        note: category.note,
        isCustom: Boolean(category.isCustom),
        items: category.items.map((item) => ({ label: item.label, checked: Boolean(item.checked) })),
      })),
    }),
    invitationChannel: state.invitationChannel,
    rsvpOwner: state.rsvpOwner,
    familySeating: state.seatingNotes,
    hospitalityNotes: state.hospitalityNotes,
  };
}

export function getGuestChecklistStats(categories: GuestGroupCategory[]) {
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
