import type { PlannerNotes, PlannerSnapshot } from "@/lib/planner-data";
import {
  createDefaultTimelineStages,
  mergeTimelineStages,
  timelineStageConfig,
  timelineStageLabels,
  type TimelineStageLabel,
  type TimelineStageRecord,
} from "@/lib/timeline-guide";
import { buildVendorPlannerState, getVendorChecklistStats } from "@/lib/vendor-guide";
import { buildGuestPlannerState, getGuestChecklistStats } from "@/lib/guest-guide";
import { buildBudgetPlannerState, getBudgetChecklistStats } from "@/lib/budget-guide";
import { buildDocumentPlannerState, getDocumentChecklistStats } from "@/lib/document-guide";

export type FeatureStatus = "belum diisi" | "sedang disusun" | "selesai";

export type TimelineModule = {
  planningWindow: string;
  stageFocus: string;
  mainMoments: string;
  familyFlow: string;
  nextPriority: string;
  stages: Record<TimelineStageLabel, TimelineStageRecord>;
};

export type VendorModule = {
  venueStatus: string;
  cateringStatus: any;
  documentationStatus: string;
  coordinatorNeed: string;
  paymentPlan: string;
};

export type GuestModule = {
  guestGroups: string;
  invitationChannel: string;
  rsvpOwner: string;
  familySeating: string;
  hospitalityNotes: string;
};

export type BudgetModule = {
  totalRange: string;
  biggestExpense: string;
  paymentStrategy: string;
  reserveFund: string;
  budgetControl: string;
};

export type DocumentModule = {
  legalChecklist: string;
  familyDocuments: string;
  vendorContracts: string;
  paymentProofs: string;
  finalArchive: string;
};

export type FeatureState = {
  progress: number;
  status: FeatureStatus;
  summary: string;
};

type WeightedField = {
  value: unknown;
  defaultValue?: unknown;
  weight: number;
};

type ParsedTimelinePayload = Partial<Omit<TimelineModule, "stages">> & {
  stages?: Partial<Record<TimelineStageLabel, Partial<TimelineStageRecord>>>;
};

export const timelineDefaults: TimelineModule = {
  planningWindow: "",
  stageFocus: "",
  mainMoments: "",
  familyFlow: "",
  nextPriority: "",
  stages: createDefaultTimelineStages(),
};

export const vendorDefaults: VendorModule = {
  venueStatus: "",
  cateringStatus: "",
  documentationStatus: "",
  coordinatorNeed: "",
  paymentPlan: "",
};

export const guestDefaults: GuestModule = {
  guestGroups: "",
  invitationChannel: "",
  rsvpOwner: "",
  familySeating: "",
  hospitalityNotes: "",
};

export const budgetDefaults: BudgetModule = {
  totalRange: "",
  biggestExpense: "",
  paymentStrategy: "",
  reserveFund: "",
  budgetControl: "",
};

export const documentDefaults: DocumentModule = {
  legalChecklist: "",
  familyDocuments: "",
  vendorContracts: "",
  paymentProofs: "",
  finalArchive: "",
};

function parseJsonObject<T>(value: string, fallback: T): T {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value) as Partial<T>;
    if (parsed && typeof parsed === "object") {
      return { ...fallback, ...parsed };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function normalizeFieldValue(value: unknown) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
}

function normalizeTimelineLabel(value: string): TimelineStageLabel {
  if (timelineStageLabels.includes(value as TimelineStageLabel)) {
    return value as TimelineStageLabel;
  }

  return timelineStageLabels[0];
}

function getSelectedStage(values: Pick<TimelineModule, "planningWindow" | "stages">): TimelineStageLabel {
  const explicit = normalizeFieldValue(values.planningWindow);

  if (explicit) {
    return normalizeTimelineLabel(explicit);
  }

  const completedStage = timelineStageLabels.find((label) => values.stages[label]?.completed === false);
  return completedStage ?? timelineStageLabels[0];
}

export function readTimelineModule(notes: PlannerNotes): TimelineModule {
  if (notes.phasePlan.trim().startsWith("{")) {
    const parsed = parseJsonObject<ParsedTimelinePayload>(notes.phasePlan, {});
    const stages = mergeTimelineStages(parsed.stages);
    const selectedStage = parsed.planningWindow ? normalizeTimelineLabel(parsed.planningWindow) : timelineStageLabels[0];
    const selectedStageEntry = stages[selectedStage];

    return {
      planningWindow: selectedStage,
      stageFocus: normalizeFieldValue(parsed.stageFocus) || selectedStageEntry.summary,
      mainMoments: normalizeFieldValue(parsed.mainMoments) || selectedStageEntry.schedule,
      familyFlow: normalizeFieldValue(parsed.familyFlow) || selectedStageEntry.vendor,
      nextPriority: normalizeFieldValue(parsed.nextPriority) || selectedStageEntry.next,
      stages,
    };
  }

  const stages = createDefaultTimelineStages();
  const selectedStage = timelineStageLabels[0];
  stages[selectedStage] = {
    ...stages[selectedStage],
    summary: notes.phasePlan || stages[selectedStage].summary,
    schedule: notes.moments || stages[selectedStage].schedule,
    next: notes.nextSteps || stages[selectedStage].next,
  };

  return {
    planningWindow: selectedStage,
    stageFocus: stages[selectedStage].summary,
    mainMoments: stages[selectedStage].schedule,
    familyFlow: stages[selectedStage].vendor,
    nextPriority: stages[selectedStage].next,
    stages,
  };
}

export function readVendorModule(notes: PlannerNotes): VendorModule {
  if (notes.vendorPlan.trim().startsWith("{")) {
    return parseJsonObject<VendorModule>(notes.vendorPlan, vendorDefaults);
  }

  return {
    ...vendorDefaults,
    venueStatus: notes.vendorPlan || "",
  };
}

export function readGuestModule(notes: PlannerNotes): GuestModule {
  if (notes.guestPlan.trim().startsWith("{")) {
    return parseJsonObject<GuestModule>(notes.guestPlan, guestDefaults);
  }

  return {
    ...guestDefaults,
    guestGroups: notes.guestPlan || "",
  };
}

export function readBudgetModule(notes: PlannerNotes): BudgetModule {
  if (notes.budgetPlan.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(notes.budgetPlan);
      // Jika ini format Budget V2 (punya field version === 2 atau stages)
      if (parsed.version === 2 || Array.isArray(parsed.stages)) {
        return {
          totalRange: parsed.budgetRange || "",
          biggestExpense: "Terisi di Anggaran (V2)",
          paymentStrategy: "Terisi di Anggaran (V2)",
          reserveFund: "Terisi di Anggaran (V2)",
          budgetControl: notes.budgetPlan, // Simpan JSON asli untuk buildBudgetPlannerState jika perlu
        };
      }
    } catch (e) {
      // Gagal parse JSON, lanjut ke fallback
    }
    return parseJsonObject<BudgetModule>(notes.budgetPlan, budgetDefaults);
  }

  return {
    ...budgetDefaults,
    biggestExpense: notes.budgetPlan || "",
  };
}

export function readDocumentModule(notes: PlannerNotes): DocumentModule {
  if (notes.documentPlan.trim().startsWith("{")) {
    return parseJsonObject<DocumentModule>(notes.documentPlan, documentDefaults);
  }

  return {
    ...documentDefaults,
    legalChecklist: notes.documentPlan || "",
  };
}

export function serializeTimelineModule(values: TimelineModule): Partial<PlannerNotes> {
  const selectedStage = getSelectedStage(values);
  const nextStages = mergeTimelineStages(values.stages);

  nextStages[selectedStage] = {
    ...nextStages[selectedStage],
    summary: values.stageFocus,
    schedule: values.mainMoments,
    vendor: values.familyFlow,
    next: values.nextPriority || nextStages[selectedStage].next,
  };

  return {
    phasePlan: JSON.stringify({
      planningWindow: selectedStage,
      stageFocus: values.stageFocus,
      mainMoments: values.mainMoments,
      familyFlow: values.familyFlow,
      nextPriority: values.nextPriority,
      stages: nextStages,
    }),
    moments: [values.mainMoments, values.familyFlow].filter(Boolean).join("\n"),
    nextSteps: values.nextPriority,
  };
}

export function compactTimelinePhasePlanForDraft(phasePlan: string) {
  if (!normalizeFieldValue(phasePlan).startsWith("{")) {
    return phasePlan;
  }

  const parsed = parseJsonObject<ParsedTimelinePayload>(phasePlan, {});
  const defaults = createDefaultTimelineStages();
  const stages = mergeTimelineStages(parsed.stages);
  const compactStages = timelineStageLabels.reduce<Partial<Record<TimelineStageLabel, Partial<TimelineStageRecord>>>>((acc, label) => {
    const stage = stages[label];
    const base = defaults[label];
    const nextStage: Partial<TimelineStageRecord> = {};

    if (normalizeFieldValue(stage.summary) !== normalizeFieldValue(base.summary)) {
      nextStage.summary = stage.summary;
    }

    if (normalizeFieldValue(stage.schedule) !== normalizeFieldValue(base.schedule)) {
      nextStage.schedule = stage.schedule;
    }

    if (normalizeFieldValue(stage.vendor) !== normalizeFieldValue(base.vendor)) {
      nextStage.vendor = stage.vendor;
    }

    if (normalizeFieldValue(stage.next) !== normalizeFieldValue(base.next)) {
      nextStage.next = stage.next;
    }

    if (stage.completed) {
      nextStage.completed = true;
    }

    if (normalizeFieldValue(stage.quickNote).length > 0) {
      nextStage.quickNote = stage.quickNote;
    }

    if (Object.keys(nextStage).length > 0) {
      acc[label] = nextStage;
    }

    return acc;
  }, {});

  return JSON.stringify({
    planningWindow: parsed.planningWindow,
    stageFocus: parsed.stageFocus,
    mainMoments: parsed.mainMoments,
    familyFlow: parsed.familyFlow,
    nextPriority: parsed.nextPriority,
    stages: compactStages,
  });
}

export function serializeVendorModule(values: VendorModule): Partial<PlannerNotes> {
  return { vendorPlan: JSON.stringify(values) };
}

export function serializeGuestModule(values: GuestModule): Partial<PlannerNotes> {
  return { guestPlan: JSON.stringify(values) };
}

export function serializeBudgetModule(values: BudgetModule): Partial<PlannerNotes> {
  return { budgetPlan: JSON.stringify(values) };
}

export function serializeDocumentModule(values: DocumentModule): Partial<PlannerNotes> {
  return { documentPlan: JSON.stringify(values) };
}

function getWeightedProgress(fields: WeightedField[]) {
  const total = fields.reduce((sum, field) => sum + field.weight, 0);
  const filled = fields.reduce((sum, field) => {
    const current = normalizeFieldValue(field.value);
    const fallback = normalizeFieldValue(field.defaultValue);
    return current.length > 0 && current !== fallback ? sum + field.weight : sum;
  }, 0);

  return {
    filled,
    total,
    progress: Math.round((filled / total) * 100),
  };
}

function getStatusFromRatio(filled: number, total: number): FeatureStatus {
  if (filled === 0) return "belum diisi";
  if (filled === total) return "selesai";
  return "sedang disusun";
}

export function getTimelineGuideItems(module: TimelineModule) {
  const selectedStage = getSelectedStage(module);
  const selectedIndex = timelineStageLabels.findIndex((label) => label === selectedStage);

  return timelineStageLabels.map((label, index) => {
    const config = timelineStageConfig[label];
    const stage = module.stages[label] ?? createDefaultTimelineStages()[label];
    const isCurrent = label === selectedStage;
    const state: "done" | "current" | "upcoming" = stage.completed ? "done" : isCurrent ? "current" : index < selectedIndex ? "done" : "upcoming";

    return {
      label,
      state,
      completed: stage.completed,
      quickNote: stage.quickNote,
      overview: config.overview,
      review: {
        summary: isCurrent ? module.stageFocus || stage.summary : stage.summary,
        schedule: isCurrent ? module.mainMoments || stage.schedule : stage.schedule,
        vendor: isCurrent ? module.familyFlow || stage.vendor : stage.vendor,
        next: isCurrent ? module.nextPriority || stage.next : stage.next,
      },
    };
  });
}

export function sortTimelineGuideItemsForWorkboard(items: ReturnType<typeof getTimelineGuideItems>) {
  return [...items].sort((left, right) => {
    const rank = (item: (typeof items)[number]) => {
      if (item.state === "current") return 0;
      if (!item.completed) return 1;
      return 2;
    };

    const rankDiff = rank(left) - rank(right);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const leftIndex = timelineStageLabels.indexOf(left.label);
    const rightIndex = timelineStageLabels.indexOf(right.label);
    return leftIndex - rightIndex;
  });
}
export function getFeatureState(snapshot: PlannerSnapshot): Record<string, FeatureState> {
  const timeline = readTimelineModule(snapshot.notes);
  const vendor = readVendorModule(snapshot.notes);
  const vendorPlannerState = buildVendorPlannerState(vendor);
  const vendorStats = getVendorChecklistStats(vendorPlannerState.categories);
  const guest = readGuestModule(snapshot.notes);
  const guestPlannerState = buildGuestPlannerState(guest);
  const guestStats = getGuestChecklistStats(guestPlannerState.categories);
  const budget = readBudgetModule(snapshot.notes);
  const budgetPlannerState = buildBudgetPlannerState(budget);
  const budgetStats = getBudgetChecklistStats(budgetPlannerState.categories);
  const document = readDocumentModule(snapshot.notes);
  const documentPlannerState = buildDocumentPlannerState(document);
  const documentStats = getDocumentChecklistStats(documentPlannerState.categories);
  const timelineItems = getTimelineGuideItems(timeline);
  const completedTimelineStages = timelineItems.filter((item) => item.completed).length;

  const projectProgress = getWeightedProgress([
    { value: snapshot.projectSetup.brideName, weight: 1.5 },
    { value: snapshot.projectSetup.groomName, weight: 1.5 },
    { value: snapshot.projectSetup.weddingDate, weight: 2 },
    { value: snapshot.projectSetup.city, weight: 1.5 },
    { value: snapshot.projectSetup.guestCount, weight: 1.5 },
    { value: snapshot.projectSetup.template, weight: 1.5 },
    { value: snapshot.projectSetup.concept, weight: 1 },
  ]);

  const timelineProgress = getWeightedProgress([
    { value: completedTimelineStages ? String(completedTimelineStages) : "", weight: 1.75 },
    { value: timeline.planningWindow, defaultValue: timelineDefaults.planningWindow, weight: 1.5 },
    { value: timeline.stageFocus, defaultValue: timelineDefaults.stageFocus, weight: 2 },
    { value: timeline.mainMoments, defaultValue: timelineDefaults.mainMoments, weight: 1.75 },
    { value: timeline.familyFlow, defaultValue: timelineDefaults.familyFlow, weight: 1.5 },
  ]);

  const vendorProgress = getWeightedProgress([
    { value: vendor.venueStatus, defaultValue: vendorDefaults.venueStatus, weight: 2 },
    { value: vendor.cateringStatus, defaultValue: vendorDefaults.cateringStatus, weight: 1.5 },
    { value: vendor.documentationStatus, defaultValue: vendorDefaults.documentationStatus, weight: 1.5 },
    { value: vendor.coordinatorNeed, defaultValue: vendorDefaults.coordinatorNeed, weight: 1 },
    { value: vendor.paymentPlan, defaultValue: vendorDefaults.paymentPlan, weight: 1.5 },
  ]);

  const guestProgress = getWeightedProgress([
    { value: guest.guestGroups, defaultValue: guestDefaults.guestGroups, weight: 2 },
    { value: guest.invitationChannel, defaultValue: guestDefaults.invitationChannel, weight: 1.5 },
    { value: guest.rsvpOwner, defaultValue: guestDefaults.rsvpOwner, weight: 1.5 },
    { value: guest.familySeating, defaultValue: guestDefaults.familySeating, weight: 1 },
    { value: guest.hospitalityNotes, defaultValue: guestDefaults.hospitalityNotes, weight: 1 },
  ]);

  const budgetProgress = getWeightedProgress([
    { value: budget.totalRange, defaultValue: budgetDefaults.totalRange, weight: 2 },
    { value: budget.biggestExpense, defaultValue: budgetDefaults.biggestExpense, weight: 1.5 },
    { value: budget.paymentStrategy, defaultValue: budgetDefaults.paymentStrategy, weight: 1.5 },
    { value: budget.reserveFund, defaultValue: budgetDefaults.reserveFund, weight: 1 },
    { value: budget.budgetControl, defaultValue: budgetDefaults.budgetControl, weight: 1 },
  ]);

  const documentProgress = getWeightedProgress([
    { value: document.legalChecklist, defaultValue: documentDefaults.legalChecklist, weight: 2 },
    { value: document.familyDocuments, defaultValue: documentDefaults.familyDocuments, weight: 1.5 },
    { value: document.vendorContracts, defaultValue: documentDefaults.vendorContracts, weight: 1.5 },
    { value: document.paymentProofs, defaultValue: documentDefaults.paymentProofs, weight: 1 },
    { value: document.finalArchive, defaultValue: documentDefaults.finalArchive, weight: 1 },
  ]);

  const activeTimelineItem = timelineItems.find((item) => item.state === "current") ?? timelineItems[0];

  return {
    proyek: {
      progress: projectProgress.progress,
      status: getStatusFromRatio(projectProgress.filled, projectProgress.total),
      summary: projectProgress.filled ? `${snapshot.projectSetup.template} | ${snapshot.projectSetup.city} | ${snapshot.projectSetup.guestCount} tamu` : "Data acara utama belum dilengkapi.",
    },
    timeline: {
      progress: timelineProgress.progress,
      status: getStatusFromRatio(timelineProgress.filled, timelineProgress.total),
      summary: timelineProgress.filled ? `${completedTimelineStages}/${timelineStageLabels.length} tahap ditandai | ${activeTimelineItem.label}` : "Detail tahap acara belum diisi.",
    },
    vendor: {
      progress: vendorProgress.progress,
      status: getStatusFromRatio(vendorProgress.filled, vendorProgress.total),
      summary: vendorProgress.filled ? `${vendorPlannerState.vendorAkadResepsiName || vendorPlannerState.vendorLamaranName || "Checklist vendor"} | ${vendorStats.included}/${vendorStats.totalItems} item` : "Prioritas vendor belum diisi.",
    },
    tamu: {
      progress: guestProgress.progress,
      status: getStatusFromRatio(guestProgress.filled, guestProgress.total),
      summary: guestProgress.filled ? `${guestPlannerState.invitationChannel || "Daftar tamu"} | ${guestStats.checkedItems}/${guestStats.totalItems} item` : "Data tamu dan RSVP belum diisi.",
    },
    anggaran: {
      progress: budgetProgress.progress,
      status: getStatusFromRatio(budgetProgress.filled, budgetProgress.total),
      summary: budgetProgress.filled ? `${budgetPlannerState.budgetRange || "Arah anggaran"} | ${budgetStats.checkedItems}/${budgetStats.totalItems} pos` : "Kontrol anggaran belum diisi.",
    },
    dokumen: {
      progress: documentProgress.progress,
      status: getStatusFromRatio(documentProgress.filled, documentProgress.total),
      summary: documentProgress.filled ? `${documentPlannerState.legalChecklist || "Arsip dokumen"} | ${documentStats.checkedItems}/${documentStats.totalItems} item` : "Catatan dokumen belum diisi.",
    },
  };
}

export function getOverallProgress(snapshot: PlannerSnapshot) {
  const states = getFeatureState(snapshot);
  const values = Object.values(states).map((item) => item.progress);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}



