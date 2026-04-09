import { TimelineModuleForm } from "@/components/timeline-module-form";
import { readTimelineModule } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardTimelinePage() {
  const snapshot = await getPlannerSnapshot();
  const values = readTimelineModule(snapshot.notes);

  return <TimelineModuleForm values={values} prevHref="/dashboard/proyek" nextHref="/dashboard/vendor" />;
}
