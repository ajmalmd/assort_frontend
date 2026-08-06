import { useWorkspaceState } from "@/redux/hooks";
import WorkspaceSummaryBubble from "./WorkspaceSummaryBubble";
import WorkspaceSummaryPanel from "./WorkspaceSummaryPanel";


export default function WorkspaceSummaryContainer() {
  const { organizationsSummary, minimized } = useWorkspaceState();

  const hasNotifications = organizationsSummary.some(
    (org) => org.unread_chatroom_count > 0 || org.call_missed_count > 0,
  );

  if (!hasNotifications) {
    return null;
  }

  return minimized ? <WorkspaceSummaryBubble /> : <WorkspaceSummaryPanel />;
}
