"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, LayoutDashboard, Plus, Save, Trash2 } from "lucide-react";

import { savePlannerNotesAction } from "@/lib/supabase/actions";
import { serializeDocumentModule, type DocumentModule } from "@/lib/planner-modules";
import {
  buildDocumentPlannerState,
  getDocumentChecklistStats,
  serializeDocumentPlannerState,
  type DocumentChecklistCategory,
  type DocumentPlannerState,
} from "@/lib/document-guide";

const documentSchema = Yup.object({
  legalChecklist: Yup.string().min(8, "Tulis checklist legal minimal 8 karakter.").required("Checklist legal wajib diisi."),
  familyDocuments: Yup.string().min(8, "Tulis dokumen keluarga minimal 8 karakter.").required("Dokumen keluarga wajib diisi."),
  vendorContracts: Yup.string().min(8, "Tulis arsip vendor minimal 8 karakter.").required("Arsip vendor wajib diisi."),
  paymentProofs: Yup.string().min(8, "Tulis bukti pembayaran minimal 8 karakter.").required("Bukti pembayaran wajib diisi."),
  finalArchive: Yup.string().min(8, "Tulis arsip akhir minimal 8 karakter.").required("Arsip akhir wajib diisi."),
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

function DocumentChecklistCard({ category, index, onToggle, onNoteChange, onRemove }: {
  category: DocumentChecklistCategory;
  index: number;
  onToggle: (categoryIndex: number, itemIndex: number, checked: boolean) => void;
  onNoteChange: (categoryIndex: number, nextNote: string) => void;
  onRemove?: (categoryIndex: number) => void;
}) {
  const checkedCount = category.items.filter((item) => item.checked).length;
  const isComplete = category.items.length > 0 && checkedCount === category.items.length;

  return (
    <section className={["neo-panel-inset", "document-category-card", isComplete ? "is-complete" : "is-pending", "p-4", "sm:p-5"].join(" ")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="document-category-title">{category.title}</h3>
            <span className={["document-category-chip", isComplete ? "is-complete" : "is-pending"].join(" ")}>
              {checkedCount}/{category.items.length} siap
            </span>
            {category.isCustom ? <span className="document-category-chip is-custom">Tambahan</span> : null}
          </div>
          <p className="document-category-description">{category.description}</p>
        </div>
        {category.isCustom && onRemove ? (
          <button type="button" className="neo-button-secondary document-remove-button" onClick={() => onRemove(index)}>
            <Trash2 size={15} />
            Hapus
          </button>
        ) : null}
      </div>

      <div className="document-checklist-grid mt-4">
        {category.items.map((item, itemIndex) => (
          <label key={`${category.id}-${item.label}`} className={["document-check-item", item.checked ? "is-checked" : "is-unchecked"].join(" ")}>
            <input
              type="checkbox"
              className="document-check-input"
              checked={item.checked}
              onChange={(event) => onToggle(index, itemIndex, event.target.checked)}
            />
            <span className={["document-check-visual", item.checked ? "is-checked" : "is-unchecked"].join(" ")} aria-hidden="true">
              <span className="document-check-mark" />
            </span>
            <span className="document-check-label">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="neo-label !mb-2" htmlFor={`document-note-${category.id}`}>Catatan kategori</label>
        <textarea
          id={`document-note-${category.id}`}
          className="neo-input neo-scrollbar document-category-note resize-none"
          placeholder="Tulis catatan singkat, misalnya siapa yang memegang berkas, apa yang masih kurang, atau folder mana yang harus dipakai bersama."
          value={category.note}
          onChange={(event) => onNoteChange(index, event.target.value)}
        />
      </div>
    </section>
  );
}

export function DocumentModuleForm({ values, prevHref }: { values: DocumentModule; prevHref?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formik = useFormik<DocumentPlannerState & { customCategoryTitle: string; customCategoryItems: string }>({
    enableReinitialize: true,
    initialValues: {
      ...buildDocumentPlannerState(values),
      customCategoryTitle: "",
      customCategoryItems: "",
    },
    validationSchema: documentSchema,
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        const payload = serializeDocumentPlannerState({
          legalChecklist: currentValues.legalChecklist,
          familyDocuments: currentValues.familyDocuments,
          vendorContracts: currentValues.vendorContracts,
          paymentProofs: currentValues.paymentProofs,
          finalArchive: currentValues.finalArchive,
          categories: currentValues.categories,
        });
        const result = await savePlannerNotesAction(serializeDocumentModule(payload));
        helpers.setStatus(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
    },
  });

  const stats = getDocumentChecklistStats(formik.values.categories);
  const requiredFilledCount = [formik.values.legalChecklist, formik.values.familyDocuments, formik.values.vendorContracts, formik.values.paymentProofs, formik.values.finalArchive].filter((value) => value.trim().length > 0).length;

  return (
    <div className="dashboard-detail-grid">
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Dokumen dan arsip</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">Rapi sejak sebelum hari acara sampai setelah selesai</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Halaman ini membantu Anda menyatukan dokumen legal, data keluarga, file vendor, bukti pembayaran, dan arsip akhir acara. Tujuannya agar semua pihak tahu apa yang sudah aman tersimpan dan apa yang masih perlu dilengkapi.</p>
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
          <p className="text-sm font-semibold text-slate-700">Anggap langkah ini sebagai pusat arsip acara, bukan hanya daftar dokumen.</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Dengan struktur yang rapi, pasangan, keluarga, dan vendor inti bisa lebih mudah menemukan file penting tanpa harus mencari lagi di banyak chat atau folder acak.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
          <div className="document-top-grid">
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="legalChecklist">Checklist legal</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="document-field-hint">Rangkum dokumen legal inti dan tenggat pengurusannya agar tidak tertunda menjelang hari acara.</p>
              <textarea id="legalChecklist" name="legalChecklist" className="neo-input neo-scrollbar document-top-textarea mt-4 resize-none" placeholder="Contoh: Berkas KUA, data identitas, dan dokumen tambahan lain dikumpulkan lebih awal agar tidak menumpuk mendekati hari H." value={formik.values.legalChecklist} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.legalChecklist && typeof formik.errors.legalChecklist === "string" ? <p className="neo-field-error">{formik.errors.legalChecklist}</p> : null}
            </div>
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="familyDocuments">Dokumen keluarga</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="document-field-hint">Tulis data atau berkas keluarga inti yang perlu tersedia untuk koordinasi acara dan administrasi.</p>
              <textarea id="familyDocuments" name="familyDocuments" className="neo-input neo-scrollbar document-top-textarea mt-4 resize-none" placeholder="Contoh: Kontak keluarga inti, susunan perwakilan keluarga, dan catatan kebutuhan keluarga utama disimpan di satu tempat." value={formik.values.familyDocuments} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.familyDocuments && typeof formik.errors.familyDocuments === "string" ? <p className="neo-field-error">{formik.errors.familyDocuments}</p> : null}
            </div>
          </div>

          <div className="document-section-shell">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Checklist arsip</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Pemetaan dokumen yang perlu aman tersimpan</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Centang bagian yang sudah jelas, lalu tulis catatan seperlunya. Dengan cara ini, semua dokumen penting bisa terlacak dari masa persiapan sampai setelah acara selesai.</p>
              </div>
              <div className="document-stat-strip">
                <div className="neo-panel-inset p-3">
                  <p className="text-sm font-semibold text-slate-500">Item siap</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{stats.checkedItems}/{stats.totalItems}</p>
                </div>
                <div className="neo-panel-inset p-3">
                  <p className="text-sm font-semibold text-slate-500">Kategori lengkap</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{stats.completedCategories}/{stats.totalCategories}</p>
                </div>
              </div>
            </div>

            <div className="document-category-list mt-5">
              {formik.values.categories.map((category, index) => (
                <DocumentChecklistCard
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

          <div className="neo-panel-inset p-4 sm:p-5 document-custom-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker">Kategori tambahan</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Tambahkan arsip lain bila acara Anda punya kebutuhan khusus</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Gunakan ini bila ada kategori dokumen lain seperti berkas adat, file perjalanan luar kota, atau arsip keluarga khusus yang perlu disimpan bersama.</p>
              </div>
              <span className="dashboard-status-chip is-sedang-disusun">{stats.customCategories} kategori tambahan</span>
            </div>

            <div className="document-custom-grid mt-5">
              <div>
                <label className="neo-label" htmlFor="customCategoryTitle">Nama kategori tambahan</label>
                <input id="customCategoryTitle" name="customCategoryTitle" className="neo-input" placeholder="Contoh: Arsip adat keluarga" value={formik.values.customCategoryTitle} onChange={formik.handleChange} />
              </div>
              <div className="document-span-2">
                <label className="neo-label" htmlFor="customCategoryItems">Daftar item tambahan</label>
                <textarea id="customCategoryItems" name="customCategoryItems" className="neo-input neo-scrollbar document-custom-textarea resize-none" placeholder={"Tulis satu item per baris, misalnya:\nBerkas adat keluarga\nDokumen perjalanan luar kota\nArsip khusus keluarga inti"} value={formik.values.customCategoryItems} onChange={formik.handleChange} />
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
                    formik.setStatus("Isi nama kategori dan minimal satu item sebelum menambah kategori baru.");
                    return;
                  }

                  formik.setFieldValue("categories", [
                    ...formik.values.categories,
                    {
                      id: `custom-document-${Date.now()}`,
                      title,
                      description: "Kategori tambahan ini dibuat agar arsip acara tetap cocok dengan kebutuhan keluarga dan jenis acara yang berbeda.",
                      note: "",
                      isCustom: true,
                      items: items.map((item) => ({ label: item, checked: false })),
                    },
                  ]);
                  formik.setFieldValue("customCategoryTitle", "");
                  formik.setFieldValue("customCategoryItems", "");
                  formik.setStatus("Kategori arsip tambahan ditambahkan. Simpan perubahan setelah selesai.");
                }}
              >
                <Plus size={16} />
                Tambah kategori
              </button>
            </div>
          </div>

          <div className="document-bottom-grid">
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="vendorContracts">Arsip vendor</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="document-field-hint">Catat bagaimana kontrak, revisi, dan file vendor utama disimpan agar mudah dicek kapan pun dibutuhkan.</p>
              <textarea id="vendorContracts" name="vendorContracts" className="neo-input neo-scrollbar document-bottom-textarea mt-4 resize-none" placeholder="Contoh: Semua kontrak dan revisi vendor disimpan di folder cloud bersama dan satu folder cetak untuk keluarga inti." value={formik.values.vendorContracts} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.vendorContracts && typeof formik.errors.vendorContracts === "string" ? <p className="neo-field-error">{formik.errors.vendorContracts}</p> : null}
            </div>
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="paymentProofs">Bukti pembayaran</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="document-field-hint">Tuliskan alur penyimpanan invoice, bukti transfer, dan pelunasan vendor agar tidak terpisah-pisah.</p>
              <textarea id="paymentProofs" name="paymentProofs" className="neo-input neo-scrollbar document-bottom-textarea mt-4 resize-none" placeholder="Contoh: Bukti pembayaran tiap vendor disimpan per folder dan diberi penanda termin agar mudah dicek saat pelunasan." value={formik.values.paymentProofs} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.paymentProofs && typeof formik.errors.paymentProofs === "string" ? <p className="neo-field-error">{formik.errors.paymentProofs}</p> : null}
            </div>
            <div className="neo-panel-inset p-4 sm:p-5 document-span-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="finalArchive">Arsip akhir acara</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="document-field-hint">Jelaskan bagaimana foto, video, file akhir, dan arsip penutup proyek akan disatukan setelah acara selesai.</p>
              <textarea id="finalArchive" name="finalArchive" className="neo-input neo-scrollbar document-bottom-textarea mt-4 resize-none" placeholder="Contoh: Semua file akhir dikumpulkan ke satu arsip proyek agar dokumentasi, invoice lunas, dan catatan akhir tetap mudah ditemukan setelah acara selesai." value={formik.values.finalArchive} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.finalArchive && typeof formik.errors.finalArchive === "string" ? <p className="neo-field-error">{formik.errors.finalArchive}</p> : null}
            </div>
          </div>

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan arsip dokumen"}
            </button>
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Ringkasan dokumen</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Lihat kesiapan arsip secara cepat</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Panel ini membantu Anda melihat kelompok arsip yang sudah aman, kategori tambahan, dan area dokumen mana yang masih perlu perhatian.</p>
        </div>

        <div className="dashboard-info-note mt-4 neo-panel-inset p-4 document-summary-stack">
          <div className="document-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Item siap</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.checkedItems}/{stats.totalItems}</p>
          </div>
          <div className="document-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.customCategories}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Checklist legal</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.legalChecklist || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Dokumen keluarga</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.familyDocuments || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Arsip vendor</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.vendorContracts || "Belum diisi"}</p>
          </div>
        </div>

        <div className="document-preview-list mt-6">
          {formik.values.categories.map((category) => {
            const checkedItems = category.items.filter((item) => item.checked);
            return (
              <div key={`document-preview-${category.id}`} className="neo-panel-inset p-4 document-preview-card">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                  <span className={["document-category-chip", checkedItems.length === category.items.length && category.items.length > 0 ? "is-complete" : "is-pending"].join(" ")}>
                    {checkedItems.length}/{category.items.length}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada item yang ditandai siap."}</p>
                {category.note ? <p className="mt-3 text-sm leading-7 text-slate-700">{category.note}</p> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
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
        </div>
      </article>
    </div>
  );
}
