/**
 * budget-v2.ts
 * Budget system v2 – per-stage templates, vendor sync, nominal input, CSV/PDF export.
 */

import { timelineStageLabels, type TimelineStageLabel } from "@/lib/timeline-guide";
import type { VendorChecklistCategory } from "@/lib/vendor-guide";

// ─── Types ────────────────────────────────────────────────────────────────────

export const STAGE_SHORT: Record<TimelineStageLabel, string> = {
  "Pertemuan keluarga": "Pertemuan",
  "Lamaran": "Lamaran",
  "Pengajian / Siraman": "Siraman",
  "Akad nikah": "Akad",
  "Resepsi": "Resepsi",
  "Unduh mantu / acara lanjutan": "Unduh mantu",
};

export type BudgetV2LineItem = {
  id: string;
  label: string;
  nominal: number | null; // null = TBD / belum diisi
  note: string;
  vendorName: string; // nama vendor jika berasal dari vendor sync
  isCustom: boolean;
  isVendorSync: boolean; // true jika dari vendor sync, bukan template
};

export type StageBudgetV2 = {
  stageLabel: TimelineStageLabel;
  enabled: boolean;
  items: BudgetV2LineItem[];
};

export type BudgetV2State = {
  budgetRange: string;
  stages: StageBudgetV2[];
  vendorItems: BudgetV2LineItem[]; // Global vendor sync items (lintas tahap)
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mkId(prefix: string, label: string): string {
  return `${prefix}-${label.toLowerCase().replace(/[^\w]/g, "-").replace(/-+/g, "-").slice(0, 40)}`;
}

function tplItem(label: string, prefix: string): BudgetV2LineItem {
  return {
    id: mkId(prefix, label),
    label,
    nominal: null,
    note: "",
    vendorName: "",
    isCustom: false,
    isVendorSync: false,
  };
}

// ─── Stage Templates  ─────────────────────────────────────────────────────────
// Riset aktual biaya pernikahan Indonesia per tahapan

export const STAGE_TEMPLATES: Record<TimelineStageLabel, BudgetV2LineItem[]> = {
  "Pertemuan keluarga": [
    tplItem("Konsumsi dan minuman keluarga (makan bersama)", "ptk"),
    tplItem("Dekorasi sederhana ruang tamu atau rumah", "ptk"),
    tplItem("Transportasi keluarga (bensin / ojek / rental)", "ptk"),
    tplItem("Dokumentasi informal (opsional)", "ptk"),
    tplItem("Perlengkapan selamatan atau doa bersama (jika ada)", "ptk"),
    tplItem("Biaya sewa tempat pertemuan (jika di luar rumah)", "ptk"),
  ],
  "Lamaran": [
    tplItem("Seserahan lengkap (perangkat lamaran & perlengkapan adat)", "lam"),
    tplItem("Cincin lamaran atau tunangan", "lam"),
    tplItem("Busana mempelai wanita (baju lamaran / kebaya)", "lam"),
    tplItem("Busana mempelai pria (kemeja batik / jas)", "lam"),
    tplItem("Dekorasi meja seserahan dan area acara", "lam"),
    tplItem("Catering prasmanan atau konsumsi keluarga besar", "lam"),
    tplItem("Snack, kue, dan minuman tamu", "lam"),
    tplItem("Dokumentasi fotografer", "lam"),
    tplItem("MC atau pemandu acara lamaran (opsional)", "lam"),
    tplItem("Sewa venue atau gedung (jika tidak di rumah sendiri)", "lam"),
    tplItem("Transportasi keluarga dan rombongan", "lam"),
    tplItem("Bunga segar atau rangkaian dekorasi tambahan", "lam"),
  ],
  "Pengajian / Siraman": [
    tplItem("Perlengkapan siraman (kendi, bunga tujuh rupa, air bunga)", "pgs"),
    tplItem("Busana siraman atau kebaya adat mempelai wanita", "pgs"),
    tplItem("Busana keluarga inti (seragam atau kebaya)", "pgs"),
    tplItem("Catering dan konsumsi keluarga inti & tamu undangan", "pgs"),
    tplItem("Dekorasi area siraman dan pengajian", "pgs"),
    tplItem("Dokumentasi fotografer", "pgs"),
    tplItem("MC atau ustaz / ustazah pengajian", "pgs"),
    tplItem("Alat-alat pengajian dan perlengkapan ibadah", "pgs"),
    tplItem("Transportasi keluarga", "pgs"),
    tplItem("Sound system kecil (jika diperlukan)", "pgs"),
  ],
  "Akad nikah": [
    tplItem("Biaya pencatatan KUA atau catatan sipil", "akad"),
    tplItem("Penghulu atau pemuka agama (jika di luar KUA)", "akad"),
    tplItem("Mas kawin atau mahar (uang, emas, atau Al-Qur'an)", "akad"),
    tplItem("Busana akad mempelai wanita (kebaya / baju adat)", "akad"),
    tplItem("Busana akad mempelai pria (jas / beskap / baju adat)", "akad"),
    tplItem("Dekorasi pelaminan akad", "akad"),
    tplItem("Dokumentasi fotografer dan videografer", "akad"),
    tplItem("Konsumsi dan catering keluarga inti", "akad"),
    tplItem("Sound system untuk sesi akad", "akad"),
    tplItem("Transportasi keluarga inti dan saksi", "akad"),
    tplItem("MUA mempelai wanita (akad pagi)", "akad"),
    tplItem("Sajian kue atau snack singkat usai akad", "akad"),
  ],
  "Resepsi": [
    tplItem("Sewa venue atau gedung resepsi", "res"),
    tplItem("Catering prasmanan (jika terpisah dari venue)", "res"),
    tplItem("Dekorasi ballroom / gedung / panggung utama", "res"),
    tplItem("MUA mempelai wanita (full day termasuk resepsi)", "res"),
    tplItem("MUA ibu kedua mempelai", "res"),
    tplItem("Grooming mempelai pria", "res"),
    tplItem("Busana resepsi mempelai wanita", "res"),
    tplItem("Busana resepsi mempelai pria", "res"),
    tplItem("Busana seragam keluarga inti", "res"),
    tplItem("Dokumentasi fotografer resepsi", "res"),
    tplItem("Dokumentasi videografer dan highlight video", "res"),
    tplItem("Wedding cake atau kue pengantin display", "res"),
    tplItem("Entertainment: band, live music, atau DJ", "res"),
    tplItem("MC acara resepsi", "res"),
    tplItem("Sound system dan lighting panggung", "res"),
    tplItem("Wedding Organizer atau koordinator hari-H", "res"),
    tplItem("Undangan cetak atau digital (desain + kirim)", "res"),
    tplItem("Souvenir tamu (hampers, merchandise, dll)", "res"),
    tplItem("Transportasi mempelai (mobil pengantin)", "res"),
    tplItem("Bunga segar tambahan atau additional decor", "res"),
    tplItem("Signage, backdrop foto tamu, dan meja registrasi", "res"),
    tplItem("Kebutuhan hospitality VIP (transport, koordinasi)", "res"),
  ],
  "Unduh mantu / acara lanjutan": [
    tplItem("Konsumsi dan catering tamu keluarga besar", "um"),
    tplItem("Dekorasi sederhana rumah keluarga pria", "um"),
    tplItem("Dokumentasi fotografer (opsional)", "um"),
    tplItem("Transportasi mempelai dan keluarga", "um"),
    tplItem("Bingkisan atau ucapan terima kasih keluarga", "um"),
    tplItem("Pelunasan sisa vendor (jika masih ada tunggakan)", "um"),
    tplItem("Sound system kecil atau hiburan keluarga", "um"),
  ],
};

// ─── Vendor Sync ──────────────────────────────────────────────────────────────

/**
 * Baca vendor categories dari Langkah 3.
 * Jika nama vendor sama di beberapa kategori → gabungkan jadi 1 paket "all-in".
 * Jika nama vendor beda / kosong → hanya tampilkan kategori yang punya vendor.
 */
export function buildVendorSyncItems(
  vendorCategories: VendorChecklistCategory[],
): BudgetV2LineItem[] {
  const groups: Record<
    string,
    { categoryTitles: string[]; itemLabels: string[] }
  > = {};

  vendorCategories.forEach((cat) => {
    const name = cat.vendorName.trim();
    if (!name) return;

    const validItems = cat.items
      .filter((i) => i.status === "include" || i.status === "tbd")
      .map((i) => i.label);
    if (validItems.length === 0) return;

    if (!groups[name]) {
      groups[name] = { categoryTitles: [], itemLabels: [] };
    }
    groups[name].categoryTitles.push(cat.title);
    groups[name].itemLabels.push(...validItems);
  });

  return Object.entries(groups).map(([vendorName, group]) => {
    const catStr = group.categoryTitles.join(", ");
    const label =
      group.categoryTitles.length === 1
        ? `Paket ${vendorName} – ${catStr}`
        : `Paket all-in ${vendorName} (${catStr})`;
    const itemPreview = group.itemLabels.slice(0, 4).join(", ");
    const more =
      group.itemLabels.length > 4
        ? `, +${group.itemLabels.length - 4} item lainnya`
        : "";

    return {
      id: `vsync-${vendorName.toLowerCase().replace(/[^\w]/g, "-")}`,
      label,
      nominal: null,
      note: `Mencakup: ${itemPreview}${more}`,
      vendorName,
      isCustom: false,
      isVendorSync: true,
    };
  });
}

// ─── State Builder ────────────────────────────────────────────────────────────

type StoredItem = Partial<BudgetV2LineItem>;
type StoredStage = {
  stageLabel?: string;
  enabled?: boolean;
  items?: StoredItem[];
};
type StoredRoot = {
  version?: number;
  budgetRange?: string;
  stages?: StoredStage[];
  vendorItems?: StoredItem[];
};

function parseStored(raw: string): StoredRoot {
  if (!raw.trim().startsWith("{")) return {};
  try {
    return JSON.parse(raw) as StoredRoot;
  } catch {
    return {};
  }
}

function mergeStageItems(
  templates: BudgetV2LineItem[],
  stored: StoredItem[],
): BudgetV2LineItem[] {
  const merged = templates.map((tpl) => {
    const sv = stored.find(
      (s) => s.id === tpl.id || s.label === tpl.label,
    );
    if (!sv) return { ...tpl };
    return {
      ...tpl,
      nominal: typeof sv.nominal === "number" ? sv.nominal : null,
      note: typeof sv.note === "string" ? sv.note : "",
    };
  });

  // Append custom items that were added by the user
  const customs: BudgetV2LineItem[] = stored
    .filter(
      (sv) =>
        sv.isCustom &&
        sv.label &&
        !templates.some((t) => t.id === sv.id || t.label === sv.label),
    )
    .map((sv, idx) => ({
      id: sv.id || `custom-${Date.now()}-${idx}`,
      label: sv.label || "",
      nominal: typeof sv.nominal === "number" ? sv.nominal : null,
      note: typeof sv.note === "string" ? sv.note : "",
      vendorName: sv.vendorName || "",
      isCustom: true,
      isVendorSync: false,
    }));

  return [...merged, ...customs];
}

export function buildBudgetV2State(
  rawBudgetPlan: string,
  vendorCategories: VendorChecklistCategory[],
): BudgetV2State {
  const stored = parseStored(rawBudgetPlan);
  const isV2 = stored.version === 2;

  const vendorItems = buildVendorSyncItems(vendorCategories);

  // Merge stored vendor item nominals/notes
  const mergedVendorItems = vendorItems.map((vi) => {
    if (!isV2 || !Array.isArray(stored.vendorItems)) return vi;
    const sv = stored.vendorItems.find(
      (s) => s.id === vi.id || s.vendorName === vi.vendorName,
    );
    if (!sv) return vi;
    return {
      ...vi,
      nominal: typeof sv.nominal === "number" ? sv.nominal : null,
      note: typeof sv.note === "string" ? sv.note : vi.note,
    };
  });

  const stages: StageBudgetV2[] = timelineStageLabels.map((label) => {
    const templates = STAGE_TEMPLATES[label].map((i) => ({ ...i }));

    if (!isV2 || !Array.isArray(stored.stages)) {
      return { stageLabel: label, enabled: false, items: templates };
    }

    const storedStage = stored.stages.find((s) => s.stageLabel === label);
    if (!storedStage) {
      return { stageLabel: label, enabled: false, items: templates };
    }

    const storedItems = Array.isArray(storedStage.items)
      ? storedStage.items
      : [];

    return {
      stageLabel: label,
      enabled: Boolean(storedStage.enabled),
      items: mergeStageItems(templates, storedItems),
    };
  });

  return {
    budgetRange: stored.budgetRange || "",
    stages,
    vendorItems: mergedVendorItems,
  };
}

export function serializeBudgetV2State(state: BudgetV2State): string {
  const root: StoredRoot = {
    version: 2,
    budgetRange: state.budgetRange,
    stages: state.stages.map((s) => ({
      stageLabel: s.stageLabel,
      enabled: s.enabled,
      items: s.items.map((i) => ({
        id: i.id,
        label: i.label,
        nominal: i.nominal,
        note: i.note,
        vendorName: i.vendorName,
        isCustom: i.isCustom,
        isVendorSync: i.isVendorSync,
      })),
    })),
    vendorItems: state.vendorItems.map((i) => ({
      id: i.id,
      label: i.label,
      nominal: i.nominal,
      note: i.note,
      vendorName: i.vendorName,
      isCustom: i.isCustom,
      isVendorSync: i.isVendorSync,
    })),
  };
  return JSON.stringify(root);
}

// ─── Stats & Formatting ───────────────────────────────────────────────────────

export type BudgetV2Totals = {
  enabledStageCount: number;
  stageItemsTotal: number;
  vendorItemsTotal: number;
  grandTotal: number;
  filledCount: number;
  totalCount: number;
  perStage: { label: TimelineStageLabel; total: number; count: number }[];
};

export function calcBudgetV2Totals(state: BudgetV2State): BudgetV2Totals {
  const enabledStages = state.stages.filter((s) => s.enabled);

  let stageItemsTotal = 0;
  let filledCount = 0;
  let totalCount = 0;

  const perStage = enabledStages.map((s) => {
    const total = s.items.reduce((sum, i) => sum + (i.nominal ?? 0), 0);
    const count = s.items.filter((i) => i.nominal !== null && i.nominal > 0).length;
    stageItemsTotal += total;
    filledCount += count;
    totalCount += s.items.length;
    return { label: s.stageLabel, total, count };
  });

  const vendorItemsTotal = state.vendorItems.reduce(
    (sum, i) => sum + (i.nominal ?? 0),
    0,
  );
  totalCount += state.vendorItems.length;
  filledCount += state.vendorItems.filter(
    (i) => i.nominal !== null && i.nominal > 0,
  ).length;

  return {
    enabledStageCount: enabledStages.length,
    stageItemsTotal,
    vendorItemsTotal,
    grandTotal: stageItemsTotal + vendorItemsTotal,
    filledCount,
    totalCount,
    perStage,
  };
}

export function fmtRupiah(value: number | null | undefined): string {
  if (!value || value === 0) return "–";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function fmtNominalDisplay(value: number | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString("id-ID");
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function buildBudgetCsv(
  state: BudgetV2State,
  coupleNames?: string,
): string {
  const rows: string[][] = [];
  const header = coupleNames
    ? `Rencana Anggaran Pernikahan – ${coupleNames}`
    : "Rencana Anggaran Pernikahan";

  rows.push([header]);
  rows.push(["Rentang Budget", state.budgetRange || "-"]);
  rows.push([]);
  rows.push(["Tahap", "Pos Anggaran", "Vendor", "Jumlah (Rp)", "Catatan"]);

  // Vendor items
  if (state.vendorItems.length > 0) {
    state.vendorItems.forEach((item) => {
      rows.push([
        "Vendor (All-in)",
        item.label,
        item.vendorName,
        item.nominal != null ? String(item.nominal) : "",
        item.note,
      ]);
    });
  }

  // Stage items
  state.stages
    .filter((s) => s.enabled)
    .forEach((s) => {
      s.items.forEach((item) => {
        rows.push([
          s.stageLabel,
          item.label,
          item.vendorName || "",
          item.nominal != null ? String(item.nominal) : "",
          item.note,
        ]);
      });
    });

  // Totals
  const totals = calcBudgetV2Totals(state);
  rows.push([]);
  rows.push(["TOTAL ESTIMASI", "", "", String(totals.grandTotal), ""]);

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}
