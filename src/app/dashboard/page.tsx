import Link from "next/link";
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

  return (
    <div className="dashboard-overview-stack">
      <section className="neo-panel p-5 sm:p-6">
        <div className="dashboard-focus-shell">
          <div>
            <p className="section-kicker">Ringkasan dashboard</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-3xl">
              Lihat progres setiap langkah tanpa membuka semuanya satu per satu.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Dashboard ini merangkum bagian yang sudah berjalan baik, bagian yang masih perlu perhatian, dan langkah yang paling layak dilanjutkan berikutnya.
            </p>
          </div>
          <div className="dashboard-focus-meta">
            <span className={`dashboard-status-chip is-${overallStatus.replaceAll(" ", "-")}`}>{overallStatus}</span>
            <p className="dashboard-focus-value">{overallProgress}%</p>
          </div>
        </div>

        <div className="dashboard-progress-track mt-5" aria-hidden="true">
          <div className="dashboard-progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>

        <div className="dashboard-quickfacts mt-6">
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Pasangan</p>
            <p className="mt-2 text-base font-semibold text-slate-800">{couple || "Belum diisi"}</p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Agenda utama</p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {snapshot.projectSetup.weddingDate || "Tanggal belum diisi"}
              {snapshot.projectSetup.city ? ` | ${snapshot.projectSetup.city}` : ""}
            </p>
          </div>
          <div className="neo-panel-inset p-4">
            <p className="text-sm font-semibold text-slate-500">Template dan tamu</p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {snapshot.projectSetup.template || "Template belum diisi"}
              {snapshot.projectSetup.guestCount ? ` | ${snapshot.projectSetup.guestCount} tamu` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="neo-panel p-5 sm:p-6">
          <div className="dashboard-section-head">
            <div>
              <p className="section-kicker">Ringkasan langkah</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Pantau tiap langkah dengan lebih tenang</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Buka card yang dibutuhkan untuk melihat detail penting, lalu masuk ke halamannya saat Anda siap melanjutkan pengisian.
            </p>
          </div>

          <div className="dashboard-module-list mt-6">
            {dashboardFeatures.map((feature, index) => {
              const Icon = icons[feature.slug as keyof typeof icons];
              const state = states[feature.slug];
              const isProject = feature.slug === "proyek";

              return (
                <details key={feature.href} className="dashboard-module-accordion neo-panel-inset" open={index === 0}>
                  <summary className="dashboard-accordion-trigger">
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
                      </div>
                    </div>

                    <div className="dashboard-module-trailing">
                      <div className="dashboard-module-topline">
                        <span className={`dashboard-status-chip is-${state.status.replaceAll(" ", "-")}`}>{state.status}</span>
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
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                        <div className="neo-panel-inset p-4">
                          <p className="text-sm font-semibold text-slate-500">Nama mempelai</p>
                          <p className="mt-2 text-base font-semibold text-slate-800">{couple || "Belum diisi"}</p>
                        </div>
                        <div className="neo-panel-inset p-4">
                          <p className="text-sm font-semibold text-slate-500">Tanggal acara</p>
                          <p className="mt-2 text-base font-semibold text-slate-800">{formatWeddingDate(snapshot.projectSetup.weddingDate)}</p>
                        </div>
                        <div className="neo-panel-inset p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={15} />
                            <p className="text-sm font-semibold">Venue / lokasi</p>
                          </div>
                          <p className="mt-2 text-base font-semibold text-slate-800">{snapshot.projectSetup.venue || "Belum diisi"}</p>
                        </div>
                        <div className="neo-panel-inset p-4">
                          <p className="text-sm font-semibold text-slate-500">Jumlah tamu dan gaya acara</p>
                          <p className="mt-2 text-base font-semibold text-slate-800">
                            {snapshot.projectSetup.guestCount ? `${snapshot.projectSetup.guestCount} tamu` : "Tamu belum diisi"}
                            {snapshot.projectSetup.template ? ` | ${snapshot.projectSetup.template}` : ""}
                          </p>
                        </div>
                      </div>
                    ) : feature.slug === "timeline" ? (
                      <div className="space-y-4">
                        <div className="neo-panel-inset p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-500">Tracking timeline</p>
                              <p className="mt-2 text-sm leading-7 text-slate-700">Lihat alur lengkap tiap momen, tandai yang sudah selesai, lalu buka halaman tracking saat ingin mencetak panduan timeline ke PDF.</p>
                            </div>
                            <Link href="/dashboard/timeline/tracking" className="neo-button-secondary w-full justify-center sm:w-auto">
                              <Rows3 size={16} />
                              Buka tracking
                            </Link>
                          </div>
                          <div className="timeline-dashboard-stats mt-4">
                            <div className="neo-panel-inset p-3">
                              <p className="text-sm font-semibold text-slate-500">Tahap selesai</p>
                              <p className="mt-2 text-lg font-semibold text-slate-800">{completedTimelineCount}/{timelineGuideItems.length}</p>
                            </div>
                            <div className="neo-panel-inset p-3">
                              <p className="text-sm font-semibold text-slate-500">Masih berjalan</p>
                              <p className="mt-2 text-lg font-semibold text-slate-800">{pendingTimelineCount} tahap</p>
                            </div>
                          </div>
                        </div>
                        <TimelineGuidePreview items={timelineGuideItems} compact showQuickNotes />
                      </div>
                    ) : feature.slug === "vendor" ? (
                      <div className="space-y-4">
                        <div className="dashboard-detail-preview-grid">
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Arah paket</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">{vendorPlannerState.vendorAkadResepsiName || vendorPlannerState.vendorLamaranName || "Belum diisi"}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Checklist vendor</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{vendorStats.included}/{vendorStats.totalItems} item dipilih</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori lengkap</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{vendorStats.completedCategories}/{vendorStats.totalCategories}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{vendorStats.customCategories} kategori</p>
                          </div>
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
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Arah pembagian</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">{guestPlannerState.guestDirection || "Belum diisi"}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Saluran undangan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{guestPlannerState.invitationChannel || "Belum diisi"}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Checklist tamu</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{guestStats.checkedItems}/{guestStats.totalItems} item siap</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{guestStats.customCategories} kategori</p>
                          </div>
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
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Rentang budget</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{budgetPlannerState.budgetRange || "Belum diisi"}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Pos terpetakan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{budgetStats.checkedItems}/{budgetStats.totalItems} pos</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori lengkap</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{budgetStats.completedCategories}/{budgetStats.totalCategories}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{budgetStats.customCategories} kategori</p>
                          </div>
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
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Checklist legal</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">{documentPlannerState.legalChecklist || "Belum diisi"}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Item arsip</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{documentStats.checkedItems}/{documentStats.totalItems} item siap</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori lengkap</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{documentStats.completedCategories}/{documentStats.totalCategories}</p>
                          </div>
                          <div className="neo-panel-inset p-4">
                            <p className="text-sm font-semibold text-slate-500">Kategori tambahan</p>
                            <p className="mt-2 text-base font-semibold text-slate-800">{documentStats.customCategories} kategori</p>
                          </div>
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
                      <div className="neo-panel-inset p-4">
                        <p className="text-sm font-semibold text-slate-500">Ringkasan singkat</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{feature.description}</p>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </article>

        <div className="dashboard-side-stack">
          <article className="neo-panel p-5 sm:p-6">
            <p className="section-kicker">Langkah berikutnya</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Fokus terdekat</h2>
            <div className="mt-6 space-y-3">
              {nextFeatures.length ? nextFeatures.map((feature) => (
                <div key={feature.slug} className="neo-panel-inset p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{feature.step}</p>
                      <p className="mt-2 text-base font-semibold text-slate-800">{feature.title}</p>
                    </div>
                    <span className={`dashboard-status-chip is-${states[feature.slug].status.replaceAll(" ", "-")}`}>{states[feature.slug].status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </div>
              )) : (
                <div className="neo-panel-inset p-4">
                  <p className="text-base font-semibold text-slate-800">Semua langkah inti sudah lengkap</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Anda bisa meninjau ulang vendor, anggaran, atau dokumen untuk memastikan semuanya tetap siap menjelang hari acara.</p>
                </div>
              )}
            </div>
          </article>

          <article className="neo-panel p-5 sm:p-6">
            <p className="section-kicker">Status cepat</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Gambaran acara saat ini</h2>
            <div className="mt-6 space-y-3">
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Konsep acara</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{snapshot.projectSetup.concept || "Belum diisi"}</p>
              </div>
              <div className="neo-panel-inset p-4">
                <p className="text-sm font-semibold text-slate-500">Terakhir diperbarui</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
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



