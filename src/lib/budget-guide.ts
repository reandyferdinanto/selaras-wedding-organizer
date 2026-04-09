export type BudgetBucketItem = {
  label: string;
  checked: boolean;
};

export type BudgetBucketCategory = {
  id: string;
  title: string;
  description: string;
  items: BudgetBucketItem[];
  note: string;
  isCustom?: boolean;
};

export type BudgetPlannerState = {
  budgetRange: string;
  biggestExpense: string;
  paymentStrategy: string;
  reserveFund: string;
  budgetControl: string;
  categories: BudgetBucketCategory[];
};

import { buildVendorPlannerState } from "./vendor-guide";

export function buildDefaultBudgetCategories(notes?: any): BudgetBucketCategory[] {
  const categories: BudgetBucketCategory[] = [];
  
  // 1. Generate from Vendor Module if available
  if (notes?.vendor) {
    const vendorState = buildVendorPlannerState(notes.vendor);
    const groups: Record<string, { desc: string; items: string[] }> = {};
    
    vendorState.categories.forEach(cat => {
      // Include non-excluded items ("tbd" or "include"). Exclusion means no budget impact.
      const items = cat.items.filter(i => i.status !== "exclude").map(i => i.label);
      if (items.length === 0) return;

      const groupKey = cat.vendorName.trim() ? cat.vendorName.trim() : cat.title;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          desc: cat.vendorName.trim() ? `Paket dari vendor: ${cat.vendorName}` : cat.description,
          items: []
        };
      }
      groups[groupKey].items.push(...items);
    });

    let sId = 1;
    for (const [title, group] of Object.entries(groups)) {
      // generate a predictable ID based on title for better merging consistency
      const safeId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      categories.push({
        id: `vendor-${safeId || sId++}`,
        title: title,
        description: group.desc,
        items: group.items.map(label => ({ label, checked: false })),
        note: ""
      });
    }
  }

  // 2. Add Timeline / Pre-wedding costs
  categories.push({
    id: "pre-wedding-events",
    title: "Rangkaian acara pranikah",
    description: "Biaya yang berhubungan dengan persiapan awal seperti lamaran, pertemuan dua keluarga, atau pengajian.",
    note: "",
    items: [
      { label: "Pertemuan keluarga inti (uang makan / venue)", checked: false },
      { label: "Acara lamaran (venue, makanan, dekor minimalis)", checked: false },
      { label: "Seserahan atau cincin tunangan", checked: false },
    ]
  });

  // 3. Add Document costs
  categories.push({
    id: "dokumen-legal",
    title: "Dokumen dan Administrasi",
    description: "Pengurusan syarat legal pernikahan dan catatan sipil.",
    note: "",
    items: [
      { label: "Biaya administrasi KUA / Catatan Sipil", checked: false },
      { label: "Bimbingan pranikah atau cek kesehatan", checked: false },
      { label: "Pengurusan surat pengantar RT/RW", checked: false },
    ]
  });

  if (categories.length === 2) {
    // Fallback if no vendor state
    categories.unshift({
      id: "inti-acara",
      title: "Biaya vendor acara",
      description: "Alokasi budget untuk vendor-vendor utama.",
      note: "",
      items: [
        { label: "Venue atau lokasi utama", checked: false },
        { label: "Catering dan kebutuhan konsumsi", checked: false },
        { label: "Dekorasi dan Dokumentasi", checked: false },
      ]
    });
  }

  return categories;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

type StoredBudgetCategory = Partial<Omit<BudgetBucketCategory, "items">> & {
  items?: Array<Partial<BudgetBucketItem>>;
};

type StoredBudgetChecklist = {
  categories?: StoredBudgetCategory[];
};

function mergeCategory(base: BudgetBucketCategory, incoming?: StoredBudgetCategory) {
  if (!incoming) {
    return {
      ...base,
      items: base.items.map((item) => ({ ...item })),
    };
  }

  const incomingItems = Array.isArray(incoming.items) ? incoming.items : [];

  return {
    ...base,
    // Keep base title/desc so updates from vendor bubble up, but keep incoming note
    title: base.title,
    description: base.description,
    note: normalizeText(incoming.note) || "",
    isCustom: Boolean(incoming.isCustom ?? base.isCustom),
    items: base.items.map((item) => {
      // Find item by label since IDs are not present on items
      const savedItem = incomingItems.find((candidate) => normalizeText(candidate.label) === item.label);
      return {
        label: item.label,
        checked: Boolean(savedItem?.checked),
      };
    }),
  };
}

function createCustomCategory(incoming: StoredBudgetCategory, index: number): BudgetBucketCategory | null {
  const title = normalizeText(incoming.title);
  const items = (Array.isArray(incoming.items) ? incoming.items : [])
    .map((item) => ({ label: normalizeText(item.label), checked: Boolean(item.checked) }))
    .filter((item) => item.label.length > 0);

  if (!title || items.length === 0) {
    return null;
  }

  return {
    id: normalizeText(incoming.id) || `custom-budget-${index + 1}`,
    title,
    description: normalizeText(incoming.description) || "Kategori tambahan ini dibuat agar kontrol anggaran tetap cocok dengan model acara dan kebiasaan keluarga Anda.",
    note: normalizeText(incoming.note),
    isCustom: true,
    items,
  };
}

export function buildBudgetPlannerState(
  module: {
    totalRange: string;
    biggestExpense: string;
    paymentStrategy: string;
    reserveFund: string;
    budgetControl: string;
  },
  notes?: any
): BudgetPlannerState {
  let storedChecklist: StoredBudgetChecklist = {};

  if (normalizeText(module.budgetControl).startsWith("{")) {
    try {
      storedChecklist = JSON.parse(module.budgetControl) as StoredBudgetChecklist;
    } catch {
      storedChecklist = {};
    }
  }

  const storedCategories = Array.isArray(storedChecklist.categories) ? storedChecklist.categories : [];
  const defaults = buildDefaultBudgetCategories(notes);
  
  // Merge by exact ID or by title matching (if title matching works reliably across ID changes)
  const mergedDefaults = defaults.map((category) => {
    const matched = storedCategories.find((candidate) => normalizeText(candidate.id) === category.id || normalizeText(candidate.title) === category.title);
    return mergeCategory(category, matched);
  });

  const customCategories = storedCategories
    .filter((candidate) => 
      !defaults.some((category) => category.id === normalizeText(candidate.id) || category.title === normalizeText(candidate.title)) && 
      (candidate.isCustom || normalizeText(candidate.title))
    )
    .map((category, index) => createCustomCategory(category, index))
    .filter((category): category is BudgetBucketCategory => Boolean(category));

  return {
    budgetRange: normalizeText(module.totalRange),
    biggestExpense: normalizeText(module.biggestExpense),
    paymentStrategy: normalizeText(module.paymentStrategy),
    reserveFund: normalizeText(module.reserveFund),
    budgetControl: normalizeText(module.budgetControl) && !normalizeText(module.budgetControl).startsWith("{") ? normalizeText(module.budgetControl) : "",
    categories: [...mergedDefaults, ...customCategories],
  };
}

export function serializeBudgetPlannerState(state: BudgetPlannerState) {
  return {
    totalRange: state.budgetRange,
    biggestExpense: state.biggestExpense,
    paymentStrategy: state.paymentStrategy,
    reserveFund: state.reserveFund,
    budgetControl: JSON.stringify({
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

export function getBudgetChecklistStats(categories: BudgetBucketCategory[]) {
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
