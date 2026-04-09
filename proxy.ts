import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { assertSupabaseEnv } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (
    host.startsWith("127.0.0.1:3000") ||
    host.startsWith("localhost:3030") ||
    host.startsWith("127.0.0.1:3030")
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "localhost";
    url.port = "3000";
    return NextResponse.redirect(url, 307);
  }

  let response = NextResponse.next({ request });
  const { supabaseAnonKey, supabaseUrl } = assertSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
