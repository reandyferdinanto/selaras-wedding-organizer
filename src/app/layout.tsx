import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { getOptionalDashboardAccess } from "@/lib/dashboard-access";
import { signOutAction } from "@/lib/supabase/actions";

import "./globals.css";

export const metadata: Metadata = {
  title: "Selaras Wedding Planner",
  description:
    "Aplikasi perencanaan pernikahan untuk membantu mengatur rangkaian acara, tamu, vendor, dan anggaran.",
};

type ThemeMode = "light" | "dark";

function readTheme(value: string | undefined): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = readTheme(cookieStore.get("selaras-theme")?.value);
  const access = await getOptionalDashboardAccess();

  return (
    <html lang="id" className="h-full antialiased" data-theme={initialTheme} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <div className="app-shell-header mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pt-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="neo-badge shrink-0">
              Selaras Planner
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle initialTheme={initialTheme} />
              <nav className="hidden items-center gap-3 md:flex">
                {access ? (
                  <>
                    <Link href="/dashboard" className="neo-button-secondary">
                      Dashboard
                    </Link>
                    <form action={signOutAction}>
                      <button type="submit" className="neo-button-primary">
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="neo-button-secondary">
                      Login
                    </Link>
                    <Link href="/register" className="neo-button-primary">
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
          {access ? (
            <nav className="grid grid-cols-2 gap-3 md:hidden">
              <Link href="/dashboard" className="neo-button-secondary w-full justify-center">
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="neo-button-primary w-full justify-center">
                  Logout
                </button>
              </form>
            </nav>
          ) : (
            <nav className="grid grid-cols-2 gap-3 md:hidden">
              <Link href="/login" className="neo-button-secondary w-full justify-center">
                Login
              </Link>
              <Link href="/register" className="neo-button-primary w-full justify-center">
                Register
              </Link>
            </nav>
          )}
        </div>
        {children}
      </body>
    </html>
  );
}
