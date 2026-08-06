import { useAppDispatch, useWorkspaceState } from "@/redux/hooks";
import { setMinimized } from "@/redux/slices/workspaceSlice";
import OrganizationSummaryCard from "./OrganizationSummaryCard";

export default function WorkspaceSummaryPanel() {
  const dispatch = useAppDispatch();

  const { organizationsSummary } = useWorkspaceState();

  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        w-80
        rounded-xl
        bg-white
        shadow-xl
      "
    >
      <div
        className="
          flex
          justify-between
          p-4
        "
      >
        <h3>Workspaces</h3>

        <button onClick={() => dispatch(setMinimized(true))}>-</button>
      </div>

      <div
        className="
          max-h-96
          overflow-y-auto
        "
      >
        {organizationsSummary.map((org) => (
          <OrganizationSummaryCard
            key={org.organization_id}
            organization={org}
          />
        ))}
      </div>
    </div>
  );
}
