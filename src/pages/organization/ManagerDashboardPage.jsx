import React, { useState } from "react";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
} from "lucide-react";

const mockProjects = [
  {
    id: "1",
    title: "Web App Development",
    members_count: 8,
    overall_progress: 75,
    phases: [
      {
        id: "m1",
        title: "Frontend Setup",
        due_date: "2024-03-15",
        completion_rate: 100,
        tasks: [
          {
            id: "t1",
            title: "Design System",
            task_lead: "John Doe",
            status: "Completed",
            jobs: [
              {
                id: "j1",
                title: "Create Components",
                assigned_to: "Alice",
                total_worked_hours: 40,
                estimated_hours: 40,
              },
              {
                id: "j2",
                title: "Setup Styling",
                assigned_to: "Bob",
                total_worked_hours: 35,
                estimated_hours: 35,
              },
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "Backend API",
        due_date: "2024-03-31",
        completion_rate: 60,
        tasks: [
          {
            id: "t2",
            title: "Database Schema",
            task_lead: "Sarah Smith",
            status: "In Progress",
            jobs: [
              {
                id: "j3",
                title: "Design Tables",
                assigned_to: "Charlie",
                total_worked_hours: 24,
                estimated_hours: 30,
              },
            ],
          },
          {
            id: "t3",
            title: "API Endpoints",
            task_lead: "Sarah Smith",
            status: "Not Started",
            jobs: [
              {
                id: "j4",
                title: "REST API",
                assigned_to: "David",
                total_worked_hours: 0,
                estimated_hours: 40,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Mobile App Design",
    members_count: 5,
    overall_progress: 60,
    phases: [
      {
        id: "m3",
        title: "UI Design",
        due_date: "2024-03-20",
        completion_rate: 80,
        tasks: [
          {
            id: "t4",
            title: "Wireframes",
            task_lead: "Emma Wilson",
            status: "In Progress",
            jobs: [
              {
                id: "j5",
                title: "Create Mockups",
                assigned_to: "Frank",
                total_worked_hours: 32,
                estimated_hours: 40,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function ManagerDashboardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState(
    mockProjects[0].id,
  );

  const selectedProject =
    mockProjects.find((p) => p.id === selectedProjectId) || mockProjects[0];

  const allJobs = selectedProject.phases.flatMap((m) =>
    m.tasks.flatMap((t) => t.jobs),
  );

  const totalHoursWorked = allJobs.reduce(
    (sum, job) => sum + job.total_worked_hours,
    0,
  );
  const totalHoursEstimated = allJobs.reduce(
    (sum, job) => sum + job.estimated_hours,
    0,
  );

  const totalTasks = selectedProject.phases.reduce(
    (sum, m) => sum + m.tasks.length,
    0,
  );

  const completedTasks = selectedProject.phases.reduce(
    (sum, m) => sum + m.tasks.filter((t) => t.status === "Completed").length,
    0,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {mockProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Members"
          value={selectedProject.members_count}
          icon={<Users size={32} className="text-blue-500" />}
        />
        <StatCard
          title="Active Phases"
          value={selectedProject.phases.length}
          icon={<FolderKanban size={32} className="text-green-500" />}
        />
        <StatCard
          title="Tasks Completed"
          value={`${completedTasks}/${totalTasks}`}
          icon={<CheckSquare size={32} className="text-purple-500" />}
        />
        <StatCard
          title="Hours Worked"
          value={`${totalHoursWorked}h`}
          icon={<Clock size={32} className="text-orange-500" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Phases & Tasks
            </h2>

            {selectedProject.phases.map((phase) => (
              <div
                key={phase.id}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold">{phase.title}</h3>
                  <span className="text-sm text-gray-600">
                    Due: {phase.due_date}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{phase.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-gray-900 h-2 rounded-full"
                      style={{ width: `${phase.completion_rate}%` }}
                    />
                  </div>
                </div>

                {phase.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 p-3 rounded border border-gray-100 mb-2"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{task.title}</p>
                      <span
                        className={`px-2 py-1 text-xs rounded ${getStatusColor(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Task Lead: {task.task_lead}
                    </p>
                    <p className="text-xs text-gray-600">
                      Jobs: {task.jobs.length}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          {/* Project Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Project Progress</h2>

            <div className="flex justify-between mb-2">
              <span>Overall Completion</span>
              <span className="font-bold">
                {selectedProject.overall_progress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gray-900 h-3 rounded-full"
                style={{ width: `${selectedProject.overall_progress}%` }}
              />
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <InfoRow
                label="Estimated Hours"
                value={`${totalHoursEstimated}h`}
              />
              <InfoRow label="Hours Worked" value={`${totalHoursWorked}h`} />
              <InfoRow
                label="Remaining"
                value={`${totalHoursEstimated - totalHoursWorked}h`}
              />
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Top Performers</h2>

            {[
              { full_name: "Alice", hours: 40 },
              { full_name: "Bob", hours: 35 },
              { full_name: "Charlie", hours: 24 },
            ].map((member) => (
              <div
                key={member.full_name}
                className="flex justify-between items-center pb-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                    {member.full_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.full_name}</p>
                    <p className="text-xs text-gray-600">
                      {member.hours}h worked
                    </p>
                  </div>
                </div>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      {icon}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
