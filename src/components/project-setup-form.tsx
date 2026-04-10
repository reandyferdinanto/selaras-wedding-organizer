"use client";

import { useSyncExternalStore, useTransition, useState, type ReactNode } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AlertCircle, CalendarDays, CheckCircle2, HeartHandshake, MapPin, Pencil, Sparkles, Users, WandSparkles } from "lucide-react";

import { DatePickerField } from "@/components/date-field-preview";
import { SelectField } from "@/components/select-field";
import type { ProjectSetupValues } from "@/lib/planner-data";
import { saveProjectSetupAction } from "@/lib/supabase/actions";

const templateOptions = [
  { label: "Internasional", value: "Internasional" },
  { label: "Jawa", value: "Jawa" },
  { label: "Sunda", value: "Sunda" },
  { label: "Minangkabau", value: "Minangkabau" },
  { label: "Betawi / Custom", value: "Betawi / Custom" },
];

const cityOptions = [
  { label: "Jakarta", value: "Jakarta" },
  { label: "Bandung", value: "Bandung" },
  { label: "Surabaya", value: "Surabaya" },
  { label: "Yogyakarta", value: "Yogyakarta" },
  { label: "Semarang", value: "Semarang" },
  { label: "Bali", value: "Bali" },
  { label: "Makassar", value: "Makassar" },
  { label: "Medan", value: "Medan" },
];

const guestOptions = [
  { label: "100 tamu", value: "100" },
  { label: "200 tamu", value: "200" },
  { label: "300 tamu", value: "300" },
  { label: "400 tamu", value: "400" },
  { label: "500 tamu", value: "500" },
  { label: "600 tamu", value: "600" },
  { label: "700 tamu", value: "700" },
  { label: "800 tamu", value: "800" },
  { label: "900 tamu", value: "900" },
  { label: "1000 tamu", value: "1000" },
];

const venueSuggestions = [
  "Ballroom hotel",
  "Gedung pertemuan",
  "Rumah keluarga",
  "Venue outdoor",
  "Restoran private",
  "Aula ibadah",
];

const projectSchema = Yup.object({
  brideName: Yup.string().min(2, "Nama minimal 2 karakter.").required("Nama mempelai wanita wajib diisi."),
  groomName: Yup.string().min(2, "Nama minimal 2 karakter.").required("Nama mempelai pria wajib diisi."),
  weddingDate: Yup.string().required("Tanggal pernikahan wajib dipilih."),
  city: Yup.string().required("Kota acara wajib diisi."),
  venue: Yup.string().min(3, "Venue minimal 3 karakter.").required("Venue atau lokasi acara wajib diisi."),
  guestCount: Yup.number().typeError("Isi dengan angka.").min(1, "Minimal 1 tamu.").required("Perkiraan tamu wajib diisi."),
  template: Yup.string().required("Template acara wajib dipilih."),
  concept: Yup.string().min(10, "Gambaran acara minimal 10 karakter.").required("Gambaran acara wajib diisi."),
});

const projectRequiredFields = [
  "brideName",
  "groomName",
  "weddingDate",
  "city",
  "venue",
  "guestCount",
  "template",
  "concept",
] as const;

const projectFieldLabels: Record<(typeof projectRequiredFields)[number], string> = {
  brideName: "Nama mempelai wanita",
  groomName: "Nama mempelai pria",
  weddingDate: "Tanggal pernikahan",
  city: "Kota acara",
  venue: "Venue atau lokasi acara",
  guestCount: "Perkiraan tamu",
  template: "Gaya acara",
  concept: "Gambaran singkat acara",
};

function fieldFilled(value: string) {
  return value.trim().length > 0;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <label className="neo-label !mb-0" htmlFor={htmlFor}>{children}</label>
      <span className="field-required-badge">Wajib</span>
    </div>
  );
}

function FormProgressPanel({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="form-progress-panel neo-panel-inset p-4" aria-label="Kemajuan pengisian form">
      <div className="form-progress-copy">
        <span className="dashboard-status-chip is-sedang-disusun">{completed}/{total} field wajib terisi</span>
        <div>
          <p className="form-progress-title">Mulai dari data inti, lalu cek ringkasan sebelum disimpan.</p>
          <p className="form-progress-text">Field yang sudah terisi langsung dihitung agar arah pengisian lebih jelas.</p>
        </div>
      </div>
      <div className="form-progress-track" aria-hidden="true">
        <span className="form-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="form-step-list">
        <li className={completed >= 3 ? "is-done" : "is-current"}>
          <CheckCircle2 size={15} />
          Data pasangan
        </li>
        <li className={completed >= 7 ? "is-done" : completed >= 3 ? "is-current" : ""}>
          <MapPin size={15} />
          Lokasi dan tamu
        </li>
        <li className={completed === total ? "is-done" : completed >= 7 ? "is-current" : ""}>
          <Sparkles size={15} />
          Konsep acara
        </li>
      </ol>
    </div>
  );
}

function FormErrorSummary({ errors }: { errors: Array<{ id: string; label: string; message: string }> }) {
  if (errors.length === 0) return null;

  return (
    <div className="form-error-summary" role="alert" aria-live="polite">
      <div className="form-error-summary-heading">
        <AlertCircle size={17} />
        <p>Lengkapi {errors.length} field sebelum menyimpan.</p>
      </div>
      <ul>
        {errors.map((error) => (
          <li key={error.id}>
            <a href={`#${error.id}`}>{error.label}: {error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="project-stage-section-heading">
      <span className="neo-icon shrink-0">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function ProjectSetupFormSkeleton() {
  return (
    <div className="dashboard-detail-grid dashboard-detail-grid-single" aria-hidden="true">
      <article className="neo-panel dashboard-detail-main project-stage-card p-5 sm:p-6">
        <div className="section-heading">
          <span className="neo-icon shrink-0">
            <WandSparkles size={18} />
          </span>
          <div>
            <p className="section-kicker">Langkah 1</p>
            <h2>Lengkapi data acara utama</h2>
          </div>
        </div>

        <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
          <p className="text-sm font-semibold text-slate-700">Menyiapkan form data acara...</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Tampilan form akan muncul sesaat lagi.</p>
        </div>

        <div className="project-stage-form-grid mt-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`neo-panel-inset p-4 ${index === 2 ? "project-stage-span-12" : "project-stage-span-6"}`}>
              <div className="skeleton-line w-32" />
              <div className="skeleton-input mt-4" />
            </div>
          ))}
          <div className="neo-panel-inset project-stage-span-12 p-4">
            <div className="skeleton-line w-40" />
            <div className="skeleton-area mt-4" />
          </div>
        </div>
      </article>
    </div>
  );
}

function hasSavedProjectData(values: ProjectSetupValues) {
  return Object.values(values).some((value) => String(value ?? "").trim().length > 0);
}

export function ProjectSetupForm({ initialValues }: { initialValues: ProjectSetupValues }) {
  const [isPending, startTransition] = useTransition();
  const isReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [isEditing, setIsEditing] = useState(!hasSavedProjectData(initialValues));

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: projectSchema,
    onSubmit(values, helpers) {
      startTransition(async () => {
        const result = await saveProjectSetupAction(values);
        helpers.setStatus(result.message);
        if (result.ok) {
          setIsEditing(false);
        }
      });
    },
  });

  const couple = [formik.values.brideName, formik.values.groomName].filter(Boolean).join(" & ") || "Nama pasangan belum diisi";
  const completedRequiredCount = projectRequiredFields.filter((field) => fieldFilled(String(formik.values[field] ?? ""))).length;
  const visibleErrors: Array<{ id: string; label: string; message: string }> = [];
  projectRequiredFields.forEach((field) => {
    const message = formik.errors[field];
    if (typeof message === "string") {
      visibleErrors.push({ id: field, label: projectFieldLabels[field], message });
    }
  });
  const showErrorSummary = formik.submitCount > 0 && visibleErrors.length > 0;

  if (!isReady) {
    return <ProjectSetupFormSkeleton />;
  }

  if (!isEditing) {
    return (
      <div className="dashboard-detail-grid dashboard-detail-grid-single">
        <article className="neo-panel dashboard-detail-main project-stage-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="section-heading">
              <span className="neo-icon shrink-0">
                <CalendarDays size={18} />
              </span>
              <div>
                <p className="section-kicker">Langkah 1</p>
                <h2>Ringkasan data acara utama</h2>
              </div>
            </div>
            <button type="button" className="neo-button-secondary responsive-action" onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              Edit
            </button>
          </div>

          <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-700">Data acara utama sudah tersimpan.</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">Periksa ringkasannya di bawah. Jika ada yang perlu diperbarui, klik tombol edit.</p>
          </div>

          <div className="project-stage-summary mt-6">
            <div className="neo-panel-inset p-4">
              <p className="text-sm font-semibold text-slate-500">Pasangan</p>
              <p className="mt-2 break-words text-xl font-semibold text-slate-800">{couple}</p>
            </div>
            <div className="project-stage-summary-grid">
              <div className="neo-panel-inset p-4">
                <div className="flex items-center gap-2 text-slate-500"><CalendarDays size={16} /><p className="text-sm font-semibold">Tanggal</p></div>
                <p className="mt-2 break-words text-base font-semibold text-slate-800">{formik.values.weddingDate || "Belum diisi"}</p>
              </div>
              <div className="neo-panel-inset p-4">
                <div className="flex items-center gap-2 text-slate-500"><MapPin size={16} /><p className="text-sm font-semibold">Kota</p></div>
                <p className="mt-2 break-words text-base font-semibold text-slate-800">{formik.values.city || "Belum diisi"}</p>
              </div>
              <div className="neo-panel-inset p-4">
                <div className="flex items-center gap-2 text-slate-500"><Users size={16} /><p className="text-sm font-semibold">Perkiraan tamu</p></div>
                <p className="mt-2 break-words text-base font-semibold text-slate-800">{formik.values.guestCount || "0"} orang</p>
              </div>
            </div>
            <div className="neo-panel-inset p-4">
              <div className="flex items-center gap-2 text-slate-500"><MapPin size={16} /><p className="text-sm font-semibold">Venue atau lokasi</p></div>
              <p className="mt-2 break-words text-base font-semibold text-slate-800">{formik.values.venue || "Belum diisi"}</p>
            </div>
            <div className="project-stage-summary-grid project-stage-summary-grid-2">
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Template acara</p>
                <p className="mt-2 break-words text-base font-semibold text-slate-800">{formik.values.template || "Belum diisi"}</p>
              </div>
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Arah konsep</p>
                <p className="mt-2 break-words text-sm leading-7 text-slate-700">{formik.values.concept || "Belum diisi"}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="dashboard-detail-grid dashboard-detail-grid-single">
      <article className="neo-panel dashboard-detail-main project-stage-card p-5 sm:p-6">
        <div className="section-heading">
          <span className="neo-icon shrink-0">
            <WandSparkles size={18} />
          </span>
          <div>
            <p className="section-kicker">Langkah 1</p>
            <h2>Lengkapi data acara utama</h2>
          </div>
        </div>

        <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
          <p className="text-sm font-semibold text-slate-700">Lengkapi semua field wajib sebagai dasar langkah berikutnya.</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Nama pasangan, tanggal, kota, venue, jumlah tamu, template acara, dan gambaran konsep akan dipakai oleh seluruh ringkasan dashboard.</p>
        </div>

        <div className="mt-5">
          <FormProgressPanel completed={completedRequiredCount} total={projectRequiredFields.length} />
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5" autoComplete="off">
          {showErrorSummary ? <FormErrorSummary errors={visibleErrors} /> : null}

          <section className="neo-panel-inset project-stage-section p-4 sm:p-5">
            <SectionHeader icon={<HeartHandshake size={18} />} title="Data pasangan" description="Isi nama kedua mempelai sebagai identitas utama acara." />
            <div className="project-stage-form-grid project-stage-section-grid mt-5">
              <div className="form-field-stack project-stage-span-6">
                <RequiredLabel htmlFor="brideName">Nama mempelai wanita</RequiredLabel>
                <input id="brideName" name="brideName" className="neo-input" value={formik.values.brideName} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Tulis nama mempelai wanita" autoComplete="given-name" aria-invalid={Boolean(formik.touched.brideName && formik.errors.brideName)} aria-describedby={formik.touched.brideName && formik.errors.brideName ? "brideName-error" : undefined} data-lpignore="true" />
                {formik.touched.brideName && formik.errors.brideName ? <p id="brideName-error" className="neo-field-error" role="alert">{formik.errors.brideName}</p> : null}
              </div>
              <div className="form-field-stack project-stage-span-6">
                <RequiredLabel htmlFor="groomName">Nama mempelai pria</RequiredLabel>
                <input id="groomName" name="groomName" className="neo-input" value={formik.values.groomName} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Tulis nama mempelai pria" autoComplete="given-name" aria-invalid={Boolean(formik.touched.groomName && formik.errors.groomName)} aria-describedby={formik.touched.groomName && formik.errors.groomName ? "groomName-error" : undefined} data-lpignore="true" />
                {formik.touched.groomName && formik.errors.groomName ? <p id="groomName-error" className="neo-field-error" role="alert">{formik.errors.groomName}</p> : null}
              </div>
              <div className="form-field-stack project-stage-span-12">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="neo-label !mb-0">Tanggal pernikahan</span>
                  <span className="field-required-badge">Wajib</span>
                </div>
                <DatePickerField id="weddingDate" label="" value={formik.values.weddingDate} onChange={(nextValue) => formik.setFieldValue("weddingDate", nextValue)} error={formik.errors.weddingDate} touched={formik.touched.weddingDate} />
              </div>
            </div>
          </section>

          <section className="neo-panel-inset project-stage-section p-4 sm:p-5">
            <SectionHeader icon={<MapPin size={18} />} title="Lokasi dan tamu" description="Tentukan kota, venue, dan perkiraan jumlah tamu agar langkah berikutnya lebih akurat." />
            <div className="project-stage-form-grid project-stage-section-grid mt-5">
              <div className="form-field-stack project-stage-span-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="neo-label !mb-0">Kota acara</span>
                  <span className="field-required-badge">Wajib</span>
                </div>
                <SelectField id="city" label="" value={formik.values.city} options={cityOptions} onChange={(nextValue) => formik.setFieldValue("city", nextValue)} error={formik.errors.city} touched={formik.touched.city} />
              </div>
              <div className="form-field-stack project-stage-span-8">
                <RequiredLabel htmlFor="venue">Venue atau lokasi acara</RequiredLabel>
                <input id="venue" name="venue" className="neo-input" value={formik.values.venue} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Contoh: Ballroom hotel, gedung, rumah, atau venue outdoor" autoComplete="organization" aria-invalid={Boolean(formik.touched.venue && formik.errors.venue)} aria-describedby={formik.touched.venue && formik.errors.venue ? "venue-help venue-error" : "venue-help"} data-lpignore="true" />
                <p id="venue-help" className="form-help-text">Pilih saran cepat atau isi manual sesuai lokasi acara Anda.</p>
                <div className="preset-chip-group">
                  {venueSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className={`preset-chip ${formik.values.venue === suggestion ? "is-active" : ""}`}
                      onClick={() => formik.setFieldValue("venue", suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                {formik.touched.venue && formik.errors.venue ? <p id="venue-error" className="neo-field-error" role="alert">{formik.errors.venue}</p> : null}
              </div>
              <div className="form-field-stack project-stage-span-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="neo-label !mb-0">Perkiraan tamu</span>
                  <span className="field-required-badge">Wajib</span>
                </div>
                <input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  className="neo-input"
                  value={formik.values.guestCount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Contoh: 350"
                  autoComplete="off"
                  aria-invalid={Boolean(formik.touched.guestCount && formik.errors.guestCount)}
                  aria-describedby={formik.touched.guestCount && formik.errors.guestCount ? "guestCount-help guestCount-error" : "guestCount-help"}
                  data-lpignore="true"
                />
                <p id="guestCount-help" className="form-help-text">Bisa diisi manual atau pilih angka cepat per 100 tamu.</p>
                <div className="preset-chip-group">
                  {guestOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`preset-chip ${formik.values.guestCount === option.value ? "is-active" : ""}`}
                      onClick={() => formik.setFieldValue("guestCount", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {formik.touched.guestCount && formik.errors.guestCount ? <p id="guestCount-error" className="neo-field-error" role="alert">{formik.errors.guestCount}</p> : null}
              </div>
              <div className="form-field-stack project-stage-span-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="neo-label !mb-0">Gaya acara</span>
                  <span className="field-required-badge">Wajib</span>
                </div>
                <SelectField id="template" label="" value={formik.values.template} options={templateOptions} onChange={(nextValue) => formik.setFieldValue("template", nextValue)} error={formik.errors.template} touched={formik.touched.template} />
              </div>
            </div>
          </section>

          <section className="neo-panel-inset project-stage-section p-4 sm:p-5">
            <SectionHeader icon={<Sparkles size={18} />} title="Konsep acara" description="Tuliskan gambaran singkat suasana dan arah acara agar tim perencanaannya lebih terarah." />
            <div className="mt-5 form-field-stack">
              <RequiredLabel htmlFor="concept">Gambaran singkat acara</RequiredLabel>
              <textarea id="concept" name="concept" className="neo-input min-h-36 resize-none" value={formik.values.concept} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Ceritakan konsep acara secara singkat agar arah persiapan lebih jelas" autoComplete="off" aria-invalid={Boolean(formik.touched.concept && formik.errors.concept)} aria-describedby={formik.touched.concept && formik.errors.concept ? "concept-error" : undefined} data-lpignore="true" />
              {formik.touched.concept && formik.errors.concept ? <p id="concept-error" className="neo-field-error" role="alert">{formik.errors.concept}</p> : null}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan data acara"}
            </button>
            {hasSavedProjectData(initialValues) ? (
              <button type="button" className="neo-button-secondary responsive-action" onClick={() => setIsEditing(false)}>
                Batal edit
              </button>
            ) : null}
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>
    </div>
  );
}

