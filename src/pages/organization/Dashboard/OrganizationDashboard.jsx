import { Users, FolderKanban, CircleDot, TriangleAlert } from "lucide-react";

import AttentionRequired from "@/components/organization/Dashboard/AttentionRequired";
import DashboardStatCard from "@/components/organization/Dashboard/DashboardStatCard";
import ProjectsContainer from "@/components/organization/Dashboard/ProjectsContainer";
import ProjectStatusCard from "@/components/organization/Dashboard/ProjectStatusCard";
import UpcomingDeadlines from "@/components/organization/Dashboard/UpcomingDeadlines";
import TimesheetSummary from "@/components/organization/Dashboard/TimesheetSummary";

const OrganizationDashboard = ({ data }) => {
  const {
    summary = {},
    project_status = {},
    attention_required = {},
    projects = [],
    upcoming_deadlines = [],
    timesheets = {},
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Members"
          value={summary.total_members}
          icon={Users}
        />

        <DashboardStatCard
          title="Projects"
          value={summary.total_projects}
          icon={FolderKanban}
        />

        <DashboardStatCard
          title="In Progress"
          value={summary.projects_in_progress}
          icon={CircleDot}
        />

        <DashboardStatCard
          title="Overdue Tasks"
          value={summary.overdue_tasks}
          icon={TriangleAlert}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectStatusCard data={project_status} />
        <AttentionRequired data={attention_required} />
      </div>

      <ProjectsContainer projects={projects} title="Projects" />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={upcoming_deadlines} />

        <TimesheetSummary data={timesheets} role={data.role} />
      </div>
    </div>
  );
};

export default OrganizationDashboard;
