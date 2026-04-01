import React from "react";
import { Users, FolderKanban, BarChart3, AlertCircle } from "lucide-react";

const OrganizationDashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
            </div>
            <Users size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Projects
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">28</p>
            </div>
            <FolderKanban size={32} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Completion Rate
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
            </div>
            <BarChart3 size={32} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
            </div>
            <AlertCircle size={32} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent Members
          </h2>
          <div className="space-y-4">
            {[
              { name: "John Doe", role: "Admin", date: "2 days ago" },
              { name: "Sarah Smith", role: "Member", date: "1 week ago" },
              { name: "Mike Johnson", role: "Member", date: "2 weeks ago" },
            ].map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <p className="text-sm text-gray-500">{member.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Project Stats
          </h2>
          <div className="space-y-4">
            {[
              { name: "Web App Development", progress: 75 },
              { name: "Mobile App Design", progress: 60 },
              { name: "API Integration", progress: 90 },
            ].map((project) => (
              <div key={project.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardPage;
