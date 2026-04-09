import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DUMMY_SESSION_COOKIE } from "@/lib/demo-account";
import { authModeEnabled } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DashboardAccess = {
  sessionEmail: string;
  accessLabel: string;
  isDemo: boolean;
};

export async function getOptionalDashboardAccess(): Promise<DashboardAccess | null> {
  const cookieStore = await cookies();
  const dummySessionEmail = cookieStore.get(DUMMY_SESSION_COOKIE)?.value ?? null;

  if (authModeEnabled) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && !dummySessionEmail) {
      return null;
    }

    return {
      sessionEmail: session?.user.email ?? dummySessionEmail ?? "-",
      accessLabel: session ? "Akun aktif" : "Akun contoh",
      isDemo: !session,
    };
  }

  if (!dummySessionEmail) {
    return null;
  }

  return {
    sessionEmail: dummySessionEmail,
    accessLabel: "Akun contoh",
    isDemo: true,
  };
}

export async function requireDashboardAccess(): Promise<DashboardAccess> {
  const access = await getOptionalDashboardAccess();

  if (!access) {
    redirect(
      "/login?message=Masuk+dengan+akun+contoh+sementara+untuk+membuka+halaman+utama",
    );
  }

  return access;
}
