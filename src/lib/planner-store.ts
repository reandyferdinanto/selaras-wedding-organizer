import { cookies } from "next/headers";

import { DUMMY_EMAIL, DUMMY_SESSION_COOKIE, PLANNER_NOTES_DRAFT_COOKIE, PROJECT_SETUP_DRAFT_COOKIE } from "@/lib/demo-account";
import { authModeEnabled } from "@/lib/env";
import { defaultPlannerSnapshot, demoPlannerSnapshot, hasPlannerContent, mergePlannerSnapshot, type PlannerSnapshot } from "@/lib/planner-data";
import { getPlannerSnapshotFromProjects, savePlannerSnapshotToProjects, shouldFallbackToMetadata, type SupabaseClientLike } from "@/lib/planner-db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getProjectSetupDraft() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PROJECT_SETUP_DRAFT_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getPlannerNotesDraft() {
  const cookieStore = await cookies();
  
  // Prioritas baca dari chunk jika ada _count untuk menghindari data stale 
  // jika cookie lama belum dihapus browser
  const countStr = cookieStore.get(PLANNER_NOTES_DRAFT_COOKIE + "_count")?.value;
  if (countStr) {
    let chunkedRaw = "";
    const count = parseInt(countStr, 10) || 0;
    let corrupted = false;

    for (let i = 0; i < count; i++) {
      const chunk = cookieStore.get(PLANNER_NOTES_DRAFT_COOKIE + "_" + i)?.value;
      if (chunk === undefined) {
        corrupted = true;
        break;
      }
      chunkedRaw += chunk;
    }

    if (!corrupted && chunkedRaw) {
      try {
        return JSON.parse(chunkedRaw);
      } catch (e) {
        // Jangan crash jika JSON tidak valid, berikan fallback ke cookie reguler
        console.error("Failed to parse chunked notes draft:", e);
      }
    }
  }

  const raw = cookieStore.get(PLANNER_NOTES_DRAFT_COOKIE)?.value || "";
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getDummySessionEmail() {
  const cookieStore = await cookies();
  return cookieStore.get(DUMMY_SESSION_COOKIE)?.value ?? null;
}

function withDrafts(snapshot: PlannerSnapshot, projectDraft: unknown, notesDraft: unknown) {
  return mergePlannerSnapshot({
    ...snapshot,
    projectSetup: {
      ...snapshot.projectSetup,
      ...((projectDraft && typeof projectDraft === "object") ? projectDraft : {}),
    },
    notes: {
      ...snapshot.notes,
      ...((notesDraft && typeof notesDraft === "object") ? notesDraft : {}),
    },
  });
}

export async function getPlannerSnapshot(): Promise<PlannerSnapshot> {
  const projectDraft = await getProjectSetupDraft();
  const notesDraft = await getPlannerNotesDraft();
  const dummySessionEmail = await getDummySessionEmail();

  if (dummySessionEmail === DUMMY_EMAIL) {
    return withDrafts(demoPlannerSnapshot, projectDraft, notesDraft);
  }

  if (!authModeEnabled) {
    return withDrafts(defaultPlannerSnapshot, projectDraft, notesDraft);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return withDrafts(defaultPlannerSnapshot, projectDraft, notesDraft);
  }

  const projectResult = await getPlannerSnapshotFromProjects(supabase as unknown as SupabaseClientLike, user);

  if (projectResult.snapshot) {
    return withDrafts(projectResult.snapshot, projectDraft, notesDraft);
  }

  const metadataSnapshot = mergePlannerSnapshot(user.user_metadata?.planner);

  if (hasPlannerContent(metadataSnapshot)) {
    return withDrafts(metadataSnapshot, projectDraft, notesDraft);
  }

  if (process.env.NODE_ENV === "development") {
    const seededSnapshot = mergePlannerSnapshot({
      ...defaultPlannerSnapshot,
      updatedAt: new Date().toISOString(),
    });
    const seedResult = await savePlannerSnapshotToProjects(supabase as unknown as SupabaseClientLike, user, seededSnapshot);

    if (seedResult.ok && seedResult.snapshot) {
      return withDrafts(seedResult.snapshot, projectDraft, notesDraft);
    }

    return withDrafts(seededSnapshot, projectDraft, notesDraft);
  }

  if (!projectResult.error || shouldFallbackToMetadata(projectResult.error)) {
    return withDrafts(metadataSnapshot, projectDraft, notesDraft);
  }

  return withDrafts(defaultPlannerSnapshot, projectDraft, notesDraft);
}
