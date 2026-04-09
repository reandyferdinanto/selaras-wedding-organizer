"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useFormik } from "formik";
import { ArrowLeft, Printer, Save, Search } from "lucide-react";

import { TimelineGuidePreview } from "@/components/timeline-guide-preview";
import { getTimelineGuideItems, serializeTimelineModule, type TimelineModule } from "@/lib/planner-modules";
import { timelineStageLabels } from "@/lib/timeline-guide";
import { savePlannerNotesAction } from "@/lib/supabase/actions";

type TimelineFilter = "all" | "pending" | "completed";

const filterLabels: Array<{ value: TimelineFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Belum selesai" },
  { value: "completed", label: "Selesai" },
];

export function TimelineTrackingBoard({ values }: { values: TimelineModule }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formik = useFormik<TimelineModule>({
    enableReinitialize: true,
    initialValues: values,
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

  const guideItems = getTimelineGuideItems(formik.values);
  const orderedGuideItems = guideItems;
  const completedCount = guideItems.filter((item) => item.completed).length;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredChecklistItems = useMemo(() => {
    return orderedGuideItems.filter((item) => {
      if (activeFilter === "pending" && item.completed) return false;
      if (activeFilter === "completed" && !item.completed) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        item.label,
        item.overview,
        item.review.summary,
        item.review.schedule,
        item.review.vendor,
        item.review.next,
        item.quickNote,
      ].join(" ").toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeFilter, normalizedQuery, orderedGuideItems]);

  return (
    <div className="dashboard-detail-grid-single timeline-tracking-page">
      <section className="neo-panel p-5 sm:p-6 no-print">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Tracking timeline</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">Pantau tiap rangkaian acara dalam satu halaman</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Checklist dipakai untuk menandai tahap yang sudah beres. Catatan kecil membantu Anda menyimpan keputusan cepat tanpa mengubah isi panduan utama.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/timeline" className="neo-button-secondary responsive-action">
              <ArrowLeft size={16} />
              Kembali ke timeline
            </Link>
            <button type="button" className="neo-button-secondary responsive-action" onClick={() => window.print()}>
              <Printer size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </section>

      <section className="timeline-tracking-shell">
        <article className="neo-panel timeline-tracking-checklist p-5 sm:p-6 no-print">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Checklist timeline</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Tandai tahap yang sudah selesai</h2>
            </div>
            <span className="dashboard-status-chip is-sedang-disusun">{completedCount}/{timelineStageLabels.length} tahap selesai</span>
          </div>

          <div className="timeline-filter-group mt-5">
            {filterLabels.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={["timeline-filter-chip", activeFilter === filter.value ? "is-active" : ""].join(" ")}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="timeline-search-shell mt-4">
            <Search size={16} className="timeline-search-icon" />
            <input
              type="search"
              className="neo-input timeline-search-input"
              placeholder="Cari tahap, lokasi, vendor, atau catatan seperti lamaran, akad, atau Jambur Jawata"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
            {filteredChecklistItems.length ? filteredChecklistItems.map((item) => {
              const label = item.label;
              const isChecked = formik.values.stages[label].completed;

              return (
                <div key={label} className={["neo-panel-inset", "timeline-checklist-item", isChecked ? "is-completed" : "is-pending", "p-4", "sm:p-5"].join(" ")}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <label className="timeline-check-row">
                        <input
                          type="checkbox"
                          className="timeline-check-input"
                          checked={isChecked}
                          onChange={(event) => {
                            formik.setFieldValue(`stages.${label}.completed`, event.target.checked);
                          }}
                        />
                        <span className={["timeline-check-visual", isChecked ? "is-completed" : "is-pending"].join(" ")} aria-hidden="true">
                          <span className="timeline-check-mark" />
                        </span>
                        <span>
                          <span className="timeline-check-title">{label}</span>
                          <span className="timeline-check-subtitle">Tandai jika rangkaian ini sudah jelas atau sudah selesai dikerjakan.</span>
                        </span>
                      </label>
                    </div>
                    <Link href="/dashboard/timeline" className="dashboard-open-link inline-flex items-center gap-2 text-sm font-semibold">
                      Buka detail tahap
                    </Link>
                  </div>

                  <div className="mt-4">
                    <label className="neo-label !mb-2" htmlFor={`note-${label}`}>Catatan kecil</label>
                    <textarea
                      id={`note-${label}`}
                      className="neo-input neo-scrollbar timeline-note-input resize-none"
                      placeholder="Tulis pengingat kecil, misalnya keputusan keluarga, vendor yang perlu dihubungi, atau hal yang masih menunggu konfirmasi."
                      value={formik.values.stages[label].quickNote}
                      onChange={(event) => formik.setFieldValue(`stages.${label}.quickNote`, event.target.value)}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="neo-panel-inset p-4">
                <p className="text-base font-semibold text-slate-800">Tidak ada tahap yang cocok</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Coba ganti kata kunci atau filter untuk melihat tahap lain yang masih perlu dicek.</p>
              </div>
            )}

            <div className="editor-actions">
              <button type="submit" className="neo-button-primary responsive-action" disabled={isPending}>
                <Save size={16} />
                {isPending ? "Menyimpan..." : "Simpan checklist timeline"}
              </button>
            </div>
            {formik.status ? <p className="text-sm text-slate-500">{String(formik.status)}</p> : null}
          </form>
        </article>

        <article className="neo-panel timeline-tracking-guide p-5 sm:p-6 print:!shadow-none print:!border-0 print:!bg-transparent">
          <div className="timeline-print-heading">
            <p className="section-kicker">Timeline guide</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Panduan rangkaian acara</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Bagian ini khusus untuk review dan export PDF. Saat dicetak, hanya panduan timeline yang akan ditampilkan tanpa checklist.</p>
          </div>
          <div className="mt-6">
            <TimelineGuidePreview items={orderedGuideItems} showQuickNotes={false} />
          </div>
        </article>
      </section>
    </div>
  );
}











