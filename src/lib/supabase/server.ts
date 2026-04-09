import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { assertSupabaseEnv } from "@/lib/env";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { supabaseAnonKey, supabaseUrl } = assertSupabaseEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Penulisan cookie tidak diizinkan dari Server Component.
            // Cookie akan tetap ditangani di Server Action atau Route Handler.
          }
        });
      },
    },
  });
}
