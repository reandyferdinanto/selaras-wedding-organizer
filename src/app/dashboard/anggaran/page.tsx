import { BudgetPlannerV2Form } from "@/components/budget-planner-v2-form";
import { getPlannerSnapshot } from "@/lib/planner-store";
import { buildVendorPlannerState } from "@/lib/vendor-guide";
import { readVendorModule } from "@/lib/planner-modules";

export default async function DashboardBudgetPage() {
  const snapshot = await getPlannerSnapshot();

  // Build vendor state from Langkah 3 for sync
  const vendorModule = readVendorModule(snapshot.notes);
  const vendorPlannerState = buildVendorPlannerState(vendorModule);

  const coupleNames = [
    snapshot.projectSetup.brideName,
    snapshot.projectSetup.groomName,
  ]
    .filter(Boolean)
    .join(" & ");

  return (
    <BudgetPlannerV2Form
      key={snapshot.notes.budgetPlan}
      rawBudgetPlan={snapshot.notes.budgetPlan}
      vendorCategories={vendorPlannerState.categories}
      coupleNames={coupleNames || undefined}
      prevHref="/dashboard/tamu"
      nextHref="/dashboard/dokumen"
    />
  );
}
