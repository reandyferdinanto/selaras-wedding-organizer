"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, ArrowRight, LayoutDashboard, Rows3, Save } from "lucide-react";

import { SelectField } from "@/components/select-field";
import { TimelineGuidePreview } from "@/components/timeline-guide-preview";
import { getTimelineGuideItems, serializeTimelineModule, type TimelineModule } from "@/lib/planner-modules";
import { timelineStageConfig, timelineStageLabels } from "@/lib/timeline-guide";
import { savePlannerNotesAction } from "@/lib/supabase/actions";

const stageOptions = timelineStageLabels.map((label) => ({ label, value: label }));

const timelineSchema = Yup.object({
  planningWindow: Yup.string().required("Tahap acara wajib dipilih."),
  stageFocus: Yup.string().min(6, "Isi detail utama minimal 6 karakter.").required("Detail utama acara wajib diisi."),
  mainMoments: Yup.string().min(6, "Isi lokasi atau waktu minimal 6 karakter.").required("Lokasi dan waktu singkat wajib diisi."),
  familyFlow: Yup.string().min(6, "Isi vendor atau kebutuhan utama minimal 6 karakter.").required("Vendor atau kebutuhan utama wajib diisi."),
  nextPriority: Yup.string().default("").ensure(),
});

function fieldFilled(value: string) {
  return value.trim().length > 0;
}

function FieldCard({
  label,
  hint,
  placeholder,
  required,
  name,
  value,
  onChange,
  onBlur,
  error,
  className = "",
}: {
  label: string;
  hint: string;
  placeholder: string;
  required?: boolean;
  name: keyof TimelineModule;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
  error?: string;
  className?: string;
}) {
  return (
    <div className={["neo-panel-inset timeline-field-card p-4 sm:p-5", className].filter(Boolean).join(" ")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="neo-label !mb-0" htmlFor={name}>{label}</label>
        {required ? <span className="field-required-badge">Wajib</span> : null}
      </div>
      <p className="timeline-field-hint">{hint}</p>
      <textarea
        id={name}
        name={name}
        className="neo-input neo-scrollbar timeline-textarea mt-4 resize-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error ? <p className="neo-field-error">{error}</p> : null}
    </div>
  );
}

export function TimelineModuleForm({
  values,
  prevHref,
  nextHref,
}: {
  values: TimelineModule;
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formik = useFormik<TimelineModule>({
    enableReinitialize: true,
    initialValues: values,
    validationSchema: timelineSchema,
    onSubmit(currentValues, helpers) {
      startTransition(async () => {
        const result = await savePlannerNotesAction(serializeTimelineModule(currentValues));
        helpers.setStatus(result.message);
        if (result.ok) {
          router.refresh();
        }
      });
    },
  });

  const selectedStage = (formik.values.planningWindow || timelineStageLabels[0]) as (typeof timelineStageLabels)[number];
  const config = timelineStageConfig[selectedStage];
  const requiredFilledCount = [formik.values.planningWindow, formik.values.stageFocus, formik.values.mainMoments, formik.values.familyFlow].filter(fieldFilled).length;
  const guideItems = getTimelineGuideItems(formik.values);

  return (
    <div className="dashboard-detail-grid">
      <article className="neo-panel dashboard-detail-main p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="section-kicker">Isi detail tahap acara</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">Timeline acara utama</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Pilih tahap acara yang sedang Anda susun, lalu lengkapi detailnya sedikit demi sedikit. Semua isi di sini akan otomatis dipakai di ringkasan dashboard dan halaman tracking timeline.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="dashboard-status-chip is-sedang-disusun">
              {requiredFilledCount}/4 field inti terisi
            </span>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="neo-button-secondary responsive-action whitespace-nowrap">
                <LayoutDashboard size={16} />
                Kembali ke ringkasan
              </Link>
              <Link href="/dashboard/timeline/tracking" className="neo-button-secondary responsive-action whitespace-nowrap">
                <Rows3 size={16} />
                Tracking timeline
              </Link>
            </div>
          </div>
        </div>

        <div className="dashboard-info-note mt-5 neo-panel-inset p-4">
          <p className="text-sm font-semibold text-slate-700">{config.intro}</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">Mulai dari bagian inti dulu, lalu tambahkan catatan lanjutan jika sudah ada keputusan berikutnya.</p>
        </div>

        <div className="timeline-quick-guide mt-5">
          <div className="neo-panel-inset p-4">
            <p className="timeline-guide-title">1. Pilih tahap</p>
            <p className="timeline-guide-text">Tentukan tahap acara yang sedang dikerjakan saat ini.</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="timeline-guide-title">2. Isi inti acara</p>
            <p className="timeline-guide-text">Tulis agenda, lokasi atau waktu, dan kebutuhan utamanya.</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="timeline-guide-title">3. Review di dashboard</p>
            <p className="timeline-guide-text">Setelah disimpan, detail tahap langsung ikut tampil di ringkasan langkah 2 dan halaman tracking.</p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          <div className="neo-panel-inset timeline-stage-picker p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="neo-label !mb-0" htmlFor="planningWindow">Tahap acara</label>
              <span className="field-required-badge">Wajib</span>
            </div>
            <p className="timeline-field-hint">Pilih tahap yang sedang Anda susun saat ini. Setelah dipilih, detail form di bawah akan menyesuaikan konteks tahap tersebut.</p>
            <div className="mt-4">
              <SelectField
                id="planningWindow"
                label=""
                value={formik.values.planningWindow}
                options={stageOptions}
                onChange={(nextValue) => {
                  const currentStage = (formik.values.planningWindow || timelineStageLabels[0]) as (typeof timelineStageLabels)[number];
                  const nextStage = nextValue as (typeof timelineStageLabels)[number];
                  const nextStages = {
                    ...formik.values.stages,
                    [currentStage]: {
                      ...formik.values.stages[currentStage],
                      summary: formik.values.stageFocus,
                      schedule: formik.values.mainMoments,
                      vendor: formik.values.familyFlow,
                      next: formik.values.nextPriority,
                    },
                  };
                  const nextStageValues = nextStages[nextStage];
                  formik.setValues({
                    ...formik.values,
                    stages: nextStages,
                    planningWindow: nextStage,
                    stageFocus: nextStageValues.summary,
                    mainMoments: nextStageValues.schedule,
                    familyFlow: nextStageValues.vendor,
                    nextPriority: nextStageValues.next,
                  });
                }}
                error={typeof formik.errors.planningWindow === "string" ? formik.errors.planningWindow : undefined}
                touched={Boolean(formik.touched.planningWindow)}
              />
            </div>
          </div>

          <div className="timeline-form-grid">
            <FieldCard
              label={config.focusLabel}
              hint={config.focusHint}
              placeholder={config.focusPlaceholder}
              required
              name="stageFocus"
              value={formik.values.stageFocus}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.stageFocus && typeof formik.errors.stageFocus === "string" ? formik.errors.stageFocus : undefined}
              className="timeline-span-2"
            />
            <FieldCard
              label={config.scheduleLabel}
              hint={config.scheduleHint}
              placeholder={config.schedulePlaceholder}
              required
              name="mainMoments"
              value={formik.values.mainMoments}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mainMoments && typeof formik.errors.mainMoments === "string" ? formik.errors.mainMoments : undefined}
            />
            <FieldCard
              label={config.vendorLabel}
              hint={config.vendorHint}
              placeholder={config.vendorPlaceholder}
              required
              name="familyFlow"
              value={formik.values.familyFlow}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.familyFlow && typeof formik.errors.familyFlow === "string" ? formik.errors.familyFlow : undefined}
            />
            <FieldCard
              label={config.nextLabel}
              hint={config.nextHint}
              placeholder={config.nextPlaceholder}
              name="nextPriority"
              value={formik.values.nextPriority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="timeline-span-2"
            />
          </div>

          <div className="editor-actions">
            <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
              <Save size={16} />
              {isPending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
          {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
        </form>
      </article>

      <article className="neo-panel dashboard-detail-side p-5 sm:p-6">
        <div>
          <p className="section-kicker">Ringkasan timeline</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Alur acara vertikal</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Ringkasan ini menampilkan seluruh alur timeline beserta detail review tiap rangkaian acara, jadi user bisa membaca konteksnya langsung tanpa membuka form satu per satu.</p>
        </div>

        <div className="dashboard-info-note mt-4 neo-panel-inset p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-700">Kemajuan bagian inti</p>
            <span className="dashboard-status-chip is-sedang-disusun">{requiredFilledCount}/4 field inti terisi</span>
          </div>
        </div>

        <div className="mt-6">
          <TimelineGuidePreview items={guideItems} showQuickNotes />
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





