import { GuestModuleForm } from "@/components/guest-module-form";
import { readGuestModule } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardGuestPage() {
  const snapshot = await getPlannerSnapshot();
  const values = readGuestModule(snapshot.notes);

  return (
    <GuestModuleForm
      values={values}
      prevHref="/dashboard/vendor"
      nextHref="/dashboard/anggaran"
    />
  );
}
