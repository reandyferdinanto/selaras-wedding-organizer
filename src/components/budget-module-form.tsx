"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LayoutDashboard, Plus, Save, Trash2 } from "lucide-react";

import { SelectField } from "@/components/select-field";
import { savePlannerNotesAction } from "@/lib/supabase/actions";
import { serializeBudgetModule, type BudgetModule } from "@/lib/planner-modules";
import {
  buildBudgetPlannerState,
  getBudgetChecklistStats,
  serializeBudgetPlannerState,
  type BudgetBucketCategory,
  type BudgetPlannerState,
} from "@/lib/budget-guide";

const budgetRangeOptions = [
  { label: "Di bawah Rp100 juta", value: "Di bawah Rp100 juta" },
  { label: "Rp100 juta - Rp150 juta", value: "Rp100 juta - Rp150 juta" },
  { label: "Rp150 juta - Rp250 juta", value: "Rp150 juta - Rp250 juta" },
  { label: "Rp250 juta - Rp400 juta", value: "Rp250 juta - Rp400 juta" },
  { label: "Di atas Rp400 juta", value: "Di atas Rp400 juta" },
];

const budgetSchema = Yup.object({
  budgetRange: Yup.string().required("Rentang budget wajib dipilih."),
  biggestExpense: Yup.string().min(8, "Tulis prioritas biaya minimal 8 karakter.").required("Prioritas biaya wajib diisi."),
  paymentStrategy: Yup.string().min(8, "Tulis strategi pembayaran minimal 8 karakter.").required("Strategi pembayaran wajib diisi."),
  reserveFund: Yup.string().min(8, "Tulis dana cadangan minimal 8 karakter.").required("Dana cadangan wajib diisi."),
  budgetControl: Yup.string().min(8, "Tulis kontrol anggaran minimal 8 karakter.").required("Kontrol anggaran wajib diisi."),
  categories: Yup.array().of(
    Yup.object({
      id: Yup.string().required(),
      title: Yup.string().required(),
      description: Yup.string().default("").ensure(),
      note: Yup.string().default("").ensure(),
      isCustom: Yup.boolean().default(false),
      items: Yup.array().of(
        Yup.object({
          label: Yup.string().required(),
          checked: Yup.boolean().required(),
        }),
      ).min(1),
    }),
  ).min(1),
});

function BudgetChecklistCard({
  category,
  index,
  onToggle,
  onNoteChange,
  onRemove,
}: {
  category: BudgetBucketCategory;
  index: number;
  onToggle: (categoryIndex: number, itemIndex: number, checked: boolean) => void;
  onNoteChange: (categoryIndex: number, nextNote: string) => void;
  onRemove?: (categoryIndex: number) => void;
}) {
  const checkedCount = category.items.filter((item) => item.checked).length;
  const isComplete = category.items.length > 0 && checkedCount === category.items.length;

  return (
    <section className={["neo-panel-inset", "budget-category-card", isComplete ? "is-complete" : "is-pending", "p-4", "sm:p-5"].join(" ")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="budget-category-title">{category.title}</h3>
            <span className={["budget-category-chip", isComplete ? "is-complete" : "is-pending"].join(" ")}>
              {checkedCount}/{category.items.length} terpetakan
            </span>
            {category.isCustom ? <span className="budget-category-chip is-custom">Tambahan</span> : null}
          </div>
          <p className="budget-category-description">{category.description}</p>
        </div>
        {category.isCustom && onRemove ? (
          <button type="button" className="neo-button-secondary budget-remove-button" onClick={() => onRemove(index)}>
            <Trash2 size={15} />
            Hapus
          </button>
        ) : null}
      </div>

      <div className="budget-checklist-grid mt-4">
        {category.items.map((item, itemIndex) => (
          <label key={`${category.id}-${item.label}`} className={["budget-check-item", item.checked ? "is-checked" : "is-unchecked"].join(" ")}>
            <input
              type="checkbox"
              className="budget-check-input"
              checked={item.checked}
              onChange={(event) => onToggle(index, itemIndex, event.target.checked)}
            />
            <span className={["budget-check-visual", item.checked ? "is-checked" : "is-unchecked"].join(" ")} aria-hidden="true">
              <span className="budget-check-mark" />
            </span>
            <span className="budget-check-label">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="neo-label !mb-2" htmlFor={`budget-note-${category.id}`}>Catatan pos</label>
        <textarea
          id={`budget-note-${category.id}`}
          className="neo-input neo-scrollbar budget-category-note resize-none"
          placeholder="Tulis catatan singkat, misalnya pos ini termasuk prioritas utama, masih bisa fleksibel, atau perlu konfirmasi keluarga dulu."
          value={category.note}
          onChange={(event) => onNoteChange(index, event.target.value)}
        />
      </div>
    </section>
  );
}

export function BudgetModuleForm({ values, notes, prevHref, nextHref }: { values: BudgetModule; notes?: any; prevHref?: string; nextHref?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formik = useFormik<BudgetPlannerState & { customCategoryTitle: string; customCategoryItems: string }>({
    enableReinitialize: true,
    initialValues: {
      ...buildBudgetPlannerState(values, notes),
      customCategoryTitle: "",
      customCategoryItems: "",
    },
    validationSchema: budgetSchema,
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        const payload = serializeBudgetPlannerState({
          budgetRange: currentValues.budgetRange,
          biggestExpense: currentValues.biggestExpense,
          paymentStrategy: currentValues.paymentStrategy,
          reserveFund: currentValues.reserveFund,
          budgetControl: currentValues.budgetControl,
          categories: currentValues.categories,
        });
        const result = await savePlannerNotesAction(serializeBudgetModule(payload));
        helpers.setStatus(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
    },
  });

  const stats = getBudgetChecklistStats(formik.values.categories);
  const requiredFilledCount = [formik.values.budgetRange, formik.values.biggestExpense, formik.values.paymentStrategy, formik.values.reserveFund, formik.values.budgetControl].filter((value) => value.trim().length > 0).length;

  return (
    <div className="dashboard-detail-grid">
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Kontrol anggaran</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">Susun arah anggaran tanpa tenggelam di angka</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Halaman ini membantu Anda memetakan pos utama, melihat area biaya terbesar, mengatur strategi pembayaran, dan menyiapkan dana cadangan. Fokusnya tetap pada kontrol dan prioritas, bukan rincian nominal per vendor.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="dashboard-status-chip is-sedang-disusun">{requiredFilledCount}/5 bagian inti terisi</span>
            <Link href="/dashboard" className="neo-button-secondary responsive-action whitespace-nowrap">
              <LayoutDashboard size={16} />
              Kembali ke ringkasan
            </Link>
          </div>
        </div>

        <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
          <p className="text-sm font-semibold text-slate-700">Di langkah ini kita hanya mengatur arah dan kontrol anggaran, bukan angka detail per vendor.</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Dengan begitu pasangan dan keluarga bisa lebih mudah menyamakan prioritas sebelum nantinya masuk ke rincian nominal atau pelunasan yang lebih teknis.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
          <div className="budget-top-grid">
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="budgetRange">Rentang budget</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="budget-field-hint">Pilih rentang kasar agar keputusan vendor dan skala acara tetap realistis sejak awal.</p>
              <div className="mt-4">
                <SelectField
                  id="budgetRange"
                  label=""
                  value={formik.values.budgetRange}
                  options={budgetRangeOptions}
                  onChange={(nextValue) => formik.setFieldValue("budgetRange", nextValue)}
                  error={formik.touched.budgetRange && typeof formik.errors.budgetRange === "string" ? formik.errors.budgetRange : undefined}
                  touched={Boolean(formik.touched.budgetRange)}
                />
              </div>
            </div>
            <div className="neo-panel-inset p-4 sm:p-5 budget-span-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="biggestExpense">Prioritas biaya terbesar</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="budget-field-hint">Tuliskan pos mana yang paling menentukan bentuk acara, misalnya venue, catering, dekorasi, atau dokumentasi.</p>
              <textarea
                id="biggestExpense"
                name="biggestExpense"
                className="neo-input neo-scrollbar budget-top-textarea mt-4 resize-none"
                placeholder="Contoh: Venue, catering, dan dekorasi menjadi pos terbesar karena sangat memengaruhi skala acara dan pengalaman tamu."
                value={formik.values.biggestExpense}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.biggestExpense && typeof formik.errors.biggestExpense === "string" ? <p className="neo-field-error">{formik.errors.biggestExpense}</p> : null}
            </div>
          </div>

          <div className="budget-section-shell">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Pos anggaran</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Checklist pos yang perlu dipetakan</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Centang pos yang sudah cukup jelas dalam perencanaan Anda. Tujuannya bukan memberi harga, tetapi memastikan area biaya penting sudah masuk radar dan tidak terlewat.</p>
              </div>
              <div className="budget-stat-strip">
                <div className="neo-panel-inset p-3">
                  <p className="text-sm font-semibold text-slate-500">Pos terpetakan</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{stats.checkedItems}/{stats.totalItems}</p>
                </div>
                <div className="neo-panel-inset p-3">
                  <p className="text-sm font-semibold text-slate-500">Kategori lengkap</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{stats.completedCategories}/{stats.totalCategories}</p>
                </div>
              </div>
            </div>

            <div className="budget-category-list mt-5">
              {formik.values.categories.map((category, index) => (
                <BudgetChecklistCard
                  key={category.id}
                  category={category}
                  index={index}
                  onToggle={(categoryIndex, itemIndex, checked) => formik.setFieldValue(`categories.${categoryIndex}.items.${itemIndex}.checked`, checked)}
                  onNoteChange={(categoryIndex, nextNote) => formik.setFieldValue(`categories.${categoryIndex}.note`, nextNote)}
                  onRemove={category.isCustom ? (categoryIndex) => formik.setFieldValue("categories", formik.values.categories.filter((_, idx) => idx !== categoryIndex)) : undefined}
                />
              ))}
            </div>
          </div>

          <div className="neo-panel-inset p-4 sm:p-5 budget-custom-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker">Kategori tambahan</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Tambahkan pos lain bila anggaran Anda punya pola khusus</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Gunakan bagian ini bila ada pos yang khas untuk keluarga atau model acara Anda, misalnya adat tertentu, kebutuhan luar kota, atau pelayanan khusus.</p>
              </div>
              <span className="dashboard-status-chip is-sedang-disusun">{stats.customCategories} kategori tambahan</span>
            </div>

            <div className="budget-custom-grid mt-5">
              <div>
                <label className="neo-label" htmlFor="customCategoryTitle">Nama kategori tambahan</label>
                <input
                  id="customCategoryTitle"
                  name="customCategoryTitle"
                  className="neo-input"
                  placeholder="Contoh: Kebutuhan adat keluarga"
                  value={formik.values.customCategoryTitle}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="budget-span-2">
                <label className="neo-label" htmlFor="customCategoryItems">Daftar pos tambahan</label>
                <textarea
                  id="customCategoryItems"
                  name="customCategoryItems"
                  className="neo-input neo-scrollbar budget-custom-textarea resize-none"
                  placeholder={"Tulis satu item per baris, misalnya:\nKebutuhan adat keluarga\nAkomodasi keluarga luar kota\nLayanan khusus tamu prioritas"}
                  value={formik.values.customCategoryItems}
                  onChange={formik.handleChange}
                />
              </div>
            </div>

            <div className="editor-actions mt-5">
              <button
                type="button"
                className="neo-button-secondary responsive-action"
                onClick={() => {
                  const title = formik.values.customCategoryTitle.trim();
                  const items = formik.values.customCategoryItems.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
                  if (!title || items.length === 0) {
                    formik.setStatus("Isi nama kategori dan minimal satu pos sebelum menambah kategori baru.");
                    return;
                  }

                  formik.setFieldValue("categories", [
                    ...formik.values.categories,
                    {
                      id: `custom-budget-${Date.now()}`,
                      title,
                      description: "Kategori tambahan ini dibuat agar kontrol anggaran tetap sesuai dengan kebutuhan acara dan keluarga.",
                      note: "",
                      isCustom: true,
                      items: items.map((item) => ({ label: item, checked: false })),
                    },
                  ]);
                  formik.setFieldValue("customCategoryTitle", "");
                  formik.setFieldValue("customCategoryItems", "");
                  formik.setStatus("Kategori anggaran tambahan ditambahkan. Simpan perubahan setelah selesai.");
                }}
              >
                <Plus size={16} />
                Tambah kategori
              </button>
            </div>
          </div>

          <div className="budget-bottom-grid">
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="paymentStrategy">Strategi pembayaran</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="budget-field-hint">Rangkum urutan DP, termin, dan pelunasan agar arus kas keluarga tetap aman menjelang hari acara.</p>
              <textarea
                id="paymentStrategy"
                name="paymentStrategy"
                className="neo-input neo-scrollbar budget-bottom-textarea mt-4 resize-none"
                placeholder="Contoh: Vendor utama dibayar bertahap sesuai milestone, supaya beban pembayaran tidak menumpuk mendekati hari H."
                value={formik.values.paymentStrategy}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.paymentStrategy && typeof formik.errors.paymentStrategy === "string" ? <p className="neo-field-error">{formik.errors.paymentStrategy}</p> : null}
            </div>
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="reserveFund">Dana cadangan</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="budget-field-hint">Tuliskan bagaimana Anda menyiapkan ruang cadangan untuk tamu tambahan atau perubahan teknis mendadak.</p>
              <textarea
                id="reserveFund"
                name="reserveFund"
                className="neo-input neo-scrollbar budget-bottom-textarea mt-4 resize-none"
                placeholder="Contoh: Sisihkan ruang cadangan agar perubahan kecil tidak mengganggu pos utama yang sudah diprioritaskan."
                value={formik.values.reserveFund}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.reserveFund && typeof formik.errors.reserveFund === "string" ? <p className="neo-field-error">{formik.errors.reserveFund}</p> : null}
            </div>
            <div className="neo-panel-inset p-4 sm:p-5 budget-span-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="budgetControl">Kontrol anggaran</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="budget-field-hint">Jelaskan siapa yang memantau perubahan biaya dan bagaimana keputusan tambahan dicatat agar semua pihak tetap sejalan.</p>
              <textarea
                id="budgetControl"
                name="budgetControl"
                className="neo-input neo-scrollbar budget-bottom-textarea mt-4 resize-none"
                placeholder="Contoh: Setiap perubahan kebutuhan dibahas berdua dan dicatat di satu ringkasan mingguan agar keluarga tidak kehilangan arah."
                value={formik.values.budgetControl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.budgetControl && typeof formik.errors.budgetControl === "string" ? <p className="neo-field-error">{formik.errors.budgetControl}</p> : null}
            </div>
          </div>

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan arah anggaran"}
            </button>
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Ringkasan anggaran</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Lihat arah kontrol budget secara cepat</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Panel ini membantu Anda mengecek area biaya terbesar, strategi pembayaran, dan pos mana yang sudah masuk perhatian tanpa harus melihat nominal rinci.</p>
        </div>

        <div className="dashboard-info-note mt-4 neo-panel-inset p-4 budget-summary-stack">
          <div className="budget-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Pos terpetakan</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.checkedItems}/{stats.totalItems}</p>
          </div>
          <div className="budget-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.customCategories}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Rentang budget</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.budgetRange || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Prioritas biaya terbesar</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.biggestExpense || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Strategi pembayaran</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.paymentStrategy || "Belum diisi"}</p>
          </div>
        </div>

        <div className="budget-preview-list mt-6">
          {formik.values.categories.map((category) => {
            const checkedItems = category.items.filter((item) => item.checked);
            return (
              <div key={`budget-preview-${category.id}`} className="neo-panel-inset p-4 budget-preview-card">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                  <span className={["budget-category-chip", checkedItems.length === category.items.length && category.items.length > 0 ? "is-complete" : "is-pending"].join(" ")}>
                    {checkedItems.length}/{category.items.length}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada pos yang ditandai siap."}</p>
                {category.note ? <p className="mt-3 text-sm leading-7 text-slate-700">{category.note}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
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
