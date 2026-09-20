import RequestState from "@/components/common/RequestState";
import { useEffect, useState } from "react";

import OrgAdminDashboard from "./OrganizationDashboard";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";

import { useAuthState } from "@/redux/hooks";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";

const Dashboards = {
  OWNER: OrgAdminDashboard,
  ADMIN: OrgAdminDashboard,
  PROJECT_MANAGER: ManagerDashboard,
  MEMBER: MemberDashboard,
};

const Dashboard = () => {
  const { activeOrganization } = useAuthState();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!activeOrganization?.id) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await assort_api.get(APP_POINTS.DASHBOARD);

        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [activeOrganization?.id, attempt]);

  if (loading) {
    return <RequestState loading title="Loading your workspace" />;
  }

  if (error || !data) {
    return (
      <RequestState
        error
        title="Unable to load your dashboard"
        description="Please try again to see the latest workspace activity."
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const DashboardComponent = Dashboards[activeOrganization?.role];

  if (!DashboardComponent) {
    return <div>No dashboard available for this role.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Workspace overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          A clear view of your team’s progress
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track active work, upcoming deadlines, and what needs attention.
        </p>
      </div>
      <DashboardComponent data={data} />
    </div>
  );
};

export default Dashboard;
