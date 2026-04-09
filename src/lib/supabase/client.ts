"use client";

import { createBrowserClient } from "@supabase/ssr";

import { assertSupabaseEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { supabaseAnonKey, supabaseUrl } = assertSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
