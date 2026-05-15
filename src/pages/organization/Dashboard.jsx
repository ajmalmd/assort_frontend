import React from "react";
import OrgAdminDashboardPage from "./OrganizationDashboardPage";
import ManagerDashboardPage from "./ManagerDashboardPage";
import MemberDashboardPage from "./MemberDashboardPage";
import { useAuthState } from "@/redux/hooks";

const Dashboards = {
  OWNER: OrgAdminDashboardPage,
  ADMIN: OrgAdminDashboardPage,
  PROJECT_MANAGER: ManagerDashboardPage,
  MEMBER: MemberDashboardPage,
};

const Dashboard = () => {
  const { activeOrganization } = useAuthState();

  if (!activeOrganization) {
    return <div>Loading dashboard...</div>;
  }

  const DashboardComponent = Dashboards[activeOrganization.role];

  if (!DashboardComponent) {
    return <div>No data available right now.</div>;
  }

  return <DashboardComponent />;
};

export default Dashboard;
