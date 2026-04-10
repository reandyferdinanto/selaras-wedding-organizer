"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LayoutDashboard, Plus, Save, Trash2, Download, FileSpreadsheet, Check } from "lucide-react";
import { exportVendorToExcel, exportVendorToPdf } from "@/lib/export-utils";

// ─── Mobile wizard steps ──────────────────────────────────────────────────────
const FORM_STEPS = [
  { id: "info",      label: "Informasi",  shortLabel: "Info",    icon: "A" },
  { id: "checklist", label: "Rekonsiliasi", shortLabel: "Paket",  icon: "B" },
  { id: "tambahan",  label: "Tambahan",   shortLabel: "Tambahan", icon: "C" },
] as const;
type FormStepId = (typeof FORM_STEPS)[number]["id"];


import { serializeVendorModule, type VendorModule } from "@/lib/planner-modules";
import {
  buildVendorPlannerState,
  getVendorChecklistStats,
  serializeVendorPlannerState,
  type ItemStatus,
  type VendorChecklistCategory,
  type VendorPlannerState,
} from "@/lib/vendor-guide";

// ─── Yup schema ──────────────────────────────────────────────────────────────

const vendorSchema = Yup.object({
  vendorLamaranName: Yup.string().default("").ensure(),
  vendorLamaranNote: Yup.string().default("").ensure(),
  vendorAkadResepsiName: Yup.string().default("").ensure(),
  vendorAkadResepsiNote: Yup.string().default("").ensure(),
  categories: Yup.array().of(
    Yup.object({
      id: Yup.string().required(),
      title: Yup.string().required(),
      description: Yup.string().default("").ensure(),
      vendorName: Yup.string().default("").ensure(),
      isCustom: Yup.boolean().default(false),
      items: Yup.array().of(
        Yup.object({
          label: Yup.string().required(),
          status: Yup.string().oneOf(["include", "exclude", "tbd"]).required(),
          note: Yup.string().default("").ensure(),
        }),
      ).min(1),
    }),
  ).min(1),
});

// ─── Single-color SVG icons ───────────────────────────────────────────────────

function IconVenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconDecor() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function IconBrush() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L3 14.67V21h6.33l10.06-10.06a5.5 5.5 0 0 0 0-7.77z" />
      <line x1="15.5" y1="8.5" x2="17" y2="7" />
      <path d="M3.5 17.5C2 19 2 21 2 21s2 0 3.5-1.5" />
    </svg>
  );
}
function IconDress() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 7l-5 1 3 3-1 5 5-2 5 2-1-5 3-3-5-1z" />
      <path d="M9 13l-1 6h8l-1-6" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function IconMusic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function IconGift() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "catering-venue": <IconVenue />,
  "dekorasi-rental": <IconDecor />,
  "foto-video": <IconCamera />,
  "mua-grooming": <IconBrush />,
  "busana": <IconDress />,
  "wo-koordinasi": <IconClipboard />,
  "mc-hiburan": <IconMusic />,
  "pelengkap": <IconGift />,
};

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ItemStatus, { label: string; class: string; shortLabel: string }> = {
  include: { label: "Termasuk paket", shortLabel: "Termasuk", class: "vsi-include" },
  exclude: { label: "Tidak termasuk", shortLabel: "Tidak termasuk", class: "vsi-exclude" },
  tbd: { label: "Belum dikonfirmasi", shortLabel: "Belum konfirmasi", class: "vsi-tbd" },
};

const VENDOR_GROUP_STEPS = [
  {
    key: "Lamaran",
    title: "Grup Lamaran",
    helper: "Cek vendor dan komponen untuk lamaran atau pertunangan.",
  },
  {
    key: "Akad & Resepsi",
    title: "Grup Akad & Resepsi",
    helper: "Lanjutkan ke vendor untuk akad, resepsi, dan kebutuhan hari utama.",
  },
] as const;

type VendorGroupKey = (typeof VENDOR_GROUP_STEPS)[number]["key"];

// ─── Status toggle button ─────────────────────────────────────────────────────

function StatusToggle({
  status,
  onChange,
}: {
  status: ItemStatus;
  onChange: (next: ItemStatus) => void;
}) {
  const cycle: ItemStatus[] = ["tbd", "include", "exclude"];
  const next = cycle[(cycle.indexOf(status) + 1) % cycle.length];
  const cfg = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      className={["vsi-toggle", cfg.class].join(" ")}
      onClick={() => onChange(next)}
      title={`Klik untuk ubah: saat ini "${cfg.label}"`}
    >
      <span className="vsi-toggle-dot" />
      <span className="vsi-toggle-label">{cfg.shortLabel}</span>
    </button>
  );
}

// ─── Vendor checklist card ────────────────────────────────────────────────────

function VendorChecklistCard({
  category,
  index,
  onStatusChange,
  onItemNoteChange,
  onImageUpload,
  onVendorNameChange,
  onAddItem,
  onRemoveItem,
  onRemove,
}: {
  category: VendorChecklistCategory;
  index: number;
  onStatusChange: (ci: number, ii: number, status: ItemStatus) => void;
  onItemNoteChange: (ci: number, ii: number, note: string) => void;
  onImageUpload: (ci: number, ii: number, base64: string | undefined) => void;
  onVendorNameChange: (ci: number, name: string) => void;
  onAddItem: (ci: number, label: string) => void;
  onRemoveItem: (ci: number, ii: number) => void;
  onRemove?: (ci: number) => void;
}) {
  const [newItemLabel, setNewItemLabel] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [activeNoteIds, setActiveNoteIds] = useState<Set<number>>(new Set());

  const toggleNote = (ii: number) => {
    setActiveNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(ii)) next.delete(ii);
      else next.add(ii);
      return next;
    });
  };

  const included = category.items.filter((i) => i.status === "include").length;
  const excluded = category.items.filter((i) => i.status === "exclude").length;
  const tbd = category.items.filter((i) => i.status === "tbd").length;
  const allConfirmed = tbd === 0;
  const icon = CATEGORY_ICONS[category.id] ?? <IconGift />;

  function commitNewItem() {
    const label = newItemLabel.trim();
    if (!label) return;
    onAddItem(index, label);
    setNewItemLabel("");
    setShowAddInput(false);
  }

  return (
    <section className={["vscard", allConfirmed ? "is-confirmed" : ""].join(" ")}>
      {/* Card header */}
      <div className="vscard-header">
        <div className="vscard-icon">{icon}</div>
        <div className="vscard-title-block">
          <div className="vscard-title-row">
            <h3 className="vscard-title">{category.title}</h3>
            {category.isCustom && <span className="vs-badge vs-badge-custom">Tambahan</span>}
            {allConfirmed
              ? <span className="vs-badge vs-badge-confirmed">✓ Terkonfirmasi</span>
              : <span className="vs-badge vs-badge-pending">{tbd} belum dikonfirmasi</span>
            }
          </div>
          <p className="vscard-desc">{category.description}</p>
        </div>
        {category.isCustom && onRemove && (
          <button type="button" className="vscard-remove" onClick={() => onRemove(index)} title="Hapus kategori">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Vendor name */}
      <div className="vscard-vendor-row">
        <label className="vscard-vendor-label" htmlFor={`vendor-name-${category.id}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Vendor yang ditunjuk
        </label>
        <input
          id={`vendor-name-${category.id}`}
          className="vscard-vendor-input neo-input"
          placeholder="Nama vendor atau belum ditentukan"
          value={category.vendorName}
          onChange={(e) => onVendorNameChange(index, e.target.value)}
        />
      </div>

      {/* Stats strip */}
      <div className="vscard-stats">
        <div className="vscard-stat is-include">
          <span className="vscard-stat-num">{included}</span>
          <span className="vscard-stat-lbl">Termasuk</span>
        </div>
        <div className="vscard-stat is-exclude">
          <span className="vscard-stat-num">{excluded}</span>
          <span className="vscard-stat-lbl">Tidak termasuk</span>
        </div>
        <div className="vscard-stat is-tbd">
          <span className="vscard-stat-num">{tbd}</span>
          <span className="vscard-stat-lbl">Belum konfirmasi</span>
        </div>
      </div>

      {/* Item list */}
      <div className="vscard-items">
        <div className="vscard-item-header">
          <span className="vscard-item-header-label">Komponen paket ({category.items.length})</span>
          <span className="vscard-item-header-action">Status (klik untuk ubah)</span>
        </div>

        {category.items.map((item, ii) => (
          <div key={`${category.id}-${ii}`} className={["vscard-item", `is-${item.status}`].join(" ")}>
            <div className="vscard-item-main">
              <span className="vscard-item-label">{item.label}</span>
              <div className="vscard-item-actions">
                <StatusToggle status={item.status} onChange={(next) => onStatusChange(index, ii, next)} />
                {item.status !== "tbd" && item.note.length === 0 && !activeNoteIds.has(ii) && (
                  <button
                    type="button"
                    className="vscard-item-addnote"
                    title="Tambah catatan"
                    onClick={() => toggleNote(ii)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                )}
                <label className="vscard-item-addnote cursor-pointer" title="Upload foto referensi (max 2MB)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <input type="file" accept="image/*" className="hidden" aria-hidden="true" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = document.createElement("img");
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const maxDim = 800;
                        let width = img.width;
                        let height = img.height;
                        if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; }
                        else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                        canvas.width = width; canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0, width, height);
                        onImageUpload(index, ii, canvas.toDataURL("image/jpeg", 0.7));
                      };
                      if (typeof ev.target?.result === "string") img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
                <button
                  type="button"
                  className="vscard-item-remove"
                  title="Hapus komponen ini"
                  onClick={() => onRemoveItem(index, ii)}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            {/* Per-item note — shown when not tbd AND (has note OR is actively opened) */}
            {item.status !== "tbd" && (item.note.length > 0 || activeNoteIds.has(ii)) && (
              <div className="mt-1">
                <input
                  className="vscard-item-note neo-input"
                  placeholder={item.status === "include"
                    ? "Catatan paket: detail, syarat, atau informasi dari vendor"
                    : "Catatan: siapa yang menangani, perlu dianggarkan, atau ditugaskan ke siapa"}
                  value={item.note}
                  onChange={(e) => onItemNoteChange(index, ii, e.target.value)}
                  autoFocus={item.note.length === 0}
                />
              </div>
            )}
            {item.imageUrl && (
              <div className="vscard-image-preview group">
                <img src={item.imageUrl} alt="Referensi" className="vscard-image-thumb" />
                <button
                  type="button"
                  className="vscard-image-remove"
                  onClick={() => onImageUpload(index, ii, undefined)}
                  title="Hapus gambar"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* ── Inline add item ── */}
        {showAddInput ? (
          <div className="vscard-add-row">
            <input
              autoFocus
              className="vscard-add-input neo-input"
              placeholder="Nama komponen baru…"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitNewItem(); }
                if (e.key === "Escape") { setNewItemLabel(""); setShowAddInput(false); }
              }}
            />
            <button
              type="button"
              className="vscard-add-confirm"
              onClick={commitNewItem}
              disabled={!newItemLabel.trim()}
            >
              Tambah
            </button>
            <button
              type="button"
              className="vscard-add-cancel"
              onClick={() => { setNewItemLabel(""); setShowAddInput(false); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="vscard-add-trigger"
            onClick={() => setShowAddInput(true)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah komponen
          </button>
        )}
      </div>

    </section>
  );
}

// ─── Summary output panel ─────────────────────────────────────────────────────

function SummaryOutputPanel({
  categories,
}: {
  categories: VendorChecklistCategory[];
}) {
  const [previewImage, setPreviewImage] = useState<{url: string, alt: string} | null>(null);

  const excludedItems = categories.flatMap((cat) =>
    cat.items
      .filter((i) => i.status === "exclude")
      .map((i) => ({ cat: cat.title, vendor: cat.vendorName, label: i.label, note: i.note, imageUrl: i.imageUrl })),
  );
  const tbdItems = categories.flatMap((cat) =>
    cat.items
      .filter((i) => i.status === "tbd")
      .map((i) => ({ cat: cat.title, label: i.label })),
  );
  const includedGroups = categories
    .filter((cat) => cat.items.some((i) => i.status === "include"))
    .map((cat) => ({
      cat: cat.title,
      vendor: cat.vendorName,
      items: cat.items.filter((i) => i.status === "include"),
    }));

  return (
    <div className="vsout">
      {/* Family checklist: item yang termasuk paket */}
      <div className="vsout-section">
        <div className="vsout-section-head">
          <div className="vsout-section-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className="vsout-section-title">Checklist keluarga</p>
            <p className="vsout-section-sub">Komponen yang sudah termasuk paket dari vendor</p>
          </div>
        </div>
        {includedGroups.length === 0 ? (
          <p className="vsout-empty">Centang &ldquo;Termasuk paket&rdquo; pada item di sebelah kiri.</p>
        ) : (
          <div className="vsout-list">
            {includedGroups.map((group) => (
              <div key={group.cat} className="vsout-group">
                <div className="vsout-group-head">
                  <p className="vsout-group-cat">{group.cat}</p>
                  {group.vendor && <span className="vsout-vendor-tag">{group.vendor}</span>}
                </div>
                {group.items.map((item) => (
                  <div key={item.label} className="vsout-item is-include">
                    <span className="vsout-item-dot" />
                    <div>
                      <p className="vsout-item-label">{item.label}</p>
                      {item.note && <p className="vsout-item-note">{item.note}</p>}
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.label} 
                          className="mt-2 h-16 w-auto object-cover rounded shadow-sm border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => setPreviewImage({ url: item.imageUrl!, alt: item.label })}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coordinator tasks: item yang TIDAK termasuk */}
      <div className="vsout-section">
        <div className="vsout-section-head">
          <div className="vsout-section-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <p className="vsout-section-title">Tugas koordinator</p>
            <p className="vsout-section-sub">Komponen yang perlu ditangani sendiri / dianggarkan</p>
          </div>
        </div>
        {excludedItems.length === 0 ? (
          <p className="vsout-empty">Item yang tidak termasuk paket akan muncul di sini.</p>
        ) : (
          <div className="vsout-list">
            {excludedItems.map((item, i) => (
              <div key={i} className="vsout-item is-exclude">
                <span className="vsout-item-dot" />
                <div>
                  <p className="vsout-item-label">{item.label}</p>
                  <p className="vsout-item-cat">{item.cat}</p>
                  {item.note && <p className="vsout-item-note">{item.note}</p>}
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.label} 
                      className="mt-2 h-16 w-auto object-cover rounded shadow-sm border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => setPreviewImage({ url: item.imageUrl!, alt: item.label })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TBD: masih perlu dikonfirmasi */}
      {tbdItems.length > 0 && (
        <div className="vsout-section">
          <div className="vsout-section-head">
            <div className="vsout-section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="vsout-section-title">Perlu dikonfirmasi</p>
              <p className="vsout-section-sub">{tbdItems.length} item belum dikonfirmasi ke vendor</p>
            </div>
          </div>
          <div className="vsout-list">
            {tbdItems.map((item, i) => (
              <div key={i} className="vsout-item is-tbd">
                <span className="vsout-item-dot" />
                <div>
                  <p className="vsout-item-label">{item.label}</p>
                  <p className="vsout-item-cat">{item.cat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage.url} 
              alt={previewImage.alt} 
              className="max-w-full max-h-[85vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
            <button 
              type="button"
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white text-slate-900 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
              onClick={() => setPreviewImage(null)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile step timeline ─────────────────────────────────────────────────────

function MobileStepTimeline({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
}: {
  steps: typeof FORM_STEPS;
  activeStep: FormStepId;
  completedSteps: Set<FormStepId>;
  onStepClick: (id: FormStepId) => void;
}) {
  return (
    <div className="vs-mobile-timeline" role="tablist" aria-label="Langkah pengisian vendor">
      {steps.map((step, idx) => {
        const isActive = step.id === activeStep;
        const isDone = completedSteps.has(step.id);
        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`vs-step-panel-${step.id}`}
            className={[
              "vs-mstep",
              isActive ? "is-active" : "",
              isDone ? "is-done" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onStepClick(step.id)}
          >
            <span className="vs-mstep-circle">
              {isDone && !isActive ? <Check size={11} strokeWidth={3} /> : step.icon}
            </span>
            <span className="vs-mstep-label">{step.shortLabel}</span>
            {idx < steps.length - 1 && <span className="vs-mstep-line" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function VendorModuleForm({
  values,
  coupleNames,
  prevHref,
  nextHref,
}: {
  values: VendorModule;
  coupleNames?: string;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeVendorGroup, setActiveVendorGroup] = useState<VendorGroupKey>("Lamaran");
  const [mobileStep, setMobileStep] = useState<FormStepId>("info");
  const [completedSteps, setCompletedSteps] = useState<Set<FormStepId>>(new Set());

  const goToStep = useCallback((id: FormStepId) => {
    setMobileStep((prev) => {
      setCompletedSteps((s) => { const n = new Set(s); n.add(prev); return n; });
      return id;
    });
  }, []);


  const formik = useFormik<VendorPlannerState & { customCategoryTitle: string; customCategoryItems: string }>({
    enableReinitialize: true,
    initialValues: {
      ...buildVendorPlannerState(values),
      customCategoryTitle: "",
      customCategoryItems: "",
    },
    validationSchema: vendorSchema,
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        try {
          const payload = serializeVendorPlannerState({
            vendorLamaranName: currentValues.vendorLamaranName,
            vendorLamaranNote: currentValues.vendorLamaranNote,
            vendorAkadResepsiName: currentValues.vendorAkadResepsiName,
            vendorAkadResepsiNote: currentValues.vendorAkadResepsiNote,
            categories: currentValues.categories,
          });
          // Kirim vendorPlan sebagai JSON object agar mudah di-debug di Network tab
          const res = await fetch("/api/planner/vendor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendorPlan: payload }),
          });

          const result = await res.json();
          helpers.setStatus(result.message);
          if (result.ok) router.refresh();
        } catch (err: any) {
          helpers.setStatus(err.message || "Gagal menyimpan data vendor.");
        }
      });
    },
  });

  const stats = getVendorChecklistStats(formik.values.categories);
  const activeGroupIndex = VENDOR_GROUP_STEPS.findIndex((step) => step.key === activeVendorGroup);
  const activeGroupStep = VENDOR_GROUP_STEPS[activeGroupIndex] ?? VENDOR_GROUP_STEPS[0];
  const activeGroupCategories = formik.values.categories.filter((category) => category.group === activeVendorGroup);
  const activeGroupTotalItems = activeGroupCategories.reduce((sum, category) => sum + category.items.length, 0);
  const activeGroupConfirmedItems = activeGroupCategories.reduce(
    (sum, category) => sum + category.items.filter((item) => item.status !== "tbd").length,
    0,
  );
  const coreFilledCount = [formik.values.vendorLamaranName, formik.values.vendorAkadResepsiName]
    .filter((v) => v?.trim().length > 0).length;

  const handleExportXlsx = useCallback(() => {
    exportVendorToExcel(formik.values, coupleNames);
  }, [formik.values, coupleNames]);

  const handleExportPdf = useCallback(() => {
    exportVendorToPdf(formik.values, coupleNames);
  }, [formik.values, coupleNames]);

  return (
    <div className="dashboard-detail-grid">
      {/* ─── MAIN PANEL ─── */}
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">

        {/* Hero */}
        <div className="vendor-v2-hero">
          <div className="vendor-v2-hero-text">
            <p className="section-kicker">Langkah 3 · Vendor</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl" style={{ color: "var(--text-strong)" }}>
              Rekonsiliasi paket vendor
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7" style={{ color: "var(--text-soft)" }}>
              Tandai setiap komponen sebagai <strong style={{ color: "var(--text-strong)" }}>termasuk paket</strong>, <strong style={{ color: "var(--text-strong)" }}>tidak termasuk</strong>, atau <strong style={{ color: "var(--text-strong)" }}>belum dikonfirmasi</strong>.
              Hasilnya otomatis menjadi checklist keluarga, tugas koordinator, dan dasar perhitungan budget.
            </p>

            {/* Legend – hide on mobile to save space */}
            <div className="vs-legend mt-4 hidden md:grid">
              <div className="vs-legend-item">
                <span className="vs-legend-dot is-include" />
                <span>Termasuk paket → Keluarga tahu, vendor tangani</span>
              </div>
              <div className="vs-legend-item">
                <span className="vs-legend-dot is-exclude" />
                <span>Tidak termasuk → Perlu ditangani / dianggarkan</span>
              </div>
              <div className="vs-legend-item">
                <span className="vs-legend-dot is-tbd" />
                <span>Belum konfirmasi → Masih perlu tanya ke vendor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/tablet: step timeline */}
        <div className="vs-mobile-timeline-wrap">
          <MobileStepTimeline
            steps={FORM_STEPS}
            activeStep={mobileStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Top bar – global stats summary (compact on mobile) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="vs-global-stat is-include">{stats.included} termasuk</span>
            <span className="vs-global-stat is-exclude">{stats.excluded} tidak termasuk</span>
            <span className="vs-global-stat is-tbd">{stats.tbdItems} belum konfirmasi</span>
          </div>
          <Link href="/dashboard" className="neo-button-secondary responsive-action whitespace-nowrap hidden md:inline-flex">
            <LayoutDashboard size={16} />
            Ringkasan
          </Link>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-5 space-y-6">

          {/* ── A: Context notes ── */}
          <div className={mobileStep !== "info" ? "vs-step-hidden" : ""} id="vs-step-panel-info" role="tabpanel">
            <div className="vendor-v2-section-header">
              <div className="vendor-v2-section-pill vs-step-pill-active">A</div>
              <div>
                <h2 className="vendor-v2-section-title">Informasi vendor utama</h2>
                <p className="vendor-v2-section-sub">Isi data kontak vendor terlebih dahulu, lalu lanjutkan cek kelengkapan paket per grup.</p>
              </div>
            </div>

            {/* Unified context card */}
            <div className="vs-ctx-card neo-panel-inset">

              {/* Group 1: Lamaran */}
              <div className="vs-ctx-field">
                <div className="vs-ctx-field-meta">
                  <div className="vs-ctx-field-num">1</div>
                  <div className="vs-ctx-field-info">
                    <label className="vs-ctx-label" htmlFor="vendorLamaranName">Vendor lamaran</label>
                    <p className="vs-ctx-hint">Nama vendor, paket, atau keterangan jika kebutuhan lamaran ditangani sendiri.</p>
                  </div>
                </div>
                <div className="vs-ctx-field-input vs-vendor-info-grid">
                  <input
                    id="vendorLamaranName" name="vendorLamaranName"
                    className="neo-input"
                    placeholder="Nama vendor / paket lamaran"
                    value={formik.values.vendorLamaranName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <textarea
                    id="vendorLamaranNote" name="vendorLamaranNote"
                    className="neo-input neo-scrollbar resize-none"
                    style={{ minHeight: "7.5rem" }}
                    placeholder={"Alamat office:\nTelp office:\nPIC vendor:\nCatatan paket / termin:"}
                    value={formik.values.vendorLamaranNote}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <div className="vs-ctx-divider" />

              {/* Group 2: Akad & Resepsi */}
              <div className="vs-ctx-field vs-ctx-field-last">
                <div className="vs-ctx-field-meta">
                  <div className="vs-ctx-field-num">2</div>
                  <div className="vs-ctx-field-info">
                    <label className="vs-ctx-label" htmlFor="vendorAkadResepsiName">Vendor akad & resepsi</label>
                    <p className="vs-ctx-hint">Isi vendor all-in atau ringkasan vendor utama untuk acara hari-H.</p>
                  </div>
                </div>
                <div className="vs-ctx-field-input vs-vendor-info-grid">
                  <input
                    id="vendorAkadResepsiName" name="vendorAkadResepsiName"
                    className="neo-input"
                    placeholder="Nama vendor / paket akad & resepsi"
                    value={formik.values.vendorAkadResepsiName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <textarea
                    id="vendorAkadResepsiNote" name="vendorAkadResepsiNote"
                    className="neo-input neo-scrollbar resize-none"
                    style={{ minHeight: "7.5rem" }}
                    placeholder={"Alamat office:\nTelp office:\nPIC vendor:\nCatatan paket / termin:"}
                    value={formik.values.vendorAkadResepsiNote}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

            </div>

            {/* Mobile: Next step button */}
            <div className="vs-step-nav-bottom">
              <button
                type="button"
                className="neo-button-primary w-full justify-center"
                onClick={() => goToStep("checklist")}
              >
                Lanjut ke Rekonsiliasi Paket
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* ── B: Checklist per kategori ── */}
          <div className={mobileStep !== "checklist" ? "vs-step-hidden" : ""} id="vs-step-panel-checklist" role="tabpanel">
            <div className="vendor-v2-section-header">
              <div className="vendor-v2-section-pill">B</div>
              <div className="flex-1 min-w-0">
                <h2 className="vendor-v2-section-title">Rekonsiliasi komponen paket</h2>
                <p className="vendor-v2-section-sub">Klik tombol status pada setiap item. Isi catatan jika ada informasi penting dari vendor.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="neo-panel-inset px-3 py-2 text-center">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-soft)" }}>Terkonfirmasi</p>
                  <p className="mt-1 text-base font-bold" style={{ color: "var(--text-strong)" }}>{stats.confirmed}<span style={{ color: "var(--text-soft)", fontWeight: 400 }}>/{stats.totalItems}</span></p>
                </div>
              </div>
            </div>

            <div className="vs-group-flow mt-4">
              <div className="vs-group-stepper" aria-label="Urutan grup vendor">
                {VENDOR_GROUP_STEPS.map((step, index) => {
                  const isActive = step.key === activeVendorGroup;
                  const isDone = index < activeGroupIndex;

                  return (
                    <button
                      key={step.key}
                      type="button"
                      className={["vs-group-step", isActive ? "is-active" : "", isDone ? "is-done" : ""].filter(Boolean).join(" ")}
                      onClick={() => setActiveVendorGroup(step.key)}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span className="vs-group-step-number">{index + 1}</span>
                      <span className="vs-group-step-copy">
                        <span className="vs-group-step-title">{step.title}</span>
                        <span className="vs-group-step-helper">{step.helper}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="vs-group-current">
                <div>
                  <p className="section-kicker">Sedang diedit</p>
                  <h3 className="vs-group-current-title">{activeGroupStep.title}</h3>
                  <p className="vs-group-current-copy">{activeGroupStep.helper}</p>
                </div>
                <div className="vs-group-current-stat">
                  <span>{activeGroupConfirmedItems}</span>
                  <small>/{activeGroupTotalItems} terkonfirmasi</small>
                </div>
              </div>

              <div className="vs-card-list">
              {activeGroupCategories.map((category) => {
                const ci = formik.values.categories.findIndex(c => c.id === category.id);
                return (
                  <VendorChecklistCard
                    key={category.id}
                    category={category}
                    index={ci}
                    onStatusChange={(ci, ii, status) => {
                      formik.setFieldValue(`categories.${ci}.items.${ii}.status`, status);
                    }}
                    onItemNoteChange={(ci, ii, note) => {
                      formik.setFieldValue(`categories.${ci}.items.${ii}.note`, note);
                    }}
                    onImageUpload={(ci, ii, base64) => {
                      formik.setFieldValue(`categories.${ci}.items.${ii}.imageUrl`, base64);
                    }}
                    onVendorNameChange={(ci, name) => {
                      formik.setFieldValue(`categories.${ci}.vendorName`, name);
                    }}
                    onAddItem={(ci, label) => {
                      const newItems = [...formik.values.categories[ci].items, { label, status: "tbd" as const, note: "" }];
                      formik.setFieldValue(`categories.${ci}.items`, newItems);
                    }}
                    onRemoveItem={(ci, ii) => {
                      const newItems = formik.values.categories[ci].items.filter((_, idx) => idx !== ii);
                      formik.setFieldValue(`categories.${ci}.items`, newItems);
                    }}
                    onRemove={category.isCustom ? (ci) => {
                      const newCats = formik.values.categories.filter((_, idx) => idx !== ci);
                      formik.setFieldValue("categories", newCats);
                    } : undefined}
                  />
                )
              })}
              </div>

              <div className="vs-group-pager">
                <button
                  type="button"
                  className="neo-button-secondary"
                  onClick={() => setActiveVendorGroup("Lamaran")}
                  disabled={activeVendorGroup === "Lamaran"}
                >
                  <ArrowLeft size={15} />
                  Grup sebelumnya
                </button>
                <button
                  type="button"
                  className="neo-button-primary"
                  onClick={() => setActiveVendorGroup("Akad & Resepsi")}
                  disabled={activeVendorGroup === "Akad & Resepsi"}
                >
                  Grup berikutnya
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Mobile: step navigation buttons */}
            <div className="vs-step-nav-bottom">
              <button
                type="button"
                className="neo-button-secondary flex-1 justify-center"
                onClick={() => goToStep("info")}
              >
                <ArrowLeft size={15} />
                Kembali ke Info
              </button>
              <button
                type="button"
                className="neo-button-primary flex-1 justify-center"
                onClick={() => goToStep("tambahan")}
              >
                Lanjut ke Tambahan
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* ── C + D: Tambah kategori & Catatan umum ── */}
          <div className={mobileStep !== "tambahan" ? "vs-step-hidden" : ""} id="vs-step-panel-tambahan" role="tabpanel">
            <div className="vendor-v2-section-header">
              <div className="vendor-v2-section-pill">C</div>
              <div className="flex-1">
                <h2 className="vendor-v2-section-title">Tambahan &amp; catatan</h2>
                <p className="vendor-v2-section-sub">Tambah kategori vendor khusus dan tulis catatan umum yang belum tercakup di atas.</p>
              </div>
              {stats.customCategories > 0 && (
                <span className="vs-badge vs-badge-custom flex-shrink-0">{stats.customCategories} kategori tambahan</span>
              )}
            </div>

            <div className="vs-ctx-card neo-panel-inset">

              {/* Row 1: Nama kategori */}
              <div className="vs-ctx-field">
                <div className="vs-ctx-field-meta">
                  <div className="vs-ctx-field-num">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <div className="vs-ctx-field-info">
                    <label className="vs-ctx-label" htmlFor="customCategoryTitle">Nama kategori baru</label>
                    <p className="vs-ctx-hint">Vendor adat, ibadah, after-party, atau keperluan khusus lainnya.</p>
                  </div>
                </div>
                <div className="vs-ctx-field-input">
                  <input
                    id="customCategoryTitle" name="customCategoryTitle"
                    className="neo-input"
                    placeholder="Contoh: Kebutuhan adat keluarga"
                    value={formik.values.customCategoryTitle}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <div className="vs-ctx-divider" />

              {/* Row 2: Daftar komponen */}
              <div className="vs-ctx-field">
                <div className="vs-ctx-field-meta">
                  <div className="vs-ctx-field-num">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </div>
                  <div className="vs-ctx-field-info">
                    <label className="vs-ctx-label" htmlFor="customCategoryItems">Daftar komponen</label>
                    <p className="vs-ctx-hint">Tulis satu komponen per baris. Semua item akan otomatis berstatus &ldquo;belum dikonfirmasi&rdquo;.</p>
                  </div>
                </div>
                <div className="vs-ctx-field-input">
                  <textarea
                    id="customCategoryItems" name="customCategoryItems"
                    className="neo-input neo-scrollbar resize-none"
                    style={{ minHeight: "5rem" }}
                    placeholder={"Busana adat keluarga inti\nPerlengkapan ritual\nPembawa acara adat"}
                    value={formik.values.customCategoryItems}
                    onChange={formik.handleChange}
                  />
                  <div className="vs-ctx-add-action">
                    <button
                      type="button"
                      className="neo-button-secondary responsive-action"
                      onClick={() => {
                        const title = formik.values.customCategoryTitle.trim();
                        const items = formik.values.customCategoryItems
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((label) => ({ label, status: "tbd" as ItemStatus, note: "" }));

                        if (!title || items.length === 0) {
                          formik.setStatus("Isi nama kategori dan minimal satu komponen.");
                          return;
                        }

                        formik.setFieldValue("categories", [
                          ...formik.values.categories,
                          {
                            id: `custom-${Date.now()}`,
                            title,
                            description: "Kategori tambahan.",
                            vendorName: "",
                            isCustom: true,
                            items,
                          },
                        ]);
                        formik.setFieldValue("customCategoryTitle", "");
                        formik.setFieldValue("customCategoryItems", "");
                        formik.setStatus("Kategori ditambahkan. Jangan lupa simpan.");
                      }}
                    >
                      <Plus size={15} />
                      Tambah kategori
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Mobile: back + save nav */}
            <div className="vs-step-nav-bottom">
              <button
                type="button"
                className="neo-button-secondary flex-1 justify-center"
                onClick={() => goToStep("checklist")}
              >
                <ArrowLeft size={15} />
                Kembali
              </button>
              <button type="submit" className="neo-button-primary flex-1 justify-center" disabled={isPending}>
                <Save size={16} />
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>

          {/* Desktop save button */}
          <div className="editor-actions hidden md:flex">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan rekonsiliasi"}
            </button>
          </div>
          {formik.status ? <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>{String(formik.status)}</p> : null}

        </form>
      </article>

      {/* ─── SIDE PANEL ─── */}
      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Output otomatis</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: "var(--text-strong)" }}>
            Ringkasan rekonsiliasi
          </h2>
          <p className="mt-3 text-sm leading-7" style={{ color: "var(--text-soft)" }}>
            Panel ini menghasilkan tiga daftar otomatis dari status yang Anda pilih — untuk keluarga, koordinator, dan konfirmasi ulang ke vendor.
          </p>
        </div>

        {/* Global stats */}
        <div className="vs-side-stats mt-5">
          <div className="neo-panel-inset p-3 text-center">
            <p className="text-xs font-semibold" style={{ color: "var(--text-soft)" }}>Termasuk paket</p>
            <p className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-strong)" }}>{stats.included}</p>
          </div>
          <div className="neo-panel-inset p-3 text-center">
            <p className="text-xs font-semibold" style={{ color: "var(--text-soft)" }}>Tidak termasuk</p>
            <p className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-strong)" }}>{stats.excluded}</p>
          </div>
          <div className="neo-panel-inset p-3 text-center">
            <p className="text-xs font-semibold" style={{ color: "var(--text-soft)" }}>Belum konfirmasi</p>
            <p className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-strong)" }}>{stats.tbdItems}</p>
          </div>
        </div>

        {/* Catatan inti preview */}
        <div className="mt-5 space-y-3">
          <div className="neo-panel-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Grup Lamaran</p>
            <p className="mt-2 text-sm leading-7 whitespace-pre-line" style={{ color: "var(--text-strong)" }}>{formik.values.vendorLamaranName || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Grup Akad & Resepsi</p>
            <p className="mt-2 text-sm leading-7 whitespace-pre-line" style={{ color: "var(--text-strong)" }}>{formik.values.vendorAkadResepsiName || "Belum diisi"}</p>
          </div>
        </div>

        {/* Auto-generated output */}
        <div className="mt-5">
          <SummaryOutputPanel categories={formik.values.categories} />
        </div>

        {/* Export Zone */}
        <div className="mt-6">
          <p className="section-kicker mb-3">Export</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="neo-button-secondary w-full justify-center"
              onClick={handleExportXlsx}
            >
              <FileSpreadsheet size={15} />
              Download Excel (XLSX)
            </button>
            <button
              type="button"
              className="neo-button-secondary w-full justify-center"
              onClick={handleExportPdf}
            >
              <Download size={15} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/dashboard" className="neo-button-secondary w-full justify-center">
            <LayoutDashboard size={16} />
            Ringkasan
          </Link>
          {prevHref ? (
            <Link href={prevHref} className="neo-button-secondary w-full justify-center">
              <ArrowLeft size={16} />
              Kembali
            </Link>
          ) : <div className="hidden md:block" />}
          {nextHref ? (
            <Link href={nextHref} className="neo-button-primary w-full justify-center">
              Lanjut
              <ArrowRight size={16} />
            </Link>
          ) : <div className="hidden md:block" />}
        </div>
      </article>
    </div>
  );
}
