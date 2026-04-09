import type { User } from "@supabase/supabase-js";

import { defaultPlannerSnapshot, mergePlannerSnapshot, type PlannerNotes, type PlannerSnapshot, type ProjectSetupValues } from "@/lib/planner-data";

type ProjectRow = {
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  city: string;
  venue: string;
  guest_count: number;
  template: string;
  concept: string;
  phase_plan: string;
  moments: string;
  next_steps: string;
  vendor_plan: string;
  guest_plan: string;
  budget_plan: string;
  document_plan: string;
  updated_at: string | null;
};

type ActionResult = {
  ok: boolean;
  message: string;
  snapshot?: PlannerSnapshot;
};

type QueryError = {
  code?: string;
  message?: string;
} | null;

type QueryBuilderLike = {
  select: (columns: string) => QueryBuilderLike;
  eq: (column: string, value: string) => QueryBuilderLike;
  maybeSingle: () => Promise<{ data: unknown; error: QueryError }>;
  upsert: (values: Record<string, unknown>, options: { onConflict: string }) => Promise<{ error: QueryError }>;
};

export type SupabaseClientLike = {
  from: (table: string) => QueryBuilderLike;
};

function mapRowToSnapshot(row: ProjectRow): PlannerSnapshot {
  return mergePlannerSnapshot({
    projectSetup: {
      brideName: row.bride_name,
      groomName: row.groom_name,
      weddingDate: row.wedding_date ?? "",
      city: row.city,
      venue: row.venue ?? "",
      guestCount: String(row.guest_count || 0),
      template: row.template,
      concept: row.concept,
    },
    notes: {
      phasePlan: row.phase_plan,
      moments: row.moments,
      nextSteps: row.next_steps,
      vendorPlan: row.vendor_plan,
      guestPlan: row.guest_plan,
      budgetPlan: row.budget_plan,
      documentPlan: row.document_plan,
    },
    updatedAt: row.updated_at,
  });
}

function buildInsertPayload(user: User, snapshot: PlannerSnapshot) {
  return {
    owner_user_id: user.id,
    bride_name: snapshot.projectSetup.brideName,
    groom_name: snapshot.projectSetup.groomName,
    wedding_date: snapshot.projectSetup.weddingDate || null,
    city: snapshot.projectSetup.city,
    venue: snapshot.projectSetup.venue,
    guest_count: Number(snapshot.projectSetup.guestCount || 0),
    template: snapshot.projectSetup.template,
    concept: snapshot.projectSetup.concept,
    phase_plan: snapshot.notes.phasePlan,
    moments: snapshot.notes.moments,
    next_steps: snapshot.notes.nextSteps,
    vendor_plan: snapshot.notes.vendorPlan,
    guest_plan: snapshot.notes.guestPlan,
    budget_plan: snapshot.notes.budgetPlan,
    document_plan: snapshot.notes.documentPlan,
  };
}

export async function getPlannerSnapshotFromProjects(supabase: SupabaseClientLike, user: User) {
  const { data, error } = await supabase
    .from("projects")
    .select("bride_name,groom_name,wedding_date,city,venue,guest_count,template,concept,phase_plan,moments,next_steps,vendor_plan,guest_plan,budget_plan,document_plan,updated_at")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error) {
    return { snapshot: null, error };
  }

  if (!data) {
    return { snapshot: null, error: null };
  }

  return { snapshot: mapRowToSnapshot(data as ProjectRow), error: null };
}

export async function savePlannerSnapshotToProjects(
  supabase: SupabaseClientLike,
  user: User,
  snapshot: PlannerSnapshot,
): Promise<ActionResult> {
  const nextSnapshot = mergePlannerSnapshot({
    ...snapshot,
    updatedAt: new Date().toISOString(),
  });

  const { error } = await supabase.from("projects").upsert(buildInsertPayload(user, nextSnapshot), {
    onConflict: "owner_user_id",
  });

  if (error) {
    return { ok: false, message: error.message ?? "Gagal menyimpan ke tabel projects." };
  }

  return {
    ok: true,
    message: "Perubahan berhasil disimpan ke database proyek.",
    snapshot: nextSnapshot,
  };
}

export async function saveProjectSetupToProjects(
  supabase: SupabaseClientLike,
  user: User,
  current: PlannerSnapshot,
  values: ProjectSetupValues,
): Promise<ActionResult> {
  const nextSnapshot = mergePlannerSnapshot({
    ...current,
    projectSetup: {
      ...current.projectSetup,
      ...values,
    },
    updatedAt: new Date().toISOString(),
  });

  return savePlannerSnapshotToProjects(supabase, user, nextSnapshot);
}

export async function savePlannerNotesToProjects(
  supabase: SupabaseClientLike,
  user: User,
  current: PlannerSnapshot,
  values: Partial<PlannerNotes>,
): Promise<ActionResult> {
  const nextSnapshot = mergePlannerSnapshot({
    ...current,
    notes: {
      ...current.notes,
      ...values,
    },
    updatedAt: new Date().toISOString(),
  });

  return savePlannerSnapshotToProjects(supabase, user, nextSnapshot);
}

export function shouldFallbackToMetadata(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  const message = String(error.message ?? "").toLowerCase();
  const code = String(error.code ?? "");

  return ["42P01", "PGRST116", "PGRST205", "42703"].includes(code)
    || message.includes("relation")
    || message.includes("projects")
    || message.includes("column")
    || message.includes("venue");
}

export function buildDefaultSnapshot() {
  return defaultPlannerSnapshot;
}
