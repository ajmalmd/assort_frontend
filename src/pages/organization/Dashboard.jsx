import React from "react";
import { useAuth } from "@/context/authContext";
import OrgAdminDashboardPage from "./OrganizationDashboardPage";
import ManagerDashboardPage from "./ManagerDashboardPage";
import MemberDashboardPage from "./MemberDashboardPage";

const Dashboards = {
  OWNER: OrgAdminDashboardPage,
  ADMIN: OrgAdminDashboardPage,
  PROJECT_MANAGER: ManagerDashboardPage,
  MEMBER: MemberDashboardPage,
};

const Dashboard = () => {
  const { activeOrganization } = useAuth();

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
