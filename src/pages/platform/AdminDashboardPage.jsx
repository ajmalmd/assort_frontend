import { useState, useEffect } from "react";
import assort_api from "@/api/axios";
import { APP_POINTS } from "@/api/apiConfig";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  IndianRupee,
} from "lucide-react";

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await assort_api.get(
          APP_POINTS.PLATFORM + "dashboard/",
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // const {
  //   summary,
  //   revenueBreakdown,
  //   organizationStats,
  //   memberStats,
  //   topOrganizations,
  //   // topMembers
  // } = dashboardData;
  const summary = dashboardData?.summary;
  const revenueBreakdown = dashboardData?.revenueBreakdown;
  const organizationStats = dashboardData?.organizationStats;
  const memberStats = dashboardData?.memberStats;
  const topOrganizations = dashboardData?.topOrganizations;
  // const topMembers = dashboardData?.topMembers;

  // STAT CARDS
  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${summary?.totalRevenue}`,
      subtext: "This month",
      icon: IndianRupee,
      color: "text-green-600",
    },
    {
      label: "Total Organizations",
      value: summary?.activeOrganizations,
      subtext: `${summary?.activeOrganizations} Active`,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      label: "Active Members",
      value: summary?.totalMembers,
      subtext: `${summary?.multiOrgMembers} Multi-org`,
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "MRR Growth",
      value: `${summary?.mrrGrowth}%`,
      subtext: "vs last month",
      icon: summary?.mrrGrowth > 0 ? TrendingUp : TrendingDown,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{card.subtext}</p>
                </div>
                <Icon size={28} className={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Plan
          </h2>

          <div className="space-y-4">
            {revenueBreakdown?.plans.map((item) => {
              const percentage =
                revenueBreakdown.totalRevenue > 0
                  ? (item.revenue / revenueBreakdown.totalRevenue) * 100
                  : 0;

              return (
                <div key={item.plan}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.plan}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{item.revenue}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of total
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organization Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Organizations Overview
          </h2>

          <div className="space-y-4">
            {[
              {
                label: "Active",
                value: organizationStats?.active,
                color: "bg-green-100 text-green-800",
              },
              {
                label: "Trial",
                value: organizationStats?.trial,
                color: "bg-blue-100 text-blue-800",
              },
              {
                label: "Inactive",
                value: organizationStats?.inactive,
                color: "bg-gray-100 text-gray-800",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members & Member Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Members Overview
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Total Active Members",
                value: memberStats?.total,
                color: "bg-blue-100 text-blue-800",
              },
              {
                label: "Multi-Organization",
                value: memberStats?.multiOrganization,
                color: "bg-purple-100 text-purple-800",
              },
              {
                label: "Single Organization",
                value: memberStats?.singleOrganization,
                color: "bg-gray-100 text-gray-800",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Organizations and Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organizations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Organizations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-center">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-600">
                    Organization
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-600">
                    Current Plan
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-600">
                    Total Revenue
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-600">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody>
                {topOrganizations
                  ?.sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .slice(0, 10)
                  .map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-gray-100 hover:bg-gray-50 text-center"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {org.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {org.plan}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ₹{org.totalRevenue}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {org.members}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Members */}
        {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Members
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Org Count
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {topMembers
                  .sort((a, b) => b.hoursContributed - a.hoursContributed)
                  .slice(0, 10)
                  .map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                            member.organizationCount > 1
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.organizationCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {member.hoursContributed}h
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
