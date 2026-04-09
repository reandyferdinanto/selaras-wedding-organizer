import { TimelineTrackingBoard } from "@/components/timeline-tracking-board";
import { readTimelineModule } from "@/lib/planner-modules";
import { getPlannerSnapshot } from "@/lib/planner-store";

export default async function DashboardTimelineTrackingPage() {
  const snapshot = await getPlannerSnapshot();
  const values = readTimelineModule(snapshot.notes);

  return <TimelineTrackingBoard values={values} />;
}
