import {
  FolderKanban,
  ListTodo,
  BriefcaseBusiness,
  CalendarClock,
} from "lucide-react";

import DashboardStatCard from "@/components/organization/Dashboard/DashboardStatCard";
import MyTasks from "@/components/organization/Dashboard/MyTasks";
import MyJobs from "@/components/organization/Dashboard/MyJobs";
import AttentionRequired from "@/components/organization/Dashboard/AttentionRequired";
import TimesheetSummary from "@/components/organization/Dashboard/TimesheetSummary";
import UpcomingDeadlines from "@/components/organization/Dashboard/UpcomingDeadlines";
import ProjectsContainer from "@/components/organization/Dashboard/ProjectsContainer";

const MemberDashboard = ({ data }) => {
  const {
    summary = {},
    tasks = [],
    jobs = [],
    projects = [],
    attention_required = {},
    upcoming_deadlines = [],
    timesheets = {},
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Active Projects"
          value={summary.active_projects}
          icon={FolderKanban}
        />

        <DashboardStatCard
          title="My Tasks"
          value={summary.assigned_tasks}
          icon={ListTodo}
        />

        <DashboardStatCard
          title="My Jobs"
          value={summary.assigned_jobs}
          icon={BriefcaseBusiness}
        />

        <DashboardStatCard
          title="Due This Week"
          value={summary.due_this_week}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MyTasks tasks={tasks} />
        <MyJobs jobs={jobs} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttentionRequired data={attention_required} />

        <TimesheetSummary data={timesheets} role={data.role} />
      </div>

      <UpcomingDeadlines deadlines={upcoming_deadlines} />

      <ProjectsContainer
        projects={projects}
        title="My Projects"
        description="Projects you're currently part of"
      />
    </div>
  );
};

export default MemberDashboard;
