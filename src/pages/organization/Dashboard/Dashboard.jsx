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
  }, [activeOrganization?.id]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div>Unable to load dashboard.</div>;
  }

  const DashboardComponent = Dashboards[activeOrganization?.role];

  if (!DashboardComponent) {
    return <div>No dashboard available for this role.</div>;
  }

  return <DashboardComponent data={data} />;
};

export default Dashboard;
