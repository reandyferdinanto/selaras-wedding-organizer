"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DUMMY_EMAIL,
  DUMMY_PASSWORD,
  DUMMY_SESSION_COOKIE,
  PLANNER_NOTES_DRAFT_COOKIE,
  PROJECT_SETUP_DRAFT_COOKIE,
} from "@/lib/demo-account";
import { authModeEnabled } from "@/lib/env";
import {
  getPlannerSnapshotFromProjects,
  savePlannerNotesToProjects,
  saveProjectSetupToProjects,
  shouldFallbackToMetadata,
  type SupabaseClientLike,
} from "@/lib/planner-db";
import { defaultPlannerSnapshot, mergePlannerSnapshot, type PlannerNotes, type ProjectSetupValues } from "@/lib/planner-data";
import { compactTimelinePhasePlanForDraft } from "@/lib/planner-modules";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeEmail(email: string) {
  return email
    .trim()
    .replace(/^['"\u201c\u201d\u2018\u2019]+|['"\u201c\u201d\u2018\u2019]+$/g, "")
    .toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildRedirectUrl(
  path: string,
  message: string,
  fields?: Record<string, string>,
) {
  const params = new URLSearchParams({ message });

  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  }

  return `${path}?${params.toString()}`;
}

async function setDummySession(email: string) {
  const cookieStore = await cookies();

  cookieStore.set(DUMMY_SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearDummySession() {
  const cookieStore = await cookies();
  cookieStore.delete(DUMMY_SESSION_COOKIE);
}

async function saveProjectSetupDraft(values: ProjectSetupValues) {
  const cookieStore = await cookies();
  cookieStore.set(PROJECT_SETUP_DRAFT_COOKIE, JSON.stringify(values), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

async function clearProjectSetupDraft() {
  const cookieStore = await cookies();
  cookieStore.delete(PROJECT_SETUP_DRAFT_COOKIE);
}

async function savePlannerNotesDraft(values: Partial<PlannerNotes>) {
  const cookieStore = await cookies();
  let existingRaw = cookieStore.get(PLANNER_NOTES_DRAFT_COOKIE)?.value || "";
  
  if (!existingRaw) {
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
      if (!corrupted) {
        existingRaw = chunkedRaw;
      }
    }
  }

  let existing: Partial<PlannerNotes> = {};
  if (existingRaw) {
    try {
      existing = JSON.parse(existingRaw) as Partial<PlannerNotes>;
    } catch {
      existing = {};
    }
  }

  const draftValues: Partial<PlannerNotes> = {
    ...existing,
    ...values,
  };

  if (typeof draftValues.phasePlan === "string" && draftValues.phasePlan.trim().startsWith("{")) {
    draftValues.phasePlan = compactTimelinePhasePlanForDraft(draftValues.phasePlan);
  }

  // Strip huge base64 images from cookies to prevent HTTP ERROR 431 Request Header Fields Too Large
  if (typeof draftValues.vendorPlan === "string" && draftValues.vendorPlan.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(draftValues.vendorPlan);
      if (parsed.cateringStatus?.categories) {
        parsed.cateringStatus.categories.forEach((cat: any) => {
          if (cat.items) {
            cat.items.forEach((item: any) => {
              if (item.imageUrl) {
                delete item.imageUrl;
              }
            });
          }
        });
      }
      draftValues.vendorPlan = JSON.stringify(parsed);
    } catch {}
  }

  const str = JSON.stringify(draftValues);
  const CHUNK_SIZE = 3000;
  const chunks = Math.ceil(str.length / CHUNK_SIZE);
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };

  cookieStore.set(PLANNER_NOTES_DRAFT_COOKIE + "_count", String(chunks), opts);
  for (let i = 0; i < chunks; i++) {
    cookieStore.set(PLANNER_NOTES_DRAFT_COOKIE + "_" + i, str.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), opts);
  }
  
  cookieStore.delete(PLANNER_NOTES_DRAFT_COOKIE);
}

async function clearPlannerNotesDraft() {
  const cookieStore = await cookies();
  cookieStore.delete(PLANNER_NOTES_DRAFT_COOKIE);
  
  const countStr = cookieStore.get(PLANNER_NOTES_DRAFT_COOKIE + "_count")?.value;
  if (countStr) {
    const count = parseInt(countStr, 10) || 0;
    for (let i = 0; i < count; i++) {
      cookieStore.delete(PLANNER_NOTES_DRAFT_COOKIE + "_" + i);
    }
    cookieStore.delete(PLANNER_NOTES_DRAFT_COOKIE + "_count");
  }
}

async function getAuthenticatedPlannerContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (session?.user) {
    return {
      supabase,
      user: session.user,
      message: null,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (user) {
    return {
      supabase,
      user,
      message: null,
    };
  }

  return {
    supabase,
    user: null,
    message: sessionError?.message || userError?.message || "Sesi akun tidak ditemukan. Silakan login kembali.",
  };
}

async function updatePlannerMetadata(mutator: (current: typeof defaultPlannerSnapshot) => typeof defaultPlannerSnapshot) {
  if (!authModeEnabled) {
    return {
      ok: false,
      message: "Akun contoh belum menyimpan data permanen. Login dengan akun aktif untuk menyimpan ke Supabase.",
    };
  }

  const context = await getAuthenticatedPlannerContext();

  if (!context.user) {
    return {
      ok: false,
      message: context.message ?? "Sesi akun tidak ditemukan. Silakan login kembali.",
    };
  }

  const { supabase, user } = context;
  const currentSnapshot = mergePlannerSnapshot(user.user_metadata?.planner);
  const nextSnapshot = {
    ...mutator(currentSnapshot),
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      planner: nextSnapshot,
    },
  });

  if (error) {
    return {
      ok: false,
      message: `Gagal menyimpan data: ${error.message}`,
    };
  }

  return {
    ok: true,
    message: "Perubahan berhasil disimpan ke akun Anda.",
    snapshot: nextSnapshot,
  };
}

function revalidatePlannerRoutes() {
  revalidatePath("/dashboard", "layout");
}

async function updateProjectSetupStorage(values: ProjectSetupValues) {
  await saveProjectSetupDraft(values);
  revalidatePlannerRoutes();

  if (!authModeEnabled) {
    return {
      ok: true,
      message: "Perubahan disimpan sementara di browser ini. Login dengan akun aktif untuk menyimpan ke Supabase.",
      snapshot: mergePlannerSnapshot({ projectSetup: values }),
    };
  }

  const context = await getAuthenticatedPlannerContext();

  if (!context.user) {
    return {
      ok: true,
      message: "Perubahan disimpan sementara di browser ini. Sesi akun sedang belum sinkron, jadi silakan lanjutkan dulu dan login ulang nanti bila perlu.",
      snapshot: mergePlannerSnapshot({ projectSetup: values }),
    };
  }

  const { supabase, user } = context;

  // ✅ Baca snapshot terkini dari tabel projects terlebih dahulu
  const projectResult = await getPlannerSnapshotFromProjects(supabase as unknown as SupabaseClientLike, user);
  const currentSnapshot = projectResult.snapshot
    ?? mergePlannerSnapshot(user.user_metadata?.planner);

  const tableResult = await saveProjectSetupToProjects(supabase as unknown as SupabaseClientLike, user, currentSnapshot, values);


  if (tableResult.ok) {
    return {
      ...tableResult,
      message: "Perubahan berhasil disimpan.",
    };
  }

  if (!shouldFallbackToMetadata({ message: tableResult.message })) {
    return {
      ok: true,
      message: "Perubahan disimpan sementara di browser ini. Penyimpanan akun masih bermasalah dan akan dicek lagi.",
      snapshot: mergePlannerSnapshot({
        ...currentSnapshot,
        projectSetup: {
          ...currentSnapshot.projectSetup,
          ...values,
        },
      }),
    };
  }

  const metadataResult = await updatePlannerMetadata((current) => ({
    ...current,
    projectSetup: {
      ...current.projectSetup,
      ...values,
    },
  }));

  if (metadataResult.ok) {
    return {
      ...metadataResult,
      message: "Perubahan berhasil disimpan.",
    };
  }

  return {
    ok: true,
    message: "Perubahan disimpan sementara di browser ini. Penyimpanan akun masih disiapkan agar stabil.",
    snapshot: mergePlannerSnapshot({
      ...currentSnapshot,
      projectSetup: {
        ...currentSnapshot.projectSetup,
        ...values,
      },
    }),
  };
}

export async function updatePlannerNotesStorage(values: Partial<PlannerNotes>) {
  await savePlannerNotesDraft(values);
  revalidatePlannerRoutes();

  if (!authModeEnabled) {
    return {
      ok: true,
      message: "Perubahan timeline disimpan sementara di browser ini. Login dengan akun aktif untuk menyimpan ke Supabase.",
      snapshot: mergePlannerSnapshot({ notes: values }),
    };
  }

  const context = await getAuthenticatedPlannerContext();

  if (!context.user) {
    return {
      ok: true,
      message: "Perubahan timeline disimpan sementara di browser ini. Sesi akun belum sinkron, jadi silakan lanjutkan dulu dan login ulang nanti bila perlu.",
      snapshot: mergePlannerSnapshot({ notes: values }),
    };
  }

  const { supabase, user } = context;

  // ✅ Baca snapshot terkini dari tabel projects terlebih dahulu,
  //    bukan dari user_metadata supaya data yang sudah ada tidak tertimpa.
  const projectResult = await getPlannerSnapshotFromProjects(supabase as unknown as SupabaseClientLike, user);
  const currentSnapshot = projectResult.snapshot
    ?? mergePlannerSnapshot(user.user_metadata?.planner);

  const tableResult = await savePlannerNotesToProjects(supabase as unknown as SupabaseClientLike, user, currentSnapshot, values);


  if (tableResult.ok) {
    return {
      ...tableResult,
      message: "Perubahan berhasil disimpan.",
    };
  }

  if (!shouldFallbackToMetadata({ message: tableResult.message })) {
    return {
      ok: true,
      message: "Perubahan timeline disimpan sementara di browser ini. Penyimpanan akun masih bermasalah dan akan dicek lagi.",
      snapshot: mergePlannerSnapshot({
        ...currentSnapshot,
        notes: {
          ...currentSnapshot.notes,
          ...values,
        },
      }),
    };
  }

  const metadataResult = await updatePlannerMetadata((current) => ({
    ...current,
    notes: {
      ...current.notes,
      ...values,
    },
  }));

  if (metadataResult.ok) {
    return {
      ...metadataResult,
      message: "Perubahan berhasil disimpan.",
    };
  }

  return {
    ok: true,
    message: "Perubahan timeline disimpan sementara di browser ini. Penyimpanan akun masih disiapkan agar stabil.",
    snapshot: mergePlannerSnapshot({
      ...currentSnapshot,
      notes: {
        ...currentSnapshot.notes,
        ...values,
      },
    }),
  };
}

export async function signInAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");

  if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
    await setDummySession(email);
    redirect("/dashboard");
  }

  if (!authModeEnabled) {
    redirect(
      buildRedirectUrl(
        "/login",
        "Gunakan akun contoh sementara untuk masuk: demo@selaras.app / Selaras123!",
        { email },
      ),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(buildRedirectUrl("/login", error.message, { email }));
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const fullName = getString(formData, "fullName");
  const weddingDate = getString(formData, "weddingDate");
  const preservedFields = {
    email,
    fullName,
    weddingDate,
  };

  if (!authModeEnabled) {
    redirect(
      buildRedirectUrl(
        "/register",
        "Pendaftaran akun masih dalam tahap penyiapan. Sementara itu, gunakan akun contoh untuk masuk.",
        preservedFields,
      ),
    );
  }

  if (!isValidEmail(email)) {
    redirect(
      buildRedirectUrl(
        "/register",
        "Format email belum terbaca dengan benar. Coba isi tanpa tanda kutip atau spasi tambahan.",
        preservedFields,
      ),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        weddingDate,
      },
    },
  });

  if (error) {
    let message = error.message;

    if (error.message.includes("rate limit") || error.status === 429) {
      message = "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
    } else if (error.message.includes("email_address_invalid") || error.message.includes("Email address")) {
      message = "Email ditolak oleh sistem. Gunakan email yang valid dan bukan email disposable/temporary.";
    } else if (error.message.includes("already registered") || error.message.includes("User already registered")) {
      message = "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
    } else if (error.message.includes("Password")) {
      message = "Password minimal 6 karakter.";
    }

    redirect(buildRedirectUrl("/register", message, preservedFields));
  }

  redirect(
    "/login?message=Registrasi+berhasil.+Cek+email+Anda+jika+diperlukan+konfirmasi+akun.",
  );
}

export async function saveProjectSetupAction(values: ProjectSetupValues) {
  return updateProjectSetupStorage(values);
}

export async function savePlannerNotesAction(values: Partial<PlannerNotes>) {
  return updatePlannerNotesStorage(values);
}

export async function signOutAction() {
  await clearDummySession();
  await clearProjectSetupDraft();
  await clearPlannerNotesDraft();

  if (authModeEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/login?message=Anda+sudah+keluar+dari+akun.");
}

