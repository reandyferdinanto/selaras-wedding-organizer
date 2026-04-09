"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FilePlus2,
  LayoutDashboard,
  PackageCheck,
  Plus,
  Save,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";


import { timelineStageLabels, type TimelineStageLabel } from "@/lib/timeline-guide";
import type { VendorChecklistCategory } from "@/lib/vendor-guide";
import { TimelineStageIcon } from "@/components/timeline-stage-icon";
import {
  buildBudgetV2State,
  serializeBudgetV2State,
  calcBudgetV2Totals,
  STAGE_SHORT,
  fmtRupiah,
  fmtNominalDisplay,
  type BudgetV2State,
  type BudgetV2LineItem,
  type StageBudgetV2,
} from "@/lib/budget-v2";
import { exportBudgetToExcel, exportBudgetToPdf } from "@/lib/export-utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_RANGES = [
  "Di bawah Rp50 juta",
  "Rp50 juta – Rp100 juta",
  "Rp100 juta – Rp150 juta",
  "Rp150 juta – Rp250 juta",
  "Rp250 juta – Rp400 juta",
  "Di atas Rp400 juta",
];

// ─── Budget Item Row ──────────────────────────────────────────────────────────

function BudgetItemRow({
  item,
  onNominalChange,
  onNoteChange,
  onRemove,
  isVendorContext,
}: {
  item: BudgetV2LineItem;
  onNominalChange: (val: number | null) => void;
  onNoteChange: (val: string) => void;
  onRemove?: () => void;
  isVendorContext?: boolean;
}) {
  const [showNote, setShowNote] = useState(Boolean(item.note));

  const handleNominalInput = (raw: string) => {
    const cleaned = raw.replace(/\./g, "").replace(/[^0-9]/g, "");
    onNominalChange(cleaned ? parseInt(cleaned, 10) : null);
  };

  return (
    <div
      className={[
        "bv2-item-row",
        item.isVendorSync ? "is-vendor" : "",
        item.isCustom ? "is-custom" : "",
        item.nominal != null && item.nominal > 0 ? "is-filled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="bv2-item-main">
        {/* Label col */}
        <div className="bv2-item-label-col">
          <div className="bv2-item-badges">
            {item.isVendorSync && (
              <span className="bv2-badge is-vendor">
                <Building2 size={9} />
                Vendor
              </span>
            )}
            {item.isCustom && (
              <span className="bv2-badge is-custom">
                <FilePlus2 size={9} />
                Tambahan
              </span>
            )}
          </div>
          <span className="bv2-item-label">{item.label}</span>
          {item.isVendorSync && item.vendorName && (
            <span className="bv2-item-vendor-name">{item.vendorName}</span>
          )}
        </div>

        {/* Nominal input col */}
        <div className="bv2-item-nominal-col">
          <label className="bv2-nominal-wrap">
            <span className="bv2-nominal-prefix">Rp</span>
            <input
              type="text"
              className="bv2-nominal-input"
              placeholder="0"
              inputMode="numeric"
              value={fmtNominalDisplay(item.nominal)}
              onChange={(e) => handleNominalInput(e.target.value)}
              aria-label={`Jumlah untuk ${item.label}`}
            />
          </label>
        </div>

        {/* Actions col */}
        <div className="bv2-item-actions-col">
          <button
            type="button"
            className={["bv2-note-btn", showNote ? "is-open" : ""].join(" ")}
            onClick={() => setShowNote(!showNote)}
            title={showNote ? "Tutup catatan" : "Tambah catatan"}
            aria-label="Toggle catatan"
          >
            {showNote ? <X size={11} /> : <Plus size={11} />}
          </button>
          {item.isCustom && onRemove && (
            <button
              type="button"
              className="bv2-remove-btn"
              onClick={onRemove}
              title="Hapus pos ini"
              aria-label="Hapus pos"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Note row */}
      {showNote && (
        <div className="bv2-note-row">
          <input
            type="text"
            className="bv2-note-input"
            placeholder={
              item.isVendorSync
                ? "Catatan paket vendor (misal: sudah DP, negosiasi harga, dll)"
                : "Catatan (misal: sudah DP, perlu konfirmasi, tanggung keluarga...)"
            }
            value={item.note}
            onChange={(e) => onNoteChange(e.target.value)}
            aria-label={`Catatan untuk ${item.label}`}
          />
        </div>
      )}
    </div>
  );
}

// ─── Stage Panel ──────────────────────────────────────────────────────────────

function StageBudgetPanel({
  stage,
  vendorItems,
  onItemChange,
  onVendorItemChange,
}: {
  stage: StageBudgetV2;
  vendorItems: BudgetV2LineItem[];
  onItemChange: (
    itemId: string,
    patch: Partial<BudgetV2LineItem>,
  ) => void;
  onVendorItemChange: (
    itemId: string,
    patch: Partial<BudgetV2LineItem>,
  ) => void;
}) {
  const [newItemLabel, setNewItemLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = useCallback(() => {
    const label = newItemLabel.trim();
    if (!label) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onItemChange(id, {
      id,
      label,
      nominal: null,
      note: "",
      vendorName: "",
      isCustom: true,
      isVendorSync: false,
    });
    setNewItemLabel("");
    setIsAdding(false);
  }, [newItemLabel, onItemChange]);

  const stageTotal = stage.items.reduce((s, i) => s + (i.nominal ?? 0), 0);
  const vendorTotal = vendorItems.reduce((s, i) => s + (i.nominal ?? 0), 0);
  const panelTotal = stageTotal + vendorTotal;

  return (
    <div className="bv2-stage-panel">
      {/* Vendor sync section */}
      {vendorItems.length > 0 && (
        <div className="bv2-section bv2-vendor-section">
          <div className="bv2-section-header">
            <div className="bv2-section-title-row">
              <Building2 size={14} className="bv2-section-icon is-vendor" />
              <span className="bv2-section-title is-vendor">
                Sinkron dari Vendor (Langkah 3)
              </span>
            </div>
            <p className="bv2-section-hint">
              Vendor di bawah ini terdeteksi dari Langkah 3. Nama vendornya sama sehingga digabung jadi satu paket. Isi nominalnya di sini.
            </p>
          </div>
          <div className="bv2-item-list">
            {vendorItems.map((item) => (
              <BudgetItemRow
                key={item.id}
                item={item}
                isVendorContext
                onNominalChange={(val) =>
                  onVendorItemChange(item.id, { nominal: val })
                }
                onNoteChange={(val) =>
                  onVendorItemChange(item.id, { note: val })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Template items section */}
      <div className="bv2-section bv2-template-section">
        {vendorItems.length > 0 && (
          <div className="bv2-section-header">
            <div className="bv2-section-title-row">
              <Wallet size={14} className="bv2-section-icon" />
              <span className="bv2-section-title">Pos anggaran tambahan</span>
            </div>
            <p className="bv2-section-hint">
              Pos-pos di luar paket vendor. Isi estimasi jumlahnya atau biarkan kosong jika belum tahu.
            </p>
          </div>
        )}

        <div className="bv2-item-list">
          {stage.items.map((item) => (
            <BudgetItemRow
              key={item.id}
              item={item}
              onNominalChange={(val) => onItemChange(item.id, { nominal: val })}
              onNoteChange={(val) => onItemChange(item.id, { note: val })}
              onRemove={
                item.isCustom
                  ? () => onItemChange(item.id, { _remove: true } as any)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Add custom item */}
      <div className="bv2-add-item-zone">
        {isAdding ? (
          <div className="bv2-add-item-form">
            <input
              ref={addInputRef}
              type="text"
              className="bv2-add-item-input"
              placeholder="Nama pos anggaran baru..."
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewItemLabel("");
                }
              }}
            />
            <button
              type="button"
              className="bv2-add-confirm"
              onClick={handleAddItem}
            >
              <Check size={13} />
              Tambah
            </button>
            <button
              type="button"
              className="bv2-add-cancel"
              onClick={() => {
                setIsAdding(false);
                setNewItemLabel("");
              }}
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="bv2-add-item-btn"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={13} />
            Tambah pos anggaran
          </button>
        )}
      </div>

      {/* Stage total */}
      {panelTotal > 0 && (
        <div className="bv2-stage-total-bar">
          <span className="bv2-stage-total-label">Total estimasi tahap ini</span>
          <span className="bv2-stage-total-value">{fmtRupiah(panelTotal)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Stage Selector Card ──────────────────────────────────────────────────────

function StageCard({
  stageLabel,
  isEnabled,
  filledCount,
  total,
  onToggle,
}: {
  stageLabel: TimelineStageLabel;
  isEnabled: boolean;
  filledCount: number;
  total: number;
  onToggle: () => void;
}) {
  return (
    <div
      className={[
        "bv2-stage-card",
        isEnabled ? "is-enabled" : "is-disabled",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Toggle enable */}
      <button
        type="button"
        className="bv2-stage-toggle"
        onClick={onToggle}
        title={isEnabled ? "Nonaktifkan tahap ini" : "Aktifkan tahap ini"}
        aria-label={`${isEnabled ? "Nonaktifkan" : "Aktifkan"} ${stageLabel}`}
        aria-pressed={isEnabled}
      >
        <span className="bv2-stage-toggle-dot" aria-hidden="true" />
      </button>

      {/* Click to open panel */}
      <button
        type="button"
        className="bv2-stage-card-body"
        onClick={onToggle}
        aria-label={`${isEnabled ? "Nonaktifkan" : "Aktifkan"} ${stageLabel}`}
      >
        <TimelineStageIcon label={stageLabel} state={isEnabled ? "current" : "upcoming"} className="bv2-stage-icon" />
        <div className="bv2-stage-card-info">
          <span className="bv2-stage-card-name">{STAGE_SHORT[stageLabel]}</span>
          {isEnabled && (
            <span className="bv2-stage-card-stat">
              {filledCount}/{total} terisi
            </span>
          )}
        </div>
        {isEnabled && <ChevronDown size={13} className="bv2-stage-card-arrow" />}
      </button>
    </div>
  );
}

// ─── Budget Range Selector ────────────────────────────────────────────────────

function BudgetRangeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="bv2-range-bar">
      {BUDGET_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={["bv2-range-pill", value === range ? "is-active" : ""].join(" ")}
          onClick={() => onChange(value === range ? "" : range)}
          aria-pressed={value === range}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({
  state,
  coupleNames,
  onExportXlsx,
  onExportPdf,
  onSave,
  isPending,
  saveStatus,
  prevHref,
  nextHref,
}: {
  state: BudgetV2State;
  coupleNames?: string;
  onExportXlsx: () => void;
  onExportPdf: () => void;
  onSave: () => void;
  isPending: boolean;
  saveStatus: string | null;
  prevHref?: string;
  nextHref?: string;
}) {
  const totals = calcBudgetV2Totals(state);

  return (
    <aside className="bv2-summary-panel neo-panel p-5 sm:p-6">
      <p className="section-kicker">Ringkasan anggaran</p>
      <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-slate-800">
        Gambaran total estimasi
      </h2>

      {/* Grand total */}
      <div className="bv2-grand-total-card neo-panel-inset mt-5 p-5">
        <p className="text-sm font-semibold text-slate-500">Total estimasi keseluruhan</p>
        <p className="bv2-grand-total-value">
          {totals.grandTotal > 0 ? fmtRupiah(totals.grandTotal) : "–"}
        </p>
        {state.budgetRange && (
          <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rentang: {state.budgetRange}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="bv2-summary-stats mt-4">
        <div className="neo-panel-inset p-3">
          <p className="text-xs font-semibold text-slate-500">Tahap diaktifkan</p>
          <p className="mt-1 text-lg font-bold text-slate-800">
            {totals.enabledStageCount}/{timelineStageLabels.length}
          </p>
        </div>
        <div className="neo-panel-inset p-3">
          <p className="text-xs font-semibold text-slate-500">Pos terisi</p>
          <p className="mt-1 text-lg font-bold text-slate-800">
            {totals.filledCount}/{totals.totalCount}
          </p>
        </div>
        {totals.vendorItemsTotal > 0 && (
          <div className="neo-panel-inset p-3">
            <p className="text-xs font-semibold text-slate-500">Total vendor</p>
            <p className="mt-1 text-lg font-bold text-slate-800">
              {fmtRupiah(totals.vendorItemsTotal)}
            </p>
          </div>
        )}
        <div className="neo-panel-inset p-3">
          <p className="text-xs font-semibold text-slate-500">Total biaya per tahap</p>
          <p className="mt-1 text-lg font-bold text-slate-800">
            {fmtRupiah(totals.stageItemsTotal)}
          </p>
        </div>
      </div>

      {/* Per-stage breakdown */}
      {totals.perStage.length > 0 && (
        <div className="bv2-stage-breakdown mt-5">
          <p className="section-kicker mb-3">Per tahap</p>
          {totals.perStage.map((s) => (
            <div key={s.label} className="bv2-breakdown-row">
              <span className="bv2-breakdown-label">{STAGE_SHORT[s.label]}</span>
              <span className="bv2-breakdown-value">
                {s.total > 0 ? fmtRupiah(s.total) : "–"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Save Action */}
      <div className="bv2-save-zone mt-6">
        <p className="section-kicker mb-3">Simpan Perubahan</p>
        <button
          type="button"
          className="neo-button-primary w-full justify-center text-sm"
          onClick={onSave}
          disabled={isPending}
        >
          {isPending ? "Menyimpan..." : "Simpan Anggaran"}
        </button>
        {saveStatus && (
          <p className="mt-2 text-center text-xs font-medium text-emerald-600">
            {saveStatus}
          </p>
        )}
      </div>

      {/* Export buttons */}
      <div className="bv2-export-zone mt-6">
        <p className="section-kicker mb-3">Export</p>
        <button
          type="button"
          className="bv2-export-btn neo-button-secondary w-full justify-center"
          onClick={onExportXlsx}
        >
          <FileSpreadsheet size={15} />
          Download Excel (XLSX)
        </button>
        <button
          type="button"
          className="bv2-export-btn neo-button-secondary w-full justify-center"
          onClick={onExportPdf}
        >
          <Download size={15} />
          Download PDF
        </button>
      </div>

      {/* Navigation */}
      <div className="bv2-nav-zone">
        <Link
          href="/dashboard"
          className="neo-button-secondary w-full justify-center"
        >
          <LayoutDashboard size={15} />
          Ringkasan
        </Link>
        {prevHref && (
          <Link href={prevHref} className="neo-button-secondary w-full justify-center">
            <ArrowLeft size={15} />
            Kembali
          </Link>
        )}
        {nextHref && (
          <Link href={nextHref} className="neo-button-primary w-full justify-center">
            Lanjut
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </aside>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function BudgetPlannerV2Form({
  rawBudgetPlan,
  vendorCategories,
  coupleNames,
  prevHref,
  nextHref,
}: {
  rawBudgetPlan: string;
  vendorCategories: VendorChecklistCategory[];
  coupleNames?: string;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Build initial state
  const [budgetState, setBudgetState] = useState<BudgetV2State>(() =>
    buildBudgetV2State(rawBudgetPlan, vendorCategories),
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const toggleStage = useCallback((label: TimelineStageLabel) => {
    setBudgetState((prev) => {
      const stages = prev.stages.map((s) =>
        s.stageLabel === label ? { ...s, enabled: !s.enabled } : s,
      );
      return { ...prev, stages };
    });
  }, []);

  const updateItem = useCallback(
    (stageLabel: TimelineStageLabel, itemId: string, patch: Partial<BudgetV2LineItem>) => {
      setBudgetState((prev) => {
        const stages = prev.stages.map((s) => {
          if (s.stageLabel !== stageLabel) return s;
          // Handle remove flag
          if ((patch as any)._remove) {
            return { ...s, items: s.items.filter((i) => i.id !== itemId) };
          }
          // Handle add new item (patch has all fields)
          const exists = s.items.some((i) => i.id === itemId);
          if (!exists) {
            return {
              ...s,
              items: [...s.items, patch as BudgetV2LineItem],
            };
          }
          // Update existing
          return {
            ...s,
            items: s.items.map((i) =>
              i.id === itemId ? { ...i, ...patch } : i,
            ),
          };
        });
        return { ...prev, stages };
      });
    },
    [],
  );

  const updateVendorItem = useCallback(
    (itemId: string, patch: Partial<BudgetV2LineItem>) => {
      setBudgetState((prev) => ({
        ...prev,
        vendorItems: prev.vendorItems.map((i) =>
          i.id === itemId ? { ...i, ...patch } : i,
        ),
      }));
    },
    [],
  );

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    startTransition(async () => {
      setSaveStatus(null);
      try {
        const res = await fetch("/api/planner/budget", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(budgetState),
        });

        const result = await res.json();
        setSaveStatus(result.message);
        if (result.ok) {
          router.refresh();
        }
      } catch (err: any) {
        setSaveStatus(err.message || "Gagal menyimpan data.");
      }
    });
  }, [budgetState, router]);

  // ─── Export XLSX ────────────────────────────────────────────────────────────

  const handleExportXlsx = useCallback(() => {
    exportBudgetToExcel(budgetState, coupleNames);
  }, [budgetState, coupleNames]);

  // ─── Export PDF ─────────────────────────────────────────────────────────────

  const handleExportPdf = useCallback(() => {
    exportBudgetToPdf(budgetState, coupleNames);
  }, [budgetState, coupleNames]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getStageFilledCount = (stage: StageBudgetV2) =>
    stage.items.filter((i) => i.nominal != null && i.nominal > 0).length;

  const totals = calcBudgetV2Totals(budgetState);

  const hasVendors = budgetState.vendorItems.length > 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bv2-page-shell">
      {/* ── Page header */}
      <header className="bv2-page-header neo-panel p-5 sm:p-6">
        <div className="bv2-header-top">
          <div className="min-w-0">
            <p className="section-kicker">Langkah 5 – Anggaran</p>
            <h1 className="bv2-page-title">
              Susun anggaran per tahap acara
            </h1>
            <p className="bv2-page-desc">
              Pilih tahap acara yang akan diadakan, isi estimasi biaya per pos, dan lihat total anggaran secara real-time. Vendor dari Langkah 3 otomatis tersinkron.
            </p>
          </div>
          <div className="bv2-header-actions">
            {totals.grandTotal > 0 && (
              <div className="bv2-total-badge">
                <TrendingUp size={14} />
                <span>{fmtRupiah(totals.grandTotal)}</span>
              </div>
            )}
            <button
              type="button"
              className="neo-button-primary responsive-action"
              onClick={handleSave}
              disabled={isPending}
            >
              <Save size={15} />
              {isPending ? "Menyimpan..." : "Simpan anggaran"}
            </button>
          </div>
        </div>

        {/* Vendor sync notice */}
        {hasVendors && (
          <div className="bv2-vendor-notice neo-panel-inset mt-4 p-4">
            <div className="flex items-start gap-3">
              <PackageCheck size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {budgetState.vendorItems.length} paket vendor terdeteksi dari Langkah 3
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Vendor dengan nama yang sama di beberapa kategori akan digabung menjadi satu baris "all-in". Isi nominalnya di panel anggaran setiap tahap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Budget range */}
        <div className="mt-5">
          <p className="section-kicker mb-3">Rentang budget keseluruhan</p>
          <BudgetRangeSelector
            value={budgetState.budgetRange}
            onChange={(val) =>
              setBudgetState((prev) => ({ ...prev, budgetRange: val }))
            }
          />
        </div>
      </header>

      {/* ── Main canvas */}
      <div className="bv2-canvas">
        {/* ── Stage picker */}
        <section className="bv2-stage-picker-section neo-panel p-5 sm:p-6">
          <div className="bv2-picker-header">
            <div>
              <p className="section-kicker">Tahap acara</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-slate-800">
                Pilih tahap yang diadakan
              </h2>
            </div>
            <p className="bv2-picker-hint">
              Aktifkan setiap tahap yang akan dilangsungkan. Klik kartunya untuk mengisi anggaran.
            </p>
          </div>

          <div className="bv2-stage-grid mt-5">
            {timelineStageLabels.map((label) => {
              const stage = budgetState.stages.find(
                (s) => s.stageLabel === label,
              )!;
              return (
                <StageCard
                  key={label}
                  stageLabel={label}
                  isEnabled={stage.enabled}
                  filledCount={getStageFilledCount(stage)}
                  total={stage.items.length}
                  onToggle={() => toggleStage(label)}
                />
              );
            })}
          </div>
        </section>

        {/* ── Budget panel + Sidebar */}
        <div className="bv2-bottom-grid">
          {/* Main budget panel */}
          <main className="bv2-main-panel flex flex-col gap-8">
            {budgetState.stages.filter((s) => s.enabled).length > 0 ? (
              budgetState.stages
                .filter((s) => s.enabled)
                .map((activeStageData) => (
                  <div key={activeStageData.stageLabel} className="neo-panel p-5 sm:p-6 bv2-stage-section">
                    <div className="bv2-panel-header flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TimelineStageIcon
                          label={activeStageData.stageLabel}
                          state="current"
                          className="bv2-panel-stage-icon"
                        />
                        <div>
                          <p className="section-kicker">Anggaran tahap</p>
                          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-slate-800">
                            {activeStageData.stageLabel}
                          </h2>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right">
                         <button
                           type="button"
                           onClick={handleSave}
                           disabled={isPending}
                           className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                         >
                           {isPending ? "Menyimpan..." : "Simpan per tahap"}
                         </button>
                      </div>
                    </div>

                    <div className="bv2-item-table-header mt-5">
                      <span className="bv2-col-label">Pos anggaran</span>
                      <span className="bv2-col-nominal">Jumlah (Rp)</span>
                      <span className="bv2-col-actions">&nbsp;</span>
                    </div>

                    <StageBudgetPanel
                      stage={activeStageData}
                      vendorItems={budgetState.vendorItems}
                      onItemChange={(itemId, patch) =>
                        updateItem(activeStageData.stageLabel, itemId, patch)
                      }
                      onVendorItemChange={(itemId, patch) =>
                        updateVendorItem(itemId, patch)
                      }
                    />
                    
                    {/* Visual separator for next stage if any */}
                  </div>
                ))
            ) : (
              <div className="neo-panel p-5 sm:p-6 bv2-empty-state">
                <div className="bv2-empty-icon">
                  <Wallet size={32} />
                </div>
                <h2 className="bv2-empty-title">
                  Aktifkan tahap acara terlebih dahulu
                </h2>
                <p className="bv2-empty-desc">
                  Klik kartunya untuk mengaktifkan tahap asuransi, lalu opsi anggaran akan muncul di sini.
                </p>
              </div>
            )}
          </main>

          {/* Sidebar summary */}
          <div className="self-start sticky top-6">
            <SummaryPanel
              state={budgetState}
              coupleNames={coupleNames}
              onExportXlsx={handleExportXlsx}
              onExportPdf={handleExportPdf}
              onSave={handleSave}
              isPending={isPending}
              saveStatus={saveStatus}
              prevHref={prevHref}
              nextHref={nextHref}
            />
          </div>
        </div>
      </div>

      {/* ── Print view (hidden, shown on print) */}
      <div className="bv2-print-view" aria-hidden="true">
        <h1 className="bv2-print-title">
          Rencana Anggaran Pernikahan
          {coupleNames ? ` – ${coupleNames}` : ""}
        </h1>
        {budgetState.budgetRange && (
          <p className="bv2-print-range">
            Rentang budget: {budgetState.budgetRange}
          </p>
        )}
        {budgetState.vendorItems.length > 0 && (
          <div className="bv2-print-section">
            <h2>Paket Vendor (Sinkron dari Langkah 3)</h2>
            <table className="bv2-print-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Paket</th>
                  <th>Jumlah (Rp)</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {budgetState.vendorItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.vendorName}</td>
                    <td>{item.label}</td>
                    <td>{item.nominal != null ? fmtRupiah(item.nominal) : "–"}</td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {budgetState.stages
          .filter((s) => s.enabled)
          .map((stage) => (
            <div key={stage.stageLabel} className="bv2-print-section">
              <h2>{stage.stageLabel}</h2>
              <table className="bv2-print-table">
                <thead>
                  <tr>
                    <th>Pos Anggaran</th>
                    <th>Jumlah (Rp)</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {stage.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.label}</td>
                      <td>
                        {item.nominal != null ? fmtRupiah(item.nominal) : "–"}
                      </td>
                      <td>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>Subtotal</strong>
                    </td>
                    <td>
                      <strong>
                        {fmtRupiah(
                          stage.items.reduce(
                            (s, i) => s + (i.nominal ?? 0),
                            0,
                          ),
                        )}
                      </strong>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        <div className="bv2-print-grand-total">
          <strong>TOTAL ESTIMASI:</strong>{" "}
          {fmtRupiah(totals.grandTotal)}
        </div>
      </div>
    </div>
  );
}
