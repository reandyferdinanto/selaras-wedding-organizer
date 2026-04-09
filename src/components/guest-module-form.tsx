"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LayoutDashboard, Plus, Save, Trash2 } from "lucide-react";

import { SelectField } from "@/components/select-field";
import { savePlannerNotesAction } from "@/lib/supabase/actions";
import { serializeGuestModule, type GuestModule } from "@/lib/planner-modules";
import {
  buildGuestPlannerState,
  getGuestChecklistStats,
  serializeGuestPlannerState,
  type GuestGroupCategory,
  type GuestPlannerState,
} from "@/lib/guest-guide";

const invitationOptions = [
  { label: "Undangan digital + WhatsApp", value: "Undangan digital + WhatsApp" },
  { label: "Undangan cetak + digital", value: "Undangan cetak + digital" },
  { label: "Keluarga menyampaikan langsung", value: "Keluarga menyampaikan langsung" },
  { label: "Undangan digital dengan PIC per keluarga", value: "Undangan digital dengan PIC per keluarga" },
];

const guestSchema = Yup.object({
  guestDirection: Yup.string().min(8, "Tulis arah pembagian tamu minimal 8 karakter.").required("Arah pembagian tamu wajib diisi."),
  invitationChannel: Yup.string().required("Saluran undangan wajib dipilih."),
  rsvpOwner: Yup.string().min(8, "Tulis PIC RSVP minimal 8 karakter.").required("PIC RSVP wajib diisi."),
  seatingNotes: Yup.string().min(8, "Tulis pengaturan keluarga minimal 8 karakter.").required("Pengaturan keluarga wajib diisi."),
  hospitalityNotes: Yup.string().min(8, "Tulis catatan layanan tamu minimal 8 karakter.").required("Catatan layanan tamu wajib diisi."),
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

function GuestChecklistCard({
  category,
  index,
  onToggle,
  onNoteChange,
  onRemove,
}: {
  category: GuestGroupCategory;
  index: number;
  onToggle: (categoryIndex: number, itemIndex: number, checked: boolean) => void;
  onNoteChange: (categoryIndex: number, nextNote: string) => void;
  onRemove?: (categoryIndex: number) => void;
}) {
  const checkedCount = category.items.filter((item) => item.checked).length;
  const isComplete = category.items.length > 0 && checkedCount === category.items.length;

  return (
    <section className={["neo-panel-inset", "guest-category-card", isComplete ? "is-complete" : "is-pending", "p-4", "sm:p-5"].join(" ")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="guest-category-title">{category.title}</h3>
            <span className={["guest-category-chip", isComplete ? "is-complete" : "is-pending"].join(" ")}>
              {checkedCount}/{category.items.length} siap
            </span>
            {category.isCustom ? <span className="guest-category-chip is-custom">Tambahan</span> : null}
          </div>
          <p className="guest-category-description">{category.description}</p>
        </div>
        {category.isCustom && onRemove ? (
          <button type="button" className="neo-button-secondary guest-remove-button" onClick={() => onRemove(index)}>
            <Trash2 size={15} />
            Hapus
          </button>
        ) : null}
      </div>

      <div className="guest-checklist-grid mt-4">
        {category.items.map((item, itemIndex) => (
          <label key={`${category.id}-${item.label}`} className={["guest-check-item", item.checked ? "is-checked" : "is-unchecked"].join(" ")}>
            <input
              type="checkbox"
              className="guest-check-input"
              checked={item.checked}
              onChange={(event) => onToggle(index, itemIndex, event.target.checked)}
            />
            <span className={["guest-check-visual", item.checked ? "is-checked" : "is-unchecked"].join(" ")} aria-hidden="true">
              <span className="guest-check-mark" />
            </span>
            <span className="guest-check-label">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="neo-label !mb-2" htmlFor={`guest-note-${category.id}`}>Catatan kelompok</label>
        <textarea
          id={`guest-note-${category.id}`}
          className="neo-input neo-scrollbar guest-category-note resize-none"
          placeholder="Tulis catatan singkat, misalnya siapa PIC keluarga, siapa yang perlu dihubungi lebih dulu, atau tamu penting yang perlu diperhatikan."
          value={category.note}
          onChange={(event) => onNoteChange(index, event.target.value)}
        />
      </div>
    </section>
  );
}

export function GuestModuleForm({
  values,
  prevHref,
  nextHref,
}: {
  values: GuestModule;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formik = useFormik<GuestPlannerState & { customCategoryTitle: string; customCategoryItems: string }>({
    enableReinitialize: true,
    initialValues: {
      ...buildGuestPlannerState(values),
      customCategoryTitle: "",
      customCategoryItems: "",
    },
    validationSchema: guestSchema,
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        const payload = serializeGuestPlannerState({
          guestDirection: currentValues.guestDirection,
          invitationChannel: currentValues.invitationChannel,
          rsvpOwner: currentValues.rsvpOwner,
          seatingNotes: currentValues.seatingNotes,
          hospitalityNotes: currentValues.hospitalityNotes,
          categories: currentValues.categories,
        });
        const result = await savePlannerNotesAction(serializeGuestModule(payload));
        helpers.setStatus(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
    },
  });

  const stats = getGuestChecklistStats(formik.values.categories);
  const requiredFilledCount = [formik.values.guestDirection, formik.values.invitationChannel, formik.values.rsvpOwner, formik.values.seatingNotes, formik.values.hospitalityNotes].filter((value) => value.trim().length > 0).length;

  return (
    <div className="dashboard-detail-grid">
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Daftar tamu dan RSVP</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">Susun tamu dengan alur yang lebih rapi</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Halaman ini membantu Anda membagi kelompok tamu, menentukan jalur undangan, menyiapkan PIC RSVP, dan mengatur kebutuhan keluarga inti serta hospitality tanpa harus mencatat semuanya secara acak.</p>
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
          <p className="text-sm font-semibold text-slate-700">Mulai dari struktur tamu dulu, lalu lanjut ke alur undangan dan layanan tamu.</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Dengan pola ini, pasangan dan keluarga bisa melihat siapa yang bertanggung jawab, siapa yang sudah dihubungi, dan area mana yang masih perlu perhatian.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
          <div className="guest-top-grid">
            <div className="neo-panel-inset p-4 sm:p-5 guest-span-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="guestDirection">Arah pembagian tamu</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="guest-field-hint">Tulis gambaran singkat cara Anda membagi daftar tamu, misalnya berdasarkan keluarga inti, keluarga besar, sahabat, dan kolega.</p>
              <textarea
                id="guestDirection"
                name="guestDirection"
                className="neo-input neo-scrollbar guest-top-textarea mt-4 resize-none"
                placeholder="Contoh: Daftar tamu dipisah antara keluarga inti, keluarga besar dua pihak, sahabat dekat, dan kolega supaya sebar undangan serta seating lebih mudah dikendalikan."
                value={formik.values.guestDirection}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.guestDirection && typeof formik.errors.guestDirection === "string" ? <p className="neo-field-error">{formik.errors.guestDirection}</p> : null}
            </div>

            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="invitationChannel">Saluran undangan</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="guest-field-hint">Pilih cara utama penyebaran undangan agar alur follow-up RSVP lebih konsisten.</p>
              <div className="mt-4">
                <SelectField
                  id="invitationChannel"
                  label=""
                  value={formik.values.invitationChannel}
                  options={invitationOptions}
                  onChange={(nextValue) => formik.setFieldValue("invitationChannel", nextValue)}
                  error={formik.touched.invitationChannel && typeof formik.errors.invitationChannel === "string" ? formik.errors.invitationChannel : undefined}
                  touched={Boolean(formik.touched.invitationChannel)}
                />
              </div>
            </div>

            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="rsvpOwner">PIC RSVP</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="guest-field-hint">Tulis siapa yang memegang rekap RSVP, baik dari pihak pasangan maupun keluarga.</p>
              <textarea
                id="rsvpOwner"
                name="rsvpOwner"
                className="neo-input neo-scrollbar guest-top-textarea mt-4 resize-none"
                placeholder="Contoh: RSVP dipegang oleh Dina dan satu PIC keluarga pria agar update jumlah tamu harian tetap rapi."
                value={formik.values.rsvpOwner}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.rsvpOwner && typeof formik.errors.rsvpOwner === "string" ? <p className="neo-field-error">{formik.errors.rsvpOwner}</p> : null}
            </div>
          </div>

          <div className="guest-section-shell">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Kelompok tamu</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Checklist kelompok tamu yang perlu disiapkan</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Centang bagian yang sudah jelas, lalu tulis catatan per kelompok bila perlu. Dengan cara ini, pembagian tamu tidak tercecer di berbagai chat atau catatan terpisah.</p>
              </div>
              <div className="guest-stat-strip">
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

            <div className="guest-category-list mt-5">
              {formik.values.categories.map((category, index) => (
                <GuestChecklistCard
                  key={category.id}
                  category={category}
                  index={index}
                  onToggle={(categoryIndex, itemIndex, checked) => {
                    formik.setFieldValue(`categories.${categoryIndex}.items.${itemIndex}.checked`, checked);
                  }}
                  onNoteChange={(categoryIndex, nextNote) => {
                    formik.setFieldValue(`categories.${categoryIndex}.note`, nextNote);
                  }}
                  onRemove={category.isCustom ? (categoryIndex) => {
                    formik.setFieldValue("categories", formik.values.categories.filter((_, idx) => idx !== categoryIndex));
                  } : undefined}
                />
              ))}
            </div>
          </div>

          <div className="neo-panel-inset p-4 sm:p-5 guest-custom-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-kicker">Kategori tambahan</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Tambahkan kelompok tamu lain bila perlu</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Gunakan ini bila pembagian tamu Anda tidak sama dengan pola umum, misalnya tamu adat, komunitas ibadah, atau relasi keluarga khusus.</p>
              </div>
              <span className="dashboard-status-chip is-sedang-disusun">{stats.customCategories} kategori tambahan</span>
            </div>

            <div className="guest-custom-grid mt-5">
              <div>
                <label className="neo-label" htmlFor="customCategoryTitle">Nama kelompok tambahan</label>
                <input
                  id="customCategoryTitle"
                  name="customCategoryTitle"
                  className="neo-input"
                  placeholder="Contoh: Tamu komunitas keluarga"
                  value={formik.values.customCategoryTitle}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="guest-span-2">
                <label className="neo-label" htmlFor="customCategoryItems">Daftar item kelompok</label>
                <textarea
                  id="customCategoryItems"
                  name="customCategoryItems"
                  className="neo-input neo-scrollbar guest-custom-textarea resize-none"
                  placeholder={"Tulis satu item per baris, misalnya:\nKeluarga mentor\nKomunitas ibadah\nRelasi keluarga dari orang tua"}
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
                    formik.setStatus("Isi nama kelompok dan minimal satu item sebelum menambah kategori baru.");
                    return;
                  }

                  formik.setFieldValue("categories", [
                    ...formik.values.categories,
                    {
                      id: `custom-guest-${Date.now()}`,
                      title,
                      description: "Kelompok tambahan ini dibuat agar pembagian tamu tetap fleksibel mengikuti kebutuhan acara.",
                      note: "",
                      isCustom: true,
                      items: items.map((item) => ({ label: item, checked: false })),
                    },
                  ]);
                  formik.setFieldValue("customCategoryTitle", "");
                  formik.setFieldValue("customCategoryItems", "");
                  formik.setStatus("Kelompok tamu tambahan ditambahkan. Simpan perubahan setelah selesai.");
                }}
              >
                <Plus size={16} />
                Tambah kelompok
              </button>
            </div>
          </div>

          <div className="guest-bottom-grid">
            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="seatingNotes">Pengaturan keluarga inti</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="guest-field-hint">Rangkum kebutuhan meja keluarga, tamu prioritas, dan area yang perlu diberi perhatian khusus.</p>
              <textarea
                id="seatingNotes"
                name="seatingNotes"
                className="neo-input neo-scrollbar guest-bottom-textarea mt-4 resize-none"
                placeholder="Contoh: Meja keluarga inti ditempatkan dekat panggung dengan jalur yang mudah untuk sesi foto dan salam keluarga."
                value={formik.values.seatingNotes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.seatingNotes && typeof formik.errors.seatingNotes === "string" ? <p className="neo-field-error">{formik.errors.seatingNotes}</p> : null}
            </div>

            <div className="neo-panel-inset p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label className="neo-label !mb-0" htmlFor="hospitalityNotes">Catatan layanan tamu</label>
                <span className="field-required-badge">Wajib</span>
              </div>
              <p className="guest-field-hint">Tulis kebutuhan penerima tamu, souvenir, tamu lansia, atau alur masuk agar pengalaman tamu lebih nyaman.</p>
              <textarea
                id="hospitalityNotes"
                name="hospitalityNotes"
                className="neo-input neo-scrollbar guest-bottom-textarea mt-4 resize-none"
                placeholder="Contoh: Siapkan dua penerima tamu utama, satu meja registrasi, dan pendamping untuk tamu lansia agar alur masuk tetap nyaman."
                value={formik.values.hospitalityNotes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.hospitalityNotes && typeof formik.errors.hospitalityNotes === "string" ? <p className="neo-field-error">{formik.errors.hospitalityNotes}</p> : null}
            </div>
          </div>

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan tamu dan RSVP"}
            </button>
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Ringkasan tamu</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Lihat kesiapan daftar tamu secara cepat</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Panel ini membantu Anda melihat arah pembagian tamu, jalur undangan, dan kelompok mana yang sudah cukup jelas untuk dilanjutkan.</p>
        </div>

        <div className="dashboard-info-note mt-4 neo-panel-inset p-4 guest-summary-stack">
          <div className="guest-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Item siap</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.checkedItems}/{stats.totalItems}</p>
          </div>
          <div className="guest-summary-metric">
            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">{stats.customCategories}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Arah pembagian tamu</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.guestDirection || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Saluran undangan</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.invitationChannel || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">PIC RSVP</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{formik.values.rsvpOwner || "Belum diisi"}</p>
          </div>
        </div>

        <div className="guest-preview-list mt-6">
          {formik.values.categories.map((category) => {
            const checkedItems = category.items.filter((item) => item.checked);
            return (
              <div key={`guest-preview-${category.id}`} className="neo-panel-inset p-4 guest-preview-card">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                  <span className={["guest-category-chip", checkedItems.length === category.items.length && category.items.length > 0 ? "is-complete" : "is-pending"].join(" ")}>
                    {checkedItems.length}/{category.items.length}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada item yang ditandai siap."}</p>
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
