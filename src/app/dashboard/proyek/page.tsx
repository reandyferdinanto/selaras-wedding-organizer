import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { ProjectSetupForm } from "@/components/project-setup-form";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardProjectPage() {
  const snapshot = await getPlannerSnapshot();
  const initialValues = {
    brideName: snapshot.projectSetup.brideName ?? "",
    groomName: snapshot.projectSetup.groomName ?? "",
    weddingDate: snapshot.projectSetup.weddingDate ?? "",
    city: snapshot.projectSetup.city ?? "",
    venue: snapshot.projectSetup.venue ?? "",
    guestCount: snapshot.projectSetup.guestCount ?? "",
    template: snapshot.projectSetup.template ?? "",
    concept: snapshot.projectSetup.concept ?? "",
  };

  return (
    <>
      <ProjectSetupForm initialValues={initialValues} />
      <div className="neo-panel-inset flex flex-col gap-3 p-4 text-sm leading-7 text-slate-600 lg:flex-row lg:items-center lg:justify-between">
        <span>Jika data acara utama sudah sesuai, lanjutkan ke penyusunan alur acara dan tahapan kerja.</span>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
          <Link href="/dashboard" className="neo-button-secondary w-full justify-center whitespace-nowrap">
            <LayoutDashboard size={16} />
            Kembali ke ringkasan
          </Link>
          <Link href="/dashboard/timeline" className="neo-button-primary w-full justify-center whitespace-nowrap">
            Lanjut ke alur acara
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}

