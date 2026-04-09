import Link from "next/link";
import { FolderHeart, LayoutDashboard, LogOut } from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { dashboardFeatures } from "@/lib/planner-data";
import { requireDashboardAccess } from "@/lib/dashboard-access";
import { getFeatureState } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";
import { signOutAction } from "@/lib/supabase/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const access = await requireDashboardAccess();
  const snapshot = await getPlannerSnapshot();
  const states = getFeatureState(snapshot);

  return (
    <main className="page-shell">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="neo-surface rounded-[30px] px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <span className="neo-badge">
                <FolderHeart size={14} />
                Halaman utama
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-4xl">
                Ikuti alur persiapan pernikahan langkah demi langkah.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Dashboard ini menjadi pusat kerja utama. Setiap menu mewakili satu langkah penting,
                dan ringkasannya akan tetap tampil di halaman utama agar progres mudah dipantau.
              </p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-3 xl:shrink-0">
              <div className="neo-panel px-5 py-4 text-sm leading-7 text-slate-600">
                <p className="font-bold text-slate-700">{access.accessLabel}</p>
                <p className="mt-1 break-all">{access.sessionEmail}</p>
                <p className="mt-2">
                  {access.isDemo
                    ? "Akun contoh tetap bisa dipakai untuk meninjau alur, tetapi penyimpanan permanen memerlukan akun aktif."
                    : "Perubahan yang Anda simpan akan dipakai sebagai sumber ringkasan di seluruh dashboard."}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/dashboard" className="neo-button-secondary w-full justify-center">
                  <LayoutDashboard size={16} />
                  Ringkasan
                </Link>
                <form action={signOutAction} className="w-full">
                  <button type="submit" className="neo-button-secondary w-full justify-center">
                    <LogOut size={16} />
                    Keluar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[15.25rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)] xl:items-start">
          <aside className="neo-panel dashboard-sidebar p-5 lg:sticky lg:top-5">
            <p className="section-kicker">Menu utama</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-slate-800">Urutan kerja yang disarankan</h2>
            <div className="mt-5">
              <DashboardNav items={dashboardFeatures} states={states} />
            </div>
          </aside>

          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
