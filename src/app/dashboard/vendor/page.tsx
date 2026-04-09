import { VendorModuleForm } from "@/components/vendor-module-form";
import { readVendorModule } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardVendorPage() {
  const snapshot = await getPlannerSnapshot();
  const values = readVendorModule(snapshot.notes);
  const coupleNames =
    snapshot.projectSetup?.brideName && snapshot.projectSetup?.groomName
      ? `${snapshot.projectSetup.brideName} & ${snapshot.projectSetup.groomName}`
      : undefined;

  return (
    <VendorModuleForm
      key={snapshot.notes.vendorPlan}
      values={values}
      coupleNames={coupleNames}
      prevHref="/dashboard/timeline"
      nextHref="/dashboard/tamu"
    />
  );
}
