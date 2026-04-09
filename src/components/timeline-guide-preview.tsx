import { CheckCircle2, Circle, Clock3 } from "lucide-react";

import type { TimelineStageLabel } from "@/lib/timeline-guide";
import { TimelineStageIcon } from "@/components/timeline-stage-icon";

export type TimelineGuideItem = {
  label: TimelineStageLabel;
  state: "done" | "current" | "upcoming";
  completed: boolean;
  quickNote: string;
  overview: string;
  review: {
    summary: string;
    schedule: string;
    vendor: string;
    next: string;
  };
};

function ReviewLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "summary" | "schedule" | "vendor" | "next";
}) {
  return (
    <div className={["timeline-review-line", `is-${tone}`].join(" ")}>
      <p className="timeline-review-label">{label}</p>
      <p className="timeline-review-value">{value}</p>
    </div>
  );
}

export function TimelineGuidePreview({
  items,
  compact = false,
  showQuickNotes = true,
}: {
  items: TimelineGuideItem[];
  compact?: boolean;
  showQuickNotes?: boolean;
}) {
  return (
    <div className={["timeline-overview", compact ? "is-compact" : "is-full"].join(" ")}>
      {items.map((item, index) => (
        <div key={item.label} className={["timeline-overview-item", `is-${item.state}`, item.completed ? "is-completed" : "is-incomplete"].join(" ")}>
          <div className="timeline-overview-rail">
            <span className="timeline-overview-dot" />
            {index < items.length - 1 ? <span className="timeline-overview-line" /> : null}
          </div>
          <div className={["neo-panel-inset", "timeline-overview-card", item.completed ? "is-completed" : "is-incomplete"].join(" ")}>
            {/* Stage icon banner */}
            <div className="timeline-stage-icon-row">
              <TimelineStageIcon label={item.label} state={item.state} />
              <div className="timeline-stage-icon-meta">
                <span className="timeline-stage-icon-index">Tahap {index + 1} dari {items.length}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3 mt-3">
              <div className="min-w-0">
                <p className={["timeline-overview-title", item.completed ? "is-completed" : "is-incomplete"].join(" ")}>{item.label}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.overview}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={["timeline-overview-chip", `is-${item.state}`].join(" ")}>
                  {item.state === "done" ? "Sudah lewat" : item.state === "current" ? "Sedang disusun" : "Tahap berikutnya"}
                </span>
                <span className={["timeline-check-chip", item.completed ? "is-done" : "is-pending"].join(" ")}>
                  {item.completed ? <CheckCircle2 size={14} /> : item.state === "current" ? <Clock3 size={14} /> : <Circle size={14} />}
                  {item.completed ? "Selesai" : item.state === "current" ? "Sedang diproses" : "Belum dicentang"}
                </span>
              </div>
            </div>

            <div className="timeline-review-stack">
              <ReviewLine label="Ringkasan" value={item.review.summary} tone="summary" />
              <ReviewLine label="Waktu / lokasi" value={item.review.schedule} tone="schedule" />
              <ReviewLine label="Vendor / kebutuhan" value={item.review.vendor} tone="vendor" />
              <ReviewLine label="Catatan lanjutan" value={item.review.next} tone="next" />
            </div>

            {showQuickNotes && item.quickNote ? (
              <div className="timeline-quick-note">
                <p className="timeline-quick-note-label">Catatan kecil</p>
                <p className="timeline-quick-note-value">{item.quickNote}</p>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
