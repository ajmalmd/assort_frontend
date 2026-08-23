import { FolderKanban, CircleDot, TriangleAlert, Clock } from "lucide-react";

import DashboardStatCard from "@/components/organization/Dashboard/DashboardStatCard";
import ProjectStatusCard from "@/components/organization/Dashboard/ProjectStatusCard";
import AttentionRequired from "@/components/organization/Dashboard/AttentionRequired";
import ProjectsContainer from "@/components/organization/Dashboard/ProjectsContainer";
import UpcomingDeadlines from "@/components/organization/Dashboard/UpcomingDeadlines";
import TimesheetSummary from "@/components/organization/Dashboard/TimesheetSummary";

const ManagerDashboard = ({ data }) => {
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
          title="My Projects"
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

        <DashboardStatCard
          title="Pending Timesheets"
          value={summary.pending_timesheets}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectStatusCard data={project_status} />
        <AttentionRequired data={attention_required} />
      </div>

      <ProjectsContainer projects={projects} title="My Projects" />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={upcoming_deadlines} />

        <TimesheetSummary data={timesheets} role={data.role} />
      </div>
    </div>
  );
};

export default ManagerDashboard;
