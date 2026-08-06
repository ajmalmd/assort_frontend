import { useAppDispatch, useWorkspaceState } from "@/redux/hooks";
import { setMinimized } from "@/redux/slices/workspaceSlice";

export default function WorkspaceSummaryBubble() {
  const dispatch = useAppDispatch();

  const { organizationsSummary } = useWorkspaceState();

  const total = organizationsSummary.reduce(
    (sum, org) => sum + org.unread_chatroom_count + org.call_missed_count,
    0,
  );

  return (
    <button
      onClick={() => dispatch(setMinimized(false))}
      className="
        fixed
        bottom-6
        right-6
        rounded-full
        bg-blue-600
        p-4
        text-white
      "
    >
      Workspace
      <span>{total}</span>
    </button>
  );
}
