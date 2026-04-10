import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarCheck2, ChevronDown, CircleDollarSign, Files, MapPin, NotebookPen, Rows3, Users, WalletCards } from "lucide-react";

import { TimelineGuidePreview } from "@/components/timeline-guide-preview";
import { dashboardFeatures } from "@/lib/planner-data";
import { getFeatureState, getOverallProgress, getTimelineGuideItems, readBudgetModule, readDocumentModule, readGuestModule, readTimelineModule, readVendorModule } from "@/lib/planner-modules";
import { buildVendorPlannerState, getVendorChecklistStats } from "@/lib/vendor-guide";
import { buildGuestPlannerState, getGuestChecklistStats } from "@/lib/guest-guide";
import { buildBudgetPlannerState, getBudgetChecklistStats } from "@/lib/budget-guide";
import { buildDocumentPlannerState, getDocumentChecklistStats } from "@/lib/document-guide";
import { getPlannerSnapshot } from "@/lib/planner-store";

const icons = {
  proyek: CalendarCheck2,
  timeline: NotebookPen,
  vendor: WalletCards,
  tamu: Users,
  anggaran: CircleDollarSign,
  dokumen: Files,
};

function getOverallStatus(progress: number) {
  if (progress === 0) return "belum diisi";
  if (progress === 100) return "selesai";
  return "sedang disusun";
}

function formatWeddingDate(value: string) {
  if (!value) return "Belum diisi";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPair(primary: string, secondary?: string) {
  return secondary ? `${primary} | ${secondary}` : primary;
}

function compactLabel(value: string, fallback: string, maxLength = 44) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;

  const firstChunk = normalized.split(/[.|]/)[0]?.trim() || normalized;
  if (firstChunk.length <= maxLength) return firstChunk;

  return `${firstChunk.slice(0, maxLength - 1).trimEnd()}…`;
}

function DashboardDetailCard({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "strong";
  icon?: ReactNode;
}) {
  return (
    <div className={`dashboard-detail-card neo-panel-inset${tone === "strong" ? " is-strong" : ""}`}>
      <div className="dashboard-detail-card-label">
        {icon ? <span className="dashboard-detail-card-icon">{icon}</span> : null}
        <p>{label}</p>
      </div>
      <p className={`dashboard-detail-card-value${tone === "strong" ? " is-strong" : ""}`}>{value}</p>
    </div>
  );
}

function DashboardDetailSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-detail-section neo-panel-inset">
      <div className="dashboard-detail-section-head">
        <div>
          <p className="dashboard-detail-section-title">{title}</p>
          {description ? <p className="dashboard-detail-section-copy">{description}</p> : null}
        </div>
        {action ? <div className="dashboard-detail-section-action">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

function getStepGlanceItems(params: {
  slug: string;
  couple: string;
  weddingDate: string;
  venue: string;
  guestCount: string;
  template: string;
  completedTimelineCount: number;
  totalTimelineCount: number;
  activeTimelineLabel?: string;
  vendorHeadline: string;
  vendorIncluded: number;
  vendorTotal: number;
  guestChecked: number;
  guestTotal: number;
  budgetChecked: number;
  budgetTotal: number;
  documentChecked: number;
  documentTotal: number;
}) {
  switch (params.slug) {
    case "proyek":
      return [
        {
          label: "Fondasi",
          value: params.couple || "Nama mempelai",
        },
        {
          label: "Acara",
          value: formatPair(
            params.weddingDate ? formatWeddingDate(params.weddingDate) : "Tanggal belum diisi",
            params.guestCount ? `${params.guestCount} tamu` : undefined,
          ),
        },
        {
          label: "Venue",
          value: params.venue || params.template || "Lokasi belum diisi",
        },
      ];
    case "timeline":
      return [
        {
          label: "Tahap selesai",
          value: `${params.completedTimelineCount}/${params.totalTimelineCount}`,
        },
        {
          label: "Fokus saat ini",
          value: params.activeTimelineLabel || "Belum dipilih",
        },
      ];
    case "vendor":
      return [
        {
          label: "Vendor utama",
          value: compactLabel(params.vendorHeadline, "Belum diisi"),
        },
        {
          label: "Checklist",
          value: `${params.vendorIncluded}/${params.vendorTotal} item`,
        },
      ];
    case "tamu":
      return [
        {
          label: "Checklist tamu",
          value: `${params.guestChecked}/${params.guestTotal} item`,
        },
      ];
    case "anggaran":
      return [
        {
          label: "Pos siap",
          value: `${params.budgetChecked}/${params.budgetTotal} pos`,
        },
      ];
    case "dokumen":
      return [
        {
          label: "Arsip siap",
          value: `${params.documentChecked}/${params.documentTotal} item`,
        },
      ];
    default:
      return [];
  }
}

export default async function DashboardOverviewPage() {
  const snapshot = await getPlannerSnapshot();
  const states = getFeatureState(snapshot);
  const overallProgress = getOverallProgress(snapshot);
  const overallStatus = getOverallStatus(overallProgress);
  const couple = [snapshot.projectSetup.brideName, snapshot.projectSetup.groomName].filter(Boolean).join(" • ");
  const nextFeatures = dashboardFeatures.filter((feature) => states[feature.slug]?.status !== "selesai").slice(0, 3);
  const timelineGuideItems = getTimelineGuideItems(readTimelineModule(snapshot.notes));
  const vendorPlannerState = buildVendorPlannerState(readVendorModule(snapshot.notes));
  const vendorStats = getVendorChecklistStats(vendorPlannerState.categories);
  const guestPlannerState = buildGuestPlannerState(readGuestModule(snapshot.notes));
  const guestStats = getGuestChecklistStats(guestPlannerState.categories);
  const budgetPlannerState = buildBudgetPlannerState(readBudgetModule(snapshot.notes));
  const budgetStats = getBudgetChecklistStats(budgetPlannerState.categories);
  const documentPlannerState = buildDocumentPlannerState(readDocumentModule(snapshot.notes));
  const documentStats = getDocumentChecklistStats(documentPlannerState.categories);
  const completedTimelineCount = timelineGuideItems.filter((item) => item.completed).length;
  const pendingTimelineCount = timelineGuideItems.length - completedTimelineCount;
  const activeTimelineItem = timelineGuideItems.find((item) => item.state === "current") ?? timelineGuideItems[0];
  const vendorHeadline = vendorPlannerState.vendorAkadResepsiName || vendorPlannerState.vendorLamaranName;

  return (
    <div className="dashboard-overview-stack">
      <section className="neo-panel dashboard-compact-summary">
        <div className="dashboard-summary-head">
          <div className="dashboard-summary-copy">
            <p className="section-kicker">Ringkasan dashboard</p>
            <h2>Lihat progres tanpa membuka semua langkah</h2>
            <p>Fokus pada bagian yang sudah siap, yang perlu perhatian, dan langkah berikutnya.</p>
          </div>

          <div className="dashboard-summary-score" aria-label={`Progres keseluruhan ${overallProgress} persen, status ${overallStatus}`}>
            <span
              className={`dashboard-status-chip dashboard-state-chip is-${overallStatus.replaceAll(" ", "-")}`}
              aria-label={overallStatus}
              title={overallStatus}
            >
              {overallStatus}
            </span>
            <strong>{overallProgress}%</strong>
          </div>
        </div>

        <div className="dashboard-summary-progress">
          <div className="dashboard-progress-track" aria-hidden="true">
            <div className="dashboard-progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          <span>{overallProgress}% selesai</span>
        </div>

        <dl className="dashboard-quickfacts dashboard-quickfacts-compact">
          <div className="dashboard-quickfact-row">
            <dt>Pasangan</dt>
            <dd>{couple || "Belum diisi"}</dd>
          </div>
          <div className="dashboard-quickfact-row">
            <dt>Agenda</dt>
            <dd>
              {snapshot.projectSetup.weddingDate || "Tanggal belum diisi"}
              {snapshot.projectSetup.city ? ` | ${snapshot.projectSetup.city}` : ""}
            </dd>
          </div>
          <div className="dashboard-quickfact-row">
            <dt>Format</dt>
            <dd>
              {snapshot.projectSetup.template || "Template belum diisi"}
              {snapshot.projectSetup.guestCount ? ` | ${snapshot.projectSetup.guestCount} tamu` : " | 0 tamu"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="neo-panel p-5 sm:p-6">
          <div className="dashboard-steps-head">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                {/* Layers/Modules Illustration */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.15" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <p className="section-kicker">Ringkasan langkah</p>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Pantau tiap langkah dengan lebih tenang</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Buka card yang dibutuhkan untuk melihat detail penting, lalu masuk ke halamannya saat Anda siap melanjutkan pengisian.
                </p>
              </div>
            </div>

            <div className="dashboard-steps-tip neo-panel-inset">
              <p className="dashboard-steps-tip-label">Cara pakai</p>
              <p className="dashboard-steps-tip-text">Baca ringkasannya dulu, buka card saat perlu konteks, lalu lanjutkan pengisian dari tombol aksi.</p>
            </div>
          </div>

          <div className="dashboard-module-list mt-6">
            {dashboardFeatures.map((feature, index) => {
              const Icon = icons[feature.slug as keyof typeof icons];
              const state = states[feature.slug];
              const isProject = feature.slug === "proyek";
              const isPriorityCard = feature.slug === "timeline" || feature.slug === "vendor";
              const isSupportCard = feature.slug === "tamu" || feature.slug === "anggaran" || feature.slug === "dokumen";
              const glanceItems = getStepGlanceItems({
                slug: feature.slug,
                couple,
                weddingDate: snapshot.projectSetup.weddingDate,
                venue: snapshot.projectSetup.venue,
                guestCount: snapshot.projectSetup.guestCount,
                template: snapshot.projectSetup.template,
                completedTimelineCount,
                totalTimelineCount: timelineGuideItems.length,
                activeTimelineLabel: activeTimelineItem?.label,
                vendorHeadline,
                vendorIncluded: vendorStats.included,
                vendorTotal: vendorStats.totalItems,
                guestChecked: guestStats.checkedItems,
                guestTotal: guestStats.totalItems,
                budgetChecked: budgetStats.checkedItems,
                budgetTotal: budgetStats.totalItems,
                documentChecked: documentStats.checkedItems,
                documentTotal: documentStats.totalItems,
              });

              return (
                <details
                  key={feature.href}
                  className={`dashboard-module-accordion neo-panel-inset${isPriorityCard ? " is-priority-card" : ""}${isSupportCard ? " is-support-card" : ""}`}
                  open={index === 0}
                >
                  <summary className={`dashboard-accordion-trigger${isPriorityCard ? " is-priority-card" : ""}${isSupportCard ? " is-support-card" : ""}`}>
                    <div className="dashboard-module-leading">
                      <span className="neo-icon shrink-0">
                        <Icon size={18} />
                      </span>
                      <div className="dashboard-module-copy">
                        <div className="dashboard-module-meta">
                          <span className="dashboard-step-chip">{feature.step}</span>
                        </div>
                        <h3 className="dashboard-module-title mt-3">{feature.title}</h3>
                        <p className="dashboard-module-summary">{state.summary}</p>
                        {glanceItems.length ? (
                          <div className={`dashboard-module-glance${isPriorityCard ? " is-priority-card" : ""}${isSupportCard ? " is-support-card" : ""}`}>
                            {glanceItems.map((item) => (
                              <div key={`${feature.slug}-${item.label}`} className="dashboard-module-glance-item">
                                <span className="dashboard-module-glance-label">{item.label}</span>
                                <span className="dashboard-module-glance-value">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="dashboard-module-trailing">
                      <div className="dashboard-module-topline">
                        <div className="dashboard-module-status-stack">
                          <span
                            className={`dashboard-status-chip dashboard-state-chip is-${state.status.replaceAll(" ", "-")}`}
                            aria-label={state.status}
                            title={state.status}
                          >
                            {state.status}
                          </span>
                          <span className="dashboard-module-progress-pill">{state.progress}%</span>
                        </div>
                        <div className="dashboard-module-actions">
                          <Link href={feature.href} className="dashboard-open-link inline-flex items-center gap-2 text-sm font-semibold">
                            Buka
                            <ArrowRight size={16} />
                          </Link>
                          <span className="dashboard-accordion-indicator" aria-hidden="true">
                            <ChevronDown size={16} />
                          </span>
                        </div>
                      </div>
                      <div className="dashboard-module-progress-meta">
                        <span>Progres</span>
                        <span>{state.progress}%</span>
                      </div>
                      <div className="dashboard-progress-track" aria-hidden="true">
                        <div className="dashboard-progress-fill" style={{ width: `${state.progress}%` }} />
                      </div>
                    </div>
                  </summary>

                  <div className="dashboard-accordion-panel">
                    {isProject ? (
                      <div className="dashboard-detail-preview-grid">
                        <DashboardDetailCard label="Nama mempelai" value={couple || "Belum diisi"} tone="strong" />
                        <DashboardDetailCard label="Tanggal acara" value={formatWeddingDate(snapshot.projectSetup.weddingDate)} tone="strong" />
                        <DashboardDetailCard label="Venue / lokasi" value={snapshot.projectSetup.venue || "Belum diisi"} icon={<MapPin size={15} />} />
                        <DashboardDetailCard
                          label="Jumlah tamu dan gaya acara"
                          value={`${snapshot.projectSetup.guestCount ? `${snapshot.projectSetup.guestCount} tamu` : "Tamu belum diisi"}${snapshot.projectSetup.template ? ` | ${snapshot.projectSetup.template}` : ""}`}
                        />
                      </div>
                    ) : feature.slug === "timeline" ? (
                      <div className="space-y-4">
                        <DashboardDetailSection
                          title="Tracking timeline"
                          description="Lihat alur lengkap tiap momen, tandai yang sudah selesai, lalu buka halaman tracking saat ingin mencetak panduan timeline ke PDF."
                          action={
                            <Link href="/dashboard/timeline/tracking" className="neo-button-secondary w-full justify-center sm:w-auto">
                              <Rows3 size={16} />
                              Buka tracking
                            </Link>
                          }
                        >
                          <div className="timeline-dashboard-stats mt-4">
                            <DashboardDetailCard label="Tahap selesai" value={`${completedTimelineCount}/${timelineGuideItems.length}`} tone="strong" />
                            <DashboardDetailCard label="Masih berjalan" value={`${pendingTimelineCount} tahap`} tone="strong" />
                          </div>
                        </DashboardDetailSection>
                        <TimelineGuidePreview items={timelineGuideItems} compact showQuickNotes />
                      </div>
                    ) : feature.slug === "vendor" ? (
                      <div className="space-y-4">
                        <div className="dashboard-detail-preview-grid">
                          <DashboardDetailCard label="Arah paket" value={vendorPlannerState.vendorAkadResepsiName || vendorPlannerState.vendorLamaranName || "Belum diisi"} />
                          <DashboardDetailCard label="Checklist vendor" value={`${vendorStats.included}/${vendorStats.totalItems} item dipilih`} tone="strong" />
                          <DashboardDetailCard label="Kategori lengkap" value={`${vendorStats.completedCategories}/${vendorStats.totalCategories}`} tone="strong" />
                          <DashboardDetailCard label="Kategori tambahan" value={`${vendorStats.customCategories} kategori`} />
                        </div>
                        <div className="dashboard-detail-preview-grid">
                          {vendorPlannerState.categories.slice(0, 4).map((category) => {
                            const includedItems = category.items.filter((item) => item.status === "include");
                            return (
                              <div key={category.id} className="neo-panel-inset p-4">
                                <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  {includedItems.length ? includedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada item yang dipilih."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : feature.slug === "tamu" ? (
                      <div className="space-y-4">
                        <div className="dashboard-detail-preview-grid">
                          <DashboardDetailCard label="Arah pembagian" value={guestPlannerState.guestDirection || "Belum diisi"} />
                          <DashboardDetailCard label="Saluran undangan" value={guestPlannerState.invitationChannel || "Belum diisi"} tone="strong" />
                          <DashboardDetailCard label="Checklist tamu" value={`${guestStats.checkedItems}/${guestStats.totalItems} item siap`} tone="strong" />
                          <DashboardDetailCard label="Kategori tambahan" value={`${guestStats.customCategories} kategori`} />
                        </div>
                        <div className="dashboard-detail-preview-grid">
                          {guestPlannerState.categories.slice(0, 4).map((category) => {
                            const checkedItems = category.items.filter((item) => item.checked);
                            return (
                              <div key={category.id} className="neo-panel-inset p-4">
                                <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  {checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada item yang ditandai siap."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : feature.slug === "anggaran" ? (
                      <div className="space-y-4">
                        <div className="dashboard-detail-preview-grid">
                          <DashboardDetailCard label="Rentang budget" value={budgetPlannerState.budgetRange || "Belum diisi"} />
                          <DashboardDetailCard label="Pos terpetakan" value={`${budgetStats.checkedItems}/${budgetStats.totalItems} pos`} tone="strong" />
                          <DashboardDetailCard label="Kategori lengkap" value={`${budgetStats.completedCategories}/${budgetStats.totalCategories}`} tone="strong" />
                          <DashboardDetailCard label="Kategori tambahan" value={`${budgetStats.customCategories} kategori`} />
                        </div>
                        <div className="dashboard-detail-preview-grid">
                          {budgetPlannerState.categories.slice(0, 4).map((category) => {
                            const checkedItems = category.items.filter((item) => item.checked);
                            return (
                              <div key={category.id} className="neo-panel-inset p-4">
                                <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  {checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada pos yang ditandai siap."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : feature.slug === "dokumen" ? (
                      <div className="space-y-4">
                        <div className="dashboard-detail-preview-grid">
                          <DashboardDetailCard label="Checklist legal" value={documentPlannerState.legalChecklist || "Belum diisi"} />
                          <DashboardDetailCard label="Item arsip" value={`${documentStats.checkedItems}/${documentStats.totalItems} item siap`} tone="strong" />
                          <DashboardDetailCard label="Kategori lengkap" value={`${documentStats.completedCategories}/${documentStats.totalCategories}`} tone="strong" />
                          <DashboardDetailCard label="Kategori tambahan" value={`${documentStats.customCategories} kategori`} />
                        </div>
                        <div className="dashboard-detail-preview-grid">
                          {documentPlannerState.categories.slice(0, 4).map((category) => {
                            const checkedItems = category.items.filter((item) => item.checked);
                            return (
                              <div key={category.id} className="neo-panel-inset p-4">
                                <p className="text-sm font-semibold text-slate-800">{category.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  {checkedItems.length ? checkedItems.map((item) => item.label).slice(0, 2).join(" • ") : "Belum ada item yang ditandai siap."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <DashboardDetailSection title="Ringkasan singkat" description={feature.description}>
                        <div />
                      </DashboardDetailSection>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </article>

        <div className="dashboard-side-stack">
          <article className="neo-panel p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                {/* Target Illustration */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                </svg>
              </div>
              <div>
                <p className="section-kicker">Langkah berikutnya</p>
                <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-slate-800">Fokus terdekat</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {nextFeatures.length ? nextFeatures.map((feature) => (
                <div key={feature.slug} className="neo-panel-inset p-4 hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] transition-colors">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{feature.step}</p>
                      <p className="mt-2 text-base font-semibold text-slate-800">{feature.title}</p>
                    </div>
                    <span
                      className={`dashboard-status-chip dashboard-state-chip is-${states[feature.slug].status.replaceAll(" ", "-")}`}
                      aria-label={states[feature.slug].status}
                      title={states[feature.slug].status}
                    >
                      {states[feature.slug].status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              )) : (
                <div className="neo-panel-inset p-4">
                  <p className="text-base font-semibold text-slate-800">Semua langkah inti sudah lengkap</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Anda bisa meninjau ulang vendor, anggaran, atau dokumen untuk memastikan semuanya tetap siap menjelang hari acara.</p>
                </div>
              )}
            </div>
          </article>

          <article className="neo-panel p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                {/* Clock/Calendar Illustration */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="section-kicker">Status cepat</p>
                <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-slate-800">Gambaran acara</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Konsep acara</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{snapshot.projectSetup.concept || "Belum diisi"}</p>
              </div>
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Terakhir diperbarui</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {snapshot.updatedAt ? new Date(snapshot.updatedAt).toLocaleString("id-ID") : "Belum ada penyimpanan permanen"}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}



