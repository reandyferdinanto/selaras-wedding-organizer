"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, LayoutDashboard, Save } from "lucide-react";

import { SelectField } from "@/components/select-field";
import {
  serializeBudgetModule,
  serializeDocumentModule,
  serializeGuestModule,
  serializeTimelineModule,
  serializeVendorModule,
} from "@/lib/planner-modules";
import { savePlannerNotesAction } from "@/lib/supabase/actions";
import type { PlannerNotes } from "@/lib/planner-data";

type ModuleField = {
  name: string;
  label: string;
  hint: string;
  type?: "textarea" | "select";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
};

type PlannerModuleType = "timeline" | "vendor" | "tamu" | "anggaran" | "dokumen";

const payloadBuilders: Record<PlannerModuleType, (values: Record<string, string>) => Partial<PlannerNotes>> = {
  timeline: (values) => serializeTimelineModule(values as unknown as Parameters<typeof serializeTimelineModule>[0]),
  vendor: (values) => serializeVendorModule(values as Parameters<typeof serializeVendorModule>[0]),
  tamu: (values) => serializeGuestModule(values as Parameters<typeof serializeGuestModule>[0]),
  anggaran: (values) => serializeBudgetModule(values as Parameters<typeof serializeBudgetModule>[0]),
  dokumen: (values) => serializeDocumentModule(values as Parameters<typeof serializeDocumentModule>[0]),
};

const validationSchemas: Record<PlannerModuleType, Yup.ObjectSchema<Record<string, string>>> = {
  timeline: Yup.object({
    planningWindow: Yup.string().required("Tahap acara wajib dipilih."),
    stageFocus: Yup.string().min(6, "Isi detail utama minimal 6 karakter.").required("Detail utama acara wajib diisi."),
    mainMoments: Yup.string().min(6, "Isi lokasi atau waktu minimal 6 karakter.").required("Lokasi dan waktu singkat wajib diisi."),
    familyFlow: Yup.string().min(6, "Isi vendor atau kebutuhan utama minimal 6 karakter.").required("Vendor atau kebutuhan utama wajib diisi."),
    nextPriority: Yup.string().default("").ensure(),
  }),
  vendor: Yup.object({
    venueStatus: Yup.string().min(10, "Isi catatan venue minimal 10 karakter.").required("Catatan venue wajib diisi."),
    cateringStatus: Yup.string().min(10, "Isi catatan catering minimal 10 karakter.").required("Catatan catering wajib diisi."),
    documentationStatus: Yup.string().min(10, "Isi catatan dokumentasi minimal 10 karakter.").required("Catatan dokumentasi wajib diisi."),
    coordinatorNeed: Yup.string().min(10, "Isi kebutuhan koordinator minimal 10 karakter.").required("Kebutuhan koordinator wajib diisi."),
    paymentPlan: Yup.string().min(10, "Isi rencana pembayaran minimal 10 karakter.").required("Rencana pembayaran wajib diisi."),
  }),
  tamu: Yup.object({
    guestGroups: Yup.string().min(10, "Isi pembagian tamu minimal 10 karakter.").required("Pembagian tamu wajib diisi."),
    invitationChannel: Yup.string().required("Saluran undangan wajib dipilih."),
    rsvpOwner: Yup.string().min(10, "Isi PIC RSVP minimal 10 karakter.").required("PIC RSVP wajib diisi."),
    familySeating: Yup.string().min(10, "Isi pengaturan keluarga minimal 10 karakter.").required("Pengaturan keluarga wajib diisi."),
    hospitalityNotes: Yup.string().min(10, "Isi catatan hospitality minimal 10 karakter.").required("Catatan hospitality wajib diisi."),
  }),
  anggaran: Yup.object({
    totalRange: Yup.string().required("Rentang budget wajib dipilih."),
    biggestExpense: Yup.string().min(10, "Isi prioritas biaya minimal 10 karakter.").required("Prioritas biaya wajib diisi."),
    paymentStrategy: Yup.string().min(10, "Isi strategi pembayaran minimal 10 karakter.").required("Strategi pembayaran wajib diisi."),
    reserveFund: Yup.string().min(10, "Isi dana cadangan minimal 10 karakter.").required("Dana cadangan wajib diisi."),
    budgetControl: Yup.string().min(10, "Isi kontrol budget minimal 10 karakter.").required("Kontrol budget wajib diisi."),
  }),
  dokumen: Yup.object({
    legalChecklist: Yup.string().min(10, "Isi checklist legal minimal 10 karakter.").required("Checklist legal wajib diisi."),
    familyDocuments: Yup.string().min(10, "Isi dokumen keluarga minimal 10 karakter.").required("Dokumen keluarga wajib diisi."),
    vendorContracts: Yup.string().min(10, "Isi arsip kontrak minimal 10 karakter.").required("Arsip kontrak wajib diisi."),
    paymentProofs: Yup.string().min(10, "Isi arsip pembayaran minimal 10 karakter.").required("Arsip pembayaran wajib diisi."),
    finalArchive: Yup.string().min(10, "Isi arsip akhir minimal 10 karakter.").required("Arsip akhir wajib diisi."),
  }),
};

function ModuleProgressPanel({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="form-progress-panel neo-panel-inset p-4" aria-label="Kemajuan pengisian modul">
      <div className="form-progress-copy">
        <span className="dashboard-status-chip is-sedang-disusun">{completed}/{total} field wajib terisi</span>
        <div>
          <p className="form-progress-title">Isi bagian inti dulu, detail lanjutan bisa menyusul.</p>
          <p className="form-progress-text">Ringkasan di sisi kanan ikut berubah saat Anda mengetik.</p>
        </div>
      </div>
      <div className="form-progress-track" aria-hidden="true">
        <span className="form-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ModuleErrorSummary({ errors }: { errors: Array<{ id: string; label: string; message: string }> }) {
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

export function PlannerModuleForm<T extends Record<string, string>>({
  moduleType,
  title,
  description,
  values,
  fields,
  prevHref,
  nextHref,
}: {
  moduleType: PlannerModuleType;
  title: string;
  description: string;
  values: T;
  fields: ModuleField[];
  prevHref?: string;
  nextHref?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const requiredFields = fields.filter((field) => field.required);

  const formik = useFormik<T>({
    enableReinitialize: true,
    initialValues: values,
    validationSchema: validationSchemas[moduleType],
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        const result = await savePlannerNotesAction(payloadBuilders[moduleType](currentValues));
        helpers.setStatus(result.message);
      });
    },
  });

  const requiredFilledCount = requiredFields.filter((field) => {
    const value = formik.values[field.name];
    return typeof value === "string" && value.trim().length > 0;
  }).length;
  const visibleErrors: Array<{ id: string; label: string; message: string }> = [];
  fields.forEach((field) => {
    const message = formik.errors[field.name];
    if (typeof message === "string") {
      visibleErrors.push({ id: field.name, label: field.label, message });
    }
  });
  const showErrorSummary = formik.submitCount > 0 && visibleErrors.length > 0;

  return (
    <div className="dashboard-detail-grid">
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Isi detail fitur</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="dashboard-status-chip is-sedang-disusun">
              {requiredFilledCount}/{requiredFields.length} field wajib terisi
            </span>
            <Link href="/dashboard" className="neo-button-secondary responsive-action whitespace-nowrap">
              <LayoutDashboard size={16} />
              Kembali ke ringkasan
            </Link>
          </div>
        </div>

        <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
          <p className="text-sm font-semibold text-slate-700">Field dengan label Wajib paling berpengaruh terhadap progres langkah.</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Lengkapi bagian inti lebih dulu agar status langkah lebih cepat berubah dari belum diisi menjadi sedang disusun lalu selesai.</p>
        </div>

        <div className="mt-5">
          <ModuleProgressPanel completed={requiredFilledCount} total={requiredFields.length} />
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {showErrorSummary ? <ModuleErrorSummary errors={visibleErrors} /> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map((field) => {
              const error = formik.touched[field.name] && formik.errors[field.name];
              const isTextArea = field.type !== "select";
              const isFullWidth = isTextArea;
              const hintId = `${field.name}-hint`;
              const errorId = `${field.name}-error`;
              const describedBy = typeof error === "string" ? `${hintId} ${errorId}` : hintId;

              return (
                <div key={field.name} className={isFullWidth ? "lg:col-span-2" : ""}>
                  {field.type === "select" ? (
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <label className="neo-label !mb-0" htmlFor={field.name}>{field.label}</label>
                        {field.required ? <span className="field-required-badge">Wajib</span> : null}
                      </div>
                      <p id={hintId} className="mb-3 text-sm leading-7 text-slate-500">{field.hint}</p>
                      <SelectField
                        id={field.name}
                        label=""
                        value={formik.values[field.name]}
                        options={field.options ?? []}
                        onChange={(nextValue) => formik.setFieldValue(field.name, nextValue)}
                        error={typeof error === "string" ? error : undefined}
                        touched={Boolean(formik.touched[field.name])}
                        describedBy={hintId}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <label className="neo-label !mb-0" htmlFor={field.name}>{field.label}</label>
                        {field.required ? <span className="field-required-badge">Wajib</span> : null}
                      </div>
                      <p id={hintId} className="mb-3 text-sm leading-7 text-slate-500">{field.hint}</p>
                      <textarea
                        id={field.name}
                        name={field.name}
                        className="neo-input min-h-32 resize-none"
                        placeholder={field.placeholder}
                        value={formik.values[field.name]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        aria-invalid={typeof error === "string"}
                        aria-describedby={describedBy}
                      />
                      {typeof error === "string" ? <p id={errorId} className="neo-field-error" role="alert">{error}</p> : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
            {requiredFilledCount === requiredFields.length ? (
              <span className="form-complete-note">
                <CheckCircle2 size={15} />
                Semua field wajib siap disimpan.
              </span>
            ) : null}
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Ringkasan modul</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Periksa hasil isian secara cepat</h2>
        </div>

        <div className="dashboard-info-note mt-4 neo-panel-inset p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-700">Kemajuan field inti</p>
            <span className="dashboard-status-chip is-sedang-disusun">{requiredFilledCount}/{requiredFields.length} field wajib terisi</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {fields.map((field) => (
            <div key={field.name} className="neo-panel-inset p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-500">{field.label}</p>
                {field.required ? <span className="field-required-badge">Wajib</span> : null}
              </div>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-700">{formik.values[field.name] || "Belum diisi"}</p>
            </div>
          ))}
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






