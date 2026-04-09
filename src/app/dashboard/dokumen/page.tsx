import Link from "next/link";

import { DocumentModuleForm } from "@/components/document-module-form";
import { readDocumentModule } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardDocumentsPage() {
  const snapshot = await getPlannerSnapshot();
  const values = readDocumentModule(snapshot.notes);

  return (
    <>
      <DocumentModuleForm values={values} prevHref="/dashboard/anggaran" />
      <div className="neo-panel-inset flex flex-col gap-3 p-4 text-sm leading-7 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Semua langkah dasar sudah tersedia. Anda bisa kembali ke dashboard untuk melihat ringkasan progres kapan saja.</span>
        <Link href="/dashboard" className="neo-button-primary whitespace-nowrap">
          Kembali ke dashboard
        </Link>
      </div>
    </>
  );
}
